// stats.fm fetcher. Pulls top albums / artists / tracks + recently-played
// and maps the API responses into our internal types.

import { getJson } from '../lib/http.js';
import type { Album, Artist, Recent, Track } from '../lib/types.js';

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
interface RawTrackInner {
  name: string;
  durationMs?: number;
  artists?: { name: string }[];
  albums?: { name: string; image?: string }[];
  externalIds?: { spotify?: string[] };
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

export interface StatsfmLimits {
  albums: number;
  artists: number;
  tracks: number;
  recent: number;
}

export interface StatsfmResult {
  topAlbums: Album[];
  topArtists: Artist[];
  topTracks: Track[];
  recentlyPlayed: Recent[];
}

export async function fetchStatsFm(user: string, limits: StatsfmLimits): Promise<StatsfmResult> {
  const [albumsRes, artistsRes, tracksRes, recentRes] = await Promise.all([
    getJson<ApiList<RawAlbum>>(`${API}/users/${user}/top/albums?range=lifetime&limit=${limits.albums}`),
    getJson<ApiList<RawArtist>>(`${API}/users/${user}/top/artists?range=lifetime&limit=${limits.artists}`),
    getJson<ApiList<RawTrack>>(`${API}/users/${user}/top/tracks?range=lifetime&limit=${limits.tracks}`),
    getJson<ApiList<RawRecent>>(`${API}/users/${user}/streams/recent?limit=${limits.recent}`),
  ]);

  return {
    topAlbums: (albumsRes.items ?? []).map(mapAlbum),
    topArtists: (artistsRes.items ?? []).map(mapArtist),
    topTracks: (tracksRes.items ?? []).map(mapTrack),
    recentlyPlayed: (recentRes.items ?? []).map(mapRecent),
  };
}
