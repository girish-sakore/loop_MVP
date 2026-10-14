import Link from "next/link";
import { requireCreatorPage } from "@/lib/admin-page";
import { listGames } from "@/features/games/queries";
import { UploadForm } from "@/components/admin/upload-form";
import { DeleteGameButton } from "@/components/admin/delete-game-button";
import { s } from "@/components/admin/ui";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ type?: string; unassigned?: string }> }) {
  await requireCreatorPage();
  const sp = await searchParams;
  const unassigned = sp.unassigned === "1";
  const games = await listGames({ type: sp.type, unassigned });

  return (
    <>
      <section className="card paper" style={s.panel}>
        <h2 style={s.h2}>Import games</h2>
        <UploadForm />
        <p style={{ ...s.muted, marginTop: 8 }}>JSON array of cards. Everything is validated first, and one error rejects the whole file.</p>
      </section>

      <section className="card paper" style={s.panel}>
        <div style={{ ...s.row, justifyContent: "space-between" }}>
          <h2 style={{ ...s.h2, margin: 0 }}>Library ({games.length})</h2>
          <div style={s.row}>
            <Link href="/admin" style={{ fontWeight: unassigned ? 400 : 800 }}>All</Link>
            <Link href="/admin?unassigned=1" style={{ fontWeight: unassigned ? 800 : 400 }}>Unassigned</Link>
          </div>
        </div>

        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={s.th}>Title</th><th style={s.th}>Type</th><th style={s.th}>Substages</th><th style={s.th}>Status</th><th style={s.th} /></tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id}>
                  <td style={s.td}><b>{g.title}</b>{g.subtitle && <div style={s.muted}>{g.subtitle}</div>}</td>
                  <td style={s.td}>{g.type}</td>
                  <td style={s.td}>{g.subStageCount}</td>
                  <td style={s.td}>
                    {g.editionId ? <Link href={`/admin/editions/${g.editionId}`}>In edition →</Link> : "Library"}
                    {g.isPremium && " · premium"}
                  </td>
                  <td style={{ ...s.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <Link href={`/admin/games/${g.id}`}>Edit</Link>{" "}
                    {!g.editionId && <DeleteGameButton id={g.id} title={g.title} />}
                  </td>
                  {/* <td style={{ ...s.td, textAlign: "right" }}>{!g.editionId && <DeleteGameButton id={g.id} title={g.title} />}</td> */}
                </tr>
              ))}
              {games.length === 0 && <tr><td style={s.td} colSpan={5}>No games yet. Import a file above.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}