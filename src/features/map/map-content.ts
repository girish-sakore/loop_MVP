import { getAllEditions } from "@/features/editions/edition-content";
import { getAllUserNodeProgress } from "@/lib/edition-progress";
import { getNodePosition } from "./village-layouts";
import type { VillageMapData, MapNodeStatus } from "./types";

export async function buildVillageMapData(userId: string): Promise<VillageMapData[]> {
  const editions = await getAllEditions();
  const villages: VillageMapData[] = [];
  let previousCompleted = true;

  for (const edition of editions) {
    const nodeProgressMap = await getAllUserNodeProgress(userId, edition.id); // 1 query per edition, not per node

    const completedNodes = edition.nodes.filter((node) => {
      return nodeProgressMap.get(node.id)?.status === "completed";
    }).length;
    const editionCompleted = completedNodes >= edition.nodes.length;
    const villageStatus = !previousCompleted ? "locked" : editionCompleted ? "completed" : "unlocked";

    const nodes = edition.nodes.map((node, index) => {
      let status: MapNodeStatus;
      if (villageStatus === "locked") status = "locked";
      else if (nodeProgressMap.get(node.id)?.status === "completed") status = "completed";
      else status = "current";

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
    previousCompleted = editionCompleted;
  }

  return villages;
}
