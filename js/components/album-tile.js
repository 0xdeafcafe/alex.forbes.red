// Big album tile used on the Music page mosaic.

import { escapeHtml, monogram, cssKey } from '../lib/format.js';

export function makeAlbumMosaicTile(album, index = 0) {
  const tag = album.url ? 'a' : 'div';
  const el = document.createElement(tag);
  if (album.url) {
    el.href = album.url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  el.className = 'album'
    + (album.large ? ' large' : '')
    + (album.coverUrl ? ' has-art' : '');
  el.style.setProperty('--c1', album.c1);
  el.style.setProperty('--c2', album.c2);
  el.style.animationDelay = `${index * 28}ms`;
  el.dataset.albumKey = cssKey(album);

  const cover = album.coverUrl
    ? `<img class="album-art" src="${escapeHtml(album.coverUrl)}" alt="${escapeHtml(`${album.artist} — ${album.name}`)}" loading="lazy">`
    : '';

  el.innerHTML = `
    ${cover}
    <div class="album-mono">${escapeHtml(monogram(album.artist))}</div>
    <div class="album-overlay">
      <div class="album-year">${album.year || ''}</div>
      <div class="album-info">
        <div class="album-artist">${escapeHtml(album.artist)}</div>
        <div class="album-name">${escapeHtml(album.name)}</div>
      </div>
    </div>
  `;
  return el;
}
