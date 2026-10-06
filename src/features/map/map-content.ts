// One "village" == one day's game. Each box has a single stop (the game);
// progress is tracked as completed rounds inside it.

import { getAllEditions, todayKey } from "@/features/editions/edition-content";
import { getAllGameProgress } from "@/features/gameplay/progress/daily-game-progress";
import type { VillageMapData, MapNode, MapNodeStatus } from "./types";

export async function buildVillageMapData(userId: string): Promise<VillageMapData[]> {
  const editions = await getAllEditions();
  const now = new Date();
  const today = todayKey(now);
  const progress = await getAllGameProgress(userId);
  const progressByGame = new Map(progress.map((p) => [p.game.id, p.progress]));

  const villages: VillageMapData[] = [];

  for (const { game, edition, dateKey } of editions) {
    const total = edition.nodes[0]?.subStages.length ?? 0;
    const p = progressByGame.get(game.id);
    const completed = p?.status === "completed" ? total : Math.min(p?.currentSubStage ?? 0, total);

    let status: MapNodeStatus = "upcoming";
    if (p?.status === "completed") status = "completed";
    else if (dateKey <= today) status = "current";

    const node: MapNode = {
      nodeId: game.id,
      nodeIndex: 0,
      status,
      x: "50%",
      y: "30%",
      title: edition.nodes[0]?.mapTitle ?? game.title,
      subtitle: edition.nodes[0]?.mapSubtitle ?? game.description ?? "",
      stars: p?.stars ?? 0,
      completedSubGames: completed,
      totalSubGames: total,
    };

    villages.push({
      editionId: dateKey,
      title: edition.title,
      theme: edition.theme,
      order: edition.order,
      status: status === "completed" ? "completed" : "unlocked",
      nodes: [node],
    });
  }

  return villages;
}
