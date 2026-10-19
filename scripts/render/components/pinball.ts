import {html} from 'htm/preact';
import type {VNode} from 'preact';
import {useEffect,useRef,useState,useId} from 'preact/hooks';
import {createPinballAudio,type PinballSound} from './pinball-audio.js';
import {createPinballScene,rampPosition} from './pinball-scene.js';
import {freshMode,ballTimeScale,tickMode,hitSurface,enterClub,surfaceKind,flipperSettings,delayedControls,hitPepLane,HORSE_TARGET,PEP_Y,PEP_LANES,type SpeedMode,type Controls} from './pinball-modes.js';

type Ball={x:number;y:number;vx:number;vy:number;height?:number;ramp?:number};
type Segment={x1:number;y1:number;x2:number;y2:number};
type Game={flashes:Record<string,number>;mode:SpeedMode;balls:Ball[];score:number;remaining:number;best:number;letters:number;targets:boolean[];commutes:number;orbit:boolean;bonus:number;multiball:boolean;message:string};
const W=480,H=720,R=8,STEP=1/120;
const rails:Segment[]=[{x1:18,y1:670,x2:18,y2:75},{x1:18,y1:75,x2:65,y2:25},{x1:65,y1:25,x2:405,y2:25},{x1:405,y1:25,x2:468,y2:85},{x1:468,y1:85,x2:468,y2:720},{x1:438,y1:145,x2:438,y2:630},{x1:18,y1:520,x2:164,y2:638},{x1:438,y1:520,x2:316,y2:638},{x1:70,y1:470,x2:144,y2:540},{x1:144,y1:540,x2:120,y2:575},{x1:120,y1:575,x2:70,y2:470},{x1:410,y1:470,x2:336,y2:540},{x1:336,y1:540,x2:360,y2:575},{x1:360,y1:575,x2:410,y2:470}];
const speakers=[{x:150,y:220},{x:330,y:220},{x:240,y:145},{x:82,y:80}];
const fresh=(best=0):Game=>({flashes:{},mode:freshMode(),balls:[],score:0,remaining:3,best,letters:0,targets:[false,false,false],commutes:0,orbit:false,bonus:0,multiball:false,message:'Night ride? Launch a ball.'});
const cap=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export function Pinball({active=true}:{active?:boolean}):VNode {
  const canvas=useRef<HTMLCanvasElement>(null),game=useRef<Game>(fresh()),keys=useRef({left:false,right:false}),angles=useRef({left:.43,right:Math.PI-.43}),charge=useRef(0);
  const inputHistory=useRef<Controls[]>([]);
  const audio=useRef<ReturnType<typeof createPinballAudio>|null>(null);
  const [muted,setMuted]=useState(()=>{try{return localStorage.getItem('canal-cadet-muted')==='true';}catch{return false;}});
  useEffect(()=>{const sound=createPinballAudio();audio.current=sound;return()=>{sound.dispose();audio.current=null;};},[]);
  useEffect(()=>{audio.current?.setMuted(muted);},[muted]);
  const menuId=useId(),menu=useRef<HTMLDivElement>(null);
  const [touchControls,setTouchControls]=useState(true);
  useEffect(()=>{const media=matchMedia('(max-width:760px)'),resize=()=>setTouchControls(media.matches);resize();media.addEventListener('change',resize);const close=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node))menu.current?.querySelectorAll('details[open]').forEach(d=>(d as HTMLDetailsElement).open=false);};document.addEventListener('pointerdown',close);return()=>{document.removeEventListener('pointerdown',close);media.removeEventListener('change',resize);};},[]);
  const closeMenus=()=>menu.current?.querySelectorAll('details[open]').forEach(d=>(d as HTMLDetailsElement).open=false);
  const [playing,setPlaying]=useState(false),[paused,setPaused]=useState(false),[hud,setHud]=useState({score:0,remaining:3,best:0,message:'Night ride? Launch a ball.',letters:0,commutes:0,targets:0,mode:'normal' as SpeedMode['kind'],modeTime:0,club:0,keta:0});
  useEffect(()=>{const update=()=>audio.current?.setEnabled(active&&!paused&&!document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[active,paused]);
  const wakeAudio=()=>audio.current?.unlock();
  const feedback=(id:string,kind:PinballSound)=>{game.current.flashes[id]=.18;audio.current?.play(kind);};
  const scene=useRef<ReturnType<typeof createPinballScene>|null>(null);
  const [renderError,setRenderError]=useState(false);
  useEffect(()=>{if(!active||!canvas.current||scene.current)return;try{scene.current=createPinballScene(canvas.current,rails);scene.current.draw(game.current,angles.current);}catch{setRenderError(true);}},[active]);
  useEffect(()=>()=>{scene.current?.dispose();scene.current=null;},[]);
  const [charged,setCharged]=useState(false),[revision,setRevision]=useState(0);
  const sync=()=>{const g=game.current;setHud({score:g.score,remaining:g.remaining,best:g.best,message:g.message,letters:g.letters,commutes:g.commutes,targets:g.targets.filter(Boolean).length,mode:g.mode.kind,modeTime:Math.ceil(g.mode.remaining),club:Math.ceil(g.mode.club),keta:g.mode.keta});};
  const persist=()=>{const g=game.current;if(g.score>g.best){g.best=g.score;try{localStorage.setItem('canal-cadet-best',String(g.best));}catch{/* storage optional */}}};
  const launch=()=>{const g=game.current;if(!active||paused||g.balls.length||g.remaining<=0)return;const power=charge.current?cap((performance.now()-charge.current)/900,0,1):.5;charge.current=0;setCharged(false);g.balls=[{x:454,y:655,vx:-35,vy:-850-power*320}];wakeAudio();feedback('launch','launch');g.message='Bike lights on. See you at the club.';setPlaying(true);sync();};
  const restart=()=>{audio.current?.setEnabled(false);audio.current?.setEnabled(active&&!document.hidden);game.current=fresh(game.current.best);inputHistory.current=[];keys.current={left:false,right:false};angles.current={left:.43,right:Math.PI-.43};setPlaying(false);setPaused(false);charge.current=0;setCharged(false);setRevision(v=>v+1);sync();};
  useEffect(()=>{try{game.current.best=Number(localStorage.getItem('canal-cadet-best'))||0;sync();}catch{/* optional */}},[]);
  useEffect(()=>{
    if(!active){inputHistory.current=[];keys.current={left:false,right:false};charge.current=0;setCharged(false);return;}
    const down=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey)return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','z','/',' ','p','enter','f2'].includes(k))wakeAudio();if(['arrowleft','arrowright','z','/',' ','p','enter'].includes(k))e.preventDefault();if(k==='arrowleft'||k==='z')keys.current.left=true;if(k==='arrowright'||k==='/')keys.current.right=true;if(k===' '&&!e.repeat&&!game.current.balls.length){charge.current=performance.now();setCharged(true);}if(k==='p'&&!e.repeat)setPaused(p=>!p);if(k==='enter'&&game.current.remaining===0)restart();if(k==='f2'){e.preventDefault();restart();}};
    const up=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='z')keys.current.left=false;if(k==='arrowright'||k==='/')keys.current.right=false;if(k===' '){e.preventDefault();launch();}};
    const clear=()=>{inputHistory.current=[];keys.current={left:false,right:false};charge.current=0;setCharged(false);};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);clear();};
  },[active,paused]);
  useEffect(()=>{
    let raf=0,last=0,acc=0,lastHud=0;
    const flipper=(side:'left'|'right',a=angles.current[side]):Segment=>{const x=side==='left'?170:310,length=flipperSettings(game.current.mode).length;return{x1:x,y1:640,x2:x+Math.cos(a)*length,y2:640+Math.sin(a)*length};};
    const collide=(b:Ball,s:Segment,radius=R,restitution=.82,omega=0)=>{
      const dx=s.x2-s.x1,dy=s.y2-s.y1,t=cap(((b.x-s.x1)*dx+(b.y-s.y1)*dy)/(dx*dx+dy*dy),0,1),px=s.x1+t*dx,py=s.y1+t*dy;
      let nx=b.x-px,ny=b.y-py,dist=Math.hypot(nx,ny);if(dist>=radius)return false;if(dist<.001){nx=-dy;ny=dx;dist=Math.hypot(nx,ny);}nx/=dist;ny/=dist;
      b.x=px+nx*(radius+.1);b.y=py+ny*(radius+.1);
      const sx=-omega*(py-s.y1),sy=omega*(px-s.x1),v=(b.vx-sx)*nx+(b.vy-sy)*ny;
      if(v<0){b.vx-=(1+restitution)*v*nx;b.vy-=(1+restitution)*v*ny;}
      return v < -.1;
    };
    const score=(n:number)=>{const g=game.current;g.score+=n*(g.bonus>0?4:1);persist();};
    const surface=(id:string,kind:'keta'|'pep',horse=false)=>{const g=game.current,n=hitSurface(g.mode,id,kind,horse);if(!n)return;score(n);g.message=g.mode.kind==='khole'?'K-HOLE · delayed flippers · ride it out':kind==='keta'?`KETA +1,000 · ${g.mode.keta}/3 before K-hole`:'PEP +250 · bigger, faster flippers';};
    const step=()=>{
      const g=game.current,previousMode=g.mode.kind;tickMode(g.mode,STEP);for(const id of Object.keys(g.flashes)){g.flashes[id]-=STEP;if(g.flashes[id]<=0)delete g.flashes[id];}const dt=STEP*ballTimeScale(g.mode);g.bonus=Math.max(0,g.bonus-STEP);const oldL=angles.current.left,oldR=angles.current.right;
      const controls=delayedControls(inputHistory.current,keys.current,g.mode),settings=flipperSettings(g.mode);
      angles.current.left+=cap((controls.left?-.55:.43)-oldL,-settings.speed*STEP,settings.speed*STEP);angles.current.right+=cap((controls.right?Math.PI+.55:Math.PI-.43)-oldR,-settings.speed*STEP,settings.speed*STEP);
      if(controls.left&&oldL===.43)feedback('flipper-left','flipper');if(controls.right&&oldR===Math.PI-.43)feedback('flipper-right','flipper');
      for(const b of [...g.balls]){
        if(b.ramp!==undefined){b.ramp+=dt/1.8;Object.assign(b,rampPosition(b.ramp));if(b.ramp>=1){delete b.ramp;b.height=0;b.vx=95;b.vy=220;score(5000);g.message='CLUB RAMP · 5,000 points';}continue;}
        if(b.x>62&&b.x<104&&b.y>410&&b.y<440&&b.vy<-100){b.ramp=0;enterClub(g.mode);feedback('mode','mode');g.message='CLUB OPEN · 15s · gold PEP / violet KETA';continue;}
        b.vy+=520*dt;b.vx*=Math.pow(.9997,dt/STEP);b.vy*=Math.pow(.9997,dt/STEP);const speed=Math.hypot(b.vx,b.vy);if(speed>1500){b.vx*=1500/speed;b.vy*=1500/speed;}
        // Subdivide relative travel too: a fast paddle can sweep through a nearly still ball.
        const slices=Math.max(1,Math.ceil((Math.hypot(b.vx,b.vy)*dt+Math.max(Math.abs(angles.current.left-oldL),Math.abs(angles.current.right-oldR))*settings.length)/(R*.5)));
        for(let sub=0;sub<slices;sub++){
          const oldY=b.y;b.x+=b.vx*dt/slices;b.y+=b.vy*dt/slices;
          if((oldY<PEP_Y&&b.y>=PEP_Y)||(oldY>PEP_Y&&b.y<=PEP_Y)){PEP_LANES.forEach((x,i)=>{if(Math.abs(b.x-x)<15&&hitPepLane(g.mode,i))g.message="PEP MODE · bigger, faster flippers · 10 seconds";});}
          const hx=b.x-HORSE_TARGET.x,hy=b.y-HORSE_TARGET.y,hd=Math.hypot(hx,hy);
          if(hd<HORSE_TARGET.radius+R){const nx=hd>0?hx/hd:1,ny=hd>0?hy/hd:0;b.x=HORSE_TARGET.x+nx*(HORSE_TARGET.radius+R+.5);b.y=HORSE_TARGET.y+ny*(HORSE_TARGET.radius+R+.5);b.vx=nx*320;b.vy=ny*320;feedback("horse","target");surface("horse","keta",true);}
          for(const [i,rail] of rails.entries())if(collide(b,rail))surface(`rail-${i}`,surfaceKind(i));
          // The plunger feeds left into the top orbit, then a one-way gate closes.
          if(b.x>438&&b.y<130){b.vx=Math.min(b.vx,-260);g.message='Into the bike lane!';}
          for(const [i,p] of speakers.entries()){
            const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<31){const nx=dx/(d||1),ny=dy/(d||1);b.x=p.x+nx*31.5;b.y=p.y+ny*31.5;b.vx=nx*440;b.vy=ny*440;feedback(`speaker-${i}`,'bumper');score(500);g.letters++;
              if(g.letters>=6){g.letters=0;g.bonus=20;feedback('mode','mode');g.message='RAVE MODE · 4× score for 20 seconds';score(5000);}else g.message=`Speaker ${i+1} · ${'TECHNO'.slice(0,g.letters)}`;surface(`speaker-${i}`,surfaceKind(i));}
          }
          for(let i=0;i<3;i++){const target={x1:170+i*55,y1:330,x2:200+i*55,y2:330};if(collide(b,target,R+5,1.05)){feedback(`target-${i}`,'target');surface(`target-${i}`,surfaceKind(i));if(!g.targets[i]){g.targets[i]=true;score(1500);g.message='Bitterballen target!';if(g.targets.every(Boolean)&&!g.multiball){g.multiball=true;feedback('mode','mode');g.balls.push({x:240,y:100,vx:200,vy:80});g.message='BORREL · two-ball multiball!';score(5000);}}}}
          if(b.x<65&&b.y<180)g.orbit=true;if(g.orbit&&b.x<100&&b.y>390){g.orbit=false;g.commutes++;score(2000);g.message='COMMUTE · another lap of the canals';if(g.commutes===3){score(10000);g.message='COMMUTE COMPLETE · 10,000 points';}}
          const spin=Math.hypot(b.x-395,b.y-285);if(spin<24){const nx=(b.x-395)/(spin||1),ny=(b.y-285)/(spin||1);b.x=395+nx*24.5;b.y=285+ny*24.5;b.vx=nx*350;b.vy=ny*350;feedback('spinner','target');score(750);g.message='Windmill spinner · lekker!';surface('spinner','pep');}
          if(collide(b,flipper('left',oldL+(angles.current.left-oldL)*(sub+1)/slices),R+settings.radius,.6,(angles.current.left-oldL)/STEP))surface('flipper-left','pep');if(collide(b,flipper('right',oldR+(angles.current.right-oldR)*(sub+1)/slices),R+settings.radius,.6,(angles.current.right-oldR)/STEP))surface('flipper-right','keta');
        }
      }
      if(g.mode.kind!==previousMode)feedback('mode','mode');
      const beforeDrain=g.balls.length;g.balls=g.balls.filter(b=>b.y<H+R&&Number.isFinite(b.x)&&Number.isFinite(b.y));
      if(g.balls.length<beforeDrain)feedback('drain','drain');
      if(!g.balls.length){g.flashes={};g.remaining--;keys.current={left:false,right:false};g.message=g.remaining>0?'In the canal. Another ride?':'Last tram home. New game?';g.targets=[false,false,false];g.multiball=false;g.mode=freshMode();inputHistory.current=[];setPlaying(false);persist();sync();}
    };
    const draw=()=>scene.current?.draw(game.current,angles.current);
    const frame=(now:number)=>{if(document.hidden){last=0;raf=requestAnimationFrame(frame);return;}if(!last)last=now;acc+=Math.min((now-last)/1000,.05);last=now;while(acc>=STEP){if(game.current.balls.length)step();else{if(keys.current.left&&angles.current.left===.43)audio.current?.play('flipper');if(keys.current.right&&angles.current.right===Math.PI-.43)audio.current?.play('flipper');angles.current.left+=cap((keys.current.left?-.55:.43)-angles.current.left,-14*STEP,14*STEP);angles.current.right+=cap((keys.current.right?Math.PI+.55:Math.PI-.43)-angles.current.right,-14*STEP,14*STEP);}acc-=STEP;}draw();if(now-lastHud>100){sync();lastHud=now;}raf=requestAnimationFrame(frame);};
    draw();if(active&&!paused)raf=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(raf);
  },[active,paused,playing,revision]);
  const touch=(side:'left'|'right',pressed:boolean,e:PointerEvent)=>{e.preventDefault();if(pressed)wakeAudio();if(paused||!active)return;keys.current[side]=pressed;if(pressed)(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);};
  return html`<div class="pinball-app" data-mode=${hud.mode} onPointerDown=${wakeAudio}>
    <div class="pinball-top" ref=${menu} onKeyDown=${(e:KeyboardEvent)=>{if(e.key==='Escape'){const open=menu.current?.querySelector('details[open]');closeMenus();open?.querySelector('summary')?.focus();}}}>
      <details name=${menuId}><summary>Game</summary><div class="pinball-menu"><button onClick=${()=>{restart();closeMenus();}}>New game <span>F2</span></button><button onClick=${()=>{setPaused(v=>!v);closeMenus();}}>${paused?'Resume':'Pause'} <span>P</span></button></div></details>
      <details name=${menuId}><summary>Options</summary><div class="pinball-menu"><button aria-pressed=${touchControls} onClick=${()=>{setTouchControls(v=>!v);closeMenus();}}>${touchControls?'Hide':'Show'} flipper buttons</button></div></details>
      <details name=${menuId}><summary>Help</summary><div class="pinball-menu pinball-instructions">Arrow keys or Z / slash: flippers.<br/>Hold Space to launch; P to pause.<br/>Club ramp: 15s of gold PEP (+250) and violet KETA (+1,000). Third KETA hit: 8s of delayed, slow flippers.<br/>PEP: bigger, faster flippers for 10s. Horseshoe adds KETA.</div></details>
      ${paused&&html`<button class="pinball-resume" onClick=${()=>setPaused(false)}>Resume</button>`}
    </div>
    <div class="pinball-layout"><div class="pinball-table"><button class="pinball-mute" aria-label=${muted?'Unmute sound':'Mute sound'} aria-pressed=${muted} onClick=${()=>{audio.current?.setMuted(!muted);setMuted(!muted);try{localStorage.setItem('canal-cadet-muted',String(!muted));}catch{/* optional */}if(muted)wakeAudio();}}>${muted?'Sound off':'Sound on'}</button><button class="pinball-touch-pause" aria-label=${paused?'Resume game':'Pause game'} onClick=${()=>setPaused(v=>!v)}>${paused?'▶':'Ⅱ'}</button>${renderError?html`<p class="pinball-overlay">3D pinball needs WebGL. Try a browser with hardware acceleration enabled.</p>`:null}${paused?html`<div class="pinball-overlay">Paused</div>`:null}<canvas ref=${canvas} width=${W} height=${H} aria-label="Canal Cadet pinball table. Use the flipper buttons or arrow keys." role="img"/></div><aside class="pinball-scoreboard"><div class="pinball-marquee"><img src="/assets/pinball/marquee.png" alt="3D Pinball — Canal Cadet: a cyclist riding through Amsterdam at night"/></div><div><small>SCORE</small><output aria-label="Score">${hud.score.toLocaleString('en-GB')}</output></div><div><small>HIGH SCORE</small><output>${hud.best.toLocaleString('en-GB')}</output></div><div><small>BALL</small><output>${Math.min(4-hud.remaining,3)} / 3</output></div><div class="pinball-missions"><h2>Tonight’s route</h2><p>🚲 Commute <b>${Math.min(hud.commutes,3)}/3</b></p><p>🍻 Borrel <b>${hud.targets}/3</b></p><p>♫ Rave <b>${'TECHNO'.slice(0,hud.letters)||'—'}</b></p><small>Ride the left orbit. Hit all three targets for multiball. Spell TECHNO for 4× scoring. Club ramp: 15s of gold PEP (+250) and violet KETA (+1,000). Third KETA hit: 8s of delayed, slow flippers. PEP: bigger, faster flippers for 10s. Horseshoe adds KETA.</small></div><div class="pinball-mode" data-mode=${hud.mode} role="status">${hud.mode==='khole'?`K-HOLE · ${hud.modeTime}s · SLOW FLIPPERS`:hud.mode==='pep'?`PEP · ${hud.modeTime}s · BIG FLIPPERS`:'NORMAL FLIPPERS'}</div><div class="pinball-club" data-active=${hud.club>0}>${hud.club?`CLUB ${hud.club}s · KETA ${hud.keta}/3`:`KETA ${hud.keta}/3 · ENTER CLUB RAMP`}<small>GOLD: PEP +250 · VIOLET: KETA +1,000</small></div><p class="pinball-message" role="status">${hud.message}</p></aside></div>
    <div class="pinball-controls" hidden=${!touchControls}><button aria-label="Left flipper" onPointerDown=${(e:PointerEvent)=>touch('left',true,e)} onPointerUp=${(e:PointerEvent)=>touch('left',false,e)} onPointerCancel=${()=>{keys.current.left=false;}} onLostPointerCapture=${()=>{keys.current.left=false;}}>◀ Left flipper</button><button class="pinball-launch" disabled=${renderError||playing||paused||!active||hud.remaining===0} onPointerDown=${(e:PointerEvent)=>{charge.current=performance.now();setCharged(true);(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);}} onPointerUp=${launch} onPointerCancel=${()=>{charge.current=0;setCharged(false);}} onClick=${(e:MouseEvent)=>{if(e.detail===0)launch();}}>${hud.remaining===0?'Game over':charged?'Release!':'Launch ball'}</button><button aria-label="Right flipper" onPointerDown=${(e:PointerEvent)=>touch('right',true,e)} onPointerUp=${(e:PointerEvent)=>touch('right',false,e)} onPointerCancel=${()=>{keys.current.right=false;}} onLostPointerCapture=${()=>{keys.current.right=false;}}>Right flipper ▶</button></div>
    <p class="pinball-help">← / → or Z / slash: flippers · Hold Space: launch · P: pause · 3 balls</p>
  </div>`;
}
