// Pair-local alignment and natural wrapping; no shared all-card audio column.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
async function checkLayout(page,check,context={}){
 const out=await page.locator('#drill5').evaluate(group=>{
  const problems=[],pairs=[];
  for(const card of group.querySelectorAll('.p81-card')){
   const pair={selects:[],gutters:[],actionGaps:[],grouped:true};
   for(const row of card.querySelectorAll('tr')){
    const items=[];
    for(const e of row.querySelectorAll('.p81-kind,.target-word,.vocab-inline,.p81-selection-hint,.p81-repeat-mark,select,.p81-cue-button-group button')){
     if(e.closest('.tooltip-tip,.custom-tip-box')||getComputedStyle(e).display==='none')continue;
     if(e.matches('select,button'))items.push({text:e.textContent,r:e.getBoundingClientRect()});
     else{const range=document.createRange();range.selectNodeContents(e);for(const r of range.getClientRects())if(r.width&&r.height)items.push({text:e.textContent,r});}
    }
    for(const x of items)if(x.r.left<-.6||x.r.right>innerWidth+.6)problems.push({id:row.dataset.row,type:'bounds',text:x.text,right:x.r.right});
    for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
     const a=items[i],b=items[j];if(Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>.6&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>.6)problems.push({id:row.dataset.row,type:'overlap',a:a.text,b:b.text});
    }
    const hint=row.querySelector('select').nextElementSibling?.matches('.vocab-inline')?row.querySelector('select').nextElementSibling:null,hintRect=hint&&getComputedStyle(hint).display!=='none'?hint.getBoundingClientRect():null;
    const label=row.querySelector('.p81-kind').getBoundingClientRect(),cue=row.querySelector('.p81-cue-words').getBoundingClientRect(),sel=row.querySelector('select').getBoundingClientRect(),buttons=[...row.querySelectorAll('.p81-cue-button-group button')].map(e=>e.getBoundingClientRect());
    pair.selects.push({left:sel.left,top:sel.top});
    if(Math.abs(label.top-cue.top)<10)pair.gutters.push(cue.left-label.right);
    if(Math.abs(sel.top-buttons[0].top)<10)pair.actionGaps.push(buttons[0].left-(hintRect&&Math.abs(hintRect.top-buttons[0].top)<10?hintRect.right:sel.right));
    pair.grouped&&=buttons.length===3&&buttons.every(r=>Math.abs(r.top-buttons[0].top)<1)&&buttons.slice(1).every((r,i)=>Math.abs(r.left-buttons[i].right-2)<1);
   }
   const note=card.querySelector('.p81-nuance-note');if(!note.hidden){const r=note.getBoundingClientRect();if(r.right>innerWidth+.6||note.scrollWidth>note.clientWidth+1)problems.push({id:card.dataset.item,type:'notice-clip',right:r.right});}
   pairs.push(pair);
  }
  return {problems,pairs,overflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 check(out.problems,[],'D5 no overlap/clip '+JSON.stringify(context));check(out.overflow,false,'page fits '+JSON.stringify(context));
 for(const [i,p]of out.pairs.entries()){
  check(p.grouped,true,'3 grouped buttons, 2px gaps '+i);
  check(p.gutters.every(x=>Math.abs(x-8)<1),true,'8px label gutter '+i+' '+JSON.stringify(context)+' gaps='+p.gutters);
  check(p.actionGaps.every(x=>Math.abs(x-8)<1),true,'8px select/action gutter '+i+' '+JSON.stringify(context)+' gaps='+p.actionGaps);
  if(context.width>=1440)check(Math.abs(p.selects[0].left-p.selects[1].left)<1,true,'paired selects align '+i);
 }
}
module.exports={checkLayout};
if(require.main===module)(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const audio=fs.readFileSync(path.join(__dirname,'audio-relay.cjs'),'utf8'),mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
 await page.addInitScript('('+mock.trim()+')();');
 await page.route('http://practice81.test/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);if(!fs.existsSync(file))return r.fulfill({status:404,body:''});let s=fs.readFileSync(file,'utf8');if(file.endsWith('practice8.1.js'))s=s.replace(/\}\)\(\);\s*$/,'window.layout81={saved,views,choices,rowsFor,keyFor,render,showResult};})();');return r.fulfill({body:s,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});});
 await page.goto('http://practice81.test/practice8.1.html');let count=0;const check=(a,b,m)=>{assert.deepEqual(a,b,m);count++;};
 for(const script of ['kanji','hiragana'])for(const hint of ['paren','hover','off']){
  await page.locator('#scriptModeControl [data-value="'+script+'"]').click();await page.locator('#hintModeControl [data-value="'+hint+'"]').click();
  console.log('LAYOUT',script,hint);
  for(const state of ['empty','wrong','correct','notice']){
   await page.evaluate(state=>{const a=layout81;for(const r of a.rowsFor(4).flat()){if(state==='empty')a.choices.delete(r.id);else a.choices.set(r.id,state==='wrong'?r.options.find(x=>x!==r.adjective):r.adjective);}a.saved.clear();a.render();if(state==='notice')for(const [key,v]of a.views)if(v.r.comparison){a.saved.set(key,{url:'blob:layout-only',raw:'',modelText:v.r.text,refs:v.r.refs,correct:false});a.showResult(key);}},state);
   for(const width of [375,600,768,1024,1440,1920])for(const scheme of ['light','dark']){await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:scheme});await page.evaluate(()=>new Promise(requestAnimationFrame));await checkLayout(page,check,{width,script,hint,state,scheme});}
  }
 }
 check(errors,[],'runtime');await browser.close();console.log('PASS cue matrix',count);
})().catch(e=>{console.error(e.message.slice(0,5000));process.exit(1)});
