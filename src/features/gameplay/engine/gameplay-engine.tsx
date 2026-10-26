"use client";

// features/gameplay/engine/gameplay-engine.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import { useProgressSync } from "@/features/gameplay/progress/use-progress-sync";
import {
  SNAPSHOT_VERSION,
  compareProgress,
  mergeSnapshots,
  normalizeSnapshot,
  pickSnapshot,
  progressStorageKey,
  restoreSnapshot,
  saveSnapshot,
  type GameplaySnapshot,
  type InteractionState,
  type StoredProgress,
} from "@/features/gameplay/progress/resume";
import type { Stage, StageHints } from "@/types/gameplay";
import { createHintsApi } from "@/features/gameplay/hints/api";
import { buildHintPlan, usageKey } from "@/features/gameplay/hints/registry";
import { closePreviewTab } from "@/features/gameplay/preview/close-preview";

interface GameplayEngineProps {
  editionId: string;
  nodeId: string;
  stages: Stage[];
  initialStage?: number;
  initialProgress?: StoredProgress;
  userId: string;
  /** Replays are deliberately local-only and never alter recorded progress. */
  mode?: "normal" | "replay";
  preview?: boolean;
  exitHref?: string; //  fallback if the tab can't close
  summaryHref?: string;  // where a finished preview goes
}

const EMPTY: string[] = [];

