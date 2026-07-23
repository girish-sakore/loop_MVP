"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import type { Edition } from "@/types/gameplay";

interface GameMapProps {
  editions: Edition[];
}

type MapPoint = {
  id: string;
  x: number;
  y: number;
};
const MAP_WIDTH = 420;
const MAP_HEIGHT = 908;
const MAP_BACKGROUND_IMAGE = "/images/maps-bg/week-001.png";
const MAP_PATH_START_OFFSET = 0.08;
const MAP_PATH_END_OFFSET = 0.88;
const map_path = "M200.5 900L209.5 881.5L219 826L226 760.5L209.5 718L194.5 664L233 626.5L279 585.5L243.5 538.5L266 501L286 488L307 462.5L243.5 420L226 393L272 351L266 321.5L233 285.5L272 260.5L286 233.5L253.843 218.5L200.5 197.5L177 177.5L188.584 137.5L243.5 110.5L320.775 83.5V6";

function getMapProgress(index: number, count: number) {
  if (count <= 1) return MAP_PATH_START_OFFSET;

  return (
    MAP_PATH_START_OFFSET +
    ((MAP_PATH_END_OFFSET - MAP_PATH_START_OFFSET) * index) / (count - 1)
  );
}

function getFallbackLevelPoints(editions: Edition[]): MapPoint[] {
  return editions.map((edition, index) => ({
    id: edition.id,
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT * getMapProgress(index, editions.length),
  }));
}

