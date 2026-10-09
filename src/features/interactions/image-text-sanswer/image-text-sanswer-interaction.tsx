"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ImageTextSAnswerStage } from "@/types/gameplay";
import { FillBlankTextHintPopup } from "@/features/interactions/fill-blank-text/fill-blank-text-hint-popup";

type Props = {
  stage: ImageTextSAnswerStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
};

export function ImageTextSAnswerInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
  hintsRemaining = 3,
  onUseHint,
}: Props) {
  const [guess, setGuess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);

  // Reset state when retryCount changes
  useEffect(() => {
    setGuess("");
    setIsSubmitted(false);
    setActiveHint(null);
    setHintVisible(false);
  }, [retryCount]);

  function handleCheckGuess() {
    if (disabled || !guess.trim() || isSubmitted) return;

    const correct = guess.toLowerCase().trim() === stage.answer.toLowerCase().trim();
    setIsSubmitted(true);
    onAnswer({ correct, feedback: correct ? "Correct!" : "Not quite. Try again!" });
  }

  function handleHint() {
    if (disabled || !onUseHint || hintsRemaining <= 0) return;

    const hint = stage.hint || `Hint: The answer starts with "${stage.answer.charAt(0).toUpperCase()}".`;
    setActiveHint(hint);
    setHintVisible(true);
    onUseHint?.();
  }

  if (showIntro) {
    return (
      <ImageTextSAnswerIntro
        title={stage.question}
        image={stage.image}
        onStart={onIntroComplete}
      />
    );
  }

  return (
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#FDF9F1] px-4 pb-4 pt-4 text-[#2B2A25]">
      <div className="flex shrink-0 flex-col items-center gap-4 text-center">
        <span
          className="inline-flex rounded-full border-[3px] border-[#2B2A25] bg-[#53BCD1] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_#2B2A25]"
          style={{ color: "var(--on-surface)" }}
        >
          {stage.introLabel ?? "Visual Guess"}
        </span>
        <h1
          className="font-display max-w-[360px] text-[27px] leading-none mb-3"
          style={{ color: "#2B2A25" }}
        >
          {stage.question}
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative max-h-[60vh] max-w-[320px] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_8px_0_rgba(11,11,15,0.16)]"
        >
          {stage.image ? (
            <img
              src={stage.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center">
              <span className="material-symbols-outlined text-[64px] text-[#0b0b0f]">
                image
              </span>
            </div>
          )}
        </motion.div>

        <div className="w-full max-w-[340px]">
          <label
            htmlFor="guess-input"
            className="mb-2 block text-[14px] font-bold text-[#0b0b0f]"
          >
            What is this place or what does it show?
          </label>
          <input
            id="guess-input"
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheckGuess()}
            disabled={disabled || isSubmitted}
            placeholder="Type your answer..."
            className="h-12 w-full rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 text-[16px] font-semibold text-[#0b0b0f] placeholder:text-[#b7afa4] transition-all focus:border-[#0b0b0f] focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mx-auto mt-5 flex w-full max-w-[380px] shrink-0 gap-2 border-t-[3px] border-[#2B2A25] bg-[#FDF9F1] pt-4 pb-2">
        <button
          type="button"
          onClick={handleCheckGuess}
          disabled={disabled || !guess.trim() || isSubmitted}
          className="h-12 flex-1 rounded-full border-[3px] border-[#2B2A25] bg-[#FBAE4B] text-[15px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[0_2px_0_#2B2A25] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none"
        >
          Guess
        </button>
        <button
          type="button"
          onClick={handleHint}
          disabled={disabled || hintsRemaining <= 0}
          className="relative h-12 w-[64px] rounded-full border-[3px] border-[#2B2A25] bg-[#FFFDF7] text-[15px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:scale-95 disabled:opacity-50"
        >
          Hint
          {hintsRemaining > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2B2A25] bg-[#E8933A] text-[10px] font-extrabold text-white">
              {hintsRemaining}
            </span>
          )}
        </button>
      </div>

      <FillBlankTextHintPopup
        open={hintVisible}
        hint={activeHint}
        onClose={() => setHintVisible(false)}
      />
    </div>
  );
}

function ImageTextSAnswerIntro({
  title,
  image,
  onStart,
}: {
  title: string;
  image?: string;
  onStart?: () => void;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#4aa8ee] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
          className="mb-4 h-[200px] w-full max-w-[280px] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_8px_0_rgba(11,11,15,0.16)]"
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-[#0b0b0f]">
                image
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.28 }}
          className="mb-6 text-center"
        >
          <h1 className="font-display mx-auto max-w-[340px] text-[28px] leading-none">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[15px] font-semibold leading-snug text-[#1f2933]">
            Look at the image carefully and guess what it shows or what place it represents.
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => onStart?.()}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0 #0b0b0f" }}
        transition={{ delay: 0.36, duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
        className="relative h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#0b0b0f] text-[16px] font-extrabold text-white shadow-[0_6px_0_rgba(11,11,15,0.25)]"
      >
        Start
      </motion.button>
    </div>
  );
}