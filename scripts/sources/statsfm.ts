// stats.fm fetcher. Hits the public (no-auth) API for top albums / artists /
// tracks / genres, weekly stream stats, time-of-day breakdown, and recently-
// played. Maps the responses into our internal types.
//
// Range is fixed to `weeks` — the site shows a rolling weekly digest, not
// a lifetime hall of fame.

import { getJson } from '../lib/http.js';
import type {
  Album,
  Artist,
  Genre,
  Recent,
  StatsfmDateStats,
  StatsfmStats,
  Track,
} from '../lib/types.js';

const API = 'https://api.stats.fm/api/v1';
const RANGE = 'weeks';
const TIMEZONE = 'Europe/Amsterdam';

interface ApiList<T> { items?: T[] }
interface ApiObject<T> { items?: T }

interface RawArtistRef {
  id?: number;
  name: string;
  image?: string;
  followers?: number;
  genres?: string[];
  externalIds?: { spotify?: string[] };
}
interface RawAlbumRef { name: string; image?: string }
interface RawAlbumFull {
  name: string;
  image?: string;
  releaseDate?: number | string | null;
  artists?: RawArtistRef[];
  externalIds?: { spotify?: string[] };
}
interface RawTrackInner {
  name: string;
  durationMs?: number;
  artists?: RawArtistRef[];
  albums?: RawAlbumRef[];
  externalIds?: { spotify?: string[] };
}
interface RawAlbum {
  position?: number;
  streams?: number | null;
  album: RawAlbumFull;
}
interface RawArtist {
  position?: number;
  streams?: number | null;
  artist: RawArtistRef;
}
interface RawTrack {
  position?: number;
  streams?: number | null;
  track: RawTrackInner;
}
interface RawRecent {
  endTime: string;
  durationMs?: number;
  track: RawTrackInner;
}
interface RawGenre {
  position?: number;
  streams?: number | null;
  previewArtists?: RawArtist[];
  genre: { tag: string };
}
interface RawStats {
  durationMs?: number;
  count?: number;
  cardinality?: { tracks?: number; artists?: number; albums?: number };
}
interface RawDateBucket { count?: number; durationMs?: number }
interface RawDates {
  hours?: Record<string, RawDateBucket>;
  weekDays?: Record<string, RawDateBucket>;
  weekdays?: Record<string, RawDateBucket>;
  months?: Record<string, RawDateBucket>;
  monthDays?: Record<string, RawDateBucket>;
  days?: Record<string, RawDateBucket>;
  years?: Record<string, RawDateBucket>;
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
    // Sprinkle a few large tiles through the music mosaic.
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

function mapGenre(it: RawGenre, idx: number): Genre {
  return {
    position: it.position ?? idx + 1,
    tag: it.genre.tag,
    previewArtists: (it.previewArtists ?? []).slice(0, 4).map(pa => ({
      name: pa.artist.name,
      image: pa.artist.image,
      url: spotifyUrl('artist', pa.artist.externalIds),
    })),
  };
}

function mapStats(raw: RawStats | undefined): StatsfmStats | undefined {
  if (!raw) return undefined;
  return {
    durationMs: raw.durationMs ?? 0,
    count: raw.count ?? 0,
    cardinality: {
      tracks: raw.cardinality?.tracks ?? 0,
      artists: raw.cardinality?.artists ?? 0,
      albums: raw.cardinality?.albums ?? 0,
    },
  };
}

function normaliseBucket(b: Record<string, RawDateBucket> | undefined): Record<string, { count: number; durationMs: number }> {
  if (!b) return {};
  const out: Record<string, { count: number; durationMs: number }> = {};
  for (const [k, v] of Object.entries(b)) {
    out[k] = { count: v.count ?? 0, durationMs: v.durationMs ?? 0 };
  }
  return out;
}

function mapDateStats(raw: RawDates | undefined): StatsfmDateStats | undefined {
  if (!raw) return undefined;
  // The API returns both `weekDays` and `weekdays` — they're the same data,
  // prefer the camelCase variant.
  return {
    hours: normaliseBucket(raw.hours),
    weekDays: normaliseBucket(raw.weekDays ?? raw.weekdays),
    months: normaliseBucket(raw.months),
    monthDays: normaliseBucket(raw.monthDays),
    days: normaliseBucket(raw.days),
    years: normaliseBucket(raw.years),
  };
}

export interface StatsfmLimits {
  albums: number;
  artists: number;
  tracks: number;
  genres: number;
  recent: number;
}

export interface StatsfmResult {
  topAlbums: Album[];
  topArtists: Artist[];
  topArtistsLifetime: Artist[];
  topArtistsLastYear: Artist[];
  topTracks: Track[];
  topGenres: Genre[];
  recentlyPlayed: Recent[];
  stats?: StatsfmStats;
  dateStats?: StatsfmDateStats;
}

async function fetchArtists(base: string, range: string, limit: number): Promise<Artist[]> {
  try {
    const res = await getJson<ApiList<RawArtist>>(`${base}/top/artists?range=${range}`);
    return (res.items ?? []).slice(0, limit).map(mapArtist);
  } catch (e) {
    console.warn(`[stats.fm] top/artists ${range} failed: ${(e as Error).message}`);
    return [];
  }
}

export async function fetchStatsFm(user: string, limits: StatsfmLimits): Promise<StatsfmResult> {
  const range = `range=${RANGE}`;
  const tz = `timeZone=${encodeURIComponent(TIMEZONE)}`;
  const base = `${API}/users/${encodeURIComponent(user)}`;

  const [
    albumsRes,
    artistsWeek,
    artistsLifetime,
    artistsLastYear,
    tracksRes,
    genresRes,
    recentRes,
    statsRes,
    datesRes,
  ] = await Promise.all([
    getJson<ApiList<RawAlbum>>(`${base}/top/albums?${range}`),
    fetchArtists(base, RANGE, limits.artists),
    fetchArtists(base, 'lifetime', limits.artists),
    // stats.fm only exposes `weeks` / `months` / `lifetime` ranges on this
    // endpoint — `months` is the closest match to "last year" / "12 months".
    fetchArtists(base, 'months', limits.artists),
    getJson<ApiList<RawTrack>>(`${base}/top/tracks?${range}`),
    getJson<ApiList<RawGenre>>(`${base}/top/genres?${range}`),
    getJson<ApiList<RawRecent>>(`${base}/streams/recent?limit=${limits.recent}`).catch(err => {
      console.warn(`[stats.fm] streams/recent failed: ${(err as Error).message}`);
      return { items: [] } as ApiList<RawRecent>;
    }),
    getJson<ApiObject<RawStats>>(`${base}/streams/stats?${range}`).catch(err => {
      console.warn(`[stats.fm] streams/stats failed: ${(err as Error).message}`);
      return { items: undefined } as ApiObject<RawStats>;
    }),
    getJson<ApiObject<RawDates>>(`${base}/streams/stats/dates?${range}&${tz}`).catch(err => {
      console.warn(`[stats.fm] streams/stats/dates failed: ${(err as Error).message}`);
      return { items: undefined } as ApiObject<RawDates>;
    }),
  ]);

  return {
    topAlbums: (albumsRes.items ?? []).slice(0, limits.albums).map(mapAlbum),
    topArtists: artistsWeek,
    topArtistsLifetime: artistsLifetime,
    topArtistsLastYear: artistsLastYear,
    topTracks: (tracksRes.items ?? []).slice(0, limits.tracks).map(mapTrack),
    topGenres: (genresRes.items ?? []).slice(0, limits.genres).map(mapGenre),
    recentlyPlayed: (recentRes.items ?? []).slice(0, limits.recent).map(mapRecent),
    stats: mapStats(statsRes.items),
    dateStats: mapDateStats(datesRes.items),
  };
}
