import {html} from 'htm/preact';
/** Small, original toolbar artwork with the shaded colours of XP controls. */
export function RetroIcon({name}:{name:string}) {
 if(name==='folder')return html`<img class="retro-icon" src="/assets/xp/folder.png" alt=""/>`;
 const paths:Record<string,string>={back:'M17 7 8 16l9 9v-6h9v-6h-9Z',forward:'m15 7 9 9-9 9v-6H6v-6h9Z',up:'m16 3-8 9h5v12h6V12h5Z',search:'M21 21 29 29',fit:'M5 12V5h7M20 5h7v7M27 20v7h-7M12 27H5v-7',rotate:'M7 11a10 10 0 1 1-1 12M7 4v9H1',play:'m12 8 13 8-13 8Z',pause:'M11 8v16M21 8v16',save:'M6 4h20v24H6ZM11 4v9h10V4M10 28V18h12v10',folder:'M3 9V5h11l3 4h12v18H3Z',views:'M4 4h24v24H4ZM4 12h24M4 20h24M12 4v24M20 4v24'};
 const round=name==='back'||name==='forward';
 return html`<svg class="retro-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
 ${round&&html`<circle cx="16" cy="16" r="14" fill="#65ae35" stroke="#39772b"/><path d="M5 13a12 12 0 0 1 22 0" fill="none" stroke="#c6e6ad" stroke-width="3"/>`}
 ${name==='up'&&html`<path d="M2 13h12l3 3h13l-3 13H2Z" fill="#efd66b" stroke="#9c842d"/>`}
 ${name==='search'&&html`<circle cx="13" cy="13" r="9" fill="#c9ecfa" stroke="#537f9a" stroke-width="2"/><path d="m8 12 6-5" stroke="white" stroke-width="2"/>`}
 <path d=${paths[name]??paths.fit} fill=${round?'#fff':name==='up'?'#65ad36':name==='folder'?'#f2d664':name==='play'?'#4aa26a':'none'} stroke=${round?'#e7f5d9':name==='search'?'#536b83':'#41799e'} stroke-width=${name==='search'?5:1.7} stroke-linejoin="round"/>
 </svg>`;
}
