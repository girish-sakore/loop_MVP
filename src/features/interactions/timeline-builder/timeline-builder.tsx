"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";

import { EventCard } from "./event-card";
import { TimelineSlot } from "./timeline-slot";

export type TimelineEvent = {
  id: string;
  title: string;
  year: string;
  description: string;
  order: number;
};

type TimelineBuilderStage = {
  events: TimelineEvent[];
};

type Props = {
  stage: TimelineBuilderStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
};

export function TimelineBuilder({ stage, onAnswer, disabled, retryCount = 0 }: Props) {
  // Key state track to derive fresh state when props change (removes useEffect requirement)
  const [resetKey, setResetKey] = useState({ stage, retryCount });
  const [submitted, setSubmitted] = useState(false);
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  // State initialization functions
  const [availableEvents, setAvailableEvents] = useState(stage.events);
  const [placements, setPlacements] = useState<Record<string, TimelineEvent | null>>(() =>
    Object.fromEntries(stage.events.map((event) => [event.id, null]))
  );

  // Sync state during render if stage or retryCount changes
  if (resetKey.stage !== stage || resetKey.retryCount !== retryCount) {
    setResetKey({ stage, retryCount });
    setSubmitted(false);
    setAvailableEvents(stage.events);
    setPlacements(Object.fromEntries(stage.events.map((e) => [e.id, null])));
  }

  const sortedEvents = useMemo(
    () => [...stage.events].sort((a, b) => a.order - b.order),
    [stage.events]
  );

  function handleDragStart(event: DragStartEvent) {
    if (disabled) return;
    const dragged = stage.events.find((item) => item.id === event.active.id);

    if (dragged) {
      setActiveEvent(dragged);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);
    if (disabled) return;

    const { active, over } = event;

    if (!over) return;

    const draggedEvent = stage.events.find((item) => item.id === active.id);

    if (!draggedEvent) return;

    // Wrong slot
    if (draggedEvent.id !== over.id) {
      return;
    }

    setPlacements((current) => ({
      ...current,
      [over.id as string]: draggedEvent,
    }));

    setAvailableEvents((current) =>
      current.filter((item) => item.id !== draggedEvent.id)
    );

    // After updating placements, check completion:
    const updated = { ...placements, [over.id as string]: draggedEvent };
    const allPlaced = Object.values(updated).every((v) => v !== null);
    if (allPlaced && !submitted) {
      setSubmitted(true);
      onAnswer({ correct: true, feedback: "Timeline restored correctly." });
    }
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto flex max-w-6xl gap-10">

        <div className="flex-1 space-y-4">
          {sortedEvents.map((event) => (
            <TimelineSlot
              key={event.id}
              event={event}
              placedEvent={placements[event.id]}
            />
          ))}
        </div>

        <div className="w-80 space-y-3">
          {availableEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>

      </div>

      <DragOverlay>
        {activeEvent ? (
          <EventCard
            event={activeEvent}
            overlay
          />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}