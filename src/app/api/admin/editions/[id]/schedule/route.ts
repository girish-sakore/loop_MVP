import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { HttpError, handleError } from "@/lib/http-error";
import { todayIST } from "@/lib/date-ist";
import { rebuildSnapshot } from "@/features/editions/snapshot";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx) => {
      const e = await tx.edition.findUnique({
        where: { id },
        select: { status: true, date: true, _count: { select: { games: true } } },
      });
      if (!e) throw new HttpError(404, { error: "Edition not found." });
      if (e.status !== "DRAFT") throw new HttpError(409, { error: "Edition is not a draft." });
      if (!e.date) throw new HttpError(422, { error: "Set a date before scheduling." });
      if (e.date < todayIST()) throw new HttpError(422, { error: "Date is in the past." });
      if (e._count.games === 0) throw new HttpError(422, { error: "Add at least one card." });

      await rebuildSnapshot(tx, id); // throws SnapshotError (422) listing every problem
      await tx.edition.update({ where: { id }, data: { status: "SCHEDULED" } });
    });
    revalidateTag("editions", { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/editions:schedule");
  }
}

/** Unschedule: only while the date is still in the future. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const e = await prisma.edition.findUnique({ where: { id }, select: { status: true, date: true } });
    if (!e) throw new HttpError(404, { error: "Edition not found." });
    if (e.status !== "SCHEDULED") throw new HttpError(409, { error: "Edition is not scheduled." });
    if (!e.date || e.date <= todayIST()) throw new HttpError(409, { error: "Edition is already live and can't be unscheduled." });

    await prisma.edition.update({ where: { id }, data: { status: "DRAFT", snapshot: Prisma.DbNull } });
    revalidateTag("editions");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/editions:unschedule");
  }
}