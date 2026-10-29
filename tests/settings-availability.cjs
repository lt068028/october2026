// Available choices stay colored; only unavailable, unselected choices fade.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2'];
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:600,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));let checks=0;
 await p.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{name:'Google A',voiceURI:'a',lang:'ja-JP'}],addEventListener(){},cancel(){},speak(){}}});window.SpeechSynthesisUtterance=class{};});
 await p.route('http://settings.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':f.endsWith('.png')?'image/png':'text/html'});});
 async function verify(label){
  await p.evaluate(()=>new Promise(requestAnimationFrame));
  const result=await p.locator('.compact-settings button .icon-emoji').evaluateAll(es=>es.map(icon=>{const e=icon.closest('button'),selected=e.getAttribute('aria-pressed')==='true'||e.classList.contains('is-selected'),unavailable=(e.disabled||e.getAttribute('aria-disabled')==='true')&&!selected;return{value:e.dataset.value,unavailable,filter:getComputedStyle(icon).filter,opacity:getComputedStyle(icon).opacity};}));
  assert.ok(result.length>=2,label+' normalized setting icons');checks++;
  for(const r of result){assert.equal(r.filter,r.unavailable?'grayscale(1)':'none',label+' '+r.value);assert.equal(r.opacity,r.unavailable?'0.55':'1',label+' '+r.value+' opacity');checks+=2;}
 }
 for(const name of pages){
  await p.goto('http://settings.test/'+name+'.html');
  for(const theme of ['light','dark']){await p.emulateMedia({colorScheme:theme});await verify(name+' '+theme);}
  for(const id of ['scriptModeControl','speechStyleControl','hintModeControl']){
   const opts=p.locator('#'+id+' button');for(let i=0;i<await opts.count();i++){const option=opts.nth(i);if(await option.isDisabled())continue;await option.click();await verify(name+' '+id+' '+i);}
  }
  if(name==='pronunciation1'){
   assert.equal(await p.locator('#scriptModeControl [data-value="kanji"]').isDisabled(),true);assert.equal(await p.locator('#scriptModeControl [data-value="hiragana"]').getAttribute('aria-pressed'),'true');checks+=2;
  }
  if(name==='pronunciation2'){assert.equal(await p.locator('#speechStyleControl [data-value="casual"]').isDisabled(),true);checks++;}
  for(const id of ['toggleRecordMode','togglePlaybackMode']){
   const input=p.locator('#'+id);if(!await input.count())continue;
   await input.evaluate(e=>{if(e.checked)e.click();});
   const label=p.locator(id==='toggleRecordMode'?'#labelAutoRecord .icon-emoji':'#labelAutoPlay .icon-emoji');
   assert.equal(await label.evaluate(e=>getComputedStyle(e).filter),'none',name+' OFF is available');checks++;
   await input.evaluate(e=>e.disabled=true);
   assert.equal(await label.evaluate(e=>getComputedStyle(e).filter),'grayscale(1)',name+' unavailable OFF');assert.equal(await label.evaluate(e=>getComputedStyle(e).opacity),'0.55');checks+=2;
   await input.evaluate(e=>e.disabled=false);
  }
  // Simulate the existing recording lock, then restore its original restrictions.
  await p.locator('.compact-settings button').evaluateAll(es=>es.forEach(e=>{e.dataset.originalDisabled=String(e.disabled);e.disabled=true;}));await verify(name+' temporary lock');
  await p.locator('.compact-settings button').evaluateAll(es=>es.forEach(e=>{e.disabled=e.dataset.originalDisabled==='true';delete e.dataset.originalDisabled;}));await verify(name+' restored');
  assert.equal(await p.locator('.compact-settings').evaluate(e=>e.scrollWidth<=e.clientWidth+2),true,name+' no overflow');checks++;
 }
 assert.deepEqual(errors,[]);checks++;await b.close();console.log('PASS settings availability',checks);
})().catch(e=>{console.error(e);process.exit(1)});
