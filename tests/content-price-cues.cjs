// Price remains a single displayed teacher cue; no model/TTS/answer data changes.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const code=fs.readFileSync(path.join(__dirname,'content-layout.cjs'),'utf8');
const h=new Function('require','__dirname','process',code.slice(0,code.indexOf('\n(async()=>{const browser'))+';return {open,settings,settle,inspect};')(require,__dirname,process);
const root=path.resolve(__dirname,'..'),failures=[],observations=[];let checks=0;function check(ok,label,details){checks++;if(!ok)failures.push({label,details});}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await h.open(browser,'practice2.2',root),before=process.env.CONTENT_BASELINE?await h.open(browser,'practice2.2',process.env.CONTENT_BASELINE):null;
for(const mode of ['kanji','hiragana'])for(const hint of ['hover','paren','off'])for(const style of ['formal','informal','casual']){
 for(const q of[p,before].filter(Boolean)){await q.emulateMedia({colorScheme:style==='casual'?'dark':'light'});await h.settings(q,mode,hint,style);}
 for(const width of [375,458,459,460,461,600,1280]){
  for(const q of[p,before].filter(Boolean)){await q.setViewportSize({width,height:1100});await h.settle(q);}
  const key=[mode,hint,style,width].join('/');
  const data=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,units:[...document.querySelectorAll('.p22-price-cue')].map(e=>{
   const r=e.getBoundingClientRect(),parent=e.closest('.p22-example-cue,.drill-cue-cell').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);
   const a=getComputedStyle(e),b=getComputedStyle(e.parentElement);
   return{text:e.textContent,rect:{x:r.x,right:r.right,y:r.y,bottom:r.bottom},parent:{x:parent.x,right:parent.right},lines:[...range.getClientRects()].filter(r=>r.width>0).length,stylesMatch:a.font===b.font&&a.color===b.color&&a.fontWeight===b.fontWeight};
  })}));observations.push({key,...data});check(!data.overflow,key+' page fits');check(data.units.length===((mode==='hiragana'||hint==='off')?5:0),key+' all raw price cues protected',data.units);
  for(const u of data.units){check(u.lines===1,key+' no mid-word price wrap',u);check(u.rect.x>=u.parent.x-.5&&u.rect.right<=u.parent.right+.5,key+' price fits cue track',u);check(u.stylesMatch,key+' typography unchanged',u);}
  if(before){const a=await h.inspect(p,false),b=await h.inspect(before,false);check(a.text===b.text,key+' all words preserved');check(JSON.stringify(a.forms)===JSON.stringify(b.forms),key+' controls/options preserved');}
 }
}
check(!p.errors.length,'runtime',p.errors);await p.close();await before?.close();await browser.close();fs.writeFileSync(process.env.PRICE_REPORT||'/tmp/content-price-cues.json',JSON.stringify({checks,failures,observations},null,2));console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,5)},null,2));if(failures.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1);});
