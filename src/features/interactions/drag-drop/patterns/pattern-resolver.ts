import type { DragDropStage, LinkMapPath } from "@/types/gameplay";
import { generateAutoPaths } from "./auto-path-router";
import { getPattern } from "./pattern-registry";
import type {
  Point,
  ResolvedDragDropMap,
  ResolvedDragDropStage,
  ResolvedLinkMapRelation,
  ResolvedLinkMapSlot,
} from "./types";

const GRID_BOUNDS = {
  minX: 16,
  maxX: 84,
  minY: 22,
  maxY: 78,
  cols: 5,
  rows: 5,
};

function resolveGridPoint(grid: [number, number]): Point {
  const col = Math.max(0, Math.min(GRID_BOUNDS.cols, grid[0]));
  const row = Math.max(0, Math.min(GRID_BOUNDS.rows, grid[1]));

  const x =
    GRID_BOUNDS.minX +
    (col / GRID_BOUNDS.cols) * (GRID_BOUNDS.maxX - GRID_BOUNDS.minX);
  const y =
    GRID_BOUNDS.minY +
    (row / GRID_BOUNDS.rows) * (GRID_BOUNDS.maxY - GRID_BOUNDS.minY);

  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/**
 * Resolves a DragDropStage by converting pattern anchors, grid coordinates,
 * or manual coordinates into fully defined (x, y) percentages and auto-generating paths if omitted.
 */
export function resolveLinkMapStage(stage: DragDropStage): ResolvedDragDropStage {
  const pattern = getPattern(stage.map.pattern);
  const pathStyle =
    stage.map.pathStyle ?? pattern?.defaultPathStyle ?? "orthogonal";

  // 1. Resolve Slots
  const resolvedSlots: ResolvedLinkMapSlot[] = stage.map.slots.map(
    (slot, index) => {
      // Direct coordinates
      if (typeof slot.x === "number" && typeof slot.y === "number") {
        return { ...slot, x: slot.x, y: slot.y };
      }

      // Grid coordinate
      if (slot.grid && Array.isArray(slot.grid) && slot.grid.length === 2) {
        const pt = resolveGridPoint(slot.grid);
        return { ...slot, x: pt.x, y: pt.y };
      }

      // Pattern anchor
      if (slot.anchor && pattern?.slotAnchors) {
        const anchorKey = slot.anchor.toLowerCase().trim();
        const pt = pattern.slotAnchors[anchorKey];
        if (pt) {
          return { ...slot, x: pt.x, y: pt.y };
        }
      }

      // Fallback: arrange around canvas
      const defaultPositions = [
        { x: 16, y: 26 },
        { x: 84, y: 26 },
        { x: 16, y: 72 },
        { x: 84, y: 72 },
        { x: 50, y: 49 },
      ];
      const fallback = defaultPositions[index % defaultPositions.length];
      return { ...slot, x: fallback.x, y: fallback.y };
    },
  );

  const slotMap = new Map<string, ResolvedLinkMapSlot>(
    resolvedSlots.map((s) => [s.id, s]),
  );

  // 2. Resolve Relations
  const resolvedRelations: ResolvedLinkMapRelation[] = stage.map.relations.map(
    (relation) => {
      // Direct coordinates
      if (typeof relation.x === "number" && typeof relation.y === "number") {
        return { ...relation, x: relation.x, y: relation.y };
      }

      // Grid coordinate
      if (
        relation.grid &&
        Array.isArray(relation.grid) &&
        relation.grid.length === 2
      ) {
        const pt = resolveGridPoint(relation.grid);
        return { ...relation, x: pt.x, y: pt.y };
      }

      // Pattern anchor
      if (relation.anchor && pattern?.relationAnchors) {
        const anchorKey = relation.anchor.toLowerCase().trim();
        const pt = pattern.relationAnchors[anchorKey];
        if (pt) {
          return { ...relation, x: pt.x, y: pt.y };
        }
      }

      // Smart Centroid: If relation connects slots, place at the average position of those slots!
      const connectedSlots = (relation.slotIds ?? [])
        .map((id) => slotMap.get(id))
        .filter((s): s is ResolvedLinkMapSlot => Boolean(s));

      if (connectedSlots.length > 0) {
        const avgX =
          connectedSlots.reduce((sum, s) => sum + s.x, 0) /
          connectedSlots.length;
        const avgY =
          connectedSlots.reduce((sum, s) => sum + s.y, 0) /
          connectedSlots.length;
        return {
          ...relation,
          x: Math.round(avgX * 10) / 10,
          y: Math.round(avgY * 10) / 10,
        };
      }

      // Fallback
      return { ...relation, x: 50, y: 49 };
    },
  );

  // 3. Resolve Paths
  let resolvedPaths: LinkMapPath[];
  if (stage.map.paths && stage.map.paths.length > 0) {
    resolvedPaths = stage.map.paths;
  } else {
    resolvedPaths = generateAutoPaths(resolvedSlots, resolvedRelations, pathStyle);
  }

  const resolvedMap: ResolvedDragDropMap = {
    ...stage.map,
    slots: resolvedSlots,
    relations: resolvedRelations,
    paths: resolvedPaths,
  };

  return {
    ...stage,
    map: resolvedMap,
  };
}

