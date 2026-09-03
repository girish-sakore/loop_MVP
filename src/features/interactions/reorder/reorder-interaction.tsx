type Props = {
  stage?: unknown;
  onAnswer?: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
};

export function ReorderInteractionPlaceholder(props: Props) {
  void props;
  return null;
}
