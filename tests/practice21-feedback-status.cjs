// A-policy integration vs fixed legacy baseline; audio APIs are mocked.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),baseline=process.env.FEEDBACK_BASELINE_ROOT;
assert.ok(baseline,'Set FEEDBACK_BASELINE_ROOT to a read-only e9c6fe2d8a95467ba250ddbdf6c0fe23ad683f85 checkout');
const output=process.env.FEEDBACK_OUTPUT||'/tmp/p21-feedback-status';fs.mkdirSync(output,{recursive:true});
// Reuse the existing page harness without running its test suite.
const harness=fs.readFileSync(path.join(__dirname,'practice21-keep-going.cjs'),'utf8').split('(async () => {')[0];
const {open,settle}=new Function('require','__dirname',harness+';return {open,settle};')(require,__dirname);
let count=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
async function answer(p,raw){return p.evaluate(raw=>{isAutoPlay=false;const key=Object.keys(practice2State.views)[0],v=practice2State.views[key];processResult(raw,'これはほんです。',()=> 'これは本です。',v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,1,key);return {key,saved:practice2State.savedResults[key]};},raw);}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await open(b,root),old=await open(b,baseline);
 eq(await p.locator('.feedback-status').count(),0,'initially no verdict');
 for(const width of [375,600,1440])for(const theme of ['light','dark']){
  for(const q of [p,old]){await q.setViewportSize({width,height:1000});await q.emulateMedia({colorScheme:theme});}
  for(const raw of ['これはほんです。','これは本です。','ちがうこたえ','これ','これはほん','これはほんですがべつのはなしです。']){
   const a=await answer(p,raw),legacy=await answer(old,raw);const {judgment,...unchanged}=a.saved;
   eq(unchanged,legacy.saved,'all pre-existing saved values unchanged');eq(judgment,legacy.saved.isCorrect?'accepted':'mismatch','no inferred hold');
   eq(await p.locator('.feedback-status-accepted').count(),legacy.saved.isCorrect?1:0,'accepted badge only');eq(await p.locator('.feedback-status-undetermined').count(),0,'zero real hold generation');
   eq(await p.locator('.p21-retry-label:visible').count(),legacy.saved.isCorrect?0:1,'Fire iff mismatch');
   if(!legacy.saved.isCorrect){const markup=await p.evaluate(k=>practice2State.views[k].resultSpan.innerHTML,a.key);eq(markup,await old.evaluate(k=>practice2State.views[k].resultSpan.innerHTML,legacy.key),'mismatch text/red markup unchanged');}
   else{const badge=p.locator('.feedback-status-accepted');eq(await badge.evaluate(n=>getComputedStyle(n).color),theme==='light'?'rgb(22, 163, 74)':'rgb(74, 222, 128)','approved green');eq(await badge.locator('svg').evaluate(n=>[n.getBoundingClientRect().width,n.getBoundingClientRect().height]),[22,22],'22px check');eq(await badge.locator('circle').count(),0,'no enclosing circle');}
   eq(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'page fits');
  }
  // Explicit hold is a display fixture only, never a recognition classification.
  const key=await p.evaluate(()=>{const k=Object.keys(practice2State.views)[0];practice2State.savedResults[k]={rawTranscript:'これはほんです',isCorrect:false,judgment:'undetermined',expectedText:'これはほんです'};renderAll();return k;});await settle(p);
  const badge=p.locator('.feedback-status-undetermined');eq(await badge.count(),1,'explicit hold only');eq(await p.locator('.p21-retry-label:visible,.feedback-status-accepted').count(),0,'exclusive hold');eq(await badge.evaluate(n=>getComputedStyle(n).color),theme==='light'?'rgb(128, 100, 176)':'rgb(185, 162, 229)','approved purple');eq(await badge.locator('svg').evaluate(n=>[n.getBoundingClientRect().width,n.getBoundingClientRect().height]),[22,22],'22px footprints');
  await badge.hover();eq(await badge.locator('[role=tooltip]').isVisible(),true,'hover explanation');await p.mouse.move(0,0);await badge.focus();await p.keyboard.press('Shift+Tab');await p.keyboard.press('Tab');eq(await badge.evaluate(n=>n===document.activeElement),true,'Tab reaches hold');eq(await badge.locator('[role=tooltip]').isVisible(),true,'focus explanation');eq(await badge.getAttribute('aria-label'),'Could not be evaluated reliably.','accessible explanation');
  const snapshot=await p.evaluate(k=>JSON.stringify(practice2State.savedResults[k]),key);for(const value of ['hiragana','kanji']){await p.locator('#scriptModeControl [data-value="'+value+'"]').click();eq(await p.evaluate(k=>JSON.stringify(practice2State.savedResults[k]),key),snapshot,'script retains hold');eq(await p.locator('.feedback-status-undetermined').count(),1,'no duplicate after redraw');}
  const sets=p.locator('#drill1Container .p21-set-switcher button');await sets.nth(1).click();await sets.nth(0).click();eq(await p.evaluate(k=>JSON.stringify(practice2State.savedResults[k]),key),snapshot,'Set round trip retains explicit state');eq(await p.locator('.feedback-status-undetermined').count(),1,'Set round trip no duplicates');
  eq(await p.evaluate(k=>practice2State.views[k].resultSpan.querySelectorAll('span[style*="--error-text"]').length,key),0,'hold has no red mismatch spans');
  await p.screenshot({path:path.join(output,`${width}-${theme}-hold.png`),fullPage:true});await answer(p,'これはほんです。');eq(await p.locator('.feedback-status-undetermined').count(),0,'reanswer removes hold');await p.screenshot({path:path.join(output,`${width}-${theme}-accepted.png`),fullPage:true});
 }
 // Exercise existing error/audio-only paths with the same recorder mock on both commits.
 for(const scenario of ['no-speech','audio-only','recognition-error','cancel','microphone-denied'])for(const q of [p,old]){
  await q.evaluate(()=>{isAutoPlay=false;for(const id of ['toggleRecordMode','togglePlaybackMode']){const e=document.getElementById(id);if(e?.checked)e.click();}const key=Object.keys(practice2State.views)[0],v=practice2State.views[key];v.recordBtn.dataset.statusRecord='1';v.stopBtn.dataset.statusStop='1';t.speaking=true;});
  const before=await q.evaluate(()=>{const k=Object.keys(practice2State.views)[0];return {saved:JSON.stringify(practice2State.savedResults[k]),url:practice2State.audioUrls[k]||null};});
  if(scenario==='microphone-denied')await q.evaluate(()=>{t.deny=true;});
  await q.locator('[data-status-record]').click();
  if(scenario==='microphone-denied'){await q.waitForFunction(()=>!practice2State.startingRow&&!activeRecognitionSession);await q.evaluate(()=>{t.deny=false;});}
  else{
   await q.waitForFunction(()=>activeRecognitionSession?.recorder?.state==='recording');
   if(scenario!=='no-speech')await q.evaluate(()=>t.recognitions.at(-1).onspeechstart?.());
   if(scenario==='recognition-error')await q.evaluate(()=>t.recognitions.at(-1).onerror({error:'network'}));
   else if(scenario==='cancel')await q.evaluate(()=>activeRecognitionSession.stop('',true));
   else await q.locator('[data-status-stop]').click();
   await q.waitForFunction(()=>!activeRecognitionSession);
  }
  const after=await q.evaluate(()=>{const k=Object.keys(practice2State.views)[0];return {saved:JSON.stringify(practice2State.savedResults[k]),url:practice2State.audioUrls[k]||null};});
  eq(after.saved,before.saved,scenario+' keeps previous judgment unchanged');
  eq(scenario==='audio-only'?!!after.url:after.url===before.url,true,scenario+' existing audio retention');
  eq(await q.locator('.feedback-status-undetermined').count(),0,scenario+' does not become hold');
 }
 eq(await p.evaluate(()=>[FeedbackStatus.resolve({isCorrect:true}),FeedbackStatus.resolve({isCorrect:false}),FeedbackStatus.resolve({judgment:'undetermined'}),FeedbackStatus.resolve({audioOnly:true,isCorrect:false}),FeedbackStatus.resolve({unrecognized:true,isCorrect:false}),FeedbackStatus.resolve({})]),['accepted','mismatch','undetermined',null,null,null],'legacy mapping/error distinction');
 eq(p.errors,[],'no runtime errors');await p.close();await old.close();console.log(`PASS ${count}; FAIL 0; audio mocked; artifacts ${output}`);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
