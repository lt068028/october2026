// Content-width layout: presentation only; never changes models, controls or stored data.
(() => {
    let queued = false;
    let exampleChanged = false;
    let fontRevision = 0;
    const callouts = new WeakMap();
    const widths = new WeakMap();
    const fonts = new WeakMap();
    let minimums = new WeakMap();
    const observed = new Set();
    const measureHost = document.createElement('div');
    Object.assign(measureHost.style, {position: 'fixed', visibility: 'hidden', pointerEvents: 'none', width: 'max-content', contain: 'layout style'});
    const measureRoot = measureHost.attachShadow({mode: 'closed'});
    let measures = new WeakMap();
    const properties = ['display','box-sizing','font-family','font-size','font-weight','font-style','font-variant','line-height','letter-spacing','word-spacing','text-transform','white-space','word-break','overflow-wrap','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-style','border-right-style','border-bottom-style','border-left-style','margin-top','margin-right','margin-bottom','margin-left','gap','column-gap','row-gap','align-items','justify-content','flex-direction','flex-wrap','flex-shrink','flex-grow','flex-basis','vertical-align','grid-auto-flow','grid-column','grid-row'];
    function intrinsic(element, presentation) {
        if (!measureHost.isConnected) document.body.append(measureHost);
        const style = getComputedStyle(element);
        const key = (presentation === 'category-inline' ? 'category-inline|' : '') + element.innerHTML + style.font + style.letterSpacing + style.padding + style.borderWidth + [...element.querySelectorAll('select,input')].map(e => e.value + getComputedStyle(e).width).join('|');
        if (measures.get(element)?.key === key) return measures.get(element).width;
        const copy = element.cloneNode(true);
        const originals = [element, ...element.querySelectorAll('*')];
        const copies = [copy, ...copy.querySelectorAll('*')];
        originals.forEach((original, index) => {
            const target = copies[index], computed = getComputedStyle(original);
            properties.forEach(property => target.style.setProperty(property, computed.getPropertyValue(property)));
            target.style.minWidth = original.matches('button,select,input') ? computed.minWidth : '0'; target.style.maxWidth = 'none';
            target.style.width = (original.style.width || original.matches('select,input,.p81-kind,.p81-repeat-spacer,.p81-drill-repeat-spacer,.p81-repeat-separator-spacer,.practice7-category,.conversation-role-circle')) ? computed.width : 'auto';
            if (computed.display.includes('grid')) target.style.gridTemplateColumns = computed.gridTemplateColumns.split(/\s+/).map(() => 'max-content').join(' ');
            if (original.matches('select,input')) target.value = original.value;
        });
        copy.querySelectorAll('.tooltip-tip,.custom-tip-box').forEach(t => t.remove());
        Object.assign(copy.style, {position: 'static', width: 'max-content', minWidth: '0', maxWidth: 'none', whiteSpace: 'nowrap', display: style.display.includes('flex') ? 'inline-flex' : style.display.includes('grid') ? 'inline-grid' : 'inline-block', flexWrap: 'nowrap'});
        if (presentation === 'category-inline') copy.style.flexDirection = 'column';
        measureRoot.append(copy);
        const width = copy.getBoundingClientRect().width;
        copy.remove();
        measures.set(element, {key, width});
        return width;
    }
    function recordings() {
        const infos = [];
        const groups = new Map();
        document.querySelectorAll('table.recording-table').forEach(table => {
            if (!observed.has(table)) { resize.observe(table); observed.add(table); }
            if (!table.getClientRects().length || getComputedStyle(table).display === 'none') { widths.set(table, 0); return; }
            const cues = [...table.querySelectorAll('td.prompt-label,td.drill-cue-cell')];
            const controls = [...table.querySelectorAll('.recording-controls')].map(e => e.closest('td')).filter(e => e?.querySelector('.recording-actions'));
            if (!cues.length || !controls.length) return;
            const numbers = [...table.querySelectorAll('td.drill-number-cell,td.p73-number')];
            const number = Math.max(0, ...numbers.map(intrinsic));
            const cue = Math.max(...cues.map(intrinsic));
            const actions = Math.max(...controls.map(cell => {
                const s = getComputedStyle(cell);
                return intrinsic(cell.querySelector('.recording-actions')) + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
            }));
            const group = table.closest('.practice-qa-section,.p81-section,[id^="drill"][id$="Container"],.practice-section') || table.parentElement;
            const info = {table, cues, controls, numbers, number, cue, actions};
            infos.push(info);
            if (!groups.has(group)) groups.set(group, []);
            groups.get(group).push(info);
            info.group = groups.get(group);
        });
        for (const {table, cues, controls, numbers, cue, actions, group} of infos) {
            const number = Math.max(...group.map(i => i.number));
            const available = table.clientWidth;
            const gap = 4; // Existing shared recording column gutter.
            const room = available - number - actions - (number > 0 ? 2 : 1) * gap;
            const inline = cue <= room + .25;
            // Share the longest fitting cue; a longer stacked question must not
            // force otherwise fitting questions to stack as well.
            const track = inline ? Math.max(cue, ...group.filter(i => i.cue <= room + .25).map(i => i.cue)) : cue;
            table.classList.add('content-record-grid');
            table.dataset.contentLayout = inline ? 'inline' : 'stacked';
            table.dataset.contentNumber = number > 0 ? 'true' : 'false';
            table.style.setProperty('--content-number-width', number + 'px');
            table.style.setProperty('--content-cue-width', track + 'px');
            table.querySelectorAll('td[rowspan]').forEach(e => e.style.setProperty('--content-row-span', String(e.rowSpan)));
            numbers.forEach(e => e.dataset.contentCell = 'number');
            cues.forEach(e => e.dataset.contentCell = 'cue');
            controls.forEach(e => e.dataset.contentCell = 'controls');
            table.querySelectorAll('.meaning-change-row > td,.p7-shirt-note > td').forEach(e => e.dataset.contentCell = 'note');
            widths.set(table, available);
        }
    }
    function inlineActions() {
        document.querySelectorAll('.prompt-label .recording-actions:has(.p81-cue-button-group)').forEach(actions => {
            const group = actions.querySelector('.p81-cue-button-group');
            actions.style.setProperty('--content-action-width', intrinsic(group) + 'px');
        });
    }
    function modelMinimum(element) {
        const key=element.innerHTML+getComputedStyle(element).font;
        if(minimums.get(element)?.key===key)return minimums.get(element).width;
        const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
        let width=0;
        const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
            const n=walker.currentNode;if(n.parentElement.closest('.tooltip-tip,.custom-tip-box'))continue;
            const style=getComputedStyle(n.parentElement);context.font=style.font;
            for(const part of n.textContent.split(/[\s、。？！?!／/]+/).filter(Boolean))
                width=Math.max(width,context.measureText(part).width+Math.max(0,part.length-1)*(parseFloat(style.letterSpacing)||0));
        }
        const prefix=element.querySelector(':scope > .p81-degree-cue-prefix'),tail=element.querySelector(':scope > .p81-degree-cue-tail');
        if(prefix&&tail)width=Math.max(width,Math.min(intrinsic(prefix),modelMinimum(prefix))+modelMinimum(tail));
        width=Math.min(intrinsic(element),width);
        minimums.set(element,{key,width});return width;
    }
    // Five-cell Examples and their shared Yes/No presentation. Original nodes
    // remain in place so playback closures and accessibility order are retained.
    function examples() {
        document.querySelectorAll('.example-box table.drill-example-table,.example-box table.p73-example-table').forEach(table => {
            if (!table.getClientRects().length) return;
            if (!observed.has(table)) { resize.observe(table); observed.add(table); }
            const rows=[];
            table.querySelectorAll('tbody > tr').forEach(tr => {
                const cells=[...tr.children];
                if(cells.length===5) {
                    const combined=cells[4].matches('.practice12-example-model');
                    if(combined) cells[4].dataset.contentFlatten='true';
                    rows.push({owner:tr,label:cells[0],cue:cells[1],arrow:cells[2],audio:combined?cells[4].querySelector('button'):cells[3],model:combined?cells[4].lastElementChild:cells[4]});
                    if(combined) cells[3].dataset.contentEmpty='true';
                } else if(cells.length===2 && cells[1].querySelector('.practice12-example-answer')) {
                    cells[1].dataset.contentFlatten='true';
                    cells[1].querySelectorAll('.practice12-example-answer').forEach((answer,index)=>{
                        answer.dataset.contentFlatten='true';
                        rows.push({owner:tr,label:index===0?cells[0]:null,audio:answer.querySelector('button'),model:answer.lastElementChild});
                    });
                }
            });
            const valid=rows.filter(r=>r.audio&&r.model);
            if(!valid.length)return;
            table.classList.add('content-example-grid');
            valid.forEach(r=>['label','cue','arrow','audio','model'].forEach(k=>{if(r[k])r[k].dataset.contentExampleCell='true';}));
            const width=table.clientWidth,gap=4;
            const label=Math.max(0,...valid.map(r=>r.label?intrinsic(r.label):0));
            const cue=Math.max(0,...valid.map(r=>r.cue?intrinsic(r.cue):0));
            const arrow=Math.max(0,...valid.map(r=>r.arrow?intrinsic(r.arrow):0));
            const audio=Math.max(...valid.map(r=>intrinsic(r.audio)));
            const cueMinimum=Math.max(0,...valid.map(r=>r.cue?modelMinimum(r.cue):0));
            const essential=label+cueMinimum+arrow+audio+gap*4;
            const compact=essential>width+.25;
            const cueRoom=Math.max(0,width-audio-arrow-gap*4-(compact?0:label));
            const cueTrack=Math.min(cue,cueRoom);
            const tracks=[compact?'0px':label+'px',cueTrack+'px',arrow+'px',audio+'px','minmax(0,1fr)'];
            table.classList.add('content-example-grid');
            table.style.setProperty('grid-template-columns',tracks.join(' '),'important');
            table.dataset.contentExample=compact?'label-above':'inline';
            let line=1,owner=null;
            function place(e,column,row,span=1){if(!e)return;e.dataset.contentExampleCell='true';e.style.setProperty('grid-column',column,'important');e.style.setProperty('grid-row',row+' / span '+span,'important');}
            for(const r of valid){
                if(owner!==r.owner){owner=r.owner;line=1;owner.dataset.contentExampleOwner='true';}
                if(compact&&r.label){place(r.label,'1 / -1',line++);}
                else place(r.label,'1',line);
                place(r.cue,'2',line);place(r.arrow,'3',line);place(r.audio,'4',line);
                const modelWidth=modelMinimum(r.model);
                const remaining=width-(compact?0:label)-cueTrack-arrow-audio-gap*4;
                const inline=modelWidth<=remaining+.25;
                const belowColumn=intrinsic(r.model)>width-(compact?0:label)-gap+.25?'1 / -1':'2 / -1';
                place(r.model,inline?'5':belowColumn,inline?line:line+1);
                r.model.dataset.contentModel=inline?'inline':'below';
                line+=inline?1:2;
            }
            widths.set(table,width);
        });
    }
    function adaptiveExample(root,entries) {
        const rows=entries.filter(e=>e.audio&&e.model);if(!rows.length)return;
        root.classList.add('content-adaptive-example');
        if(!observed.has(root)){resize.observe(root);observed.add(root);}
        rows.forEach(r=>['label','cue','arrow','audio','model'].forEach(k=>{if(r[k])r[k].dataset.contentAdaptiveCell=k;}));
        const style=getComputedStyle(root),width=root.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),gap=parseFloat(style.columnGap)||4;
        const maximum=(key,fn=intrinsic)=>Math.max(0,...rows.map(r=>r[key]?fn(r[key]):0));
        const labelWidth=maximum('label'),cueWidth=maximum('cue'),cueMin=maximum('cue',modelMinimum),arrowWidth=maximum('arrow'),audioWidth=maximum('audio');
        const categories=entries.filter(e=>e.category).map(e=>e.category),categoryWidth=Math.max(0,...categories.map(e=>intrinsic(e,'category-inline')));
        let hasLabel=labelWidth>0,hasArrow=arrowWidth>0,hasCategory=categoryWidth>0;
        const required=()=> (hasCategory?categoryWidth+gap:0)+(hasLabel?labelWidth+gap:0)+cueMin+(hasArrow?arrowWidth+gap:0)+audioWidth+gap;
        if(required()>width+.25)hasCategory=false;
        if(required()>width+.25)hasLabel=false;
        const cueAbove=required()>width+.25;
        const fixed=(hasCategory?categoryWidth+gap:0)+(hasLabel?labelWidth+gap:0)+(hasArrow?arrowWidth+gap:0)+audioWidth+gap;
        const cueTrack=cueAbove?0:Math.min(cueWidth,Math.max(0,width-fixed));
        const modelRoom=width-fixed-cueTrack-gap;
        const hasModelTrack=!cueAbove&&rows.some(r=>modelMinimum(r.model)<=modelRoom+.25);
        const tracks=[];let catCol,labelCol,arrowCol;
        if(hasCategory){catCol=tracks.length+1;tracks.push(categoryWidth+'px');}
        if(hasLabel){labelCol=tracks.length+1;tracks.push(labelWidth+'px');}
        const cueCol=tracks.length+1;tracks.push(cueTrack+'px');
        if(hasArrow){arrowCol=tracks.length+1;tracks.push(arrowWidth+'px');}
        const audioCol=tracks.length+1;tracks.push(hasModelTrack?audioWidth+'px':`minmax(${audioWidth}px,1fr)`);
        const modelCol=tracks.length+1;if(hasModelTrack)tracks.push('minmax(0,1fr)');
        const previousTracks=root.style.gridTemplateColumns;
        root.style.setProperty('grid-template-columns',tracks.join(' '),'important');
        if(previousTracks!==root.style.gridTemplateColumns)exampleChanged=true;
        categories.forEach(e=>e.dataset.contentCategory=hasCategory?'inline':'above');
        root.dataset.contentAdaptive=cueAbove?'cue-above':hasLabel?'inline':'label-above';
        function place(e,column,row,span=1){if(!e)return;const nextRow=row+' / span '+span;if(e.style.gridColumn!==column||e.style.gridRow!==nextRow)exampleChanged=true;e.dataset.contentAdaptiveBox='true';e.style.setProperty('grid-column',column,'important');e.style.setProperty('grid-row',row+' / span '+span,'important');}
        let line=1,category=null,categoryStart=0;
        function finishCategory(){if(category&&hasCategory)place(category,String(catCol),categoryStart,line-categoryStart);}
        for(const entry of entries){
            if(entry.header){place(entry.header,cueCol+' / -1',line++);continue;}
            if(entry.divider){finishCategory();category=null;place(entry.divider,'1 / -1',line++);continue;}
            if(entry.category){finishCategory();category=entry.category;categoryStart=line;if(!hasCategory)place(category,'1 / -1',line++);continue;}
            if(entry.full){place(entry.full,'1 / -1',line++);continue;}
            const outerLine=line;
            if(entry.owner){
                const owner=entry.owner,nextRow=outerLine+' / span 1';
                if(owner.style.gridColumn!=='1 / -1'||owner.style.gridRow!==nextRow)exampleChanged=true;
                owner.style.setProperty('grid-column','1 / -1','important');owner.style.setProperty('grid-row',nextRow,'important');
                line=1;
            }
            if(entry.introOnly){if(!hasLabel&&entry.label?.textContent.trim())place(entry.label,'1 / -1',line++);else place(entry.label,String(labelCol||1),line);place(entry.before,cueCol+' / -1',line++);line=outerLine+1;continue;}
            const r=entry;if(!r.audio||!r.model)continue;
            if(r.before&&r.before.textContent.trim()){if(!hasLabel&&r.label?.textContent.trim())place(r.label,'1 / -1',line++);else place(r.label,String(labelCol||1),line);place(r.before,cueCol+' / -1',line++);}
            else if(!hasLabel&&r.label?.textContent.trim())place(r.label,'1 / -1',line++);
            else place(r.label,hasLabel?String(labelCol):'1',line);
            if(cueAbove&&r.cue){place(r.cue,'1 / -1',line++);}
            else place(r.cue,String(cueCol),line);
            place(r.arrow,String(arrowCol||cueCol),line);place(r.audio,String(audioCol),line);
            const remaining=hasModelTrack?modelRoom:-1;
            const inline=hasModelTrack&&modelMinimum(r.model)<=remaining+.25;
            const offset=(hasCategory?categoryWidth+gap:0)+(hasLabel?labelWidth+gap:0);
            const start=intrinsic(r.model)>width-offset+.25?(hasCategory?catCol+1:1):cueCol;
            place(r.model,inline?String(modelCol):start+' / -1',inline?line:line+1);
            r.model.dataset.contentModel=inline?'inline':'below';line=entry.owner?outerLine+1:line+(inline?1:2);
        }
        finishCategory();widths.set(root,root.clientWidth);
    }
    function modernExamples(){
        document.querySelectorAll('.p81-example').forEach(root=>{
            // The approved p82 concept adapter owns its 6px translation anchor.
            if(root.querySelector('.p82-concept-label'))return;
            const entries=[];
            for(const child of root.children){
                if(child.matches('.p83-example-header-row')){child.dataset.contentAdaptiveFlatten='true';child.querySelectorAll('[class*="spacer-col"]').forEach(e=>e.dataset.contentAdaptiveEmpty='true');entries.push({header:child.querySelector('.p83-example-header-cue')});}
                else if(child.matches('.p83-example-category'))entries.push({category:child});
                else if(child.matches('.p83-example-divider'))entries.push({divider:child});
                else if(child.matches('.p81-example-row')){child.dataset.contentAdaptiveOwner='true';entries.push({owner:child,label:child.querySelector(':scope > .example-label-title'),cue:child.querySelector(':scope > .p81-example-cue'),arrow:child.querySelector(':scope > .p81-arrow'),audio:child.querySelector(':scope > button'),model:child.querySelector(':scope > .p81-model')});}
            }
            adaptiveExample(root,entries);
            if(root.matches('.p81-degree-example')){
                const cues=[...root.querySelectorAll('.p81-example-cue')];
                const prefixWidth=Math.max(...cues.map(c=>intrinsic(c.querySelector('.p81-degree-cue-prefix'))));
                const tailWidth=Math.max(...cues.map(c=>intrinsic(c.querySelector('.p81-degree-cue-tail'))));
                const state=prefixWidth+tailWidth>Math.min(...cues.map(c=>c.clientWidth))+.25?'stacked':'inline';
                if(root.dataset.contentDegree!==state)exampleChanged=true;
                root.dataset.contentDegree=state;
                root.style.setProperty('--content-degree-tail',tailWidth+'px');
            }
            const prefix=root.querySelector('.p83-header-prefix'),cue=root.querySelector('.p81-example-cue'),targets=cue?.querySelectorAll('.target-word');
            if(prefix&&targets?.length>1){const r=cue.getBoundingClientRect(),t=targets[1].getBoundingClientRect();prefix.style.width=(Math.abs(t.y-targets[0].getBoundingClientRect().y)<2?Math.max(0,t.x-r.x):0)+'px';}
        });
    }
    function sceneExamples(){
        document.querySelectorAll('.p21-which-models,.p2x-price-example,.p2x-food-example,.p23-conversation-models').forEach(root=>{
            const entries=[];
            for(const child of root.children){
                if(child.matches('.p2x-picture')){entries.push({full:child});continue;}
                if(child.matches('.p21-which-model-line')){
                    if(!child.querySelector('.p21-which-cue')){entries.push({full:child});continue;}
                    child.dataset.contentAdaptiveOwner='true';const c=[...child.children];entries.push({owner:child,label:c[0],cue:c[1],arrow:c[2],audio:c[3],model:c[4]});
                } else if(child.matches('.p22-conversation-line')){
                    child.dataset.contentAdaptiveOwner='true';child.querySelector('.p22-cue-arrow').dataset.contentAdaptiveFlatten='true';
                    entries.push({owner:child,label:child.firstElementChild,cue:child.querySelector('.p22-example-cue'),arrow:child.querySelector('.p22-example-arrow'),audio:child.querySelector(':scope > button'),model:child.lastElementChild});
                } else if(child.matches('.p21-model-line')){
                    child.dataset.contentAdaptiveOwner='true';const label=child.querySelector('.p23-model-speaker'),before=child.querySelector('.p23-model-intro');
                    const audio=child.querySelector('.p23-example-audio');
                    if(audio)entries.push({owner:child,label,before,cue:child.querySelector('.p23-example-cue'),audio,model:child.querySelector('.p23-model-answer')});
                    else if(before?.textContent.trim())entries.push({owner:child,introOnly:true,label,before});
                }
            }
            adaptiveExample(root,entries);
        });
    }
    function degreeGuides(){
        document.querySelectorAll('.p81-degree-scale').forEach(root=>{
            if(!observed.has(root)){resize.observe(root);observed.add(root);}
            const points=[...root.children],style=getComputedStyle(root),gap=parseFloat(style.columnGap)||0;
            const available=root.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
            const needed=Math.max(...points.map(p=>Math.max(modelMinimum(p),intrinsic(p.querySelector('.p81-degree-marks')||p))));
            const count=Math.max(1,Math.min(points.length,Math.floor((available+gap)/(needed+gap))));
            root.classList.add('content-degree-guide');points.forEach(p=>p.dataset.contentAdaptiveBox='true');
            root.style.gridTemplateColumns=`repeat(${count},minmax(0,1fr))`;widths.set(root,root.clientWidth);
        });
    }
    // Photograph controls keep each zone/speaker group intact; only the number
    // of whole groups per row changes with the space actually available.
    function photographControls(){
        document.querySelectorAll('.p2x-audio-grid,.p2x-compact-audio,.p23-city-audio').forEach(root=>{
            if(!observed.has(root)){resize.observe(root);observed.add(root);}
            if(!root.getClientRects().length){widths.set(root,0);return;}
            const units=[...root.children].filter(e=>e.getClientRects().length);
            if(!units.length)return;
            const style=getComputedStyle(root),gap=parseFloat(style.columnGap)||0;
            const available=root.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
            // These controls retain their existing media-dependent button size.
            // Re-measure it rather than caching an earlier media rule's font.
            const natural=Math.max(...units.map(e=>{measures.delete(e);return intrinsic(e);}));
            const count=Math.max(1,Math.min(units.length,Math.floor((available+gap)/(natural+gap))));
            root.classList.add('content-photograph-controls');root.dataset.contentColumns=String(count);
            root.style.gridTemplateColumns=`repeat(${count},minmax(0,1fr))`;
            widths.set(root,root.clientWidth);
        });
    }
    // Approved narrow-scene fallback: preserve the original callout node,
    // photograph, type and wording; dock only when its text collides with prices.
    function foodCallouts(){
        document.querySelectorAll('.p2x-food-example .p21-which-guide').forEach(guide=>{
            const picture=guide.closest('.p2x-picture'),stage=picture?.querySelector('.p2x-stage');
            if(!stage)return;
            let record=callouts.get(guide);
            if(!record){record={parent:guide.parentElement,next:guide.nextSibling,key:null};callouts.set(guide,record);}
            const frame=stage.getBoundingClientRect();
            const key=[frame.width,frame.height,getComputedStyle(guide).font,fontRevision].join('|');
            if(record.key===key)return;
            if(guide.classList.contains('content-docked-guide')){
                guide.classList.remove('content-docked-guide');
                record.parent.insertBefore(guide,record.next?.parentElement===record.parent?record.next:null);
            }
            const labels=[...guide.querySelectorAll('.p21-question-sound,.p21-question-description')].map(e=>e.getBoundingClientRect());
            const prices=[...picture.querySelectorAll('.p2x-price')].map(e=>e.getBoundingClientRect());
            const collision=labels.some(a=>prices.some(b=>Math.min(a.right,b.right)>Math.max(a.left,b.left)+.25&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+.25));
            const outside=labels.some(r=>r.left<frame.left-.25||r.right>frame.right+.25||r.top<frame.top-.25||r.bottom>frame.bottom+.25);
            if(collision||outside){picture.append(guide);guide.classList.add('content-docked-guide');}
            record.key=key;
        });
    }
    function refresh() {
        queued = false;
        observer.disconnect();
        for (const element of observed) if (!element.isConnected) { resize.unobserve(element); observed.delete(element); }
        recordings();
        inlineActions();
        examples();
        modernExamples();
        sceneExamples();
        degreeGuides();
        photographControls();
        foodCallouts();
        if(exampleChanged){exampleChanged=false;document.dispatchEvent(new Event('content-layout'));schedule();}
        observed.forEach(e=>fonts.set(e,getComputedStyle(e).font));
        observer.observe(document.body, {childList: true, subtree: true, characterData: true});
    }
    function schedule() { if (!queued) { queued = true; requestAnimationFrame(refresh); } }
    const observer = new MutationObserver(records => {
        if (records.some(r => (r.target.nodeType === Node.ELEMENT_NODE ? r.target : r.target.parentElement)?.closest('.prompt-label,.drill-cue-cell,.recording-actions,.example-box') || [...r.addedNodes].some(n => n.nodeType === Node.ELEMENT_NODE && (n.matches('table.recording-table,.example-box') || n.querySelector('table.recording-table,.example-box'))))) schedule();
    });
    const resize = new ResizeObserver(entries => {
        if (entries.some(e => Math.abs(e.target.clientWidth - (widths.get(e.target) ?? -1)) > .25 || fonts.get(e.target)!==getComputedStyle(e.target).font)) schedule();
    });
    document.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
    else schedule();
    document.fonts.ready.then(() => { measures = new WeakMap(); minimums = new WeakMap(); fontRevision++; schedule(); });
    document.fonts.addEventListener('loadingdone', () => { measures = new WeakMap(); minimums = new WeakMap(); fontRevision++; schedule(); });
})();
