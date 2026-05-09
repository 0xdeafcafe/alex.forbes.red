// Snapshot pipeline orchestrator. Pulls live data from stats.fm, SoundCloud,
// and Instagram, persists it to data/music.json, and embeds the same payload
// into index.html for build-time SSR.
//
// Resilience: each upstream is independent; when one fails its previous-run
// data is reused (or scavenged from disk for IG) so transient rate-limits
// don't wipe a section of the site. See ./sources/* for the source-specific
// scrape/fetch logic.
//
// Run: `npm run fetch:music`. CI cron lives in .github/workflows/update-music.yml.

import { resolve } from 'node:path';
import { fetchStatsFm } from './sources/statsfm.js';
import { fetchSoundCloudLikes } from './sources/soundcloud.js';
import { fetchInstagramPhotos, scavengeInstagramFromDisk } from './sources/instagram.js';
import { fetchProjectStats } from './sources/github.js';
import { collectImages, gcImages } from './lib/images.js';
import { readPrevSnapshot, stabiliseTimestamp, writeSnapshotFile } from './lib/snapshot-io.js';
import { embedInHtml } from './lib/embed.js';
import type { GithubRepoStats, InstagramData, MusicSnapshot, SoundCloudData, SoundCloudLike } from './lib/types.js';

// Source of truth for project URLs the frontend renders. Must stay in sync
// with js/data/fallback.js (kept here so the fetcher doesn't need to read
// JS modules at build time).
const PROJECT_URLS = [
  'https://github.com/langwatch/langwatch',
  'https://github.com/0xdeafcafe/tslsp-mcp',
  'https://github.com/0xdeafcafe/vs-extension-workforest',
  'https://github.com/0xdeafcafe/AirPodsProLapse',
  'https://github.com/0xdeafcafe/terminal-surfer',
  'https://github.com/0xdeafcafe/moron',
  'https://github.com/0xdeafcafe/react-contextual-analytics',
  'https://github.com/0xdeafcafe/cypher-swift',
  'https://github.com/0xdeafcafe/focus',
  'https://github.com/0xdeafcafe/ezy-qr',
  'https://github.com/0xdeafcafe/pillar-box',
  'https://github.com/XboxChaos/Assembly',
  'https://github.com/0xdeafcafe/go-xbdm',
  'https://github.com/0xdeafcafe/branch',
];

const STATSFM_USER = process.env.STATSFM_USER ?? 'afr';
const SC_USER = process.env.SC_USER ?? '0xdeafcafe';
const IG_USER = process.env.IG_USER ?? 'afr.png';
const OUT = resolve(process.env.OUT ?? 'data/music.json');
const HTML = resolve(process.env.HTML ?? 'index.html');
const SKIP_SOUNDCLOUD = process.env.SKIP_SOUNDCLOUD === '1';
const SKIP_INSTAGRAM = process.env.SKIP_INSTAGRAM === '1';
const SKIP_GITHUB = process.env.SKIP_GITHUB === '1';

const LIMITS = {
  albums: Number(process.env.ALBUMS_LIMIT ?? '24'),
  artists: Number(process.env.ARTISTS_LIMIT ?? '20'),
  tracks: Number(process.env.TRACKS_LIMIT ?? '20'),
  recent: Number(process.env.RECENT_LIMIT ?? '20'),
};
const SC_LIKES_LIMIT = Number(process.env.SC_LIKES_LIMIT ?? '200');
const IG_LIMIT = Number(process.env.IG_LIMIT ?? '30');

/**
 * Merge fresh SC likes with the previous snapshot. The fetch only returns the
 * most-recent N likes — naively replacing prev would drop everything older
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

async function resolveSoundCloud(prev: MusicSnapshot | null): Promise<SoundCloudData | undefined> {
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

async function resolveInstagram(prev: MusicSnapshot | null): Promise<InstagramData | undefined> {
  if (SKIP_INSTAGRAM) return prev?.instagram;

  // Always pull all three sources — they're cheap (cached HTTP / single
  // readdir) and merging them defends against partial-paginate failures.
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
  if (userId) {
    return { user: IG_USER, userId, photos: [] };
  }
  return undefined;
}

async function resolveGithub(prev: MusicSnapshot | null): Promise<GithubRepoStats[] | undefined> {
  if (SKIP_GITHUB) return prev?.github;
  const fresh = await fetchProjectStats(PROJECT_URLS);
  if (fresh.length) return fresh;
  if (prev?.github?.length) {
    console.log(`[github] reusing ${prev.github.length} repos from previous snapshot`);
    return prev.github;
  }
  return undefined;
}

async function main() {
  console.log(`[stats.fm] fetching for user "${STATSFM_USER}" -> ${OUT}`);
  const prev = await readPrevSnapshot(OUT);

  const statsfm = await fetchStatsFm(STATSFM_USER, LIMITS);
  const soundcloud = await resolveSoundCloud(prev);
  const instagram = await resolveInstagram(prev);
  const github = await resolveGithub(prev);

  const snapshot: MusicSnapshot = {
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

  console.log(`[stats.fm] wrote ${OUT}`);
  console.log(`  topAlbums:        ${snapshot.topAlbums.length}`);
  console.log(`  topArtists:       ${snapshot.topArtists.length}`);
  console.log(`  topTracks:        ${snapshot.topTracks.length}`);
  console.log(`  recentlyPlayed:   ${snapshot.recentlyPlayed.length}`);
  console.log(`  soundcloudLikes:  ${snapshot.soundcloud?.likes.length ?? '–'}`);
  console.log(`  instagramPhotos:  ${snapshot.instagram?.photos.length ?? '–'}`);
  console.log(`  githubRepos:      ${snapshot.github?.length ?? '–'}`);
  console.log(`  imagesOnDisk:     ${used.size}`);

  await embedInHtml(HTML, snapshot);
}

main().catch(err => {
  console.error('[stats.fm] failed:', err);
  process.exit(1);
});
