// Smart-DJ strip tile (portrait, art-led).
// Used for top artists when stats.fm data is present, or albums as fallback.

import { escapeHtml, monogram, formatFollowers } from '../lib/format.js';
import { paletteFor } from '../lib/palette.js';

export function makeSmartTile(item) {
  const tag = item.url ? 'a' : 'div';
  const el = document.createElement(tag);
  if (item.url) {
    el.href = item.url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  const pal = item.c1 ? { c1: item.c1, c2: item.c2 } : paletteFor(item.name || '');
  el.className = 'smart-tile' + (item.image ? ' has-art' : '');
  el.style.setProperty('--c1', pal.c1);
  el.style.setProperty('--c2', pal.c2);
  const imgHtml = item.image
    ? `<img class="smart-tile-art" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">`
    : '';
  const meta = item.followers ? `${formatFollowers(item.followers)} FANS` : 'SMART DJ';
  el.innerHTML = `
    ${imgHtml}
    <div class="smart-tile-mono">${escapeHtml(monogram(item.name))}</div>
    <div class="smart-tile-body">
      <div class="smart-tile-name">${escapeHtml((item.name || '').toLowerCase())}</div>
      <div class="smart-tile-tag">${escapeHtml(meta)}</div>
    </div>
  `;
  return el;
}
