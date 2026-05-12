// "Now/recently played" row used in two places: stats.fm recent feed, and
// SoundCloud likes feed. Same shape, different data sources.

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { relativeTime } from '../format.js';
import { paletteFor } from '../palette.js';

export interface RecentRowProps {
  url?: string;
  title: string;
  subtitle: string;
  coverUrl?: string;
  timestamp?: string;
  paletteSeed: string;
  index?: number;
}

export function RecentRow({
  url, title, subtitle, coverUrl, timestamp, paletteSeed, index = 0,
}: RecentRowProps): VNode {
  const pal = paletteFor(paletteSeed);
  const tag = url ? 'a' : 'div';
  const linkAttrs = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};
  return html`
    <${tag} ...${linkAttrs} class="recent-row" style=${`animation-delay: ${index * 20}ms`}>
      <div class="recent-art" style=${`background: linear-gradient(135deg, ${pal.c1}, ${pal.c2});`}>
        ${coverUrl ? html`<img src=${coverUrl} alt="" loading="lazy" />` : null}
      </div>
      <div class="recent-info">
        <div class="recent-track">${title}</div>
        <div class="recent-artist">${subtitle}</div>
      </div>
      <div class="recent-time" data-end=${timestamp || ''}>${relativeTime(timestamp)}</div>
    </${tag}>
  `;
}
