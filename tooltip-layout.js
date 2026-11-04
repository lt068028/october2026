// Keep existing vocabulary and control explanations within the viewport.
(() => {
    const selector = '.tooltip-wrap, .custom-tip-wrap, .p21-image-hint';
    // Explain missing prerequisites, rather than repeating the Listen button label.
    function applyListenPolicy() {
        observer.disconnect();
        document.querySelectorAll('button .custom-tip-box').forEach(tip => {
            if (/^(Listen\b|Record\b|Stop\b|Play your recorded voice|Affirmative response|Negative response)/i.test(tip.textContent.trim())) {
                const button = tip.closest('button');
                tip.remove();
                if (!button.querySelector('.custom-tip-box')) button.classList.remove('custom-tip-wrap');
            }
        });
        document.querySelectorAll('.selection-help-wrap').forEach(wrap => {
            const button = wrap.querySelector('button');
            if (!button?.dataset.selectionHelp) {
                if (button) wrap.replaceWith(button);
                else wrap.remove();
            } else {
                wrap.setAttribute('aria-label', button.dataset.selectionHelp);
                const tip = wrap.querySelector('.custom-tip-box');
                if (tip.textContent !== button.dataset.selectionHelp) tip.textContent = button.dataset.selectionHelp;
            }
        });
        document.querySelectorAll('button[data-selection-help]').forEach(button => {
            if (button.parentElement.classList.contains('selection-help-wrap')) return;
            const wrap = document.createElement('span');
            wrap.className = 'selection-help-wrap custom-tip-wrap';
            wrap.tabIndex = 0;
            wrap.setAttribute('aria-label', button.dataset.selectionHelp);
            const tip = document.createElement('span');
            tip.className = 'custom-tip-box';
            tip.setAttribute('role', 'tooltip');
            tip.textContent = button.dataset.selectionHelp;
            button.replaceWith(wrap);
            wrap.append(button, tip);
        });
        observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-selection-help']});
    }
    const observer = new MutationObserver(applyListenPolicy);
    applyListenPolicy();
    function position(anchor, explicitTip) {
        const tip = explicitTip || anchor.querySelector('.tooltip-tip, .custom-tip-box') || document.getElementById(anchor.dataset.portalTip || '');
        if (!tip) return;
        tip.dataset.viewportTip = '';
        const rect = anchor.getBoundingClientRect();
        const box = tip.getBoundingClientRect();
        const margin = 12;
        const left = Math.max(margin, Math.min(rect.left + (rect.width - box.width) / 2,
            window.innerWidth - box.width - margin));
        let top = rect.top - box.height - 8;
        if (top < margin) top = rect.bottom + 8;
        top = Math.max(margin, Math.min(top, window.innerHeight - box.height - margin));
        tip.style.setProperty('--tip-left', `${left}px`);
        tip.style.setProperty('--tip-top', `${top}px`);
    }
    window.DrillTooltips = { position };
    for (const event of ['pointerover', 'focusin']) {
        document.addEventListener(event, e => {
            const anchor = e.target.closest?.(selector);
            if (anchor) position(anchor);
        });
    }

    // Touch vocabulary hints are independent of native form controls.
    let openVocabulary=null, touchStart=null;
    function closeVocabulary() {
        openVocabulary?.classList.remove('tap-tip-open');
        openVocabulary=null;
    }
    function vocabularyAt(target) {
        const host=target.closest?.('.tooltip-wrap');
        if(!host || host.querySelector('select,input,textarea,button,a') ||
            !host.querySelector('.target-word,.optional-particle-label') ||
            !host.querySelector('.tooltip-tip'))return null;
        return host;
    }
    document.addEventListener('pointerdown', e=>{
        if(e.pointerType==='mouse'){
            document.documentElement.removeAttribute('data-tooltip-input');
            closeVocabulary();touchStart=null;return;
        }
        if(e.pointerType!=='touch' && e.pointerType!=='pen')return;
        document.documentElement.dataset.tooltipInput='touch';
        touchStart={id:e.pointerId,x:e.clientX,y:e.clientY,host:vocabularyAt(e.target)};
    },{passive:true});
    document.addEventListener('pointerup', e=>{
        if(!touchStart || e.pointerId!==touchStart.id)return;
        const start=touchStart;touchStart=null;
        if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>10)return;
        const host=vocabularyAt(e.target);
        if(host!==start.host)return;
        const wasOpen=host && host===openVocabulary;
        closeVocabulary();
        if(host && !wasOpen){
            openVocabulary=host;
            host.classList.add('tap-tip-open');
            position(host);
        }
    },{passive:true});
    document.addEventListener('pointercancel',()=>{touchStart=null;});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeVocabulary();});

    function reposition() {
        document.querySelectorAll(selector).forEach(anchor => {
            if (anchor.matches(':hover, :focus-visible, .tap-tip-open')) position(anchor);
        });
    }
    window.addEventListener('resize', reposition);
    document.addEventListener('scroll', reposition, true);
})();
