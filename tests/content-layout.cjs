// Actual row geometry and fit decisions; scope excludes curriculum-wide judging tests.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const root=process.env.CONTENT_ROOT||path.resolve(__dirname,'..'),baseline=process.env.CONTENT_BASELINE;
const names=(process.env.PRACTICE_PAGES||'practice1.1 practice1.2 practice2.1 practice2.2 practice2.3 practice7.1 practice7.2 practice7.3 practice8.1 practice8.2 practice8.3').split(/[ ,]+/);
const audio=fs.readFileSync(path.join(root,'tests/audio-relay.cjs'),'utf8'),mock=audio.slice(audio.indexOf('function mock()'),audio.indexOf('(async()=>'));
let checks=0;const failures=[],counts={},observations=[];function check(value,label,detail){checks++;if(!value)failures.push({label,detail});}
async function deadline(promise,label){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label+' exceeded 60 seconds')),60000);})]);}finally{clearTimeout(timer);}}
async function open(browser,name,dir){const p=await browser.newPage({viewport:{width:1280,height:1100}});p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.addInitScript('('+mock.trim()+')();Math.random=()=>.3;');await p.route('http://content.test/**',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);if(!fs.existsSync(f))return r.fulfill({status:404,body:''});return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.webp')?'image/webp':'text/html'});});await p.goto('http://content.test/'+name+'.html');await p.evaluate(()=>document.fonts.ready);await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});return p;}
async function settle(p){await deadline(p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))))),'layout settle');}
async function settings(p,mode,hint,style){await p.evaluate(({mode,hint,style})=>{for(const[id,value]of [['scriptModeControl',mode],['hintModeControl',hint],['speechStyleControl',style]]){const b=document.querySelector('#'+id+' [data-value="'+value+'"]');if(b&&!b.disabled&&b.getAttribute('aria-pressed')!=='true')b.click();}},{mode,hint,style});await settle(p);}
async function inspect(p,measure=true){return deadline(p.evaluate(measure=>{
 const text=e=>{const c=e.cloneNode(true);c.querySelectorAll('script,style,.tooltip-tip,.custom-tip-box').forEach(e=>e.remove());return c.textContent.replace(/\s+/g,' ').trim();};
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
 const intrinsic=e=>{const c=e.cloneNode(true),s=getComputedStyle(e);c.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(e=>e.remove());Object.assign(c.style,{position:'absolute',visibility:'hidden',display:s.display.includes('flex')?'inline-flex':s.display.includes('grid')?'inline-grid':'inline-block',width:'max-content',minWidth:'0',maxWidth:'none',whiteSpace:'nowrap',flexWrap:'nowrap'});e.parentElement.append(c);const w=c.getBoundingClientRect().width;c.remove();return w;};
 const tables=measure?[...document.querySelectorAll('table.recording-table')].filter(t=>t.querySelector('td.prompt-label,td.drill-cue-cell')&&t.querySelector('.recording-controls .recording-actions')).map(t=>{
  const cues=[...t.querySelectorAll('td.prompt-label,td.drill-cue-cell')],controls=[...t.querySelectorAll('.recording-controls')].map(e=>e.closest('td')).filter(e=>e.querySelector('.recording-actions')),numbers=[...t.querySelectorAll('.drill-number-cell,.p73-number')];
  const number=parseFloat(getComputedStyle(t).getPropertyValue('--content-number-width'))||Math.max(0,...numbers.map(intrinsic)),cue=Math.max(...cues.map(intrinsic)),actions=Math.max(...controls.map(e=>{const s=getComputedStyle(e);return intrinsic(e.querySelector('.recording-actions'))+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight);}));
  return {id:t.closest('[id]')?.id,text:text(cues[0]),width:t.clientWidth,needed:number+cue+actions+(number>0?8:4),layout:t.dataset.contentLayout,columns:getComputedStyle(t).gridTemplateColumns,rows:[...t.querySelectorAll('tr')].filter(r=>r.querySelector('.recording-actions')).map(row=>{const c=row.querySelector('td.prompt-label,td.drill-cue-cell'),a=row.querySelector('.recording-actions');return {cue:c?rect(c):null,span:c?.rowSpan,action:rect(a),buttons:[...a.querySelectorAll('button')].filter(e=>getComputedStyle(e).display!=='none').map(rect)};})};
 }):[];
 const inlineRows=measure?[...document.querySelectorAll('.prompt-label:has(.p81-cue-button-group)')].map(cue=>{
  const group=cue.querySelector('.p81-cue-button-group');
  const copy=cue.cloneNode(true);copy.querySelectorAll('.not-recorded-yet,.tooltip-tip,.custom-tip-box').forEach(e=>e.remove());
  Object.assign(copy.style,{position:'absolute',visibility:'hidden',display:'inline-flex',width:'max-content',maxWidth:'none',whiteSpace:'nowrap',flexWrap:'nowrap'});
  cue.parentElement.append(copy);const needed=copy.getBoundingClientRect().width;copy.remove();
  const label=cue.querySelector('.p81-kind'),words=cue.querySelector('.p81-cue-words'),select=cue.querySelector('select');
  return {width:cue.clientWidth,needed,parts:[label,words,select,group].filter(Boolean).map(rect),buttons:[...group.querySelectorAll('button')].map(rect)};
 }):[];
 const forms=[...document.querySelectorAll('input,select,textarea')].map(e=>[e.id,e.value,e.checked,e.disabled,e.options?[...e.options].map(o=>[o.value,o.textContent]):null]);
 return {tables,inlineRows,forms,text:text(document.body),overflow:document.documentElement.scrollWidth>innerWidth+1,width:innerWidth};
 },measure),'geometry measurement');}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
