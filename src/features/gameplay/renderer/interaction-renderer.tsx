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
import type { InteractionState } from "@/features/gameplay/progress/resume"; // NEW

const BorderHopInteraction = dynamic(() =>
  import("@/features/interactions/border-hop/border-hop-interaction").then((module) => module.BorderHopInteraction),
);

import type { Stage, FillBlankTextStage } from "@/types/gameplay";

type InteractionRendererProps = {
  stage: Stage;
  disabled?: boolean;
  retryCount?: number;
  attemptsRemaining?: number;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  showIntro: boolean;
  onIntroComplete: () => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
  interactionState?: InteractionState;                          // NEW
  onInteractionStateChange?: (state: InteractionState) => void; // NEW
};

export function InteractionRenderer({
  stage,
  disabled,
  retryCount = 0,
  attemptsRemaining,
  onAnswer,
  showIntro,
  onIntroComplete,
  hintsRemaining,
  onUseHint,
  interactionState,          // NEW
  onInteractionStateChange,  // NEW
}: InteractionRendererProps) {
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
          hintsRemaining={hintsRemaining}
          onUseHint={onUseHint}
          interactionState={interactionState}                   // NEW
          onInteractionStateChange={onInteractionStateChange}   // NEW
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
        />
      );
    case "fill-blank-text": {
      const textStage = stage as FillBlankTextStage;
      // The collapsed round carries the whole deck in `cards`; page through it
      // as ONE round instead of re-rendering each blank as its own engine stage.
      const deck: FillBlankTextStage[] = textStage.cards
        ? textStage.cards.map((card) => ({
            ...textStage,
            id: card.id,
            prompt: card.prompt,
            question: card.question ?? textStage.question,
            blanks: card.blanks,
            feedback: {
              correct: card.feedback?.correct ?? textStage.feedback.correct,
              incorrect: card.feedback?.incorrect ?? textStage.feedback.incorrect,
            },
          }))
        : [textStage];
      return (
        <FillBlankTextInteraction
          key={`${stage.id}:${retryCount}`}   // NEW: retry remounts with a fresh deck
          stages={deck}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hintsRemaining={hintsRemaining}
          onUseHint={onUseHint}
          interactionState={interactionState}                   // NEW
          onInteractionStateChange={onInteractionStateChange}   // NEW
        />
      );
    }
    case "drag-drop":
      return (
        <DragDropInteraction
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hintsRemaining={hintsRemaining}
          onUseHint={onUseHint}
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
        stage={stage}
        onAnswer={onAnswer}
        disabled={disabled}
        retryCount={retryCount}
        showIntro={showIntro}
        onIntroComplete={onIntroComplete}
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
          hintsRemaining={hintsRemaining}
          onUseHint={onUseHint}
        />
      );
    default:
      return null;
  }
}
