import Link from "next/link";
import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import { getDailyEdition } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getAllUserNodeProgress, getUserNodeProgress } from "@/lib/edition-progress";
import { validateDailyGamePayload } from "@/lib/daily-game-validation";

export default async function MapPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const dateKey = new Date().toISOString().slice(0, 10);
  const storedGame = await prisma.dailyGame.findUnique({
    where: { scheduledFor: new Date(`${dateKey}T00:00:00.000Z`) },
  });
  const hasStoredGame = Boolean(
    storedGame && validateDailyGamePayload(storedGame.type, storedGame.payload).length === 0,
  );
  const edition = getDailyEdition();
  const nodeProgress = await getAllUserNodeProgress(session.user.id, edition.id);
  const completedNodes = edition.nodes.filter(
    (node) => nodeProgress.get(node.id)?.status === "completed",
  ).length;
  const nextNode = edition.nodes.find(
    (node) => nodeProgress.get(node.id)?.status !== "completed",
  );
  const totalRounds = edition.nodes.reduce((total, node) => total + node.subStages.length, 0);
  const isEditionComplete = completedNodes === edition.nodes.length;

  const storedPayload = storedGame?.payload as Record<string, unknown> | undefined;
  const dailySubStages = Array.isArray(storedPayload?.subStages) ? (storedPayload?.subStages as unknown[]) : [];
  const dailyTotalRounds = hasStoredGame ? dailySubStages.length : totalRounds;
  const dailyProgress = storedGame && hasStoredGame
    ? await getUserNodeProgress(session.user.id, storedGame.id, storedGame.id)
    : null;
  const isComplete = hasStoredGame
    ? dailyProgress?.status === "completed"
    : isEditionComplete;

  const matchNumber = String(edition.order).padStart(3, "0");
  const name = session.user.name?.split(" ")[0];
  const title = textValue(storedPayload?.mapTitle) ?? edition.title;
  const subtitle = textValue(storedPayload?.mapSubtitle) ?? edition.description;
  const category = storedGame?.type ?? edition.category ?? "Loop";
  const playedRounds = hasStoredGame
    ? (dailyProgress?.status === "completed" ? dailyTotalRounds : dailyProgress?.currentSubStage ?? 0)
    : 0;
  const progressLabel = hasStoredGame
    ? `${playedRounds}/${dailyTotalRounds} rounds struck`
    : isEditionComplete ? "Matchbox complete" : `${completedNodes}/${edition.nodes.length} games struck`;
  const playHref = hasStoredGame
    ? isComplete ? `/daily/${dateKey}?replay=1` : `/daily/${dateKey}`
    : nextNode ? `/edition/${edition.id}/${nextNode.id}` : "/summary";

  return (
    <MobileContainer>
      <main className="min-h-dvh bg-[#f3ebdf] px-4 pb-34 pt-7 text-[#1e1b18]">
        <header className="flex items-center justify-between">
          <Link
            href="/profile"
            aria-label="Open profile"
            className="grid h-13 w-13 place-items-center rounded-full border-[3px] border-[#1e1b18] bg-[#f7bd41] shadow-[0_3px_0_#1e1b18]"
          >
            <CatMark />
          </Link>
          <div className="rounded-xl border-[3px] border-[#1e1b18] bg-[#e9512d] px-4 py-1 shadow-[3px_3px_0_#1e1b18]">
            <span className="font-display text-[31px] tracking-[0.1em] text-[#f8f1e3]">
              LOOP
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-[3px] border-[#1e1b18] bg-[#1e1b18] px-4 py-3 text-[#f7bd41]">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-[17px] font-extrabold">{completedNodes}</span>
          </div>
        </header>

        <p className="mt-6 text-[20px] font-bold tracking-tight">
          {getGreeting()}{name ? `, ${name}` : ""}. Ready to strike one?
        </p>

        <section className="mt-11" aria-labelledby="todays-game-heading">
          <div className="mb-5 flex items-center gap-3">
            <h1 id="todays-game-heading" className="text-[17px] font-extrabold uppercase tracking-[0.16em]">
              Today&apos;s game
            </h1>
            <span className="mt-1 flex-1 border-t-2 border-dashed border-[#9d9385]" />
          </div>

          <article className="relative overflow-hidden rounded-[22px] border-[3px] border-[#1e1b18] bg-[#e9512d] p-4 pb-5 text-[#f8f1e3] shadow-[0_8px_0_#6b4a3a,0_11px_0_#1e1b18]">
            <span className="pointer-events-none absolute inset-2 rounded-[15px] border-[3px] border-[#f8f1e3]/80" />
            <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 border-t-[3px] border-[#1e1b18] bg-[#6b4a3a]" />
            <div className="relative grid grid-cols-[112px_minmax(0,1fr)] gap-3">
              <MatchboxIllustration />
              <div className="min-w-0 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border-2 border-[#1e1b18] bg-[#f8f1e3] px-2.5 py-1 text-[12px] font-extrabold text-[#1e1b18]">
                    DAY {matchNumber}
                  </span>
                  <span className="truncate text-[13px] font-extrabold uppercase tracking-[0.13em]">
                    ★ {category} ★
                  </span>
                </div>
                <h2 className="mt-3 inline-block max-w-full -rotate-1 rounded-lg border-[3px] border-[#1e1b18] bg-[#f8f1e3] px-3 py-1.5 font-display text-[24px] leading-none text-[#1e1b18] shadow-[2px_2px_0_#1e1b18]">
                  {title}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{category}</Pill>
                  <Pill>~{edition.estimatedTime}</Pill>
                  <Pill>{dailyTotalRounds} rounds</Pill>
                </div>
              </div>
            </div>
            <div className="relative mt-4 flex items-center justify-between border-t border-[#f8f1e3]/35 pt-3 text-[13px] font-bold">
              <span>{progressLabel}</span>
              <span>Nº {matchNumber}</span>
            </div>
          </article>
        </section>

        <Link
          href={playHref}
          className="mt-7 flex h-20 items-center justify-center rounded-[19px] border-[3px] border-[#1e1b18] bg-[#f7bd41] px-5 text-center text-[20px] font-extrabold uppercase tracking-[0.08em] shadow-[0_6px_0_#1e1b18] transition active:translate-y-1.5 active:shadow-[0_2px_0_#1e1b18]"
        >
          <span
            className="material-symbols-outlined mr-2 text-[27px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isComplete ? "workspace_premium" : "local_fire_department"}
          </span>
          {isComplete
            ? hasStoredGame ? "Replay today’s match" : "Review today’s match"
            : "Strike today’s match"}
        </Link>

        <p className="mx-auto mt-5 max-w-sm text-center text-[14px] font-semibold leading-snug text-[#62594f]">
          {subtitle}
        </p>
      </main>
      <BottomNav />
    </MobileContainer>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border-2 border-[#f8f1e3]/70 px-3 py-1 text-[12px] font-bold">{children}</span>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function CatMark() {
  return <span className="text-[29px] leading-none" aria-hidden="true">●ᴥ●</span>;
}

function MatchboxIllustration() {
  return (
    <div className="relative mt-4 flex h-38 items-end justify-center overflow-hidden rounded-[48px_48px_10px_10px] border-[3px] border-[#1e1b18] bg-[#f8e17b] shadow-[0_0_0_2px_#f8f1e3]">
      <span className="absolute inset-0 opacity-55" style={{ backgroundImage: "repeating-linear-gradient(62deg, transparent 0 13px, #f8f1e3 14px 17px)" }} />
      <span className="absolute bottom-[-20px] h-25 w-35 rounded-[50%] border-[3px] border-[#1e1b18] bg-[#f8f1e3]" />
      <span className="material-symbols-outlined relative z-10 mb-6 text-[62px] text-[#1e1b18]" style={{ fontVariationSettings: "'FILL' 1" }}>
        hourglass_top
      </span>
      <span className="absolute left-5 top-4 h-6 w-12 -rotate-6 rounded-md border-[3px] border-[#1e1b18] bg-[#e9512d]" />
    </div>
  );
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
