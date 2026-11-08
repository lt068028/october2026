// Review page only. Q/A semantics and lesson behavior remain page-owned.
(() => {
    if (document.documentElement.dataset.qaPreview === 'original') return;
    const variants = {
        icons: ['assets/qa-preview/chat-bubbles-question.svg', 'assets/qa-preview/chat-more.svg'],
        'icons8-color': ['assets/qa-preview/icons8-color-question.png', 'assets/qa-preview/icons8-color-answer.png'],
        'icons8-mono': ['assets/qa-preview/icons8-mono-question.png', 'assets/qa-preview/icons8-mono-answer.png']
    };
    const pair = variants[document.documentElement.dataset.qaPreview] || variants.icons;
    function install() {
        document.querySelectorAll('.conversation-role-circle').forEach(circle => {
            if (circle.dataset.qaIcon || circle.closest('.conversation-role-blank')) return;
            const role = circle.getAttribute('aria-label') || (circle.textContent.trim() === 'Q' ? 'Question' : 'Answer');
            if (role !== 'Question' && role !== 'Answer') return;
            circle.dataset.qaIcon = role;
            circle.classList.add('qa-icon-preview');
            const image = document.createElement('img');
            image.src = pair[role === 'Question' ? 0 : 1];
            image.alt = '';
            image.setAttribute('aria-hidden', 'true');
            image.width = 24; image.height = 24;
            circle.setAttribute('aria-label', role);
            circle.replaceChildren(image);
        });
    }
    const observer = new MutationObserver(install);
    function start() { install(); observer.observe(document.body, {childList:true,subtree:true}); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
