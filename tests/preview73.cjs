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
 const context=await browser.newContext(),p=await open(context,'practice7.3');
 for(const width of [1440,1100,900,600]) for(const theme of ['light','dark']) {
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
  for(const style of ['formal','informal','casual']) for(const hint of ['off','hover','paren']) for(const script of ['hiragana','kanji']) {
   await p.evaluate(([style,hint,script])=>{
    document.querySelector(`#speechStyleControl [data-value="${style}"]`).click();
    document.querySelector(`#hintModeControl [data-value="${hint}"]`).click();
    document.querySelector(`#scriptModeControl [data-value="${script}"]`).click();
   },[style,hint,script]);
   check(await p.locator('.example-box,.drill-row,.settings-row').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,`7.3 overflow ${width}/${theme}/${style}/${hint}/${script}`);
  }
 }
 check(p.errors,[],'7.3 runtime errors');
 const q=await open(context);
 await q.evaluate(()=>document.querySelector('#speechStyleControl [data-value="formal"]').click());
 for(const script of ['hiragana','kanji']) {
  await q.evaluate(script=>document.querySelector(`#scriptModeControl [data-value="${script}"]`).click(),script);
  const gold=await q.locator('#drill2Container .example-box strong.grammar-highlight').allTextContents();
  check(gold.filter(t=>t==='の').length,2,'both possessive particles gold');
  check(gold.includes(script==='hiragana'?'なんですか':'何ですか'),true,'entire question phrase gold');
 }
 await browser.close();console.log('PASS Practice 7.3 preview and 1.2 grammar',checks);
})().catch(e=>{console.error(e);process.exit(1)});
