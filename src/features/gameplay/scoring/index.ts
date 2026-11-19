export type Question = { id: string; points: number };

type StageLike = { id: string; type?: unknown; points: number; events?: unknown };

export const timelineQuestionId = (stageId: string, eventId: string) => `${stageId}:${eventId}`;

/**
 * The scored questions a stage contributes. Most stages are one question.
 * A timeline is one question per card, and the stage's points are split so
 * they always sum exactly to the authored total (remainder goes to the
 * earliest cards by `order`: 10 pts over 3 cards = 4, 3, 3).
 * Used by BOTH the client (what to report) and the server (what to require).
 */
export function stageQuestions(stage: StageLike): Question[] {
  const single: Question[] = [{ id: stage.id, points: stage.points }];
  if (stage.type !== "timeline-builder" || !Array.isArray(stage.events) || stage.events.length === 0) {
    return single;
  }

  const events: Array<{ id: string; order: number }> = [];
  for (const raw of stage.events) {
    if (!raw || typeof raw !== "object") return single;
    const { id, order } = raw as { id?: unknown; order?: unknown };
    if (typeof id !== "string" || id.length === 0 || typeof order !== "number") return single;
    events.push({ id, order });
  }
  // Duplicate event ids would make question ids collide.
  if (new Set(events.map((e) => e.id)).size !== events.length) return single;

  events.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const base = Math.floor(stage.points / events.length);
  const extra = stage.points % events.length;
  return events.map((e, i) => ({
    id: timelineQuestionId(stage.id, e.id),
    points: base + (i < extra ? 1 : 0),
  }));
}