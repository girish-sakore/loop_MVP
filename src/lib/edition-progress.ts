import { prisma } from "@/lib/db";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type EditionProgress = {
  status: ProgressStatus;
  currentNodeIndex: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

export type NodeProgress = {
  status: ProgressStatus;
  currentSubStage: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  stars: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

export async function getUserEditionProgress(userId: string, editionId: string): Promise<EditionProgress> {
  const progress = await prisma.userEditionProgress.findUnique({
    where: { userId_editionId: { userId, editionId } },
  });
  if (!progress) {
    return { status: "not_started", currentNodeIndex: 0, score: 0, correctAnswers: 0, totalAnswers: 0, startedAt: null, completedAt: null };
  }
  return {
    ...progress,
    status: progress.status as ProgressStatus,
  };
}

// Batch fetch — map-content.ts needs progress for every node in one query, not N queries
export async function getAllUserNodeProgress(userId: string, editionId: string): Promise<Map<string, NodeProgress>> {
  const rows = await prisma.userNodeProgress.findMany({ where: { userId, editionId } });
  return new Map(
    rows.map((r) => [
      r.nodeId,
      {
        ...r,
        status: r.status as ProgressStatus,
      },
    ]),
  );
}

export async function getUserNodeProgress(userId: string, editionId: string, nodeId: string): Promise<NodeProgress> {
  const progress = await prisma.userNodeProgress.findUnique({
    where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
  });
  if (!progress) {
    return { status: "not_started", currentSubStage: 0, score: 0, correctAnswers: 0, totalAnswers: 0, stars: 0, startedAt: null, completedAt: null };
  }
  return {
    ...progress,
    status: progress.status as ProgressStatus,
  };
}
