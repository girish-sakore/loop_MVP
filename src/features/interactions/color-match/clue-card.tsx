"use client";

import { motion } from "framer-motion";

import type { ColorMatchClue } from "@/types/gameplay";

type Props = {
  clue: ColorMatchClue;
  isMatched: boolean;
  isDragOver: boolean;
  isShaking: boolean;
  disabled?: boolean;
  onOpen: (id: string) => void;
};

export function ClueCard({
  clue,
  isMatched,
  isDragOver,
  isShaking,
  disabled,
  onOpen,
}: Props) {
  return (
    <motion.button
      layoutId={`color-card-${clue.id}`}
      type="button"
      data-color-card
      data-color-id={clue.id}
      data-matched={isMatched ? "true" : "false"}
      onClick={() => {
        if (disabled) return;
        onOpen(clue.id);
      }}
      className={`relative flex min-h-[150px] flex-col items-start justify-end overflow-hidden rounded-[18px] border-[3px] border-[#0b0b0f] p-3 text-left transition-[box-shadow] ${
        isDragOver
          ? "shadow-[0_0_0_3px_#f2b84b,0_4px_0_rgba(11,11,15,0.2)]"
          : "shadow-[0_4px_0_rgba(11,11,15,0.16)]"
      } ${isShaking ? "animate-[clue-shake_.42s_ease]" : ""}`}
      style={{ background: isMatched ? clue.hex : "#fffdf7" }}
      whileTap={{ scale: 0.97 }}
    >
      <span
        className="absolute right-0 top-0 h-8 w-8"
        style={{
          background: isMatched ? "rgba(255,255,255,0.35)" : "#ead9a6",
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />

      <span
        className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7] text-[#0b0b0f] transition-all ${
          isMatched ? "scale-100 opacity-100" : "scale-50 opacity-0"
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
          isMatched ? "text-white" : "text-[#0b0b0f]"
        }`}
      >
        {clue.clue1}
      </span>

      <span
        className={`relative mt-2 text-[10px] font-bold uppercase tracking-wide ${
          isMatched ? "text-white/85" : "text-[#746a5c]"
        }`}
      >
        tap for the full story
      </span>
    </motion.button>
  );
}