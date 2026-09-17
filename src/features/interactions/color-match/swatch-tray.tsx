"use client";

import type { ColorMatchStage } from "@/types/gameplay";

import type { DragState } from "./use-color-match-game";

type Props = {
  stage: ColorMatchStage;
  matchedIds: string[];
  dragging: DragState | null;
  onStartDrag: (event: React.PointerEvent<HTMLDivElement>, id: string) => void;
};

export function SwatchTray({
  stage,
  matchedIds,
  dragging,
  onStartDrag,
}: Props) {
  return (
    <div
      data-swatch-tray
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-[#0b0b0f] bg-[#f6f2ec] px-5 pt-3 shadow-[0_-4px_16px_rgba(11,11,15,0.09)]"
      style={{
        paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[430px]">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-[#343238]">
          drag a color to its clue
        </p>

        <div className="flex min-h-[52px] flex-wrap items-center justify-center gap-3">
          {stage.clues.map((clue) => {
            const isMatched = matchedIds.includes(clue.id);

            if (isMatched) {
              return (
                <span
                  key={clue.id}
                  aria-hidden="true"
                  className="h-12 w-12 rounded-full border-[3px] border-[#0b0b0f]"
                  style={{
                    background: clue.hex,
                    visibility: "hidden",
                  }}
                />
              );
            }

            return (
              <div
                key={clue.id}
                role="button"
                aria-label={`Drag ${clue.name} to its clue`}
                onPointerDown={(event) => onStartDrag(event, clue.id)}
                className={`h-12 w-12 rounded-full border-[3px] border-[#0b0b0f] transition-all ${
                  dragging?.id === clue.id
                    ? "pointer-events-none opacity-30"
                    : "cursor-grab active:cursor-grabbing active:scale-95"
                }`}
                style={{
                  background: clue.hex,
                  boxShadow:
                    "inset 0 0 0 3px rgba(255,255,255,0.35), 0 2px 5px rgba(11,11,15,0.18)",
                  touchAction: "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}