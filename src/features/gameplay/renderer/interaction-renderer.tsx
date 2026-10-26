"use client"; // only if it isn't already imported from a client module
import { useMemo } from "react";
import { mapImages } from "@/lib/image-refs";
import { assetUrl } from "@/lib/assets";
import { FillBlankInteraction } from "@/features/interactions/fill-blank/fill-blank-interaction";
import { FillBlankTextInteraction } from "@/features/interactions/fill-blank-text/fill-blank-text-interaction";
import { ImageSelectInteraction } from "@/features/interactions/image-select/image-select-interaction";
import { DragDropInteraction } from "@/features/interactions/drag-drop/drag-drop-interaction";
import { SwipeInteractionPlaceholder } from "@/features/interactions/swipe/swipe-interaction";
import { FourWaySwipeInteraction } from "@/features/interactions/four-way-swipe/four-way-swipe-interaction";
import { TimelineBuilder } from "@/features/interactions/timeline-builder/timeline-builder";
import { ReorderInteractionPlaceholder } from "@/features/interactions/reorder/reorder-interaction";
import { ClueConnectInteraction } from "@/features/interactions/clue-connect/clue-connect-interaction";
import { ColorMatchInteraction } from "@/features/interactions/color-match/color-match-interaction";
import { WordRootInteraction } from "@/features/interactions/word-root/word-root-interaction";
import { ImageTextSAnswerInteraction } from "@/features/interactions/image-text-sanswer/image-text-sanswer-interaction";
import dynamic from "next/dynamic";
import type { InteractionState } from "@/features/gameplay/progress/resume";

const BorderHopInteraction = dynamic(() =>
  import("@/features/interactions/border-hop/border-hop-interaction").then((module) => module.BorderHopInteraction),
);

import type { Stage, StageHints } from "@/types/gameplay";
import { STAGE_GROUP } from "@/features/gameplay/hints/registry";

type InteractionRendererProps = {
  stage: Stage;
  stages?: Stage[];
  disabled?: boolean;
  retryCount?: number;
  attemptsRemaining?: number;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  showIntro: boolean;
  onIntroComplete: () => void;
  hints?: StageHints;
  interactionState?: InteractionState;
  onInteractionStateChange?: (state: InteractionState) => void;
};

export function InteractionRenderer({
  stage: rawStage,
  stages,
  disabled,
  retryCount = 0,
  attemptsRemaining,
  onAnswer,
  showIntro,
  onIntroComplete,
  hints,
  interactionState,
  onInteractionStateChange,
}: InteractionRendererProps) {
  const stage = useMemo(() => mapImages(rawStage, assetUrl), [rawStage]);
  const legacy = hints?.group(STAGE_GROUP);

  switch (stage.type) {
    case "border-hop":
      return (
        <BorderHopInteraction
          key={`${stage.id}:${retryCount}`}
          stage={stage}
          disabled={disabled}
          attemptsRemaining={attemptsRemaining}
          onAnswer={onAnswer}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hintsRemaining={legacy?.remaining ?? 0}
          onUseHint={() => { legacy?.reveal(); }}
          interactionState={interactionState}
          onInteractionStateChange={onInteractionStateChange}
        />
      );
    case "image-select":
      return (
        <ImageSelectInteraction
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hints={hints}
        />
      );
    case "swipe":
      return (
        <SwipeInteractionPlaceholder
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hints={hints}
        />
      );
    case "four-way-swipe":
      return (
        <FourWaySwipeInteraction
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
        />
      );
    case "fill-blank":
      return (
        <FillBlankInteraction
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          hints={hints}
        />
      );
    case "fill-blank-text":
      return (
        <FillBlankTextInteraction
          key={`${stage.id}:${retryCount}`} // retry remounts with a fresh deck
          stages={(stages ?? [stage]).filter((item): item is Extract<Stage, { type: "fill-blank-text" }> => item.type === "fill-blank-text")}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hints={hints}
          interactionState={interactionState}
          onInteractionStateChange={onInteractionStateChange}
        />
      );
    case "drag-drop":
      return (
        <DragDropInteraction
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hintsRemaining={legacy?.remaining ?? 0}
          onUseHint={() => { legacy?.reveal(); }}
        />
      );
    case "clue-connect":
      return (
        <ClueConnectInteraction
          key={`${stage.id}:${retryCount}`}
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
        />
      );
    case "color-match":
      return (
        <ColorMatchInteraction
          key={`${stage.id}:${retryCount}`}
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
        />
      );
    case "timeline-builder":
      return <TimelineBuilder
        key={`${stage.id}:${retryCount}`}
        stage={stage}
        onAnswer={onAnswer}
        disabled={disabled}
        retryCount={retryCount}
        showIntro={showIntro}
        onIntroComplete={onIntroComplete}
        hints={hints}
        interactionState={interactionState}
        onInteractionStateChange={onInteractionStateChange}
      />;
    case "word-root":
      return (
        <WordRootInteraction
          key={`${stage.id}:${retryCount}`}
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
        />
      );
    case "reorder":
      return <ReorderInteractionPlaceholder
        stage={stage}
        onAnswer={onAnswer}
        disabled={disabled}
        retryCount={retryCount}
      />;
    case "image-text-answer":
      return (
        <ImageTextSAnswerInteraction
          key={`${stage.id}:${retryCount}`}
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hints={hints}
        />
      );
    default:
      return null;
  }
}
