// 共通TTSの読み込みと、発音1の再生処理との接続
let pronunciationTTS = null;
let pronunciationTTSLoading = null;
let pronunciationTTSTicket = 0;

function loadPronunciationTTS() {
    if (!pronunciationTTSLoading) {
        pronunciationTTSLoading = import('./shared-tts.js')
            .then(module => {
                pronunciationTTS = module;
                return module;
            })
            .catch(error => {
                pronunciationTTSLoading = null;
                throw error;
            });
    }
    return pronunciationTTSLoading;
}

// 既存の停止処理に、Supertonicの停止を追加する。
const pronunciationOriginalStopAllPlayback = stopAllPlayback;

stopAllPlayback = function () {
    ++pronunciationTTSTicket;
    if (pronunciationTTS) pronunciationTTS.cancel();
    pronunciationOriginalStopAllPlayback();
};

// 設定ボタンを表示する。モデル取得は最初の再生時に行う。
loadPronunciationTTS().catch(error => {
    console.error('Shared TTS could not be loaded:', error);

    const showError = () => {
        if (document.getElementById('ttsLoadError')) return;
        const notice = document.createElement('p');
        notice.id = 'ttsLoadError';
        notice.setAttribute('role', 'alert');
        notice.textContent =
            'Voice settings could not be loaded. Please reload this page.';
        const header = document.querySelector('.main-header');
        if (header) header.after(notice);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showError, {
            once: true
        });
    } else {
        showError();
    }
});

function speakText(text, rate = 0.9, onEndCallback) {
    const ticket = ++pronunciationTTSTicket;

    loadPronunciationTTS()
        .then(module => {
            if (ticket !== pronunciationTTSTicket) return false;

            // 試験中は共通TTS側で生成速度70％に固定する。
            return module.speak(text);
        })
        .then(completed => {
            if (
                completed &&
                ticket === pronunciationTTSTicket &&
                onEndCallback
            ) {
                onEndCallback();
            }
        })
        .catch(error => {
            console.error('Supertonic playback failed:', error);

            // エラー時も既存の再生ボタン復帰処理へ戻す。
            if (
                ticket === pronunciationTTSTicket &&
                onEndCallback
            ) {
                onEndCallback();
            }
        });
}
