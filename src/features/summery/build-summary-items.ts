// features/summery/build-summary-items.ts
import type { AnswerResults } from "@/features/gameplay/progress/resume";
import { colorMatchQuestionId, timelineQuestionId } from "@/features/gameplay/scoring";

export type SummaryItem = {
  id: string; // also the key into answerResults for timeline cards
  question: string | null;
  headline: string | null;
  body: string;
  sources: { label: string; url: string }[];
  correct: boolean | null; // null = no result recorded
};

type Source = { label: string; url: string };

// Every field is `unknown` on purpose: each game type has its own shape,
// so we accept any of them and narrow at the point of use.
type RawItem = {
  id?: unknown;
  summary?: unknown;
  options?: unknown;
  card?: unknown;
  blanks?: unknown;
  answers?: unknown;
  correctDirection?: unknown;
  startCountry?: unknown;
  targetCountry?: unknown;
  answer?: unknown;
  name?: unknown;
  learning?: unknown;
  mapTitle?: unknown;
};

type RawSubStage = RawItem & {
  id: string;
  question?: unknown;
  cases?: unknown;
  clues?: unknown;
  events?: unknown;
};

export type SummaryNode = {
  id: string;
  type: string;
  subStages?: RawSubStage[];
  mapTitle?: string;
};

const SHOW_QUESTION = new Set(["image-select", "four-way-swipe", "border-hop", "drag-drop"]);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null;
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const isSource = (v: unknown): v is Source =>
  isObj(v) && typeof v.label === "string" && typeof v.url === "string";

function readSummary(item: RawItem): { body: string; sources: Source[] } | null {
  if (!isObj(item.summary)) return null;
  const body = str(item.summary.body);
  if (!body) return null;
  const sources = Array.isArray(item.summary.sources) ? item.summary.sources.filter(isSource) : [];
  return { body, sources };
}

type TimelineEvent = { id: string; year: string; title: string; description: string; order: number };

function readTimelineEvents(events: unknown): TimelineEvent[] {
  if (!Array.isArray(events)) return [];
  return events
    .filter(isObj)
    .map((e) => ({
      id: str(e.id) ?? "",
      year: str(e.year) ?? "",
      title: str(e.title) ?? "",
      description: str(e.description) ?? "",
      order: typeof e.order === "number" ? e.order : 0,
    }))
    .filter((e) => e.id && e.title && e.description)
    .sort((a, b) => a.order - b.order);
}

function correctOptionLabel(options: unknown): string | null {
  if (!Array.isArray(options)) return null;
  const hit = options.find((o) => isObj(o) && o.isCorrect === true);
  return isObj(hit) ? str(hit.label) : null;
}

function getHeadline(item: RawItem): string | null {
  const fromOptions = correctOptionLabel(item.options);
  if (fromOptions) return fromOptions;

  if (isObj(item.card)) return str(item.card.title);

  if (Array.isArray(item.blanks) && item.blanks.length) {
    const first: unknown = item.blanks[0];
    return isObj(first) ? str(first.answer) : null;
  }

  if (isObj(item.answers) && typeof item.correctDirection === "string") {
    const picked = item.answers[item.correctDirection];
    return isObj(picked) ? str(picked.label) : null;
  }

  const start = str(item.startCountry);
  if (start) return `${start} → ${str(item.targetCountry) ?? ""}`;

  return (
    str(item.answer) ??
    str(item.name) ??
    (isObj(item.learning) ? str(item.learning.title) : null) ??
    str(item.mapTitle)
  );
}

export function buildSummaryItems(
  nodes: SummaryNode[],
  resultsByNode: Record<string, AnswerResults>,
): SummaryItem[] {
  const out: SummaryItem[] = [];

  for (const node of nodes) {
    const results = resultsByNode[node.id];

    for (const s of node.subStages ?? []) {
      const r = results?.[s.id];

      // Timeline: one card per event. The event's own description is the
      // body, and the badge comes from that event's per-card result.
      if (node.type === "timeline-builder") {
        for (const e of readTimelineEvents(s.events)) {
          const key = timelineQuestionId(s.id, e.id);
          const res = results?.[key];
          out.push({
            id: key,
            question: null,
            headline: `${e.year}: ${e.title}`,
            body: e.description,
            sources: [],
            correct: res ? res.isCorrect : null,
          });
        }
        continue;
      }

      const children = Array.isArray(s.cases) ? s.cases : Array.isArray(s.clues) ? s.clues : null;
      const items: RawItem[] = children ? children.filter(isObj) : [s];
      const isStage = !children;

      for (const item of items) {
        const itemId = str(item.id) ?? s.id;
        const resultId = node.type === "color-match"
          ? colorMatchQuestionId(s.id, itemId)
          : s.id;
        const result = results?.[resultId];
        const itemResult = isStage ? r : result;
        const summary = readSummary(item);
        if (!summary) continue;
        out.push({
          id: resultId,
          question: SHOW_QUESTION.has(node.type) ? str(s.question) : null,
          headline: getHeadline(item),
          body: summary.body,
          sources: summary.sources,
          correct: itemResult ? itemResult.isCorrect : null,
        });
      }
    }
  }

  return out;
}
