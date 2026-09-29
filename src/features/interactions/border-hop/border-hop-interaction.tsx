"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { BorderHopStage } from "@/types/gameplay";
import { useInteractionProgress } from "@/features/gameplay/progress/use-interaction-progress";
import { BorderHopMap } from "./border-hop-map";
import { countryNames } from "./world-map";
import { countryAliases, guessCountry, initialRoute, resolveCountry, shortestPath, validateRoute, type RouteState } from "./border-hop-rules";
import styles from "./border-hop.module.css";

// Everything the user would be upset to lose. Must stay JSON-serializable.
type BorderHopState = {
  route: RouteState;   // path, guesses, result
  revealed: string[];  // countries outlined on the map by hints
  usedHints: string[]; // `${country}:${kind}` keys already spent
  gaveUp: boolean;
};

// One Hint button, escalating per stop: first letter, next-country outline, full route.
const HINT_ORDER = ["letter", "outline", "route"] as const;
type HintKind = (typeof HINT_ORDER)[number];

type Props = {
  stage: BorderHopStage;
  disabled?: boolean;
  attemptsRemaining?: number;
  showIntro: boolean;
  onIntroComplete: () => void;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  hintsRemaining?: number;
  onUseHint?: () => void;
  interactionState?: Record<string, unknown>;
  onInteractionStateChange?: (state: Record<string, unknown>) => void;
};

