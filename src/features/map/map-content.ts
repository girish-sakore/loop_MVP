import { getAllEditions } from "@/features/editions/edition-content";
import { getUserEditionProgress, getAllUserNodeProgress } from "@/lib/edition-progress";
import { getNodePosition } from "./village-layouts";
import type { VillageMapData, MapNodeStatus } from "./types";

export async function buildVillageMapData(userId: string): Promise<VillageMapData[]> {
  const editions = getAllEditions();
  const villages: VillageMapData[] = [];
  let previousCompleted = true;

  for (const edition of editions) {
    const editionProgress = await getUserEditionProgress(userId, edition.id);
    const nodeProgressMap = await getAllUserNodeProgress(userId, edition.id); // 1 query per edition, not per node

    const villageStatus = !previousCompleted ? "locked" : editionProgress.status === "completed" ? "completed" : "unlocked";

    const nodes = edition.nodes.map((node, index) => {
      let status: MapNodeStatus;
      if (villageStatus === "locked") status = "locked";
      else if (index < editionProgress.currentNodeIndex) status = "completed";
      else if (index === editionProgress.currentNodeIndex) status = "current";
      else status = "upcoming";

      const { x, y } = getNodePosition(edition.theme, index);
      const nodeProgress = nodeProgressMap.get(node.id);

      return {
        nodeId: node.id, nodeIndex: index, status, x, y,
        title: node.mapTitle, subtitle: node.mapSubtitle,
        stars: nodeProgress?.stars ?? 0,
      };
    });

    villages.push({ editionId: edition.id, title: edition.title, theme: edition.theme, order: edition.order, status: villageStatus, nodes });
    previousCompleted = editionProgress.status === "completed";
  }

  return villages;
}