// The phone is a Windows Phone 8-style Metro shell. Motion follows the platform:
// pages turnstile in and out around the screen's left edge, Start tiles leave
// one after another with the tapped tile last, pressed surfaces tilt towards the
// finger, live tiles flip to show real content and lists feather in.
import {html} from 'htm/preact';
import type {ComponentChildren,VNode} from 'preact';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {usePivot} from '../../state.js';
import {APP_IDS,routeApp,type AppId} from '../../lib/apps.js';
import {PhoneBackContext,PhoneDataContext,feather} from './phone-apps.js';
import type {Pivot} from '../../state.js';
import {profile} from '../../lib/profile.js';
import type {SiteData} from '../../lib/types.js';
export type PhoneApp=Exclude<AppId,'encarta'>;
const PHONE_APP_IDS=APP_IDS.filter((app):app is PhoneApp=>app!=='encarta');
const phoneRoute=(pivot:Pivot):PhoneApp=>pivot==='projects'?'explorer':routeApp(pivot) as PhoneApp;
const backgroundUrl=(url:string)=>`url(${JSON.stringify(/^(?:https?:|data:|\/)/.test(url)?url:`/${url}`)})`;
type Screen=PhoneApp|'start'|'apps';
// Keep the phone unlocked when its shell remounts during a viewport change.
let phoneUnlocked=false;
const names:Record<PhoneApp,string>={zune:'music + videos',keygen:'digital creativity',explorer:'projects',messenger:'people',word:'office',photos:'photos',pinball:'canal cadet'};
const glyphs:Record<PhoneApp,string>={zune:'♫',keygen:'✳',explorer:'{ }',messenger:'☺',word:'W',photos:'▣',pinball:'●'};
// Routed apps change the URL; the rest are history entries on the current URL.
const routes:Partial<Record<PhoneApp,Pivot>>={zune:'music',word:'words',photos:'photography',explorer:'projects'};
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE_OUT='cubic-bezier(.1,.9,.2,1)',EASE_IN='cubic-bezier(.7,0,1,.5)';

// Turnstile: rotate around the screen's left edge, as WP8 pages do.
function turnstile(elements:Element[],direction:'in'|'out',backward:boolean,stagger=22,last?:Element|null):Promise<void> {
  if(reducedMotion()||!elements.length)return Promise.resolve();
  const angle=direction==='out'?(backward?-80:80):(backward?80:-80);
  const runs=elements.map((el,i)=>{
    const rect=el.getBoundingClientRect(),origin=`${-rect.left}px 50%`;
    const order=el===last?elements.length+2:i;
    const frames=direction==='out'
      ?[{transform:'perspective(1100px) rotateY(0deg)',opacity:1,transformOrigin:origin},{transform:`perspective(1100px) rotateY(${angle}deg)`,opacity:0,transformOrigin:origin}]
      :[{transform:`perspective(1100px) rotateY(${angle}deg)`,opacity:0,transformOrigin:origin},{transform:'perspective(1100px) rotateY(0deg)',opacity:1,transformOrigin:origin}];
    return el.animate(frames,{duration:direction==='out'?190:340,delay:order*stagger,easing:direction==='out'?EASE_IN:EASE_OUT,fill:direction==='out'?'forwards':'backwards'});
  });
  return Promise.all(runs.map(run=>run.finished.catch(()=>undefined))).then(()=>{if(direction==='out')requestAnimationFrame(()=>runs.forEach(run=>run.cancel()));});
}

// Pressed surfaces lean towards the finger.
function useTilt(root:{current:HTMLElement|null}):void {
  useEffect(()=>{
    const el=root.current;if(!el||reducedMotion())return;
    let target:HTMLElement|null=null;
    const release=()=>{if(target){target.style.transform='';target.classList.remove('is-tilted');target=null;}};
    const press=(e:PointerEvent)=>{
      if(!e.isPrimary||e.button>0)return;
      const hit=(e.target as HTMLElement).closest<HTMLElement>('.wp-tile,.metro-list>a,.metro-list>button,.wp-app-list>button,.metro-albums>a,.metro-history-tiles>a,.metro-photo-grid>button,[data-tilt]');
      if(!hit||!el.contains(hit))return;
      const r=hit.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      const edge=Math.max(Math.abs(x-.5),Math.abs(y-.5));
      target=hit;hit.classList.add('is-tilted');
      hit.style.transform=`perspective(${Math.max(500,r.width*3)}px) rotateX(${((.5-y)*14).toFixed(2)}deg) rotateY(${((x-.5)*14).toFixed(2)}deg) scale(${(.985-(.5-edge)*.05).toFixed(3)})`;
    };
    el.addEventListener('pointerdown',press);
    window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);el.addEventListener('pointerleave',release);
    el.addEventListener('scroll',release,true);
    return()=>{el.removeEventListener('pointerdown',press);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);el.removeEventListener('pointerleave',release);el.removeEventListener('scroll',release,true);};
  },[]);
}

