// Minimal reusable Yes/No answer icon helper.
// Provides standardized Microsoft Fluent smile/sad icons matching Practice 7.1 approved reference.
window.AnswerIcons = Object.freeze({
    SVGS: Object.freeze({
        yes: window.FluentIcons.markup('yes', 20, 'yn-answer-icon p71-answer-icon'),
        no: window.FluentIcons.markup('no', 20, 'yn-answer-icon p71-answer-icon')
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
