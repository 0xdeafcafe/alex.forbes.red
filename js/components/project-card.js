// Project card. When a GitHub stats blob is attached (project.github),
// the card shows a language dot, stargazer count, and a "X ago" since the
// last push.

import { escapeHtml, relativeTime } from '../lib/format.js';
import { projectTones } from '../data/store.js';

// GitHub's classic per-language colors (subset). Falls back to neutral grey.
const LANG_COLOR = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Go: '#00add8',
  Python: '#3572a5',
  Rust: '#dea584',
  Swift: '#f05138',
  Java: '#b07219',
  Kotlin: '#a97bff',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4f5d95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
};

function langColor(lang) {
  return (lang && LANG_COLOR[lang]) || '#888';
}

function compactNumber(n) {
  if (n == null) return '';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function statsRow(gh) {
  if (!gh) return '';
  const bits = [];
  if (gh.language) {
    bits.push(`
      <span class="project-stat">
        <span class="project-lang-dot" style="background: ${escapeHtml(langColor(gh.language))};"></span>
        ${escapeHtml(gh.language)}
      </span>`);
  }
  if (gh.stars >= 1) {
    bits.push(`
      <span class="project-stat">
        <i data-lucide="star" class="project-stat-icon"></i>
        ${escapeHtml(compactNumber(gh.stars))}
      </span>`);
  }
  if (gh.forks >= 1) {
    bits.push(`
      <span class="project-stat">
        <i data-lucide="git-fork" class="project-stat-icon"></i>
        ${escapeHtml(compactNumber(gh.forks))}
      </span>`);
  }
  if (gh.pushedAt) {
    bits.push(`
      <span class="project-stat project-stat-time" title="Last pushed">
        ${escapeHtml(relativeTime(gh.pushedAt))}
      </span>`);
  }
  if (gh.archived) {
    bits.push(`<span class="project-stat project-stat-archived">archived</span>`);
  }
  return bits.length ? `<div class="project-stats">${bits.join('')}</div>` : '';
}

export function makeProjectCard(project, index = 0) {
  const el = document.createElement('a');
  el.href = project.url;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
  el.className = 'project-card';
  el.dataset.tone = projectTones[index % projectTones.length];
  el.style.animationDelay = `${index * 35}ms`;

  // Prefer the live GitHub description over the hardcoded one when available.
  const description = project.github?.description || project.desc;

  el.innerHTML = `
    <span class="project-tag"><i data-lucide="${project.icon}"></i>${escapeHtml(project.tag)}</span>
    <h3 class="project-name">${escapeHtml(project.name)}</h3>
    <p class="project-desc">${escapeHtml(description)}</p>
    ${statsRow(project.github)}
    <span class="project-arrow"><i data-lucide="arrow-up-right"></i></span>
  `;
  return el;
}
