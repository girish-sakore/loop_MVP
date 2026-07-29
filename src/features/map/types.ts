export type MapNodeStatus = "completed" | "current" | "upcoming" | "locked";
export type VillageStatus = "locked" | "unlocked" | "completed";

export type MapNode = {
  stageId: string;
  stageIndex: number;    // 0-based index into edition.stages
  status: MapNodeStatus;
  x: string;             // percentage, e.g. "42%"
  y: string;
  title: string;
  subtitle: string;
};

export type VillageMapData = {
  editionId: string;
  title: string;
  theme: string;
  order: number;
  status: VillageStatus;
  nodes: MapNode[];
};