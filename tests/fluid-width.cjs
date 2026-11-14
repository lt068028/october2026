// Practice 7.3 fixed 130% preview and Practice 1.2 grammar emphasis.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),key='october2026.practice12.displaySize';
(async()=>{
 const executablePath=process.env.CHROMIUM_PATH||'/usr/bin/chromium';
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};
 async function open(context,name='practice1.2'){
  const page=await context.newPage();page.setDefaultTimeout(10000);page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  if(name==='practice1.1'){
   const resources=[];
   const fontResource=request=>{
    const host=new URL(request.url()).hostname;
    return request.resourceType()==='font'||host==='fonts.googleapis.com'||host==='fonts.gstatic.com';
   };
   page.fontResources=resources;
   page.on('request',request=>{
    if(fontResource(request))resources.push({url:request.url(),type:request.resourceType(),event:'requested'});
   });
   page.on('response',response=>{
    const request=response.request();
    if(fontResource(request))resources.push({url:request.url(),type:request.resourceType(),event:'response',status:response.status()});
   });
   page.on('requestfailed',request=>{
    if(fontResource(request))resources.push({url:request.url(),type:request.resourceType(),event:'failed',error:request.failure()?.errorText??null});
   });
  }
  await page.route('http://drill.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html'});
  });
  await page.goto('http://drill.test/'+name+'.html');return page;
 }


 const context=await browser.newContext();
 const names=['index','practice1.1','practice1.2','practice2.1','practice2.2','practice2.3','practice7.1','practice7.2','practice7.3','composition1','pronunciation1','pronunciation2'];
 for(const name of names) {
  const p=await open(context,name);await p.addStyleTag({content:'.custom-tip-box,.tooltip-tip{display:none!important}'});
  for(const theme of ['light','dark']) for(const hint of name==='index'?['off']:['off','hover','paren']) {
   await p.emulateMedia({colorScheme:theme});await p.setViewportSize({width:1440,height:900});
   await p.evaluate(hint=>document.querySelector(`#hintModeControl [data-value="${hint}"]`)?.click(),hint);
   const positions=(capture=false)=>p.evaluate(({capture,viewport})=>{
    const bodyRect=document.body.getBoundingClientRect();
    const actions=[...document.querySelectorAll('.recording-actions')];
    const buttons=[],rects=[],buttonCounts=[];
    for(const action of actions){
     const all=[...action.querySelectorAll('button')];
     buttonCounts.push(all.length);
     const row=all.slice(0,3);
     buttons.push(row);
     rects.push(row.map(button=>button.getBoundingClientRect()));
    }
    const x=rects.map(row=>row.map(rect=>Math.round((rect.x-bodyRect.x)*100)/100));
    if(!capture)return {x,buttonCounts};

    try{
     const identity=window.__fluidWidthIdentity??={elements:new WeakMap(),next:1};
     const size=({x,y,width,height})=>({x,y,width,height});
     const properties=['display','position','transform','translate','margin','padding','width','min-width','max-width',
      'justify-content','align-items','flex','flex-direction','flex-wrap','gap','grid-template-columns','font-family','font-size','line-height'];
     const element=(node,rect)=>{
      if(!node)return null;
      if(!identity.elements.has(node))identity.elements.set(node,identity.next++);
      const style=getComputedStyle(node);
      return {
       elementId:identity.elements.get(node),tag:node.localName,id:node.id||null,class:node.getAttribute('class'),
       data:Object.fromEntries(Object.entries(node.dataset??{})),
       rect:size(rect??node.getBoundingClientRect()),
       style:Object.fromEntries(properties.map(key=>[key,style.getPropertyValue(key)]))
      };
     };
     return {x,buttonCounts,diagnostics:{
      viewport,innerWidth,innerHeight,devicePixelRatio,
      body:size(bodyRect),rowCount:actions.length,
      rows:actions.map((action,row)=>{
       const ancestors=[];
       for(let node=action.parentElement;node;node=node.parentElement){
        ancestors.push(element(node,node===document.body?bodyRect:undefined));
        if(node===document.body)break;
       }
       return {
        row:row+1,buttonCount:buttonCounts[row],
        actions:element(action),
        controls:ancestors.find(node=>node.class?.split(/\s+/).includes('recording-controls'))??null,
        ancestors,
        buttons:buttons[row].map((button,index)=>({
         index:index+1,text:button.textContent.trim(),
         ...element(button,rects[row][index]),relativeX:x[row][index]
        }))
       };
      }),
      fonts:{
       status:document.fonts?.status??null,
       lato16:document.fonts?.check('16px Lato')??null,
       faces:document.fonts?[...document.fonts].map(({family,weight,status})=>({family,weight,status})):null
      },
      userAgent:navigator.userAgent??null
     }};
    }catch(error){
     return {x,buttonCounts,diagnostics:{error:String(error)}};
    }
   },{capture,viewport:capture?p.viewportSize():null});
   await p.evaluate(()=>{const result=document.querySelector('.recording-controls .result-text');if(result)result.textContent='認識された長い文の表示を確認します。キューと音声操作の位置を保ったまま、停止ボタンより後の領域で表示します。';});
   const captureFailure=name==='practice1.1';
   const {x:baseline,buttonCounts:baselineCounts,diagnostics:before}=await positions(captureFailure);
   const fontResourcesBefore=captureFailure?p.fontResources.slice():null;
   const baselineResultSpace=await p.locator('.recording-controls').first().count()?await p.locator('.recording-controls').first().evaluate(e=>e.getBoundingClientRect().width):null;
   for(const width of [1440,1442,1600,1920,2080,2560]) {
    await p.setViewportSize({width,height:900});
    const box=await p.locator('body').boundingBox();
    check(Math.abs(box.width-Math.min(width-64,Math.max(1280,Math.min(1600,width*.5+560))))<1,true,name+' smooth width '+width);
    check(box.x>=32,true,name+' minimum side gutters '+width);
    if(baselineResultSpace!==null)check(Math.abs((await p.locator('.recording-controls').first().evaluate(e=>e.getBoundingClientRect().width)-baselineResultSpace)-(box.width-1280))<2,true,name+' growth allocated to result side '+width);
    const capture=captureFailure&&width===1440;
    const {x:now,buttonCounts:nowCounts,diagnostics:after}=await positions(capture);
    if(!name.startsWith('practice2.')){
     const label=name+' extra width stays after controls '+width+'/'+hint;
     const matches=now.length===baseline.length&&now.every((a,i)=>
      nowCounts[i]===baselineCounts[i]&&a.length===baseline[i].length&&a.every((x,j)=>Math.abs(x-baseline[i][j])<2));
     if(capture&&!matches){
      try{
       const sameElement=(a,b)=>a&&b?a.elementId===b.elementId:null;
       const deltas=Array.from({length:Math.max(baseline.length,now.length)},(_,i)=>{
        const previous=baseline[i]??[],current=now[i]??[];
        const oldRow=before?.rows?.[i],newRow=after?.rows?.[i];
        return {
         row:i+1,sameActions:sameElement(oldRow?.actions,newRow?.actions),
         sameControls:sameElement(oldRow?.controls,newRow?.controls),
         buttons:Array.from({length:Math.max(previous.length,current.length)},(_,j)=>{
          const baselineX=previous[j]??null,measuredX=current[j]??null;
          const oldButton=oldRow?.buttons[j],newButton=newRow?.buttons[j];
          return {
           index:j+1,baselineX,measuredX,deltaX:baselineX===null||measuredX===null?null:measuredX-baselineX,
           beforeId:oldButton?.elementId??null,afterId:newButton?.elementId??null,sameElement:sameElement(oldButton,newButton)
          };
         })
        };
       });
       console.error('FLUID_WIDTH_DIAGNOSTICS_BEGIN\n'+JSON.stringify({
        diagnostic:'fluid-width-control-position',name,hint,theme,width,label,tolerancePx:2,
        before,after,deltas,
        counts:{before:baselineCounts,after:nowCounts},
        fontResources:{before:fontResourcesBefore,after:p.fontResources.slice(),platformFonts:'unavailable'},
        environment:{
         node:process.version,playwright:require('playwright/package.json').version,
         chromium:browser.version(),executablePath,
         npmUserAgent:process.env.npm_config_user_agent??null
        }
       },null,2)+'\nFLUID_WIDTH_DIAGNOSTICS_END');
      }catch(error){
       console.error('FLUID_WIDTH_DIAGNOSTICS_ERROR',String(error));
      }
     }
     check(matches,true,label);
    }
    check(await p.locator('.example-box,.drill-row,.settings-row,.pitch-card').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,name+' wide overflow '+width+'/'+hint);
   }
  }
  check(p.errors,[],name+' runtime errors');await p.close();console.log('WIDE',name);
 }
 await browser.close();console.log('PASS fluid page width',checks);
})().catch(e=>{console.error(e);process.exit(1)});
