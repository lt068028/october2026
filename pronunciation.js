// =========================================================================
// Pronunciation Drill
// 第1段階：ピッチ判定・発音正誤判定を完全撤去
// =========================================================================
//
// 現段階の仕様
//   ・録音
//   ・SpeechRecognitionによる音声認識
//   ・認識結果をひらがな化して表示
//   ・MediaRecorderによる録音データ取得
//   ・録音音声の再生
//
// 撤去したもの
//   ・F0抽出
//   ・ピッチパターン推定
//   ・ピッチ判定
//   ・Pitch判定不明
//   ・Pitch判定できず
//   ・発音の正誤判定
//   ・赤／オレンジによる誤り表示
//   ・正解時の✅️表示
//
// 第2段階で追加予定
//   ・モデル音声のピッチ曲線
//   ・学習者音声のピッチ曲線
//   ・両者の視覚的比較
//   ・判定／採点は行わない
// =========================================================================


// =========================================================================
// 【モデル文】
// =========================================================================

const modelSentences = [
    {
        displayHtml: 'てんきが<span class="low-pitch">いい</span>です',
        targetText: 'てんきがいいです',
        targetWord: 'いい',
        symbolColor: 'blue',
        meaning: 'The weather is good.'
    },
    {
        displayHtml: 'じかんが<span class="low-pitch">ない</span>です',
        targetText: 'じかんがないです',
        targetWord: 'ない',
        symbolColor: 'blue',
        meaning: 'I do not have time.'
    },
    {
        displayHtml: 'しごとが<span class="low-pitch">ほしい</span>です',
        targetText: 'しごとがほしいです',
        targetWord: 'ほしい',
        symbolColor: 'blue',
        meaning: 'I want a job.'
    },
    {
        displayHtml: 'せんせいは<span class="high-pitch">おもしろい</span>です',
        targetText: 'せんせいはおもしろいです',
        targetWord: 'おもしろい',
        symbolColor: 'red',
        meaning: 'The teacher is interesting.'
    },
    {
        displayHtml: 'がっこうは<span class="high-pitch">たのしい</span>です',
        targetText: 'がっこうはたのしいです',
        targetWord: 'たのしい',
        symbolColor: 'red',
        meaning: 'School is fun.'
    }
];


// =========================================================================
// 【状態】
// =========================================================================

let currentSentenceIndex = 0;

let isRecording = false;
let isStopping = false;

let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;

let recognition = null;
let recognitionSupported = false;

let latestTranscript = '';


// =========================================================================
// 【録音モード】
// =========================================================================

let autoStopEnabled = true;


// =========================================================================
// 【ひらがな変換】
// =========================================================================
//
// SpeechRecognitionの認識結果を、表示用にひらがなへ統一する。
// =========================================================================

function toHiragana(text) {
    if (!text) return '';

    return text
        .normalize('NFKC')
        .replace(/[ァ-ヶ]/g, function(ch) {
            return String.fromCharCode(ch.charCodeAt(0) - 0x60);
        })
        .replace(/ー/g, 'ー')
        .trim();
}


// =========================================================================
// 【モデル文取得】
// =========================================================================

function getCurrentSentence() {
    return modelSentences[currentSentenceIndex];
}


// =========================================================================
// 【動的CSS】
// =========================================================================

function injectDynamicStyles() {

    if (document.getElementById('pronunciation-dynamic-style')) {
        return;
    }

    const style = document.createElement('style');

    style.id = 'pronunciation-dynamic-style';

    style.textContent = `
        .pronunciation-result {
            white-space: pre-wrap;
            word-break: break-word;
        }

        .low-pitch {
            color: #2563eb;
        }

        .high-pitch {
            color: #dc2626;
        }

        .recording-active {
            opacity: 1;
        }

        .recording-disabled {
            opacity: 0.45;
        }

        .pronunciation-message {
            color: inherit;
        }
    `;

    document.head.appendChild(style);
}


// =========================================================================
// 【SpeechRecognition初期化】
// =========================================================================

function initializeSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        recognitionSupported = false;
        return;
    }

    recognitionSupported = true;

    recognition = new SpeechRecognition();

    recognition.lang = 'ja-JP';

    recognition.interimResults = false;

    recognition.continuous = false;

    recognition.maxAlternatives = 1;


    // ---------------------------------------------------------------------
    // 音声認識結果
    // ---------------------------------------------------------------------

    recognition.onresult = function(event) {

        if (!event.results || event.results.length === 0) {
            return;
        }

        let transcript = '';

        for (let i = 0; i < event.results.length; i++) {

            if (event.results[i][0]) {
                transcript += event.results[i][0].transcript;
            }
        }

        latestTranscript = transcript.trim();

        if (latestTranscript) {
            displayRecognizedText(latestTranscript);
        }
    };


    // ---------------------------------------------------------------------
    // 音声認識エラー
    // ---------------------------------------------------------------------

    recognition.onerror = function(event) {

        console.log(
            '[SpeechRecognition ERROR]',
            event.error
        );

        if (event.error === 'no-speech') {

            if (!latestTranscript) {
                displayRecognitionFailure();
            }

            return;
        }

        if (event.error === 'aborted') {
            return;
        }

        if (!latestTranscript) {
            displayRecognitionFailure();
        }
    };


    // ---------------------------------------------------------------------
    // 音声認識終了
    // ---------------------------------------------------------------------

    recognition.onend = function() {

        console.log('[SpeechRecognition] ended');

        if (isRecording && !isStopping) {
            console.log(
                '[SpeechRecognition] ended while recording.'
            );
        }
    };
}


