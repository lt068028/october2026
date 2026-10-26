const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
function mock(){
 window.t={spoken:[],audios:[],tracks:[],recorders:[],recognitions:[],requests:[],defer:false,deny:false,decodeDefer:false,decodes:[],speaking:false};
 Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{name:'Google A',voiceURI:'a',lang:'ja-JP'},{name:'Google B',voiceURI:'b',lang:'ja-JP'}],addEventListener(){},onvoiceschanged:null,speak(u){t.spoken.push(u);this.current=u},cancel(){const u=this.current;this.current=null;u?.onerror?.({error:'canceled'})}}});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise((resolve,reject)=>{const finish=()=>{if(t.deny)return reject(new DOMException('Denied','NotAllowedError'));const track={readyState:'live',stop(){this.readyState='ended'},addEventListener(){}};t.tracks.push(track);resolve({getTracks:()=>[track]})};t.requests.push(finish);if(!t.defer)finish()})}});
 window.NativePitchWorker=window.Worker;
 window.Worker=class{
  constructor(){(t.workers ||= []).push(this)}
  postMessage(){if(t.workerHang)return;queueMicrotask(()=>{if(!this.terminated)this.onmessage?.({data:{frames:[{time:0,f0:180},{time:.02,f0:190}]}})})}
  terminate(){this.terminated=true}
 };
 window.MediaRecorder=class{constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm';t.recorders.push(this)}start(){this.state='recording'}stop(){this.state='inactive';setTimeout(()=>{this.ondataavailable?.({data:new Blob(['recorded'])});this.onstop?.()},0)}};
 window.SpeechRecognition=class{constructor(){t.recognitions.push(this)}start(){}stop(){setTimeout(()=>this.onend?.(),0)}abort(){setTimeout(()=>this.onend?.(),0)}};
 window.Audio=class{constructor(url){this.url=url;t.audios.push(this)}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}};
 window.AudioContext=class{constructor(){this.state='running';this.sampleRate=48000}resume(){return Promise.resolve()}close(){this.state='closed';return Promise.resolve()}createMediaStreamSource(){return{connect(){},disconnect(){}}}createAnalyser(){return{fftSize:2048,getFloatTimeDomainData(a){a.fill(t.speaking?.08:0)},disconnect(){}}}decodeAudioData(){const buffer={sampleRate:48000,numberOfChannels:1,length:48000,getChannelData:()=>new Float32Array(48000)};if(t.decodeDefer)return new Promise(resolve=>t.decodes.push(()=>resolve(buffer)));return Promise.resolve(buffer)}};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(mock);
 await p.route('http://drill.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);return fs.existsSync(file)?r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'}):r.fulfill({status:404,body:''})});
 await p.goto('http://drill.test/practice2.1.html');let count=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 check(await p.locator('.example-box').count(),1,'Ex1 only');check(await p.locator('.drill-row').count(),0,'Drills deferred');
 check(await p.locator('.p21-item-audio button').count(),6,'six audio buttons near objects');
 check(await p.locator('.p21-photo').evaluate(im=>im.complete&&im.naturalWidth>0),true,'photo loaded');
 check(await p.locator('.p21-model-line').count(),6,'six models below diagram');
 check(await p.locator('.p21-model-group h3 .target-word').allTextContents(),['ほん','かばん','とけい'],'three distinct objects');
 check(await p.locator('.p21-distance-person').count(),2,'only two people');
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  for(const [object,noun] of [[1,'ほん'],[2,'かばん'],[3,'とけい']])for(const speaker of ['A','B']) {
   await p.locator(`.p21-item-audio button[data-speaker="${speaker}"][data-object="${object}"]`).click();
   const text=await p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
   const pro=object===3?'あれ':(speaker==='A'?object===1:object===2)?'これ':'それ';
   check(text,pro+'は'+noun+(style==='formal'?'です':'だ'),'speaker-relative model');
   check(await p.locator('.p21-photo-context').textContent(),speaker+' is speaking','speaker context');
   check(await p.locator('.p21-person-caption').allTextContents(),['A','B'],'person labels remain fixed');
   check(await p.locator('[data-zone="A"] .p21-area-sound').textContent(),speaker==='A'?'こ':'そ','A area sound follows speaker');
   check(await p.locator('[data-zone="B"] .p21-area-sound').textContent(),speaker==='B'?'こ':'そ','B area sound follows speaker');
   check(await p.locator('[data-zone="far"] .p21-area-sound').textContent(),'あ','far sound stable');
   check(await p.locator('.p21-model-line[aria-current="true"]').getAttribute('data-model-speaker'),speaker,'current text identified');
  }
 }
 await p.locator('.p21-item-audio button[data-speaker="A"][data-object="1"]').click();
 await p.evaluate(()=>{t.late21=t.spoken.at(-1).onend;});
 await p.locator('.p21-item-audio button[data-speaker="B"][data-object="1"]').click();
 await p.evaluate(()=>t.late21?.());
 check(await p.locator('.p21-item-audio button[data-speaker="A"][data-object="1"]').isEnabled(),true,'previous audio button restored');
 check(await p.locator('.p21-item-audio button[data-speaker="B"][data-object="1"]').isDisabled(),true,'new audio remains playing after stale callback');
 check(await p.locator('.p21-person-caption').allTextContents(),['A','B'],'person labels remain fixed after stale callback');
 check(await p.locator('.p21-distance-board').getAttribute('data-speaker'),'B','stale audio cannot change perspective');
 await p.evaluate(()=>t.spoken.at(-1).onend?.());
 for(const width of [600,900,1440,1920])for(const theme of ['light','dark']) {
  await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
  check(await p.locator('.example-box,.p21-distance-board,.p21-distance-area,.p21-model-group').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,'no horizontal overflow');
 }
 check(await p.locator('button .custom-tip-box').evaluateAll(es=>es.some(t=>/^Listen/.test(t.textContent))),false,'no routine explanations');
 check(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 2.1 Example 1',count);
})().catch(e=>{console.error(e);process.exit(1)});
