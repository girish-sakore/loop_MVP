import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireProvider } from "@/lib/provider-auth";
import { validateEdition } from "@/features/editions/edition-validation";

export async function GET() {
  if (!await requireProvider()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const editions = await prisma.edition.findMany({
    orderBy: [{ releaseAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, status: true, releaseAt: true, publishedAt: true, content: true, updatedAt: true },
  });
  return NextResponse.json(editions);
}

export async function POST(request: Request) {
  const session = await requireProvider();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json() as { slug?: string; content?: unknown; releaseAt?: string };
  const errors = validateEdition(body.content);
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 });
  if (!body.slug?.trim()) return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  const content = { ...(body.content as Record<string, unknown>), id: body.slug.trim() };

  const edition = await prisma.edition.create({
    data: {
      slug: body.slug.trim(),
      content,
      releaseAt: body.releaseAt ? new Date(body.releaseAt) : null,
      createdById: session.user.id,
    },
  });
  return NextResponse.json(edition, { status: 201 });
}