// =========================================================================
// 【認識結果表示】
// =========================================================================
//
// ここでは正誤判定を一切行わない。
// 赤・オレンジ・緑などによる判定も行わない。
// =========================================================================

function displayRecognizedText(text) {

    const resultElement =
        document.getElementById('pronunciation-result');

    if (!resultElement) {
        return;
    }

    const hiragana = toHiragana(text);

    resultElement.className =
        'pronunciation-result pronunciation-message';

    resultElement.textContent = hiragana;
}


// =========================================================================
// 【認識失敗表示】
// =========================================================================

function displayRecognitionFailure() {

    const resultElement =
        document.getElementById('pronunciation-result');

    if (!resultElement) {
        return;
    }

    resultElement.className =
        'pronunciation-result pronunciation-message';

    resultElement.textContent =
        '（音声を認識できませんでした）';
}


// =========================================================================
// 【録音開始】
// =========================================================================

async function startRecording() {

    if (isRecording) {
        return;
    }

    if (!recognitionSupported || !recognition) {

        displayRecognitionFailure();

        return;
    }


    isRecording = true;
    isStopping = false;

    latestTranscript = '';

    audioChunks = [];

    recordedAudioBlob = null;


    // ---------------------------------------------------------------------
    // 既存録音URLを解放
    // ---------------------------------------------------------------------

    if (recordedAudioUrl) {

        URL.revokeObjectURL(recordedAudioUrl);

        recordedAudioUrl = null;
    }


    // ---------------------------------------------------------------------
    // MediaRecorder
    // ---------------------------------------------------------------------

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        mediaRecorder =
            new MediaRecorder(stream);

        audioChunks = [];


        mediaRecorder.ondataavailable =
            function(event) {

                if (event.data && event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };


        mediaRecorder.onstop =
            function() {

                recordedAudioBlob =
                    new Blob(
                        audioChunks,
                        {
                            type: mediaRecorder.mimeType ||
                                  'audio/webm'
                        }
                    );

                recordedAudioUrl =
                    URL.createObjectURL(
                        recordedAudioBlob
                    );

                const audio =
                    document.getElementById(
                        'recorded-audio'
                    );

                if (audio) {

                    audio.src =
                        recordedAudioUrl;

                    audio.style.display =
                        'block';
                }


                // マイクを停止
                const tracks =
                    stream.getTracks();

                tracks.forEach(function(track) {
                    track.stop();
                });
            };


        mediaRecorder.start();

    } catch (error) {

        console.error(
            '[MediaRecorder ERROR]',
            error
        );

        isRecording = false;

        displayRecognitionFailure();

        return;
    }


    // ---------------------------------------------------------------------
    // SpeechRecognition開始
    // ---------------------------------------------------------------------

    try {

        recognition.start();

    } catch (error) {

        console.error(
            '[SpeechRecognition START ERROR]',
            error
        );
    }


    updateRecordingUI(true);
}


// =========================================================================
// 【録音停止】
// =========================================================================

function stopRecording() {

    if (!isRecording) {
        return;
    }

    if (isStopping) {
        return;
    }

    isStopping = true;


    // ---------------------------------------------------------------------
    // SpeechRecognition停止
    // ---------------------------------------------------------------------

    if (recognition) {

        try {
            recognition.stop();
        } catch (error) {
            console.log(
                '[SpeechRecognition STOP]',
                error
            );
        }
    }


    // ---------------------------------------------------------------------
    // MediaRecorder停止
    // ---------------------------------------------------------------------

    if (
        mediaRecorder &&
        mediaRecorder.state !== 'inactive'
    ) {

        try {
            mediaRecorder.stop();
        } catch (error) {
            console.log(
                '[MediaRecorder STOP]',
                error
            );
        }
    }


    isRecording = false;

    updateRecordingUI(false);


    // ---------------------------------------------------------------------
    // 認識結果が得られていない場合
    // ---------------------------------------------------------------------

    setTimeout(function() {

        if (!latestTranscript) {
            displayRecognitionFailure();
        }

        isStopping = false;

    }, 500);
}


// =========================================================================
// 【録音トグル】
// =========================================================================

function toggleRecording() {

    if (isRecording) {

        stopRecording();

    } else {

        startRecording();
    }
}


// =========================================================================
// 【録音UI更新】
// =========================================================================

function updateRecordingUI(recording) {

    const recordButton =
        document.getElementById('record-button');

    const stopButton =
        document.getElementById('stop-button');


    if (recordButton) {

        recordButton.classList.toggle(
            'recording-active',
            recording
        );
    }


    if (stopButton) {

        stopButton.classList.toggle(
            'recording-active',
            recording
        );
    }
}


