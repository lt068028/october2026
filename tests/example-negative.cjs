// Limited Example display regression. Audio uses the existing controlled mock.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const root=process.env.NEGATIVE_ROOT||path.resolve(__dirname,'..'),baseline=process.env.NEGATIVE_BASELINE_ROOT;
const names=['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','practice8.1','practice8.2','practice8.3'];
const changed=new Set(['practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','practice8.1']);
const audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8'),mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
let checks=0;const failures=[],counts={};function check(ok,label,detail){checks++;if(!ok)failures.push({label,detail});}
async function open(b,name,dir){const p=await b.newPage({viewport:{width:1440,height:1100}});p.errors=[];p.missing=[];p.on('pageerror',e=>p.errors.push(e.message));await p.addInitScript('('+mock.trim()+')();Math.random=()=>0.3;');await p.route('http://negative.test/**',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);if(!fs.existsSync(f)){p.missing.push(f);return r.fulfill({status:404,body:''});}return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'text/html'});});await p.goto('http://negative.test/'+name+'.html');await p.evaluate(()=>document.fonts.ready);await p.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});return p;}
async function settings(p,style,mode,hint='hover'){await p.evaluate(({style,mode,hint})=>{for(const[id,value]of [['speechStyleControl',style],['scriptModeControl',mode],['hintModeControl',hint]]){const b=document.querySelector('#'+id+' [data-value="'+value+'"]');if(b&&!b.disabled&&b.getAttribute('aria-pressed')!=='true')b.click();}},{style,mode,hint});}
async function snapshot(p){return p.evaluate(()=>{
 const skip='script,style,.tooltip-tip,.custom-tip-box,.vocab-inline';
 const chars=[];for(const box of document.querySelectorAll('.example-box')){const w=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode,e=n.parentElement;if(!n.textContent.trim()||e.closest(skip))continue;const s=getComputedStyle(e);for(const c of n.textContent.split(''))chars.push([c,s.color,s.fontWeight]);}}
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),body=[];while(w.nextNode())if(w.currentNode.textContent.trim()&&!w.currentNode.parentElement.closest('script,style'))body.push(w.currentNode.textContent);
 const drill=[...document.querySelectorAll('.drill-row,.p81-card')].filter(e=>!e.parentElement.closest('.drill-row,.p81-card')).map(e=>e.outerHTML);
 return {chars,body:body.join(''),drill,forms:[...document.querySelectorAll('input,select,textarea')].map(e=>[e.id,e.value,e.checked,e.disabled,e.options?[...e.options].map(o=>[o.value,o.textContent]):null]),overflow:document.documentElement.scrollWidth>innerWidth+1,negativeOutside:[...document.querySelectorAll('.semantic-negative')].filter(e=>!e.closest('.example-box')).length};
 });}
function ranges(text){const mask=new Set;for(const m of text.matchAll(/(じゃない)|[てで](いません|いなかった|いない|なかった|ない)/g)){const start=m.index+(m[1]?0:1),s=m[1]||m[2];for(let i=start;i<start+s.length;i++)mask.add(i);}return mask;}
async function tts(p){return p.evaluate(()=>{const out=[];for(const b of document.querySelectorAll('.example-box button')){if(b.disabled||!b.textContent.startsWith('🔊'))continue;const start=t.spoken.length;b.click();const heard=t.spoken.slice(start);out.push(heard.map(u=>[u.text,u.rate,u.lang]));for(const u of heard)u.onend?.();}return out;});}
(async()=>{if(!baseline)throw Error('Set NEGATIVE_BASELINE_ROOT to the unchanged comparison checkout.');const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 for(const name of names){const p=await open(browser,name,root),b=await open(browser,name,baseline);counts[name]={cases:0,targetCharacters:0};
 for(const style of ['formal','informal','casual'])for(const mode of ['kanji','hiragana'])for(const width of [375,1440])for(const theme of ['light','dark']){
  for(const q of[p,b]){await q.emulateMedia({colorScheme:theme});await q.setViewportSize({width,height:1100});await settings(q,style,mode);}
  const key=[name,style,mode,width,theme].join('/'),a=await snapshot(p),old=await snapshot(b),text=a.chars.map(c=>c[0]).join(''),mask=changed.has(name)?ranges(text):new Set,red=theme==='dark'?'rgb(255, 138, 165)':'rgb(225, 29, 72)';counts[name].cases++;counts[name].targetCharacters+=mask.size;
  check(a.body===old.body,'all text preserved '+key);
  check(JSON.stringify(a.forms)===JSON.stringify(old.forms),'form state/options preserved '+key);
  check(JSON.stringify(a.drill)===JSON.stringify(old.drill),'Drill markup unchanged '+key);
  check(text===old.chars.map(c=>c[0]).join(''),'Example text unchanged '+key);
  const bad=a.chars.map((c,i)=>mask.has(i)?c[1]!==red||c[2]!=='700':JSON.stringify(c)!==JSON.stringify(old.chars[i])).map((v,i)=>v?{i,char:a.chars[i],before:old.chars[i],target:mask.has(i)}:null).filter(Boolean);
  check(!bad.length,'only specified negative characters change '+key,bad.slice(0,8));
  check(!a.overflow,'375/1440 viewport fit '+key);check(!a.negativeOutside,'no new negative styling outside Example '+key);
  if(width===375&&theme==='light')check(JSON.stringify(await tts(p))===JSON.stringify(await tts(b)),'all Example TTS inputs unchanged '+key);
 }
 for(const hint of['off','paren']){for(const q of[p,b])await settings(q,'formal','kanji',hint);const a=await snapshot(p),old=await snapshot(b),mask=changed.has(name)?ranges(a.chars.map(c=>c[0]).join('')):new Set;check(a.body===old.body&&JSON.stringify(a.drill)===JSON.stringify(old.drill),'hint display and Drill preserved '+name+'/'+hint);check(a.chars.every((c,i)=>mask.has(i)?c[1]==='rgb(255, 138, 165)'&&c[2]==='700':JSON.stringify(c)===JSON.stringify(old.chars[i])),'hint negative scope '+name+'/'+hint);}
 check(!p.errors.length,'runtime '+name,p.errors);check(!p.missing.length,'resources '+name,p.missing);console.log(name,counts[name]);await p.close();await b.close();}
 const unit=await browser.newPage();await unit.goto('about:blank');await unit.addScriptTag({path:path.join(root,'semantic-display.js')});const tests=await unit.evaluate(()=>{
 const rows=[['じゃないです','じゃない'],['じゃないよ','じゃない'],['じゃない','じゃない'],['ていません','いません'],['ていない','いない'],['てない','ない'],['ていませんでした','いません'],['ていなかった','いなかった'],['てなかった','なかった'],['知りません',''],['知らない',''],['わかりません','']];
 return rows.map(([text,expected])=>{const host=document.createElement('span');host.innerHTML=SemanticDisplay.highlightHTML(text+'。');SemanticDisplay.exampleNegatives(host);const once=host.innerHTML;SemanticDisplay.exampleNegatives(host);return {text,same:host.textContent===text+'。',negative:[...host.querySelectorAll('.semantic-negative')].map(e=>e.textContent).join(''),expected,idempotent:once===host.innerHTML};});});for(const r of tests)check(r.same&&r.idempotent&&r.negative===r.expected,'explicit boundary unit '+r.text,r);
 await browser.close();fs.writeFileSync(process.env.NEGATIVE_REPORT||path.join(require('os').tmpdir(),'example-negative-result.json'),JSON.stringify({checks,failures,counts},null,2));console.log(JSON.stringify({checks,failed:failures.length,first:failures.slice(0,8)}));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
