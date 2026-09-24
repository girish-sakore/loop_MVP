"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { parsePrompt, type PromptPart } from "@/features/interactions/fill-blank/parse-prompt";
import { FillBlankTextHintPopup } from "./fill-blank-text-hint-popup";
import type { FillBlankTextStage } from "@/types/gameplay";

type Option = FillBlankTextStage["blanks"][number];
type CardStatus = "unanswered" | "correct" | "wrong" | "skipped";

type Props = {
  // Pass either one stage (old call sites keep working) or an array (enables nav/skip).
  stage?: FillBlankTextStage;
  stages?: FillBlankTextStage[];
  onStageAnswered?: (payload: { stageId: string; correct: boolean; feedback: string }) => void;
  onAnswer?: (payload: {
    correct: boolean;
    feedback: string;
    points?: number;
    totalAnswers?: number;
    correctAnswers?: number;
  }) => void;
  onComplete?: (results: Record<string, CardStatus>) => void;
  disabled?: boolean;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

const DEFAULT_HINTS = 3;

export function FillBlankTextInteraction({
  stage: singleStage,
  stages,
  onStageAnswered,
  onAnswer,
  onComplete,
  disabled,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const stageList = useMemo(
    () => stages ?? (singleStage ? [singleStage] : []),
    [stages, singleStage],
  );

  const [introDone, setIntroDone] = useState(!showIntro);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByStage, setAnswersByStage] = useState<Record<string, Record<string, string>>>({});
  const [statusByStage, setStatusByStage] = useState<Record<string, CardStatus>>({});
  const [hintsByStage, setHintsByStage] = useState<Record<string, number>>({});
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);

  const stage = stageList[Math.min(currentIndex, Math.max(stageList.length - 1, 0))];
  const total = stageList.length;
  const showPager = total > 1;
  const atStart = currentIndex === 0;
  const atEnd = currentIndex === total - 1;

  const parts = useMemo<PromptPart[]>(() => parsePrompt(stage?.prompt ?? ""), [stage?.prompt]);
  const blanksById = useMemo(
    () => new Map((stage?.blanks ?? []).map((b) => [b.id, b] as const)),
    [stage?.blanks],
  );

  if (!stage) {
    return (
      <div className="flex min-h-[calc(100dvh-86px)] items-center justify-center bg-[#FDF9F1] text-[#2B2A25]">
        <p className="text-sm font-semibold text-[#8a8878]">No fill-in-the-blank stages to show.</p>
      </div>
    );
  }

  const answers = answersByStage[stage.id] ?? Object.fromEntries(stage.blanks.map((b) => [b.id, ""]));
  const status = statusByStage[stage.id] ?? "unanswered";
  const hintsRemaining = hintsByStage[stage.id] ?? DEFAULT_HINTS;
  const allFilled = stage.blanks.every((blank) => answers[blank.id]?.trim());

  function handleInputChange(blankId: string, value: string) {
    if (disabled) return;
    setAnswersByStage((prev) => ({
      ...prev,
      [stage.id]: { ...(prev[stage.id] ?? {}), [blankId]: value },
    }));
  }

  function handleCheckGuess() {
    if (disabled || !allFilled) return;

    const correct = stage.blanks.every((blank) => {
      const userAnswer = (answers[blank.id] ?? "").trim();
      return userAnswer.toLowerCase() === blank.answer.toLowerCase();
    });

    const nextStatusByStage: Record<string, CardStatus> = {
      ...statusByStage,
      [stage.id]: correct ? "correct" : "wrong",
    };
    setStatusByStage(nextStatusByStage);

    const feedback = correct
      ? stage.feedback?.correct ?? "Correct!"
      : stage.feedback?.incorrect ?? "Not quite. Try again!";

    onStageAnswered?.({ stageId: stage.id, correct, feedback });
    if (Object.values(nextStatusByStage).filter((value) => value !== "unanswered").length === total) {
      submitRound(nextStatusByStage);
    }
  }

  function handleHint() {
    if (disabled || hintsRemaining <= 0) return;

    const firstUnfilled = stage.blanks.find((blank) => !(answers[blank.id]?.trim()));
    const firstWrong = stage.blanks.find(
      (blank) =>
        answers[blank.id]?.trim() &&
        answers[blank.id]!.trim().toLowerCase() !== blank.answer.toLowerCase(),
    );
    const target = firstUnfilled ?? firstWrong ?? stage.blanks[0];

    if (target?.hint) {
      setActiveHint(target.hint);
    } else if (target) {
      setActiveHint(`Hint: This answer starts with "${target.answer.charAt(0).toUpperCase()}".`);
    }
    setHintVisible(true);
    setHintsByStage((prev) => ({ ...prev, [stage.id]: hintsRemaining - 1 }));
  }

  function goTo(index: number) {
    if (index < 0 || index >= total) return;
    setHintVisible(false);
    setCurrentIndex(index);
  }

  function handleSkip() {
    const nextStatusByStage: Record<string, CardStatus> = {
      ...statusByStage,
      [stage.id]: statusByStage[stage.id] === "correct" ? "correct" : "skipped",
    };
    setStatusByStage(nextStatusByStage);
    if (Object.values(nextStatusByStage).filter((value) => value !== "unanswered").length === total) {
      submitRound(nextStatusByStage);
      return;
    }
    goTo(currentIndex + 1);
  }

  function submitRound(results: Record<string, CardStatus>) {
    const correctAnswers = stageList.filter((item) => results[item.id] === "correct").length;
    const points = stageList.reduce(
      (totalPoints, item) => totalPoints + (results[item.id] === "correct" ? item.points : 0),
      0,
    );
    const roundCorrect = correctAnswers === total;
    onComplete?.(results);
    onAnswer?.({
      correct: roundCorrect,
      feedback: roundCorrect ? stage.feedback?.correct ?? "Correct!" : stage.feedback?.incorrect ?? "Not quite. Try again!",
      points,
      totalAnswers: total,
      correctAnswers,
    });
  }

  if (!introDone) {
    return (
      <div className="flex min-h-[calc(100dvh-86px)] flex-col bg-[#FDF9F1] px-5 pb-10 pt-8 text-[#2B2A25]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="rounded-full border-[3px] border-[#2B2A25] bg-[#53BCD1] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#0b0b0b] shadow-[0_3px_0_#2B2A25]">
            {stage.introLabel ?? "Fill in the Blank"}
          </span>

          <motion.div
            className="my-10 flex h-40 w-40 items-center justify-center rounded-[22px] border-[3px] border-[#2B2A25] bg-[#FFFDF7] shadow-[0_8px_0_rgba(43,42,37,0.18)]"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
          >
            <span
              className="material-symbols-outlined text-[36px] text-[#2B2A25]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              edit_note
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-[34px] leading-none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.28 }}
          >
            {stage.question}
          </motion.h1>
          <motion.p
            className="mt-3 max-w-[300px] text-[16px] font-semibold leading-snug text-[#5c5849]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.28 }}
          >
            Read the prompt, then fill in each blank with the correct word.
          </motion.p>
        </div>

        <motion.button
          type="button"
          disabled={disabled}
          onClick={() => {
            setIntroDone(true);
            onIntroComplete?.();
          }}
          className="h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#2B2A25] bg-[#FBAE4B] text-[17px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[0_2px_0_#2B2A25] disabled:opacity-40"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.44, duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
          whileTap={{ y: 4, boxShadow: "0 2px 0 #2B2A25" }}
        >
          Play
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#FDF9F1] px-4 pb-4 pt-6 text-[#2B2A25]">
      {showPager && (
        <div className="mx-auto mb-3 flex w-full max-w-[380px] justify-end">
          <span className="text-[14px] font-extrabold text-[#2B2A25]">
            {currentIndex + 1} / {total}
          </span>
        </div>
      )}

      {/* Prompt card */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <div className="relative mx-auto max-w-[380px]">
          <div className="absolute inset-0 translate-y-[10px] rounded-[28px] border-[3px] border-[#53BCD1] bg-[#FDF9F1]" />

          <div className="relative rounded-[28px] border-[3px] border-[#2B2A25] bg-[#FFFDF7] p-4 shadow-[6px_6px_0_#2B2A25]">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-full border-[3px] border-[#2B2A25] bg-[#53BCD1] px-4 py-1 text-[12px] font-extrabold uppercase tracking-widest text-[#0b0b0b]">
                {stage.introLabel ?? "Fill in the Blank"}
              </span>
              {status === "correct" && (
                <span className="text-[12px] font-extrabold text-[#3FAE6A]">✓ Answered</span>
              )}
              {status === "wrong" && (
                <span className="text-[12px] font-extrabold text-[#E36F6F]">✕ Wrong</span>
              )}
              {status === "skipped" && (
                <span className="text-[12px] font-extrabold text-[#8a8878]">Skipped</span>
              )}
            </div>

            <div className="font-display mt-3 text-[18px] leading-relaxed text-[#2B2A25]">
              {parts.map((part, index) =>
                renderPart(part, index, answers, blanksById, handleInputChange, disabled),
              )}
            </div>
          </div>
        </div>
      </div>
      {showPager && (
        <div className="mx-auto mt-3 flex w-full max-w-[380px] items-center justify-center gap-2" role="tablist" aria-label="Fill-in-the-blank cards">
          {stageList.map((item, index) => {
            const itemStatus = statusByStage[item.id] ?? "unanswered";
            const isActive = index === currentIndex;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to card ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-3.5 w-3.5 rounded-full border-[2px] border-[#2B2A25] transition ${
                  isActive
                    ? "scale-125 bg-[#E8933A]"
                    : itemStatus === "correct"
                      ? "bg-[#3FAE6A]"
                      : itemStatus === "wrong"
                        ? "bg-[#E36F6F]"
                        : itemStatus === "skipped"
                          ? "bg-[#8a8878]"
                          : "bg-transparent"
                }`}
              />
            );
          })}
        </div>
      )}
      {/* Previous / Skip / Next — only when there's actually a deck to move through */}
      {showPager && (
        <div className="mx-auto mt-3 flex w-full max-w-[380px] shrink-0 items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            disabled={atStart}
            aria-label="Previous card"
            className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#2B2A25] bg-[#FBAE4B] text-[16px] font-extrabold text-[#2B2A25] shadow-[3px_3px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[1px_1px_0_#2B2A25] disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={disabled}
            className="rounded-full border-[3px] border-[#2B2A25] bg-[#FFFDF7] px-6 py-2.5 text-[14px] font-extrabold text-[#2B2A25] shadow-[3px_3px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[1px_1px_0_#2B2A25]"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={atEnd}
            aria-label="Next card"
            className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#2B2A25] bg-[#FBAE4B] text-[16px] font-extrabold text-[#2B2A25] shadow-[3px_3px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[1px_1px_0_#2B2A25] disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
      {/* Check + Hint */}
      <div className="mx-auto mt-5 flex w-full max-w-[380px] shrink-0 gap-2 border-t-[3px] border-[#2B2A25] pt-4">
        <button
          type="button"
          onClick={handleCheckGuess}
          disabled={disabled || !allFilled}
          className="h-12 flex-1 rounded-full border-[3px] border-[#2B2A25] bg-[#FBAE4B] text-[15px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[0_2px_0_#2B2A25] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none"
        >
          Check
        </button>
        <button
          type="button"
          onClick={handleHint}
          disabled={disabled || hintsRemaining <= 0}
          className="relative h-12 w-[64px] rounded-full border-[3px] border-[#2B2A25] bg-[#FFFDF7] text-[15px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:scale-95 disabled:opacity-50"
        >
          Hint
          {hintsRemaining > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2B2A25] bg-[#E8933A] text-[10px] font-extrabold text-white">
              {hintsRemaining}
            </span>
          )}
        </button>
      </div>



      <FillBlankTextHintPopup open={hintVisible} hint={activeHint} onClose={() => setHintVisible(false)} />
    </div>
  );
}

function renderPart(
  part: PromptPart,
  index: number,
  answers: Record<string, string>,
  blanksById: Map<string, Option>,
  onChange: (blankId: string, value: string) => void,
  disabled?: boolean,
) {
  if (part.type === "text") {
    return <span key={index}>{part.value}</span>;
  }

  const blank = blanksById.get(part.id);
  if (!blank) return null;

  return (
    <input
      key={part.id}
      type="text"
      value={answers[part.id] ?? ""}
      onChange={(event) => onChange(part.id, event.target.value)}
      disabled={disabled}
      placeholder=""
      className="mx-1 inline-block w-32 min-w-[80px] border-b-[3px] border-dashed border-[#2B2A25] bg-transparent text-center font-display italic text-[#2B2A25] outline-none transition placeholder:italic placeholder:text-[#8a8878] focus:border-solid focus:border-[#E8933A] disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}