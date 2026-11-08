// Minimal reusable Yes/No answer icon helper.
// Provides standardized Lucide smile/frown icons matching Practice 7.1 approved reference.
window.AnswerIcons = Object.freeze({
    SVGS: Object.freeze({
        yes: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="yn-answer-icon p71-answer-icon" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>',
        no: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="yn-answer-icon p71-answer-icon" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 16s1.5-2 4-2 4 2 4 2"/></svg>'
    }),

    create(kind, inline = false) {
        const svgMarkup = this.SVGS[kind] || '';
        if (!inline) {
            const span = document.createElement('span');
            span.innerHTML = svgMarkup;
            return span.firstElementChild;
        }
        const span = document.createElement('span');
        span.className = 'yn-inline-icon p71-inline-icon';
        span.dataset.answer = kind;
        span.innerHTML = svgMarkup;
        return span;
    },

    createExampleLabel(kind) {
        const frag = document.createDocumentFragment();
        frag.append(
            document.createTextNode('🔊'),
            this.create(kind, true)
        );
        return frag;
    }
});
