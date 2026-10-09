"use client";

import type { WordRootPuzzle } from "../types";
import { GameBoard } from "./GameBoard";

interface GameViewportProps {
  puzzle: WordRootPuzzle;
  onClueSelect?: (clue: import("../types").WordRootClue) => void;
}

export function GameViewport({ puzzle, onClueSelect }: GameViewportProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <GameBoard puzzle={puzzle} onClueSelect={onClueSelect} />
    </div>
  );
}
