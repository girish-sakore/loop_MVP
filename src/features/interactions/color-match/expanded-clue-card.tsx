"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { ColorMatchClue, ColorMatchStage } from "@/types/gameplay";

type Props = {
  stage: ColorMatchStage;
  clue: ColorMatchClue | null;
  isMatched: boolean;
  disabled?: boolean;
  onClose: () => void;
};

export function ExpandedClueCard({
  stage,
  clue,
  isMatched,
  disabled,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {clue ? (
        <>
          {/* Backdrop */}
          <motion.div
            key="color-backdrop"
            className="fixed inset-0 z-[90]"
            style={{ backgroundColor: "rgba(11,11,15,0.65)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (disabled) return;
              onClose();
            }}
          />

          {/* Modal positioning layer */}
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
            {/* Expanded card */}
            <motion.div
              key="color-expanded"
              layoutId={`color-card-${clue.id}`}
              className="pointer-events-auto relative rounded-[22px] border-[3px] border-[#0b0b0f] p-5"
              style={{
                width: "min(86vw, 380px)",
                maxHeight: "78vh",
                background: isMatched ? clue.hex : "#fffdf7",
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute -left-2 -top-2 z-50 flex h-7 w-7 items-center justify-center rounded-full text-[18px] font-extrabold leading-none transition active:scale-90"
                style={{
                  background: isMatched
                    ? "rgba(255,255,255,0.5)"
                    : "#fffdf7",
                  color: "#0b0b0f",
                  border: "2px solid #0b0b0f",
                }}
              >
                ✕
              </button>

              {/* Scrollable content */}
              <div className="max-h-[calc(78vh-40px)] overflow-y-auto">
                <div className="flex items-center gap-3 pt-5">
                  <span
                    className="h-12 w-12 shrink-0 rounded-full border-[3px] border-[#0b0b0f]"
                    style={{
                      background: isMatched ? clue.hex : "#fffdf7",
                      boxShadow: isMatched
                        ? "inset 0 0 0 3px rgba(255,255,255,0.35), 0 3px 0 rgba(11,11,15,0.18)"
                        : "0 3px 0 rgba(11,11,15,0.18)",
                    }}
                  />

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
                      {stage.introLabel ?? "Colors"}
                    </p>

                    <p
                      className="font-display text-[22px] leading-none"
                      style={{
                        color: isMatched ? "#fff" : "#0b0b0f",
                      }}
                    >
                      {isMatched ? clue.name : "A Color Story"}
                    </p>
                  </div>
                </div>

                <p
                  className="mt-4 text-[14px] font-bold leading-snug"
                  style={{
                    color: isMatched
                      ? "rgba(255,255,255,0.95)"
                      : "#0b0b0f",
                  }}
                >
                  {clue.clue1}
                </p>

                <div
                  className="mt-4 border-t pt-3"
                  style={{
                    borderColor: isMatched
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.1)",
                  }}
                >
                  <p
                    className="text-[10px] font-extrabold uppercase tracking-widest"
                    style={{
                      color: isMatched
                        ? "rgba(255,255,255,0.8)"
                        : "#746a5c",
                    }}
                  >
                    The full story
                  </p>

                  <p
                    className="mt-1 text-[13px] font-semibold leading-relaxed"
                    style={{
                      color: isMatched
                        ? "rgba(255,255,255,0.95)"
                        : "#343238",
                    }}
                  >
                    {clue.hint}
                  </p>
                </div>

                {isMatched ? (
                  <p
                    className="font-display mt-4 text-[22px] leading-none text-white"
                    style={{
                      textShadow: "0 2px 0 rgba(11,11,15,0.25)",
                    }}
                  >
                    {clue.name}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}