import { redirect } from "next/navigation";
import { GameMap } from "@/components/game-map/game-map";
import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import { getAllEditions } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";

export default async function MapPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const editions = getAllEditions();

  return (
    <MobileContainer>
      <header
        className="flex h-16 w-full items-center justify-between px-6 sticky top-0 z-50"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2"
            style={{
              backgroundColor: "var(--surface-container-highest)",
              borderColor: "var(--surface-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--primary)" }}
            >
              person
            </span>
          </div>
          <span
            className="text-[28px] font-extrabold tracking-tight"
            style={{ color: "var(--secondary)" }}
          >
            Habitly
          </span>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ color: "var(--on-surface-variant)", fontSize: 26 }}
        >
          map
        </span>
      </header>

      <main className="">
        <GameMap editions={editions} />
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
