import {html} from 'htm/preact';
import type {VNode} from 'preact';
import type {AppId} from '../../lib/apps.js';
import {APP_NAMES} from '../../lib/apps.js';

export const SPLASH_APPS = new Set<AppId>(['zune','encarta','messenger','word','keygen','pinball']);
export function AppSplash({app,onDone}:{app:AppId;onDone:()=>void}):VNode {
  const names:Partial<Record<AppId,string>>={encarta:'ALEXACARTA',word:'Microsoft Office',keygen:'Digital Creativity',pinball:'Canal Cadet'};
  const subtitles:Partial<Record<AppId,string>>={zune:'music · pictures · people',encarta:'Project Encyclopedia · Personal Edition',messenger:'A little more about Alexander Forbes-Reed',word:'Word 2003',keygen:'Ideas unlocked.',pinball:'3D PINBALL · AMSTERDAM AFTER DARK'};
  return html`<div class=${`app-splash splash-${app}`} role="status" aria-label=${`Starting ${APP_NAMES[app]}`}>
    <div class="app-splash-card">
      ${app==='zune'?html`<img class="splash-alex-logo" src="/assets/alex/alex-wordmark.svg" alt="Alex"/>`:app==='messenger'?html`<div class="msm-signin-animation" aria-hidden="true"><img src="/assets/xp/messenger-person.svg" alt=""/><img src="/assets/xp/messenger-person.svg" alt=""/></div>`:app==='word'?html`<span class="splash-word-logo" aria-hidden="true">W</span>`:app==='pinball'?html`<img class="splash-pinball-art" src="/assets/pinball/marquee.png" alt=""/>`:null}
      ${app!=='zune'&&html`<h2>${names[app]??APP_NAMES[app]}</h2>`}
      <p>${subtitles[app]}</p><div class="splash-loading" aria-hidden="true"><i/><i/><i/></div>
      <footer><span>Alexander Forbes-Reed</span><button onClick=${onDone} aria-label=${`Continue to ${APP_NAMES[app]}`}>Continue ›</button></footer>
    </div>
  </div>`;
}
