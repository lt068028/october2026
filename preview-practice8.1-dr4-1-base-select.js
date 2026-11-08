// Preview adapter only. The production renderer still owns choices, change,
// activity exclusion, recording keys, playback interruption and recording locks.
(() => {
    'use strict';
    const supported = CSS.supports('appearance', 'base-select') &&
        CSS.supports('selector(::picker(select))');
    document.getElementById('p81-preview-support').textContent = supported
        ? 'Drill 4-1: hover or use arrow keys to preview English; click or Enter to select. On touch, English appears alongside Japanese.'
        : 'Native-select fallback: option-level English hover is unavailable in this browser.';
    if (!supported) return;

    const meanings = {
        washDish: 'Wash dishes',
        discardThing: 'Throw things away',
        useSmartphone: 'Use a smartphone',
        cutHair: 'Cut hair',
        carryBag: 'Carry a bag',
        beginStudy: 'Start studying'
    };
    function fitPicker(select) {
        if (!select) return;
        const rect = select.getBoundingClientRect();
        const available = Math.max(rect.top - 12, innerHeight - rect.bottom - 12);
        select.style.setProperty('--preview-picker-height', Math.max(0, Math.min(480, available)) + 'px');
    }
    function enhance() {
        const select = document.querySelector('#drill4 select[data-choice="degree-0"]');
        if (!select || select.classList.contains('p81-base-select')) return;
        const value = select.value;
        // Retain the native field's measured allocation, not the picker's width.
        select.style.setProperty('--preview-select-width', select.getBoundingClientRect().width + 'px');
        const button = document.createElement('button');
        button.type = 'button';
        button.append(document.createElement('selectedcontent'));
        select.prepend(button);
        for (const option of select.options) {
            const japanese = document.createElement('span');
            japanese.className = 'p81-option-japanese';
            japanese.textContent = option.textContent;
            option.replaceChildren(japanese);
            if (meanings[option.value]) {
                const english = document.createElement('span');
                english.className = 'p81-option-english';
                english.textContent = meanings[option.value];
                option.append(english);
                option.setAttribute('aria-label', japanese.textContent + ' — ' + english.textContent);
            }
        }
        select.classList.add('p81-base-select');
        select.value = value;
        select.addEventListener('pointerdown', () => fitPicker(select));
        select.addEventListener('keydown', () => fitPicker(select));
        fitPicker(select);
    }
    // Observe replacement by the unchanged page renderer. No extra change
    // handler: only a browser-confirmed selection reaches the original onchange.
    new MutationObserver(enhance).observe(document.getElementById('drill1Container'), {
        childList: true, subtree: true
    });
    const fitCurrent = () => fitPicker(document.querySelector('#drill4 .p81-base-select'));
    window.addEventListener('resize', fitCurrent);
    document.addEventListener('scroll', fitCurrent, {capture: true, passive: true});
    enhance();
})();
