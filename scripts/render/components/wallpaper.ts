import {html} from 'htm/preact';
import {useEffect,useRef,useState} from 'preact/hooks';
import type {SiteData} from '../../lib/types.js';

export const CLASSIC_WALLPAPERS=['Bliss','Ascent','Autumn','Azul','Crystal','Follow','Friend','Home','Moon flower','Peace','Power','Purple flower','Radiance','Red moon desert','Ripple','Stonehenge','Tulips','Vortec space','Wind','Windows XP'].map(name=>({name,src:name==='Bliss'?'/assets/xp/bliss.jpg':`/assets/xp/wallpapers/${name.toLowerCase().replaceAll(' ','-')}.jpg`}));
export const WALLPAPER_POSITIONS=['Fill','Fit','Stretch','Center','Tile'] as const;
export type Wallpaper={src:string;position:typeof WALLPAPER_POSITIONS[number]};
export const DEFAULT_WALLPAPER:Wallpaper={src:'/assets/xp/bliss.jpg',position:'Fill'};
export const WALLPAPER_KEY='afr-desktop-wallpaper';
export function validWallpaper(value:unknown,data:SiteData):value is Wallpaper {
 if(!value||typeof value!=='object')return false;
 const item=value as Wallpaper;
 return WALLPAPER_POSITIONS.includes(item.position)&&(item.src===''||CLASSIC_WALLPAPERS.some(w=>w.src===item.src)||data.photos.some(p=>p.url===item.src));
}
export function wallpaperStyle(w:Wallpaper){return {backgroundImage:w.src?`url(${JSON.stringify(w.src)})`:'none',backgroundColor:'#3a6ea5',backgroundSize:w.position==='Fill'?'cover':w.position==='Fit'?'contain':w.position==='Stretch'?'100% 100%':'auto',backgroundPosition:'center',backgroundRepeat:w.position==='Tile'?'repeat':'no-repeat'};}

export function WallpaperPicker({data,value,onApply,onClose}:{data:SiteData;value:Wallpaper;onApply:(w:Wallpaper)=>void;onClose:()=>void}){
 const [draft,setDraft]=useState(value),[source,setSource]=useState(CLASSIC_WALLPAPERS.some(w=>w.src===value.src)||!value.src?'classic':'photos');
 const dialog=useRef<HTMLDialogElement>(null);
 const photos=data.photos.map((p,i)=>({src:p.url,name:p.title&&p.title!=='untitled'?p.title:`Photo ${i+1}${p.takenAt?` · ${p.takenAt.slice(0,10)}`:''}`}));
 const items=source==='classic'?[{name:'None (solid colour)',src:''},...CLASSIC_WALLPAPERS]:photos;
 const name=[...CLASSIC_WALLPAPERS,...photos].find(p=>p.src===draft.src)?.name??'Solid colour';
 const changed=draft.src!==value.src||draft.position!==value.position;
 useEffect(()=>{dialog.current?.showModal();},[]);
 return html`<dialog class="xp-display-properties" ref=${dialog} aria-labelledby="display-properties-title" onCancel=${onClose} onClose=${onClose}>
   <header class="xp-titlebar"><img class="desktop-app-icon" src="/assets/xp/computer.png" alt=""/><span class="xp-window-title" id="display-properties-title">Display Properties</span><div class="xp-window-controls"><button class="xp-close" aria-label="Close Display Properties" onClick=${onClose}><span class="xp-close-glyph" aria-hidden="true"/></button></div></header>
   <div class="xp-display-body"><div class="xp-display-tab">Desktop</div><section class="xp-display-panel">
     <div class="xp-monitor"><div class="xp-monitor-screen" style=${wallpaperStyle(draft)} role="img" aria-label=${`Wallpaper preview: ${name}`}><span class="xp-monitor-taskbar"/></div><i aria-hidden="true"/></div>
     <p class="xp-wallpaper-name">${name}</p>
     <div class="xp-wallpaper-sources" role="group" aria-label="Wallpaper collection"><button aria-pressed=${source==='classic'} onClick=${()=>setSource('classic')}>Windows XP</button><button aria-pressed=${source==='photos'} onClick=${()=>setSource('photos')}>My Pictures (${photos.length})</button></div>
     <div class="xp-wallpaper-grid" aria-label="Backgrounds">${items.map(item=>html`<button title=${item.name} aria-label=${item.name} aria-pressed=${draft.src===item.src} onClick=${()=>setDraft(d=>({...d,src:item.src}))}>${item.src?html`<img src=${item.src} alt="" loading="lazy"/>`:html`<span class="xp-solid-colour"/>`}<span>${item.name}</span></button>`)}</div>
     <label class="xp-wallpaper-position">Position:<select value=${draft.position} onChange=${(e:Event)=>setDraft(d=>({...d,position:(e.target as HTMLSelectElement).value as Wallpaper['position']}))}>${WALLPAPER_POSITIONS.map(p=>html`<option value=${p}>${p}</option>`)}</select></label>
   </section><footer class="xp-display-actions"><button onClick=${()=>{onApply(draft);onClose();}}>OK</button><button onClick=${onClose}>Cancel</button><button disabled=${!changed} onClick=${()=>onApply(draft)}>Apply</button></footer></div>
 </dialog>`;
}
