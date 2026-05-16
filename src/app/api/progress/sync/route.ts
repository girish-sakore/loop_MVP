import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { editionId, currentStage, score, correctAnswers, totalAnswers } =
      await req.json();

    if (!editionId || typeof editionId !== "string") {
      return NextResponse.json({ error: "Missing editionId." }, { status: 400 });
    }

    await prisma.userEditionProgress.upsert({
      where: {
        userId_editionId: {
          userId: session.user.id,
          editionId,
        },
      },
      create: {
        userId: session.user.id,
        editionId,
        status: "in_progress",
        currentStage: currentStage ?? 0,
        score: score ?? 0,
        correctAnswers: correctAnswers ?? 0,
        totalAnswers: totalAnswers ?? 0,
        startedAt: new Date(),
      },
      update: {
        currentStage: currentStage ?? 0,
        score: score ?? 0,
        correctAnswers: correctAnswers ?? 0,
        totalAnswers: totalAnswers ?? 0,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[progress/sync]", error);
    return NextResponse.json({ error: "Failed to sync progress." }, { status: 500 });
  }
}