// A live tile flips (or slides, for photos) between faces of real content.
function LiveTile({className,label,faces,onClick,href,period=7000,motion='flip',count,launch}:{className:string;label:string;faces:ComponentChildren[];onClick?:(e:Event)=>void;href?:string;period?:number;motion?:'flip'|'slide';count?:number|string;launch?:boolean}):VNode {
  const [face,setFace]=useState(0);
  const inner=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    if(faces.length<2||reducedMotion())return;
    let timer:ReturnType<typeof setTimeout>,alive=true;
    const next=()=>{timer=setTimeout(async()=>{
      const el=inner.current;
      if(alive&&el&&!document.hidden&&el.getClientRects().length){
        if(motion==='flip')await el.animate([{transform:'perspective(700px) rotateX(0)'},{transform:'perspective(700px) rotateX(-90deg)'}],{duration:200,easing:EASE_IN}).finished.catch(()=>undefined);
        if(!alive)return;
        setFace(f=>(f+1)%faces.length);
        requestAnimationFrame(()=>motion==='flip'
          ?el.animate([{transform:'perspective(700px) rotateX(90deg)'},{transform:'perspective(700px) rotateX(0)'}],{duration:360,easing:EASE_OUT})
          :el.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:520,easing:EASE_OUT}));
      }
      if(alive)next();
    },period+Math.random()*3000);};
    next();
    return()=>{alive=false;clearTimeout(timer);};
  },[faces.length,period,motion]);
  const body=html`<span class="wp-tile-inner" ref=${inner}>${faces[face%faces.length]}</span><strong>${label}</strong>${count!==undefined&&html`<span class="wp-tile-count">${count}</span>`}`;
  if(href)return html`<a class=${`wp-tile ${className}`} href=${href} target="_blank" rel="noopener noreferrer" aria-label=${label}>${body}</a>`;
  return html`<button class=${`wp-tile ${className}`} data-creativity-launch=${launch||undefined} onClick=${onClick}>${body}</button>`;
}

const SignalIcon=()=>html`<svg class="wp-status-icon" viewBox="0 0 20 14" aria-hidden="true"><rect x="0" y="10" width="3" height="4"/><rect x="4.25" y="7.5" width="3" height="6.5"/><rect x="8.5" y="5" width="3" height="9"/><rect x="12.75" y="2.5" width="3" height="11.5"/><rect x="17" y="0" width="3" height="14" opacity=".35"/></svg>`;
const BatteryIcon=()=>html`<svg class="wp-status-icon wp-battery" viewBox="0 0 26 13" aria-hidden="true"><rect x=".75" y=".75" width="21.5" height="11.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="3" width="13" height="7"/><rect x="23" y="4" width="2.5" height="5"/></svg>`;

