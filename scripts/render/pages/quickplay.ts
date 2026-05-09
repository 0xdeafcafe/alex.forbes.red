// Quickplay page: navigation tiles ("start"), recently-played history,
// and a Smart-DJ strip.

import { paletteFor } from '../palette.js';
import { actionTile } from '../components/action-tile.js';
import { albumTile } from '../components/tile.js';
import { smartTile } from '../components/smart-tile.js';
import type { Album, Recent, SiteData } from '../../lib/types.js';

// Squash recently-played tracks into a deduped "recently visited albums" list,
// using the album image when present and a paletted gradient otherwise.
function recentTracksToAlbums(recent: Recent[], max: number): Album[] {
  const seen = new Set<string>();
  const out: Album[] = [];
  for (const t of recent) {
    const key = `${t.artist}::${t.album || t.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pal = paletteFor(key);
    out.push({
      artist: t.artist,
      name: t.album || t.name,
      coverUrl: t.coverUrl,
      url: t.url,
      c1: pal.c1,
      c2: pal.c2,
    });
    if (out.length >= max) break;
  }
  return out;
}

export function renderQuickplayStart(data: SiteData): string {
  return [
    actionTile(
      { name: 'browse the collection', tag: 'OVERVIEW · ABOUT', icon: 'compass', pivot: 'collection' },
      { featured: true },
    ),
    actionTile({ name: 'music',       tag: `${data.albums.length} ALBUMS`, icon: 'music',     pivot: 'music',       c1: '#2a1a4e', c2: '#0a0514' }),
    actionTile({ name: 'projects',    tag: `${data.projects.length} REPOS`, icon: 'code-2',    pivot: 'projects',    c1: '#0a3a3a', c2: '#020a0a' }),
    actionTile({ name: 'words',       tag: `${data.words.length} ESSAYS`,   icon: 'pen-line',  pivot: 'words',       c1: '#1a1a3e', c2: '#0a0a14' }),
    actionTile({ name: 'photography', tag: `${data.photos.length} FRAMES`,  icon: 'camera',    pivot: 'photography', c1: '#3a2a18', c2: '#0a0805' }),
  ].join('');
}

export function renderQuickplayHistory(data: SiteData): string {
  const recentAlbums = recentTracksToAlbums(data.recentlyPlayed, 5);
  // Live snapshot path; fall back to top-album list when fewer than 5 distinct
  // recents (cold start, sparse listening).
  const items = recentAlbums.length >= 5 ? recentAlbums : [
    data.albums[11] || data.albums[0],
    data.albums[8]  || data.albums[1],
    data.albums[10] || data.albums[2],
    data.albums[14] || data.albums[3],
    data.albums[15] || data.albums[4],
  ].filter(Boolean);
  return items.map((a, i) => albumTile(a, { big: i === 0 })).join('');
}

export function renderQuickplaySmart(data: SiteData): string {
  // Prefer real top artists with their photos; fall back to top albums when
  // stats.fm hasn't returned an artist list yet.
  const items = data.topArtists.length
    ? data.topArtists.slice(0, 8).map(ar => ({
        name: ar.name,
        image: ar.image,
        url: ar.url,
        followers: ar.followers,
      }))
    : data.albums.slice(0, 8).map(a => ({
        name: a.artist,
        image: a.coverUrl,
        url: a.url,
        c1: a.c1,
        c2: a.c2,
      }));
  return items.map(smartTile).join('');
}
