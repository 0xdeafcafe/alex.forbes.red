// Photo mosaic tile (Photography page).

import { escapeHtml } from '../format.js';
import type { DisplayPhoto } from '../../lib/types.js';

export function photoMosaicTile(photo: DisplayPhoto, index = 0): string {
  const cls = ['photo-tile'];
  if (photo.large) cls.push('large');
  else if (photo.tall) cls.push('tall');
  else if (photo.wide) cls.push('wide');
  const isLink = !!photo.instagramUrl;
  const tag = isLink ? 'a' : 'div';
  const linkAttrs = isLink ? ` href="${escapeHtml(photo.instagramUrl!)}" target="_blank" rel="noopener noreferrer"` : '';
  return (
    `<${tag}${linkAttrs} class="${cls.join(' ')}" `
    + `style="animation-delay: ${index * 30}ms">`
    + `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.title || '')}" loading="lazy">`
    + `<div class="photo-meta">`
    +   `<div class="photo-title">${escapeHtml(photo.title || '')}</div>`
    +   `<div class="photo-loc">${escapeHtml(photo.loc || '')}</div>`
    + `</div>`
    + `</${tag}>`
  );
}
