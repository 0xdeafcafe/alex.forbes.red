// Formatting helpers — strings in, strings out, no DOM.

import { pad } from './dom.js';

export const monogram = (s) => String(s)
  .split(/\s+/)
  .map(w => w.replace(/[^A-Za-z0-9]/g, '')[0])
  .filter(Boolean)
  .slice(0, 2)
  .join('')
  .toUpperCase();

export function fmtTime(secs) {
  return `${Math.floor(secs / 60)}:${pad(Math.floor(secs % 60))}`;
}

export function fmtRemaining(secs) {
  return `-${fmtTime(secs)}`;
}

export function relativeTime(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 7) return d + 'd ago';
  const w = Math.floor(d / 7);
  if (w < 5) return w + 'w ago';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatFollowers(n) {
  if (!n) return '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'K';
  return String(n);
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Produce a CSS-safe `data-album-key` from artist + name.
export function cssKey(a) {
  return `${a.artist}__${a.name}`.replace(/[^A-Za-z0-9_]/g, '_');
}

// Cleanish first-line excerpt of an Instagram caption.
export function igCaptionTitle(caption) {
  if (!caption) return '';
  const cleaned = caption.replace(/#\w+/g, '').replace(/@(\w+)/g, '@$1').replace(/\s+/g, ' ').trim();
  const m = cleaned.match(/^[^.!?\n]+/);
  return (m ? m[0] : cleaned).slice(0, 80).trim();
}

export function igPhotoSubtitle(photo) {
  const dt = new Date(photo.takenAt);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
