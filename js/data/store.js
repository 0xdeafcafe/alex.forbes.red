// Single source of truth for runtime data. Reads the embedded snapshot once
// and exposes already-resolved arrays so consumers don't need to know whether
// they're looking at live data or the fallback.

import { paletteFor } from '../lib/palette.js';
import { igCaptionTitle, igPhotoSubtitle } from '../lib/format.js';
import { loadEmbeddedSnapshot } from './snapshot.js';
import { fallbackAlbums, fallbackPhotos, projects as rawProjects, words, projectTones } from './fallback.js';

export const musicSnapshot = loadEmbeddedSnapshot();

// ---- Albums ----------------------------------------------------------------
// Use the live snapshot when present; tag in deterministic c1/c2 colors so
// missing covers still render as a colored gradient + monogram instead of a
// blank tile.
export const albums = musicSnapshot
  ? musicSnapshot.topAlbums.map(a => {
      const pal = paletteFor(`${a.artist}::${a.name}`);
      return {
        artist: a.artist,
        name: a.name,
        year: a.year,
        coverUrl: a.coverUrl,
        url: a.url,
        large: !!a.large,
        c1: pal.c1,
        c2: pal.c2,
      };
    })
  : fallbackAlbums;

// Stats.fm sometimes batches play-times so multiple tracks that landed in
// the same refresh window all read "just now". Spread the leading in-window
// items evenly from now → 30m so the recents list reads as a gradient. The
// 30-min span matches the music-refresh cron in .github/workflows.
const RECENT_REFRESH_WINDOW_MS = 30 * 60 * 1000;
function distributeRecentTimes(items) {
  if (items.length < 2) return items;
  const now = Date.now();
  let count = 0;
  for (const it of items) {
    const t = new Date(it.endTime).getTime();
    if (!Number.isFinite(t) || now - t >= RECENT_REFRESH_WINDOW_MS) break;
    count++;
  }
  if (count < 2) return items;
  const step = RECENT_REFRESH_WINDOW_MS / (count - 1);
  return items.map((it, i) => (
    i < count
      ? { ...it, endTime: new Date(now - i * step).toISOString() }
      : it
  ));
}

export const recentlyPlayed = distributeRecentTimes(musicSnapshot?.recentlyPlayed ?? []);
export const topArtists = musicSnapshot?.topArtists ?? [];
export const topTracks = musicSnapshot?.topTracks ?? [];
export const soundcloudData = musicSnapshot?.soundcloud ?? null;

// ---- Photos ----------------------------------------------------------------
// Newest first. Real fetches return chronological order already; this also
// fixes scavenged-from-disk data which was alphabetical-by-filename.
const igRaw = (musicSnapshot?.instagram?.photos ?? [])
  .slice()
  .sort((a, b) => {
    const ta = +new Date(a.takenAt || 0);
    const tb = +new Date(b.takenAt || 0);
    if (tb !== ta) return tb - ta;
    // Fallback when scavenged photos all have epoch-0 takenAt: IG shortcodes
    // are roughly chronological lexicographically.
    return (b.shortcode || '').localeCompare(a.shortcode || '');
  });

export const photos = igRaw.length
  ? igRaw.map((p, i) => {
      const ratio = p.width && p.height ? p.height / p.width : 1;
      const tall = ratio > 1.18;
      const wide = ratio < 0.85;
      const titleFromCaption = igCaptionTitle(p.caption);
      return {
        url: p.imageUrl,
        title: titleFromCaption || (p.altText ? p.altText.slice(0, 80) : 'untitled'),
        loc: igPhotoSubtitle(p),
        instagramUrl: p.url,
        takenAt: p.takenAt,
        // Sprinkle a few featured 2x2 tiles through the mosaic.
        large: !tall && !wide && (i === 0 || i === 6 || i === 13 || i === 20),
        tall,
        wide,
      };
    })
  : fallbackPhotos;

// Merge GitHub stats (stars / language / last pushed) into the project list
// when the snapshot has them. Each project becomes:
//   { ...originalFallback, github: { stars, language, pushedAt, topics, ... } }
const githubByUrl = new Map(
  (musicSnapshot?.github ?? []).map(g => [g.url, g])
);
export const projects = rawProjects.map(p => {
  const stats = githubByUrl.get(p.url);
  return stats ? { ...p, github: stats } : p;
});

// Re-export the rest so consumers only need ../data/store.js.
export { words, projectTones };
