// Build pipeline. Pulls live data from stats.fm, SoundCloud, Instagram and
// GitHub; merges with the curated content in data/content.json; persists the
// snapshot to data/snapshot.json; SSRs <App data={...} /> into index.html;
// and bundles the client entry to ./client.js for the browser.

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build as esbuild } from 'esbuild';

import { fetchStatsFm } from './sources/statsfm.js';
import { fetchSoundCloudLikes } from './sources/soundcloud.js';
import { fetchInstagramPhotos, scavengeInstagramFromDisk } from './sources/instagram.js';
import { fetchProjectStats } from './sources/github.js';
import { collectImages, gcImages } from './lib/images.js';
import { readPrevSnapshot, stabiliseTimestamp, writeSnapshotFile } from './lib/snapshot-io.js';

import { buildSiteData } from './render/shape.js';
import { writeRoutes } from './render/write-routes.js';

import type {
  ContentFile, GithubRepoStats, InstagramData, Snapshot, SiteData,
  SoundCloudData, SoundCloudLike,
} from './lib/types.js';

const STATSFM_USER = process.env.STATSFM_USER ?? 'afr';
const SC_USER = process.env.SC_USER ?? '0xdeafcafe';
const IG_USER = process.env.IG_USER ?? 'afr.png';
const OUT = resolve(process.env.OUT ?? 'data/snapshot.json');
const HTML = resolve(process.env.HTML ?? 'index.html');
const CONTENT = resolve(process.env.CONTENT ?? 'data/content.json');
const CLIENT_OUT = resolve(process.env.CLIENT_OUT ?? 'client.js');
const CLIENT_ENTRY = resolve('scripts/client/main.ts');
const DATA_OUT = resolve(process.env.DATA_OUT ?? 'data.json');

// SKIP_FETCH=1 short-circuits every upstream and rebuilds purely from the
// previous data/snapshot.json. Useful for renderer iteration without hitting
// live APIs.
const SKIP_FETCH = process.env.SKIP_FETCH === '1';
const SKIP_STATSFM = SKIP_FETCH || process.env.SKIP_STATSFM === '1';
const SKIP_SOUNDCLOUD = SKIP_FETCH || process.env.SKIP_SOUNDCLOUD === '1';
const SKIP_INSTAGRAM = SKIP_FETCH || process.env.SKIP_INSTAGRAM === '1';
const SKIP_GITHUB = SKIP_FETCH || process.env.SKIP_GITHUB === '1';

const LIMITS = {
  albums: Number(process.env.ALBUMS_LIMIT ?? '24'),
  artists: Number(process.env.ARTISTS_LIMIT ?? '20'),
  tracks: Number(process.env.TRACKS_LIMIT ?? '20'),
  genres: Number(process.env.GENRES_LIMIT ?? '20'),
  recent: Number(process.env.RECENT_LIMIT ?? '20'),
};
const SC_LIKES_LIMIT = Number(process.env.SC_LIKES_LIMIT ?? '200');
const IG_LIMIT = Number(process.env.IG_LIMIT ?? '30');

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

async function loadContent(): Promise<ContentFile> {
  const raw = await readFile(CONTENT, 'utf8');
  const parsed = JSON.parse(raw) as ContentFile;
  if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.words)) {
    throw new Error(`${CONTENT}: expected { projects: [...], words: [...] }`);
  }
  return parsed;
}

async function writeSite(data: SiteData): Promise<void> {
  const routes = await writeRoutes(HTML, data);
  for (const r of routes) {
    console.log(`[ssr] ${r.out.padEnd(28)} ${(r.bytes / 1024).toFixed(1)}kb (pivot=${r.pivot})`);
  }
  const full = JSON.stringify(data);
  await writeFile(DATA_OUT, full, 'utf8');
  console.log(`[ssr] ${'data.json'.padEnd(28)} ${(full.length / 1024).toFixed(1)}kb`);
}

async function bundleClient(): Promise<void> {
  const result = await esbuild({
    entryPoints: [CLIENT_ENTRY],
    bundle: true,
    minify: true,
    format: 'esm',
    // esnext so the import attribute (`with { type: 'json' }`) survives
    // — at lower targets esbuild strips it as unsupported syntax and the
    // browser tries to load /data.json as a JS module, MIME-mismatching.
    target: 'esnext',
    outfile: CLIENT_OUT,
    sourcemap: 'linked',
    // The browser resolves these at runtime — keeps data.json out of the
    // bundle so it can be cached/HTTP-revalidated independently of the JS.
    external: ['/data.json'],
    logLevel: 'info',
  });
  if (result.errors.length) throw new Error('[esbuild] failed');
}

async function main() {
  const content = await loadContent();
  console.log(`[content] ${content.projects.length} projects, ${content.words.length} essays`);

  const prev = await readPrevSnapshot(OUT);

  const statsfm = SKIP_STATSFM
    ? {
        topAlbums: prev?.topAlbums ?? [],
        topArtists: prev?.topArtists ?? [],
        topArtistsLifetime: prev?.topArtistsLifetime ?? [],
        topArtistsLastYear: prev?.topArtistsLastYear ?? [],
        topTracks: prev?.topTracks ?? [],
        topGenres: prev?.topGenres ?? [],
        recentlyPlayed: prev?.recentlyPlayed ?? [],
        stats: prev?.stats,
        dateStats: prev?.dateStats,
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

  const used = await collectImages(snapshot);
  await gcImages(used);

  const stable = await stabiliseTimestamp(OUT, snapshot);
  await writeSnapshotFile(OUT, stable);
  console.log(`[snapshot] wrote ${OUT}`);

  const data = buildSiteData(stable, content);
  await writeSite(data);
  await bundleClient();
}

main().catch(err => {
  console.error('[build] failed:', err);
  process.exit(1);
});
