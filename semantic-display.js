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
    // Called only by Example model renderers, never by shared Drill rendering.
    function exampleNegatives(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let text = '';
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.parentElement?.closest('.tooltip-tip,.custom-tip-box,.vocab-inline')) continue;
            nodes.push({ node, start: text.length });
            text += node.textContent;
        }
        const ranges = [];
        for (const match of text.matchAll(/(じゃない)|[てで](いません|いなかった|いない|なかった|ない)/g)) {
            const value = match[1] || match[2];
            const start = match.index + (match[1] ? 0 : 1);
            ranges.push({ start, end: start + value.length });
        }
        for (const { node, start } of nodes) {
            const value = node.textContent;
            const hits = ranges.filter(r => r.start < start + value.length && r.end > start);
            if (!hits.length || node.parentElement?.closest('.semantic-negative,.degree-negative')) continue;
            const fragment = document.createDocumentFragment();
            let offset = 0;
            for (const range of hits) {
                const from = Math.max(0, range.start - start);
                const to = Math.min(value.length, range.end - start);
                fragment.append(document.createTextNode(value.slice(offset, from)));
                const negative = document.createElement('strong');
                negative.className = 'semantic-negative';
                negative.textContent = value.slice(from, to);
                fragment.append(negative);
                offset = to;
            }
            fragment.append(document.createTextNode(value.slice(offset)));
            node.replaceWith(fragment);
        }
        return root;
    }
    function exampleNegativeHTML(html) {
        const host = document.createElement('span');
        host.innerHTML = html;
        return exampleNegatives(host).innerHTML;
    }
    return Object.freeze({ highlightHTML, exampleNegatives, exampleNegativeHTML });
})();
