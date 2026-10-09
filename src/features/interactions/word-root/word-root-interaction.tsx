"use client";

import { WordRootGame } from "./WordRootGame";
import type { WordRootClue, WordRootPuzzle } from "./types";
import type { Stage } from "@/types/gameplay";
import type { WordRootStage } from "@/types/gameplay";

type Props = {
  stage: Stage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

export function WordRootInteraction({
  stage,
  onAnswer,
}: Props) {
  const wordRootStage = stage as WordRootStage;
  const puzzle: WordRootPuzzle =
    wordRootStage.puzzle ?? fallbackPuzzle;

  return (
    <WordRootGame
      puzzle={puzzle}
      onClueSelect={(clue: WordRootClue) => {
        onAnswer({
          correct: true,
          feedback: `You discovered: ${clue.title} → ${clue.answer}`,
        });
      }}
    />
  );
}

const fallbackPuzzle: WordRootPuzzle = {
  cols: 10,
  rows: 10,
  root: { word: "ROOT", x: 5, y: 5 },
  clues: [],
};
