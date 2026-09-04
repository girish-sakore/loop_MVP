"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import type { Stage } from "@/types/gameplay";

interface GameplayEngineProps {
  editionId: string;
  nodeId: string;
  stages: Stage[];
  initialStage?: number;
}

type ProgressOverrides = {
  currentStage?: number;
  score?: number;
  correctAnswers?: number;
  totalAnswers?: number;
};

export function GameplayEngine({
  editionId,
  nodeId,
  stages,
  initialStage = 0,
}: GameplayEngineProps) {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

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

  // Reset store synchronously when nodeId, editionId, or stages change
  const currentKey = `${editionId}-${nodeId}`;
  const [loadedKey, setLoadedKey] = useState(currentKey);

  if (loadedKey !== currentKey) {
    setLoadedKey(currentKey);
    setIsReady(false);
    hasNavigated.current = false;
    reset(); // Reset store completed flag and score
    setStage(initialStage);
    setAttempts(
      stages[initialStage]?.attemptsAllowed ?? stages[0]?.attemptsAllowed ?? 3
    );
  }

  const stage = stages[currentStage];
  const totalAttempts = stage?.attemptsAllowed ?? 3;
  const progress = useMemo(
    () => (currentStage / stages.length) * 100,
    [currentStage, stages.length]
  );

  // initialize from DB progress, not always 0
  useEffect(() => {
    reset();
    setStage(initialStage);
    setAttempts(stages[initialStage]?.attemptsAllowed ?? stages[0]?.attemptsAllowed ?? 0);
  }, [stages, initialStage, reset, setStage, setAttempts]);


  const syncProgress = useCallback(
    async (overrides?: ProgressOverrides) => {
      await fetch("/api/progress/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editionId,
          nodeId,
          currentSubStage: overrides?.currentStage ?? currentStage,
          score: overrides?.score ?? score,
          correctAnswers: overrides?.correctAnswers ?? correctAnswers,
          totalAnswers: overrides?.totalAnswers ?? totalAnswers,
        }),
      }).catch(() => {});
    },
    [editionId, nodeId, currentStage, score, correctAnswers, totalAnswers]
  );

  const completeProgress = useCallback(async () => {
    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        editionId,
        nodeId,
        score,
        correctAnswers,
        totalAnswers,
      }),
    }).catch(() => {});
  }, [editionId, nodeId, score, correctAnswers, totalAnswers]);

  // Handle auto-redirection ONLY after engine is ready
  useEffect(() => {
    if (!isReady) return;

    if ((completed || currentStage >= stages.length) && !hasNavigated.current) {
      hasNavigated.current = true;
      completeProgress().then(() => {
        router.push("/summary");
      });
    }
  }, [isReady, completed, currentStage, stages.length, completeProgress, router]);

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
    const nextAttempts = stages[nextIndex]?.attemptsAllowed ?? 0;
    nextStage(stages.length, nextAttempts);
    if (nextIndex < stages.length) {
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

  // Prevent premature renders before initialization finishes
  if (!isReady || !stage) {
    return null;
  }

  return (
    <>
      <GameplayShell
        stageLabel={`Stage ${currentStage + 1} of ${stages.length}`}
        progress={progress}
        attemptsRemaining={attemptsRemaining}
        totalAttempts={totalAttempts}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stage.id}-${retryCount}`}
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