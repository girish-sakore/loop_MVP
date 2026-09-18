"use client";

import type { ColorMatchStage } from "@/types/gameplay";

import { ClueCard } from "./clue-card";

type Props = {
  stage: ColorMatchStage;
  matchedIds: string[];
  openId: string | null;
  dragOverId: string | null;
  shakingId: string | null;
  disabled?: boolean;
  onOpen: (id: string) => void;
};

export function ClueGrid({
  stage,
  matchedIds,
  openId,
  dragOverId,
  shakingId,
  disabled,
  onOpen,
}: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[128px] pt-1">
      <div className="grid grid-cols-2 gap-3">
        {stage.clues.map((clue) => {
          // The card that's currently expanded leaves an empty placeholder
          // in the grid so the shared layoutId animation has somewhere to
          // animate from/to.
          if (openId === clue.id) {
            return (
              <div key={clue.id} aria-hidden="true" className="min-h-[150px] rounded-[18px]" />
            );
          }

          return (
            <ClueCard
              key={clue.id}
              clue={clue}
              isMatched={matchedIds.includes(clue.id)}
              isDragOver={dragOverId === clue.id}
              isShaking={shakingId === clue.id}
              disabled={disabled}
              onOpen={onOpen}
            />
          );
        })}
      </div>
    </div>
  );
}
