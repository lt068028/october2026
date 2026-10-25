// Compare CSS changes on the same DOM, including pseudo-elements and geometry.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {execFileSync}=require('child_process');
const {PNG}=require('pngjs');
const root=path.resolve(__dirname,'..');
const before=process.env.CSS_BASELINE?fs.readFileSync(process.env.CSS_BASELINE,'utf8'):execFileSync('git',['show','f893dd6:style.css'],{cwd:root,encoding:'utf8'});
const after=fs.readFileSync(path.join(root,'style.css'),'utf8');
const pages=['index','practice1.1','practice1.2','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2'];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let count=0;const usage={};
 for(const name of pages)for(const colorScheme of ['light','dark'])for(const width of [1280,600]){
  const p=await browser.newPage({viewport:{width,height:900},colorScheme,reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{name:'Chrome OS 日本語3',lang:'ja-JP',voiceURI:'3'}],addEventListener(){},cancel(){},speak(u){window.cssUtterance=u}}});
   window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
   Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise(()=>{})}});
  });
  await p.route('http://css.test/**',r=>{
   const f=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});
   return r.fulfill({body:f.endsWith('style.css')?before:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});
  });
  await p.goto('http://css.test/'+name+'.html');await p.waitForTimeout(40);
  await p.evaluate(css=>{const link=document.querySelector('link[href="style.css"]');const s=document.createElement('style');s.id='css-comparison';s.textContent=css;link.before(s);link.disabled=true;const freeze=document.createElement('style');freeze.textContent='*,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}html{overflow-anchor:none !important;scroll-behavior:auto !important}';document.head.append(freeze)},before);
  async function settle(css){await p.evaluate(css=>document.querySelector('#css-comparison').textContent=css,css);await p.waitForTimeout(40);await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(20)}
  async function snapshot(){return p.evaluate(()=>{
   const props=['display','position','box-sizing','width','height','color','background-color','border-top','border-right','border-bottom','border-left','border-radius','margin','padding','font-family','font-size','font-weight','line-height','opacity','filter','cursor','overflow','white-space','gap','align-items','justify-content','grid-template-columns','flex-direction','flex-wrap','text-align','visibility','outline','outline-offset','content','z-index'];
   const styles=(el,pseudo)=>{const s=getComputedStyle(el,pseudo);return props.map(k=>s.getPropertyValue(k))};
   return [...document.querySelectorAll('body,body *')].filter(e=>!['SCRIPT','STYLE'].includes(e.tagName)).map(e=>{
    const r=e.getBoundingClientRect();return {tag:e.tagName,cls:e.className,disabled:Boolean(e.disabled),hidden:e.hidden,rect:[r.x+window.scrollX,r.y+window.scrollY,r.width,r.height].map(n=>Math.round(n*1000)/1000),style:styles(e),before:styles(e,'::before'),after:styles(e,'::after')};
   });
  })}
  async function compare(state){
   await settle(before);const a=await snapshot();const imageA=PNG.sync.read(await p.screenshot({animations:'disabled'}));
   const used=await p.evaluate(()=>{
    const result=[];function walk(rules){for(const r of rules){if(r.selectorText){try{if(document.querySelector(r.selectorText.replace(/::[\w-]+(?:\([^)]*\))?/g,'')))result.push(r.selectorText)}catch{}}else if(r.cssRules)walk(r.cssRules)}}
    walk(document.querySelector('#css-comparison').sheet.cssRules);return result;
   });
   used.forEach(s=>usage[s]=(usage[s]||0)+1);
   await settle(after);const b=await snapshot();
   assert.deepEqual(b,a,`${name} ${colorScheme} ${width} ${state}: computed styles and geometry`);count++;
   const imageB=PNG.sync.read(await p.screenshot({animations:'disabled'}));
   assert.equal(imageB.width,imageA.width);assert.equal(imageB.height,imageA.height);
   assert(imageB.data.equals(imageA.data),`${name} ${colorScheme} ${width} ${state}: visible pixels`);count++;
  }
  await compare('initial');
  if(name!=='index'){
   for(const style of ['informal','casual','formal']){
    const b=p.locator('#speechStyleControl [data-value="'+style+'"]');
    if(await b.count()&&!await b.isDisabled()){await settle(before);await b.click();await compare(style)}
   }
   for(const id of ['scriptModeControl','hintModeControl']){
    const values=await p.locator('#'+id+' button[data-value]:not(:disabled)').evaluateAll(bs=>bs.map(b=>b.dataset.value));
    for(const value of values){await settle(before);await p.locator('#'+id+' [data-value="'+value+'"]').click();await compare(id+'-'+value)}
   }
   for(let i=0;i<2;i++){
    const cue=p.locator('.drill-cue-button').first();if(!await cue.count()||await cue.isDisabled())break;
    await settle(before);await cue.click();await compare('cue-'+i);
   }
   await settle(before);
   await p.locator('#voiceDropdownBtn').click();await compare('voice-menu');
   await p.keyboard.press('Escape');
   const listen=p.locator('button').filter({hasText:/^🔊きく/}).first();
   await settle(before);await listen.click();await compare('playing');
   await p.evaluate(()=>cssUtterance?.onend?.());
   await settle(before);
   await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>!b.disabled&&/^(🎙️|⏺️)とる/.test(b.textContent))?.click());
   await compare('microphone-permission-lock');
  }
  assert.deepEqual(errors,[],name+' runtime errors');await p.close();console.log('CSS',name,colorScheme,width);
 }
 fs.writeFileSync(process.env.CSS_USAGE_REPORT||'/tmp/october2026-css-usage.json',JSON.stringify(usage,null,2));
 await browser.close();console.log('PASS CSS regression',count);
})().catch(e=>{console.error(e);process.exit(1)});
