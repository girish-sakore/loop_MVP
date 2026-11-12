// features/gameplay/progress/resume.ts

export const SNAPSHOT_VERSION = 2;
export const MAX_HINTS_PER_STAGE = 50;
export const MAX_ANSWER_RESULTS = 500;

export type InteractionState = Record<string, unknown>;
export type HintsUsed = Record<string, string[]>;

/** The latest submitted result for one authored question. */
export type AnswerResult = {
  isCorrect: boolean;
  /** Client-side display value only; completion recomputes points from the edition snapshot. */
  points: number;
  /** Lets two devices deterministically keep the latest result for each question. */
  updatedAt: number;
};

export type AnswerResults = Record<string, AnswerResult>;

export type AnswerResultInput = {
  questionId: string;
  isCorrect: boolean;
  points: number;
};

export type GameplaySnapshot = {
  version: number;
  /** ms since epoch. Bumped only by user actions. Used only to break ties. */
  updatedAt: number;
  currentStage: number;
  attemptsRemaining: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  /** questionId -> its most recently submitted result */
  answerResults: AnswerResults;
  stagePassed: boolean;
  /** stageId -> stable ids of hints that have been revealed. */
  hintsUsed: HintsUsed;
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
  "currentStage" | "attemptsRemaining" | "score" | "correctAnswers" | "totalAnswers" | "answerResults" | "stagePassed"
> &
  Partial<Pick<GameplaySnapshot, "version" | "updatedAt" | "hintsUsed">>;

export function progressStorageKey(userId: string, editionId: string, nodeId: string) {
  return `loop_progress_${JSON.stringify([userId, editionId, nodeId])}`;
}

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;

// Question values can be split equally across authored sub-questions, so they
// are not necessarily integers (for example, 100 points across six clues).
const isPoints = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

const isQuestionId = (value: string) => value.length > 0 && value.length <= 160;

export function sanitizeAnswerResults(value: unknown): AnswerResults {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: AnswerResults = {};
  for (const [questionId, raw] of Object.entries(value).slice(0, MAX_ANSWER_RESULTS)) {
    if (!isQuestionId(questionId) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const result = raw as Record<string, unknown>;
    if (typeof result.isCorrect !== "boolean" || !isPoints(result.points) || !isCount(result.updatedAt)) continue;
    out[questionId] = {
      isCorrect: result.isCorrect,
      points: result.points,
      updatedAt: result.updatedAt,
    };
  }
  return out;
}

export function deriveAnswerStats(answerResults: AnswerResults) {
  const results = Object.values(answerResults);
  return {
    totalAnswers: results.length,
    correctAnswers: results.filter((result) => result.isCorrect).length,
    score: results.reduce((score, result) => score + (result.isCorrect ? result.points : 0), 0),
  };
}

/** Merge independent question updates without re-counting earlier attempts. */
export function mergeAnswerResults(a: AnswerResults, b: AnswerResults): AnswerResults {
  const out: AnswerResults = { ...a };
  for (const [questionId, incoming] of Object.entries(b)) {
    const existing = out[questionId];
    if (
      !existing ||
      incoming.updatedAt > existing.updatedAt ||
      (incoming.updatedAt === existing.updatedAt && (
        Number(incoming.isCorrect) > Number(existing.isCorrect) ||
        (incoming.isCorrect === existing.isCorrect && incoming.points > existing.points)
      ))
    ) out[questionId] = incoming;
  }
  return out;
}

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

export function sanitizeHintsUsed(value: unknown): HintsUsed {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: HintsUsed = {};
  for (const [stageId, ids] of Object.entries(value).slice(0, 200)) {
    if (!Array.isArray(ids)) continue;
    const clean = Array.from(
      new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 160)),
    ).slice(0, MAX_HINTS_PER_STAGE);
    if (clean.length) out[stageId] = clean;
  }
  return out;
}

export function unionHintsUsed(a: HintsUsed, b: HintsUsed): HintsUsed {
  const out: HintsUsed = { ...a };
  for (const [stageId, ids] of Object.entries(b)) {
    out[stageId] = Array.from(new Set([...(out[stageId] ?? []), ...ids]));
  }
  return sanitizeHintsUsed(out);
}

