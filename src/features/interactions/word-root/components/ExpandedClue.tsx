"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { WordRootClue } from "../types";

interface ExpandedClueProps {
  clue: WordRootClue | null;
  rootWord: string;
  cellSize: number;
  onClose: () => void;
}

export function ExpandedClue({ clue, rootWord, cellSize, onClose }: ExpandedClueProps) {
  return (
    <AnimatePresence>
      {clue && (
        <motion.div
          className="absolute z-30 overflow-hidden rounded-2xl border-[3px]"
          style={{
            left: clue.x * cellSize,
            top: clue.y * cellSize,
            width: cellSize * 3.2,
            height: cellSize * 2.6,
            maxWidth: 380,
            background: "#fffdf7",
            borderColor: "#0b0b0f",
            boxShadow: "8px 8px 0 #0b0b0f",
            transformOrigin: "top left",
          }}
          initial={{
            scale: 0.3,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.3,
            opacity: 0,
          }}
          transition={{
            duration: 0.45,
            ease: [0.2, 0.9, 0.2, 1],
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition active:scale-90"
            style={{ background: "#0b0b0f", borderColor: "#0b0b0f", color: "#fffdf7" }}
            aria-label="Close"
          >
            <X size={14} strokeWidth={3} />
          </button>

          {/* Content */}
          <div className="flex h-full flex-col p-4 pt-6">
            {/* Header */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-black"
                style={{ background: "#9b73f6", borderColor: "#0b0b0f", color: "#0b0b0f" }}
              >
                {clue.number}
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#9b73f6" }}>
                {rootWord}
              </span>
            </div>

            {/* Title */}
            <h3
              className="mb-2 text-[17px] font-black leading-tight"
              style={{ color: "#0b0b0f" }}
            >
              {clue.title}
            </h3>

            {/* Description */}
            <p
              className="mb-3 flex-1 text-[12px] font-semibold leading-relaxed"
              style={{ color: "#343238" }}
            >
              {clue.text}
            </p>

            {/* Answer / derived word */}
            <div
              className="flex items-center gap-2 rounded-xl border-2 px-3 py-2"
              style={{ background: "#f6f2ec", borderColor: "#0b0b0f" }}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#343238" }}>
                Derived word
              </span>
              <motion.span
                className="text-[15px] font-black"
                style={{ color: "#9b73f6" }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {clue.answer}
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