export function GameMap({ editions }: GameMapProps) {
  const router = useRouter();
  const mapPathRef = useRef<SVGPathElement | null>(null);
  const [startingEditionId, setStartingEditionId] = useState<string | null>(null);
  const [levelPoints, setLevelPoints] = useState<MapPoint[]>(() =>
    getFallbackLevelPoints(editions),
  );

  useLayoutEffect(() => {
    const pathElement = mapPathRef.current;
    if (!pathElement) return;

    const pathLength = pathElement.getTotalLength();
    if (pathLength === 0) return;

    const GAME_SPACING = 180;
    const START_OFFSET = 130;

    setLevelPoints(
      editions.map((edition, index) => {
        const distance = Math.min(
          START_OFFSET + index * GAME_SPACING,
          pathLength
        );

        const point = pathElement.getPointAtLength(distance);

        return {
          id: edition.id,
          x: point.x,
          y: point.y,
        };
      })
    );
  }, [editions]);

  if (editions.length === 0) return null;

  const lastPoint = levelPoints[levelPoints.length - 1];
  const lockPoint = {
    x: lastPoint.x,
    y: Math.min(MAP_HEIGHT - 88, lastPoint.y + 112),
  };

  async function handlePlay(editionId: string) {
    if (startingEditionId) return;

    setStartingEditionId(editionId);
    try {
      await fetch("/api/progress/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId }),
      });
    } catch {
      // Non-blocking. The game route can still create progress if needed later.
    }
    router.push(`/edition/${editionId}`);
  }


  return (
    <section
      className="relative min-h-[640px] overflow-hidden rounded-[2rem]  py-5"
      style={{
        backgroundColor: "var(--surface-container-low)",
      }}
    >
      <div className="relative">
        <div className="px-1">
          {/* <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--secondary)" }}
          >
            Game Map
          </span>
          <h2
            className="mt-1 text-[30px] font-extrabold leading-tight"
            style={{ color: "var(--on-surface)" }}
          >
            Pick your next stop
          </h2> */}
        </div>

        <div
          className="relative mx-auto mt-4 w-full max-w-[420px] overflow-hidden rounded-[24px] bg-cover bg-top bg-no-repeat shadow-[0_12px_28px_rgba(31,45,34,0.16)]"
          style={{
            aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
            backgroundImage: `url(${MAP_BACKGROUND_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 origin-top will-change-transform">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full pointer-events-none"
              fill="currentColor"
              preserveAspectRatio="xMidYMin meet"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            >
              <path
                ref={mapPathRef}
                d={map_path}
                opacity="1"
                fill="none"
                stroke="red"
                strokeWidth={2}
              />
            </svg>

            {editions.map((edition, index) => {
              const point = levelPoints[index];
              const isStarting = startingEditionId === edition.id;
              const isFirst = index === 0;

              return (
                <button
                  key={edition.id}
                  type="button"
                  aria-label={`Open ${edition.title}`}
                  className="group absolute z-10 flex h-[136px] w-[136px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[28px] transition-transform duration-150 hover:-translate-y-[54%] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/90 disabled:cursor-wait disabled:opacity-85 active:-translate-y-[48%]"
                  disabled={startingEditionId !== null}
                  onClick={() => handlePlay(edition.id)}
                  style={{
                    left: `${(point.x / MAP_WIDTH) * 100}%`,
                    top: `${(point.y / MAP_HEIGHT) * 100}%`,
                    color: "var(--on-surface)",
                  }}
                >
                  <span className="absolute top-3 h-20 w-20 rounded-full bg-[rgba(79,91,45,0.22)] blur-[2px] transition-transform duration-150 group-hover:scale-105" />
                  <span
                    className="relative flex h-30px] w-[30px] items-center justify-center rounded-full border-[6px] shadow-[0_9px_0_0_rgba(68,111,55,0.35),0_16px_22px_rgba(46,88,47,0.22)] transition-transform duration-150 group-hover:scale-105"
                    style={{
                      backgroundColor: isFirst ? "#bff0d8" : "#d7ebff",
                      borderColor: "#fff8e7",
                      color: isFirst
                        ? "var(--on-secondary-container)"
                        : "var(--on-tertiary-fixed)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 18,
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      {isStarting ? "hourglass_top" : isFirst ? "flag" : "sports_esports"}
                    </span>
                  </span>

                  <span
                    className="hidden relative mt-2 flex max-w-[128px] flex-col rounded-2xl border-2 px-3 py-1 text-center leading-tight shadow-[0_4px_0_0_rgba(58,103,87,0.16)]"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.92)",
                      borderColor: "#fff8e7",
                      color: "var(--secondary)",
                    }}
                  >
                    <span className="text-[10px] font-extrabold uppercase">
                      Stop {index + 1}
                    </span>
                    <span
                      className="line-clamp-1 text-[11px] font-extrabold"
                      style={{ color: "var(--on-surface)" }}
                    >
                      {edition.title}
                    </span>
                  </span>
                  <span className="sr-only">
                    {isStarting
                      ? "Opening game..."
                      : `${edition.stages.length} stages - ${edition.estimatedTime}`}
                  </span>
                  <span
                    className="pointer-events-none absolute left-1/2 top-full mt-1 hidden w-44 -translate-x-1/2 rounded-2xl border-2 px-3 py-2 text-center text-xs font-bold shadow-lg group-hover:block group-focus-visible:block"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.96)",
                      borderColor: "#fff8e7",
                      color: "var(--on-surface)",
                    }}
                  >
                    <span className="block truncate text-[13px] font-extrabold">
                      {edition.title}
                    </span>
                    <span
                      className="mt-1 block font-bold"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      {isStarting
                        ? "Opening game..."
                        : `${edition.stages.length} stages - ${edition.estimatedTime}`}
                    </span>
                  </span>
                </button>
              );
            })}

            {/* <div
              className="absolute z-10 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[6px] shadow-[0_8px_0_0_rgba(94,94,92,0.18)]"
              style={{
                left: `${(lockPoint.x / MAP_WIDTH) * 100}%`,
                top: `${(lockPoint.y / MAP_HEIGHT) * 100}%`,
                backgroundColor: "rgba(255, 255, 255, 0.86)",
                borderColor: "#fff8e7",
                color: "var(--outline)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
                lock
              </span>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
