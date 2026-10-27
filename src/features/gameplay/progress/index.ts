// features/gameplay/progress/index.ts

export {
  SNAPSHOT_VERSION,
  MAX_HINTS_PER_STAGE,
  progressStorageKey,
  normalizeSnapshot,
  sanitizeInteractionState,
  sanitizeHintsUsed,
  unionHintsUsed,
  countHints,
  compareProgress,
  mergeSnapshots,
  pickSnapshot,
  toServerPayload,
  fromServerPayload,
  saveSnapshot,
  restoreSnapshot,
} from "./resume";
export type { GameplaySnapshot, HintsUsed, InteractionState, StoredProgress } from "./resume";

export { useProgressSync } from "./use-progress-sync";
export { useInteractionProgress } from "./use-interaction-progress";
