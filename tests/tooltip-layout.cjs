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
   const beforeTop = tip1.style.getPropertyValue('--tip-top');
   wrap1.style.top = '300px';
   window.DrillTooltips.repositionAll();
   const afterTop = tip1.style.getPropertyValue('--tip-top');
   const r1 = tip1.getBoundingClientRect(), r2 = tip2.getBoundingClientRect();
   const inViewport = r1.left >= 0 && r1.right <= window.innerWidth && r1.top >= 0 && r1.bottom <= window.innerHeight;
   const noOverlap = r1.right <= r2.left || r1.left >= r2.right || r1.bottom <= r2.top || r1.top >= r2.bottom;
   wrap1.remove();
   wrap2.remove();
   return { hasRepositionAll: typeof window.DrillTooltips.repositionAll === 'function', flippedBelow: topVal >= 220, beforeTop, afterTop, inViewport, noOverlap };
 });
 check(collisionResult.hasRepositionAll, true, 'DrillTooltips.repositionAll is exposed');
 check(collisionResult.flippedBelow, true, 'Collision avoidance flips second tooltip below overlapping first tooltip');
 check(collisionResult.afterTop !== collisionResult.beforeTop && collisionResult.inViewport && collisionResult.noOverlap, true, `repositionAll updates tooltip coordinates within viewport without overlap (${JSON.stringify(collisionResult)})`);

 // 7. Auto-tracking on content ResizeObserver (with non-loop convergence), scroll, viewport resize, and P8.2/D1.1 guide tooltips
 // 7.1 Content area (main) size change auto-repositions without manual repositionAll() and converges without loop
 check(await tabFocus(testPage, tipA), true, 'Focus Tip A for ResizeObserver tracking');
 const roTracking = await testPage.evaluate(async () => {
   const anchor = document.querySelector('#drill1 .drill-listen-btn.custom-tip-wrap');
   const tip = anchor.querySelector('.custom-tip-box');
   const mainEl = document.querySelector('main') || document.body;
   const beforeTop = parseFloat(tip.style.getPropertyValue('--tip-top'));
   let mutations = 0;
   const mo = new MutationObserver(() => { mutations++; });
   mo.observe(tip, { attributes: true, attributeFilter: ['style'] });
   mainEl.style.paddingTop = '80px';
   await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
   const afterTop = parseFloat(tip.style.getPropertyValue('--tip-top'));
   const mutationsAfterFirstPass = mutations;
   await new Promise(r => setTimeout(r, 80));
   const mutationsAfterSettle = mutations;
   const r = tip.getBoundingClientRect();
   const inViewport = r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight;
   mo.disconnect();
   mainEl.style.paddingTop = '';
   await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
   return { beforeTop, afterTop, inViewport, mutationsAfterFirstPass, mutationsAfterSettle };
 });
 check(roTracking.afterTop > roTracking.beforeTop && roTracking.inViewport, true, `ResizeObserver on main auto-repositions tooltip without manual repositionAll (${JSON.stringify(roTracking)})`);
 check(roTracking.mutationsAfterSettle === roTracking.mutationsAfterFirstPass && roTracking.mutationsAfterSettle <= 2, true, `ResizeObserver converges without re-trigger loop (${JSON.stringify(roTracking)})`);

 // 7.2 Scroll tracking while tooltip is active
 const scrollTracking = await testPage.evaluate(async () => {
   const anchor = document.querySelector('#drill1 .drill-listen-btn.custom-tip-wrap');
   const tip = anchor.querySelector('.custom-tip-box');
   window.scrollTo(0, 0);
   await new Promise(r => requestAnimationFrame(r));
   const beforeTop = parseFloat(tip.style.getPropertyValue('--tip-top'));
   window.scrollTo(0, 60);
   document.dispatchEvent(new Event('scroll'));
   await new Promise(r => requestAnimationFrame(r));
   const afterTop = parseFloat(tip.style.getPropertyValue('--tip-top'));
   window.scrollTo(0, 0);
   document.dispatchEvent(new Event('scroll'));
   await new Promise(r => requestAnimationFrame(r));
   return { beforeTop, afterTop };
 });
 check(scrollTracking.afterTop < scrollTracking.beforeTop, true, `Scroll repositions active tooltip to follow anchor (${JSON.stringify(scrollTracking)})`);

 // 7.3 Viewport resize tracking while tooltip is active
 const beforeResizeRect = await testPage.evaluate(() => {
   const tip = document.querySelector('#drill1 .drill-listen-btn.custom-tip-wrap .custom-tip-box');
   const r = tip.getBoundingClientRect();
   return { left: r.left, top: r.top };
 });
 await testPage.setViewportSize({ width: 700, height: 800 });
 const afterResizeCheck = await testPage.evaluate(() => {
   const tip = document.querySelector('#drill1 .drill-listen-btn.custom-tip-wrap .custom-tip-box');
   const r = tip.getBoundingClientRect();
   return { left: r.left, inViewport: r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight };
 });
 check(afterResizeCheck.left !== beforeResizeRect.left && afterResizeCheck.inViewport, true, 'Viewport resize repositions active tooltip within viewport');
 await testPage.setViewportSize({ width: 900, height: 1100 });
 await testPage.evaluate(() => document.activeElement?.blur());

 // 7.4 Guide tooltip tracking on P8.2 and D1.1 (scroll, viewport resize, and content area ResizeObserver)
 const p82GuideHost = testPage.locator('.practice82-page .p82-guide-tip-wrap').first();
 await p82GuideHost.click();
 const p82GuideTracking = await testPage.evaluate(async () => {
   const box = document.getElementById('p82RecognitionTipInline');
   const gridEl = document.querySelector('.p82-guide-top-grid');
   const mainEl = document.querySelector('main') || document.body;
   const top0 = parseFloat(box.style.top);
   window.scrollTo(0, 50);
   document.dispatchEvent(new Event('scroll'));
   await new Promise(r => requestAnimationFrame(r));
   const topScrolled = parseFloat(box.style.top);
   window.scrollTo(0, 0);
   document.dispatchEvent(new Event('scroll'));
   await new Promise(r => requestAnimationFrame(r));
   gridEl.style.marginTop = '50px';
   mainEl.style.paddingBottom = '60px';
   await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
   const topAfterRo = parseFloat(box.style.top);
   const r = box.getBoundingClientRect();
   gridEl.style.marginTop = '';
   mainEl.style.paddingBottom = '';
   await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
   return { visible: getComputedStyle(box).visibility === 'visible', top0, topScrolled, topAfterRo, inViewport: r.left >= 0 && r.right <= window.innerWidth };
 });
 check(p82GuideTracking.visible && p82GuideTracking.topScrolled < p82GuideTracking.top0 && p82GuideTracking.topAfterRo > p82GuideTracking.top0 && p82GuideTracking.inViewport, true, `P8.2 guide tooltip tracks scroll and ResizeObserver (${JSON.stringify(p82GuideTracking)})`);

 check(testPage.errors, [], 'practice8.2 tooltip escape tests no runtime errors');
 await testPage.close();

 const d11Page = await open(context, 'uebung1.1');
 await d11Page.setViewportSize({ width: 900, height: 900 });
 await d11Page.locator('#d11RecognitionTipTrigger').click();
 const d11GuideBefore = await d11Page.evaluate(() => {
   const box = document.getElementById('d11RecognitionTip');
   return { left: parseFloat(box.style.left), top: parseFloat(box.style.top), visible: getComputedStyle(box).visibility === 'visible' };
 });
 await d11Page.setViewportSize({ width: 680, height: 800 });
 const d11GuideAfter = await d11Page.evaluate(async () => {
   const box = document.getElementById('d11RecognitionTip');
   const leftResized = parseFloat(box.style.left);
   window.scrollTo(0, 40);
   document.dispatchEvent(new Event('scroll'));
   await new Promise(r => requestAnimationFrame(r));
   const topScrolled = parseFloat(box.style.top);
   const r = box.getBoundingClientRect();
   return { leftResized, topScrolled, inViewport: r.left >= 0 && r.right <= window.innerWidth };
 });
 check(d11GuideBefore.visible && d11GuideAfter.leftResized !== d11GuideBefore.left && d11GuideAfter.topScrolled < d11GuideBefore.top && d11GuideAfter.inViewport, true, 'D1.1 guide tooltip tracks viewport resize and scroll');
 check(d11Page.errors, [], 'uebung1.1 guide tooltip tracking no runtime errors');
 await d11Page.close();

 await browser.close();console.log('PASS tooltip layout',checks);
})().catch(e=>{console.error(e);process.exit(1)});
