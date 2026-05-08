import { $ } from '../lib/dom.js';
import { projects } from '../data/store.js';
import { makeProjectCard } from '../components/project-card.js';

export function renderProjects() {
  const host = $('#projects-grid');
  host.innerHTML = '';
  projects.forEach((p, i) => host.appendChild(makeProjectCard(p, i)));
}
