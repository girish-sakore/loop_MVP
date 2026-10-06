// app/api/progress/sync/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { isGameAvailable } from "@/features/streak/dates";
import { auth } from "@/lib/auth";
import {
  fromServerPayload,
  toServerPayload,
} from "@/features/gameplay/progress/resume";
import {
  progressRowToSnapshot,
  writeMergedGameProgress,
} from "@/features/gameplay/progress/daily-game-progress";
import { validateSnapshotForGame } from "@/features/gameplay/progress/validation";

const MAX_CLOCK_SKEW_MS = 60_000;

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const gameId = url.searchParams.get("gameId");
  if (!gameId) {
    return NextResponse.json({ error: "gameId is required" }, { status: 400 });
  }

  const row = await prisma.dailyGameProgress.findUnique({
    where: { userId_dailyGameId: { userId, dailyGameId: gameId } },
  });
  const snapshot = progressRowToSnapshot(row);
  return NextResponse.json({ progress: snapshot ? toServerPayload(snapshot) : null });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const gameId = body?.gameId;
  if (typeof gameId !== "string" || !gameId) {
    return NextResponse.json({ error: "gameId is required" }, { status: 400 });
  }

  const incoming = fromServerPayload(body);
  if (!incoming) return NextResponse.json({ error: "invalid progress payload" }, { status: 400 });

  const game = await prisma.dailyGame.findUnique({ where: { id: gameId } });
  if (!game || game.status !== "published" || !isGameAvailable(game.scheduledFor)) {
    return NextResponse.json({ error: "Published game not found." }, { status: 404 });
  }
  const validationError = validateSnapshotForGame(incoming, game);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  // A device with a wrong clock must not win every tie forever.
  incoming.updatedAt = Math.min(incoming.updatedAt, Date.now() + MAX_CLOCK_SKEW_MS);

  const merged = await writeMergedGameProgress(userId, gameId, incoming);
  return NextResponse.json({ progress: toServerPayload(merged) });
}