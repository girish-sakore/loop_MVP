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
  hintsRemaining?: number;
  onUseHint?: () => void;
};

type TimelineState = {
  key: string;
  submitted: boolean;
  placedEvents: TimelineEvent[];
  pendingEvents: TimelineEvent[];
  hasDropped: boolean;
  hintFeedback: Record<string, boolean>; // eventId -> isCorrectlyOrdered
};

const DEFAULT_HINTS = 3;

// Rotating accent palette pulled from the app's existing game-theme colors
// so timeline cards read as part of the same visual family as the other games.
const THEME_ACCENTS = ["#b7a4f0", "#f7d91f", "#8bc34a", "#ec7fae"];

export function TimelineBuilder({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
  hintsRemaining = DEFAULT_HINTS,
  onUseHint,
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

    const placedEvents = [
      ...currentState.placedEvents.slice(0, insertIndex),
      currentCandidate,
      ...currentState.placedEvents.slice(insertIndex),
    ];
    const pending = currentState.pendingEvents.slice(1);

    setTimelineState({
      ...currentState,
      submitted: false,
      placedEvents,
      pendingEvents: pending,
      hasDropped: true,
      hintFeedback: {}, // manual placement clears any stale hint marks
    });
  }

  function removePlacedEvent(eventId: string) {
    if (disabled || currentState.submitted || eventId === starterEvent?.id) return;
    const event = currentState.placedEvents.find((e) => e.id === eventId);
    if (!event) return;

    const placedEvents = currentState.placedEvents.filter((e) => e.id !== eventId);
    const pending = [event, ...currentState.pendingEvents];

    setTimelineState({
      ...currentState,
      placedEvents,
      pendingEvents: pending,
      hintFeedback: {},
    });
  }

  function applyHint() {
    if (disabled || hintsRemaining <= 0 || currentState.submitted) return;

    let placedEvents = currentState.placedEvents;
    let pending = currentState.pendingEvents;

    if (currentCandidate) {
      // A card is still waiting to be placed — auto-place it in its
      // correct chronological slot.
      const insertIndex = currentState.placedEvents.findIndex(
        (event) => event.order > currentCandidate.order,
      );
      const targetIndex =
        insertIndex === -1 ? currentState.placedEvents.length : insertIndex;

      placedEvents = [
        ...currentState.placedEvents.slice(0, targetIndex),
        currentCandidate,
        ...currentState.placedEvents.slice(targetIndex),
      ];
      pending = currentState.pendingEvents.slice(1);
    }
    // If everything is already placed, we skip straight to marking
    // feedback on what's there — nothing left to auto-place.

    // Mark every currently placed card as correct/incorrect based on
    // chronological ordering, same idea as drag-drop's per-slot feedback.
    const feedback: Record<string, boolean> = {};
    placedEvents.forEach((event, index, arr) => {
      feedback[event.id] = index === 0 || event.order > arr[index - 1].order;
    });

    setTimelineState({
      ...currentState,
      placedEvents,
      pendingEvents: pending,
      hasDropped: true,
      hintFeedback: feedback,
    });

    onUseHint?.();
  }

  function checkGuess() {
    if (disabled || currentState.pendingEvents.length > 0 || currentState.submitted) return;

    const isCorrect = currentState.placedEvents.every(
      (event, index, arr) => index === 0 || event.order > arr[index - 1].order,
    );

    setTimelineState((prev) => ({
      ...prev,
      submitted: true,
    }));

    onAnswer({
      correct: isCorrect,
      feedback: isCorrect
        ? "Timeline restored correctly."
        : "Not quite. Check the dates and try again.",
    });
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
                  onRemove={
                    event.id !== starterEvent.id
                      ? () => removePlacedEvent(event.id)
                      : undefined
                  }
                  feedback={currentState.hintFeedback[event.id]}
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
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#343238]">
                  Place the event on the timeline
                </p>
                <button
                  type="button"
                  onClick={applyHint}
                  disabled={disabled || hintsRemaining <= 0}
                  className="relative flex h-8 items-center gap-1 rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-3 text-[12px] font-extrabold transition active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    lightbulb
                  </span>
                  Hint
                  {hintsRemaining > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#ffb1bd] text-[10px] font-extrabold">
                      {hintsRemaining}
                    </span>
                  )}
                </button>
              </div>
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-[#343238]">
                <span className="material-symbols-outlined text-[15px]">
                  style
                </span>
                <span>{currentState.pendingEvents.length} left</span>
              </div>
              <EventCard
                event={currentCandidate}
                index={currentState.placedEvents.length}
              />
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1 pb-2">
              <p className="text-center text-[12px] font-extrabold text-[#343238]">
                All events placed. Ready to check?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={checkGuess}
                  disabled={disabled || currentState.submitted}
                  className="h-12 flex-1 rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[15px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none"
                >
                  Guess
                </button>
                <button
                  type="button"
                  onClick={applyHint}
                  disabled={disabled || hintsRemaining <= 0 || currentState.submitted}
                  className="relative h-12 w-[64px] rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-[15px] font-extrabold transition active:scale-95 disabled:opacity-50"
                >
                  Hint
                  {hintsRemaining > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#ffb1bd] text-[10px] font-extrabold">
                      {hintsRemaining}
                    </span>
                  )}
                </button>
              </div>
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
    hintFeedback: {},
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

      <div className="relative mb-20 w-full mt-5">
        <TimelineFeatureCard event={event} />
      </div>

      <div className="mb-30 text-center">
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
    <div className="mx-auto grid min-h-[240px] w-full max-w-[380px] grid-cols-[132px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_8px_0_rgba(11,11,15,0.16)]">
      <EventImage event={event} className="h-full min-h-[240px] border-r-[3px] border-[#0b0b0f]" />
      <div className="relative min-w-0 px-4 py-4 pr-10">
        <span
          className="mb-2 inline-block max-w-full rounded-[4px] border-2 border-[#0b0b0f] px-2.5 py-1 text-[15px] font-extrabold leading-none"
          style={{ backgroundColor: THEME_ACCENTS[0] }}
        >
          {event.year}
        </span>
        <h2 className="text-[19px] font-extrabold leading-tight">{event.title}</h2>
        <p className="mt-1.5 text-[16px] leading-[1.2] text-[#343238]">{event.description}</p>
        <span className="material-symbols-outlined absolute right-2.5 top-2.5 rounded-full bg-[#fffdf7] text-[24px] text-[#85cb57]">
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
          ? "my-2 h-[56px] border-[3px] border-[#0b0b0f] bg-[#d7e96c] shadow-[0_4px_0_rgba(11,11,15,0.12)]"
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
  onRemove,
  feedback,
}: {
  event: TimelineEvent;
  index: number;
  onOpen: () => void;
  onRemove?: () => void;
  feedback?: boolean;
}) {
  const accent = THEME_ACCENTS[index % THEME_ACCENTS.length];

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="relative flex min-h-[96px] w-full min-w-0 cursor-pointer overflow-hidden rounded-md border-[3px] border-[#0b0b0f] shadow-[0_5px_0_rgba(11,11,15,0.16)] transition active:scale-[0.99]"
    >
      <div className="flex h-auto w-[96px] shrink-0 items-center justify-center border-r-[3px] border-[#0b0b0f] bg-[#f5f0e9]">
        <EventImage event={event} className="h-full w-full" />
      </div>
      <div
        className="flex min-w-0 flex-1 items-center px-4 py-3 pr-10"
        style={{ backgroundColor: accent }}
      >
        <div className="min-w-0">
          <span className="mb-1.5 inline-block max-w-full rounded-[4px] border-2 border-[#0b0b0f] bg-[#fffdf7] px-2.5 py-1 text-[14px] font-extrabold leading-none text-[#0b0b0f]">
            {event.year}
          </span>
          <span className="block text-[17px] font-extrabold leading-tight text-[#0b0b0f]">
            {event.title}
          </span>
        </div>
      </div>
      {feedback !== undefined ? (
        <span
          className={`absolute left-[106px] top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b0b0f] text-[13px] font-extrabold ${
            feedback ? "bg-[#85cb57]" : "bg-[#ffb1bd]"
          }`}
        >
          {feedback ? "✓" : "✕"}
        </span>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7] text-[#0b0b0f] transition hover:bg-[#ffb1bd] active:scale-95"
          aria-label="Remove event from timeline"
        >
          <span className="material-symbols-outlined text-[17px]">close</span>
        </button>
      ) : (
        <span className="material-symbols-outlined absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7] text-[18px] text-[#0b0b0f]">
          check
        </span>
      )}
    </div>
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