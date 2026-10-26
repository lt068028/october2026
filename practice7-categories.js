// Shared Practice 7 category layout. Measure before spacing; never enlarge the longest badge.
(() => {
    const selector = '.tense-badge, .p71-tense, .p73-tense';
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    function align() {
        observer.disconnect();
        const groups = new Map();
        document.querySelectorAll(selector).forEach(badge => {
            const text = badge.textContent;
            badge.classList.remove('practice7-category');
            badge.style.removeProperty('--category-width');
            badge.replaceChildren(document.createTextNode(text));
            const group = badge.closest('.example-box')
                || badge.closest('#drill1List, #drill1Container');
            if (group) {
                if (!groups.has(group)) groups.set(group, []);
                groups.get(group).push(badge);
            }
        });
        groups.forEach(badges => {
            if (new Set(badges.map(b => b.textContent)).size < 2) return;
            const width = Math.max(...badges.map(b => b.getBoundingClientRect().width));
            badges.forEach(badge => {
                const natural = badge.getBoundingClientRect().width;
                const measure = text => {
                    const probe = document.createElement('span');
                    probe.style.display = 'inline-block';
                    probe.textContent = text;
                    badge.append(probe);
                    const result = probe.getBoundingClientRect().width;
                    probe.remove();
                    return result;
                };
                // Reference: Present State natural background, Past with 40px on each side.
                const reference = measure('⏳Present State') + 16;
                const maximumLabelWidth = Math.max(measure('Past'),
                    reference - 80 - measure('⏪'));
                const [icon, ...letters] = [...segmenter.segment(badge.textContent)].map(s => s.segment);
                const mark = document.createElement('span');
                mark.textContent = icon;
                const label = document.createElement('span');
                label.className = 'practice7-category-label';
                const textWidth = measure(letters.join(''));
                const characterWidth = letters.reduce((sum, letter) => sum + measure(letter), 0);
                const extra = Math.min(width - natural, Math.max(0, maximumLabelWidth - characterWidth));
                const gap = Math.max(0, extra / Math.max(1, letters.length - 1));
                label.style.columnGap = `${gap}px`;
                if (gap > 0 && textWidth < maximumLabelWidth) {
                    letters.forEach(letter => {
                        const span = document.createElement('span');
                        span.textContent = letter;
                        label.append(span);
                    });
                } else {
                    label.textContent = letters.join('');
                }
                badge.replaceChildren(mark, label);
                badge.style.setProperty('--category-width', `${width}px`);
                badge.classList.add('practice7-category');
            });
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    const observer = new MutationObserver(records => {
        const relevant = records.some(record =>
            record.target.parentElement?.closest(selector)
            || record.target.matches?.(selector)
            || [...record.addedNodes, ...record.removedNodes].some(node =>
                node.matches?.(selector) || node.querySelector?.(selector)));
        if (relevant) align();
    });
    align();
    document.fonts.ready.then(align);
})();
