"use client";

import { useCallback } from "react";
import type { WordRootClue, WordRootPuzzle } from "./types";
import { GameViewport } from "./components/GameViewport";

interface WordRootGameProps {
  puzzle: WordRootPuzzle;
  onClueSelect?: (clue: WordRootClue) => void;
}

export function WordRootGame({ puzzle, onClueSelect }: WordRootGameProps) {
  const handleClueSelect = useCallback(
    (clue: WordRootClue) => {
      onClueSelect?.(clue);
    },
    [onClueSelect],
  );

  return (
    <div className="relative h-full w-full">
      <GameViewport puzzle={puzzle} onClueSelect={handleClueSelect} />
    </div>
  );
}
