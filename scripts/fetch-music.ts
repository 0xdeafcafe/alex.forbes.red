// Fetches stats.fm data for a user and writes it to data/music.json.
// Run: `npm run fetch:music`  (env: STATSFM_USER=afr by default)
// Used by .github/workflows/update-music.yml on a 10-minute cron.

import { writeFile, readFile, mkdir, stat, readdir, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const USER = process.env.STATSFM_USER ?? 'afr';
const SC_USER = process.env.SC_USER ?? '0xdeafcafe';
const IG_USER = process.env.IG_USER ?? 'afr.png';
const OUT = resolve(process.env.OUT ?? 'data/music.json');
const HTML = resolve(process.env.HTML ?? 'index.html');
const IMAGES_DIR = process.env.IMAGES_DIR ?? 'images';
const SKIP_IMAGES = process.env.SKIP_IMAGES === '1';
const SKIP_SOUNDCLOUD = process.env.SKIP_SOUNDCLOUD === '1';
const SKIP_INSTAGRAM = process.env.SKIP_INSTAGRAM === '1';
const ALBUMS_LIMIT = Number(process.env.ALBUMS_LIMIT ?? '24');
const ARTISTS_LIMIT = Number(process.env.ARTISTS_LIMIT ?? '20');
const TRACKS_LIMIT = Number(process.env.TRACKS_LIMIT ?? '20');
const RECENT_LIMIT = Number(process.env.RECENT_LIMIT ?? '20');
const SC_LIKES_LIMIT = Number(process.env.SC_LIKES_LIMIT ?? '200');
const IG_LIMIT = Number(process.env.IG_LIMIT ?? '30');
const IMAGE_CONCURRENCY = 6;

const API = 'https://api.stats.fm/api/v1';

interface ApiList<T> { items?: T[] }
interface RawAlbum {
  position?: number;
  streams?: number | null;
  album: {
    name: string;
    image?: string;
    releaseDate?: number | string | null;
    artists?: { name: string }[];
    externalIds?: { spotify?: string[] };
  };
}
interface RawArtist {
  position?: number;
  streams?: number | null;
  artist: {
    name: string;
    image?: string;
    followers?: number;
    externalIds?: { spotify?: string[] };
  };
}
interface RawTrack {
  position?: number;
  streams?: number | null;
  track: RawTrackInner;
}
interface RawTrackInner {
  name: string;
  durationMs?: number;
  artists?: { name: string }[];
  albums?: { name: string; image?: string }[];
  externalIds?: { spotify?: string[] };
}
interface RawRecent {
  endTime: string;
  durationMs?: number;
  track: RawTrackInner;
}

export interface Album {
  artist: string;
  name: string;
  year?: number;
  coverUrl?: string;
  url?: string;
  streams?: number | null;
  position?: number;
  large?: boolean;
}
export interface Artist {
  name: string;
  image?: string;
  followers?: number;
  position?: number;
  url?: string;
}
export interface Track {
  name: string;
  artist: string;
  artists?: string[];
  album?: string;
  coverUrl?: string;
  durationMs?: number;
  position?: number;
  url?: string;
}
export interface Recent {
  name: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  endTime: string;
  durationMs?: number;
  url?: string;
}
export interface SoundCloudLike {
  title: string;
  artist: string;
  artworkUrl?: string;
  url: string;
  durationMs?: number;
  genre?: string;
  likedAt: string;
  uploader?: string;
}
export interface SoundCloudData {
  user: string;
  likes: SoundCloudLike[];
}

export interface InstagramPhoto {
  shortcode: string;
  url: string;
  imageUrl: string;
  width: number;
  height: number;
  takenAt: string;
  caption?: string;
  isVideo: boolean;
  carousel: boolean;
  altText?: string;
}
export interface InstagramData {
  user: string;
  userId?: string;
  photos: InstagramPhoto[];
}

export interface MusicSnapshot {
  generatedAt: string;
  user: string;
  topAlbums: Album[];
  topArtists: Artist[];
  topTracks: Track[];
  recentlyPlayed: Recent[];
  soundcloud?: SoundCloudData;
  instagram?: InstagramData;
}

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) {
    const body = (await r.text()).slice(0, 200);
    throw new Error(`${url} -> ${r.status} ${r.statusText}: ${body}`);
  }
  return r.json() as Promise<T>;
}

