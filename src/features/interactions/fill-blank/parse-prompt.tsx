export type PromptPart =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "blank";
      id: string;
    };

const PLACEHOLDER_REGEX = /\{\{(.*?)\}\}/g;

export function parsePrompt(prompt: string): PromptPart[] {
  const parts: PromptPart[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = PLACEHOLDER_REGEX.exec(prompt)) !== null) {
    const [placeholder, blankId] = match;

    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: prompt.slice(lastIndex, match.index),
      });
    }

    // Add the blank token
    parts.push({
      type: "blank",
      id: blankId.trim(),
    });

    lastIndex = match.index + placeholder.length;
  }

  // Add any remaining text
  if (lastIndex < prompt.length) {
    parts.push({
      type: "text",
      value: prompt.slice(lastIndex),
    });
  }

  return parts;
}