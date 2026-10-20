import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCreatorPage } from "@/lib/admin-page";
import { dayString, isLive } from "@/lib/date-ist";
import { listGames } from "@/features/games/queries";
import { EditionBuilder } from "@/components/admin/edition-builder";

export default async function EditionBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCreatorPage();
  const { id } = await params;

  const [edition, library] = await Promise.all([
    prisma.edition.findUnique({ where: { id }, omit: { snapshot: true }, include: { games: { orderBy: { position: "asc" } } } }),
    listGames({ unassigned: true }),
  ]);
  if (!edition) notFound();

  const mode = edition.status === "DRAFT" ? "draft" : isLive(edition) ? "live" : "scheduled";
  const cards = edition.games.map((g) => ({
    id: g.id, type: g.type, title: g.title, isPremium: g.isPremium, subStageCount: (g.subStages as unknown[]).length,
  }));
  const meta = {
    title: edition.title, description: edition.description, theme: edition.theme,
    category: edition.category ?? "", author: edition.author ?? "", coverImage: edition.coverImage ?? "",
    estimatedTime: edition.estimatedTime ?? "", date: edition.date ? dayString(edition.date) : "",
  };

  return (
    <>
      <Link href="/admin/editions">← Editions</Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 0" }}>{edition.title}</h1>
      <EditionBuilder
        key={JSON.stringify([cards, meta, edition.status])} // remount with fresh state after every refresh
        editionId={edition.id}
        mode={mode}
        initialMeta={meta}
        initialCards={cards}
        library={library.map((g) => ({ id: g.id, type: g.type, title: g.title, subStageCount: g.subStageCount }))}
      />
    </>
  );
}