import type {
  DragDropStage,
  LinkMapPath,
  LinkMapRelation,
  LinkMapSlot,
} from "@/types/gameplay";

export type Point = {
  x: number;
  y: number;
};

export type PatternDefinition = {
  id: string;
  name: string;
  description: string;
  slotAnchors: Record<string, Point>;
  relationAnchors: Record<string, Point>;
  defaultPathStyle?: "orthogonal" | "direct" | "curved";
  cardSize?: { width: number; height: number }; // px, overrides default 72x96
  bubbleSize?: number; // px diameter, overrides default 78
};

export type ResolvedLinkMapSlot = LinkMapSlot & {
  x: number;
  y: number;
};

export type ResolvedLinkMapRelation = LinkMapRelation & {
  x: number;
  y: number;
};

export type ResolvedDragDropMap = Omit<
  DragDropStage["map"],
  "slots" | "relations" | "paths"
> & {
  slots: ResolvedLinkMapSlot[];
  relations: ResolvedLinkMapRelation[];
  paths: LinkMapPath[];
};

export type ResolvedDragDropStage = Omit<DragDropStage, "map"> & {
  map: ResolvedDragDropMap;
};

