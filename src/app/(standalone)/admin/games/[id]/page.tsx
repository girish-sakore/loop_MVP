import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCreatorPage } from "@/lib/admin-page";
import { isLive } from "@/lib/date-ist";
import { GameEditor } from "@/components/admin/game-editor";

export default async function GameEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCreatorPage();
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: { edition: { select: { id: true, title: true, status: true, date: true } } },
  });
  if (!game) notFound();

  const ed = game.edition;
  const mode = !ed || ed.status === "DRAFT" ? "editable" : isLive(ed) ? "live" : "locked";

  return (
    <>
      <Link href={ed ? `/admin/editions/${ed.id}` : "/admin"}>← {ed ? ed.title : "Library"}</Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 0" }}>{game.title}</h1>
      <div style={{ opacity: 0.65, fontSize: 13 }}>{game.type} (type can&apos;t be changed)</div>
      <GameEditor
        key={game.updatedAt.toISOString()} // remount with fresh state after each save
        id={game.id}
        mode={mode}
        initial={{ title: game.title, subtitle: game.subtitle ?? "", subStages: game.subStages as unknown[] }}
      />
    </>
  );
}