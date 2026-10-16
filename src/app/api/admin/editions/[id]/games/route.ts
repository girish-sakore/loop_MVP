import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { HttpError, handleError } from "@/lib/http-error";

type Ctx = { params: Promise<{ id: string }> };

async function requireDraft(tx: Pick<typeof prisma, "edition">, id: string) {
  const e = await tx.edition.findUnique({ where: { id }, select: { status: true } });
  if (!e) throw new HttpError(404, { error: "Edition not found." });
  if (e.status !== "DRAFT") throw new HttpError(409, { error: "Edition is not a draft." });
}

export async function POST(req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const body = z.object({ gameId: z.string(), merge: z.boolean().default(false) }).safeParse(await req.json().catch(() => null));
    if (!body.success) throw new HttpError(400, { error: "Invalid body" });
    const { gameId, merge } = body.data;

    const result = await prisma.$transaction(async (tx) => {
      await requireDraft(tx, id);

      const game = await tx.game.findUnique({ where: { id: gameId } });
      if (!game) throw new HttpError(404, { error: "Game not found." });
      if (game.editionId) throw new HttpError(409, { error: "Game is already assigned to an edition." });

      const existing = await tx.game.findFirst({ where: { editionId: id, type: game.type } });

      if (existing && !merge) {
        throw new HttpError(409, {
          code: "TYPE_CONFLICT",
          error: `This edition already has a "${game.type}" card.`,
          existingGameId: existing.id,
          existingTitle: existing.title,
        });
      }

      if (existing) {
        await tx.game.update({
          where: { id: existing.id },
          data: { subStages: [...(existing.subStages as unknown[]), ...(game.subStages as unknown[])] as any },
        });
        await tx.game.delete({ where: { id: game.id } });
        return { merged: true, gameId: existing.id };
      }

      const last = await tx.game.aggregate({ where: { editionId: id }, _max: { position: true } });
      await tx.game.update({
        where: { id: game.id },
        data: { editionId: id, position: (last._max.position ?? -1) + 1 },
      });
      return { merged: false, gameId: game.id };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return handleError(e, "admin/editions:assign");
  }
}

/** Remove a card from the edition (back to the library). DELETE ?gameId=... */
export async function DELETE(req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const gameId = new URL(req.url).searchParams.get("gameId");
    if (!gameId) throw new HttpError(400, { error: "gameId is required." });

    await prisma.$transaction(async (tx) => {
      await requireDraft(tx, id);
      const { count } = await tx.game.updateMany({
        where: { id: gameId, editionId: id },
        data: { editionId: null, position: null },
      });
      if (!count) throw new HttpError(404, { error: "Game is not in this edition." });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/editions:unassign");
  }
}