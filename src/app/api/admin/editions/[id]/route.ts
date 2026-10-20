import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { HttpError, handleError } from "@/lib/http-error";
import { parseDay } from "@/lib/date-ist";
import { editionFields } from "../route";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  const { id } = await params;
  const edition = await prisma.edition.findUnique({
    where: { id },
    omit: { snapshot: true },
    include: { games: { orderBy: { position: "asc" } } }, // includes subStages for preview
  });
  if (!edition) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ edition });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const body = editionFields.partial().safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid body", issues: body.error.issues }, { status: 400 });

    const existing = await prisma.edition.findUnique({ where: { id }, select: { status: true } });
    if (!existing) throw new HttpError(404, { error: "Not found" });
    if (existing.status !== "DRAFT") throw new HttpError(409, { error: "Unschedule the edition before editing it." });

    const { date, ...rest } = body.data;
    const edition = await prisma.edition.update({
      where: { id },
      data: { ...rest, ...(date !== undefined && { date: date ? parseDay(date) : null }) },
      omit: { snapshot: true },
    });
    return NextResponse.json({ ok: true, edition });
  } catch (e) {
    return handleError(e, "admin/editions:patch");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const { id } = await params;
    const existing = await prisma.edition.findUnique({ where: { id }, select: { status: true } });
    if (!existing) throw new HttpError(404, { error: "Not found" });
    if (existing.status !== "DRAFT") throw new HttpError(409, { error: "Only draft editions can be deleted." });
    await prisma.edition.delete({ where: { id } }); // games return to the library (SetNull)
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e, "admin/editions:delete");
  }
}