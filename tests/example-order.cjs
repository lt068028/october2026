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
 for(const name of ['practice7.1','practice7.2','practice7.3']) {
  const p=await open(context,name);
  for(const width of [1440,1100,900,600]) for(const theme of ['light','dark']) {
   await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
   for(const style of ['formal','informal','casual']) for(const hint of ['off','hover','paren']) for(const script of ['hiragana','kanji']) {
    await p.evaluate(([style,hint,script])=>{
     document.querySelector(`#speechStyleControl [data-value="${style}"]`).click();
     document.querySelector(`#hintModeControl [data-value="${hint}"]`).click();
     document.querySelector(`#scriptModeControl [data-value="${script}"]`).click();
    },[style,hint,script]);
    check(await p.locator('.example-box').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,`${name} overflow ${width}/${theme}/${style}/${hint}/${script}`);
    check(await p.locator('.example-box tr').evaluateAll(rows=>rows.every(row=>{
     const cells=[...row.children];
     const heading=row.closest('.example-box').querySelector('.example-category-heading');
     if(heading) {if(row.querySelector('.tense-badge,.p71-tense,.p73-tense'))return false;}
     else if(!cells[0].querySelector('.tense-badge,.p71-tense,.p73-tense'))return false;
     if(cells.length===2)return cells[1].hasAttribute('colspan')&&cells[1].querySelectorAll('button').length===2;
     return cells.length===5&&cells[2].textContent.includes('👉')&&cells[3].querySelector('button')&&cells[4].textContent.trim()&&!cells.slice(1).some(c=>c.querySelector('.tense-badge,.p71-tense,.p73-tense'));
    })),true,`${name} category/cue/arrow/listen/text order`);
   }
  }
  check(p.errors,[],name+' runtime errors');await p.close();
 }
 await browser.close();console.log('PASS Practice 7 Example order',checks);
})().catch(e=>{console.error(e);process.exit(1)});
