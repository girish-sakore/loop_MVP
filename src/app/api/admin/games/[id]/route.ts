import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { HttpError, handleError } from "@/lib/http-error";
import { isLive } from "@/lib/date-ist";
import { gameCardSchema, formatImportErrors } from "@/features/games/game-schemas";
import { flattenSubStages, rebuildSnapshot } from "@/features/editions/snapshot";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z
  .object({
    title: z.string(),
    subtitle: z.string().nullable(),
    isPremium: z.boolean(),
    subStages: z.array(z.unknown()),
  })
  .partial();

export async function GET(_req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  const { id } = await params;
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ game });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const body = patchSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) throw new HttpError(400, { error: "Invalid body" });
    const b = body.data;

    const touchedEdition = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { id },
        include: { edition: { select: { status: true, date: true } } },
      });
      if (!game) throw new HttpError(404, { error: "Game not found." });

      const ed = game.edition;
      const live = ed ? isLive(ed) : false;
      if (ed && ed.status !== "DRAFT" && !live) {
        throw new HttpError(409, { error: "Unschedule the edition before editing this card." });
      }

      // Validate the merged result with the same schema the import uses.
      const parsed = gameCardSchema.safeParse({
        type: game.type,
        title: b.title ?? game.title,
        subtitle: b.subtitle === undefined ? game.subtitle ?? undefined : b.subtitle ?? undefined,
        isPremium: b.isPremium ?? game.isPremium,
        subStages: b.subStages ?? game.subStages,
      });
      if (!parsed.success) {
        throw new HttpError(422, { error: "Validation failed.", errors: formatImportErrors(parsed.error).slice(0, 50) });
      }

      // Hotfix rule: progress is stored by substage index, so the count must not change once live.
      if (live && b.subStages) {
        const before = flattenSubStages(game.type, game.subStages as unknown as Record<string, unknown>[]).length;
        const after = flattenSubStages(game.type, parsed.data.subStages as Record<string, unknown>[]).length;
        if (before !== after) {
          throw new HttpError(409, { error: `Edition is live. Substage count must stay ${before} (got ${after}).` });
        }
      }

      await tx.game.update({
        where: { id },
        data: {
          title: parsed.data.title,
          subtitle: parsed.data.subtitle ?? null,
          isPremium: parsed.data.isPremium,
          subStages: parsed.data.subStages as Prisma.InputJsonValue,
        },
      });

      if (ed?.status === "SCHEDULED") {
        await rebuildSnapshot(tx, game.editionId!); // throws 422 and rolls back if the result is invalid
        return true;
      }
      return false;
    });

    if (touchedEdition) revalidateTag("editions", { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/games:patch");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const game = await prisma.game.findUnique({
      where: { id },
      select: { edition: { select: { status: true } } },
    });
    if (!game) throw new HttpError(404, { error: "Game not found." });
    if (game.edition && game.edition.status !== "DRAFT") {
      throw new HttpError(409, { error: "Can't delete a card from a scheduled or live edition." });
    }
    await prisma.game.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/games:delete");
  }
}
