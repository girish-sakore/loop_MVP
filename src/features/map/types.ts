export type MapNodeStatus = "completed" | "current" | "upcoming" | "locked";
export type VillageStatus = "locked" | "unlocked" | "completed";

export type MapNode = {
  nodeId: string;
  nodeIndex: number;
  status: MapNodeStatus;
  x: string;             // percentage, e.g. "42%"
  y: string;
  title: string;
  subtitle: string;
  stars: number; // 0-3, from UserNodeProgress
};

export type VillageMapData = {
  editionId: string;
  title: string;
  theme: string;
  order: number;
  status: VillageStatus;
  nodes: MapNode[];
};