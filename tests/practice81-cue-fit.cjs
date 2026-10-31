// D5: actual wrapped cue edges and shared audio column across reading/hint modes.
// Models, selection persistence, grammar/pragmatics separation and actual recording path.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const audioSource=fs.readFileSync(path.join(root,'tests/audio-relay.cjs'),'utf8');
const mock=audioSource.slice(audioSource.indexOf('function mock()'),audioSource.indexOf('(async()=>'));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let checks=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);checks++};
 await page.addInitScript('('+mock.trim()+')();');
 await page.route('http://practice81.test/**',r=>{
  const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
  let source=fs.readFileSync(file);
  if(file.endsWith('practice8.1.js')){
   const s=source.toString(),i=s.lastIndexOf('})();');
   source=s.slice(0,i)+`window.audit81={rowsFor,matchesAnswer,feedback,sentenceFor,makeRow,keyFor,saved,views,choices,showResult,normalize,speechText,sections,comparisons};`+s.slice(i);
  }
  return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/png'});
 });
 await page.goto('http://practice81.test/practice8.1.html');

for(const mode of ['hiragana','kanji'])for(const hint of ['off','hover','paren']){
 await page.locator('#scriptModeControl [data-value="'+mode+'"]').click();await page.locator('#hintModeControl [data-value="'+hint+'"]').click();
 for(const width of [700,900,1100,1440,1920]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(requestAnimationFrame));
 const fit=await page.locator('#drill5').evaluate(group=>{let right=0;for(const c of group.querySelectorAll('.p81-card .prompt-label')){const w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);while(w.nextNode()){const t=w.currentNode;if(!t.textContent.trim()||t.parentElement.closest('.tooltip-tip,.custom-tip-box,select,button'))continue;const r=document.createRange();r.selectNodeContents(t);for(const b of r.getClientRects())right=Math.max(right,b.right);}for(const e of c.querySelectorAll('select,button'))right=Math.max(right,e.getBoundingClientRect().right);}const xs=[...group.querySelectorAll('.recording-actions')].map(e=>e.getBoundingClientRect().left);return {gap:Math.min(...xs)-right,spread:Math.max(...xs)-Math.min(...xs)};});
 const starts=await page.locator('#drill5 .p81-card .p81-cue-words').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().left));
 check(Math.max(...starts)-Math.min(...starts)<1,true,'Japanese cue starts after shared English label column');
 if(width===1440){
  const deltas=await page.locator('#drill5 tr').evaluateAll(rows=>rows.map(row=>{
   const baseline=e=>{const mark=document.createElement('span');mark.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';e.prepend(mark);const y=mark.getBoundingClientRect().top;mark.remove();return y;};
   return baseline(row.querySelector('.p81-cue-body'))-baseline(row.querySelector('.recording-actions button'));
  }));
  check(deltas.every(n=>Math.abs(n)<.5),true,'actual Japanese cue and audio text share first baseline');
 }

 check(fit.gap>=3.5&&fit.gap<6,true,'minimal gap');check(fit.spread<1,true,'shared column');
 }
}
await browser.close();console.log('PASS cue matrix',checks);
})().catch(e=>{console.error(e);process.exit(1)});
