import { prisma } from "@/lib/db";
import { streakDayKey } from "@/features/streak/dates";
import type { RecentGame } from "./types";

const MAX_RECENT = 6;

/**
 * The user's most recently touched games, newest day first.
 * score is the star rating (0-3) of the completed round, maxScore is 3.
 */
export async function getRecentGames(userId: string): Promise<RecentGame[]> {
  const published = await prisma.dailyGame.findMany({
    where: { status: "published" },
    orderBy: { scheduledFor: "asc" },
    select: { scheduledFor: true },
  });
  const orderOf = new Map(
    published.map((g, i) => [streakDayKey(g.scheduledFor), i + 1]),
  );

  const rows = await prisma.dailyGameProgress.findMany({
    where: { userId, dailyGame: { status: "published" } },
    include: {
      dailyGame: { select: { id: true, type: true, title: true, category: true, scheduledFor: true } },
    },
    orderBy: { dailyGame: { scheduledFor: "desc" } },
    take: MAX_RECENT,
  });

  return rows.map((row) => {
    const game = row.dailyGame;
    const dateKey = streakDayKey(game.scheduledFor);
    return {
      id: game.id,
      editionNo: orderOf.get(dateKey) ?? 0,
      gameType: game.type,
      gameLabel: game.title,
      topic: game.category ?? game.type,
      playedAt: dateKey,
      score: row.stars,
      maxScore: 3,
    };
  });
}