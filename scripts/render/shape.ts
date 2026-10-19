// Reshape the raw snapshot + curated content into a single SiteData object
// that components consume. All UI-affecting decisions (palette tagging, tile
// sizing, caption cleanup) happen here so renderers stay declarative and the
// inlined client payload doesn't need to redo them.

import { paletteFor } from './palette.js';
import articles from '../../data/articles.json' with { type: 'json' };
import { photoDate } from './format.js';
import type {
  Album,
  ArticleContent,
  ContentFile,
  DisplayPhoto,
  GithubRepoStats,
  PhotoContent,
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

function shapePhotos(photos: PhotoContent[]): DisplayPhoto[] {
  // The manifest order is editorial; adding a photo never reshuffles older frames.
  return photos.map((p, i) => {
    const ratio = p.height / p.width;
    const tall = ratio > 1.18;
    const wide = ratio < 0.85;
    return {
      url: p.src,
      title: p.title,
      alt: p.alt,
      loc: p.location || photoDate(p),
      takenAt: p.takenAt,
      large: !tall && !wide && (i === 0 || i === 6 || i === 13 || i === 20),
      tall,
      wide,
    };
  });
}

export function buildSiteData(snapshot: Snapshot, content: ContentFile, photos: PhotoContent[]): SiteData {
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
    photos: shapePhotos(photos),
    projects,
    words: content.words.map(word => ({
      ...word,
      article: word.articleId ? (articles as unknown as Record<string, ArticleContent>)[word.articleId] : undefined,
    })),
  };
}
