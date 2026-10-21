// features/streak/record-completion.server.ts
import "server-only";
import type { Prisma } from "@prisma/client";
import { getStreakMetrics, streakToday } from "./dates";

export type StreakUpdate = {
  current: number;
  longest: number;
  incrementedToday: boolean;
};

/**
 * Call inside the same transaction that marks a node as passed.
 *
 * The composite primary key on UserStreakDay enforces once per IST day. The
 * summary is then rebuilt from those durable daily records, so a replay can
 * never add a day and historical completions can be backfilled safely.
 */
export async function recordCompletionForStreak(
  tx: Prisma.TransactionClient,
  userId: string,
  now: Date = new Date(),
): Promise<StreakUpdate> {
  const today = streakToday(now);

  const created = await tx.userStreakDay.createMany({
    data: [{ userId, date: today }],
    skipDuplicates: true,
  });
  const days = await tx.userStreakDay.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "asc" },
  });
  const metrics = getStreakMetrics(days.map((day) => day.date), today);

  await tx.userStreak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: metrics.current,
      longestStreak: metrics.longest,
      lastCompletedDate: today,
    },
    update: {
      currentStreak: metrics.current,
      longestStreak: metrics.longest,
      lastCompletedDate: today,
    },
  });

  return {
    current: metrics.current,
    longest: metrics.longest,
    incrementedToday: created.count === 1,
  };
}
