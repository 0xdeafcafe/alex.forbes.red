// Read the build-time embedded stats.fm / SoundCloud / Instagram snapshot
// out of the <script id="music-snapshot"> tag in index.html.
// Returns null when the snapshot is empty or malformed (used as the signal
// to fall back to hardcoded data).

export function loadEmbeddedSnapshot() {
  const el = document.getElementById('music-snapshot');
  if (!el) return null;
  try {
    const j = JSON.parse((el.textContent || '').trim() || '{}');
    return (j && Array.isArray(j.topAlbums) && j.topAlbums.length) ? j : null;
  } catch (e) {
    console.warn('[snapshot] parse failed:', e);
    return null;
  }
}
