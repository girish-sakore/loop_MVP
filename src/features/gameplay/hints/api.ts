import { fullId } from "./rules";
import type { GroupApi, HintPlan, StageHints } from "./types";

const NONE: GroupApi = {
  exists: false, anonymous: false, list: [], revealed: [], usedCount: 0,
  remaining: 0, canReveal: false, reveal: () => false,
};

export function createHintsApi(plan: HintPlan, used: string[], doReveal: (id: string, group: string) => boolean): StageHints {
  return {
    total: { remaining: Math.max(plan.cap - used.length, 0) },
    group(key) {
      const definition = plan.groups[key];
      if (!definition) return NONE;
      const inGroup = used.filter((value) => value.startsWith(`${key}:`)).length;
      const revealed = definition.hints.filter((hint) => used.includes(fullId(key, hint.id)));
      const next = definition.hints.find((hint) => !used.includes(fullId(key, hint.id)));
      const remaining = Math.max(0, Math.min(definition.allowed - inGroup, plan.cap - used.length));
      return {
        exists: true, anonymous: definition.anonymous, list: definition.hints, revealed, next,
        usedCount: inGroup, remaining,
        canReveal: remaining > 0 && (definition.anonymous || !!next),
        reveal(hintId) {
          const id = definition.anonymous ? (hintId ?? `auto${inGroup}`) : (hintId ?? next?.id);
          return id ? doReveal(fullId(key, id), key) : false;
        },
      };
    },
  };
}
