"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type InteractionState = Record<string, unknown>;

type Options<T extends InteractionState> = {
  defaultState: T;
  interactionState?: Partial<T>;                 // restored state, read once on mount
  onInteractionStateChange?: (state: T) => void; // engine saves it
  sanitize?: (raw: Partial<T>) => Partial<T>;    // clamp indexes, drop unknown ids
};

export function useInteractionProgress<T extends InteractionState>({
  defaultState,
  interactionState,
  onInteractionStateChange,
  sanitize,
}: Options<T>) {
  const defaultsRef = useRef(defaultState);

  const [state, setState] = useState<T>(() => {
    const saved = interactionState
      ? sanitize ? sanitize(interactionState) : interactionState
      : {};
    return { ...defaultState, ...saved };
  });

  const onChangeRef = useRef(onInteractionStateChange);
  useEffect(() => { onChangeRef.current = onInteractionStateChange; });

  // Notify the engine after a change, never inside an updater.
  // Skip the first run so restored state isn't echoed straight back.
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    onChangeRef.current?.(state);
  }, [state]);

  const update = useCallback(
    (patch: Partial<T> | ((prev: T) => Partial<T>)) =>
      setState((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) })),
    [],
  );

  const reset = useCallback(() => setState({ ...defaultsRef.current }), []);

  return [state, update, reset] as const;
}