function extractYear(date: number | string | null | undefined): number | undefined {
  if (date == null) return undefined;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.getUTCFullYear();
}

function spotifyUrl(kind: 'album' | 'artist' | 'track', ids?: { spotify?: string[] }): string | undefined {
  const id = ids?.spotify?.[0];
  return id ? `https://open.spotify.com/${kind}/${id}` : undefined;
}

function mapAlbum(it: RawAlbum, idx: number): Album {
  return {
    artist: it.album.artists?.[0]?.name ?? 'Unknown',
    name: it.album.name,
    year: extractYear(it.album.releaseDate),
    coverUrl: it.album.image,
    url: spotifyUrl('album', it.album.externalIds),
    streams: it.streams ?? null,
    position: it.position ?? idx + 1,
    // Sprinkle "large" tiles through the music mosaic for visual rhythm.
    large: idx === 0 || idx === 5 || idx === 11,
  };
}

function mapArtist(it: RawArtist, idx: number): Artist {
  return {
    name: it.artist.name,
    image: it.artist.image,
    followers: it.artist.followers,
    position: it.position ?? idx + 1,
    url: spotifyUrl('artist', it.artist.externalIds),
  };
}

function mapTrack(it: RawTrack, idx: number): Track {
  const t = it.track;
  return {
    name: t.name,
    artist: t.artists?.[0]?.name ?? 'Unknown',
    artists: t.artists?.map(a => a.name) ?? [],
    album: t.albums?.[0]?.name,
    coverUrl: t.albums?.[0]?.image,
    durationMs: t.durationMs,
    position: it.position ?? idx + 1,
    url: spotifyUrl('track', t.externalIds),
  };
}

function mapRecent(it: RawRecent): Recent {
  const t = it.track;
  return {
    name: t.name,
    artist: t.artists?.[0]?.name ?? 'Unknown',
    album: t.albums?.[0]?.name,
    coverUrl: t.albums?.[0]?.image,
    endTime: it.endTime,
    durationMs: it.durationMs ?? t.durationMs,
    url: spotifyUrl('track', t.externalIds),
  };
}

