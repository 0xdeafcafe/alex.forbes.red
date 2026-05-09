// Music page: main mosaic + top-artists strip + recently-played feed +
// SoundCloud likes feed + snapshot meta lines.

import { albumMosaicTile } from '../components/album-tile.js';
import { artistTile } from '../components/artist-tile.js';
import { recentRow } from '../components/recent-row.js';
import { escapeHtml } from '../format.js';
import type { SiteData } from '../../lib/types.js';

export function renderMusicMosaic(data: SiteData): string {
  return data.albums.map((a, i) => albumMosaicTile(a, i)).join('');
}

export function renderMusicArtists(data: SiteData): string {
  return data.topArtists.slice(0, 12).map((ar, i) => artistTile(ar, i)).join('');
}

export function renderMusicRecent(data: SiteData): string {
  return data.recentlyPlayed.slice(0, 18).map((t, i) => recentRow({
    url: t.url,
    title: t.name,
    subtitle: t.artist,
    coverUrl: t.coverUrl,
    timestamp: t.endTime,
    paletteSeed: `${t.artist}::${t.album || t.name}`,
    index: i,
  })).join('');
}

export function renderMusicSoundcloud(data: SiteData): string {
  const likes = data.soundcloud?.likes ?? [];
  return likes.map((l, i) => {
    const subParts = [l.artist];
    if (l.uploader) subParts.push(`@${l.uploader}`);
    if (l.genre) subParts.push(l.genre);
    return recentRow({
      url: l.url,
      title: l.title,
      subtitle: subParts.join(' · '),
      coverUrl: l.artworkUrl,
      timestamp: l.likedAt,
      paletteSeed: `${l.artist}::${l.title}`,
      index: i,
    });
  }).join('');
}

export function renderStatsFmMeta(data: SiteData): string {
  if (!data.statsFmUser) return '';
  const u = data.statsFmUser;
  return `live from <a href="https://stats.fm/${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">stats.fm/${escapeHtml(u)}</a>`;
}

export function renderSoundcloudMeta(data: SiteData): string {
  const likes = data.soundcloud?.likes ?? [];
  if (!likes.length || !data.soundcloudUser) return '';
  const u = data.soundcloudUser;
  return `${likes.length} likes · live from <a href="https://soundcloud.com/${escapeHtml(u)}/likes" target="_blank" rel="noopener noreferrer">soundcloud.com/${escapeHtml(u)}</a>`;
}
