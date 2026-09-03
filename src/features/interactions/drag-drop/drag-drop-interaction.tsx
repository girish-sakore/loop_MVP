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
import { AnimatePresence, motion, PanInfo } from "framer-motion";

import type {
  DragDropStage,
  LinkMapCard,
  LinkMapPath,
  LinkMapRelation,
  LinkMapSlot,
} from "@/types/gameplay";

type Props = {
  stage: DragDropStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

type CardLocation =
  | { area: "hand"; index: number }
  | { area: "slot"; slotId: string };

type PlacementState = {
  key: string;
  handIds: string[];
  slotCardIds: Record<string, string | null>;
};

const CARD_COLORS = ["#fffdf7", "#f5f0e9", "#eadfd1", "#d7e96c"];
const SWIPE_DISTANCE = 64;

export function DragDropInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const cardsById = useMemo(
    () => new Map(stage.cards.map((card) => [card.id, card])),
    [stage.cards],
  );
  const resetKey = `${retryCount}:${stage.id}:${stage.cards
    .map((card) => card.id)
    .join("|")}`;
  const [state, setState] = useState<PlacementState>(() =>
    createInitialState(resetKey, stage),
  );
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentState =
    state.key === resetKey ? state : createInitialState(resetKey, stage);
  const handCards = currentState.handIds
    .map((id) => cardsById.get(id))
    .filter(Boolean) as LinkMapCard[];
  const activeHandIndex = clamp(activeIndex, 0, Math.max(handCards.length - 1, 0));
  const activeHandCard = handCards[activeHandIndex];
  const placedCount = stage.map.slots.filter(
    (slot) => currentState.slotCardIds[slot.id],
  ).length;
  const allPlaced = placedCount === stage.map.slots.length;

  function startGame() {
    if (disabled) return;
    onIntroComplete?.();
  }

  function moveHand(direction: number) {
    if (handCards.length < 2) return;
    setActiveIndex((index) => wrap(index + direction, handCards.length));
  }

  function handleCardSwipe(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) < SWIPE_DISTANCE) return;
    moveHand(info.offset.x < 0 ? 1 : -1);
  }

  function handleDragStart(event: DragStartEvent) {
    if (disabled || showIntro) return;
    setActiveCardId(String(event.active.id).replace("card:", ""));
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id).replace("card:", "");
    const overId = event.over?.id ? String(event.over.id) : "";
    setActiveCardId(null);

    if (disabled || showIntro || !overId.startsWith("slot:")) return;

    const targetSlotId = overId.replace("slot:", "");
    const source = findCardLocation(activeId, currentState);
    if (!source) return;

    setState((latest) => {
      const base = latest.key === resetKey ? latest : currentState;
      return moveCard(base, activeId, source, targetSlotId);
    });
    setActiveIndex(0);
  }

  function checkGuess() {
    if (disabled || !allPlaced) return;

    const correct = stage.map.slots.every(
      (slot) => currentState.slotCardIds[slot.id] === slot.answerCardId,
    );

    onAnswer({
      correct,
      feedback: correct ? stage.feedback.correct : stage.feedback.incorrect,
    });
  }

  if (showIntro) {
    return (
      <DragDropIntro
        stage={stage}
        cards={stage.cards.slice(0, 2)}
        onStart={startGame}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveCardId(null)}
    >
      <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] text-[#0b0b0f]">
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 pt-2">
          <LinkMap
            stage={stage}
            slotCardIds={currentState.slotCardIds}
            cardsById={cardsById}
            disabled={disabled}
          />
        </div>

        <div
          className={`shrink-0 border-t border-[#e5ded3] px-4 pb-4 pt-2 transition-opacity ${disabled ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
        >
          <div className="mx-auto mb-2 flex max-w-[330px] items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-[#343238]">
            <span className="inline-flex items-center gap-1 tracking-normal">
              <span className="material-symbols-outlined text-[15px]">
                style
              </span>
              {handCards.length}
            </span>
            <span>
              {placedCount}/{stage.map.slots.length}
            </span>
          </div>

          <div className="relative mx-auto h-[116px] max-w-[270px]">
            {handCards.slice(0, 3).map((card, index) => {
              if (card.id === activeHandCard?.id) return null;

              return (
                <div
                  key={card.id}
                  className="pointer-events-none absolute left-1/2 bottom-0"
                  style={{
                    zIndex: 1,
                    transform: `translateX(-50%) translate(${(index + 1) * 8}px, ${-(index + 1) * 5}px) rotate(${(index + 1) * 4}deg)`,
                    opacity: 0.55 - index * 0.12,
                  }}
                >
                  <CardFace
                    card={card}
                    color={getCardColor(card, index)}
                    tray
                  />
                </div>
              );
            })}
            <AnimatePresence mode="popLayout">
              {activeHandCard ? (
                <motion.div
                  key={activeHandCard.id}
                  className="absolute inset-x-0 bottom-0 z-10 flex justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={handleCardSwipe}
                  initial={{ opacity: 0, y: 18, rotate: 2 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  exit={{ opacity: 0, y: 20, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                  style={{ touchAction: "pan-y" }}
                >
                  <LinkCard card={activeHandCard} disabled={disabled} index={activeHandIndex} tray />
                </motion.div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-[#d8d0c3] text-[14px] font-bold text-[#7f766b]">
                  All cards placed
                </div>
              )}
            </AnimatePresence>
            {handCards.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => moveHand(-1)}
                  className="absolute -left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] transition active:scale-95"
                  aria-label="Previous card"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => moveHand(1)}
                  className="absolute -right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] transition active:scale-95"
                  aria-label="Next card"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_right
                  </span>
                </button>
              </>
            ) : null}
          </div>

          <div className="mx-auto mt-3 flex max-w-[366px] gap-2">
            <button
              type="button"
              onClick={checkGuess}
              disabled={disabled || !allPlaced}
              className="h-12 flex-1 rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[15px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#0b0b0f] disabled:border-[#cfc8bd] disabled:bg-transparent disabled:text-[#b7afa4] disabled:shadow-none"
            >
              Guess
            </button>
            <button
              type="button"
              disabled={disabled}
              className="h-12 w-[64px] rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-[15px] font-extrabold transition active:scale-95 disabled:opacity-50"
            >
              Hint
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCardId ? (
          <CardFace
            card={cardsById.get(activeCardId)}
            color={getCardColor(cardsById.get(activeCardId), 0)}
            overlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function LinkMap({
  stage,
  slotCardIds,
  cardsById,
  disabled,
}: {
  stage: DragDropStage;
  slotCardIds: Record<string, string | null>;
  cardsById: Map<string, LinkMapCard>;
  disabled?: boolean;
}) {
  const paths = stage.map.paths ?? createFallbackPaths(stage.map.relations);

  return (
    <div className="relative mx-auto h-[min(58dvh,470px)] min-h-[390px] w-full max-w-[390px]">
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <polyline
            key={path.id}
            points={path.points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="#d8d0c3"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {stage.map.relations.map((relation) => (
        <RelationBubble key={relation.id} relation={relation} />
      ))}

      {stage.map.slots.map((slot) => {
        const cardId = slotCardIds[slot.id];
        return (
          <MapSlot
            key={slot.id}
            slot={slot}
            card={cardId ? cardsById.get(cardId) : undefined}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}

function RelationBubble({ relation }: { relation: LinkMapRelation }) {
  return (
    <motion.div
      className="absolute z-10 flex h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-[#fffdf7] px-2 text-center text-[13px] font-extrabold leading-[1.04] shadow-[0_3px_0_rgba(11,11,15,0.12)]"
      style={{
        left: `${relation.x}%`,
        top: `${relation.y}%`,
        borderColor: relation.color ?? "#85cb57",
      }}
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {relation.label}
    </motion.div>
  );
}

function MapSlot({
  slot,
  card,
  disabled,
}: {
  slot: LinkMapSlot;
  card?: LinkMapCard;
  disabled?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot:${slot.id}`,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`absolute z-20 h-[96px] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-md transition ${isOver ? "scale-105 ring-4 ring-[#0b0b0f]/20" : ""
        }`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      {card ? (
        <LinkCard card={card} disabled={disabled} compact slotId={slot.id} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-md border-[3px] border-dashed border-[#0b0b0f] bg-[#fffdf7]/80 shadow-[0_3px_0_rgba(11,11,15,0.08)]">
          <span className="sr-only">{slot.label}</span>
        </div>
      )}
    </div>
  );
}

function LinkCard({
  card,
  disabled,
  compact = false,
  tray = false,
  slotId,
  index = 0,
}: {
  card: LinkMapCard;
  disabled?: boolean;
  compact?: boolean;
  tray?: boolean;
  slotId?: string;
  index?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `card:${card.id}`,
      disabled,
      data: { cardId: card.id, slotId },
    });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <CardFace
        card={card}
        compact={compact}
        tray={tray}
        color={getCardColor(card, index)}
      />
    </div>
  );
}