async function main() {
  console.log(`[stats.fm] fetching for user "${USER}" -> ${OUT}`);
  // Read the previous snapshot first so we can fall back to its SoundCloud /
  // Instagram blocks if those (rate-limit-prone) fetches fail this run.
  // Also lets us reuse the cached IG user_id and skip an extra IG round-trip.
  const prev = await readPrevSnapshot(OUT);

  const [albumsRes, artistsRes, tracksRes, recentRes] = await Promise.all([
    getJson<ApiList<RawAlbum>>(`${API}/users/${USER}/top/albums?range=lifetime&limit=${ALBUMS_LIMIT}`),
    getJson<ApiList<RawArtist>>(`${API}/users/${USER}/top/artists?range=lifetime&limit=${ARTISTS_LIMIT}`),
    getJson<ApiList<RawTrack>>(`${API}/users/${USER}/top/tracks?range=lifetime&limit=${TRACKS_LIMIT}`),
    getJson<ApiList<RawRecent>>(`${API}/users/${USER}/streams/recent?limit=${RECENT_LIMIT}`),
  ]);

  const scResult = SKIP_SOUNDCLOUD ? null : await fetchSoundCloudLikes(SC_USER, SC_LIKES_LIMIT);
  const igResult = SKIP_INSTAGRAM ? null : await fetchInstagramPhotos(IG_USER, IG_LIMIT, prev?.instagram?.userId);

  const scData =
    (scResult && scResult.length)
      ? { user: SC_USER, likes: scResult }
      : (prev?.soundcloud?.likes?.length
        ? (console.log(`[soundcloud] reusing ${prev.soundcloud.likes.length} likes from previous snapshot`), prev.soundcloud)
        : undefined);

  // Pick the freshest InstagramData source, preferring this run's photos but
  // gracefully degrading: prev snapshot's photos > scavenged-from-disk > just
  // the user_id (so the next run can skip the profile lookup) > nothing.
  let igData: InstagramData | undefined;
  if (igResult && igResult.photos.length) {
    igData = { user: IG_USER, userId: igResult.userId, photos: igResult.photos };
  } else if (prev?.instagram?.photos?.length) {
    console.log(`[instagram] reusing ${prev.instagram.photos.length} photos from previous snapshot`);
    igData = {
      ...prev.instagram,
      userId: igResult?.userId ?? prev.instagram.userId,
    };
  } else {
    const scavenged = await scavengeInstagramFromDisk();
    if (scavenged.length) {
      console.log(`[instagram] scavenged ${scavenged.length} photos from disk (no snapshot, no fresh fetch)`);
      igData = { user: IG_USER, userId: igResult?.userId, photos: scavenged };
    } else if (igResult?.userId) {
      igData = { user: IG_USER, userId: igResult.userId, photos: [] };
    }
  }

  const snapshot: MusicSnapshot = {
    generatedAt: new Date().toISOString(),
    user: USER,
    topAlbums: (albumsRes.items ?? []).map(mapAlbum),
    topArtists: (artistsRes.items ?? []).map(mapArtist),
    topTracks: (tracksRes.items ?? []).map(mapTrack),
    recentlyPlayed: (recentRes.items ?? []).map(mapRecent),
    ...(scData ? { soundcloud: scData } : {}),
    ...(igData ? { instagram: igData } : {}),
  };

  // Download album covers + artist photos locally so the site has no
  // external CDN dependency. This rewrites the URLs in `snapshot` to local
  // paths (e.g. `images/albums/abc123.jpg`).
  const usedImagePaths = await collectImages(snapshot);
  await gcImages(usedImagePaths);

  await mkdir(dirname(OUT), { recursive: true });

  // Preserve the previous generatedAt if the rest of the payload is unchanged,
  // so re-runs against unchanged stats.fm produce zero file diffs (and no commit).
  const stable = await stabiliseTimestamp(OUT, snapshot);
  await writeFile(OUT, JSON.stringify(stable, null, 2) + '\n', 'utf8');

  console.log(`[stats.fm] wrote ${OUT}`);
  console.log(`  topAlbums:        ${snapshot.topAlbums.length}`);
  console.log(`  topArtists:       ${snapshot.topArtists.length}`);
  console.log(`  topTracks:        ${snapshot.topTracks.length}`);
  console.log(`  recentlyPlayed:   ${snapshot.recentlyPlayed.length}`);
  console.log(`  soundcloudLikes:  ${snapshot.soundcloud?.likes.length ?? '–'}`);
  console.log(`  instagramPhotos:  ${snapshot.instagram?.photos.length ?? '–'}`);
  console.log(`  imagesOnDisk:     ${usedImagePaths.size}`);

  await embedInHtml(snapshot);
}

