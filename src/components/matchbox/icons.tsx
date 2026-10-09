const FLAME = 'M12 1c1 6 9 9 9 17a9 9 0 0 1-18 0c0-4 2-6 4-8 0 3 1 4 3 4-1-5 0-9 2-13z';

/** Small flame used in the library rows (struck = red). */
export function FlameRed({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 28" width="14" height="16" aria-hidden="true">
      <path d={FLAME} strokeWidth={2.2} style={{ fill: on ? 'var(--mb-red)' : 'none', stroke: on ? 'var(--mb-ink)' : 'color-mix(in srgb,var(--mb-ink) 35%,transparent)' }} />
    </svg>
  );
}

/** Flame used on the "recently struck" cards. */
export function FlameLight({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 28" width="15" height="17" aria-hidden="true" opacity={on ? 1 : 0.6}>
      <path d={FLAME} strokeWidth={2.2} style={{ fill: on ? 'var(--mb-lyel)' : 'none', stroke: on ? 'var(--mb-ink)' : 'currentColor' }} />
    </svg>
  );
}

/** Weekly streak flame (outer + inner). */
export function StreakFlame({ cls }: { cls: string }) {
  return (
    <svg className={cls} style={{ ['--r' as string]: '0deg' }} viewBox="0 0 24 28" aria-hidden="true">
      <path className="o" d={FLAME} />
      <path className="i" d="M12 14c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1 1 2 2 2z" />
    </svg>
  );
}

export function MatchHead({ burnt }: { burnt: boolean }) {
  return <div className={`hm ${burnt ? 'burnt' : ''}`}><span className="hd" /><span className="sh" /></div>;
}

export function CatBadge() {
  return (
    <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
      <path d="M7 5L15 11H25L33 5V23A13 11 0 0 1 7 23Z" style={{ fill: 'var(--mb-ink)' }} />
      <circle cx="15" cy="21" r="2.4" style={{ fill: 'var(--mb-cream)' }} />
      <circle cx="25" cy="21" r="2.4" style={{ fill: 'var(--mb-cream)' }} />
      <path d="M18 27h4l-2 2.5z" style={{ fill: 'var(--mb-red)' }} />
    </svg>
  );
}

const nav = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
export const NavToday = () => (<svg {...nav}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></svg>);
export const NavLibrary = () => (<svg {...nav}><path d="M2 5c4-1 7 0 10 2 3-2 6-3 10-2v14c-4-1-7 0-10 2-3-2-6-3-10-2zM12 7v14" /></svg>);
export const NavProfile = () => (<svg {...nav}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 4-7 8-7s7 2 8 7" /></svg>);
