import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { handleError } from "@/lib/http-error";
import { parseDay } from "@/lib/date-ist";

export const editionFields = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(300),
  theme: z.string().trim().min(1).max(40),
  category: z.string().trim().max(40).nullable().optional(),
  author: z.string().trim().max(60).nullable().optional(),
  coverImage: z.string().trim().refine((v) => v.startsWith("https://") || v.startsWith("/")).nullable().optional(),
  estimatedTime: z.string().trim().max(20).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => !isNaN(parseDay(v).getTime()), "Invalid date").nullable().optional(),
});

export async function GET() {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  const editions = await prisma.edition.findMany({
    select: { id: true, title: true, theme: true, status: true, date: true, _count: { select: { games: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  return NextResponse.json({ editions });
}

export async function POST(req: Request) {
  const a = await requireCreator();
  if (!a.ok) return a.response;
  try {
    const body = editionFields.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid body", issues: body.error.issues }, { status: 400 });
    const { date, ...rest } = body.data;
    const edition = await prisma.edition.create({ data: { ...rest, date: date ? parseDay(date) : null } });
    return NextResponse.json({ ok: true, edition }, { status: 201 });
  } catch (e) {
    return handleError(e, "admin/editions:create");
  }
}