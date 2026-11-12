"use client";

import { motion } from "framer-motion";

import type { ColorMatchClue } from "@/types/gameplay";

type Props = {
  clue: ColorMatchClue;
  isLocked: boolean;
  placedSwatch: ColorMatchClue | null;
  isDragOver: boolean;
  reveal: "correct" | "wrong" | null;
  isDraggingSwatch: boolean;
  disabled?: boolean;
  onOpen: (id: string) => void;
  onStartDrag: (
    event: React.PointerEvent<HTMLElement>,
    id: string,
    sourceCardId: string | null,
  ) => void;
};

export function ClueCard({
  clue,
  isLocked,
  placedSwatch,
  isDragOver,
  reveal,
  isDraggingSwatch,
  disabled,
  onOpen,
  onStartDrag,
}: Props) {
  const hasVisiblePlacement = Boolean(placedSwatch) && !isDraggingSwatch;
  const showColorStyle = isLocked || hasVisiblePlacement || reveal !== null;
  const background = reveal === "correct"
    ? "#85cb57"
    : reveal === "wrong"
      ? "#ec6d68"
      : isLocked
        ? clue.hex
        : hasVisiblePlacement
          ? placedSwatch?.hex ?? "#fffdf7"
          : "#fffdf7";

  return (
    <motion.button
      layoutId={`color-card-${clue.id}`}
      type="button"
      data-color-card
      data-color-id={clue.id}
      data-matched={isLocked ? "true" : "false"}
      onClick={() => {
        if (disabled) return;
        onOpen(clue.id);
      }}
      className={`relative flex min-h-[150px] flex-col items-start justify-end overflow-hidden rounded-[18px] border-[3px] border-[#0b0b0f] p-3 text-left transition-[box-shadow,background-color] ${
        isDragOver
          ? "shadow-[0_0_0_3px_#f2b84b,0_4px_0_rgba(11,11,15,0.2)]"
          : "shadow-[0_4px_0_rgba(11,11,15,0.16)]"
      } ${reveal === "correct" ? "ring-4 ring-[#5fa43a]" : ""} ${reveal === "wrong" ? "ring-4 ring-[#bf3434]" : ""}`}
      style={{ background }}
      whileTap={{ scale: 0.97 }}
    >
      <span
        className="absolute right-0 top-0 h-8 w-8"
        style={{
          background: showColorStyle ? "rgba(255,255,255,0.35)" : "#ead9a6",
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />

      <span
        className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7] text-[#0b0b0f] transition-all ${
          isLocked ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path
            d="M4 12l5 5L20 6"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span
        className={`relative w-full text-[13px] font-extrabold leading-snug ${
          showColorStyle ? "text-white" : "text-[#0b0b0f]"
        }`}
      >
        {clue.clue1}
      </span>

      <span
        className={`relative mt-2 text-[10px] font-bold uppercase tracking-wide ${
          showColorStyle ? "text-white/85" : "text-[#746a5c]"
        }`}
      >
        tap for the full story
      </span>

      {placedSwatch && !isLocked && !isDraggingSwatch ? (
        <span
          aria-hidden="true"
          onPointerDown={(event) => onStartDrag(event, placedSwatch.id, clue.id)}
          className="absolute left-2 top-2 flex h-8 w-8 touch-none cursor-grab items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-white/35 text-[#0b0b0f] active:cursor-grabbing"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M8 7h.01M8 12h.01M8 17h.01M16 7h.01M16 12h.01M16 17h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>
      ) : null}
    </motion.button>
  );
}
