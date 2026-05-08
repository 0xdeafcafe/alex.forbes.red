// Top-artists strip tile on the Music page.

import { escapeHtml, monogram, formatFollowers } from '../lib/format.js';
import { paletteFor } from '../lib/palette.js';

export function makeArtistTile(artist, index = 0) {
  const tag = artist.url ? 'a' : 'div';
  const el = document.createElement(tag);
  if (artist.url) {
    el.href = artist.url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  el.className = 'artist-tile' + (artist.image ? ' has-art' : '');
  const pal = paletteFor(artist.name);
  el.style.setProperty('--c1', pal.c1);
  el.style.setProperty('--c2', pal.c2);
  el.style.animationDelay = `${index * 35}ms`;
  const imgHtml = artist.image
    ? `<img src="${escapeHtml(artist.image)}" alt="${escapeHtml(artist.name)}" loading="lazy">`
    : '';
  el.innerHTML = `
    ${imgHtml}
    <div class="artist-mono">${escapeHtml(monogram(artist.name))}</div>
    <div class="artist-body">
      <div class="artist-pos">#${artist.position || index + 1}</div>
      <div class="artist-name">${escapeHtml(artist.name.toLowerCase())}</div>
      <div class="artist-meta">${artist.followers ? formatFollowers(artist.followers) + ' followers' : 'top artist'}</div>
    </div>
  `;
  return el;
}
