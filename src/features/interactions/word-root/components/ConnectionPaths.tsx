"use client";

import { motion } from "framer-motion";
import type { WordRootClue } from "../types";

interface ConnectionPathsProps {
  rootX: number;
  rootY: number;
  cols: number;
  rows: number;
  clues: WordRootClue[];
  cellSize: number;
  selectedClueId: string | null;
}

/**
 * Generates an orthogonal SVG path from root center to clue center.
 * Path: root center → horizontal segment → vertical segment → clue center
 */
function buildOrthogonalPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  // Use midpoint for the turn
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

/**
 * Calculate arrowhead polygon points at the end of a path segment.
 */
function buildArrowhead(
  x: number,
  y: number,
  fromX: number,
  fromY: number,
  size: number = 8,
): string {
  const angle = Math.atan2(y - fromY, x - fromX);
  const a1 = angle + (2 * Math.PI) / 3;
  const a2 = angle - (2 * Math.PI) / 3;

  const p1 = `${x} ${y}`;
  const p2 = `${x - size * Math.cos(a1)} ${y - size * Math.sin(a1)}`;
  const p3 = `${x - size * Math.cos(a2)} ${y - size * Math.sin(a2)}`;

  return `${p1},${p2},${p3}`;
}

export function ConnectionPaths({
  rootX,
  rootY,
  cols,
  rows,
  clues,
  cellSize,
  selectedClueId,
}: ConnectionPathsProps) {
  const rootCenterX = rootX * cellSize + cellSize / 2;
  const rootCenterY = rootY * cellSize + cellSize / 2;

  return (
    <svg
      width={cols * cellSize}
      height={rows * cellSize}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <g style={{ transformOrigin: "0 0" }}>
        {clues.map((clue) => {
          const clueCenterX = clue.x * cellSize + cellSize / 2;
          const clueCenterY = clue.y * cellSize + cellSize / 2;
          const isSelected = selectedClueId === clue.id;
          const pathD = buildOrthogonalPath(rootCenterX, rootCenterY, clueCenterX, clueCenterY);
          const arrowPoints = buildArrowhead(
            clueCenterX,
            clueCenterY,
            rootCenterX + (clueCenterX - rootCenterX) * 0.7,
            rootCenterY + (clueCenterY - rootCenterY) * 0.7,
            8,
          );

          return (
            <g key={clue.id}>
              {/* Path line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={isSelected ? "#f7d91f" : "rgba(155, 115, 246, 0.3)"}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: isSelected ? 1 : 0.6,
                  stroke: isSelected ? "#f7d91f" : "rgba(155, 115, 246, 0.3)",
                  strokeWidth: isSelected ? 3 : 1.5,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + ((clue.number * 0.07) % 0.2),
                  ease: "easeInOut",
                }}
              />
              {/* Arrowhead */}
              <motion.polygon
                points={arrowPoints}
                fill={isSelected ? "#f7d91f" : "rgba(155, 115, 246, 0.4)"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isSelected ? 1 : 0.5,
                  scale: isSelected ? 1.4 : 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.4,
                  ease: "easeOut",
                }}
                style={{
                  transformOrigin: `${clueCenterX}px ${clueCenterY}px`,
                }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
