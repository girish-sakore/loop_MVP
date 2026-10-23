import type { RecentGame } from "./types";
import { prisma } from "@/lib/db";
import { getEditionById, getEditionSummaries } from "@/features/editions/edition-content";
import type { Edition } from "@/types/gameplay";

/** The latest completed nodes, enriched from the edition snapshots for display. */
export async function getRecentGames(userId: string): Promise<RecentGame[]> {
  const rows = await prisma.userNodeProgress.findMany({
    where: { userId, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 6,
  });

  // Fetch each distinct edition once (reads are cached).
  const ids = [...new Set(rows.map((r) => r.editionId))];
  const [summaries, editionPairs] = await Promise.all([
    getEditionSummaries(),
    Promise.all(ids.map(async (id) => [id, await getEditionById(id)] as const)),
  ]);
  const editions = new Map<string, Edition | null>(editionPairs);

  // Same numbering as the library page: oldest = 1, list is newest-first.
  const editionNo = new Map(summaries.map((e, i) => [e.id, summaries.length - i]));

  return rows.flatMap((row) => {
    const edition = editions.get(row.editionId);
    const node = edition?.nodes.find((item) => item.id === row.nodeId);
    if (!edition || !node || !row.completedAt) return []; // also skips orphaned rows like old "edition-001"

    return [{
      id: row.id,
      editionId: row.editionId,
      nodeId: row.nodeId,
      editionNo: editionNo.get(row.editionId) ?? 0,
      gameType: node.type,
      gameLabel: node.mapTitle,
      topic: node.mapSubtitle,
      playedAt: row.completedAt.toISOString().slice(0, 10),
      score: row.stars,
      maxScore: 3,
    }];
  });
}