import { ImageSelectInteraction } from "@/features/interactions/image-select/image-select-interaction";
import { ComingSoonInteraction } from "@/features/interactions/shared/coming-soon-interaction";
import type { Stage } from "@/types/gameplay";

type InteractionRendererProps = {
  stage: Stage;
  disabled?: boolean;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  onAutoContinue: () => void;
};

export function InteractionRenderer({
  stage,
  disabled,
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
        />
      );
    case "swipe":
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
