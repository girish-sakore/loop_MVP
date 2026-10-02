import { DailyGameForm } from "@/components/provider/daily-game-form";
import { requireProvider } from "@/lib/provider-auth";
import { prisma } from "@/lib/db";

export default async function ProviderDashboardPage() {
  const session = await requireProvider();
  const games = await prisma.dailyGame.findMany({
    orderBy: { scheduledFor: "desc" },
    take: 12,
    select: { id: true, scheduledFor: true, type: true, updatedAt: true },
  });

  return (
    <main className="min-h-dvh bg-[#f3ebdf] px-5 py-8 text-[#1e1b18]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#e9512d]">Provider dashboard</p>
            <h1 className="font-display mt-2 text-[42px] leading-none">Publish a daily match</h1>
          </div>
          <p className="text-right text-[13px] font-semibold text-[#62594f]">{session.user.email}</p>
        </header>

        <DailyGameForm />

        <section className="mt-8 rounded-[20px] border-[3px] border-[#1e1b18] bg-[#f8f1e3] p-5">
          <h2 className="text-[18px] font-extrabold uppercase tracking-[0.1em]">Scheduled matches</h2>
          <div className="mt-4 divide-y-2 divide-[#ded2c0]">
            {games.length === 0 ? <p className="py-4 text-[#62594f]">No daily matches published yet.</p> : games.map((game) => (
              <div key={game.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div><p className="font-extrabold">{formatDate(game.scheduledFor)}</p><p className="text-[#62594f]">{game.type}</p></div>
                <time className="text-right text-xs text-[#62594f]">Updated {game.updatedAt.toLocaleDateString("en-IN")}</time>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(value);
}
