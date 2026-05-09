// Word card (Words page).

import { escapeHtml } from '../format.js';
import type { WordContent } from '../../lib/types.js';

export function wordCard(word: WordContent): string {
  return (
    `<a class="word-card" href="${escapeHtml(word.url)}" target="_blank" rel="noopener noreferrer">`
    + `<div class="word-source">${escapeHtml(word.source)}</div>`
    + `<h3 class="word-title">${escapeHtml(word.title)}</h3>`
    + `<span class="word-cta">read piece <i data-lucide="arrow-right"></i></span>`
    + `</a>`
  );
}
