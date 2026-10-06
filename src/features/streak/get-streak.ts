// features/streak/get-streak.ts
import { prisma } from "@/lib/db";
import type { StreakData, StreakDay } from "./types";
import { addDays, streakDayKey, streakToday, toIsoDay } from "./dates";

export const STREAK_GOAL = 21; // Gold Box target
const IST_OFFSET_MS = 330 * 60 * 1000;

export async function getStreak(userId: string): Promise<StreakData> {
  const today = streakToday();
  const yesterday = addDays(today, -1);
  const weekStart = addDays(today, -6);
  // IST midnight of weekStart, as a real instant.
  const weekStartInstant = new Date(weekStart.getTime() - IST_OFFSET_MS);

  const [row, weekGames, gameAgg, completedGames, distinctTypes] = await Promise.all([
    prisma.userStreak.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastCompletedDate: true,
      },
    }),
    prisma.dailyGameProgress.findMany({
      where: { userId, status: "completed", completedAt: { gte: weekStartInstant } },
      select: { completedAt: true, dailyGame: { select: { scheduledFor: true } } },
    }),
    prisma.dailyGameProgress.aggregate({
      where: { userId, status: "completed" },
      _sum: { correctAnswers: true, totalAnswers: true },
    }),
    prisma.dailyGameProgress.count({ where: { userId, status: "completed" } }),
    prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(DISTINCT game.type)::int AS count
      FROM "daily_game_progress" AS progress
      INNER JOIN "daily_game" AS game ON game.id = progress."dailyGameId"
      WHERE progress."userId" = ${userId} AND progress.status = 'completed'
    `,
  ]);

  const todayKey = toIsoDay(today);
  const yesterdayKey = toIsoDay(yesterday);
  const lastKey = row?.lastCompletedDate ? toIsoDay(row.lastCompletedDate) : null;
  const struckToday = lastKey === todayKey;
  // A stored streak is stale once the last counted day is before yesterday.
  const alive = lastKey === todayKey || lastKey === yesterdayKey;
  const current = alive ? (row?.currentStreak ?? 0) : 0;

  // The calendar marks only completed games that were completed on their
  // scheduled IST day. Replaying a historical game cannot strike today.
  const struck = new Set<string>();
  for (const g of weekGames) {
    if (
      g.completedAt &&
      streakDayKey(g.completedAt) === streakDayKey(g.dailyGame.scheduledFor)
    ) {
      struck.add(streakDayKey(g.completedAt));
    }
  }
  const week: StreakDay[] = Array.from({ length: 7 }, (_, k) => {
    const iso = toIsoDay(addDays(weekStart, k));
    if (struck.has(iso)) return { date: iso, state: "struck" };
    return { date: iso, state: k === 6 ? "today" : "missed" };
  });

  const correct = gameAgg._sum.correctAnswers ?? 0;
  const total = gameAgg._sum.totalAnswers ?? 0;

  return {
    current,
    best: Math.max(row?.longestStreak ?? 0, current),
    goal: STREAK_GOAL,
    struckToday,
    week,
    stats: {
      accuracyPct: total > 0 ? Math.round((correct / total) * 100) : 0,
      boxesStruck: completedGames,
      gameTypes: distinctTypes[0]?.count ?? 0,
    },
  };
}
