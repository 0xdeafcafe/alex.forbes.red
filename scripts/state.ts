// Shared state hooks + contexts. Top-level <App /> owns pivot + accent
// state and provides it via context; nested components read/set through
// `usePivot()` and `useAccent()` without prop drilling.

import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';

export const PIVOTS = ['quickplay', 'collection', 'music', 'projects', 'words', 'photography'] as const;
export type Pivot = typeof PIVOTS[number];
export const DEFAULT_PIVOT: Pivot = 'quickplay';

// URL <-> pivot mapping. `/` is the default route (quickplay), every other
// pivot lives at `/<pivot>` (rendered as `<pivot>/index.html` at build).
export function pivotFromPath(pathname: string): Pivot | null {
  const stripped = pathname.replace(/\/+$/, '').replace(/^\/+/, '');
  if (!stripped) return DEFAULT_PIVOT;
  return (PIVOTS as readonly string[]).includes(stripped) ? stripped as Pivot : null;
}

export function pathForPivot(p: Pivot): string {
  return p === DEFAULT_PIVOT ? '/' : `/${p}`;
}

export const ACCENTS = ['zune', 'magenta', 'orange', 'lime', 'cyan'] as const;
export type Accent = typeof ACCENTS[number];
export const DEFAULT_ACCENT: Accent = 'zune';
const ACCENT_STORAGE_KEY = 'afr-accent';

interface PivotCtx {
  pivot: Pivot;
  setPivot: (p: Pivot) => void;
  back: () => void;
  canGoBack: boolean;
}

interface AccentCtx {
  accent: Accent;
  cycle: () => void;
}

export const PivotContext = createContext<PivotCtx>({
  pivot: DEFAULT_PIVOT,
  setPivot: () => {},
  back: () => {},
  canGoBack: false,
});

export const AccentContext = createContext<AccentCtx>({
  accent: DEFAULT_ACCENT,
  cycle: () => {},
});

const isAccent = (s: string | null | undefined): s is Accent =>
  !!s && (ACCENTS as readonly string[]).includes(s);

export function usePivot(): PivotCtx { return useContext(PivotContext); }
export function useAccent(): AccentCtx { return useContext(AccentContext); }

// Backing state for the PivotContext provider. Owns path + history side
// effects so consumers see a clean { pivot, setPivot, back } API.
//
// `initial` is supplied at SSR time (the route being pre-rendered). On the
// client the lazy initializer reads location.pathname so hydration sees the
// same pivot the server rendered.
export function usePivotState(initial?: Pivot): PivotCtx {
  const [pivot, setInternal] = useState<Pivot>(() => {
    if (initial) return initial;
    if (typeof window !== 'undefined') return pivotFromPath(window.location.pathname) ?? DEFAULT_PIVOT;
    return DEFAULT_PIVOT;
  });
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    const onPop = () => {
      setInternal(pivotFromPath(location.pathname) ?? DEFAULT_PIVOT);
      setDepth(d => Math.max(0, d - 1));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setPivot = useCallback((target: Pivot) => {
    setInternal(prev => {
      if (prev === target) return prev;
      const path = pathForPivot(target);
      if (location.pathname !== path) history.pushState(null, '', path);
      setDepth(d => d + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return target;
    });
  }, []);

  const back = useCallback(() => { if (depth > 0) history.back(); }, [depth]);

  return { pivot, setPivot, back, canGoBack: depth > 0 };
}

export function useAccentState(): AccentCtx {
  const [accent, setAccent] = useState<Accent>(() => {
    if (typeof window === 'undefined') return DEFAULT_ACCENT;
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
      return isAccent(saved) ? saved : DEFAULT_ACCENT;
    } catch { return DEFAULT_ACCENT; }
  });

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    try { localStorage.setItem(ACCENT_STORAGE_KEY, accent); } catch { /* noop */ }
  }, [accent]);

  const cycle = useCallback(() => {
    setAccent(a => ACCENTS[(ACCENTS.indexOf(a) + 1) % ACCENTS.length]);
  }, []);

  return { accent, cycle };
}

// Keyboard left/right cycles pivots, ignoring inputs and browser-back combos.
export function usePivotKeyboard(): void {
  const { pivot, setPivot } = usePivot();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const tag = document.activeElement?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      const idx = PIVOTS.indexOf(pivot);
      const next = e.key === 'ArrowRight'
        ? (idx + 1) % PIVOTS.length
        : (idx - 1 + PIVOTS.length) % PIVOTS.length;
      setPivot(PIVOTS[next]);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pivot, setPivot]);
}

// Any `<a href="/<pivot>">` becomes a SPA pivot switch. Lets in-content
// links live as plain anchors that still work pre-hydration (browser-native
// nav as fallback) and SPA-switch once the client has booted.
export function usePivotLinks(): void {
  const { setPivot } = usePivot();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      const href = a.getAttribute('href') ?? '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      const path = href.split('?')[0].split('#')[0];
      const target = pivotFromPath(path);
      if (!target) return;
      e.preventDefault();
      setPivot(target);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [setPivot]);
}

declare global {
  interface Window { lucide?: { createIcons: () => void } }
}
