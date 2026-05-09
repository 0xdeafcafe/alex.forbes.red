// Build pipeline. Pulls live data from stats.fm, SoundCloud, Instagram and
// GitHub; merges with the curated content in data/content.json; persists the
// snapshot to data/snapshot.json; and pre-renders every dynamic section of
// index.html so the page is meaningful without JS.
//
// Run: `npm run build`. CI cron lives in .github/workflows/update-snapshot.yml.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { fetchStatsFm } from './sources/statsfm.js';
import { fetchSoundCloudLikes } from './sources/soundcloud.js';
import { fetchInstagramPhotos, scavengeInstagramFromDisk } from './sources/instagram.js';
import { fetchProjectStats } from './sources/github.js';
import { collectImages, gcImages } from './lib/images.js';
import { readPrevSnapshot, stabiliseTimestamp, writeSnapshotFile } from './lib/snapshot-io.js';
import { ssrIntoHtml, type Slot } from './lib/ssr.js';

import { buildSiteData } from './render/shape.js';
import { renderQuickplayStart, renderQuickplayHistory, renderQuickplaySmart } from './render/pages/quickplay.js';
import { renderMusicMosaic, renderMusicArtists, renderMusicRecent, renderMusicSoundcloud, renderStatsFmMeta, renderSoundcloudMeta } from './render/pages/music.js';
import { renderProjectsGrid } from './render/pages/projects.js';
import { renderWordsGrid } from './render/pages/words.js';
import { renderPhotoMosaic, renderInstagramMeta } from './render/pages/photography.js';

import type {
  ClientData,
  ContentFile,
  GithubRepoStats,
  InstagramData,
  Snapshot,
  SiteData,
  SoundCloudData,
  SoundCloudLike,
} from './lib/types.js';

const STATSFM_USER = process.env.STATSFM_USER ?? 'afr';
const SC_USER = process.env.SC_USER ?? '0xdeafcafe';
const IG_USER = process.env.IG_USER ?? 'afr.png';
const OUT = resolve(process.env.OUT ?? 'data/snapshot.json');
const HTML = resolve(process.env.HTML ?? 'index.html');
const CONTENT = resolve(process.env.CONTENT ?? 'data/content.json');
// SKIP_FETCH=1 short-circuits every upstream and rebuilds the snapshot +
// SSR'd HTML purely from the previous data/snapshot.json. Useful for local
// renderer iteration without hitting live APIs.
const SKIP_FETCH = process.env.SKIP_FETCH === '1';
const SKIP_STATSFM = SKIP_FETCH || process.env.SKIP_STATSFM === '1';
const SKIP_SOUNDCLOUD = SKIP_FETCH || process.env.SKIP_SOUNDCLOUD === '1';
const SKIP_INSTAGRAM = SKIP_FETCH || process.env.SKIP_INSTAGRAM === '1';
const SKIP_GITHUB = SKIP_FETCH || process.env.SKIP_GITHUB === '1';

const LIMITS = {
  albums: Number(process.env.ALBUMS_LIMIT ?? '24'),
  artists: Number(process.env.ARTISTS_LIMIT ?? '20'),
  tracks: Number(process.env.TRACKS_LIMIT ?? '20'),
  recent: Number(process.env.RECENT_LIMIT ?? '20'),
};
const SC_LIKES_LIMIT = Number(process.env.SC_LIKES_LIMIT ?? '200');
const IG_LIMIT = Number(process.env.IG_LIMIT ?? '30');

/**
 * Merge fresh SC likes with the previous snapshot. The fetch only returns
 * the most-recent N — naively replacing prev would drop everything older
 * than that window every refresh.
 *
 * Rules:
 *  - Items in `fresh` always win (replace prev metadata for the same URL).
 *  - A prev item missing from `fresh` is kept iff it's older than the oldest
 *    fresh item (out of the fresh window's reach). If it sits inside the
 *    fresh window and isn't there, it was un-liked → drop.
 *  - No hard cap on the merged result; the list grows organically as new
 *    likes land and only shrinks on un-likes.
 */
