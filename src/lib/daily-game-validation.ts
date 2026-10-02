import type { StageType } from "@/types/gameplay";

export const dailyGameTypes: StageType[] = [
  "image-select", "swipe", "fill-blank", "fill-blank-text",
  "timeline-builder", "reorder", "four-way-swipe", "drag-drop",
  "clue-connect", "color-match", "border-hop", "word-root", "image-text-answer",
];

type JsonRecord = Record<string, unknown>;

/**
 * A daily-game payload mirrors the structure of an edition node
 * (see src/content/editions/*.json): `{ type, mapTitle, mapSubtitle,
 * subStages: [] }`. Each subStage carries the shared fields
 * (id, question, attemptsAllowed, points) plus the fields specific to
 * its interaction type.
 */
export function validateDailyGamePayload(type: string, payload: unknown): string[] {
  if (!dailyGameTypes.includes(type as StageType)) return ["Choose a supported interaction type."];
  if (!isRecord(payload)) return ["The JSON payload must be an object."];

  const errors: string[] = [];
  if (payload.type !== type) errors.push(`payload.type must be "${type}".`);
  if (!isString(payload.mapTitle)) errors.push("mapTitle must be a non-empty string.");
  if (!isString(payload.mapSubtitle)) errors.push("mapSubtitle must be a non-empty string.");
  if (!Array.isArray(payload.subStages) || payload.subStages.length === 0) {
    errors.push("subStages must be a non-empty array of stage objects.");
    return errors;
  }

  const seenIds = new Set<string>();
  (payload.subStages as unknown[]).forEach((subStage, index) => {
    const label = `subStages[${index}]`;
    if (!isRecord(subStage)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    const id = subStage.id;
    if (!isString(id)) {
      errors.push(`${label}.id must be a non-empty string.`);
    } else if (seenIds.has(id)) {
      errors.push(`${label}.id "${id}" is duplicated; ids must be unique within the game.`);
    } else {
      seenIds.add(id);
    }
    errors.push(...validateSubStage(type as StageType, subStage, label));
  });

  return errors;
}

/** Validates one subStage against the fields its interaction actually reads. */
export function validateSubStage(type: StageType, subStage: JsonRecord, label: string): string[] {
  const errors: string[] = [];
  if (!isString(subStage.question)) errors.push(`${label}.question must be a non-empty string.`);
  if (!isPositiveNumber(subStage.attemptsAllowed)) errors.push(`${label}.attemptsAllowed must be a positive number.`);
  if (!isPositiveNumber(subStage.points)) errors.push(`${label}.points must be a positive number.`);

  switch (type) {
    case "image-select":
      if (!Array.isArray(subStage.options) || subStage.options.length === 0) {
        errors.push(`${label}.options must be a non-empty array.`);
      } else {
        (subStage.options as unknown[]).forEach((option, i) => {
          if (!isRecord(option) ||
            !isString(option.id) ||
            !isString(option.label) ||
            !isString(option.image) ||
            typeof option.isCorrect !== "boolean" ||
            !isString(option.feedback)) {
            errors.push(`${label}.options[${i}] needs id, label, image, isCorrect and feedback.`);
          }
        });
        if (!(subStage.options as unknown[]).some((option) => isRecord(option) && option.isCorrect === true)) {
          errors.push(`${label}.options must include at least one option with isCorrect: true.`);
        }
      }
      break;
    case "swipe":
      if (!isRecord(subStage.card) || !isString(subStage.card.title)) errors.push(`${label}.card must be an object with a title.`);
      if (!isRecord(subStage.left) || !isString(subStage.left.label)) errors.push(`${label}.left.label must be a non-empty string.`);
      if (!isRecord(subStage.right) || !isString(subStage.right.label)) errors.push(`${label}.right.label must be a non-empty string.`);
      if (!["left", "right"].includes(String(subStage.correctDirection))) errors.push(`${label}.correctDirection must be "left" or "right".`);
      requireFeedback(subStage, errors, label);
      break;
    case "fill-blank":
      requireString(subStage, "prompt", errors);
      requireArray(subStage, "blanks", errors);
      requireArray(subStage, "options", errors);
      break;
    case "fill-blank-text":
      requireString(subStage, "prompt", errors);
      requireArray(subStage, "blanks", errors);
      requireFeedback(subStage, errors, label);
      break;
    case "timeline-builder":
      requireString(subStage, "instructions", errors);
      requireArray(subStage, "events", errors);
      break;
    case "reorder":
      requireString(subStage, "prompt", errors);
      requireArray(subStage, "items", errors);
      break;
    case "four-way-swipe":
      if (!isRecord(subStage.answers)) errors.push(`${label}.answers must be an object with up, down, left and right labels.`);
      if (!["up", "down", "left", "right"].includes(String(subStage.correctDirection))) errors.push(`${label}.correctDirection must be up, down, left or right.`);
      requireFeedback(subStage, errors, label);
      break;
    case "drag-drop":
      requireString(subStage, "prompt", errors);
      if (!isRecord(subStage.map)) {
        errors.push(`${label}.map must be an object.`);
      } else if (!Array.isArray(subStage.map.slots) || subStage.map.slots.length === 0) {
        errors.push(`${label}.map.slots must be a non-empty array.`);
      }
      requireArray(subStage, "cards", errors);
      requireFeedback(subStage, errors, label);
      break;
    case "clue-connect":
      requireString(subStage, "prompt", errors);
      requireArray(subStage, "cases", errors);
      requireFeedback(subStage, errors, label);
      break;
    case "color-match":
      requireString(subStage, "prompt", errors);
      requireArray(subStage, "clues", errors);
      requireFeedback(subStage, errors, label);
      break;
    case "border-hop":
      requireString(subStage, "startCountry", errors);
      requireString(subStage, "targetCountry", errors);
      break;
    case "word-root":
      if (!isRecord(subStage.puzzle)) errors.push(`${label}.puzzle must be an object.`);
      break;
    case "image-text-answer":
      requireString(subStage, "image", errors);
      requireString(subStage, "answer", errors);
      break;
  }

  return errors;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isString(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function isPositiveNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && value > 0; }
function requireString(record: JsonRecord, key: string, errors: string[]) { if (!isString(record[key])) errors.push(`${key} must be a non-empty string.`); }
function requireArray(record: JsonRecord, key: string, errors: string[]) { if (!Array.isArray(record[key]) || record[key].length === 0) errors.push(`${key} must be a non-empty array.`); }
function requireFeedback(record: JsonRecord, errors: string[], label: string) {
  if (!isRecord(record.feedback) || !isString(record.feedback.correct) || !isString(record.feedback.incorrect)) errors.push(`${label}.feedback must include non-empty correct and incorrect strings.`);
}
