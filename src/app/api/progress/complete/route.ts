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

    const edition = await getEditionById(editionId);
    if (!edition) return NextResponse.json({ error: "Unknown edition." }, { status: 400 });

    if (!edition.nodes.some((node) => node.id === nodeId)) {
      return NextResponse.json({ error: "Unknown node." }, { status: 400 });
    }

    const userId = session.user.id;
    const existingNode = await prisma.userNodeProgress.findUnique({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
    });

    if (existingNode?.status === "completed") {
      const completedCount = await prisma.userNodeProgress.count({
        where: { userId, editionId, status: "completed" },
      });

      return NextResponse.json({
        ok: true,
        locked: true,
        editionCompleted: completedCount >= edition.nodes.length,
      });
    }

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

    const completedCount = await prisma.userNodeProgress.count({
      where: { userId, editionId, status: "completed" },
    });
    const editionCompleted = completedCount >= edition.nodes.length;

    await prisma.userEditionProgress.upsert({
      where: { userId_editionId: { userId, editionId } },
      create: {
        userId, editionId, status: editionCompleted ? "completed" : "in_progress",
        currentNodeIndex: 0,
        score: score ?? 0, correctAnswers: correctAnswers ?? 0, totalAnswers: totalAnswers ?? 0,
        startedAt: new Date(), completedAt: editionCompleted ? new Date() : null,
      },
      update: {
        status: editionCompleted ? "completed" : "in_progress",
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
