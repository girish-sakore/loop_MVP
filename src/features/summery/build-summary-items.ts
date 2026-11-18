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
};

export type SummaryNode = {
  id: string;
  type: string;
  subStages?: RawSubStage[];
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
      const cases = s.cases;
      const clues = s.clues;
      const children = Array.isArray(cases) ? cases : Array.isArray(clues) ? clues : null;
      const items: RawItem[] = children ? children.filter(isObj) : [s];
      const isStage = !children;
      const r = results?.[s.id];

      for (const item of items) {
        const summary = readSummary(item);
        if (!summary) continue;
        out.push({
          id: str(item.id) ?? s.id,
          question: SHOW_QUESTION.has(node.type) ? str(s.question) : null,
          headline: getHeadline(item),
          body: summary.body,
          sources: summary.sources,
          // one result per sub-stage, so only stage-level cards get a badge
          correct: isStage && r ? r.isCorrect : null,
        });
      }
    }
  }
  return out;
}