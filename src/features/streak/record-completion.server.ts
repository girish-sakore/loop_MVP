// features/streak/record-completion.server.ts
import "server-only";
import type { Prisma } from "@prisma/client";
import { addDays, streakToday, toIsoDay } from "./dates";

export type StreakUpdate = {
  current: number;
  longest: number;
  incrementedToday: boolean;
};

/**
 * Call inside the same transaction that marks a game as completed.
 *
 * Call only for today's published game from the completion service. The
 * compare-and-set on lastCompletedDate makes duplicate/concurrent completion
 * requests idempotent.
 */
export async function recordCompletionForStreak(
  tx: Prisma.TransactionClient,
  userId: string,
  now: Date = new Date(),
): Promise<StreakUpdate> {
  const today = streakToday(now);
  const yesterday = addDays(today, -1);

  // Make sure the row exists (no-op if it already does).
  await tx.userStreak.createMany({ data: [{ userId }], skipDuplicates: true });

  const row = await tx.userStreak.findUniqueOrThrow({
    where: { userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastCompletedDate: true,
    },
  });
  const lastKey = row.lastCompletedDate ? toIsoDay(row.lastCompletedDate) : null;
  const todayKey = toIsoDay(today);
  const yesterdayKey = toIsoDay(yesterday);

  if (lastKey !== null && lastKey >= todayKey) {
    return { current: row.currentStreak, longest: row.longestStreak, incrementedToday: false };
  }

  const continues = lastKey === yesterdayKey;
  const current = continues ? row.currentStreak + 1 : 1;
  const longest = Math.max(row.longestStreak, current);

  const res = await tx.userStreak.updateMany({
    where: { userId, lastCompletedDate: row.lastCompletedDate },
    data: { currentStreak: current, longestStreak: longest, lastCompletedDate: today },
  });

  if (res.count === 0) {
    // A concurrent request recorded today first.
    const fresh = await tx.userStreak.findUniqueOrThrow({ where: { userId } });
    return { current: fresh.currentStreak, longest: fresh.longestStreak, incrementedToday: false };
  }

  return { current, longest, incrementedToday: true };
}
