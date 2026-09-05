import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireProvider } from "@/lib/provider-auth";
import { validateEdition } from "@/features/editions/edition-validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (!await requireProvider()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const existing = await prisma.edition.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Edition not found." }, { status: 404 });
  if (existing.status === "published" || existing.status === "archived") {
    return NextResponse.json({ error: "Published editions are immutable." }, { status: 409 });
  }

  const body = await request.json() as { content?: unknown; slug?: string; releaseAt?: string; action?: "save" | "schedule" };
  const content = body.content ?? existing.content;
  const errors = validateEdition(content);
  if (body.action === "schedule" && errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  if (body.action === "schedule" && (!body.releaseAt || new Date(body.releaseAt) <= new Date())) {
    return NextResponse.json({ error: "Choose a future release time." }, { status: 400 });
  }
  if (body.action === "schedule" && body.releaseAt) {
    const releaseDate = new Date(body.releaseAt);
    const dayStart = new Date(Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth(), releaseDate.getUTCDate()));
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const conflict = await prisma.edition.findFirst({
      where: { id: { not: id }, status: { in: ["scheduled", "published"] }, releaseAt: { gte: dayStart, lt: dayEnd } },
      select: { id: true },
    });
    if (conflict) return NextResponse.json({ error: "An edition is already scheduled for that day." }, { status: 409 });
  }

  const nextContent = { ...(content as Record<string, unknown>), id: body.slug?.trim() || (content as { id?: string }).id };

  const edition = await prisma.edition.update({
    where: { id },
    data: {
      content: nextContent,
      slug: body.slug?.trim() || undefined,
      releaseAt: body.releaseAt ? new Date(body.releaseAt) : undefined,
      status: body.action === "schedule" ? "scheduled" : "draft",
    },
  });
  return NextResponse.json({ edition, errors });
}