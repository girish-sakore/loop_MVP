"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { TimelineEvent } from "./timeline-builder";

type Props = {
  event: TimelineEvent;
  overlay?: boolean;
};

export function EventCard({
  event,
  overlay = false,
}: Props) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: event.id,
    disabled: overlay,
    data: {
      event,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    cursor: overlay ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      style={style}
      className="rounded-xl border bg-white p-4 shadow transition"
    >
      {event.title}
    </div>
  );
}