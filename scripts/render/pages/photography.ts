import { photoMosaicTile } from '../components/photo-tile.js';
import { escapeHtml } from '../format.js';
import type { SiteData } from '../../lib/types.js';

export function renderPhotoMosaic(data: SiteData): string {
  return data.photos.map((p, i) => photoMosaicTile(p, i)).join('');
}

export function renderInstagramMeta(data: SiteData): string {
  if (!data.instagramUser || !data.photos.length) return '';
  const u = data.instagramUser;
  return `${data.photos.length} frames · live from <a href="https://www.instagram.com/${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">@${escapeHtml(u)}</a>`;
}
