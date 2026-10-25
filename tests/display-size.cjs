// Practice 1.2 size preference: state preservation, locking, persistence and page isolation.
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
 const context=await browser.newContext(),p=await open(context);
 check(await p.locator('body').getAttribute('data-display-size'),'100','default is current size');
 await p.evaluate(()=>{
  const k=Object.keys(practice2State.views)[0];window.sizeTestKey=k;
  practice2State.savedResults[k]={rawTranscript:'私は学生です',modelText:'私は学生です。',expectedText:'私は学生です。',isCorrect:true};
  practice2State.audioUrls[k]=URL.createObjectURL(new Blob(['saved'],{type:'audio/webm'}));
  window.sizeTestSaved=practice2State.savedResults[k];window.sizeTestUrl=practice2State.audioUrls[k];
 });
 const button=p.locator('#drill1Container .example-button').first();
 const base=await button.evaluate(e=>{const s=getComputedStyle(e);return {font:parseFloat(s.fontSize),width:parseFloat(s.minWidth),padding:s.padding}});
 for(const size of [115,130,100]){
  await p.locator(`#displaySizeControl [data-display-size="${size}"]`).click();
  check(await p.locator('#displaySizeControl [aria-pressed="true"]').count(),1,'one choice selected');
  check(await p.locator('body').getAttribute('data-display-size'),String(size),'size applied');
  const value=await button.evaluate(e=>{const s=getComputedStyle(e);return {font:parseFloat(s.fontSize),width:parseFloat(s.minWidth),padding:s.padding}});
  check(Math.abs(value.font-base.font*size/100)<.02,true,'font proportional');
  check(Math.abs(value.width-base.width*size/100)<.02,true,'minimum target proportional');
  check(value.padding,base.padding,'padding preserved');
  check(await p.evaluate(()=>practice2State.savedResults[sizeTestKey]===sizeTestSaved&&practice2State.audioUrls[sizeTestKey]===sizeTestUrl),true,'recording and original result retained');
  check(await p.locator('.recorded-play-button,.play-recording-btn').count()>0,true,'recording remains playable');
 }
 await p.evaluate(()=>{practice2State.startingRow='size-test-pending';practice2SyncRecordingUI()});
 check(await p.locator('#displaySizeControl button:disabled').count(),3,'locked while awaiting microphone');
 await p.locator('#displaySizeControl [data-display-size="130"]').dispatchEvent('click');
 check(await p.locator('body').getAttribute('data-display-size'),'100','programmatic click cannot bypass lock');
 await p.evaluate(()=>{practice2State.startingRow=null;practice2SyncRecordingUI()});
 check(await p.locator('#displaySizeControl button:disabled').count(),0,'unlocked after recording');
 await p.locator('#displaySizeControl [data-display-size="130"]').focus();await p.keyboard.press('Enter');
 check(await p.locator('body').getAttribute('data-display-size'),'130','keyboard activates choice');
 await p.reload();check(await p.locator('body').getAttribute('data-display-size'),'130','reload restores preference');
 const second=await open(context);check(await second.locator('body').getAttribute('data-display-size'),'130','new visit restores preference');
 const other=await open(context,'practice7.1');check(await other.locator('#displaySizeControl').count(),0,'control limited to 1.2');
 check(await other.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--practice12-scale').trim()),'','scale does not leak to other pages');
 await p.evaluate(k=>localStorage.setItem(k,'999'),key);await p.reload();check(await p.locator('body').getAttribute('data-display-size'),'100','invalid stored value safely falls back');
 check(p.errors.concat(second.errors,other.errors),[],'no page errors');
 await p.bringToFront();
 await p.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
 for(const width of [1280,900,600]) for(const theme of ['light','dark']) {
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
  for(const size of [115,130,100]) {
   await p.locator(`#displaySizeControl [data-display-size="${size}"]`).click();
   check(await p.locator('body').getAttribute('data-display-size'),String(size),`pointer choice ${width}/${theme}/${size}`);
  }
  for(const size of [115,130]) for(const hint of ['hover','paren']) for(const script of ['hiragana','kanji']) {
   await p.evaluate(([size,hint,script])=>{
    document.querySelector(`#displaySizeControl [data-display-size="${size}"]`).click();
    document.querySelector(`#hintModeControl [data-value="${hint}"]`).click();
    document.querySelector(`#scriptModeControl [data-value="${script}"]`).click();
   },[size,hint,script]);
   const overflow=await p.locator('.example-box,.drill-row,.settings-row').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2));
   check(overflow,false,`enlarged layout ${width}/${theme}/${size}/${hint}/${script}`);
  }
 }
 const denied=await browser.newContext();await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('denied','SecurityError')};Storage.prototype.setItem=()=>{throw new DOMException('denied','SecurityError')}});
 const d=await open(denied);await d.locator('#displaySizeControl [data-display-size="115"]').click();check(await d.locator('body').getAttribute('data-display-size'),'115','works without localStorage');check(d.errors,[],'storage errors do not break page');
 await browser.close();console.log('PASS display size',checks);
})().catch(e=>{console.error(e);process.exit(1)});
