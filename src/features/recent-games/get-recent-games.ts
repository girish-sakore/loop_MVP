import type { RecentGame } from "./types";
import { prisma } from "@/lib/db";
import { getFeaturedEdition, getEditionById } from "@/features/editions/edition-content";

const SHOW_ALL_GAMES_FOR_TESTING = true;

/** The latest completed nodes, enriched from the edition content files for display. */
export async function getRecentGames(userId: string): Promise<RecentGame[]> {
  if (SHOW_ALL_GAMES_FOR_TESTING) {
    const edition = getFeaturedEdition(); // or getEditionById("edition-001")

    return edition.nodes.map((node) => ({
      id: `test-${edition.id}-${node.id}`,
      editionId: edition.id,
      nodeId: node.id,
      editionNo: edition.order,
      gameType: node.type,
      gameLabel: node.mapTitle,
      topic: node.mapSubtitle,
      playedAt: edition.publishedAt ?? "2026-01-01",
      score: 0,
      maxScore: 3,
    }));
  }
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
      score: row.stars,
      maxScore: 3,
    }];
  });
}
