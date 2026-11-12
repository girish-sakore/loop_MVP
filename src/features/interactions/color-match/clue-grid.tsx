"use client";

import type { ColorMatchStage } from "@/types/gameplay";

import { ClueCard } from "./clue-card";
import type { CheckReveal, ColorPlacements, DragState } from "./use-color-match-game";

type Props = {
  stage: ColorMatchStage;
  matchedIds: string[];
  placements: ColorPlacements;
  openId: string | null;
  dragOverId: string | null;
  reveal: CheckReveal;
  dragging: DragState | null;
  disabled?: boolean;
  onOpen: (id: string) => void;
  onStartDrag: (
    event: React.PointerEvent<HTMLElement>,
    id: string,
    sourceCardId: string | null,
  ) => void;
};

export function ClueGrid({
  stage,
  matchedIds,
  placements,
  openId,
  dragOverId,
  reveal,
  dragging,
  disabled,
  onOpen,
  onStartDrag,
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

          const placedSwatchId = placements[clue.id];
          const placedSwatch = stage.clues.find((item) => item.id === placedSwatchId) ?? null;

          return (
            <ClueCard
              key={clue.id}
              clue={clue}
              isLocked={matchedIds.includes(clue.id)}
              placedSwatch={placedSwatch}
              isDragOver={dragOverId === clue.id}
              reveal={
                reveal?.correctIds.includes(clue.id)
                  ? "correct"
                  : reveal?.wrongIds.includes(clue.id)
                    ? "wrong"
                    : null
              }
              isDraggingSwatch={
                dragging?.sourceCardId === clue.id && dragging.id === placedSwatchId
              }
              disabled={disabled}
              onOpen={onOpen}
              onStartDrag={onStartDrag}
            />
          );
        })}
      </div>
    </div>
  );
}
