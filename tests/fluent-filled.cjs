// Filled Q/A opt-in: approved path fixtures, theme/geometry and default API compatibility.
// Audio uses the existing mock; this does not verify microphone acoustics.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),baseline=process.env.FILLED_BASELINE,approved=process.env.FILLED_APPROVED;
const output=process.env.FILLED_OUTPUT||'/tmp/fluent-filled';
const hashes={question:'45ed9a94cd9ec310a0854c13cda744cb8e1e1b7e0a9a05878f3acc33f4c8943c',answer:'9623f63254eddc804a234947b1c5ae9494d16b5d5f6630000ce85f0aa4e2dc36'};
const source=fs.readFileSync(path.join(root,'tests/audio-relay.cjs'),'utf8');
const mock=source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'));
let checks=0;const observations=[];const check=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
async function settle(p){await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function open(b,dir,name='practice2.2'){
 const p=await b.newPage({viewport:{width:1440,height:1000}});p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
 await p.addInitScript('('+mock.trim()+')();Math.random=()=>.3;');
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='filled.test')return r.abort();const f=path.join(dir,u.pathname),exists=fs.existsSync(f);return r.fulfill({status:exists?200:404,body:exists?fs.readFileSync(f):'',contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':f.endsWith('.webp')?'image/webp':'text/html'});});
 await p.goto('http://filled.test/'+name+'.html');
 if(process.env.FILLED_FONT_FILE){const data=fs.readFileSync(process.env.FILLED_FONT_FILE).toString('base64');await p.addStyleTag({content:`@font-face{font-family:Lato;src:url(data:font/ttf;base64,${data});font-weight:400;}`});}
 await settle(p);return p;
}
async function inspect(p){await settle(p);return p.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return [r.x+scrollX,r.y+scrollY,r.width,r.height];};
 return {width:document.documentElement.scrollWidth,roles:[...document.querySelectorAll('.conversation-role-icon')].map(e=>{const s=e.querySelector('svg'),p=s.querySelector('path');return {label:e.getAttribute('aria-label'),example:!!e.closest('.example-box'),rect:rect(e),svg:rect(s),path:p.getAttribute('d'),stroke:getComputedStyle(p).stroke,color:getComputedStyle(s).color,hidden:s.getAttribute('aria-hidden'),markup:e.innerHTML};}),
 geometry:[...document.querySelectorAll('.p22-conversation-line,.example-box,.drill-cue-cell,.recording-actions,.example-box button')].map(rect),
 indicators:[...document.querySelectorAll('.question-indicator')].map(e=>e.innerHTML)};
 });}
