// Top-level <App /> — renders the entire body content and is used by both
// SSR (renderToString) and the client (hydrate). All interactive state
// lives in hooks/context; no module reaches into the DOM directly.

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import {
  PivotContext, AccentContext,
  usePivotState, useAccentState,
  usePivot, usePivotLinks,
  type Pivot,
} from './state.js';
import { PhoneShell } from './render/components/phone-shell.js';
import { Discovery } from './render/components/discovery.js';
import {MetroPeople,MetroPhotos,MetroOffice,MetroMusic,MetroCollection} from './render/components/phone-apps.js';
import { Pinball } from './render/components/pinball.js';
import { routeApp, type AppId } from './lib/apps.js';
import { MediaCollection } from './render/pages/media-collection.js';
import { Desktop } from './render/components/desktop.js';
import { Ambient } from './render/components/ambient.js';
import { TileBg } from './render/components/tile-bg.js';
import { ChromeBar } from './render/components/chrome-bar.js';
import { PivotNav } from './render/components/pivot-nav.js';
import { ZunePlayer } from './render/components/zune-player.js';
import { QuickplayPage } from './render/pages/quickplay.js';
import { MusicPage } from './render/pages/music.js';
import { PhotographyPage } from './render/pages/photography.js';
import type { SiteData } from './lib/types.js';

// Only the active pivot renders its body. Inactive sections stay as empty
// shells so per-route HTML ships just one page's content — the next page's
// content materialises client-side when the user navigates to it.
function PivotPage({ name, children }: { name: Pivot; children: VNode | VNode[] }): VNode {
  const { pivot } = usePivot();
  const active = pivot === name;
  return html`
    <section class=${`pivot-page${active ? ' active' : ''}`} data-page=${name} id=${`panel-${name}`} role="tabpanel" aria-labelledby=${`tab-${name}`} tabIndex="0" hidden=${!active}>
      ${active ? children : null}
    </section>
  `;
}

function Pages({ data }: { data: SiteData }): VNode {
  return html`
    <main class="pivot-pages">
      <${PivotPage} name="quickplay"><${QuickplayPage} data=${data} /></${PivotPage}>
      <${PivotPage} name="collection"><${MediaCollection} data=${data} /></${PivotPage}>
      <${PivotPage} name="music"><${MusicPage} data=${data} /></${PivotPage}>
      <${PivotPage} name="photography"><${PhotographyPage} data=${data} /></${PivotPage}>
    </main>
  `;
}

function Experience({data,children}: {data:SiteData;children:VNode}): VNode {
  usePivotLinks();
  const [phone,setPhone]=useState(false);
  useLayoutEffect(()=>{const media=window.matchMedia('(max-width: 760px)');const update=()=>setPhone(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  const open=(app:AppId)=>window.dispatchEvent(new CustomEvent('open-site-app',{detail:app}));
  const renderApp=(app:AppId,active:boolean)=>{
    if(app==='zune')return html`<${MetroMusic} data=${data} active=${active}/>`;
    if(app==='keygen')return html`<${Discovery} data=${data} closed=${!active} metro onClose=${()=>open('zune')}/>`;
    if(app==='messenger')return html`<${MetroPeople}/>`;
    if(app==='word')return html`<div class="metro-page"><${MetroOffice} data=${data} active=${active}/></div>`;
    if(app==='photos')return html`<div class="metro-page"><${MetroPhotos} data=${data} active=${active}/></div>`;
    if(app==='pinball')return html`<${Pinball} active=${active}/>`;
    return html`<${MetroCollection} data=${data} active=${active}/>`;
  };
  return phone?html`<${PhoneShell} data=${data} renderApp=${renderApp}/>`:html`<${Desktop} data=${data}>${children}</${Desktop}>`;
}

export function App({ data, initialPivot }: { data: SiteData; initialPivot?: Pivot }): VNode {
  const pivotCtx = usePivotState(initialPivot);
  const accentCtx = useAccentState();
  const lastZunePivot = useRef<Pivot>(routeApp(pivotCtx.pivot)==='zune'?pivotCtx.pivot:'quickplay');
  if(routeApp(pivotCtx.pivot)==='zune')lastZunePivot.current=pivotCtx.pivot;
  const zuneCtx = {...pivotCtx,pivot:lastZunePivot.current};
  useEffect(()=>{const labels:Record<Pivot,string>={quickplay:'Quickplay',collection:'Collection',music:'Music',projects:'Projects',words:'Words',photography:'Photos'};document.title=`Alexander Forbes-Reed | ${labels[pivotCtx.pivot]}`;},[pivotCtx.pivot]);
  return html`<${PivotContext.Provider} value=${pivotCtx}><${AccentContext.Provider} value=${accentCtx}>
    <${Experience} data=${data}><${PivotContext.Provider} value=${zuneCtx}><div class="zune-surface zune-content"><${Ambient}/><${TileBg} data=${data}/><div class="vignette"/><div class="grain"/><div class="app"><${ChromeBar}/><${PivotNav}/><${Pages} data=${data}/></div><${ZunePlayer} data=${data}/></div></${PivotContext.Provider}></${Experience}>
  </${AccentContext.Provider}></${PivotContext.Provider}>`;
}
