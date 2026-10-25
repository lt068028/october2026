// Regression: real mouse clicks and asynchronous recorder events. No acoustic claims.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=process.env.DRILL_ROOT || path.resolve(__dirname,'..');
const names=['composition1','pronunciation2','pronunciation1'];
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
 window.Audio=class extends EventTarget{constructor(url){super();this.url=url;this.duration=NaN;this.playbackRate=1;t.audios.push(this)}play(){this.paused=false;return t.rejectPlay?Promise.reject(Error('rejected')):Promise.resolve()}pause(){this.paused=true}};
 window.AudioContext=class{constructor(){this.state='running';this.sampleRate=48000}resume(){return Promise.resolve()}close(){this.state='closed';return Promise.resolve()}createMediaStreamSource(){return{connect(){},disconnect(){}}}createAnalyser(){return{fftSize:2048,getFloatTimeDomainData(a){a.fill(t.speaking?.08:0)},disconnect(){}}}decodeAudioData(){const buffer={sampleRate:48000,numberOfChannels:1,length:48000,getChannelData:()=>new Float32Array(48000)};if(t.decodeDefer)return new Promise(resolve=>t.decodes.push(()=>resolve(buffer)));return Promise.resolve(buffer)}};
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 async function open(name){const p=await browser.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.addInitScript(mock);await p.route('http://drill.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});let source=fs.readFileSync(file,'utf8');if(file.endsWith('drill-audio-session.js'))source+='\nconst reg=DrillAudio.registerPitch;DrillAudio.registerPitch=(s,f)=>{(window.states ||= []).push(s);reg(s,f)};';return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'})});await p.goto('http://drill.test/'+name+'.html');await p.waitForTimeout(50);if(name.startsWith('pronunciation'))await p.evaluate(()=>{window.originalEstimateF0Frames=estimateF0Frames;window.originalEstimateFrameF0=estimateFrameF0;window.originalMedian=calculateMedian;estimateF0Frames=()=>[{time:0,f0:180},{time:.02,f0:190}];drawPitchCurve=(s,u,m)=>{s.drawn={u,m}};drawPitchPlaceholder=s=>{s.drawn={u:null,m:null}}});return p}
 async function start(p,index=0,lab=false){
  await p.evaluate(({index,lab})=>{
   t.speaking=true;
   const toggle=document.querySelector('#toggleRecordMode');if(toggle.checked)toggle.click();
   const rec=lab?states[index].recordBtn:[...document.querySelectorAll('#drill1List button,#drill1Container button')].filter(b=>b.textContent.startsWith('🎙️とる'))[index];
   if(rec.disabled)throw Error('record disabled before start '+index);
   document.querySelector('[data-test-record]')?.removeAttribute('data-test-record');rec.setAttribute('data-test-record','');
  },{index,lab});
  await p.locator('[data-test-record]').click();
  await p.waitForTimeout(360);
  await p.evaluate(()=>{
   const r=t.recognitions.at(-1),result=[{transcript:'私は学生です'}];result.isFinal=true;
   r?.onresult?.({resultIndex:0,results:[result]});r?.onspeechstart?.();
  });
 }
 async function finish(p){
  await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(70);
 }

 const ok=(condition,message)=>{assert(condition,message);checks++};
 // Every page's normal TTS path must terminate without waiting for a browser event.
 for(const name of ['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2']){
  const p=await open(name);await p.clock.install();await p.clock.pauseAt(Date.now()+1000);
  await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.textContent.startsWith('🔊きく')).click());
  ok(await p.evaluate(()=>t.spoken.length>0),name+' actual TTS entry point started');
  await p.clock.fastForward(20001);
  ok(await p.evaluate(()=>![...document.querySelectorAll('button')].some(b=>b.textContent==='Playing...')),name+' TTS watchdog restores labels');
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),name+' watchdog releases setting controls');
  assert.deepEqual(p.errors,[],name+' timeout runtime errors');await p.close();
 }
 const seedP2=p=>p.evaluate(()=>{savedAudioUrls[0]='blob:saved';savedResults[0]={rawTranscript:'天気がいいです'};p2Show(p2.views[0])});
 const pair=p=>p.evaluate(()=>[p2.views[0].listen.textContent,p2.views[0].result.querySelector('.play-recording-btn').textContent]);
 // Timed-out TTS cancels the whole relay; late completion cannot affect a new task.
 {
  const p=await open('pronunciation2');await p.clock.install();await p.clock.pauseAt(Date.now()+1000);await seedP2(p);
  await p.evaluate(()=>{p2Play(0,true,true);t.oldEnd=t.spoken.at(-1).onend});
  await p.clock.fastForward(20001);
  ok((await pair(p)).every(s=>s!=='Playing...'),'TTS deadline restores both labels');
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),'TTS deadline releases Autoplay');
  ok(await p.evaluate(()=>t.audios.length===0),'TTS timeout does not start own audio');
  ok(await p.evaluate(()=>savedAudioUrls[0]==='blob:saved'),'TTS timeout keeps recording');
  ok((await p.locator('#audioRecoveryStatus').textContent()).includes('timed out'),'TTS timeout reports retry');
  await p.evaluate(()=>{p2Play(1);t.newUtterance=t.spoken.at(-1);t.oldEnd()});
  ok(await p.evaluate(()=>speechSynthesis.current===t.newUtterance),'late TTS callback cannot stop new playback');
  await p.evaluate(()=>t.spoken.at(-1).onend());
  await p.clock.fastForward(20001);
  ok(await p.locator('#audioRecoveryStatus').isHidden(),'normal completion cancels its watchdog');
  assert.deepEqual(p.errors,[]);await p.close();
 }
 // Audio metadata shortens the fallback deadline to actual duration + 3 seconds.
 {
  const p=await open('pronunciation2');await p.clock.install();await p.clock.pauseAt(Date.now()+1000);await seedP2(p);
  await p.evaluate(()=>{p2Play(0,false);const a=t.audios.at(-1);a.duration=4;a.dispatchEvent(new Event('loadedmetadata'));t.oldAudioEnd=a.onended});
  await p.clock.fastForward(6999);
  ok((await pair(p))[1]==='Playing...','known duration does not expire before margin');
  await p.clock.fastForward(2);
  ok(await p.evaluate(()=>t.audios.at(-1).paused),'duration + 3 seconds pauses Audio');
  ok((await pair(p))[1].startsWith('▶️'),'Audio timeout restores button');
  ok(await p.evaluate(()=>savedAudioUrls[0]==='blob:saved'),'Audio timeout keeps URL');
  await p.evaluate(()=>{p2Play(0,false);t.newAudio=t.audios.at(-1);t.oldAudioEnd()});
  ok(await p.evaluate(()=>!t.newAudio.paused),'late Audio completion cannot stop a new task');
  await p.clock.fastForward(22999);
  ok((await pair(p))[1]==='Playing...','unknown duration permits 23 seconds');
  await p.clock.fastForward(2);
  ok((await pair(p))[1].startsWith('▶️'),'unknown duration fallback expires');
  await p.evaluate(()=>{t.rejectPlay=true;p2Play(0,false)});await p.waitForTimeout(10);
  ok((await pair(p))[1].startsWith('▶️'),'play rejection restores button');
  ok(await p.evaluate(()=>savedAudioUrls[0]==='blob:saved'),'rejection keeps saved recording');
  assert.deepEqual(p.errors,[]);await p.close();
 }
 // Composition manual and relay playback use the same visible states as pronunciation 2.
 {
  const p=await open('composition1');
  await p.evaluate(()=>{savedAudioUrls[0]='blob:composition';savedResults[0]={rawTranscript:'天気がいいです'};compositionShow(compositionState.views[0])});
  const labels=()=>p.evaluate(()=>{const v=compositionState.views[0];return[v.listenBtn.textContent,v.resultSpan.querySelector('.play-recording-btn').textContent]});
  await p.evaluate(()=>compositionState.views[0].listenBtn.click());
  ok((await labels())[0]==='Playing...'&&(await labels())[1].startsWith('▶️'),'composition manual model marks only listen');
  await p.evaluate(()=>t.spoken.at(-1).onend());
  ok((await labels())[0].startsWith('🔊きく'),'composition model restores label');
  await p.evaluate(()=>compositionState.views[0].resultSpan.querySelector('.play-recording-btn').click());
  ok((await labels())[0].startsWith('🔊きく')&&(await labels())[1]==='Playing...','composition manual own marks only own');
  await p.evaluate(()=>t.audios.at(-1).onended());
  await p.evaluate(()=>compositionPlay(0,'天気がいいです',false,true));
  ok((await labels()).every(s=>s==='Playing...'),'composition relay marks both during model');
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),'composition relay permits Autoplay changes');
  await p.evaluate(()=>t.spoken.at(-1).onend());
  ok((await labels()).every(s=>s==='Playing...'),'composition relay marks both during own');
  await p.evaluate(()=>t.audios.at(-1).onended());
  ok((await labels()).every(s=>s!=='Playing...'),'composition completion restores both');
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),'composition relay unlocks Autoplay');
  assert.deepEqual(p.errors,[]);await p.close();
 }
 // Actual Lab recording: decode and close both hang; deadline must still release UI.
 for(const name of ['pronunciation1','pronunciation2']){
  const p=await open(name);await p.clock.install();await p.clock.pauseAt(Date.now()+1000);
  await p.evaluate(()=>{
   t.decodeDefer=true;t.speaking=true;
   t.originalClose=AudioContext.prototype.close;
   AudioContext.prototype.close=function(){this.state='closing';return new Promise(()=>{})};
   const auto=document.querySelector('#togglePlaybackMode');if(auto.checked)auto.click();
   const stop=document.querySelector('#toggleRecordMode');if(stop.checked)stop.click();
   states[0].recordBtn.click();
  });await p.waitForTimeout(10);await p.clock.runFor(400);
  await p.evaluate(()=>document.querySelector('.stop-btn-active').click());await p.clock.runFor(1);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>states[0].audioBlob?.size>0),name+' saves recording before decoding');
  ok(await p.evaluate(()=>t.decodes.length===1),name+' decode is pending');
  await p.evaluate(()=>{t.oldDecode=t.decodes.shift();t.savedBlob=states[0].audioBlob});
  await p.clock.fastForward(10001);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>states[0].audioBlob===t.savedBlob),name+' analysis timeout keeps Blob');
  ok(await p.evaluate(()=>!states[0].recordBtn.disabled&&!states[0].playBtn.disabled),name+' analysis timeout permits replay and rerecord');
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),name+' analysis timeout releases settings');
  ok(await p.evaluate(()=>t.audios.length===0),name+' analysis timeout does not trigger delayed autoplay');
  ok(await p.evaluate(()=>t.tracks.every(track=>track.readyState==='ended')),name+' analysis timeout leaves no microphone running');
  await p.evaluate(()=>{states[0].playBtn.click()});
  ok(await p.evaluate(()=>t.audios.length===1&&!t.audios[0].paused),name+' saved recording can be replayed after timeout');
  await p.evaluate(()=>t.audios.at(-1).onended());
  await p.evaluate(()=>{t.decodeDefer=false;AudioContext.prototype.close=t.originalClose;states[0].recordBtn.click()});
  await p.waitForTimeout(10);await p.clock.runFor(400);
  await p.evaluate(()=>document.querySelector('.stop-btn-active').click());await p.clock.runFor(1);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>states[0].f0Frames?.length>0&&!states[0].recordBtn.disabled),name+' successful rerecord after timeout');
  await p.evaluate(()=>{t.currentFrames=states[0].f0Frames;t.oldDecode()});await p.waitForTimeout(20);
  ok(await p.evaluate(()=>states[0].f0Frames===t.currentFrames),name+' late decode cannot overwrite new curve');
  assert.deepEqual(p.errors,[]);await p.close();
 }
 // Model analysis has the same 10-second bound and ignores an old decoder result.
 for(const name of ['pronunciation1','pronunciation2']){
  const p=await open(name);await p.clock.install();await p.clock.pauseAt(Date.now()+1000);
  await p.evaluate(()=>{t.decodeDefer=true;states[0].listenBtn.click()});await p.waitForTimeout(20);
  await p.evaluate(()=>t.spoken.at(-1).onend());await p.clock.runFor(221);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>t.decodes.length===1),name+' model decode pending');
  await p.evaluate(()=>{t.oldDecode=t.decodes.shift()});
  await p.clock.fastForward(10001);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>!states[0].recordBtn.disabled),name+' model analysis deadline unlocks record');
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),name+' model deadline unlocks settings');
  ok(await p.evaluate(()=>t.tracks.every(track=>track.readyState==='ended')),name+' model deadline stops mic');
  await p.evaluate(()=>{t.decodeDefer=false;states[0].listenBtn.click()});await p.waitForTimeout(20);
  await p.evaluate(()=>t.spoken.at(-1).onend());await p.clock.runFor(221);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>states[0].modelF0Frames?.length>0),name+' model retry succeeds');
  await p.evaluate(()=>{t.currentFrames=states[0].modelF0Frames;t.oldDecode()});await p.waitForTimeout(20);
  ok(await p.evaluate(()=>states[0].modelF0Frames===t.currentFrames),name+' stale model decode cannot overwrite retry');
  assert.deepEqual(p.errors,[]);await p.close();
 }
 // Native worker keeps the exact existing algorithm and can be interrupted even if CPU-bound.
 for(const name of ['pronunciation1','pronunciation2']){
  const p=await open(name);
  const parity=await p.evaluate(async()=>{
   window.Worker=NativePitchWorker;
   const samples=new Float32Array(12000),rate=24000;
   for(let i=0;i<samples.length;i++)samples[i]=.1*Math.sin(2*Math.PI*180*i/rate);
   const expected=originalEstimateF0Frames(samples.slice(),rate,false);
   const a=DrillAudio.beginAnalysis(states[0]);
   try{
    const actual=await a.frames(samples,rate,false,{estimateF0Frames:originalEstimateF0Frames,estimateFrameF0:originalEstimateFrameF0,calculateMedian:originalMedian});
    return {equal:JSON.stringify(actual)===JSON.stringify(expected),voiced:actual.some(f=>f.f0>0)};
   }finally{a.finish()}
  });
  ok(parity.equal,name+' real Worker matches original pitch algorithm');
  ok(parity.voiced,name+' native worker detects generated voiced waveform');
  await p.clock.install();await p.clock.pauseAt(Date.now()+1000);
  await p.evaluate(()=>{
   const a=DrillAudio.beginAnalysis(states[0]);t.cpuAnalysis=a;
   a.frames(new Float32Array(1024),24000,false,{estimateF0Frames:function(){for(;;){}},estimateFrameF0:()=>0,calculateMedian:()=>0})
    .then(()=>{t.cpuResult='unexpected'},error=>{t.cpuResult=error.name}).finally(()=>a.finish());
  });await p.waitForTimeout(50);
  ok(await p.evaluate(()=>42)===42,name+' CPU-bound worker does not block page');
  await p.clock.fastForward(10001);await p.waitForTimeout(20);
  ok(await p.evaluate(()=>t.cpuResult==='TimeoutError'&&t.cpuAnalysis.worker===null),name+' native CPU-bound worker terminated at deadline');
  assert.deepEqual(p.errors,[]);await p.close();
 }
 await browser.close();console.log('PASS recovery',checks);
})().catch(e=>{console.error(e);process.exit(1)});
