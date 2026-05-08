// Word card (Words page).

import { escapeHtml } from '../lib/format.js';

export function makeWordCard(word) {
  const el = document.createElement('a');
  el.href = word.url;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
  el.className = 'word-card';
  el.innerHTML = `
    <div class="word-source">${escapeHtml(word.source)}</div>
    <h3 class="word-title">${escapeHtml(word.title)}</h3>
    <span class="word-cta">read piece <i data-lucide="arrow-right"></i></span>
  `;
  return el;
}
