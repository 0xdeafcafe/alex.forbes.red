// "Now/recently played" row used in two places: stats.fm recent feed,
// and SoundCloud likes feed. Same shape, different data sources.

import { escapeHtml, relativeTime } from '../lib/format.js';
import { paletteFor } from '../lib/palette.js';

/**
 * @param {Object} opts
 * @param {string} opts.url        Click target
 * @param {string} opts.title      Track / item title
 * @param {string} opts.subtitle   Artist / source line
 * @param {string|undefined} opts.coverUrl
 * @param {string|undefined} opts.timestamp ISO date for the relative-time stamp
 * @param {string} opts.paletteSeed Stable seed for the gradient fallback
 * @param {number} opts.index
 */
export function makeRecentRow({ url, title, subtitle, coverUrl, timestamp, paletteSeed, index = 0 }) {
  const el = document.createElement(url ? 'a' : 'div');
  if (url) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  el.className = 'recent-row';
  el.style.animationDelay = `${index * 20}ms`;
  const pal = paletteFor(paletteSeed);
  const imgHtml = coverUrl
    ? `<img src="${escapeHtml(coverUrl)}" alt="" loading="lazy">`
    : '';
  el.innerHTML = `
    <div class="recent-art" style="background: linear-gradient(135deg, ${pal.c1}, ${pal.c2});">${imgHtml}</div>
    <div class="recent-info">
      <div class="recent-track">${escapeHtml(title)}</div>
      <div class="recent-artist">${escapeHtml(subtitle)}</div>
    </div>
    <div class="recent-time" data-end="${escapeHtml(timestamp || '')}">${escapeHtml(relativeTime(timestamp))}</div>
  `;
  return el;
}
