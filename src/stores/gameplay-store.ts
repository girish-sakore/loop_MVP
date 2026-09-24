"use client";

import { create } from "zustand";
import type { GameplaySnapshot } from "@/features/gameplay/progress/resume";

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
  // Actions
  restore: (snapshot: GameplaySnapshot) => void;
  setAttempts: (attempts: number) => void;
  setStage: (stage: number) => void;
  registerResult: (args: { correct: boolean; points: number; totalAnswers?: number; correctAnswers?: number }) => void;
  nextStage: (totalStages: number, nextAttempts: number) => void;
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
};

export const useGameplayStore = create<GameplayState>((set) => ({
  ...initialState,
  restore: (snapshot) => set({ ...initialState, ...snapshot }),
  setAttempts: (attempts) => set({ attemptsRemaining: attempts }),
  setStage: (stage) => set({ currentStage: stage }),
  registerResult: ({ correct, points, totalAnswers = 1, correctAnswers = correct ? 1 : 0 }) =>
    set((state) => ({
      transitionState: "checking",
      stagePassed: correct,
      score: correct ? state.score + points : state.score,
      attemptsRemaining: correct
        ? state.attemptsRemaining
        : Math.max(state.attemptsRemaining - 1, 0),
      totalAnswers: state.totalAnswers + totalAnswers,
      correctAnswers: state.correctAnswers + correctAnswers,
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
      };
    }),
  reset: () => set(initialState),
}));