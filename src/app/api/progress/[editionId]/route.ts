// editionId here is the game's IST dateKey ("YYYY-MM-DD"); one daily game is
// released per day, so the dateKey resolves to exactly one game.
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { dayKeyToDate } from "@/features/streak/dates";
import { getGameProgress } from "@/features/gameplay/progress/daily-game-progress";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ editionId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { editionId } = await params;
    const game = await prisma.dailyGame.findFirst({
      where: { scheduledFor: dayKeyToDate(editionId) },
    });
    if (!game) {
      return NextResponse.json({ error: "No game scheduled for that day" }, { status: 404 });
    }

    return NextResponse.json(await getGameProgress(session.user.id, game));
  } catch (error) {
    console.error("[progress/get]", error);
    return NextResponse.json({ error: "Failed to fetch progress." }, { status: 500 });
  }
}