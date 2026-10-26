"use client";

// stores/gameplay-store.ts

import { create } from "zustand";
import {
  countHints,
  unionHintsUsed,
  type GameplaySnapshot,
  type HintsUsed,
  type InteractionState,
} from "@/features/gameplay/progress/resume";
import { revealOutcome } from "@/features/gameplay/hints/rules";
import type { HintPlan } from "@/features/gameplay/hints/types";

type TransitionState = "idle" | "checking" | "advancing" | "completed";

type GameplayState = {
  currentStage: number;
  score: number;
  attemptsRemaining: number;
  completed: boolean;
  transitionState: TransitionState;
  totalAnswers: number;
  correctAnswers: number;
  stagePassed: boolean;
  hintsUsed: HintsUsed;
  updatedAt: number;
  interactionState: Record<string, InteractionState>;
  // Actions
  restore: (snapshot: GameplaySnapshot) => void;
  setAttempts: (attempts: number) => void;
  setStage: (stage: number) => void;
  registerResult: (args: { correct: boolean; points: number; totalAnswers?: number; correctAnswers?: number }) => void;
  nextStage: (totalStages: number, nextAttempts: number) => void;
  setInteractionState: (stageId: string, state: InteractionState) => void;
  clearInteractionState: (stageId: string) => void;
  revealHint: (bucket: string, id: string, group: string, plan: HintPlan) => boolean;
  applyRemoteHints: (remote: HintsUsed) => void;
  reset: () => void;
};

const initialState = {
  currentStage: 0,
  score: 0,
  attemptsRemaining: 0,
  completed: false,
  transitionState: "idle" as TransitionState,
  totalAnswers: 0,
  correctAnswers: 0,
  stagePassed: false,
  hintsUsed: {} as HintsUsed,
  updatedAt: 0,
  interactionState: {} as Record<string, InteractionState>,
};

// Strictly increasing on this device, so "which edit was last" is never a tie.
const stamp = (previous: number) => Math.max(Date.now(), previous + 1);

export const useGameplayStore = create<GameplayState>((set, get) => ({
  ...initialState,

  restore: (s) =>
    set({
      ...initialState,
      currentStage: s.currentStage,
      attemptsRemaining: s.attemptsRemaining,
      score: s.score,
      correctAnswers: s.correctAnswers,
      totalAnswers: s.totalAnswers,
      stagePassed: s.stagePassed,
      hintsUsed: s.hintsUsed,
      updatedAt: s.updatedAt,
      interactionState: s.interactionState,
    }),

  setAttempts: (attempts) => set((s) => ({ attemptsRemaining: attempts, updatedAt: stamp(s.updatedAt) })),
  setStage: (stage) => set((s) => ({ currentStage: stage, updatedAt: stamp(s.updatedAt) })),

  registerResult: ({ correct, points, totalAnswers = 1, correctAnswers = correct ? 1 : 0 }) =>
    set((state) => ({
      transitionState: "checking",
      stagePassed: correct,
      score: correct ? state.score + points : state.score,
      attemptsRemaining: correct ? state.attemptsRemaining : Math.max(state.attemptsRemaining - 1, 0),
      totalAnswers: state.totalAnswers + totalAnswers,
      correctAnswers: state.correctAnswers + correctAnswers,
      updatedAt: stamp(state.updatedAt),
    })),

  nextStage: (totalStages, nextAttempts) =>
    set((state) => {
      const nextStage = state.currentStage + 1;
      const completed = nextStage >= totalStages;
      return {
        currentStage: completed ? state.currentStage : nextStage,
        attemptsRemaining: completed ? state.attemptsRemaining : nextAttempts,
        stagePassed: completed ? state.stagePassed : false,
        completed,
        transitionState: completed ? "completed" : "advancing",
        interactionState: completed ? state.interactionState : {},
        updatedAt: stamp(state.updatedAt),
      };
    }),

  setInteractionState: (stageId, s) =>
    set((state) => ({
      interactionState: { ...state.interactionState, [stageId]: s },
      updatedAt: stamp(state.updatedAt),
    })),

  clearInteractionState: (stageId) =>
    set((state) => {
      const rest = { ...state.interactionState };
      delete rest[stageId];
      return { interactionState: rest, updatedAt: stamp(state.updatedAt) };
    }),

  revealHint: (bucket, id, group, plan) => {
    const used = get().hintsUsed[bucket] ?? [];
    const outcome = revealOutcome(plan, used, group, id);
    if (outcome === "deny") return false;
    if (outcome === "charge") set((state) => ({
      hintsUsed: { ...state.hintsUsed, [bucket]: [...used, id] },
      updatedAt: stamp(state.updatedAt),
    }));
    return true;
  },

  applyRemoteHints: (remote) =>
    set((state) => {
      const next = unionHintsUsed(state.hintsUsed, remote);
      return countHints(next) === countHints(state.hintsUsed) ? state : { hintsUsed: next };
    }),

  reset: () => set(initialState),
}));
