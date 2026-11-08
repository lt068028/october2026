// Real Chromium regression: Example cell width, word boundaries and resize state.
// Audio events use the existing harness mocks; this does not verify acoustic quality.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const source=fs.readFileSync(path.join(__dirname,'content-layout.cjs'),'utf8');
const h=new Function('require','__dirname','process',source.slice(0,source.indexOf('\n(async()=>{const browser'))+';return {open,settings,settle};')(require,__dirname,process);
const root=process.env.CONTENT_ROOT||path.resolve(__dirname,'..'),out=process.env.RESIZE_OUTPUT||'/tmp';
const widths=[1440,1280,1024,900,850,760,600,375,600,760,850,900,1024,1280,1440,375,1440];
const observations=[],failures=[];let checks=0;
function check(ok,label,details){checks++;if(!ok)failures.push({label,details});}
async function geometry(p){await h.settle(p);return p.evaluate(()=>{
 const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
 const examples=[...document.querySelectorAll('.drill-example-table tr')].map(row=>{const c=row.children[1],table=row.closest('table');return {card:box(table.closest('.example-box')),table:box(table),tracks:getComputedStyle(table).gridTemplateColumns,cue:box(c),words:[...c.querySelectorAll('.target-word')].map(w=>{const r=document.createRange();r.selectNodeContents(w);return {text:w.textContent,rects:[...r.getClientRects()].map(x=>({x:x.x,y:x.y,w:x.width,h:x.height}))};})};});
 const drills=[...document.querySelectorAll('.recording-table.content-record-grid')].map(t=>({table:box(t),layout:t.dataset.contentLayout,tracks:getComputedStyle(t).gridTemplateColumns,cells:[...t.querySelectorAll('td')].map(c=>({role:c.dataset.contentCell,rect:box(c)}))}));
 return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,examples,drills};
 });}
function audit(g,key){check(!g.overflow,key+' page fits');for(const e of g.examples){const track=parseFloat(e.tracks.split(' ')[1]);check(Math.abs(e.cue.w-track)<1,key+' actual Example cue fills track',{track,cell:e.cue.w});check(e.cue.right<=e.table.right+1,key+' Example cue fits');for(const w of e.words)check(new Set(w.rects.map(r=>Math.round(r.y))).size<=1,key+' Japanese word intact',w);}for(const t of g.drills)check(t.cells.every(c=>!!c.role),key+' every recording cell classified',t);}
function signature(g){return JSON.stringify({examples:g.examples,drills:g.drills},(k,v)=>typeof v==='number'?Math.round(v*10)/10:v);}
async function state(p){return p.evaluate(()=>({forms:[...document.querySelectorAll('input,select,textarea')].map(e=>[e.id,e.value,e.checked,e.disabled]),saved:JSON.stringify(practice1State.savedResults),recordings:JSON.stringify(practice1State.audioUrls),results:[...document.querySelectorAll('.recording-result')].map(e=>e.innerHTML)}));}
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const mode of (process.env.STATE_ONLY?[]:['hiragana','kanji']))for(const hint of ['off','hover','paren']){
 const p=await h.open(b,'practice1.1',root);await h.settings(p,mode,hint,'formal');
 const fresh=new Map();for(const width of [...new Set(widths)]){const q=await h.open(b,'practice1.1',root);await q.setViewportSize({width,height:1100});await h.settings(q,mode,hint,'formal');fresh.set(width,signature(await geometry(q)));await q.close();}
 for(const width of widths){await p.setViewportSize({width,height:1100});const g=await geometry(p),key=[mode,hint,width].join('/');audit(g,key);check(signature(g)===fresh.get(width),key+' resize equals fresh load');observations.push({key,...g});}
 if(mode==='hiragana'&&hint==='hover'){await p.setViewportSize({width:1363,height:1100});await geometry(p);await p.locator('.example-box').first().screenshot({path:path.join(out,'p11-example-1363.png')});await p.setViewportSize({width:375,height:1100});await geometry(p);await p.locator('.example-box').first().screenshot({path:path.join(out,'p11-example-375.png')});}
 console.log('RESIZE',mode,hint);await p.close();
}
const p=await h.open(b,'practice1.1',root);await h.settings(p,'kanji','paren','casual');
await p.evaluate(()=>{for(const s of document.querySelectorAll('.recording-table select')){const o=[...s.options].filter(o=>o.value&&!o.disabled).at(-1);if(o){s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));}}for(const i of document.querySelectorAll('.recording-table input[type="text"]')){i.value='がくせい';i.dispatchEvent(new Event('input',{bubbles:true}));}const autoplay=document.querySelector('#togglePlaybackMode');if(autoplay.checked)autoplay.click();t.speaking=true;const autostop=document.querySelector('#toggleRecordMode');if(autostop.checked)autostop.click();[...document.querySelectorAll('button')].find(b=>/^(🎙️|⏺️)とる/.test(b.textContent)&&!b.disabled).click();});
await p.waitForTimeout(400);await p.evaluate(()=>{const r=t.recognitions.at(-1),result=[{transcript:'私は学生です'}];result.isFinal=true;r?.onresult?.({resultIndex:0,results:[result]});r?.onspeechstart?.();});await p.locator('.stop-btn-active:not(:disabled)').click();await p.waitForTimeout(150);await h.settle(p);
const before=await state(p);check(before.saved!=='{}','recording and recognition fixture created',before);for(const width of widths){await p.setViewportSize({width,height:1100});await geometry(p);check(JSON.stringify(await state(p))===JSON.stringify(before),'settings/selections/input/recording/result retained '+width);}
check(!p.errors.length,'state runtime',p.errors);await p.close();
}finally{await b.close();fs.writeFileSync(path.join(out,'p11-resize.json'),JSON.stringify({checks,failures,observations},null,2));}console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,5)},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
