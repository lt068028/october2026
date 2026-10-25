// Synthetic shared audio, real Chromium MediaRecorder/decode, real WAV/ZIP export.
// Does not establish that a particular OS TTS engine is included in tab capture.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function mock(){
 const timer=window.setTimeout.bind(window);
 // Accelerate only watchdog deadlines, preserving actual recording and data events.
 window.setTimeout=(fn,ms,...args)=>timer(fn,[20000,10000,5000].includes(ms)?800:ms,...args);
 window.t={spoken:[],captures:[],silent:false,defer:false,denied:false,noAudio:false,hang:false,error:false};
 const voices=[{name:'Google 日本語 3',voiceURI:'google-3',lang:'ja-JP',localService:false},{name:'Google 日本語 1',voiceURI:'google-1',lang:'ja-JP',localService:false}];
 Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>voices,addEventListener(){},speak(u){t.spoken.push(u);if(t.error)return timer(()=>u.onerror({error:'synthesis-failed'}),20);if(t.hang || t.hangAt===u.text)return;t.gain.gain.value=t.silent?0:.15;timer(()=>{t.gain.gain.value=0;u.onend?.()},120)},cancel(){if(t.gain)t.gain.gain.value=0}}});
 const nativeDecode=AudioContext.prototype.decodeAudioData;
 AudioContext.prototype.decodeAudioData=function(data){if(t.decodeHang)return new Promise(resolve=>{t.finishDecode=()=>nativeDecode.call(this,data).then(resolve)});return nativeDecode.call(this,data)};
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 Object.defineProperty(navigator,'mediaDevices',{value:{getDisplayMedia:async options=>{
  t.options=options;
  if(t.denied)throw new DOMException('denied','NotAllowedError');
  const context=new AudioContext();await context.resume();
  const dest=context.createMediaStreamDestination(),osc=context.createOscillator(),gain=context.createGain();
  gain.gain.value=0;osc.connect(gain);gain.connect(dest);osc.start();t.gain=gain;
  const stream=t.noAudio?new MediaStream():dest.stream;t.captures.push(stream);
  if(t.defer)await new Promise(resolve=>t.release=resolve);
  return stream;
 }}});
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 let checks=0;const ok=(v,label)=>{assert(v,label);checks++};
 try {
  const p=await browser.newPage({acceptDownloads:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(mock);
  await p.route('https://recorder.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'})});
  await p.goto('https://recorder.test/tools/model-recorder.html');
  const status=()=>p.locator('#status').textContent();
  const idle=()=>p.waitForFunction(()=>document.querySelector('#cancel').disabled);
  const probe=async()=>{await p.locator('#probe').click();await idle()};
  ok(await p.locator('#voice').inputValue()==='google-3','named voice3 default');
  ok(await p.locator('#batch').isDisabled(),'no batch before probe');
  await p.evaluate(()=>t.denied=true);await p.locator('#share').click();await p.waitForFunction(()=>!document.querySelector('#share').disabled);
  ok((await status()).includes('denied'),'denied share handled');
  await p.evaluate(()=>{t.denied=false;t.noAudio=true});await p.locator('#share').click();await p.waitForFunction(()=>!document.querySelector('#share').disabled);
  ok((await status()).includes('音声トラックがありません'),'no audio track rejected');
  await p.evaluate(()=>{t.noAudio=false;t.defer=true});await p.locator('#share').click();await p.waitForFunction(()=>!!t.release);await p.locator('#disconnect').click();await p.evaluate(()=>t.release());await p.waitForTimeout(30);
  ok(await p.evaluate(()=>t.captures.at(-1).getTracks().every(t=>t.readyState==='ended')),'late share disposed');
  ok(await p.locator('#probe').isDisabled(),'late share cannot enable probe');
  await p.evaluate(()=>t.defer=false);await p.locator('#share').click();await p.waitForFunction(()=>!document.querySelector('#probe').disabled);
  ok(await p.evaluate(()=>t.options.audio.echoCancellation===false&&t.options.video.displaySurface==='browser'),'capture options');
  await p.evaluate(()=>t.silent=true);await probe();
  ok((await status()).includes('音声信号を確認できません'),'silent probe refused');
  ok(await p.locator('#approved').isDisabled(),'silence cannot approve');
  ok(await p.locator('.result').count()===1,'silent diagnostic retained');
  await p.evaluate(()=>t.silent=false);await probe();
  ok(!(await p.locator('#approved').isDisabled()),'real synthetic signal enables approval');
  ok(await p.locator('#batch').isDisabled(),'manual listening confirmation required');
  ok(await p.evaluate(()=>t.spoken.at(-1).voice.voiceURI==='google-3'&&t.spoken.at(-1).rate===.9),'explicit voice and rate');
  await p.locator('#approved').check();ok(!(await p.locator('#batch').isDisabled()),'approval opens batch');
  await p.locator('#rate').fill('0.8');ok(await p.locator('#batch').isDisabled(),'settings invalidate probe');
  await probe();await p.locator('#approved').check();await p.locator('#batch').click();
  ok(await p.locator('#voice').isDisabled(),'voice locked during capture');
  ok(await p.evaluate(()=>[...document.querySelectorAll('audio')].every(a=>!a.controls)),'preview disabled during capture');
  await idle();ok((await status()).includes('全項目の収録が完了'),'batch success');
  ok(await p.locator('.result').count()===2,'one entry per id');
  const downloadPromise=p.waitForEvent('download');await p.locator('#export').click();const download=await downloadPromise;
  const zipPath=await download.path();
  const inspected=spawnSync('python3',['-c',`import sys,zipfile,json,io,wave
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 assert len(z.namelist())==5
 m=json.loads(z.read('manifest.json'))
 assert len(m['recordings'])==2
 for r in m['recordings']:
  assert r['voice']['voiceURI']=='google-3' and r['rate']==0.8 and r['signalDetected']
  assert len(z.read(r['files']['original']))>100
  with wave.open(io.BytesIO(z.read(r['files']['wav']))) as w:
   assert w.getnframes()>1000 and w.getsampwidth()==2
print('ZIP CRC / manifest / 2 WAV / 2 WebM valid')`,zipPath],{encoding:'utf8'});
  assert.equal(inspected.status,0,inspected.stderr);checks+=7;console.log(inspected.stdout.trim());
  await p.locator('#items').fill('bad\t箸。\nbad\t橋。');await probe();ok((await status()).includes('重複'),'duplicate ids rejected');
  await p.locator('#items').fill('sample-03\t雨。');await p.evaluate(()=>t.hang=true);await p.locator('#probe').click();await p.waitForFunction(()=>t.spoken.at(-1).text==='雨。');await idle();
  ok((await status()).includes('時間内'),'TTS watchdog releases UI');
  ok(await p.locator('.result').count()===2,'timeout preserves completed data');
  await p.evaluate(()=>{t.hang=false;t.error=true});await probe();ok((await status()).includes('TTSエラー'),'TTS error aborts');
  await p.evaluate(()=>{t.error=false;t.hang=true});await p.locator('#probe').click();await p.locator('#cancel').click();await idle();
  ok((await status()).includes('中止'),'manual cancellation');
  await p.locator('#probe').click();await p.evaluate(()=>t.captures.at(-1).getTracks().forEach(track=>{track.stop();track.dispatchEvent(new Event('ended'))}));await idle();
  ok(await p.locator('#probe').isDisabled(),'share ended aborts and locks probe');
  ok(!(await p.locator('#export').isDisabled()),'completed export available after share end');
  await p.locator('#source').selectOption('screen');await p.locator('#share').click();await p.waitForFunction(()=>!document.querySelector('#probe').disabled);
  ok(await p.evaluate(()=>t.options.video.displaySurface==='monitor'&&t.options.systemAudio==='include'),'Windows system share hint');
  await p.evaluate(()=>{t.hang=false;t.decodeHang=true});await probe();
  ok((await status()).includes('音声デコードが時間内'),'decode deadline');
  await p.evaluate(()=>t.finishDecode());await p.waitForTimeout(50);
  ok(await p.locator('.result').count()===2,'late decode discarded');
  await p.evaluate(()=>t.decodeHang=false);
  await p.locator('#items').fill('new-01\t箸。\nnew-02\t橋。');await probe();await p.locator('#approved').check();
  await p.evaluate(()=>t.hangAt='橋。');await p.locator('#batch').click();await p.waitForFunction(()=>t.spoken.at(-1).text==='橋。');
  await p.locator('#cancel').click();await idle();
  ok(await p.locator('.result').count()===3,'partial batch retains completed item');
  ok(await p.locator('#batch').isDisabled(),'cancel requires fresh probe');
  ok(errors.length===0,'no page errors: '+errors.join(','));
  console.log('PASS model recorder',checks);
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
