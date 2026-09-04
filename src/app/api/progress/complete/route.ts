import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getEditionById } from "@/features/editions/edition-content";

function computeStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { editionId, nodeId, score, correctAnswers, totalAnswers } = await req.json();
    if (!editionId || !nodeId) {
      return NextResponse.json({ error: "Missing editionId or nodeId." }, { status: 400 });
    }

    const edition = getEditionById(editionId);
    if (!edition) return NextResponse.json({ error: "Unknown edition." }, { status: 400 });

    const nodeIndex = edition.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) return NextResponse.json({ error: "Unknown node." }, { status: 400 });

    const userId = session.user.id;
    const stars = computeStars(correctAnswers ?? 0, totalAnswers ?? 0);

    await prisma.userNodeProgress.upsert({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      create: {
        userId, editionId, nodeId, status: "completed",
        score: score ?? 0, correctAnswers: correctAnswers ?? 0, totalAnswers: totalAnswers ?? 0,
        stars, startedAt: new Date(), completedAt: new Date(),
      },
      update: {
        status: "completed", score: score ?? 0, correctAnswers: correctAnswers ?? 0,
        totalAnswers: totalAnswers ?? 0, stars, completedAt: new Date(),
      },
    });

    const editionProgress = await prisma.userEditionProgress.findUnique({
      where: { userId_editionId: { userId, editionId } },
    });
    const nextNodeIndex = Math.max(editionProgress?.currentNodeIndex ?? 0, nodeIndex + 1);
    const editionCompleted = nextNodeIndex >= edition.nodes.length;

    await prisma.userEditionProgress.upsert({
      where: { userId_editionId: { userId, editionId } },
      create: {
        userId, editionId, status: editionCompleted ? "completed" : "in_progress",
        currentNodeIndex: nextNodeIndex,
        score: score ?? 0, correctAnswers: correctAnswers ?? 0, totalAnswers: totalAnswers ?? 0,
        startedAt: new Date(), completedAt: editionCompleted ? new Date() : null,
      },
      update: {
        status: editionCompleted ? "completed" : "in_progress",
        currentNodeIndex: nextNodeIndex,
        score: { increment: score ?? 0 },
        correctAnswers: { increment: correctAnswers ?? 0 },
        totalAnswers: { increment: totalAnswers ?? 0 },
        completedAt: editionCompleted ? new Date() : undefined,
      },
    });

    return NextResponse.json({ ok: true, editionCompleted });
  } catch (error) {
    console.error("[progress/complete]", error);
    return NextResponse.json({ error: "Failed to complete progress." }, { status: 500 });
  }
}