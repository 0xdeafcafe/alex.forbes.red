// Top-artists strip tile on the Music page.

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { formatFollowers, monogram } from '../format.js';
import { paletteFor } from '../palette.js';
import type { Artist } from '../../lib/types.js';

export interface ArtistTileProps {
  artist: Artist;
  index?: number;
}

export function ArtistTile({ artist, index = 0 }: ArtistTileProps): VNode {
  const tag = artist.url ? 'a' : 'div';
  const linkAttrs = artist.url ? { href: artist.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const cls = 'artist-tile' + (artist.image ? ' has-art' : '');
  const pal = paletteFor(artist.name);
  return html`
    <${tag}
      ...${linkAttrs}
      class=${cls}
      style=${`--c1: ${pal.c1}; --c2: ${pal.c2}; animation-delay: ${index * 35}ms`}
    >
      ${artist.image ? html`<img src=${artist.image} alt=${artist.name} loading="lazy" />` : null}
      <div class="artist-mono">${monogram(artist.name)}</div>
      <div class="artist-body">
        <div class="artist-pos">#${artist.position ?? index + 1}</div>
        <div class="artist-name">${artist.name.toLowerCase()}</div>
        <div class="artist-meta">
          ${artist.followers ? `${formatFollowers(artist.followers)} followers` : 'top artist'}
        </div>
      </div>
    </${tag}>
  `;
}
