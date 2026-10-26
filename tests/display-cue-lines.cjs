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
 for(const name of ['practice1.1','practice1.2','practice7.1','practice7.2']) {
  const page=await open(context,name);
  await page.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
  for(const width of [600,900,1440]) for(const mode of ['off','hover','paren']) {
   await page.setViewportSize({width,height:900});
   await page.locator(`#hintModeControl [data-value="${mode}"]`).click();
   check(await page.locator('.display-cue-unit').count()>0,mode==='paren',name+' Display pairs only in Display');
   if(mode==='paren') {
    check(await page.locator('.example-box tr td:nth-child(2)').evaluateAll(es=>es.every(e=>{const units=[...e.querySelectorAll('.display-cue-unit')];return units.every((u,i)=>!i||u.getBoundingClientRect().top>=units[i-1].getBoundingClientRect().bottom-1)})),true,name+' Example pairs on separate lines');
    check(await page.locator('.display-cue-unit').evaluateAll(es=>es.every(e=>e.querySelector('.target-word')&&e.querySelector('.vocab-inline'))),true,name+' each pair contains word and hint');
   }
   check(await page.locator('.example-box,.drill-row').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,name+' no overflow');
  }
  if(name==='practice7.1') {
   await page.getByRole('button',{name:'Display expanded cues',exact:true}).click();
   check(await page.locator('#practice71Example .display-cue-unit').count()>0,true,'7.1 expanded Display remains grouped');
   await page.getByRole('button',{name:'Display English cues',exact:true}).click();
   check(await page.locator('#practice71Example .display-cue-unit').count(),0,'7.1 English keeps original formatting');
   check(await page.locator('#practice71Example .p71-cue-separator').count()>0,true,'7.1 English separators retained');
  }
  if(name==='practice7.2') {
   await page.locator('#practice7EnglishCueButton').click();
   check(await page.locator('#drill1List .p7-english-cue').first().textContent().then(t=>t.includes('／')),true,'7.2 English separators retained');
  }
  check(page.errors,[],name+' no runtime errors');await page.close();
 }
 const p=await open(context,'practice7.3');
 await p.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
 for(const width of [600,900,1440,1920]) for(const theme of ['light','dark']) {
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
  for(const style of ['formal','informal','casual']) for(const script of ['hiragana','kanji']) {
   await p.evaluate(([style,script])=>{
    document.querySelector(`#speechStyleControl [data-value="${style}"]`).click();
    document.querySelector(`#scriptModeControl [data-value="${script}"]`).click();
    document.querySelector('#hintModeControl [data-value="paren"]').click();
   },[style,script]);
   check(await p.locator('.p73-display-cue-unit').count()>0,true,'Display cue units exist');
   check(await p.locator('.p73-display-cue-unit').evaluateAll(es=>es.every(e=>e.querySelector('.target-word')&&e.querySelector('.vocab-inline')&&getComputedStyle(e).display==='block')),true,'Japanese and hint remain a pair');
   check(await p.locator('.p73-example-cues,.prompt-label').evaluateAll(es=>es.every(e=>{const units=[...e.querySelectorAll('.p73-display-cue-unit')];return units.every((u,i)=>!i||u.getBoundingClientRect().top>=units[i-1].getBoundingClientRect().bottom-1)})),true,'one cue per line');
   check(await p.locator('.example-box,.drill-row').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'no horizontal overflow');
   check(await p.locator('.example-box table tr > td:last-child .vocab-inline').count(),0,'no model hint duplication');
  }
 }
 for(const mode of ['off','hover']) {
  await p.locator(`#hintModeControl [data-value="${mode}"]`).click();
  check(await p.locator('.p73-display-cue-unit').count(),0,mode+' unchanged');
 }
 await p.locator('#hintModeControl [data-value="paren"]').click();
 await p.locator('#practice73Drill4Panel .drill-cue-button').click();
 check(await p.locator('.p73-display-cue-unit').count(),0,'English cues keep existing layout');
 check(p.errors,[],'no runtime errors');
 await browser.close();console.log('PASS vocabulary Display cue lines',checks);
})().catch(e=>{console.error(e);process.exit(1)});
