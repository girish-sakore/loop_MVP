// features/gameplay/progress/resume.ts

export const SNAPSHOT_VERSION = 1;
export const DEFAULT_HINT_BUDGET = 3;

export type InteractionState = Record<string, unknown>;

export type GameplaySnapshot = {
  version: number;
  /** ms since epoch. Bumped only by user actions. Used only to break ties. */
  updatedAt: number;
  currentStage: number;
  attemptsRemaining: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  stagePassed: boolean;
  /** Hint budget for this node. Only ever goes down when merging. */
  hintsRemaining: number;
  /**
   * stageId -> game-specific state (typed answers, revealed hints, route taken...).
   * DEVICE-LOCAL ONLY. Never sent to the server and never read back from it.
   * Switching devices mid-stage starts that stage fresh, same as Retry.
   */
  interactionState: Record<string, InteractionState>;
};

/** What a page may hand the engine as a starting point. */
export type StoredProgress = Pick<
  GameplaySnapshot,
  "currentStage" | "attemptsRemaining" | "score" | "correctAnswers" | "totalAnswers" | "stagePassed"
> &
  Partial<Pick<GameplaySnapshot, "version" | "updatedAt" | "hintsRemaining">>;

export function progressStorageKey(userId: string, gameId: string) {
  return `loop_progress_${JSON.stringify([userId, gameId])}`;
}

export function legacyProgressStorageKey(userId: string, editionId: string, gameId: string) {
  return `loop_progress_${JSON.stringify([userId, editionId, gameId])}`;
}

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;

// Keeps only { stageId: { ...plain object } }; anything else is dropped.
export function sanitizeInteractionState(value: unknown): Record<string, InteractionState> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, InteractionState> = {};
  for (const [stageId, state] of Object.entries(value)) {
    if (state && typeof state === "object" && !Array.isArray(state)) {
      out[stageId] = state as InteractionState;
    }
  }
  return out;
}

/** Validate untrusted data (localStorage or network) and fill in missing fields. */
export function normalizeSnapshot(
  raw: unknown,
  defaults: { hintsRemaining?: number } = {},
): GameplaySnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.stagePassed !== "boolean") return null;
  if (![r.currentStage, r.attemptsRemaining, r.score, r.correctAnswers, r.totalAnswers].every(isCount)) return null;
  if ((r.correctAnswers as number) > (r.totalAnswers as number)) return null;
  // Written by a newer client than this one: don't guess at its shape.
  if (isCount(r.version) && r.version > SNAPSHOT_VERSION) return null;
  return {
    version: SNAPSHOT_VERSION,
    updatedAt: isCount(r.updatedAt) ? r.updatedAt : 0,
    currentStage: r.currentStage as number,
    attemptsRemaining: r.attemptsRemaining as number,
    score: r.score as number,
    correctAnswers: r.correctAnswers as number,
    totalAnswers: r.totalAnswers as number,
    stagePassed: r.stagePassed,
    hintsRemaining: isCount(r.hintsRemaining) ? r.hintsRemaining : defaults.hintsRemaining ?? DEFAULT_HINT_BUDGET,
    interactionState: sanitizeInteractionState(r.interactionState),
  };
}

/** >0 if a is further along than b, <0 if behind, 0 if identical progress. Clock-free. */
export function compareProgress(a: GameplaySnapshot, b: GameplaySnapshot): number {
  if (a.currentStage !== b.currentStage) return a.currentStage - b.currentStage;
  if (a.totalAnswers !== b.totalAnswers) return a.totalAnswers - b.totalAnswers;
  if (a.stagePassed !== b.stagePassed) return a.stagePassed ? 1 : -1;
  return b.attemptsRemaining - a.attemptsRemaining;
}

/**
 * Deterministic and order-independent: every device and the server converge
 * on the same result no matter who syncs first.
 *  - Progress: whichever snapshot is further along wins.
 *  - Same progress: newer updatedAt wins.
 *  - Hints: spent hints never come back, so take the minimum.
 *  - interactionState: always taken from `a` — the server never has any.
 */
export function mergeSnapshots(a: GameplaySnapshot, b: GameplaySnapshot): GameplaySnapshot {
  const c = compareProgress(a, b);
  const winner = c > 0 ? a : c < 0 ? b : a.updatedAt >= b.updatedAt ? a : b;
  return {
    ...winner,
    version: SNAPSHOT_VERSION,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    hintsRemaining: Math.min(a.hintsRemaining, b.hintsRemaining),
    interactionState: a.interactionState,
  };
}

type SnapshotSource = Omit<GameplaySnapshot, "version">;

/** The one place a snapshot is built from live state. */
export function pickSnapshot(s: SnapshotSource): GameplaySnapshot {
  return {
    version: SNAPSHOT_VERSION,
    updatedAt: s.updatedAt,
    currentStage: s.currentStage,
    attemptsRemaining: s.attemptsRemaining,
    score: s.score,
    correctAnswers: s.correctAnswers,
    totalAnswers: s.totalAnswers,
    stagePassed: s.stagePassed,
    hintsRemaining: s.hintsRemaining,
    interactionState: s.interactionState,
  };
}

// The DB calls the stage index "currentSubStage". interactionState never
// leaves the browser — it is intentionally left out of the payload.
export function toServerPayload(s: GameplaySnapshot) {
  return {
    version: s.version,
    updatedAt: s.updatedAt,
    currentSubStage: s.currentStage,
    attemptsRemaining: s.attemptsRemaining,
    stagePassed: s.stagePassed,
    score: s.score,
    correctAnswers: s.correctAnswers,
    totalAnswers: s.totalAnswers,
    hintsRemaining: s.hintsRemaining,
  };
}

// The server never returns interactionState; it always comes back empty.
// The engine fills it back in from this device's own localStorage.
export function fromServerPayload(raw: unknown, defaults?: { hintsRemaining?: number }): GameplaySnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return normalizeSnapshot(
    { ...r, currentStage: r.currentSubStage ?? r.currentStage, interactionState: {} },
    defaults,
  );
}

export function saveSnapshot(storage: Pick<Storage, "setItem">, key: string, snapshot: GameplaySnapshot) {
  try {
    storage.setItem(key, JSON.stringify(snapshot));
  } catch {
    // Server persistence still works if browser storage is unavailable.
  }
}

/** Browser backup merged with what the server sent. Never goes behind either. */
export function restoreSnapshot(
  storage: Pick<Storage, "getItem">,
  key: string,
  server: GameplaySnapshot,
  allowances: number[],
  legacyKey?: string,
): GameplaySnapshot {
  try {
    const raw = storage.getItem(key) ?? (legacyKey ? storage.getItem(legacyKey) : null);
    const local = normalizeSnapshot(JSON.parse(raw ?? "null"), {
      hintsRemaining: server.hintsRemaining,
    });
    if (!local) return server;
    const allowance = allowances[local.currentStage];
    if (allowance === undefined || local.attemptsRemaining > allowance) return server;
    // local goes first so its interactionState is kept when local wins or ties.
    return mergeSnapshots(local, server);
  } catch {
    return server;
  }
}