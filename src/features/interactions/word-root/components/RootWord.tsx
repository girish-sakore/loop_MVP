"use client";

import { motion } from "framer-motion";

interface RootWordProps {
  word: string;
  x: number;
  y: number;
  cellSize: number;
}

export function RootWord({ word, x, y, cellSize }: RootWordProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 120, damping: 15 }}
      className="absolute flex items-center justify-center"
      style={{
        left: x * cellSize,
        top: y * cellSize,
        width: cellSize,
        height: cellSize,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: "rgba(155, 115, 246, 0.15)",
            filter: "blur(12px)",
            transform: "scale(1.3)",
          }}
        />
        {/* Main box */}
        <div
          className="relative flex items-center justify-center rounded-xl border-2 px-5 py-3"
          style={{
            background: "#9b73f6",
            borderColor: "#0b0b0f",
            boxShadow: "0 4px 0 #0b0b0f, 0 0 20px rgba(155,115,246,0.4)",
          }}
        >
          <span
            className="text-[18px] font-black tracking-wider"
            style={{ color: "#0b0b0f" }}
          >
            {word}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
