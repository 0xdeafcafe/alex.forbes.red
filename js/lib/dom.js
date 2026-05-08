// Tiny DOM helpers. Exists so other modules can stay focused on their job.

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

// Re-create lucide icons. Wraps the optional global so callers don't need to
// guard for it themselves.
export function refreshIcons() {
  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}
