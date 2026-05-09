// Persistent footer that rotates through the most recent thing in each
// category, with a category-appropriate label:
//
//   LAST SPUN     — most-recent stats.fm scrobble (music)
//   LAST SNAPPED  — newest Instagram photo (photography)
//   LAST SCRAWLED — newest essay (words)
//   LAST VIBED    — featured project (projects)
//
// The whole strip is one anchor; clicking jumps to the relevant pivot
// (and scrolls to a section anchor on music). Updates relative-time labels
// every minute and fades between modes every few seconds.

import { $ } from '../lib/dom.js';
import { monogram, relativeTime } from '../lib/format.js';
import { paletteFor } from '../lib/palette.js';
import { photos, projects, recentlyPlayed, words } from '../data/store.js';
import { setPivot } from './nav.js';

const ROTATE_MS = 7000;
const RELATIVE_TICK_MS = 60_000;

let modes = [];
let modeIdx = 0;
let rotateTimer = null;
let relativeTimer = null;

// ---- Mode resolvers --------------------------------------------------------
function spunMode() {
  const t = recentlyPlayed[0];
  if (!t) return null;
  return {
    label: 'LAST SPUN',
    title: t.name,
    sub: t.artist,
    coverUrl: t.coverUrl,
    paletteSeed: `${t.artist}::${t.album || t.name}`,
    monoSeed: t.artist,
    timestamp: t.endTime,
    pivot: 'music',
    anchor: 'music-recent-section',
  };
}

function snappedMode() {
  const p = photos[0];
  if (!p || !p.url) return null;
  return {
    label: 'LAST SNAPPED',
    title: p.title || 'untitled',
    sub: p.loc || 'instagram',
    coverUrl: p.url,
    paletteSeed: p.title || 'photo',
    monoSeed: p.title || 'AF',
    timestamp: p.takenAt,
    pivot: 'photography',
  };
}

function scrawledMode() {
  const w = words[0];
  if (!w) return null;
  return {
    label: 'LAST SCRAWLED',
    title: w.title,
    sub: w.source,
    coverUrl: null,
    paletteSeed: w.title,
    monoSeed: w.title,
    timestamp: null,
    pivot: 'words',
  };
}

function vibedMode() {
  const p = projects[0];
  if (!p) return null;
  return {
    label: 'LAST VIBED',
    title: p.name,
    sub: p.tag,
    coverUrl: null,
    paletteSeed: p.name,
    monoSeed: p.name,
    timestamp: null,
    pivot: 'projects',
  };
}

const RESOLVERS = [spunMode, snappedMode, scrawledMode, vibedMode];

// ---- Rendering -------------------------------------------------------------
function applyMode(mode) {
  if (!mode) return;

  const root = $('#last-spun');
  const link = $('#last-spun-link');
  link.dataset.pivot = mode.pivot;
  link.dataset.anchor = mode.anchor || '';

  // Cover art / mono fallback.
  const art = $('#last-spun-art');
  const oldImg = art.querySelector('img');
  if (oldImg) oldImg.remove();
  const mono = $('#last-spun-mono');
  if (mode.coverUrl) {
    const img = document.createElement('img');
    img.src = mode.coverUrl;
    img.alt = `${mode.title} — ${mode.sub}`;
    img.loading = 'lazy';
    art.insertBefore(img, art.firstChild);
    art.classList.add('has-art');
    mono.style.display = 'none';
    art.style.background = '';
  } else {
    const pal = paletteFor(mode.paletteSeed);
    art.classList.remove('has-art');
    art.style.background = `linear-gradient(135deg, ${pal.c1}, ${pal.c2})`;
    mono.textContent = monogram(mode.monoSeed);
    mono.style.display = '';
  }

  $('#last-spun-label').textContent = mode.label;
  $('#last-spun-name').textContent = mode.title;
  $('#last-spun-artist').textContent = mode.sub;

  const timeEl = $('#last-spun-time');
  if (mode.timestamp) {
    timeEl.textContent = relativeTime(mode.timestamp);
    timeEl.dataset.end = mode.timestamp;
    timeEl.style.display = '';
    $('#last-spun-time-sep').style.display = '';
  } else {
    timeEl.dataset.end = '';
    timeEl.style.display = 'none';
    $('#last-spun-time-sep').style.display = 'none';
  }
}

// Slide-out → swap content → slide-in (with a tiny pre-position step so the
// new content enters from the right edge instead of materializing in place).
// The exit window must match the CSS exit transition (~400ms).
function crossfadeTo(mode) {
  const root = $('#last-spun');
  if (!root || !mode) return;
  root.classList.add('is-swapping');
  setTimeout(() => {
    applyMode(mode);
    root.classList.remove('is-swapping');
    root.classList.add('is-entering');
    // Force reflow so the "transition:none" enter state applies before we
    // remove it, otherwise the from→to step is skipped.
    // eslint-disable-next-line no-unused-expressions
    root.offsetHeight;
    requestAnimationFrame(() => root.classList.remove('is-entering'));
  }, 420);
}

function nextMode() {
  for (let i = 0; i < modes.length; i++) {
    modeIdx = (modeIdx + 1) % modes.length;
    const m = modes[modeIdx]();
    if (m) return m;
  }
  return null;
}

// ---- Boot ------------------------------------------------------------------
export function initLastSpun() {
  const root = $('#last-spun');
  if (!root) return;

  // Filter to resolvers that actually have data right now.
  modes = RESOLVERS.filter(r => r() !== null);
  if (!modes.length) {
    root.hidden = true;
    return;
  }
  root.hidden = false;

  modeIdx = 0;
  applyMode(modes[0]());

  // Click → relevant pivot (+ optional in-page anchor scroll).
  $('#last-spun-link').addEventListener('click', e => {
    e.preventDefault();
    const link = e.currentTarget;
    const pivot = link.dataset.pivot;
    const anchor = link.dataset.anchor;
    if (!pivot) return;
    setPivot(pivot);
    if (anchor) {
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  });

  // Rotate.
  if (modes.length > 1) {
    if (rotateTimer) clearInterval(rotateTimer);
    rotateTimer = setInterval(() => {
      const m = nextMode();
      if (m) crossfadeTo(m);
    }, ROTATE_MS);
  }

  // Tick the relative-time label.
  if (relativeTimer) clearInterval(relativeTimer);
  relativeTimer = setInterval(() => {
    const timeEl = $('#last-spun-time');
    const end = timeEl?.dataset.end;
    if (end) timeEl.textContent = relativeTime(end);
  }, RELATIVE_TICK_MS);
}
