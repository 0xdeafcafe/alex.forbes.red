import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { PIVOTS, usePivot, type Pivot } from '../../state.js';

const LABELS: Record<Pivot, string> = {
  quickplay: 'QUICKPLAY',
  collection: 'COLLECTION',
  music: 'MUSIC',
  projects: 'PROJECTS',
  words: 'WORDS',
  photography: 'PHOTOGRAPHY',
};

export function PivotNav(): VNode {
  const { pivot, setPivot } = usePivot();
  return html`
    <div class="pivot-nav-wrap">
      <div class="pivot-strip" aria-hidden="true"></div>
      <nav class="pivot-nav" role="tablist">
        ${PIVOTS.map(p => html`
          <button
            class=${`pivot${p === pivot ? ' active' : ''}`}
            role="tab"
            onClick=${() => setPivot(p)}
          >${LABELS[p]}</button>
        `)}
      </nav>
    </div>
  `;
}
