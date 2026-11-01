// The phone is the AFR Pocket: an original handheld with a 4-shade LCD, a
// D-pad, A/B and SELECT/START. Screen content is ordinary HTML drawn in four
// greys; one SVG filter maps those greys (and every photo) onto the chosen
// LCD palette with a little dither, so links, text and screen readers keep
// working. Touch, keyboard and the hardware buttons all drive the same cursor,
// which is DOM focus on `[data-pk]` elements.
import {html} from 'htm/preact';
import type {ComponentChildren,VNode} from 'preact';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {usePivot} from '../../state.js';
import {APP_IDS,routeApp,type AppId} from '../../lib/apps.js';
import {PhoneBackContext,PhoneDataContext,PixelIcon,type PadDirection,type PixelIconName} from './phone-apps.js';
import type {Pivot} from '../../state.js';
import {profile} from '../../lib/profile.js';
import type {SiteData} from '../../lib/types.js';

export type PhoneApp=Exclude<AppId,'encarta'>;
const PHONE_APP_IDS=APP_IDS.filter((app):app is PhoneApp=>app!=='encarta');
const phoneRoute=(pivot:Pivot):PhoneApp=>pivot==='projects'?'explorer':routeApp(pivot) as PhoneApp;
type Screen=PhoneApp|'start';
type Button=PadDirection|'a'|'b'|'select'|'start';

const MENU:PhoneApp[]=['messenger','zune','photos','word','explorer','keygen','pinball'];
const names:Record<PhoneApp,string>={messenger:'profile',zune:'music',photos:'photos',word:'writing',explorer:'projects',keygen:'keygen',pinball:'canal cadet'};
const icons:Record<PhoneApp,PixelIconName>={messenger:'profile',zune:'music',photos:'photos',word:'writing',explorer:'projects',keygen:'keygen',pinball:'pinball'};
// Routed apps change the URL; the rest are history entries on the current URL.
const routes:Partial<Record<PhoneApp,Pivot>>={zune:'music',word:'words',photos:'photography',explorer:'projects'};

// Darkest → lightest. "colour" leaves photos untouched and only tints the ink.
const PALETTES={
  leaf:['#0f380f','#306230','#8bac0f','#9bbc0f'],
  slate:['#1e2124','#4c5a4a','#8f9c79','#c5cfa6'],
  amber:['#2a0f00','#7b3200','#d97a1f','#ffc764'],
  colour:['#1c1a2b','#4a4766','#a19fb8','#f3efe4'],
} as const;
type Palette=keyof typeof PALETTES;
const PALETTE_IDS=Object.keys(PALETTES) as Palette[];
const PALETTE_KEY='afr-pocket-palette',SOUND_KEY='afr-pocket-sound',BOOT_KEY='afr-pocket-booted';
// Keep the boot from replaying when the shell remounts during a viewport change.
let bootedThisVisit=false;

function LcdFilters():VNode {
  const channel=(palette:Palette,i:number)=>PALETTES[palette].map(hex=>(parseInt(hex.slice(1+i*2,3+i*2),16)/255).toFixed(3)).join(' ');
  return html`<svg class="pk-filters" width="0" height="0" aria-hidden="true" focusable="false"><defs>${PALETTE_IDS.map(p=>html`
    <filter id=${`pk-lcd-${p}`} x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="noise"/>
      <feComposite in="SourceGraphic" in2="noise" operator="arithmetic" k1="0" k2="1" k3=".16" k4="-.08" result="dithered"/>
      <feColorMatrix in="dithered" type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0"/>
      <feComponentTransfer><feFuncR type="discrete" tableValues=${channel(p,0)}/><feFuncG type="discrete" tableValues=${channel(p,1)}/><feFuncB type="discrete" tableValues=${channel(p,2)}/></feComponentTransfer>
    </filter>`)}</defs></svg>`;
}

