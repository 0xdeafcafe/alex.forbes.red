// Generic small "tile" used in the Quickplay history grid.

import { escapeHtml, monogram, cssKey } from '../format.js';
import type { Album } from '../../lib/types.js';

export interface AlbumTileOpts {
  big?: boolean;
}

export function albumTile(album: Album, opts: AlbumTileOpts = {}): string {
  const big = !!opts.big;
  const isLink = !!album.url;
  const tag = isLink ? 'a' : 'div';
  const linkAttrs = isLink ? ` href="${escapeHtml(album.url!)}" target="_blank" rel="noopener noreferrer"` : '';
  const cls = 'tile'
    + (big ? ' tile-big' : '')
    + (album.coverUrl ? ' has-art' : '');
  const cover = album.coverUrl
    ? `<img class="tile-art" src="${escapeHtml(album.coverUrl)}" alt="${escapeHtml(`${album.artist} — ${album.name}`)}" loading="lazy">`
    : '';
  return (
    `<${tag}${linkAttrs} class="${cls}" `
    + `style="--c1: ${escapeHtml(album.c1 || '')}; --c2: ${escapeHtml(album.c2 || '')}" `
    + `data-album-key="${escapeHtml(cssKey(album))}">`
    + cover
    + `<div class="tile-mono">${escapeHtml(monogram(album.artist))}</div>`
    + `<div class="tile-grad"></div>`
    + `<div class="tile-body">`
    +   `<div class="tile-artist">${escapeHtml(album.artist)}</div>`
    +   `<div class="tile-name">${escapeHtml(album.name)}</div>`
    + `</div>`
    + `</${tag}>`
  );
}
