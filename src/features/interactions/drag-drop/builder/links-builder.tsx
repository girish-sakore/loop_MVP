"use client";

import { useMemo, useState } from "react";
import { PATTERN_REGISTRY, getPattern } from "../patterns/pattern-registry";
import { resolveLinkMapStage } from "../patterns/pattern-resolver";
import { CardFace, LinkMap } from "../drag-drop-interaction";
import type {
  DragDropStage,
  LinkMapCard,
  LinkMapRelation,
  LinkMapSlot,
} from "@/types/gameplay";

const PRESET_SAMPLE_CARDS: LinkMapCard[] = [
  { id: "card-1", title: "Starship Enterprise", color: "#c7a0ff" },
  { id: "card-2", title: "Space Shuttle Endeavour", color: "#66cfd3" },
  { id: "card-3", title: "Strelka the Dog", color: "#86ce5d" },
  { id: "card-4", title: "Félicette the Cat", color: "#ffb65c" },
  { id: "card-5", title: "Voyager 1", color: "#ffb1bd" },
  { id: "card-6", title: "Hubble Telescope", color: "#fff27a" },
];

const RELATION_COLORS = [
  "#66cfd3",
  "#ffb65c",
  "#c7a0ff",
  "#86ce5d",
  "#ffb1bd",
  "#fff27a",
];

function createDefaultStageForPattern(patternId: string): DragDropStage {
  const pattern = getPattern(patternId) ?? PATTERN_REGISTRY["box-2x2"];
  const slotEntries = Object.entries(pattern.slotAnchors).slice(
    0,
    patternId === "triangle-3"
      ? 3
      : patternId === "ring-6"
        ? 6
        : patternId === "cross-5"
          ? 5
          : 4,
  );

  const slots: LinkMapSlot[] = slotEntries.map(([anchor], idx) => ({
    id: `slot-${idx + 1}`,
    anchor,
    label: `Clue for Card ${idx + 1}`,
    answerCardId: PRESET_SAMPLE_CARDS[idx]?.id ?? `card-${idx + 1}`,
  }));

  const relationEntries = Object.entries(pattern.relationAnchors).slice(0, 4);
  const relations: LinkMapRelation[] = relationEntries.map(
    ([anchor], idx) => {
      // Pick 2 connected slots
      const s1 = slots[idx % slots.length].id;
      const s2 = slots[(idx + 1) % slots.length].id;
      return {
        id: `rel-${idx + 1}`,
        anchor,
        label: `Shared Relation ${idx + 1}`,
        slotIds: [s1, s2],
        color: RELATION_COLORS[idx % RELATION_COLORS.length],
      };
    },
  );

  return {
    id: "sample-links-stage",
    mapTitle: "Links Level Preview",
    mapSubtitle: "Place each card on the clue map",
    type: "drag-drop",
    question: "Build the link map",
    attemptsAllowed: 3,
    points: 120,
    prompt: "Drag cards into slots matching the clues.",
    cards: PRESET_SAMPLE_CARDS.slice(0, slots.length),
    feedback: {
      correct: "Correct! Every card is linked properly.",
      incorrect: "Not quite. Swap mismatched cards and try again.",
    },
    map: {
      title: "Round 1 of 4",
      pattern: pattern.id,
      pathStyle: pattern.defaultPathStyle ?? "orthogonal",
      slots,
      relations,
    },
  };
}

