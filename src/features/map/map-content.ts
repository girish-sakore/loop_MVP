import { getAllEditions } from "@/features/editions/edition-content";
import { getAllUserNodeProgress } from "@/lib/edition-progress";
import { getNodePosition } from "./village-layouts";
import type { VillageMapData, MapNodeStatus } from "./types";

export async function buildVillageMapData(userId: string): Promise<VillageMapData[]> {
  const editions = getAllEditions();
  const villages: VillageMapData[] = [];

  for (const edition of editions) {
    const nodeProgressMap = await getAllUserNodeProgress(userId, edition.id);

    const completedNodes = edition.nodes.filter((node) => {
      return nodeProgressMap.get(node.id)?.status === "completed";
    }).length;
    const editionCompleted = completedNodes >= edition.nodes.length;
    const villageStatus = editionCompleted ? "completed" : "unlocked";

    const nodes = edition.nodes.map((node, index) => {
      const status: MapNodeStatus =
        nodeProgressMap.get(node.id)?.status === "completed" ? "completed" : "current";

      const { x, y } = getNodePosition(edition.theme, index);
      const nodeProgress = nodeProgressMap.get(node.id);
      const totalSubGames = node.subStages.length;
      const completedSubGames =
        nodeProgress?.status === "completed"
          ? totalSubGames
          : Math.min(nodeProgress?.currentSubStage ?? 0, totalSubGames);

      return {
        nodeId: node.id, nodeIndex: index, status, x, y,
        title: node.mapTitle, subtitle: node.mapSubtitle,
        stars: nodeProgress?.stars ?? 0,
        completedSubGames,
        totalSubGames,
      };
    });

    villages.push({ editionId: edition.id, title: edition.title, theme: edition.theme, order: edition.order, status: villageStatus, nodes });
  }

  return villages;
}
