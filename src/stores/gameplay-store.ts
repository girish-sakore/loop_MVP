"use client";

// stores/gameplay-store.ts

import { create } from "zustand";
import { DEFAULT_HINT_BUDGET, type GameplaySnapshot, type InteractionState } from "@/features/gameplay/progress/resume";

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
  hintsRemaining: number;
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
  consumeHint: () => void;
  /** A remote device spent hints: lower our count, never raise it. */
  applyRemoteHints: (remaining: number) => void;
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
  hintsRemaining: DEFAULT_HINT_BUDGET,
  updatedAt: 0,
  interactionState: {} as Record<string, InteractionState>,
};

// Strictly increasing on this device, so "which edit was last" is never a tie.
const stamp = (previous: number) => Math.max(Date.now(), previous + 1);

export const useGameplayStore = create<GameplayState>((set) => ({
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
      hintsRemaining: s.hintsRemaining,
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

  consumeHint: () =>
    set((state) => ({ hintsRemaining: Math.max(state.hintsRemaining - 1, 0), updatedAt: stamp(state.updatedAt) })),

  applyRemoteHints: (remaining) => set((state) => ({ hintsRemaining: Math.min(state.hintsRemaining, remaining) })),

  reset: () => set(initialState),
}));