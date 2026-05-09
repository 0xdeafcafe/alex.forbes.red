// Smart-DJ strip tile (portrait, art-led).

import { escapeHtml, formatFollowers, monogram } from '../format.js';
import { paletteFor } from '../palette.js';

export interface SmartTileItem {
  name: string;
  image?: string;
  url?: string;
  followers?: number;
  c1?: string;
  c2?: string;
}

export function smartTile(item: SmartTileItem): string {
  const isLink = !!item.url;
  const tag = isLink ? 'a' : 'div';
  const linkAttrs = isLink ? ` href="${escapeHtml(item.url!)}" target="_blank" rel="noopener noreferrer"` : '';
  const pal = item.c1 ? { c1: item.c1, c2: item.c2! } : paletteFor(item.name || '');
  const cls = 'smart-tile' + (item.image ? ' has-art' : '');
  const img = item.image
    ? `<img class="smart-tile-art" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">`
    : '';
  const meta = item.followers ? `${formatFollowers(item.followers)} FANS` : 'SMART DJ';
  return (
    `<${tag}${linkAttrs} class="${cls}" `
    + `style="--c1: ${pal.c1}; --c2: ${pal.c2}">`
    + img
    + `<div class="smart-tile-mono">${escapeHtml(monogram(item.name))}</div>`
    + `<div class="smart-tile-body">`
    +   `<div class="smart-tile-name">${escapeHtml((item.name || '').toLowerCase())}</div>`
    +   `<div class="smart-tile-tag">${escapeHtml(meta)}</div>`
    + `</div>`
    + `</${tag}>`
  );
}
