// Real-browser fit/geometry checks for shared Example adapters (not curriculum tests).
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const names=(process.env.PRACTICE_PAGES||'practice1.1 practice1.2 practice2.1 practice2.2 practice2.3 practice7.1 practice7.2 practice7.3 practice8.1 practice8.2 practice8.3').split(/[ ,]+/);
const source=fs.readFileSync(path.join(root,'tests/audio-relay.cjs'),'utf8'),mock=source.slice(source.indexOf('function mock()'),source.indexOf('(async()=>'));
const failures=[],observations=[];let checks=0;
function check(ok,label,details){checks++;if(!ok)failures.push({label,details});}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 for(const name of names){
  const p=await browser.newPage({viewport:{width:1280,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript('('+mock.trim()+')();Math.random=()=>.3;');
  await p.route('http://examples.test/**',r=>{const f=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'',contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'text/html'});});
  await p.goto('http://examples.test/'+name+'.html');await p.evaluate(()=>document.fonts.ready);
  for(const width of (process.env.CONTENT_WIDTHS||'375 600 760 850 900 1024 1280').split(/[ ,]+/).map(Number))for(const mode of ['kanji','hiragana'])for(const hint of ['hover','paren','off']) {
   await p.setViewportSize({width,height:1100});await p.emulateMedia({colorScheme:mode==='kanji'?'light':'dark'});
   await p.evaluate(({mode,hint})=>{for(const[id,value]of [['scriptModeControl',mode],['hintModeControl',hint]]){const b=document.querySelector('#'+id+' [data-value="'+value+'"]');if(b&&b.getAttribute('aria-pressed')!=='true')b.click();}},{mode,hint});
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));
   const data=await p.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    return {overflow:document.documentElement.scrollWidth>innerWidth+1,tables:[...document.querySelectorAll('.content-example-grid,.content-adaptive-example,.content-degree-guide')].map(t=>({rect:rect(t),layout:t.dataset.contentExample,columns:getComputedStyle(t).gridTemplateColumns,audio:[...t.querySelectorAll('button')].filter(b=>!b.closest('.p2x-picture,.p21-drill-picture')&&b.getClientRects().length).map(b=>{const actual=b.getBoundingClientRect(),copy=b.cloneNode(true);Object.assign(copy.style,{position:'absolute',visibility:'hidden',height:'max-content',alignSelf:'start',gridArea:'auto'});b.parentElement.append(copy);const natural=copy.getBoundingClientRect().height;copy.remove();return{height:actual.height,natural,text:b.textContent};}),cells:[...t.querySelectorAll('[data-content-example-cell],[data-content-adaptive-box]')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,diagram:e.matches('.p2x-picture,.p21-drill-picture'),rect:rect(e),row:e.style.gridRow,col:e.style.gridColumn,button:e.matches('button')||!!e.querySelector('button'),model:e.dataset.contentModel,textRects:(()=>{const a=[],w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(!n.textContent.trim()||n.parentElement.closest('.tooltip-tip,.custom-tip-box,[aria-hidden=\"true\"]')||getComputedStyle(n.parentElement).visibility==='hidden')continue;const r=document.createRange();r.selectNodeContents(n);for(const b of r.getClientRects())if(b.width&&b.height)a.push({x:b.x,right:b.right,y:b.y,bottom:b.bottom});}return a;})()}))}))};
   });
   const key=[name,width,mode,hint].join('/');observations.push({key,...data});check(!data.overflow,key+' page overflow');
   for(const t of data.tables){for(const b of t.audio)check(Math.abs(b.height-b.natural)<1,key+' native playback button height retained',b);for(const c of t.cells){check(c.rect.x>=t.rect.x-1&&c.rect.right<=t.rect.right+1,key+' cell within content',c);check(c.textRects.every(r=>r.x>=t.rect.x-1&&r.right<=t.rect.right+1),key+' rendered text fits content',c);if(!c.diagram)for(let i=0;i<c.textRects.length;i++)for(let j=i+1;j<c.textRects.length;j++){const a=c.textRects[i],b=c.textRects[j];check(!(Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1),key+' no internal glyph overlap',{text:c.text,a,b});}if(c.button)check(c.rect.w>0&&c.rect.right<=width+1,key+' playback accessible',c);}
    for(let i=0;i<t.cells.length;i++)for(let j=i+1;j<t.cells.length;j++){const a=t.cells[i],b=t.cells[j];if(a.rect.w<1||b.rect.w<1||(!a.button&&!a.textRects.length)||(!b.button&&!b.textRects.length))continue;check(!(Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.x,b.rect.x)>1&&Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.y,b.rect.y)>1),key+' no cell overlap',{a,b});}
   }
  }
  if (['practice2.1', 'practice2.2', 'practice8.1', 'practice8.2'].includes(name)) {
   await p.setViewportSize({width: 900, height: 1100});
   await p.evaluate(() => {
    const hoverBtn = document.querySelector('#hintModeControl [data-value="hover"]');
    if (hoverBtn && hoverBtn.getAttribute('aria-pressed') !== 'true') hoverBtn.click();
   });
   await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
   const domainCheck = await p.evaluate((pageName) => {
    if (pageName === 'practice2.1') {
     const exRightTips = document.querySelectorAll('#drill3Container .p21-which-model-line .p21-model .tooltip-wrap, #drill3Container .p21-which-model-line .tooltip-wrap:not(.p21-which-cue .tooltip-wrap)').length;
     const exLeftCueTips = document.querySelectorAll('#drill3Container .p21-which-cue .tooltip-wrap').length;
     const drillTips = document.querySelectorAll('#drill1Container .recording-table .tooltip-wrap, #drill2Container .recording-table .tooltip-wrap').length;
     const emphasis = document.querySelectorAll('#drill3Container .p21-which-model-line strong').length;
     return { exRightTips, hasLeftCue: exLeftCueTips > 0, hasDrillTips: drillTips > 0, hasEmphasis: emphasis > 0 };
    }
    if (pageName === 'practice2.2') {
     const exRightTips = document.querySelectorAll('.p22-conversation-line .tooltip-wrap:not(.p22-example-cue .tooltip-wrap)').length;
     const exLeftCueTips = document.querySelectorAll('.p22-example-cue .tooltip-wrap').length;
     const drillTips = document.querySelectorAll('.recording-table .tooltip-wrap').length;
     const emphasis = document.querySelectorAll('.p22-conversation-line .grammar-highlight').length;
     return { exRightTips, hasLeftCue: exLeftCueTips > 0, hasDrillTips: drillTips > 0, hasEmphasis: emphasis > 0 };
    }
    if (pageName === 'practice8.1') {
     const exRightTips = document.querySelectorAll('.p81-example .p81-model .tooltip-wrap').length;
     const exLeftCueTips = document.querySelectorAll('.p81-example .p81-example-cue .tooltip-wrap').length;
     const drillTips = document.querySelectorAll('.recording-table .tooltip-wrap').length;
     const emphasis = document.querySelectorAll('.p81-example .p81-model strong.p81-gold, .p81-example .p81-model .degree-negative').length;
     return { exRightTips, hasLeftCue: exLeftCueTips > 0, hasDrillTips: drillTips > 0, hasEmphasis: emphasis > 0 };
    }
    const exRightVocabTips = document.querySelectorAll('.p81-example .p81-model .tooltip-wrap:not(.optional-particle)').length;
    const exOptionalParticleTip = document.querySelector('#drill2 .p81-example .p81-model .optional-particle.tooltip-wrap .tooltip-tip')?.textContent || '';
    const exLeftCueTips = document.querySelectorAll('.p81-example .p81-example-cue .tooltip-wrap').length;
    const drillTips = document.querySelectorAll('.recording-table .tooltip-wrap').length;
    const emphasis = document.querySelectorAll('.p81-example .p81-model strong').length;
    return { exRightTips: exRightVocabTips, hasOptionalParticle: exOptionalParticleTip.includes('The particle を is optional'), hasLeftCue: exLeftCueTips > 0, hasDrillTips: drillTips > 0, hasEmphasis: emphasis > 0 };
   }, name);
   check(domainCheck.exRightTips === 0, name + ' Example right model has no vocabulary tooltips', domainCheck);
   check(domainCheck.hasLeftCue, name + ' Example left cue retains vocabulary tooltips', domainCheck);
   check(domainCheck.hasDrillTips, name + ' Drill rows retain vocabulary tooltips', domainCheck);
   check(domainCheck.hasEmphasis, name + ' Example model retains grammar emphasis', domainCheck);
   if (name === 'practice8.2') {
    check(domainCheck.hasOptionalParticle, name + ' Ex2 retains optional particle を explanation tooltip', domainCheck);
   }
  }
  check(!errors.length,name+' runtime',errors);console.log('EXAMPLES',name,'checked');await p.close();
 }
 await browser.close();fs.writeFileSync(process.env.EXAMPLE_REPORT||'/tmp/content-examples.json',JSON.stringify({checks,failures,observations},null,2));console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,8)},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
