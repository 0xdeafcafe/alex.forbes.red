import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { ProjectCard } from '../components/project-card.js';
import type { SiteData } from '../../lib/types.js';

export function ProjectsPage({ data }: { data: SiteData }): VNode {
  return html`
    <${Fragment}>
      <div class="page-watermark" aria-hidden="true">projects</div>
      <h2 class="section-label-big">open source</h2>
      <div class="projects-grid">
        ${data.projects.map((p, i) => html`<${ProjectCard} project=${p} index=${i} />`)}
      </div>
    </${Fragment}>
  `;
}
