// Project card. When a GitHub stats blob is attached, the card shows a
// language dot, stargazer count, and a "X ago" since the last push.

import { compactNumber, escapeHtml, relativeTime } from '../format.js';
import type { GithubRepoStats, ProjectContent } from '../../lib/types.js';

const PROJECT_TONES = ['purple', 'orange', 'green', 'red', 'blue', 'brown', 'teal', 'pink'];

// GitHub's classic per-language colors (subset). Falls back to neutral grey.
const LANG_COLOR: Record<string, string> = {
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

function langColor(lang: string | null | undefined): string {
  return (lang && LANG_COLOR[lang]) || '#888';
}

function statsRow(gh: GithubRepoStats | undefined): string {
  if (!gh) return '';
  const bits: string[] = [];
  if (gh.language) {
    bits.push(
      `<span class="project-stat">`
      + `<span class="project-lang-dot" style="background: ${escapeHtml(langColor(gh.language))};"></span>`
      + `${escapeHtml(gh.language)}`
      + `</span>`,
    );
  }
  if (gh.stars >= 1) {
    bits.push(
      `<span class="project-stat">`
      + `<i data-lucide="star" class="project-stat-icon"></i>`
      + `${escapeHtml(compactNumber(gh.stars))}`
      + `</span>`,
    );
  }
  if (gh.forks >= 1) {
    bits.push(
      `<span class="project-stat">`
      + `<i data-lucide="git-fork" class="project-stat-icon"></i>`
      + `${escapeHtml(compactNumber(gh.forks))}`
      + `</span>`,
    );
  }
  if (gh.pushedAt) {
    bits.push(
      `<span class="project-stat project-stat-time" title="Last pushed">`
      + `${escapeHtml(relativeTime(gh.pushedAt))}`
      + `</span>`,
    );
  }
  if (gh.archived) {
    bits.push(`<span class="project-stat project-stat-archived">archived</span>`);
  }
  return bits.length ? `<div class="project-stats">${bits.join('')}</div>` : '';
}

export function projectCard(project: ProjectContent & { github?: GithubRepoStats }, index = 0): string {
  // Prefer the live GitHub description over the curated one when available.
  const description = project.github?.description || project.desc;
  return (
    `<a class="project-card" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" `
    + `data-tone="${PROJECT_TONES[index % PROJECT_TONES.length]}" `
    + `style="animation-delay: ${index * 35}ms">`
    + `<span class="project-tag"><i data-lucide="${escapeHtml(project.icon)}"></i>${escapeHtml(project.tag)}</span>`
    + `<h3 class="project-name">${escapeHtml(project.name)}</h3>`
    + `<p class="project-desc">${escapeHtml(description)}</p>`
    + statsRow(project.github)
    + `<span class="project-arrow"><i data-lucide="arrow-up-right"></i></span>`
    + `</a>`
  );
}
