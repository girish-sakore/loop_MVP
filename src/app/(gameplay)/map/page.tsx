import Link from "next/link";
import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import { getAuthSession } from "@/lib/auth-session";
import { getEditionById } from "@/features/editions/edition-content";
import { buildVillageMapData } from "@/features/map/map-content";
import type { MapNode, VillageMapData } from "@/features/map/types";
import type { EditionNode } from "@/types/gameplay";

type TileConfig = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge?: string;
};

type GameTile = TileConfig & {
  editionId: string;
  mapTitle: string;
  node: MapNode;
};

const gameTileConfig: Record<string, TileConfig> = {
  swipe: {
    key: "swipe",
    title: "This or That",
    subtitle: "Pick a side",
    icon: "style",
    color: "#85cb57",
  },
  "timeline-builder": {
    key: "timeline-builder",
    title: "Chrono",
    subtitle: "Order events",
    icon: "hourglass_top",
    color: "#f7d91f",
  },
  reorder: {
    key: "reorder",
    title: "Sort",
    subtitle: "Arrange order",
    icon: "swap_vert",
    color: "#66cfd3",
  },
  "four-way-swipe": {
    key: "four-way-swipe",
    title: "Compass",
    subtitle: "Swipe answers",
    icon: "open_with",
    color: "#f2b84b",
    badge: "New",
  },
  "drag-drop": {
    key: "drag-drop",
    title: "Links",
    subtitle: "Connect cards",
    icon: "conversion_path",
    color: "#4aa8ee",
  },
  "image-select": {
    key: "image-select",
    title: "Knockout",
    subtitle: "Choose a winner",
    icon: "hotel_class",
    color: "#e97f42",
  },
  "fill-blank": {
    key: "fill-blank",
    title: "Hindsight",
    subtitle: "Find the moment",
    icon: "public",
    color: "#b996f6",
    badge: "New",
  },
};

const gameOrder = [
  "swipe",
  "timeline-builder",
  "reorder",
  "four-way-swipe",
  "drag-drop",
  "image-select",
  "fill-blank",
];

export default async function MapPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const villages = await buildVillageMapData(session.user.id);
  const currentVillage =
    villages.find((village) =>
      village.nodes.some((node) => node.status === "current"),
    ) ?? villages[0];
  const currentEdition = currentVillage
    ? getEditionById(currentVillage.editionId)
    : null;
  const gameTiles = buildGameTiles(currentVillage, currentEdition?.nodes ?? []);

  return (
    <MobileContainer>
      <main className="min-h-dvh bg-[#f6f2ec] px-6 pb-36 pt-12 text-[#0b0b0f]">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/pricing"
            className="rounded-full bg-[#ffb557] px-4 py-2 text-[14px] font-extrabold shadow-[0_2px_0_rgba(11,11,15,0.18)] transition active:translate-y-0.5"
          >
            Try Premium+
          </Link>

          <div className="flex items-center gap-1.5 text-[#6c6964]">
            <span className="material-symbols-outlined text-[26px]">local_fire_department</span>
            <span className="text-[15px] font-extrabold">0</span>
          </div>
        </header>

        <section className="mb-5 text-center">
          <p className="text-[16px] font-extrabold text-[#62605c]">
            Today&apos;s Theme
          </p>
          <h1 className="font-display mt-1 text-[38px] leading-none">
            {currentVillage?.title ?? "Today"}
          </h1>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {gameTiles.map((tile, index) => (
            <TodayTile key={tile.node.nodeId} tile={tile} index={index} />
          ))}

          {gameTiles.length % 2 === 1 ? <InviteTile /> : null}
        </section>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}

