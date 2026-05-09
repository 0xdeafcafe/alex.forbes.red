import { projectCard } from '../components/project-card.js';
import type { SiteData } from '../../lib/types.js';

export function renderProjectsGrid(data: SiteData): string {
  return data.projects.map((p, i) => projectCard(p, i)).join('');
}
