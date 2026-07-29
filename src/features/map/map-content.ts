import { getAllEditions } from "@/features/editions/edition-content";
import { getUserEditionProgress } from "@/lib/edition-progress";
import { getNodePosition } from "./village-layouts";
import type { VillageMapData, MapNodeStatus } from "./types";

export async function buildVillageMapData(userId: string): Promise<VillageMapData[]> {
  const editions = getAllEditions();
  const villages: VillageMapData[] = [];

  let previousCompleted = true; // first village is always unlockable

  for (const edition of editions) {
    const progress = await getUserEditionProgress(userId, edition.id);
    const villageStatus = !previousCompleted
      ? "locked"
      : progress.status === "completed"
        ? "completed"
        : "unlocked";

    const nodes = edition.stages.map((stage, index) => {
      let status: MapNodeStatus;
      if (villageStatus === "locked") {
        status = "locked";
      } else if (index < progress.currentStage) {
        status = "completed";
      } else if (index === progress.currentStage) {
        status = "current";
      } else {
        status = "upcoming";
      }
      const { x, y } = getNodePosition(edition.theme, index);
      return {
        stageId: stage.id,
        stageIndex: index,
        status,
        x,
        y,

        title: stage.mapTitle,
        subtitle: stage.mapSubtitle,
      };
    });

    villages.push({
      editionId: edition.id,
      title: edition.title,
      theme: edition.theme,
      order: edition.order,
      status: villageStatus,
      nodes,
    });

    previousCompleted = progress.status === "completed";
  }

  return villages;
}