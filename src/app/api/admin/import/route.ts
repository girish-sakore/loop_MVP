import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/require-creator";
import { importFileSchema, formatImportErrors } from "@/features/games/game-schemas";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_ERRORS_RETURNED = 50;

export async function POST(req: Request) {
  const auth = await requireCreator();
  if (!auth.ok) return auth.response;

  try {
    // 1. Read the uploaded file
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Attach a JSON file in the 'file' field." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is larger than 2 MB." }, { status: 413 });
    }

    // 2. Parse JSON
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      return NextResponse.json({ error: "File is not valid JSON." }, { status: 400 });
    }

    // 3. Validate everything first. One bad card rejects the whole file.
    const parsed = importFileSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = formatImportErrors(parsed.error);
      return NextResponse.json(
        {
          error: "Validation failed. Nothing was imported.",
          totalErrors: errors.length,
          errors: errors.slice(0, MAX_ERRORS_RETURNED),
        },
        { status: 422 },
      );
    }

    // 4. Nested create runs as one transaction: batch + all games, or nothing
    const batch = await prisma.importBatch.create({
      data: {
        fileName: file.name,
        totalCount: parsed.data.length,
        importedBy: auth.email,
        games: {
          create: parsed.data.map((g) => ({
            type: g.type,
            title: g.title,
            subtitle: g.subtitle ?? null,
            isPremium: g.isPremium,
            subStages: g.subStages as Prisma.InputJsonValue,
          })),
        },
      },
      include: { games: { select: { id: true, type: true, title: true } } },
    });

    return NextResponse.json({ ok: true, batchId: batch.id, imported: batch.games.length, games: batch.games }, { status: 201 });
  } catch (error) {
    console.error("[admin/import]", error);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}