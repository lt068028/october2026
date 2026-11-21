// Keep existing vocabulary and control explanations within the viewport.
(() => {
    const selector = '.tooltip-wrap, .custom-tip-wrap, .p21-image-hint, .p82-autostop-open';
    // Explain missing prerequisites, rather than repeating the Listen button label.
    function applyListenPolicy() {
        observer.disconnect();
        document.querySelectorAll('button .custom-tip-box').forEach(tip => {
            if (tip.closest('.uebung11-page, .practice82-page')) return;
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
        const target = anchor.matches('.p82-autostop-open')
            ? (anchor.querySelector('.drill-record-btn') || anchor)
            : anchor;
        const rect = target.getBoundingClientRect();
        const box = tip.getBoundingClientRect();
        const margin = 12;
        const left = Math.max(margin, Math.min(rect.left + (rect.width - box.width) / 2,
            window.innerWidth - box.width - margin));
        let top = rect.top - box.height - 8;
        if (!anchor.matches('.p82-autostop-open')) {
            if (top < margin) top = rect.bottom + 8;
            top = Math.max(margin, Math.min(top, window.innerHeight - box.height - margin));
        }
        tip.style.setProperty('--tip-left', `${left}px`);
        tip.style.setProperty('--tip-top', `${top}px`);
    }
    const escapeTipSelector = '.custom-tip-wrap, .tooltip-wrap, .p82-incomplete-mark, .uebung-incomplete-wrap';

    function isOtherUIPrioritized(event) {
        if (event && event.defaultPrevented) return true;
        if (document.querySelector('.voice-dropdown.open, .voice-list.open, #voiceDropdownMenu:not([hidden]), .voice-dropdown-menu:not([hidden]), #voiceDropdownBtn[aria-expanded="true"], [id*="voiceDropdownBtn"][aria-expanded="true"]')) return true;
        if (document.querySelector('#behindTheCuesDrawer.is-open, .drawer.is-open, .drawer.open, body.drawer-open')) return true;
        if (document.querySelector('details.picker-panel[open], .picker-panel.open')) return true;
        if (document.querySelector('dialog[open]')) return true;
        if (document.activeElement && document.activeElement.tagName === 'SELECT') return true;
        return false;
    }

    function isStatusIndicator(host) {
        if (!host || typeof host.matches !== 'function') return false;
        return host.matches('.p82-autostop-open, .p82-autoplay-stop, .p82-autostop-tip-host, [data-tip-status-only]') ||
               Boolean(host.closest('.p82-autostop-open, .p82-autoplay-stop, .p82-autostop-tip-host, [data-tip-status-only]'));
    }

    function isOptInTarget(host) {
        if (!host || typeof host.matches !== 'function') return false;
        if (isStatusIndicator(host)) return false;
        if (!host.querySelector(':scope > .custom-tip-box, :scope > .tooltip-tip, :scope > .tooltip-box')) return false;
        return Boolean(host.closest('.practice82-page, .uebung11-page, .uebung-page') || host.dataset.tipEscape === 'true');
    }

    function findPriorityTarget() {
        const active = document.activeElement;
        if (active && active !== document.body && active !== document.documentElement) {
            const host = active.closest?.(escapeTipSelector);
            if (host && isOptInTarget(host) && !host.hasAttribute('data-tip-suppressed')) return host;
        }
        const openHosts = Array.from(document.querySelectorAll('.tap-tip-open'));
        for (let i = openHosts.length - 1; i >= 0; i--) {
            const host = openHosts[i].closest?.(escapeTipSelector);
            if (host && isOptInTarget(host) && !host.hasAttribute('data-tip-suppressed')) return host;
        }
        const hovered = Array.from(document.querySelectorAll(':hover'));
        for (let i = hovered.length - 1; i >= 0; i--) {
            const host = hovered[i].closest?.(escapeTipSelector);
            if (host && isOptInTarget(host) && !host.hasAttribute('data-tip-suppressed')) return host;
        }
        return null;
    }

    let otherUIWasOpenOnCapture = false;

    function dismissTarget(host) {
        if (host.classList.contains('tap-tip-open')) {
            host.classList.remove('tap-tip-open');
        }
        if (openVocabulary === host || (openVocabulary && !openVocabulary.classList.contains('tap-tip-open'))) {
            openVocabulary = document.querySelector('.tooltip-wrap.tap-tip-open') || null;
        }
        host.setAttribute('data-tip-suppressed', 'true');
    }

    /**
     * Document-wide parameterless API: initializes minimal Escape dismiss and re-display suppression
     * once for the entire document via event delegation.
     */
    function enableEscapeDismiss() {
        if (DrillTooltips._escapeDismissInitialized) return;
        DrillTooltips._escapeDismissInitialized = true;

        document.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
                document.documentElement.removeAttribute('data-tooltip-input');
                return;
            }
            if (e.key !== 'Escape') return;
            otherUIWasOpenOnCapture = isOtherUIPrioritized(e);
        }, true);

        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            const skipForOtherUI = otherUIWasOpenOnCapture || isOtherUIPrioritized(e);
            otherUIWasOpenOnCapture = false;
            if (skipForOtherUI) return;

            const target = findPriorityTarget();
            if (!target) {
                const openDomVocab = document.querySelector('.tooltip-wrap.tap-tip-open');
                if ((openVocabulary && !isOptInTarget(openVocabulary)) || (openDomVocab && !isOptInTarget(openDomVocab))) {
                    closeVocabulary();
                }
                return;
            }
            dismissTarget(target);
        });

        document.addEventListener('pointerout', e => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
            const host = e.target.closest?.(escapeTipSelector);
            if (host && host.hasAttribute('data-tip-suppressed')) {
                if (!e.relatedTarget || !host.contains(e.relatedTarget)) {
                    host.removeAttribute('data-tip-suppressed');
                }
            }
        }, true);

        document.addEventListener('focusout', e => {
            const host = e.target.closest?.(escapeTipSelector);
            if (host && host.hasAttribute('data-tip-suppressed')) {
                if (!e.relatedTarget || !host.contains(e.relatedTarget)) {
                    host.removeAttribute('data-tip-suppressed');
                }
            }
        }, true);
    }

    window.DrillTooltips = {
        position,
        enableEscapeDismiss,
        _escapeDismissInitialized: false,
        isStatusIndicator,
        isOtherUIPrioritized
    };
    for (const event of ['pointerover', 'focusin']) {
        document.addEventListener(event, e => {
            if (event === 'pointerover' && e.pointerType === 'mouse') {
                document.documentElement.removeAttribute('data-tooltip-input');
            }
            const anchor = e.target.closest?.(selector);
            if (anchor) position(anchor);
        });
    }

    // Touch vocabulary hints are independent of native form controls.
    let openVocabulary=null, touchStart=null;
    function closeVocabulary() {
        openVocabulary?.classList.remove('tap-tip-open');
        document.querySelectorAll('.tooltip-wrap.tap-tip-open, .tap-tip-open').forEach(el => {
            el.classList.remove('tap-tip-open');
        });
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
        if(host && host.hasAttribute('data-tip-suppressed'))host.removeAttribute('data-tip-suppressed');
        const wasOpen=Boolean(host && host.classList.contains('tap-tip-open'));
        closeVocabulary();
        if(host && !wasOpen){
            openVocabulary=host;
            host.classList.add('tap-tip-open');
            position(host);
        }
    },{passive:true});
    document.addEventListener('pointercancel',()=>{touchStart=null;});
    document.addEventListener('keydown',e=>{
        if(e.key==='Escape' && !DrillTooltips._escapeDismissInitialized)closeVocabulary();
    });

    if (window.__enableDrillTooltipEscapeDismiss || document.querySelector('.practice82-page, .uebung11-page, .uebung-page')) {
        enableEscapeDismiss();
    }

    function reposition() {
        document.querySelectorAll(selector).forEach(anchor => {
            if (anchor.matches(':hover, :focus-visible, .tap-tip-open, .p82-autostop-open')) position(anchor);
        });
    }
    window.addEventListener('resize', reposition);
    document.addEventListener('scroll', reposition, true);
})();
