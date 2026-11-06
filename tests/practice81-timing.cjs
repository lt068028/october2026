// Final-page coverage supplement: content, Beyond, hints and pair state contracts.
// Browser speech/microphone APIs are controlled doubles; no acoustic-quality claim.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8'),mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
async function open(browser,hasTouch=false){const page=await browser.newPage({viewport:{width:375,height:1000},hasTouch});page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));await page.addInitScript('('+mock.trim()+')();');
 await page.route('http://final81.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});let s=fs.readFileSync(f,'utf8');if(f.endsWith('practice8.1.js'))s=s.replace(/\}\)\(\);\s*$/,'window.final81={rowsFor,choices,saved,views,render,showResult,keyFor,matchesAnswer,words,comparisonOptionOrder};})();');return r.fulfill({body:s,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});});await page.goto('http://final81.test/practice8.1.html');return page;}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 for(const scenario of ['denied','autostop','pre-speech','upper','recognition-error']){
  const p=await open(browser);if(scenario!=='denied')await p.clock.install();console.log('TIMING',scenario);
  await p.locator('#togglePlaybackMode').evaluate(e=>e.click());
  if(['upper','denied'].includes(scenario))await p.locator('#toggleRecordMode').evaluate(e=>e.click());
  if(scenario==='denied')await p.evaluate(()=>t.deny=true);
  await p.locator('[data-row="compare-0-action"] button').filter({hasText:'🎙️とる'}).click();
  if(scenario==='denied'){
   await p.waitForFunction(()=>!document.querySelector('#voiceDropdownBtn').disabled);
   eq(await p.evaluate(()=>final81.saved.size),0,'denied saves nothing');
   await p.evaluate(()=>t.deny=false);
   await p.locator('[data-row="compare-0-action"] button').filter({hasText:'🎙️とる'}).click();
   await p.waitForFunction(()=>document.querySelector('.stop-btn-active'));await p.locator('.stop-btn-active').click();await p.waitForFunction(()=>!document.querySelector('#voiceDropdownBtn').disabled);
   eq(await p.locator('#voiceDropdownBtn').isDisabled(),false,'retry recovered');
  }else{
   await p.waitForFunction(()=>t.recognitions.length>0);
   if(scenario==='recognition-error')await p.evaluate(()=>t.recognitions.at(-1).onerror({error:'network'}));
   else if(scenario==='pre-speech')await p.clock.fastForward(15100);
   else{
    await p.evaluate(()=>{const result=[{transcript:'本を読むのが好きです。'}];result.isFinal=true;t.recognitions.at(-1).onresult({resultIndex:0,results:[result]});});
    await p.clock.fastForward(scenario==='upper'?20100:2100);
   }
   await p.clock.runFor(20);
   eq(await p.locator('#voiceDropdownBtn').isDisabled(),false,scenario+' settings unlocked');
   eq(await p.locator('.stop-btn-active').count(),0,scenario+' recording ended');
   eq(await p.evaluate(()=>final81.saved.size),['autostop','upper'].includes(scenario)?1:0,scenario+' save/discard');
   eq(await p.evaluate(()=>t.spoken.length),0,scenario+' manual playback not automatic');
  }
  eq(await p.evaluate(()=>t.tracks.every(t=>t.readyState==='ended')),true,scenario+' microphone released');eq(p.errors,[],scenario+' runtime');await p.close();
 }
 await browser.close();console.log('PASS timing/recovery',checks);
})().catch(e=>{console.error(e.message.slice(0,3000));process.exit(1)});
