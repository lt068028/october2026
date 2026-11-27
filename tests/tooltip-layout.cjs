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

 // Practice 2.1 Standalone STT Learning Guide (.stt-guide-standalone) checks (600px/1440px, Light/Dark, Hover, Tab Focus + Scroll/Resize + Escape)
 for (const scheme of ['light', 'dark']) {
   for (const vpWidth of [600, 1440]) {
     const p21Ctx = await browser.newContext({ viewport: { width: vpWidth, height: 900 }, colorScheme: scheme });
     const p21 = await p21Ctx.newPage();
     const p21Errors = [];
     p21.on('pageerror', e => p21Errors.push(e.message));
     p21.on('console', msg => { if (msg.type() === 'error') p21Errors.push(msg.text()); });
     await p21.goto(`http://127.0.0.1:${port}/practice2.1.html`, { waitUntil: 'networkidle' });
     const guideAudit = await p21.evaluate(() => {
       const wrap = document.querySelector('.stt-guide-standalone');
       const cards = document.querySelectorAll('.stt-guide-standalone .p82-guide-step-card');
       const step1Half = document.querySelector('.stt-guide-standalone .p82-guide-half-you');
       const goalHalf = document.querySelector('.stt-guide-standalone .p82-guide-goal-half');
       const miniBtn = document.querySelector('.stt-guide-standalone .p82-guide-mini-btn');
       const step1Bg = step1Half ? getComputedStyle(step1Half).backgroundColor : 'rgba(0, 0, 0, 0)';
       const goalBg = goalHalf ? getComputedStyle(goalHalf).backgroundColor : 'rgba(0, 0, 0, 0)';
       const miniCs = miniBtn ? getComputedStyle(miniBtn) : null;
       return {
         visible: Boolean(wrap && wrap.getBoundingClientRect().width > 0 && wrap.getBoundingClientRect().height > 0),
         stepCount: cards.length,
         surfaceDrawn: step1Bg !== 'rgba(0, 0, 0, 0)' && goalBg !== 'rgba(0, 0, 0, 0)',
         borderDrawn: Boolean(miniCs && miniCs.borderTopWidth === '1px' && miniCs.borderTopColor !== 'rgba(0, 0, 0, 0)'),
         recordToggleCount: document.querySelectorAll('#toggleRecordMode').length,
         playbackToggleCount: document.querySelectorAll('#togglePlaybackMode').length,
         topRightColCount: document.querySelectorAll('.p82-top-right-col').length,
         noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
       };
     });
     check(guideAudit, {
       visible: true,
       stepCount: 4,
       surfaceDrawn: true,
       borderDrawn: true,
       recordToggleCount: 1,
       playbackToggleCount: 1,
       topRightColCount: 0,
       noOverflow: true,
     }, `practice2.1.html (${scheme}/${vpWidth}px) standalone 4-step guide surface/border, 1 toggle pair, no overflow`);

     if (scheme === 'light' && vpWidth === 1440) {
       // 1. Independent Mouse Hover check
       const tipBtn = p21.locator('.stt-guide-standalone .p82-guide-tip-wrap').first();
       await tipBtn.hover();
       await p21.waitForTimeout(80);
       const hoverAudit = await p21.evaluate(() => {
         const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
         const b = document.getElementById('p82RecognitionTipInline');
         if (!host || !b) return null;
         const hr = host.getBoundingClientRect();
         const r = b.getBoundingClientRect();
         const cs = getComputedStyle(b);
         const dynamicCoords = /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top);
         const nearAnchor = Math.abs(r.top - hr.bottom - 8) <= 2 || Math.abs(hr.top - r.bottom - 8) <= 2;
         const inVp = r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12;
         return { visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0, dynamicCoords, nearAnchor, inVp };
       });
       check(hoverAudit, { visible: true, dynamicCoords: true, nearAnchor: true, inVp: true }, 'practice2.1.html Step 3 tooltip opens on hover with dynamic coordinates near anchor within viewport');
       await p21.mouse.move(0, 0);
       await p21.waitForTimeout(50);

       // 2. Real Tab key focus -> Scroll & Viewport Resize tracking while focused -> Escape dismissal
       await p21.keyboard.press('Tab');
       let focusedGuide = false;
       for (let k = 0; k < 25; k++) {
         focusedGuide = await p21.evaluate(() => document.activeElement?.classList?.contains('p82-guide-tip-wrap') || false);
         if (focusedGuide) break;
         await p21.keyboard.press('Tab');
       }
       await p21.waitForTimeout(80);
       const tabBefore = await p21.evaluate(() => {
         const b = document.getElementById('p82RecognitionTipInline');
         const r = b ? b.getBoundingClientRect() : null;
         const cs = b ? getComputedStyle(b) : null;
         return b && r && cs ? {
           visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0,
           dynamicCoords: /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top),
           left: parseFloat(b.style.left),
           top: parseFloat(b.style.top),
           inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
         } : null;
       });
       check(Boolean(focusedGuide && tabBefore?.visible && tabBefore?.dynamicCoords && tabBefore?.inVp), true, 'practice2.1.html Step 3 tooltip opens via real Tab focus with dynamic coordinates within viewport');

       // Scroll & Viewport Resize while holding Tab focus
       await p21.evaluate(() => window.scrollBy(0, 40));
       await p21.setViewportSize({ width: 600, height: 900 });
       await p21.waitForTimeout(100);
       const tabAfterMove = await p21.evaluate(() => {
         const b = document.getElementById('p82RecognitionTipInline');
         const r = b ? b.getBoundingClientRect() : null;
         const cs = b ? getComputedStyle(b) : null;
         return b && r && cs ? {
           visible: cs.visibility === 'visible' && cs.opacity === '1',
           left: parseFloat(b.style.left),
           top: parseFloat(b.style.top),
           inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
         } : null;
       });
       check(Boolean(tabAfterMove?.visible && tabAfterMove?.inVp && (tabAfterMove.left !== tabBefore.left || tabAfterMove.top !== tabBefore.top)), true, 'practice2.1.html Step 3 tooltip stays visible, updates coordinates, and stays within viewport on scroll/resize while Tab-focused');

       // Escape key dismissal while Tab-focused
       await p21.keyboard.press('Escape');
       await p21.waitForTimeout(60);
       const afterEsc = await p21.evaluate(() => {
         const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
         const b = document.getElementById('p82RecognitionTipInline');
         return {
           suppressed: host?.getAttribute('data-guide-tip-suppressed') === 'true',
           hidden: b ? getComputedStyle(b).visibility === 'hidden' : false,
         };
       });
       check(afterEsc, { suppressed: true, hidden: true }, 'practice2.1.html Step 3 tooltip closes on Escape while Tab-focused');
     }
     check(p21Errors, [], `practice2.1.html (${scheme}/${vpWidth}px) no pageerror or console.error`);
     await p21Ctx.close();
   }
 }

 // Practice 2.2 & 2.3 Standalone STT Learning Guide (.stt-guide-standalone) individual checks
 for (const pageFile of ['practice2.2.html', 'practice2.3.html']) {
   for (const scheme of ['light', 'dark']) {
     for (const vpWidth of [600, 1440]) {
       const pCtx = await browser.newContext({ viewport: { width: vpWidth, height: 900 }, colorScheme: scheme });
       const pPage = await pCtx.newPage();
       const pErrors = [];
       pPage.on('pageerror', e => pErrors.push(e.message));
       pPage.on('console', msg => { if (msg.type() === 'error') pErrors.push(msg.text()); });
       await pPage.goto(`http://127.0.0.1:${port}/${pageFile}`, { waitUntil: 'networkidle' });
       const guideAudit = await pPage.evaluate(() => {
         const wrap = document.querySelector('.stt-guide-standalone');
         const drill1 = document.getElementById('drill1Container');
         const cards = document.querySelectorAll('.stt-guide-standalone .p82-guide-step-card');
         const step1Half = document.querySelector('.stt-guide-standalone .p82-guide-half-you');
         const goalHalf = document.querySelector('.stt-guide-standalone .p82-guide-goal-half');
         const miniBtn = document.querySelector('.stt-guide-standalone .p82-guide-mini-btn');
         const step1Bg = step1Half ? getComputedStyle(step1Half).backgroundColor : 'rgba(0, 0, 0, 0)';
         const goalBg = goalHalf ? getComputedStyle(goalHalf).backgroundColor : 'rgba(0, 0, 0, 0)';
         const miniCs = miniBtn ? getComputedStyle(miniBtn) : null;
         const recToggle = document.getElementById('toggleRecordMode');
         const playToggle = document.getElementById('togglePlaybackMode');
         const guideRect = wrap ? wrap.getBoundingClientRect() : null;
         const drillRect = drill1 ? drill1.getBoundingClientRect() : null;
         const drillGap = guideRect && drillRect ? drillRect.top - guideRect.bottom : -1;
         return {
           visible: Boolean(guideRect && guideRect.width > 0 && guideRect.height > 0),
           stepCount: cards.length,
           surfaceDrawn: step1Bg !== 'rgba(0, 0, 0, 0)' && goalBg !== 'rgba(0, 0, 0, 0)',
           borderDrawn: Boolean(miniCs && miniCs.borderTopWidth === '1px' && miniCs.borderTopColor !== 'rgba(0, 0, 0, 0)'),
           drillGapOk: drillGap >= 28,
           recordToggleCount: document.querySelectorAll('#toggleRecordMode').length,
           playbackToggleCount: document.querySelectorAll('#togglePlaybackMode').length,
           topRightColCount: document.querySelectorAll('.p82-top-right-col').length,
           togglesInSettings: Boolean(
             recToggle &&
             playToggle &&
             recToggle.closest('.compact-settings') &&
             recToggle.closest('.settings-auto-row') &&
             !recToggle.closest('.stt-guide-standalone') &&
             playToggle.closest('.compact-settings') &&
             playToggle.closest('.settings-auto-row') &&
             !playToggle.closest('.stt-guide-standalone')
           ),
           noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
         };
       });
       check(guideAudit, {
         visible: true,
         stepCount: 4,
         surfaceDrawn: true,
         borderDrawn: true,
         drillGapOk: true,
         recordToggleCount: 1,
         playbackToggleCount: 1,
         topRightColCount: 0,
         togglesInSettings: true,
         noOverflow: true,
       }, `${pageFile} (${scheme}/${vpWidth}px) standalone 4-step guide surface/border, >=28px drill gap, toggles in .compact-settings/.settings-auto-row, no overflow`);

       if (scheme === 'light' && vpWidth === 1440) {
         // 1. Independent Mouse Hover check
         const tipBtn = pPage.locator('.stt-guide-standalone .p82-guide-tip-wrap').first();
         await tipBtn.hover();
         await pPage.waitForTimeout(80);
         const hoverAudit = await pPage.evaluate(() => {
           const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
           const b = document.getElementById('p82RecognitionTipInline');
           if (!host || !b) return null;
           const hr = host.getBoundingClientRect();
           const r = b.getBoundingClientRect();
           const cs = getComputedStyle(b);
           const dynamicCoords = /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top);
           const nearAnchor = Math.abs(r.top - hr.bottom - 8) <= 2 || Math.abs(hr.top - r.bottom - 8) <= 2;
           const inVp = r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12;
           return { visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0, dynamicCoords, nearAnchor, inVp };
         });
         check(hoverAudit, { visible: true, dynamicCoords: true, nearAnchor: true, inVp: true }, `${pageFile} Step 3 tooltip opens on hover with dynamic coordinates near anchor within viewport`);
         await pPage.mouse.move(0, 0);
         await pPage.waitForTimeout(50);

         // 2. Real Tab key focus -> Scroll & Viewport Resize tracking while focused -> Escape dismissal
         await pPage.keyboard.press('Tab');
         let focusedGuide = false;
         for (let k = 0; k < 25; k++) {
           focusedGuide = await pPage.evaluate(() => Boolean(document.activeElement?.matches?.('.stt-guide-standalone .p82-guide-tip-wrap')));
           if (focusedGuide) break;
           await pPage.keyboard.press('Tab');
         }
         await pPage.waitForTimeout(80);
         const tabBefore = await pPage.evaluate(() => {
           const b = document.getElementById('p82RecognitionTipInline');
           const r = b ? b.getBoundingClientRect() : null;
           const cs = b ? getComputedStyle(b) : null;
           return b && r && cs ? {
             visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0,
             dynamicCoords: /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top),
             left: parseFloat(b.style.left),
             top: parseFloat(b.style.top),
             inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
           } : null;
         });
         check(Boolean(focusedGuide && tabBefore?.visible && tabBefore?.dynamicCoords && tabBefore?.inVp), true, `${pageFile} Step 3 tooltip opens via real Tab focus with dynamic coordinates within viewport`);

         // Scroll & Viewport Resize while holding Tab focus
         await pPage.evaluate(() => window.scrollBy(0, 40));
         await pPage.setViewportSize({ width: 600, height: 900 });
         await pPage.waitForTimeout(100);
         const tabAfterMove = await pPage.evaluate(() => {
           const b = document.getElementById('p82RecognitionTipInline');
           const r = b ? b.getBoundingClientRect() : null;
           const cs = b ? getComputedStyle(b) : null;
           return b && r && cs ? {
             visible: cs.visibility === 'visible' && cs.opacity === '1',
             left: parseFloat(b.style.left),
             top: parseFloat(b.style.top),
             inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
           } : null;
         });
         check(Boolean(tabAfterMove?.visible && tabAfterMove?.inVp && (tabAfterMove.left !== tabBefore.left || tabAfterMove.top !== tabBefore.top)), true, `${pageFile} Step 3 tooltip stays visible, updates coordinates, and stays within viewport on scroll/resize while Tab-focused`);

         // Escape key dismissal while Tab-focused
         await pPage.keyboard.press('Escape');
         await pPage.waitForTimeout(60);
         const afterEsc = await pPage.evaluate(() => {
           const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
           const b = document.getElementById('p82RecognitionTipInline');
           return {
             suppressed: host?.getAttribute('data-guide-tip-suppressed') === 'true',
             hidden: b ? getComputedStyle(b).visibility === 'hidden' : false,
           };
         });
         check(afterEsc, { suppressed: true, hidden: true }, `${pageFile} Step 3 tooltip closes on Escape while Tab-focused`);
       }
       check(pErrors, [], `${pageFile} (${scheme}/${vpWidth}px) no pageerror or console.error`);
       await pCtx.close();
     }
   }
 }

 // Practice 1.1 Standalone STT Learning Guide (.stt-guide-standalone) checks
 for (const scheme of ['light', 'dark']) {
   for (const vpWidth of [600, 1440]) {
     const p11Ctx = await browser.newContext({ viewport: { width: vpWidth, height: 900 }, colorScheme: scheme });
     const p11 = await p11Ctx.newPage();
     const p11Errors = [];
     p11.on('pageerror', e => p11Errors.push(e.message));
     p11.on('console', msg => { if (msg.type() === 'error') p11Errors.push(msg.text()); });
     await p11.goto(`http://127.0.0.1:${port}/practice1.1.html`, { waitUntil: 'networkidle' });
     const guideAudit = await p11.evaluate(() => {
       const wrap = document.querySelector('.stt-guide-standalone');
       const exampleContainer = document.getElementById('exampleSectionContainer');
       const exampleBox = document.querySelector('#exampleSectionContainer > .example-box');
       const cards = document.querySelectorAll('.stt-guide-standalone .p82-guide-step-card');
       const step1Half = document.querySelector('.stt-guide-standalone .p82-guide-half-you');
       const goalHalf = document.querySelector('.stt-guide-standalone .p82-guide-goal-half');
       const miniBtn = document.querySelector('.stt-guide-standalone .p82-guide-mini-btn');
       const step1Bg = step1Half ? getComputedStyle(step1Half).backgroundColor : 'rgba(0, 0, 0, 0)';
       const goalBg = goalHalf ? getComputedStyle(goalHalf).backgroundColor : 'rgba(0, 0, 0, 0)';
       const miniCs = miniBtn ? getComputedStyle(miniBtn) : null;
       const recToggle = document.getElementById('toggleRecordMode');
       const playToggle = document.getElementById('togglePlaybackMode');
       const guideRect = wrap ? wrap.getBoundingClientRect() : null;
       const exContainerRect = exampleContainer ? exampleContainer.getBoundingClientRect() : null;
       const exBoxRect = exampleBox ? exampleBox.getBoundingClientRect() : null;
       const containerGap = guideRect && exContainerRect ? exContainerRect.top - guideRect.bottom : -1;
       const boxGap = guideRect && exBoxRect ? exBoxRect.top - guideRect.bottom : -1;
       return {
         visible: Boolean(guideRect && guideRect.width > 0 && guideRect.height > 0),
         stepCount: cards.length,
         surfaceDrawn: step1Bg !== 'rgba(0, 0, 0, 0)' && goalBg !== 'rgba(0, 0, 0, 0)',
         borderDrawn: Boolean(miniCs && miniCs.borderTopWidth === '1px' && miniCs.borderTopColor !== 'rgba(0, 0, 0, 0)'),
         exampleGapOk: containerGap >= 28 && boxGap >= 28,
         recordToggleCount: document.querySelectorAll('#toggleRecordMode').length,
         playbackToggleCount: document.querySelectorAll('#togglePlaybackMode').length,
         topRightColCount: document.querySelectorAll('.p82-top-right-col').length,
         togglesInSettings: Boolean(
           recToggle &&
           playToggle &&
           recToggle.closest('.compact-settings') &&
           recToggle.closest('.settings-auto-row') &&
           !recToggle.closest('.stt-guide-standalone') &&
           playToggle.closest('.compact-settings') &&
           playToggle.closest('.settings-auto-row') &&
           !playToggle.closest('.stt-guide-standalone')
         ),
         noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
       };
     });
     check(guideAudit, {
       visible: true,
       stepCount: 4,
       surfaceDrawn: true,
       borderDrawn: true,
       exampleGapOk: true,
       recordToggleCount: 1,
       playbackToggleCount: 1,
       topRightColCount: 0,
       togglesInSettings: true,
       noOverflow: true,
     }, `practice1.1.html (${scheme}/${vpWidth}px) standalone 4-step guide surface/border, >=28px example gap, toggles in .compact-settings/.settings-auto-row, no overflow`);

     if (scheme === 'light' && vpWidth === 1440) {
       // 1. Independent Mouse Hover check
       const tipBtn = p11.locator('.stt-guide-standalone .p82-guide-tip-wrap').first();
       await tipBtn.hover();
       await p11.waitForTimeout(80);
       const hoverAudit = await p11.evaluate(() => {
         const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
         const b = document.getElementById('p82RecognitionTipInline');
         if (!host || !b) return null;
         const hr = host.getBoundingClientRect();
         const r = b.getBoundingClientRect();
         const cs = getComputedStyle(b);
         const dynamicCoords = /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top);
         const nearAnchor = Math.abs(r.top - hr.bottom - 8) <= 2 || Math.abs(hr.top - r.bottom - 8) <= 2;
         const inVp = r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12;
         return { visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0, dynamicCoords, nearAnchor, inVp };
       });
       check(hoverAudit, { visible: true, dynamicCoords: true, nearAnchor: true, inVp: true }, 'practice1.1.html Step 3 tooltip opens on hover with dynamic coordinates near anchor within viewport');
       await p11.mouse.move(0, 0);
       await p11.waitForTimeout(50);

       // 2. Real Tab key focus -> Scroll & Viewport Resize tracking while focused -> Escape dismissal
       await p11.keyboard.press('Tab');
       let focusedGuide = false;
       for (let k = 0; k < 25; k++) {
         focusedGuide = await p11.evaluate(() => Boolean(document.activeElement?.matches?.('.stt-guide-standalone .p82-guide-tip-wrap')));
         if (focusedGuide) break;
         await p11.keyboard.press('Tab');
       }
       await p11.waitForTimeout(80);
       const tabBefore = await p11.evaluate(() => {
         const b = document.getElementById('p82RecognitionTipInline');
         const r = b ? b.getBoundingClientRect() : null;
         const cs = b ? getComputedStyle(b) : null;
         return b && r && cs ? {
           visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0,
           dynamicCoords: /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top),
           left: parseFloat(b.style.left),
           top: parseFloat(b.style.top),
           inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
         } : null;
       });
       check(Boolean(focusedGuide && tabBefore?.visible && tabBefore?.dynamicCoords && tabBefore?.inVp), true, 'practice1.1.html Step 3 tooltip opens via real Tab focus with dynamic coordinates within viewport');

       // Scroll & Viewport Resize while holding Tab focus
       await p11.evaluate(() => window.scrollBy(0, 40));
       await p11.setViewportSize({ width: 600, height: 900 });
       await p11.waitForTimeout(100);
       const tabAfterMove = await p11.evaluate(() => {
         const b = document.getElementById('p82RecognitionTipInline');
         const r = b ? b.getBoundingClientRect() : null;
         const cs = b ? getComputedStyle(b) : null;
         return b && r && cs ? {
           visible: cs.visibility === 'visible' && cs.opacity === '1',
           left: parseFloat(b.style.left),
           top: parseFloat(b.style.top),
           inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
         } : null;
       });
       check(Boolean(tabAfterMove?.visible && tabAfterMove?.inVp && (tabAfterMove.left !== tabBefore.left || tabAfterMove.top !== tabBefore.top)), true, 'practice1.1.html Step 3 tooltip stays visible, updates coordinates, and stays within viewport on scroll/resize while Tab-focused');

       // Escape key dismissal while Tab-focused
       await p11.keyboard.press('Escape');
       await p11.waitForTimeout(60);
       const afterEsc = await p11.evaluate(() => {
         const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
         const b = document.getElementById('p82RecognitionTipInline');
         return {
           suppressed: host?.getAttribute('data-guide-tip-suppressed') === 'true',
           hidden: b ? getComputedStyle(b).visibility === 'hidden' : false,
         };
       });
       check(afterEsc, { suppressed: true, hidden: true }, 'practice1.1.html Step 3 tooltip closes on Escape while Tab-focused');
     }
     check(p11Errors, [], `practice1.1.html (${scheme}/${vpWidth}px) no pageerror or console.error`);
     await p11Ctx.close();
   }
 }

 // Practice 1.2 Standalone STT Learning Guide (.stt-guide-standalone) checks
 for (const scheme of ['light', 'dark']) {
   for (const vpWidth of [600, 1440]) {
     const p12Ctx = await browser.newContext({ viewport: { width: vpWidth, height: 900 }, colorScheme: scheme });
     const p12 = await p12Ctx.newPage();
     const p12Errors = [];
     p12.on('pageerror', e => p12Errors.push(e.message));
     p12.on('console', msg => { if (msg.type() === 'error') p12Errors.push(msg.text()); });
     await p12.goto(`http://127.0.0.1:${port}/practice1.2.html`, { waitUntil: 'networkidle' });
     const guideAudit = await p12.evaluate(() => {
       const wrap = document.querySelector('.stt-guide-standalone');
       const drill1 = document.getElementById('drill1Container');
       const exampleBox = document.querySelector('#drill1Container > .example-box');
       const cards = document.querySelectorAll('.stt-guide-standalone .p82-guide-step-card');
       const step1Half = document.querySelector('.stt-guide-standalone .p82-guide-half-you');
       const goalHalf = document.querySelector('.stt-guide-standalone .p82-guide-goal-half');
       const miniBtn = document.querySelector('.stt-guide-standalone .p82-guide-mini-btn');
       const step1Bg = step1Half ? getComputedStyle(step1Half).backgroundColor : 'rgba(0, 0, 0, 0)';
       const goalBg = goalHalf ? getComputedStyle(goalHalf).backgroundColor : 'rgba(0, 0, 0, 0)';
       const miniCs = miniBtn ? getComputedStyle(miniBtn) : null;
       const recToggle = document.getElementById('toggleRecordMode');
       const playToggle = document.getElementById('togglePlaybackMode');
       const guideRect = wrap ? wrap.getBoundingClientRect() : null;
       const drillRect = drill1 ? drill1.getBoundingClientRect() : null;
       const exBoxRect = exampleBox ? exampleBox.getBoundingClientRect() : null;
       const drillGap = guideRect && drillRect ? drillRect.top - guideRect.bottom : -1;
       const boxGap = guideRect && exBoxRect ? exBoxRect.top - guideRect.bottom : -1;
       return {
         visible: Boolean(guideRect && guideRect.width > 0 && guideRect.height > 0),
         stepCount: cards.length,
         surfaceDrawn: step1Bg !== 'rgba(0, 0, 0, 0)' && goalBg !== 'rgba(0, 0, 0, 0)',
         borderDrawn: Boolean(miniCs && miniCs.borderTopWidth === '1px' && miniCs.borderTopColor !== 'rgba(0, 0, 0, 0)'),
         drillGapOk: drillGap >= 28 && boxGap >= 28,
         recordToggleCount: document.querySelectorAll('#toggleRecordMode').length,
         playbackToggleCount: document.querySelectorAll('#togglePlaybackMode').length,
         topRightColCount: document.querySelectorAll('.p82-top-right-col').length,
         togglesInSettings: Boolean(
           recToggle &&
           playToggle &&
           recToggle.closest('.compact-settings') &&
           recToggle.closest('.settings-auto-row') &&
           !recToggle.closest('.stt-guide-standalone') &&
           playToggle.closest('.compact-settings') &&
           playToggle.closest('.settings-auto-row') &&
           !playToggle.closest('.stt-guide-standalone')
         ),
         noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
       };
     });
     check(guideAudit, {
       visible: true,
       stepCount: 4,
       surfaceDrawn: true,
       borderDrawn: true,
       drillGapOk: true,
       recordToggleCount: 1,
       playbackToggleCount: 1,
       topRightColCount: 0,
       togglesInSettings: true,
       noOverflow: true,
     }, `practice1.2.html (${scheme}/${vpWidth}px) standalone 4-step guide surface/border, >=28px drill gap, toggles in .compact-settings/.settings-auto-row, no overflow`);

     if (scheme === 'light' && vpWidth === 1440) {
       // 1. Independent Mouse Hover check
       const tipBtn = p12.locator('.stt-guide-standalone .p82-guide-tip-wrap').first();
       await tipBtn.hover();
       await p12.waitForTimeout(80);
       const hoverAudit = await p12.evaluate(() => {
         const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
         const b = document.getElementById('p82RecognitionTipInline');
         if (!host || !b) return null;
         const hr = host.getBoundingClientRect();
         const r = b.getBoundingClientRect();
         const cs = getComputedStyle(b);
         const dynamicCoords = /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top);
         const nearAnchor = Math.abs(r.top - hr.bottom - 8) <= 2 || Math.abs(hr.top - r.bottom - 8) <= 2;
         const inVp = r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12;
         return { visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0, dynamicCoords, nearAnchor, inVp };
       });
       check(hoverAudit, { visible: true, dynamicCoords: true, nearAnchor: true, inVp: true }, 'practice1.2.html Step 3 tooltip opens on hover with dynamic coordinates near anchor within viewport');
       await p12.mouse.move(0, 0);
       await p12.waitForTimeout(50);

       // 2. Real Tab key focus -> Scroll & Viewport Resize tracking while focused -> Escape dismissal
       await p12.keyboard.press('Tab');
       let focusedGuide = false;
       for (let k = 0; k < 25; k++) {
         focusedGuide = await p12.evaluate(() => Boolean(document.activeElement?.matches?.('.stt-guide-standalone .p82-guide-tip-wrap')));
         if (focusedGuide) break;
         await p12.keyboard.press('Tab');
       }
       await p12.waitForTimeout(80);
       const tabBefore = await p12.evaluate(() => {
         const b = document.getElementById('p82RecognitionTipInline');
         const r = b ? b.getBoundingClientRect() : null;
         const cs = b ? getComputedStyle(b) : null;
         return b && r && cs ? {
           visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0,
           dynamicCoords: /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top),
           left: parseFloat(b.style.left),
           top: parseFloat(b.style.top),
           inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
         } : null;
       });
       check(Boolean(focusedGuide && tabBefore?.visible && tabBefore?.dynamicCoords && tabBefore?.inVp), true, 'practice1.2.html Step 3 tooltip opens via real Tab focus with dynamic coordinates within viewport');

       // Scroll & Viewport Resize while holding Tab focus
       await p12.evaluate(() => window.scrollBy(0, 40));
       await p12.setViewportSize({ width: 600, height: 900 });
       await p12.waitForTimeout(100);
       const tabAfterMove = await p12.evaluate(() => {
         const b = document.getElementById('p82RecognitionTipInline');
         const r = b ? b.getBoundingClientRect() : null;
         const cs = b ? getComputedStyle(b) : null;
         return b && r && cs ? {
           visible: cs.visibility === 'visible' && cs.opacity === '1',
           left: parseFloat(b.style.left),
           top: parseFloat(b.style.top),
           inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
         } : null;
       });
       check(Boolean(tabAfterMove?.visible && tabAfterMove?.inVp && (tabAfterMove.left !== tabBefore.left || tabAfterMove.top !== tabBefore.top)), true, 'practice1.2.html Step 3 tooltip stays visible, updates coordinates, and stays within viewport on scroll/resize while Tab-focused');

       // Escape key dismissal while Tab-focused
       await p12.keyboard.press('Escape');
       await p12.waitForTimeout(60);
       const afterEsc = await p12.evaluate(() => {
         const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
         const b = document.getElementById('p82RecognitionTipInline');
         return {
           suppressed: host?.getAttribute('data-guide-tip-suppressed') === 'true',
           hidden: b ? getComputedStyle(b).visibility === 'hidden' : false,
         };
       });
       check(afterEsc, { suppressed: true, hidden: true }, 'practice1.2.html Step 3 tooltip closes on Escape while Tab-focused');
     }
     check(p12Errors, [], `practice1.2.html (${scheme}/${vpWidth}px) no pageerror or console.error`);
     await p12Ctx.close();
   }
 }

 // Practice 7.1 / 7.2 / 7.3 standalone 4-step STT learning guide verification
 for (const pageFile of ['practice7.1.html', 'practice7.2.html', 'practice7.3.html']) {
   for (const scheme of ['light', 'dark']) {
     for (const vpWidth of [600, 1440]) {
       const p7Ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: vpWidth, height: 900 } });
       const p7 = await p7Ctx.newPage();
       const p7Errors = [];
       p7.on('pageerror', e => p7Errors.push(e.message));
       p7.on('console', msg => {
         if (msg.type() === 'error') p7Errors.push(msg.text());
       });
       await p7.goto(base + '/' + pageFile, { waitUntil: 'load' });
       await p7.waitForSelector('.stt-guide-standalone .p82-guide-step-card');

       const guideAudit = await p7.evaluate(() => {
         const wrap = document.querySelector('.stt-guide-standalone');
         const drill1 = document.getElementById('drill1Container');
         const exampleBox = document.querySelector('#drill1Container > .example-box');
         const cards = document.querySelectorAll('.stt-guide-standalone .p82-guide-step-card');
         const step1Half = document.querySelector('.stt-guide-standalone .p82-guide-half-you');
         const goalHalf = document.querySelector('.stt-guide-standalone .p82-guide-goal-half');
         const miniBtn = document.querySelector('.stt-guide-standalone .p82-guide-mini-btn');
         const step1Bg = step1Half ? getComputedStyle(step1Half).backgroundColor : 'rgba(0, 0, 0, 0)';
         const goalBg = goalHalf ? getComputedStyle(goalHalf).backgroundColor : 'rgba(0, 0, 0, 0)';
         const miniCs = miniBtn ? getComputedStyle(miniBtn) : null;
         const recToggle = document.getElementById('toggleRecordMode');
         const playToggle = document.getElementById('togglePlaybackMode');
         const guideRect = wrap ? wrap.getBoundingClientRect() : null;
         const drillRect = drill1 ? drill1.getBoundingClientRect() : null;
         const exBoxRect = exampleBox ? exampleBox.getBoundingClientRect() : null;
         const drillGap = guideRect && drillRect ? drillRect.top - guideRect.bottom : -1;
         const boxGap = guideRect && exBoxRect ? exBoxRect.top - guideRect.bottom : -1;
         return {
           visible: Boolean(guideRect && guideRect.width > 0 && guideRect.height > 0),
           stepCount: cards.length,
           surfaceDrawn: step1Bg !== 'rgba(0, 0, 0, 0)' && goalBg !== 'rgba(0, 0, 0, 0)',
           borderDrawn: Boolean(miniCs && miniCs.borderTopWidth === '1px' && miniCs.borderTopColor !== 'rgba(0, 0, 0, 0)'),
           drillGapOk: drillGap >= 28 && boxGap >= 28,
           recordToggleCount: document.querySelectorAll('#toggleRecordMode').length,
           playbackToggleCount: document.querySelectorAll('#togglePlaybackMode').length,
           topRightColCount: document.querySelectorAll('.p82-top-right-col').length,
           togglesInSettings: Boolean(
             recToggle &&
             playToggle &&
             recToggle.closest('.compact-settings') &&
             recToggle.closest('.settings-auto-row') &&
             !recToggle.closest('.stt-guide-standalone') &&
             playToggle.closest('.compact-settings') &&
             playToggle.closest('.settings-auto-row') &&
             !playToggle.closest('.stt-guide-standalone')
           ),
           noOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
         };
       });
       check(guideAudit, {
         visible: true,
         stepCount: 4,
         surfaceDrawn: true,
         borderDrawn: true,
         drillGapOk: true,
         recordToggleCount: 1,
         playbackToggleCount: 1,
         topRightColCount: 0,
         togglesInSettings: true,
         noOverflow: true,
       }, `${pageFile} (${scheme}/${vpWidth}px) standalone 4-step guide surface/border, >=28px drill gap, toggles in .compact-settings/.settings-auto-row, no overflow`);

       if (scheme === 'light' && vpWidth === 1440) {
         // 1. Independent Mouse Hover check
         const tipBtn = p7.locator('.stt-guide-standalone .p82-guide-tip-wrap').first();
         await tipBtn.hover();
         await p7.waitForTimeout(80);
         const hoverAudit = await p7.evaluate(() => {
           const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
           const b = document.getElementById('p82RecognitionTipInline');
           if (!host || !b) return null;
           const hr = host.getBoundingClientRect();
           const r = b.getBoundingClientRect();
           const cs = getComputedStyle(b);
           const dynamicCoords = /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top);
           const nearAnchor = Math.abs(r.top - hr.bottom - 8) <= 2 || Math.abs(hr.top - r.bottom - 8) <= 2;
           const inVp = r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12;
           return { visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0, dynamicCoords, nearAnchor, inVp };
         });
         check(hoverAudit, { visible: true, dynamicCoords: true, nearAnchor: true, inVp: true }, `${pageFile} Step 3 tooltip opens on hover with dynamic coordinates near anchor within viewport`);
         await p7.mouse.move(0, 0);
         await p7.waitForTimeout(50);

         // 2. Real Tab key focus -> Scroll & Viewport Resize tracking while focused -> Escape dismissal
         await p7.keyboard.press('Tab');
         let focusedGuide = false;
         for (let k = 0; k < 25; k++) {
           focusedGuide = await p7.evaluate(() => Boolean(document.activeElement?.matches?.('.stt-guide-standalone .p82-guide-tip-wrap')));
           if (focusedGuide) break;
           await p7.keyboard.press('Tab');
         }
         await p7.waitForTimeout(80);
         const tabBefore = await p7.evaluate(() => {
           const b = document.getElementById('p82RecognitionTipInline');
           const r = b ? b.getBoundingClientRect() : null;
           const cs = b ? getComputedStyle(b) : null;
           return b && r && cs ? {
             visible: cs.visibility === 'visible' && cs.opacity === '1' && r.width > 0,
             dynamicCoords: /^\d+px$/.test(b.style.left) && /^\d+px$/.test(b.style.top),
             left: parseFloat(b.style.left),
             top: parseFloat(b.style.top),
             inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
           } : null;
         });
         check(Boolean(focusedGuide && tabBefore?.visible && tabBefore?.dynamicCoords && tabBefore?.inVp), true, `${pageFile} Step 3 tooltip opens via real Tab focus with dynamic coordinates within viewport`);

         // Scroll & Viewport Resize while holding Tab focus
         await p7.evaluate(() => window.scrollBy(0, 40));
         await p7.setViewportSize({ width: 600, height: 900 });
         await p7.waitForTimeout(100);
         const tabAfterMove = await p7.evaluate(() => {
           const b = document.getElementById('p82RecognitionTipInline');
           const r = b ? b.getBoundingClientRect() : null;
           const cs = b ? getComputedStyle(b) : null;
           return b && r && cs ? {
             visible: cs.visibility === 'visible' && cs.opacity === '1',
             left: parseFloat(b.style.left),
             top: parseFloat(b.style.top),
             inVp: r.left >= 12 && r.right <= window.innerWidth - 12 && r.top >= 12 && r.bottom <= window.innerHeight - 12,
           } : null;
         });
         check(Boolean(tabAfterMove?.visible && tabAfterMove?.inVp && (tabAfterMove.left !== tabBefore.left || tabAfterMove.top !== tabBefore.top)), true, `${pageFile} Step 3 tooltip stays visible, updates coordinates, and stays within viewport on scroll/resize while Tab-focused`);

         // Escape key dismissal while Tab-focused
         await p7.keyboard.press('Escape');
         await p7.waitForTimeout(60);
         const afterEsc = await p7.evaluate(() => {
           const host = document.querySelector('.stt-guide-standalone .p82-guide-tip-wrap');
           const b = document.getElementById('p82RecognitionTipInline');
           return {
             suppressed: host?.getAttribute('data-guide-tip-suppressed') === 'true',
             hidden: b ? getComputedStyle(b).visibility === 'hidden' : false,
           };
         });
         check(afterEsc, { suppressed: true, hidden: true }, `${pageFile} Step 3 tooltip closes on Escape while Tab-focused`);
       }
       check(p7Errors, [], `${pageFile} (${scheme}/${vpWidth}px) no pageerror or console.error`);
       await p7Ctx.close();
     }
   }
 }

 await browser.close();console.log('PASS tooltip layout',checks);
})().catch(e=>{console.error(e);process.exit(1)});
