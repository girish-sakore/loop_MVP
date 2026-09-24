"use client";

import { useCallback, useRef } from "react";
import { useMotionValue } from "framer-motion";

export interface CameraState {
  x: number; // translateX of board div (screen pixels)
  y: number; // translateY of board div (screen pixels)
  scale: number;
}

interface CameraCallbacks {
  onCameraChange?: (camera: CameraState) => void;
}

export function useCamera(
  viewportWidth: number,
  viewportHeight: number,
  callbacks: CameraCallbacks = {},
) {
  const boardX = useMotionValue(0);
  const boardY = useMotionValue(0);
  const boardScale = useMotionValue(1);

  // Track the last known camera state (for restoring on close)
  const prevCamera = useRef<CameraState>({ x: 0, y: 0, scale: 1 });

  const getViewportCenter = useCallback(
    (): { cx: number; cy: number } => ({
      cx: viewportWidth / 2,
      cy: viewportHeight / 2,
    }),
    [viewportWidth, viewportHeight],
  );

  const getCurrentCamera = useCallback((): CameraState => ({
    x: boardX.get(),
    y: boardY.get(),
    scale: boardScale.get(),
  }), [boardX, boardY, boardScale]);

  /**
   * Pan camera so that board-space point (bx, by) appears at viewport center.
   * Screen position: sx = bx * scale + boardX
   * We want sx = viewportWidth/2 → boardX = viewportWidth/2 - bx * scale
   */
  const panTo = useCallback(
    (bx: number, by: number, targetScale?: number) => {
      const { cx, cy } = getViewportCenter();
      const currentScale = targetScale ?? boardScale.get();
      const targetX = cx - bx * currentScale;
      const targetY = cy - by * currentScale;

      prevCamera.current = { x: boardX.get(), y: boardY.get(), scale: boardScale.get() };
      boardX.set(targetX);
      boardY.set(targetY);
      if (targetScale !== undefined) {
        boardScale.set(targetScale);
      }
      callbacks.onCameraChange?.({ x: targetX, y: targetY, scale: currentScale });
    },
    [getViewportCenter, boardX, boardY, boardScale, callbacks],
  );

  /**
   * Smoothly animate camera to a target board-space point.
   */
  const animatePanTo = useCallback(
    (bx: number, by: number, targetScale?: number) => {
      const { cx, cy } = getViewportCenter();
      const currentScale = targetScale ?? boardScale.get();
      const targetX = cx - bx * currentScale;
      const targetY = cy - by * currentScale;

      prevCamera.current = { x: boardX.get(), y: boardY.get(), scale: boardScale.get() };
      boardX.set(targetX);
      boardY.set(targetY);
      if (targetScale !== undefined) {
        boardScale.set(targetScale);
      }
      callbacks.onCameraChange?.({ x: targetX, y: targetY, scale: currentScale });
    },
    [getViewportCenter, boardX, boardY, boardScale, callbacks],
  );

  /**
   * Return camera to its previous state (before last panTo).
   */
  const restorePrevious = useCallback(
    (_duration: number = 500) => {
      const prev = prevCamera.current;
      boardX.set(prev.x);
      boardY.set(prev.y);
      boardScale.set(prev.scale);
      callbacks.onCameraChange?.(prev);
    },
    [boardX, boardY, boardScale, callbacks],
  );

  /**
   * Update camera for drag panning. Delta is in screen pixels.
   */
  const panBy = useCallback(
    (dx: number, dy: number) => {
      boardX.set(boardX.get() + dx);
      boardY.set(boardY.get() + dy);
    },
    [boardX, boardY],
  );

  /**
   * Zoom around a screen-space anchor point.
   */
  const zoomAt = useCallback(
    (anchorScreenX: number, anchorScreenY: number, newScale: number) => {
      const oldScale = boardScale.get();
      const bx = (anchorScreenX - boardX.get()) / oldScale;
      const by = (anchorScreenY - boardY.get()) / oldScale;
      const targetX = anchorScreenX - bx * newScale;
      const targetY = anchorScreenY - by * newScale;

      prevCamera.current = { x: boardX.get(), y: boardY.get(), scale: oldScale };
      boardX.set(targetX);
      boardY.set(targetY);
      boardScale.set(newScale);
      callbacks.onCameraChange?.({ x: targetX, y: targetY, scale: newScale });
    },
    [boardX, boardY, boardScale, callbacks],
  );

  return {
    boardX,
    boardY,
    boardScale,
    panTo,
    animatePanTo,
    restorePrevious,
    panBy,
    zoomAt,
    getCurrentCamera,
    prevCamera,
  };
}
