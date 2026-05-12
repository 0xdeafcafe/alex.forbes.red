// Word card (Words page).

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import type { WordContent } from '../../lib/types.js';

export interface WordCardProps {
  word: WordContent;
}

export function WordCard({ word }: WordCardProps): VNode {
  return html`
    <a class="word-card" href=${word.url} target="_blank" rel="noopener noreferrer">
      <div class="word-source">${word.source}</div>
      <h3 class="word-title">${word.title}</h3>
      <span class="word-cta">read piece <i data-lucide="arrow-right" /></span>
    </a>
  `;
}
