/* Preview only — Practice 2.1, all Q/A roles and interrogative indicators.
 * Lucide original SVGs: message-circle-question-mark, message-circle-text.
 * Other pages continue using their existing assets until approved.
 * License: https://lucide.dev/license (ISC).
 */
(() => {
  'use strict';
  const ICONS = ["<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" />\n  <path d=\"M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5\" />\n  <path d=\"M12 17h.01\" />\n</svg>\n","<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M3.086 17.509a2 2 0 00-.094-1.167 10 10 0 114.777 4.719 2 2 0 00-1.099-.092l-3.413.998a1 1 0 01-1.236-1.168z\" />\n  <path d=\"M8 12h9\" />\n  <path d=\"M8 16h5\" />\n  <path d=\"M8 8h7\" />\n</svg>\n"];
  const parseSvg = (source, extraClass) => {
    const template = document.createElement('template');
    template.innerHTML = source.trim();
    const svg = template.content.firstElementChild;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add(extraClass);
    return svg;
  };
  const update = () => {
    // The shared ConversationDisplay creates Icons8 PNGs; replace only on Practice 2.1.
    document.querySelectorAll('.practice21-page .conversation-role-icon > img').forEach(img => {
      const role = img.closest('.conversation-role-icon');
      const isQuestion = role?.getAttribute('aria-label') === 'Question';
      const svg = parseSvg(ICONS[isQuestion ? 0 : 1], 'qa-compare-svg');
      img.replaceWith(svg);
      role.dataset.qaPreviewLibrary = 'lucide';
    });
    // The small icon beside the stop button identifies a question sentence.
    // Use the same Lucide question-mark bubble for visual consistency.
    document.querySelectorAll('.practice21-page .question-indicator svg:not(.qa-compare-question-indicator)').forEach(oldSvg => {
      const svg = parseSvg(ICONS[0], 'qa-compare-question-indicator');
      oldSvg.replaceWith(svg);
    });
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, {childList:true, subtree:true});
  update();
})();
