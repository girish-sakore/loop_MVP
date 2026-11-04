// app/api/progress/complete/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { recordCompletionForStreak } from "@/features/streak/record-completion.server";
import { sanitizeAnswerResults, type AnswerResults } from "@/features/gameplay/progress/resume";

type Completion = {
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  stars: number;
};

type SnapshotQuestion = { id: string; points: number };

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

function computeStars(correctAnswers: number, totalAnswers: number): number {
  if (totalAnswers <= 0) return 0;
  const ratio = correctAnswers / totalAnswers;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

/**
 * Completion is calculated against the published edition snapshot, never from
 * client aggregate counters or client-provided points. The client only reports
 * each question's latest correctness result.
 */
function scoreCompletion(snapshot: unknown, nodeId: string, answerResults: AnswerResults): Completion | null {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return null;
  const nodes = (snapshot as { nodes?: unknown }).nodes;
  if (!Array.isArray(nodes)) return null;
  const node = nodes.find((candidate) =>
    candidate && typeof candidate === "object" && (candidate as { id?: unknown }).id === nodeId,
  ) as { subStages?: unknown } | undefined;
  if (!node || !Array.isArray(node.subStages) || node.subStages.length === 0) return null;

  const questions: SnapshotQuestion[] = [];
  for (let index = 0; index < node.subStages.length; index += 1) {
    const stage = node.subStages[index];
    if (!stage || typeof stage !== "object" || Array.isArray(stage)) return null;
    const raw = stage as { id?: unknown; points?: unknown };
    const id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : `${nodeId}-${index + 1}`;
    // The page defaults an omitted authored score to 100 points.
    const points = typeof raw.points === "number" && Number.isSafeInteger(raw.points) && raw.points >= 0
      ? raw.points
      : 100;
    questions.push({ id, points });
  }

  // Do not let omitted wrong answers improve the ratio used for stars.
  if (new Set(questions.map((question) => question.id)).size !== questions.length) return null;
  const submittedIds = Object.keys(answerResults);
  if (
    submittedIds.length !== questions.length ||
    submittedIds.some((questionId) => !questions.some((question) => question.id === questionId))
  ) return null;

  const correctAnswers = questions.filter((question) => answerResults[question.id]?.isCorrect).length;
  const score = questions.reduce(
    (total, question) => total + (answerResults[question.id]?.isCorrect ? question.points : 0),
    0,
  );
  return {
    score,
    correctAnswers,
    totalAnswers: questions.length,
    stars: computeStars(correctAnswers, questions.length),
  };
}

/** Completed nodes retain the best run, so a replay can never lower a score. */
function isBetterCompletion(candidate: Completion, existing: Completion): boolean {
  if (candidate.score !== existing.score) return candidate.score > existing.score;
  if (candidate.stars !== existing.stars) return candidate.stars > existing.stars;
  // Scores can tie when authored questions have different point values. Use
  // accuracy as the deterministic tie-breaker without trusting client totals.
  return candidate.correctAnswers * existing.totalAnswers > existing.correctAnswers * candidate.totalAnswers;
}

async function writeCompletion(
  userId: string,
  editionId: string,
  nodeId: string,
  answerResults: AnswerResults,
  completion: Completion,
) {
  const now = new Date();
  try {
    return await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "user_node_progress"
        WHERE "userId" = ${userId} AND "editionId" = ${editionId} AND "nodeId" = ${nodeId}
        FOR UPDATE
      `;

      let row;
      if (locked.length === 0) {
        row = await tx.userNodeProgress.create({
          data: {
            userId,
            editionId,
            nodeId,
            status: "completed",
            score: completion.score,
            correctAnswers: completion.correctAnswers,
            totalAnswers: completion.totalAnswers,
            answerResults: answerResults as Prisma.InputJsonValue,
            stars: completion.stars,
            stagePassed: true,
            startedAt: now,
            completedAt: now,
            currentSubStage: 0,
            attemptsRemaining: 0,
            clientUpdatedAt: BigInt(now.getTime()),
            version: 2,
          },
        });
      } else {
        const previous = await tx.userNodeProgress.findUniqueOrThrow({
          where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
          select: {
            score: true,
            correctAnswers: true,
            totalAnswers: true,
            stars: true,
            status: true,
            completedAt: true,
          },
        });
        const keepExisting = previous.status.toLowerCase() === "completed" && !isBetterCompletion(completion, previous);
        row = await tx.userNodeProgress.update({
          where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
          data: keepExisting
            ? { status: "completed", stagePassed: true }
            : {
              status: "completed",
              score: completion.score,
              correctAnswers: completion.correctAnswers,
              totalAnswers: completion.totalAnswers,
              answerResults: answerResults as Prisma.InputJsonValue,
              stars: completion.stars,
              stagePassed: true,
              completedAt: previous.completedAt ?? now,
              currentSubStage: 0,
              attemptsRemaining: 0,
              clientUpdatedAt: BigInt(now.getTime()),
              version: 2,
            },
        });
      }

      const streak = await recordCompletionForStreak(tx, userId, now);
      return { row, streak };
    });
  } catch (error) {
    // Two first completions can race before either transaction sees a row.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return writeCompletion(userId, editionId, nodeId, answerResults, completion);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const editionId = body?.editionId;
  const nodeId = body?.nodeId;
  if (typeof editionId !== "string" || typeof nodeId !== "string") {
    return NextResponse.json({ error: "invalid completion payload" }, { status: 400 });
  }

  const edition = await prisma.edition.findUnique({
    where: { id: editionId },
    select: { snapshot: true },
  });
  if (!edition?.snapshot) return NextResponse.json({ error: "edition not found" }, { status: 404 });

  const answerResults = sanitizeAnswerResults(body?.answerResults);
  const completion = scoreCompletion(edition.snapshot, nodeId, answerResults);
  if (!completion) {
    return NextResponse.json({ error: "one result is required for every question in this node" }, { status: 400 });
  }

  const { row, streak } = await writeCompletion(userId, editionId, nodeId, answerResults, completion);
  return NextResponse.json({
    status: row.status,
    stars: row.stars,
    score: row.score,
    correctAnswers: row.correctAnswers,
    totalAnswers: row.totalAnswers,
    streak,
  });
}
