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
import dynamic from "next/dynamic";

const BorderHopInteraction = dynamic(() =>
  import("@/features/interactions/border-hop/border-hop-interaction").then((module) => module.BorderHopInteraction),
);

import type { Stage } from "@/types/gameplay";

type InteractionRendererProps = {
  stage: Stage;
  stages?: Stage[];
  disabled?: boolean;
  retryCount?: number;
  attemptsRemaining?: number;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  showIntro: boolean;
  onIntroComplete: () => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
};

export function InteractionRenderer({
  stage,
  stages,
  disabled,
  retryCount = 0,
  attemptsRemaining,
  onAnswer,
  showIntro,
  onIntroComplete,
  hintsRemaining,
  onUseHint,
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
    case "fill-blank-text":
      return (
        <FillBlankTextInteraction
          stages={(stages ?? [stage]).filter((item): item is Extract<Stage, { type: "fill-blank-text" }> => item.type === "fill-blank-text")}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          hintsRemaining={hintsRemaining}
          onUseHint={onUseHint}
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
    default:
      return null;
  }
}
