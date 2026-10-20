import {html} from 'htm/preact';
import type {ComponentChildren,VNode} from 'preact';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {usePivot} from '../../state.js';
import {APP_IDS,routeApp,type AppId} from '../../lib/apps.js';
import {PhoneBackContext,PhoneDataContext} from './phone-apps.js';
import type {Pivot} from '../../state.js';
import {profile} from '../../lib/profile.js';
import type {SiteData} from '../../lib/types.js';
export type PhoneApp=Exclude<AppId,'encarta'>;
const PHONE_APP_IDS=APP_IDS.filter((app):app is PhoneApp=>app!=='encarta');
const backgroundUrl=(url:string)=>`url(${JSON.stringify(/^(?:https?:|data:|\/)/.test(url)?url:`/${url}`)})`;
const phoneRoute=(pivot:Pivot):PhoneApp=>pivot==='projects'?'keygen':routeApp(pivot) as PhoneApp;
type Screen=PhoneApp|'start'|'apps';
// Keep the phone unlocked when its shell remounts during a viewport change.
let phoneUnlocked=false;
const names:Record<PhoneApp,string>={zune:'music + videos',keygen:'projects',explorer:'collection',messenger:'people',word:'office',photos:'photos',pinball:'canal cadet'};
const glyphs:Record<PhoneApp,string>={zune:'♫',keygen:'✳',explorer:'▰',messenger:'☺',word:'≡',photos:'▧',pinball:'●'};

