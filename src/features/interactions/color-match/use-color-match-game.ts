"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ColorMatchClue, ColorMatchStage } from "@/types/gameplay";

export type DragState = {
  id: string;
  sourceCardId: string | null;
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

export type ColorPlacements = Record<string, string | null>;

export type CheckReveal = {
  correctIds: string[];
  wrongIds: string[];
} | null;

type GameState = {
  stageId: string;
  placements: ColorPlacements;
  lockedIds: string[];
};

type AnswerPayload = {
  correct: boolean;
  feedback: string;
  results: Array<{ questionId: string; isCorrect: boolean; points: number }>;
};

type UseColorMatchGameArgs = {
  stage: ColorMatchStage;
  onAnswer: (payload: AnswerPayload) => void;
  disabled?: boolean;
};

const REVEAL_DURATION_MS = 900;

function createGameState(stage: ColorMatchStage): GameState {
  return {
    stageId: stage.id,
    placements: Object.fromEntries(stage.clues.map((clue) => [clue.id, null])),
    lockedIds: [],
  };
}

function hasPlacementForSwatch(placements: ColorPlacements, swatchId: string) {
  return Object.values(placements).includes(swatchId);
}

function cluePoints(stage: ColorMatchStage, clue: ColorMatchClue) {
  return clue.points ?? (stage.clues.length > 0 ? stage.points / stage.clues.length : 0);
}

/**
 * Owns a single ColorMatch board. Placements remain editable until Check;
 * correctly placed swatches become locked after the reveal and survive retries.
 */
export function useColorMatchGame({
  stage,
  onAnswer,
  disabled,
}: UseColorMatchGameArgs) {
  const initialState = createGameState(stage);
  const [state, setState] = useState<GameState>(initialState);
  const stateRef = useRef<GameState>(initialState);
  const onAnswerRef = useRef(onAnswer);
  const timersRef = useRef<Set<number>>(new Set());
  const dragRef = useRef<DragState | null>(null);
  const checkingRef = useRef(false);
  const suppressOpenRef = useRef(false);

  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [label, setLabel] = useState<FloatLabel>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<CheckReveal>(null);
  const [showWin, setShowWin] = useState(false);
  const [checking, setChecking] = useState(false);

  const activeState = state.stageId === stage.id ? state : createGameState(stage);
  const { placements, lockedIds } = activeState;
  const total = stage.clues.length;
  const matchedIds = lockedIds;
  const matchedCount = lockedIds.length;
  const allMatched = matchedCount === total;
  const unlockedClues = stage.clues.filter((clue) => !lockedIds.includes(clue.id));
  const canCheck = !checking && unlockedClues.every((clue) => placements[clue.id]);
  const openClue = stage.clues.find((clue) => clue.id === openId) ?? null;
  const openClueMatched = openClue ? lockedIds.includes(openClue.id) : false;

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const updateGameState = useCallback((updater: (current: GameState) => GameState) => {
    setState((current) => {
      const base = current.stageId === stage.id ? current : createGameState(stage);
      const next = updater(base);
      stateRef.current = next;
      return next;
    });
  }, [stage]);

  // Always submit to the engine callback from the latest render.
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  // ColorMatch deliberately does not use retryCount: only entering a new stage
  // clears locked cards and the board.
  useEffect(() => {
    const next = createGameState(stage);
    clearTimers();
    stateRef.current = next;
    checkingRef.current = false;
    suppressOpenRef.current = false;
    dragRef.current = null;
    setState(next);
    setDragging(null);
    setDragActive(false);
    setDragOverId(null);
    setLabel(null);
    setOpenId(null);
    setReveal(null);
    setShowWin(false);
    setChecking(false);
  }, [stage.id, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!disabled || !dragRef.current) return;
    dragRef.current = null;
    setDragging(null);
    setDragActive(false);
    setDragOverId(null);
    setLabel(null);
  }, [disabled]);

  const openClueCard = useCallback((id: string | null) => {
    if (id === null) {
      setOpenId(null);
      return;
    }
    if (disabled || checkingRef.current || suppressOpenRef.current) return;
    setOpenId(id);
  }, [disabled]);

  const startDrag = useCallback((
    event: React.PointerEvent<HTMLElement>,
    id: string,
    sourceCardId: string | null = null,
  ) => {
    const current = stateRef.current;
    const isLocked = current.lockedIds.includes(id);
    const isPlaced = hasPlacementForSwatch(current.placements, id);

    if (
      disabled ||
      checkingRef.current ||
      isLocked ||
      (sourceCardId ? current.placements[sourceCardId] !== id : isPlaced)
    ) return;

    const clue = stage.clues.find((item) => item.id === id);
    if (!clue) return;

    event.preventDefault();
    event.stopPropagation();
    suppressOpenRef.current = true;

    const swatch = event.currentTarget;
    const rect = swatch.getBoundingClientRect();
    const nextDrag: DragState = {
      id,
      sourceCardId,
      x: rect.left,
      y: rect.top,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      w: rect.width,
      h: rect.height,
      hex: clue.hex,
      name: clue.name,
    };

    dragRef.current = nextDrag;
    setDragging(nextDrag);
    setDragActive(true);
    setLabel({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: clue.name,
    });
  }, [disabled, stage.clues]);

  // Window-level tracking preserves touch dragging when the pointer leaves the
  // tray or crosses a card boundary.
  useEffect(() => {
    if (!dragActive) return;

    function clearDrag() {
      dragRef.current = null;
      setDragging(null);
      setLabel(null);
      setDragOverId(null);
      setDragActive(false);
      schedule(() => {
        suppressOpenRef.current = false;
      }, 0);
    }

    function handlePointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const x = event.clientX - drag.offsetX;
      const y = event.clientY - drag.offsetY;
      const nextDrag = { ...drag, x, y };
      dragRef.current = nextDrag;
      setDragging(nextDrag);
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

      const under = document.elementFromPoint(event.clientX, event.clientY);
      const cardEl = under?.closest?.("[data-color-card]") as HTMLElement | null;
      const targetCardId =
        cardEl && cardEl.dataset.matched !== "true"
          ? (cardEl.dataset.colorId ?? null)
          : null;

      updateGameState((current) => {
        if (!targetCardId || current.lockedIds.includes(targetCardId)) {
          // No card means return the dragged swatch to the dock. A cancelled
          // drag is handled separately below and leaves the board untouched.
          if (!drag.sourceCardId) return current;
          return {
            ...current,
            placements: { ...current.placements, [drag.sourceCardId]: null },
          };
        }

        if (targetCardId === drag.sourceCardId) return current;

        const displacedSwatchId = current.placements[targetCardId];
        const nextPlacements = { ...current.placements, [targetCardId]: drag.id };

        if (drag.sourceCardId) {
          // Moving onto an occupied card swaps the two placed swatches.
          nextPlacements[drag.sourceCardId] = displacedSwatchId;
        }

        return { ...current, placements: nextPlacements };
      });

      clearDrag();
    }

    function handlePointerCancel() {
      // Pointer cancellation has no drop target, so do not change placement.
      if (!dragRef.current) return;
      clearDrag();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [dragActive, schedule, updateGameState]);

  const checkPlacements = useCallback(() => {
    const current = stateRef.current;
    if (disabled || checkingRef.current || current.stageId !== stage.id) return;

    const unlocked = stage.clues.filter((clue) => !current.lockedIds.includes(clue.id));
    if (!unlocked.every((clue) => current.placements[clue.id])) return;

    const newlyCorrectIds = unlocked
      .filter((clue) => current.placements[clue.id] === clue.id)
      .map((clue) => clue.id);
    const wrongIds = unlocked
      .filter((clue) => current.placements[clue.id] !== clue.id)
      .map((clue) => clue.id);
    const nextLockedIds = [...new Set([...current.lockedIds, ...newlyCorrectIds])];
    const correct = nextLockedIds.length === stage.clues.length;

    checkingRef.current = true;
    setChecking(true);
    updateGameState((latest) => ({
      ...latest,
      lockedIds: [...new Set([...latest.lockedIds, ...newlyCorrectIds])],
    }));
    setReveal({ correctIds: newlyCorrectIds, wrongIds });

    if (correct) {
      setShowWin(true);
      schedule(() => setShowWin(false), 2600);
    }

    schedule(() => {
      updateGameState((latest) => {
        const nextPlacements = { ...latest.placements };
        for (const id of wrongIds) nextPlacements[id] = null;
        return { ...latest, placements: nextPlacements };
      });
      setReveal(null);
      checkingRef.current = false;
      setChecking(false);

      onAnswerRef.current({
        correct,
        feedback: correct ? stage.feedback.correct : stage.feedback.incorrect,
        results: stage.clues.map((clue) => ({
          questionId: `${stage.id}:${clue.id}`,
          isCorrect: nextLockedIds.includes(clue.id),
          points: cluePoints(stage, clue),
        })),
      });
    }, REVEAL_DURATION_MS);
  }, [disabled, schedule, stage, updateGameState]);

  return {
    placements,
    matchedIds,
    total,
    matchedCount,
    allMatched,
    canCheck,
    checking,
    reveal,
    openClue,
    openClueMatched,
    dragOverId,
    dragging,
    label,
    openId,
    showWin,
    setOpenId: openClueCard,
    startDrag,
    checkPlacements,
  };
}
