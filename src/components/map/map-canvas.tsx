"use client";

import { useEffect, useRef, useState } from "react";
import { MapNodeMarker } from "@/components/map/map-node";
import { StagePopup } from "@/components/map/stage-popup";
import { MapNavToggle } from "@/components/map/map-nav-toggle";
import { useUiStore } from "@/stores/ui-store";
import { MAP_ZOOM_SCALE, FOCUS_X_FRACTION, FOCUS_Y_FRACTION } from "@/features/map/map-config";
import type { VillageMapData, MapNode } from "@/features/map/types";
import BottomNav from "@/components/layout/bottom-nav";
import { VillageTitleCard } from "@/components/map/village-title-card";
import { AnimatePresence, motion } from "framer-motion";

const themeBackgrounds: Record<string, string> = {
  "salt-village": "/images/villages/salt-village-bg.png",
};

export function MapCanvas({ villages }: { villages: VillageMapData[] }) {
  const [activeNode, setActiveNode] = useState<{ editionId: string; node: MapNode } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const setMapNavVisible = useUiStore((s) => s.setMapNavVisible);
  const currentVillage =
    villages.find((v) =>
      v.nodes.some((n) => n.status === "current")
    ) ?? villages[0];
  const completed =
    currentVillage.nodes.filter(
      (n) => n.status === "completed"
    ).length;

  const total = currentVillage.nodes.length;
  // Always enter /map with nav hidden, regardless of prior toggle state
  useEffect(() => {
    setMapNavVisible(false);
  }, [setMapNavVisible]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const currentNode = villages.flatMap((v) => v.nodes).find((n) => n.status === "current");
    if (!currentNode) return;

    const contentWidth = container.clientWidth * MAP_ZOOM_SCALE;
    const contentHeight = container.scrollHeight;

    const nodeAbsX = (parseFloat(currentNode.x) / 100) * contentWidth;
    const nodeAbsY = (parseFloat(currentNode.y) / 100) * contentHeight;

    container.scrollTo({
      left: nodeAbsX - container.clientWidth * FOCUS_X_FRACTION,
      top: nodeAbsY - container.clientHeight * FOCUS_Y_FRACTION,
      behavior: "auto",
    });
  }, [villages]);

  return (
    <div
      ref={scrollRef}
      style={{
        height: "100dvh",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x pan-y",
        backgroundColor: "var(--surface)",
      }}
    >
      <>
        <VillageTitleCard
          title="Salt Village"
          subtitle="The Foundation of Life"
          completed={completed}
          total={total}
        />

        <div ref={scrollRef}>
          ...
        </div>
      </>
      <div style={{ position: "relative", width: `${MAP_ZOOM_SCALE * 100}%` }}>
        {villages.map((village) => (
          <div
            key={village.editionId}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "845 / 1500",
              // backgroundImage: `url(${themeBackgrounds[village.theme] ?? ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: village.status === "locked" ? 0.5 : 1,
              backgroundColor: village.status === "locked" ? "var(--on-tertiary-fixed)" : "var(--on-tertiary-fixed)", //#191a1b
            }}
          >
            {village.nodes.map((node) => (
              <MapNodeMarker
                key={node.stageId}
                node={node}
                onTap={(tappedNode) =>
                  setActiveNode({ editionId: village.editionId, node: tappedNode })
                }
              />
            ))}

            {/* {activeNode?.editionId === village.editionId && (
              <StagePopup
                node={activeNode.node}
                editionId={activeNode.editionId}
                onClose={() => setActiveNode(null)}
              />
            )} */}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: `${MAP_ZOOM_SCALE * 100}%` }}>
        {villages.map((village) => (
          <div key={village.editionId}>
            ...
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeNode && (
          <StagePopup
            node={activeNode.node}
            editionId={activeNode.editionId}
            onClose={() => setActiveNode(null)}
          />
        )}
      </AnimatePresence>

      <MapNavToggle />
      <MapNavToggle />
      <BottomNav />

    </div>
  );
}