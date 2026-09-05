import { redirect } from "next/navigation";

import { getFeaturedEdition } from "@/features/editions/edition-content";
import { prisma } from "@/lib/db";
import { requireProvider } from "@/lib/provider-auth";
import { ProviderEditionEditor } from "@/components/provider/provider-edition-editor";
import type { Edition } from "@/types/gameplay";

type PageProps = { searchParams: Promise<{ id?: string }> };

export default async function ProviderEditionsPage({ searchParams }: PageProps) {
  const session = await requireProvider();
  if (!session) redirect("/login");

  const { id } = await searchParams;
  const editions = await prisma.edition.findMany({
    orderBy: [{ releaseAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, status: true, releaseAt: true, publishedAt: true, content: true },
  });
  const template = await getFeaturedEdition();
  const selected = id ? editions.find((edition) => edition.id === id) : null;
  const selectedIsImmutable = selected?.status === "published" || selected?.status === "archived";

  return (
    <main className="min-h-dvh bg-[#f6f2ec] px-6 py-10 text-[#0b0b0f]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6d6963]">Provider studio</p><h1 className="mt-1 text-2xl font-extrabold">Editions</h1></div>
            <a href="/provider/editions" className="rounded-full bg-[#0b0b0f] px-3 py-2 text-xs font-bold text-white">New</a>
          </div>
          <div className="space-y-2">
            {editions.map((edition) => (
              <a key={edition.id} href={edition.status === "published" || edition.status === "archived" ? `/provider/editions?id=${edition.id}` : `/provider/editions?id=${edition.id}`} className={`block rounded-xl border p-3 ${edition.id === id ? "border-[#0b0b0f] bg-[#fffdf7]" : "border-[#d8d0c3] bg-transparent"}`}>
                <div className="flex items-start justify-between gap-2"><span className="truncate text-sm font-extrabold">{edition.slug}</span><Status status={edition.status} /></div>
                <p className="mt-1 text-xs text-[#6d6963]">{edition.releaseAt ? new Date(edition.releaseAt).toLocaleString() : "No release time"}</p>
              </a>
            ))}
            {editions.length === 0 ? <p className="text-sm text-[#6d6963]">No editions yet.</p> : null}
          </div>
        </aside>
        <section>
          {selectedIsImmutable ? <div className="mb-4 rounded-xl border border-[#d8d0c3] bg-[#fffdf7] p-4 text-sm font-bold">Published editions are read-only.</div> : null}
          <ProviderEditionEditor
            template={selected ? selected.content as unknown as Edition : template}
            initialEditionId={selected && !selectedIsImmutable ? selected.id : null}
            initialSlug={selected?.slug}
            initialReleaseAt={selected?.releaseAt?.toISOString()}
            readOnly={selectedIsImmutable}
          />
        </section>
      </div>
    </main>
  );
}

function Status({ status }: { status: string }) {
  return <span className="rounded bg-[#e4ddd2] px-1.5 py-0.5 text-[10px] font-extrabold uppercase">{status}</span>;
}