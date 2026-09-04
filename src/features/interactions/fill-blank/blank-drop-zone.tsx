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
};

export function BlankDropZone({
  id,
  option,
}: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
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
        rounded-xl
        border-2
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
          ? "var(--secondary)"
          : "var(--outline-variant)",
      }}
    >
      {option ? (
        <WordChip
          id={option.id}
          word={option.word}
          variant="blank"
        />
      ) : (
        <span
          className="text-sm font-medium"
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