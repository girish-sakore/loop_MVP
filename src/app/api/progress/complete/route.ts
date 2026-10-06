// app/api/progress/complete/route.ts
//
// Completes a game only from validated, server-stored final-stage progress.
// The request identifies the DailyGame by gameId; result metrics are ignored.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  completeGameProgress,
  CompletionError,
} from "@/features/gameplay/progress/daily-game-progress";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const gameId = body?.gameId;
  if (typeof gameId !== "string" || !gameId) {
    return NextResponse.json({ error: "gameId is required" }, { status: 400 });
  }

  let result;
  try {
    // Result metrics are intentionally loaded from the user's saved progress.
    const now = new Date();
    result = await completeGameProgress(userId, gameId, now);
  } catch (error) {
    if (error instanceof CompletionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[progress/complete]", error);
    return NextResponse.json({ error: "Failed to complete game." }, { status: 500 });
  }
  const { row, streak } = result;

  // The map and gameplay page are commonly prefetched. Invalidate them only
  // after the completion transaction succeeds so returning to the hub cannot
  // reuse an in-progress version of this game.
  revalidatePath("/map");
  revalidatePath("/library");
  revalidatePath("/profile");
  revalidatePath("/edition/[editionId]/[nodeId]", "page");

  return NextResponse.json({
    status: row.status,
    stars: row.stars,
    score: row.score,
    correctAnswers: row.correctAnswers,
    totalAnswers: row.totalAnswers,
    streak,
  });
}
