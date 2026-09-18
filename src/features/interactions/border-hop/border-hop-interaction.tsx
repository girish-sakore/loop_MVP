"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { BorderHopStage } from "@/types/gameplay";
import { BorderHopMap } from "./border-hop-map";
import { countryNames } from "./world-map";
import { countryAliases, guessCountry, initialRoute, resolveCountry, shortestPath, validateRoute, type RouteState } from "./border-hop-rules";
import styles from "./border-hop.module.css";

type Props = {
  stage: BorderHopStage;
  disabled?: boolean;
  attemptsRemaining?: number;
  showIntro: boolean;
  onIntroComplete: () => void;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
};

export function BorderHopInteraction({ stage, disabled, attemptsRemaining, showIntro, onIntroComplete, onAnswer, hintsRemaining = 0, onUseHint }: Props) {
  const config = useMemo(() => validateRoute(stage), [stage]);
  const [submitted, setSubmitted] = useState(() => ({ key: stage.id, state: initialRoute(config) }));
  const state: RouteState = submitted.key === stage.id ? submitted.state : initialRoute(config);
  const reported = useRef(false);
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState("");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [usedHints, setUsedHints] = useState<string[]>([]);
  const [gaveUp, setGaveUp] = useState(false);
  const hintKeys = useRef(new Set<string>());
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const current = state.path[state.path.length - 1];
  const heartsRemaining = attemptsRemaining ?? stage.attemptsAllowed;
  const locked = !!disabled || state.result !== null || gaveUp || heartsRemaining <= 0;
  const remainingPath = shortestPath(current, config.target, state.path.slice(0, -1));
  const hintBudget = Math.max(0, Math.min(hintsRemaining, config.hintsAllowed - usedHints.length));
  const q = query.trim().toLowerCase();
  const matches = q ? countryNames.filter((name) => name.toLowerCase().includes(q) || Object.entries(countryAliases).some(([alias, canonical]) => canonical === name && alias.toLowerCase().includes(q))).slice(0, 8) : [];
  const open = suggestionsOpen && matches.length > 0 && !locked;

  function select(name: string) {
    setQuery(name);
    setSuggestionsOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function submit() {
    if (locked || reported.current) return;
    const name = resolveCountry(query, countryNames);
    if (!name) { setMessage("Choose a country from the suggestions — unrecognized picks are free."); return; }
    const next = guessCountry(state, name, config);
    setSubmitted({ key: stage.id, state: next });
    const lastMessage = next.guesses[next.guesses.length - 1].message;
    setMessage(lastMessage);
    setQuery("");
    setSuggestionsOpen(false);
    setActive(-1);
    if (next.result === "won") {
      reported.current = true;
      onAnswer({ correct: true, feedback: stage.feedback?.correct ?? `You reached ${config.target} in ${next.path.length - 1} hops. Shortest possible: ${config.path.length - 1}.` });
    } else if (!next.guesses[next.guesses.length - 1].correct || next.result === "lost") {
      // One failed attempt costs one engine heart. Lock immediately until
      // Retry remounts this interaction with a fresh route.
      reported.current = true;
      setSubmitted({ key: stage.id, state: { ...next, result: "lost" } });
      const reason = next.guesses[next.guesses.length - 1].correct
        ? `You used all ${config.maxGuesses} guesses before reaching ${config.target}.`
        : lastMessage;
      onAnswer({ correct: false, feedback: `${reason} ${stage.feedback?.incorrect ?? "Try another route."}`.trim() });
    }
  }

  function hint(kind: "outline" | "all" | "initial") {
    const key = `${current}:${kind}`;
    if (locked || reported.current || !onUseHint || hintBudget <= 0 || !remainingPath || remainingPath.length < 2 || hintKeys.current.has(key)) return;
    hintKeys.current.add(key);
    setUsedHints([...hintKeys.current]);
    onUseHint();
    if (kind === "initial") setMessage(`Next country starts with “${remainingPath[1][0]}”.`);
    else {
      const names = kind === "all" ? remainingPath.slice(1) : [remainingPath[1]];
      setRevealed((old) => [...new Set([...old, ...names])]);
      setMessage(kind === "all" ? "A remaining route is outlined in purple." : "The next country is outlined in purple.");
    }
  }

  if (showIntro) return (
    <section className={`${styles.game} ${styles.intro}`}>
      <span className={styles.eyebrow}>{stage.introLabel ?? "A little geography. A big journey."}</span>
      <span className={styles.introIcon} aria-hidden="true">◎</span>
      <h1>Border Hop</h1>
      <p>Get from <strong>{config.start}</strong> to <strong>{config.target}</strong>, one land border at a time.</p>
      <ul><li>Type a country bordering your current stop. No sea crossings or revisits.</li><li>Reach the destination within {config.maxGuesses} guesses. A wrong pick, running out of guesses, or giving up costs one heart.</li><li>You have {heartsRemaining} {heartsRemaining === 1 ? "heart" : "hearts"} left. Retry starts a fresh route. Hints are shared across retries and routes.</li></ul>
      <button type="button" className={styles.primary} disabled={locked} onClick={onIntroComplete}>Let’s cross some borders →</button>
    </section>
  );

  const lastGuess = state.guesses[state.guesses.length - 1];
  return (
    <section className={styles.game}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Border Hop <span>THE WORLD IS CONNECTED</span></p>
        <h1><span className={styles.from}>{config.start}</span> to <span className={styles.to}>{config.target}</span></h1>
        <p>{stage.prompt ?? stage.question}</p>
      </header>
      <BorderHopMap start={config.start} target={config.target} route={state.path} hints={revealed} wrong={lastGuess && !lastGuess.correct ? lastGuess.name : undefined} />
      <div className={styles.status} aria-label="Route progress">
        <span><i className={styles.hopDot} aria-hidden="true" />Hops: <strong className={styles.counter}>{state.path.length - 1}</strong></span>
        <span>Guesses: <strong className={styles.counter}>{state.guesses.length}<span>/{config.maxGuesses}</span></strong></span>
        <span>Hints: <strong className={styles.lives}>{heartsRemaining}</strong></span>
      </div>

      <div className={styles.panel}>
        <form className={styles.guessRow} onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <div className={styles.inputWrap} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false); }}>
            <label className={styles.srOnly} htmlFor={`${listId}-input`}>Name a country bordering {current}</label>
            <input ref={inputRef} id={`${listId}-input`} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} autoComplete="off" disabled={locked} value={query} placeholder="Name a bordering country…"
              onFocus={() => setSuggestionsOpen(true)}
              onChange={(event) => { setQuery(event.target.value); setActive(-1); setSuggestionsOpen(true); }}
              onKeyDown={(event) => {
                if (event.key === "Escape") { setSuggestionsOpen(false); setActive(-1); }
                else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault(); setSuggestionsOpen(true);
                  setActive((old) => Math.max(0, Math.min(matches.length - 1, old + (event.key === "ArrowDown" ? 1 : -1))));
                } else if (event.key === "Enter" && open && active >= 0 && matches[active]) { event.preventDefault(); select(matches[active]); }
              }} />
            {open && <ul id={listId} role="listbox" className={styles.autocomplete}>{matches.map((name, i) => <li id={`${listId}-${i}`} key={name} role="option" aria-selected={i === active} className={i === active ? styles.active : ""} onPointerDown={(e) => e.preventDefault()} onClick={() => select(name)}>{name}</li>)}</ul>}
          </div>
          <button className={`${styles.primary} ${styles.hopButton}`} disabled={locked || !query.trim()}>Hop <span aria-hidden="true">→</span></button>
        </form>
        <h2>Current route:</h2>
        <ol className={styles.trail} aria-label="Current route">
          {state.path.map((name, i) => <li key={name}>
            {i > 0 && <span className={styles.routeArrow} aria-hidden="true">→</span>}
            <span className={`${styles.routeChip} ${name === config.start ? styles.startChip : name === config.target ? styles.goalChip : styles.visitedChip}`}>
              {name === config.start && <span aria-hidden="true">● </span>}{name}
            </span>
          </li>)}
          {!locked && <li><span className={styles.routeArrow} aria-hidden="true">→</span><span className={styles.nextChip}>? Next<br />Border</span></li>}
          {current !== config.target && <li><span className={styles.routeArrow} aria-hidden="true">···</span><span className={`${styles.routeChip} ${styles.goalChip}`}><span aria-hidden="true">⚑ </span>{config.target}</span></li>}
        </ol>

      </div>
      <section className={styles.routeCard}>
        <p className={styles.message} role="status" aria-live="polite">{message || (state.result === "won" ? "Route complete!" : locked ? "Attempt ended." : "")}</p>
        {!locked && !remainingPath && <p className={styles.warning}>This route is a dead end without revisiting a country. Use the remaining guesses or give up this attempt.</p>}
        <div className={styles.hintSection}>
          <div className={styles.hintHeading}><h2>Need a nudge? ({hintBudget} {hintBudget === 1 ? "hint" : "hints"}):</h2><span>Free helpers</span></div>
          <div className={styles.hints}>{([
            ['outline', 'Next Outline', '🗺️', 'Show next country outline'],
            ['all', 'Full Route', '🧭', 'Show full route outline'],
            ['initial', 'First Letter', '🔤', 'Show next country’s initial'],
          ] as const).map(([kind, label, icon, accessibleLabel]) => <button type="button" key={kind} aria-label={accessibleLabel} disabled={locked || !onUseHint || hintBudget <= 0 || !remainingPath || usedHints.includes(`${current}:${kind}`)} onClick={() => hint(kind)}><span className={styles.hintIcon} aria-hidden="true">{icon}</span><span>{label}</span></button>)}</div>
        </div>
        <button className={styles.giveUp} type="button" disabled={locked} onClick={() => {
          if (locked || reported.current) return;
          reported.current = true;
          setGaveUp(true);
          onAnswer({ correct: false, feedback: `Attempt ended. One route: ${config.path.join(" → ")}.` });
        }}>Give up this attempt <span>(costs 1 hint)</span></button>
      </section>
      <footer className={styles.footer}>Land-border hops only • No sea crossings. Simplified boundaries for gameplay purposes, not a statement of political status.</footer>
    </section>
  );
}
