"use client";

import { useMemo, useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { worldCountries } from "./world-map";
import styles from "./border-hop.module.css";

type Props = { start: string; target: string; route: string[]; hints: string[]; wrong?: string };
type View = { x: number; y: number; zoom: number };
const initialView: View = { x: 0, y: 0, zoom: 1 };

export function BorderHopMap({ start, target, route, hints, wrong }: Props) {
  const [view, setView] = useState(initialView);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; view: View; scale: number } | null>(null);
  const paths = useMemo(() => {
    // Fit the endpoints, not the answer: framing must not reveal the route.
    // A rotated projection keeps antimeridian countries (Russia) together.
    const projection = geoEquirectangular().rotate(start === "Russia" || target === "Russia" ? [-90, 0] : [0, 0]);
    const endpoints = worldCountries.filter((c) => [start, target].includes(c.properties.name));
    projection.fitExtent([[55, 55], [745, 445]], { type: "FeatureCollection", features: endpoints });
    const path = geoPath(projection);
    return worldCountries.map((country) => ({ name: country.properties.name, d: path(country) ?? "" }));
  }, [start, target]);

  function zoom(factor: number) {
    setView((old) => {
      const nextZoom = Math.max(0.35, Math.min(8, old.zoom * factor));
      const ratio = nextZoom / old.zoom;
      return { x: 400 - (400 - old.x) * ratio, y: 250 - (250 - old.y) * ratio, zoom: nextZoom };
    });
  }

  return (
    <div className={styles.mapWrap}>
      <svg
        className={styles.map}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        viewBox="0 0 800 500"
        role="img"
        aria-label={`Map from ${start} to ${target}. Rose is the start, green is the destination, yellow is your route, and purple outlines are hints.`}
        onPointerDown={(event) => {
          if (event.button !== 0 || drag.current) return;
          const matrix = event.currentTarget.getScreenCTM();
          if (!matrix) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view, scale: matrix.a };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const active = drag.current;
          if (!active || active.id !== event.pointerId) return;
          setView({ ...active.view, x: active.view.x + (event.clientX - active.x) / active.scale, y: active.view.y + (event.clientY - active.y) / active.scale });
        }}
        onPointerUp={(event) => {
          if (drag.current?.id !== event.pointerId) return;
          drag.current = null;
          setDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
        onPointerCancel={() => { drag.current = null; setDragging(false); }}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
          {paths.map(({ name, d }) => (
            <path key={name} d={d} data-country={name} vectorEffect="non-scaling-stroke"
              className={[styles.country, name === start ? styles.start : name === target ? styles.target : route.includes(name) ? styles.visited : hints.includes(name) ? styles.hinted : "", name === wrong ? styles.wrong : ""].join(" ")} />
          ))}
        </g>
      </svg>
      <div className={styles.mapControls}>
        <button type="button" onClick={() => zoom(1.4)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoom(1 / 1.4)} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => setView(initialView)} aria-label="Reset map view">⤢</button>
      </div>
      <span className={styles.mapCaption}>Drag to explore · use + / − to zoom</span>
    </div>
  );
}
