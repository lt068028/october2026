// Shared semantic emphasis markup; display-only, with no audio or grading effects.
window.SemanticDisplay = (() => {
    function highlightHTML(text, className = 'grammar-highlight') {
        const host = document.createElement('span');
        for (const part of String(text).split(/([。、？！!?，,.:：;；／/]+)/u)) {
            if (!part) continue;
            const punctuation = /^[。、？！!?，,.:：;；／/]+$/u.test(part);
            const element = document.createElement(punctuation ? 'span' : 'strong');
            element.className = punctuation ? 'semantic-punctuation' : className;
            element.textContent = part;
            host.append(element);
        }
        return host.innerHTML;
    }
    return Object.freeze({ highlightHTML });
})();
