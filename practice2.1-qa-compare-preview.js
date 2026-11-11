/* Preview only — Practice 2.1 Google Material Symbols Outlined.
 * Google Fonts Material Symbols: https://fonts.google.com/icons
 * Preview branch only; production and other pages remain unchanged.
 */
(() => {
  'use strict';
  const makeIcon = (name, cls) => {
    const span = document.createElement('span');
    span.className = 'material-symbols-outlined ' + cls;
    span.textContent = name;
    span.setAttribute('aria-hidden', 'true');
    return span;
  };
  const update = () => {
    document.querySelectorAll('.practice21-page .conversation-role-icon > img').forEach(img => {
      const role = img.closest('.conversation-role-icon');
      const question = role?.getAttribute('aria-label') === 'Question';
      img.replaceWith(makeIcon(question ? 'help' : 'chat', 'qa-google-preview'));
      role.dataset.qaPreviewLibrary = 'google-material-symbols';
    });
    document.querySelectorAll('.practice21-page .question-indicator svg:not([data-google-replaced])').forEach(svg => {
      svg.replaceWith(makeIcon('help', 'qa-google-question-preview'));
    });
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true });
  update();
})();
