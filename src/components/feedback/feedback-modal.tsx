"use client";

import { AnimatePresence, motion } from "framer-motion";

type FeedbackModalProps = {
  open: boolean;
  correct: boolean;
  message: string;
  onContinue: () => void;
};

export function FeedbackModal({
  open,
  correct,
  message,
  onContinue,
}: FeedbackModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-[398px] rounded-3xl bg-card p-5 shadow-xl"
          >
            <p
              className={`text-sm font-semibold ${
                correct ? "text-primary" : "text-danger"
              }`}
            >
<<<<<<< HEAD
              {correct ? "Correct" : "Not quite"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              Continue
            </button>
=======
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

              {/* Hint card on wrong */}
              {!correct && (
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

              {/* Attempts remaining on wrong */}
              {!correct && attemptsRemaining > 0 && (
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
              {correct ? (
                <button
                  onClick={onContinue}
                  className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5 group"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--secondary-foreground)",
                    boxShadow: "0 4px 0 0 #2a4d41",
                  }}
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
>>>>>>> 4023b43 (Added Razorpay - payments, checkout, subscriptions, UIUX improvements)
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
