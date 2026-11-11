/* Preview only — Practice 2.1 Microsoft Fluent UI System Icons.
 * Question: Chat Help 24 Regular; Answer: Chat 24 Regular.
 * Source: microsoft/fluentui-system-icons (MIT).
 * Other pages and production remain unchanged.
 */
(() => {
  'use strict';
  const ICONS = ["<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM12 15.5C12.5523 15.5 13 15.9477 13 16.5C13 17.0523 12.5523 17.5 12 17.5C11.4477 17.5 11 17.0523 11 16.5C11 15.9477 11.4477 15.5 12 15.5ZM12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5C14.75 10.5108 14.4525 11.074 13.6989 11.8586L13.5303 12.0303C12.9084 12.6522 12.75 12.9163 12.75 13.5C12.75 13.9142 12.4142 14.25 12 14.25C11.5858 14.25 11.25 13.9142 11.25 13.5C11.25 12.4892 11.5475 11.926 12.3011 11.1414L12.4697 10.9697C13.0916 10.3478 13.25 10.0837 13.25 9.5C13.25 8.80964 12.6904 8.25 12 8.25C11.3528 8.25 10.8205 8.74187 10.7565 9.37219L10.75 9.5C10.75 9.91421 10.4142 10.25 10 10.25C9.58579 10.25 9.25 9.91421 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75Z\" fill=\"currentColor\"/>\n</svg>","<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM8.75 13H13.2483C13.6625 13 13.9983 13.3358 13.9983 13.75C13.9983 14.1297 13.7161 14.4435 13.35 14.4932L13.2483 14.5H8.75C8.33579 14.5 8 14.1642 8 13.75C8 13.3703 8.28215 13.0565 8.64823 13.0068L8.75 13H13.2483H8.75ZM8.75 9.5H15.2545C15.6687 9.5 16.0045 9.83579 16.0045 10.25C16.0045 10.6297 15.7223 10.9435 15.3563 10.9932L15.2545 11H8.75C8.33579 11 8 10.6642 8 10.25C8 9.8703 8.28215 9.55651 8.64823 9.50685L8.75 9.5H15.2545H8.75Z\" fill=\"currentColor\"/>\n</svg>"];
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
    document.querySelectorAll('.practice21-page .conversation-role-icon > img').forEach(img => {
      const role = img.closest('.conversation-role-icon');
      const isQuestion = role?.getAttribute('aria-label') === 'Question';
      img.replaceWith(parseSvg(ICONS[isQuestion ? 0 : 1], 'qa-compare-svg'));
      role.dataset.qaPreviewLibrary = 'microsoft-fluent';
    });
    document.querySelectorAll('.practice21-page .question-indicator svg:not(.qa-compare-question-indicator)').forEach(oldSvg => {
      oldSvg.replaceWith(parseSvg(ICONS[0], 'qa-compare-question-indicator'));
    });
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, {childList: true, subtree: true});
  update();
})();
