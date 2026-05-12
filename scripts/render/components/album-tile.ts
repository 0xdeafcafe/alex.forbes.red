// Big album tile used on the Music page mosaic.

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { monogram, cssKey } from '../format.js';
import type { Album } from '../../lib/types.js';

export interface AlbumMosaicTileProps {
  album: Album;
  index?: number;
}

export function AlbumMosaicTile({ album, index = 0 }: AlbumMosaicTileProps): VNode {
  const tag = album.url ? 'a' : 'div';
  const linkAttrs = album.url ? { href: album.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const cls = 'album'
    + (album.large ? ' large' : '')
    + (album.coverUrl ? ' has-art' : '');
  return html`
    <${tag}
      ...${linkAttrs}
      class=${cls}
      style=${`--c1: ${album.c1 || ''}; --c2: ${album.c2 || ''}; animation-delay: ${index * 28}ms`}
      data-album-key=${cssKey(album)}
    >
      ${album.coverUrl
        ? html`<img class="album-art" src=${album.coverUrl} alt=${`${album.artist} — ${album.name}`} loading="lazy" />`
        : null}
      <div class="album-mono">${monogram(album.artist)}</div>
      <div class="album-overlay">
        <div class="album-year">${album.year ?? ''}</div>
        <div class="album-info">
          <div class="album-artist">${album.artist}</div>
          <div class="album-name">${album.name}</div>
        </div>
      </div>
    </${tag}>
  `;
}
