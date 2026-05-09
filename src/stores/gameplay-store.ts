"use client";

import { create } from "zustand";

type TransitionState = "idle" | "checking" | "advancing" | "completed";

type GameplayState = {
  currentStage: number;
  score: number;
  attemptsRemaining: number;
  completed: boolean;
  transitionState: TransitionState;
  setAttempts: (attempts: number) => void;
  registerResult: (args: { correct: boolean; points: number }) => void;
  nextStage: (totalStages: number, nextAttempts: number) => void;
  reset: () => void;
};

const initialState = {
  currentStage: 0,
  score: 0,
  attemptsRemaining: 0,
  completed: false,
  transitionState: "idle" as TransitionState,
};

export const useGameplayStore = create<GameplayState>((set) => ({
  ...initialState,
  setAttempts: (attempts) => set({ attemptsRemaining: attempts }),
  registerResult: ({ correct, points }) =>
    set((state) => ({
      transitionState: "checking",
      score: correct ? state.score + points : state.score,
      attemptsRemaining: correct
        ? state.attemptsRemaining
        : Math.max(state.attemptsRemaining - 1, 0),
    })),
  nextStage: (totalStages, nextAttempts) =>
    set((state) => {
      const nextStage = state.currentStage + 1;
      const completed = nextStage >= totalStages;
      return {
        currentStage: completed ? state.currentStage : nextStage,
        attemptsRemaining: completed ? state.attemptsRemaining : nextAttempts,
        completed,
        transitionState: completed ? "completed" : "advancing",
      };
    }),
  reset: () => set(initialState),
}));
