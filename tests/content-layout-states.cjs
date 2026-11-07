// Supplementary layout-only state transitions; audio APIs are mocked by the shared harness.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const code=fs.readFileSync(path.join(__dirname,'content-layout.cjs'),'utf8');
const harness=new Function('require','__dirname','process',code.slice(0,code.indexOf('\n(async()=>{const browser'))+';return {open,settings,settle,inspect};')(require,__dirname,process);
const names=(process.env.PRACTICE_PAGES||'practice1.1 practice1.2 practice2.1 practice2.2 practice2.3 practice7.1 practice7.2 practice7.3 practice8.1 practice8.2 practice8.3').split(/[ ,]+/),root=path.resolve(__dirname,'..');
let checks=0;const failures=[],observations=[];function check(ok,label,details){checks++;if(!ok)failures.push({label,details});}
async function audit(p,key){
 await harness.settle(p);const a=await harness.inspect(p);check(!a.overflow,key+' root fits');
 for(const t of a.tables){check(t.layout===(t.needed<=t.width+.25?'inline':'stacked'),key+' content decision',t);for(const row of t.rows)check(row.buttons.every(b=>b.x>=-1&&b.right<=a.width+1),key+' controls accessible',row);}
 for(const row of a.inlineRows)check(row.buttons.every(b=>b.x>=-1&&b.right<=a.width+1),key+' inline controls accessible',row);
 const examples=await p.evaluate(()=>[...document.querySelectorAll('.example-box button')].filter(b=>b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect(),c=b.closest('.example-box').getBoundingClientRect();return {text:b.textContent,x:r.x,right:r.right,container:{x:c.x,right:c.right}};}));
 check(examples.every(b=>b.x>=b.container.x-1&&b.right<=b.container.right+1),key+' Example playback fits',examples);
 observations.push({key,width:a.width,tables:a.tables.length,rows:a.tables.reduce((n,t)=>n+t.rows.length,0),examples:examples.length});
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});for(const name of names){
 const p=await harness.open(browser,name,root);
 for(const [width,mode,style]of [[375,'hiragana','informal'],[850,'kanji','casual']]){
  await p.setViewportSize({width,height:1100});await harness.settings(p,mode,'paren',style);
  const groups=await p.locator('.p21-set-switcher').count();
  for(let group=0;group<groups;group++){const buttons=await p.locator('.p21-set-switcher').nth(group).locator('button').count();for(let item=0;item<buttons;item++){
   const button=p.locator('.p21-set-switcher').nth(group).locator('button').nth(item);if(await button.isEnabled())await button.click();await audit(p,[name,width,mode,style,'set',group,item].join('/'));
  }}
  const toggles=await p.locator('.drill-cue-button').count();
  for(let i=0;i<toggles;i++){const button=p.locator('.drill-cue-button').nth(i);if(await button.isEnabled())await button.click();await audit(p,[name,width,mode,style,'cue-toggle',i].join('/'));}
  // Choose longest currently available textual options. Re-query after each redraw.
  await p.evaluate(()=>{const total=document.querySelectorAll('.recording-table select').length;for(let i=0;i<total;i++){const s=document.querySelectorAll('.recording-table select')[i];if(!s||s.disabled)continue;const options=[...s.options].filter(o=>!o.disabled&&o.value);options.sort((a,b)=>b.textContent.length-a.textContent.length);if(options[0]){s.value=options[0].value;s.dispatchEvent(new Event('change',{bubbles:true}));}}});
  await audit(p,[name,width,mode,style,'long-options'].join('/'));
  for(const scale of ['1','1.4','1.3']){await p.evaluate(scale=>document.body.style.setProperty('--practice12-scale',scale),scale);await audit(p,[name,width,mode,style,'CSS-scale',scale].join('/'));}
 }
 // No recurring child mutation should be needed once a layout has settled.
 const mutations=await p.evaluate(()=>new Promise(resolve=>{let n=0;const o=new MutationObserver(rs=>n+=rs.length);o.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});setTimeout(()=>{o.disconnect();resolve(n);},300);}));check(mutations===0,name+' idle DOM stable',mutations);
 check(!p.errors.length,name+' runtime',p.errors);await p.close();console.log('STATES',name);
 fs.writeFileSync(process.env.STATE_REPORT||'/tmp/content-layout-states.json',JSON.stringify({checks,failures,observations},null,2));
}await browser.close();console.log(JSON.stringify({checks,failures:failures.length,first:failures.slice(0,6)},null,2));if(failures.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1);});
