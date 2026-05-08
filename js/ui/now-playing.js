// The pinned now-playing footer. Rotates through real recently-played tracks
// when stats.fm data is present; falls back to random albums otherwise.

import { $, refreshIcons } from '../lib/dom.js';
import { monogram, fmtTime, fmtRemaining } from '../lib/format.js';
import { paletteFor } from '../lib/palette.js';
import { albums, recentlyPlayed } from '../data/store.js';
import { applyCoverForAlbum } from '../data/itunes.js';

const PLAYS_STORAGE_KEY = 'afr-plays';
const PLAYS_INITIAL = 128;

let np = null;
let progress = 0;
let duration = 0;
let playing = true;
let playCount = PLAYS_INITIAL;
let recentIdx = 0;

// ---- Track picking ---------------------------------------------------------
function pickFromRecent() {
  if (!recentlyPlayed.length) return null;
  const track = recentlyPlayed[recentIdx % recentlyPlayed.length];
  recentIdx++;
  const pal = paletteFor(`${track.artist}::${track.album || track.name}`);
  return {
    artist: track.artist,
    name: track.name,
    album: track.album,
    coverUrl: track.coverUrl,
    url: track.url,
    durationMs: track.durationMs,
    c1: pal.c1,
    c2: pal.c2,
    kind: 'track',
  };
}

function pickAlbum() {
  return pickFromRecent() || (() => {
    const a = albums[Math.floor(Math.random() * albums.length)];
    return { ...a, kind: 'album' };
  })();
}

// ---- DOM -------------------------------------------------------------------
function applyArt(item) {
  const art = $('#np-art');
  const oldImg = art.querySelector('img');
  if (oldImg) oldImg.remove();
  art.classList.remove('has-art');
  $('#np-art-mono').textContent = monogram(item.artist);
  art.style.background = `linear-gradient(135deg, ${item.c1}, ${item.c2})`;
  if (item.coverUrl) {
    const img = document.createElement('img');
    img.src = item.coverUrl;
    img.alt = `${item.artist} — ${item.name}`;
    art.classList.add('has-art');
    art.insertBefore(img, art.firstChild);
  }
}

function setNowPlaying(item) {
  np = item;
  progress = 0;
  // Use real track duration when available; otherwise hash a stable fake.
  if (item.durationMs && item.durationMs > 30_000) {
    duration = Math.round(item.durationMs / 1000);
  } else {
    const seed = (item.name + item.artist).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    duration = 170 + (seed % 160);
  }
  $('#np-track').textContent = `${item.artist} — ${item.name}`;
  $('#np-time-total').textContent = fmtRemaining(duration);
  $('#np-time-current').textContent = '0:00';
  $('#np-progress-bar').style.width = '0%';
  $('#np-progress-handle').style.left = '0%';
  applyArt(item);
}

function tick() {
  if (!playing || duration === 0) return;
  progress += 1;
  if (progress >= duration) {
    playCount += 1;
    try { localStorage.setItem(PLAYS_STORAGE_KEY, String(playCount)); } catch (e) { /* noop */ }
    const counter = $('#play-count');
    if (counter) counter.textContent = playCount.toLocaleString();
    setNowPlaying(pickAlbum());
    return;
  }
  const pct = (progress / duration) * 100;
  $('#np-progress-bar').style.width = pct + '%';
  $('#np-progress-handle').style.left = pct + '%';
  $('#np-time-current').textContent = fmtTime(progress);
  $('#np-time-total').textContent = fmtRemaining(duration - progress);
}

// ---- Wire up controls ------------------------------------------------------
function bindControls() {
  $('#np-play').addEventListener('click', () => {
    playing = !playing;
    const btn = $('#np-play');
    btn.innerHTML = playing
      ? '<i data-lucide="pause"></i>'
      : '<i data-lucide="play"></i>';
    refreshIcons();
  });

  $('#np-next-btn').addEventListener('click', () => {
    setNowPlaying(pickAlbum());
  });

  $('#np-shuffle').addEventListener('click', () => {
    $('#np-shuffle').classList.toggle('active');
  });

  $('#np-repeat').addEventListener('click', () => {
    $('#np-repeat').classList.toggle('active');
  });

  $('#np-heart').addEventListener('click', () => {
    $('#np-heart').classList.toggle('active');
  });

  $('#np-progress').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    progress = Math.max(0, Math.min(duration, pct * duration));
    $('#np-progress-bar').style.width = (pct * 100) + '%';
    $('#np-progress-handle').style.left = (pct * 100) + '%';
    $('#np-time-current').textContent = fmtTime(progress);
    $('#np-time-total').textContent = fmtRemaining(duration - progress);
  });
}

// Refresh np art if its album just hydrated a coverUrl.
export function maybeRefreshNpArt() {
  if (np && np.coverUrl) applyArt(np);
}

export function initNowPlaying() {
  try { playCount = parseInt(localStorage.getItem(PLAYS_STORAGE_KEY) || String(PLAYS_INITIAL), 10) || PLAYS_INITIAL; }
  catch (e) { playCount = PLAYS_INITIAL; }
  const counter = $('#play-count');
  if (counter) counter.textContent = playCount.toLocaleString();

  setNowPlaying(pickAlbum());
  setInterval(tick, 1000);
  bindControls();
}
