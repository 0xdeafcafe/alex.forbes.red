import { AppSplash, SPLASH_APPS } from './app-splash.js';
import { html } from 'htm/preact';
import { Fragment, type ComponentChildren, type VNode } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { APP_IDS, APP_NAMES, routeApp, type AppId } from '../../lib/apps.js';
import { GrooveMark } from './brand.js';
import { Discovery } from './discovery.js';
import { Messenger, Word, PictureViewer } from './retro-apps.js';
import { Pinball } from './pinball.js';
import { Explorer, FOLDER_IDS, type FolderId } from './explorer.js';
import { Encarta } from './encarta.js';
import { Welcome } from './welcome.js';
import { usePivot } from '../../state.js';
import type { SiteData } from '../../lib/types.js';

type WindowState = 'open' | 'minimized' | 'closed';
const titles: Record<AppId,string> = {...APP_NAMES, zune:'Alex — Alexander Forbes-Reed', messenger:'Alex Messenger — About Alexander Forbes-Reed'};
const appNames = APP_NAMES;

function AppIcon({app}: {app:AppId}): VNode {
  if(app==='zune')return html`<img class="desktop-app-icon real-zune-icon" src="/assets/alex/alex-icon.svg" alt="" draggable="false"/>`;
  if(app==='messenger')return html`<img class="desktop-app-icon" src="/assets/xp/alex-messenger.svg" alt="" draggable="false"/>`;
  const icons: Partial<Record<AppId,string>> = {explorer:'computer',encarta:'folder',keygen:'application',photos:'pictures',word:'document'};
  if(icons[app]) return html`<img class="desktop-app-icon" src=${`/assets/xp/${icons[app]}.png`} alt="" />`;
  return html`<span class=${`desktop-app-icon icon-${app}`} aria-hidden="true">●</span>`;
}

