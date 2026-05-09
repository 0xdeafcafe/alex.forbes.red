// Music page: main mosaic + top-artists strip + recently-played feed
// + SoundCloud likes feed + snapshot meta line.

import { $, $$ } from '../lib/dom.js';
import { escapeHtml, relativeTime } from '../lib/format.js';
import { albums, recentlyPlayed, topArtists, soundcloudData, musicSnapshot } from '../data/store.js';
import { makeAlbumMosaicTile } from '../components/album-tile.js';
import { makeArtistTile } from '../components/artist-tile.js';
import { makeRecentRow } from '../components/recent-row.js';

function renderMosaic() {
  const host = $('#music-mosaic');
  host.innerHTML = '';
  albums.forEach((album, i) => void host.appendChild(makeAlbumMosaicTile(album, i)));
}

function renderArtistsStrip() {
  const host = $('#music-artists');
  const wrap = $('#music-artists-section');
  if (!host || !wrap) return;
  host.innerHTML = '';
  if (!topArtists.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  topArtists.slice(0, 12).forEach((ar, i) => void host.appendChild(makeArtistTile(ar, i)));
}

function renderRecentFeed() {
  const host = $('#music-recent');
  const wrap = $('#music-recent-section');
  if (!host || !wrap) return;
  host.innerHTML = '';
  if (!recentlyPlayed.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  recentlyPlayed.slice(0, 18).forEach((t, i) => {
    host.appendChild(makeRecentRow({
      url: t.url,
      title: t.name,
      subtitle: t.artist,
      coverUrl: t.coverUrl,
      timestamp: t.endTime,
      paletteSeed: `${t.artist}::${t.album || t.name}`,
      index: i,
    }));
  });
}

function renderSoundcloud() {
  const host = $('#music-soundcloud');
  const wrap = $('#music-soundcloud-section');
  const meta = $('#music-soundcloud-meta');
  if (!host || !wrap) return;
  host.innerHTML = '';
  const likes = soundcloudData?.likes ?? [];
  if (!likes.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  if (meta && soundcloudData?.user) {
    meta.innerHTML = `${likes.length} likes · live from <a href="https://soundcloud.com/${escapeHtml(soundcloudData.user)}/likes" target="_blank" rel="noopener noreferrer">soundcloud.com/${escapeHtml(soundcloudData.user)}</a>`;
  }
  likes.forEach((l, i) => {
    const subParts = [l.artist];
    if (l.uploader) subParts.push(`@${l.uploader}`);
    if (l.genre) subParts.push(l.genre);
    host.appendChild(makeRecentRow({
      url: l.url,
      title: l.title,
      subtitle: subParts.join(' · '),
      coverUrl: l.artworkUrl,
      timestamp: l.likedAt,
      paletteSeed: `${l.artist}::${l.title}`,
      index: i,
    }));
  });
}

function renderSnapshotMeta() {
  const meta = $('#music-snapshot-meta');
  if (!meta) return;
  if (musicSnapshot && musicSnapshot.user) {
    meta.innerHTML = `live from <a href="https://stats.fm/${escapeHtml(musicSnapshot.user)}" target="_blank" rel="noopener noreferrer">stats.fm/${escapeHtml(musicSnapshot.user)}</a>`;
    meta.style.display = '';
  } else {
    meta.style.display = 'none';
  }
}

// Refresh "Xm ago" labels on the music page once a minute without re-rendering.
function startRelativeTimeRefresh() {
  setInterval(() => {
    $$('.recent-time[data-end]').forEach(el => {
      const end = el.dataset.end;
      if (end) el.textContent = relativeTime(end);
    });
  }, 60_000);
}

export function renderMusic() {
  renderMosaic();
  renderArtistsStrip();
  renderRecentFeed();
  renderSoundcloud();
  renderSnapshotMeta();
}

export function initMusicPage() {
  startRelativeTimeRefresh();
}
