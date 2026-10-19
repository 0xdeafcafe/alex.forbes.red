// Shared types for the snapshot pipeline + SSR renderer.

export interface Album {
  artist: string;
  name: string;
  year?: number;
  coverUrl?: string;
  url?: string;
  streams?: number | null;
  position?: number;
  large?: boolean;
  // Filled in at build time so the client doesn't need a palette helper.
  c1?: string;
  c2?: string;
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

export interface Genre {
  position: number;
  tag: string;
  previewArtists?: { name: string; image?: string; url?: string }[];
}

export interface StatsfmStats {
  durationMs: number;
  count: number;
  cardinality: { tracks: number; artists: number; albums: number };
}

export type DateBuckets = Record<string, { count: number; durationMs: number }>;

export interface StatsfmDateStats {
  hours: DateBuckets;
  weekDays: DateBuckets;
  months: DateBuckets;
  monthDays: DateBuckets;
  days: DateBuckets;
  years: DateBuckets;
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

// Hand-maintained entries in data/photos.json. Never replaced by a feed.
export interface PhotoContent {
  src: string;
  title: string;
  alt: string;
  location: string;
  takenAt: string;
  width: number;
  height: number;
}

export interface GithubRepoStats {
  url: string;
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  description: string | null;
  pushedAt: string | null;
  topics: string[];
  archived: boolean;
}

// Manually-curated content from data/content.json — non-generated source data
// that is merged into the snapshot at build time.
export interface ProjectContent {
  name: string;
  tag: string;
  icon: string;
  desc: string;
  url: string;
}

// Only this small tag set can appear in imported article content.
export type ArticleTag = 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'li'
  | 'pre' | 'code' | 'blockquote' | 'a' | 'strong' | 'em' | 'b' | 'i' | 's' | 'del' | 'u'
  | 'br' | 'hr' | 'img' | 'figure' | 'figcaption' | 'table' | 'thead' | 'tbody' | 'tr'
  | 'th' | 'td' | 'dl' | 'dt' | 'dd' | 'sup' | 'sub' | 'div';

export interface ArticleElement {
  tag: ArticleTag;
  children: ArticleNode[];
  href?: string;
  src?: string;
  alt?: string;
  start?: number;
  colspan?: number;
  rowspan?: number;
}
export type ArticleNode = string | ArticleElement;

export interface ArticleContent {
  status: 'full' | 'summary' | 'unavailable';
  publishedTitle: string;
  byline: string;
  publishedAt: string;
  originalUrl: string;
  retrievedFrom: string;
  retrievedAt: string;
  blocks: ArticleNode[];
  note?: string;
  missingImages?: string[];
}

export interface WordContent {
  articleId?: string;
  article?: ArticleContent;
  archiveUrl?: string;
  source: string;
  title: string;
  url: string;
}

export interface ContentFile {
  projects: ProjectContent[];
  words: WordContent[];
}

// What gets written to data/snapshot.json. Combines live data fetched from
// upstreams (stats.fm, soundcloud, github) with the curated
// content from data/content.json.
export interface Snapshot {
  generatedAt: string;
  user: string;
  topAlbums: Album[];
  topArtists: Artist[];
  topArtistsLifetime?: Artist[];
  topArtistsLastYear?: Artist[];
  topTracks: Track[];
  topGenres?: Genre[];
  recentlyPlayed: Recent[];
  stats?: StatsfmStats;
  dateStats?: StatsfmDateStats;
  soundcloud?: SoundCloudData;
  github?: GithubRepoStats[];
}

// Renderer-friendly photo (already has tile-sizing flags + display strings).
export interface DisplayPhoto {
  url: string;
  title: string;
  loc: string;
  alt: string;
  takenAt: string;
  large: boolean;
  tall: boolean;
  wide: boolean;
}

// What the SSR layer sees: snapshot + content + computed display fields.
export interface SiteData {
  user: string;
  statsFmUser?: string;
  soundcloudUser?: string;
  albums: Album[];                       // top albums w/ palette colors
  topArtists: Artist[];
  topArtistsLifetime: Artist[];
  topArtistsLastYear: Artist[];
  topTracks: Track[];
  topGenres: Genre[];
  recentlyPlayed: Recent[];
  statsfmStats: StatsfmStats | null;
  statsfmDateStats: StatsfmDateStats | null;
  soundcloud: SoundCloudData | null;
  photos: DisplayPhoto[];
  projects: (ProjectContent & { github?: GithubRepoStats })[];
  words: WordContent[];
}

