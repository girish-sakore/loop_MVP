import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { HttpError, handleError } from "@/lib/http-error";
import { isLive } from "@/lib/date-ist";
import { rebuildSnapshot } from "@/features/editions/snapshot";

const bodySchema = z.object({
  cards: z.array(z.object({ gameId: z.string(), isPremium: z.boolean().optional() })).min(1),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new HttpError(400, { error: "Invalid body" });
    const { cards } = body.data;

    await prisma.$transaction(async (tx) => {
      const edition = await tx.edition.findUnique({
        where: { id },
        select: { status: true, date: true, games: { select: { id: true }, orderBy: { position: "asc" } } },
      });
      if (!edition) throw new HttpError(404, { error: "Edition not found." });

      const live = isLive(edition);
      if (edition.status !== "DRAFT" && !live) {
        throw new HttpError(409, { error: "Unschedule the edition before changing it." });
      }

      const current = edition.games.map((g) => g.id);
      const next = cards.map((c) => c.gameId);
      const sameSet = current.length === next.length && current.every((x) => next.includes(x));
      if (!sameSet) throw new HttpError(400, { error: "cards must list every game in the edition exactly once." });
      if (live && current.join() !== next.join()) {
        throw new HttpError(409, { error: "Order is locked once the edition is live. Only isPremium can change." });
      }

      for (const [position, c] of cards.entries()) {
        await tx.game.update({
          where: { id: c.gameId },
          data: { position, ...(c.isPremium !== undefined && { isPremium: c.isPremium }) },
        });
      }
      if (edition.status === "SCHEDULED") await rebuildSnapshot(tx, id);
    });

    revalidateTag("editions", { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/editions:order");
  }
}