export function GameplayEngine({
  editionId, nodeId, userId, stages, initialStage = 0, initialProgress, mode = "normal", preview = false, exitHref, summaryHref = "" }: GameplayEngineProps) {
  const router = useRouter();
  const isReplay = mode === "replay";
  const hasNavigated = useRef(false);
  const [initializedKey, setInitializedKey] = useState<string | null>(null);
  const answerLocked = useRef(true);
  const [retryCount, setRetryCount] = useState(0);
  // Bumped when another device is ahead, so the game remounts with the new state.
  const [epoch, setEpoch] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; correct: boolean; message: string }>(
    { open: false, correct: false, message: "" });
  const [introState, setIntroState] = useState<{ key: string; dismissed: boolean } | null>(null);
  const {
    currentStage,
    attemptsRemaining,
    score,
    correctAnswers,
    totalAnswers,
    completed,
    hintsUsed,
    interactionState,
    restore,
    registerResult,
    nextStage,
    setInteractionState,
    clearInteractionState,
    revealHint,
    applyRemoteHints,
  } = useGameplayStore();

  const stage = stages[currentStage];
  const totalAttempts = stage?.attemptsAllowed ?? 3;
  const progress = useMemo(() => (currentStage / stages.length) * 100, [currentStage, stages.length]);
  const gameplayKey = progressStorageKey(userId, editionId, nodeId);
  // Distinguishes a replay navigation from normal play if Next preserves this
  // client component while only the URL query string changes.
  const sessionKey = isReplay ? `${gameplayKey}:replay` : gameplayKey;
  const introDismissed = introState?.key === sessionKey ? introState.dismissed : false;
  const ready = initializedKey === sessionKey;

  const applySnapshot = useCallback((snapshot: GameplaySnapshot) => {
    restore(snapshot);
    hasNavigated.current = false;
    const locked = snapshot.stagePassed || snapshot.attemptsRemaining === 0;
    answerLocked.current = locked;
    setFeedback({
      open: locked,
      correct: snapshot.stagePassed,
      message: snapshot.stagePassed
        ? "You already completed this stage. Continue to the next one."
        : locked ? "No attempts remaining for this stage." : "",
    });
    const started = snapshot.totalAnswers > 0 || snapshot.currentStage > 0;
    setIntroState((prev) => ({
      key: sessionKey,
      dismissed: (prev?.key === sessionKey && prev.dismissed) || started,
    }));
  }, [restore, sessionKey]);

  const handleRemote = useCallback((remote: GameplaySnapshot) => {
    if (isReplay) return;
    if (hasNavigated.current) return;
    const local = pickSnapshot(useGameplayStore.getState());
    if (compareProgress(remote, local) > 0) {
      // Another device is further along: adopt it and remount the game.
      // The stage differs from what we had, so drop any local game-in-progress
      // state — it belonged to the old stage.
      const merged = { ...mergeSnapshots(local, remote), interactionState: {} };
      applySnapshot(merged);
      try { saveSnapshot(localStorage, gameplayKey, merged); } catch { /* storage blocked */ }
      setEpoch((e) => e + 1);
    } else {
      applyRemoteHints(remote.hintsUsed);
    }
  }, [applySnapshot, applyRemoteHints, gameplayKey, isReplay]);

  const { save, flush } = useProgressSync({
    editionId,
    nodeId,
    storageKey: gameplayKey,
    enabled: ready && !isReplay,
    onRemote: handleRemote,
    preview,
  });

  // Stage-level change: local write + network push.
  const syncStage = useCallback(() => {
    if (!isReplay) save(pickSnapshot(useGameplayStore.getState()));
  }, [isReplay, save]);

  // Game-state change (typing, hopping...): local only, no network call.
  const saveLocalOnly = useCallback(() => {
    if (preview) return;
    if (isReplay) return;
    try { saveSnapshot(localStorage, gameplayKey, pickSnapshot(useGameplayStore.getState())); } catch { /* storage blocked */ }
  }, [gameplayKey, isReplay, preview]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      const server: GameplaySnapshot = normalizeSnapshot(initialProgress) ?? {
        version: SNAPSHOT_VERSION,
        updatedAt: 0,
        currentStage: initialStage,
        attemptsRemaining: stages[initialStage]?.attemptsAllowed ?? 0,
        stagePassed: false,
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        hintsUsed: {},
        interactionState: {},
      };

      let snapshot = server;
      if ((!isReplay) || (!preview)) {
        try {
          snapshot = restoreSnapshot(localStorage, gameplayKey, server, stages.map((item) => item.attemptsAllowed));
        } catch { /* Fall back to server progress if storage is blocked. */ }
      }

      applySnapshot(snapshot);
      setInitializedKey(sessionKey);
      if (!isReplay) {
        save(snapshot);
      }
    });
    return () => { cancelled = true; };
  }, [stages, initialStage, initialProgress, sessionKey, gameplayKey, applySnapshot, isReplay, save]);

  const completeProgress = useCallback(async () => {
    if (preview) return;
    if (isReplay) return;
    flush();
    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editionId, nodeId, score, correctAnswers, totalAnswers }),
    }).catch(() => { });
    try { localStorage.removeItem(gameplayKey); } catch { /* storage blocked */ }
  }, [editionId, nodeId, preview, score, correctAnswers, totalAnswers, gameplayKey, flush, isReplay]);

  useEffect(() => {
    if (!ready) return;
    if ((completed || !stage) && !hasNavigated.current) {
      hasNavigated.current = true;
      completeProgress().then(() => {
        const destination = preview ? (summaryHref ?? exitHref ?? "/admin") : (isReplay ? "/map" : "/summary");
        if (preview || isReplay) router.push(destination);
        else router.replace(destination);
      });
    }
  }, [ready, completed, stage, completeProgress, router, preview, exitHref, isReplay]);


  const handleInteractionStateChange = useCallback((stageId: string, state: InteractionState) => {
    setInteractionState(stageId, state);
    saveLocalOnly();
  }, [setInteractionState, saveLocalOnly]);

  function handleAnswer({
    correct,
    feedback: message,
    points,
    totalAnswers: answerCount = 1,
    correctAnswers: correctAnswerCount = correct ? 1 : 0,
  }: {
    correct: boolean;
    feedback: string;
    points?: number;
    totalAnswers?: number;
    correctAnswers?: number;
  }) {
    if (answerLocked.current) return;
    registerResult({
      correct,
      points: points ?? stage?.points ?? 0,
      totalAnswers: answerCount,
      correctAnswers: correctAnswerCount,
    });
    const snapshot = useGameplayStore.getState();
    answerLocked.current = snapshot.stagePassed || snapshot.attemptsRemaining === 0;
    setFeedback({ open: true, correct, message });
    syncStage();
  }

  function handleRetry() {
    if (answerLocked.current) return;
    clearInteractionState(stage.id);
    syncStage();
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
    answerLocked.current = false;
    // The completion endpoint is the only terminal write. Sending this last
    // stage snapshot can otherwise race with it and reopen a completed node.
    if (nextIndex < stages.length) syncStage();
  }

  async function handleContinue() {
    setFeedback((s) => ({ ...s, open: false }));
    if (!stage) return;
    if (feedback.correct || attemptsRemaining <= 0) {
      await advanceStage();
    }
  }

  const plan = useMemo(() => (stage ? buildHintPlan(stage, stages) : null), [stage, stages]);
  const bucket = stage ? usageKey(stage) : "";
  const used = hintsUsed[bucket] ?? EMPTY;
  const hints = useMemo<StageHints | undefined>(() => {
    if (!stage || !plan) return undefined;
    return createHintsApi(plan, used, (id, group) => {
      const had = (useGameplayStore.getState().hintsUsed[bucket] ?? []).includes(id);
      const ok = revealHint(bucket, id, group, plan);
      if (ok && !had) syncStage();
      return ok;
    });
  }, [stage, plan, bucket, used, revealHint, syncStage]);

  if ((completed || !stage) && hasNavigated.current) {
    return null;
  }

  if (!stage) return null;
  if (!ready) return null;

  return (
    <>
      <GameplayShell
        stageLabel={`Stage ${currentStage + 1} of ${stages.length}`}
        progress={progress}
        attemptsRemaining={attemptsRemaining}
        totalAttempts={totalAttempts}
        onClose={preview ? () => closePreviewTab(exitHref ?? "/admin", router.push) : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stage.id}:${epoch}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <InteractionRenderer
              stage={stage}
              stages={stages}
              disabled={feedback.open}
              retryCount={retryCount}
              attemptsRemaining={attemptsRemaining}
              onAnswer={handleAnswer}
              showIntro={!introDismissed}
              onIntroComplete={() => setIntroState({ key: sessionKey, dismissed: true })}
              hints={hints}
              interactionState={interactionState[stage.id]}
              onInteractionStateChange={(s) => handleInteractionStateChange(stage.id, s)}
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
