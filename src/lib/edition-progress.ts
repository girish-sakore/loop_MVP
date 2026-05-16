import { prisma } from "@/lib/db";

export type EditionProgressStatus = "not_started" | "in_progress" | "completed";

export type EditionProgress = {
  status: EditionProgressStatus;
  currentStage: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

export async function getUserEditionProgress(
  userId: string,
  editionId: string
): Promise<EditionProgress> {
  const progress = await prisma.userEditionProgress.findUnique({
    where: {
      userId_editionId: { userId, editionId },
    },
  });

  if (!progress) {
    return {
      status: "not_started",
      currentStage: 0,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      startedAt: null,
      completedAt: null,
    };
  }

  return {
    status: progress.status as EditionProgressStatus,
    currentStage: progress.currentStage,
    score: progress.score,
    correctAnswers: progress.correctAnswers,
    totalAnswers: progress.totalAnswers,
    startedAt: progress.startedAt,
    completedAt: progress.completedAt,
  };
}