function DesktopWindow({ app, state, active, ready, onFocus, onState, children, title = titles[app] }: {
  app: AppId; state: WindowState; active: boolean; ready:boolean; onFocus: () => void;
  onState: (state: WindowState) => void; children: ComponentChildren; title?: string;
}): VNode {
  const splashSeen=useRef(false);
  const [splash,setSplash]=useState(false);
  useEffect(()=>{
    if(!ready||state!=='open'||splashSeen.current||!SPLASH_APPS.has(app))return;
    splashSeen.current=true;
    setSplash(true);
    const timer=window.setTimeout(()=>setSplash(false),3500);
    return()=>{window.clearTimeout(timer);setSplash(false);};
  },[ready,state,app]);
  const [maximized, setMaximized] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [outline, setOutline] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const resize = useRef<{ next: { left: number; top: number; width: number; height: number }; edge: string; x: number; y: number; left: number; top: number; width: number; height: number } | null>(null);
  const drag = useRef<{ x: number; y: number; width:number; height:number; next:{left:number;top:number;width:number;height:number} } | null>(null);
  const frame = useRef<HTMLElement>(null);
  useEffect(() => {
    const cancel = () => { resize.current = null; drag.current = null; setOutline(null); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && (resize.current || drag.current)) { e.preventDefault(); e.stopImmediatePropagation(); cancel(); } };
    const reset = () => {
      cancel();
      if (window.innerWidth <= 760) return;
      setSize(current => current ? { width: Math.min(current.width, window.innerWidth), height: Math.min(current.height, window.innerHeight - 30) } : null);
      setPosition(current => current ? { x: Math.max(0, Math.min(current.x, window.innerWidth - (frame.current?.offsetWidth ?? 300))), y: Math.max(0, Math.min(current.y, window.innerHeight - 30 - Math.min(frame.current?.offsetHeight ?? 260, window.innerHeight - 30))) } : null);
    };
    window.addEventListener('resize', reset);
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('resize', reset);
      window.removeEventListener('blur', cancel); window.removeEventListener('keydown', escape); };
  }, []);
  return html`<${Fragment}>
    <section ref=${frame} class=${`desktop-window window-${app}${active ? ' is-active' : ''}${maximized ? ' is-maximized' : ''}`}
      tabIndex="-1" aria-label=${title} hidden=${state !== 'open' || splash || (ready && !splashSeen.current && SPLASH_APPS.has(app))}
      style=${!maximized ? { ...(position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : {}), ...(size ? { width: size.width, height: size.height } : {}) } : undefined}
      onPointerDown=${onFocus} onFocusIn=${onFocus}>
      <header class="xp-titlebar"
        onDblClick=${() => setMaximized(v => !v)}
        onPointerDown=${(e: PointerEvent) => {
          if (!e.isPrimary || maximized || e.button !== 0 || (e.target as HTMLElement).closest('button') || window.innerWidth <= 760) return;
          const rect = frame.current!.getBoundingClientRect();
          e.preventDefault();
          const next={left:rect.left,top:rect.top,width:rect.width,height:rect.height};
          drag.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, width:rect.width,height:rect.height,next };
          setOutline(next);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove=${(e: PointerEvent) => {
          if (!e.isPrimary || !drag.current) return;
          const d=drag.current;
          d.next={left:Math.max(0,Math.min(window.innerWidth-d.width,e.clientX-d.x)),top:Math.max(0,Math.min(window.innerHeight-60,e.clientY-d.y)),width:d.width,height:d.height};
          setOutline(d.next);
        }}
        onPointerUp=${(e:PointerEvent) => { if(!e.isPrimary)return;const next=drag.current?.next;if(next)setPosition({x:next.left,y:next.top});drag.current=null;setOutline(null); }} onPointerCancel=${() => { drag.current=null;setOutline(null); }} onLostPointerCapture=${() => { drag.current = null; setOutline(null); }}>
        <${AppIcon} app=${app} /><span class="xp-window-title">${title}</span>
        <div class="xp-window-controls" onDblClick=${(e: Event) => e.stopPropagation()}>
          <button aria-label=${`Minimize ${app === 'explorer' ? title : appNames[app]}`} onClick=${() => onState('minimized')}><span class="xp-minimize-glyph" aria-hidden="true" /></button>
          <button aria-label=${`${maximized ? 'Restore' : 'Maximize'} ${app === 'explorer' ? title : appNames[app]}`} onClick=${() => setMaximized(v => !v)}><span class=${maximized ? "xp-restore-glyph" : "xp-maximize-glyph"} aria-hidden="true" /></button>
          <button class="xp-close" aria-label=${`Close ${app === 'explorer' ? title : appNames[app]}`} onClick=${() => onState('closed')}><span class="xp-close-glyph" aria-hidden="true" /></button>
        </div>
      </header>
      <div inert=${splash} aria-hidden=${splash||undefined} class=${app==='zune'?'zune-window-content':`${app}-surface`}>${children}</div>
      ${!maximized && ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(edge => html`<span class=${`xp-resize xp-resize-${edge}`} aria-hidden="true"
        onPointerDown=${(e: PointerEvent) => {
          if (!e.isPrimary || e.button !== 0) return;
          e.preventDefault();
          const rect = frame.current!.getBoundingClientRect();
          const next = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
          resize.current = { edge, x: e.clientX, y: e.clientY, ...next, next };
          setOutline(next);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove=${(e: PointerEvent) => {
          const r = resize.current; if (!e.isPrimary || !r) return;
          const minW = Math.min(app === 'zune' ? 420 : 300, window.innerWidth);
          const minH = Math.min(260, window.innerHeight - 30);
          let left = r.left, top = r.top, right = r.left + r.width, bottom = r.top + r.height;
          if (r.edge.includes('e')) right = Math.max(left + minW, Math.min(window.innerWidth, right + e.clientX - r.x));
          if (r.edge.includes('s')) bottom = Math.max(top + minH, Math.min(window.innerHeight - 30, bottom + e.clientY - r.y));
          if (r.edge.includes('w')) left = Math.max(0, Math.min(right - minW, left + e.clientX - r.x));
          if (r.edge.includes('n')) top = Math.max(0, Math.min(bottom - minH, top + e.clientY - r.y));
          r.next = { left, top, width: right - left, height: bottom - top };
          setOutline(r.next);
        }} onPointerUp=${(e:PointerEvent) => {
          if(!e.isPrimary)return;
          const next = resize.current?.next;
          if (next) { setPosition({ x: next.left, y: next.top }); setSize({ width: next.width, height: next.height }); }
          resize.current = null; setOutline(null);
        }} onPointerCancel=${() => { resize.current = null; setOutline(null); }}
        onLostPointerCapture=${() => { resize.current = null; setOutline(null); }} />`)}
    </section>
    ${splash&&state==='open'&&html`<${AppSplash} app=${app} onDone=${()=>setSplash(false)}/>`}
    ${outline && html`<div class="xp-resize-outline" style=${outline} aria-hidden="true" />`}
    </${Fragment}>`;
}

export function Desktop({ data, children }: { data: SiteData; children: ComponentChildren }): VNode {
  const [signedIn, setSignedIn] = useState(false);
  const [poweredOff, setPoweredOff] = useState(false);
  const { pivot, navigationKey } = usePivot();
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(() => Object.fromEntries(APP_IDS.map(app => [app, app === (pivot==='quickplay'?'messenger':routeApp(pivot)) ? 'open' : app==='zune'||app==='keygen' ? 'minimized' : 'closed'])) as Record<AppId,WindowState>);
  const [active, setActive] = useState<AppId>(pivot==='quickplay'?'messenger':routeApp(pivot));
  const explorerTitle = 'My Computer';
  const [folderRequest,setFolderRequest]=useState<{folder:FolderId;request:number}>({folder:'home',request:0});
  const [start, setStart] = useState(false);
  const [programs, setPrograms] = useState(false);
  const [clock, setClock] = useState('');
  const menu = useRef<HTMLDivElement>(null);
  const zune = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const open = (app: AppId, record=true) => {
    const next={...windows,[app]:'open' as WindowState};
    if(record && (active!==app||windows[app]!=='open')){
      history.replaceState({...history.state,afrDesktop:{windows,active}},'');
      const index=(Number.isInteger(history.state?.afrIndex)?history.state.afrIndex:0)+1;
      history.pushState({...history.state,afrIndex:index,afrDesktop:{windows:next,active:app}},'');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setWindows(next);setActive(app);setStart(false);
    if(active!==app||windows[app]!=='open')requestAnimationFrame(()=>document.querySelector<HTMLElement>(`.window-${app}`)?.focus({preventScroll:true}));
  };
  useEffect(()=>{const handle=(e:Event)=>{const app=(e as CustomEvent).detail;if(APP_IDS.includes(app))open(app);};window.addEventListener('open-site-app',handle);return()=>window.removeEventListener('open-site-app',handle);},[active,windows]);
  const turnOff = () => { setStart(false); setSignedIn(false); setPoweredOff(true); };
  const explore = (folder:FolderId) => { setFolderRequest(current=>({folder,request:current.request+1}));open('explorer'); };
  useEffect(()=>{
    const item=(event:Event)=>{const detail=(event as CustomEvent).detail;if(!detail||!Number.isInteger(detail.index)||detail.index<0)return;if(detail.app==='photos'&&detail.index<data.photos.length||detail.app==='word'&&detail.index<data.words.length)open(detail.app);};
    const folder=(event:Event)=>{const id=(event as CustomEvent).detail;if(FOLDER_IDS.includes(id))explore(id);};
    window.addEventListener('open-site-item',item);window.addEventListener('open-site-folder',folder);
    return()=>{window.removeEventListener('open-site-item',item);window.removeEventListener('open-site-folder',folder);};
  },[active,windows,data.photos.length,data.words.length]);
  const firstRoute = useRef(true);
  useEffect(() => {
    const saved=history.state?.afrDesktop;
    if(saved && APP_IDS.includes(saved.active) && APP_IDS.every(app=>['open','closed','minimized'].includes(saved.windows?.[app]))){
      setWindows(saved.windows);setActive(saved.active);setStart(false);
      requestAnimationFrame(()=>document.querySelector<HTMLElement>(`.window-${saved.active}`)?.focus({preventScroll:true}));
    }else if(!firstRoute.current){
      const app=pivot==='quickplay'?'messenger':routeApp(pivot);
      const next={...windows,[app]:'open' as WindowState};
      history.replaceState({...history.state,afrDesktop:{windows:next,active:app}},'');
      open(app,false);
    }else history.replaceState({...history.state,afrDesktop:{windows,active}},'');
    firstRoute.current=false;
  },[pivot,navigationKey]);
  useEffect(() => {
    zune.current?.querySelector('.zune-surface')?.scrollTo({ top: 0 });
  }, [pivot]);
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    tick(); const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!start) return;
    menu.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const close = (e: PointerEvent) => { if (!menu.current?.contains(e.target as Node) && !startButton.current?.contains(e.target as Node)) setStart(false); };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setStart(false); startButton.current?.focus(); return; }
      if (!['Tab', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? []).filter(b => !b.disabled && b.getClientRects().length);
      if (!buttons.length) return;
      e.preventDefault();
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (current + ((e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) ? -1 : 1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [start]);
  return html`
    <div class="xp-shell">
    ${poweredOff && html`<section class="xp-powered-off" aria-label="Computer turned off"><p>It is now safe to turn off your computer.</p><button onClick=${() => setPoweredOff(false)}>Restart</button></section>`}
    ${!signedIn && !poweredOff && html`<${Welcome} onTurnOff=${turnOff} onEnter=${() => { setSignedIn(true); requestAnimationFrame(() => startButton.current?.focus()); }} />`}
    <div class="xp-desktop" ref=${zune} inert=${!signedIn} aria-hidden=${!signedIn}>
      <nav class="desktop-shortcuts" aria-label="Desktop shortcuts">
        ${(['explorer','messenger','zune','keygen','pinball'] as AppId[]).map(app=>html`<button data-creativity-launch=${app==='keygen'||undefined} onClick=${()=>app==='explorer'?explore('home'):open(app)}><${AppIcon} app=${app}/><span class=${app==='keygen'?'desktop-keygen-name':undefined}>${appNames[app]}${app==='keygen'?'.exe':''}</span></button>`)}
      </nav>
      <${DesktopWindow} ready=${signedIn} app="zune" state=${windows.zune} active=${active === 'zune'} onFocus=${() => setActive('zune')}
        onState=${(state: WindowState) => { setWindows(w => ({ ...w, zune: state })); startButton.current?.focus(); }}>${children}</${DesktopWindow}>
      <${DesktopWindow} ready=${signedIn} app="keygen" state=${windows.keygen} active=${active === 'keygen'} onFocus=${() => setActive('keygen')}
        onState=${(state: WindowState) => { setWindows(w => ({ ...w, keygen: state })); startButton.current?.focus(); }}>
        <${Discovery} data=${data} closed=${windows.keygen === 'closed' || !signedIn} onClose=${() => { setWindows(w => ({ ...w, keygen: 'closed' })); startButton.current?.focus(); }} />
      </${DesktopWindow}>
      <${DesktopWindow} ready=${signedIn} app="explorer" title=${explorerTitle} state=${windows.explorer} active=${active === 'explorer'} onFocus=${() => setActive('explorer')}
        onState=${(state: WindowState) => { setWindows(w => ({ ...w, explorer: state })); startButton.current?.focus(); }}>
        <${Explorer} data=${data} folder=${folderRequest.folder} request=${folderRequest.request} onOpen=${open} onClose=${() => { setWindows(w => ({ ...w, explorer: 'closed' })); startButton.current?.focus(); }} />
      </${DesktopWindow}>
      ${(['messenger','word','photos','pinball','encarta'] as AppId[]).map(app=>html`<${DesktopWindow} ready=${signedIn} app=${app} state=${windows[app]} active=${active===app} onFocus=${()=>setActive(app)} onState=${(state:WindowState)=>{setWindows(w=>({...w,[app]:state}));startButton.current?.focus();}}>
        ${app==='encarta'?html`<${Encarta} data=${data}/>`:app==='messenger'?html`<${Messenger}/>`:app==='word'?html`<${Word} data=${data}/>`:app==='photos'?html`<${PictureViewer} data=${data} active=${signedIn && active===app && windows[app]==='open'}/>`:html`<${Pinball} active=${signedIn && active===app && windows[app]==='open'}/>`}
      </${DesktopWindow}>`)}
      ${start && html`<div class="xp-start-menu" id="xp-start-menu" ref=${menu} role="dialog" aria-label="Start menu">
        <div class="xp-user"><span><img src="/assets/xp/computer.png" alt="" /></span>Alexander Forbes-Reed</div>
        <div class="xp-menu-body">
          <div class="xp-menu-programs"><button onClick=${() => open('zune')}><${AppIcon} app="zune" /><span><strong>Alex</strong><small>Music, photos and friends</small></span></button>
            <hr />${(['messenger','photos','word','keygen','pinball'] as AppId[]).map(app=>html`<button data-creativity-launch=${app==='keygen'||undefined} onClick=${()=>open(app)}><${AppIcon} app=${app}/><span>${appNames[app]}</span></button>`)}
            <div class="xp-menu-programs-bottom"><button aria-expanded=${programs} onClick=${()=>setPrograms(v=>!v)}><strong>All Programs</strong><span class="xp-program-arrow" aria-hidden="true">▶</span></button>
              ${programs&&html`<div class="xp-all-programs">${APP_IDS.map(app=>html`<button data-creativity-launch=${app==='keygen'||undefined} onClick=${()=>open(app)}><${AppIcon} app=${app}/>${appNames[app]}</button>`)}</div>`}
            </div>
          </div>
          <div class="xp-menu-places">
            <button onClick=${() => explore('documents')}><img src="/assets/xp/document.png" alt="" /><strong>My Documents</strong></button>
            <button onClick=${() => explore('pictures')}><img src="/assets/xp/pictures.png" alt="" /><strong>My Pictures</strong></button>
            <button onClick=${() => explore('music')}><img src="/assets/xp/music.png" alt="" /><strong>My Music</strong></button>
            <button onClick=${() => explore('projects')}><img src="/assets/xp/folder.png" alt="" /><strong>My Projects</strong></button>
            <button onClick=${()=>explore('home')}><img src="/assets/xp/folder.png" alt=""/><strong>My Computer</strong></button><hr /><button onClick=${() => open('messenger')}><img src="/assets/xp/alex-messenger.svg" alt="" /><span>About Alexander Forbes-Reed</span></button>
          </div>
        </div><div class="xp-menu-footer"><button onClick=${() => { setStart(false); setSignedIn(false); document.querySelector<HTMLAudioElement>('#keygen-music')?.pause(); }}><span class="xp-logoff-icon" aria-hidden="true">➜</span>Log Off</button><button onClick=${turnOff}><span class="xp-power-icon" aria-hidden="true">⏻</span>Turn Off Computer</button></div>
      </div>`}
      <footer class="xp-taskbar" aria-label="Taskbar">
        <button class=${`xp-start${start ? ' is-pressed' : ''}`} ref=${startButton} aria-expanded=${start} aria-controls="xp-start-menu" onClick=${() => setStart(v => !v)}><${GrooveMark}/>start</button>
        <button class="xp-show-desktop" aria-label="Show desktop" title="Show desktop" onClick=${() => setWindows(w => Object.fromEntries(APP_IDS.map(app=>[app,w[app]==='closed'?'closed':'minimized'])) as Record<AppId,WindowState>)}><img src="/assets/xp/show-desktop.svg" alt="" /></button>
        <div class="xp-tasks">${APP_IDS.filter(app => windows[app] !== 'closed').map(app => html`
          <button data-creativity-launch=${app === 'keygen' && !(active === app && windows[app] === 'open') || undefined} class=${active === app && windows[app] === 'open' ? 'is-selected' : ''} aria-label=${`Switch to ${app === 'explorer' ? explorerTitle : appNames[app]}`} aria-pressed=${active === app && windows[app] === 'open'}
            onClick=${() => { if (active === app && windows[app] === 'open') setWindows(w => ({ ...w, [app]: 'minimized' })); else open(app); }}>
            <${AppIcon} app=${app} /><span>${app === 'explorer' ? explorerTitle : appNames[app]}</span>
          </button>`)}</div>
        <div class="xp-tray"><img src="/assets/xp/computer.png" alt="" /><time>${clock || '––:––'}</time></div>
      </footer>
    </div></div>`;
}
