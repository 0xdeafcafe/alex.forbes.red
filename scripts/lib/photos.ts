import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { PhotoContent } from './types.js';

/** Read the website's canonical photo collection; fail instead of losing frames. */
export async function loadPhotos(): Promise<PhotoContent[]> {
  const photos: unknown = JSON.parse(await readFile('data/photos.json', 'utf8'));
  if (!Array.isArray(photos)) throw new Error('data/photos.json: expected an array');
  const seen = new Set<string>();
  for (const [index, photo] of photos.entries()) {
    const fail = (reason: string): never => { throw new Error(`data/photos.json[${index}]: ${reason}`); };
    if (!photo || typeof photo !== 'object') fail('expected a photo');
    for (const key of ['src', 'title', 'alt', 'location', 'takenAt']) {
      if (typeof photo[key] !== 'string') fail(`${key} must be a string`);
    }
    if (!/^\/images\/photos\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|avif)$/.test(photo.src)) fail('src must name a local file in /images/photos/');
    if (seen.has(photo.src)) fail('duplicate src');
    seen.add(photo.src);
    if (!photo.alt.trim()) fail('alt must describe the image');
    if (![photo.width, photo.height].every(n => Number.isInteger(n) && n > 0)) fail('width and height must be positive integers');
    if (photo.takenAt && !Number.isFinite(Date.parse(photo.takenAt))) fail('takenAt must be an ISO date or empty');
    try { await access(resolve(photo.src.slice(1))); } catch { fail(`missing file: ${photo.src}`); }
  }
  return photos as PhotoContent[];
}
