// features/gameplay/progress/index.ts

export {
  SNAPSHOT_VERSION,
  DEFAULT_HINT_BUDGET,
  progressStorageKey,
  normalizeSnapshot,
  sanitizeInteractionState,
  compareProgress,
  mergeSnapshots,
  pickSnapshot,
  toServerPayload,
  fromServerPayload,
  saveSnapshot,
  restoreSnapshot,
} from "./resume";
export type { GameplaySnapshot, InteractionState, StoredProgress } from "./resume";

export { useProgressSync } from "./use-progress-sync";
export { useInteractionProgress } from "./use-interaction-progress";
export { gameStageConfigs, validateSnapshotForGame } from "./validation";