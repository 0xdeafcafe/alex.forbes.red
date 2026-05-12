// Top-level <App /> — renders the entire body content and is used by both
// SSR (renderToString) and the client (hydrate). All interactive state
// lives in hooks/context; no module reaches into the DOM directly.

import { useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import {
  PivotContext, AccentContext,
  usePivotState, useAccentState,
  usePivot, usePivotKeyboard, usePivotLinks,
  type Pivot,
} from './state.js';
import { Ambient } from './render/components/ambient.js';
import { TileBg } from './render/components/tile-bg.js';
import { ChromeBar } from './render/components/chrome-bar.js';
import { PivotNav } from './render/components/pivot-nav.js';
import { LastSpun } from './render/components/last-spun.js';
import { QuickplayPage } from './render/pages/quickplay.js';
import { CollectionPage } from './render/pages/collection.js';
import { MusicPage } from './render/pages/music.js';
import { ProjectsPage } from './render/pages/projects.js';
import { WordsPage } from './render/pages/words.js';
import { PhotographyPage } from './render/pages/photography.js';
import type { SiteData } from './lib/types.js';

// Only the active pivot renders its body. Inactive sections stay as empty
// shells so per-route HTML ships just one page's content — the next page's
// content materialises client-side when the user navigates to it.
function PivotPage({ name, children }: { name: Pivot; children: VNode | VNode[] }): VNode {
  const { pivot } = usePivot();
  const active = pivot === name;
  return html`
    <section class=${`pivot-page${active ? ' active' : ''}`} data-page=${name} role="tabpanel">
      ${active ? children : null}
    </section>
  `;
}

function Pages({ data }: { data: SiteData }): VNode {
  const { pivot } = usePivot();
  usePivotKeyboard();
  usePivotLinks();
  // Lucide swaps <i data-lucide="..."> for inline SVG. Re-run whenever the
  // pivot changes so newly-mounted icons get hydrated.
  useEffect(() => { window.lucide?.createIcons(); }, [pivot]);
  return html`
    <main class="pivot-pages">
      <${PivotPage} name="quickplay"><${QuickplayPage} data=${data} /></${PivotPage}>
      <${PivotPage} name="collection"><${CollectionPage} /></${PivotPage}>
      <${PivotPage} name="music"><${MusicPage} data=${data} /></${PivotPage}>
      <${PivotPage} name="projects"><${ProjectsPage} data=${data} /></${PivotPage}>
      <${PivotPage} name="words"><${WordsPage} data=${data} /></${PivotPage}>
      <${PivotPage} name="photography"><${PhotographyPage} data=${data} /></${PivotPage}>
    </main>
  `;
}

export function App({ data, initialPivot }: { data: SiteData; initialPivot?: Pivot }): VNode {
  const pivotCtx = usePivotState(initialPivot);
  const accentCtx = useAccentState();
  return html`
    <${PivotContext.Provider} value=${pivotCtx}>
      <${AccentContext.Provider} value=${accentCtx}>
        <${Ambient} />
        <${TileBg} data=${data} />
        <div class="vignette" aria-hidden="true"></div>
        <div class="grain" aria-hidden="true"></div>
        <div class="app">
          <${ChromeBar} />
          <${PivotNav} />
          <${Pages} data=${data} />
        </div>
        <${LastSpun} data=${data} />
      </${AccentContext.Provider}>
    </${PivotContext.Provider}>
  `;
}
