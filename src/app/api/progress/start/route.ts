import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { isGameAvailable } from "@/features/streak/dates";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const gameId = body?.gameId;
    if (typeof gameId !== "string" || !gameId) {
      return NextResponse.json({ error: "Missing gameId." }, { status: 400 });
    }

    const userId = session.user.id;
    const now = new Date();
    const game = await prisma.dailyGame.findUnique({ where: { id: gameId } });
    if (!game || game.status !== "published" || !isGameAvailable(game.scheduledFor, now)) {
      return NextResponse.json({ error: "Published game is not available yet." }, { status: 404 });
    }

    await prisma.dailyGameProgress.upsert({
      where: { userId_dailyGameId: { userId, dailyGameId: gameId } },
      create: {
        userId,
        dailyGameId: gameId,
        status: "in_progress",
        startedAt: new Date(),
      },
      update: {}, // don't disturb an existing row's progress fields
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[progress/start]", error);
    return NextResponse.json({ error: "Failed to start progress." }, { status: 500 });
  }
}
