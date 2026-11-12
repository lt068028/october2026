// Static comparison only: no recording, judgment, copy, or persisted selection.
document.querySelectorAll('[data-theme]').forEach(button => {
    button.addEventListener('click', () => {
        const mode = button.dataset.theme;
        if (mode === 'auto') delete document.documentElement.dataset.comparisonTheme;
        else document.documentElement.dataset.comparisonTheme = mode;
    });
});
document.querySelectorAll('.row-role').forEach(node => {
    node.innerHTML = FluentIcons.markup('answer', 24, '', 'filled');
    node.setAttribute('aria-label', 'Answer · static layout reference');
    node.setAttribute('role', 'img');
});
