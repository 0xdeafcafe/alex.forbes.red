// Big album tile used on the Music page mosaic.

import { escapeHtml, monogram, cssKey } from '../format.js';
import type { Album } from '../../lib/types.js';

export function albumMosaicTile(album: Album, index = 0): string {
  const isLink = !!album.url;
  const tag = isLink ? 'a' : 'div';
  const linkAttrs = isLink ? ` href="${escapeHtml(album.url!)}" target="_blank" rel="noopener noreferrer"` : '';
  const cls = 'album'
    + (album.large ? ' large' : '')
    + (album.coverUrl ? ' has-art' : '');
  const cover = album.coverUrl
    ? `<img class="album-art" src="${escapeHtml(album.coverUrl)}" alt="${escapeHtml(`${album.artist} — ${album.name}`)}" loading="lazy">`
    : '';
  return (
    `<${tag}${linkAttrs} class="${cls}" `
    + `style="--c1: ${escapeHtml(album.c1 || '')}; --c2: ${escapeHtml(album.c2 || '')}; animation-delay: ${index * 28}ms" `
    + `data-album-key="${escapeHtml(cssKey(album))}">`
    + cover
    + `<div class="album-mono">${escapeHtml(monogram(album.artist))}</div>`
    + `<div class="album-overlay">`
    +   `<div class="album-year">${escapeHtml(album.year ?? '')}</div>`
    +   `<div class="album-info">`
    +     `<div class="album-artist">${escapeHtml(album.artist)}</div>`
    +     `<div class="album-name">${escapeHtml(album.name)}</div>`
    +   `</div>`
    + `</div>`
    + `</${tag}>`
  );
}
