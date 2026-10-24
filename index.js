// モバイル環境向けの共通案内
(() => {
    'use strict';

    function showMobileNotice() {
        const ua = navigator.userAgent || '';

        const isMobile =
            navigator.userAgentData?.mobile === true ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
            (
                /Macintosh/i.test(ua) &&
                navigator.maxTouchPoints > 1
            );

        if (!isMobile || document.getElementById('mobileSupportNotice')) {
            return;
        }

        const notice = document.createElement('aside');
        notice.id = 'mobileSupportNotice';
        notice.className = 'info-panel';
        notice.lang = 'en';
        notice.setAttribute('aria-label', 'Mobile support notice');

        const title = document.createElement('span');
        title.className = 'info-panel-title';
        title.textContent = 'Mobile support';

        const description = document.createElement('span');
        description.className = 'info-panel-desc';
        description.textContent =
            'Speech recognition and answer checking are not currently ' +
            'supported on mobile. Please use a computer for these features.';

        notice.append(title, description);

        const menu = document.querySelector('.menu-container');
        const header = document.querySelector('.main-header');

        if (menu) {
            const navigation = menu.querySelector('nav');
            if (navigation) {
                navigation.before(notice);
            } else {
                menu.prepend(notice);
            }
        } else if (header) {
            header.after(notice);
        } else {
            document.body.prepend(notice);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            showMobileNotice,
            { once: true }
        );
    } else {
        showMobileNotice();
    }
})();
