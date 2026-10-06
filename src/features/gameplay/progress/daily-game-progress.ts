// features/gameplay/progress/daily-game-progress.ts
//
// Single source of truth: one row in daily_game_progress per (user, game).

import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { recordCompletionForStreak } from "@/features/streak/record-completion.server";
import { isGameAvailable, isGameScheduledForToday } from "@/features/streak/dates";
import { mergeSnapshots, type GameplaySnapshot } from "./resume";
import { gameStageConfigs, validateSnapshotForGame } from "./validation";

export type GameProgressStatus = "not_started" | "in_progress" | "completed";

export type GameProgress = {
  status: GameProgressStatus;
  currentSubStage: number;
  attemptsRemaining: number | null;
  stagePassed: boolean;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  stars: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

const EMPTY: GameProgress = {
  status: "not_started",
  currentSubStage: 0,
  attemptsRemaining: null,
  stagePassed: false,
  score: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  stars: 0,
  startedAt: null,
  completedAt: null,
};

type GameShape = {
  id: string;
  scheduledFor: Date;
  type: string;
  status: "draft" | "published";
  content: unknown;
};

function toProgress(row: {
  status: string;
  currentSubStage: number;
  attemptsRemaining: number | null;
  stagePassed: boolean;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  stars: number;
  startedAt: Date | null;
  completedAt: Date | null;
} | null): GameProgress {
  if (!row) return { ...EMPTY };
  return { ...row, status: row.status as GameProgressStatus };
}

/** One user's progress on one daily game. */
export async function getGameProgress(
  userId: string,
  game: GameShape,
): Promise<GameProgress> {
  const row = await prisma.dailyGameProgress.findFirst({
    where: { userId, dailyGame: { id: game.id, scheduledFor: game.scheduledFor } },
  });
  return toProgress(row);
}

/** Every game a user has ever touched, newest day first (profile / recent). */
export async function getAllGameProgress(userId: string) {
  const rows = await prisma.dailyGameProgress.findMany({
    where: { userId },
    include: { dailyGame: { select: { id: true, scheduledFor: true, type: true, title: true, category: true, content: true } } },
    orderBy: { dailyGame: { scheduledFor: "desc" } },
  });
  return rows.map((row) => ({
    game: row.dailyGame,
    progress: toProgress(row),
  }));
}

/**
 * Complete only from the user's saved final-stage pass. The same row lock
 * serializes duplicate requests; only today's published game advances streak.
 */
export class CompletionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "CompletionError";
  }
}

