import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import type { SiteData } from '../../lib/types.js';
import {profile} from '../../lib/profile.js';
import {RetroIcon} from './retro-icon.js';
import { ArticleBody } from './article.js';

export function Messenger(): VNode {
  const [topic,setTopic]=useState('about');
  const topics=[{id:'about',label:'About me',text:profile.bio,links:profile.socials},{id:'work',label:'At work',...profile.sections[0]},{id:'after',label:'Off-hours',...profile.sections[1]},{id:'stack',label:'My toolkit',text:profile.stack,links:[]}];
  const selected=topics.find(t=>t.id===topic)!;
  const open=(app:string)=>window.dispatchEvent(new CustomEvent('open-site-app',{detail:app}));
  return html`<div class="messenger-app">
    <nav class="msm-menubar" aria-label="Profile menu"><details><summary>File</summary><div>${profile.socials.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`)}</div></details><button onClick=${()=>setTopic('about')}>Contacts</button><button onClick=${()=>open('encarta')}>Actions</button><button onClick=${()=>setTopic('stack')}>Tools</button><details><summary>Help</summary><div>Choose a topic in the contact list to explore the profile.</div></details></nav>
    <header class="msm-header">
      <div class="msm-identity"><div class="msm-display-picture"><img src="/assets/xp/messenger-person.svg" alt=""/></div><div><h2>${profile.name}</h2><p class="msm-presence"><i aria-hidden="true"/> Personal profile</p><p class="msm-personal-message">${profile.role} @ ${profile.company.name} · ${profile.location}</p></div></div>
    </header>
    <div class="msm-toolbar">${[['folder','Projects','encarta'],['music','Music','zune'],['pictures','Pictures','photos']].map(([icon,label,app])=>html`<button onClick=${()=>open(app)}><img src=${`/assets/xp/${icon}.png`} alt=""/>${label}</button>`)}</div>
    <div class="msm-workspace"><aside class="msm-contacts" aria-label="Profile topics"><h3>▼ My world (4)</h3>${topics.map(t=>html`<button aria-pressed=${topic===t.id} onClick=${()=>setTopic(t.id)}><img src="/assets/xp/messenger-person.svg" alt=""/><span>${t.label}<small>${t.id==='work'?profile.company.name:t.id==='about'?profile.location:t.id==='after'?'Side projects':'Languages & tools'}</small></span></button>`)}<h3>▼ Find me (3)</h3>${profile.socials.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer"><img src="/assets/xp/messenger-person.svg" alt=""/><span>${l.label}<small>Open profile ↗</small></span></a>`)}</aside>
      <section class="msm-conversation" aria-label="Selected profile topic"><div class="msm-recipient">To: <strong>You</strong><span>${selected.label}</span></div><div class="msm-notice"><span aria-hidden="true">ⓘ</span> Profile · ${profile.location}</div>
        <div class="msm-transcript" aria-live="polite"><h3>${selected.label}</h3><p>${selected.text}</p>${topic==='about'&&html`<p>${profile.role} at <a href=${profile.company.url} target="_blank" rel="noopener noreferrer">${profile.company.name}</a>.</p>`}<div class="msm-topic-links">${selected.links.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`)}</div></div>

      </section></div><div class="retro-status">${selected.label} · ${profile.location}</div>
  </div>`;
}

export function Word({data}: {data:SiteData}): VNode {
  const [index,setIndex]=useState(0),[size,setSize]=useState(16),[navigation,setNavigation]=useState(true);
  useEffect(()=>{
    const open=(event:Event)=>{
      const item=(event as CustomEvent<{app?:string;index?:unknown}>).detail;
      if(item?.app==='word' && typeof item.index==='number' && Number.isInteger(item.index) && item.index>=0 && item.index<data.words.length) setIndex(item.index);
    };
    window.addEventListener('open-site-item',open);
    return()=>window.removeEventListener('open-site-item',open);
  },[data.words.length]);
  const word=data.words[index];
  return html`<div class="word-app">
    <div class="word-menubar"><details><summary>File</summary><div>${word&&html`<a href=${word.url} target="_blank" rel="noopener noreferrer">Open original article ↗</a>`}<button onClick=${()=>window.print()}>Print…</button></div></details><button disabled>Edit</button><details><summary>View</summary><div><button aria-pressed=${navigation} onClick=${()=>setNavigation(v=>!v)}>Document Map</button></div></details>${['Insert','Format','Tools','Table','Window'].map(label=>html`<button disabled>${label}</button>`)}<details><summary>Help</summary><div>Read-only articles. Choose a document to read the locally saved text.</div></details><span class="word-brand">Microsoft Office Word 2003</span></div>
    <div class="word-standard-toolbar"><span class="word-tool-icon" aria-hidden="true">W</span><label>Document <select value=${index} onChange=${(e:Event)=>setIndex(Number((e.target as HTMLSelectElement).value))}>${data.words.map((w,i)=>html`<option value=${i}>${w.title}</option>`)}</select></label>${word&&html`<a href=${word.url} target="_blank" rel="noopener noreferrer">Open original ↗</a>`}</div>
    <div class="retro-toolbar word-format-toolbar"><span>Normal</span><span>Georgia</span><label>Reading size <select value=${size} onChange=${(e:Event)=>setSize(Number((e.target as HTMLSelectElement).value))}>${[14,16,20,24].map(n=>html`<option value=${n}>${n}</option>`)}</select></label><span class="word-format-icons" aria-label="Formatting unavailable in read-only documents"><button disabled aria-label="Bold"><b>B</b></button><button disabled aria-label="Italic"><i>I</i></button><button disabled aria-label="Underline"><u>U</u></button><button disabled aria-label="Align left">☰</button></span><span class="word-readonly">Read Only</span></div>
    <div class="word-ruler" aria-hidden="true">1 · · · · 2 · · · · 3 · · · · 4 · · · · 5 · · · · 6 · · · · 7</div>
    <div class="word-layout">${navigation&&html`<aside class="word-document-map" aria-label="Document map"><h2>Document Map</h2>${data.words.map((w,i)=>html`<button aria-pressed=${index===i} onClick=${()=>setIndex(i)}>${w.title}</button>`)}</aside>`}
    <div class="word-workspace"><article class="word-paper" style=${{fontSize:size}}><p class="word-byline">${word?.article?.byline??word?.source??''}${word?.article?.publishedAt&&` · ${word.article.publishedAt}`}</p><h1>${word?.article?.publishedTitle??word?.title??'No documents yet'}</h1><p>${word?.source??''}</p><hr/>${word&&html`<${ArticleBody} word=${word}/>`}</article></div></div>
    <div class="retro-status">${word?`Document ${index+1} of ${data.words.length}`:'No documents'} · Read Only · ${size} pt</div>
  </div>`;
}

export function PictureViewer({data,active=true}: {data:SiteData;active?:boolean}): VNode {
  const [index,setIndex]=useState(0), [zoom,setZoom]=useState(false), [angle,setAngle]=useState(0), [slideshow,setSlideshow]=useState(false);
  const count=data.photos.length, photo=data.photos[index];
  useEffect(()=>{
    const open=(event:Event)=>{
      const item=(event as CustomEvent<{app?:string;index?:unknown}>).detail;
      if(item?.app==='photos' && typeof item.index==='number' && Number.isInteger(item.index) && item.index>=0 && item.index<count){setIndex(item.index);setZoom(false);setAngle(0);}
    };
    window.addEventListener('open-site-item',open);
    return()=>window.removeEventListener('open-site-item',open);
  },[count]);
  const step=(n:number)=>{setIndex(i=>(i+n+count)%count);setZoom(false);setAngle(0);};
  useEffect(()=>{if(!active||!slideshow||count<2)return;const id=window.setInterval(()=>{setIndex(i=>(i+1)%count);setAngle(0);setZoom(false);},4000);return()=>clearInterval(id);},[slideshow,active,count]);
  useLayoutEffect(()=>{
    if(!active||count<2)return;
    const navigate=(e:KeyboardEvent)=>{
      if(e.altKey||e.ctrlKey||e.metaKey||(e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);}
    };
    window.addEventListener('keydown',navigate);return()=>window.removeEventListener('keydown',navigate);
  },[active,count]);
  if(!photo)return html`<p class="retro-empty">No photographs yet.</p>`;
  return html`<div class="picture-viewer">
    <div class=${`picture-stage${zoom?' is-zoomed':''}`} tabIndex="0" aria-label="Photograph. Use left and right arrow keys to browse."><img src=${photo.url} alt=${photo.alt} style=${{transform:`rotate(${angle}deg)`}} /></div>
    <div class="picture-caption"><strong>${photo.title||'Untitled'}</strong><span>${photo.loc}</span></div>
    <div class="picture-toolbar">
      <button title="Previous photo (←)" aria-label="Previous photo" onClick=${()=>step(-1)}><${RetroIcon} name="back"/></button><button title="Next photo (→)" aria-label="Next photo" onClick=${()=>step(1)}><${RetroIcon} name="forward"/></button><span/>
      <button title="Fit to window" aria-label="Fit to window" onClick=${()=>setZoom(false)}><${RetroIcon} name="fit"/></button><button title="Actual size" aria-label="Actual size" aria-pressed=${zoom} onClick=${()=>setZoom(v=>!v)}><${RetroIcon} name="search"/></button><span/>
      <button title="Slideshow" aria-label=${slideshow?'Pause slideshow':'Start slideshow'} aria-pressed=${slideshow} onClick=${()=>setSlideshow(v=>!v)}><${RetroIcon} name=${slideshow?'pause':'play'}/></button><span/>
      <button title="Rotate left" aria-label="Rotate left" onClick=${()=>setAngle(a=>(a+270)%360)}><span class="picture-reverse"><${RetroIcon} name="rotate"/></span></button><button title="Rotate right" aria-label="Rotate right" onClick=${()=>setAngle(a=>(a+90)%360)}><${RetroIcon} name="rotate"/></button><span/>
      <a title="Open original" aria-label="Open original" href=${photo.url} target="_blank" rel="noopener noreferrer"><${RetroIcon} name="save"/></a>
    </div>
    <div class="retro-status">${index+1} / ${count} · ${photo.takenAt?photo.takenAt.slice(0,10):'From my collection'}</div>
  </div>`;
}
