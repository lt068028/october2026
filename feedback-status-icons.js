/* Feedback status SVGs: Fluent Checkmark 24 Filled (MIT), Lucide Footprints (ISC).
 * Sources and notices: assets/licenses/FEEDBACK-STATUS-SOURCES.txt
 * No inference, scoring, recording, or language-specific rules.
 */
window.FeedbackStatus = (() => {
    const paths = {'accepted': ['M8.5 16.5858L4.70711 12.7929C4.31658 12.4024 3.68342 12.4024 3.29289 12.7929C2.90237 13.1834 2.90237 13.8166 3.29289 14.2071L7.79289 18.7071C8.18342 19.0976 8.81658 19.0976 9.20711 18.7071L20.2071 7.70711C20.5976 7.31658 20.5976 6.68342 20.2071 6.29289C19.8166 5.90237 19.1834 5.90237 18.7929 6.29289L8.5 16.5858Z'], 'undetermined': ['M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z', 'M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z', 'M16 17h4', 'M4 13h4']};
    function resolve(saved) {
        if (!saved || saved.audioOnly || saved.unrecognized) return null;
        if (saved.judgment === 'undetermined') return 'undetermined';
        if (saved.isCorrect === true) return 'accepted';
        if (saved.isCorrect === false) return 'mismatch';
        return null;
    }
    function create(status) {
        if (!paths[status]) return null;
        const badge = document.createElement('span');
        badge.className = 'feedback-status feedback-status-' + status;
        badge.dataset.feedbackStatus = status;
        const label = status === 'accepted' ? 'Accepted' : 'Could not be evaluated reliably.';
        badge.setAttribute('role', 'img');
        badge.setAttribute('aria-label', label);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        for (const [key,value] of Object.entries({viewBox:'0 0 24 24',width:'22',height:'22','aria-hidden':'true',focusable:'false'})) svg.setAttribute(key,value);
        if (status === 'undetermined') {
            for (const [key,value] of Object.entries({fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round'})) svg.setAttribute(key,value);
            badge.tabIndex = 0;
            badge.title = label;
            const tip = document.createElement('span');
            tip.className = 'feedback-status-tooltip';
            tip.setAttribute('role', 'tooltip');
            tip.textContent = label;
            badge.append(tip);
        } else svg.setAttribute('fill','currentColor');
        for (const data of paths[status]) {
            const path = document.createElementNS('http://www.w3.org/2000/svg','path');
            path.setAttribute('d',data); svg.append(path);
        }
        badge.prepend(svg);
        return badge;
    }
    return Object.freeze({resolve, create});
})();
