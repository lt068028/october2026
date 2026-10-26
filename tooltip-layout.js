// Keep existing vocabulary and control explanations within the viewport.
(() => {
    const selector = '.tooltip-wrap, .custom-tip-wrap';
    function position(anchor) {
        const tip = anchor.querySelector('.tooltip-tip, .custom-tip-box');
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
    for (const event of ['pointerover', 'focusin']) {
        document.addEventListener(event, e => {
            const anchor = e.target.closest?.(selector);
            if (anchor) position(anchor);
        });
    }
    function reposition() {
        document.querySelectorAll(selector).forEach(anchor => {
            if (anchor.matches(':hover, :focus-visible')) position(anchor);
        });
    }
    window.addEventListener('resize', reposition);
    document.addEventListener('scroll', reposition, true);
})();
