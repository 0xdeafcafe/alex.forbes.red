// SoundCloud likes fetcher. Public API is gated, so we extract a public
// `client_id` from the user's profile-page hydration block (same trick
// yt-dlp et al. use), then paginate the api-v2 likes endpoint.

import type { SoundCloudLike } from '../lib/types.js';

const UA = 'Mozilla/5.0 (compatible; alex-forbes-red/1.0)';

interface HydrationEntry { hydratable: string; data: any }

async function fetchHydration(user: string): Promise<HydrationEntry[] | null> {
  let html: string;
  try {
    const r = await fetch(`https://soundcloud.com/${encodeURIComponent(user)}`, {
      headers: { 'user-agent': UA, accept: 'text/html' },
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
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    console.warn(`[soundcloud] hydration parse failed: ${(e as Error).message}`);
    return null;
  }
}

// SoundCloud artwork URLs end in `-large.jpg` (100x100). Bump to t500x500.
function upscaleArt(url: string): string {
  return url.replace(
    /-(?:tiny|mini|small|badge|t67x67|large|t300x300|t500x500|original)\.(jpg|jpeg|png)$/i,
    '-t500x500.$1',
  );
}

function mapLike(it: any): SoundCloudLike | null {
  if (!it?.track || typeof it.track.title !== 'string' || !it.track.permalink_url) return null;
  const t = it.track;
  const meta = t.publisher_metadata ?? {};
  const cleanTitle = (meta.release_title || t.title || '').trim();
  const artist = (meta.artist || t.user?.username || 'Unknown').trim();
  const artwork = t.artwork_url
    ? upscaleArt(t.artwork_url)
    : (t.user?.avatar_url ? upscaleArt(t.user.avatar_url) : undefined);
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
}

export async function fetchSoundCloudLikes(user: string, limit: number): Promise<SoundCloudLike[] | null> {
  const hydration = await fetchHydration(user);
  if (!hydration) return null;

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
  // doesn't include client_id, so we re-append it).
  const PER_PAGE = 200;
  const PAGE_CAP = 10;
  const collection: any[] = [];
  let nextUrl: string | null =
    `https://api-v2.soundcloud.com/users/${userId}/likes?client_id=${encodeURIComponent(clientId)}&limit=${Math.min(limit, PER_PAGE)}`;
  let pages = 0;
  while (nextUrl && collection.length < limit && pages < PAGE_CAP) {
    pages++;
    const url = /[?&]client_id=/.test(nextUrl)
      ? nextUrl
      : `${nextUrl}${nextUrl.includes('?') ? '&' : '?'}client_id=${encodeURIComponent(clientId)}`;
    let page: { collection?: any[]; next_href?: string };
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
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
    .map(mapLike)
    .filter((l): l is SoundCloudLike => l !== null);
}
