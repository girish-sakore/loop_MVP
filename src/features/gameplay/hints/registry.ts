import type { Stage, StageType } from "@/types/gameplay";
import type { HintDef, HintGroup, HintPlan } from "./types";

export const STAGE_GROUP = "_";
type Hinted = { id?: string; hints?: HintDef[]; hint?: string; hintsAllowed?: number };

const ITEMS: Partial<Record<StageType, (stage: Stage) => Array<Hinted & { id: string }>>> = {
  "fill-blank": (stage) => (stage as Extract<Stage, { type: "fill-blank" }>).blanks,
  "fill-blank-text": (stage) => (stage as Extract<Stage, { type: "fill-blank-text" }>).blanks,
  "clue-connect": (stage) => (stage as Extract<Stage, { type: "clue-connect" }>).cases,
};
const DECK = new Set<StageType>(["fill-blank-text"]);
const STAGE_DEFAULT: Partial<Record<StageType, number>> = {
  "image-text-answer": 1,
  // Existing Timeline stages predate hintsAllowed. Keep their anonymous board
  // hints available while authored stages can still set a different quota.
  "timeline-builder": 2,
};

export const usageKey = (stage: Stage) => (DECK.has(stage.type) ? "_deck" : stage.id);
export const groupKey = (stage: Stage, itemId: string) =>
  DECK.has(stage.type) ? `${stage.id}.${itemId}` : itemId;

function toGroup(key: string, item: Hinted, fallback = 0): HintGroup | null {
  const hints = item.hints ?? (item.hint ? [{ id: "h1", text: item.hint }] : []);
  const wanted = item.hintsAllowed ?? (hints.length || fallback);
  const allowed = hints.length ? Math.min(wanted, hints.length) : wanted;
  return allowed > 0 ? { key, hints, allowed, anonymous: hints.length === 0 } : null;
}

const cache = new WeakMap<Stage, HintPlan>();

export function buildHintPlan(stage: Stage, all: Stage[] = [stage]): HintPlan {
  const hit = cache.get(stage);
  if (hit) return hit;
  const groups: Record<string, HintGroup> = {};
  let cap: number;
  const items = ITEMS[stage.type];

  if (items) {
    const deck = DECK.has(stage.type);
    const cards = deck ? all.filter((item) => item.type === stage.type) : [stage];
    let sum = 0;
    for (const card of cards) {
      for (const item of items(card)) {
        const group = toGroup(groupKey(card, item.id), item);
        if (group) {
          groups[group.key] = group;
          sum += group.allowed;
        }
      }
    }
    cap = deck ? sum : Math.min(stage.hintsAllowed ?? sum, sum);
  } else {
    const group = toGroup(STAGE_GROUP, stage, STAGE_DEFAULT[stage.type] ?? 0);
    if (group) groups[STAGE_GROUP] = group;
    cap = group?.allowed ?? 0;
  }

  const plan = { groups, cap };
  cache.set(stage, plan);
  return plan;
}
