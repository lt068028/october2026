// Independent boundary probes and unchanged native inline Example rows.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const code=fs.readFileSync(path.join(__dirname,'content-layout.cjs'),'utf8');
const h=new Function('require','__dirname','process',code.slice(0,code.indexOf('\n(async()=>{const browser'))+';return {open,settings,settle};')(require,__dirname,process);
const names=(process.env.PRACTICE_PAGES||'practice1.1 practice1.2 practice2.1 practice2.2 practice2.3 practice7.1 practice7.2 practice7.3 practice8.1 practice8.2 practice8.3').split(/[ ,]+/),root=path.resolve(__dirname,'..');
let checks=0;const failures=[],boundaries=[],native=[];function check(ok,label,detail){checks++;if(!ok)failures.push({label,detail});}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});for(const name of names){
 const p=await h.open(browser,name,root);
 for(const mode of ['kanji','hiragana']){
  await h.settings(p,mode,'hover','formal');
  for(const width of [375,600,760,850,900,1024,1280]){
   await p.setViewportSize({width,height:1100});await h.settle(p);
   const rows=await p.evaluate(()=>{
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    return [...document.querySelectorAll('.example-box .p21-model-line:not([data-content-adaptive-owner])')].filter(r=>r.firstElementChild?.matches('strong')).map(r=>{
     const label=r.firstElementChild,model=r.lastElementChild;let needed=0;
     const walker=document.createTreeWalker(model,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement.closest('.tooltip-tip,.custom-tip-box'))continue;ctx.font=getComputedStyle(n.parentElement).font;needed+=ctx.measureText(n.textContent).width;}
     const a=label.getBoundingClientRect(),b=model.getBoundingClientRect(),s=getComputedStyle(r);
     return {text:r.textContent,width:r.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),needed:needed+a.width,sameRow:a.y<b.bottom&&b.y<a.bottom};
    });
   });native.push({name,mode,width,rows});for(const r of rows)if(r.needed<=r.width+.25)check(r.sameRow,[name,mode,width,'native row remains inline'].join('/'),r);
  }
  const inline=()=>p.locator('table.content-record-grid').first().getAttribute('data-content-layout');
  let lo=375,hi=1280;while(lo<hi){const mid=Math.floor((lo+hi)/2);await p.setViewportSize({width:mid,height:1100});await h.settle(p);if(await inline()==='inline')hi=mid;else lo=mid+1;}
  boundaries.push({name,mode,viewport:lo});
  for(const width of [lo-1,lo,lo+1].filter(w=>w>=375)){
   await p.setViewportSize({width,height:1100});await h.settle(p);
   const state=await p.locator('table.content-record-grid').first().evaluate(t=>({layout:t.dataset.contentLayout,columns:getComputedStyle(t).gridTemplateColumns,width:t.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,buttons:[...t.querySelectorAll('.recording-actions button')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right};})}));
   check(!state.overflow&&state.buttons.every(b=>b.x>=-1&&b.right<=width+1),[name,mode,width,'boundary fits'].join('/'),state);
   if(lo>375)check(state.layout===(width<lo?'stacked':'inline'),[name,mode,width,'actual content transition'].join('/'),state);
  }
 }
 check(!p.errors.length,name+' runtime',p.errors);await p.close();console.log('BOUNDARIES',name);
}await browser.close();fs.writeFileSync(process.env.BOUNDARY_REPORT||'/tmp/content-layout-boundaries.json',JSON.stringify({checks,failures,boundaries,native},null,2));console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,6)},null,2));if(failures.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1);});
