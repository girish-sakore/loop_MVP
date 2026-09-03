"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { EventCard } from "./event-card";
import type {
  TimelineBuilderStage,
  TimelineEvent,
} from "@/types/gameplay";

type Props = {
  stage: TimelineBuilderStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

type TimelineState = {
  key: string;
  submitted: boolean;
  placedEvents: TimelineEvent[];
  pendingEvents: TimelineEvent[];
  hasDropped: boolean;
};

export function TimelineBuilder({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const sortedEvents = useMemo(
    () => [...stage.events].sort((a, b) => a.order - b.order),
    [stage.events],
  );
  const starterIndex = Math.floor((sortedEvents.length - 1) / 2);
  const starterEvent = sortedEvents[starterIndex];
  const pendingEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    for (let offset = 1; offset < sortedEvents.length; offset += 1) {
      const before = sortedEvents[starterIndex - offset];
      const after = sortedEvents[starterIndex + offset];

      if (before) events.push(before);
      if (after) events.push(after);
    }

    return events;
  }, [sortedEvents, starterIndex]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const resetKey = `${retryCount}:${stage.id}:${stage.events
    .map((event) => event.id)
    .join("|")}`;
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [timelineState, setTimelineState] = useState<TimelineState>(() =>
    createInitialState(resetKey, starterEvent, pendingEvents),
  );

  const currentState =
    timelineState.key === resetKey
      ? timelineState
      : createInitialState(resetKey, starterEvent, pendingEvents);
  const currentCandidate = currentState.pendingEvents[0];

  function startGame() {
    if (disabled) return;
    onIntroComplete?.();
  }

  function handleDragStart(event: DragStartEvent) {
    if (disabled || !currentCandidate || showIntro) return;

    if (currentCandidate.id === event.active.id) {
      setActiveEvent(currentCandidate);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);
    if (disabled || showIntro) return;

    const { active, over } = event;
    if (!over || !currentCandidate || currentCandidate.id !== active.id) return;

    const overId = String(over.id);
    if (!overId.startsWith("timeline-insert-")) return;

    placeCurrentEvent(Number(overId.replace("timeline-insert-", "")));
  }

  function placeCurrentEvent(insertIndex: number) {
    if (disabled || !currentCandidate || currentState.submitted) return;

    const beforeEvent = currentState.placedEvents[insertIndex - 1];
    const afterEvent = currentState.placedEvents[insertIndex];
    const lowerOrder = beforeEvent?.order ?? Number.NEGATIVE_INFINITY;
    const upperOrder = afterEvent?.order ?? Number.POSITIVE_INFINITY;
    const isCorrect =
      currentCandidate.order > lowerOrder && currentCandidate.order < upperOrder;

    if (!isCorrect) {
      onAnswer({
        correct: false,
        feedback: `${currentCandidate.title} belongs ${describeCorrectPlacement(
          currentCandidate,
          currentState.placedEvents,
        )}.`,
      });
      return;
    }

    const placedEvents = [
      ...currentState.placedEvents.slice(0, insertIndex),
      currentCandidate,
      ...currentState.placedEvents.slice(insertIndex),
    ];
    const pending = currentState.pendingEvents.slice(1);
    const allPlaced = pending.length === 0;

    setTimelineState({
      ...currentState,
      submitted: allPlaced,
      placedEvents,
      pendingEvents: pending,
      hasDropped: true,
    });

    if (allPlaced) {
      onAnswer({ correct: true, feedback: "Timeline restored correctly." });
    }
  }

  if (!starterEvent) return null;

  if (showIntro) {
    return (
      <TimelineIntro
        title={stage.question}
        instructions={stage.instructions}
        event={starterEvent}
        onStart={startGame}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveEvent(null)}
    >
      <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] px-4 pb-4 pt-4 text-[#0b0b0f]">
        <div className="grid min-h-0 flex-1 grid-cols-[24px_minmax(0,1fr)] gap-3">
          <div className="flex min-h-0 flex-col items-center pt-1">
            <span className="[writing-mode:vertical-rl] rotate-180 text-[12px]">
              Before
            </span>
            <div className="my-3 min-h-0 w-[3px] flex-1 rounded-full bg-[#d8d0c3]" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[12px]">
              After
            </span>
          </div>

          <div className="flex min-w-0 items-center py-2">
            <div className="w-full min-w-0">
            {currentState.placedEvents.map((event, index) => (
              <div key={event.id} className="min-w-0">
                <TimelineDropZone
                  index={index}
                  isEdge={index === 0}
                  isDragging={Boolean(activeEvent)}
                  disabled={disabled || !currentCandidate}
                  onChoose={placeCurrentEvent}
                />
                <TimelineRow
                  event={event}
                  index={index}
                  onOpen={() => setSelectedEvent(event)}
                />
              </div>
            ))}
            <TimelineDropZone
              index={currentState.placedEvents.length}
              isEdge
              isDragging={Boolean(activeEvent)}
              disabled={disabled || !currentCandidate}
              onChoose={placeCurrentEvent}
            />
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-[36px] pt-2">
          {currentCandidate ? (
            <>
              <p className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-widest text-[#343238]">
                Place the event on the timeline
              </p>
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-[#343238]">
                <span className="material-symbols-outlined text-[15px]">
                  style
                </span>
                <span>{currentState.pendingEvents.length}</span>
              </div>
              <EventCard
                event={currentCandidate}
                index={currentState.placedEvents.length}
              />
            </>
          ) : (
            <div className="rounded-md border-[3px] border-[#0b0b0f] bg-[#85cb57] p-3 text-center text-[15px] font-extrabold shadow-[0_4px_0_#0b0b0f]">
              Timeline complete
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeEvent ? (
          <EventCard
            event={activeEvent}
            overlay
            index={currentState.placedEvents.length}
          />
        ) : null}
      </DragOverlay>

      {selectedEvent ? (
        <EventInfoModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      ) : null}
    </DndContext>
  );
}

function createInitialState(
  key: string,
  starterEvent: TimelineEvent | undefined,
  pendingEvents: TimelineEvent[],
): TimelineState {
  return {
    key,
    submitted: false,
    placedEvents: starterEvent ? [starterEvent] : [],
    pendingEvents,
    hasDropped: false,
  };
}

function TimelineIntro({
  title,
  instructions,
  event,
  onStart,
}: {
  title: string;
  instructions: string;
  event: TimelineEvent;
  onStart: () => void;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col items-center justify-end overflow-hidden bg-[#f6f2ec] px-5 pb-12 text-[#0b0b0f]">
      <div className="absolute left-1/2 top-[18%] h-[340px] w-[3px] -translate-x-1/2 rounded-full bg-[#d8d0c3]" />

      <div className="relative mb-24 w-full">
        <TimelineFeatureCard event={event} />
      </div>

      <div className="mb-36 text-center">
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
          Timeline
        </p>
        <h1 className="font-display text-[30px] leading-none">{title}</h1>
        <p className="mx-auto mt-3 max-w-[330px] text-[15px] font-semibold leading-snug text-[#343238]">
          {instructions}
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="h-14 w-full max-w-[340px] rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f]"
      >
        Play
      </button>
    </div>
  );
}

function TimelineFeatureCard({ event }: { event: TimelineEvent }) {
  return (
    <div className="mx-auto grid min-h-[210px] w-full max-w-[380px] grid-cols-[116px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_8px_0_rgba(11,11,15,0.16)]">
      <EventImage event={event} className="h-full min-h-[210px] border-r-[3px] border-[#0b0b0f]" />
      <div className="relative min-w-0 px-3 py-3 pr-9">
        <span className="mb-2 inline-block max-w-full rounded-[4px] border border-[#0b0b0f] bg-[#f5f0e9] px-2 py-1 text-[14px] font-extrabold leading-none">
          {event.year}
        </span>
        <h2 className="text-[17px] font-extrabold leading-tight">{event.title}</h2>
        <p className="mt-1 text-[16px] leading-[1.18] text-[#343238]">{event.description}</p>
        <span className="material-symbols-outlined absolute right-2 top-2 rounded-full bg-[#fffdf7] text-[22px] text-[#85cb57]">
          check_circle
        </span>
      </div>
    </div>
  );
}

function TimelineDropZone({
  index,
  isEdge = false,
  isDragging,
  disabled,
  onChoose,
}: {
  index: number;
  isEdge?: boolean;
  isDragging: boolean;
  disabled?: boolean;
  onChoose: (index: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `timeline-insert-${index}`,
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled}
      onClick={() => onChoose(index)}
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-md border px-2 text-center font-bold leading-snug transition-[height,margin,background-color,border-color,box-shadow] duration-150 ${
        isOver
          ? "my-2 h-[48px] border-[3px] border-[#0b0b0f] bg-[#d7e96c] shadow-[0_4px_0_rgba(11,11,15,0.12)]"
        : isDragging
            ? "my-0 h-6 border-0 bg-transparent"
            : `${isEdge ? "h-4" : "h-3"} my-0 border-0 bg-transparent`
      } disabled:cursor-default`}
      aria-label={`Place event at position ${index + 1}`}
    >
      <span className={isOver ? "text-[12px]" : "sr-only"}>
        {index === 0 ? "Place before" : "Place here"}
      </span>
    </button>
  );
}

function TimelineRow({
  event,
  index,
  onOpen,
}: {
  event: TimelineEvent;
  index: number;
  onOpen: () => void;
}) {
  const colors = ["bg-[#fffdf7]", "bg-[#f5f0e9]", "bg-[#eadfd1]", "bg-[#fffdf7]"];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${colors[index % colors.length]} relative grid min-h-[70px] w-full min-w-0 grid-cols-[70px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] text-left transition active:scale-[0.99]`}
    >
      <EventImage event={event} className="h-full border-r-[3px] border-[#0b0b0f]" />
      <div className="min-w-0 px-3 py-2 pr-8">
        <span className="mb-1 inline-block max-w-full rounded-[4px] border border-[#0b0b0f] bg-[#fffdf7] px-1.5 py-0.5 text-[13px] font-extrabold leading-none">
          {event.year}
        </span>
        <span className="block text-[14px] font-extrabold leading-tight">
          {event.title}
        </span>
      </div>
      <span className="material-symbols-outlined absolute right-1.5 top-2 rounded-full bg-[#fffdf7] text-[22px] text-[#85cb57]">
        check_circle
      </span>
    </button>
  );
}

function EventImage({
  event,
  className,
}: {
  event: TimelineEvent;
  className?: string;
}) {
  if (event.image) {
    return (
      <img
        src={event.image}
        alt=""
        className={`w-full object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <div className={`flex w-full items-center justify-center bg-[#e5ded3] text-[#343238] ${className ?? ""}`}>
      <span className="material-symbols-outlined text-[30px]">
        history_edu
      </span>
    </div>
  );
}

function EventInfoModal({
  event,
  onClose,
}: {
  event: TimelineEvent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-[#0b0b0f]/25 px-4 pb-5">
      <div className="w-full rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-4 shadow-[0_6px_0_rgba(11,11,15,0.18)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="mb-2 inline-block rounded-[4px] border border-[#0b0b0f] bg-[#f5f0e9] px-2 py-1 text-sm font-extrabold leading-none">
              {event.year}
            </span>
            <h2 className="text-lg font-extrabold leading-tight">{event.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7]"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <p className="text-sm leading-relaxed text-[#343238]">
          {event.description}
        </p>
      </div>
    </div>
  );
}

function describeCorrectPlacement(
  draggedEvent: TimelineEvent,
  placedEvents: TimelineEvent[],
) {
  const sortedPlaced = [...placedEvents].sort((a, b) => a.order - b.order);
  const before = [...sortedPlaced]
    .reverse()
    .find((event) => event.order < draggedEvent.order);
  const after = sortedPlaced.find((event) => event.order > draggedEvent.order);

  if (!before && after) return `before ${after.title}`;
  if (before && !after) return `after ${before.title}`;
  if (before && after) return `between ${before.title} and ${after.title}`;
  return "in the timeline";
}
