import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { editionId } = await req.json();
    if (!editionId || typeof editionId !== "string") {
      return NextResponse.json({ error: "Missing editionId." }, { status: 400 });
    }

    const progress = await prisma.userEditionProgress.upsert({
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
        startedAt: new Date(),
      },
      update: {
        // Don't overwrite if already completed
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, progress });
  } catch (error) {
    console.error("[progress/start]", error);
    return NextResponse.json({ error: "Failed to start progress." }, { status: 500 });
  }
}