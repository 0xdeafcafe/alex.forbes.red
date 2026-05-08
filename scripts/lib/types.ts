// Shared types for the snapshot pipeline.

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
