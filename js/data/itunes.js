// Fallback cover hydration via the iTunes Search API. Only kicks in for
// albums that don't already have a coverUrl (i.e. when running with the
// hardcoded fallback list and no live stats.fm snapshot).

import { cssKey } from '../lib/format.js';
import { albums } from './store.js';

const CACHE_KEY = 'afr-itunes-covers-v1';

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch (e) { return {}; }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* quota / private mode */ }
}

async function fetchCoverFor(album, cache) {
  const key = `${album.artist}::${album.name}`;
  if (cache[key]) {
    album.coverUrl = cache[key];
    return album.coverUrl;
  }
  try {
    const term = encodeURIComponent(`${album.artist} ${album.name}`);
    const r = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=1`);
    if (!r.ok) return null;
    const j = await r.json();
    const raw = j.results && j.results[0] && j.results[0].artworkUrl100;
    if (!raw) return null;
    const big = raw.replace('100x100', '600x600');
    album.coverUrl = big;
    cache[key] = big;
    return big;
  } catch (e) {
    return null;
  }
}

// Look up every album tile already in the DOM matching `album` and inject
// an <img> with the resolved cover. Used by hydrateCovers and by the live
// snapshot path (which already has coverUrls but renders the tile DOM
// without the <img> when this module is in charge).
export function applyCoverForAlbum(album) {
  if (!album.coverUrl) return;
  const tiles = document.querySelectorAll(`[data-album-key="${cssKey(album)}"]`);
  tiles.forEach(t => {
    if (t.querySelector('.album-art, .tile-art, .smart-tile-art')) return;
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = `${album.artist} — ${album.name}`;
    img.src = album.coverUrl;
    if (t.classList.contains('album')) {
      img.className = 'album-art';
      t.classList.add('has-art');
      t.insertBefore(img, t.firstChild);
    } else if (t.classList.contains('smart-tile')) {
      img.className = 'smart-tile-art';
      t.classList.add('has-art');
      t.insertBefore(img, t.firstChild);
    } else {
      img.className = 'tile-art';
      t.classList.add('has-art');
      t.insertBefore(img, t.firstChild);
    }
  });
}

export function applyCoversToDom() {
  albums.forEach(applyCoverForAlbum);
}

// Top-level: backfill missing covers from cache + iTunes; let callers know
// when the network round-trips have finished so the bg tile wall can rebuild.
export async function hydrateCovers() {
  const cache = loadCache();
  // Snapshot-derived covers always win — only fill missing ones.
  albums.forEach(a => {
    if (a.coverUrl) return;
    const cached = cache[`${a.artist}::${a.name}`];
    if (cached) a.coverUrl = cached;
  });
  applyCoversToDom();
  for (const a of albums.filter(a => !a.coverUrl)) {
    await fetchCoverFor(a, cache);
    applyCoverForAlbum(a);
  }
  saveCache(cache);
}
