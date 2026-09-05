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
  if (!value || typeof value !== "object") return ["Edition content is required."];

  const edition = value as Partial<Edition>;
  const errors: string[] = [];
  if (!edition.title?.trim()) errors.push("Title is required.");
  if (!edition.description?.trim()) errors.push("Description is required.");
  if (!edition.estimatedTime?.trim()) errors.push("Estimated time is required.");
  if (!Array.isArray(edition.nodes) || edition.nodes.length === 0) {
    errors.push("Add at least one game node.");
    return errors;
  }

  const nodeIds = new Set<string>();
  for (const [index, node] of edition.nodes.entries()) {
    if (!node.id?.trim()) errors.push(`Node ${index + 1} needs an ID.`);
    if (node.id && nodeIds.has(node.id)) errors.push(`Node ID ${node.id} is duplicated.`);
    if (node.id) nodeIds.add(node.id);
    if (!stageTypes.includes(node.type as StageType)) {
      errors.push(`Node ${index + 1} has an unsupported game type.`);
    }
    if (!node.mapTitle?.trim()) errors.push(`Node ${index + 1} needs a map title.`);
    if (!node.mapSubtitle?.trim()) errors.push(`Node ${index + 1} needs a map subtitle.`);
    if (!Array.isArray(node.subStages) || node.subStages.length === 0) {
      errors.push(`Node ${index + 1} needs at least one game.`);
    }
  }

  return errors;
}

export function isEdition(value: unknown): value is Edition {
  return validateEdition(value).length === 0;
}