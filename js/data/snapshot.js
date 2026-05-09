// Read the build-time client payload out of the <script id="snapshot"> tag.
// The payload is always present at build time (see scripts/build.ts) — if
// it's missing we throw rather than fall back, so the page surfaces the bug
// instead of degrading silently.

export function loadSnapshot() {
  const el = document.getElementById('snapshot');
  if (!el) throw new Error('[snapshot] missing <script id="snapshot"> in index.html');
  const txt = (el.textContent || '').trim();
  if (!txt) throw new Error('[snapshot] empty <script id="snapshot"> — re-run `npm run build`');
  return JSON.parse(txt);
}