export function PhoneShell({data,renderApp}:{data:SiteData;renderApp:(app:PhoneApp,active:boolean)=>ComponentChildren}):VNode {
  const {pivot,setPivot,navigationKey,back:routeBack,canGoBack}=usePivot();
  // The lock screen greets visitors on the home page only; deep links open straight away.
  const [locked,setLocked]=useState(!phoneUnlocked&&pivot==='quickplay');
  const suppressLockClick=useRef(false);
  const [unlocking,setUnlocking]=useState(false),[lockDrag,setLockDrag]=useState(0);
  const unlockTimer=useRef<ReturnType<typeof setTimeout>>();
  useEffect(()=>()=>clearTimeout(unlockTimer.current),[]);
  const lockButton=useRef<HTMLButtonElement>(null),swipe=useRef<{x:number;y:number;pointerId:number}|null>(null);
  const unlock=()=>{
    if(unlocking||!locked)return;
    const finish=()=>{phoneUnlocked=true;setLocked(false);setUnlocking(false);setLockDrag(0);};
    if(reducedMotion()){finish();return;}
    setUnlocking(true);unlockTimer.current=setTimeout(finish,420);
  };
  const [screen,setScreen]=useState<Screen>(pivot==='quickplay'?'start':phoneRoute(pivot));
  const [visited,setVisited]=useState<Set<Screen>>(()=>new Set());
  useEffect(()=>{if(!locked)setVisited(old=>old.has(screen)?old:new Set([...old,screen]));},[screen,locked]);
  const [query,setQuery]=useState(''),[clock,setClock]=useState('--:--'),[date,setDate]=useState(new Date());
  const first=useRef(true),header=useRef<HTMLHeadingElement>(null),search=useRef<HTMLInputElement>(null);
  const motionRoot=useRef<HTMLDivElement>(null),previousIndex=useRef(0),leaving=useRef(false);
  useTilt(motionRoot);

  const pushScreen=(next:Screen)=>{
    const index=(Number.isInteger(history.state?.afrIndex)?history.state.afrIndex:0)+1;
    history.pushState({afrIndex:index,afrPhone:next},'');
    window.dispatchEvent(new PopStateEvent('popstate'));
    setQuery('');
  };
  // Play the current page's exit, then navigate; the next page plays its entrance.
  const leave=async(action:()=>void,backward:boolean,tapped?:Element|null)=>{
    if(leaving.current)return;
    const root=motionRoot.current;
    if(root&&!reducedMotion()){
      leaving.current=true;
      const title=root.querySelector('.wp-header');
      const parts=screen==='start'
        ?[title,...visibleIn(root,'.wp-tile'),root.querySelector('.wp-all-apps')]
        :screen==='apps'?[title,...visibleIn(root,'.wp-app-list>*')]
        :[title,root.querySelector('.wp-app-frame:not([hidden])')];
      await turnstile(parts.filter(Boolean) as Element[],'out',backward,screen==='start'||screen==='apps'?18:40,tapped);
      leaving.current=false;
    }
    action();
  };
  const open=(next:Screen,tapped?:Element|null)=>{if(next!==screen)void leave(()=>pushScreen(next),next==='start',tapped);};
  const launch=(app:PhoneApp,tapped?:Element|null)=>{
    const target=routes[app];
    void leave(()=>{if(target)setPivot(target);else pushScreen(app);},false,tapped);
  };
  const detailBack=useRef<(()=>void)|null>(null);
  const registerBack=useCallback((handler:(()=>void)|null)=>{detailBack.current=handler;},[]);
  const back=()=>{
    if(detailBack.current){detailBack.current();return;}
    if(canGoBack)void leave(routeBack,true);else if(screen!=='start')open('start');
  };
  useEffect(()=>{
    if(first.current){first.current=false;history.replaceState({...history.state,afrPhone:screen},'');return;}
    const saved=history.state?.afrPhone;
    setScreen(saved==='start'||saved==='apps'||PHONE_APP_IDS.includes(saved)?saved:phoneRoute(pivot));
  },[pivot,navigationKey]);
  useEffect(()=>{const handle=(e:Event)=>{const app=(e as CustomEvent).detail;if(PHONE_APP_IDS.includes(app))launch(app);};window.addEventListener('open-site-app',handle);return()=>window.removeEventListener('open-site-app',handle);},[screen,setPivot]);
  useEffect(()=>{const tick=()=>{const now=new Date();setDate(now);setClock(now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}));};tick();const timer=setInterval(tick,30000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{if(locked){lockButton.current?.focus({preventScroll:true});return;}if(screen==='pinball')document.querySelector<HTMLElement>('.wp-app-pinball')?.focus({preventScroll:true});else header.current?.focus({preventScroll:true});document.querySelector('.wp-scroll')?.scrollTo(0,0);},[screen,locked]);

  // Entrances: the header and page turnstile in, then tiles or list rows feather in.
  useLayoutEffect(()=>{
    if(locked)return;
    const index=history.state?.afrIndex??0,backward=index<previousIndex.current;previousIndex.current=index;
    const root=motionRoot.current;if(!root)return;
    root.style.setProperty('--pano-x','0px');
    if(reducedMotion())return;
    const title=root.querySelector('.wp-header');
    if(screen==='start'){void turnstile([title,...visibleIn(root,'.wp-tile'),root.querySelector('.wp-all-apps')].filter(Boolean) as Element[],'in',backward,26);return;}
    if(screen==='apps'){void turnstile([title,...visibleIn(root,'.wp-app-list>*')].filter(Boolean) as Element[],'in',backward,20);return;}
    const frame=root.querySelector('.wp-app-frame:not([hidden])');
    void turnstile([title,frame].filter(Boolean) as Element[],'in',backward,60);
    if(frame)requestAnimationFrame(()=>feather(frame));
  },[screen,locked]);

  const apps=PHONE_APP_IDS.filter(app=>`${names[app]} ${app==='keygen'?'keygen':''}`.includes(query.toLowerCase()));
  const photo=data.photos[0];
  const albums=data.recentlyPlayed.filter((t,i,all)=>t.coverUrl&&all.findIndex(o=>o.coverUrl===t.coverUrl)===i).slice(0,4);
  const tile=(e:Event)=>e.currentTarget as Element;
  return html`<${PhoneDataContext.Provider} value=${data}><${PhoneBackContext.Provider} value=${registerBack}><div ref=${motionRoot} class=${`wp-shell wp-screen-${screen}${locked?' is-locked':''}${unlocking?' is-unlocking':''}`} style=${{'--wp-wallpaper':photo?backgroundUrl(photo.url):'none'}}>
    ${locked&&html`<button ref=${lockButton} class="wp-lock" data-dragging=${!!swipe.current} style=${{'--lock-offset':`${-lockDrag}px`,transform:lockDrag&&!unlocking?`translateY(${-lockDrag}px)`:undefined}} aria-label="Unlock phone" onClick=${()=>{if(!suppressLockClick.current)unlock();suppressLockClick.current=false;}}
      onPointerDown=${(e:PointerEvent)=>{if(!e.isPrimary||unlocking)return;suppressLockClick.current=false;swipe.current={x:e.clientX,y:e.clientY,pointerId:e.pointerId};e.currentTarget instanceof HTMLElement&&e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove=${(e:PointerEvent)=>{const start=swipe.current;if(start&&start.pointerId===e.pointerId&&!unlocking)setLockDrag(Math.max(0,start.y-e.clientY));}}
      onPointerUp=${(e:PointerEvent)=>{const start=swipe.current;if(start?.pointerId!==e.pointerId)return;swipe.current=null;suppressLockClick.current=!!start&&(Math.abs(e.clientY-start.y)>10||Math.abs(e.clientX-start.x)>10);if(start&&start.y-e.clientY>50&&Math.abs(e.clientX-start.x)<100)unlock();else setLockDrag(0);}}
      onPointerCancel=${()=>{swipe.current=null;setLockDrag(0);}}
      onKeyDown=${(e:KeyboardEvent)=>{if(e.key==='ArrowUp'){e.preventDefault();unlock();}}}>
      <span class="wp-lock-status" aria-hidden="true"><${SignalIcon}/><${BatteryIcon}/></span>
      <span class="wp-lock-date"><time class="wp-lock-time">${clock}</time><span>${date.toLocaleDateString('en-GB',{weekday:'long'})}</span><span>${date.toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</span><small>${profile.name}</small></span>
      <span class="wp-lock-hint">swipe up to unlock <span aria-hidden="true">↑</span></span>
    </button>`}
    <div class="wp-unlocked" inert=${locked}>
    <div class="wp-status"><${SignalIcon}/><span class="wp-status-network">forbesoft</span><${BatteryIcon}/><time>${clock}</time></div>
    <header class="wp-header"><p>${profile.name.toUpperCase()}</p><div><h1 ref=${header} tabIndex="-1">${screen==='start'?'start':screen==='apps'?'apps':screen==='word'?html`<svg class="wp-office-mark" aria-hidden="true" viewBox="0 0 50 60"><path d="M3 12 32 1 47 6 47 54 32 59 3 48 3 12ZM12 16V44L30 48V10L12 16Z" fill-rule="evenodd"/></svg>Office`:names[screen]}</h1></div></header>
    <main class=${`wp-scroll${screen!=='start'&&screen!=='apps'?' wp-app-view':''}`}>
      ${screen==='start'&&html`<div class="wp-tiles">
        <${LiveTile} className="wp-tile-m wp-people" label="people" onClick=${(e:Event)=>open('messenger',tile(e))} period=${8000} faces=${[
          html`<span class="wp-people-face"><b>${profile.initials}</b><small>${profile.role.toLowerCase()}</small></span>`,
          html`<span class="wp-tile-text"><small>${profile.company.name}</small>${profile.bio.split(',')[0]}…</span>`,
          html`<span class="wp-tile-text"><small>home</small>${profile.location}</span>`]}/>
        <${LiveTile} className="wp-tile-m wp-music" label="music + videos" onClick=${(e:Event)=>launch('zune',tile(e))} period=${6000} faces=${[
          html`<span class="wp-tile-glyph" aria-hidden="true">♫</span>`,
          ...albums.map(t=>html`<span class="wp-tile-art"><img src=${t.coverUrl} alt="" loading="lazy"/><span class="wp-tile-text"><small>recently played</small>${t.name}</span></span>`)]}/>
        <${LiveTile} className="wp-tile-w wp-photos" label="photos" motion="slide" period=${5000} count=${data.photos.length} onClick=${(e:Event)=>launch('photos',tile(e))} faces=${data.photos.slice(0,6).map(p=>html`<img class="wp-tile-photo" src=${p.url} alt="" loading="lazy"/>`)}/>
        <${LiveTile} className="wp-tile-m wp-words" label="office" onClick=${(e:Event)=>launch('word',tile(e))} period=${9000} faces=${[
          html`<svg class="wp-tile-mark" aria-hidden="true" viewBox="0 0 50 60"><path d="M3 12 32 1 47 6 47 54 32 59 3 48 3 12ZM12 16V44L30 48V10L12 16Z" fill-rule="evenodd"/></svg>`,
          ...data.words.slice(0,3).map(w=>html`<span class="wp-tile-text"><small>${w.source}</small>${w.title}</span>`)]}/>
        <${LiveTile} className="wp-tile-m wp-projects" label="projects" count=${data.projects.length} onClick=${(e:Event)=>launch('explorer',tile(e))} period=${7500} faces=${[
          html`<span class="wp-tile-glyph" aria-hidden="true">{ }</span>`,
          ...data.projects.slice(0,4).map(p=>html`<span class="wp-tile-text"><small>${p.tag}</small>${p.name}</span>`)]}/>
        <${LiveTile} className="wp-tile-w wp-game" label="canal cadet" onClick=${(e:Event)=>open('pinball',tile(e))} faces=${[html`<span class="wp-game-face"><span class="wp-pinball-art" aria-hidden="true">◉<i>╲ ╱</i></span><span><small>bikes · beats · bumpers</small>pinball</span></span>`]}/>
        <${LiveTile} className="wp-tile-m wp-creativity" label="digital creativity" launch onClick=${(e:Event)=>open('keygen',tile(e))} faces=${[html`<span class="wp-tile-glyph" aria-hidden="true">✳</span><small class="wp-keygen-label">KEYGEN.EXE</small>`]}/>
        ${profile.socials.map(s=>html`<${LiveTile} className="wp-tile-s wp-social" label=${s.label} href=${s.href} faces=${[html`<span class="wp-tile-glyph" aria-hidden="true">${s.icon}</span>`]}/>`)}
        <${LiveTile} className="wp-tile-s wp-social" label=${profile.company.name} href=${profile.company.url} faces=${[html`<span class="wp-tile-glyph" aria-hidden="true">lw</span>`]}/>
      </div><button class="wp-all-apps" onClick=${()=>open('apps')}>all apps <span>➜</span></button>`}
      ${screen==='apps'&&html`<div class="wp-app-list"><label><span class="wp-sr-only">Search apps</span><input ref=${search} type="search" placeholder="search apps" value=${query} onInput=${(e:Event)=>setQuery((e.target as HTMLInputElement).value)}/></label>${apps.map(app=>html`<button data-creativity-launch=${app==='keygen'||undefined} onClick=${(e:Event)=>launch(app,tile(e))}><span aria-hidden="true">${glyphs[app]}</span>${names[app]}</button>`)}${!apps.length&&html`<p>No apps match “${query}”.</p>`}</div>`}
      ${PHONE_APP_IDS.map(app=>html`<section key=${app} class=${`wp-app-frame wp-app-${app}`} hidden=${screen!==app} tabIndex="-1" aria-label=${names[app]}>${!locked&&(screen===app||visited.has(app))?renderApp(app,screen===app):null}</section>`)}
    </main>
    <nav class="wp-navigation" aria-label="Phone navigation"><button aria-label="Back" disabled=${screen==='start'&&!canGoBack} onClick=${back}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 5l-7 7 7 7"/></svg></button><button aria-label="Start" onClick=${()=>open('start')}><span class="wp-home-mark" aria-hidden="true"><i/><i/><i/><i/></span></button><button aria-label="Search apps" onClick=${()=>{open('apps');setTimeout(()=>search.current?.focus(),400);}}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5 20 20"/></svg></button></nav>
  </div></div></${PhoneBackContext.Provider}></${PhoneDataContext.Provider}>`;
}
function visibleIn(root:Element,selector:string):Element[] {
  const view=root.querySelector('.wp-scroll')?.getBoundingClientRect();
  return Array.from(root.querySelectorAll(selector)).filter(el=>{const r=el.getBoundingClientRect();return r.height>0&&(!view||(r.bottom>view.top&&r.top<view.bottom));});
}
