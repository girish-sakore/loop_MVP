// features/streak/record-completion.server.ts
import "server-only";
import type { Prisma } from "@prisma/client";
import { addDays, streakToday } from "./dates";

export type StreakUpdate = {
  current: number;
  longest: number;
  incrementedToday: boolean;
};

/**
 * Call inside the same transaction that marks a node as passed.
 *
 * Once-per-day is enforced with compare-and-set: the update only applies if
 * lastCompletedDate is still the value we read. A duplicate or concurrent
 * request for the same day either sees today already recorded, or loses the
 * CAS (count 0), and exits without changing the streak.
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

  const row = await tx.userStreak.findUniqueOrThrow({ where: { userId } });
  const last = row.lastCompletedDate;

  if (last && last.getTime() >= today.getTime()) {
    return { current: row.currentStreak, longest: row.longestStreak, incrementedToday: false };
  }

  const continues = last !== null && last.getTime() === yesterday.getTime();
  const current = continues ? row.currentStreak + 1 : 1;
  const longest = Math.max(row.longestStreak, current);

  const res = await tx.userStreak.updateMany({
    where: { userId, lastCompletedDate: last },
    data: { currentStreak: current, longestStreak: longest, lastCompletedDate: today },
  });

  if (res.count === 0) {
    // A concurrent request recorded today first.
    const fresh = await tx.userStreak.findUniqueOrThrow({ where: { userId } });
    return { current: fresh.currentStreak, longest: fresh.longestStreak, incrementedToday: false };
  }

  return { current, longest, incrementedToday: true };
}
