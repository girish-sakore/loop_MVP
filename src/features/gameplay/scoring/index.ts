export type Question = { id: string; points: number };

type StageLike = {
  id: string;
  type?: unknown;
  points: number;
  events?: unknown;
  clues?: unknown;
};

type TimelineEventLike = { id: string; order: number };
type ColorMatchClueLike = { id: string; points?: number };

export const timelineQuestionId = (stageId: string, eventId: string) => `${stageId}:${eventId}`;
export const colorMatchQuestionId = (stageId: string, clueId: string) => `${stageId}:${clueId}`;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

/** Splits an authored total exactly, assigning any remainder to earlier items. */
function splitPoints(total: number, itemCount: number): number[] {
  const base = Math.floor(total / itemCount);
  const remainder = total % itemCount;
  return Array.from({ length: itemCount }, (_, index) => base + (index < remainder ? 1 : 0));
}

function readTimelineEvents(value: unknown): TimelineEventLike[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const events: TimelineEventLike[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const { id, order } = raw as { id?: unknown; order?: unknown };
    if (typeof id !== "string" || id.length === 0 || typeof order !== "number") return null;
    events.push({ id, order });
  }

  if (new Set(events.map((event) => event.id)).size !== events.length) return null;
  return events.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function readColorMatchClues(value: unknown): ColorMatchClueLike[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const clues: ColorMatchClueLike[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const { id, points } = raw as { id?: unknown; points?: unknown };
    if (typeof id !== "string" || id.length === 0) return null;
    if (points !== undefined && !isNonNegativeInteger(points)) return null;
    clues.push({ id, points: points as number | undefined });
  }

  return new Set(clues.map((clue) => clue.id)).size === clues.length ? clues : null;
}

function timelineQuestions(stage: StageLike): Question[] | null {
  const events = readTimelineEvents(stage.events);
  if (!events) return null;
  const points = splitPoints(stage.points, events.length);
  return events.map((event, index) => ({
    id: timelineQuestionId(stage.id, event.id),
    points: points[index],
  }));
}

function colorMatchQuestions(stage: StageLike): Question[] | null {
  const clues = readColorMatchClues(stage.clues);
  if (!clues) return null;

  // A validated stage either authors every clue score or none. The latter
  // shares the stage total exactly, so every persisted score remains an int.
  const authoredPoints = clues.every((clue) => clue.points !== undefined)
    ? clues.map((clue) => clue.points as number)
    : splitPoints(stage.points, clues.length);

  return clues.map((clue, index) => ({
    id: colorMatchQuestionId(stage.id, clue.id),
    points: authoredPoints[index],
  }));
}

/**
 * Returns every independently scored question in a stage. Most games have
 * one question; timelines score events and Color Match scores individual clues.
 * This is used by the game client, completion API, and summary page so their
 * ids and point allocations cannot drift.
 */
export function stageQuestions(stage: StageLike): Question[] {
  const single = [{ id: stage.id, points: stage.points }];
  if (!isNonNegativeInteger(stage.points)) return single;

  if (stage.type === "timeline-builder") return timelineQuestions(stage) ?? single;
  if (stage.type === "color-match") return colorMatchQuestions(stage) ?? single;
  return single;
}
