// Content-width layout: presentation only; never changes models, controls or stored data.
(() => {
    let queued = false;
    const widths = new WeakMap();
    const observed = new Set();
    const measureHost = document.createElement('div');
    Object.assign(measureHost.style, {position: 'fixed', visibility: 'hidden', pointerEvents: 'none', width: 'max-content', contain: 'layout style'});
    const measureRoot = measureHost.attachShadow({mode: 'closed'});
    const measures = new WeakMap();
    const properties = ['display','box-sizing','font-family','font-size','font-weight','font-style','font-variant','line-height','letter-spacing','word-spacing','text-transform','white-space','word-break','overflow-wrap','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-style','border-right-style','border-bottom-style','border-left-style','margin-top','margin-right','margin-bottom','margin-left','gap','column-gap','row-gap','align-items','justify-content','flex-direction','flex-wrap','flex-shrink','flex-grow','flex-basis','vertical-align','grid-auto-flow','grid-column','grid-row'];
    function intrinsic(element) {
        if (!measureHost.isConnected) document.body.append(measureHost);
        const style = getComputedStyle(element);
        const key = element.innerHTML + style.font + style.letterSpacing + [...element.querySelectorAll('select,input')].map(e => e.value + getComputedStyle(e).width).join('|');
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
    function refresh() {
        queued = false;
        observer.disconnect();
        for (const element of observed) if (!element.isConnected) { resize.unobserve(element); observed.delete(element); }
        recordings();
        inlineActions();
        observer.observe(document.body, {childList: true, subtree: true, characterData: true});
    }
    function schedule() { if (!queued) { queued = true; requestAnimationFrame(refresh); } }
    const observer = new MutationObserver(records => {
        if (records.some(r => (r.target.nodeType === Node.ELEMENT_NODE ? r.target : r.target.parentElement)?.closest('.prompt-label,.drill-cue-cell,.recording-actions') || [...r.addedNodes].some(n => n.nodeType === Node.ELEMENT_NODE && (n.matches('table.recording-table') || n.querySelector('table.recording-table'))))) schedule();
    });
    const resize = new ResizeObserver(entries => {
        if (entries.some(e => Math.abs(e.target.clientWidth - (widths.get(e.target) ?? -1)) > .25)) schedule();
    });
    document.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
    else schedule();
    document.fonts.ready.then(schedule);
})();