(async()=>{fs.mkdirSync(output,{recursive:true});const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await open(b,root),old=baseline?await open(b,baseline):null,reference=approved?await open(b,approved):null;
 for(const width of [375,600,1440])for(const theme of ['light','dark']){
  for(const q of [p,old,reference].filter(Boolean)){await q.setViewportSize({width,height:1000});await q.emulateMedia({colorScheme:theme});}
  const a=await inspect(p),key=width+'/'+theme;
  check(a.width<=width,true,key+' no page overflow');check(a.roles.some(r=>r.example)&&a.roles.some(r=>!r.example),true,key+' Example and Drill covered');
  for(const r of a.roles){const kind=r.label==='Question'?'question':'answer';check(createHash('sha256').update(r.path).digest('hex'),hashes[kind],key+' approved Filled path');check(r.stroke,'none',key+' no additional stroke');check(r.color,theme==='light'?'rgb(113, 131, 154)':'rgb(217, 221, 227)',key+' approved theme');check(r.hidden,'true',key+' decorative SVG');check(r.svg.slice(2),r.rect.slice(2),key+' same allocated dimensions');}
  if(old){const d=await inspect(old);check(a.roles.map(r=>r.rect),d.roles.map(r=>r.rect),key+' baseline role positions and dimensions');check(a.geometry,d.geometry,key+' baseline text/controls/spacing geometry');check(a.indicators,d.indicators,key+' stop indicators remain Regular');}
  if(reference){const d=await inspect(reference);check(a.roles.map(r=>[r.path,r.color,r.rect]),d.roles.map(r=>[r.path,r.color,r.rect]),key+' matches approved comparison');}
  observations.push({key,scrollWidth:a.width,roles:a.roles.length,example:a.roles.filter(r=>r.example).length,drill:a.roles.filter(r=>!r.example).length,color:a.roles[0].color,size:a.roles[0].svg.slice(2)});
  await p.locator('.example-box:has(.conversation-role-icon)').first().screenshot({path:path.join(output,key.replace('/','-')+'-example.png')});
  await p.locator('#drill1Container').screenshot({path:path.join(output,key.replace('/','-')+'-drill.png')});
 }
 // Default calls stay byte-for-byte compatible; both public APIs support Filled explicitly.
 const api=q=>q.evaluate(()=>['question','answer','book','clipboard','yes','no'].map(k=>[FluentIcons.create(k,24,'fixture').outerHTML,FluentIcons.markup(k,16,'fixture')]));
 if(old)check(await api(p),await api(old),'default API markup unchanged for all existing icon kinds');
 for(const kind of ['question','answer'])for(const method of ['create','markup']){
  const d=await p.evaluate(({kind,method})=>{let s=FluentIcons[method](kind,24,'fixture','filled');if(typeof s==='string'){const t=document.createElement('template');t.innerHTML=s;s=t.content.firstElementChild;}return {d:s.querySelector('path').getAttribute('d'),stroke:s.querySelector('path').getAttribute('stroke'),filled:s.classList.contains('fluent-icon-filled')};},{kind,method});
  check(createHash('sha256').update(d.d).digest('hex'),hashes[kind],method+'/'+kind+' exact approved path');check([d.stroke,d.filled],[null,true],method+'/'+kind+' Filled API');
 }
 // Real controls with mocked microphone/STT/audio callbacks.
 await p.evaluate(()=>{for(const id of ['toggleRecordMode','togglePlaybackMode']){const e=document.getElementById(id);if(e?.checked)e.click();}t.speaking=true;});
 const record=p.locator('.recording-actions button').filter({hasText:/^(🎙️|⏺️)とる/}).first();
 await record.click();await p.waitForFunction(()=>t.recorders.at(-1)?.state==='recording');
 await p.evaluate(()=>{const result=[{transcript:'これはほんです'}];result.isFinal=true;t.recognitions.at(-1)?.onresult?.({resultIndex:0,results:[result]});t.recognitions.at(-1)?.onspeechstart?.();});
 await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForFunction(()=>t.recorders.at(-1)?.state==='inactive'&&!!document.querySelector('.play-recording-btn'));
 check(await p.evaluate(()=>t.tracks.every(t=>t.readyState==='ended')),true,'stop releases microphone');
 await p.locator('.play-recording-btn').first().click();check(await p.evaluate(()=>t.audios.at(-1)?.paused),false,'saved recording plays');await p.evaluate(()=>t.audios.at(-1)?.onended?.());
 check(p.errors,[],'no Practice 2.2 runtime errors');await p.close();await old?.close();await reference?.close();
 if(baseline)for(const name of ['practice2.1','practice2.3','practice7.1']){
  const a=await open(b,root,name),d=await open(b,baseline,name);
  for(const [width,theme]of [[375,'light'],[1440,'dark']]){for(const q of[a,d]){await q.setViewportSize({width,height:1000});await q.emulateMedia({colorScheme:theme});}const now=await inspect(a),before=await inspect(d);check(now,before,name+'/'+width+'/'+theme+' roles, theme, geometry and question indicators unchanged');}
  check(a.errors,[],name+' no runtime errors');await a.close();await d.close();
 }
 }finally{await b.close();}fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,failures:0,observations},null,2));console.log('PASS Fluent Filled',checks);
})().catch(e=>{console.error(e);process.exitCode=1});
