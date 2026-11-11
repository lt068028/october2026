/* Preview only — Practice 2.1, Q/A roles and question indicators.
 * Candidate C: previously approved Google Material-style comparison drawing.
 * This is a custom comparison SVG, NOT an official Google Material icon.
 * Stroke: 1.8 at 24x24 viewBox. Other pages remain unchanged.
 */
(() => {
  'use strict';

  const ICONS = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 1-5.7 15.96L3 21l1.2-4.4A9 9 0 0 1 12 3Z"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2.4-3 4"/><circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 1-5.7 15.96L3 21l1.2-4.4A9 9 0 0 1 12 3Z"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>'
  ];

  const parseSvg = (source, extraClass) => {
    const template = document.createElement('template');
    template.innerHTML = source;
    const svg = template.content.firstElementChild;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add(extraClass);
    return svg;
  };

  const update = () => {
    // Replace only Practice 2.1 role icons; shared Icons8 assets remain unchanged.
    document.querySelectorAll('.practice21-page .conversation-role-icon > img').forEach(img => {
      const role = img.closest('.conversation-role-icon');
      const isQuestion = role?.getAttribute('aria-label') === 'Question';
      const svg = parseSvg(ICONS[isQuestion ? 0 : 1], 'qa-compare-svg');
      img.replaceWith(svg);
      role.dataset.qaPreviewLibrary = 'material-style-c-205';
    });

    // Match the smaller interrogative marker to the same candidate shape.
    document.querySelectorAll('.practice21-page .question-indicator svg:not(.qa-compare-question-indicator)').forEach(oldSvg => {
      const svg = parseSvg(ICONS[0], 'qa-compare-question-indicator');
      oldSvg.replaceWith(svg);
    });
  };

  const observer = new MutationObserver(update);
  observer.observe(document.body, {childList: true, subtree: true});
  update();
})();
