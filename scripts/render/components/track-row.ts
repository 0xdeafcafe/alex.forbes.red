// Profile-style track table row. Five columns: 32px thumb, song, artist,
// album, right-col (when / plays / etc). At narrow widths the album column
// is hidden via CSS; at mobile widths the row collapses to thumb + a two-
// line text stack handled in CSS, so the markup stays one shape.

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { relativeTime } from '../format.js';
import { paletteFor } from '../palette.js';

export interface TrackRowProps {
  url?: string;
  song: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  /** ISO timestamp; renders as relative time ("4m ago"). Auto-refreshed client-side. */
  timestamp?: string;
  /** Static string for the right column when there's no timestamp (e.g. plays count). */
  rightLabel?: string;
  paletteSeed: string;
  index?: number;
}

export function TrackRow({
  url, song, artist, album, coverUrl, timestamp, rightLabel, paletteSeed, index = 0,
}: TrackRowProps): VNode {
  const pal = paletteFor(paletteSeed);
  const tag = url ? 'a' : 'div';
  const linkAttrs = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const right = timestamp
    ? html`<span class="track-right" data-end=${timestamp}>${relativeTime(timestamp)}</span>`
    : html`<span class="track-right">${rightLabel ?? ''}</span>`;
  return html`
    <${tag} ...${linkAttrs} class="track-row" style=${`animation-delay: ${index * 16}ms`}>
      <div class="track-art" style=${`background: linear-gradient(135deg, ${pal.c1}, ${pal.c2});`}>
        ${coverUrl ? html`<img src=${coverUrl} alt="" loading="lazy" />` : null}
      </div>
      <span class="track-song">${song}</span>
      <span class="track-artist">${artist}</span>
      <span class="track-album">${album ?? ''}</span>
      ${right}
    </${tag}>
  `;
}
