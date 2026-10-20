// Test-only instrumentation is injected into a scratch bundle, never production.
import {build} from 'esbuild';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));
if(!process.env.TMPDIR)throw new Error('TMPDIR is required');
const tmp=join(process.env.TMPDIR,'pinball-polish');await mkdir(tmp,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs');
await build({stdin:{contents:"import {h,render} from 'preact';import {Pinball} from './scripts/render/components/pinball.ts';globalThis.mount=(active=true)=>render(h(Pinball,{active}),document.querySelector('#app'));mount();",resolveDir:root,loader:'ts'},bundle:true,format:'esm',outfile:join(tmp,'client.js'),plugins:[{name:'test-only',setup(b){b.onLoad({filter:/\/pinball\.ts$/},async a=>({loader:'ts',contents:(await readFile(a.path,'utf8')).replace('const sync=()=>{','globalThis.__game=()=>game.current;globalThis.__angles=()=>angles.current;const sync=()=>{')}));b.onLoad({filter:/\/pinball-audio\.ts$/},async a=>({loader:'ts',contents:(await readFile(a.path,'utf8')).replace('oscillator.start(now);',"oscillator.start(now);globalThis.__sounds.push(kind);").replace('osc.start(now);','osc.start(now);globalThis.__musicNotes++;')}));}}]});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/lw/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{globalThis.__sounds=[];globalThis.__musicNotes=0;globalThis.__contexts=[];const Native=AudioContext;globalThis.AudioContext=class extends Native{constructor(...args){super(...args);globalThis.__contexts.push(this);}};});
await page.route('http://pinball.test/**',async r=>{const path=new URL(r.request().url()).pathname;if(path==='/')return r.fulfill({contentType:'text/html',body:'<html><head><link rel="stylesheet" href="/css/pinball.css"><style>html,body,#app{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/client.js"></script></body></html>'});await r.fulfill({path:path==='/client.js'?join(tmp,'client.js'):resolve(root,'.'+path)});});
const state=()=>page.evaluate(()=>({g:__game(),a:__angles(),sounds:__sounds}));
const run=ms=>page.clock.runFor(ms);
const reset=async()=>{await page.keyboard.press('F2');await run(100);};
const ball=async(b,mode={})=>page.evaluate(({b,mode})=>{const g=__game();g.balls=[b];Object.assign(g.mode,mode);},{b,mode});
try{
 await page.clock.install();await page.goto('http://pinball.test/');await page.locator('canvas[data-art-ready=true]').waitFor();
 assert.equal(await page.evaluate(()=>__contexts.length),0,'No AudioContext before gesture');
 await page.screenshot({path:join(tmp,'desktop.png')});
 await page.keyboard.down(' ');await run(450);await page.keyboard.up(' ');await run(100);
 assert.ok((await state()).g.balls.length);assert.ok((await state()).sounds.includes('launch'));
 // Render snapshots first, then skip GPU draws during long simulation runs.
 await page.evaluate(()=>{globalThis.__draws={};for(const m of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){__draws[m]=WebGL2RenderingContext.prototype[m];WebGL2RenderingContext.prototype[m]=()=>{};}});
 const launches=[];
 for(const hold of [0,450,1000]){await reset();await page.keyboard.down(' ');await run(hold);await page.keyboard.up(' ');let crossed=false,scored=false;for(let i=0;i<120;i++){await run(100);const {g}=await state();for(const [key,left] of [['z',true],['/',false]]){if(g.balls.some(b=>b.y>565&&b.y<670&&(left?b.x<240:b.x>=240)))await page.keyboard.down(key);else await page.keyboard.up(key);}crossed ||=g.balls.some(b=>b.x<430&&b.y<250);scored ||=g.score>0;if(!g.balls.length)break;}assert.ok(crossed,`Launch ${hold} enters field`);assert.ok(scored,`Launch ${hold} scores with timed flippers`);launches.push({hold,crossed,scored});await page.keyboard.up('z');await page.keyboard.up('/');}console.log('launches',launches);
 // A live stroke at the contact face must propel the ball back up the table.
 for(const [key,x] of [['z',211],['/',269]]){await reset();await ball({x,y:640,vx:0,vy:180});await page.keyboard.down(key);await run(80);const b=(await state()).g.balls[0];assert.ok(b&&b.vy<-100,`${key} stroke returns ball: ${JSON.stringify(b)}`);await page.keyboard.up(key);}
 await reset();await ball({x:80,y:425,vx:0,vy:-180});await run(100);assert.ok((await state()).g.mode.club>14);await run(1800);assert.equal((await state()).g.balls[0].ramp,undefined,'Ramp returns to live field');assert.ok((await state()).g.score>=5000);
 await reset();await ball({x:150,y:250,vx:0,vy:-100});await run(50);assert.ok((await state()).g.flashes['speaker-0']>0);assert.ok((await state()).sounds.includes('bumper'));
 await reset();await ball({x:185,y:343,vx:0,vy:-180});await run(50);assert.ok((await state()).g.targets[0]);assert.ok((await state()).sounds.includes('target'));
 await reset();await ball({x:365,y:401,vx:100,vy:0},{keta:2});await run(50);assert.equal((await state()).g.mode.kind,'khole');
 const resting=(await state()).a.left;await page.keyboard.down('z');await run(80);assert.equal((await state()).a.left,resting);await run(250);assert.ok((await state()).a.left<resting&&(await state()).a.left>-.55);await page.keyboard.up('z');
 await page.keyboard.press('p');await run(100);const frozen=await state();await run(1000);assert.equal((await state()).g.mode.remaining,frozen.g.mode.remaining);assert.equal((await state()).sounds.length,frozen.sounds.length);await page.keyboard.press('p');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await run(100);const hidden=await state();await run(1000);assert.equal((await state()).g.mode.remaining,hidden.g.mode.remaining);assert.equal((await state()).sounds.length,hidden.sounds.length);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await run(100);
 await page.evaluate(()=>mount(false));await run(100);const inactive=await state();await run(1000);assert.equal((await state()).g.mode.remaining,inactive.g.mode.remaining);await page.evaluate(()=>mount(true));await run(100);
 await reset();await ball({x:300,y:236,vx:0,vy:180},{pepLanes:[true,true,false]});await run(100);assert.equal((await state()).g.mode.kind,'pep');
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();const quiet=(await state()).sounds.length;await reset();await ball({x:150,y:250,vx:0,vy:-100});await run(100);assert.equal((await state()).sounds.length,quiet);assert.equal(await page.evaluate(()=>localStorage.getItem('canal-cadet-muted')),'true');
 await page.getByRole('button',{name:'Unmute sound',exact:true}).click();await ball({x:240,y:740,vx:0,vy:10});await run(100);assert.equal((await state()).g.remaining,2);assert.equal((await state()).g.mode.kind,'normal');assert.ok((await state()).sounds.includes('drain'));
 await reset();assert.equal((await state()).g.score,0);assert.equal((await state()).g.remaining,3);
 // Tilt is a live-ball rule: scoring/flippers stop, physics continues, next ball resets it.
 await reset();await page.keyboard.press(' ');await run(100);
 const notes=await page.evaluate(()=>__musicNotes);assert.ok(notes>0,'Original music plays after launch');
 await page.keyboard.press('p');await run(100);const pausedNotes=await page.evaluate(()=>__musicNotes);await run(500);assert.equal(await page.evaluate(()=>__musicNotes),pausedNotes);await page.keyboard.press('p');
 await page.getByRole('button',{name:'Turn music off',exact:true}).click();await run(100);const quietNotes=await page.evaluate(()=>__musicNotes);await run(500);assert.equal(await page.evaluate(()=>__musicNotes),quietNotes);await page.getByRole('button',{name:'Turn music on',exact:true}).click();
 for(let i=0;i<3;i++){await ball({x:240,y:420,vx:0,vy:0});await page.keyboard.press('Shift');await run(350);}
 assert.equal((await state()).g.tilt.tilted,true);
 await page.keyboard.down('z');await run(100);assert.equal((await state()).a.left,.43,'Tilt disables flippers');await page.keyboard.up('z');
 const tiltScore=(await state()).g.score;await ball({x:150,y:250,vx:0,vy:-100});await run(50);assert.equal((await state()).g.score,tiltScore,'Tilt disables scoring');assert.ok((await state()).g.balls[0].vy!==-100,'Ball physics remains active');
 await ball({x:240,y:740,vx:0,vy:10});await run(100);assert.equal((await state()).g.tilt.tilted,false,'Drain resets tilt');
 await reset();
 await page.evaluate(()=>{for(const [m,fn] of Object.entries(__draws))WebGL2RenderingContext.prototype[m]=fn;});
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await run(200);await page.screenshot({path:join(tmp,'phone.png')});assert.ok(await page.getByRole('button',{name:'Mute sound',exact:true}).isVisible());assert.ok(await page.getByRole('button',{name:'Launch ball',exact:true}).isVisible());await page.getByRole('button',{name:'Launch ball',exact:true}).click();await run(100);assert.ok((await state()).g.balls.length);
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();const sounds=[...new Set((await state()).sounds)];await page.reload();await page.locator('canvas[data-art-ready=true]').waitFor();assert.ok(await page.getByRole('button',{name:'Unmute sound',exact:true}).isVisible());assert.equal(await page.evaluate(()=>__contexts.length),0);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',launches,sounds,screenshots:tmp},null,2));
}finally{await browser.close();}