export async function completeGameProgress(
  userId: string,
  gameId: string,
  now: Date = new Date(),
) {
  return prisma.$transaction(async (tx) => {
    const game = await tx.dailyGame.findUnique({ where: { id: gameId } });
    if (!game || game.status !== "published") {
      throw new CompletionError("Published game not found.", 404);
    }
    if (!isGameAvailable(game.scheduledFor, now)) {
      throw new CompletionError("Game is not available yet.", 404);
    }

    await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "daily_game_progress"
      WHERE "userId" = ${userId} AND "dailyGameId" = ${gameId}
      FOR UPDATE
    `;

    const saved = await tx.dailyGameProgress.findUnique({
      where: { userId_dailyGameId: { userId, dailyGameId: gameId } },
    });
    if (!saved) throw new CompletionError("No saved progress for this game.", 409);

    const snapshot = progressRowToSnapshot(saved);
    if (!snapshot) throw new CompletionError("Saved progress is incomplete.", 409);
    const validationError = validateSnapshotForGame(snapshot, game);
    if (validationError) throw new CompletionError(validationError, 409);

    const stages = gameStageConfigs(game);
    if (
      !stages ||
      saved.currentSubStage !== stages.length - 1 ||
      !saved.stagePassed
    ) {
      throw new CompletionError("The final stage has not been passed.", 409);
    }

    if (saved.status === "completed") {
      const existingStreak = await tx.userStreak.findUnique({
        where: { userId },
        select: { currentStreak: true, longestStreak: true },
      });
      return {
        row: saved,
        streak: {
          current: existingStreak?.currentStreak ?? 0,
          longest: existingStreak?.longestStreak ?? 0,
        },
      };
    }

    const stars = saved.totalAnswers === 0
      ? 0
      : saved.correctAnswers / saved.totalAnswers >= 0.9
        ? 3
        : saved.correctAnswers / saved.totalAnswers >= 0.6 ? 2 : 1;
    const row = await tx.dailyGameProgress.update({
      where: { userId_dailyGameId: { userId, dailyGameId: gameId } },
      data: {
        status: "completed",
        stars,
        completedAt: now,
      },
    });

    const gameIsToday =
      game.status === "published" &&
      isGameScheduledForToday(game.scheduledFor, now);
    if (gameIsToday) {
      const streak = await recordCompletionForStreak(tx, userId, now);
      return { row, streak: { current: streak.current, longest: streak.longest } };
    }

    const existingStreak = await tx.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true, longestStreak: true },
    });
    return {
      row,
      streak: {
        current: existingStreak?.currentStreak ?? 0,
        longest: existingStreak?.longestStreak ?? 0,
      },
    };
  });
}

/** Row -> snapshot for the sync route (null when no initialised row). */
export function progressRowToSnapshot(row: {
  currentSubStage: number;
  attemptsRemaining: number | null;
  stagePassed: boolean;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  hintsRemaining: number;
  clientUpdatedAt: bigint;
  version: number;
} | null): GameplaySnapshot | null {
  if (!row || row.attemptsRemaining === null) return null;
  return {
    version: row.version,
    updatedAt: Number(row.clientUpdatedAt),
    currentStage: row.currentSubStage,
    attemptsRemaining: row.attemptsRemaining,
    score: row.score,
    correctAnswers: row.correctAnswers,
    totalAnswers: row.totalAnswers,
    stagePassed: row.stagePassed,
    hintsRemaining: row.hintsRemaining,
    interactionState: {}, // never stored server-side
  };
}

/** Snapshot -> row fields for the sync route. */
export function snapshotToProgressRowData(snapshot: GameplaySnapshot) {
  return {
    currentSubStage: snapshot.currentStage,
    attemptsRemaining: snapshot.attemptsRemaining,
    stagePassed: snapshot.stagePassed,
    score: snapshot.score,
    correctAnswers: snapshot.correctAnswers,
    totalAnswers: snapshot.totalAnswers,
    hintsRemaining: snapshot.hintsRemaining,
    clientUpdatedAt: BigInt(snapshot.updatedAt),
    version: snapshot.version,
    status: "in_progress",
  };
}

/**
 * Lock the row for the duration of the transaction so two devices saving at
 * the same instant can't overwrite each other. Sync is never a completion path.
 */
export async function writeMergedGameProgress(
  userId: string,
  gameId: string,
  incoming: GameplaySnapshot,
): Promise<GameplaySnapshot> {
  try {
    return await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "daily_game_progress"
        WHERE "userId" = ${userId} AND "dailyGameId" = ${gameId}
        FOR UPDATE
      `;

      const game = await tx.dailyGame.findUnique({ where: { id: gameId } });
      if (!game || game.status !== "published") {
        throw new Error("Published game not found.");
      }
      const validationError = validateSnapshotForGame(incoming, game);
      if (validationError) throw new Error(validationError);

      if (locked.length === 0) {
        await tx.dailyGameProgress.create({
          data: {
            userId,
            dailyGameId: gameId,
            startedAt: new Date(),
            ...snapshotToProgressRowData(incoming),
            status: "in_progress",
          },
        });
        return incoming;
      }

      const row = await tx.dailyGameProgress.findUniqueOrThrow({
        where: { userId_dailyGameId: { userId, dailyGameId: gameId } },
      });
      const existing = progressRowToSnapshot(row);

      // Completing a game races with the final client sync. That sync carries
      // a normal gameplay snapshot, so it must never be allowed to turn a
      // completed row back into "in_progress" after completion has won.
      if (row.status === "completed") return existing ?? incoming;

      const mergedSnapshot = existing ? mergeSnapshots(existing, incoming) : incoming;
      const mergedValidationError = validateSnapshotForGame(mergedSnapshot, game);
      if (mergedValidationError) throw new Error(mergedValidationError);

      await tx.dailyGameProgress.update({
        where: { userId_dailyGameId: { userId, dailyGameId: gameId } },
        data: {
          ...snapshotToProgressRowData(mergedSnapshot),
          status: "in_progress",
        },
      });
      return mergedSnapshot;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return writeMergedGameProgress(userId, gameId, incoming);
    }
    throw err;
  }
}