for(const name of names){const p=await open(browser,name,root),b=baseline?await open(browser,name,baseline):null;counts[name]={conditions:0,tables:0,rows:0};
const widths=(process.env.CONTENT_WIDTHS||'375 600 760 850 900 1024 1280').split(/[ ,]+/).map(Number);
const settingsMatrix=[];for(const width of widths)for(const mode of ['kanji','hiragana'])settingsMatrix.push([width,mode,'hover','formal','light']);
for(const width of [375,600,850,1280].filter(w=>widths.includes(w)))for(const hint of ['off','paren'])for(const style of ['informal','casual'])settingsMatrix.push([width,'hiragana',hint,style,'dark']);
for(const [width,mode,hint,style,theme]of settingsMatrix){for(const q of[p,b].filter(Boolean)){await q.setViewportSize({width,height:1100});await q.emulateMedia({colorScheme:theme});await settings(q,mode,hint,style);}const a=await inspect(p),old=b?await inspect(b,false):null,key=[name,width,mode,hint,style,theme].join('/');counts[name].conditions++;counts[name].tables+=a.tables.length;counts[name].rows+=a.tables.reduce((n,t)=>n+t.rows.length,0);observations.push({key,...a,forms:undefined,text:undefined});
check(!a.overflow,'page width '+key);check(a.tables.length>0,'recording rows audited '+key);
if(old){check(a.text===old.text,'all visible/accessible words preserved '+key);check(JSON.stringify(a.forms)===JSON.stringify(old.forms),'controls and choices preserved '+key);}
for(const [ti,t]of a.tables.entries()){
const fitExpected=t.needed<=t.width-25?'inline':(t.needed>t.width+.25?'stacked':t.layout);
check(t.layout===fitExpected,'content fit decision '+key+'/'+ti,{width:t.width,needed:t.needed,layout:t.layout,columns:t.columns});
for(const [ri,r]of t.rows.entries()){
check(r.buttons.every(b=>b.x>=-1&&b.right<=width+1),'operation buttons in viewport '+key+'/'+ti+'/'+ri,r.buttons);
if(t.layout==='inline'&&r.cue&&r.span<2)check(r.cue.y<r.action.bottom+1&&r.action.y<r.cue.bottom+1,'cue and operations share row '+key+'/'+ti+'/'+ri,r);
}
}
for(const [ri,row]of a.inlineRows.entries()){
 counts[name].rows++;
 check(row.buttons.every(b=>b.x>=-1&&b.right<=width+1),'inline cue buttons fit '+key+'/'+ri,row);
 if(row.needed<=row.width+.25)check(Math.max(...row.parts.map(r=>r.y))<Math.min(...row.parts.map(r=>r.bottom))+1,'inline cue primary contents stay together '+key+'/'+ri,row);
}
}
check(!p.errors.length,'runtime '+name,p.errors);console.log('CHECKED',name,JSON.stringify(counts[name]));await p.close();await b?.close();fs.writeFileSync(process.env.CONTENT_REPORT||'/tmp/content-layout.json',JSON.stringify({checks,failures,counts,observations},null,2));}
await browser.close();console.log(JSON.stringify({checks,failed:failures.length,first:failures.slice(0,12)},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
