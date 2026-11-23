// Practice 7.3 fixed 130% preview and Practice 1.2 grammar emphasis.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),key='october2026.practice12.displaySize';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};
 async function tabFocus(page,host){
  const reached=await host.evaluate(el=>{
   const nodes=[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(n=>!n.disabled&&n.getAttribute('aria-hidden')!=='true'&&n.getClientRects().length);
   const index=nodes.indexOf(el);if(index<=0)return false;nodes[index-1].focus();return true;
  });
  if(!reached)throw new Error('No preceding focusable element for Tab test');
  await page.keyboard.press('Tab');
  return host.evaluate(el=>document.activeElement===el);
 }
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

 // Minimal tooltip baseline tests (Mouse Hover, Tab Focus, simple Escape, Touch button exclusion, P8.2 & D1.1)
 const testPage = await open(context, 'practice8.2');
 await testPage.setViewportSize({width: 900, height: 900});

 await testPage.evaluate(() => {
   window.DrillTooltips.enableEscapeDismiss();
   window.DrillTooltips.enableEscapeDismiss();
 });
 check(await testPage.evaluate(() => window.DrillTooltips._escapeDismissInitialized), true, 'enableEscapeDismiss is idempotent');

 // P8.2 duplicate translation tooltips and .p82-translation-open must not exist
 check(await testPage.evaluate(() => {
   const nodes = [...document.querySelectorAll('.p82-concept-english, .p82-model-translation')];
   return nodes.length > 0 && nodes.every(n => !n.classList.contains('custom-tip-wrap') && !n.querySelector('.custom-tip-box') && !n.hasAttribute('title'));
 }), true, 'P8.2 concept labels and model translations have no duplicate tooltip box or title attribute');

 const tipA = testPage.locator('#drill1 .drill-listen-btn.custom-tip-wrap').first();
 const tipB = testPage.locator('#drill1 .drill-record-btn.custom-tip-wrap').first();

 // 1. Mouse Hover is NOT closed or suppressed by Escape
 await tipA.hover();
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A visible on hover');
 await testPage.keyboard.press('Escape');
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible' && !e.hasAttribute('data-tip-suppressed')), true, 'Tip A stays visible and unsuppressed on Mouse Hover Escape');
 await testPage.mouse.move(0, 0);
 await testPage.evaluate(() => {
   document.querySelectorAll('.tooltip-wrap.tap-tip-open').forEach(e => e.classList.remove('tap-tip-open'));
 });
 check(await testPage.evaluate(() => document.querySelectorAll('.tooltip-wrap.tap-tip-open').length), 0, 'Section 3 closes open vocabulary tooltip before Section 4');

 // 2. Keyboard Tab Focus -> Escape closes tooltip without stealing focus -> stays suppressed while focused -> moving focus away clears suppression
 check(await tabFocus(testPage,tipA), true, 'Actual Tab moves focus to Tip A');
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A visible on keyboard Tab focus');
 await testPage.keyboard.press('Escape');
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'hidden' && e.getAttribute('data-tip-suppressed') === 'true' && document.activeElement === e), true, 'Tip A hidden on keyboard Escape while preserving element focus');
 check(await tabFocus(testPage,tipB), true, 'Actual Tab moves focus to Tip B');
 check(await tipA.evaluate(e => !e.hasAttribute('data-tip-suppressed')), true, 'Tip A suppression cleared when focus moves away');
 check(await tabFocus(testPage,tipA), true, 'Actual Tab returns focus to Tip A');
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A re-revealed on a new Tab focus');
 await testPage.evaluate(() => document.activeElement?.blur());
 check(await testPage.evaluate(() => document.activeElement === document.body), true, 'Focus cleared from Tip A before Touch tests');

 // 3. Touch behavior: vocabulary cue (.tooltip-wrap) works via tap, while control button tooltip (.custom-tip-wrap) stays hidden on touch but works on subsequent mouse hover / keyboard focus
 const vocabTip = testPage.locator('#drill1 .tooltip-wrap').first();
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 1, clientX: 10, clientY: 10 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 1, clientX: 10, clientY: 10 }));
 });
 check(await vocabTip.evaluate(e => e.classList.contains('tap-tip-open') && getComputedStyle(e.querySelector('.tooltip-tip')).visibility === 'visible'), true, 'Vocabulary cue tooltip opens on touch tap');
 await testPage.evaluate(() => { const v=document.querySelector('#drill1 .tooltip-wrap'); const target=v.querySelector('.target-word'); target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:3,clientX:10,clientY:10})); target.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:3,clientX:10,clientY:10})); });
 check(await vocabTip.evaluate(e => !e.classList.contains('tap-tip-open')), true, 'Retapping the same vocabulary cue tooltip closes it');
 await testPage.evaluate(() => { const v=document.querySelector('#drill1 .tooltip-wrap'); const target=v.querySelector('.target-word'); target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:4,clientX:10,clientY:10})); target.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:4,clientX:10,clientY:10})); });
 check(await vocabTip.evaluate(e => e.classList.contains('tap-tip-open')), true, 'A new valid tap reopens the vocabulary tooltip');

 // Control button tooltip is hidden while in touch input state
 check(await tipA.evaluate(e => {
   return document.documentElement.dataset.tooltipInput === 'touch' && getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'hidden';
 }), true, 'Control button tooltip is hidden during touch input mode');

 // Hybrid device recovery: mouse pointerover restores mouse hover on control button
 await testPage.evaluate(() => {
   const btn = document.querySelector('#drill1 .drill-listen-btn.custom-tip-wrap');
   btn.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
 });
 check(await testPage.evaluate(() => !document.documentElement.hasAttribute('data-tooltip-input')), true, 'Mouse pointerover clears touch input mode on hybrid devices');
 await tipA.hover();
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Control button tooltip works on mouse hover after touch');
 await testPage.mouse.move(0, 0);
 await testPage.evaluate(() => {
   document.querySelectorAll('.tooltip-wrap.tap-tip-open').forEach(e => e.classList.remove('tap-tip-open'));
 });
 check(await testPage.evaluate(() => document.querySelectorAll('.tooltip-wrap.tap-tip-open').length), 0, 'Section 3 closes open vocabulary tooltip before Section 4');

 // 4. Other UI priority: Voice Dropdown open -> Escape closes dropdown without closing open vocabulary tooltip
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 2, clientX: 10, clientY: 10 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 2, clientX: 10, clientY: 10 }));
   const menu = document.getElementById('voiceDropdownMenu');
   const btn = document.getElementById('voiceDropdownBtn');
   if (menu) menu.hidden = false;
   if (btn) btn.setAttribute('aria-expanded', 'true');
 });
 await testPage.keyboard.press('Escape');
 const afterEscape4 = await testPage.evaluate(() => {
   const menu = document.getElementById('voiceDropdownMenu');
   const v = document.querySelector('#drill1 .tooltip-wrap');
   return { menuHidden: Boolean(menu?.hidden), tipOpen: v.classList.contains('tap-tip-open'), suppressed: v.hasAttribute('data-tip-suppressed') };
 });
 check(afterEscape4.menuHidden, true, 'Escape closes Voice Dropdown');
 check(afterEscape4.tipOpen, true, 'Escape preserves open vocabulary tooltip');
 check(afterEscape4.suppressed, false, 'Escape does not set data-tip-suppressed on vocabulary tooltip');
 await testPage.keyboard.press('Escape');
 check(await vocabTip.evaluate(e => !e.classList.contains('tap-tip-open') && e.getAttribute('data-tip-suppressed') === 'true'), true, 'Subsequent Escape closes vocabulary tooltip');
 await testPage.evaluate(() => {
   document.querySelectorAll('[data-tip-suppressed]').forEach(e => e.removeAttribute('data-tip-suppressed'));
   document.documentElement.removeAttribute('data-tooltip-input');
 });

 // 5. Status indicator (.p82-autostop-open) is unaffected by Escape
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

 // 6. Collision avoidance & repositionAll
 await testPage.setViewportSize({ width: 900, height: 1100 });
 const collisionResult = await testPage.evaluate(() => {
   const wrap1 = document.createElement('span');
   wrap1.className = 'tooltip-wrap tap-tip-open';
   wrap1.style.cssText = 'position:fixed;left:200px;top:200px;width:40px;height:20px;';
   const tip1 = document.createElement('span');
   tip1.className = 'tooltip-tip';
   tip1.style.cssText = 'visibility:visible;position:fixed;left:150px;top:160px;width:120px;height:32px;';
   tip1.textContent = 'First tip';
   wrap1.appendChild(tip1);

   const wrap2 = document.createElement('span');
   wrap2.className = 'tooltip-wrap tap-tip-open';
   wrap2.style.cssText = 'position:fixed;left:200px;top:200px;width:40px;height:20px;';
   const tip2 = document.createElement('span');
   tip2.className = 'tooltip-tip';
   tip2.style.cssText = 'visibility:visible;position:fixed;width:120px;height:32px;';
   tip2.textContent = 'Second tip';
   wrap2.appendChild(tip2);

   document.body.append(wrap1, wrap2);
   window.DrillTooltips.position(wrap2);
   const topVal = parseFloat(tip2.style.getPropertyValue('--tip-top'));
   wrap1.style.top = '300px';
   window.DrillTooltips.repositionAll();
   const movedTop = parseFloat(tip1.style.getPropertyValue('--tip-top'));
   wrap1.remove();
   wrap2.remove();
   return { hasRepositionAll: typeof window.DrillTooltips.repositionAll === 'function', flippedBelow: topVal >= 220, movedTop };
 });
 check(collisionResult.hasRepositionAll, true, 'DrillTooltips.repositionAll is exposed');
 check(collisionResult.flippedBelow, true, 'Collision avoidance flips second tooltip below overlapping first tooltip');
 check(collisionResult.movedTop < 300, true, 'repositionAll updates tooltip coordinates after target move');

 check(testPage.errors, [], 'practice8.2 tooltip escape tests no runtime errors');
 await testPage.close();

 await browser.close();console.log('PASS tooltip layout',checks);
})().catch(e=>{console.error(e);process.exit(1)});
