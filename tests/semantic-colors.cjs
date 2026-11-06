// Display-only cross-page regression; no page-wide recording suite is run.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=process.env.SEMANTIC_ROOT||path.resolve(__dirname,'..');
const baseline=process.env.SEMANTIC_BASELINE_ROOT;
const names=['practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','practice8.1','practice8.2','practice8.3','composition1','pronunciation1','pronunciation2'];
const audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8'),mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
let checks=0;const failures=[],counts={};
function check(ok,label,detail){checks++;if(!ok)failures.push({label,detail});}
const colors={light:{grammar:'rgb(245, 127, 23)',positive:'rgb(0, 87, 231)',negative:'rgb(225, 29, 72)'},dark:{grammar:'rgb(255, 209, 102)',positive:'rgb(99, 214, 245)',negative:'rgb(255, 138, 165)'}};
async function open(browser,name,dir){const p=await browser.newPage({viewport:{width:1440,height:1100}});p.errors=[];p.missing=[];p.on('pageerror',e=>p.errors.push(e.message));await p.addInitScript('('+mock.trim()+')();Math.random=()=>0.3;');
 await p.route('http://semantic.test/**',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);if(!fs.existsSync(f)){p.missing.push(f);return r.fulfill({status:404,body:''});}return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'text/html'});});
 await p.goto('http://semantic.test/'+name+'.html',{timeout:60000});await p.evaluate(()=>document.fonts.ready);await p.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});return p;}
async function settings(p,style,mode,hint='hover'){await p.evaluate(({style,mode,hint})=>{for(const [id,value]of [['speechStyleControl',style],['scriptModeControl',mode],['hintModeControl',hint]]){const b=[...document.querySelectorAll('#'+id+' [data-value]')].find(b=>b.dataset.value===value);if(b&&!b.disabled&&b.getAttribute('aria-pressed')!=='true')b.click();}},{style,mode,hint});}
async function snapshot(p){return p.evaluate(()=>({text:(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),out=[];while(w.nextNode()){const n=w.currentNode;if(n.textContent.trim()&&!n.parentElement.closest('script,style'))out.push(n.textContent);}return out.join('');})(),forms:[...document.querySelectorAll('input,select,textarea')].map(e=>({id:e.id,choice:e.dataset.choice,type:e.type,value:e.value,disabled:e.disabled,checked:e.checked,options:e.options?[...e.options].map(o=>[o.value,o.textContent,o.disabled]):null})),ui:[...document.querySelectorAll('button,.tense-badge,.p73-tense')].map(e=>{const s=getComputedStyle(e);return [e.textContent,s.color,s.backgroundColor,s.fontWeight];}),labels:[...document.querySelectorAll('.example-label-title')].map(e=>{let s=getComputedStyle(e);return [e.textContent,s.color,s.fontWeight,s.backgroundColor];})}));}
async function inspect(p){return p.evaluate(()=>{
 const selectors='.grammar-highlight,.p71-grammar-highlight,.p73-gold,.degree-positive,.degree-negative,.semantic-positive,.semantic-negative,.p82-indefinite-something,.p82-indefinite-nothing,.p82-indefinite-anything';
 const entries=[],punctuation=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const n=walker.currentNode,e=n.parentElement;if(!n.textContent.trim()||e.closest('script,style,.tooltip-tip,.custom-tip-box,.vocab-inline,.semantic-punctuation,.selection-help-wrap .custom-tip-box'))continue;
  const semantic=e.closest(selectors);if(!semantic)continue;
  const range=document.createRange();range.selectNodeContents(n);if(![...range.getClientRects()].some(r=>r.width&&r.height))continue;
  const c=getComputedStyle(e);let role=semantic.matches('.degree-positive,.semantic-positive,.p82-indefinite-anything')?'positive':semantic.matches('.degree-negative,.semantic-negative,.p82-indefinite-nothing')?'negative':'grammar';
  entries.push({text:n.textContent,role,color:c.color,weight:c.fontWeight});
  if(/[。、？！!?，,.:：;；]/u.test(n.textContent))punctuation.push(n.textContent);
 }
 const plain=[...document.querySelectorAll('.semantic-punctuation')].map(e=>{const s=getComputedStyle(e);return [e.textContent,s.color,s.fontWeight,s.textDecorationLine];});
 const box=document.createElement('div');box.className='example-box';box.innerHTML=(window.SemanticDisplay?SemanticDisplay.highlightHTML('は、です。何？はい！'):'<strong class="grammar-highlight">文法</strong>')+'<span class="semantic-positive">肯定</span><span class="semantic-negative">否定</span>';document.body.append(box);
 const background=getComputedStyle(box).backgroundColor,fixture=[...box.querySelectorAll('strong,.semantic-positive,.semantic-negative')].map(e=>{let s=getComputedStyle(e);return [e.className,s.color,s.fontWeight];});box.remove();
 return {entries,punctuation,plain,normal:getComputedStyle(document.body).color,background,fixture,overflow:document.documentElement.scrollWidth>innerWidth+1,aliases:[getComputedStyle(document.documentElement).getPropertyValue('--degree-positive-color').trim(),getComputedStyle(document.documentElement).getPropertyValue('--degree-negative-color').trim()]};
 });}
