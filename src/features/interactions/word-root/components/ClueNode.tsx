"use client";

import { motion } from "framer-motion";
import type { WordRootClue } from "../types";

interface ClueNodeProps {
  clue: WordRootClue;
  cellSize: number;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: (clue: WordRootClue) => void;
}

export function ClueNode({ clue, cellSize, isSelected, isDimmed, onClick }: ClueNodeProps) {
  return (
    <motion.button
      className="absolute flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer text-left"
      style={{
        left: clue.x * cellSize,
        top: clue.y * cellSize,
        width: cellSize,
        height: cellSize,
        zIndex: isSelected ? 20 : 8,
        padding: 0,
        background: isSelected ? "#f7d91f" : "#fffdf7",
        borderColor: isSelected ? "#0b0b0f" : "rgba(155, 115, 246, 0.4)",
        boxShadow: isSelected
          ? "0 4px 0 #0b0b0f, 0 0 16px rgba(247,217,31,0.4)"
          : "0 2px 0 rgba(11,11,15,0.12)",
        opacity: isDimmed && !isSelected ? 0.35 : 1,
        transform: isSelected ? "scale(1.08)" : "scale(1)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isDimmed && !isSelected ? 0.35 : 1,
        scale: isSelected ? 1.08 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(clue);
      }}
      whileHover={!isSelected ? { scale: 1.04, y: -2 } : undefined}
      whileTap={!isSelected ? { scale: 0.96 } : undefined}
    >
      {/* Number badge */}
      <div
        className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-black"
        style={{
          background: isSelected ? "#0b0b0f" : "#9b73f6",
          borderColor: "#0b0b0f",
          color: isSelected ? "#fffdf7" : "#0b0b0f",
        }}
      >
        {clue.number}
      </div>
      {/* Title */}
      <span
        className="text-center px-1 leading-tight"
        style={{
          fontSize: cellSize > 60 ? 10 : 9,
          fontWeight: 700,
          color: isSelected ? "#0b0b0f" : "#343238",
          fontFamily: "inherit",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {clue.title}
      </span>
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-black"
          style={{ background: "#0b0b0f", borderColor: "#0b0b0f", color: "#f7d91f" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          →
        </motion.div>
      )}
    </motion.button>
  );
}