// Tiny square-wave blips. Created lazily inside a press, so browsers allow it.
let audio:AudioContext|null=null;
function blip(notes:number[],length=.045):void {
  try{
    audio??=new AudioContext();
    if(audio.state==='suspended')void audio.resume();
    notes.forEach((frequency,i)=>{
      const at=audio!.currentTime+i*length,osc=audio!.createOscillator(),gain=audio!.createGain();
      osc.type='square';osc.frequency.value=frequency;
      gain.gain.setValueAtTime(.035,at);gain.gain.exponentialRampToValueAtTime(.0001,at+length*.95);
      osc.connect(gain).connect(audio!.destination);osc.start(at);osc.stop(at+length);
    });
  }catch{/* Sound is decoration only. */}
}

export function PhoneShell({data,renderApp}:{data:SiteData;renderApp:(app:PhoneApp,active:boolean)=>ComponentChildren}):VNode {
  const {pivot,setPivot,navigationKey,back:routeBack,canGoBack}=usePivot();
  const [screen,setScreen]=useState<Screen>(pivot==='quickplay'?'start':phoneRoute(pivot));
  const [visited,setVisited]=useState<Set<Screen>>(()=>new Set());
  const [booting,setBooting]=useState(!bootedThisVisit);
  const [palette,setPalette]=useState<Palette>('leaf');
  const [sound,setSound]=useState(true);
  const [toast,setToast]=useState('');
  const [pressed,setPressed]=useState<Button|null>(null);
  const [led,setLed]=useState(false);
  const [clock,setClock]=useState('--:--');
  const lcd=useRef<HTMLDivElement>(null),view=useRef<HTMLElement>(null);
  const first=useRef(true),previousIndex=useRef(0),toastTimer=useRef<ReturnType<typeof setTimeout>>(),ledTimer=useRef<ReturnType<typeof setTimeout>>();
  const soundRef=useRef(sound);soundRef.current=sound;

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(PALETTE_KEY);if(saved&&saved in PALETTES)setPalette(saved as Palette);
      if(localStorage.getItem(SOUND_KEY)==='off')setSound(false);
      if(sessionStorage.getItem(BOOT_KEY))finishBoot();
    }catch{/* Defaults work without storage. */}
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)finishBoot();
  },[]);
  const finishBoot=()=>{bootedThisVisit=true;setBooting(false);try{sessionStorage.setItem(BOOT_KEY,'1');}catch{/* Replays next visit. */}};
  useEffect(()=>{
    if(!booting)return;
    const chime=setTimeout(()=>{if(soundRef.current&&audio)blip([1046,1568],.12);},1500);
    const done=setTimeout(finishBoot,2300);
    return()=>{clearTimeout(chime);clearTimeout(done);};
  },[booting]);
  useEffect(()=>{if(!booting)setVisited(old=>old.has(screen)?old:new Set([...old,screen]));},[screen,booting]);
  useEffect(()=>{const tick=()=>setClock(new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}));tick();const timer=setInterval(tick,30000);return()=>clearInterval(timer);},[]);
  useEffect(()=>()=>{clearTimeout(toastTimer.current);clearTimeout(ledTimer.current);},[]);

  const say=(text:string)=>{setToast(text);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),1100);};
  const open=(next:Screen)=>{
    if(next===screen)return;
    const index=(Number.isInteger(history.state?.afrIndex)?history.state.afrIndex:0)+1;
    history.pushState({afrIndex:index,afrPhone:next},'');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const launch=(app:PhoneApp)=>{const target=routes[app];if(target)setPivot(target);else open(app);};
  const detailBack=useRef<(()=>void)|null>(null);
  const registerBack=useCallback((handler:(()=>void)|null)=>{detailBack.current=handler;},[]);
  const back=()=>{if(detailBack.current){detailBack.current();return;}if(canGoBack)routeBack();else if(screen!=='start')open('start');};
  useEffect(()=>{
    if(first.current){first.current=false;history.replaceState({...history.state,afrPhone:screen},'');return;}
    const saved=history.state?.afrPhone;
    setScreen(saved==='start'||PHONE_APP_IDS.includes(saved)?saved:phoneRoute(pivot));
  },[pivot,navigationKey]);
  useEffect(()=>{const handle=(e:Event)=>{const app=(e as CustomEvent).detail;if(PHONE_APP_IDS.includes(app))launch(app);};window.addEventListener('open-site-app',handle);return()=>window.removeEventListener('open-site-app',handle);},[screen,setPivot]);

  // Each screen slides in a few LCD frames at a time; back runs the other way.
  useLayoutEffect(()=>{
    if(booting)return;
    const index=history.state?.afrIndex??0,backward=index<previousIndex.current;previousIndex.current=index;
    view.current?.scrollTo(0,0);
    if(screen==='start')requestAnimationFrame(()=>view.current?.querySelector<HTMLElement>('.pk-home [data-pk]')?.focus({preventScroll:true}));
    if(screen==='pinball')requestAnimationFrame(()=>view.current?.querySelector<HTMLElement>('.pk-app-pinball')?.focus({preventScroll:true}));
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!view.current)return;
    const slide=view.current.animate([{clipPath:backward?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:220,easing:'steps(6,end)'});
    return()=>slide.cancel();
  },[screen,booting]);

  const items=()=>Array.from(view.current?.querySelectorAll<HTMLElement>('[data-pk]')??[]).filter(el=>el.getClientRects().length>0);
  // Spatial cursor movement: the nearest stop in the pressed direction.
  const pad=(direction:PadDirection)=>{
    if(!window.dispatchEvent(new CustomEvent('pocket-pad',{detail:direction,cancelable:true})))return;
    const stops=items(),current=document.activeElement as HTMLElement|null;
    if(!current||!stops.includes(current)){
      const top=view.current?.getBoundingClientRect().top??0;
      (stops.find(el=>el.getBoundingClientRect().bottom>top)??stops[0])?.focus({preventScroll:true});
      return;
    }
    const from=current.getBoundingClientRect(),cx=from.left+from.width/2,cy=from.top+from.height/2;
    let best:HTMLElement|null=null,score=Infinity;
    for(const el of stops){
      if(el===current)continue;
      const r=el.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;
      const along=direction==='up'?-dy:direction==='down'?dy:direction==='left'?-dx:dx,across=direction==='up'||direction==='down'?Math.abs(dx):Math.abs(dy);
      if(along<=4)continue;
      const s=along+across*3;
      if(s<score){score=s;best=el;}
    }
    if(best){best.focus({preventScroll:true});best.scrollIntoView({block:'nearest',inline:'nearest'});}
    else if(direction==='up'||direction==='down')view.current?.scrollBy({top:direction==='up'?-80:80});
  };
  const activate=()=>{
    const current=document.activeElement as HTMLElement|null;
    if(current&&view.current?.contains(current)&&current.matches('[data-pk],button,a,summary'))current.click();
    else items()[0]?.focus({preventScroll:true});
  };
  const cyclePalette=()=>{
    const next=PALETTE_IDS[(PALETTE_IDS.indexOf(palette)+1)%PALETTE_IDS.length];
    setPalette(next);say(`palette: ${next}`);
    try{localStorage.setItem(PALETTE_KEY,next);}catch{/* This visit only. */}
  };
  const toggleSound=()=>{
    const next=!sound;setSound(next);say(next?'sound on':'sound off');if(next)blip([880,1320]);
    try{localStorage.setItem(SOUND_KEY,next?'on':'off');}catch{/* This visit only. */}
  };
  const feedback=(button:Button)=>{
    setLed(true);clearTimeout(ledTimer.current);ledTimer.current=setTimeout(()=>setLed(false),90);
    if(soundRef.current)blip([button==='a'?988:button==='b'?660:button==='start'||button==='select'?523:784]);
    navigator.vibrate?.(8);
  };
  const press=(button:Button)=>{
    feedback(button);
    if(booting){finishBoot();return;}
    if(button==='a')activate();
    else if(button==='b')back();
    else if(button==='start'){if(screen!=='start')open('start');}
    else if(button==='select')cyclePalette();
    else pad(button);
  };

  // Canal Cadet reads the keyboard, so in the game the buttons become keys.
  const PINBALL_KEYS:Partial<Record<Button,string>>={left:'ArrowLeft',b:'z',right:'ArrowRight',a:'/',down:' ',select:'p',up:'Shift'};
  const pinballKey=(button:Button,down:boolean)=>{const key=PINBALL_KEYS[button];if(key)(document.activeElement??document.body).dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key,bubbles:true}));};

  // Hardware buttons never take focus; the cursor stays on the screen.
  const repeat=useRef<{wait?:ReturnType<typeof setTimeout>;tick?:ReturnType<typeof setInterval>}>({});
  const stopRepeat=()=>{clearTimeout(repeat.current.wait);clearInterval(repeat.current.tick);repeat.current={};};
  useEffect(()=>stopRepeat,[]);
  const hardware=(button:Button,label:string,className:string,children?:ComponentChildren)=>{
    const directional=button==='up'||button==='down'||button==='left'||button==='right';
    return html`<button type="button" tabIndex="-1" class=${`${className}${pressed===button?' is-pressed':''}`} aria-label=${label}
      onMouseDown=${(e:MouseEvent)=>e.preventDefault()}
      onPointerDown=${(e:PointerEvent)=>{
        e.preventDefault();setPressed(button);
        if(screen==='pinball'&&!booting){if(button==='start'){feedback(button);open('start');return;}feedback(button);pinballKey(button,true);return;}
        if(directional){press(button);stopRepeat();repeat.current.wait=setTimeout(()=>{repeat.current.tick=setInterval(()=>press(button),110);},380);}
      }}
      onPointerUp=${()=>{setPressed(null);stopRepeat();if(screen==='pinball')pinballKey(button,false);}}
      onPointerCancel=${()=>{setPressed(null);stopRepeat();if(screen==='pinball')pinballKey(button,false);}}
      onPointerLeave=${()=>{if(pressed===button){setPressed(null);stopRepeat();if(screen==='pinball')pinballKey(button,false);}}}
      onClick=${()=>{if(!directional&&screen!=='pinball')press(button);}}>${children}</button>`;
  };

  // Keyboard: arrows are the D-pad, Enter/X is A, Z/Escape/Backspace is B.
  useEffect(()=>{
    const keys=(e:KeyboardEvent)=>{
      if(e.altKey||e.ctrlKey||e.metaKey||e.defaultPrevented)return;
      if((e.target as HTMLElement)?.closest?.('input,textarea,select'))return;
      if(screen==='pinball'&&!booting){if(e.key==='Escape'&&!document.querySelector('.pk-app-pinball details[open]'))open('start');return;}
      const map:Record<string,Button>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',x:'a',X:'a',z:'b',Z:'b',Escape:'b',Backspace:'b',Home:'start'};
      let button=map[e.key];
      if(e.key==='Enter'){if(view.current?.contains(document.activeElement)&&document.activeElement?.matches('button,a,summary'))return;button='a';}
      if(!button)return;
      e.preventDefault();setPressed(button);setTimeout(()=>setPressed(p=>p===button?null:p),120);press(button);
    };
    window.addEventListener('keydown',keys);
    return()=>window.removeEventListener('keydown',keys);
  });

  const recent=data.recentlyPlayed[0];
  const meta:Record<PhoneApp,string>={messenger:'about',zune:recent?'♪':'',photos:String(data.photos.length),word:String(data.words.length),explorer:String(data.projects.length),keygen:'.exe',pinball:'game'};
  const title=screen==='start'?'afr pocket':names[screen];
  return html`<${PhoneDataContext.Provider} value=${data}><${PhoneBackContext.Provider} value=${registerBack}>
  <div class=${`pk-shell pk-screen-${screen}${booting?' is-booting':''}`} data-palette=${palette}>
    <${LcdFilters}/>
    <div class="pk-device">
      <button type="button" class=${`pk-sound${sound?' is-on':''}`} aria-pressed=${sound} aria-label=${sound?'Mute button sounds':'Unmute button sounds'} onClick=${toggleSound}><span aria-hidden="true">vol</span></button>
      <div class="pk-bezel">
        <div class="pk-bezel-label" aria-hidden="true"><i class=${`pk-led${led?' is-flash':''}`}/><span>4-shade lcd · stereo blips</span></div>
        <div class="pk-screen">
          <div class="pk-lcd" ref=${lcd}>
            ${booting?html`<div class="pk-boot" role="status" aria-label="Starting AFR Pocket">
              <div class="pk-boot-records" aria-hidden="true"><i/><i/><i/><i/></div>
              <strong>alex</strong><small>forbes-reed</small>
            </div>`:html`
            <header class="pk-top"><h1>${title}</h1><span class="pk-top-status" aria-hidden="true"><time>${clock}</time><i class="pk-battery"/></span></header>
            <main class=${`pk-view${screen!=='start'?' pk-view-app':''}`} ref=${view}>
              <section class="pk-home" hidden=${screen!=='start'} aria-label="Menu">
                ${recent&&html`<button class="pk-now" data-pk onClick=${()=>launch('zune')}>${recent.coverUrl?html`<img src=${recent.coverUrl} alt=""/>`:html`<span class="pk-thumb-empty"><${PixelIcon} name="music"/></span>`}<span><small>last spun</small><strong>${recent.name}</strong><small>${recent.artist}</small></span></button>`}
                <div class="pk-menu">${MENU.map(app=>html`<button class="pk-menu-item" data-pk data-creativity-launch=${app==='keygen'||undefined} onClick=${()=>launch(app)}><${PixelIcon} name=${icons[app]}/><span>${names[app]}</span><small>${meta[app]}</small></button>`)}</div>
                <p class="pk-hint">${profile.name.toLowerCase()} · amsterdam</p>
              </section>
              ${PHONE_APP_IDS.map(app=>html`<section key=${app} class=${`pk-app pk-app-${app}`} hidden=${screen!==app} tabIndex="-1" aria-label=${names[app]}>${screen===app||visited.has(app)?renderApp(app,screen===app):null}</section>`)}
            </main>
            ${screen==='pinball'&&html`<p class="pk-pinball-hint" aria-hidden="true">◀ B flip · A ▶ flip · ▼ launch · SELECT pause · START menu</p>`}`}
            ${toast&&html`<p class="pk-toast" role="status">${toast}</p>`}
          </div>
        </div>
      </div>
      <div class="pk-brand" aria-hidden="true"><b>AFR</b><i>pocket</i></div>
      <div class="pk-dpad">
        ${hardware('up','Up','pk-pad pk-pad-up')}${hardware('left','Left','pk-pad pk-pad-left')}<span class="pk-pad-hub" aria-hidden="true"/>${hardware('right','Right','pk-pad pk-pad-right')}${hardware('down','Down','pk-pad pk-pad-down')}
      </div>
      <div class="pk-ab">
        <div>${hardware('b','B (back)','pk-round pk-b')}<span aria-hidden="true">B</span></div>
        <div>${hardware('a','A (select)','pk-round pk-a')}<span aria-hidden="true">A</span></div>
      </div>
      <div class="pk-sys">
        <div>${hardware('select','Select (palette)','pk-pill')}<span aria-hidden="true">select</span></div>
        <div>${hardware('start','Start (menu)','pk-pill')}<span aria-hidden="true">start</span></div>
      </div>
      <div class="pk-speaker" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
    </div>
  </div></${PhoneBackContext.Provider}></${PhoneDataContext.Provider}>`;
}