// ---- Instagram photos ------------------------------------------------------
// Public scraping via undocumented endpoints used by IG's own web app, with
// `X-IG-App-ID: 936619743392459` (a public, well-known web app id). Photos are
// always cached locally because the CDN URLs are short-lived signed links.
async function fetchInstagramPhotos(
  user: string,
  limit: number,
  cachedUserId?: string
): Promise<{ userId: string; photos: InstagramPhoto[] } | null> {
  // IG blocks node-style requests with "SecFetch Policy violation" unless
  // we send the Sec-Fetch-* headers a real browser would.
  const headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'x-ig-app-id': '936619743392459',
    'x-asbd-id': '198387',
    'x-requested-with': 'XMLHttpRequest',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'referer': `https://www.instagram.com/${user}/`,
  };

  // Step 1: resolve username -> numeric user_id (cached across runs to avoid
  // an extra request that contributes to rate-limit pressure).
  let userId = cachedUserId;
  if (!userId) {
    try {
      const r = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(user)}`,
        { headers }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json() as any;
      userId = j?.data?.user?.id;
      if (!userId) throw new Error('no user.id');
    } catch (e) {
      console.warn(`[instagram] profile lookup failed: ${(e as Error).message}`);
      return null;
    }
    // Small breather between profile lookup and feed fetch.
    await sleep(700);
  }
  console.log(`[instagram] user=${user} (${userId})${cachedUserId ? ' [cached id]' : ''}`);

  // Step 2: paginate /feed/user/{id}/?count=24&max_id={cursor}
  type RawPost = any;
  const PER_PAGE = 24;
  const collected: RawPost[] = [];
  let nextMaxId: string | null = null;
  let pages = 0;
  while (collected.length < limit && pages < 8) {
    pages++;
    const url = `https://www.instagram.com/api/v1/feed/user/${userId}/?count=${PER_PAGE}` +
      (nextMaxId ? `&max_id=${encodeURIComponent(nextMaxId)}` : '');
    let page: any;
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      page = await r.json();
    } catch (e) {
      console.warn(`[instagram] page ${pages} failed: ${(e as Error).message}`);
      break;
    }
    const items: RawPost[] = page.items ?? [];
    if (!items.length) break;
    collected.push(...items);
    if (!page.more_available || !page.next_max_id) break;
    nextMaxId = page.next_max_id;
    // Space out subsequent page requests to keep rate-limit pressure low.
    await sleep(900);
  }
  console.log(`[instagram] fetched ${collected.length} posts across ${pages} page${pages === 1 ? '' : 's'}`);
  // Even if pages 401'd, we still return the userId so the next run can
  // skip the profile lookup. Photos array may be empty.
  if (!collected.length) return { userId, photos: [] };

  // Step 3: download each photo locally (URLs expire) and map.
  const out: InstagramPhoto[] = [];
  for (const it of collected.slice(0, limit)) {
    if (!it?.code) continue;
    // Carousels and videos still have an image_versions2 cover; fall back to
    // the first child for sidecars where it's missing.
    const candidates = it.image_versions2?.candidates
      ?? it.carousel_media?.[0]?.image_versions2?.candidates
      ?? [];
    if (!candidates.length) continue;
    const pick = pickIgCandidate(candidates);
    if (!pick?.url) continue;

    const localPath = await cacheInstagramImage(pick.url, it.code);
    if (!localPath) continue;

    const captionText: string | undefined = it.caption?.text;
    out.push({
      shortcode: it.code,
      url: `https://www.instagram.com/p/${it.code}/`,
      imageUrl: localPath,
      width: pick.width,
      height: pick.height,
      takenAt: new Date(Number(it.taken_at) * 1000).toISOString(),
      caption: captionText ? captionText.replace(/\s+/g, ' ').slice(0, 280).trim() : undefined,
      isVideo: it.media_type === 2,
      carousel: it.media_type === 8,
      altText: it.accessibility_caption || undefined,
    });
  }
  return { userId, photos: out };
}

async function readPrevSnapshot(path: string): Promise<MusicSnapshot | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as MusicSnapshot;
  } catch {
    return null;
  }
}

