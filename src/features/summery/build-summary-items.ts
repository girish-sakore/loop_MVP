// features/summery/build-summary-items.ts
import type { AnswerResults } from "@/features/gameplay/progress/resume";

export type SummaryItem = {
    id: string;
    question: string | null;
    headline: string | null;
    body: string;
    sources: { label: string; url: string }[];
    correct: boolean | null; // null = no result recorded
};

const SHOW_QUESTION = new Set(["image-select", "four-way-swipe", "border-hop", "drag-drop"]);

function getHeadline(item: any): string | null {
    if (item.options) return item.options.find((o: any) => o.isCorrect)?.label ?? null;
    if (item.card) return item.card.title;
    if (item.blanks?.length) return item.blanks[0].answer;
    if (item.answers && item.correctDirection) return item.answers[item.correctDirection]?.label ?? null;
    if (item.startCountry) return `${item.startCountry} → ${item.targetCountry}`;
    return item.answer ?? item.name ?? item.learning?.title ?? item.mapTitle ?? null;
}

// ASSUMPTION: answerResults is either an array by sub-stage index or a record by id.
// Adjust once you confirm the real shape.
function wasCorrect(results: AnswerResults | undefined, stageId: string, itemId: string): boolean | null {
    const r = results?.[itemId] ?? results?.[stageId];
    return r ? r.isCorrect : null;
}

export function buildSummaryItems(
  nodes: any[],
  resultsByNode: Record<string, AnswerResults>,
): SummaryItem[] {
  const out: SummaryItem[] = [];
  for (const node of nodes) {
    const results = resultsByNode[node.id];
    for (const s of node.subStages ?? []) {
      const items = s.cases ?? s.clues ?? [s];
      for (const item of items) {
        if (!item.summary?.body) continue;
        const isStage = item === s;
        const r = results?.[s.id];
        out.push({
          id: item.id ?? s.id,
          question: SHOW_QUESTION.has(node.type) ? s.question ?? null : null,
          headline: getHeadline(item),
          body: item.summary.body,
          sources: item.summary.sources ?? [],
          // one result per sub-stage, so only stage-level cards get a badge
          correct: isStage && r ? r.isCorrect : null,
        });
      }
    }
  }
  return out;
}