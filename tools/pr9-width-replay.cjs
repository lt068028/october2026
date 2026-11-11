const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const [, , mainRoot, filledRoot] = process.argv;
const out = process.env.DIAG_OUTPUT || path.resolve('diagnostic-artifacts');
if (!mainRoot || !filledRoot) throw new Error('Expected main and filled source roots');

function runCommonTest(name, testSource, targetRoot, extraEnv = {}) {
    const dir = path.join(out, 'common-test-replays', name);
    fs.mkdirSync(dir, {recursive: true});
    const destination = path.join(targetRoot, 'tests', `pr9-${name}.cjs`);
    fs.writeFileSync(destination, testSource);
    const result = spawnSync(process.execPath, [destination], {
        cwd: targetRoot,
        encoding: 'utf8',
        env: {...process.env, QA_OUTPUT: dir, QA_PAGES: 'practice8.2', ...extraEnv}
    });
    fs.writeFileSync(path.join(dir, 'stdout.log'), result.stdout || '');
    fs.writeFileSync(path.join(dir, 'stderr.log'), result.stderr || '');
    fs.writeFileSync(path.join(dir, 'exit.txt'), String(result.status ?? 'null'));
    return {name, exit: result.status, signal: result.signal, error: result.error?.message || null, stdout: result.stdout || '', stderr: result.stderr || ''};
}

function instrumentQa(source) {
    source = source.replace(
        'overflow:document.documentElement.scrollWidth>innerWidth+10,',
        `overflow:document.documentElement.scrollWidth>innerWidth+10,widthMetrics:(()=>{const iw=innerWidth,props=['display','position','boxSizing','width','minWidth','maxWidth','whiteSpace','overflow','overflowX','flex','flexBasis','flexShrink','flexWrap','gridTemplateColumns','gridAutoColumns','margin','padding','transform'];const nodes=[...document.querySelectorAll('body *')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,id:e.id,className:typeof e.className==='string'?e.className:'',text:(e.innerText||e.textContent||'').trim().slice(0,80),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right},scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,style:Object.fromEntries(props.map(p=>[p,s[p]]))}}).filter(e=>e.rect.width>0&&e.rect.height>0&&(e.rect.right>iw+.5||e.scrollWidth>e.clientWidth+2)).sort((a,b)=>b.rect.right-a.rect.right).slice(0,20);return{innerWidth:iw,documentScrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,horizontalExcessPx:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-iw,candidates:nodes}})(),`
    );
    source = source.replace("check(!a.overflow,key+' page fits');", "check(!a.overflow,key+' page fits',a.widthMetrics);");
    return source;
}

function instrumentFluid(source) {
    source = source.replace(
        'const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++};',
        'const failures=[];const check=(actual,expected,label)=>{checks++;try{assert.deepEqual(actual,expected,label)}catch(error){failures.push({label,actual,expected,message:error.message})}};'
    );
    source = source.replace(
        "if(!name.startsWith('practice2.'))check(now.every((a,i)=>a.every((x,j)=>Math.abs(x-baseline[i][j])<2)),true,name+' extra width stays after controls '+width+'/'+hint);",
        "if(!name.startsWith('practice2.')){const stable=now.every((a,i)=>a.every((x,j)=>Math.abs(x-baseline[i][j])<2));const label=name+' extra width stays after controls '+width+'/'+hint;check(stable,true,label);if(!stable)console.log('POSITION_DIAG '+JSON.stringify({name,width,hint,baseline,now}));}"
    );
    source = source.replace(
        "await browser.close();console.log('PASS fluid page width',checks);",
        "await browser.close();console.log(JSON.stringify({checks,failures},null,2));if(failures.length)process.exitCode=1;"
    );
    return source;
}

function read(file) { return fs.readFileSync(file, 'utf8'); }
const commonTests = {
    qa: instrumentQa(read(path.join(filledRoot, 'tests', 'qa-icons.cjs'))),
    fluid: instrumentFluid(read(path.join(filledRoot, 'tests', 'fluid-width.cjs')))
};
const reports = [];
for (const [variant, root] of [['main', mainRoot], ['filled', filledRoot]]) {
    const qa = runCommonTest(`${variant}-common-qa`, commonTests.qa, root);
    const fluid = runCommonTest(`${variant}-common-fluid`, commonTests.fluid, root);
    const qaReport = (()=>{try{return JSON.parse(read(path.join(out,'common-test-replays',qa.name,'report.json')))}catch{return null}})();
    reports.push({variant, qaExit:qa.exit, qaSaved375Failures:qaReport?.failures?.filter(f=>f.label==='practice8.2/saved-state/375 page fits')||[],
        fluidExit:fluid.exit, fluidPositionLines:fluid.stdout.split('\n').filter(line=>line.startsWith('POSITION_DIAG')).map(line=>JSON.parse(line.slice('POSITION_DIAG'.length).trim())),
        fluidFailureLabels:(()=>{const m=fluid.stdout.match(/\{[\s\S]*\}\s*$/);if(!m)return[];try{return JSON.parse(m[0]).failures.map(f=>f.label)}catch{return[]}})()});
}
fs.writeFileSync(path.join(out,'same-test-replay-summary.json'), JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports,null,2));
