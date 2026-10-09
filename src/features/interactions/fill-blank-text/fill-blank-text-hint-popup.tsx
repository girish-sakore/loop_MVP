"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  hint: string | null;
  onClose: () => void;
};

export function FillBlankTextHintPopup({
  open,
  hint,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && hint && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(11, 11, 11, 0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup card — matches the tactile card style used across games */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
          >
            <div
              className="relative max-w-[320px] rounded-[22px] border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-5 text-center shadow-[0_8px_0_rgba(11,11,15,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Hint icon */}
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#fff5d4] border-[3px] border-[#0b0b0f]">
                <span
                  className="material-symbols-outlined text-[22px] text-[#0b0b0f]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
              </div>

              <p className="font-display mb-1 text-[13px] font-black uppercase tracking-widest text-[#343238]">
                Hint
              </p>

              <p className="mt-2 text-[14px] leading-snug text-[#343238]">
                {hint}
              </p>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-[#0b0b0f] bg-[#fffdf7] text-[16px] text-[#343238] transition active:scale-90"
                aria-label="Close hint"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  close
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
