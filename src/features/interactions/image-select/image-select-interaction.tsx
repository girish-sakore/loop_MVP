"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ImageSelectStage } from "@/types/gameplay";

type Props = {
  stage: ImageSelectStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number; // increments on each retry → resets selection
  showIntro?: boolean;
  onIntroComplete?: () => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
};

const DEFAULT_HINTS = 3;

export function ImageSelectInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
  hintsRemaining = DEFAULT_HINTS,
  onUseHint,
}: Props) {
  const [selection, setSelection] = useState<{
    retryCount: number;
    optionId: string | null;
    submitted: boolean;
  }>({ retryCount, optionId: null, submitted: false });

  // Tracks whether the hint has been spent for this attempt (keyed by retryCount,
  // same pattern as `selection`), and whether the popup is currently open.
  const [hintState, setHintState] = useState<{ retryCount: number; used: boolean }>({
    retryCount,
    used: false,
  });
  const [showHintPopup, setShowHintPopup] = useState(false);

  const selected =
    selection.retryCount === retryCount ? selection.optionId : null;
  const isSubmitted =
    selection.retryCount === retryCount ? selection.submitted : false;
  const hintUsedThisAttempt =
    hintState.retryCount === retryCount ? hintState.used : false;

  function startGame() {
    if (disabled) return;
    onIntroComplete?.();
  }

  function handleSelect(optionId: string) {
    if (disabled || isSubmitted) return;
    setSelection({ retryCount, optionId, submitted: false });
  }

  function handleCheckGuess() {
    if (disabled || !selected || isSubmitted) return;
    const option = stage.options.find((opt) => opt.id === selected);
    if (!option) return;

    setSelection({ retryCount, optionId: selected, submitted: true });
    onAnswer({ correct: option.isCorrect, feedback: option.feedback });
  }

  function openHint() {
    if (disabled || isSubmitted || !stage.hint) return;

    // Only spend a hint (and notify parent) the first time it's opened
    // for this attempt. Re-opening the popup afterwards is free.
    if (!hintUsedThisAttempt) {
      if (hintsRemaining <= 0) return;
      setHintState({ retryCount, used: true });
      onUseHint?.();
    }
    setShowHintPopup(true);
  }

  function closeHint() {
    setShowHintPopup(false);
  }

  if (showIntro) {
    return (
      <ImageSelectIntro
        title={stage.question}
        options={stage.options}
        onStart={startGame}
      />
    );
  }

  // A hint can be opened if: not submitted, stage has hint text, and either
  // it's already been used this attempt (free reopen) or hints remain.
  const canOpenHint =
    !disabled && !isSubmitted && !!stage.hint && (hintUsedThisAttempt || hintsRemaining > 0);

  return (
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] px-4 pb-4 pt-4 text-[#0b0b0f]">
      <div className="flex shrink-0 flex-col items-center gap-2 text-center">
        <span
          className="inline-flex rounded-full border-[3px] border-[#0b0b0f] bg-[#f7d91f] px-4 py-1 text-[11px] font-extrabold uppercase shadow-[0_3px_0_#0b0b0f]"
          style={{ color: "var(--on-surface)" }}
        >
          Visual Cognition
        </span>
        <h1
          className="font-display max-w-[360px] text-[27px] leading-none"
          style={{ color: "var(--on-surface)" }}
        >
          {stage.question}
        </h1>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 pt-4">
        {stage.options.map((option, index) => {
          const isSelected = selected === option.id;
          const showResult = isSubmitted && isSelected;
          const isOddLast =
            stage.options.length % 2 === 1 && index === stage.options.length - 1;

          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(option.id)}
              disabled={disabled || isSubmitted}
              className={`relative min-h-0 overflow-hidden rounded-md border border-[#0b0b0f] text-left shadow-[0_5px_0_rgba(11,11,15,0.16)] transition-all duration-200 ${
                isOddLast
                  ? "col-span-2 grid grid-cols-[44%_minmax(0,1fr)]"
                  : "flex flex-col"
              }`}
              style={{
                backgroundColor:
                  showResult && option.isCorrect
                    ? "var(--secondary-container)"
                    : showResult && !option.isCorrect
                    ? "var(--error-container)"
                    : isSelected
                    ? "#eef6dd"
                    : "var(--surface-container-lowest)",
                boxShadow:
                  showResult && option.isCorrect
                    ? "0 6px 0 #0b0b0f, 0 0 0 4px var(--secondary)"
                    : showResult && !option.isCorrect
                    ? "0 6px 0 #0b0b0f, 0 0 0 4px var(--error)"
                    : isSelected
                    ? "0 6px 0 #0b0b0f, 0 0 0 3px #0b0b0f"
                    : "0 6px 0 #0b0b0f",
              }}
            >
              <div
                className={`flex min-h-0 w-full items-center justify-center overflow-hidden border-[#0b0b0f] ${
                  isOddLast ? "h-full border-r" : "flex-1 border-b"
                }`}
                style={{ backgroundColor: "var(--surface-container-high)" }}
              >
                {option.image ? (
                  <img
                    src={option.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[48px]">
                    image
                  </span>
                )}
              </div>

              <div className="flex min-h-[58px] items-center justify-between gap-2 px-3 py-2">
                <span
                  className="min-w-0 text-[15px] font-extrabold leading-tight"
                  style={{ color: "var(--on-surface)" }}
                >
                  {option.label}
                </span>
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{
                    fontSize: 20,
                    color:
                      showResult && option.isCorrect
                        ? "var(--secondary)"
                        : showResult && !option.isCorrect
                        ? "var(--error)"
                        : isSelected
                        ? "#0b0b0f"
                        : "var(--outline)",
                    fontVariationSettings:
                      showResult || isSelected ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {showResult && option.isCorrect
                    ? "check_circle"
                    : showResult && !option.isCorrect
                    ? "cancel"
                    : isSelected
                    ? "radio_button_checked"
                    : "radio_button_unchecked"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mx-auto flex w-full max-w-[366px] gap-2 pt-3 pb-1 shrink-0">
        <button
          type="button"
          onClick={handleCheckGuess}
          disabled={disabled || !selected || isSubmitted}
          className="h-12 flex-1 rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[15px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none"
        >
          Guess
        </button>

        {stage.hint ? (
          <button
            type="button"
            onClick={openHint}
            disabled={!canOpenHint}
            className="relative h-12 w-[64px] rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-[15px] font-extrabold transition active:scale-95 disabled:opacity-50"
          >
            Hint
            {hintsRemaining > 0 && !hintUsedThisAttempt && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#ffb1bd] text-[10px] font-extrabold">
                {hintsRemaining}
              </span>
            )}
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {showHintPopup && stage.hint ? (
          <HintPopup text={stage.hint} onClose={closeHint} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function HintPopup({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-[320px] rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-5 shadow-[0_8px_0_#0b0b0f]"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#f7d91f]">
            <span className="material-symbols-outlined text-[18px]">
              lightbulb
            </span>
          </span>
          <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#343238]">
            Hint
          </span>
        </div>
        <p className="text-[15px] font-semibold leading-snug text-[#0b0b0f]">
          {text}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 h-10 w-full rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[14px] font-extrabold text-[#0b0b0f] shadow-[0_3px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-none"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

function ImageSelectIntro({
  title,
  options,
  onStart,
}: {
  title: string;
  options: ImageSelectStage["options"];
  onStart: () => void;
}) {
  const previewOptions = options.slice(0, 3);

  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#4aa8ee] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18px 18px, rgba(255,253,247,0.45) 0 5px, transparent 6px), radial-gradient(circle at 72px 54px, rgba(247,217,31,0.55) 0 7px, transparent 8px)",
          backgroundPosition: "center",
          backgroundSize: "96px 96px",
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
          className="mb-7 inline-flex rounded-full border-[3px] border-[#0b0b0f] bg-[#f7d91f] px-4 py-1 text-[11px] font-extrabold uppercase shadow-[0_4px_0_#0b0b0f]"
        >
          Visual Cognition
        </motion.div>

        <div className="relative mb-8 h-[230px] w-full max-w-[360px]">
          {previewOptions.map((option, index) => {
            const transforms = [
              "left-1 top-7 rotate-[-7deg]",
              "left-1/2 top-0 z-10 -translate-x-1/2 rotate-[2deg]",
              "right-1 top-12 rotate-[7deg]",
            ];

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20, scale: 0.86 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.12 + index * 0.09,
                  duration: 0.34,
                  ease: [0.2, 0.9, 0.2, 1],
                }}
                className={`absolute h-[172px] w-[132px] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_7px_0_#0b0b0f] ${transforms[index]}`}
              >
                <div className="h-[118px] border-b-[3px] border-[#0b0b0f] bg-[#eadfd1]">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="material-symbols-outlined text-[42px]">
                        image
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex h-[51px] items-center px-2">
                  <span className="line-clamp-2 text-[13px] font-extrabold leading-tight">
                    {option.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.28 }}
          className="mb-10 text-center"
        >
          <h1 className="font-display mx-auto max-w-[360px] text-[30px] leading-none">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-[340px] text-[15px] font-semibold leading-snug text-[#1f2933]">
            Study the pictures, spot the visual clue, and choose the image that
            matches the prompt.
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0 #0b0b0f" }}
        transition={{ delay: 0.56, duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
        className="relative h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#0b0b0f] text-[16px] font-extrabold text-white shadow-[0_6px_0_rgba(11,11,15,0.25)]"
      >
        Play
      </motion.button>
    </div>
  );
}