function TodayTile({
  tile,
  index,
}: {
  tile: GameTile;
  index: number;
}) {
  const isLocked = tile.node.status === "completed" || tile.node.status === "locked";
  const content = (
    <div
      className="group relative flex aspect-square min-h-[158px] flex-col justify-between overflow-hidden rounded-[16px] border border-[#0b0b0f] p-3 text-left transition active:scale-[0.98]"
      style={{ backgroundColor: tile.color }}
    >
      <FoldCorner shade={index % 2 === 0 ? "#1f2933" : "#806d0b"} />

      {tile.badge ? (
        <span className="absolute left-1/2 top-[-1px] z-20 -translate-x-1/2 rounded-full border border-[#0b0b0f] bg-[#fffdf7] px-2 py-0.5 text-[10px] font-extrabold uppercase leading-none">
          {tile.badge}
        </span>
      ) : null}

      {isLocked ? (
        <span className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#0b0b0f] bg-[#fffdf7]">
          <span className="material-symbols-outlined text-[21px]">
            {tile.node.status === "completed" ? "check" : "lock"}
          </span>
        </span>
      ) : null}

      <div className="flex h-20 items-center justify-center">
        <TileIllustration icon={tile.icon} index={index} />
      </div>

      <div>
        <span className="mb-2 inline-flex rounded-full bg-[#fffdf7]/85 px-2 py-1 text-[11px] font-extrabold leading-none text-[#0b0b0f]">
          {tile.node.completedSubGames}/{tile.node.totalSubGames} games
        </span>
        <h2 className="text-[21px] font-extrabold leading-none">{tile.title}</h2>
        <p className="mt-1 text-[15px] leading-none text-[#343238]">
          {tile.mapTitle === tile.title ? tile.subtitle : tile.mapTitle}
        </p>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div aria-label={`${tile.title} locked`} className="opacity-65">
        {content}
      </div>
    );
  }

  return (
    <Link href={`/edition/${tile.editionId}/${tile.node.nodeId}`} aria-label={tile.title}>
      {content}
    </Link>
  );
}

function InviteTile() {
  return (
    <button
      type="button"
      className="flex aspect-square min-h-[158px] flex-col items-center justify-center rounded-[16px] border border-[#d8d0c3] bg-[#f6f2ec] text-center transition active:scale-[0.98]"
    >
      <span className="material-symbols-outlined text-[38px]">ios_share</span>
      <span className="mt-3 text-[17px] font-extrabold">Invite friends</span>
    </button>
  );
}

function TileIllustration({
  icon,
  index,
}: {
  icon: string;
  index: number;
}) {
  const swatches = [
    ["#f3a1bb", "#4aa8ee"],
    ["#fffdf7", "#b996f6"],
    ["#fffdf7", "#d8d0c3"],
    ["#b996f6", "#f7d91f"],
    ["#85cb57", "#4aa8ee"],
  ][index % 5];

  return (
    <div className="relative flex h-16 w-20 items-center justify-center">
      <span
        className="absolute left-2 top-2 h-10 w-8 rotate-[-12deg] rounded-[4px] border-[2px] border-[#0b0b0f]"
        style={{ backgroundColor: swatches[0] }}
      />
      <span
        className="absolute right-2 top-1 h-10 w-8 rotate-[8deg] rounded-[4px] border-[2px] border-[#0b0b0f]"
        style={{ backgroundColor: swatches[1] }}
      />
      <span className="material-symbols-outlined relative z-10 text-[34px]">
        {icon}
      </span>
    </div>
  );
}

function FoldCorner({ shade }: { shade: string }) {
  return (
    <>
      <span className="absolute right-[-1px] top-[-1px] h-8 w-8 rounded-bl-[20px] border-b border-l border-[#0b0b0f] bg-[#d5bb16]" />
      <span
        className="absolute right-[2px] top-[22px] h-3 w-7 rotate-[18deg] rounded-full"
        style={{ backgroundColor: shade }}
      />
    </>
  );
}

function buildGameTiles(
  village: VillageMapData | undefined,
  editionNodes: EditionNode[],
): GameTile[] {
  if (!village) return [];

  const sortedNodes = [...editionNodes].sort((a, b) => {
    const aOrder = gameOrder.indexOf(a.type);
    const bOrder = gameOrder.indexOf(b.type);

    return (aOrder === -1 ? 999 : aOrder) - (bOrder === -1 ? 999 : bOrder);
  });

  return sortedNodes.flatMap((editionNode) => {
    const node = village.nodes.find((item) => item.nodeId === editionNode.id);
    if (!node) return [];

    const config = gameTileConfig[editionNode.type] ?? {
      key: editionNode.type,
      title: editionNode.mapTitle,
      subtitle: editionNode.mapSubtitle,
      icon: "extension",
      color: "#fffdf7",
    };

    return [{
      ...config,
      title: config.title || editionNode.mapTitle,
      subtitle: config.subtitle || editionNode.mapSubtitle,
      mapTitle: editionNode.mapTitle,
      editionId: village.editionId,
      node,
    }];
  });
}
