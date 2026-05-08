// Quickplay page: welcome panel (static in HTML), navigation tiles ("start"),
// recently-played history, and a Smart-DJ strip.

import { $ } from '../lib/dom.js';
import { paletteFor } from '../lib/palette.js';
import { albums, projects, words, photos, recentlyPlayed, topArtists } from '../data/store.js';
import { makeAlbumTile } from '../components/tile.js';
import { makeActionTile } from '../components/action-tile.js';
import { makeSmartTile } from '../components/smart-tile.js';

// Squash recently-played tracks into a deduped "recently visited albums" list,
// using the album image when present and a paletted gradient otherwise.
function recentTracksToAlbums(recent, max) {
  const seen = new Set();
  const out = [];
  for (const t of recent) {
    const key = `${t.artist}::${t.album || t.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pal = paletteFor(key);
    out.push({
      artist: t.artist,
      name: t.album || t.name,
      coverUrl: t.coverUrl,
      url: t.url,
      c1: pal.c1,
      c2: pal.c2,
    });
    if (out.length >= max) break;
  }
  return out;
}

function renderStart() {
  const host = $('#qp-start');
  host.innerHTML = '';
  host.appendChild(makeActionTile({
    name: 'browse the collection',
    tag: 'OVERVIEW · ABOUT',
    icon: 'compass',
    pivot: 'collection',
  }, { featured: true }));
  host.appendChild(makeActionTile({
    name: 'music',
    tag: `${albums.length} ALBUMS`,
    icon: 'music',
    pivot: 'music',
    c1: '#2a1a4e', c2: '#0a0514',
  }));
  host.appendChild(makeActionTile({
    name: 'projects',
    tag: `${projects.length} REPOS`,
    icon: 'code-2',
    pivot: 'projects',
    c1: '#0a3a3a', c2: '#020a0a',
  }));
  host.appendChild(makeActionTile({
    name: 'words',
    tag: `${words.length} ESSAYS`,
    icon: 'pen-line',
    pivot: 'words',
    c1: '#1a1a3e', c2: '#0a0a14',
  }));
  host.appendChild(makeActionTile({
    name: 'photography',
    tag: `${photos.length} FRAMES`,
    icon: 'camera',
    pivot: 'photography',
    c1: '#3a2a18', c2: '#0a0805',
  }));
}

function renderHistory() {
  const host = $('#qp-history');
  host.innerHTML = '';
  const recentAlbums = recentTracksToAlbums(recentlyPlayed, 5);
  // Live snapshot path; fall back to the top-album list when there's no data.
  const items = recentAlbums.length >= 5 ? recentAlbums : [
    albums[11] || albums[0], albums[8] || albums[1], albums[10] || albums[2],
    albums[14] || albums[3], albums[15] || albums[4],
  ].filter(Boolean);
  items.forEach((a, i) => {
    host.appendChild(makeAlbumTile(a, { big: i === 0 }));
  });
}

function renderSmartDj() {
  const host = $('#qp-smart');
  host.innerHTML = '';
  // Prefer real top artists with their photos; fall back to top albums.
  const source = topArtists.length
    ? topArtists.slice(0, 8).map(ar => ({
        kind: 'artist',
        name: ar.name,
        image: ar.image,
        url: ar.url,
        followers: ar.followers,
      }))
    : albums.slice(0, 8).map(a => ({
        kind: 'album',
        name: a.artist,
        image: a.coverUrl,
        url: a.url,
        c1: a.c1, c2: a.c2,
      }));
  source.forEach(item => host.appendChild(makeSmartTile(item)));
}

export function renderQuickplay() {
  renderStart();
  renderHistory();
  renderSmartDj();
}