function CardFace({
  card,
  color,
  compact = false,
  tray = false,
  overlay = false,
}: {
  card?: LinkMapCard;
  color: string;
  compact?: boolean;
  tray?: boolean;
  overlay?: boolean;
}) {
  if (!card) return null;

  return (
    <div
      className={`grid overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_5px_0_rgba(11,11,15,0.16)] ${compact
          ? "h-[96px] w-[72px] grid-rows-[34px_minmax(0,1fr)]"
          : tray
            ? "h-[112px] w-[92px] grid-rows-[48px_minmax(0,1fr)]"
            : "h-[148px] w-[120px] grid-rows-[62px_minmax(0,1fr)]"
        } ${overlay ? "rotate-[-2deg] shadow-[0_10px_0_rgba(11,11,15,0.18)]" : ""}`}
    >
      <div
        className={`flex min-w-0 items-center border-b-[3px] border-[#0b0b0f] px-2 font-extrabold leading-tight ${compact ? "text-[10px]" : tray ? "text-[14px]" : "text-[17px]"
          }`}
        style={{ background: color }}
      >
        <span className="line-clamp-2">{card.title}</span>
      </div>
      {card.image ? (
        <img src={card.image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#eadfd1] text-[#343238]">
          <span className="material-symbols-outlined text-[32px]">
            playing_cards
          </span>
        </div>
      )}
    </div>
  );
}

function DragDropIntro({
  stage,
  cards,
  onStart,
}: {
  stage: DragDropStage;
  cards: LinkMapCard[];
  onStart: () => void;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#f6f2ec] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative mb-10 h-[280px] w-full max-w-[390px]">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="absolute top-6"
              style={{
                left: index === 0 ? "7%" : "58%",
              }}
              initial={{
                opacity: 0,
                y: index === 0 ? 30 : -20,
                rotate: index === 0 ? -18 : 12,
              }}
              animate={{
                opacity: 1,
                y: [index === 0 ? 30 : -20, 0, index === 0 ? 8 : -8, 0],
                rotate: index === 0 ? [-18, -13, -17] : [12, 16, 11],
              }}
              transition={{
                opacity: { duration: 0.24, delay: index * 0.12 },
                y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <CardFace card={card} color={getCardColor(card, index)} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#5fa43a]">
            {stage.introLabel ?? "Links"}
          </p>
          <h1 className="font-display text-[36px] leading-none">
            {stage.map.title}
          </h1>
          <p className="mx-auto mt-3 max-w-[310px] text-[15px] font-semibold leading-snug text-[#343238]">
            {stage.prompt}
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        className="relative h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f]"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0 #0b0b0f" }}
        transition={{ delay: 0.46, duration: 0.3 }}
      >
        Play
      </motion.button>
    </div>
  );
}

function createInitialState(key: string, stage: DragDropStage): PlacementState {
  return {
    key,
    handIds: stage.cards.map((card) => card.id),
    slotCardIds: Object.fromEntries(
      stage.map.slots.map((slot) => [slot.id, null]),
    ),
  };
}

function findCardLocation(
  cardId: string,
  state: PlacementState,
): CardLocation | null {
  const handIndex = state.handIds.indexOf(cardId);
  if (handIndex >= 0) return { area: "hand", index: handIndex };

  const slot = Object.entries(state.slotCardIds).find(
    ([, placedCardId]) => placedCardId === cardId,
  );
  return slot ? { area: "slot", slotId: slot[0] } : null;
}

function moveCard(
  state: PlacementState,
  cardId: string,
  source: CardLocation,
  targetSlotId: string,
): PlacementState {
  const targetCardId = state.slotCardIds[targetSlotId];
  const handIds = [...state.handIds];
  const slotCardIds = { ...state.slotCardIds };

  if (source.area === "hand") {
    handIds.splice(source.index, 1);
    if (targetCardId) handIds.splice(source.index, 0, targetCardId);
  } else {
    slotCardIds[source.slotId] = targetCardId ?? null;
  }

  slotCardIds[targetSlotId] = cardId;
  return { ...state, handIds, slotCardIds };
}

function createFallbackPaths(relations: LinkMapRelation[]): LinkMapPath[] {
  return relations.flatMap((relation) =>
    relation.slotIds.map((slotId, index) => ({
      id: `${relation.id}:${slotId}:${index}`,
      points: [
        { x: relation.x - 7, y: relation.y },
        { x: relation.x + 7, y: relation.y },
      ],
    })),
  );
}

function getCardColor(card: LinkMapCard | undefined, index: number) {
  return card?.color ?? CARD_COLORS[index % CARD_COLORS.length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}
