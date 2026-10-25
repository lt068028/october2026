const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const names=['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2'];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let count=0;const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);count++};
 async function open(name,{saved,third='Chrome OS 日本語 3',mode='chrome',absent=false,late=false}={}){
  const p=await browser.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
  await p.addInitScript(({saved,third,mode,absent,late})=>{
   if(mode==='edge')Object.defineProperty(navigator,'userAgent',{value:'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'});
   if(mode==='brave')Object.defineProperty(navigator,'brave',{value:{isBrave:()=>Promise.resolve(true)}});
   const voice=name=>({name,lang:'ja-JP',voiceURI:name});
   window.fixture={voices:[voice('Chrome OS 日本語 1'),voice('Google 日本語'),voice('Chrome OS 日本語 13'),...(!absent&&!late?[voice(third)]:[])],third,listeners:[]};
   const synth={onvoiceschanged:null,getVoices:()=>fixture.voices,addEventListener(event,fn){if(event==='voiceschanged')fixture.listeners.push(fn)},speak(u){window.spoken=u},cancel(){}};
   Object.defineProperty(window,'speechSynthesis',{value:synth});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
   if(saved)localStorage.setItem('october2026.selectedVoiceName',saved);
  },{saved,third,mode,absent,late});
  await p.route('http://voices.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'})});
  await p.goto('http://voices.test/'+name+'.html');await p.waitForTimeout(30);return p;
 }
 const selected=p=>p.locator('#voiceSelect').inputValue();
 for(const name of names){
  let p=await open(name);
  check(await selected(p),'Chrome OS 日本語 3',name+' default is named voice3');
  check(await p.locator('#voiceSelect option').first().textContent(),'Chrome OS 日本語 3',name+' priority in dropdown');
  await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.textContent.startsWith('🔊きく')).click());
  check(await p.evaluate(()=>spoken.voice.name),'Chrome OS 日本語 3',name+' utterance uses voice3');
  check(await p.evaluate(()=>DrillAudio.isChromeJapanese3({name:'Chrome OS 日本語 13'})),false,name+' does not confuse 13 with 3');
  // Saved manual choice has precedence, including page reload.
  await p.evaluate(()=>{const s=document.querySelector('#voiceSelect');s.value='Google 日本語';s.dispatchEvent(new Event('change',{bubbles:true}))});
  check(await selected(p),'Google 日本語',name+' manual choice retained');
  await p.reload();check(await selected(p),'Google 日本語',name+' saved manual survives reload');
  assert.deepEqual(p.errors,[]);await p.close();
  for(const third of ['日本語３','日本語3','Japanese 3']){p=await open(name,{third});check(await selected(p),third,name+' exact normalized name '+third);assert.deepEqual(p.errors,[]);await p.close();}
  p=await open(name,{absent:true});check(await selected(p),'Chrome OS 日本語 1',name+' absent voice3 uses previous priority');await p.close();
  p=await open(name,{saved:'Missing voice'});check(await selected(p),'Chrome OS 日本語 3',name+' missing saved voice uses new default');await p.close();
  p=await open(name,{late:true});
  await p.evaluate(()=>{fixture.voices.push({name:fixture.third,lang:'ja-JP',voiceURI:fixture.third});fixture.listeners.forEach(fn=>fn());speechSynthesis.onvoiceschanged?.()});
  check(await selected(p),'Chrome OS 日本語 3',name+' asynchronous voice list updates default');await p.close();
  for(const mode of ['edge','brave']){p=await open(name,{mode});check(await selected(p),'Chrome OS 日本語 1',name+' '+mode+' priority unchanged');assert.deepEqual(p.errors,[]);await p.close();}
 }
 await browser.close();console.log('PASS voice default',count);
})().catch(e=>{console.error(e);process.exit(1)});
