import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { ZUNE_PIVOTS, usePivot } from '../../state.js';

const LABELS = { quickplay: 'quickplay', music: 'music', collection: 'collection' };

export function PivotNav(): VNode {
  const { pivot, setPivot } = usePivot();
  const selected = pivot;
  return html`<div class="pivot-nav-wrap">
    <div class="pivot-strip" aria-hidden="true"></div>
    <nav class="pivot-nav" role="tablist" aria-label="Alex collection"
      onKeyDown=${(e: KeyboardEvent) => {
        const idx = ZUNE_PIVOTS.findIndex(p => p === selected);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : e.key === 'ArrowRight' ? (idx + 1) % 3 : e.key === 'ArrowLeft' ? (idx + 2) % 3 : -1;
        if (next < 0 || e.altKey || e.metaKey || e.ctrlKey) return;
        e.preventDefault(); setPivot(ZUNE_PIVOTS[next]);
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
      }}>
      ${ZUNE_PIVOTS.map(p => html`<button id=${`tab-${p}`} class=${`pivot${p === selected ? ' active' : ''}`}
        role="tab" aria-selected=${p === selected} tabIndex=${p === selected ? 0 : -1}
        aria-controls=${`panel-${p}`}
        onClick=${() => setPivot(p)}>${LABELS[p]}</button>`)}
    </nav>
  </div>`;
}
