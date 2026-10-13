import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCreatorPage } from "@/lib/admin-page";
import { dayString, isLive } from "@/lib/date-ist";
import { CreateEditionForm } from "@/components/admin/create-edition-form";
import { s } from "@/components/admin/ui";

export default async function EditionsPage() {
  await requireCreatorPage();
  const editions = await prisma.edition.findMany({
    select: { id: true, title: true, status: true, date: true, _count: { select: { games: true } } },
    orderBy: [{ date: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <>
      <section className="card paper" style={s.panel}>
        <h2 style={s.h2}>New edition</h2>
        <CreateEditionForm />
      </section>

      <section className="card paper" style={s.panel}>
        <h2 style={s.h2}>Editions</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={s.th}>Title</th><th style={s.th}>Date</th><th style={s.th}>Status</th><th style={s.th}>Cards</th></tr></thead>
          <tbody>
            {editions.map((e) => (
              <tr key={e.id}>
                <td style={s.td}><Link href={`/admin/editions/${e.id}`}><b>{e.title}</b></Link></td>
                <td style={s.td}>{e.date ? dayString(e.date) : "—"}</td>
                <td style={s.td}>{e.status === "DRAFT" ? "Draft" : isLive(e) ? "Live" : "Scheduled"}</td>
                <td style={s.td}>{e._count.games}</td>
              </tr>
            ))}
            {editions.length === 0 && <tr><td style={s.td} colSpan={4}>No editions yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  );
}