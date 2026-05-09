// "Now/recently played" row used in two places: stats.fm recent feed, and
// SoundCloud likes feed. Same shape, different data sources.

import { escapeHtml, relativeTime } from '../format.js';
import { paletteFor } from '../palette.js';

export interface RecentRowOpts {
  url?: string;
  title: string;
  subtitle: string;
  coverUrl?: string;
  timestamp?: string;
  paletteSeed: string;
  index?: number;
}

export function recentRow(opts: RecentRowOpts): string {
  const { url, title, subtitle, coverUrl, timestamp, paletteSeed, index = 0 } = opts;
  const tag = url ? 'a' : 'div';
  const linkAttrs = url ? ` href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"` : '';
  const pal = paletteFor(paletteSeed);
  const img = coverUrl ? `<img src="${escapeHtml(coverUrl)}" alt="" loading="lazy">` : '';
  return (
    `<${tag}${linkAttrs} class="recent-row" style="animation-delay: ${index * 20}ms">`
    + `<div class="recent-art" style="background: linear-gradient(135deg, ${pal.c1}, ${pal.c2});">${img}</div>`
    + `<div class="recent-info">`
    +   `<div class="recent-track">${escapeHtml(title)}</div>`
    +   `<div class="recent-artist">${escapeHtml(subtitle)}</div>`
    + `</div>`
    + `<div class="recent-time" data-end="${escapeHtml(timestamp || '')}">${escapeHtml(relativeTime(timestamp))}</div>`
    + `</${tag}>`
  );
}
