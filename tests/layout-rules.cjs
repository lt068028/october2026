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
 for(const name of ['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3']) {
  const p=await open(context,name);const states=new Set();
  for(const width of [979,980,981]) {
   await p.setViewportSize({width,height:900});
   const state=await p.locator('.example-box').first().evaluate(e=>{
    const cs=getComputedStyle(e),table=e.querySelector('table'),style=getComputedStyle(table);
    const content=e.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    return {content,display:style.display,tracks:style.gridTemplateColumns.split(' ').length};
   });
   const narrow=state.content<=850;states.add(narrow);
   check(name==='practice1.1'?state.display===(narrow?'block':'table'):state.tracks===(narrow?(name==='practice1.2'?2:3):(name==='practice1.2'?4:5)),true,name+' card breakpoint '+state.content);
  }
  check(states.size,2,name+' exercised both sides of breakpoint');
  await p.close();
 }
 const p=await open(context,'practice7.2');
 await p.locator('#hintModeControl [data-value="paren"]').click();
 for(const script of ['hiragana','kanji']) {
  await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  check(await p.locator('.example-box').first().locator('td:nth-child(2) .vocab-inline').count()>0,true,'Display hints still shown on cues');
  check(await p.locator('.example-box table tr > td:last-child .vocab-inline,.example-box table tr > td:last-child .tooltip-tip').count(),0,'no duplicated model hints');
 }
 await p.locator('#practice7EnglishCueButton').click();
 check(await p.locator('#drill1List .practice72-category-slot').count()>0,true,'category alignment survives English cue change');
 check(p.errors,[],'7.2 no runtime errors after cue changes');
 await browser.close();console.log('PASS layout rules',checks);
})().catch(e=>{console.error(e);process.exit(1)});
