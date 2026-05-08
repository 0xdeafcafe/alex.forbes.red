// Project card (Projects page).

import { escapeHtml } from '../lib/format.js';
import { projectTones } from '../data/store.js';

export function makeProjectCard(project, index = 0) {
  const el = document.createElement('a');
  el.href = project.url;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
  el.className = 'project-card';
  el.dataset.tone = projectTones[index % projectTones.length];
  el.style.animationDelay = `${index * 35}ms`;
  el.innerHTML = `
    <span class="project-tag"><i data-lucide="${project.icon}"></i>${escapeHtml(project.tag)}</span>
    <h3 class="project-name">${escapeHtml(project.name)}</h3>
    <p class="project-desc">${escapeHtml(project.desc)}</p>
    <span class="project-arrow"><i data-lucide="arrow-up-right"></i></span>
  `;
  return el;
}
