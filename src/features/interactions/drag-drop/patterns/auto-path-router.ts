import type { LinkMapPath } from "@/types/gameplay";
import type { Point, ResolvedLinkMapRelation, ResolvedLinkMapSlot } from "./types";

const TOLERANCE = 4; // Tolerance in percentage points to consider coordinates collinear

function isNear(a: number, b: number, tol = TOLERANCE): boolean {
  return Math.abs(a - b) <= tol;
}

/**
 * Automatically routes SVG paths between relations and their connected slots.
 * This completely eliminates the need for manual SVG polyline coordinate crafting.
 */
export function generateAutoPaths(
  slots: ResolvedLinkMapSlot[],
  relations: ResolvedLinkMapRelation[],
  style: "orthogonal" | "direct" | "curved" = "orthogonal",
): LinkMapPath[] {
  const slotMap = new Map<string, ResolvedLinkMapSlot>(
    slots.map((s) => [s.id, s]),
  );

  const paths: LinkMapPath[] = [];
  let pathIdCounter = 1;

  for (const relation of relations) {
    const connectedSlots = (relation.slotIds ?? [])
      .map((id) => slotMap.get(id))
      .filter((s): s is ResolvedLinkMapSlot => Boolean(s));

    if (connectedSlots.length === 0) continue;

    // Check if connected slots and relation are collinear horizontally or vertically
    const allHorizontal = connectedSlots.every((s) =>
      isNear(s.y, relation.y),
    );
    const allVertical = connectedSlots.every((s) =>
      isNear(s.x, relation.x),
    );

    if (style === "orthogonal" && (allHorizontal || allVertical)) {
      // Single collinear line through relation and all connected slots
      const points: Point[] = [
        ...connectedSlots.map((s) => ({ x: s.x, y: s.y })),
        { x: relation.x, y: relation.y },
      ];

      // Sort points along the axis to ensure smooth line without backtracking
      if (allHorizontal) {
        points.sort((a, b) => a.x - b.x);
        // Align y coordinate to average for perfect horizontal alignment
        const avgY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
        points.forEach((p) => (p.y = Math.round(avgY * 10) / 10));
      } else {
        points.sort((a, b) => a.y - b.y);
        // Align x coordinate to average for perfect vertical alignment
        const avgX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
        points.forEach((p) => (p.x = Math.round(avgX * 10) / 10));
      }

      // Deduplicate consecutive identical points
      const deduped: Point[] = [];
      for (const p of points) {
        if (
          deduped.length === 0 ||
          !isNear(deduped[deduped.length - 1].x, p.x, 1) ||
          !isNear(deduped[deduped.length - 1].y, p.y, 1)
        ) {
          deduped.push(p);
        }
      }

      if (deduped.length >= 2) {
        paths.push({
          id: `auto-path-${relation.id}-${pathIdCounter++}`,
          points: deduped,
        });
        continue;
      }
    }

    // Otherwise, route each connected slot to the relation bubble
    for (const slot of connectedSlots) {
      if (style === "direct") {
        paths.push({
          id: `auto-path-${relation.id}-${slot.id}-${pathIdCounter++}`,
          points: [
            { x: slot.x, y: slot.y },
            { x: relation.x, y: relation.y },
          ],
        });
      } else {
        // Orthogonal routing: if directly aligned, draw straight line
        if (isNear(slot.x, relation.x) || isNear(slot.y, relation.y)) {
          paths.push({
            id: `auto-path-${relation.id}-${slot.id}-${pathIdCounter++}`,
            points: [
              { x: slot.x, y: slot.y },
              { x: relation.x, y: relation.y },
            ],
          });
        } else {
          // L-shaped bend
          // Bend horizontally first if relation is closer vertically, or vertically first if closer horizontally
          const dx = Math.abs(slot.x - relation.x);
          const dy = Math.abs(slot.y - relation.y);

          const midPoint: Point =
            dx > dy
              ? { x: relation.x, y: slot.y }
              : { x: slot.x, y: relation.y };

          paths.push({
            id: `auto-path-${relation.id}-${slot.id}-${pathIdCounter++}`,
            points: [
              { x: slot.x, y: slot.y },
              midPoint,
              { x: relation.x, y: relation.y },
            ],
          });
        }
      }
    }
  }

  return paths;
}

