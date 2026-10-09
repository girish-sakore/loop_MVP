"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GridProps {
  cols: number;
  rows: number;
  cellSize: number;
}

export function Grid({ cols, rows, cellSize }: GridProps) {
  const width = cols * cellSize;
  const height = rows * cellSize;

  // Generate dotted background pattern
  const dotSpacing = cellSize / 4;
  const dots: ReactNode[] = [];
  for (let x = 0; x <= width; x += dotSpacing) {
    for (let y = 0; y <= height; y += dotSpacing) {
      dots.push(
        <circle
          key={`dot-${x}-${y}`}
          cx={x}
          cy={y}
          r={1}
          fill="rgba(155, 115, 246, 0.3)"
        />,
      );
    }
  }

  // Generate thin grid lines
  const lines: React.ReactNode[] = [];
  for (let x = 0; x <= cols; x++) {
    const px = x * cellSize;
    lines.push(
      <line
        key={`v-${x}`}
        x1={px}
        y1={0}
        x2={px}
        y2={height}
        stroke="rgba(155, 115, 246, 0.12)"
        strokeWidth={1}
      />,
    );
  }
  for (let y = 0; y <= rows; y++) {
    const py = y * cellSize;
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={py}
        x2={width}
        y2={py}
        stroke="rgba(155, 115, 246, 0.12)"
        strokeWidth={1}
      />,
    );
  }

  // Coordinate labels (subtle)
  const labels: React.ReactNode[] = [];
  const labelColor = "rgba(155, 115, 246, 0.25)";
  for (let x = 0; x < cols; x++) {
    labels.push(
      <text
        key={`lx-${x}`}
        x={x * cellSize + cellSize / 2}
        y={10}
        textAnchor="middle"
        fill={labelColor}
        fontSize={8}
        fontFamily="monospace"
      >
        {x}
      </text>,
    );
  }
  for (let y = 0; y < rows; y++) {
    labels.push(
      <text
        key={`ly-${y}`}
        x={8}
        y={y * cellSize + cellSize / 2 + 3}
        fill={labelColor}
        fontSize={8}
        fontFamily="monospace"
      >
        {y}
      </text>,
    );
  }

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {dots}
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {lines}
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {labels}
      </motion.g>
    </svg>
  );
}
