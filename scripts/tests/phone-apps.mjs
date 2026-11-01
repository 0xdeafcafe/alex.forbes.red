import {chromium} from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.route('http://phone.test/**',async r=>{let p=new URL(r.request().url()).pathname;if(p.endsWith('/'))p+='index.html';await r.fulfill({path:process.cwd()+p});});
try{await page.goto('http://phone.test/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>/\d/.test(document.querySelector('.wp-status time').textContent));const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:690}]});for(const y of [665,630,590,550,510])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y}]});assert.ok(await page.locator('.wp-lock').evaluate(e=>e.getBoundingClientRect().top< -100));assert.equal(await page.locator('.wp-unlocked').evaluate(e=>getComputedStyle(e).visibility),'visible');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.locator('.wp-lock').waitFor({state:'detached'});await page.locator('.wp-creativity').click();await page.locator('.wp-app-keygen').waitFor({state:'visible'});assert.ok(await page.locator('.wp-app-keygen .keygen-art').isVisible());await page.locator('.wp-app-keygen select').selectOption('1');assert.equal(await page.locator('.wp-app-keygen .metro-project-detail h2').innerText(),'ceefax');await page.screenshot({path:process.env.TMPDIR+'/phone-keygen-final.png'});
await page.getByRole('button',{name:'Start',exact:true}).click();await page.locator('.wp-music').click();await page.locator('.wp-app-zune').waitFor({state:'visible'});assert.equal(await page.locator('.wp-shell').evaluate(e=>getComputedStyle(e).backgroundImage),'none');await page.screenshot({path:process.env.TMPDIR+'/phone-music-final.png'});
await page.getByRole('button',{name:'Start',exact:true}).click();await page.locator('.wp-projects').click();await page.locator('.wp-app-explorer').waitFor({state:'visible'});await page.getByRole('button',{name:'Search apps',exact:true}).click();await page.locator('.wp-app-list input').fill('keygen');await page.locator('.wp-app-list>button').click();await page.locator('.wp-app-keygen').waitFor({state:'visible'});
// Projects detail is a history entry: browser Back closes it, not the app.
await page.getByRole('button',{name:'Start',exact:true}).click();await page.locator('.wp-projects').click();await page.locator('.metro-project-list>button').first().waitFor();
await page.locator('.metro-project-list>button').first().click();await page.locator('.metro-project-page').waitFor();
assert.equal(await page.locator('.metro-project-page a').first().getAttribute('target'),'_blank');
await page.goBack();await page.locator('.metro-project-list').waitFor();assert.equal(await page.locator('.metro-project-page').count(),0);
assert.ok(await page.locator('.wp-app-explorer').isVisible());
// Tiles tilt towards the finger and the Start turnstile plays.
await page.getByRole('button',{name:'Start',exact:true}).click();await page.locator('.wp-music').waitFor();
await page.waitForTimeout(600);
assert.match(await page.locator('.wp-music').evaluate(e=>{const r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,isPrimary:true,clientX:r.right-6,clientY:r.top+6}));const t=e.style.transform;window.dispatchEvent(new PointerEvent('pointerup'));return t;}),/rotateY\((-?[1-9])/);
await page.waitForTimeout(400);
const spinning=page.evaluate(()=>new Promise(r=>{document.querySelector('.wp-people').click();requestAnimationFrame(()=>r(document.getAnimations().some(a=>String(a.effect?.getKeyframes?.()[1]?.transform).includes('rotateY'))));}));
assert.ok(await spinning,'turnstile animation runs');
// Deep links skip the lock screen.
await page.goto('http://phone.test/words/');await page.locator('.wp-app-word').waitFor({state:'visible'});assert.equal(await page.locator('.wp-lock').count(),0);
console.log('PASS real touch swipe, Keygen tile + app search + project selector, separate Projects, clean music background, project detail history, tilt, turnstile, deep link without lock');}finally{await browser.close();}
