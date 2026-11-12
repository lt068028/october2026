/* Feedback status SVGs: Fluent Checkmark 24 Filled (MIT), Lucide Footprints (ISC).
 * Sources and notices: assets/licenses/FEEDBACK-STATUS-SOURCES.txt
 * No inference, scoring, recording, or language-specific rules.
 */
window.FeedbackStatus = (() => {
    const paths = {'accepted': ['M8.5 16.5858L4.70711 12.7929C4.31658 12.4024 3.68342 12.4024 3.29289 12.7929C2.90237 13.1834 2.90237 13.8166 3.29289 14.2071L7.79289 18.7071C8.18342 19.0976 8.81658 19.0976 9.20711 18.7071L20.2071 7.70711C20.5976 7.31658 20.5976 6.68342 20.2071 6.29289C19.8166 5.90237 19.1834 5.90237 18.7929 6.29289L8.5 16.5858Z'], 'undetermined': ['M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z', 'M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z', 'M16 17h4', 'M4 13h4']};
    function resolve(saved) {
        if (!saved || saved.audioOnly || saved.unrecognized) return null;
        if (saved.judgment === 'undetermined') return 'undetermined';
        if (saved.judgment === 'accepted' || saved.judgment === 'mismatch') return saved.judgment;
        if (saved.isCorrect === true || saved.correct === true) return 'accepted';
        if (saved.isCorrect === false || saved.correct === false) return 'mismatch';
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
        } else {
            svg.setAttribute('fill','currentColor');
            svg.setAttribute('stroke','currentColor');
            svg.setAttribute('stroke-width','1.5');
            svg.setAttribute('stroke-linejoin','round');
        }
        for (const data of paths[status]) {
            const path = document.createElementNS('http://www.w3.org/2000/svg','path');
            path.setAttribute('d',data); svg.append(path);
        }
        badge.prepend(svg);
        return badge;
    }
    function appendAccepted(element, text) {
        const group = document.createElement('span');
        group.className = 'feedback-accepted-result';
        const content = document.createElement('span');
        content.className = 'feedback-accepted-text';
        content.textContent = text;
        group.append(create('accepted'), content);
        element.append(group, document.createTextNode(' '));
    }
    function prependAccepted(element) {
        const badge = create('accepted');
        badge.classList.add('feedback-leading-status');
        element.prepend(badge);
    }
    function appendUndetermined(element, text) {
        element.append(document.createTextNode(text), create('undetermined'), document.createTextNode(' '));
    }
    function createRetry() {
        const label = document.createElement('span');
        label.className = 'feedback-retry-label';
        label.setAttribute('lang', 'en');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        for (const [key, value] of Object.entries({viewBox:'0 0 24 24',width:'20',height:'20','aria-hidden':'true',focusable:'false'})) svg.setAttribute(key,value);
        svg.classList.add('feedback-retry-fire');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12.5383 4.29449C12.8615 4.05075 13.182 3.86356 13.4688 3.73169C13.5555 5.85881 14.5955 7.45829 15.5965 8.87109C15.6881 9.00031 15.779 9.12767 15.8688 9.25354C16.9522 10.7721 17.8801 12.0725 17.9813 13.794C18.0979 15.7759 17.6036 17.4514 16.6453 18.6176C15.6986 19.7696 14.2385 20.5 12.25 20.5C10.1887 20.5 8.6396 19.9712 7.55849 19.0843C6.48244 18.2015 5.79472 16.9026 5.56502 15.2123C5.33902 13.5492 5.74149 12.3672 6.17625 11.6092C6.26176 11.4601 6.34906 11.3266 6.43394 11.2084L6.74894 11.8066C7.29998 12.8532 8.57839 13.2789 9.64684 12.7716C10.9525 12.1516 11.2311 10.5595 10.8165 9.4416C10.5264 8.65954 10.3721 7.70456 10.7077 6.74841C11.084 5.67629 11.7985 4.85253 12.5383 4.29449ZM6.15636 9.3231L6.15395 9.32491L6.15 9.3279L6.13963 9.33586C6.13164 9.34204 6.12151 9.34999 6.10942 9.35973C6.08524 9.37919 6.05314 9.40581 6.01442 9.43966C5.93703 9.50732 5.83284 9.6042 5.71236 9.73104C5.47171 9.98437 5.16368 10.3598 4.8751 10.8629C4.29291 11.8779 3.80368 13.3906 4.07868 15.4142C4.34997 17.4107 5.18833 19.0801 6.60711 20.244C8.02084 21.4038 9.93533 22 12.25 22C14.6375 22 16.5425 21.1054 17.8042 19.5699C19.0544 18.0486 19.6122 15.9741 19.4787 13.706C19.3508 11.5302 18.1656 9.87945 17.1188 8.42123C17.0177 8.28043 16.9179 8.14142 16.8205 8.00391C15.6785 6.39222 14.7768 4.90657 14.9959 2.82863C15.0182 2.61721 14.9497 2.40625 14.8075 2.24824C14.6652 2.09023 14.4626 2 14.25 2C13.868 2 13.4309 2.11822 13.0077 2.29599C12.5715 2.47923 12.0984 2.74751 11.6351 3.09694C10.7104 3.79438 9.78589 4.84563 9.29236 6.25159C8.80006 7.65408 9.04947 8.99089 9.41008 9.9632C9.64689 10.6017 9.39005 11.233 9.00347 11.4165C8.66159 11.5789 8.25252 11.4427 8.07619 11.1078L7.26887 9.57452C7.16673 9.38052 6.98481 9.24093 6.77099 9.19248C6.55717 9.14403 6.33215 9.19209 6.15636 9.3231Z');
        path.setAttribute('fill', 'currentColor');
        svg.append(path);
        label.append(svg, document.createTextNode('Keep going!'));
        return label;
    }
    function setMismatch(element) {
        element.replaceChildren(createRetry());
    }
    function clipboardMarker(saved) {
        const status = resolve(saved);
        return status === 'accepted' ? '✅' : status === 'undetermined' ? '👣' : '🔥';
    }
    return Object.freeze({resolve, create, appendAccepted, prependAccepted, appendUndetermined, createRetry, setMismatch, clipboardMarker});
})();
