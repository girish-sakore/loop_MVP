"use client";

import { useDroppable } from "@dnd-kit/core";
import { WordChip } from "./word-chip";

type Option = {
  id: string;
  word: string;
};

type Props = {
  id: string;
  option?: Option;
  disabled?: boolean;
  onRemove?: () => void;
};

export function BlankDropZone({
  id,
  option,
  disabled = false,
  onRemove,
}: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <span
      ref={setNodeRef}
      className="
        inline-flex
        items-center
        justify-center
        min-w-[110px]
        min-h-[48px]
        rounded-2xl
        border-[3px]
        px-1
        py-1
        mx-1
        align-middle
        transition-all
        duration-200
      "
      style={{
        background: isOver
          ? "var(--secondary-container)"
          : "var(--surface-container-low)",
        borderColor: isOver
          ? "#0b0b0f"
          : "#0b0b0f",
      }}
    >
      {option ? (
        <WordChip
          id={option.id}
          word={option.word}
          variant="blank"
          disabled={disabled}
          onClick={disabled ? undefined : onRemove}
        />
      ) : (
        <span
          className="text-sm font-extrabold"
          style={{
            color: "var(--on-surface-variant)",
          }}
        >
          Drop word
        </span>
      )}
    </span>
  );
}
