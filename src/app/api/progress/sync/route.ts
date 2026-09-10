import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { editionId, nodeId, currentSubStage, score, correctAnswers, totalAnswers } = await req.json();
    if (!editionId || !nodeId) {
      return NextResponse.json({ error: "Missing editionId or nodeId." }, { status: 400 });
    }

    const userId = session.user.id;
    const existing = await prisma.userNodeProgress.findUnique({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
    });

    if (existing?.status === "completed") {
      return NextResponse.json({ ok: true, locked: true });
    }

    await prisma.userNodeProgress.upsert({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      create: {
        userId, editionId, nodeId, status: "in_progress",
        currentSubStage: currentSubStage ?? 0, score: score ?? 0,
        correctAnswers: correctAnswers ?? 0, totalAnswers: totalAnswers ?? 0,
        startedAt: new Date(),
      },
      update: {
        currentSubStage: currentSubStage ?? 0, score: score ?? 0,
        correctAnswers: correctAnswers ?? 0, totalAnswers: totalAnswers ?? 0,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[progress/sync]", error);
    return NextResponse.json({ error: "Failed to sync progress." }, { status: 500 });
  }
}
