export type Question = { id: string; points: number };

type StageLike = { id: string; type?: unknown; points: number; events?: unknown; pairs?: unknown };

export const timelineQuestionId = (stageId: string, eventId: string) => `${stageId}:${eventId}`;
export const matchPairQuestionId = (stageId: string, pairId: string) => `${stageId}:${pairId}`;

function splitPoints(ids: string[], points: number): Question[] {
  const base = Math.floor(points / ids.length);
  const extra = points % ids.length;
  return ids.map((id, index) => ({ id, points: base + (index < extra ? 1 : 0) }));
}

/**
 * The scored questions a stage contributes. Most stages are one question.
 * Timelines and match-pairs rounds are one question per item, and the stage's points are split so
 * they always sum exactly to the authored total. Remainder goes to the first
 * authored pair or earliest timeline cards by `order`: 10 pts over 3 cards = 4, 3, 3.
 * Used by BOTH the client (what to report) and the server (what to require).
 */
export function stageQuestions(stage: StageLike): Question[] {
  const single: Question[] = [{ id: stage.id, points: stage.points }];
  if (stage.type === "match-pairs") {
    if (!Array.isArray(stage.pairs) || stage.pairs.length === 0) return single;
    const pairIds: string[] = [];
    for (const raw of stage.pairs) {
      if (!raw || typeof raw !== "object") return single;
      const { id } = raw as { id?: unknown };
      if (typeof id !== "string" || id.length === 0) return single;
      pairIds.push(matchPairQuestionId(stage.id, id));
    }
    return new Set(pairIds).size === pairIds.length ? splitPoints(pairIds, stage.points) : single;
  }

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
  return splitPoints(events.map((event) => timelineQuestionId(stage.id, event.id)), stage.points);
}
