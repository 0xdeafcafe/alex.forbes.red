import {html} from 'htm/preact';
import type {VNode} from 'preact';
import {useState} from 'preact/hooks';
import type {SiteData} from '../../lib/types.js';
import {CollectionPage} from './collection.js';
import {AlbumTile} from '../components/tile.js';

export function MediaCollection({data}: {data:SiteData}): VNode {
  const [photoIndex,setPhotoIndex]=useState(0);
  const photo=data.photos[photoIndex];
  const openPhoto=()=>window.dispatchEvent(new CustomEvent('open-site-item',{detail:{app:'photos',index:photoIndex}}));
  const [kind,setKind]=useState<'music'|'pictures'|'profile'>('music');
  return html`<div class="media-collection"><nav class="collection-pivots" aria-label="Collection type"><button aria-pressed=${kind==='music'} onClick=${()=>setKind('music')}>music</button><button aria-pressed=${kind==='pictures'} onClick=${()=>setKind('pictures')}>pictures</button><button aria-pressed=${kind==='profile'} onClick=${()=>setKind('profile')}>profile</button></nav>
    <div class="collection-count">${kind==='music'?`${data.albums.length} albums`:kind==='pictures'?`${data.photos.length} photographs`:'Alexander Forbes-Reed'}</div>
    ${kind==='profile'?html`<${CollectionPage}/>`:kind==='music'?html`<div class="collection-albums">${data.albums.map(a=>html`<${AlbumTile} album=${a}/>` )}</div>`:html`<div class="collection-photo-gallery">${photo&&html`<div class="collection-photo-preview"><button class="collection-photo-open" onClick=${openPhoto} aria-label="Open photograph in Picture and Fax Viewer"><img src=${photo.url} alt=${photo.alt}/></button><div class="collection-photo-caption"><div><strong>${photo.title||'Untitled'}</strong><span>${photo.loc}</span></div><div><button aria-label="Previous photograph" onClick=${()=>setPhotoIndex(i=>(i-1+data.photos.length)%data.photos.length)}>←</button><span>${photoIndex+1} / ${data.photos.length}</span><button aria-label="Next photograph" onClick=${()=>setPhotoIndex(i=>(i+1)%data.photos.length)}>→</button></div></div></div>`}<div class="collection-photos" aria-label="Photo thumbnails">${data.photos.map((p,i)=>html`<button aria-label=${`Select ${p.title||p.loc||'photograph'}`} aria-pressed=${i===photoIndex} onClick=${()=>setPhotoIndex(i)}><img src=${p.url} alt=${p.alt} loading="lazy"/><span>${p.title||p.loc||'Untitled'}</span></button>`)}</div></div>`}
  </div>`;
}
