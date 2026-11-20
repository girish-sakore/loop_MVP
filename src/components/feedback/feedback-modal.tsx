"use client";

import { AnimatePresence, motion } from "framer-motion";

type FeedbackModalProps = {
  open: boolean;
  correct: boolean;
  message: string;
  attemptsRemaining: number;
  singlePass?: boolean; // deck result: Continue is the only action
  onContinue: () => void;
  onRetry?: () => void;
  onSkip?: () => void;
};

export function FeedbackModal({
  open,
  correct,
  message,
  attemptsRemaining,
  singlePass = false,
  onContinue,
  onRetry,
  onSkip
}: FeedbackModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — subtle */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{
              backgroundColor: correct
                ? "rgba(58,103,87,0.05)"
                : "rgba(186,26,26,0.05)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sparkles on correct */}
          {correct && (
            <div className="fixed inset-0 pointer-events-none z-40">
              {[
                { top: "15%", left: "10%", icon: "auto_awesome", size: 32, color: "var(--secondary-fixed-dim)", opacity: 0.5 },
                { top: "20%", right: "12%", icon: "flare", size: 22, color: "var(--tertiary-fixed-dim)", opacity: 0.4 },
                { top: "8%", right: "30%", icon: "celebration", size: 28, color: "var(--secondary)", opacity: 0.25 },
              ].map((s, i) => (
                <motion.span
                  key={i}
                  className="material-symbols-outlined absolute"
                  style={{
                    top: s.top,
                    left: "left" in s ? s.left : undefined,
                    right: "right" in s ? s.right : undefined,
                    fontSize: s.size,
                    color: s.color,
                    opacity: s.opacity,
                    fontVariationSettings: "'FILL' 1",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: s.opacity, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {s.icon}
                </motion.span>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div
              className="px-6 py-6 flex flex-col gap-4"
              style={{
                backgroundColor: correct
                  ? "var(--secondary-container)"
                  : "var(--error-container)",
                borderTop: correct
                  ? "1px solid color-mix(in srgb, var(--secondary) 20%, transparent)"
                  : "1px solid color-mix(in srgb, var(--error) 20%, transparent)",
              }}
            >
              {/* Feedback row */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: correct
                      ? "var(--secondary)"
                      : "var(--error)",
                  }}
                >
                  <span
                    className="material-symbols-outlined text-white"
                    style={{
                      fontSize: 24,
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    {correct ? "check" : "close"}
                  </span>
                </div>
                <div className="flex-1">
                  <p
                    className="text-[16px] font-bold leading-tight"
                    style={{
                      color: correct
                        ? "var(--on-secondary-container)"
                        : "var(--on-error-container)",
                    }}
                  >
                    {correct ? "Brilliant!" : "Not quite"}
                  </p>
                  <p
                    className="text-sm mt-0.5 leading-snug"
                    style={{
                      color: correct
                        ? "var(--on-secondary-container)"
                        : "var(--on-error-container)",
                      opacity: 0.8,
                    }}
                  >
                    {message}
                  </p>
                </div>
              </div>

              {/* Hint card on wrong (not for single-pass results) */}
              {!correct && !singlePass && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: "var(--primary-container)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--secondary-container)" }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 18,
                        color: "var(--on-secondary-container)",
                      }}
                    >
                      lightbulb
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Review the options carefully — look for the most precise match to the question.
                  </p>
                </div>
              )}

              {/* Attempts remaining on wrong (not for single-pass results) */}
              {!correct && !singlePass && attemptsRemaining > 0 && (
                <div className="flex items-center gap-2">
                  {Array.from({ length: attemptsRemaining }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 18,
                        color: "#e8614a",
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      favorite
                    </span>
                  ))}
                  <span
                    className="text-[11px] font-bold tracking-widest uppercase"
                    style={{ color: "var(--on-error-container)", opacity: 0.7 }}
                  >
                    {attemptsRemaining} {attemptsRemaining === 1 ? "try" : "tries"} left
                  </span>
                </div>
              )}

              {/* Buttons */}
              {correct || singlePass ? (
                <button
                  onClick={onContinue}
                  className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5 group"
                  style={
                    correct
                      ? {
                          backgroundColor: "var(--secondary)",
                          color: "var(--secondary-foreground)",
                          boxShadow: "0 4px 0 0 #2a4d41",
                        }
                      : {
                          backgroundColor: "var(--error)",
                          color: "var(--on-error)",
                          boxShadow: "0 4px 0 0 #93000a",
                        }
                  }
                >
                  Continue
                  <span
                    className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                    style={{ fontSize: 20 }}
                  >
                    arrow_forward
                  </span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {attemptsRemaining > 0 && onRetry && (
                    <button
                      onClick={onRetry}
                      className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
                      style={{
                        backgroundColor: "var(--error)",
                        color: "var(--on-error)",
                        boxShadow: "0 4px 0 0 #93000a",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        refresh
                      </span>
                      Retry
                    </button>
                  )}
                  <button
                    onClick={attemptsRemaining <= 0 ? onContinue : onSkip}  // ← skip forces advance
                    className="w-full h-12 rounded-xl text-[13px] font-bold tracking-widest uppercase transition-all duration-75"
                    style={{ color: "var(--on-error-container)", opacity: 0.7 }}
                  >
                    {attemptsRemaining <= 0 ? "Continue Anyway" : "View Explanation"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}