import { FillBlankInteraction } from "@/features/interactions/fill-blank/fill-blank-interaction";
import { ImageSelectInteraction } from "@/features/interactions/image-select/image-select-interaction";
import { ComingSoonInteraction } from "@/features/interactions/shared/coming-soon-interaction";
import { SwipeInteractionPlaceholder } from "@/features/interactions/swipe/swipe-interaction";
import { TimelineBuilder } from "@/features/interactions/timeline-builder/timeline-builder";
import { ReorderInteractionPlaceholder } from "@/features/interactions/reorder/reorder-interaction";

import type { Stage } from "@/types/gameplay";

type InteractionRendererProps = {
  stage: Stage;
  disabled?: boolean;
  retryCount?: number;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  onAutoContinue: () => void;
};

export function InteractionRenderer({
  stage,
  disabled,
  retryCount = 0,
  onAnswer,
  onAutoContinue,
}: InteractionRendererProps) {
  switch (stage.type) {
    case "image-select":
      return (
        <ImageSelectInteraction
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
        />
      );
    case "swipe":
      return (
        <SwipeInteractionPlaceholder
          stage={stage}
          onAnswer={onAnswer}
          disabled={disabled}
          retryCount={retryCount}
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
    case "drag-drop":
      return (
        <ComingSoonInteraction
          type={stage.type}
          prompt={stage.prompt}
          onContinue={onAutoContinue}
        />
      );
    case "timeline-builder":
      return <TimelineBuilder
                stage={stage}
                onAnswer={onAnswer}
                disabled={disabled}
                retryCount={retryCount}
              />;
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
