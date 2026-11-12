// Minimal reusable question-sentence indicator helper.
// Displays the noninteractive Microsoft Fluent message-circle-question icon beside the stop button for interrogative rows.
window.QuestionIndicator = Object.freeze({
    SVG_MARKUP: window.FluentIcons.markup('question', 16, 'question-indicator-icon', 'filled'),

    create() {
        const span = document.createElement('span');
        span.className = 'question-indicator';
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = this.SVG_MARKUP;
        return span;
    },

    attach(target, isInterrogative) {
        if (!target) return null;

        const isButton = target.tagName === 'BUTTON';
        const container = isButton
            ? (target.closest('.recording-actions') || target.parentElement)
            : target;
        const stopBtn = isButton
            ? target
            : container?.querySelector('button:nth-of-type(3), .stop-btn-active, button:last-of-type');

        // Prevent duplicate indicators during rerendering
        container?.querySelector('.question-indicator')?.remove();

        if (!isInterrogative || !stopBtn) return null;

        const indicator = this.create();

        // Ensure stop button and indicator stay together as an atomic visual unit
        if (stopBtn.parentElement?.classList?.contains('stop-indicator-wrap')) {
            stopBtn.parentElement.append(indicator);
        } else if (stopBtn.parentElement) {
            const wrap = document.createElement('span');
            wrap.className = 'stop-indicator-wrap';
            stopBtn.replaceWith(wrap);
            wrap.append(stopBtn, indicator);
        } else {
            const wrap = document.createElement('span');
            wrap.className = 'stop-indicator-wrap';
            wrap.append(stopBtn, indicator);
            container?.append(wrap);
        }

        return indicator;
    }
});
