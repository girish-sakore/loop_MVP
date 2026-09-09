import { getPattern } from "./pattern-registry";
import { generateAutoPaths } from "./auto-path-router";
import type { DragDropStage, LinkMapPath } from "@/types/gameplay";
import type {
  Point,
  ResolvedDragDropStage,
  ResolvedLinkMapRelation,
  ResolvedLinkMapSlot,
} from "./types";

function resolvePoint(
  entity: { id: string; anchor?: string; x?: number; y?: number },
  anchors: Record<string, Point> | undefined,
): Point {
  if (entity.anchor && anchors?.[entity.anchor]) {
    return anchors[entity.anchor];
  }
  if (typeof entity.x === "number" && typeof entity.y === "number") {
    return { x: entity.x, y: entity.y };
  }
  throw new Error(
    `Cannot resolve position for "${entity.id}": no matching anchor` +
    (entity.anchor ? ` ("${entity.anchor}")` : "") +
    " and no explicit x/y.",
  );
}

export function resolveLinkMapStage(
  stage: DragDropStage,
): ResolvedDragDropStage {
  const pattern = getPattern(stage.map.pattern);

  const slots: ResolvedLinkMapSlot[] = stage.map.slots.map((slot) => ({
    ...slot,
    ...resolvePoint(slot, pattern?.slotAnchors),
  }));

  const relations: ResolvedLinkMapRelation[] = stage.map.relations.map(
    (relation) => ({
      ...relation,
      ...resolvePoint(relation, pattern?.relationAnchors),
    }),
  );

  const paths: LinkMapPath[] = stage.map.paths?.length
    ? stage.map.paths // hand-authored paths always take priority
    : generateAutoPaths(slots, relations, stage.map.pathStyle ?? "orthogonal");

  return {
    ...stage,
    map: {
      ...stage.map,
      slots,
      relations,
      paths,
      cardSize: stage.map.cardSize ?? pattern?.cardSize,
      bubbleSize: stage.map.bubbleSize ?? pattern?.bubbleSize,
    },
  };
}