"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// import Image from "next/image";
import type { ImageSelectStage } from "@/types/gameplay";

type Props = {
  stage: ImageSelectStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number; // increments on each retry → resets selection
};

export function ImageSelectInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Track previous props to reset selection synchronously during render
  const [resetKey, setResetKey] = useState({ stage, retryCount });

  // Reset selection whenever retryCount or stage changes (removes useEffect warning)
  if (resetKey.stage !== stage || resetKey.retryCount !== retryCount) {
    setResetKey({ stage, retryCount });
    setSelected(null);
  }

  function handleSelect(optionId: string, correct: boolean, feedback: string) {
    if (disabled || selected) return;
    setSelected(optionId);
    onAnswer({ correct, feedback });
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="text-center flex flex-col gap-1">
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--secondary)" }}
        >
          Visual Cognition
        </span>
        <h1
          className="text-[22px] font-bold leading-snug"
          style={{ color: "var(--on-surface)" }}
        >
          {stage.question}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stage.options.map((option) => {
          const isSelected = selected === option.id;
          const showResult = isSelected;

          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                handleSelect(option.id, option.isCorrect, option.feedback)
              }
              disabled={disabled || !!selected}
              className="relative rounded-xl p-3 text-left transition-all duration-200 flex flex-col gap-3"
              style={{
                backgroundColor:
                  showResult && option.isCorrect
                    ? "var(--secondary-container)"
                    : showResult && !option.isCorrect
                    ? "var(--error-container)"
                    : "var(--surface-container-low)",
                boxShadow:
                  showResult && option.isCorrect
                    ? "0 0 0 3px var(--secondary)"
                    : showResult && !option.isCorrect
                    ? "0 0 0 3px var(--error)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="aspect-square w-full rounded-lg overflow-hidden"
                style={{ backgroundColor: "var(--surface-container-high)" }}
              >
                {/* <Image
                  src={option.image}
                  alt={option.label}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                /> */}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-[14px] font-semibold leading-tight"
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
                        : "var(--outline)",
                    fontVariationSettings:
                      showResult ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {showResult && option.isCorrect
                    ? "check_circle"
                    : showResult && !option.isCorrect
                    ? "cancel"
                    : "radio_button_unchecked"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}