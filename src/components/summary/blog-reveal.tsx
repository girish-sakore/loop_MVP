"use client";

import { useState, type CSSProperties } from "react";
import type { SummaryItem } from "@/features/summery/build-summary-items";

const INITIAL_COUNT = 3;

type Filter = "all" | "missed" | "got";

const tagStyle = (correct: boolean) =>
  ({
    "--c": correct ? "var(--t3)" : "var(--red)",
    "--cf": correct ? "var(--tf3)" : "var(--on-red)",
  }) as CSSProperties;

export function BlogReveal({ items }: { items: SummaryItem[] }) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  if (items.length === 0) return null;

  const missedCount = items.filter((i) => i.correct === false).length;
  const gotCount = items.filter((i) => i.correct === true).length;
  const showFilters = missedCount > 0 && gotCount > 0;

  const filtered = items.filter((i) =>
    filter === "missed" ? i.correct === false : filter === "got" ? i.correct === true : true,
  );

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  const tabs: [Filter, string][] = [
    ["all", `All ${items.length}`],
    ["missed", `Missed ${missedCount}`],
    ["got", `Got it ${gotCount}`],
  ];

  return (
    <section className="blog" aria-label="Behind today’s box">
      <div className="sheet">
        <span className="handle" aria-hidden="true" />
        <h2>Behind today’s box</h2>
        <p>The story behind each answer, with sources if you want to read more.</p>

        {showFilters && (
          <div className="tabs" role="group" aria-label="Filter answers">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className="tab"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <ul className="list">
          {visible.map((item) => (
            <li key={item.id}>
              <article className="post">
                {item.correct !== null && (
                  <span className="tag" style={tagStyle(item.correct)}>
                    {item.correct ? "You got it" : "Missed"}
                  </span>
                )}
                {item.question && <p className="q">{item.question}</p>}
                {item.headline && <h3 className="ans">{item.headline}</h3>}
                <p className="why">{item.body}</p>
                {item.sources.length > 0 && (
                  <ul className="src" aria-label="Sources">
                    {item.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ul>

        {filtered.length > INITIAL_COUNT && (
          <button
            type="button"
            className="more"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show less" : `Show all ${filtered.length} questions`}
          </button>
        )}
      </div>
    </section>
  );
}