// Smart-DJ strip tile (portrait, art-led).

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { formatFollowers, monogram } from '../format.js';
import { paletteFor } from '../palette.js';

export interface SmartTileItem {
  name: string;
  image?: string;
  url?: string;
  followers?: number;
  c1?: string;
  c2?: string;
}

export function SmartTile({ item }: { item: SmartTileItem }): VNode {
  const tag = item.url ? 'a' : 'div';
  const linkAttrs = item.url ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const pal = item.c1 ? { c1: item.c1, c2: item.c2! } : paletteFor(item.name || '');
  const cls = 'smart-tile' + (item.image ? ' has-art' : '');
  const meta = item.followers ? `${formatFollowers(item.followers)} FANS` : 'SMART DJ';
  return html`
    <${tag} ...${linkAttrs} class=${cls} style=${`--c1: ${pal.c1}; --c2: ${pal.c2}`}>
      ${item.image ? html`<img class="smart-tile-art" src=${item.image} alt=${item.name} loading="lazy" />` : null}
      <div class="smart-tile-mono">${monogram(item.name)}</div>
      <div class="smart-tile-body">
        <div class="smart-tile-name">${(item.name || '').toLowerCase()}</div>
        <div class="smart-tile-tag">${meta}</div>
      </div>
    </${tag}>
  `;
}
