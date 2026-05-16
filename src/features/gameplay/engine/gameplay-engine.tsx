"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import type { Edition } from "@/types/gameplay";

interface GameplayEngineProps {
  edition: Edition;
  initialStage?: number;
}

export function GameplayEngine({
  edition,
  initialStage = 0,
}: GameplayEngineProps) {
  const router = useRouter();
  const hasNavigated = useRef(false); // guard navigation
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    correct: boolean;
    message: string;
  }>({ open: false, correct: false, message: "" });

  const {
    currentStage,
    attemptsRemaining,
    score,
    correctAnswers,
    totalAnswers,
    completed,
    setAttempts,
    setStage,
    registerResult,
    nextStage,
    reset,
  } = useGameplayStore();

  const stage = edition.stages[currentStage];
  const totalAttempts = stage?.attemptsAllowed ?? 3;

  const progress = useMemo(
    () => (currentStage / edition.stages.length) * 100,
    [currentStage, edition.stages.length],
  );

  // initialize from DB progress, not always 0
  useEffect(() => {
    reset();
    setStage(initialStage);
    setAttempts(
      edition.stages[initialStage]?.attemptsAllowed ??
      edition.stages[0]?.attemptsAllowed ??
      0,
    );
  }, [edition, initialStage, reset, setStage, setAttempts]);

  const syncProgress = useCallback(async (overrides?: {
    score?: number;
    correctAnswers?: number;
    totalAnswers?: number;
    currentStage?: number;
  }) => {
    try {
      await fetch("/api/progress/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editionId: edition.id,
          currentStage: overrides?.currentStage ?? currentStage,
          score: overrides?.score ?? score,
          correctAnswers: overrides?.correctAnswers ?? correctAnswers,
          totalAnswers: overrides?.totalAnswers ?? totalAnswers,
        }),
      });
    } catch {
      // Non-blocking
    }
  }, [edition.id, currentStage, score, correctAnswers, totalAnswers]);

  const completeProgress = useCallback(async () => {
    try {
      await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editionId: edition.id,
          score,
          correctAnswers,
          totalAnswers,
        }),
      });
    } catch {
      // Non-blocking
    }
  }, [edition.id, score, correctAnswers, totalAnswers]);

  // Issue 2 fix — navigate in an effect, never during render
  useEffect(() => {
    if ((completed || !stage) && !hasNavigated.current) {
      hasNavigated.current = true;
      completeProgress().then(() => {
        router.push("/summary");
      });
    }
  }, [completed, stage, completeProgress, router]);

  function handleAnswer({
    correct,
    feedback: message,
  }: {
    correct: boolean;
    feedback: string;
  }) {
    registerResult({ correct, points: stage?.points ?? 0 });
    setFeedback({ open: true, correct, message });
  }

  function handleAutoContinue() {
    registerResult({ correct: true, points: stage?.points ?? 0 });
    setFeedback({
      open: true,
      correct: true,
      message: "Nice pace. Moving to the next challenge.",
    });
  }

  function handleRetry() {
    setRetryCount((c) => c + 1);
    setFeedback({ open: false, correct: false, message: "" });
  }

  function handleSkip() {
    setFeedback((s) => ({ ...s, open: false }));
    if (!stage) return;
    advanceStage();
  }

  async function advanceStage() {
    const nextIndex = currentStage + 1;
    const nextAttempts = edition.stages[nextIndex]?.attemptsAllowed ?? 0;
    nextStage(edition.stages.length, nextAttempts);
    // Sync mid-game — navigation handled by the useEffect above on completion
    if (nextIndex < edition.stages.length) {
      syncProgress({ currentStage: nextIndex });
    }
  }

  async function handleContinue() {
    setFeedback((s) => ({ ...s, open: false }));
    if (!stage) return;
    if (feedback.correct || attemptsRemaining <= 0) {
      await advanceStage();
    }
  }

  // While navigating away, render nothing
  if ((completed || !stage) && hasNavigated.current) {
    return null;
  }

  if (!stage) return null;

  return (
    <>
      <GameplayShell
        stageLabel={`Stage ${currentStage + 1} of ${edition.stages.length}`}
        progress={progress}
        attemptsRemaining={attemptsRemaining}
        totalAttempts={totalAttempts}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <InteractionRenderer
              stage={stage}
              disabled={feedback.open}
              retryCount={retryCount}
              onAnswer={handleAnswer}
              onAutoContinue={handleAutoContinue}
            />
          </motion.div>
        </AnimatePresence>
      </GameplayShell>

      <FeedbackModal
        open={feedback.open}
        correct={feedback.correct}
        message={feedback.message}
        attemptsRemaining={attemptsRemaining}
        onContinue={handleContinue}
        onRetry={handleRetry}
        onSkip={handleSkip}
      />
    </>
  );
}