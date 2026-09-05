import type { Edition, StageType } from "@/types/gameplay";

const stageTypes: StageType[] = [
  "image-select",
  "swipe",
  "fill-blank",
  "timeline-builder",
  "reorder",
  "four-way-swipe",
  "drag-drop",
  "clue-connect",
];

export function validateEdition(value: unknown): string[] {
  if (!isRecord(value)) return ["Edition content is required."];
  const errors: string[] = [];
  requiredString(value, "title", "Title", errors);
  requiredString(value, "description", "Description", errors);
  requiredString(value, "estimatedTime", "Estimated time", errors);
  const nodes = value.nodes;
  if (!Array.isArray(nodes) || nodes.length < 3) {
    errors.push("Add at least three game nodes.");
    return errors;
  }
  if (nodes.length > stageTypes.length) errors.push(`An edition can have at most ${stageTypes.length} game nodes.`);
  const nodeIds = new Set<string>();
  const nodeTypes = new Set<StageType>();
  nodes.forEach((node, index) => {
    const path = `Node ${index + 1}`;
    if (!isRecord(node)) {
      errors.push(`${path} is invalid.`);
      return;
    }
    requiredString(node, "id", `${path} ID`, errors);
    if (typeof node.id === "string" && nodeIds.has(node.id)) errors.push(`${path} ID ${node.id} is duplicated.`);
    if (typeof node.id === "string") nodeIds.add(node.id);
    const type = node.type as StageType;
    if (!stageTypes.includes(type)) errors.push(`${path} has an unsupported game type.`);
    else if (nodeTypes.has(type)) errors.push(`Game type ${type} can only be used by one node.`);
    else nodeTypes.add(type);
    requiredString(node, "mapTitle", `${path} map title`, errors);
    requiredString(node, "mapSubtitle", `${path} map subtitle`, errors);
    if (!Array.isArray(node.subStages) || node.subStages.length === 0) {
      errors.push(`${path} needs at least one game.`);
    } else if (stageTypes.includes(type)) {
      node.subStages.forEach((stage, stageIndex) => validateStage(type, stage, `${path}, game ${stageIndex + 1}`, errors));
    }
  });
  return errors;
    errors.push(`An edition can have at most ${stageTypes.length} game nodes.`);

type Data = Record<string, unknown>;

function isRecord(value: unknown): value is Data {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: Data, key: string, label: string, errors: string[]) {
  if (typeof value[key] !== "string" || value[key].trim() === "") errors.push(`${label} is required.`);
}

function requiredNumber(value: Data, key: string, label: string, errors: string[], positive = false) {
  if (typeof value[key] !== "number" || !Number.isFinite(value[key])) errors.push(`${label} is required.`);
  else if (positive && value[key] <= 0) errors.push(`${label} must be greater than zero.`);
  else if (!positive && value[key] < 0) errors.push(`${label} cannot be negative.`);
}

function requiredArray(value: Data, key: string, label: string, errors: string[]) {
  if (!Array.isArray(value[key])) {
    errors.push(`${label} are required.`);
    return null;
  }
  if (value[key].length === 0) errors.push(`${label} cannot be empty.`);
  return value[key];
}

function requiredChoice(value: Data, key: string, choices: string[], label: string, errors: string[]) {
  if (typeof value[key] !== "string" || !choices.includes(value[key])) errors.push(`${label} must be one of: ${choices.join(", ")}.`);
}

function feedback(value: Data, path: string, errors: string[]) {
  if (!isRecord(value.feedback)) return errors.push(`${path} feedback is required.`);
  requiredString(value.feedback, "correct", `${path} correct feedback`, errors);
  requiredString(value.feedback, "incorrect", `${path} incorrect feedback`, errors);
}

function validateStage(type: StageType, value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) return errors.push(`${path} is invalid.`);
  requiredString(value, "id", `${path} ID`, errors);
  requiredString(value, "question", `${path} question`, errors);
  requiredNumber(value, "attemptsAllowed", `${path} attempts`, errors, true);
  requiredNumber(value, "points", `${path} points`, errors);

  if (type === "image-select") {
    const options = requiredArray(value, "options", `${path} options`, errors);
    if (options && options.length < 2) errors.push(`${path} needs at least two options.`);
    let correct = 0;
    options?.forEach((option, index) => {
      if (!isRecord(option)) return errors.push(`${path}, option ${index + 1} is invalid.`);
      requiredString(option, "id", `${path}, option ${index + 1} ID`, errors);
      requiredString(option, "label", `${path}, option ${index + 1} label`, errors);
      requiredString(option, "image", `${path}, option ${index + 1} image URL`, errors);
      requiredString(option, "feedback", `${path}, option ${index + 1} feedback`, errors);
      if (typeof option.isCorrect !== "boolean") errors.push(`${path}, option ${index + 1} must specify correctness.`);
      if (option.isCorrect === true) correct += 1;
    });
    if (correct !== 1) errors.push(`${path} must have exactly one correct option.`);
  }

  if (type === "swipe") {
    requiredString(value, "statement", `${path} statement`, errors);
    ["left", "right"].forEach((side) => {
      if (!isRecord(value[side])) errors.push(`${path} ${side} side is required.`);
      else requiredString(value[side], "label", `${path} ${side} label`, errors);
    });
    if (!isRecord(value.card)) errors.push(`${path} card is required.`);
    else requiredString(value.card, "title", `${path} card title`, errors);
    requiredChoice(value, "correctDirection", ["left", "right"], `${path} correct direction`, errors);
    feedback(value, path, errors);
  }

  if (type === "fill-blank") {
    requiredString(value, "prompt", `${path} prompt`, errors);
    const blanks = requiredArray(value, "blanks", `${path} blanks`, errors);
    blanks?.forEach((blank, index) => {
      if (!isRecord(blank)) return errors.push(`${path}, blank ${index + 1} is invalid.`);
      requiredString(blank, "id", `${path}, blank ${index + 1} ID`, errors);
      requiredString(blank, "answer", `${path}, blank ${index + 1} answer`, errors);
    });
    const options = requiredArray(value, "options", `${path} word options`, errors);
    options?.forEach((option, index) => {
      if (!isRecord(option)) return errors.push(`${path}, word option ${index + 1} is invalid.`);
      requiredString(option, "id", `${path}, word option ${index + 1} ID`, errors);
      requiredString(option, "word", `${path}, word option ${index + 1}`, errors);
    });
  }

  if (type === "timeline-builder") {
    requiredString(value, "instructions", `${path} instructions`, errors);
    const events = requiredArray(value, "events", `${path} events`, errors);
    if (events && events.length < 2) errors.push(`${path} needs at least two timeline events.`);
    events?.forEach((event, index) => {
      if (!isRecord(event)) return errors.push(`${path}, event ${index + 1} is invalid.`);
      requiredString(event, "id", `${path}, event ${index + 1} ID`, errors);
      requiredString(event, "title", `${path}, event ${index + 1} title`, errors);
      requiredString(event, "year", `${path}, event ${index + 1} year`, errors);
      requiredString(event, "description", `${path}, event ${index + 1} description`, errors);
      requiredNumber(event, "order", `${path}, event ${index + 1} order`, errors, true);
    });
  }

  if (type === "reorder") {
    requiredString(value, "prompt", `${path} prompt`, errors);
    if (value.items !== undefined) {
      const items = requiredArray(value, "items", `${path} items`, errors);
      items?.forEach((item, index) => {
        if (!isRecord(item)) return errors.push(`${path}, item ${index + 1} is invalid.`);
        requiredString(item, "id", `${path}, item ${index + 1} ID`, errors);
        requiredString(item, "label", `${path}, item ${index + 1} label`, errors);
        requiredNumber(item, "order", `${path}, item ${index + 1} order`, errors, true);
      });
    }
  }

  if (type === "four-way-swipe") {
    const answers = value.answers;
    if (!isRecord(answers)) errors.push(`${path} answers are required.`);
    else ["up", "down", "left", "right"].forEach((direction) => {
      const answer = answers[direction];
      if (!isRecord(answer)) errors.push(`${path} ${direction} answer is required.`);
      else requiredString(answer, "label", `${path} ${direction} answer`, errors);
    });
    requiredChoice(value, "correctDirection", ["up", "down", "left", "right"], `${path} correct direction`, errors);
    feedback(value, path, errors);
  }

  if (type === "drag-drop") {
    requiredString(value, "prompt", `${path} prompt`, errors);
    if (!isRecord(value.map)) errors.push(`${path} map is required.`);
    else {
      requiredString(value.map, "title", `${path} map title`, errors);
      const slots = requiredArray(value.map, "slots", `${path} map slots`, errors);
      slots?.forEach((slot, index) => {
        const slotPath = `${path}, slot ${index + 1}`;
        if (!isRecord(slot)) return errors.push(`${slotPath} is invalid.`);
        requiredString(slot, "id", `${slotPath} ID`, errors);
        requiredString(slot, "label", `${slotPath} label`, errors);
        requiredString(slot, "answerCardId", `${slotPath} answer card`, errors);
        requiredNumber(slot, "x", `${slotPath} x position`, errors);
        requiredNumber(slot, "y", `${slotPath} y position`, errors);
      });
      const relations = requiredArray(value.map, "relations", `${path} map relations`, errors);
      relations?.forEach((relation, index) => {
        const relationPath = `${path}, relation ${index + 1}`;
        if (!isRecord(relation)) return errors.push(`${relationPath} is invalid.`);
        requiredString(relation, "id", `${relationPath} ID`, errors);
        requiredString(relation, "label", `${relationPath} label`, errors);
        requiredArray(relation, "slotIds", `${relationPath} slots`, errors);
        requiredNumber(relation, "x", `${relationPath} x position`, errors);
        requiredNumber(relation, "y", `${relationPath} y position`, errors);
      });
    }
    const cards = requiredArray(value, "cards", `${path} cards`, errors);
    cards?.forEach((card, index) => {
      if (!isRecord(card)) return errors.push(`${path}, card ${index + 1} is invalid.`);
      requiredString(card, "id", `${path}, card ${index + 1} ID`, errors);
      requiredString(card, "title", `${path}, card ${index + 1} title`, errors);
    });
    feedback(value, path, errors);
  }

  if (type === "clue-connect") {
    requiredString(value, "prompt", `${path} prompt`, errors);
    const cases = requiredArray(value, "cases", `${path} cases`, errors);
    cases?.forEach((item, index) => {
      const casePath = `${path}, case ${index + 1}`;
      if (!isRecord(item)) return errors.push(`${casePath} is invalid.`);
      ["id", "category", "answer", "fact"].forEach((key) => requiredString(item, key, `${casePath} ${key}`, errors));
      const clueSlots = requiredArray(item, "clueSlots", `${casePath} clue slots`, errors);
      clueSlots?.forEach((slot, slotIndex) => {
        const slotPath = `${casePath}, clue slot ${slotIndex + 1}`;
        if (!isRecord(slot)) return errors.push(`${slotPath} is invalid.`);
        requiredNumber(slot, "x", `${slotPath} x position`, errors);
        requiredNumber(slot, "y", `${slotPath} y position`, errors);
      });
      const clues = requiredArray(item, "clues", `${casePath} clues`, errors);
      let correctClues = 0;
      clues?.forEach((clue, clueIndex) => {
        if (!isRecord(clue)) return errors.push(`${casePath}, clue ${clueIndex + 1} is invalid.`);
        requiredString(clue, "id", `${casePath}, clue ${clueIndex + 1} ID`, errors);
        requiredString(clue, "text", `${casePath}, clue ${clueIndex + 1}`, errors);
        if (typeof clue.isCorrect !== "boolean") errors.push(`${casePath}, clue ${clueIndex + 1} must specify correctness.`);
        if (clue.isCorrect === true) correctClues += 1;
      });
      if (correctClues !== 1) errors.push(`${casePath} must have exactly one correct clue.`);
    });
    feedback(value, path, errors);
  }
    return errors;
  }
}

export function isEdition(value: unknown): value is Edition {
  return validateEdition(value).length === 0;
}