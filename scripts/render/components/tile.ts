// Generic small "tile" used in the Quickplay history grid.

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { monogram, cssKey } from '../format.js';
import type { Album } from '../../lib/types.js';

export interface AlbumTileProps {
  album: Album;
  big?: boolean;
}

export function AlbumTile({ album, big = false }: AlbumTileProps): VNode {
  const tag = album.url ? 'a' : 'div';
  const linkAttrs = album.url ? { href: album.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const cls = 'tile'
    + (big ? ' tile-big' : '')
    + (album.coverUrl ? ' has-art' : '');
  return html`
    <${tag}
      ...${linkAttrs}
      class=${cls}
      style=${`--c1: ${album.c1 || ''}; --c2: ${album.c2 || ''}`}
      data-album-key=${cssKey(album)}
    >
      ${album.coverUrl
        ? html`<img class="tile-art" src=${album.coverUrl} alt=${`${album.artist} — ${album.name}`} loading="lazy" />`
        : null}
      <div class="tile-mono">${monogram(album.artist)}</div>
      <div class="tile-grad" />
      <div class="tile-body">
        <div class="tile-artist">${album.artist}</div>
        <div class="tile-name">${album.name}</div>
      </div>
    </${tag}>
  `;
}
