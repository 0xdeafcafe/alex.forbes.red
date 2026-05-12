import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { WordCard } from '../components/word-card.js';
import type { SiteData } from '../../lib/types.js';

export function WordsPage({ data }: { data: SiteData }): VNode {
  return html`
    <${Fragment}>
      <div class="page-watermark" aria-hidden="true">words</div>
      <h2 class="section-label-big">writing</h2>
      <div class="words-grid">
        ${data.words.map(w => html`<${WordCard} word=${w} />`)}
      </div>
    </${Fragment}>
  `;
}
