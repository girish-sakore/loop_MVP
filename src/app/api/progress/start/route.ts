import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { editionId, nodeId } = await req.json();
    if (!editionId || !nodeId) {
      return NextResponse.json({ error: "Missing editionId or nodeId." }, { status: 400 });
    }

    const userId = session.user.id;

    await prisma.userEditionProgress.upsert({
      where: { userId_editionId: { userId, editionId } },
      create: { userId, editionId, status: "in_progress", startedAt: new Date() },
      update: {}, // don't disturb an existing row's status/currentNodeIndex
    });

    const nodeProgress = await prisma.userNodeProgress.upsert({
      where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      create: { userId, editionId, nodeId, status: "in_progress", startedAt: new Date() },
      update: {},
    });

    return NextResponse.json({ ok: true, progress: nodeProgress });
  } catch (error) {
    console.error("[progress/start]", error);
    return NextResponse.json({ error: "Failed to start progress." }, { status: 500 });
  }
}
