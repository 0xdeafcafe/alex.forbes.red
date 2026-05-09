// Top-artists strip tile on the Music page.

import { escapeHtml, formatFollowers, monogram } from '../format.js';
import { paletteFor } from '../palette.js';
import type { Artist } from '../../lib/types.js';

export function artistTile(artist: Artist, index = 0): string {
  const isLink = !!artist.url;
  const tag = isLink ? 'a' : 'div';
  const linkAttrs = isLink ? ` href="${escapeHtml(artist.url!)}" target="_blank" rel="noopener noreferrer"` : '';
  const cls = 'artist-tile' + (artist.image ? ' has-art' : '');
  const pal = paletteFor(artist.name);
  const img = artist.image
    ? `<img src="${escapeHtml(artist.image)}" alt="${escapeHtml(artist.name)}" loading="lazy">`
    : '';
  return (
    `<${tag}${linkAttrs} class="${cls}" `
    + `style="--c1: ${pal.c1}; --c2: ${pal.c2}; animation-delay: ${index * 35}ms">`
    + img
    + `<div class="artist-mono">${escapeHtml(monogram(artist.name))}</div>`
    + `<div class="artist-body">`
    +   `<div class="artist-pos">#${escapeHtml(artist.position ?? index + 1)}</div>`
    +   `<div class="artist-name">${escapeHtml(artist.name.toLowerCase())}</div>`
    +   `<div class="artist-meta">${artist.followers ? escapeHtml(formatFollowers(artist.followers) + ' followers') : 'top artist'}</div>`
    + `</div>`
    + `</${tag}>`
  );
}
