"use client";

import { useState } from "react";
import type { Edition, EditionNode, Stage } from "@/types/gameplay";

const stageTypes = [
  "image-select", "swipe", "fill-blank", "timeline-builder",
  "reorder", "four-way-swipe", "drag-drop", "clue-connect",
] as const;

type Props = { template: Edition };

export function ProviderEditionEditor({ template }: Props) {
  const [edition, setEdition] = useState(() => structuredClone(template));
  const [slug, setSlug] = useState(`${template.id}-copy`);
  const [releaseAt, setReleaseAt] = useState("");
  const [editionId, setEditionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function updateEdition(field: keyof Edition, value: string) {
    setEdition((current) => ({ ...current, [field]: value }));
  }

  function updateNode(index: number, changes: Partial<EditionNode>) {
    setEdition((current) => ({
      ...current,
      nodes: current.nodes.map((node, nodeIndex) => nodeIndex === index ? { ...node, ...changes } : node),
    }));
  }

  function editStage(nodeIndex: number, stageIndex: number, edit: (stage: Stage) => Stage) {
    setEdition((current) => ({
      ...current,
      nodes: current.nodes.map((node, index) => index !== nodeIndex ? node : {
        ...node,
        subStages: node.subStages.map((stage, index) => index === stageIndex ? edit(stage) : stage),
      }),
    } as Edition));
  }

  async function save(action: "save" | "schedule") {
    setMessage("Saving...");
    const endpoint = editionId ? `/api/provider/editions/${editionId}` : "/api/provider/editions";
    const response = await fetch(endpoint, {
      method: editionId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content: edition, releaseAt: releaseAt ? new Date(releaseAt).toISOString() : undefined, action }),
    });
    const result = await response.json() as { error?: string; errors?: string[]; edition?: { id: string } };
    if (!response.ok) {
      setMessage(result.errors?.join(" ") ?? result.error ?? "Could not save edition.");
      return;
    }
    if (result.edition?.id) setEditionId(result.edition.id);
    setMessage(action === "schedule" ? "Edition scheduled." : "Draft saved.");
  }

  return (
    <main className="min-h-dvh bg-[#f6f2ec] px-6 py-10 text-[#0b0b0f]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6d6963]">Provider studio</p>
            <h1 className="font-display mt-2 text-5xl">Build tomorrow&apos;s edition</h1>
          </div>
          <a href="/map" className="text-sm font-bold underline">Exit</a>
        </header>

        <section className="space-y-4 rounded-2xl border border-[#d8d0c3] bg-[#fffdf7] p-5">
          <Field label="Edition slug"><input value={slug} onChange={(event) => setSlug(event.target.value)} /></Field>
          <Field label="Title"><input value={edition.title} onChange={(event) => updateEdition("title", event.target.value)} /></Field>
          <Field label="Description"><textarea value={edition.description} onChange={(event) => updateEdition("description", event.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estimated time"><input value={edition.estimatedTime} onChange={(event) => updateEdition("estimatedTime", event.target.value)} /></Field>
            <Field label="Release time"><input type="datetime-local" value={releaseAt} onChange={(event) => setReleaseAt(event.target.value)} /></Field>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-extrabold">Games</h2><span className="text-sm text-[#6d6963]">{edition.nodes.length} nodes</span></div>
          {edition.nodes.map((node, nodeIndex) => (
            <article key={node.id} className="rounded-2xl border border-[#d8d0c3] bg-[#fffdf7] p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_180px]">
                <Field label="Map title"><input value={node.mapTitle} onChange={(event) => updateNode(nodeIndex, { mapTitle: event.target.value })} /></Field>
                <Field label="Map subtitle"><input value={node.mapSubtitle} onChange={(event) => updateNode(nodeIndex, { mapSubtitle: event.target.value })} /></Field>
                <Field label="Game type"><select value={node.type} onChange={(event) => updateNode(nodeIndex, { type: event.target.value })}>{stageTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
              </div>
              <div className="mt-4 space-y-3 border-t border-[#e4ddd2] pt-4">
                {node.subStages.map((stage, stageIndex) => (
                  <StageEditor
                    key={stage.id}
                    stage={stage}
                    index={stageIndex}
                    onChange={(edit) => editStage(nodeIndex, stageIndex, edit)}
                  />
                ))}
              </div>
            </article>
          ))}
        </section>

        <footer className="sticky bottom-0 mt-8 flex items-center justify-between gap-4 border-t border-[#d8d0c3] bg-[#f6f2ec]/95 py-4 backdrop-blur">
          <p className="text-sm font-bold text-[#6d6963]">{message}</p>
          <div className="flex gap-3"><button onClick={() => save("save")} className="rounded-full border border-[#0b0b0f] px-5 py-3 font-bold">Save draft</button><button onClick={() => save("schedule")} className="rounded-full bg-[#0b0b0f] px-5 py-3 font-bold text-white">Schedule edition</button></div>
        </footer>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold"><span className="mb-1 block text-[#6d6963]">{label}</span>{children}</label>;
}

function StageEditor({ stage, index, onChange }: { stage: Stage; index: number; onChange: (edit: (stage: Stage) => Stage) => void }) {
  const update = (changes: Partial<Stage>) => onChange((current) => ({ ...current, ...changes } as Stage));
  return (
    <div className="space-y-4 rounded-xl bg-[#f6f2ec] p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_100px_100px]">
        <Field label={`Game ${index + 1}`}><input value={stage.question} onChange={(event) => update({ question: event.target.value })} /></Field>
        <Field label="Attempts"><input type="number" min="1" value={stage.attemptsAllowed} onChange={(event) => update({ attemptsAllowed: Number(event.target.value) })} /></Field>
        <Field label="Points"><input type="number" min="0" value={stage.points} onChange={(event) => update({ points: Number(event.target.value) })} /></Field>
      </div>
      {stage.type === "image-select" ? <ImageSelectEditor stage={stage} onChange={update} /> : null}
      {stage.type === "swipe" ? <SwipeEditor stage={stage} onChange={update} /> : null}
      {stage.type === "fill-blank" ? <FillBlankEditor stage={stage} onChange={update} /> : null}
      {stage.type === "timeline-builder" ? <TimelineEditor stage={stage} onChange={update} /> : null}
      {stage.type === "reorder" ? <ReorderEditor stage={stage} onChange={update} /> : null}
      {stage.type === "four-way-swipe" ? <FourWayEditor stage={stage} onChange={update} /> : null}
      {stage.type === "drag-drop" ? <DragDropEditor stage={stage} onChange={update} /> : null}
      {stage.type === "clue-connect" ? <ClueConnectEditor stage={stage} onChange={update} /> : null}
    </div>
  );
}

function ImageSelectEditor({ stage, onChange }: { stage: Extract<Stage, { type: "image-select" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <Collection title="Options" onAdd={() => onChange({ options: [...stage.options, { id: `option-${stage.options.length + 1}`, label: "", image: "", isCorrect: false, feedback: "" }] })}>
    {stage.options.map((option, index) => <div key={option.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <input placeholder="Label" value={option.label} onChange={(event) => onChange({ options: replaceAt(stage.options, index, { ...option, label: event.target.value }) })} />
      <input placeholder="Image URL" value={option.image} onChange={(event) => onChange({ options: replaceAt(stage.options, index, { ...option, image: event.target.value }) })} />
      <input placeholder="Feedback" value={option.feedback} onChange={(event) => onChange({ options: replaceAt(stage.options, index, { ...option, feedback: event.target.value }) })} />
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={option.isCorrect} onChange={(event) => onChange({ options: replaceAt(stage.options, index, { ...option, isCorrect: event.target.checked }) })} /> Correct</label>
    </div>)}
  </Collection>;
}

function SwipeEditor({ stage, onChange }: { stage: Extract<Stage, { type: "swipe" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">
    <Field label="Statement"><textarea value={stage.statement} onChange={(event) => onChange({ statement: event.target.value })} /></Field>
    <Field label="Card title"><input value={stage.card.title} onChange={(event) => onChange({ card: { ...stage.card, title: event.target.value } })} /></Field>
    <Field label="Card image URL"><input value={stage.card.image ?? ""} onChange={(event) => onChange({ card: { ...stage.card, image: event.target.value } })} /></Field>
    <Field label="Correct direction"><select value={stage.correctDirection} onChange={(event) => onChange({ correctDirection: event.target.value as "left" | "right" })}><option value="left">Left</option><option value="right">Right</option></select></Field>
    <Field label="Left label"><input value={stage.left.label} onChange={(event) => onChange({ left: { ...stage.left, label: event.target.value } })} /></Field>
    <Field label="Right label"><input value={stage.right.label} onChange={(event) => onChange({ right: { ...stage.right, label: event.target.value } })} /></Field>
    <Field label="Correct feedback"><textarea value={stage.feedback.correct} onChange={(event) => onChange({ feedback: { ...stage.feedback, correct: event.target.value } })} /></Field>
    <Field label="Incorrect feedback"><textarea value={stage.feedback.incorrect} onChange={(event) => onChange({ feedback: { ...stage.feedback, incorrect: event.target.value } })} /></Field>
  </div>;
}

function FillBlankEditor({ stage, onChange }: { stage: Extract<Stage, { type: "fill-blank" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="space-y-3"><Field label="Prompt (use {{b1}} placeholders)"><textarea value={stage.prompt} onChange={(event) => onChange({ prompt: event.target.value })} /></Field><Collection title="Blanks" onAdd={() => onChange({ blanks: [...stage.blanks, { id: `b${stage.blanks.length + 1}`, answer: "" }] })}>{stage.blanks.map((blank, index) => <div key={blank.id} className="grid gap-2 sm:grid-cols-2"><input value={blank.id} onChange={(event) => onChange({ blanks: replaceAt(stage.blanks, index, { ...blank, id: event.target.value }) })} /><input placeholder="Answer" value={blank.answer} onChange={(event) => onChange({ blanks: replaceAt(stage.blanks, index, { ...blank, answer: event.target.value }) })} /></div>)}</Collection><Collection title="Word options" onAdd={() => onChange({ options: [...stage.options, { id: `option-${stage.options.length + 1}`, word: "" }] })}>{stage.options.map((option, index) => <input key={option.id} value={option.word} onChange={(event) => onChange({ options: replaceAt(stage.options, index, { ...option, word: event.target.value }) })} />)}</Collection></div>;
}

function TimelineEditor({ stage, onChange }: { stage: Extract<Stage, { type: "timeline-builder" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="space-y-3"><Field label="Instructions"><textarea value={stage.instructions} onChange={(event) => onChange({ instructions: event.target.value })} /></Field><Collection title="Events" onAdd={() => onChange({ events: [...stage.events, { id: `event-${stage.events.length + 1}`, title: "", year: "", description: "", order: stage.events.length + 1 }] })}>{stage.events.map((event, index) => <div key={event.id} className="grid gap-2 sm:grid-cols-[1fr_120px_1fr_60px]"><input placeholder="Title" value={event.title} onChange={(e) => onChange({ events: replaceAt(stage.events, index, { ...event, title: e.target.value }) })} /><input placeholder="Year" value={event.year} onChange={(e) => onChange({ events: replaceAt(stage.events, index, { ...event, year: e.target.value }) })} /><input placeholder="Description" value={event.description} onChange={(e) => onChange({ events: replaceAt(stage.events, index, { ...event, description: e.target.value }) })} /><input type="number" value={event.order} onChange={(e) => onChange({ events: replaceAt(stage.events, index, { ...event, order: Number(e.target.value) }) })} /></div>)}</Collection></div>;
}

function ReorderEditor({ stage, onChange }: { stage: Extract<Stage, { type: "reorder" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="space-y-3"><Field label="Prompt"><textarea value={stage.prompt} onChange={(event) => onChange({ prompt: event.target.value })} /></Field><Collection title="Items" onAdd={() => onChange({ items: [...(stage.items ?? []), { id: `item-${(stage.items?.length ?? 0) + 1}`, label: "", order: (stage.items?.length ?? 0) + 1 }] })}>{(stage.items ?? []).map((item, index) => <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_80px]"><input value={item.label} onChange={(e) => onChange({ items: replaceAt(stage.items ?? [], index, { ...item, label: e.target.value }) })} /><input type="number" value={item.order} onChange={(e) => onChange({ items: replaceAt(stage.items ?? [], index, { ...item, order: Number(e.target.value) }) })} /></div>)}</Collection></div>;
}

function FourWayEditor({ stage, onChange }: { stage: Extract<Stage, { type: "four-way-swipe" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><input value={stage.category ?? ""} onChange={(e) => onChange({ category: e.target.value })} /></Field><Field label="Prompt"><input value={stage.prompt ?? ""} onChange={(e) => onChange({ prompt: e.target.value })} /></Field>{(["up", "down", "left", "right"] as const).map((direction) => <Field key={direction} label={`${direction} answer`}><input value={stage.answers[direction].label} onChange={(e) => onChange({ answers: { ...stage.answers, [direction]: { ...stage.answers[direction], label: e.target.value } } })} /></Field>)}<Field label="Correct direction"><select value={stage.correctDirection} onChange={(e) => onChange({ correctDirection: e.target.value as typeof stage.correctDirection })}>{["up", "down", "left", "right"].map((direction) => <option key={direction}>{direction}</option>)}</select></Field></div>;
}

function DragDropEditor({ stage, onChange }: { stage: Extract<Stage, { type: "drag-drop" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="space-y-3"><Field label="Prompt"><textarea value={stage.prompt} onChange={(e) => onChange({ prompt: e.target.value })} /></Field><Field label="Map title"><input value={stage.map.title} onChange={(e) => onChange({ map: { ...stage.map, title: e.target.value } })} /></Field><Collection title="Cards" onAdd={() => onChange({ cards: [...stage.cards, { id: `card-${stage.cards.length + 1}`, title: "" }] })}>{stage.cards.map((card, index) => <div key={card.id} className="grid gap-2 sm:grid-cols-[1fr_1fr]"><input placeholder="Card title" value={card.title} onChange={(e) => onChange({ cards: replaceAt(stage.cards, index, { ...card, title: e.target.value }) })} /><input placeholder="Image URL" value={card.image ?? ""} onChange={(e) => onChange({ cards: replaceAt(stage.cards, index, { ...card, image: e.target.value }) })} /></div>)}</Collection></div>;
}

function ClueConnectEditor({ stage, onChange }: { stage: Extract<Stage, { type: "clue-connect" }>; onChange: (changes: Partial<typeof stage>) => void }) {
  return <div className="space-y-3"><Field label="Prompt"><textarea value={stage.prompt} onChange={(e) => onChange({ prompt: e.target.value })} /></Field><Field label="Maximum mistakes"><input type="number" min="1" value={stage.maxMistakes ?? 3} onChange={(e) => onChange({ maxMistakes: Number(e.target.value) })} /></Field><Collection title="Cases" onAdd={() => onChange({ cases: [...stage.cases, { id: `case-${stage.cases.length + 1}`, category: "", answer: "", fact: "", clueSlots: [], clues: [] }] })}>{stage.cases.map((item, index) => <div key={item.id} className="grid gap-2 sm:grid-cols-3"><input placeholder="Category" value={item.category} onChange={(e) => onChange({ cases: replaceAt(stage.cases, index, { ...item, category: e.target.value }) })} /><input placeholder="Answer" value={item.answer} onChange={(e) => onChange({ cases: replaceAt(stage.cases, index, { ...item, answer: e.target.value }) })} /><input placeholder="Fact" value={item.fact} onChange={(e) => onChange({ cases: replaceAt(stage.cases, index, { ...item, fact: e.target.value }) })} /></div>)}</Collection></div>;
}

function Collection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return <section className="space-y-2"><div className="flex items-center justify-between"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6d6963]">{title}</p><button type="button" onClick={onAdd} className="text-xs font-extrabold underline">Add</button></div>{children}</section>;
}

function replaceAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => itemIndex === index ? value : item);
}