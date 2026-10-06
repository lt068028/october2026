// ============================================================================
// Pronunciation Drill
// 第1段階：音声認識結果の表示のみ
// ============================================================================

const modelSentences = [
    {
        targetText: "てんきがいいです",
        targetWord: "てんきが",
        symbolColor: "#fb7185",
        displayHtml: [
            { text: "て", low: false }, { type: "symbol", val: "↘" },
            { text: "んきが", low: true }, { type: "symbol", val: "｜" },
            { text: "い", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The weather is fine."
    },
    {
        targetText: "じかんがないです",
        targetWord: "じかんが",
        symbolColor: "#f43f5e",
        displayHtml: [
            { text: "じ", low: true }, { type: "symbol", val: "↗" },
            { text: "かんが", low: false }, { type: "symbol", val: "｜" },
            { text: "な", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I don't have time."
    },
    {
        targetText: "しごとがほしいです",
        targetWord: "しごとが",
        symbolColor: "#fda4af",
        displayHtml: [
            { text: "し", low: true }, { type: "symbol", val: "↗" },
            { text: "ごとが", low: false }, { type: "symbol", val: "｜" },
            { text: "ほ", low: true }, { type: "symbol", val: "↗" },
            { text: "し", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I want a job."
    },
    {
        targetText: "せんせいはおもしろいです",
        targetWord: "せんせいは",
        symbolColor: "#e879f9",
        displayHtml: [
            { text: "せ", low: true }, { type: "symbol", val: "↗" },
            { text: "んせ", low: false }, { type: "symbol", val: "↘" },
            { text: "いは", low: true }, { type: "symbol", val: "｜" },
            { text: "お", low: true }, { type: "symbol", val: "↗" },
            { text: "もしろ", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The teacher is interesting."
    },
    {
        targetText: "がっこうはたのしいです",
        targetWord: "がっこうは",
        symbolColor: "#34d399",
        displayHtml: [
            { text: "が", low: true }, { type: "symbol", val: "↗" },
            { text: "っこうは", low: false }, { type: "symbol", val: "｜" },
            { text: "た", low: true }, { type: "symbol", val: "↗" },
            { text: "のし", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "School is fun."
    }
];


// ============================================================================
// State
// ============================================================================

// 第1段階では Autostop を初期値に戻す
let isManualStop = false;

let currentSentenceIndex = 0;

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];

let recordingActive = false;
let finishingRecording = false;

let recognition = null;
let recognitionAvailable = false;

let latestTranscript = "";

let recordedAudioUrl = null;

let autostopTimer = null;


// ============================================================================
// Hiragana conversion
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g,
        ""
    );

    // Katakana → Hiragana
    cleaned = cleaned.replace(
        /[\u30a1-\u30f6]/g,
        match => String.fromCharCode(match.charCodeAt(0) - 0x60)
    );

    const dict = {
        "天気": "てんき",
        "電気": "でんき",
        "時間": "じかん",
        "仕事": "しごと",
        "欲しい": "ほしい",
        "先生": "せんせい",
        "面白い": "おもしろい",
        "学校": "がっこう",
        "楽しい": "たのしい",
        "です": "です",
        "でした": "でした"
    };

    for (const key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    return cleaned;
}


// ============================================================================
// Dynamic CSS
// ============================================================================

function injectStyles() {

    if (document.getElementById("pronunciation-drill-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "pronunciation-drill-styles";

    style.textContent = `

        /* ================================================================
           Header
           ================================================================ */

        .pronunciation-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
        }

        .pronunciation-title {
            font-size: 22px;
            font-weight: 700;
            color: var(--text-primary);
        }


        /* ================================================================
           Mode switch
           ================================================================ */

        .record-mode-container {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 13px;
            color: var(--text-secondary);
        }

        .record-mode-label {
            user-select: none;
        }

        .record-mode-switch {
            position: relative;
            display: inline-block;
            width: 42px;
            height: 22px;
        }

        .record-mode-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .record-mode-slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background: #9ca3af;
            border-radius: 999px;
            transition: 0.2s;
        }

        .record-mode-slider::before {
            content: "";
            position: absolute;
            width: 18px;
            height: 18px;
            left: 2px;
            top: 2px;
            background: white;
            border-radius: 50%;
            transition: 0.2s;
        }

        .record-mode-switch input:checked + .record-mode-slider {
            background: var(--accent-color);
        }

        .record-mode-switch input:checked + .record-mode-slider::before {
            transform: translateX(20px);
        }


        /* ================================================================
           Sentence rows
           ================================================================ */

        .pronunciation-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .pronunciation-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 10px;
            background: var(--bg-secondary);
        }

        .pronunciation-row.active {
            outline: 2px solid var(--accent-color);
        }

        .sentence-number {
            min-width: 24px;
            font-size: 13px;
            color: var(--text-secondary);
        }

        .sentence-display {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: flex-end;
            flex-wrap: wrap;
            line-height: 1.8;
            font-size: 18px;
        }

        .pitch-text {
            display: inline-flex;
            align-items: flex-end;
        }

        .high-pitch {
            border-bottom: 2px solid currentColor;
        }

        .low-pitch {
            border-bottom: 2px solid currentColor;
            opacity: 0.55;
        }

        .pitch-symbol {
            display: inline-block;
            margin: 0 3px;
            font-size: 16px;
            line-height: 1;
            color: currentColor;
            font-weight: 700;
        }

        .sentence-buttons {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }


        /* ================================================================
           Buttons
           ================================================================ */

        .pronunciation-button {
            border: none;
            border-radius: 8px;
            padding: 7px 10px;
            font-size: 14px;
            cursor: pointer;
            background: var(--button-bg, #e5e7eb);
            color: var(--text-primary);
            transition:
                opacity 0.15s,
                transform 0.1s,
                background 0.15s;
        }

        .pronunciation-button:hover:not(:disabled) {
            opacity: 0.85;
        }

        .pronunciation-button:active:not(:disabled) {
            transform: scale(0.97);
        }

        .pronunciation-button:disabled {
            opacity: 0.45;
            cursor: default;
        }

        .record-button {
            background: #fecdd3;
        }

        .stop-button {
            background: #e5e7eb;
        }

        .play-button {
            background: #dbeafe;
        }

        .listen-button {
            background: #fef3c7;
        }

        .meaning-button {
            background: #e0e7ff;
        }


        /* ================================================================
           Result
           ================================================================ */

        .result-container {
            margin-top: 10px;
            padding: 8px 10px;
            border-radius: 8px;
            background: var(--bg-primary);
        }

        .result-text {
            font-size: 15px;
            color: var(--text-primary);
            font-weight: normal !important;
            min-height: 22px;
            word-break: break-word;
        }


        /* ================================================================
           Meaning popup
           ================================================================ */

        .meaning-popup {
            position: fixed;
            z-index: 99999;
            max-width: 320px;
            padding: 10px 13px;
            border-radius: 9px;
            background: var(--bg-primary, white);
            color: var(--text-primary);
            box-shadow: 0 5px 20px rgba(0,0,0,0.18);
            border: 1px solid rgba(128,128,128,0.25);
            font-size: 14px;
            line-height: 1.5;
            display: none;
        }


        /* ================================================================
           Back link
           ================================================================ */

        .back-link-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
        }

        .back-link {
            text-decoration: none;
            color: var(--accent-color);
            font-size: 14px;
        }

    `;

    document.head.appendChild(style);
}


// ============================================================================
// Utility
// ============================================================================

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// ============================================================================
// Model sentence rendering
// ============================================================================

function renderModelSentence(sentence) {

    let html = "";

    sentence.displayHtml.forEach(item => {

        if (item.type === "symbol") {

            html += `
                <span
                    class="pitch-symbol"
                    style="color:${sentence.symbolColor};"
                >${escapeHtml(item.val)}</span>
            `;

            return;
        }

        const cls = item.low
            ? "low-pitch"
            : "high-pitch";

        html += `
            <span
                class="${cls}"
                style="color:${sentence.symbolColor};"
            >${escapeHtml(item.text)}</span>
        `;
    });

    return html;
}


// ============================================================================
// SpeechRecognition
// ============================================================================

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        recognitionAvailable = false;
        console.warn(
            "[SpeechRecognition] This browser does not support SpeechRecognition."
        );

        return;
    }

    recognitionAvailable = true;

    recognition = new SpeechRecognition();

    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;


    recognition.onstart = () => {

        console.log("[SpeechRecognition] started");

    };


    recognition.onresult = e => {

        let rawTranscript = "";

        for (
            let i = e.resultIndex;
            i < e.results.length;
            i++
        ) {

            if (e.results[i].isFinal) {

                rawTranscript +=
                    e.results[i][0].transcript;
            }
        }

        if (!rawTranscript) {
            return;
        }

        latestTranscript = rawTranscript;

        console.log(
            "[SpeechRecognition]",
            latestTranscript
        );


        // Autostop mode
        if (!isManualStop) {
            scheduleAutostop();
        }
    };


    recognition.onerror = e => {

        console.warn(
            "[SpeechRecognition] error:",
            e.error
        );

    };


    recognition.onend = () => {

        console.log("[SpeechRecognition] ended");

    };
}


// ============================================================================
// Start SpeechRecognition
// ============================================================================

function startRecognition() {

    if (!recognitionAvailable || !recognition) {
        return;
    }

    try {

        recognition.start();

    } catch (error) {

        // SpeechRecognition がすでに動作中の場合など
        console.warn(
            "[SpeechRecognition] start failed:",
            error
        );
    }
}


// ============================================================================
// Stop SpeechRecognition
// ============================================================================

function stopRecognition() {

    if (!recognitionAvailable || !recognition) {
        return;
    }

    try {

        recognition.stop();

    } catch (error) {

        console.warn(
            "[SpeechRecognition] stop failed:",
            error
        );
    }
}


// ============================================================================
// Autostop
// ============================================================================

function scheduleAutostop() {

    clearTimeout(autostopTimer);

    autostopTimer = setTimeout(() => {

        if (
            recordingActive &&
            !isManualStop &&
            mediaRecorder &&
            mediaRecorder.state === "recording"
        ) {

            console.log(
                "[Recorder] Autostop"
            );

            stopRecording();
        }

    }, 1500);
}


function clearAutostopTimer() {

    if (autostopTimer) {

        clearTimeout(autostopTimer);
        autostopTimer = null;
    }
}


// ============================================================================
// Result processing
// 第1段階では認識結果の正規化・表示だけを行う
// ============================================================================

function processTranscript(transcript, resultSpan) {

    const hiraText = convertToHiragana(transcript);

    if (!hiraText) {
        return false;
    }

    if (resultSpan) {

        resultSpan.textContent = hiraText;
        resultSpan.style.color = "var(--text-primary)";
    }

    return hiraText;
}


// ============================================================================
// Microphone
// ============================================================================

async function prepareMediaRecorder() {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        throw new Error(
            "getUserMedia is not supported."
        );
    }

    mediaStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    mediaRecorder =
        new MediaRecorder(mediaStream);

    audioChunks = [];


    mediaRecorder.ondataavailable = e => {

        if (e.data && e.data.size > 0) {
            audioChunks.push(e.data);
        }
    };


    mediaRecorder.onstop = async () => {

        recordingActive = false;

        clearAutostopTimer();

        stopRecognition();


        const audioBlob = new Blob(
            audioChunks,
            { type: "audio/webm" }
        );


        if (recordedAudioUrl) {

            URL.revokeObjectURL(
                recordedAudioUrl
            );
        }

        recordedAudioUrl =
            URL.createObjectURL(audioBlob);


        if (playRecordBtn) {
            playRecordBtn.style.display =
                "inline-flex";
        }


        // ================================================================
        // 第1段階
        //
        // SpeechRecognition 成功
        //     → ひらがな化した認識結果だけ表示
        //
        // SpeechRecognition 失敗
        //     → Could not detect your speech.
        //
        // ピッチ/F0分析は行わない
        // ================================================================

        if (latestTranscript) {

            const hiraText =
                processTranscript(
                    latestTranscript,
                    resultSpan
                );

            if (!hiraText) {

                resultSpan.textContent =
                    "Could not detect your speech.";

                resultSpan.style.color =
                    "var(--text-secondary)";
            }

        } else {

            resultSpan.textContent =
                "Could not detect your speech.";

            resultSpan.style.color =
                "var(--text-secondary)";
        }


        // マイクを解放
        if (mediaStream) {

            mediaStream.getTracks().forEach(
                track => track.stop()
            );

            mediaStream = null;
        }


        finishingRecording = false;

        updateRecordingButtons();
    };
}


// ============================================================================
// Start recording
// ============================================================================

async function startRecording() {

    if (recordingActive) {
        return;
    }

    if (finishingRecording) {
        return;
    }

    finishingRecording = true;


    try {

        latestTranscript = "";

        audioChunks = [];


        if (!mediaRecorder ||
            mediaRecorder.state === "inactive") {

            await prepareMediaRecorder();
        }


        // 新しい録音開始時には再生ボタンを隠す
        if (playRecordBtn) {
            playRecordBtn.style.display =
                "none";
        }


        // 結果表示を初期化
        if (resultSpan) {

            resultSpan.textContent =
                "(Recording...)";

            resultSpan.style.color =
                "var(--text-secondary)";
        }


        mediaRecorder.start();

        recordingActive = true;

        finishingRecording = false;

        updateRecordingButtons();


        // SpeechRecognition開始
        startRecognition();


        // Manual stopの場合は最大15秒
        if (isManualStop) {

            clearAutostopTimer();

            autostopTimer = setTimeout(() => {

                if (
                    recordingActive &&
                    mediaRecorder &&
                    mediaRecorder.state === "recording"
                ) {

                    console.log(
                        "[Recorder] Manual mode 15-second limit"
                    );

                    stopRecording();
                }

            }, 15000);
        }


    } catch (error) {

        console.error(
            "[Recorder] start error:",
            error
        );

        recordingActive = false;
        finishingRecording = false;

        stopRecognition();

        if (mediaStream) {

            mediaStream.getTracks().forEach(
                track => track.stop()
            );

            mediaStream = null;
        }

        resultSpan.textContent =
            "Mic error";

        resultSpan.style.color =
            "var(--error-text)";

        updateRecordingButtons();
    }
}


// ============================================================================
// Stop recording
// ============================================================================

function stopRecording() {

    if (!mediaRecorder) {
        return;
    }

    if (mediaRecorder.state !== "recording") {
        return;
    }

    clearAutostopTimer();

    stopRecognition();

    mediaRecorder.stop();

    updateRecordingButtons();
}


// ============================================================================
// Recording buttons
// ============================================================================

function updateRecordingButtons() {

    if (!recordBtn || !stopBtn) {
        return;
    }

    if (recordingActive) {

        recordBtn.disabled = true;
        stopBtn.disabled = false;

    } else {

        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }
}


// ============================================================================
// Play recorded audio
// ============================================================================

function playRecordedAudio() {

    if (!recordedAudioUrl) {
        return;
    }

    const audio =
        new Audio(recordedAudioUrl);

    audio.play().catch(error => {

        console.warn(
            "[Playback] failed:",
            error
        );
    });
}


// ============================================================================
// Play model sentence
// ============================================================================

function speakModelSentence(sentence) {

    if (!window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            sentence.targetText
        );

    utterance.lang = "ja-JP";
    utterance.rate = 0.7;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(
        utterance
    );
}


// ============================================================================
// Meaning popup
// ============================================================================

let meaningPopup = null;


function showMeaningPopup(button, meaning) {

    if (!meaningPopup) {

        meaningPopup =
            document.createElement("div");

        meaningPopup.className =
            "meaning-popup";

        document.body.appendChild(
            meaningPopup
        );
    }

    meaningPopup.textContent = meaning;

    meaningPopup.style.display = "block";


    const rect =
        button.getBoundingClientRect();

    const popupRect =
        meaningPopup.getBoundingClientRect();

    let left =
        rect.left;

    let top =
        rect.bottom + 8;


    if (
        left + popupRect.width >
        window.innerWidth - 10
    ) {

        left =
            window.innerWidth -
            popupRect.width -
            10;
    }

    if (
        top + popupRect.height >
        window.innerHeight - 10
    ) {

        top =
            rect.top -
            popupRect.height -
            8;
    }


    meaningPopup.style.left =
        `${Math.max(10, left)}px`;

    meaningPopup.style.top =
        `${Math.max(10, top)}px`;
}


function hideMeaningPopup() {

    if (meaningPopup) {

        meaningPopup.style.display =
            "none";
    }
}


// ============================================================================
// Sentence row
// ============================================================================

function createSentenceRow(
    sentence,
    index
) {

    const row =
        document.createElement("div");

    row.className =
        "pronunciation-row";


    const number =
        document.createElement("span");

    number.className =
        "sentence-number";

    number.textContent =
        `${index + 1}.`;


    const sentenceDisplay =
        document.createElement("div");

    sentenceDisplay.className =
        "sentence-display";

    sentenceDisplay.innerHTML =
        renderModelSentence(sentence);


    const buttons =
        document.createElement("div");

    buttons.className =
        "sentence-buttons";


    // ------------------------------------------------------------
    // 🔊 きく
    // ------------------------------------------------------------

    const listenBtn =
        document.createElement("button");

    listenBtn.type = "button";

    listenBtn.className =
        "pronunciation-button listen-button";

    listenBtn.textContent =
        "🔊 きく";

    listenBtn.addEventListener(
        "click",
        () => {

            speakModelSentence(
                sentence
            );
        }
    );


    // ------------------------------------------------------------
    // ⏺️ とる
    // ------------------------------------------------------------

    const recordButton =
        document.createElement("button");

    recordButton.type = "button";

    recordButton.className =
        "pronunciation-button record-button";

    recordButton.textContent =
        "⏺️とる";


    // ------------------------------------------------------------
    // ⏹️
    // ------------------------------------------------------------

    const stopButton =
        document.createElement("button");

    stopButton.type = "button";

    stopButton.className =
        "pronunciation-button stop-button";

    stopButton.textContent =
        "⏹️";

    stopButton.disabled = true;


    // ------------------------------------------------------------
    // ▶️
    // ------------------------------------------------------------

    const playButton =
        document.createElement("button");

    playButton.type = "button";

    playButton.className =
        "pronunciation-button play-button";

    playButton.textContent =
        "▶️";

    playButton.style.display =
        "none";


    // ------------------------------------------------------------
    // 🌐
    // ------------------------------------------------------------

    const meaningBtn =
        document.createElement("button");

    meaningBtn.type = "button";

    meaningBtn.className =
        "pronunciation-button meaning-button";

    meaningBtn.textContent =
        "🌐";


    // ------------------------------------------------------------
    // Result
    // ------------------------------------------------------------

    const resultContainer =
        document.createElement("div");

    resultContainer.className =
        "result-container";


    const result =
        document.createElement("div");

    result.className =
        "result-text";

    result.textContent =
        "(Not recorded yet)";


    resultContainer.appendChild(
        result
    );


    // ------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------

    recordButton.addEventListener(
        "click",
        async () => {

            // 他の行の結果ではなく、この行を対象にする
            currentSentenceIndex =
                index;

            // 既存録音があればURLを解放
            if (recordedAudioUrl) {

                URL.revokeObjectURL(
                    recordedAudioUrl
                );

                recordedAudioUrl = null;
            }

            // UI上の既存再生ボタンをリセット
            playButton.style.display =
                "none";

            result.textContent =
                "(Recording...)";

            result.style.color =
                "var(--text-secondary)";


            // 現在の行を active にする
            document
                .querySelectorAll(
                    ".pronunciation-row"
                )
                .forEach(
                    r => r.classList.remove(
                        "active"
                    )
                );

            row.classList.add(
                "active"
            );


            // 現在の行の録音用DOMをグローバル参照
            recordBtn = recordButton;
            stopBtn = stopButton;
            playRecordBtn = playButton;
            resultSpan = result;


            await startRecording();
        }
    );


    stopButton.addEventListener(
        "click",
        () => {

            stopRecording();
        }
    );


    playButton.addEventListener(
        "click",
        () => {

            playRecordedAudio();
        }
    );


    meaningBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            showMeaningPopup(
                meaningBtn,
                sentence.meaning
            );
        }
    );


    buttons.appendChild(
        listenBtn
    );

    buttons.appendChild(
        recordButton
    );

    buttons.appendChild(
        stopButton
    );

    buttons.appendChild(
        playButton
    );

    buttons.appendChild(
        meaningBtn
    );


    const leftArea =
        document.createElement("div");

    leftArea.style.flex = "1";
    leftArea.style.minWidth = "0";

    leftArea.appendChild(
        sentenceDisplay
    );

    leftArea.appendChild(
        resultContainer
    );


    row.appendChild(
        number
    );

    row.appendChild(
        leftArea
    );

    row.appendChild(
        buttons
    );


    return row;
}


// ============================================================================
// Global current-row controls
// ============================================================================

let recordBtn = null;
let stopBtn = null;
let playRecordBtn = null;
let resultSpan = null;


// ============================================================================
// Mode switch
// ============================================================================

function createModeSwitch() {

    const container =
        document.createElement("div");

    container.className =
        "record-mode-container";


    const label =
        document.createElement("span");

    label.className =
        "record-mode-label";

    label.textContent =
        "Autostop";


    const switchLabel =
        document.createElement("label");

    switchLabel.className =
        "record-mode-switch";


    const checkbox =
        document.createElement("input");

    checkbox.type =
        "checkbox";

    // false = Autostop
    // true  = Manual stop
    checkbox.checked =
        isManualStop;


    const slider =
        document.createElement("span");

    slider.className =
        "record-mode-slider";


    checkbox.addEventListener(
        "change",
        () => {

            isManualStop =
                checkbox.checked;

            label.textContent =
                isManualStop
                    ? "Manual stop"
                    : "Autostop";

            console.log(
                "[Recording mode]",
                isManualStop
                    ? "Manual stop"
                    : "Autostop"
            );
        }
    );


    switchLabel.appendChild(
        checkbox
    );

    switchLabel.appendChild(
        slider
    );

    container.appendChild(
        label
    );

    container.appendChild(
        switchLabel
    );


    return container;
}


// ============================================================================
// initDrill
// ============================================================================

function initDrill() {

    injectStyles();

    setupSpeechRecognition();


    // ------------------------------------------------------------
    // Root
    // ------------------------------------------------------------

    const root =
        document.getElementById(
            "pronunciation-drill"
        );


    if (!root) {

        console.error(
            "Element #pronunciation-drill was not found."
        );

        return;
    }


    root.innerHTML = "";


    // ------------------------------------------------------------
    // Back link
    // ------------------------------------------------------------

    const backContainer =
        document.createElement("div");

    backContainer.className =
        "back-link-container";


    const backLink =
        document.createElement("a");

    backLink.className =
        "back-link";

    backLink.href =
        "index.html";

    backLink.textContent =
        "← Back";


    backContainer.appendChild(
        backLink
    );

    root.appendChild(
        backContainer
    );


    // ------------------------------------------------------------
    // Header
    // ------------------------------------------------------------

    const header =
        document.createElement("div");

    header.className =
        "pronunciation-header";


    const title =
        document.createElement("div");

    title.className =
        "pronunciation-title";

    title.textContent =
        "Pronunciation Drills";


    header.appendChild(
        title
    );

    root.appendChild(
        header
    );


    // ------------------------------------------------------------
    // Recording mode
    // 初期値：Autostop
    // ------------------------------------------------------------

    root.appendChild(
        createModeSwitch()
    );


    // ------------------------------------------------------------
    // Sentence list
    // ------------------------------------------------------------

    const list =
        document.createElement("div");

    list.className =
        "pronunciation-list";


    modelSentences.forEach(
        (sentence, index) => {

            const row =
                createSentenceRow(
                    sentence,
                    index
                );

            list.appendChild(
                row
            );
        }
    );


    root.appendChild(
        list
    );


    // ------------------------------------------------------------
    // Global click
    // ------------------------------------------------------------

    document.addEventListener(
        "click",
        event => {

            if (
                meaningPopup &&
                !event.target.closest(
                    ".meaning-button"
                ) &&
                !event.target.closest(
                    ".meaning-popup"
                )
            ) {

                hideMeaningPopup();
            }
        }
    );


    console.log(
        "[Pronunciation Drill] initialized"
    );

    console.log(
        "[Recording mode] Default = Autostop"
    );
}


// ============================================================================
// DOM ready
// ============================================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initDrill
    );

} else {

    initDrill();
}
