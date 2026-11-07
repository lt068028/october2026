// Content-width layout: presentation only; never changes models, controls or stored data.
(() => {
    let queued = false;
    const widths = new WeakMap();
    const observed = new Set();
    const measureHost = document.createElement('div');
    Object.assign(measureHost.style, {position: 'fixed', visibility: 'hidden', pointerEvents: 'none', width: 'max-content', contain: 'layout style'});
    const measureRoot = measureHost.attachShadow({mode: 'closed'});
    let measures = new WeakMap();
    const properties = ['display','box-sizing','font-family','font-size','font-weight','font-style','font-variant','line-height','letter-spacing','word-spacing','text-transform','white-space','word-break','overflow-wrap','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-style','border-right-style','border-bottom-style','border-left-style','margin-top','margin-right','margin-bottom','margin-left','gap','column-gap','row-gap','align-items','justify-content','flex-direction','flex-wrap','flex-shrink','flex-grow','flex-basis','vertical-align','grid-auto-flow','grid-column','grid-row'];
    function intrinsic(element) {
        if (!measureHost.isConnected) document.body.append(measureHost);
        const style = getComputedStyle(element);
        const key = element.innerHTML + style.font + style.letterSpacing + style.padding + style.borderWidth + [...element.querySelectorAll('select,input')].map(e => e.value + getComputedStyle(e).width).join('|');
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
        const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
        let width=0;
        const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
            const n=walker.currentNode;if(n.parentElement.closest('.tooltip-tip,.custom-tip-box'))continue;
            const style=getComputedStyle(n.parentElement);context.font=style.font;
            for(const part of n.textContent.split(/[\s、。？！?!／/]+/).filter(Boolean))
                width=Math.max(width,context.measureText(part).width+Math.max(0,part.length-1)*(parseFloat(style.letterSpacing)||0));
        }
        return Math.min(intrinsic(element),width);
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
                    rows.push({label:cells[0],cue:cells[1],arrow:cells[2],audio:combined?cells[4].querySelector('button'):cells[3],model:combined?cells[4].lastElementChild:cells[4]});
                    if(combined) cells[3].dataset.contentEmpty='true';
                } else if(cells.length===2 && cells[1].querySelector('.practice12-example-answer')) {
                    cells[1].dataset.contentFlatten='true';
                    cells[1].querySelectorAll('.practice12-example-answer').forEach((answer,index)=>{
                        answer.dataset.contentFlatten='true';
                        rows.push({label:index===0?cells[0]:null,audio:answer.querySelector('button'),model:answer.lastElementChild});
                    });
                }
            });
            const valid=rows.filter(r=>r.audio&&r.model);
            if(!valid.length)return;
            table.classList.add('content-example-grid');
            valid.forEach(r=>Object.values(r).filter(Boolean).forEach(e=>e.dataset.contentExampleCell='true'));
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
            let line=1;
            function place(e,column,row,span=1){if(!e)return;e.dataset.contentExampleCell='true';e.style.setProperty('grid-column',column,'important');e.style.setProperty('grid-row',row+' / span '+span,'important');}
            for(const r of valid){
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
    function refresh() {
        queued = false;
        observer.disconnect();
        for (const element of observed) if (!element.isConnected) { resize.unobserve(element); observed.delete(element); }
        recordings();
        inlineActions();
        examples();
        observer.observe(document.body, {childList: true, subtree: true, characterData: true});
    }
    function schedule() { if (!queued) { queued = true; requestAnimationFrame(refresh); } }
    const observer = new MutationObserver(records => {
        if (records.some(r => (r.target.nodeType === Node.ELEMENT_NODE ? r.target : r.target.parentElement)?.closest('.prompt-label,.drill-cue-cell,.recording-actions,.example-box') || [...r.addedNodes].some(n => n.nodeType === Node.ELEMENT_NODE && (n.matches('table.recording-table,.example-box') || n.querySelector('table.recording-table,.example-box'))))) schedule();
    });
    const resize = new ResizeObserver(entries => {
        if (entries.some(e => Math.abs(e.target.clientWidth - (widths.get(e.target) ?? -1)) > .25)) schedule();
    });
    document.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
    else schedule();
    document.fonts.ready.then(() => { measures = new WeakMap(); schedule(); });
    document.fonts.addEventListener('loadingdone', () => { measures = new WeakMap(); schedule(); });
})();