export function PhoneShell({data,renderApp}:{data:SiteData;renderApp:(app:PhoneApp,active:boolean)=>ComponentChildren}):VNode {
  const [locked,setLocked]=useState(!phoneUnlocked);
  const suppressLockClick=useRef(false);
  const [unlocking,setUnlocking]=useState(false),[lockDrag,setLockDrag]=useState(0);
  const unlockTimer=useRef<ReturnType<typeof setTimeout>>();
  useEffect(()=>()=>clearTimeout(unlockTimer.current),[]);
  const lockButton=useRef<HTMLButtonElement>(null),swipe=useRef<{x:number;y:number;pointerId:number}|null>(null);
  const unlock=()=>{
    if(unlocking||!locked)return;
    const finish=()=>{phoneUnlocked=true;setLocked(false);setUnlocking(false);setLockDrag(0);};
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
    setUnlocking(true);unlockTimer.current=setTimeout(finish,420);
  };
  const {pivot,setPivot,navigationKey,back:routeBack,canGoBack}=usePivot();
  const [screen,setScreen]=useState<Screen>(pivot==='quickplay'?'start':phoneRoute(pivot));
  const [visited,setVisited]=useState<Set<Screen>>(()=>new Set());
  useEffect(()=>{if(!locked)setVisited(old=>old.has(screen)?old:new Set([...old,screen]));},[screen,locked]);
  const [query,setQuery]=useState(''),[clock,setClock]=useState('--:--'),[date,setDate]=useState(new Date());
  const first=useRef(true),header=useRef<HTMLHeadingElement>(null),search=useRef<HTMLInputElement>(null);
  const open=(next:Screen)=>{
    if(next===screen)return;
    const index=(Number.isInteger(history.state?.afrIndex)?history.state.afrIndex:0)+1;
    history.pushState({afrIndex:index,afrPhone:next},'');
    window.dispatchEvent(new PopStateEvent('popstate'));
    setQuery('');
  };
  const launch=(app:PhoneApp)=>{
    const route:Partial<Record<PhoneApp,Pivot>>={zune:'music',keygen:'projects',word:'words',photos:'photography'};
    const target=route[app];
    if(target)setPivot(target);else open(app);
  };
  const detailBack=useRef<(()=>void)|null>(null);
  const registerBack=useCallback((handler:(()=>void)|null)=>{detailBack.current=handler;},[]);
  const back=()=>{if(detailBack.current){detailBack.current();return;}if(canGoBack)routeBack();else open('start');};
  useEffect(()=>{
    if(first.current){first.current=false;history.replaceState({...history.state,afrPhone:screen},'');return;}
    const saved=history.state?.afrPhone;
    setScreen(saved==='start'||saved==='apps'||PHONE_APP_IDS.includes(saved)?saved:phoneRoute(pivot));
  },[pivot,navigationKey]);
  useEffect(()=>{const handle=(e:Event)=>{const app=(e as CustomEvent).detail;if(PHONE_APP_IDS.includes(app))launch(app);};window.addEventListener('open-site-app',handle);return()=>window.removeEventListener('open-site-app',handle);},[screen,setPivot]);
  useEffect(()=>{const tick=()=>{const now=new Date();setDate(now);setClock(now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}));};tick();const timer=setInterval(tick,30000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{if(locked){lockButton.current?.focus({preventScroll:true});return;}if(screen==='pinball')document.querySelector<HTMLElement>('.wp-app-pinball')?.focus({preventScroll:true});else header.current?.focus({preventScroll:true});document.querySelector('.wp-scroll')?.scrollTo(0,0);},[screen,locked]);
  const motionRoot=useRef<HTMLDivElement>(null),previousIndex=useRef(0);
  useLayoutEffect(()=>{
    if(locked)return;
    const index=history.state?.afrIndex??0,backward=index<previousIndex.current;previousIndex.current=index;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const root=motionRoot.current;if(!root)return;
    const animations:Animation[]=[];
    const main=root.querySelector('.wp-scroll'),title=root.querySelector('.wp-header');
    const timing={duration:320,easing:'cubic-bezier(.16,1,.3,1)'};
    if(main)animations.push(main.animate([{opacity:0,transform:`translateX(${backward?-42:55}px)`},{opacity:1,transform:'translateX(0)'}],timing));
    if(title)animations.push(title.animate([{opacity:0,transform:`translateX(${backward?-28:80}px)`},{opacity:1,transform:'translateX(0)'}],{...timing,duration:380}));
    if(screen==='start')root.querySelectorAll('.wp-tile').forEach((tile,i)=>animations.push(tile.animate([{opacity:0,transform:'perspective(600px) rotateY(-24deg) translateY(16px)',transformOrigin:'left center'},{opacity:1,transform:'perspective(600px) rotateY(0) translateY(0)',transformOrigin:'left center'}],{duration:360,delay:Math.min(i*28,168),fill:'backwards',easing:timing.easing})));
    return()=>animations.forEach(animation=>animation.cancel());
  },[screen,locked]);
  const apps=PHONE_APP_IDS.filter(app=>names[app].includes(query.toLowerCase()));
  const photo=data.photos[0];
  return html`<${PhoneDataContext.Provider} value=${data}><${PhoneBackContext.Provider} value=${registerBack}><div ref=${motionRoot} class=${`wp-shell wp-screen-${screen}${locked?' is-locked':''}${unlocking?' is-unlocking':''}`} style=${{'--wp-wallpaper':photo?backgroundUrl(photo.url):'none','--wp-music-art':backgroundUrl(data.topArtists.find(a=>a.image)?.image||data.albums.find(a=>a.coverUrl)?.coverUrl||photo?.url||'')}}>
    ${locked&&html`<button ref=${lockButton} class="wp-lock" data-dragging=${!!swipe.current} style=${{'--lock-offset':`${-lockDrag}px`,transform:lockDrag&&!unlocking?`translateY(${-lockDrag}px)`:undefined}} aria-label="Unlock phone" onClick=${()=>{if(!suppressLockClick.current)unlock();suppressLockClick.current=false;}}
      onPointerDown=${(e:PointerEvent)=>{if(!e.isPrimary||unlocking)return;suppressLockClick.current=false;swipe.current={x:e.clientX,y:e.clientY,pointerId:e.pointerId};e.currentTarget instanceof HTMLElement&&e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove=${(e:PointerEvent)=>{const start=swipe.current;if(start&&start.pointerId===e.pointerId&&!unlocking)setLockDrag(Math.max(0,start.y-e.clientY));}}
      onPointerUp=${(e:PointerEvent)=>{const start=swipe.current;if(start?.pointerId!==e.pointerId)return;swipe.current=null;suppressLockClick.current=!!start&&(Math.abs(e.clientY-start.y)>10||Math.abs(e.clientX-start.x)>10);if(start&&start.y-e.clientY>50&&Math.abs(e.clientX-start.x)<100)unlock();else setLockDrag(0);}}
      onPointerCancel=${()=>{swipe.current=null;setLockDrag(0);}}
      onKeyDown=${(e:KeyboardEvent)=>{if(e.key==='ArrowUp'){e.preventDefault();unlock();}}}>
      <span class="wp-lock-status" aria-hidden="true">▂▄▆█ <span>▰</span></span>
      <span class="wp-lock-date"><time class="wp-lock-time">${clock}</time><span>${date.toLocaleDateString('en-GB',{weekday:'long'})}</span><span>${date.toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</span><small>${profile.name}</small></span>
      <span class="wp-lock-hint">swipe up to unlock <span aria-hidden="true">↑</span></span>
    </button>`}
    <div class="wp-unlocked" inert=${locked}>
    <div class="wp-status"><span aria-hidden="true">▂▄▆█</span><span class="wp-status-network">forbesoft</span><span aria-hidden="true">▰</span><time>${clock}</time></div>
    <header class="wp-header"><p>${profile.name.toUpperCase()}</p><div><h1 ref=${header} tabIndex="-1">${screen==='start'?'start':screen==='apps'?'apps':screen==='word'?html`<svg class="wp-office-mark" aria-hidden="true" viewBox="0 0 50 60"><path d="M3 12 32 1 47 6 47 54 32 59 3 48 3 12ZM12 16V44L30 48V10L12 16Z" fill-rule="evenodd"/></svg>Office`:names[screen]}</h1>${screen==='start'&&html`<button aria-label="All apps" onClick=${()=>open('apps')}>➜</button>`}</div></header>
    <main class=${`wp-scroll${screen!=='start'&&screen!=='apps'?' wp-app-view':''}`}>
      ${screen==='start'&&html`<div class="wp-tiles">
        <button class="wp-tile wp-people" onClick=${()=>open('messenger')}><div class="wp-people-grid" aria-hidden="true"><span>${profile.initials}</span><span>☺</span><span>ams</span><span>♡</span></div><strong>people</strong></button>
        <button class="wp-tile wp-music" onClick=${()=>launch('zune')}><span class="wp-tile-glyph" aria-hidden="true">♫</span><strong>music + videos</strong></button>
        <button class="wp-tile wp-wide wp-photos" onClick=${()=>launch('photos')}>${photo&&html`<img src=${photo.url} alt=""/>`}<strong>photos</strong><span class="wp-tile-count">${data.photos.length}</span></button>
        <button class="wp-tile wp-projects" data-creativity-launch onClick=${()=>launch('keygen')}><span class="wp-tile-glyph" aria-hidden="true">{ }</span><strong>projects</strong><span class="wp-tile-count">${data.projects.length}</span></button>
        <button class="wp-tile wp-words" onClick=${()=>launch('word')}><span class="wp-tile-glyph" aria-hidden="true">≡</span><strong>office</strong></button>
        <button class="wp-tile wp-wide wp-game" onClick=${()=>open('pinball')}><span class="wp-pinball-art" aria-hidden="true">◉<i>╲ ╱</i></span><div><span class="wp-game-kicker">BIKES · BEATS · BUMPERS</span><strong>canal cadet</strong></div></button>
        <button class="wp-tile wp-wide wp-files" onClick=${()=>open('explorer')}><span class="wp-tile-glyph" aria-hidden="true">▰</span><strong>collection</strong></button>
      </div><button class="wp-all-apps" onClick=${()=>open('apps')}>all apps <span>➜</span></button><p class="wp-home-note">A little corner of Amsterdam.<br/>You’re welcome to look around.</p>`}
      ${screen==='apps'&&html`<div class="wp-app-list"><label><span class="wp-sr-only">Search apps</span><input ref=${search} type="search" placeholder="search apps" value=${query} onInput=${(e:Event)=>setQuery((e.target as HTMLInputElement).value)}/></label>${apps.map(app=>html`<button data-creativity-launch=${app==='keygen'||undefined} onClick=${()=>launch(app)}><span aria-hidden="true">${glyphs[app]}</span>${names[app]}</button>`)}${!apps.length&&html`<p>No apps match “${query}”.</p>`}</div>`}
      ${PHONE_APP_IDS.map(app=>html`<section key=${app} class=${`wp-app-frame wp-app-${app}`} hidden=${screen!==app} tabIndex="-1" aria-label=${names[app]}>${!locked&&(screen===app||visited.has(app))?renderApp(app,screen===app):null}</section>`)}
    </main>
    <nav class="wp-navigation" aria-label="Phone navigation"><button aria-label="Back" disabled=${screen==='start'&&!canGoBack} onClick=${back}>←</button><button aria-label="Start" onClick=${()=>open('start')}><span class="wp-home-mark" aria-hidden="true"><i/><i/><i/><i/></span></button><button aria-label="Search apps" onClick=${()=>{open('apps');requestAnimationFrame(()=>search.current?.focus());}}>⌕</button></nav>
  </div></div></${PhoneBackContext.Provider}></${PhoneDataContext.Provider}>`;
}
