import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";

export async function GET(req: Request) {
  const a = await requireCreator();
  if (!a.ok) return a.response;

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const unassigned = url.searchParams.get("unassigned") === "1";

  const games = await prisma.game.findMany({
    where: { ...(type && { type }), ...(unassigned && { editionId: null }) },
    select: { id: true, type: true, title: true, subtitle: true, isPremium: true, editionId: true, importBatchId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ games });
}