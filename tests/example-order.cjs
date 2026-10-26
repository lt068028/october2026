// Practice 7 Examples: content-sized cues and aligned Question/Yes/No audio.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),key='october2026.practice12.displaySize';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let checks=0;
 const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};
 async function open(context,name='practice1.2'){
  const page=await context.newPage();page.setDefaultTimeout(10000);page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
  await page.route('http://drill.test/**',r=>{
   const file=path.join(root,new URL(r.request().url()).pathname);
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html'});
  });
  await page.goto('http://drill.test/'+name+'.html');return page;
 }

 const context=await browser.newContext();
 for(const name of ['practice7.1','practice7.2','practice7.3']) {
  const p=await open(context,name);
  for(const width of [1440,1100,900,600]) for(const theme of ['light','dark']) {
   await p.setViewportSize({width,height:900});await p.emulateMedia({colorScheme:theme});
   for(const style of ['formal','informal','casual']) for(const hint of ['off','hover','paren']) for(const script of ['hiragana','kanji']) {
    await p.evaluate(([style,hint,script])=>{
     document.querySelector(`#speechStyleControl [data-value="${style}"]`).click();
     document.querySelector(`#hintModeControl [data-value="${hint}"]`).click();
     document.querySelector(`#scriptModeControl [data-value="${script}"]`).click();
    },[style,hint,script]);
    check(await p.locator('.practice7-category').evaluateAll(es=>{
     if(!es.length)return false;
     return es.every(e=>{
      const group=e.closest('.example-box')||e.closest('#drill1List, #drill1Container');
      const badges=[...group.querySelectorAll('.practice7-category')].filter(b=>b.closest('.example-box')===e.closest('.example-box'));
      const widths=badges.map(b=>b.getBoundingClientRect().width);
      const natural=badges.map(b=>{
       const clone=b.cloneNode(true);clone.classList.remove('practice7-category');clone.textContent=b.textContent;
       b.after(clone);const w=clone.getBoundingClientRect().width;clone.remove();return w;
      });
      const max=Math.max(...natural);
      const label=e.querySelector('.practice7-category-label');
      const measure=text=>{const probe=document.createElement('span');probe.style.display='inline-block';probe.style.flexShrink='0';probe.textContent=text;e.append(probe);const w=probe.getBoundingClientRect().width;probe.remove();return w;};
      const gap=parseFloat(label.style.columnGap);
      const textWidth=measure(label.textContent);
      const chars=[...new Intl.Segmenter('en',{granularity:'grapheme'}).segment(label.textContent)].map(s=>s.segment);
      const characterWidth=chars.reduce((sum,c)=>sum+measure(c),0);
      const own=natural[badges.indexOf(e)];
      const expected=max-own<0.01?0:Math.min(3.5,Math.max(0,(max-own+textWidth-characterWidth)/Math.max(1,chars.length-1)));
      return widths.every(w=>Math.abs(w-max)<1)&&gap>=0&&gap<=3.5&&Math.abs(gap-expected)<0.02;

     });
    }),true,`${name} shared category background equals natural longest width`);
    check(await p.locator('.example-box').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth+2)),false,`${name} overflow ${width}/${theme}/${style}/${hint}/${script}`);
    check(await p.locator('.example-box:has(.example-response-row)').evaluateAll(es=>es.every(e=>{
     const r=[...e.querySelectorAll('button')].map(b=>b.getBoundingClientRect());
     return r.length===3&&Math.max(...r.map(r=>r.x))-Math.min(...r.map(r=>r.x))<2&&r[0].y<r[1].y&&r[1].y<r[2].y;
    })),true,`${name} question/Yes/No audio starts in one column`);
    check(await p.locator('.example-box tr').evaluateAll(rows=>rows.every(row=>{
     const cells=[...row.children];
     const heading=row.closest('.example-box').querySelector('.example-category-heading');
     if(heading) {if(row.querySelector('.tense-badge,.p71-tense,.p73-tense'))return false;}
     else if(!cells[0].querySelector('.tense-badge,.p71-tense,.p73-tense'))return false;
     if(row.classList.contains('example-response-row'))return cells.length===5&&cells[3].querySelector('button')&&cells[4].textContent.trim();
     return cells.length===5&&cells[2].textContent.includes('👉')&&cells[3].querySelector('button')&&cells[4].textContent.trim()&&!cells.slice(1).some(c=>c.querySelector('.tense-badge,.p71-tense,.p73-tense'));
    })),true,`${name} category/cue/arrow/listen/text order`);
   }
  }
  await p.setViewportSize({width:1440,height:900});
  await p.evaluate(()=>document.querySelector('#hintModeControl [data-value="off"]').click());
  check(await p.locator('.example-box table').evaluateAll(tables=>tables.every(t=>{
   const rows=[...t.querySelectorAll('tr')].filter(r=>r.children.length===5&&!r.classList.contains('example-response-row'));
   const right=Math.max(...rows.map(row=>{const range=document.createRange();range.selectNodeContents(row.children[1]);return range.getBoundingClientRect().right}));
   const arrow=rows[0].children[2].getBoundingClientRect();
   return arrow.left-right>=-2&&arrow.left-right<16;
  })),true,name+' intrinsic cue track leaves only the column gap');
  check(p.errors,[],name+' runtime errors');await p.close();
 }
 await browser.close();console.log('PASS Practice 7 Example order',checks);
})().catch(e=>{console.error(e);process.exit(1)});
