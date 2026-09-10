import type { PatternDefinition } from "./types";

export const PATTERN_REGISTRY: Record<string, PatternDefinition> = {
  /**
   * 2x2 Box / Quad:
   * 4 slots at corners, 4 perimeter relations, plus optional center relation.
   */
  "box-2x2": {
    id: "box-2x2",
    name: "2x2 Box",
    description: "4 corner cards with relations along perimeter edges and center",
    defaultPathStyle: "orthogonal",
    slotAnchors: {
      "top-left": { x: 16, y: 26 },
      tl: { x: 16, y: 26 },
      "top-right": { x: 84, y: 26 },
      tr: { x: 84, y: 26 },
      "bottom-left": { x: 16, y: 72 },
      bl: { x: 16, y: 72 },
      "bottom-right": { x: 84, y: 72 },
      br: { x: 84, y: 72 },
    },
    relationAnchors: {
      top: { x: 50, y: 26 },
      t: { x: 50, y: 26 },
      bottom: { x: 50, y: 72 },
      b: { x: 50, y: 72 },
      left: { x: 16, y: 49 },
      l: { x: 16, y: 49 },
      right: { x: 84, y: 49 },
      r: { x: 84, y: 49 },
      center: { x: 50, y: 49 },
      c: { x: 50, y: 49 },
    },
  },

  /**
   * Diamond:
   * 4 slots in diamond (Top, Bottom, Left, Right) with diagonal relations.
   */
  "diamond-4": {
    id: "diamond-4",
    name: "Diamond (4-Node)",
    description: "4 cards placed in diamond shape with diagonal link bubbles",
    defaultPathStyle: "direct",
    slotAnchors: {
      top: { x: 50, y: 18 },
      t: { x: 50, y: 18 },
      bottom: { x: 50, y: 80 },
      b: { x: 50, y: 80 },
      left: { x: 16, y: 49 },
      l: { x: 16, y: 49 },
      right: { x: 84, y: 49 },
      r: { x: 84, y: 49 },
    },
    relationAnchors: {
      "top-left": { x: 33, y: 33 },
      tl: { x: 33, y: 33 },
      "top-right": { x: 67, y: 33 },
      tr: { x: 67, y: 33 },
      "bottom-left": { x: 33, y: 65 },
      bl: { x: 33, y: 65 },
      "bottom-right": { x: 67, y: 65 },
      br: { x: 67, y: 65 },
      center: { x: 50, y: 49 },
      c: { x: 50, y: 49 },
    },
  },

  /**
   * Triangle (3-Node):
   * 3 slots at vertices with 3 edge relations or 1 center relation.
   */
  "triangle-3": {
    id: "triangle-3",
    name: "Triangle (3-Node)",
    description: "3 cards in a pyramid with edge and center relations",
    defaultPathStyle: "direct",
    slotAnchors: {
      top: { x: 50, y: 20 },
      t: { x: 50, y: 20 },
      "bottom-left": { x: 18, y: 76 },
      bl: { x: 18, y: 76 },
      "bottom-right": { x: 82, y: 76 },
      br: { x: 82, y: 76 },
    },
    relationAnchors: {
      left: { x: 34, y: 48 },
      l: { x: 34, y: 48 },
      right: { x: 66, y: 48 },
      r: { x: 66, y: 48 },
      bottom: { x: 50, y: 76 },
      b: { x: 50, y: 76 },
      center: { x: 50, y: 52 },
      c: { x: 50, y: 52 },
    },
  },

  /**
   * Cross / Star (5-Node):
   * 1 center card surrounded by 4 cardinal cards (Top, Bottom, Left, Right).
   */
  "cross-5": {
    id: "cross-5",
    name: "Cross / Star (5-Node)",
    description: "Center card connected to 4 satellite cards",
    defaultPathStyle: "orthogonal",
    slotAnchors: {
      center: { x: 50, y: 49 },
      c: { x: 50, y: 49 },
      top: { x: 50, y: 18 },
      t: { x: 50, y: 18 },
      bottom: { x: 50, y: 80 },
      b: { x: 50, y: 80 },
      left: { x: 16, y: 49 },
      l: { x: 16, y: 49 },
      right: { x: 84, y: 49 },
      r: { x: 84, y: 49 },
    },
    relationAnchors: {
      "top-mid": { x: 50, y: 33 },
      "bottom-mid": { x: 50, y: 65 },
      "left-mid": { x: 33, y: 49 },
      "right-mid": { x: 67, y: 49 },
      "top-left": { x: 33, y: 33 },
      "top-right": { x: 67, y: 33 },
      "bottom-left": { x: 33, y: 65 },
      "bottom-right": { x: 67, y: 65 },
    },
  },

  /**
   * Bipartite / Two Columns:
   * 2 slots on Left column, 2 slots on Right column, relations in Center column.
   */
  "bipartite-2x2": {
    id: "bipartite-2x2",
    name: "Two Columns (Bipartite)",
    description: "2 columns of cards linked via center relation hubs",
    defaultPathStyle: "direct",
    slotAnchors: {
      "left-top": { x: 18, y: 28 },
      lt: { x: 18, y: 28 },
      "left-bottom": { x: 18, y: 70 },
      lb: { x: 18, y: 70 },
      "right-top": { x: 82, y: 28 },
      rt: { x: 82, y: 28 },
      "right-bottom": { x: 82, y: 70 },
      rb: { x: 82, y: 70 },
    },
    relationAnchors: {
      "center-top": { x: 50, y: 28 },
      ct: { x: 50, y: 28 },
      "center-mid": { x: 50, y: 49 },
      cm: { x: 50, y: 49 },
      "center-bottom": { x: 50, y: 70 },
      cb: { x: 50, y: 70 },
    },
  },

  /**
   * Linear Chain (4-Node Zig-Zag):
   * 4 cards sequenced along a path with linking clues.
   */
  "chain-4": {
    id: "chain-4",
    name: "Chain (4-Node)",
    description: "4 cards linked sequentially in a zig-zag route",
    defaultPathStyle: "orthogonal",
    slotAnchors: {
      "slot-1": { x: 16, y: 26 },
      "slot-2": { x: 84, y: 26 },
      "slot-3": { x: 84, y: 72 },
      "slot-4": { x: 16, y: 72 },
    },
    relationAnchors: {
      "rel-1-2": { x: 50, y: 26 },
      "rel-2-3": { x: 84, y: 49 },
      "rel-3-4": { x: 50, y: 72 },
      center: { x: 50, y: 49 },
    },
  },

  /**
   * Hexagonal Ring (6-Node):
   * 6 cards distributed around a circle with relations on the perimeter.
   */
  "ring-6": {
    id: "ring-6",
    name: "Hexagonal Ring (6-Node)",
    description: "6 cards in a circular loop with edge relations",
    defaultPathStyle: "direct",
    slotAnchors: {
      "top": { x: 50, y: 20 },
      "top-right": { x: 82, y: 35 },
      "bottom-right": { x: 82, y: 65 },
      "bottom": { x: 50, y: 80 },
      "bottom-left": { x: 18, y: 65 },
      "top-left": { x: 18, y: 35 },
    },
    relationAnchors: {
      "top-right": { x: 66, y: 27 },
      "right": { x: 82, y: 50 },
      "bottom-right": { x: 66, y: 73 },
      "bottom-left": { x: 34, y: 73 },
      "left": { x: 18, y: 50 },
      "top-left": { x: 34, y: 27 },
      "center": { x: 50, y: 50 },
    },
  },
  "lattice-3x4": {
    id: "lattice-3x4",
    name: "Lattice (3x4 Grid)",
    description: "Flexible checkerboard grid — any cell can be a card slot or a relation bubble, supports 2-6 slots",
    defaultPathStyle: "orthogonal",
    cardSize: { width: 84, height: 112 },
    bubbleSize: 112,
    slotAnchors: {
      r1c1: { x: 14, y: 6 }, r1c2: { x: 50, y: 6 }, r1c3: { x: 86, y: 6 },
      r2c1: { x: 14, y: 35 }, r2c2: { x: 50, y: 35 }, r2c3: { x: 86, y: 35 },
      r3c1: { x: 14, y: 65 }, r3c2: { x: 50, y: 65 }, r3c3: { x: 86, y: 65 },
      r4c1: { x: 14, y: 94 }, r4c2: { x: 50, y: 94 }, r4c3: { x: 86, y: 94 },
    },
    relationAnchors: {
      r1c1: { x: 14, y: 6 }, r1c2: { x: 50, y: 6 }, r1c3: { x: 86, y: 6 },
      r2c1: { x: 14, y: 35 }, r2c2: { x: 50, y: 35 }, r2c3: { x: 86, y: 35 },
      r3c1: { x: 14, y: 65 }, r3c2: { x: 50, y: 65 }, r3c3: { x: 86, y: 65 },
      r4c1: { x: 14, y: 94 }, r4c2: { x: 50, y: 94 }, r4c3: { x: 86, y: 94 },
    },
  },
};

// Aliases
PATTERN_REGISTRY["quad"] = PATTERN_REGISTRY["box-2x2"];
PATTERN_REGISTRY["square"] = PATTERN_REGISTRY["box-2x2"];
PATTERN_REGISTRY["diamond"] = PATTERN_REGISTRY["diamond-4"];
PATTERN_REGISTRY["triangle"] = PATTERN_REGISTRY["triangle-3"];
PATTERN_REGISTRY["star"] = PATTERN_REGISTRY["cross-5"];
PATTERN_REGISTRY["bipartite"] = PATTERN_REGISTRY["bipartite-2x2"];
PATTERN_REGISTRY["chain"] = PATTERN_REGISTRY["chain-4"];
PATTERN_REGISTRY["ring"] = PATTERN_REGISTRY["ring-6"];

export function getPattern(patternId?: string): PatternDefinition | undefined {
  if (!patternId) return undefined;
  const normalized = patternId.toLowerCase().trim();
  return PATTERN_REGISTRY[normalized];
}

