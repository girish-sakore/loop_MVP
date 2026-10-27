import type { HintPlan } from "./types";

export const fullId = (group: string, hint: string) => `${group}:${hint}`;

export function revealOutcome(plan: HintPlan, used: string[], group: string, id: string): "free" | "charge" | "deny" {
  if (used.includes(id)) return "free";
  const definition = plan.groups[group];
  if (!definition) return "deny";
  const inGroup = used.filter((value) => value.startsWith(`${group}:`)).length;
  return inGroup >= definition.allowed || used.length >= plan.cap ? "deny" : "charge";
}
