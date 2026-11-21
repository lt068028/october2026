// Practice 7.3 fixed 130% preview and Practice 1.2 grammar emphasis.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),key='october2026.practice12.displaySize';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};
 async function open(context,name='practice1.2'){
  const page=await context.newPage();page.setDefaultTimeout(10000);page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.route('http://drill.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html'});
  });
  await page.goto('http://drill.test/'+name+'.html');return page;
 }

 const context=await browser.newContext();
 for(const name of ['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2']) {
  const p=await open(context,name);
  for(const width of [600,1440]) for(const theme of ['light','dark']) {
   await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
   await p.evaluate(()=>document.querySelector('#hintModeControl [data-value="hover"]')?.click());
   const anchors=p.locator('.custom-tip-wrap,.tooltip-wrap');
   const count=await anchors.count();
   for(const index of [...new Set([0,Math.floor(count/2),count-1])]) {
    const a=anchors.nth(index);await a.scrollIntoViewIfNeeded();
    await a.dispatchEvent('pointerover');
    const result=await a.evaluate(e=>{const tip=e.querySelector('.custom-tip-box,.tooltip-tip'),r=tip.getBoundingClientRect();return {font:getComputedStyle(tip).fontSize,kind:tip.classList.contains('tooltip-tip'),label:e.textContent,bounds:[r.left,r.right,r.top,r.bottom],fits:r.left>=11&&r.right<=innerWidth-11&&r.top>=11&&r.bottom<=innerHeight-11}});
    check(result.font,result.kind?'20px':'18px',name+' tooltip font');check(result.fits,true,name+' tooltip within viewport '+width+'/'+theme+' '+JSON.stringify(result));
   }
   if(await p.locator('.tooltip-wrap').count()) {
    const a=p.locator('.tooltip-wrap').first();await a.scrollIntoViewIfNeeded();await a.dispatchEvent('pointerover');
    check(await a.locator('.tooltip-tip').evaluate(e=>getComputedStyle(e).fontSize),'20px',name+' vocabulary hint 20px');
   }
  }
  const long=p.locator('.custom-tip-wrap').first();
  await long.scrollIntoViewIfNeeded();
  await long.locator('.custom-tip-box').evaluate(e=>e.textContent='Long explanation '.repeat(12)+'UnbrokenWord'.repeat(8));
  await long.dispatchEvent('pointerover');
  check(await long.locator('.custom-tip-box').evaluate(e=>{const r=e.getBoundingClientRect();return e.scrollWidth<=e.clientWidth+1&&r.width<=360&&r.left>=11&&r.right<=innerWidth-11&&r.height>30;}),true,name+' long explanation wraps');
  check(p.errors,[],name+' no runtime errors');await p.close();
 }

 // Generic infrastructure tests for DrillTooltips.enableEscapeDismiss
 const testPage = await open(context, 'practice8.2');
 await testPage.setViewportSize({width: 900, height: 900});

 await testPage.evaluate(() => {
   window.DrillTooltips.enableEscapeDismiss();
   window.DrillTooltips.enableEscapeDismiss();
 });
 check(await testPage.evaluate(() => window.DrillTooltips._escapeDismissInitialized), true, 'enableEscapeDismiss is idempotent');

 const tipA = testPage.locator('#drill1 .p82-concept-english').first();
 const tipB = testPage.locator('#drill1 .p82-model-translation').first();

 await tipA.hover();
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A visible on hover');
 await testPage.keyboard.press('Escape');
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'hidden' && e.getAttribute('data-tip-suppressed') === 'true'), true, 'Tip A hidden and suppressed on Escape');

 await testPage.waitForTimeout(50);
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'hidden'), true, 'Tip A stays suppressed while hovered');

 await tipB.hover();
 check(await tipB.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible' && !e.hasAttribute('data-tip-suppressed')), true, 'Tip B shows normally even after Tip A was dismissed on Escape');

 await testPage.mouse.move(0, 0);
 check(await tipA.evaluate(e => !e.hasAttribute('data-tip-suppressed')), true, 'Tip A data-tip-suppressed cleared on pointer leave');
 await tipA.hover();
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A re-revealed on new hover');
 await testPage.mouse.move(0, 0);

 await tipA.focus();
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A visible on focus');
 await testPage.keyboard.press('Escape');
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'hidden' && e.getAttribute('data-tip-suppressed') === 'true'), true, 'Tip A blurred and hidden on keyboard Escape');
 await testPage.evaluate(() => document.body.focus());
 check(await tipA.evaluate(e => !e.hasAttribute('data-tip-suppressed')), true, 'Tip A suppression cleared on focusout');

 await tipA.hover();
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A visible before voice dropdown check');
 await testPage.evaluate(() => {
   const btn = document.getElementById('voiceDropdownBtn');
   if (btn) btn.click();
 });
 const menuOpen = await testPage.evaluate(() => !document.getElementById('voiceDropdownMenu')?.hidden);
 if (menuOpen) {
   await testPage.keyboard.press('Escape');
   check(await testPage.evaluate(() => document.getElementById('voiceDropdownMenu')?.hidden), true, 'Voice dropdown closed by Escape');
 }
 await testPage.mouse.move(0, 0);

 await testPage.evaluate(() => {
   const host = document.createElement('div');
   host.className = 'custom-tip-wrap p82-autostop-open';
   const box = document.createElement('span');
   box.className = 'custom-tip-box';
   box.textContent = 'Auto-stop explanation';
   host.appendChild(box);
   document.body.appendChild(host);
   window.__testStatusHost = host;
 });
 check(await testPage.evaluate(() => window.DrillTooltips.isStatusIndicator(window.__testStatusHost)), true, 'isStatusIndicator correctly identifies p82-autostop-open');
 await testPage.keyboard.press('Escape');
 check(await testPage.evaluate(() => window.__testStatusHost.classList.contains('p82-autostop-open') && !window.__testStatusHost.hasAttribute('data-tip-suppressed')), true, 'Status indicator completely unaffected by Escape');
 await testPage.evaluate(() => window.__testStatusHost.remove());

 check(testPage.errors, [], 'practice8.2 tooltip escape tests no runtime errors');
 await testPage.close();

 await browser.close();console.log('PASS tooltip layout',checks);
})().catch(e=>{console.error(e);process.exit(1)});