export const countHints = (hints: HintsUsed) =>
  Object.values(hints).reduce((count, ids) => count + ids.length, 0);

/** Validate untrusted data (localStorage or network) and fill in missing fields. */
export function normalizeSnapshot(raw: unknown): GameplaySnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.stagePassed !== "boolean") return null;
  if (![r.currentStage, r.attemptsRemaining, r.score, r.correctAnswers, r.totalAnswers].every(isCount)) return null;
  if ((r.correctAnswers as number) > (r.totalAnswers as number)) return null;
  // Written by a newer client than this one: don't guess at its shape.
  if (isCount(r.version) && r.version > SNAPSHOT_VERSION) return null;
  const answerResults = sanitizeAnswerResults(r.answerResults);
  const answerStats = deriveAnswerStats(answerResults);
  const hasAnswerResults = "answerResults" in r;
  return {
    version: SNAPSHOT_VERSION,
    updatedAt: isCount(r.updatedAt) ? r.updatedAt : 0,
    currentStage: r.currentStage as number,
    attemptsRemaining: r.attemptsRemaining as number,
    // Version 1 snapshots did not contain a ledger. Keep their counters long
    // enough to resume them; the first new submission replaces them with
    // ledger-derived values.
    score: hasAnswerResults ? answerStats.score : r.score as number,
    correctAnswers: hasAnswerResults ? answerStats.correctAnswers : r.correctAnswers as number,
    totalAnswers: hasAnswerResults ? answerStats.totalAnswers : r.totalAnswers as number,
    answerResults,
    stagePassed: r.stagePassed,
    hintsUsed: sanitizeHintsUsed(r.hintsUsed),
    interactionState: sanitizeInteractionState(r.interactionState),
  };
}

/** >0 if a is further along than b, <0 if behind, 0 if identical progress. Clock-free. */
export function compareProgress(a: GameplaySnapshot, b: GameplaySnapshot): number {
  if (a.currentStage !== b.currentStage) return a.currentStage - b.currentStage;
  if (a.stagePassed !== b.stagePassed) return a.stagePassed ? 1 : -1;
  return b.attemptsRemaining - a.attemptsRemaining;
}

/**
 * Deterministic and order-independent: every device and the server converge
 * on the same result no matter who syncs first.
 *  - Progress: whichever snapshot is further along wins.
 *  - Same progress: newer updatedAt wins.
 *  - Hints: revealed ids are unioned per stage.
 *  - interactionState: always taken from `a` — the server never has any.
 */
export function mergeSnapshots(a: GameplaySnapshot, b: GameplaySnapshot): GameplaySnapshot {
  const c = compareProgress(a, b);
  const winner = c > 0 ? a : c < 0 ? b : a.updatedAt >= b.updatedAt ? a : b;
  const answerResults = mergeAnswerResults(a.answerResults, b.answerResults);
  return {
    ...winner,
    version: SNAPSHOT_VERSION,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    ...deriveAnswerStats(answerResults),
    answerResults,
    hintsUsed: unionHintsUsed(a.hintsUsed, b.hintsUsed),
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
    answerResults: s.answerResults,
    stagePassed: s.stagePassed,
    hintsUsed: s.hintsUsed,
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
    answerResults: s.answerResults,
    hintsUsed: s.hintsUsed,
  };
}

// The server never returns interactionState; it always comes back empty.
// The engine fills it back in from this device's own localStorage.
export function fromServerPayload(raw: unknown): GameplaySnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return normalizeSnapshot({ ...r, currentStage: r.currentSubStage ?? r.currentStage, interactionState: {} });
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
): GameplaySnapshot {
  try {
    const local = normalizeSnapshot(JSON.parse(storage.getItem(key) ?? "null"));
    if (!local) return server;
    const allowance = allowances[local.currentStage];
    if (allowance === undefined || local.attemptsRemaining > allowance) {
      return { ...server, hintsUsed: unionHintsUsed(server.hintsUsed, local.hintsUsed) };
    }
    // local goes first so its interactionState is kept when local wins or ties.
    return { ...mergeSnapshots(local, server), hintsUsed: unionHintsUsed(server.hintsUsed, local.hintsUsed) };
  } catch {
    return server;
  }
}
