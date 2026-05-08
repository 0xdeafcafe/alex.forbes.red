// The wall of album/photo tiles that sits behind everything. Random tiles
// flip every couple seconds (Live-Tile-esque) but at low opacity so it
// reads as texture, not content.

import { $, $$ } from '../lib/dom.js';
import { monogram, shuffle } from '../lib/format.js';
import { albums, photos } from '../data/store.js';

const TOTAL_TILES = 220;
const FLIP_INTERVAL_MS = 1700;

function applyFace(el, item) {
  if (item.kind === 'album') {
    if (item.a.coverUrl) {
      el.style.backgroundImage = `url("${item.a.coverUrl}")`;
    } else {
      el.style.background = `linear-gradient(135deg, ${item.a.c1}, ${item.a.c2})`;
    }
    el.textContent = item.a.coverUrl ? '' : monogram(item.a.artist);
  } else {
    el.style.backgroundImage = `url("${item.p.url}")`;
    el.textContent = '';
  }
}

export function buildTileBg() {
  const host = $('#tile-bg');
  if (!host) return;
  host.innerHTML = '';

  const seedItems = [
    ...albums.map(a => ({ kind: 'album', a })),
    ...photos.map(p => ({ kind: 'photo', p })),
  ];
  if (!seedItems.length) return;

  const tiles = Array.from({ length: TOTAL_TILES }, (_, i) => seedItems[i % seedItems.length]);
  const ordered = shuffle(tiles);
  const altPool = shuffle(seedItems.slice());

  ordered.forEach((item, i) => {
    const tile = document.createElement('div');
    tile.className = 'bg-tile';
    const front = document.createElement('div');
    front.className = 'bg-tile-face front';
    const back = document.createElement('div');
    back.className = 'bg-tile-face back';
    applyFace(front, item);
    applyFace(back, altPool[i % altPool.length]);
    tile.appendChild(front);
    tile.appendChild(back);
    host.appendChild(tile);
  });
}

export function startTileFlipper() {
  setInterval(() => {
    const tiles = $$('.bg-tile');
    if (!tiles.length) return;
    const batch = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < batch; i++) {
      const t = tiles[Math.floor(Math.random() * tiles.length)];
      t.classList.toggle('flipped');
    }
  }, FLIP_INTERVAL_MS);
}

// Add/remove a "scrolling" body class so CSS can dim the bg further while
// the user is actively scrolling.
export function bindScrollDimmer() {
  let timer = null;
  window.addEventListener('scroll', () => {
    document.body.classList.add('scrolling-mode');
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => document.body.classList.remove('scrolling-mode'), 600);
  }, { passive: true });
}