// Last-resort fallback when both the live IG fetch and the previous snapshot
// have no photos: build a minimal photo list from images already on disk
// (filenames are the IG post shortcodes). Loses captions and dimensions, but
// the page still has something to show.
async function scavengeInstagramFromDisk(): Promise<InstagramPhoto[]> {
  const dir = resolve(IMAGES_DIR, 'photos');
  let files: string[] = [];
  try { files = await readdir(dir); } catch { return []; }
  const photos: InstagramPhoto[] = [];
  for (const f of files) {
    const m = f.match(/^([^.]+)\.(jpe?g|png|webp)$/i);
    if (!m) continue;
    const shortcode = m[1];
    photos.push({
      shortcode,
      url: `https://www.instagram.com/p/${shortcode}/`,
      imageUrl: `${IMAGES_DIR}/photos/${f}`,
      width: 1080,
      height: 1080,
      takenAt: new Date(0).toISOString(),
      isVideo: false,
      carousel: false,
    });
  }
  // IG shortcodes are roughly chronological — sorting in reverse string order
  // approximates newest-first. Better than the OS-defined readdir() order.
  photos.sort((a, b) => b.shortcode.localeCompare(a.shortcode));
  return photos;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function pickIgCandidate(candidates: { url: string; width: number; height: number }[]) {
  // Pick the smallest candidate that's at least 600px wide; otherwise the largest.
  const sorted = [...candidates].sort((a, b) => a.width - b.width);
  return sorted.find(c => c.width >= 600) ?? sorted[sorted.length - 1];
}

async function cacheInstagramImage(remoteUrl: string, shortcode: string): Promise<string | null> {
  // Stable filename keyed on the post shortcode — same post always lands at
  // the same path regardless of which signed URL IG happens to issue.
  const rel = `${IMAGES_DIR}/photos/${shortcode}.jpg`;
  const abs = resolve(rel);
  if (await fileExists(abs)) return rel;
  try {
    const r = await fetch(remoteUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, buf);
    console.log(`[image] saved ${rel} (${(buf.length / 1024).toFixed(0)}KB)`);
    return rel;
  } catch (e) {
    console.warn(`[image] FAILED instagram ${shortcode}: ${(e as Error).message}`);
    return null;
  }
}

// ---- SoundCloud likes ------------------------------------------------------
// SoundCloud killed the public API years ago, but their site embeds a
// hydration block (window.__sc_hydration) which contains both the user id
// and a public client_id. Same trick yt-dlp et al. use.
async function fetchSoundCloudLikes(user: string, limit: number): Promise<SoundCloudLike[] | null> {
  const ua = 'Mozilla/5.0 (compatible; alex-forbes-red/1.0)';
  let html: string;
  try {
    const r = await fetch(`https://soundcloud.com/${encodeURIComponent(user)}`, {
      headers: { 'user-agent': ua, accept: 'text/html' },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    html = await r.text();
  } catch (e) {
    console.warn(`[soundcloud] fetch profile failed: ${(e as Error).message}`);
    return null;
  }

  const m = html.match(/<script>window\.__sc_hydration\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);
  if (!m) {
    console.warn('[soundcloud] no hydration block on profile page');
    return null;
  }
  let hydration: { hydratable: string; data: any }[];
  try {
    hydration = JSON.parse(m[1]);
  } catch (e) {
    console.warn(`[soundcloud] hydration parse failed: ${(e as Error).message}`);
    return null;
  }
  const userBlock = hydration.find(h => h.hydratable === 'user');
  const apiBlock = hydration.find(h => h.hydratable === 'apiClient');
  if (!userBlock?.data?.id || !apiBlock?.data?.id) {
    console.warn('[soundcloud] hydration missing user/apiClient');
    return null;
  }
  const userId: number = userBlock.data.id;
  const clientId: string = apiBlock.data.id;
  console.log(`[soundcloud] user=${user} (${userId}) clientId=${clientId.slice(0, 8)}…`);

  // Per-page max from the SC API is ~200. Paginate via `next_href` (which
  // doesn't include the client_id, so we re-append it) until we have `limit`
  // tracks or the cursor runs out.
  const PER_PAGE = 200;
  const collection: any[] = [];
  let nextUrl: string | null =
    `https://api-v2.soundcloud.com/users/${userId}/likes?client_id=${encodeURIComponent(clientId)}&limit=${Math.min(limit, PER_PAGE)}`;
  let pages = 0;
  while (nextUrl && collection.length < limit && pages < 10) {
    pages++;
    const url = /[?&]client_id=/.test(nextUrl)
      ? nextUrl
      : `${nextUrl}${nextUrl.includes('?') ? '&' : '?'}client_id=${encodeURIComponent(clientId)}`;
    let page: { collection?: any[]; next_href?: string };
    try {
      const r = await fetch(url, { headers: { 'user-agent': ua, accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      page = await r.json() as any;
    } catch (e) {
      console.warn(`[soundcloud] page ${pages} failed: ${(e as Error).message}`);
      break;
    }
    const items = page.collection ?? [];
    if (items.length === 0) break;
    collection.push(...items);
    nextUrl = page.next_href ?? null;
  }
  console.log(`[soundcloud] fetched ${collection.length} likes across ${pages} page${pages === 1 ? '' : 's'}`);

  return collection
    .slice(0, limit)
    .filter((it: any) => it && it.track && typeof it.track.title === 'string' && it.track.permalink_url)
    .map((it: any): SoundCloudLike => {
      const t = it.track;
      const meta = t.publisher_metadata ?? {};
      const cleanTitle = (meta.release_title || t.title || '').trim();
      const artist = (meta.artist || t.user?.username || 'Unknown').trim();
      const artwork = t.artwork_url
        ? upscaleSoundCloudArt(t.artwork_url)
        : (t.user?.avatar_url ? upscaleSoundCloudArt(t.user.avatar_url) : undefined);
      return {
        title: cleanTitle,
        artist,
        artworkUrl: artwork,
        url: t.permalink_url,
        durationMs: typeof t.duration === 'number' ? t.duration : undefined,
        genre: t.genre || undefined,
        likedAt: it.created_at,
        uploader: t.user?.username && t.user.username !== artist ? t.user.username : undefined,
      };
    });
}

// SoundCloud artwork URLs end in `-large.jpg` (100x100). Bump to t500x500.
function upscaleSoundCloudArt(url: string): string {
  return url.replace(
    /-(?:tiny|mini|small|badge|t67x67|large|t300x300|t500x500|original)\.(jpg|jpeg|png)$/i,
    '-t500x500.$1'
  );
}

// ---- Image collection ------------------------------------------------------

// mzstatic URLs end in /WIDTHxHEIGHTbb.jpg — request a smaller size to keep
// bandwidth/disk down. UI tiles are ~200–400px so 400x400 is plenty.
function smallifyImageUrl(url: string): string {
  return url.replace(/\/(\d+)x(\d+)bb\.(jpe?g|png|webp)/i, (_m, _w, _h, ext: string) => `/400x400bb.${ext}`);
}

// Apply smallification to every cover URL in the snapshot, even those we
// don't pin locally. Browsers will fetch ~50KB per cover instead of ~250KB.
function smallifyAllUrls(snapshot: MusicSnapshot) {
  const fix = (s: string | undefined) => (s && s.startsWith('http') ? smallifyImageUrl(s) : s);
  for (const a of snapshot.topAlbums) a.coverUrl = fix(a.coverUrl);
  for (const ar of snapshot.topArtists) ar.image = fix(ar.image);
  for (const t of snapshot.topTracks) t.coverUrl = fix(t.coverUrl);
  for (const r of snapshot.recentlyPlayed) r.coverUrl = fix(r.coverUrl);
}

function imagePathFor(url: string, kind: 'albums' | 'artists'): string {
  const ext = (url.match(/\.(jpe?g|png|webp)(?:\?|$)/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  return `${IMAGES_DIR}/${kind}/${hash}.${ext}`;
}

async function fileExists(path: string): Promise<boolean> {
  try { await stat(path); return true; } catch { return false; }
}

async function downloadImage(remoteUrl: string, kind: 'albums' | 'artists'): Promise<string | null> {
  const url = smallifyImageUrl(remoteUrl);
  const rel = imagePathFor(url, kind);
  const abs = resolve(rel);
  if (await fileExists(abs)) return rel;
  try {
    const r = await fetch(url, { headers: { accept: 'image/*' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, buf);
    console.log(`[image] saved ${rel} (${(buf.length / 1024).toFixed(0)}KB)`);
    return rel;
  } catch (e) {
    console.warn(`[image] FAILED ${remoteUrl}: ${(e as Error).message}`);
    return null;
  }
}

async function runWithLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

async function collectImages(snapshot: MusicSnapshot): Promise<Set<string>> {
  smallifyAllUrls(snapshot);

  const used = new Set<string>();
  if (SKIP_IMAGES) return used;

  // We only pin lifetime top-album + top-artist images locally. These change
  // slowly (a heavy listener might shuffle one or two per week) so the repo
  // stays small. Recently-played and top-tracks keep their remote URLs —
  // they churn fast and would otherwise dominate the repo and its history.
  // Set PIN_ALL=1 to also pin recently-played + top-track covers.
  const pinAll = process.env.PIN_ALL === '1';

  type AssignFn = (path: string) => void;
  const tasksByUrl = new Map<string, { kind: 'albums' | 'artists'; assigns: AssignFn[] }>();
  function add(kind: 'albums' | 'artists', url: string | undefined, assign: AssignFn) {
    if (!url || !url.startsWith('http')) return;
    const existing = tasksByUrl.get(url);
    if (existing) existing.assigns.push(assign);
    else tasksByUrl.set(url, { kind, assigns: [assign] });
  }

  for (const a of snapshot.topAlbums) add('albums', a.coverUrl, p => (a.coverUrl = p));
  for (const ar of snapshot.topArtists) add('artists', ar.image, p => (ar.image = p));
  if (pinAll) {
    for (const t of snapshot.topTracks) add('albums', t.coverUrl, p => (t.coverUrl = p));
    for (const r of snapshot.recentlyPlayed) add('albums', r.coverUrl, p => (r.coverUrl = p));
  }

  const tasks = Array.from(tasksByUrl, ([url, t]) => ({ url, ...t }));
  await runWithLimit(tasks, IMAGE_CONCURRENCY, async task => {
    const local = await downloadImage(task.url, task.kind);
    if (local) {
      task.assigns.forEach(fn => fn(local));
      used.add(local);
    }
  });

  // Catch already-local references so GC keeps them.
  const collect = (path: string | undefined) => { if (path && !path.startsWith('http')) used.add(path); };
  snapshot.topAlbums.forEach(a => collect(a.coverUrl));
  snapshot.topArtists.forEach(a => collect(a.image));
  snapshot.topTracks.forEach(t => collect(t.coverUrl));
  snapshot.recentlyPlayed.forEach(r => collect(r.coverUrl));

  return used;
}

async function gcImages(used: Set<string>) {
  for (const sub of ['albums', 'artists']) {
    const dir = resolve(IMAGES_DIR, sub);
    let files: string[] = [];
    try { files = await readdir(dir); } catch { continue; }
    for (const f of files) {
      const rel = `${IMAGES_DIR}/${sub}/${f}`;
      if (!used.has(rel)) {
        try {
          await unlink(resolve(rel));
          console.log(`[image] gc removed ${rel}`);
        } catch (e) {
          console.warn(`[image] gc failed ${rel}: ${(e as Error).message}`);
        }
      }
    }
  }
}

async function stabiliseTimestamp(path: string, next: MusicSnapshot): Promise<MusicSnapshot> {
  let prev: MusicSnapshot | null = null;
  try {
    prev = JSON.parse(await readFile(path, 'utf8')) as MusicSnapshot;
  } catch {
    return next;
  }
  if (!prev) return next;
  const { generatedAt: _a, ...prevCore } = prev;
  const { generatedAt: _b, ...nextCore } = next;
  if (JSON.stringify(prevCore) === JSON.stringify(nextCore)) {
    return { ...next, generatedAt: prev.generatedAt };
  }
  return next;
}

// Replace the contents of <script id="music-snapshot" type="application/json">…</script>
// in index.html with the new payload. Embedded so the page renders with live
// data on first paint — no async fetch, no double-deploy.
async function embedInHtml(snapshot: MusicSnapshot) {
  let html: string;
  try {
    html = await readFile(HTML, 'utf8');
  } catch (e) {
    console.warn(`[stats.fm] cannot read ${HTML}, skipping embed:`, (e as Error).message);
    return;
  }

  // Strip the generatedAt timestamp from the embedded copy so identical
  // snapshots produce zero-byte diffs (and don't trigger a Pages rebuild).
  const { generatedAt: _ignored, ...embedded } = snapshot;
  const payload = JSON.stringify(embedded);

  const re = /(<script id="music-snapshot" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) {
    console.warn(`[stats.fm] no <script id="music-snapshot"> tag in ${HTML}; add it to embed at build time.`);
    return;
  }

  const next = html.replace(re, `$1${payload}$2`);
  if (next === html) {
    console.log(`[stats.fm] embedded snapshot unchanged in ${HTML}`);
    return;
  }
  await writeFile(HTML, next, 'utf8');
  console.log(`[stats.fm] embedded snapshot into ${HTML} (${payload.length} chars)`);
}

main().catch(err => {
  console.error('[stats.fm] failed:', err);
  process.exit(1);
});
