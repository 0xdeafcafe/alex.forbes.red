// Generic small "tile" used in the Quickplay history grid. Three concrete
// flavours: album, project, photo, word.

import { escapeHtml, monogram, cssKey } from '../lib/format.js';
import { setPivot } from '../ui/nav.js';

function emptyTile({ tag = 'div', href, big = false, hasArt = false } = {}) {
  const el = document.createElement(tag);
  if (href) {
    el.href = href;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  el.className = 'tile'
    + (big ? ' tile-big' : '')
    + (hasArt ? ' has-art' : '');
  return el;
}

export function makeAlbumTile(album, opts = {}) {
  const big = !!opts.big;
  const el = emptyTile({
    tag: album.url ? 'a' : 'div',
    href: album.url,
    big,
    hasArt: !!album.coverUrl,
  });
  el.style.setProperty('--c1', album.c1);
  el.style.setProperty('--c2', album.c2);
  el.dataset.albumKey = cssKey(album);
  const cover = album.coverUrl
    ? `<img class="tile-art" src="${escapeHtml(album.coverUrl)}" alt="${escapeHtml(`${album.artist} — ${album.name}`)}" loading="lazy">`
    : '';
  el.innerHTML = `
    ${cover}
    <div class="tile-mono">${escapeHtml(monogram(album.artist))}</div>
    <div class="tile-grad"></div>
    <div class="tile-body">
      <div class="tile-artist">${escapeHtml(album.artist)}</div>
      <div class="tile-name">${escapeHtml(album.name)}</div>
    </div>
  `;
  return el;
}

export function makePhotoTile(photo) {
  const el = emptyTile({ tag: 'div', hasArt: true });
  el.innerHTML = `
    <img class="tile-art" src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.title || '')}" loading="lazy">
    <div class="tile-grad"></div>
    <div class="tile-body">
      <div class="tile-artist">${escapeHtml(photo.loc || '')}</div>
      <div class="tile-name">${escapeHtml(photo.title || '')}</div>
    </div>
  `;
  el.addEventListener('click', () => setPivot('photography'));
  return el;
}

export function makeProjectTile(project) {
  const el = emptyTile({ tag: 'a', href: project.url });
  el.style.setProperty('--c1', '#3a1a4e');
  el.style.setProperty('--c2', '#0a0514');
  el.innerHTML = `
    <div class="tile-mono">${escapeHtml(monogram(project.name))}</div>
    <div class="tile-grad"></div>
    <div class="tile-body">
      <div class="tile-artist">${escapeHtml(project.tag)}</div>
      <div class="tile-name">${escapeHtml(project.name)}</div>
    </div>
  `;
  return el;
}

export function makeWordTile(word) {
  const el = emptyTile({ tag: 'a', href: word.url });
  el.style.setProperty('--c1', '#1a1a3e');
  el.style.setProperty('--c2', '#0a0a14');
  const truncated = word.title.length > 40 ? word.title.slice(0, 40) + '…' : word.title;
  el.innerHTML = `
    <div class="tile-mono">${escapeHtml(monogram(word.title))}</div>
    <div class="tile-grad"></div>
    <div class="tile-body">
      <div class="tile-artist">${escapeHtml(word.source)}</div>
      <div class="tile-name">${escapeHtml(truncated)}</div>
    </div>
  `;
  return el;
}