export function BorderHopInteraction({
  stage, disabled, attemptsRemaining, showIntro, onIntroComplete, onAnswer,
  hintsRemaining = 0, onUseHint, interactionState, onInteractionStateChange,
}: Props) {
  const config = useMemo(() => validateRoute(stage), [stage]);

  // Runs once on mount (the hook reads restored state only then).
  const sanitize = (raw: Partial<BorderHopState>): Partial<BorderHopState> => {
    const route = raw.route;
    const validRoute =
      !!route &&
      Array.isArray(route.path) &&
      route.path.length > 0 &&
      route.path[0] === config.start &&
      Array.isArray(route.guesses);
    if (!validRoute) return {};
    // A lost or given-up attempt already cost a heart. Start a fresh route,
    // exactly what Retry would do, so the user is never stuck on a locked board.
    if (raw.gaveUp || route.result === "lost") return {};
    const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
    return {
      route,
      revealed: strings(raw.revealed),
      usedHints: strings(raw.usedHints),
      gaveUp: false,
    };
  };

  const [gameState, update] = useInteractionProgress<BorderHopState>({
    defaultState: { route: initialRoute(config), revealed: [], usedHints: [], gaveUp: false },
    interactionState: interactionState as Partial<BorderHopState> | undefined,
    onInteractionStateChange: onInteractionStateChange as ((s: BorderHopState) => void) | undefined,
    sanitize,
  });
  const { route: state, revealed, usedHints, gaveUp } = gameState;

  // Guards, re-derived from restored state so a finished attempt can't report twice.
  const reported = useRef(state.result !== null || gaveUp);
  const hintKeys = useRef(new Set<string>(usedHints));

  // Transient UI: not saved.
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const current = state.path[state.path.length - 1];
  const heartsRemaining = attemptsRemaining ?? stage.attemptsAllowed;
  const locked = !!disabled || state.result !== null || gaveUp || heartsRemaining <= 0;
  const remainingPath = shortestPath(current, config.target, state.path.slice(0, -1));
  const hintBudget = Math.max(0, Math.min(hintsRemaining, config.hintsAllowed - usedHints.length));
  const nextHint: HintKind | undefined = HINT_ORDER.find((kind) => !usedHints.includes(`${current}:${kind}`));
  const hintDisabled = locked || !onUseHint || hintBudget <= 0 || !remainingPath || remainingPath.length < 2 || !nextHint;
  // Derived, so it survives a refresh without being saved.
  const letterHint =
    usedHints.includes(`${current}:letter`) && remainingPath && remainingPath.length >= 2
      ? `Next country starts with “${remainingPath[1][0]}”.`
      : "";
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
    const guessed = guessCountry(state, name, config);
    const guessedLast = guessed.guesses[guessed.guesses.length - 1];
    // If the country just reached borders the destination, the route is
    // complete: add the target as the final hop so the player doesn't have to type it.
    // (Checked even on the last allowed guess, since the border was reached.)
    const borderReached =
      guessed.result !== "won" &&
      guessedLast.correct &&
      shortestPath(name, config.target, guessed.path.slice(0, -1))?.length === 2;
    const next: RouteState = borderReached
      ? { ...guessed, path: [...guessed.path, config.target], result: "won" as const }
      : guessed;
    const lastGuess = next.guesses[next.guesses.length - 1];
    const lastMessage = borderReached ? `${name} borders ${config.target}. Route complete!` : lastGuess.message;
    setMessage(lastMessage);
    setQuery("");
    setSuggestionsOpen(false);
    setActive(-1);
    if (next.result === "won") {
      reported.current = true;
      update({ route: next });
      onAnswer({ correct: true, feedback: stage.feedback?.correct ?? `You reached ${config.target} in ${next.path.length - 1} hops. Shortest possible: ${config.path.length - 1}.` });
    } else if (!lastGuess.correct || next.result === "lost") {
      // One failed attempt costs one engine heart. Lock immediately until
      // Retry remounts this interaction with a fresh route.
      reported.current = true;
      update({ route: { ...next, result: "lost" } });
      const reason = lastGuess.correct
        ? `You used all ${config.maxGuesses} guesses before reaching ${config.target}.`
        : lastMessage;
      onAnswer({ correct: false, feedback: `${reason} ${stage.feedback?.incorrect ?? "Try another route."}`.trim() });
    } else {
      update({ route: next });
    }
  }

  function handleHint() {
    if (locked || reported.current || !onUseHint || hintBudget <= 0 || !remainingPath || remainingPath.length < 2) return;
    // Read the ref so a fast double tap can't spend two hints on the same step.
    const kind = HINT_ORDER.find((k) => !hintKeys.current.has(`${current}:${k}`));
    if (!kind) return;
    hintKeys.current.add(`${current}:${kind}`);
    onUseHint();
    if (kind === "letter") {
      setMessage(`Next country starts with “${remainingPath[1][0]}”.`);
      update({ usedHints: [...hintKeys.current] });
    } else {
      const names = kind === "route" ? remainingPath.slice(1) : [remainingPath[1]];
      setMessage(kind === "route" ? "A remaining route is outlined in purple." : "The next country is outlined in purple.");
      update((prev) => ({
        revealed: [...new Set([...prev.revealed, ...names])],
        usedHints: [...hintKeys.current],
      }));
    }
  }

  function handleGiveUp() {
    if (locked || reported.current) return;
    reported.current = true;
    update({ gaveUp: true });
    onAnswer({ correct: false, feedback: `Attempt ended. One route: ${config.path.join(" → ")}.` });
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
        <span>Hearts: <strong className={styles.lives}>{heartsRemaining}</strong></span>
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
      {/* Live message line: plain text under the route panel, no extra card. */}
      <div className="mx-auto mt-3 w-full max-w-[380px] px-2 text-center">
        <p className={styles.message} role="status" aria-live="polite">{message || letterHint || (state.result === "won" ? "Route complete!" : locked ? "Attempt ended." : "")}</p>
        {!locked && !remainingPath && <p className={styles.warning}>This route is a dead end without revisiting a country. Use the remaining guesses or give up this attempt.</p>}
      </div>

      {/* Action bar, same pattern as fill-blank-text: pinned to the bottom, Hint on the left, Give up as a quiet link on the right. */}
      <div className="sticky bottom-0 z-20 mx-auto mt-4 flex w-full max-w-[380px] items-center justify-between gap-3 border-t-[3px] border-[#2B2A25] bg-[#FDF9F1] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={handleHint}
          disabled={hintDisabled}
          aria-label={
            nextHint === "route" ? "Hint: outline the remaining route on the map"
              : nextHint === "outline" ? "Hint: outline the next country on the map"
                : "Hint: reveal the first letter of the next country"
          }
          className="relative flex h-12 items-center gap-2 rounded-full border-[3px] border-[#2B2A25] bg-[#FFFDF7] px-6 text-[15px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:translate-y-0.5 active:shadow-[0_2px_0_#2B2A25] disabled:opacity-50"
        >
          <span aria-hidden="true">💡</span>
          Hint
          {hintBudget > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2B2A25] bg-[#E8933A] text-[10px] font-extrabold text-white">
              {hintBudget}
            </span>
          )}
        </button>
        <button
          type="button"
          disabled={locked}
          onClick={handleGiveUp}
          className="text-right text-[13px] font-bold leading-tight text-[#8a8878] underline underline-offset-2 disabled:opacity-40"
        >
          Give up this attempt
          <span className="block text-[11px] font-semibold no-underline">(costs 1 heart)</span>
        </button>
      </div>
      <footer className={styles.footer}>Land-border hops only • No sea crossings. Simplified boundaries for gameplay purposes, not a statement of political status.</footer>
    </section>
  );
}