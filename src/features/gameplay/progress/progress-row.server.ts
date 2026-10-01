// features/gameplay/progress/progress-row.server.ts

import type { UserNodeProgress } from "@prisma/client";
import { normalizeSnapshot, type GameplaySnapshot } from "./resume";

type Row = Pick<UserNodeProgress, "currentSubStage" | "attemptsRemaining" | "stagePassed" | "score" | "correctAnswers" | "totalAnswers"> & {
  hintsRemaining: number;
  clientUpdatedAt: bigint;
  version: number;
};

/**
 * null attemptsRemaining means "legacy/uninitialized": treat the whole row as
 * if there is no saved progress yet, so the caller falls back to its own
 * initial-stage defaults instead of guessing an allowance.
 */
export function rowToSnapshot(row: Row | null): GameplaySnapshot | null {
  if (!row || row.attemptsRemaining === null) return null;
  return normalizeSnapshot({
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
  });
}

/** Fields to pass to a Prisma `create` or `update` for this snapshot. */
export function snapshotToRowData(snapshot: GameplaySnapshot) {
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
    status: "in_progress" as const,
  };
}