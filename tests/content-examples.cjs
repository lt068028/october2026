// Real-browser fit/geometry checks for shared Example adapters (not curriculum tests).
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const names=(process.env.PRACTICE_PAGES||'practice1.1 practice1.2 practice2.1 practice2.2 practice2.3 practice7.1 practice7.2 practice7.3').split(/[ ,]+/);
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
  for(const width of [375,600,760,850,900,1024,1280])for(const mode of ['kanji','hiragana'])for(const hint of ['hover','paren','off']) {
   await p.setViewportSize({width,height:1100});await p.emulateMedia({colorScheme:mode==='kanji'?'light':'dark'});
   await p.evaluate(({mode,hint})=>{for(const[id,value]of [['scriptModeControl',mode],['hintModeControl',hint]]){const b=document.querySelector('#'+id+' [data-value="'+value+'"]');if(b&&b.getAttribute('aria-pressed')!=='true')b.click();}},{mode,hint});
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));
   const data=await p.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    return {overflow:document.documentElement.scrollWidth>innerWidth+1,tables:[...document.querySelectorAll('.content-example-grid')].map(t=>({rect:rect(t),layout:t.dataset.contentExample,columns:getComputedStyle(t).gridTemplateColumns,cells:[...t.querySelectorAll('[data-content-example-cell]')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,rect:rect(e),row:e.style.gridRow,col:e.style.gridColumn,button:e.matches('button')||!!e.querySelector('button'),model:e.dataset.contentModel,textRects:(()=>{const a=[],w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(!n.textContent.trim()||n.parentElement.closest('.tooltip-tip,.custom-tip-box,[aria-hidden=\"true\"]')||getComputedStyle(n.parentElement).visibility==='hidden')continue;const r=document.createRange();r.selectNodeContents(n);for(const b of r.getClientRects())if(b.width&&b.height)a.push({x:b.x,right:b.right});}return a;})()}))}))};
   });
   const key=[name,width,mode,hint].join('/');observations.push({key,...data});check(!data.overflow,key+' page overflow');
   for(const t of data.tables){for(const c of t.cells){check(c.rect.x>=t.rect.x-1&&c.rect.right<=t.rect.right+1,key+' cell within content',c);check(c.textRects.every(r=>r.x>=t.rect.x-1&&r.right<=t.rect.right+1),key+' rendered text fits content',c);if(c.button)check(c.rect.w>0&&c.rect.right<=width+1,key+' playback accessible',c);}
    for(let i=0;i<t.cells.length;i++)for(let j=i+1;j<t.cells.length;j++){const a=t.cells[i],b=t.cells[j];if(a.rect.w<1||b.rect.w<1)continue;check(!(Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.x,b.rect.x)>1&&Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.y,b.rect.y)>1),key+' no cell overlap',{a,b});}
   }
  }
  check(!errors.length,name+' runtime',errors);console.log('EXAMPLES',name,'checked');await p.close();
 }
 await browser.close();fs.writeFileSync(process.env.EXAMPLE_REPORT||'/tmp/content-examples.json',JSON.stringify({checks,failures,observations},null,2));console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,8)},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
