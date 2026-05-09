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

export interface InstagramPhotoRaw {
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
  photos: InstagramPhotoRaw[];
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

export interface WordContent {
  source: string;
  title: string;
  url: string;
}

export interface ContentFile {
  projects: ProjectContent[];
  words: WordContent[];
}

// What gets written to data/snapshot.json. Combines live data fetched from
// upstreams (stats.fm, soundcloud, instagram, github) with the curated
// content from data/content.json.
export interface Snapshot {
  generatedAt: string;
  user: string;
  topAlbums: Album[];
  topArtists: Artist[];
  topTracks: Track[];
  recentlyPlayed: Recent[];
  soundcloud?: SoundCloudData;
  instagram?: InstagramData;
  github?: GithubRepoStats[];
}

// Renderer-friendly photo (already has tile-sizing flags + display strings).
export interface DisplayPhoto {
  url: string;
  title: string;
  loc: string;
  instagramUrl?: string;
  takenAt: string;
  large: boolean;
  tall: boolean;
  wide: boolean;
}

// What the SSR layer sees: snapshot + content + computed display fields.
export interface SiteData {
  user: string;
  statsFmUser?: string;
  instagramUser?: string;
  soundcloudUser?: string;
  albums: Album[];                       // top albums w/ palette colors
  topArtists: Artist[];
  recentlyPlayed: Recent[];
  soundcloud: SoundCloudData | null;
  photos: DisplayPhoto[];
  projects: (ProjectContent & { github?: GithubRepoStats })[];
  words: WordContent[];
}

// Subset of SiteData that gets embedded into the page for client-side use
// (tile-bg flipper + last-spun rotator). Trimmed to only what the client
// actually reads to keep the inlined payload small.
export interface ClientData {
  albums: Pick<Album, 'artist' | 'name' | 'coverUrl' | 'url' | 'c1' | 'c2'>[];
  photos: Pick<DisplayPhoto, 'url' | 'title' | 'loc' | 'instagramUrl' | 'takenAt'>[];
  recentlyPlayed: Pick<Recent, 'name' | 'artist' | 'album' | 'coverUrl' | 'endTime' | 'url'>[];
  words: WordContent[];
  projects: Pick<ProjectContent, 'name' | 'tag' | 'url'>[];
}
