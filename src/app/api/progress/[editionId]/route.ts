import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ editionId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { editionId } = await params;

    const progress = await prisma.userEditionProgress.findUnique({
      where: {
        userId_editionId: {
          userId: session.user.id,
          editionId,
        },
      },
    });

    // Return null progress as not_started — no record means never started
    if (!progress) {
      return NextResponse.json({
        status: "not_started",
        currentStage: 0,
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        startedAt: null,
        completedAt: null,
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[progress/get]", error);
    return NextResponse.json({ error: "Failed to fetch progress." }, { status: 500 });
  }
}