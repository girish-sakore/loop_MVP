"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import type { WordRootClue, WordRootPuzzle } from "../types";
import { useCamera } from "../hooks/useCamera";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Grid } from "./Grid";
import { RootWord } from "./RootWord";
import { ConnectionPaths } from "./ConnectionPaths";
import { ClueNode } from "./ClueNode";
import { ExpandedClue } from "./ExpandedClue";

interface GameBoardProps {
  puzzle: WordRootPuzzle;
  onClueSelect?: (clue: WordRootClue) => void;
}

export function GameBoard({ puzzle, onClueSelect }: GameBoardProps) {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Measure viewport
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Calculate cell size based on viewport and grid dimensions
  const cellSize = useMemo(() => {
    const padding = 40;
    // On smaller screens, use larger cells but cap them
    const minForFull = Math.min(
      (viewportSize.width - padding) / puzzle.cols,
      (viewportSize.height - padding) / puzzle.rows,
    );
    return Math.min(Math.max(minForFull, 50), 100);
  }, [puzzle.cols, puzzle.rows, viewportSize.width, viewportSize.height]);

  const boardWidth = puzzle.cols * cellSize;
  const boardHeight = puzzle.rows * cellSize;

  const camera = useCamera(viewportSize.width, viewportSize.height);
  const selectedClue = useMemo(
    () => puzzle.clues.find((c) => c.id === selectedClueId) || null,
    [puzzle.clues, selectedClueId],
  );

  // Auto-center camera on mount
  useEffect(() => {
    if (reducedMotion) return;
    const timer = setTimeout(() => {
      camera.animatePanTo(puzzle.root.x + 0.5, puzzle.root.y + 0.5);
    }, 100);
    return () => clearTimeout(timer);
  }, [puzzle.root.x, puzzle.root.y, camera, reducedMotion]);

  const handleClueClick = useCallback(
    (clue: WordRootClue) => {
      if (isDraggingRef.current) return;

      if (selectedClueId === clue.id) {
        // Deselect
        setSelectedClueId(null);
        onClueSelect?.(clue);
        return;
      }

      setSelectedClueId(clue.id);
      onClueSelect?.(clue);

      // Pan camera to clue (coordinated animation)
      camera.animatePanTo(clue.x + 0.5, clue.y + 0.5);
    },
    [selectedClueId, camera, onClueSelect],
  );

  const handleCloseClue = useCallback(() => {
    setSelectedClueId(null);
    // Return camera to root
    if (!reducedMotion) {
      camera.animatePanTo(puzzle.root.x + 0.5, puzzle.root.y + 0.5);
    } else {
      camera.panTo(puzzle.root.x + 0.5, puzzle.root.y + 0.5);
    }
  }, [camera, puzzle.root, reducedMotion]);

  // Drag to pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (selectedClueId) return; // Don't pan when clue is open
      isDraggingRef.current = false;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      const moveHandler = (ev: PointerEvent) => {
        const dx = ev.clientX - dragStartRef.current.x;
        const dy = ev.clientY - dragStartRef.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          isDraggingRef.current = true;
        }
        camera.panBy(dx, dy);
        dragStartRef.current = { x: ev.clientX, y: ev.clientY };
      };

      const upHandler = () => {
        window.removeEventListener("pointermove", moveHandler);
        window.removeEventListener("pointerup", upHandler);
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      };

      window.addEventListener("pointermove", moveHandler);
      window.addEventListener("pointerup", upHandler);
    },
    [camera, selectedClueId],
  );

  return (
    <div
      ref={viewportRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      style={{
        background: "#1a1a2e",
      }}
    >
      {/* The board container, transformed by camera */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          width: boardWidth,
          height: boardHeight,
          x: camera.boardX,
          y: camera.boardY,
          scale: camera.boardScale,
        }}
        initial={reducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Grid background */}
        <Grid cols={puzzle.cols} rows={puzzle.rows} cellSize={cellSize} />

        {/* Root word */}
        <RootWord
          word={puzzle.root.word}
          x={puzzle.root.x}
          y={puzzle.root.y}
          cellSize={cellSize}
        />

        {/* Connection paths (SVG) */}
        <ConnectionPaths
          rootX={puzzle.root.x}
          rootY={puzzle.root.y}
          cols={puzzle.cols}
          rows={puzzle.rows}
          clues={puzzle.clues}
          cellSize={cellSize}
          selectedClueId={selectedClueId}
        />

        {/* Clue nodes */}
        {puzzle.clues.map((clue) => (
          <ClueNode
            key={clue.id}
            clue={clue}
            cellSize={cellSize}
            isSelected={selectedClueId === clue.id}
            isDimmed={!!selectedClueId}
            onClick={handleClueClick}
          />
        ))}

        {/* Expanded clue card */}
        <ExpandedClue
          clue={selectedClue}
          rootWord={puzzle.root.word}
          cellSize={cellSize}
          onClose={handleCloseClue}
        />
      </motion.div>

      {/* Dim overlay when clue is selected */}
      {selectedClueId && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          style={{ background: "#0b0b0f" }}
        />
      )}

      {/* Close expanded clue button (floating) */}
      {selectedClueId && (
        <motion.button
          type="button"
          className="absolute right-4 top-4 z-50 flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-[12px] font-bold"
          style={{ background: "#0b0b0f", borderColor: "#fffdf7", color: "#fffdf7" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleCloseClue}
        >
          <X size={14} />
          Back to board
        </motion.button>
      )}
    </div>
  );
}