async function tts(p){return p.evaluate(()=>{const b=[...document.querySelectorAll('.example-box button')].find(b=>!b.disabled&&b.textContent.startsWith('🔊きく'));if(!b)return null;const start=t.spoken.length;b.click();const value=t.spoken.slice(start).map(u=>[u.text,u.rate,u.lang]);t.spoken.at(-1)?.onend?.();return value;});}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 for(const name of names){const p=await open(browser,name,root),before=baseline?await open(browser,name,baseline):null;counts[name]={semanticTexts:0,punctuation:0,cases:0};
  for(const style of ['formal','informal','casual'])for(const mode of ['kanji','hiragana'])for(const width of [375,1440])for(const theme of ['light','dark']){
   for(const page of [p,before].filter(Boolean)){await page.emulateMedia({colorScheme:theme});await page.setViewportSize({width,height:1100});await settings(page,style,mode);}
   const key=name+'/'+style+'/'+mode+'/'+width+'/'+theme;
   if(before){const a=await snapshot(p),b=await snapshot(before);check(JSON.stringify(a)===JSON.stringify(b),'content/forms/English labels preserved '+key,{sameText:a.text===b.text,sameForms:JSON.stringify(a.forms)===JSON.stringify(b.forms),sameLabels:JSON.stringify(a.labels)===JSON.stringify(b.labels),sameUI:JSON.stringify(a.ui)===JSON.stringify(b.ui),uiDiff:a.ui.map((v,i)=>JSON.stringify(v)===JSON.stringify(b.ui[i])?null:[v,b.ui[i]]).filter(Boolean).slice(0,3)});check(JSON.stringify(await tts(p))===JSON.stringify(await tts(before)),'TTS input preserved '+key);}
   const a=await inspect(p);counts[name].cases++;counts[name].semanticTexts+=a.entries.length;counts[name].punctuation+=a.plain.length;
   check(a.entries.every(e=>e.color===colors[theme][e.role]&&e.weight==='700'),'semantic colors/bold '+key,a.entries.filter(e=>e.color!==colors[theme][e.role]||e.weight!=='700').slice(0,8));
   check(a.punctuation.length===0,'no punctuation in semantic emphasis '+key,a.punctuation.slice(0,8));
   check(a.plain.every(([t,c,w,line])=>c===a.normal&&w==='400'&&line==='none'),'punctuation normal '+key,a.plain.slice(0,3));
   check(a.background===(theme==='light'?'rgb(255, 249, 196)':'rgb(66, 32, 6)'),'specified Example backgrounds '+key,a.background);
   check(a.fixture.every(([cl,c,w])=>c===colors[theme][cl==='semantic-positive'?'positive':cl==='semantic-negative'?'negative':'grammar']&&w==='700'),'common role fixtures '+key,a.fixture);
   check(!a.overflow,'no page overflow '+key,a.overflow);
  }
  for(const hint of ['off','paren']){await settings(p,'formal','kanji',hint);if(before){await settings(before,'formal','kanji',hint);const a=await snapshot(p),b=await snapshot(before);check(JSON.stringify(a)===JSON.stringify(b),'hint content/forms/labels preserved '+name+'/'+hint);}const a=await inspect(p);check(a.entries.every(e=>e.color===colors.dark[e.role]&&e.weight==='700'),'hint semantic colors/bold '+name+'/'+hint,a.entries.filter(e=>e.color!==colors.dark[e.role]||e.weight!=='700').slice(0,8));}
  const alias=await p.evaluate(()=>[getComputedStyle(document.documentElement).getPropertyValue('--degree-positive-color').trim().toUpperCase(),getComputedStyle(document.documentElement).getPropertyValue('--degree-negative-color').trim().toUpperCase()]);
  check(JSON.stringify(alias)===JSON.stringify(['#63D6F5','#FF8AA5']),'legacy aliases resolve '+name,alias);
  const unit=await p.evaluate(()=>{if(!window.SemanticDisplay)return null;const host=document.createElement('div'),text='A<&"は、です。何？はい！/／';host.innerHTML=SemanticDisplay.highlightHTML(text);return {same:host.textContent===text,escaped:!host.querySelector('img,script'),punct:[...host.querySelectorAll('strong')].every(e=>!/[。、？！!?，,.:：;；／/]/u.test(e.textContent))};});
  if(unit)check(unit.same&&unit.escaped&&unit.punct,'safe punctuation splitting '+name,unit);
  await p.setViewportSize({width:375,height:1100});
  const help=p.locator('.voice-help-icon');if(await help.count()){
   await help.hover();const info=await help.locator('.custom-tip-box').evaluate(e=>{const r=e.getBoundingClientRect();return {visible:getComputedStyle(e).visibility,fit:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight};});
   check(info.visible==='visible'&&info.fit,'footer help still opens/fits '+name,info);await p.mouse.move(0,0);check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'footer help closed without scroll '+name);
  }
  const vocab=p.locator('.tooltip-wrap:has(> .tooltip-tip)').filter({visible:true});if(await vocab.count()){
   await vocab.first().hover();const info=await vocab.first().locator('.tooltip-tip').evaluate(e=>{const r=e.getBoundingClientRect();return {visible:getComputedStyle(e).visibility,fit:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight};});check(info.visible==='visible'&&info.fit,'vocabulary hover preserved '+name,info);
  }
  check(p.errors.length===0,'runtime '+name,p.errors);check(p.missing.length===0,'all local resources '+name,p.missing);
  console.log('CHECKED',name,JSON.stringify(counts[name]));await p.close();await before?.close();
 }
 await browser.close();const result={checks,failures,counts};fs.writeFileSync(process.env.SEMANTIC_REPORT||path.join(require('os').tmpdir(),'semantic-colors-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({checks,failed:failures.length,first:failures.slice(0,15)},null,2));if(failures.length)process.exit(1);
})().catch(e=>{console.error(e.message.slice(0,3000));process.exit(1)});
