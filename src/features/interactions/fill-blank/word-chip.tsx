"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string;
  word: string;
  variant?: "bank" | "blank";
  disabled?: boolean;
};

export function WordChip({
  id,
  word,
  variant = "bank",
  disabled = false,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    disabled,
    data: {
      word,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    cursor: disabled ? "default" : "grab",
    touchAction: "none",
  };

  const isBank = variant === "bank";

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        background: "var(--surface-container-high)",
        color: "var(--on-surface)",
        border: "1px solid var(--outline-variant)",
      }}
      className={`
        rounded-full
        font-semibold
        transition-all
        duration-200
        active:cursor-grabbing
        ${
          isBank
            ? "px-4 py-2 shadow-sm hover:shadow-md"
            : "px-3 py-1 shadow-none"
        }
      `}
    >
      {word}
    </button>
  );
}