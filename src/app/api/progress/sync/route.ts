import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { editionId, nodeId, currentSubStage, score, correctAnswers, totalAnswers, attemptsRemaining, stagePassed } = await req.json();
    if (typeof editionId !== "string" || !editionId || typeof nodeId !== "string" || !nodeId) {
      return NextResponse.json({ error: "Missing editionId or nodeId." }, { status: 400 });
    }
    if (![currentSubStage, score, correctAnswers, totalAnswers, attemptsRemaining]
      .every((value) => Number.isSafeInteger(value) && value >= 0 && value <= 2147483647) ||
      correctAnswers > totalAnswers || typeof stagePassed !== "boolean") {
      return NextResponse.json({ error: "Invalid progress snapshot." }, { status: 400 });
    }

    const userId = session.user.id;
    const data = { currentSubStage, score, correctAnswers, totalAnswers, attemptsRemaining, stagePassed };
    await prisma.userNodeProgress.upsert({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      create: {
        userId, editionId, nodeId, status: "in_progress", ...data,
        startedAt: new Date(),
      },
      update: {},
    });

    // Atomic monotonic update: a delayed request must not replenish attempts,
    // rewind a stage, or overwrite a completed node.
    await prisma.userNodeProgress.updateMany({
      where: {
        userId, editionId, nodeId,
        status: { not: "completed" },
        totalAnswers: { lte: totalAnswers },
        score: { lte: score },
        correctAnswers: { lte: correctAnswers },
        OR: [
          { currentSubStage: { lt: currentSubStage } },
          {
            currentSubStage,
            AND: [
              { OR: [{ attemptsRemaining: null }, { attemptsRemaining: { gte: attemptsRemaining } }] },
              ...(stagePassed ? [] : [{ stagePassed: false }]),
            ],
          },
        ],
      },
      data: { ...data, status: "in_progress" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[progress/sync]", error);
    return NextResponse.json({ error: "Failed to sync progress." }, { status: 500 });
  }
}
