"use client";

import { useDroppable } from "@dnd-kit/core";

import { TimelineEvent } from "@/types/gameplay";

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

        <div className="h-5 w-5 rounded-full border-2 border-neutral-500" />

        <div className="h-20 w-[2px] bg-neutral-300" />

      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1
          rounded-xl
          border-2
          border-dashed
          p-4
          transition-all

          ${
            isOver
              ? "border-green-500 bg-green-50"
              : "border-neutral-300"
          }
        `}
      >
        <div className="text-xs text-neutral-500">
          {event.year}
        </div>

        <div className="mt-3">

          {placedEvent ? (

            <div className="rounded-lg bg-green-100 p-3 font-medium">

              {placedEvent.title}

            </div>

          ) : (

            <div className="text-neutral-400">

              Drop event here...

            </div>

          )}

        </div>

      </div>

    </div>
  );
}