function mergeSoundCloudLikes(fresh: SoundCloudLike[], prev: SoundCloudLike[]): SoundCloudLike[] {
  if (!prev.length) return fresh;
  if (!fresh.length) return prev;

  const freshUrls = new Set(fresh.map(l => l.url));
  const oldestFreshTime = fresh.reduce(
    (min, l) => Math.min(min, +new Date(l.likedAt)),
    Number.POSITIVE_INFINITY,
  );

  const carriedOver = prev.filter(l => {
    if (freshUrls.has(l.url)) return false;
    const t = +new Date(l.likedAt);
    return Number.isFinite(t) && t < oldestFreshTime;
  });

  const merged = [...fresh, ...carriedOver];
  merged.sort((a, b) => +new Date(b.likedAt) - +new Date(a.likedAt));
  return merged;
}

async function resolveSoundCloud(prev: Snapshot | null): Promise<SoundCloudData | undefined> {
  if (SKIP_SOUNDCLOUD) return prev?.soundcloud;
  const fresh = await fetchSoundCloudLikes(SC_USER, SC_LIKES_LIMIT);
  const prevLikes = prev?.soundcloud?.likes ?? [];

  if (fresh && fresh.length) {
    const merged = mergeSoundCloudLikes(fresh, prevLikes);
    const carried = merged.length - fresh.length;
    if (carried > 0) {
      console.log(`[soundcloud] merged ${fresh.length} fresh + ${carried} carried = ${merged.length} likes`);
    } else {
      console.log(`[soundcloud] ${fresh.length} likes (no carry-over)`);
    }
    return { user: SC_USER, likes: merged };
  }
  if (prevLikes.length) {
    console.log(`[soundcloud] reusing ${prevLikes.length} likes from previous snapshot`);
    return prev?.soundcloud;
  }
  return undefined;
}

/**
 * Merge in priority order — earlier sources win on duplicate shortcodes,
 * so fresh > prev > scavenged for metadata. Sort newest first and cap to
 * IG_LIMIT.
 */
function mergeIgPhotos(...sources: InstagramData['photos'][]): InstagramData['photos'] {
  const seen = new Set<string>();
  const merged: InstagramData['photos'] = [];
  for (const source of sources) {
    for (const p of source) {
      if (seen.has(p.shortcode)) continue;
      seen.add(p.shortcode);
      merged.push(p);
    }
  }
  merged.sort((a, b) => +new Date(b.takenAt || 0) - +new Date(a.takenAt || 0));
  return merged.slice(0, IG_LIMIT);
}

async function resolveInstagram(prev: Snapshot | null): Promise<InstagramData | undefined> {
  if (SKIP_INSTAGRAM) return prev?.instagram;

  // All three sources are cheap (cached HTTP / single readdir); merging
  // defends against partial-paginate failures.
  const fresh = await fetchInstagramPhotos(IG_USER, IG_LIMIT, prev?.instagram?.userId);
  const prevPhotos = prev?.instagram?.photos ?? [];
  const scavenged = await scavengeInstagramFromDisk();

  const userId = fresh?.userId ?? prev?.instagram?.userId;
  const photos = mergeIgPhotos(fresh?.photos ?? [], prevPhotos, scavenged);

  if (photos.length) {
    const sources = [
      fresh?.photos.length ? `${fresh.photos.length} fresh` : null,
      prevPhotos.length ? `${prevPhotos.length} prev` : null,
      scavenged.length ? `${scavenged.length} disk` : null,
    ].filter(Boolean).join(' + ');
    console.log(`[instagram] resolved ${photos.length} photos (${sources})`);
    return { user: IG_USER, userId, photos };
  }
  if (userId) return { user: IG_USER, userId, photos: [] };
  return undefined;
}

async function resolveGithub(projectUrls: string[], prev: Snapshot | null): Promise<GithubRepoStats[] | undefined> {
  if (SKIP_GITHUB) return prev?.github;
  const fresh = await fetchProjectStats(projectUrls);
  if (fresh.length) return fresh;
  if (prev?.github?.length) {
    console.log(`[github] reusing ${prev.github.length} repos from previous snapshot`);
    return prev.github;
  }
  return undefined;
}

