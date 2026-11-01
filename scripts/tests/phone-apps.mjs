// AFR Pocket handheld: boot, D-pad cursor, A/B/START, tabs, palette, apps and pinball keys.
// Run after `make build-offline`: node scripts/tests/phone-apps.mjs [chromium|webkit]
import {chromium,webkit} from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const engine=process.argv[2]==='webkit'?webkit:chromium;
const browser=await engine.launch(engine===chromium?{channel:'chrome'}:{});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:engine===chromium,hasTouch:true}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.xpFrames=0;const frame=()=>{if(document.querySelector('.xp-welcome')?.getClientRects().length)xpFrames++;requestAnimationFrame(frame);};requestAnimationFrame(frame);});
await page.route('http://phone.test/**',async r=>{let p=new URL(r.request().url()).pathname;if(p.endsWith('/'))p+='index.html';else if(!p.split('/').at(-1).includes('.'))p+='/index.html';await r.fulfill({path:process.cwd()+p});});
const hw=name=>page.getByRole('button',{name,exact:true});
const tap=async name=>{await hw(name).dispatchEvent('pointerdown');await hw(name).dispatchEvent('pointerup');};
const focused=()=>page.evaluate(()=>document.activeElement?.textContent?.trim().toLowerCase()??'');
try{
  await page.goto('http://phone.test/',{waitUntil:'domcontentloaded'});
  await page.locator('.pk-boot').waitFor();
  await hw('A (select)').click();// any button skips the boot
  await page.locator('.pk-home').waitFor();
  assert.equal(await page.locator('.xp-welcome').count(),0);
  // The cursor starts on "last spun"; two downs land on music.
  await tap('Down');await tap('Down');
  assert.match(await focused(),/^music/);
  await hw('A (select)').click();
  await page.locator('.pk-app-zune').waitFor({state:'visible'});
  assert.equal(new URL(page.url()).pathname,'/music');
  assert.match((await page.locator('.pk-tabs [aria-pressed=true]').innerText()).toLowerCase(),/albums/);
  await tap('Right');
  assert.match((await page.locator('.pk-tabs [aria-pressed=true]').innerText()).toLowerCase(),/artists/);
  // B leaves the app; START always returns to the menu.
  await hw('B (back)').click();
  await page.locator('.pk-home').waitFor({state:'visible'});
  // Photos: grid cursor, viewer, D-pad steps, B closes.
  await page.locator('.pk-menu-item',{hasText:'photos'}).click();
  await page.locator('.pk-grid button').first().waitFor();
  await tap('Right');await tap('Down');
  assert.equal(await page.evaluate(()=>[...document.querySelectorAll('.pk-grid button')].indexOf(document.activeElement)),4);
  await hw('A (select)').click();
  await page.locator('.pk-viewer').waitFor();
  const first=await page.locator('.pk-viewer-bar span').innerText();
  await tap('Right');
  assert.notEqual(await page.locator('.pk-viewer-bar span').innerText(),first);
  await hw('B (back)').click();
  await page.locator('.pk-viewer').waitFor({state:'detached'});
  // Writing: open an article, B returns to the list.
  await hw('Start (menu)').click();
  await page.locator('.pk-menu-item',{hasText:'writing'}).click();
  await page.waitForFunction(()=>document.activeElement?.closest('.pk-writing'));
  await hw('A (select)').click();
  await page.locator('.pk-reading>h2').waitFor();
  await hw('B (back)').click();
  await page.locator('.pk-writing').waitFor();
  // Projects: detail with an external link.
  await hw('Start (menu)').click();
  await page.locator('.pk-menu-item',{hasText:'projects'}).click();
  await page.waitForFunction(()=>document.activeElement?.closest('.pk-projects'));
  await hw('A (select)').click();
  assert.equal(await page.locator('.pk-project a').first().getAttribute('target'),'_blank');
  // Keygen still works through its own picker.
  await hw('Start (menu)').click();
  await page.locator('.pk-menu-item',{hasText:'keygen'}).click();
  await page.locator('.pk-app-keygen select').selectOption('1');
  assert.equal(await page.locator('.pk-app-keygen .metro-project-detail h2').innerText(),'ceefax');
  // SELECT cycles the LCD palette and remembers it.
  await hw('Select (palette)').click();
  assert.equal(await page.locator('.pk-shell').getAttribute('data-palette'),'slate');
  assert.equal(await page.evaluate(()=>localStorage.getItem('afr-pocket-palette')),'slate');
  // Pinball: the hardware buttons become the game's keys.
  await hw('Start (menu)').click();
  await page.locator('.pk-menu-item',{hasText:'canal cadet'}).click();
  await page.locator('.pk-app-pinball canvas').waitFor();
  const keys=[];await page.exposeFunction('logKey',k=>keys.push(k));
  await page.evaluate(()=>{addEventListener('keydown',e=>window.logKey(e.key));});
  await tap('A (select)');await tap('B (back)');
  assert.deepEqual(keys,['/','z']);
  await tap('Start (menu)');
  await page.locator('.pk-home').waitFor({state:'visible'});
  // Keyboard drives the same cursor.
  await page.keyboard.press('ArrowDown');
  assert.match(await focused(),/^profile/);
  assert.equal(await page.evaluate(()=>xpFrames),0);
  assert.deepEqual(errors,[]);
  console.log(`PASS ${engine.name()}: boot skip, D-pad cursor, A/B/START, music tabs, photo grid + viewer, writing, projects, keygen, palette, pinball keys, keyboard`);
}finally{await browser.close();}
