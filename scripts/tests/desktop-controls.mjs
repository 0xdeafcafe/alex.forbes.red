// Run after make check; browser artifacts stay in TMPDIR.
import {chromium} from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const root=process.cwd(),tmp=process.env.TMPDIR;
if(!tmp)throw new Error('TMPDIR is required');
const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('http://127.0.0.1:8766/**',async r=>{let p=decodeURIComponent(new URL(r.request().url()).pathname);if(p.endsWith('/'))p+='index.html';else if(!p.split('/').at(-1).includes('.'))p+='/index.html';await r.fulfill({path:root+p});});
await page.addInitScript(()=>{window.launchFrames={messenger:[],zune:[],encarta:[]};const frame=()=>{for(const app of Object.keys(launchFrames)){const win=document.querySelector('.window-'+app),splash=document.querySelector('.splash-'+app);const state=splash?'splash':win&&getComputedStyle(win).display!=='none'?'window':'hidden';const list=launchFrames[app];if(list.at(-1)!==state)list.push(state);}requestAnimationFrame(frame);};requestAnimationFrame(frame);});
const open=async app=>{await page.evaluate(app=>window.dispatchEvent(new CustomEvent('open-site-app',{detail:app})),app);await page.locator('.window-'+app).waitFor();};
try{
 await page.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>/\d/.test(document.querySelector('.xp-tray time').textContent));await page.getByRole('button',{name:'Visitor Explore Alexander Forbes-Reed’s desktop'}).click();await page.locator('.splash-messenger').waitFor();assert.equal(await page.locator('.window-messenger').isVisible(),false);assert.equal(await page.locator('.app-splash button').count(),0);await page.screenshot({path:tmp+'/retro-msm-splash.png'});await page.locator('.window-messenger').waitFor();
 // The window takes keyboard focus once its splash finishes.
 await page.waitForFunction(()=>document.querySelector('.window-messenger')?.contains(document.activeElement));
 for(const app of ['zune','encarta']){await page.evaluate(app=>window.dispatchEvent(new CustomEvent('open-site-app',{detail:app})),app);await page.locator('.splash-'+app).waitFor();assert.equal(await page.locator('.window-'+app).isVisible(),false);await page.screenshot({path:tmp+'/retro-'+app+'-splash.png'});await page.locator('.window-'+app).waitFor();}
 for(const states of Object.values(await page.evaluate(()=>launchFrames)))assert.deepEqual(states,['hidden','splash','window']);
 for(const app of ['word','keygen','photos']){await open(app);assert.equal(await page.locator('.app-splash').count(),0);}
 const photos=page.locator('.window-photos'),img=photos.locator('.picture-stage img'),first=await img.getAttribute('src');await page.keyboard.press('ArrowRight');assert.notEqual(await img.getAttribute('src'),first);await page.keyboard.press('ArrowLeft');assert.equal(await img.getAttribute('src'),first);await page.screenshot({path:tmp+'/retro-picture-viewer.png'});
 await open('explorer');const explorer=page.locator('.window-explorer');await explorer.getByRole('button',{name:'My Pictures',exact:true}).click();await explorer.getByRole('button',{name:'Edit folder path'}).click();await explorer.getByRole('textbox',{name:'Folder path'}).fill('C:\\Documents and Settings\\Alexander Forbes-Reed\\My Documents\\My Music');await page.keyboard.press('Enter');await explorer.locator('main[aria-label="My Music"]').waitFor();await explorer.getByRole('button',{name:'Edit folder path'}).click();await explorer.getByRole('textbox',{name:'Folder path'}).fill('Z:\\missing');await page.keyboard.press('Enter');await explorer.getByRole('alert').waitFor();await page.keyboard.press('Escape');await explorer.locator('.explorer-address').getByRole('button',{name:'My Computer',exact:true}).click();await explorer.locator('main[aria-label="My Computer"]').waitFor();await page.screenshot({path:tmp+'/retro-explorer.png'});
 // A release outside the window, even after forced capture loss, commits the move.
 const title=explorer.locator('.xp-titlebar'),before=await explorer.boundingBox(),box=await title.boundingBox();await page.mouse.move(box.x+150,box.y+16);await page.mouse.down();await page.mouse.move(box.x+220,box.y+90,{steps:5});await title.evaluate(e=>{for(let i=0;i<10;i++)if(e.hasPointerCapture(i))e.releasePointerCapture(i);});await page.mouse.move(box.x+250,box.y+110);await page.mouse.up();const after=await explorer.boundingBox();assert.ok(after.x>before.x+80&&after.y>before.y+80,JSON.stringify({before,after}));assert.equal(await page.locator('.xp-resize-outline').count(),0);
 // Escape cancels, and a larger corner resizes.
 const moved=await title.boundingBox();await page.mouse.move(moved.x+150,moved.y+16);await page.mouse.down();await page.mouse.move(moved.x+180,moved.y+60);await page.keyboard.press('Escape');await page.mouse.up();assert.equal(Math.round((await explorer.boundingBox()).x),Math.round(after.x));
 const corner=await explorer.locator('.xp-resize-se').boundingBox();assert.equal(corner.width,28);await page.mouse.move(corner.x+24,corner.y+24);await page.mouse.down();await page.mouse.move(corner.x+64,corner.y+54,{steps:4});await page.mouse.up();assert.ok((await explorer.boundingBox()).width>after.width+25);
 // Stacking follows use order: the last window used is on top, then the one before it.
 const z=app=>page.locator('.window-'+app).evaluate(e=>Number(getComputedStyle(e).zIndex));
 const names={word:'Microsoft Office Word 2003',messenger:'Alex’s Main Stream Media',keygen:'Digital Creativity Keygen',photos:'Picture & Fax Viewer'};
 const clickTitle=app=>page.locator('.xp-taskbar').getByRole('button',{name:'Switch to '+names[app]}).click();
 await open('word');await open('pinball');await open('keygen');
 for(const app of ['word','messenger','keygen'])await clickTitle(app);
 assert.ok(await z('keygen')>await z('messenger')&&await z('messenger')>await z('word')&&await z('word')>await z('pinball'),'stacking order');
 assert.ok(await z('keygen')<10,'windows stay below the taskbar');
 // Minimising the active window hands focus to the window below it.
 await page.getByRole('button',{name:'Minimize Digital Creativity Keygen'}).click();
 await page.waitForFunction(()=>document.querySelector('.window-messenger')?.contains(document.activeElement));
 assert.ok(await page.locator('.window-messenger').evaluate(e=>e.classList.contains('is-active')));
 // Closing does the same.
 await page.getByRole('button',{name:'Close Alex’s Main Stream Media'}).click();
 assert.ok(await page.locator('.window-word').evaluate(e=>e.classList.contains('is-active')));
 // Show Desktop minimises everything; a second click restores the same windows.
 const openWindows=()=>page.evaluate(()=>[...document.querySelectorAll('.desktop-window')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.className.match(/window-(\w+)/)[1]).sort().join());
 const beforeShow=await openWindows();await page.getByRole('button',{name:'Show desktop'}).click();assert.equal(await openWindows(),'');await page.getByRole('button',{name:'Show desktop'}).click();assert.equal(await openWindows(),beforeShow);
 // Navigating inside Alexacarta must not reopen a window closed earlier, including after Back.
 await open('encarta');await open('messenger');await page.getByRole('button',{name:'Close Alex’s Main Stream Media'}).click();
 const encarta=page.locator('.window-encarta');await encarta.getByRole('button',{name:'Find',exact:true}).click();await page.waitForTimeout(100);
 assert.equal(await page.locator('.window-messenger').isVisible(),false,'Alexacarta navigation reopened Messenger');
 await page.goBack();await page.waitForTimeout(150);
 assert.equal(await page.locator('.window-messenger').isVisible(),false,'Back reopened Messenger');
 assert.ok(await encarta.isVisible());
 // A plain title-bar click leaves the window in its CSS layout (no pinned inline position).
 await open('photos');await page.locator('.window-photos .xp-window-title').click();assert.equal(await page.locator('.window-photos').evaluate(e=>e.style.left),'');
 // Keygen is a fixed-size dialog: it cannot be maximised.
 await open('keygen');assert.ok(await page.getByRole('button',{name:'Maximize Digital Creativity Keygen'}).isDisabled());
 // Clicking the empty desktop deactivates every window.
 const empty=await page.evaluate(()=>{for(let y=60;y<innerHeight-40;y+=20)for(let x=20;x<innerWidth;x+=20){const el=document.elementFromPoint(x,y);if(el?.classList.contains('xp-desktop'))return{x,y};}return null;});assert.ok(empty,'no empty desktop area');await page.mouse.click(empty.x,empty.y);assert.equal(await page.locator('.desktop-window.is-active').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: splash sequence, automatic dismissal, only three apps, picture arrows, virtual paths, capture-loss drag, Escape, 28px resize corners, stacking, focus handoff, Show Desktop toggle, Alexacarta history, fixed keygen');
}finally{await browser.close();}
