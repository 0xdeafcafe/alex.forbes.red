// Image cache + GC. Pulls remote URLs to local disk so the deployed site has
// no external CDN dependency for the canonical (top-album / top-artist /
// Instagram) art.

import { writeFile, mkdir, stat, readdir, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { runWithLimit } from './concurrency.js';
import type { Snapshot } from './types.js';

const IMAGES_DIR = process.env.IMAGES_DIR ?? 'images';
const SKIP_IMAGES = process.env.SKIP_IMAGES === '1';
const PIN_ALL = process.env.PIN_ALL === '1';
const IMAGE_CONCURRENCY = 6;

export type ImageKind = 'albums' | 'artists';

// mzstatic URLs end in /WIDTHxHEIGHTbb.jpg — request a smaller size to keep
// bandwidth/disk down. UI tiles are ~200–400px so 400x400 is plenty.
export function smallifyImageUrl(url: string): string {
  return url.replace(
    /\/(\d+)x(\d+)bb\.(jpe?g|png|webp)/i,
    (_m, _w, _h, ext: string) => `/400x400bb.${ext}`,
  );
}

// Apply smallification to every remote cover URL in the snapshot, even those
// we don't pin locally. Browsers fetch ~50KB per cover instead of ~250KB.
export function smallifyAllUrls(snapshot: Snapshot): void {
  const fix = (s: string | undefined) => (s && s.startsWith('http') ? smallifyImageUrl(s) : s);
  for (const a of snapshot.topAlbums) a.coverUrl = fix(a.coverUrl);
  for (const ar of snapshot.topArtists) ar.image = fix(ar.image);
  for (const ar of snapshot.topArtistsLifetime ?? []) ar.image = fix(ar.image);
  for (const ar of snapshot.topArtistsLastYear ?? []) ar.image = fix(ar.image);
  for (const t of snapshot.topTracks) t.coverUrl = fix(t.coverUrl);
  for (const r of snapshot.recentlyPlayed) r.coverUrl = fix(r.coverUrl);
}

function imagePathFor(url: string, kind: ImageKind): string {
  const ext = (url.match(/\.(jpe?g|png|webp)(?:\?|$)/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  return `${IMAGES_DIR}/${kind}/${hash}.${ext}`;
}

export async function fileExists(path: string): Promise<boolean> {
  try { await stat(path); return true; } catch { return false; }
}

async function downloadOne(remoteUrl: string, kind: ImageKind): Promise<string | null> {
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

/**
 * Pin album-cover + artist-photo URLs locally and rewrite the snapshot in
 * place. By default only stable lifetime-top content is pinned; recently-
 * played + top-tracks keep their (smallified) remote URLs because they
 * churn fast and would otherwise dominate the repo. Set PIN_ALL=1 to pin
 * everything.
 *
 * Returns the set of local image paths used by the new snapshot, so callers
 * can pass it to {@link gcImages} to clean up orphans.
 */
export async function collectImages(snapshot: Snapshot): Promise<Set<string>> {
  smallifyAllUrls(snapshot);

  const used = new Set<string>();

  if (!SKIP_IMAGES) {
    type AssignFn = (path: string) => void;
    const tasksByUrl = new Map<string, { kind: ImageKind; assigns: AssignFn[] }>();
    function add(kind: ImageKind, url: string | undefined, assign: AssignFn) {
      if (!url || !url.startsWith('http')) return;
      const existing = tasksByUrl.get(url);
      if (existing) existing.assigns.push(assign);
      else tasksByUrl.set(url, { kind, assigns: [assign] });
    }

    for (const a of snapshot.topAlbums) add('albums', a.coverUrl, p => (a.coverUrl = p));
    for (const ar of snapshot.topArtists) add('artists', ar.image, p => (ar.image = p));
    for (const ar of snapshot.topArtistsLifetime ?? []) add('artists', ar.image, p => (ar.image = p));
    for (const ar of snapshot.topArtistsLastYear ?? []) add('artists', ar.image, p => (ar.image = p));
    if (PIN_ALL) {
      for (const t of snapshot.topTracks) add('albums', t.coverUrl, p => (t.coverUrl = p));
      for (const r of snapshot.recentlyPlayed) add('albums', r.coverUrl, p => (r.coverUrl = p));
    }

    const tasks = Array.from(tasksByUrl, ([url, t]) => ({ url, ...t }));
    await runWithLimit(tasks, IMAGE_CONCURRENCY, async task => {
      const local = await downloadOne(task.url, task.kind);
      if (local) {
        task.assigns.forEach(fn => fn(local));
        used.add(local);
      }
    });
  }

  // Catch already-local references so GC keeps them. Done unconditionally:
  // skipping this when SKIP_IMAGES=1 caused the GC to delete every cached
  // image the snapshot still pointed to.
  const collect = (path: string | undefined) => {
    if (path && !path.startsWith('http')) used.add(path);
  };
  snapshot.topAlbums.forEach(a => collect(a.coverUrl));
  snapshot.topArtists.forEach(a => collect(a.image));
  snapshot.topArtistsLifetime?.forEach(a => collect(a.image));
  snapshot.topArtistsLastYear?.forEach(a => collect(a.image));
  snapshot.topTracks.forEach(t => collect(t.coverUrl));
  snapshot.recentlyPlayed.forEach(r => collect(r.coverUrl));
  snapshot.instagram?.photos.forEach(p => collect(p.imageUrl));

  return used;
}

export async function gcImages(used: Set<string>): Promise<void> {
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

/** Used by sources/instagram.ts to cache photos under a stable shortcode-based filename. */
export async function cacheRawImage(remoteUrl: string, relPath: string): Promise<string | null> {
  const abs = resolve(relPath);
  if (await fileExists(abs)) return relPath;
  try {
    const r = await fetch(remoteUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, buf);
    console.log(`[image] saved ${relPath} (${(buf.length / 1024).toFixed(0)}KB)`);
    return relPath;
  } catch (e) {
    console.warn(`[image] FAILED ${remoteUrl}: ${(e as Error).message}`);
    return null;
  }
}

export { IMAGES_DIR };
