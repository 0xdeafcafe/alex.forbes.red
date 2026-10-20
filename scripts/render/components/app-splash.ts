import {html} from 'htm/preact';
import type {VNode} from 'preact';
import type {AppId} from '../../lib/apps.js';
import {APP_NAMES} from '../../lib/apps.js';

export const SPLASH_APPS = new Set<AppId>(['zune','encarta','messenger']);
export function AppSplash({app}:{app:AppId}):VNode {
  return html`<div class=${`app-splash splash-${app}`} role="status" aria-label=${`Starting ${APP_NAMES[app]}`}>
    <div class="app-splash-card">
      ${app==='zune'?html`<img class="splash-alex-logo" src="/assets/alex/alex-wordmark.svg" alt="Alex"/>`:app==='messenger'?html`<h2>Signing in…</h2><div class="msm-signin-animation" aria-hidden="true"><img src="/assets/xp/messenger-person.svg" alt=""/><img src="/assets/xp/messenger-person.svg" alt=""/></div>`:html`<div class="splash-encyclopedia-title"><h2>ALEXACARTA <small>’26</small></h2><p>Project Encyclopedia</p></div>`}
    </div>
  </div>`;
}
