// Isolated static candidate page. No grading/audio mocks or production changes.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.FEEDBACK_PREVIEW_OUTPUT||'/tmp/p21-feedback-preview';
fs.mkdirSync(out,{recursive:true});let count=0;const check=(v,label)=>{assert.ok(v,label);count++};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const width of [375,600,1440])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:1000},colorScheme:theme});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.recordingCalls=0;window.MediaRecorder=function(){window.recordingCalls++;throw Error('Static preview must not record')};});
  await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='feedback.test')return route.abort();const f=path.join(root,u.pathname);return route.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'',contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html'});});
  await page.goto('http://feedback.test/preview/practice21-feedback-icons.html');
  const font='/workspace/work/pr8-fonts/Lato-Regular.ttf';if(fs.existsSync(font))await page.addStyleTag({content:`@font-face{font-family:Lato;src:url(data:font/ttf;base64,${fs.readFileSync(font).toString('base64')})}`});
  await page.evaluate(()=>document.fonts.ready);
  check(errors.length===0,`${width}/${theme} JS errors: ${errors}`);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${theme} page fits`);
  check(await page.locator('.demo-row').count()===18,'18 static samples');
  const measurements=await page.locator('.demo-row').evaluateAll(rows=>rows.map(row=>{const msg=row.querySelector('.message'),svg=msg.querySelector('svg'),t=row.querySelector('.transcript'),info=row.querySelector('.information');const s=getComputedStyle(msg),a=svg.getBoundingClientRect(),b=t.getBoundingClientRect(),m=msg.getBoundingClientRect();return {state:msg.className,color:s.color,size:a.width,height:a.height,gap:s.gap,noOverlap:m.right<=b.left+.5||b.top>=m.bottom-.5,fit:Math.max(m.right,b.right)<=innerWidth+.5,justify:getComputedStyle(info).justifyContent,bg:s.backgroundColor,border:s.borderWidth};}));
  for(let i=0;i<measurements.length;i++){const m=measurements[i],size=[18,20,22][Math.floor(i/6)];check(m.size===size&&m.height===size,'candidate dimensions');check(m.gap==='4px'&&m.justify==='flex-end','right alignment and 4px gap');check(m.noOverlap&&m.fit,'no overlap or clipping');const expected=m.state.includes('correct')?(theme==='light'?'rgb(22, 163, 74)':'rgb(74, 222, 128)'):m.state.includes('pending')?(theme==='light'?'rgb(128, 100, 176)':'rgb(185, 162, 229)'):(theme==='light'?'rgb(180, 119, 50)':'rgb(228, 173, 105)');check(m.color===expected,'candidate color');check(m.bg==='rgba(0, 0, 0, 0)'&&m.border==='0px','no background/border');}
  const pending=page.locator('.pending').first(),tip=pending.locator('[role=tooltip]');await pending.hover();check(await tip.isVisible(),'hover tooltip');await page.mouse.move(0,0);await pending.focus();check(await tip.isVisible(),'focus tooltip');check(await tip.textContent()==='Could not be evaluated reliably.','tooltip text');await page.keyboard.press('Tab');check(await page.locator('.pending').nth(1).evaluate(n=>n===document.activeElement),'Tab reaches next description');check(await page.locator('.pending').nth(1).locator('[role=tooltip]').isVisible(),'keyboard tooltip');
  check(await page.evaluate(()=>localStorage.length===0&&sessionStorage.length===0&&recordingCalls===0),'no persisted decisions or audio');
  await page.locator('[data-theme=dark]').click();check(await page.locator('.pending').first().evaluate(n=>getComputedStyle(n).color)==='rgb(185, 162, 229)','manual dark');await page.locator('[data-theme=light]').click();check(await page.locator('.pending').first().evaluate(n=>getComputedStyle(n).color)==='rgb(128, 100, 176)','manual light');await page.locator('[data-theme=auto]').click();await page.mouse.move(0,0);
  await page.screenshot({path:path.join(out,`${width}-${theme}.png`),fullPage:true});fs.writeFileSync(path.join(out,`${width}-${theme}.json`),JSON.stringify(measurements,null,2));await page.close();
 }
 console.log(`PASS ${count}; FAIL 0; screenshots/measurements: ${out}`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
