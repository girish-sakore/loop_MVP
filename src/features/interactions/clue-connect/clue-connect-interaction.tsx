"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type {
  ClueConnectCase,
  ClueConnectClue,
  ClueConnectStage,
} from "@/types/gameplay";

type Props = {
  stage: ClueConnectStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

type BoardClue = ClueConnectClue & {
  x: number;
  y: number;
  rotation: number;
  color: string;
};

type Point = {
  x: number;
  y: number;
};

type ClueConnectState = ReturnType<typeof createInitialState>;

const SUBJECT_POINT = { x: 50, y: 47 };
const CARD_COLORS = ["#d7e96c", "#d9c3ff", "#66cfd3", "#ffb65c", "#fff27a", "#ffb1bd"];
const STRING_COLORS = ["#f05d5e", "#4aa8ee", "#85cb57", "#9b73f6"];

export function ClueConnectInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const resetKey = `${stage.id}:${retryCount}`;
  const stringDragActive = useRef(false);
  const answeredKey = useRef<string | null>(null);
  const [state, setState] = useState(() => createInitialState(resetKey));
  const currentState =
    state.key === resetKey ? state : createInitialState(resetKey);
  const currentCase = stage.cases[currentState.caseIndex];
  const boardClues = useMemo(
    () => buildBoardClues(currentCase, `${resetKey}:${currentCase?.id ?? "case"}`),
    [currentCase, resetKey],
  );
  const trueCount = currentCase?.clues.filter((clue) => clue.isCorrect).length ?? 0;
  const maxMistakes = stage.maxMistakes ?? 3;
  const foundCount = currentState.connectedIds.length;
  const mistakesLeft = Math.max(maxMistakes - currentState.mistakes, 0);
  const tempLine = currentState.dragPoint;

  const updateCurrentState = useCallback((
    updater: (latest: ClueConnectState) => ClueConnectState,
  ) => {
    setState((latest) => {
      const activeState =
        latest.key === resetKey ? latest : createInitialState(resetKey);
      return updater(activeState);
    });
  }, [resetKey]);

  const advanceCase = useCallback(() => {
    updateCurrentState((latest) => {
      const nextCaseIndex = latest.caseIndex + 1;
      if (nextCaseIndex >= stage.cases.length) {
        return {
          ...latest,
          solvedCase: true,
          dragPoint: null,
          toast: null,
          shakingId: null,
          stageComplete: true,
        };
      }

      return {
        ...latest,
        caseIndex: nextCaseIndex,
        connectedIds: [],
        ruledOutIds: [],
        solvedCase: false,
        dragPoint: null,
        toast: null,
        shakingId: null,
        stageComplete: false,
      };
    });
  }, [stage.cases.length, updateCurrentState]);

  useEffect(() => {
    answeredKey.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (!currentState.stageComplete || answeredKey.current === resetKey) return;
    answeredKey.current = resetKey;
    onAnswer({ correct: true, feedback: stage.feedback.correct });
  }, [
    currentState.stageComplete,
    onAnswer,
    resetKey,
    stage.feedback.correct,
  ]);

  const handleClueHit = useCallback((clueId: string) => {
    if (disabled || currentState.solvedCase || !currentCase) return;
    const clue = currentCase.clues.find((item) => item.id === clueId);
    if (!clue) return;

    if (currentState.connectedIds.includes(clueId) || currentState.ruledOutIds.includes(clueId)) {
      return;
    }

    if (clue.isCorrect) {
      const nextConnectedIds = [...currentState.connectedIds, clueId];
      const solvedCase = nextConnectedIds.length >= trueCount;
      updateCurrentState((latest) => ({
        ...latest,
        connectedIds: nextConnectedIds,
        solvedCase,
        toast: "That clue connects",
      }));

      if (solvedCase) {
        window.setTimeout(() => advanceCase(), 1250);
      }
      return;
    }

    const nextMistakes = currentState.mistakes + 1;
    updateCurrentState((latest) => ({
      ...latest,
      mistakes: nextMistakes,
      ruledOutIds: [...latest.ruledOutIds, clueId],
      toast: "Decoy clue",
      shakingId: clueId,
    }));
    window.setTimeout(() => {
      updateCurrentState((latest) => ({ ...latest, shakingId: null }));
    }, 420);

    if (nextMistakes >= maxMistakes) {
      window.setTimeout(() => {
        onAnswer({ correct: false, feedback: stage.feedback.incorrect });
      }, 450);
    }
  }, [
    advanceCase,
    currentCase,
    currentState.connectedIds,
    currentState.mistakes,
    currentState.ruledOutIds,
    currentState.solvedCase,
    disabled,
    maxMistakes,
    onAnswer,
    stage.feedback.incorrect,
    trueCount,
    updateCurrentState,
  ]);

  useEffect(() => {
    if (!currentState.dragPoint) return;

    function handlePointerMove(event: PointerEvent) {
      const board = document.querySelector<HTMLElement>("[data-clue-board]");
      if (!board) return;
      const rect = board.getBoundingClientRect();
      updateCurrentState((latest) => ({
        ...latest,
        dragPoint: {
          x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
          y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
        },
      }));
    }

    function handlePointerUp(event: PointerEvent) {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const clueEl = target?.closest?.("[data-clue-id]") as HTMLElement | null;
      const clueId = clueEl?.dataset.clueId ?? null;
      updateCurrentState((latest) => ({ ...latest, dragPoint: null }));
      if (clueId) handleClueHit(clueId);
      window.setTimeout(() => {
        stringDragActive.current = false;
      }, 0);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [currentState.dragPoint, handleClueHit, updateCurrentState]);

  function startGame() {
    if (disabled) return;
    onIntroComplete?.();
  }

  function beginStringDrag() {
    if (disabled || currentState.solvedCase) return;
    stringDragActive.current = true;
    updateCurrentState((latest) => ({ ...latest, dragPoint: SUBJECT_POINT }));
  }

  useEffect(() => {
    if (!currentState.toast) return;
    const timer = window.setTimeout(() => {
      updateCurrentState((latest) => ({ ...latest, toast: null }));
    }, 720);
    return () => window.clearTimeout(timer);
  }, [currentState.toast, updateCurrentState]);

  if (showIntro) {
    return (
      <ClueConnectIntro
        stage={stage}
        firstCase={stage.cases[0]}
        onStart={startGame}
      />
    );
  }

  if (!currentCase) return null;

  return (
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] text-[#0b0b0f]">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
            {currentCase.category}
          </p>
          <p className="max-w-[250px] text-[13px] font-bold leading-tight text-[#343238]">
            {stage.prompt}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: maxMistakes }).map((_, index) => (
            <span
              key={index}
              className="material-symbols-outlined text-[18px]"
              style={{
                color: index < mistakesLeft ? "#f05d5e" : "#d8d0c3",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              favorite
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 py-2 shadow-[0_3px_0_rgba(11,11,15,0.16)]">
          <span className="text-[12px] font-extrabold">
            Clues found
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: trueCount }).map((_, index) => (
              <span
                key={index}
                className="h-2.5 w-2.5 rounded-full border-2 border-[#0b0b0f]"
                style={{ background: index < foundCount ? "#85cb57" : "#fffdf7" }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-3 pb-4">
        <div
          data-clue-board
          className="relative h-full min-h-[470px] overflow-hidden rounded-[22px] border-[3px] border-[#0b0b0f] bg-[#fff27a] shadow-[0_7px_0_#0b0b0f]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(11,11,15,.13) 1.4px, transparent 1.4px), radial-gradient(rgba(255,255,255,.45) 1.4px, transparent 1.4px)",
            backgroundSize: "14px 14px, 18px 18px",
            backgroundPosition: "0 0, 7px 8px",
            touchAction: "none",
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {currentState.connectedIds.map((clueId, index) => {
              const clue = boardClues.find((item) => item.id === clueId);
              if (!clue) return null;
              return (
                <path
                  key={clueId}
                  d={makeStringPath(SUBJECT_POINT, { x: clue.x, y: clue.y - 5 })}
                  fill="none"
                  stroke={STRING_COLORS[index % STRING_COLORS.length]}
                  strokeLinecap="round"
                  strokeWidth="1.3"
                />
              );
            })}
            {tempLine ? (
              <line
                x1={SUBJECT_POINT.x}
                y1={SUBJECT_POINT.y}
                x2={tempLine.x}
                y2={tempLine.y}
                stroke="#0b0b0f"
                strokeDasharray="2.5 2.5"
                strokeLinecap="round"
                strokeWidth="1.1"
              />
            ) : null}
          </svg>

          {boardClues.map((clue) => (
            <motion.button
              key={clue.id}
              type="button"
              data-clue-id={clue.id}
              onClick={() => {
                if (stringDragActive.current) return;
                handleClueHit(clue.id);
              }}
              className={`absolute z-10 flex min-h-[72px] w-[118px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-[3px] border-[#0b0b0f] px-2 pb-2 pt-4 text-center text-[11px] font-extrabold leading-tight shadow-[0_4px_0_rgba(11,11,15,0.2)] transition ${currentState.shakingId === clue.id ? "animate-[clue-shake_.38s_ease]" : ""} ${currentState.ruledOutIds.includes(clue.id) ? "opacity-50 grayscale" : ""}`}
              style={{
                left: `${clue.x}%`,
                top: `${clue.y}%`,
                background: currentState.connectedIds.includes(clue.id)
                  ? "#d7e96c"
                  : clue.color,
                transform: `translate(-50%, -50%) rotate(${clue.rotation}deg)`,
              }}
              disabled={disabled || currentState.solvedCase}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#0b0b0f] bg-[#f05d5e]" />
              {clue.text}
            </motion.button>
          ))}

          <motion.button
            type="button"
            onPointerDown={beginStringDrag}
            className="absolute z-20 flex h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center justify-center rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_7px_0_#0b0b0f] active:cursor-grabbing"
            style={{ left: `${SUBJECT_POINT.x}%`, top: `${SUBJECT_POINT.y}%` }}
            disabled={disabled || currentState.solvedCase}
            whileTap={{ y: 3, boxShadow: "0 3px 0 #0b0b0f" }}
          >
            <span className="material-symbols-outlined text-[34px] text-[#4aa8ee]">
              neurology
            </span>
            <span className="mt-1 max-w-[78px] text-center text-[11px] font-extrabold leading-none">
              Mystery match
            </span>
          </motion.button>

          <AnimatePresence>
            {currentState.solvedCase ? (
              <motion.div
                className="absolute inset-x-5 bottom-5 z-30 rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-4 text-center shadow-[0_6px_0_#0b0b0f]"
                initial={{ opacity: 0, y: 18, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: 18 }}
              >
                <p className="font-display text-[26px] leading-none">
                  {currentCase.answer}
                </p>
                <p className="mt-2 text-[12px] font-bold leading-snug text-[#343238]">
                  {currentCase.fact}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {currentState.toast ? (
              <motion.div
                className="absolute left-1/2 top-4 z-40 -translate-x-1/2 rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 py-2 text-[12px] font-extrabold shadow-[0_3px_0_#0b0b0f]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {currentState.toast}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ClueConnectIntro({
  stage,
  firstCase,
  onStart,
}: {
  stage: ClueConnectStage;
  firstCase?: ClueConnectCase;
  onStart: () => void;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#f6f2ec] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative mb-10 h-[250px] w-full max-w-[360px]">
          <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#0b0b0f] bg-[#fff27a]" />
          {[
            { label: firstCase?.clues[0]?.text ?? "True clue", color: "#d7e96c", left: "3%", top: "18%", rotate: -12 },
            { label: firstCase?.clues[1]?.text ?? "Second clue", color: "#d9c3ff", left: "56%", top: "8%", rotate: 10 },
            { label: firstCase?.answer ?? "Mystery", color: "#66cfd3", left: "31%", top: "52%", rotate: -3 },
          ].map((card, index) => (
            <motion.div
              key={`${card.label}:${index}`}
              className="absolute flex h-[92px] w-[126px] items-center justify-center rounded-md border-[3px] border-[#0b0b0f] px-3 text-center text-[12px] font-extrabold leading-tight shadow-[0_5px_0_rgba(11,11,15,0.18)]"
              style={{
                left: card.left,
                top: card.top,
                rotate: `${card.rotate}deg`,
                background: card.color,
              }}
              initial={{ opacity: 0, y: 20, rotate: card.rotate - 6 }}
              animate={{ opacity: 1, y: [0, -7, 0], rotate: [card.rotate, card.rotate + 3, card.rotate] }}
              transition={{
                opacity: { duration: 0.24, delay: index * 0.1 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {card.label}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
            {stage.introLabel ?? "Clue Connect"}
          </p>
          <h1 className="font-display text-[36px] leading-none">
            {stage.question}
          </h1>
          <p className="mx-auto mt-3 max-w-[310px] text-[15px] font-semibold leading-snug text-[#343238]">
            {stage.prompt}
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        className="relative h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f]"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0 #0b0b0f" }}
        transition={{ delay: 0.46, duration: 0.3 }}
      >
        Play
      </motion.button>
    </div>
  );
}

function createInitialState(key: string) {
  return {
    key,
    caseIndex: 0,
    connectedIds: [] as string[],
    ruledOutIds: [] as string[],
    mistakes: 0,
    solvedCase: false,
    dragPoint: null as Point | null,
    toast: null as string | null,
    shakingId: null as string | null,
    stageComplete: false,
  };
}

function buildBoardClues(
  currentCase: ClueConnectCase | undefined,
  seedKey: string,
): BoardClue[] {
  if (!currentCase) return [];
  const shuffled = seededShuffle(currentCase.clues, hashString(seedKey));
  return shuffled.map((clue, index) => {
    const slot = currentCase.clueSlots[index] ?? fallbackSlot(index);
    return {
      ...clue,
      x: slot.x,
      y: slot.y,
      rotation: ((hashString(`${seedKey}:${clue.id}`) % 11) - 5),
      color: CARD_COLORS[index % CARD_COLORS.length],
    };
  });
}

function makeStringPath(start: Point, end: Point) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2 + 6;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  let nextSeed = seed;
  for (let index = result.length - 1; index > 0; index--) {
    nextSeed = (nextSeed * 1664525 + 1013904223) >>> 0;
    const swapIndex = nextSeed % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function fallbackSlot(index: number) {
  return [
    { x: 18, y: 19 },
    { x: 82, y: 18 },
    { x: 15, y: 51 },
    { x: 85, y: 53 },
    { x: 23, y: 83 },
    { x: 78, y: 84 },
  ][index % 6];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
