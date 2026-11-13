// Practice 2.2 and 2.3 use the same proven DOM geometry contract as Practice 2.1.
// Reuse its real-page/mocked-audio harness and geometry assertions, not synthetic CSS.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');

const source = fs.readFileSync(path.join(__dirname, 'practice21-inline-wrap-geometry.cjs'), 'utf8');
const prelude = source.split('(async () => {')[0];
assert.ok(prelude.includes('function validate(data, width, kind)'), 'Practice 2.1 geometry contract available');
const helpers = new Function('require', '__dirname', prelude +
    ';return {open,settle,showMismatch,geometry,validate,samples,checks:()=>checks};')(require,__dirname);
const {open, settle, showMismatch, geometry, validate, samples} = helpers;
const root = path.resolve(__dirname, '..');
const output = process.env.WRAP_OUTPUT_NEXT || '/tmp/practice2-next-inline-wrap';
const widths = [280,320,375,430,600,850,1440];
const report = [];

(async () => {
    fs.mkdirSync(output, {recursive:true});
    const browser = await chromium.launch({
        executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args:['--no-sandbox']
    });
    try {
        for (const name of ['2.2','2.3']) {
            const page = await open(browser,root,`practice${name}`);
            for (const width of widths) {
                await page.setViewportSize({width,height:1100});
                for (const [kind, raw] of Object.entries(samples)) {
                    await showMismatch(page,raw);
                    const data = await geometry(page);
                    validate(data,width,kind);
                    report.push({page:name,width,kind,data});
                    console.log('NEXT_GEOMETRY',JSON.stringify({page:name,width,kind,
                        fallback:data.fallback,availableWidth:data.availableWidth,
                        minimumWidth:data.minimumWidth,stop:data.stop,fire:data.fire,
                        first:data.first,result:data.result,label:data.label,lines:data.lines}));
                    if ([375,600,1440].includes(width) && kind === 'long') {
                        await page.screenshot({path:path.join(output,`practice${name}-${width}.png`),fullPage:true});
                    }
                }
            }
            // Preserve the question indicator after Stop, including the right edge.
            await page.setViewportSize({width:375,height:1100});
            await showMismatch(page,samples.long,'question');
            const question = await geometry(page);
            validate(question,375,'question');
            assert.ok(question.question,`Practice ${name}: question indicator fixture`);
            report.push({page:name,width:375,kind:'question',data:question});

            // A second render and a narrow-to-wide resize must clear stale classes.
            await page.setViewportSize({width:280,height:1100});
            await showMismatch(page,samples.long);
            await page.setViewportSize({width:1440,height:1100});
            await settle(page);
            validate(await geometry(page),1440,'long');
            assert.deepEqual(page.errors,[],`Practice ${name}: no browser runtime errors`);
            await page.close();
        }
        fs.writeFileSync(path.join(output,'measurements.json'),JSON.stringify({
            assertions:helpers.checks(),cases:report.length,report
        },null,2));
        console.log(`PASS Practice 2.2/2.3 inline wrap geometry: ${helpers.checks()} assertions / ${report.length} cases`);
    } finally {
        await browser.close();
    }
})().catch(error => {console.error(error);process.exitCode=1;});
