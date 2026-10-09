// app/api/progress/complete/route.ts
//
// ASSUMPTION (not verified against your existing file, which wasn't provided):
// this reads score/correctAnswers/totalAnswers from the request body, computes
// stars, marks the row completed, then resets the fields a replay would need
// fresh (hints, attempts, stage, sync bookkeeping). Adjust the stars formula
// and the "reset vs keep" choices to match whatever your current file does.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DEFAULT_HINT_BUDGET } from "@/features/gameplay/progress/resume";

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

  const row = await prisma.userNodeProgress.upsert({
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
      startedAt: new Date(),
      completedAt: new Date(),
      // A finished node's row should not "un-finish" itself if an in-flight
      // sync from the same tab lands after this. Reset the fields that would
      // make it look like an active session again.
      currentSubStage: 0,
      attemptsRemaining: 0,
      hintsRemaining: DEFAULT_HINT_BUDGET,
      clientUpdatedAt: BigInt(Date.now()),
      version: 1,
    },
    update: {
      status: "completed",
      score,
      correctAnswers,
      totalAnswers,
      stars,
      stagePassed: true,
      completedAt: new Date(),
      currentSubStage: 0,
      attemptsRemaining: 0,
      hintsRemaining: DEFAULT_HINT_BUDGET,
      clientUpdatedAt: BigInt(Date.now()),
      version: 1,
    },
  });

  return NextResponse.json({
    status: row.status,
    stars: row.stars,
    score: row.score,
    correctAnswers: row.correctAnswers,
    totalAnswers: row.totalAnswers,
  });
}