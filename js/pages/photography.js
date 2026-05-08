import { $ } from '../lib/dom.js';
import { escapeHtml } from '../lib/format.js';
import { photos, musicSnapshot } from '../data/store.js';
import { makePhotoMosaicTile } from '../components/photo-tile.js';

export function renderPhotos() {
  const host = $('#photo-mosaic');
  host.innerHTML = '';
  photos.forEach((p, i) => host.appendChild(makePhotoMosaicTile(p, i)));

  const meta = $('#photography-snapshot-meta');
  if (!meta) return;
  if (musicSnapshot?.instagram?.user && photos.length) {
    const u = musicSnapshot.instagram.user;
    meta.innerHTML = `${photos.length} frames · live from <a href="https://www.instagram.com/${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">@${escapeHtml(u)}</a>`;
    meta.style.display = '';
  } else {
    meta.style.display = 'none';
  }
}
