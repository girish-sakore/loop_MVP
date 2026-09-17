"use client";

import { useEffect, useRef, useState } from "react";

import type { ColorMatchStage } from "@/types/gameplay";

export type DragState = {
  id: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  w: number;
  h: number;
  hex: string;
  name: string;
};

export type FloatLabel = { x: number; y: number; text: string } | null;

type MatchState = {
  key: string;
  matchedIds: string[];
};

type UseColorMatchGameArgs = {
  stage: ColorMatchStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
};

/**
 * Owns all game state for a single ColorMatch stage: which clues are
 * matched, the active pointer drag, the shake/hover feedback, and the
 * open (expanded) clue card. Resets automatically when `stage.id` or
 * `retryCount` changes.
 */
export function useColorMatchGame({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
}: UseColorMatchGameArgs) {
  const resetKey = `${stage.id}:${retryCount}`;

  const [state, setState] = useState<MatchState>(() => ({
    key: resetKey,
    matchedIds: [],
  }));
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [label, setLabel] = useState<FloatLabel>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showWin, setShowWin] = useState(false);

  const answeredKey = useRef<string | null>(null);
  const failureReportedKey = useRef<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const matchedIds = state.key === resetKey ? state.matchedIds : [];
  const total = stage.clues.length;
  const matchedCount = matchedIds.length;
  const allMatched = matchedCount === total;
  const openClue = stage.clues.find((clue) => clue.id === openId) ?? null;
  const openClueMatched = openClue ? matchedIds.includes(openClue.id) : false;

  function matchStateHas(id: string) {
    return (state.key === resetKey ? state.matchedIds : []).includes(id);
  }

  function handleMatch(id: string) {
    setState((latest) => {
      const base =
        latest.key === resetKey ? latest : { key: resetKey, matchedIds: [] };
      if (base.matchedIds.includes(id)) return base;
      return { key: resetKey, matchedIds: [...base.matchedIds, id] };
    });
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>, id: string) {
    if (disabled || matchStateHas(id)) return;
    event.preventDefault();
    const swatch = event.currentTarget;
    const rect = swatch.getBoundingClientRect();
    const clue = stage.clues.find((item) => item.id === id);
    if (!clue) return;

    dragRef.current = {
      id,
      x: rect.left,
      y: rect.top,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      w: rect.width,
      h: rect.height,
      hex: clue.hex,
      name: clue.name,
    };
    setDragging(dragRef.current);
    setDragActive(true);
    setLabel({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: clue.name,
    });
  }

  // Window-level pointer tracking while a swatch drag is active.
  useEffect(() => {
    if (!dragActive) return;

    function handlePointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const x = event.clientX - drag.offsetX;
      const y = event.clientY - drag.offsetY;
      dragRef.current = { ...drag, x, y };
      setDragging(dragRef.current);
      setLabel({ x: event.clientX, y: y - 12, text: drag.name });

      const under = document.elementFromPoint(event.clientX, event.clientY);
      const cardEl = under?.closest?.("[data-color-card]") as HTMLElement | null;
      setDragOverId(
        cardEl && cardEl.dataset.matched !== "true"
          ? (cardEl.dataset.colorId ?? null)
          : null,
      );
    }

    function handlePointerUp(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;

      const under = document.elementFromPoint(event.clientX, event.clientY);
      const cardEl = under?.closest?.("[data-color-card]") as HTMLElement | null;

      if (
        cardEl &&
        cardEl.dataset.colorId === drag.id &&
        cardEl.dataset.matched !== "true"
      ) {
        handleMatch(drag.id);
      } else if (cardEl && cardEl.dataset.matched !== "true") {
        const shakeTarget = cardEl.dataset.colorId || null;
        setShakingId(shakeTarget);

        // Report the failed match once per retry so the engine can surface
        // the failure feedback and provide another attempt.
        if (
          shakeTarget &&
          failureReportedKey.current !== resetKey
        ) {
          failureReportedKey.current = resetKey;
          onAnswer({ correct: false, feedback: stage.feedback.incorrect });
        }

        window.setTimeout(() => {
          setShakingId((current) => (current === shakeTarget ? null : current));
        }, 420);
      }

      setDragging(null);
      setLabel(null);
      setDragOverId(null);
      setDragActive(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragActive, resetKey]);

  // Win: play the banner, then report to the engine.
  useEffect(() => {
    if (!allMatched || answeredKey.current === resetKey) return;
    answeredKey.current = resetKey;
    setShowWin(true);
    const bannerTimer = window.setTimeout(() => setShowWin(false), 2600);
    const answerTimer = window.setTimeout(() => {
      onAnswer({ correct: true, feedback: stage.feedback.correct });
    }, 700);
    return () => {
      window.clearTimeout(bannerTimer);
      window.clearTimeout(answerTimer);
    };
  }, [allMatched, onAnswer, resetKey, stage.feedback.correct]);

  // Reset transient UI when the stage remounts after a retry.
  useEffect(() => {
    answeredKey.current = null;
    failureReportedKey.current = null;
    setOpenId(null);
    setShowWin(false);
  }, [resetKey]);

  return {
    resetKey,
    matchedIds,
    total,
    matchedCount,
    allMatched,
    openClue,
    openClueMatched,
    shakingId,
    dragOverId,
    dragging,
    label,
    openId,
    showWin,
    setOpenId,
    startDrag,
  };
}
