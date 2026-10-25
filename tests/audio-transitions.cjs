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
 window.MediaRecorder=class{constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm';t.recorders.push(this)}start(){this.state='recording'}stop(){this.state='inactive';setTimeout(()=>{this.ondataavailable?.({data:new Blob(['recorded'])});this.onstop?.()},0)}};
 window.SpeechRecognition=class{constructor(){t.recognitions.push(this)}start(){}stop(){setTimeout(()=>this.onend?.(),0)}abort(){setTimeout(()=>this.onend?.(),0)}};
 window.Audio=class{constructor(url){this.url=url;t.audios.push(this)}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}};
 window.AudioContext=class{constructor(){this.state='running';this.sampleRate=48000}resume(){return Promise.resolve()}close(){this.state='closed';return Promise.resolve()}createMediaStreamSource(){return{connect(){},disconnect(){}}}createAnalyser(){return{fftSize:2048,getFloatTimeDomainData(a){a.fill(t.speaking?.08:0)},disconnect(){}}}decodeAudioData(){const buffer={sampleRate:48000,numberOfChannels:1,length:48000,getChannelData:()=>new Float32Array(48000)};if(t.decodeDefer)return new Promise(resolve=>t.decodes.push(()=>resolve(buffer)));return Promise.resolve(buffer)}};
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 async function open(name){const p=await browser.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.addInitScript(mock);await p.route('http://drill.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});let source=fs.readFileSync(file,'utf8');if(file.endsWith('drill-audio-session.js'))source+='\nconst reg=DrillAudio.registerPitch;DrillAudio.registerPitch=(s,f)=>{(window.states ||= []).push(s);reg(s,f)};';return r.fulfill({body:source,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'})});await p.goto('http://drill.test/'+name+'.html');await p.waitForTimeout(50);if(name.startsWith('pronunciation'))await p.evaluate(()=>{estimateF0Frames=()=>[{time:0,f0:180},{time:.02,f0:190}];drawPitchCurve=(s,u,m)=>{s.drawn={u,m}};drawPitchPlaceholder=s=>{s.drawn={u:null,m:null}}});return p}
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

 for(const name of names){const p=await open(name);await start(p);await finish(p);const trace=await p.evaluate(()=>({records:[...document.querySelectorAll('#drill1List button,#drill1Container button')].filter(b=>b.textContent.startsWith('🎙️とる')).slice(0,3).map(b=>b.disabled),toggles:[...document.querySelectorAll('.compact-settings input')].map(b=>b.disabled),voice:document.querySelector('#voiceDropdownBtn').disabled,spoken:t.spoken.length}));console.log('TRACE',name,JSON.stringify(trace));if(!process.env.BASELINE){assert.equal(trace.records[1],false,name+' next row available during autoplay');assert.deepEqual(trace.toggles,[false,name==='pronunciation2'],name+' Autostop released; p2 Autoplay locked during auto playback');checks+=2;
 assert.notEqual(await p.evaluate(()=>getComputedStyle([...document.querySelectorAll('#drill1List button,#drill1Container button')].filter(b=>b.textContent.startsWith('🎙️とる'))[1]).cursor),'not-allowed',name+' enabled record cursor');checks++;
 await start(p,1);await finish(p);await start(p,0);await finish(p);assert.deepEqual(p.errors,[],name);checks++}await p.close()}
 for(const name of ['pronunciation1','pronunciation2']){const p=await open(name);await p.evaluate(()=>states[0].listenBtn.click());await p.waitForTimeout(30);console.log('MODEL',name,await p.evaluate(()=>({record:states[0].recordBtn.disabled,otherListen:states[1]?.listenBtn.disabled,toggle:document.querySelector('#toggleRecordMode').disabled})));if(!process.env.BASELINE){assert(await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.textContent.startsWith('🔊きく')).every(b=>b.disabled)),name+' other listens blocked during mic capture');checks++;
 assert.equal(await p.locator('#voiceDropdownBtn').evaluate(b=>getComputedStyle(b).cursor),'not-allowed',name+' Voice cursor');checks++;
 assert.equal(await p.locator('#toggleRecordMode').evaluate(b=>getComputedStyle(b.parentElement.querySelector('.slider')).cursor),'not-allowed',name+' toggle cursor');checks++;
 }
 await p.evaluate(()=>t.spoken.at(-1).onend());await p.waitForTimeout(300);
 for(const i of (name==='pronunciation1'?[0,1,0]:[0,0])){await start(p,i,true);await finish(p);console.log('LAB',name,i,await p.evaluate(()=>({rec:states.map(s=>s.recordBtn.disabled),toggles:[...document.querySelectorAll('.compact-settings input')].map(b=>b.disabled)})));if(!process.env.BASELINE){assert(await p.evaluate(()=>states.every(s=>!s.recordBtn.disabled)),name+' every Lab record released');checks++;await p.evaluate(()=>{const a=t.audios.at(-1);a?.onended?.()});await p.waitForTimeout(20);await p.evaluate(i=>states[i].playBtn.click(),i);await p.waitForTimeout(10);
 assert.equal(await p.evaluate(()=>t.audios.at(-1).paused),false,name+' explicit own playback');checks++;
 await p.evaluate(()=>t.audios.at(-1).onended());
 await p.evaluate(i=>states[i].listenBtn.click(),i);await p.waitForTimeout(30);await p.evaluate(()=>t.spoken.at(-1).onend());await p.waitForTimeout(300);assert(await p.evaluate(()=>states.every(s=>!s.recordBtn.disabled)),name+' listen then record remains repeatable');checks++}}
 if(!process.env.BASELINE){
 await p.evaluate(()=>{t.deny=true;states[0].recordBtn.click()});await p.waitForTimeout(40);
 assert(await p.evaluate(()=>states.every(s=>!s.recordBtn.disabled)),name+' denied learner mic unlocks Lab');checks++;
 await p.evaluate(()=>{t.deny=false});
 await start(p,0,true);await finish(p);
 assert(await p.evaluate(()=>states.every(s=>!s.recordBtn.disabled)),name+' can rerecord after denial');checks++;
 await p.evaluate(()=>t.audios.at(-1)?.onended?.());
 await p.evaluate(()=>{
   t.speaking=true;
   const toggle=document.querySelector('#toggleRecordMode');if(!toggle.checked)toggle.click();
   states[0].recordBtn.click();
  });await p.waitForTimeout(360);
  await p.evaluate(()=>{t.speaking=false});await p.waitForTimeout(2300);
  assert.equal(await p.locator('#toggleRecordMode').isDisabled(),false,name+' actual Autostop completion unlocks toggle');checks++;
  assert(await p.evaluate(()=>states.every(state=>!state.recordBtn.disabled)),name+' actual Autostop completion unlocks Lab');checks++;
  await p.evaluate(()=>document.querySelector('#toggleRecordMode').click());
  assert.equal(await p.locator('#toggleRecordMode').isChecked(),false,name+' Autostop OFF after auto stop');checks++;
  await p.evaluate(()=>{const toggle=document.querySelector('#toggleRecordMode');toggle.click();toggle.click()});assert(await p.evaluate(()=>!document.querySelector('#toggleRecordMode').checked),name+' Autostop ON then OFF');checks++;assert.deepEqual(p.errors,[],name)}await p.close()}
 // Pronunciation 2 relay UI: both buttons for autoplay, one for manual playback.
 {
  const p=await open('pronunciation2');
  const pair=()=>p.evaluate(()=>[p2.views[0].listen.textContent,p2.views[0].result.querySelector('.play-recording-btn').textContent]);
  await start(p);await finish(p);
  assert.deepEqual(await pair(),['Playing...','Playing...'],'both labels during model stage');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),true,'Autoplay locked during model');checks++;
  assert.equal(await p.locator('#voiceDropdownBtn').isDisabled(),false,'recording Voice lock released during ordinary autoplay');checks++;
  await p.evaluate(()=>{const toggle=document.querySelector('#togglePlaybackMode');toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.equal(await p.locator('#togglePlaybackMode').isChecked(),true,'blocked change restores toggle');checks++;
  await p.evaluate(()=>t.spoken.at(-1).onend());await p.waitForTimeout(20);
  assert.deepEqual(await pair(),['Playing...','Playing...'],'both labels during own stage');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),true,'Autoplay locked during own audio');checks++;
  await p.evaluate(()=>t.audios.at(-1).onended());await p.waitForTimeout(20);
  assert(await p.evaluate(()=>p2.views[0].listen.textContent.startsWith('🔊きく')&&p2.views[0].result.querySelector('.play-recording-btn').textContent.startsWith('▶️')),'relay labels restored');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),false,'relay unlocks toggle');checks++;
  await p.evaluate(()=>p2.views[0].listen.click());await p.waitForTimeout(10);
  assert((await pair())[0]==='Playing...'&&(await pair())[1].startsWith('▶️'),'manual model marks only listen');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),false,'manual playback does not lock Autoplay');checks++;
  await p.evaluate(()=>t.spoken.at(-1).onend());await p.waitForTimeout(10);
  await p.evaluate(()=>p2.views[0].result.querySelector('.play-recording-btn').click());await p.waitForTimeout(10);
  assert((await pair())[0].startsWith('🔊きく')&&(await pair())[1]==='Playing...','manual own marks only own button');checks++;
  await p.evaluate(()=>t.audios.at(-1).onended());
  // TTS error cancels the relay instead of proceeding to recorded audio.
  const audioCount=await p.evaluate(()=>t.audios.length);
  await p.evaluate(()=>p2Play(0,true,true));await p.evaluate(()=>t.spoken.at(-1).onerror({error:'synthesis-failed'}));await p.waitForTimeout(10);
  assert.equal(await p.evaluate(()=>t.audios.length),audioCount,'TTS error does not start own audio');checks++;
  assert((await pair())[0].startsWith('🔊きく')&&(await pair())[1].startsWith('▶️'),'error restores both labels');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),false,'error unlocks toggle');checks++;
  // New row recording cancels a relay and releases its labels.
  await p.evaluate(()=>p2Play(0,true,true));await start(p,1);
  assert((await pair())[0].startsWith('🔊きく')&&(await pair())[1].startsWith('▶️'),'next row restores old labels');checks++;
  await finish(p);await p.evaluate(()=>t.spoken.at(-1).onend());await p.waitForTimeout(10);await p.evaluate(()=>t.audios.at(-1).onended());
  const casual=p.locator('#speechStyleControl [data-value="casual"]');
  assert.equal(await casual.isDisabled(),true,'Casual remains permanently disabled');checks++;
  assert.equal(await casual.getAttribute('aria-disabled'),'true','Casual accessible disabled state');checks++;
  assert.equal(await casual.evaluate(b=>getComputedStyle(b).filter),'grayscale(1)','Casual visually gray');checks++;
  await p.evaluate(()=>document.querySelector('#speechStyleControl [data-value="informal"]').click());
  assert.equal(await p.locator('#speechStyleControl [data-value="informal"]').getAttribute('aria-pressed'),'true','Informal available');checks++;
  await p.evaluate(()=>document.querySelector('#speechStyleControl [data-value="casual"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
  assert.equal(await p.locator('#speechStyleControl [data-value="informal"]').getAttribute('aria-pressed'),'true','Casual event cannot select it');checks++;
  await p.evaluate(()=>document.querySelector('#speechStyleControl [data-value="formal"]').click());
  assert.equal(await p.locator('#speechStyleControl [data-value="formal"]').getAttribute('aria-pressed'),'true','Formal available');checks++;
  assert.equal(await casual.isDisabled(),true,'Casual stays disabled after rerender');checks++;
  assert((await p.locator('.voice-recommend-note').textContent()).trim().startsWith('ℹ️'),'information icon adopted');checks++;
  await start(p,0,true);await finish(p);
  assert(await p.evaluate(()=>states[0].listenBtn.textContent.startsWith('🔊きく')&&states[0].playBtn.textContent==='Playing...'),'Lab own-only autoplay marks only own button');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),true,'Lab autoplay locks toggle');checks++;
  await p.evaluate(()=>t.audios.at(-1).onended());await p.waitForTimeout(10);
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),false,'Lab own completion unlocks toggle');checks++;
  await p.evaluate(()=>document.querySelector('#togglePlaybackMode').click());
  const beforeOff=await p.evaluate(()=>[t.spoken.length,t.audios.length]);
  await start(p);await finish(p);
  assert.deepEqual(await p.evaluate(()=>[t.spoken.length,t.audios.length]),beforeOff,'Autoplay OFF does not start either audio');checks++;
  assert((await pair())[0].startsWith('🔊きく')&&(await pair())[1].startsWith('▶️'),'OFF keeps labels normal');checks++;
  assert.equal(await p.locator('#togglePlaybackMode').isDisabled(),false,'OFF permits setting after recording');checks++;
  assert.deepEqual(p.errors,[],'relay UI runtime errors');await p.close();
 }
 for(const name of ['pronunciation1','pronunciation2']){
  const p=await open(name);await p.clock.install();
  await p.evaluate(()=>states[0].listenBtn.click());await p.waitForTimeout(30);
  await p.clock.fastForward(20001);await p.waitForTimeout(30);
  assert(await p.evaluate(()=>t.tracks.every(track=>track.readyState==='ended')),name+' stalled model capture stops at 20s');checks++;
  assert.equal(await p.locator('#toggleRecordMode').isDisabled(),false,name+' stalled model releases settings');checks++;
  assert(await p.evaluate(()=>states.every(state=>!state.recordBtn.disabled)),name+' stalled model releases recording');checks++;
  assert.deepEqual(p.errors,[],name+' timeout errors');await p.close();
 }
 await browser.close();console.log('PASS',checks);
})().catch(e=>{console.error(e);process.exit(1)});
