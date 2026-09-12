"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { KnockoutCard, KnockoutStage } from "@/types/gameplay";

type Props = {
  stage: KnockoutStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
};

const DEFAULT_TIME_LIMIT = 3;
const FACE_COLORS = ["#83c34e", "#f4c430", "#39c6d9", "#f2914b", "#4a90e2", "#b48ce0"];
const COUNTDOWN_COLOR = "#85cb57";
const DANGER_COLOR = "#f05d5e";
const TICK_MS = 60;

export function KnockoutInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const resetKey = `${stage.id}:${retryCount}`;
  const timeLimit = stage.timeLimit ?? DEFAULT_TIME_LIMIT;

  const [champIndex, setChampIndex] = useState(0);
  const [challengerIndex, setChallengerIndex] = useState(1);
  const [queueIndex, setQueueIndex] = useState(2);
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [lastResult, setLastResult] = useState<{
    side: "champ" | "chal" | "timeout";
    correct: boolean;
  } | null>(null);
  const [remaining, setRemaining] = useState(timeLimit);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [started, setStarted] = useState(false);

  const submittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const champ = useMemo(() => stage.cards[champIndex], [stage.cards, champIndex]);
  const challenger = useMemo(
    () => (challengerIndex < stage.cards.length ? stage.cards[challengerIndex] : null),
    [stage.cards, challengerIndex],
  );
  const remainingCards = stage.cards.length - queueIndex;
  const totalFaceOffs = Math.max(stage.cards.length - 1, 1);

  // Cards always swoop in from their side of the arena — champ from the
  // left, challenger from the right — for every face-off.
  const champEntry = "left";
  const challengerEntry = "right";

  // Reset everything when the stage or retry changes
  useEffect(() => {
    submittedRef.current = false;
    setChampIndex(0);
    setChallengerIndex(1);
    setQueueIndex(2);
    setRound(0);
    setRevealed(false);
    setEnded(false);
    setLastResult(null);
    setRemaining(timeLimit);
    setCorrectTaps(0);
    setStarted(false);
  }, [resetKey, timeLimit]);

  // Timer
  useEffect(() => {
    if (!started || revealed || ended || !challenger || disabled) return;

    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.max(timeLimit - elapsed, 0);
      setRemaining(next);
      if (next <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRevealed(true);
        setLastResult({ side: "timeout", correct: false });
      }
    };
    tick();
    timerRef.current = setInterval(tick, TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, revealed, ended, challenger, disabled, timeLimit, round]);

  function submit(side: "champ" | "chal") {
    if (revealed || ended || !challenger) return;
    const correct =
      side === "champ"
        ? champ.value > challenger.value
        : challenger.value > champ.value;
    if (correct) setCorrectTaps((count) => count + 1);
    setRevealed(true);
    setLastResult({ side, correct });
  }

  // After each reveal, advance the winner and deal the next challenger
  useEffect(() => {
    if (!revealed || ended || !challenger) return;

    const timer = window.setTimeout(() => {
      const winnerIndex =
        champ.value > challenger.value ? champIndex : challengerIndex;
      const nextChallengerIndex = queueIndex;

      if (nextChallengerIndex >= stage.cards.length) {
        setEnded(true);
        return;
      }

      setChampIndex(winnerIndex);
      setChallengerIndex(nextChallengerIndex);
      setQueueIndex((index) => index + 1);
      setRound((value) => value + 1);
      setRevealed(false);
      setLastResult(null);
      setRemaining(timeLimit);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    revealed,
    ended,
    challenger,
    champ.value,
    champIndex,
    challengerIndex,
    queueIndex,
    stage.cards.length,
    timeLimit,
  ]);

  // When every card has been dealt, report the result once
  useEffect(() => {
    if (!ended || submittedRef.current) return;
    submittedRef.current = true;
    const perfectRun = correctTaps === totalFaceOffs;
    onAnswer({
      correct: perfectRun,
      feedback: perfectRun ? stage.feedback.complete : stage.feedback.incorrect,
    });
  }, [ended, correctTaps, totalFaceOffs, onAnswer, stage.feedback]);

  function startGame() {
    if (disabled) return;
    onIntroComplete?.();
  }

  function handleTap(side: "champ" | "chal") {
    if (revealed || ended || !challenger) return;
    submit(side);
  }

  const progressPct = (remaining / timeLimit) * 100;
  const seconds = Math.ceil(remaining);
  const lastWholeSecond = typeof seconds === "number" ? seconds : timeLimit;
  const showValue = revealed && lastResult?.side !== "timeout";

  if (showIntro) {
    return (
      <KnockoutIntro
        stage={stage}
        cards={stage.cards.slice(0, 2)}
        onStart={startGame}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] px-4 pb-6 pt-3 text-[#0b0b0f]">
      {/* Question — always visible during play */}
      <div className="mb-3 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#0b0b0f] bg-[#fffdf7] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest shadow-[0_2px_0_#0b0b0f]">
          <span className="material-symbols-outlined text-[13px]">sports_mma</span>
          {stage.introLabel ?? "Knockout"}
        </span>
        <h1 className="font-display text-[26px] leading-none">{stage.question}</h1>
      </div>

      {/* Progress + label */}
      <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-[#343238]">
        <span className="inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">style</span>
          Streak
        </span>
        <span>
          {Math.max(remainingCards + 1, 0)} of {stage.cards.length} remaining
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7]">
          <div
            className="h-full transition-[width]"
            style={{
              width: `${started ? progressPct : 100}%`,
              background:
                started && progressPct > 30 ? COUNTDOWN_COLOR : DANGER_COLOR,
            }}
          />
        </div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={lastWholeSecond + (revealed ? "-revealed" : "")}
            initial={{ scale: 1.35, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-8 text-right font-display text-[30px] leading-none"
            style={{ color: revealed ? "#7f766b" : !started ? "#c8c1b6" : seconds <= 1 ? DANGER_COLOR : COUNTDOWN_COLOR }}
          >
            {revealed ? "" : started ? seconds : timeLimit}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Arena */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center gap-2.5 py-2">
        {champ && challenger ? (
          <>
            <KnockoutCardView
              key={`champ:${round}:${champ.id}`}
              card={champ}
              colorIndex={round}
              side="champ"
              entry={champEntry}
              state={
                lastResult?.side === "champ"
                  ? lastResult.correct
                    ? "correct"
                    : "wrong"
                  : lastResult?.side === "timeout"
                    ? "revealed"
                    : "idle"
              }
              showValue={showValue}
              onTap={() => handleTap("champ")}
              disabled={disabled || revealed || ended || !started}
            />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#0b0b0f] text-[11px] font-extrabold text-[#fffdf7]">
              VS
            </div>
            <KnockoutCardView
              key={`chal:${round}:${challenger.id}`}
              card={challenger}
              colorIndex={round + 1}
              side="chal"
              entry={challengerEntry}
              state={
                lastResult?.side === "chal"
                  ? lastResult.correct
                    ? "correct"
                    : "wrong"
                  : lastResult?.side === "timeout"
                    ? "wrong"
                    : "idle"
              }
              showValue={showValue}
              onTap={() => handleTap("chal")}
              disabled={disabled || revealed || ended || !started}
            />
          </>
        ) : null}

        {/* Play Now overlay */}
        <AnimatePresence>
          {!started && !ended ? (
            <motion.div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#f6f2ec]/70 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-[13px] font-bold text-[#343238]">
                {stage.instructions ?? "Pick the winner before the timer runs out"}
              </span>
              <motion.button
                type="button"
                onClick={() => setStarted(true)}
                className="relative h-14 w-full max-w-[300px] rounded-full border-[3px] border-[#0b0b0f] bg-[#f7d91f] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f]"
                initial={{ scale: 0.96, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
              >
                ▶ Play Now
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Message */}
      <div className="flex h-10 items-center justify-center text-center text-[13px] font-bold text-[#343238]">
        <AnimatePresence mode="wait">
          {revealed && lastResult ? (
            <motion.span
              key={lastResult.side + (lastResult.correct ? "-c" : "-w")}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {lastResult.side === "timeout"
                ? stage.feedback.timeout
                : lastResult.correct
                  ? stage.feedback.correct
                  : stage.feedback.incorrect}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {started
                ? (stage.instructions ?? "Tap the card you think wins")
                : "Ready to play?"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function KnockoutCardView({
  card,
  colorIndex,
  side,
  entry,
  state,
  showValue,
  onTap,
  disabled,
}: {
  card: KnockoutCard;
  colorIndex: number;
  side: "champ" | "chal";
  entry: "left" | "right" | "top" | "bottom";
  state: "idle" | "revealed" | "correct" | "wrong";
  showValue: boolean;
  onTap: () => void;
  disabled: boolean;
}) {
  const color = FACE_COLORS[colorIndex % FACE_COLORS.length];

  // Entry offset from whichever side the card slides in from
  const entryOffset = useMemo(() => {
    switch (entry) {
      case "left":
        return { x: -320, y: 0, rotate: -14, delay: 0 };
      case "right":
        return { x: 320, y: 0, rotate: 14, delay: 0 };
      case "top":
        return { x: 0, y: -280, rotate: -8, delay: 0 };
      case "bottom":
        return { x: 0, y: 280, rotate: 8, delay: 0 };
    }
  }, [entry]);

  return (
    <motion.button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`group relative h-[216px] w-[142px] overflow-hidden rounded-[20px] border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_8px_0_rgba(11,11,15,0.2)] focus:outline-none ${
        state === "correct"
          ? "border-[#85cb57] shadow-[0_8px_0_#0b0b0f,0_0_24px_rgba(133,203,87,0.5)]"
          : state === "wrong"
            ? "border-[#f05d5e]"
            : ""
      } ${!disabled ? "cursor-pointer transition-transform duration-150 hover:-translate-y-1" : ""}`}
      initial={{
        opacity: 0,
        x: entryOffset.x,
        y: entryOffset.y,
        scale: 0.8,
        rotate: entryOffset.rotate,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: state === "correct" ? [1, 1.08, 0.97, 1] : 1,
        rotate: 0,
      }}
      transition={{
        opacity: { duration: 0.18, ease: "easeOut", delay: entryOffset.delay },
        x: { type: "spring", stiffness: 520, damping: 30, delay: entryOffset.delay },
        y: { type: "spring", stiffness: 520, damping: 30, delay: entryOffset.delay },
        scale: { duration: 0.3, ease: "easeInOut", delay: entryOffset.delay },
        rotate: { duration: 0.18, ease: "easeOut", delay: entryOffset.delay },
      }}
      whileTap={!disabled ? { scale: 0.96, y: 2 } : undefined}
      aria-label={`${card.label}, tap to pick this card`}
    >
      {/* face */}
      <div
        className="relative flex h-[128px] items-center justify-center border-b-[3px] border-[#0b0b0f] text-[48px]"
        style={{
          background: `linear-gradient(145deg, ${color} 0%, ${color}cc 55%, ${color}99 100%)`,
        }}
      >
        {/* paper grain dots */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#0b0b0f_1px,transparent_1px)] [background-size:10px_10px]" />
        <span className="relative drop-shadow-[0_2px_0_rgba(11,11,15,0.25)]">
          {card.icon}
        </span>
        {/* corner badge */}
        <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7] text-[9px] font-extrabold shadow-[0_1px_0_#0b0b0f]">
          {side === "champ" ? "C" : "N"}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-col items-center justify-center gap-1 p-2">
        <span
          className={`max-w-[110px] text-center text-[14px] font-extrabold leading-tight ${
            state === "correct"
              ? "text-[#4d8a2c]"
              : state === "wrong"
                ? "text-[#a33232]"
                : "text-[#0b0b0f]"
          }`}
        >
          {card.label}
        </span>
        <span className="h-px w-10 bg-[#0b0b0f]/15" />
        <div className="flex h-5 items-center">
          <AnimatePresence mode="wait">
            {showValue ? (
              <motion.span
                key="val"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[13px] font-extrabold tracking-tight"
                style={{
                  color:
                    state === "correct"
                      ? "#4d8a2c"
                      : state === "wrong"
                        ? "#a33232"
                        : "#6b6459",
                }}
              >
                {card.value.toLocaleString()} {card.unit}
              </motion.span>
            ) : (
              <motion.span
                key="q"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-[16px] font-bold text-[#c8c1b6]"
              >
                ?
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* top highlight */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/40 to-transparent" />
    </motion.button>
  );
}

function KnockoutIntro({
  stage,
  cards,
  onStart,
}: {
  stage: KnockoutStage;
  cards: KnockoutCard[];
  onStart: () => void;
}) {
  const timeLimit = stage.timeLimit ?? DEFAULT_TIME_LIMIT;

  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#f6f2ec] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative mb-10 h-[280px] w-full max-w-[390px]">
          {cards.map((card, index) => {
            const color = FACE_COLORS[index % FACE_COLORS.length];
            return (
              <motion.div
                key={card.id}
                className="absolute top-6"
                style={{
                  left: index === 0 ? "7%" : "58%",
                }}
                initial={{
                  opacity: 0,
                  y: index === 0 ? 30 : -20,
                  rotate: index === 0 ? -18 : 12,
                }}
                animate={{
                  opacity: 1,
                  y: [index === 0 ? 30 : -20, 0, index === 0 ? 8 : -8, 0],
                  rotate: index === 0 ? [-18, -13, -17] : [12, 16, 11],
                }}
                transition={{
                  opacity: { duration: 0.24, delay: index * 0.12 },
                  y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <IntroCard card={card} color={color} />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
            <span className="material-symbols-outlined text-[14px]">sports_mma</span>
            {stage.introLabel ?? "Knockout"}
          </p>
          <h1 className="font-display text-[36px] leading-none">{stage.question}</h1>
          <p className="mx-auto mt-3 max-w-[310px] text-[15px] font-semibold leading-snug text-[#343238]">
            {stage.instructions ??
              `Tap the card you think is the winner. In ${timeLimit}s, the stronger card keeps its place and takes on the next challenger.`}
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

function IntroCard({ card, color }: { card: KnockoutCard; color: string }) {
  return (
    <div className="flex h-[220px] w-[150px] flex-col overflow-hidden rounded-[20px] border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_8px_0_rgba(11,11,15,0.2)]">
      <div
        className="relative flex h-[128px] items-center justify-center border-b-[3px] border-[#0b0b0f] text-[48px]"
        style={{
          background: `linear-gradient(145deg, ${color} 0%, ${color}cc 55%, ${color}99 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#0b0b0f_1px,transparent_1px)] [background-size:10px_10px]" />
        <span className="relative drop-shadow-[0_2px_0_rgba(11,11,15,0.25)]">
          {card.icon}
        </span>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-2">
        <span className="text-center text-[15px] font-extrabold leading-tight">
          {card.label}
        </span>
        <span className="h-px w-10 bg-[#0b0b0f]/15" />
        <span className="font-display text-[16px] font-bold text-[#c8c1b6]">
          ?
        </span>
      </div>
    </div>
  );
}