import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { editionId, score, correctAnswers, totalAnswers } = await req.json();

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
        status: "completed",
        score: score ?? 0,
        correctAnswers: correctAnswers ?? 0,
        totalAnswers: totalAnswers ?? 0,
        completedAt: new Date(),
        startedAt: new Date(),
      },
      update: {
        status: "completed",
        score: score ?? 0,
        correctAnswers: correctAnswers ?? 0,
        totalAnswers: totalAnswers ?? 0,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[progress/complete]", error);
    return NextResponse.json({ error: "Failed to complete progress." }, { status: 500 });
  }
}