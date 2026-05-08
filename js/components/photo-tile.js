// Photo mosaic tile (Photography page).

import { escapeHtml } from '../lib/format.js';

export function makePhotoMosaicTile(photo, index = 0) {
  const cls = ['photo-tile'];
  if (photo.large) cls.push('large');
  else if (photo.tall) cls.push('tall');
  else if (photo.wide) cls.push('wide');

  const tag = photo.instagramUrl ? 'a' : 'div';
  const el = document.createElement(tag);
  if (photo.instagramUrl) {
    el.href = photo.instagramUrl;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  el.className = cls.join(' ');
  el.style.animationDelay = `${index * 30}ms`;
  el.innerHTML = `
    <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.title || '')}" loading="lazy">
    <div class="photo-meta">
      <div class="photo-title">${escapeHtml(photo.title || '')}</div>
      <div class="photo-loc">${escapeHtml(photo.loc || '')}</div>
    </div>
  `;
  return el;
}
