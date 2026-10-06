import { DEFAULT_HINT_BUDGET, type GameplaySnapshot } from "./resume";

const DEFAULT_ATTEMPTS = 3;

export type GameProgressConfig = {
  type: string;
  content: unknown;
};

type StageConfig = { attemptsAllowed: number };

/** The database currently stores rounds as `subStages`; accept `stages` too. */
export function gameStageConfigs(game: GameProgressConfig): StageConfig[] | null {
  if (!game.content || typeof game.content !== "object" || Array.isArray(game.content)) {
    return null;
  }

  const content = game.content as { stages?: unknown; subStages?: unknown };
  const configured = Array.isArray(content.stages)
    ? content.stages
    : Array.isArray(content.subStages)
      ? content.subStages
      : null;
  if (!configured || configured.length === 0) return null;

  // This interaction presents the stored sub-stages as one engine round.
  const stages = game.type === "fill-blank-text" ? [configured[0]] : configured;
  return stages.map((raw) => {
    const stage = raw && typeof raw === "object" && !Array.isArray(raw)
      ? raw as { attemptsAllowed?: unknown }
      : {};
    const attemptsAllowed = stage.attemptsAllowed;
    return {
      attemptsAllowed:
        typeof attemptsAllowed === "number" && Number.isSafeInteger(attemptsAllowed) && attemptsAllowed >= 0
          ? attemptsAllowed
          : DEFAULT_ATTEMPTS,
    };
  });
}

/** Validate untrusted client snapshots against the selected game's real config. */
export function validateSnapshotForGame(
  snapshot: GameplaySnapshot,
  game: GameProgressConfig,
): string | null {
  const stages = gameStageConfigs(game);
  if (!stages) return "Game has no valid stages.";

  const counts = [
    snapshot.currentStage,
    snapshot.attemptsRemaining,
    snapshot.score,
    snapshot.correctAnswers,
    snapshot.totalAnswers,
    snapshot.hintsRemaining,
    snapshot.updatedAt,
  ];
  if (!counts.every((value) => Number.isSafeInteger(value) && value >= 0)) {
    return "Progress counts must be non-negative integers.";
  }
  if (snapshot.correctAnswers > snapshot.totalAnswers) {
    return "Correct answers cannot exceed total answers.";
  }
  if (snapshot.currentStage >= stages.length) {
    return "Current stage is outside this game's stage range.";
  }
  if (snapshot.attemptsRemaining > stages[snapshot.currentStage].attemptsAllowed) {
    return "Attempts remaining exceed this stage's allowance.";
  }
  if (snapshot.hintsRemaining > DEFAULT_HINT_BUDGET) {
    return "Hints remaining exceed the hint budget.";
  }
  return null;
}