// =========================================================================
// 【再生】
// =========================================================================

function playRecordedAudio() {

    const audio =
        document.getElementById(
            'recorded-audio'
        );

    if (!audio || !audio.src) {
        return;
    }

    audio.currentTime = 0;

    audio.play().catch(function(error) {

        console.log(
            '[Audio PLAY ERROR]',
            error
        );
    });
}


// =========================================================================
// 【自動停止設定】
// =========================================================================

function setAutoStopEnabled(enabled) {

    autoStopEnabled = Boolean(enabled);

    const autoStopCheckbox =
        document.getElementById(
            'auto-stop-checkbox'
        );

    if (autoStopCheckbox) {
        autoStopCheckbox.checked =
            autoStopEnabled;
    }
}


// =========================================================================
// 【モデル文表示】
// =========================================================================

function renderModelSentence() {

    const sentence =
        getCurrentSentence();

    const modelElement =
        document.getElementById(
            'model-sentence'
        );

    if (!modelElement) {
        return;
    }

    modelElement.innerHTML =
        sentence.displayHtml;
}


// =========================================================================
// 【意味表示】
// =========================================================================

function renderMeaning() {

    const sentence =
        getCurrentSentence();

    const meaningElement =
        document.getElementById(
            'sentence-meaning'
        );

    if (!meaningElement) {
        return;
    }

    meaningElement.textContent =
        sentence.meaning;
}


// =========================================================================
// 【結果クリア】
// =========================================================================

function clearResult() {

    const resultElement =
        document.getElementById(
            'pronunciation-result'
        );

    if (!resultElement) {
        return;
    }

    resultElement.className =
        'pronunciation-result pronunciation-message';

    resultElement.textContent = '';
}


// =========================================================================
// 【録音音声クリア】
// =========================================================================

function clearRecordedAudio() {

    const audio =
        document.getElementById(
            'recorded-audio'
        );

    if (audio) {

        audio.pause();

        audio.removeAttribute('src');

        audio.load();

        audio.style.display =
            'none';
    }


    if (recordedAudioUrl) {

        URL.revokeObjectURL(
            recordedAudioUrl
        );

        recordedAudioUrl = null;
    }


    recordedAudioBlob = null;

    audioChunks = [];
}


// =========================================================================
// 【文切り替え】
// =========================================================================

function showSentence(index) {

    if (
        index < 0 ||
        index >= modelSentences.length
    ) {
        return;
    }


    if (isRecording) {
        stopRecording();
    }


    currentSentenceIndex = index;

    latestTranscript = '';

    clearResult();

    clearRecordedAudio();

    renderModelSentence();

    renderMeaning();
}


// =========================================================================
// 【次の文】
// =========================================================================

function nextSentence() {

    const nextIndex =
        currentSentenceIndex + 1;

    if (nextIndex >= modelSentences.length) {
        return;
    }

    showSentence(nextIndex);
}


// =========================================================================
// 【前の文】
// =========================================================================

function previousSentence() {

    const previousIndex =
        currentSentenceIndex - 1;

    if (previousIndex < 0) {
        return;
    }

    showSentence(previousIndex);
}


// =========================================================================
// 【UIイベント設定】
// =========================================================================

function initializePronunciationEvents() {

    const recordButton =
        document.getElementById(
            'record-button'
        );

    if (recordButton) {

        recordButton.addEventListener(
            'click',
            toggleRecording
        );
    }


    const stopButton =
        document.getElementById(
            'stop-button'
        );

    if (stopButton) {

        stopButton.addEventListener(
            'click',
            stopRecording
        );
    }


    const playbackButton =
        document.getElementById(
            'playback-button'
        );

    if (playbackButton) {

        playbackButton.addEventListener(
            'click',
            playRecordedAudio
        );
    }


    const previousButton =
        document.getElementById(
            'previous-button'
        );

    if (previousButton) {

        previousButton.addEventListener(
            'click',
            previousSentence
        );
    }


    const nextButton =
        document.getElementById(
            'next-button'
        );

    if (nextButton) {

        nextButton.addEventListener(
            'click',
            nextSentence
        );
    }


    const autoStopCheckbox =
        document.getElementById(
            'auto-stop-checkbox'
        );

    if (autoStopCheckbox) {

        autoStopEnabled =
            autoStopCheckbox.checked;

        autoStopCheckbox.addEventListener(
            'change',
            function() {

                setAutoStopEnabled(
                    autoStopCheckbox.checked
                );
            }
        );
    }
}


// =========================================================================
// 【ページ初期化】
// =========================================================================

function initializePronunciationPage() {

    injectDynamicStyles();

    initializeSpeechRecognition();

    initializePronunciationEvents();

    renderModelSentence();

    renderMeaning();

    clearResult();

    clearRecordedAudio();
}


// =========================================================================
// 【DOMContentLoaded】
// =========================================================================

if (
    document.readyState === 'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializePronunciationPage
    );

} else {

    initializePronunciationPage();
}
