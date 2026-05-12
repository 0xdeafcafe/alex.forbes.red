// Build-time string helpers. Mirrors the runtime helpers in js/lib/format.js
// — kept duplicated rather than shared so the client bundle has zero TS
// machinery to import. Escaping is handled by preact-render-to-string at
// the SSR layer; these helpers stick to plain string transforms.

export function monogram(s: string): string {
  return String(s)
    .split(/\s+/)
    .map(w => w.replace(/[^A-Za-z0-9]/g, '')[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function relativeTime(iso: string | undefined | null): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatFollowers(n: number | undefined): string {
  if (!n) return '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'K';
  return String(n);
}

export function cssKey(a: { artist: string; name: string }): string {
  return `${a.artist}__${a.name}`.replace(/[^A-Za-z0-9_]/g, '_');
}

// Cleanish first-line excerpt of an Instagram caption.
export function igCaptionTitle(caption: string | undefined): string {
  if (!caption) return '';
  const cleaned = caption.replace(/#\w+/g, '').replace(/@(\w+)/g, '@$1').replace(/\s+/g, ' ').trim();
  const m = cleaned.match(/^[^.!?\n]+/);
  return (m ? m[0] : cleaned).slice(0, 80).trim();
}

export function igPhotoSubtitle(photo: { takenAt: string }): string {
  const dt = new Date(photo.takenAt);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function compactNumber(n: number | undefined | null): string {
  if (n == null) return '';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}
