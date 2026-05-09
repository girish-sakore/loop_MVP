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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
