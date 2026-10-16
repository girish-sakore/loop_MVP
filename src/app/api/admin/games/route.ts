import { NextResponse } from "next/server";
import { requireCreator } from "@/lib/require-creator";
import { listGames } from "@/features/games/queries";

export async function GET(req: Request) {
  const a = await requireCreator();
  if (!a.ok) return a.response;

  const url = new URL(req.url);
  const games = await listGames({ type: url.searchParams.get("type"), unassigned: url.searchParams.get("unassigned") === "1" });
  return NextResponse.json({ games });
}