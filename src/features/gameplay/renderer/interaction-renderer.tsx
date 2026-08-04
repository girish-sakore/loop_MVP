import { ImageSelectInteraction } from "@/features/interactions/image-select/image-select-interaction";
import { ComingSoonInteraction } from "@/features/interactions/shared/coming-soon-interaction";
import { SwipeInteractionPlaceholder } from "@/features/interactions/swipe/swipe-interaction";
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
    case "reorder":
    case "drag-drop":
      return (
        <ComingSoonInteraction
          type={stage.type}
          prompt={stage.prompt}
          onContinue={onAutoContinue}
        />
      );
    default:
      return null;
  }
}
