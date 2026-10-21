// features/streak/get-streak.ts
import { prisma } from "@/lib/db";
import type { StreakData, StreakDay } from "./types";
import { addDays, getStreakMetrics, streakToday, toIsoDay } from "./dates";

export const STREAK_GOAL = 21; // Gold Box target

export async function getStreak(userId: string): Promise<StreakData> {
  const today = streakToday();
  const weekStart = addDays(today, -6);

  const [row, streakDays, nodeAgg, completedNodes] = await Promise.all([
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.userStreakDay.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" },
    }),
    prisma.userNodeProgress.aggregate({
      where: { userId, status: "completed" },
      _sum: { correctAnswers: true, totalAnswers: true },
    }),
    prisma.userNodeProgress.count({ where: { userId, status: "completed" } }),
  ]);

  const metrics = getStreakMetrics(streakDays.map((day) => day.date), today);
  const struck = new Set(
    streakDays
      .filter((day) => day.date >= weekStart)
      .map((day) => toIsoDay(day.date)),
  );

  const week: StreakDay[] = Array.from({ length: 7 }, (_, k) => {
    const iso = toIsoDay(addDays(weekStart, k));
    if (struck.has(iso)) return { date: iso, state: "struck" };
    return { date: iso, state: k === 6 ? "today" : "missed" };
  });

  const correct = nodeAgg._sum.correctAnswers ?? 0;
  const total = nodeAgg._sum.totalAnswers ?? 0;

  return {
    current: metrics.current,
    best: Math.max(row?.longestStreak ?? 0, metrics.longest),
    goal: STREAK_GOAL,
    struckToday: metrics.struckToday,
    week,
    stats: {
      accuracyPct: total > 0 ? Math.round((correct / total) * 100) : 0,
      boxesStruck: completedNodes,
      // TODO: needs node -> interaction type mapping from edition content.
      gameTypes: 0,
    },
  };
}
