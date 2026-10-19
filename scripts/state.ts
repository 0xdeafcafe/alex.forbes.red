// Shared state hooks + contexts. Top-level <App /> owns pivot + accent
// state and provides it via context; nested components read/set through
// `usePivot()` and `useAccent()` without prop drilling.

import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';

export const PIVOTS = ['quickplay', 'collection', 'music', 'projects', 'words', 'photography'] as const;
export const ZUNE_PIVOTS = ['quickplay', 'music', 'collection'] as const;
export const isExplorerPivot = (p: Pivot): boolean => p === 'projects' || p === 'words';
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
  forward: () => void;
  canGoForward: boolean;
  navigationKey: number;
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
  forward: () => {},
  canGoForward: false,
  navigationKey: 0,
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
  const [navigationKey, setNavigationKey] = useState(0);
  const furthest = useRef(0);

  useEffect(() => {
    const index = Number.isInteger(history.state?.afrIndex) ? history.state.afrIndex : 0;
    history.replaceState({ ...history.state, afrIndex: index }, '');
    setDepth(index); furthest.current = index;
    const onPop = () => {
      setNavigationKey(k => k + 1);
      setInternal(pivotFromPath(location.pathname) ?? DEFAULT_PIVOT);
      const next = Number.isInteger(history.state?.afrIndex) ? history.state.afrIndex : 0;
      furthest.current = Math.max(furthest.current, next);
      setDepth(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setPivot = useCallback((target: Pivot) => {
    setNavigationKey(k => k + 1);
    if (pivotFromPath(location.pathname) !== target || history.state?.afrPhone) {
      const index = (Number.isInteger(history.state?.afrIndex) ? history.state.afrIndex : 0) + 1;
      history.pushState({ afrIndex: index }, '', pathForPivot(target));
      furthest.current = index;
      setDepth(index);
    }
    setInternal(target);
  }, []);

  const back = useCallback(() => { if (depth > 0) history.back(); }, [depth]);
  const forward = useCallback(() => { if (depth < furthest.current) history.forward(); }, [depth]);
  return { pivot, setPivot, back, forward, canGoBack: depth > 0, canGoForward: depth < furthest.current, navigationKey };
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
