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
 await p.route('http://drill.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);return fs.existsSync(file)?r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'}):r.fulfill({status:404,body:''})});
 await p.goto('http://drill.test/practice2.1.html');
 let count=0;const check=(a,b,label)=>{assert.deepEqual(a,b,label);count++};
 check(await p.locator('.example-box').count(),3,'three Examples');
 for(const [i,n] of [[1,2],[2,2],[3,6]])check(await p.locator(`#drill${i}Container .drill-row`).count(),n,'Drill '+i+' card count');
 check(await p.locator('.recording-table tr').count(),30,'six statements, six name question/answers, six which question/answers');
 check(await p.locator('#drill2Container .recording-table tr').count(),12,'D2 two sets of three conversations');
 check(await p.locator('button.answer-choice').count(),0,'no Y/N exercise');
 check(await p.evaluate(()=>['A','B'].map(s=>['A','B','far'].map(z=>Practice21.pronoun(s,z)))),[['これ','それ','あれ'],['それ','これ','あれ']],'speaker-relative zones');
 const taskIds=await p.evaluate(()=>Practice21.tasks3.map(t=>[t.item.id,t.target]));
 check(new Set(taskIds.map(t=>t[0])).size,6,'six different randomized nouns');
 check([1,2,3].map(n=>taskIds.filter(t=>t[1]===n).length),[2,2,2],'two targets in every zone');
 check(await p.locator('#drill1Container .example-box .p21-object').count(),3,'one example scene with three books');
 check(await p.locator('#drill1Container .example-box .p21-drawing path:first-child').evaluateAll(es=>new Set(es.map(e=>e.getAttribute('fill'))).size),3,'book colors distinguish objects');
 const response=p.locator('#drill2Container .recording-table tr').nth(1);
 await response.locator('button').filter({hasText:/^🔊きく/}).hover();
 check(await p.locator('#drill2Container .drill-row').first().locator('.p21-person.is-speaker > text').first().textContent(),'B','reply hover highlights B');
 const model=async row=>{
  await row.locator('button').filter({hasText:/^🔊きく/}).click();
  return p.evaluate(()=>{const u=t.spoken.at(-1),text=practice2Normalize(u.text);u.onend?.();return text;});
 };
 for(const style of ['formal','informal','casual'])for(const script of ['hiragana','kanji']) {
  await p.locator(`#speechStyleControl [data-value="${style}"]`).click();await p.locator(`#scriptModeControl [data-value="${script}"]`).click();
  check(await p.evaluate(()=>Practice21.tasks3.map(t=>[t.item.id,t.target])),taskIds,'settings do not randomize tasks');
  const ending=style==='formal'?'です':'だ',qword=style==='formal'?(script==='kanji'?'なにですか':'なんですか'):'なに';
  for(const [i,pro,noun] of [[0,'これ','かばん'],[1,'それ','かばん'],[2,'あれ','かばん'],[3,'これ','かさ'],[4,'それ','かさ'],[5,'あれ','かさ']])
   check(await model(p.locator('#drill1Container .recording-table tr').nth(i)),pro+'は'+noun+ending,'D1 model');
  for(const [set,noun] of [[0,'とけい'],[1,'さいふ']])for(let j=0;j<3;j++) {
   check(await model(p.locator('#drill2Container .recording-table tr').nth(set*6+j*2)),['これ','それ','あれ'][j]+'は'+qword,'A question viewpoint');
   check(await model(p.locator('#drill2Container .recording-table tr').nth(set*6+j*2+1)),['それ','これ','あれ'][j]+'は'+noun+ending,'B response viewpoint');
  }
  for(let i=0;i<6;i++)check(await model(p.locator('#drill3Container .recording-table tr').nth(i*2+1)),['これ','それ','あれ'][taskIds[i][1]-1]+ending,'D3 answer as A; color is not part of answer');
 }
 await p.locator('#speechStyleControl [data-value="formal"]').click();await p.locator('#scriptModeControl [data-value="hiragana"]').click();
 await p.evaluate(()=>{document.querySelector('#toggleRecordMode').click();document.querySelector('#togglePlaybackMode').click();});
 async function record(row,transcript,key) {
  await row.locator('button').filter({hasText:/^🎙️とる/}).click();await p.waitForTimeout(400);
  check(await p.locator('#speechStyleControl button').first().isDisabled(),true,'settings locked during recording');
  check(await p.locator('#drill1Container .recording-actions button').first().isDisabled(),true,'other drill playback locked during recording');
  await p.evaluate(transcript=>{const r=t.recognitions.at(-1),result=[{transcript}];result.isFinal=true;r.onresult({resultIndex:0,results:[result]});r.onspeechstart?.();},transcript);
  await row.locator('.stop-btn-active').click();await p.waitForTimeout(100);
  check(await p.evaluate(key=>practice2State.savedResults[key]?.isCorrect,key),true,'recording and recognition '+key);
 }
 await record(p.locator('#drill2Container .recording-table tr').nth(1),'それは時計です。','p21_d2_0_1_a');
 await record(p.locator('#drill3Container .recording-table tr').nth(1),['これ','それ','あれ'][taskIds[0][1]-1]+'です。','p21_d3_0_a');
 await p.locator('#hintModeControl [data-value="paren"]').click();
 check(await p.evaluate(()=>practice2State.savedResults.p21_d3_0_a.isCorrect),true,'settings preserve recorded result');
 check(await p.locator('button').evaluateAll(es=>es.some(b=>/^👀Text/.test(b.textContent))),false,'no Text buttons');
 await p.evaluate(()=>{const key='p21_d2_0_1_a',v=practice2State.views[key];processResult('これは時計です。','それは時計です。',()=> 'それは時計です。',v.resultSpan,v.correctionBox,v.corrListenBtn,v.corrTextSpan,()=>null,.75,key);});
 check(await p.evaluate(()=>practice2State.savedResults.p21_d2_0_1_a.isCorrect),false,'wrong speaker-relative demonstrative rejected');
 check(errors,[],'no runtime errors');await browser.close();console.log('PASS Practice 2.1 content and recording',count);
})().catch(e=>{console.error(e);process.exit(1)});
