"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { TimelineEvent } from "@/types/gameplay";

type Props = {
  event: TimelineEvent;
  overlay?: boolean;
  index?: number;
};

export function EventCard({
  event,
  overlay = false,
  index = 0,
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

  const icons = ["history_edu", "castle", "local_florist", "restaurant", "public"];
  const icon = icons[index % icons.length];

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      style={style}
      className={`grid min-h-[80px] w-full min-w-0 grid-cols-[68px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_5px_0_rgba(11,11,15,0.16)] transition active:translate-y-1 ${
        overlay ? "rotate-[-1deg] shadow-[0_10px_0_rgba(11,11,15,0.16)]" : ""
      }`}
    >
      {event.image ? (
        <img
          src={event.image}
          alt=""
          className="h-full w-full border-r-[3px] border-[#0b0b0f] object-cover"
        />
      ) : (
        <div className="flex items-center justify-center border-r-[3px] border-[#0b0b0f] bg-[#e5ded3] text-[#343238]">
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
      )}
      <div className="min-w-0 px-3 py-2">
        <span className="mb-1 inline-block max-w-full rounded-[4px] border border-[#0b0b0f] bg-[#f5f0e9] px-2 py-1 text-[12px] font-extrabold leading-none">
          {event.year}
        </span>
        <span className="block text-[14px] font-extrabold leading-tight">
          {event.title}
        </span>
      </div>
    </div>
  );
}
