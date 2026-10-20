import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type LibraryRow = {
  id: string; type: string; title: string; subtitle: string | null; isPremium: boolean;
  editionId: string | null; importBatchId: string | null; createdAt: Date; subStageCount: number;
};

export async function listGames({ type, unassigned }: { type?: string | null; unassigned?: boolean }) {
  const filters = [
    ...(type ? [Prisma.sql`"type" = ${type}`] : []),
    ...(unassigned ? [Prisma.sql`"editionId" IS NULL`] : []),
  ];
  const where = filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}` : Prisma.empty;
  return prisma.$queryRaw<LibraryRow[]>`
    SELECT "id", "type", "title", "subtitle", "isPremium", "editionId", "importBatchId", "createdAt",
           jsonb_array_length("subStages")::int AS "subStageCount"
    FROM "game" ${where}
    ORDER BY "createdAt" DESC LIMIT 200`;
}