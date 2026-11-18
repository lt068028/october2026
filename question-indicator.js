// Minimal reusable question-sentence indicator helper.
// Displays the noninteractive Microsoft Fluent message-circle-question icon beside the stop button for interrogative rows.
window.QuestionIndicator = Object.freeze({
    SVG_MARKUP: window.FluentIcons.markup('question', 16, 'question-indicator-icon', 'filled'),
    REGULAR_MARKUP: window.FluentIcons.markup('question', 16, 'question-indicator-icon', 'regular'),

    create(variant = 'filled') {
        const span = document.createElement('span');
        span.className = 'question-indicator';
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = variant === 'regular' ? this.REGULAR_MARKUP : this.SVG_MARKUP;
        return span;
    },

    attach(target, isInterrogative, options = {}) {
        if (!target) return null;

        if (options.placement === 'cue') {
            target.querySelector('.question-indicator')?.remove();
            if (!isInterrogative) return null;
            const indicator = this.create(options.variant || 'regular');
            target.append(indicator);
            return indicator;
        }

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
