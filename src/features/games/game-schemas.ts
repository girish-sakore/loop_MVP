import { z } from "zod";
import type { BorderHopStage } from "@/types/gameplay";
import { validateRoute } from "@/features/interactions/border-hop/border-hop-rules";

/* ---------- primitives ---------- */

const text = z.string().trim().min(1, "Required");
const optText = z.string().trim().optional();
const imageUrl = z
  .string()
  .trim()
  .refine((v) => v.startsWith("https://") || v.startsWith("/"), "Must be an https:// URL or a /public path");
const feedback = z.object({ correct: text, incorrect: text });
const direction = z.enum(["up", "down", "left", "right"]);

// Fields every substage shares. Unknown keys (old ids, mapTitle...) are stripped by default.
const base = {
  question: text,
  attemptsAllowed: z.number().int().min(1).max(10).default(3),
  points: z.number().int().min(0).default(100),
};

const placeholderIds = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

function bad(ctx: z.RefinementCtx, message: string, path: (string | number)[] = []) {
  ctx.addIssue({ code: "custom", message, path });
}

/* ---------- substage schemas ---------- */

const imageSelect = z.object({
  ...base,
  options: z
    .array(z.object({ id: text, label: text, image: imageUrl, isCorrect: z.boolean(), feedback: text }))
    .min(2)
    .max(4),
}).superRefine((s, ctx) => {
  const correct = s.options.filter((o) => o.isCorrect).length;
  if (correct !== 1) bad(ctx, `Exactly one option must be correct (found ${correct})`, ["options"]);
});

const swipe = z.object({
  ...base,
  statement: z.string().default(""),
  card: z.object({ title: text, subtitle: optText, image: imageUrl.optional() }),
  left: z.object({ label: text, icon: optText }),
  right: z.object({ label: text, icon: optText }),
  correctDirection: z.enum(["left", "right"]),
  feedback,
});

const fillBlank = z.object({
  ...base,
  prompt: text,
  blanks: z.array(z.object({ id: text, answer: text })).min(1),
  options: z.array(z.object({ id: text, word: text })).min(1),
}).superRefine((s, ctx) => {
  const blankIds = s.blanks.map((b) => b.id).sort().join();
  const inPrompt = [...new Set(placeholderIds(s.prompt))].sort().join();
  if (blankIds !== inPrompt) bad(ctx, "Blanks must match the {{placeholders}} in the prompt", ["prompt"]);
  const words = s.options.map((o) => o.word.toLowerCase());
  s.blanks.forEach((b, i) => {
    if (!words.includes(b.answer.toLowerCase())) bad(ctx, `Answer "${b.answer}" is missing from options`, ["blanks", i, "answer"]);
  });
});

const fillBlankText = z.object({
  ...base,
  prompt: text,
  introLabel: optText,
  hintsAllowed: z.number().int().min(0).optional(),
  blanks: z.array(z.object({ id: text, answer: text, hint: optText })).min(1),
  feedback,
}).superRefine((s, ctx) => {
  const blankIds = s.blanks.map((b) => b.id).sort().join();
  const inPrompt = [...new Set(placeholderIds(s.prompt))].sort().join();
  if (blankIds !== inPrompt) bad(ctx, "Blanks must match the {{placeholders}} in the prompt", ["prompt"]);
});

const timelineBuilder = z.object({
  ...base,
  instructions: text,
  estimatedTime: optText,
  events: z
    .array(z.object({ id: text, title: text, year: text, description: text, order: z.number().int(), image: imageUrl.optional() }))
    .min(2),
}).superRefine((s, ctx) => {
  const orders = s.events.map((e) => String(e.order));
  if (dupes(orders).length) bad(ctx, "Event order values must be unique", ["events"]);
});

const reorder = z.object({
  ...base,
  prompt: text,
  items: z.array(z.object({ id: text, label: text, order: z.number().int() })).min(2),
});

const fourWaySwipe = z.object({
  ...base,
  category: optText,
  prompt: optText,
  answers: z.object({
    up: z.object({ label: text, icon: optText }),
    down: z.object({ label: text, icon: optText }),
    left: z.object({ label: text, icon: optText }),
    right: z.object({ label: text, icon: optText }),
  }),
  correctDirection: direction,
  feedback,
});

