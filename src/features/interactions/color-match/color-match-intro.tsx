"use client";

import { motion } from "framer-motion";

import type { ColorMatchStage } from "@/types/gameplay";

type Props = {
  stage: ColorMatchStage;
  onStart: () => void;
};

export function ColorMatchIntro({ stage, onStart }: Props) {
  const previewClues = stage.clues.slice(0, 2);
  const heroClue = stage.clues[0];

  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#f6f2ec] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative mb-10 h-[280px] w-full max-w-[390px]">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div
              className="h-full w-full rounded-full border-[3px] border-[#0b0b0f] shadow-[0_10px_0_rgba(11,11,15,0.22)]"
              style={{
                background: heroClue?.hex ?? "#f7d91f",
                boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.35), 0 10px 0 rgba(11,11,15,0.22)",
              }}
            />
          </motion.div>

          {previewClues.map((clue, index) => (
            <motion.div
              key={clue.id}
              className="absolute flex h-[92px] w-[126px] flex-col justify-end rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-3 pb-2.5 pt-3 shadow-[0_5px_0_rgba(11,11,15,0.18)]"
              style={{
                left: index === 0 ? "4%" : "58%",
                top: index === 0 ? "24%" : "8%",
                rotate: index === 0 ? -9 : 7,
              }}
              initial={{ opacity: 0, y: 24, rotate: (index === 0 ? -9 : 7) - 5 }}
              animate={{
                opacity: 1,
                y: [0, -8, 0],
                rotate: [index === 0 ? -9 : 7, (index === 0 ? -9 : 7) + 3, index === 0 ? -9 : 7],
              }}
              transition={{
                opacity: { duration: 0.24, delay: index * 0.12 },
                y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <span
                className="absolute right-0 top-0 h-6 w-6"
                style={{
                  background: clue.hex,
                  clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                }}
              />
              <span className="line-clamp-3 text-[11px] font-extrabold leading-snug">
                {clue.clue1}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.3 }}
        >
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
            {stage.introLabel ?? "Colors"}
          </p>
          <h1 className="font-display text-[36px] leading-none">{stage.question}</h1>
          <p className="mx-auto mt-3 max-w-[310px] text-[15px] font-semibold leading-snug text-[#343238]">
            {stage.prompt}
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        className="relative h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f]"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0 #0b0b0f" }}
        transition={{ delay: 0.46, duration: 0.3 }}
      >
        Play
      </motion.button>
    </div>
  );
}
