"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { matchPairQuestionId, stageQuestions } from "@/features/gameplay/scoring";
import type { MatchPair, MatchPairsStage } from "@/types/gameplay";

type Side = "clue" | "answer";
type SelectedCard = { side: Side; id: string };
type Round = { clueIds: string[]; answerIds: string[] };
type PairStatus = "correct";

type Props = {
  stage: MatchPairsStage;
  onAnswer: (payload: {
    correct: boolean;
    feedback: string;
    singlePass?: boolean;
    allowSkip?: boolean;
    results?: Array<{ questionId: string; isCorrect: boolean; points: number }>;
  }) => void;
  disabled?: boolean;
  retryCount?: number;
  attemptsRemaining?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

type IntroProps = {
  stage: MatchPairsStage;
  onStart: () => void;
  disabled?: boolean;
};

function shuffle<T>(items: readonly T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createRound(pairs: MatchPair[]): Round {
  const ids = pairs.map((pair) => pair.id);
  return { clueIds: shuffle(ids), answerIds: shuffle(ids) };
}

function answerLabel(pair: MatchPair) {
  return pair.answer.caption ?? pair.answer.text ?? pair.answer.imageAlt ?? pair.id;
}

function AnswerContents({ pair }: { pair: MatchPair }) {
  const { answer } = pair;
  const label = answer.caption ?? answer.text;
  const hasVisual = Boolean(answer.image || answer.emoji || answer.background);

  return (
    <>
      {hasVisual ? (
        <div
          className="flex w-full min-h-16 items-center justify-center overflow-hidden rounded-lg border-2 border-[#0b0b0f] bg-[#f6f2ec]"
          style={answer.background ? { background: answer.background } : undefined}
        >
          {answer.image ? (
            <img
              src={answer.image}
              alt={answer.imageAlt ?? label ?? ""}
              className="h-full min-h-16 w-full object-cover"
            />
          ) : answer.emoji ? (
            <span aria-hidden="true" className="text-4xl leading-none">{answer.emoji}</span>
          ) : null}
        </div>
      ) : null}
      {label ? <span className="text-center text-[14px] font-extrabold leading-snug">{label}</span> : null}
    </>
  );
}

function MatchPairsIntro({ stage, onStart, disabled }: IntroProps) {
  const previewPairs = stage.pairs.slice(0, 2);

  return (
    <div className="flex min-h-[calc(100dvh-86px)] flex-col bg-[#f6f2ec] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div aria-hidden="true" className="mb-10 grid w-full max-w-[360px] grid-cols-2 gap-3">
          {previewPairs.map((pair, index) => (
            <div
              key={pair.id}
              className={`rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-4 text-left shadow-[0_5px_0_rgba(11,11,15,0.18)] ${index === 1 ? "translate-y-5" : "-translate-y-2"}`}
            >
              <div className="mb-3 h-2 w-10 rounded-full bg-[#85cb57]" />
              <p className="line-clamp-4 text-xs font-bold leading-snug">{pair.clue}</p>
            </div>
          ))}
        </div>
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
          {stage.introLabel ?? "Match the pairs"}
        </p>
        <h1 className="font-display text-[36px] leading-none">{stage.question}</h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] font-semibold leading-snug text-[#343238]">{stage.prompt}</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={disabled}
        className="h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-1 active:shadow-[0_1px_0_#0b0b0f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start matching
      </button>
    </div>
  );
}

export function MatchPairsInteraction({
  stage,
  onAnswer,
  disabled = false,
  retryCount = 0,
  attemptsRemaining = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const resetKey = `${stage.id}:${retryCount}`;
  const [round] = useState<Round>(() => createRound(stage.pairs));
  const [statusById, setStatusById] = useState<Record<string, PairStatus>>({});
  const [selected, setSelected] = useState<SelectedCard | null>(null);
  const [incorrectPair, setIncorrectPair] = useState<{ clueId: string; answerId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);
  const answeredKey = useRef<string | null>(null);
  const pairsById = useMemo(() => new Map(stage.pairs.map((pair) => [pair.id, pair])), [stage.pairs]);

  useEffect(() => {
    // Retry starts the unresolved portion again, but keeps established pairs
    // on the board. The renderer keeps this component mounted for its stage.
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setStatusById({});
  }, [stage.id]);

  useEffect(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setSelected(null);
    setIncorrectPair(null);
    setBusy(false);
    answeredKey.current = null;
  }, [retryCount]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function after(delay: number, callback: () => void) {
    const timer = window.setTimeout(() => {
      timers.current = timers.current.filter((item) => item !== timer);
      callback();
    }, delay);
    timers.current.push(timer);
  }

  function resultsFor(statuses: Record<string, PairStatus>) {
    const pointsByQuestionId = new Map(stageQuestions(stage).map((question) => [question.id, question.points]));
    return stage.pairs.map((pair) => {
      const questionId = matchPairQuestionId(stage.id, pair.id);
      const isCorrect = statuses[pair.id] === "correct";
      return { questionId, isCorrect, points: isCorrect ? pointsByQuestionId.get(questionId) ?? 0 : 0 };
    });
  }

  function submitSolvedRound(resultsByPair: Record<string, PairStatus>) {
    onAnswer({
      correct: true,
      feedback: stage.feedback.correct,
      results: resultsFor(resultsByPair),
    });
  }

  function choose(side: Side, id: string) {
    const status = statusById[id];
    if (disabled || busy || (side === "clue" && status) || (side === "answer" && status === "correct")) return;

    if (!selected) {
      setSelected({ side, id });
      return;
    }

    if (selected.side === side) {
      setSelected(selected.id === id ? null : { side, id });
      return;
    }

    const clueId = selected.side === "clue" ? selected.id : id;
    const answerId = selected.side === "answer" ? selected.id : id;
    const isMatch = clueId === answerId;
    setSelected(null);

    if (isMatch) {
      const nextStatus = { ...statusById, [clueId]: "correct" as const };
      setStatusById(nextStatus);
      setBusy(true);
      if (Object.keys(nextStatus).length === stage.pairs.length && answeredKey.current !== resetKey) {
        answeredKey.current = resetKey;
        after(320, () => submitSolvedRound(nextStatus));
      } else {
        after(220, () => setBusy(false));
      }
      return;
    }

    setBusy(true);
    setIncorrectPair({ clueId, answerId });
    const correct = Object.keys(statusById).length;

    // A wrong connection ends the current attempt. Before the final attempt,
    // omit results so Retry starts with a clean pair ledger. The modal does
    // not offer Skip in that state. On the last attempt, submit every pair so
    // completion still has the full server-validated result set.
    onAnswer({
      correct: false,
      allowSkip: false,
      feedback: attemptsRemaining <= 1
        ? `You got ${correct} of ${stage.pairs.length} right. ${stage.feedback.incorrect}`
        : stage.feedback.incorrect,
      results: attemptsRemaining <= 1 ? resultsFor(statusById) : [],
    });
  }

  if (showIntro) {
    return (
      <MatchPairsIntro
        stage={stage}
        disabled={disabled}
        onStart={() => {
          if (!disabled) onIntroComplete?.();
        }}
      />
    );
  }

  const total = stage.pairs.length;
  const answeredCount = Object.keys(statusById).length;
  const correctCount = Object.values(statusById).filter((status) => status === "correct").length;
  const progress = Math.round((answeredCount / total) * 100);

  return (
    <div className="min-h-[calc(100dvh-86px)] bg-[#f6f2ec] px-4 pb-8 pt-6 text-[#0b0b0f]">
      <header className="mb-5 text-center">
        <p className="text-sm font-semibold text-[#746a5c]">{stage.eyebrow ?? "Today’s Puzzle"}</p>
        <h1 className="mt-1 font-serif text-[32px] font-bold leading-none tracking-tight">{stage.title ?? stage.mapTitle}</h1>
        <p className="mt-2 text-sm font-semibold text-[#746a5c]">{correctCount} correct · {answeredCount} of {total} answered</p>
        <div
          className="mx-auto mt-3 h-2 w-full max-w-[360px] overflow-hidden rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7]"
          aria-label={`${answeredCount} of ${total} pairs answered`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answeredCount}
        >
          <div className="h-full bg-[#85cb57] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-[13px] font-bold text-[#343238]">{stage.prompt}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-3" aria-label="Match clues with answers">
        <div className="flex flex-col gap-3">
          {round.clueIds.map((id) => {
            const pair = pairsById.get(id);
            if (!pair) return null;
            const status = statusById[id];
            const isSelected = selected?.side === "clue" && selected.id === id;
            const incorrect = incorrectPair?.clueId === id;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled || busy || Boolean(status)}
                aria-pressed={isSelected}
                onClick={() => choose("clue", id)}
                className={`rounded-[14px] border-2 border-b-4 px-3 py-3 text-left text-[14px] font-bold leading-snug transition ${status === "correct" ? "border-[#4c9a1f] bg-[#d9f2c4] opacity-45" : incorrect ? "border-[#d33a2c] bg-[#ffd6d2] animate-pulse" : isSelected ? "bg-[#fff1c2] translate-y-0.5" : "bg-[#fffdf7] active:translate-y-0.5"}`}
              >
                {pair.clue}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {round.answerIds.map((id) => {
            const pair = pairsById.get(id);
            if (!pair) return null;
            const matched = statusById[id] === "correct";
            const isSelected = selected?.side === "answer" && selected.id === id;
            const incorrect = incorrectPair?.answerId === id;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled || busy || matched}
                aria-label={`Answer: ${answerLabel(pair)}`}
                aria-pressed={isSelected}
                onClick={() => choose("answer", id)}
                className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-b-4 p-2 transition ${matched ? "border-[#4c9a1f] bg-[#d9f2c4] opacity-45" : incorrect ? "border-[#d33a2c] bg-[#ffd6d2] animate-pulse" : isSelected ? "bg-[#fff1c2] translate-y-0.5" : "bg-[#fffdf7] active:translate-y-0.5"}`}
              >
                <AnswerContents pair={pair} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
