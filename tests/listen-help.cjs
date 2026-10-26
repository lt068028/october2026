const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0;
 const check=(a,b,label)=>{assert.deepEqual(a,b,label);checks++};
 for(const name of ['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2']) {
  const p=await browser.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('http://drill.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   return fs.existsSync(file)?r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'}):r.fulfill({status:404,body:''});
  });
  await p.goto('http://drill.test/'+name+'.html');await p.bringToFront();
  check(await p.locator('button .custom-tip-box').evaluateAll(es=>es.some(e=>/^Listen\b/i.test(e.textContent.trim()))),false,name+' no routine Listen explanations');
  if(['practice1.2','practice7.1','practice7.2','practice7.3'].includes(name)) {
   const lock=p.locator('.selection-help-wrap').filter({hasText:'Choose 🙆 or 🙅 first.'}).first();
   check(await lock.locator('button').isDisabled(),true,name+' Y/N Listen disabled');
   await lock.hover();await p.waitForTimeout(250);
   check(await lock.locator('.custom-tip-box').evaluate(e=>getComputedStyle(e).visibility),'visible',name+' real hover shows reason');
   await lock.focus();check(await lock.locator('.custom-tip-box').evaluate(e=>getComputedStyle(e).visibility),'visible',name+' keyboard reason');
   const before=await p.locator('.selection-help-wrap').count();
   await lock.evaluate(e=>{const card=e.closest('.drill-row');const yes=[...card.querySelectorAll('button')].find(b=>b.firstChild?.textContent.trim()==='🙆');yes.click();});
   check(await p.locator('.selection-help-wrap').count(),before-1,name+' reason removed after Y/N selection');
  }
  if(name==='practice1.2') {
   const major=p.locator('.selection-help-wrap').filter({hasText:'Select a major first.'}).first();
   check(await major.locator('button').isDisabled(),true,'major locks reply Listen');
   await major.hover();await p.waitForTimeout(250);
   check(await major.locator('.custom-tip-box').evaluate(e=>getComputedStyle(e).visibility),'visible','major reason visible');
   await p.locator('#drill2Container select').first().selectOption({index:1});
   check(await p.locator('#drill2Container .drill-row').first().locator('.selection-help-wrap').count(),0,'major reason removed after selection');
   check(await p.locator('#drill2Container .recording-actions').nth(1).locator('button').first().isEnabled(),true,'reply Listen enabled');
  }
  check(errors,[],name+' runtime errors');await p.close();
 }
 await browser.close();console.log('PASS Listen explanation policy',checks);
})().catch(e=>{console.error(e);process.exit(1)});
