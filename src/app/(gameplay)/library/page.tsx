import Link from "next/link";
import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import { getAllEditions } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import type { Edition } from "@/types/gameplay";

const topicColors = ["#6ccdd2", "#f2b84b", "#df755b", "#b9d969", "#d994d7", "#4aa8ee"];

export default async function LibraryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const editions = getAllEditions();
  const pastThemes = editions.slice().sort(compareByDateDesc);
  const recommended = editions.slice().sort((a, b) => a.order - b.order).slice(0, 6);
  const categories = buildCategories(editions);

  return (
    <MobileContainer>
      <main className="min-h-dvh overflow-hidden bg-[#f6f2ec] pb-36 text-[#0b0b0f]">
        <section className="flex items-center justify-between bg-[#ffb557] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[40px]">auto_awesome</span>
            <p className="text-[15px] font-extrabold">Access all past puzzles</p>
          </div>
          <Link
            href="/pricing"
            className="rounded-full bg-[#0b0b0f] px-5 py-2 text-[14px] font-extrabold text-[#fffdf7] transition active:translate-y-0.5"
          >
            Unlock
          </Link>
        </section>

        <LibrarySection title="Past Themes" href="/map">
          {pastThemes.map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))}
        </LibrarySection>

        <LibrarySection title="Recommended" href="/map">
          {recommended.map((edition) => (
            <EditionCard key={edition.id} edition={edition} compact />
          ))}
        </LibrarySection>

        <section className="px-6 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[26px] font-extrabold leading-none">Topics</h2>
            <span className="material-symbols-outlined text-[30px]">chevron_right</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <Link
                key={category}
                href={`/library?category=${encodeURIComponent(category)}`}
                className="relative flex h-[118px] items-end overflow-hidden rounded-[14px] border border-[#0b0b0f] p-3 transition active:scale-[0.98]"
                style={{ backgroundColor: topicColors[index % topicColors.length] }}
              >
                <TopicPattern icon={topicIcon(category)} />
                <span className="relative text-[18px] font-extrabold">{category}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 pt-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[26px] font-extrabold leading-none">Collection</h2>
              <p className="mt-1 text-[15px] text-[#5e5a55]">Curated by weekly dates</p>
            </div>
            <span className="material-symbols-outlined text-[30px]">chevron_right</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
            {groupByWeek(editions).map(({ week, items }) => (
              <div key={week} className="min-w-[250px] rounded-[14px] border border-[#d8d0c3] bg-[#fffdf7] p-3">
                <p className="text-[12px] font-extrabold uppercase text-[#6d6963]">{week}</p>
                <div className="mt-3 space-y-2">
                  {items.map((edition) => (
                    <Link
                      key={edition.id}
                      href={firstNodeHref(edition)}
                      className="flex items-center gap-3 rounded-[10px] bg-[#f6f2ec] p-2 transition active:scale-[0.98]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f7d91f]">
                        <span className="material-symbols-outlined text-[24px]">{topicIcon(edition.category)}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-extrabold">{edition.title}</span>
                        <span className="block truncate text-[13px] text-[#6d6963]">{edition.nodes.length} games</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}

function LibrarySection({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 pt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[26px] font-extrabold leading-none">{title}</h2>
        <Link href={href} aria-label={title}>
          <span className="material-symbols-outlined text-[30px]">chevron_right</span>
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">{children}</div>
    </section>
  );
}

function EditionCard({ edition, compact = false }: { edition: Edition; compact?: boolean }) {
  return (
    <Link
      href={firstNodeHref(edition)}
      className="flex min-w-[354px] items-center gap-3 rounded-[14px] border border-[#d8d0c3] bg-[#fffdf7] p-3 transition active:scale-[0.98]"
    >
      <span
        aria-hidden="true"
        className={compact ? "h-[118px] w-20 rounded-[8px] bg-cover bg-center" : "h-[118px] w-[82px] rounded-[8px] bg-cover bg-center"}
        style={{ backgroundImage: `url("${edition.coverImage ?? fallbackCover(edition)}")` }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-[4px] bg-[#74d5e1] px-1.5 py-0.5 text-[11px] font-extrabold uppercase">
            {edition.category ?? "Featured"}
          </span>
          <span className="material-symbols-outlined text-[23px]">lock</span>
        </div>
        <h3 className="font-display truncate text-[26px] leading-none">{edition.title}</h3>
        <p className="mt-2 truncate text-[15px] text-[#343238]">{edition.author ?? "Loop Studio"}</p>
        <p className="mt-1 truncate text-[14px] text-[#6d6963]">{edition.weekLabel ?? formatEditionDate(edition.publishedAt)}</p>
      </div>
    </Link>
  );
}

function TopicPattern({ icon }: { icon: string }) {
  return (
    <div className="absolute inset-0 opacity-25">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <span
          key={item}
          className="material-symbols-outlined absolute text-[34px]"
          style={{
            left: `${(item % 3) * 38 + 12}px`,
            top: `${Math.floor(item / 3) * 44 + 6}px`,
            transform: `rotate(${item % 2 === 0 ? -18 : 14}deg)`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
}

function buildCategories(editions: Edition[]) {
  const categories = editions.map((edition) => edition.category ?? "Featured");
  return Array.from(new Set(categories));
}

function groupByWeek(editions: Edition[]) {
  const groups = new Map<string, Edition[]>();

  editions.forEach((edition) => {
    const week = edition.weekLabel ?? formatEditionDate(edition.publishedAt);
    groups.set(week, [...(groups.get(week) ?? []), edition]);
  });

  return Array.from(groups.entries()).map(([week, items]) => ({ week, items }));
}

function compareByDateDesc(a: Edition, b: Edition) {
  return dateValue(b.publishedAt) - dateValue(a.publishedAt);
}

function dateValue(value: string | undefined) {
  return value ? new Date(`${value}T00:00:00`).getTime() : 0;
}

function firstNodeHref(edition: Edition) {
  const nodeId = edition.nodes[0]?.id;
  return nodeId ? `/edition/${edition.id}/${nodeId}` : "/map";
}

function fallbackCover(edition: Edition) {
  const firstStage = edition.nodes.flatMap((node) => node.subStages)[0];
  if (!firstStage) return "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=480&q=80";
  if ("card" in firstStage && firstStage.card.image) return firstStage.card.image;
  if ("options" in firstStage && firstStage.options[0] && "image" in firstStage.options[0]) {
    return firstStage.options[0].image;
  }
  if ("events" in firstStage && firstStage.events[0]?.image) return firstStage.events[0].image;
  return "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=480&q=80";
}

function formatEditionDate(value: string | undefined) {
  if (!value) return "This week";
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function topicIcon(category: string | undefined) {
  const key = (category ?? "").toLowerCase();
  if (key.includes("science")) return "science";
  if (key.includes("food")) return "restaurant";
  if (key.includes("space")) return "planet";
  if (key.includes("movie") || key.includes("tv")) return "movie";
  if (key.includes("geography")) return "public";
  if (key.includes("myth")) return "emoji_objects";
  if (key.includes("animal")) return "pets";
  return "history_edu";
}
