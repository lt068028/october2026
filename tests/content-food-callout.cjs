// Approved scene callout fallback: real text/price geometry, reversible without replacing nodes.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const code=fs.readFileSync(path.join(__dirname,'content-layout.cjs'),'utf8');
const h=new Function('require','__dirname','process',code.slice(0,code.indexOf('\n(async()=>{const browser'))+';return {open,settings,settle};')(require,__dirname,process);
const root=path.resolve(__dirname,'..'),failures=[],observations=[];let checks=0;function check(ok,label,details){checks++;if(!ok)failures.push({label,details});}
async function state(p){return p.evaluate(()=>{
 const picture=document.querySelector('.p2x-food-example .p2x-picture'),stage=picture.querySelector('.p2x-stage'),guide=picture.querySelector('.p21-which-guide');
 const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};},frame=rect(stage);
 const labels=[...guide.querySelectorAll('.p21-question-sound,.p21-question-description')].map(rect),prices=[...picture.querySelectorAll('.p2x-price')].map(rect);
 const collision=labels.some(a=>prices.some(b=>Math.min(a.right,b.right)>Math.max(a.x,b.x)+.25&&Math.min(a.bottom,b.bottom)>Math.max(a.y,b.y)+.25));
 return {docked:guide.classList.contains('content-docked-guide'),sameNode:!window.originalCallout||window.originalCallout===guide,text:guide.textContent,fonts:[guide,...guide.querySelectorAll('.p21-question-sound,.p21-question-description')].map(e=>{const s=getComputedStyle(e);return[s.font,s.color,s.fontWeight];}),labels,prices,frame,guide:rect(guide),collision,overflow:document.documentElement.scrollWidth>innerWidth+1,scene:[...stage.querySelectorAll('img,.p2x-price,.p2x-object,.p2x-person')].map(e=>{const r=rect(e);return{tag:e.tagName,cls:e.className,src:e.getAttribute('src'),x:r.x-frame.x,y:r.y-frame.y,w:r.w,h:r.h,text:e.matches('.p2x-price,.p2x-person')?e.textContent:null};})};
 });}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await h.open(browser,'practice2.2',root),before=process.env.CONTENT_BASELINE?await h.open(browser,'practice2.2',process.env.CONTENT_BASELINE):null;
for(const mode of ['kanji','hiragana'])for(const hint of ['hover','paren','off'])for(const theme of ['light','dark']){
 for(const q of [p,before].filter(Boolean)){await q.emulateMedia({colorScheme:theme});await h.settings(q,mode,hint,'formal');}
 await p.evaluate(()=>window.originalCallout=document.querySelector('.p2x-food-example .p21-which-guide'));
 let fonts=null,text=null;
 for(const width of [1280,1024,900,850,760,600,450,422,375,600,375,1280]){
  for(const q of [p,before].filter(Boolean)){await q.setViewportSize({width,height:1100});await h.settle(q);}
  const a=await state(p),b=before?await state(before):null,key=[width,mode,hint,theme].join('/');observations.push({key,...a});
  if(!fonts){fonts=a.fonts;text=a.text;}
  check(a.sameNode,key+' original callout node retained');check(a.text===text,key+' wording unchanged');check(JSON.stringify(a.fonts)===JSON.stringify(fonts),key+' typography/color unchanged');check(!a.collision,key+' prices remain clear',a);
  check(!a.overflow&&a.labels.every(r=>r.x>=64&&r.right<=width-64+.5),key+' callout stays within card',a);
  if(width===375)check(a.docked,key+' narrow photo fallback');if(width>=600)check(!a.docked,key+' roomy photo uses original placement');
  if(a.docked)check(a.guide.y>=a.frame.bottom,key+' callout below photograph',a);
  if(b)check(JSON.stringify(a.scene)===JSON.stringify(b.scene),key+' photograph and scene coordinates unchanged',{a:a.scene,b:b.scene});
 }
}
// Locate the measured return boundary, then check both sides.
await h.settings(p,'kanji','hover','formal');let lo=375,hi=600;while(lo<hi){const mid=Math.floor((lo+hi)/2);await p.setViewportSize({width:mid,height:1100});await h.settle(p);if((await state(p)).docked)lo=mid+1;else hi=mid;}
for(const width of [lo-1,lo,lo+1]){await p.setViewportSize({width,height:1100});await h.settle(p);const a=await state(p);observations.push({boundary:true,width,...a});check(!a.collision&&!a.overflow,'measured callout boundary '+width,a);check(a.docked===(width<lo),'content-based callout transition '+width,a);}
check(!p.errors.length,'runtime',p.errors);await p.close();await before?.close();await browser.close();fs.writeFileSync(process.env.CALLOUT_REPORT||'/tmp/content-food-callout.json',JSON.stringify({checks,failures,observations},null,2));console.log(JSON.stringify({checks,failures:failures.length,boundary:lo,first:failures.slice(0,5)},null,2));if(failures.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1);});
