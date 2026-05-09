"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CompletionCard } from "@/components/feedback/completion-card";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { RevealState } from "@/components/feedback/reveal-state";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import type { Edition } from "@/types/gameplay";

export function GameplayEngine({ edition }: { edition: Edition }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    correct: boolean;
    message: string;
  }>({ open: false, correct: false, message: "" });

  const {
    currentStage,
    attemptsRemaining,
    score,
    completed,
    setAttempts,
    registerResult,
    nextStage,
    reset,
  } = useGameplayStore();

  const stage = edition.stages[currentStage];
  const progress = useMemo(
    () => ((currentStage + 1) / edition.stages.length) * 100,
    [currentStage, edition.stages.length],
  );

  useEffect(() => {
    reset();
    setAttempts(edition.stages[0]?.attemptsAllowed ?? 0);
  }, [edition, reset, setAttempts]);

  function continueToNextStage() {
    setFeedback((state) => ({ ...state, open: false }));
    if (!stage) return;
    if (feedback.correct || attemptsRemaining <= 0) {
      const nextIndex = currentStage + 1;
      const nextAttempts = edition.stages[nextIndex]?.attemptsAllowed ?? 0;
      nextStage(edition.stages.length, nextAttempts);
      if (nextIndex >= edition.stages.length) {
        router.push("/summary");
      }
    }
  }

  if (completed || !stage) {
    return (
      <div className="px-4 py-8">
        <CompletionCard title={edition.title} score={score} />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="px-4 pt-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Edition Intro
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">{edition.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{edition.description}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            {edition.stages.length} stages • {edition.estimatedTime}
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-5 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Start stage 1
          </button>
        </section>
      </div>
    );
  }

  return (
    <GameplayShell
      title={edition.title}
      stageLabel={`Stage ${currentStage + 1} / ${edition.stages.length}`}
      progress={progress}
      attemptsRemaining={attemptsRemaining}
    >
      <div className="space-y-4 pt-4">
        <RevealState label="Score" value={`${score}`} />
        <InteractionRenderer
          stage={stage}
          disabled={feedback.open}
          onAutoContinue={() => {
            registerResult({ correct: true, points: stage.points });
            setFeedback({
              open: true,
              correct: true,
              message: "Nice pace. Moving to the next challenge.",
            });
          }}
          onAnswer={({ correct, feedback: message }) => {
            registerResult({ correct, points: stage.points });
            setFeedback({ open: true, correct, message });
          }}
        />
      </div>
      <FeedbackModal
        open={feedback.open}
        correct={feedback.correct}
        message={feedback.message}
        onContinue={continueToNextStage}
      />
    </GameplayShell>
  );
}
