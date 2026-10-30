// Controlled lifecycle/late-event tests; successful recording transitions are in audio-transitions.cjs.
const {chromium}=require('playwright');
const fs=require('fs'); const assert=require('assert');
const root=(process.env.DRILL_ROOT || require('path').resolve(__dirname,'..'))+'/';
const pages=['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','practice8.1','composition1','pronunciation1','pronunciation2'];
function instrument(path,source){
 if(path==='drill-audio-session.js')return source+`;const originalRegister=DrillAudio.registerPitch;DrillAudio.registerPitch=(state,redraw)=>{(window.__states ||= []).push(state);originalRegister(state,redraw)};`;
 if(pages.some(p=>path===p+'.js')){
  const extra=['practice7.3.js','practice8.1.js'].includes(path)?`window.__speak=done=>speak('テスト',null,done);window.__stop=stopPlayback;`:`window.__speak=done=>speakText('テスト',0.9,done);window.__stop=stopAllPlayback;`;
  if(['practice7.3.js','practice8.1.js'].includes(path)){const pos=source.lastIndexOf('})();');return source.slice(0,pos)+extra+source.slice(pos)}
  return source+'\n'+extra;
 }
 return source;
}
const mock=()=>{
 window.testAudio={spoken:[],tracks:[],requests:[],reject:false,defer:false,decodes:[]};
 const synth={addEventListener(){},getVoices:()=>[{name:'Google A',voiceURI:'a',lang:'ja-JP'},{name:'Google B',voiceURI:'b',lang:'ja-JP'}],
 speak(u){testAudio.spoken.push(u);this.current=u},cancel(){const u=this.current;this.current=null;u?.onerror?.({error:'canceled'})},onvoiceschanged:null};
 Object.defineProperty(window,'speechSynthesis',{value:synth});
 Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text}}});
 Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise((resolve,reject)=>{
 const complete=()=>{if(testAudio.reject){reject(new DOMException('Denied','NotAllowedError'));return}const track={readyState:'live',stop(){this.readyState='ended'},addEventListener(){}};testAudio.tracks.push(track);resolve({getTracks:()=>[track]})};
 testAudio.requests.push(complete);if(!testAudio.defer)complete();})}});
 window.NativePitchWorker=window.Worker;
 window.Worker=class{
  constructor(){(testAudio.workers ||= []).push(this)}
  postMessage(){if(testAudio.workerHang)return;queueMicrotask(()=>{if(!this.terminated)this.onmessage?.({data:{frames:[{time:0,f0:180},{time:.02,f0:190}]}})})}
  terminate(){this.terminated=true}
 };
 window.MediaRecorder=class {constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm'}start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['audio'])});this.onstop?.()}};
 window.SpeechRecognition=class{start(){}stop(){this.onend?.()}abort(){this.onend?.()}};
 window.Audio=class{constructor(url){this.url=url;this.paused=false}play(){return Promise.resolve()}pause(){this.paused=true}};
 window.AudioContext=class{constructor(){this.state='running';this.sampleRate=48000}close(){this.state='closed';return Promise.resolve()}resume(){return Promise.resolve()}createMediaStreamSource(){return {connect(){},disconnect(){}}}createAnalyser(){return {fftSize:2048,getFloatTimeDomainData(a){a.fill(0)},disconnect(){}}}decodeAudioData(){return new Promise(resolve=>testAudio.decodes.push(()=>resolve({sampleRate:48000,numberOfChannels:1,length:48000,getChannelData:()=>new Float32Array(48000)})))}};
};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
let checks=0;
async function open(name){const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('http://drill.test/**',route=>{const path=new URL(route.request().url()).pathname.slice(1);const file=root+path;if(fs.existsSync(file))return route.fulfill({body:instrument(path,fs.readFileSync(file,'utf8')),contentType:path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html'});return route.fulfill({status:404,body:''})});await page.addInitScript(mock);await page.goto('http://drill.test/'+name+'.html');await page.waitForTimeout(60);assert.deepEqual(errors,[],name+' load errors '+JSON.stringify(errors));page.__errors=errors;return page}
for(const name of pages){
 const p=await open(name);console.log('LOAD',name);checks++;
 await p.evaluate(()=>{testAudio.chained=0;__speak(()=>testAudio.chained++);testAudio.late=testAudio.spoken.at(-1).onend;});
 // Starting another row must invalidate even an already-queued old finish event.
 await p.evaluate(()=>{const listen=[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.textContent.startsWith('🔊きく'));if(!listen)throw Error('no listen');listen.click();testAudio.late();});
 assert.equal(await p.evaluate(()=>testAudio.chained),0,name+' stale autoplay callback');checks++;

 await p.evaluate(()=>{testAudio.scrollUtterance=testAudio.spoken.at(-1);window.dispatchEvent(new Event('scroll'))});
 assert.equal(await p.evaluate(()=>speechSynthesis.current===testAudio.scrollUtterance),true,name+' scrolling preserves playback');checks++;
 await p.evaluate(()=>__stop());
 await p.evaluate(()=>{__speak(()=>testAudio.normal=(testAudio.normal||0)+1);testAudio.spoken.at(-1).onend()});
 assert.equal(await p.evaluate(()=>testAudio.normal),1,name+' normal continuation retained');checks++;
 await p.evaluate(()=>{
   testAudio.audioEnded=0;testAudio.audioError=0;
   const a=new Audio('old');a.play=()=>new Promise((resolve,reject)=>testAudio.rejectPlay=reject);
   a.onended=()=>testAudio.audioEnded++;
   DrillAudio.play(a,()=>testAudio.audioError++);testAudio.oldAudioEnd=a.onended;
   __stop();testAudio.oldAudioEnd();testAudio.rejectPlay(Error('late rejection'));
 });await p.waitForTimeout(10);
 assert.equal(await p.evaluate(()=>testAudio.audioEnded),0,name+' stale Audio end ignored');checks++;
 assert.equal(await p.evaluate(()=>testAudio.audioError),0,name+' stale Audio rejection ignored');checks++;


 await p.evaluate(()=>{
   __speak(()=>testAudio.chained++);testAudio.late=testAudio.spoken.at(-1).onend;
   testAudio.defer=true;
   const toggle=document.querySelector('#toggleRecordMode');if(toggle?.checked)toggle.click();
   const rec=[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.textContent.startsWith('🎙️とる'));
   if(!rec)throw Error('no enabled recording button');rec.click();
 });
 await p.waitForTimeout(50);
 assert.equal(await p.locator('#voiceDropdownBtn').isDisabled(),true,name+' pending Voice lock');checks++;
 await p.evaluate(()=>testAudio.late());assert.equal(await p.evaluate(()=>testAudio.chained),0,name+' record start cancels autoplay');checks++;
 assert.equal(await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.textContent.startsWith('🎙️とる')).every(b=>b.disabled)),true,name+' pending other rows locked');checks++;
 await p.evaluate(()=>testAudio.requests.at(-1)());await p.waitForTimeout(40);
 assert.equal(await p.locator('#voiceDropdownBtn').isDisabled(),true,name+' recording Voice lock');checks++;
 assert.equal(await p.locator('.stop-btn-active:not(:disabled)').count(),1,name+' Manual stop usable');checks++;
 await p.evaluate(()=>document.querySelector('.stop-btn-active').click());await p.waitForTimeout(50);
 assert.equal(await p.locator('#voiceDropdownBtn').isDisabled(),false,name+' Voice unlocked');checks++;
 assert.equal(await p.evaluate(()=>testAudio.tracks.every(t=>t.readyState==='ended')),true,name+' tracks stopped');checks++;
 assert.deepEqual(p.__errors,[],name+' runtime errors');await p.close();
}
for(const name of pages){
 for(const pending of [true,false]){
  const p=await open(name);console.log('LEAVE',name,pending);
  await p.evaluate(pending=>{testAudio.defer=pending;const rec=[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.textContent.startsWith('🎙️とる'));rec.click()},pending);await p.waitForTimeout(30);
  // Capture handler must run while allowing native link navigation.
  await p.evaluate(()=>{history.back=()=>{};document.querySelector('.back-link').addEventListener('click',e=>e.preventDefault());document.querySelector('.back-link').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))});
  if(pending)await p.evaluate(()=>testAudio.requests.at(-1)());
  await p.waitForTimeout(30);
  assert.equal(await p.evaluate(()=>testAudio.tracks.every(t=>t.readyState==='ended')),true,name+' leave cleanup pending='+pending);checks++;
  assert.equal(await p.evaluate(()=>testAudio.spoken.length),0,name+' no autoplay after leave');checks++;
  assert.deepEqual(p.__errors,[],name+' leave errors');await p.close();
 }
}
for(const name of ['pronunciation1','pronunciation2']){
 const p=await open(name);
 await p.evaluate(()=>{drawPitchCurve=(s,u,m)=>{s.__drawn={u,m}};drawPitchPlaceholder=(s)=>{s.__drawn={u:null,m:null}};estimateF0Frames=()=>[{time:0,f0:180},{time:.02,f0:190}];});
 const start=async(defer=false)=>{await p.evaluate(defer=>{testAudio.defer=defer;__states[0].listenBtn.click()},defer);await p.waitForTimeout(30)};
 const end=async()=>{await p.evaluate(()=>testAudio.spoken.at(-1).onend());await p.waitForTimeout(250)};
 await p.evaluate(()=>{__states[0].f0Frames=[{time:0,f0:150}];__states[0].audioBlob=new Blob(['own']);__states[0].audioUrl='blob:own'});
 // Cancel permission wait by moving to another task, then allow the old request.
 await start(true);
 assert.equal(await p.locator('#voiceDropdownBtn').isDisabled(),true,name+' model pending lock');checks++;
 if(name==='pronunciation2'){
   assert.equal(await p.locator('#speechStyleControl [data-value="informal"]').isDisabled(),true,'style locked during model wait');checks++;
 }

 await p.evaluate(()=>{document.querySelectorAll('.pitch-pair-choice')[1].click();testAudio.requests.at(-1)()});await p.waitForTimeout(30);
 assert.equal(await p.evaluate(()=>testAudio.tracks.every(t=>t.readyState==='ended')),true,name+' late granted stream stopped');checks++;
 await p.evaluate(()=>document.querySelectorAll('.pitch-pair-choice')[0].click());
 // Normal capture then Voice A -> B: clear only model, including cached states.
 await start();await end();assert.equal(await p.evaluate(()=>testAudio.decodes.length),1,name+' model decode started');checks++;
 await p.evaluate(()=>testAudio.decodes.shift()());await p.waitForTimeout(30);
 assert.equal(await p.evaluate(()=>__states[0].modelF0Frames.length),2,name+' model drawn');checks++;
 await p.evaluate(()=>{document.querySelector('#voiceDropdownBtn').click();document.querySelectorAll('#voiceDropdownMenu li')[1].click()});await p.waitForTimeout(30);
 assert.equal(await p.evaluate(()=>__states.every(s=>s.modelF0Frames===null)),true,name+' all cached models cleared');checks++;
 assert.equal(await p.evaluate(()=>__states[0].f0Frames[0].f0),150,name+' user line retained');checks++;
 assert.equal(await p.evaluate(()=>__states[0].audioBlob.size),3,name+' own recording retained');checks++;
 // Cancel during decode; an old result must not overwrite new conditions.
 await start();await end();await p.evaluate(()=>document.querySelectorAll('.pitch-pair-choice')[1].click());
 await p.evaluate(()=>testAudio.decodes.shift()());await p.waitForTimeout(30);
 assert.equal(await p.evaluate(()=>__states[0].modelF0Frames),null,name+' cancelled decode ignored');checks++;
 await p.evaluate(()=>document.querySelectorAll('.pitch-pair-choice')[0].click());
 // Double click/next task during actual model playback, not just permission wait.
 await start();const spoken=await p.evaluate(()=>testAudio.spoken.length);
 await p.evaluate(()=>{__states[0].listenBtn.click();document.querySelectorAll('.pitch-pair-choice')[1].click()});await p.waitForTimeout(30);
 assert.equal(await p.evaluate(()=>testAudio.tracks.every(t=>t.readyState==='ended')),true,name+' playback interruption stops mic');checks++;
 assert.equal(await p.evaluate(()=>testAudio.spoken.length),spoken,name+' disabled model double click ignored');checks++;
 await p.evaluate(()=>document.querySelectorAll('.pitch-pair-choice')[0].click());
 // Speech style changes clear the prior model but retain the user's curve.
 if(name==='pronunciation2'){
  await start();await end();await p.evaluate(()=>testAudio.decodes.shift()());await p.waitForTimeout(30);
  await p.evaluate(()=>document.querySelector('#speechStyleControl [data-value="informal"]').click());await p.waitForTimeout(30);
  assert.equal(await p.evaluate(()=>__states[0].modelF0Frames),null,'style change clears old model');checks++;
  assert.equal(await p.evaluate(()=>__states[0].f0Frames[0].f0),150,'style change retains user curve');checks++;
 }
 // Permission denial must not retry or leave locks/mic behind.
 await p.evaluate(()=>{testAudio.reject=true});const requests=await p.evaluate(()=>testAudio.requests.length);
 await start();await p.evaluate(()=>testAudio.spoken.at(-1).onend());await p.waitForTimeout(30);
 assert.equal(await p.evaluate(()=>testAudio.requests.length),requests+1,name+' denial not retried');checks++;
 assert.equal(await p.locator('#voiceDropdownBtn').isDisabled(),false,name+' denial unlock');checks++;
 assert.equal(await p.evaluate(()=>testAudio.tracks.every(t=>t.readyState==='ended')),true,name+' no leaked mic');checks++;
 await p.evaluate(()=>{testAudio.reject=false});await start();
 await p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await p.waitForTimeout(20);
 assert.equal(await p.evaluate(()=>testAudio.tracks.every(t=>t.readyState==='ended')),true,name+' model pagehide releases mic');checks++;
 assert.deepEqual(p.__errors,[],name+' pitch runtime errors');await p.close();console.log('PITCH',name);
}
await browser.close();console.log('PASS',checks);
})().catch(e=>{console.error(e);process.exit(1)});