const dragDrop = z.object({
  ...base,
  prompt: text,
  introLabel: optText,
  hintsAllowed: z.number().int().min(0).optional(),
  learning: z.object({ title: text, message: text, takeaway: text }).optional(),
  map: z.object({
    title: text,
    pattern: optText,
    pathStyle: z.enum(["orthogonal", "direct", "curved"]).optional(),
    cardSize: z.object({ width: z.number(), height: z.number() }).optional(),
    bubbleSize: z.number().optional(),
    slots: z
      .array(z.object({ id: text, label: text, answerCardId: text, x: z.number().optional(), y: z.number().optional(), anchor: optText }))
      .min(1),
    relations: z
      .array(z.object({ id: text, label: text, slotIds: z.array(text).min(1), x: z.number().optional(), y: z.number().optional(), anchor: optText, color: optText }))
      .min(1),
    paths: z.array(z.object({ id: text, points: z.array(z.object({ x: z.number(), y: z.number() })) })).optional(),
  }),
  cards: z.array(z.object({ id: text, title: text, image: imageUrl.optional(), color: optText })).min(1),
  feedback,
}).superRefine((s, ctx) => {
  const cardIds = s.cards.map((c) => c.id);
  const slotIds = s.map.slots.map((x) => x.id);
  if (dupes(cardIds).length) bad(ctx, "Card ids must be unique", ["cards"]);
  if (dupes(slotIds).length) bad(ctx, "Slot ids must be unique", ["map", "slots"]);
  s.map.slots.forEach((slot, i) => {
    if (!cardIds.includes(slot.answerCardId)) bad(ctx, `answerCardId "${slot.answerCardId}" is not in cards`, ["map", "slots", i, "answerCardId"]);
  });
  s.map.relations.forEach((rel, i) => {
    rel.slotIds.forEach((id, j) => {
      if (!slotIds.includes(id)) bad(ctx, `slotId "${id}" does not exist`, ["map", "relations", i, "slotIds", j]);
    });
  });
});

const clueConnect = z.object({
  ...base,
  prompt: text,
  introLabel: optText,
  maxMistakes: z.number().int().min(0).optional(),
  cases: z
    .array(
      z.object({
        id: text,
        category: text,
        answer: text,
        icon: optText,
        fact: text,
        clueSlots: z.array(z.object({ x: z.number(), y: z.number() })).min(1),
        clues: z.array(z.object({ id: text, text, isCorrect: z.boolean() })).min(2),
      }),
    )
    .min(1),
  feedback,
}).superRefine((s, ctx) => {
  s.cases.forEach((c, i) => {
    if (c.clueSlots.length < c.clues.length) bad(ctx, "Needs at least one clueSlot per clue", ["cases", i, "clueSlots"]);
    if (!c.clues.some((x) => x.isCorrect)) bad(ctx, "At least one clue must be correct", ["cases", i, "clues"]);
  });
});

const colorMatch = z.object({
  ...base,
  prompt: text,
  introLabel: optText,
  eyebrow: optText,
  title: optText,
  clues: z
    .array(z.object({ id: text, hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a #RRGGBB hex"), clue1: text, hint: text, name: text }))
    .min(2),
  feedback,
});

const borderHop = z.object({
  ...base,
  startCountry: text,
  targetCountry: text,
  prompt: optText,
  introLabel: optText,
  maxGuesses: z.number().int().min(1).optional(),
  hintsAllowed: z.number().int().min(0).optional(),
  feedback: feedback.optional(),
}).superRefine((s, ctx) => {
  try {
    validateRoute({ ...s, type: "border-hop" } as unknown as BorderHopStage);
  } catch (e) {
    bad(ctx, e instanceof Error ? e.message : "Invalid border-hop route");
  }
});

const wordRoot = z.object({
  ...base,
  puzzle: z
    .object({
      cols: z.number().int().min(1),
      rows: z.number().int().min(1),
      root: z.object({ word: text, x: z.number(), y: z.number() }),
      clues: z
        .array(z.object({ id: text, x: z.number(), y: z.number(), number: z.number().int(), title: text, text, answer: text }))
        .min(1),
    })
    .optional(),
});

const imageTextAnswer = z.object({
  ...base,
  image: imageUrl,
  answer: text,
  hint: optText,
  introLabel: optText,
  hintsAllowed: z.number().int().min(0).optional(),
  feedback: feedback.optional(),
});

/* ---------- card (= Game row) schema ---------- */

function card<T extends string, S extends z.ZodTypeAny>(type: T, stage: S) {
  return z.object({
    type: z.literal(type),
    title: text.max(60),
    subtitle: z.string().trim().max(120).optional(),
    isPremium: z.boolean().default(false),
    subStages: z.array(stage).min(1).max(50),
  });
}

export const gameCardSchema = z.discriminatedUnion("type", [
  card("image-select", imageSelect),
  card("swipe", swipe),
  card("fill-blank", fillBlank),
  card("fill-blank-text", fillBlankText),
  card("timeline-builder", timelineBuilder),
  card("reorder", reorder),
  card("four-way-swipe", fourWaySwipe),
  card("drag-drop", dragDrop),
  card("clue-connect", clueConnect),
  card("color-match", colorMatch),
  card("border-hop", borderHop),
  card("word-root", wordRoot),
  card("image-text-answer", imageTextAnswer),
]);

export const importFileSchema = z.array(gameCardSchema).min(1, "File contains no games").max(100);

export type GameCardInput = z.infer<typeof gameCardSchema>;

/* ---------- error formatting for the import API ---------- */

export function formatImportErrors(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path
      .map((p, i) => (typeof p === "number" ? `[${p}]` : i === 0 ? p : `.${String(p)}`))
      .join("");
    return { path: `games${path.startsWith("[") ? "" : "."}${path}`, message: issue.message };
  });
}