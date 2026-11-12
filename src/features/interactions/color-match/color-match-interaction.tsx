"use client";

import type { ColorMatchStage } from "@/types/gameplay";

import { ClueGrid } from "./clue-grid";
import { ColorMatchHeader } from "./color-match-header";
import { ColorMatchIntro } from "./color-match-intro";
import { DraggedSwatch } from "./dragged-swatch";
import { ExpandedClueCard } from "./expanded-clue-card";
import { SwatchTray } from "./swatch-tray";
import { useColorMatchGame } from "./use-color-match-game";
import { WinBanner } from "./win-banner";

type Props = {
  stage: ColorMatchStage;
  onAnswer: (payload: {
    correct: boolean;
    feedback: string;
    results: Array<{ questionId: string; isCorrect: boolean; points: number }>;
  }) => void;
  disabled?: boolean;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

export function ColorMatchInteraction({
  stage,
  onAnswer,
  disabled,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const game = useColorMatchGame({ stage, onAnswer, disabled });

  if (showIntro) {
    return (
      <ColorMatchIntro
        stage={stage}
        onStart={() => {
          if (disabled) return;
          onIntroComplete?.();
        }}
      />
    );
  }

  return (
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] text-[#0b0b0f]">
      <ColorMatchHeader
        stage={stage}
        matchedIds={game.matchedIds}
        matchedCount={game.matchedCount}
        total={game.total}
      />

      <ClueGrid
        stage={stage}
        matchedIds={game.matchedIds}
        openId={game.openId}
        dragOverId={game.dragOverId}
        placements={game.placements}
        reveal={game.reveal}
        dragging={game.dragging}
        disabled={disabled}
        onOpen={game.setOpenId}
        onStartDrag={game.startDrag}
      />

      <SwatchTray
        stage={stage}
        matchedIds={game.matchedIds}
        placements={game.placements}
        dragging={game.dragging}
        onStartDrag={game.startDrag}
        onCheck={game.checkPlacements}
        canCheck={game.canCheck}
        checking={game.checking}
        disabled={disabled}
      />

      <DraggedSwatch dragging={game.dragging} label={game.label} />

      <ExpandedClueCard
        stage={stage}
        clue={game.openClue}
        isMatched={game.openClueMatched}
        disabled={disabled}
        onClose={() => {
          if (disabled) return;
          game.setOpenId(null);
        }}
      />

      <WinBanner show={game.showWin} />
    </div>
  );
}
