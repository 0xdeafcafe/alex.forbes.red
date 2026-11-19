import {html} from 'htm/preact';
import type {VNode} from 'preact';
import type {AppId} from '../../lib/apps.js';
import {APP_NAMES} from '../../lib/apps.js';

export const SPLASH_APPS = new Set<AppId>(['zune','encarta','messenger']);
// Messenger recreates the MSN 7.5 sign-in sequence, so it lingers a beat longer.
export const SPLASH_MS: Partial<Record<AppId,number>> = {messenger:2000,encarta:1600};
export function AppSplash({app}:{app:AppId}):VNode {
  return html`<div class=${`app-splash splash-${app}`} role="status" aria-label=${`Starting ${APP_NAMES[app]}`}>
    ${app==='zune'?html`
      <div class="splash-zune-mark" aria-hidden="true">
        <span class="splash-zune-logo"><img class="splash-alex-logo" src="/assets/alex/alex-wordmark.svg" alt=""/><i class="splash-zune-ring"/></span>
        <span class="splash-zune-loader"><i/><i/></span>
      </div>`
    :app==='messenger'?html`
      <div class="msm-signin" aria-hidden="true">
        <div class="msm-signin-titlebar"><img src="/assets/xp/alex-messenger.svg" alt=""/><span>Alex’s Main Stream Media</span><span class="msm-signin-controls"><i class="msm-glyph-min"/><i class="msm-glyph-max"/><i class="msm-glyph-close"/></span></div>
        <div class="msm-signin-menubar"><span>File</span><span>Contacts</span><span>Actions</span><span>Tools</span><span>Help</span></div>
        <div class="msm-signin-banner">
          <span class="msm-logo-people"><img class="msm-person msm-person-back" src="/assets/xp/messenger-person.svg" alt=""/><img class="msm-person msm-person-front" src="/assets/xp/messenger-person.svg" alt=""/></span>
          <span class="msm-logo-wordmark"><strong>msn</strong> messenger</span>
        </div>
        <div class="msm-signin-body">
          <p class="msm-signin-status">Signing in to .NET Messenger Service</p>
          <p class="msm-signin-account">as <strong>alex</strong></p>
          <div class="msm-signin-progress"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <p class="msm-signin-note">Opening contact list…</p>
          <span class="msm-signin-cancel">Cancel</span>
        </div>
      </div>`
    :html`<div class="app-splash-card splash-encyclopedia-card">
      <div class="splash-encyclopedia-title"><h2>ALEXACARTA <small>’26</small></h2><p>Project Encyclopedia</p></div>
    </div>`}
  </div>`;
}
