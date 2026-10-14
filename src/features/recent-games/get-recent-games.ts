import type { RecentGame } from "./types";
import { prisma } from "@/lib/db";
import { getEditionById } from "@/features/editions/edition-content";

/** The latest completed nodes, enriched from the edition content files for display. */
export async function getRecentGames(userId: string): Promise<RecentGame[]> {
  const rows = await prisma.userNodeProgress.findMany({
    where: { userId, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 6,
  });

  return rows.flatMap((row) => {
    const edition = getEditionById(row.editionId);
    const node = edition?.nodes.find((item) => item.id === row.nodeId);
    if (!edition || !node || !row.completedAt) return [];

    return [{
      id: row.id,
      editionId: row.editionId,
      nodeId: row.nodeId,
      editionNo: edition.order,
      gameType: node.type,
      gameLabel: node.mapTitle,
      topic: node.mapSubtitle,
      playedAt: row.completedAt.toISOString().slice(0, 10),
      // The card is a three-flame display, so use its persisted 0–3 stars
      // rather than the accumulated gameplay-points total.
      score: row.stars,
      maxScore: 3,
    }];
  });
}
