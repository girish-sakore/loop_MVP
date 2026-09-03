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
        background: isBank ? "#f7d91f" : "#85cb57",
        color: "#0b0b0f",
        border: "3px solid #0b0b0f",
        boxShadow: isBank ? "0 5px 0 #0b0b0f" : "none",
      }}
      className={`
        rounded-full
        font-extrabold
        transition-all
        duration-200
        active:cursor-grabbing
        ${
          isBank
            ? "px-4 py-2 active:translate-y-1"
            : "px-3 py-1"
        }
      `}
    >
      {word}
    </button>
  );
}
