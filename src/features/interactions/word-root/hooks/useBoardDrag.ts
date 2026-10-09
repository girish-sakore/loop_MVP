"use client";

import { useCallback, useRef } from "react";
import type { MotionValue } from "framer-motion";

interface DragState {
  isDragging: boolean;
  startScreenX: number;
  startScreenY: number;
  startBoardX: number;
  startBoardY: number;
}

export function useBoardDrag(
  boardX: MotionValue<number>,
  boardY: MotionValue<number>,
  boardScale: MotionValue<number>,
  onDragStart?: () => void,
  onDragEnd?: () => void,
) {
  const dragRef = useRef<DragState>({
    isDragging: false,
    startScreenX: 0,
    startScreenY: 0,
    startBoardX: 0,
    startBoardY: 0,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = {
        isDragging: true,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startBoardX: boardX.get(),
        startBoardY: boardY.get(),
      };
      onDragStart?.();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [boardX, boardY, onDragStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = e.clientX - dragRef.current.startScreenX;
      const dy = e.clientY - dragRef.current.startScreenY;
      boardX.set(dragRef.current.startBoardX + dx);
      boardY.set(dragRef.current.startBoardY + dy);
    },
    [boardX, boardY],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      onDragEnd?.();
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    },
    [onDragEnd],
  );

  const isDraggingRef = () => dragRef.current.isDragging;

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging: isDraggingRef,
  };
}
