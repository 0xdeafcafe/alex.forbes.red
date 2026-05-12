// Reshape the raw snapshot + curated content into a single SiteData object
// that components consume. All UI-affecting decisions (palette tagging, tile
// sizing, caption cleanup) happen here so renderers stay declarative and the
// inlined client payload doesn't need to redo them.

import { paletteFor } from './palette.js';
import { igCaptionTitle, igPhotoSubtitle } from './format.js';
import type {
  Album,
  ContentFile,
  DisplayPhoto,
  GithubRepoStats,
  InstagramPhotoRaw,
  SiteData,
  Snapshot,
} from '../lib/types.js';

const RECENT_REFRESH_WINDOW_MS = 30 * 60 * 1000;

// Stats.fm sometimes batches play-times — multiple tracks landing in the same
// refresh window all read "just now". Spread the leading in-window items
// evenly from now → 30m so the recents list reads as a gradient.
function distributeRecentTimes<T extends { endTime: string }>(items: T[]): T[] {
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

function tagAlbums(albums: Album[]): Album[] {
  return albums.map(a => {
    const pal = paletteFor(`${a.artist}::${a.name}`);
    return { ...a, c1: pal.c1, c2: pal.c2 };
  });
}

function shapePhotos(photos: InstagramPhotoRaw[]): DisplayPhoto[] {
  // Newest first; ties broken by shortcode (IG shortcodes are ~chronological).
  const sorted = photos.slice().sort((a, b) => {
    const ta = +new Date(a.takenAt || 0);
    const tb = +new Date(b.takenAt || 0);
    if (tb !== ta) return tb - ta;
    return (b.shortcode || '').localeCompare(a.shortcode || '');
  });

  return sorted.map((p, i) => {
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
  });
}

export function buildSiteData(snapshot: Snapshot, content: ContentFile): SiteData {
  const githubByUrl = new Map<string, GithubRepoStats>(
    (snapshot.github ?? []).map(g => [g.url, g]),
  );
  const projects = content.projects.map(p => {
    const stats = githubByUrl.get(p.url);
    return stats ? { ...p, github: stats } : p;
  });

  return {
    user: snapshot.user,
    statsFmUser: snapshot.user,
    instagramUser: snapshot.instagram?.user,
    soundcloudUser: snapshot.soundcloud?.user,
    albums: tagAlbums(snapshot.topAlbums),
    topArtists: snapshot.topArtists,
    topArtistsLifetime: snapshot.topArtistsLifetime ?? [],
    topArtistsLastYear: snapshot.topArtistsLastYear ?? [],
    topTracks: snapshot.topTracks ?? [],
    topGenres: snapshot.topGenres ?? [],
    recentlyPlayed: distributeRecentTimes(snapshot.recentlyPlayed),
    statsfmStats: snapshot.stats ?? null,
    statsfmDateStats: snapshot.dateStats ?? null,
    soundcloud: snapshot.soundcloud ?? null,
    photos: shapePhotos(snapshot.instagram?.photos ?? []),
    projects,
    words: content.words,
  };
}