// Slim payload embedded into index.html for the client-side modules that
// still need data (tile-bg flipper + last-spun rotator). Trimmed compared to
// the full snapshot — most fields are already baked into the SSR output.
function buildClientPayload(data: SiteData): ClientData {
  return {
    albums: data.albums.map(a => ({
      artist: a.artist, name: a.name, coverUrl: a.coverUrl, url: a.url, c1: a.c1, c2: a.c2,
    })),
    photos: data.photos.map(p => ({
      url: p.url, title: p.title, loc: p.loc, instagramUrl: p.instagramUrl, takenAt: p.takenAt,
    })),
    recentlyPlayed: data.recentlyPlayed.map(t => ({
      name: t.name, artist: t.artist, album: t.album, coverUrl: t.coverUrl, endTime: t.endTime, url: t.url,
    })),
    words: data.words,
    projects: data.projects.map(p => ({ name: p.name, tag: p.tag, url: p.url })),
  };
}

async function loadContent(): Promise<ContentFile> {
  const raw = await readFile(CONTENT, 'utf8');
  const parsed = JSON.parse(raw) as ContentFile;
  if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.words)) {
    throw new Error(`${CONTENT}: expected { projects: [...], words: [...] }`);
  }
  return parsed;
}

async function main() {
  const content = await loadContent();
  console.log(`[content] ${content.projects.length} projects, ${content.words.length} essays`);

  const prev = await readPrevSnapshot(OUT);

  const statsfm = SKIP_STATSFM
    ? {
        topAlbums: prev?.topAlbums ?? [],
        topArtists: prev?.topArtists ?? [],
        topTracks: prev?.topTracks ?? [],
        recentlyPlayed: prev?.recentlyPlayed ?? [],
      }
    : (console.log(`[stats.fm] fetching for user "${STATSFM_USER}" -> ${OUT}`),
       await fetchStatsFm(STATSFM_USER, LIMITS));
  const soundcloud = await resolveSoundCloud(prev);
  const instagram = await resolveInstagram(prev);
  const projectUrls = content.projects.map(p => p.url);
  const github = await resolveGithub(projectUrls, prev);

  const snapshot: Snapshot = {
    generatedAt: new Date().toISOString(),
    user: STATSFM_USER,
    ...statsfm,
    ...(soundcloud ? { soundcloud } : {}),
    ...(instagram ? { instagram } : {}),
    ...(github ? { github } : {}),
  };

  // Pin top-album + top-artist images locally; smallify all remote URLs.
  const used = await collectImages(snapshot);
  await gcImages(used);

  const stable = await stabiliseTimestamp(OUT, snapshot);
  await writeSnapshotFile(OUT, stable);

  console.log(`[snapshot] wrote ${OUT}`);
  console.log(`  topAlbums:        ${snapshot.topAlbums.length}`);
  console.log(`  topArtists:       ${snapshot.topArtists.length}`);
  console.log(`  topTracks:        ${snapshot.topTracks.length}`);
  console.log(`  recentlyPlayed:   ${snapshot.recentlyPlayed.length}`);
  console.log(`  soundcloudLikes:  ${snapshot.soundcloud?.likes.length ?? '–'}`);
  console.log(`  instagramPhotos:  ${snapshot.instagram?.photos.length ?? '–'}`);
  console.log(`  githubRepos:      ${snapshot.github?.length ?? '–'}`);
  console.log(`  imagesOnDisk:     ${used.size}`);

  const data = buildSiteData(stable, content);
  const slots: Slot[] = [
    { name: 'qp-start',           html: renderQuickplayStart(data) },
    { name: 'qp-history',         html: renderQuickplayHistory(data) },
    { name: 'qp-smart',           html: renderQuickplaySmart(data) },
    { name: 'music-mosaic',       html: renderMusicMosaic(data) },
    { name: 'music-artists',      html: renderMusicArtists(data) },
    { name: 'music-recent',       html: renderMusicRecent(data) },
    { name: 'music-soundcloud',   html: renderMusicSoundcloud(data) },
    { name: 'music-meta',         html: renderStatsFmMeta(data) },
    { name: 'music-soundcloud-meta', html: renderSoundcloudMeta(data) },
    { name: 'projects-grid',      html: renderProjectsGrid(data) },
    { name: 'words-grid',         html: renderWordsGrid(data) },
    { name: 'photo-mosaic',       html: renderPhotoMosaic(data) },
    { name: 'photography-meta',   html: renderInstagramMeta(data) },
  ];
  await ssrIntoHtml(HTML, slots, JSON.stringify(buildClientPayload(data)));
}

main().catch(err => {
  console.error('[build] failed:', err);
  process.exit(1);
});
