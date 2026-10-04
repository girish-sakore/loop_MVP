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

  const [row, weekNodes, nodeAgg, completedNodes] = await Promise.all([
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.userNodeProgress.findMany({
      where: { userId, status: "completed", completedAt: { gte: weekStartInstant } },
      select: { completedAt: true },
    }),
    prisma.userNodeProgress.aggregate({
      where: { userId, status: "completed" },
      _sum: { correctAnswers: true, totalAnswers: true },
    }),
    prisma.userNodeProgress.count({ where: { userId, status: "completed" } }),
  ]);

  const last = row?.lastCompletedDate ?? null;
  const struckToday = last !== null && last.getTime() === today.getTime();
  // A stored streak is stale once the last counted day is before yesterday.
  const alive = last !== null && last.getTime() >= yesterday.getTime();
  const current = alive ? (row?.currentStreak ?? 0) : 0;

  // Week strip: days a node was completed, plus every day inside the live
  // streak run, so the strip always agrees with the streak number.
  const struck = new Set<string>();
  for (const n of weekNodes) {
    if (n.completedAt) struck.add(streakDayKey(n.completedAt));
  }
  if (alive && last) {
    for (let i = 0; i < current; i++) struck.add(toIsoDay(addDays(last, -i)));
  }

  const week: StreakDay[] = Array.from({ length: 7 }, (_, k) => {
    const iso = toIsoDay(addDays(weekStart, k));
    if (struck.has(iso)) return { date: iso, state: "struck" };
    return { date: iso, state: k === 6 ? "today" : "missed" };
  });

  const correct = nodeAgg._sum.correctAnswers ?? 0;
  const total = nodeAgg._sum.totalAnswers ?? 0;

  return {
    current,
    best: Math.max(row?.longestStreak ?? 0, current),
    goal: STREAK_GOAL,
    struckToday,
    week,
    stats: {
      accuracyPct: total > 0 ? Math.round((correct / total) * 100) : 0,
      boxesStruck: completedNodes,
      // TODO: needs node -> interaction type mapping from edition content.
      gameTypes: 0,
    },
  };
}
