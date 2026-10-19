import {html} from 'htm/preact';
import type {VNode} from 'preact';
import {profile} from '../../lib/profile.js';

export function CollectionPage(): VNode {
  return html`<div class="bio-block"><h2 class="bio-headline">${profile.bio}</h2>
    <div class="bio-meta"><div class="meta-block"><div class="meta-label">currently</div><div class="meta-value">${profile.role}<br/><a href=${profile.company.url} target="_blank" rel="noopener noreferrer">@${profile.company.name}</a></div></div>
    <div class="meta-block"><div class="meta-label">based</div><div class="meta-value">${profile.location}</div></div>
    <div class="meta-block"><div class="meta-label">stack</div><div class="meta-value">${profile.stack}</div></div></div>
    <div class="bio-socials">${profile.socials.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer">${l.label}</a>`)}</div></div>
    <div class="bio-sections">${profile.sections.map(s=>html`<section class="bio-section"><h3 class="meta-label">${s.title}</h3><p class="bio-line">${s.text}</p><p class="bio-line">${s.links.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer">${l.label}</a> `)}</p></section>`)}</div>`;
}
