// Global settings distinguish unavailable choices from available, unselected ones.
(() => {
    const roots = '.compact-settings, .voice-guide-footer';
    const leadingEmoji = /^(\s*)(\p{Extended_Pictographic}(?:[\uFE0E\uFE0F]|\p{Emoji_Modifier}|\u200D\p{Extended_Pictographic})*)/u;
    const observer = new MutationObserver(normalizeIcons);

    function normalizeIcons() {
        observer.disconnect();
        document.querySelectorAll(roots).forEach(root => {
            root.querySelectorAll('button').forEach(button => {
                if (button.querySelector('.icon-emoji')) return;
                for (const text of [...button.childNodes]) {
                    if (text.nodeType !== Node.TEXT_NODE) continue;
                    const match = leadingEmoji.exec(text.textContent);
                    if (!match) continue;
                    const icon = document.createElement('span');
                    icon.className = 'icon-emoji';
                    icon.textContent = match[2];
                    const rest = document.createTextNode(text.textContent.slice(match[0].length));
                    text.replaceWith(document.createTextNode(match[1]), icon, rest);
                    break;
                }
            });
            observer.observe(root, {childList: true, subtree: true});
        });
    }

    normalizeIcons();
})();
