"use client";

import { useDroppable } from "@dnd-kit/core";

import type { TimelineEvent } from "@/types/gameplay";

type Props = {
  event: TimelineEvent;
  placedEvent?: TimelineEvent | null;
};

export function TimelineSlot({
  event,
  placedEvent,
}: Props) {

  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: event.id,
  });

  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div className="h-6 w-6 rounded-full border-[3px] border-[#0b0b0f] bg-[#f7d91f]" />

        <div className="h-20 w-[4px] bg-[#0b0b0f]" />

      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1
          rounded-xl
          border-[3px]
          border-dashed
          p-4
          transition-all

          ${
            isOver
              ? "border-[#0b0b0f] bg-[#d7e96c]"
              : "border-[#0b0b0f] bg-[#fffdf7]"
          }
        `}
      >
        <div className="inline-block rounded-md border-[3px] border-[#0b0b0f] bg-[#f5f0e9] px-2 py-1 text-sm font-extrabold">
          {event.year}
        </div>

        <div className="mt-3">

          {placedEvent ? (

            <div className="rounded-lg border-[3px] border-[#0b0b0f] bg-[#85cb57] p-3 font-extrabold">

              {placedEvent.title}

            </div>

          ) : (

            <div className="font-bold text-[#343238]">

              Drop event here

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
