// Photo mosaic tile (Photography page).

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import type { DisplayPhoto } from '../../lib/types.js';

export interface PhotoMosaicTileProps {
  photo: DisplayPhoto;
  index?: number;
}

export function PhotoMosaicTile({ photo, index = 0 }: PhotoMosaicTileProps): VNode {
  const cls = ['photo-tile'];
  if (photo.large) cls.push('large');
  else if (photo.tall) cls.push('tall');
  else if (photo.wide) cls.push('wide');
  const tag = photo.instagramUrl ? 'a' : 'div';
  const linkAttrs = photo.instagramUrl
    ? { href: photo.instagramUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {};
  return html`
    <${tag} ...${linkAttrs} class=${cls.join(' ')} style=${`animation-delay: ${index * 30}ms`}>
      <img src=${photo.url} alt=${photo.title || ''} loading="lazy" />
      <div class="photo-meta">
        <div class="photo-title">${photo.title || ''}</div>
        <div class="photo-loc">${photo.loc || ''}</div>
      </div>
    </${tag}>
  `;
}
