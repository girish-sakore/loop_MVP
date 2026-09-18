export type GameplaySnapshot = {
  currentStage: number;
  attemptsRemaining: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  stagePassed: boolean;
};

export function progressStorageKey(userId: string, editionId: string, nodeId: string) {
  return `loop_progress_${JSON.stringify([userId, editionId, nodeId])}`;
}

export function saveSnapshot(storage: Pick<Storage, "setItem">, key: string, snapshot: GameplaySnapshot) {
  try {
    storage.setItem(key, JSON.stringify(snapshot));
  } catch {
    // Server persistence still works if browser storage is unavailable.
  }
}

export function restoreSnapshot(
  storage: Pick<Storage, "getItem">,
  key: string,
  server: GameplaySnapshot,
  allowances: number[],
): GameplaySnapshot {
  try {
    const local = JSON.parse(storage.getItem(key) ?? "null") as GameplaySnapshot | null;
    if (!local || typeof local.stagePassed !== "boolean") return server;
    if (![local.currentStage, local.attemptsRemaining, local.score, local.correctAnswers, local.totalAnswers]
      .every((value) => Number.isSafeInteger(value) && value >= 0)) return server;
    const allowance = allowances[local.currentStage];
    if (allowance === undefined || local.attemptsRemaining > allowance || local.correctAnswers > local.totalAnswers) return server;
    // A browser backup can be ahead of an in-flight server save, never behind it.
    if (local.currentStage < server.currentStage || local.totalAnswers < server.totalAnswers) return server;
    if (local.currentStage === server.currentStage &&
      (local.attemptsRemaining > server.attemptsRemaining || (server.stagePassed && !local.stagePassed))) return server;
    return local;
  } catch {
    return server;
  }
}
