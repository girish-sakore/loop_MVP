// app/api/progress/complete/route.ts
//
// Same as the version you pasted, except the upsert now runs in a transaction
// together with recordCompletionForStreak, so a node can never be marked
// completed without the streak being updated (and vice versa).

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DEFAULT_HINT_BUDGET } from "@/features/gameplay/progress/resume";
import { recordCompletionForStreak } from "@/features/streak/record-completion.server";

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

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const editionId = body?.editionId;
  const nodeId = body?.nodeId;
  const score = Number(body?.score);
  const correctAnswers = Number(body?.correctAnswers);
  const totalAnswers = Number(body?.totalAnswers);

  if (
    typeof editionId !== "string" || typeof nodeId !== "string" ||
    !Number.isFinite(score) || !Number.isFinite(correctAnswers) || !Number.isFinite(totalAnswers)
  ) {
    return NextResponse.json({ error: "invalid completion payload" }, { status: 400 });
  }

  const stars = computeStars(correctAnswers, totalAnswers);
  const now = new Date();

  const { row, streak } = await prisma.$transaction(async (tx) => {
    // Keep the first completion time on replays so the streak week strip
    // doesn't lose the day the node was originally completed.
    const prev = await tx.userNodeProgress.findUnique({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      select: { completedAt: true },
    });

    const row = await tx.userNodeProgress.upsert({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      create: {
        userId,
        editionId,
        nodeId,
        status: "completed",
        score,
        correctAnswers,
        totalAnswers,
        stars,
        stagePassed: true,
        startedAt: now,
        completedAt: now,
        currentSubStage: 0,
        attemptsRemaining: 0,
        hintsRemaining: DEFAULT_HINT_BUDGET,
        clientUpdatedAt: BigInt(now.getTime()),
        version: 1,
      },
      update: {
        status: "completed",
        score,
        correctAnswers,
        totalAnswers,
        stars,
        stagePassed: true,
        completedAt: prev?.completedAt ?? now,
        currentSubStage: 0,
        attemptsRemaining: 0,
        hintsRemaining: DEFAULT_HINT_BUDGET,
        clientUpdatedAt: BigInt(now.getTime()),
        version: 1,
      },
    });

    // stagePassed is always true on this endpoint, so every call qualifies.
    const streak = await recordCompletionForStreak(tx, userId, now);
    return { row, streak };
  });

  return NextResponse.json({
    status: row.status,
    stars: row.stars,
    score: row.score,
    correctAnswers: row.correctAnswers,
    totalAnswers: row.totalAnswers,
    streak,
  });
}
