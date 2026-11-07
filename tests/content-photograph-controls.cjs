// Content-based whole-zone audio control columns, including the former 450px break.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const code=fs.readFileSync(path.join(__dirname,'content-layout.cjs'),'utf8');
const h=new Function('require','__dirname','process',code.slice(0,code.indexOf('\n(async()=>{const browser'))+';return {open,settings,settle};')(require,__dirname,process);
const root=path.resolve(__dirname,'..'),failures=[],observations=[];let checks=0;function check(ok,label,details){checks++;if(!ok)failures.push({label,details});}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});for(const name of ['practice2.1','practice2.2','practice2.3']){
 const p=await h.open(browser,name,root);
 for(const width of [375,422,423,424,449,450,451,600,760,850,900,1024,1280])for(const mode of ['kanji','hiragana'])for(const hint of ['hover','paren']){
  await p.setViewportSize({width,height:1100});await h.settings(p,mode,hint,mode==='kanji'?'formal':'casual');
  const data=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,grids:[...document.querySelectorAll('.content-photograph-controls')].filter(g=>g.getClientRects().length).map(g=>{
   const r=g.getBoundingClientRect(),style=getComputedStyle(g),units=[...g.children].filter(e=>e.getClientRects().length);
   return {width:g.clientWidth,gap:parseFloat(style.columnGap),columns:getComputedStyle(g).gridTemplateColumns.split(/\s+/).length,rect:{x:r.x,right:r.right},units:units.map(u=>({text:u.textContent,buttons:[...u.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return{x:r.x,right:r.right,y:r.y,w:r.width};})}))};
  })}));const key=[name,width,mode,hint].join('/');observations.push({key,...data});check(!data.overflow,key+' page width');
  for(const g of data.grids){const natural=Math.max(...g.units.flatMap(u=>u.buttons.map(b=>b.w)));const expected=Math.max(1,Math.min(g.units.length,Math.floor((g.width+g.gap)/(natural+g.gap))));check(g.columns===expected,key+' whole control groups use available width',g);check(g.units.every(u=>u.buttons.every(b=>b.x>=g.rect.x-1&&b.right<=g.rect.right+1)),key+' controls accessible',g);}
 }
 check(!p.errors.length,name+' runtime',p.errors);await p.close();console.log('PHOTO CONTROLS',name);
}await browser.close();fs.writeFileSync(process.env.PHOTO_CONTROL_REPORT||'/tmp/content-photograph-controls.json',JSON.stringify({checks,failures,observations},null,2));console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,5)},null,2));if(failures.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1);});
