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
 for(const name of ['index','practice1.1','practice1.2','practice2.1','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2']) {
  const p=await open(context,name);
  await p.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
  check(await p.locator('body').evaluate(e=>getComputedStyle(e).fontSize),'20.8px',name+' 130% body');
  for(const width of [1440,1100,900,600]) for(const theme of ['light','dark']) {
   await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
   for(const style of name==='index'?['formal']:['formal','informal','casual']) for(const hint of name==='index'?['off']:['off','hover','paren']) for(const script of name==='index'?['hiragana']:['hiragana','kanji']) {
    await p.evaluate(([style,hint,script])=>{
     document.querySelector(`#speechStyleControl [data-value="${style}"]`)?.click();
     document.querySelector(`#hintModeControl [data-value="${hint}"]`)?.click();
     const b=document.querySelector(`#scriptModeControl [data-value="${script}"]`);if(b&&!b.disabled)b.click();
    },[style,hint,script]);
    check(await p.locator('button').evaluateAll(es=>es.filter(b=>/^(👀Text|🕶️Hide)/.test(b.textContent)).length),0,name+' Text/Hide removed');
    check(await p.locator('.example-box table tr > td:last-child .vocab-inline,.example-box table tr > td:last-child .tooltip-tip').count(),0,name+' Example model text has no vocabulary hints');
    const bad=await p.evaluate(()=>[...document.querySelectorAll('.example-box,.drill-row,.settings-row,.pitch-card,.prompt-item')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className));
    check(bad,[],`${name} overflow ${width}/${theme}/${style}/${hint}/${script}`);
    check(await p.locator('.example-box').evaluateAll(es=>es.every(e=>(e.querySelector('svg')?e.querySelector('table').getBoundingClientRect().height/Math.max(1,e.querySelectorAll('tr').length)<220:e.getBoundingClientRect().height<1000))),true,name+' Example readable wrapping height');
    check(await p.locator('.example-box').evaluateAll(es=>es.every(e=>{
     const heading=e.querySelector('.example-category-heading');
     if(heading&&e.querySelectorAll('.tense-badge,.p71-tense,.p73-tense').length!==1)return false;
     const pairs=[...e.querySelectorAll('.example-response-row td:nth-child(4) button,.practice12-example-answer')];
     if(pairs.length<2)return true;
     const r=pairs.map(e=>e.getBoundingClientRect());return r[1].y>r[0].y&&Math.abs(r[1].x-r[0].x)<2;
    })),true,name+' single category heading and vertical Yes/No');
   }
  }
  if(name==='practice7.3') {
   await p.setViewportSize({width:1440,height:900});await p.evaluate(()=>document.querySelector('#hintModeControl [data-value="off"]').click());
   const tracks=await p.locator('.p73-question-table').first().evaluate(t=>{
    const cue=parseFloat(t.style.getPropertyValue('--practice73-cue-width'));
    const row=t.querySelector('.p73-controls');
    return {expected:34+4+cue+4,actual:row.getBoundingClientRect().x-t.getBoundingClientRect().x};
   });
   check(Math.abs(tracks.expected-tracks.actual)<2,true,'7.3 measured cue width directly sets listen track');
  }
  check(p.errors,[],name+' runtime errors');await p.close();console.log('DISPLAY',name);
 }
 await browser.close();console.log('PASS global 130% display',checks);
})().catch(e=>{console.error(e);process.exit(1)});
