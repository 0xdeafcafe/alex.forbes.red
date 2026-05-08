// Instagram fetcher. Uses the same undocumented endpoints IG's own web app
// uses, with `X-IG-App-ID: 936619743392459` and the Sec-Fetch-* headers IG
// enforces. CDN URLs are short-lived signed links so every photo is cached
// to disk under its post shortcode.

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sleep } from '../lib/http.js';
import { cacheRawImage, IMAGES_DIR } from '../lib/images.js';
import type { InstagramPhoto } from '../lib/types.js';

const HEADERS = (user: string) => ({
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
});

async function lookupUserId(user: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(user)}`,
      { headers: HEADERS(user) },
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json() as any;
    const id = j?.data?.user?.id;
    if (!id) throw new Error('no user.id');
    return id;
  } catch (e) {
    console.warn(`[instagram] profile lookup failed: ${(e as Error).message}`);
    return null;
  }
}

function pickIgCandidate(candidates: { url: string; width: number; height: number }[]) {
  // Smallest >= 600px wide if available; otherwise the largest.
  const sorted = [...candidates].sort((a, b) => a.width - b.width);
  return sorted.find(c => c.width >= 600) ?? sorted[sorted.length - 1];
}

function mapPost(it: any, localPath: string, pick: { width: number; height: number }): InstagramPhoto {
  const captionText: string | undefined = it.caption?.text;
  return {
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
  };
}

export interface InstagramFetchResult {
  userId: string;
  photos: InstagramPhoto[];
}

export async function fetchInstagramPhotos(
  user: string,
  limit: number,
  cachedUserId?: string,
): Promise<InstagramFetchResult | null> {
  const headers = HEADERS(user);

  let userId = cachedUserId;
  if (!userId) {
    userId = await lookupUserId(user);
    if (!userId) return null;
    // Small breather between profile lookup and feed fetch.
    await sleep(700);
  }
  console.log(`[instagram] user=${user} (${userId})${cachedUserId ? ' [cached id]' : ''}`);

  const PER_PAGE = 24;
  const PAGE_CAP = 8;
  const collected: any[] = [];
  let nextMaxId: string | null = null;
  let pages = 0;
  while (collected.length < limit && pages < PAGE_CAP) {
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
    const items: any[] = page.items ?? [];
    if (!items.length) break;
    collected.push(...items);
    if (!page.more_available || !page.next_max_id) break;
    nextMaxId = page.next_max_id;
    // Space subsequent page requests to keep rate-limit pressure low.
    await sleep(900);
  }
  console.log(`[instagram] fetched ${collected.length} posts across ${pages} page${pages === 1 ? '' : 's'}`);
  // Even if pages 401'd, we still return the userId so the next run can
  // skip the profile lookup. Photos array may be empty.
  if (!collected.length) return { userId, photos: [] };

  const photos: InstagramPhoto[] = [];
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

    const rel = `${IMAGES_DIR}/photos/${it.code}.jpg`;
    const localPath = await cacheRawImage(pick.url, rel);
    if (!localPath) continue;

    photos.push(mapPost(it, localPath, pick));
  }
  return { userId, photos };
}

// Last-resort fallback when both the live IG fetch and the previous snapshot
// have no photos: build a minimal photo list from images already on disk.
// Filenames are the IG post shortcodes.
export async function scavengeInstagramFromDisk(): Promise<InstagramPhoto[]> {
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
  // IG shortcodes are roughly chronological — reverse string sort approximates
  // newest-first. Better than the OS-defined readdir() order.
  photos.sort((a, b) => b.shortcode.localeCompare(a.shortcode));
  return photos;
}
