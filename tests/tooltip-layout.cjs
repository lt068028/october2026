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
 check(await tipA.evaluate(e => getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'hidden' && e.getAttribute('data-tip-suppressed') === 'true' && document.activeElement !== e), true, 'Tip A blurred, hidden, and retains data-tip-suppressed after self-blur on keyboard Escape');
 await tipA.focus();
 check(await tipA.evaluate(e => !e.hasAttribute('data-tip-suppressed') && getComputedStyle(e.querySelector('.custom-tip-box')).visibility === 'visible'), true, 'Tip A suppression cleared and re-revealed on new Focus');
 await testPage.keyboard.press('Escape');
 await testPage.evaluate(() => {
   document.querySelectorAll('[data-tip-suppressed]').forEach(e => e.removeAttribute('data-tip-suppressed'));
   document.body.focus();
 });

 // Single dismissal principle: vocabulary tooltip + translation tooltip both open -> 1st Escape closes only 1
 const vocabTip = testPage.locator('#drill1 .tooltip-wrap').first();
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   v.removeAttribute('data-tip-suppressed');
   v.classList.add('tap-tip-open');
   const t = document.querySelector('#drill1 .p82-concept-english');
   t.removeAttribute('data-tip-suppressed');
   t.classList.add('p82-translation-open');
 });
 await testPage.keyboard.press('Escape');
 const singleDismissState = await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const t = document.querySelector('#drill1 .p82-concept-english');
   const vOpen = v.classList.contains('tap-tip-open') && !v.hasAttribute('data-tip-suppressed');
   const tOpen = t.classList.contains('p82-translation-open') && !t.hasAttribute('data-tip-suppressed');
   return { openCount: (vOpen ? 1 : 0) + (tOpen ? 1 : 0), suppressedCount: (v.hasAttribute('data-tip-suppressed') ? 1 : 0) + (t.hasAttribute('data-tip-suppressed') ? 1 : 0) };
 });
 check(singleDismissState, { openCount: 1, suppressedCount: 1 }, 'Single Escape closes only 1 priority tooltip while the other remains open');
 await testPage.keyboard.press('Escape');
 const secondDismissState = await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const t = document.querySelector('#drill1 .p82-concept-english');
   return !v.classList.contains('tap-tip-open') && !t.classList.contains('p82-translation-open') && v.hasAttribute('data-tip-suppressed') && t.hasAttribute('data-tip-suppressed');
 });
 check(secondDismissState, true, 'Second Escape closes the remaining open tooltip');
 await testPage.evaluate(() => {
   document.querySelectorAll('[data-tip-suppressed]').forEach(e => e.removeAttribute('data-tip-suppressed'));
 });

 // Other UI priority: Voice Dropdown open -> Escape closes dropdown without closing open vocabulary tooltip
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 1, clientX: 10, clientY: 10 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 1, clientX: 10, clientY: 10 }));
 });
 check(await vocabTip.evaluate(e => e.classList.contains('tap-tip-open')), true, 'Vocab tooltip opened via touch before Voice Dropdown check');
 await testPage.evaluate(() => {
   const menu = document.getElementById('voiceDropdownMenu');
   const btn = document.getElementById('voiceDropdownBtn');
   if (menu) menu.hidden = false;
   if (btn) btn.setAttribute('aria-expanded', 'true');
 });
 await testPage.keyboard.press('Escape');
 check(await testPage.evaluate(() => {
   const menu = document.getElementById('voiceDropdownMenu');
   const v = document.querySelector('#drill1 .tooltip-wrap');
   return Boolean(menu?.hidden) && v.classList.contains('tap-tip-open') && !v.hasAttribute('data-tip-suppressed');
 }), true, 'Escape closes Voice Dropdown while preserving open vocabulary tooltip');
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   v.classList.remove('tap-tip-open');
   document.documentElement.removeAttribute('data-tooltip-input');
 });

 // Touch in-progress gesture suppression & valid-tap restoration
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 10, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 10, clientX: 50, clientY: 50 }));
 });
 check(await vocabTip.evaluate(e => e.classList.contains('tap-tip-open') && getComputedStyle(e.querySelector('.tooltip-tip')).visibility === 'visible'), true, 'Touch tap opens vocabulary tooltip');
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 11, clientX: 50, clientY: 50 }));
 });
 await testPage.keyboard.press('Escape');
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 11, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'touch', pointerId: 11, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
 });
 check(await vocabTip.evaluate(e => !e.classList.contains('tap-tip-open') && e.getAttribute('data-tip-suppressed') === 'true' && getComputedStyle(e.querySelector('.tooltip-tip')).visibility === 'hidden'), true, 'Touch Escape during in-progress gesture keeps tooltip hidden and suppressed across pointerup and click');
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 12, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 12, clientX: 50, clientY: 80 }));
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 13, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch', pointerId: 13, clientX: 50, clientY: 50 }));
 });
 check(await vocabTip.evaluate(e => !e.classList.contains('tap-tip-open') && e.getAttribute('data-tip-suppressed') === 'true'), true, 'Touch scroll (>10px) and pointercancel do NOT clear data-tip-suppressed');
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 14, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 14, clientX: 52, clientY: 51 }));
 });
 check(await vocabTip.evaluate(e => e.classList.contains('tap-tip-open') && !e.hasAttribute('data-tip-suppressed') && getComputedStyle(e.querySelector('.tooltip-tip')).visibility === 'visible'), true, 'Subsequent valid touch tap clears suppression and re-opens vocabulary tooltip');
 await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   v.classList.remove('tap-tip-open');
   document.documentElement.removeAttribute('data-tooltip-input');
 });

 // 1 & 2. Escape followed by pointercancel / scroll (no click) / non-in-progress Escape -> unrelated button click & keyboard operation unaffected
 const unrelatedClickResults = await testPage.evaluate(() => {
   const v = document.querySelector('#drill1 .tooltip-wrap');
   const target = v.querySelector('.target-word');
   const btn = document.createElement('button');
   btn.type = 'button';
   let btnClicks = 0;
   btn.addEventListener('click', () => { btnClicks++; });
   document.body.appendChild(btn);

   // A. In-progress touch pointerdown -> Escape -> pointercancel -> unrelated button click
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 40, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 40, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 41, clientX: 50, clientY: 50 }));
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
   target.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch', pointerId: 41, clientX: 50, clientY: 50 }));
   btn.click();
   const afterCancelClicks = btnClicks;

   // B. Scroll (>10px, pointerdown -> pointerup without click) on suppressed host -> unrelated button click
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 42, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 42, clientX: 50, clientY: 90 }));
   btn.click();
   const afterScrollClicks = btnClicks;

   // C. Non-in-progress Escape (tap complete -> Escape) -> keyboard/programmatic click on unrelated button
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 43, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 43, clientX: 50, clientY: 50 }));
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
   btn.click();
   const afterNonInProgressEscapeClicks = btnClicks;

   // D. In-progress Escape -> unrelated button click before and after pointerup
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 44, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 44, clientX: 50, clientY: 50 }));
   target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 45, clientX: 50, clientY: 50 }));
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
   btn.click();
   const duringInProgressEscapeUnrelatedClicks = btnClicks;
   target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 45, clientX: 50, clientY: 50 }));

   btn.remove();
   v.removeAttribute('data-tip-suppressed');
   v.classList.remove('tap-tip-open');
   return { afterCancelClicks, afterScrollClicks, afterNonInProgressEscapeClicks, duringInProgressEscapeUnrelatedClicks };
 });
 check(unrelatedClickResults, {
   afterCancelClicks: 1,
   afterScrollClicks: 2,
   afterNonInProgressEscapeClicks: 3,
   duringInProgressEscapeUnrelatedClicks: 4
 }, 'Unrelated button clicks and keyboard/programmatic activations are never blocked after pointercancel, scroll, or Escape');

 // 3 & 4. Escape on Host A -> valid tap on Host B opens in 1 tap; valid tap on suppressed Host A (both vocab and P8.2 translation) re-opens
 const crossAndSameHostResults = await testPage.evaluate(() => {
   const vocabA = document.querySelectorAll('#drill1 .tooltip-wrap')[0];
   const vocabB = document.querySelectorAll('#drill1 .tooltip-wrap')[1];
   const transA = document.querySelector('#drill1 .p82-concept-english');
   const transB = document.querySelector('#drill1 .p82-model-translation');

   const targetA = vocabA.querySelector('.target-word');
   const targetB = vocabB.querySelector('.target-word');
   targetA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 50, clientX: 10, clientY: 10 }));
   targetA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 50, clientX: 10, clientY: 10 }));
   targetA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 51, clientX: 10, clientY: 10 }));
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
   targetA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 51, clientX: 10, clientY: 10 }));

   // Tap another vocabulary host (vocabB) -> opens in 1 tap
   targetB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 52, clientX: 20, clientY: 20 }));
   targetB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 52, clientX: 20, clientY: 20 }));
   const vocabBOpenedInOneTap = vocabB.classList.contains('tap-tip-open') && !vocabB.hasAttribute('data-tip-suppressed');

   // Valid tap on suppressed vocabA -> re-opens in 1 tap
   targetA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 53, clientX: 10, clientY: 10 }));
   targetA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 53, clientX: 11, clientY: 11 }));
   const vocabAReopened = vocabA.classList.contains('tap-tip-open') && !vocabA.hasAttribute('data-tip-suppressed');

   // P8.2 translation host: open transA -> in-progress Escape -> pointerup + blocked click -> valid tap on transB -> valid tap on transA
   transA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 54, clientX: 30, clientY: 30 }));
   transA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 54, clientX: 30, clientY: 30 }));
   transA.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
   const transAInitiallyOpen = transA.classList.contains('p82-translation-open');

   transA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 55, clientX: 30, clientY: 30 }));
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
   transA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 55, clientX: 30, clientY: 30 }));
   transA.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
   const transASuppressedAfterInProgressEscape = !transA.classList.contains('p82-translation-open') && transA.getAttribute('data-tip-suppressed') === 'true';

   // Tap another translation host (transB) -> opens in 1 tap
   transB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 56, clientX: 40, clientY: 40 }));
   transB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 56, clientX: 40, clientY: 40 }));
   transB.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
   const transBOpenedInOneTap = transB.classList.contains('p82-translation-open') && !transB.hasAttribute('data-tip-suppressed');

   // Valid tap on suppressed transA -> clears suppression and re-opens in 1 tap
   transA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 57, clientX: 30, clientY: 30 }));
   transA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 57, clientX: 31, clientY: 31 }));
   transA.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
   const transAReopened = transA.classList.contains('p82-translation-open') && !transA.hasAttribute('data-tip-suppressed');

   vocabA.classList.remove('tap-tip-open');
   vocabB.classList.remove('tap-tip-open');
   transA.classList.remove('p82-translation-open');
   transB.classList.remove('p82-translation-open');
   document.querySelectorAll('[data-tip-suppressed]').forEach(e => e.removeAttribute('data-tip-suppressed'));

   return {
     vocabBOpenedInOneTap,
     vocabAReopened,
     transAInitiallyOpen,
     transASuppressedAfterInProgressEscape,
     transBOpenedInOneTap,
     transAReopened
   };
 });
 check(crossAndSameHostResults, {
   vocabBOpenedInOneTap: true,
   vocabAReopened: true,
   transAInitiallyOpen: true,
   transASuppressedAfterInProgressEscape: true,
   transBOpenedInOneTap: true,
   transAReopened: true
 }, 'Escape on one host does not block tapping another host, and subsequent valid tap re-opens suppressed vocab/translation host');

 // 5. Bidirectional desync recovery between internal openVocabulary and DOM .tap-tip-open
 const desyncRecoveryResults = await testPage.evaluate(() => {
   const vocabA = document.querySelectorAll('#drill1 .tooltip-wrap')[0];
   const vocabB = document.querySelectorAll('#drill1 .tooltip-wrap')[1];
   const targetA = vocabA.querySelector('.target-word');

   // Case 5a (Forward desync): open vocabA via touch (sets openVocabulary = vocabA), then manually remove .tap-tip-open from DOM
   targetA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 60, clientX: 10, clientY: 10 }));
   targetA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 60, clientX: 10, clientY: 10 }));
   vocabA.classList.remove('tap-tip-open');
   targetA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 61, clientX: 10, clientY: 10 }));
   targetA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 61, clientX: 10, clientY: 10 }));
   const forwardDesyncReopenedInOneTap = vocabA.classList.contains('tap-tip-open');

   // Case 5b (Reverse desync - tap): reset openVocabulary via mouse pointerdown, then manually add .tap-tip-open to vocabA
   document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', pointerId: 62, clientX: 0, clientY: 0 }));
   vocabA.classList.add('tap-tip-open');
   targetA.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 63, clientX: 10, clientY: 10 }));
   targetA.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 63, clientX: 10, clientY: 10 }));
   const reverseDesyncClosedByTap = !vocabA.classList.contains('tap-tip-open');

   // Case 5c (Reverse desync - Escape): openVocabulary is null while vocabA has .tap-tip-open in DOM
   vocabA.classList.add('tap-tip-open');
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
   const reverseDesyncClosedByEscape = !vocabA.classList.contains('tap-tip-open') && vocabA.getAttribute('data-tip-suppressed') === 'true';

   vocabA.removeAttribute('data-tip-suppressed');
   vocabB.removeAttribute('data-tip-suppressed');
   document.documentElement.removeAttribute('data-tooltip-input');

   return {
     forwardDesyncReopenedInOneTap,
     reverseDesyncClosedByTap,
     reverseDesyncClosedByEscape
   };
 });
 check(desyncRecoveryResults, {
   forwardDesyncReopenedInOneTap: true,
   reverseDesyncClosedByTap: true,
   reverseDesyncClosedByEscape: true
 }, 'Bidirectional desync between openVocabulary and DOM .tap-tip-open recovers cleanly on tap and Escape');

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
