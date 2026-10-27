"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { EventCard } from "./event-card";
import { HintButton } from "@/components/hints/hint-button";
import { STAGE_GROUP } from "@/features/gameplay/hints/registry";
import { useInteractionProgress } from "@/features/gameplay/progress/use-interaction-progress";
import type { StageHints, TimelineBuilderStage, TimelineEvent } from "@/types/gameplay";

type Props = {
  stage: TimelineBuilderStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
  hints?: StageHints;
  interactionState?: Record<string, unknown>;
  onInteractionStateChange?: (state: Record<string, unknown>) => void;
};

type SavedTimeline = {
  placedIds: string[];
  pendingIds: string[];
  confirmedIds: string[];
  incorrectIds: string[];
  submitted: boolean;
};

export function TimelineBuilder({
  stage,
  onAnswer,
  disabled,
  showIntro = true,
  onIntroComplete,
  hints,
  interactionState,
  onInteractionStateChange,
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
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [tl, update] = useInteractionProgress<SavedTimeline>({
    defaultState: {
      placedIds: starterEvent ? [starterEvent.id] : [],
      pendingIds: pendingEvents.map((event) => event.id),
      confirmedIds: [],
      incorrectIds: [],
      submitted: false,
    },
    interactionState: interactionState as Partial<SavedTimeline> | undefined,
    onInteractionStateChange: onInteractionStateChange as
      | ((state: SavedTimeline) => void)
      | undefined,
    sanitize: (raw) => {
      const ids = stage.events.map((event) => event.id);
      const placed = Array.isArray(raw.placedIds) ? raw.placedIds : [];
      const pending = Array.isArray(raw.pendingIds) ? raw.pendingIds : [];
      const all = [...placed, ...pending];
      const valid =
        !raw.submitted &&
        !!starterEvent &&
        placed.includes(starterEvent.id) &&
        all.length === ids.length &&
        new Set(all).size === ids.length &&
        all.every((id) => ids.includes(id));
      if (!valid) return {};
      return {
        placedIds: placed,
        pendingIds: pending,
        confirmedIds: (Array.isArray(raw.confirmedIds) ? raw.confirmedIds : []).filter(
          (id) => placed.includes(id) && id !== starterEvent.id,
        ),
        incorrectIds: (Array.isArray(raw.incorrectIds) ? raw.incorrectIds : []).filter(
          (id) => placed.includes(id) && id !== starterEvent.id,
        ),
        submitted: false,
      };
    },
  });
  const byId = useMemo(
    () => new Map(stage.events.map((event) => [event.id, event] as const)),
    [stage.events],
  );
  const toEvents = (ids: string[]) =>
    ids.map((id) => byId.get(id)).filter((event): event is TimelineEvent => !!event);
  const placedEvents = toEvents(tl.placedIds);
  const currentCandidate = byId.get(tl.pendingIds[0] ?? "");
  const group = hints?.group(STAGE_GROUP);
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  function startGame() {
    if (!disabled) onIntroComplete?.();
  }

  function handleDragStart(event: DragStartEvent) {
    if (disabled || showIntro) return;

    const activeId = String(event.active.id);
    if (currentCandidate?.id === activeId) {
      setActiveEvent(currentCandidate);
      return;
    }

    if (activeId.startsWith("timeline-placed-")) {
      const eventId = activeId.replace("timeline-placed-", "");
      const placedEvent = byId.get(eventId);
      if (placedEvent) setActiveEvent(placedEvent);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);
    if (disabled || showIntro || !event.over) return;
    const overId = String(event.over.id);
    if (!overId.startsWith("timeline-insert-")) return;

    const insertIndex = Number(overId.replace("timeline-insert-", ""));
    const activeId = String(event.active.id);
    if (currentCandidate?.id === activeId) placeCurrentEvent(insertIndex);
    if (activeId.startsWith("timeline-placed-")) {
      movePlacedEvent(activeId.replace("timeline-placed-", ""), insertIndex);
    }
  }

  function placeCurrentEvent(insertIndex: number) {
    if (disabled || tl.submitted) return;
    update((prev) => {
      const id = prev.pendingIds[0];
      if (!id) return {};
      return {
        placedIds: [
          ...prev.placedIds.slice(0, insertIndex),
          id,
          ...prev.placedIds.slice(insertIndex),
        ],
        pendingIds: prev.pendingIds.slice(1),
      };
    });
  }

  function removePlacedEvent(eventId: string) {
    if (disabled || tl.submitted || eventId === starterEvent?.id) return;
    update((prev) =>
      prev.confirmedIds.includes(eventId) || !prev.placedIds.includes(eventId)
        ? {}
        : {
            placedIds: prev.placedIds.filter((id) => id !== eventId),
            pendingIds: [eventId, ...prev.pendingIds],
            incorrectIds: prev.incorrectIds.filter((id) => id !== eventId),
          },
    );
  }

  function movePlacedEvent(eventId: string, insertIndex: number) {
    if (disabled || tl.submitted || eventId === starterEvent?.id) return;

    update((prev) => {
      if (prev.confirmedIds.includes(eventId)) return {};
      const fromIndex = prev.placedIds.indexOf(eventId);
      if (fromIndex < 0) return {};

      const remainingIds = prev.placedIds.filter((id) => id !== eventId);
      const nextIndex = Math.max(
        0,
        Math.min(insertIndex > fromIndex ? insertIndex - 1 : insertIndex, remainingIds.length),
      );
      if (nextIndex === fromIndex) return {};

      return {
        placedIds: [
          ...remainingIds.slice(0, nextIndex),
          eventId,
          ...remainingIds.slice(nextIndex),
        ],
      };
    });
  }

  function handleHint() {
    if (disabled || tl.submitted || !group?.canReveal || !starterEvent) return;
    const judged = placedEvents.filter(
      (event) => event.id !== starterEvent.id && !tl.confirmedIds.includes(event.id),
    );
    if (judged.length === 0 || !group.reveal()) return;

    const right = judged
      .filter((event) => isRightlyPlaced(event, placedEvents))
      .map((event) => event.id);
    const wrong = judged
      .filter((event) => !right.includes(event.id))
      .map((event) => event.id);
    update((prev) => ({
      confirmedIds: Array.from(new Set([...prev.confirmedIds, ...right])),
      incorrectIds: Array.from(new Set([...prev.incorrectIds, ...wrong])),
    }));
  }

  function checkGuess() {
    if (disabled || tl.pendingIds.length > 0 || tl.submitted) return;
    const isCorrect = placedEvents.every(
      (event, index, events) => index === 0 || event.order > events[index - 1].order,
    );
    update({ submitted: true });
    onAnswer({
      correct: isCorrect,
      feedback: isCorrect
        ? "Timeline restored correctly."
        : "Not quite. Check the order and try again.",
    });
  }

  if (!starterEvent) return null;
  if (showIntro) {
    return <TimelineIntro title={stage.question} instructions={stage.instructions} event={starterEvent} onStart={startGame} />;
  }

  const hintDisabled = disabled || tl.submitted || !group?.canReveal;
  const canReorder = placedEvents.some(
    (event) => event.id !== starterEvent.id && !tl.confirmedIds.includes(event.id),
  );
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveEvent(null)}>
      <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] px-4 pb-4 pt-4 text-[#0b0b0f]">
        <div className="grid min-h-0 flex-1 grid-cols-[24px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-3">
          <div className="flex min-h-0 flex-col items-center pt-1">
            <span className="[writing-mode:vertical-rl] rotate-180 text-[12px]">Before</span>
            <div className="my-3 min-h-0 w-[3px] flex-1 rounded-full bg-[#d8d0c3]" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[12px]">After</span>
          </div>
          <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain py-2 pr-1 [scrollbar-gutter:stable]">
            <div className="flex min-h-full min-w-0 items-center">
              <div className="w-full min-w-0">
              {placedEvents.map((event, index) => (
                <div key={event.id} className="min-w-0">
                  <TimelineDropZone index={index} isEdge={index === 0} isDragging={Boolean(activeEvent)} disabled={disabled || (!currentCandidate && !canReorder)} onChoose={placeCurrentEvent} />
                  <TimelineRow
                    event={event}
                    index={index}
                    status={
                      event.id === starterEvent.id || tl.confirmedIds.includes(event.id)
                        ? "correct"
                        : tl.incorrectIds.includes(event.id)
                          ? "wrong"
                          : "unrevealed"
                    }
                    draggable={event.id !== starterEvent.id && !tl.confirmedIds.includes(event.id)}
                    onOpen={() => setSelectedEvent(event)}
                    onRemove={event.id !== starterEvent.id && !tl.confirmedIds.includes(event.id) ? () => removePlacedEvent(event.id) : undefined}
                  />
                </div>
              ))}
                <TimelineDropZone index={placedEvents.length} isEdge isDragging={Boolean(activeEvent)} disabled={disabled || (!currentCandidate && !canReorder)} onChoose={placeCurrentEvent} />
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-[36px] pt-2">
          {currentCandidate ? (
            <>
              <p className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-widest text-[#343238]">Place the event on the timeline</p>
              <div className="mb-2 flex items-center justify-between gap-1.5 text-[12px] font-extrabold text-[#343238]">
                <span className="material-symbols-outlined text-[15px]">style</span>
                <span>{tl.pendingIds.length} left</span>
                <HintButton group={group} onOpen={handleHint} disabled={hintDisabled} />
              </div>
              <EventCard event={currentCandidate} index={placedEvents.length} />
              <button
                type="button"
                onClick={checkGuess}
                disabled={disabled || tl.pendingIds.length > 0 || tl.submitted}
                className="mt-2 h-12 w-full rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[15px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none"
              >
                Guess
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pb-2 pt-1">
              <p className="text-center text-[12px] font-extrabold text-[#343238]">All events placed. Ready to check?</p>
              <div className="flex gap-2">
                <button type="button" onClick={checkGuess} disabled={disabled || tl.submitted} className="h-12 flex-1 rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[15px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none">Guess</button>
                <HintButton group={group} onOpen={handleHint} disabled={hintDisabled} />
              </div>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>{activeEvent ? <EventCard event={activeEvent} overlay index={placedEvents.length} /> : null}</DragOverlay>
      {selectedEvent ? <EventInfoModal event={selectedEvent} onClose={() => setSelectedEvent(null)} /> : null}
    </DndContext>
  );
}

function isRightlyPlaced(event: TimelineEvent, placedEvents: TimelineEvent[]) {
  const index = placedEvents.indexOf(event);
  return placedEvents.every(
    (other, otherIndex) => otherIndex === index || (otherIndex < index ? other.order < event.order : other.order > event.order),
  );
}

function TimelineIntro({ title, instructions, event, onStart }: { title: string; instructions: string; event: TimelineEvent; onStart: () => void }) {
  return (
    <div className="flex min-h-[calc(100dvh-86px)] flex-col bg-[#f6f2ec] px-5 py-8 text-[#0b0b0f]">
      <div className="flex flex-1 flex-col items-center justify-center gap-9">
        <div className="w-full"><TimelineFeatureCard event={event} /></div>
        <div className="max-w-[340px] text-center">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">Timeline</p>
        <h1 className="font-display text-[30px] leading-none">{title}</h1>
        <p className="mx-auto mt-3 max-w-[330px] text-[15px] font-semibold leading-snug text-[#343238]">{instructions}</p>
        </div>
      </div>
      <button type="button" onClick={onStart} className="mt-6 h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f]">Play</button>
    </div>
  );
}

function TimelineFeatureCard({ event }: { event: TimelineEvent }) {
  return (
    <div className="mx-auto grid min-h-[210px] w-full max-w-[380px] grid-cols-[116px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_8px_0_rgba(11,11,15,0.16)]">
      <EventImage event={event} className="h-full min-h-[210px] border-r-[3px] border-[#0b0b0f]" />
      <div className="relative min-w-0 px-3 py-3 pr-9">
        <h2 className="text-[17px] font-extrabold leading-tight">{event.title}</h2>
        <p className="mt-1 text-[16px] leading-[1.18] text-[#343238]">{event.description}</p>
        <span className="material-symbols-outlined absolute right-2 top-2 rounded-full bg-[#fffdf7] text-[22px] text-[#85cb57]">check_circle</span>
      </div>
    </div>
  );
}

function TimelineDropZone({ index, isEdge = false, isDragging, disabled, onChoose }: { index: number; isEdge?: boolean; isDragging: boolean; disabled?: boolean; onChoose: (index: number) => void }) {
  const { isOver, setNodeRef } = useDroppable({ id: `timeline-insert-${index}`, disabled });
  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled}
      onClick={() => onChoose(index)}
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-md border px-2 text-center font-bold leading-snug transition-[height,margin,background-color,border-color,box-shadow] duration-150 ${isOver ? "my-2 h-[48px] border-[3px] border-[#0b0b0f] bg-[#d7e96c] shadow-[0_4px_0_rgba(11,11,15,0.12)]" : isDragging ? "my-0 h-6 border-0 bg-transparent" : `${isEdge ? "h-4" : "h-3"} my-0 border-0 bg-transparent`} disabled:cursor-default`}
      aria-label={`Place event at position ${index + 1}`}
    >
      <span className={isOver ? "text-[12px]" : "sr-only"}>{index === 0 ? "Place before" : "Place here"}</span>
    </button>
  );
}

function TimelineRow({ event, index, status, draggable, onOpen, onRemove }: { event: TimelineEvent; index: number; status: "correct" | "wrong" | "unrevealed"; draggable: boolean; onOpen: () => void; onRemove?: () => void }) {
  const colors = ["bg-[#fffdf7]", "bg-[#f5f0e9]", "bg-[#eadfd1]", "bg-[#fffdf7]"];
  const feedbackColor = status === "correct" ? "bg-[#d7e96c]" : status === "wrong" ? "bg-[#ffb1bd]" : colors[index % colors.length];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `timeline-placed-${event.id}`,
    disabled: !draggable,
  });
  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.45 : 1 }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          onOpen();
        }
      }}
      className={`${feedbackColor} relative grid h-[88px] w-full min-w-0 ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} grid-cols-[70px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] text-left transition active:scale-[0.99]`}
    >
      <EventImage event={event} className="h-full border-r-[3px] border-[#0b0b0f]" />
      <div className="min-w-0 px-3 py-2 pr-8">
        <span className="line-clamp-1 block text-[14px] font-extrabold leading-tight">{event.title}</span>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#343238]">{event.description}</p>
      </div>
      {onRemove ? (
        <button type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); onRemove(); }} className={`absolute right-1.5 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b0b0f] bg-[#fffdf7] text-[#0b0b0f] transition active:scale-95 ${status === "wrong" ? "bg-[#ff7f94]" : "hover:bg-[#ffb1bd]"}`} aria-label="Remove event from timeline">
          <span className="material-symbols-outlined text-[16px]">{status === "wrong" ? "cancel" : "close"}</span>
        </button>
      ) : (
        <span className="material-symbols-outlined absolute right-1.5 top-2 rounded-full bg-[#fffdf7] text-[22px] text-[#85cb57]">check_circle</span>
      )}
    </div>
  );
}

function EventImage({ event, className }: { event: TimelineEvent; className?: string }) {
  if (event.image) return <img src={event.image} alt="" className={`w-full object-cover ${className ?? ""}`} />;
  return <div className={`flex w-full items-center justify-center bg-[#e5ded3] text-[#343238] ${className ?? ""}`}><span className="material-symbols-outlined text-[30px]">history_edu</span></div>;
}

function EventInfoModal({ event, onClose }: { event: TimelineEvent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-[#0b0b0f]/25 px-4 pb-5">
      <div className="w-full overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_6px_0_rgba(11,11,15,0.18)]">
        {event.image ? (
          <img
            src={event.image}
            alt=""
            className="h-52 w-full border-b-[3px] border-[#0b0b0f] object-cover"
          />
        ) : null}
        <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold leading-tight">{event.title}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7]" aria-label="Close event details"><span className="material-symbols-outlined text-2xl">close</span></button>
        </div>
        <p className="text-sm leading-relaxed text-[#343238]">{event.description}</p>
        </div>
      </div>
    </div>
  );
}
