// Regression: real mouse clicks and asynchronous recorder events. No acoustic claims.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=process.env.DRILL_ROOT || path.resolve(__dirname,'..');
const names=['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2'];
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
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 const ok=(condition,label)=>{assert(condition,label);checks++};
 async function open(name){const p=await browser.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.addInitScript(mock);await p.route('http://drill.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});let source=fs.readFileSync(file,'utf8');if(file.endsWith('drill-audio-session.js'))source+='\nconst reg=DrillAudio.registerPitch;DrillAudio.registerPitch=(s,f)=>{(window.states ||= []).push(s);reg(s,f)};';return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'})});await p.goto('http://drill.test/'+name+'.html');await p.waitForTimeout(50);if(name.startsWith('pronunciation'))await p.evaluate(()=>{estimateF0Frames=()=>[{time:0,f0:180},{time:.02,f0:190}];drawPitchCurve=(s,u,m)=>{s.drawn={u,m}};drawPitchPlaceholder=s=>{s.drawn={u:null,m:null}}});return p}

 async function record(p){
  await p.evaluate(()=>{
   t.speaking=true;
   const toggle=document.querySelector('#toggleRecordMode');if(toggle.checked)toggle.click();
   const rec=[...document.querySelectorAll('button')].find(b=>/^(🎙️|⏺️)とる/.test(b.textContent));
   if(!rec||rec.disabled)throw Error('record unavailable');rec.dataset.recordUnderTest='true';rec.click();
  });
  await p.waitForTimeout(400);
  await p.evaluate(()=>{
   const r=t.recognitions.at(-1),result=[{transcript:'私は学生です'}];result.isFinal=true;
   r?.onresult?.({resultIndex:0,results:[result]});r?.onspeechstart?.();
  });
  await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
 }
 const labels=p=>p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.textContent==='Playing...').length);
 for(const name of names){
  console.log("VERIFY",name);
  const p=await open(name);
  await record(p);

  ok(await labels(p)===2,name+' both labels during automatic model');
  const rate=name.startsWith('practice1.')?0.75:name.startsWith('practice7.')?0.8:0.9;
  assert.equal(await p.evaluate(()=>t.spoken.at(-1).rate),rate,name+' configured model TTS rate');checks++;
  ok(!await p.locator('#togglePlaybackMode').isDisabled(),name+' autoplay toggle available');
  await p.evaluate(()=>t.spoken.at(-1).onerror({error:'synthesis-failed'}));
  ok(await labels(p)===0,name+' error restores both labels');
  ok(await p.evaluate(()=>t.audios.length===0),name+' TTS error cancels own stage');
  ok(await p.locator('.play-recording-btn, .recorded-play-button').count()>0,name+' error keeps recording');
  await record(p);
  await p.locator('label:has(#togglePlaybackMode)').click();
  ok(!await p.locator('#togglePlaybackMode').isChecked(),name+' OFF accepted during model');
  ok(await labels(p)===2,name+' OFF keeps active relay labels');
  await p.evaluate(()=>{t.oldEnd=t.spoken.at(-1).onend;t.oldEnd()});
  ok(await p.evaluate(()=>t.audios.length===1&&!t.audios[0].paused),name+' OFF still proceeds to own stage');
  ok(await labels(p)===2,name+' both labels during own stage');
  ok(await p.evaluate(()=>t.audios.at(-1).playbackRate===1),name+' own audio rate is 1.0');
  await p.locator('label:has(#togglePlaybackMode)').click();
  ok(await p.locator('#togglePlaybackMode').isChecked(),name+' ON accepted during own stage');
  await p.locator('label:has(#togglePlaybackMode)').click();
  ok(await labels(p)===2,name+' own stage keeps both labels after mode changes');
  await p.evaluate(()=>t.audios.at(-1).onended());
  ok(await labels(p)===0,name+' completion restores both labels');
  const counts=await p.evaluate(()=>[t.spoken.length,t.audios.length]);
  await record(p);
  assert.deepEqual(await p.evaluate(()=>[t.spoken.length,t.audios.length]),counts,name+' next recording respects OFF');checks++;
  await p.locator('.play-recording-btn, .recorded-play-button').first().click();
  ok(await labels(p)===1,name+' manual own marks one button');
  await p.evaluate(()=>t.audios.at(-1).onended());
  const listen=p.locator('button').filter({hasText:/^🔊きく/}).first();
  await listen.click();ok(await labels(p)===1,name+' manual model marks one button');
  await p.evaluate(()=>t.spoken.at(-1).onend());
  ok(await labels(p)===0,name+' manual model restores label');
  // A new recording cancels the old relay, including late completion callbacks.
  await p.locator('label:has(#togglePlaybackMode)').click();await record(p);
  await p.evaluate(()=>{t.late=t.spoken.at(-1).onend});
  await p.evaluate(()=>{
   const other=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('🔊きく')&&!b.disabled);
   other.click();t.late();
  });
  ok(await p.evaluate(n=>t.audios.length===n,counts[1]+1),name+' old relay cannot revive after another model');
  ok(await labels(p)===1,name+' replacement model has only its own label');
  // Starting a new recording must cancel a relay's queued own playback too.
  await p.evaluate(()=>t.spoken.at(-1).onend());
  await record(p);
  const before=await p.evaluate(()=>{t.late=t.spoken.at(-1).onend;return t.audios.length});
  await p.locator('[data-record-under-test]').click();
  await p.evaluate(()=>t.late());
  await p.waitForTimeout(400);
  await p.evaluate(()=>{
   const r=t.recognitions.at(-1),result=[{transcript:'私は学生です'}];result.isFinal=true;
   r?.onresult?.({resultIndex:0,results:[result]});r?.onspeechstart?.();
  });
  ok(await labels(p)===0,name+' new recording restores old relay labels');
  ok(await p.evaluate(n=>t.audios.length===n,before),name+' new recording blocks old continuation');
  await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
  await p.evaluate(()=>t.spoken.at(-1).onend());
  ok(await p.evaluate(()=>!t.audios.at(-1).paused),name+' new relay own stage starts');
  await p.evaluate(()=>{
   t.oldAudio=t.audios.at(-1);t.lateAudio=t.oldAudio.onended;
  });
  await p.locator('[data-record-under-test]').click();
  await p.evaluate(()=>{
   t.lateAudio();
  });
  await p.waitForTimeout(400);
  await p.evaluate(()=>{
   const r=t.recognitions.at(-1),result=[{transcript:'私は学生です'}];result.isFinal=true;
   r?.onresult?.({resultIndex:0,results:[result]});r?.onspeechstart?.();
  });
  ok(await p.evaluate(()=>t.oldAudio.paused),name+' recording stops old own audio');
  ok(await labels(p)===0,name+' late own completion cannot affect new recording');
  await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
  if(name.startsWith('pronunciation')){
   ok((await p.locator('.pitch-lab-description').textContent()).includes('Copy the model’s pronunciation, rhythm, and timing.'),name+' adopted instruction');
   await p.evaluate(()=>states[0].listenBtn.click());await p.waitForTimeout(30);
   await p.evaluate(()=>t.spoken.at(-1).onerror({error:'synthesis-failed'}));
   ok(await p.evaluate(()=>t.tracks.every(track=>track.readyState==='ended')),name+' model TTS error releases microphone');
   ok(!await p.locator('#togglePlaybackMode').isDisabled(),name+' model TTS error releases settings');
   ok(await labels(p)===0,name+' model TTS error restores label');
  }
  assert.deepEqual(p.errors,[],name+' runtime errors');await p.close();
 }
 for(const manual of [true,false]) for(const part of ['q','a']) for(const phase of ['model','own']) {
  const p=await open('practice1.2');
  await p.evaluate(manual=>{document.querySelector('#speechStyleControl [data-value="formal"]').click();const toggle=document.querySelector('#toggleRecordMode');if(toggle.checked===manual)toggle.click();},manual);
  let card=p.locator('#drill1Container .drill-row').nth(4);
  await card.locator('button').filter({hasText:/^🙅/}).click();
  const rec=card.locator('tr').nth(part==='q'?0:1).locator('button').filter({hasText:/^🎙️とる/});
  await p.evaluate(()=>{t.speaking=true});await rec.click();await p.waitForTimeout(400);
  await p.evaluate(({manual,part})=>{const result=[{transcript:part==='q'?'妹はフリーターですか':'いいえフリーターじゃないです'}];result.isFinal=true; const r=t.recognitions.at(-1);r.onresult({resultIndex:0,results:[result]});r.onspeechstart();if(!manual)r.onend();},{manual,part});
  if(manual)await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(100);
  if(phase==='own')await p.evaluate(()=>t.spoken.at(-1).onend());
  ok(!await rec.isDisabled(),`1.2 sister ${manual}/${part}/${phase}: record available`);
  const next=part==='q'?card.locator('tr').nth(1).locator('button').filter({hasText:/^🎙️とる/}):p.locator('#drill2Container .drill-row').first().locator('button').filter({hasText:/^🎙️とる/}).first();
  await p.evaluate(()=>{t.old=t.audios.at(-1);t.before=t.recognitions.length;t.defer=true});
  await next.click();
  ok(await p.evaluate(()=>t.old?.paused??true),'specified row: own stops before mic permission');
  if(phase==='model')ok(await p.evaluate(()=>t.spoken.at(-1).onend===null),'specified row: TTS detached before mic permission');
  ok(await labels(p)===0,'specified row: relay labels restored');
  await p.close();
 }


 // Every page waits for asynchronous native speech cancellation before recording.
 for(const name of names) for(const release of [true,false]) {
  const p=await open(name);
  await p.evaluate(()=>{
   const no=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('🙅')&&!b.disabled);
   no?.click();
  });
  await record(p);
  await p.evaluate(()=>{
   const no=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('🙅')&&!b.disabled);
   const target=no?.closest('tr')?.querySelector('button');
   const inRow=no?.closest('tr');
   const rec=[...(inRow||document).querySelectorAll('button')].find(b=>/^(🎙️|⏺️)とる/.test(b.textContent)&&!b.disabled);
   if(!rec)throw Error('next record unavailable');rec.dataset.nextNative='true';
   t.nativeBusy=true;t.beforeNative=[t.requests.length,t.recorders.length,t.recognitions.length];
   Object.defineProperty(speechSynthesis,'speaking',{get:()=>t.nativeBusy});
   Object.defineProperty(speechSynthesis,'pending',{get:()=>false});
   t.lateNative=t.spoken.at(-1).onend;
  });
  await p.locator('[data-next-native]').click();await p.waitForTimeout(100);
  ok(await p.evaluate(()=>JSON.stringify(t.beforeNative)===JSON.stringify([t.requests.length,t.recorders.length,t.recognitions.length])),name+' native stop pending: no new microphone/recorder/recognition');
  if(release) {
   await p.evaluate(()=>{t.nativeBusy=false;t.lateNative()});await p.waitForTimeout(400);
   ok(await p.evaluate(()=>t.requests.length===t.beforeNative[0]+1&&t.recorders.length===t.beforeNative[1]+1),name+' native stopped: next recording starts');
   ok(await p.evaluate(()=>t.audios.length===0),name+' late model end cannot revive old own playback');
  } else {
   await p.waitForTimeout(2100);
   ok(await p.evaluate(()=>t.requests.length===t.beforeNative[0]),name+' stop timeout never starts microphone');
   ok(await p.locator('body').innerText().then(t=>t.includes('Playback is still stopping.')),name+' stop timeout notice');
   ok(!await p.locator('[data-next-native]').isDisabled(),name+' stop timeout releases controls');
  }
  assert.deepEqual(p.errors,[],name+' native stop runtime errors');await p.close();
 }
 await browser.close();console.log('PASS relay standard',checks);
})().catch(e=>{console.error(e);process.exit(1)});