export function LinksBuilder() {
  const [selectedPattern, setSelectedPattern] = useState<string>("box-2x2");
  const [stage, setStage] = useState<DragDropStage>(() =>
    createDefaultStageForPattern("box-2x2"),
  );
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");

  const resolvedStage = useMemo(() => resolveLinkMapStage(stage), [stage]);
  const cardsById = useMemo(
    () => new Map(stage.cards.map((c) => [c.id, c])),
    [stage.cards],
  );

  // Switch pattern preset
  function handleSelectPattern(patternId: string) {
    setSelectedPattern(patternId);
    setStage(createDefaultStageForPattern(patternId));
  }

  // Update path style
  function handlePathStyleChange(style: "orthogonal" | "direct" | "curved") {
    setStage((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        pathStyle: style,
      },
    }));
  }

  // Copy JSON to clipboard
  function handleCopyJson() {
    // Generate clean JSON export (excluding internal fluff)
    const exportJson = {
      id: stage.id,
      question: stage.question,
      attemptsAllowed: stage.attemptsAllowed,
      points: stage.points,
      prompt: stage.prompt,
      introLabel: "Links",
      map: {
        title: stage.map.title,
        pattern: stage.map.pattern,
        pathStyle: stage.map.pathStyle,
        relations: stage.map.relations.map((r) => ({
          id: r.id,
          label: r.label,
          ...(r.anchor ? { anchor: r.anchor } : { x: r.x, y: r.y }),
          slotIds: r.slotIds,
          color: r.color,
        })),
        slots: stage.map.slots.map((s) => ({
          id: s.id,
          label: s.label,
          answerCardId: s.answerCardId,
          ...(s.anchor ? { anchor: s.anchor } : { x: s.x, y: s.y }),
        })),
      },
      cards: stage.cards,
      feedback: stage.feedback,
    };

    navigator.clipboard.writeText(JSON.stringify(exportJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Import JSON
  function handleImportJson() {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.map || !Array.isArray(parsed.map.slots)) {
        throw new Error("Missing `map.slots` array in JSON.");
      }
      setStage(parsed);
      if (parsed.map.pattern) {
        setSelectedPattern(parsed.map.pattern);
      }
      setImportJsonText("");
      setActiveTab("visual");
    } catch (err: unknown) {
      setImportError(
        err instanceof Error ? err.message : "Invalid JSON format.",
      );
    }
  }

  // Relation toggle slot connection
  function toggleRelationSlot(relationId: string, slotId: string) {
    setStage((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        relations: prev.map.relations.map((rel) => {
          if (rel.id !== relationId) return rel;
          const exists = rel.slotIds.includes(slotId);
          return {
            ...rel,
            slotIds: exists
              ? rel.slotIds.filter((id) => id !== slotId)
              : [...rel.slotIds, slotId],
          };
        }),
      },
    }));
  }

  // Relation anchor change
  function updateRelationAnchor(relationId: string, anchor: string) {
    setStage((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        relations: prev.map.relations.map((rel) =>
          rel.id === relationId ? { ...rel, anchor } : rel,
        ),
      },
    }));
  }

  // Slot anchor change
  function updateSlotAnchor(slotId: string, anchor: string) {
    setStage((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        slots: prev.map.slots.map((s) =>
          s.id === slotId ? { ...s, anchor } : s,
        ),
      },
    }));
  }

  const currentPatternDef = getPattern(selectedPattern);
  const availableSlotAnchors = currentPatternDef
    ? Object.keys(currentPatternDef.slotAnchors)
    : [];
  const availableRelationAnchors = currentPatternDef
    ? Object.keys(currentPatternDef.relationAnchors)
    : [];

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#0b0b0f]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#ded7ca] bg-[#fffdf7] px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0b0b0f] bg-[#85cb57] font-black text-white shadow-[2px_2px_0_#0b0b0f]">
              <span className="material-symbols-outlined text-[22px] text-[#0b0b0f]">
                hub
              </span>
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Links Game Pattern & Level Builder
              </h1>
              <p className="text-xs font-semibold text-[#7f766b]">
                Visual template designer & automatic path router
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border-2 border-[#0b0b0f] bg-[#f0eae1] p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("visual")}
                className={`rounded px-3 py-1 text-xs font-bold transition ${
                  activeTab === "visual"
                    ? "bg-[#fffdf7] text-[#0b0b0f] shadow-sm"
                    : "text-[#7f766b]"
                }`}
              >
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`rounded px-3 py-1 text-xs font-bold transition ${
                  activeTab === "json"
                    ? "bg-[#fffdf7] text-[#0b0b0f] shadow-sm"
                    : "text-[#7f766b]"
                }`}
              >
                JSON Import/Export
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 rounded-full border-2 border-[#0b0b0f] bg-[#85cb57] px-4 py-2 text-xs font-extrabold text-[#0b0b0f] shadow-[0_3px_0_#0b0b0f] transition hover:bg-[#92d863] active:translate-y-0.5 active:shadow-[0_1px_0_#0b0b0f]"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copied JSON!" : "Copy Stage JSON"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {activeTab === "visual" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Panel: Pattern Library & Properties */}
            <div className="space-y-6 lg:col-span-5">
              {/* Pattern Presets Card */}
              <div className="rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-5 shadow-[4px_4px_0_#0b0b0f]">
                <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-[#7f766b]">
                  1. Choose Layout Pattern
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Object.entries(PATTERN_REGISTRY)
                    .filter(([key]) => !["quad", "square", "diamond", "triangle", "star", "bipartite", "chain", "ring"].includes(key))
                    .map(([id, pat]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectPattern(id)}
                        className={`flex flex-col items-start rounded-xl border-2 p-2.5 text-left transition ${
                          selectedPattern === id
                            ? "border-[#0b0b0f] bg-[#d7e96c] shadow-[2px_2px_0_#0b0b0f]"
                            : "border-[#d8d0c3] bg-[#f8f5ef] hover:border-[#0b0b0f]"
                        }`}
                      >
                        <span className="text-xs font-black">{pat.name}</span>
                        <span className="mt-0.5 line-clamp-1 text-[10px] text-[#555]">
                          {pat.description}
                        </span>
                      </button>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#eee7dc] pt-3 text-xs font-bold">
                  <span className="text-[#666]">Path Routing Style:</span>
                  <div className="flex gap-1">
                    {(["orthogonal", "direct"] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handlePathStyleChange(style)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-bold transition ${
                          (stage.map.pathStyle ?? "orthogonal") === style
                            ? "border-[#0b0b0f] bg-[#0b0b0f] text-white"
                            : "border-[#d8d0c3] bg-[#fff] text-[#555]"
                        }`}
                      >
                        {style === "orthogonal" ? "Orthogonal (90°)" : "Direct"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slots Editor */}
              <div className="rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-5 shadow-[4px_4px_0_#0b0b0f]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#7f766b]">
                    2. Card Slots ({stage.map.slots.length})
                  </h2>
                  <span className="text-xs text-[#888]">
                    Drop spots for cards
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stage.map.slots.map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#e5ded3] bg-[#fbf9f5] p-2.5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0b0b0f] text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={slot.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStage((prev) => ({
                              ...prev,
                              map: {
                                ...prev.map,
                                slots: prev.map.slots.map((s) =>
                                  s.id === slot.id ? { ...s, label: val } : s,
                                ),
                              },
                            }));
                          }}
                          placeholder="Slot clue label"
                          className="w-full rounded border border-[#d8d0c3] bg-white px-2 py-1 text-xs font-semibold"
                        />
                      </div>
                      {availableSlotAnchors.length > 0 && (
                        <select
                          value={slot.anchor ?? ""}
                          onChange={(e) =>
                            updateSlotAnchor(slot.id, e.target.value)
                          }
                          className="rounded border border-[#d8d0c3] bg-white px-2 py-1 text-xs font-bold text-[#0b0b0f]"
                        >
                          {availableSlotAnchors.map((anch) => (
                            <option key={anch} value={anch}>
                              {anch}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Relations Editor */}
              <div className="rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-5 shadow-[4px_4px_0_#0b0b0f]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#7f766b]">
                    3. Clue Relations ({stage.map.relations.length})
                  </h2>
                  <span className="text-xs text-[#888]">
                    Shared bubble clues
                  </span>
                </div>

                <div className="space-y-3">
                  {stage.map.relations.map((relation) => (
                    <div
                      key={relation.id}
                      className="rounded-xl border-2 border-[#e5ded3] bg-[#fbf9f5] p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-[#0b0b0f]"
                          style={{
                            backgroundColor: relation.color ?? "#85cb57",
                          }}
                        />
                        <input
                          type="text"
                          value={relation.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStage((prev) => ({
                              ...prev,
                              map: {
                                ...prev.map,
                                relations: prev.map.relations.map((r) =>
                                  r.id === relation.id
                                    ? { ...r, label: val }
                                    : r,
                                ),
                              },
                            }));
                          }}
                          className="flex-1 rounded border border-[#d8d0c3] bg-white px-2 py-1 text-xs font-bold"
                        />
                        {availableRelationAnchors.length > 0 && (
                          <select
                            value={relation.anchor ?? ""}
                            onChange={(e) =>
                              updateRelationAnchor(relation.id, e.target.value)
                            }
                            className="rounded border border-[#d8d0c3] bg-white px-2 py-1 text-xs font-bold"
                          >
                            <option value="">auto (centroid)</option>
                            {availableRelationAnchors.map((anch) => (
                              <option key={anch} value={anch}>
                                {anch}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#888]">
                          Connects to:
                        </span>
                        {stage.map.slots.map((s) => {
                          const isConnected = relation.slotIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() =>
                                toggleRelationSlot(relation.id, s.id)
                              }
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold transition ${
                                isConnected
                                  ? "border-[#0b0b0f] bg-[#0b0b0f] text-white shadow-xs"
                                  : "border-[#d8d0c3] bg-white text-[#777] hover:border-[#999]"
                              }`}
                            >
                              {s.anchor ?? s.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Live Mobile Game Viewport Preview */}
            <div className="flex flex-col items-center lg:col-span-7">
              <div className="sticky top-24 w-full max-w-[430px]">
                <div className="mb-2 flex items-center justify-between px-2 text-xs font-bold text-[#666]">
                  <span>Live Mobile Device Viewport</span>
                  <span className="rounded bg-[#eae3d5] px-2 py-0.5 text-[10px]">
                    390px Mobile Canvas
                  </span>
                </div>

                {/* Mobile Device Frame */}
                <div className="overflow-hidden rounded-[36px] border-[5px] border-[#0b0b0f] bg-[#f6f2ec] shadow-[8px_8px_0_#0b0b0f]">
                  {/* Fake Dynamic Island */}
                  <div className="flex justify-center pt-3">
                    <div className="h-4 w-24 rounded-full bg-[#0b0b0f]" />
                  </div>

                  {/* Level Header inside device */}
                  <div className="px-4 pt-2 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5fa43a]">
                      Links Mode
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-[#0b0b0f]">
                      {stage.map.title}
                    </h3>
                  </div>

                  {/* The exact LinkMap game canvas */}
                  <div className="p-2">
                    <LinkMap
                      stage={resolvedStage}
                      slotCardIds={{}}
                      cardsById={cardsById}
                    />
                  </div>

                  {/* Bottom Tray Preview */}
                  <div className="border-t border-[#e5ded3] bg-[#fffdf7] p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-black text-[#666]">
                      <span>CARD TRAY PREVIEW</span>
                      <span>{stage.cards.length} Cards</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {stage.cards.map((card, idx) => (
                        <div key={card.id} className="shrink-0">
                          <CardFace
                            card={card}
                            color={card.color ?? RELATION_COLORS[idx % RELATION_COLORS.length]}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Route statistics summary */}
                <div className="mt-4 rounded-xl border border-[#ded7ca] bg-white p-3 text-xs">
                  <div className="flex justify-between font-bold text-[#555]">
                    <span>Auto-Generated SVG Paths:</span>
                    <span className="text-[#0b0b0f]">
                      {resolvedStage.map.paths.length} connection polylines
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-[#888]">
                    <span>Slot Positions:</span>
                    <span>Fully resolved from &ldquo;{selectedPattern}&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* JSON Import / Export Panel */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-6 shadow-[4px_4px_0_#0b0b0f]">
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-[#7f766b]">
                Generated Stage JSON
              </h2>
              <p className="mb-4 text-xs text-[#666]">
                This is the minimal, semantic JSON. Zero manual coordinates or
                raw SVG polylines required!
              </p>
              <pre className="max-h-[500px] overflow-auto rounded-xl border-2 border-[#e5ded3] bg-[#272822] p-4 text-xs text-[#f8f8f2]">
                {JSON.stringify(
                  {
                    id: stage.id,
                    question: stage.question,
                    attemptsAllowed: stage.attemptsAllowed,
                    points: stage.points,
                    prompt: stage.prompt,
                    introLabel: "Links",
                    map: {
                      title: stage.map.title,
                      pattern: stage.map.pattern,
                      pathStyle: stage.map.pathStyle,
                      relations: stage.map.relations.map((r) => ({
                        id: r.id,
                        label: r.label,
                        ...(r.anchor ? { anchor: r.anchor } : { x: r.x, y: r.y }),
                        slotIds: r.slotIds,
                        color: r.color,
                      })),
                      slots: stage.map.slots.map((s) => ({
                        id: s.id,
                        label: s.label,
                        answerCardId: s.answerCardId,
                        ...(s.anchor ? { anchor: s.anchor } : { x: s.x, y: s.y }),
                      })),
                    },
                    cards: stage.cards,
                    feedback: stage.feedback,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <div className="rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-6 shadow-[4px_4px_0_#0b0b0f]">
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-[#7f766b]">
                Import Existing Stage JSON
              </h2>
              <p className="mb-4 text-xs text-[#666]">
                Paste any subStage object from `edition-001.json` to inspect and
                edit it visually.
              </p>
              <textarea
                rows={16}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste stage JSON here..."
                className="w-full rounded-xl border-2 border-[#e5ded3] bg-white p-3 font-mono text-xs text-[#0b0b0f]"
              />
              {importError && (
                <div className="mt-2 text-xs font-bold text-red-600">
                  {importError}
                </div>
              )}
              <button
                type="button"
                onClick={handleImportJson}
                className="mt-4 rounded-full border-2 border-[#0b0b0f] bg-[#85cb57] px-5 py-2 text-xs font-extrabold text-[#0b0b0f] shadow-[0_3px_0_#0b0b0f]"
              >
                Load into Visual Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
