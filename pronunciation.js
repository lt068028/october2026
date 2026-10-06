// ============================================================================
// Pronunciation Drill
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

let isManualStop = false;


// ============================================================================
// Hiragana conversion
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g,
        ""
    );

    cleaned = cleaned.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    const dict = {
        "天気": "てんき",
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

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    return cleaned;
}


// ============================================================================
// Dynamic CSS
// ============================================================================

const styleElement = document.createElement('style');

styleElement.textContent = `
    .header-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: var(--bg-panel);
        border-radius: 6px;
        font-family: sans-serif;
        border: 1px solid var(--border-color);
        flex-wrap: wrap;
        gap: 12px;
    }

    .control-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .mode-label {
        font-weight: bold;
        font-size: 14px;
    }

    .mode-label .emoji-gray {
        filter: grayscale(100%);
        opacity: 0.55;
    }

    .mode-label.active-mode .emoji-gray {
        filter: none;
        opacity: 1;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--button-disabled-bg);
        transition: .3s;
        border-radius: 20px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--accent-color);
    }

    input:checked + .slider:before {
        transform: translateX(16px);
    }

    .drill-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px;
        background: var(--bg-row);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-family: sans-serif;
    }

    .top-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        flex-wrap: wrap;
    }

    .sentence-number {
        font-weight: bold;
        min-width: 30px;
        font-size: 16px;
        color: var(--text-secondary);
    }

    .sentence-label {
        font-weight: normal !important;
        min-width: 220px;
        font-size: 16px;
        color: var(--text-primary);
    }

    button,
    .play-record-btn,
    .meaning-btn {
        padding: 6px 12px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--button-bg);
        color: var(--text-primary);
        font-size: 14px;
        line-height: 1.4;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    button:hover,
    .play-record-btn:hover,
    .meaning-btn:hover {
        background: var(--button-hover);
    }

    button:disabled {
        background: var(--button-disabled-bg);
        color: var(--button-disabled-text);
        cursor: not-allowed;
        border-color: var(--border-color);
    }

    /* ⏹️ 録音停止中 */
    .stop-btn-emoji {
        filter: grayscale(100%);
        opacity: 0.55;
    }

    /* ⏹️ 録音中 */
    .stop-btn-active .stop-btn-emoji {
        filter: none;
        opacity: 1;
    }

    .stop-btn-active {
        background-color: var(--rec-active-bg) !important;
        color: var(--rec-active-text) !important;
        border-color: var(--rec-active-bg) !important;
        font-weight: bold;
    }

    .play-record-btn {
        display: none;
        background-color: var(--button-bg);
    }

    .result-container {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-grow: 1;
        margin-left: 10px;
    }

    .result-text {
        font-size: 15px;
        color: var(--text-primary);
        font-weight: normal !important;
    }

    .correction-box {
        display: none;
        margin-top: 6px;
        width: 100%;
        padding: 8px;
        background: var(--error-bg);
        border: 1px solid var(--error-border);
        border-radius: 4px;
        font-size: 14px;
        color: var(--error-text);
    }

    /* 高低ピッチ */
    .high-pitch {
        text-decoration: overline;
        text-decoration-thickness: 1px;
        font-weight: normal !important;
    }

    .low-pitch {
        text-decoration: underline;
        text-decoration-thickness: 1px;
        font-weight: normal !important;
    }

    .meaning-container {
        position: relative;
        margin-left: auto;
    }

    .meaning-popup {
        display: none;
        position: absolute;
        right: 0;
        bottom: 100%;
        margin-bottom: 6px;
        background: var(--bg-panel);
        border: 1px solid var(--border-color);
        padding: 8px 12px;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        white-space: nowrap;
        font-size: 14px;
        color: var(--text-primary);
        z-index: 10;
        font-weight: normal !important;
    }

    .meaning-popup.show {
        display: block;
    }

    .tooltip-wrap {
        position: relative;
        display: inline-block;
    }

    .tooltip-wrap .tooltip-tip {
        visibility: hidden;
        background-color: var(--tooltip-bg, #333);
        color: var(--tooltip-text, #fff);
        text-align: center;
        border-radius: 4px;
        padding: 4px 8px;
        position: absolute;
        z-index: 20;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 11px;
        white-space: nowrap;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .tooltip-wrap:hover .tooltip-tip {
        visibility: visible;
        opacity: 1;
    }
`;

document.head.appendChild(styleElement);


// ============================================================================
// Drill initialization
// ============================================================================

function initDrill() {
    const drillList = document.getElementById('drillList');
    if (!drillList) return;

    drillList.innerHTML = "";

    const headerPanel = document.createElement('div');
    headerPanel.className = 'header-panel';

    const titleArea = document.createElement('span');
    titleArea.innerHTML = "<strong>Pronunciation Drills</strong>";
    titleArea.style.color = "var(--text-primary)";

    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';

    const labelAuto = document.createElement('span');
    labelAuto.className =
        'mode-label active-mode custom-tip-wrap';

    labelAuto.innerHTML =
        '<span class="emoji-gray">⏹</span>Autostop' +
        '<span class="custom-tip-box">' +
        'Automatically stops recording when you stop speaking.' +
        '</span>';

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';

    const switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    switchInput.checked = isManualStop;

    const slider = document.createElement('span');
    slider.className = 'slider';

    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(slider);

    const labelManual = document.createElement('span');
    labelManual.className =
        'mode-label inactive-mode custom-tip-wrap';

    labelManual.innerHTML =
        '<span class="emoji-gray">⏹</span>Manual stop' +
        '<span class="custom-tip-box">' +
        'Records continuously until you click the stop button.' +
        '</span>';

    switchInput.addEventListener('change', (e) => {
        isManualStop = e.target.checked;

        if (isManualStop) {
            labelManual.className =
                'mode-label active-mode custom-tip-wrap';

            labelAuto.className =
                'mode-label inactive-mode custom-tip-wrap';
        } else {
            labelAuto.className =
                'mode-label active-mode custom-tip-wrap';

            labelManual.className =
                'mode-label inactive-mode custom-tip-wrap';
        }
    });

    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);

    headerPanel.appendChild(titleArea);
    headerPanel.appendChild(controlItem);
    drillList.appendChild(headerPanel);


    // ========================================================================
    // Each sentence
    // ========================================================================

    modelSentences.forEach((itemObj, index) => {

        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const topRow = document.createElement('div');
        topRow.className = 'top-row';


        // --------------------------------------------------------------------
        // Number
        // --------------------------------------------------------------------

        const numberSpan = document.createElement('span');
        numberSpan.className = 'sentence-number';
        numberSpan.textContent = `${index + 1}.`;


        // --------------------------------------------------------------------
        // Sentence + pitch lines
        // --------------------------------------------------------------------

        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'sentence-label';

        let speechText = "";

        itemObj.displayHtml.forEach(part => {

            const span = document.createElement('span');

            if (part.type === 'symbol') {

                span.style.color = itemObj.symbolColor;
                span.textContent = part.val;

            } else {

                span.textContent = part.text;
                speechText += part.text;

                if (part.low) {
                    span.className = 'low-pitch';
                    span.style.textDecorationColor =
                        itemObj.symbolColor;
                } else {
                    span.className = 'high-pitch';
                    span.style.textDecorationColor =
                        itemObj.symbolColor;
                }
            }

            sentenceSpan.appendChild(span);
        });


        // --------------------------------------------------------------------
        // Listen
        // --------------------------------------------------------------------

        const listenWrapper = document.createElement('span');
        listenWrapper.className = 'tooltip-wrap';

        const listenBtn = document.createElement('button');
        listenBtn.textContent = '🔊 きく';

        const listenTip = document.createElement('span');
        listenTip.className = 'tooltip-tip';
        listenTip.textContent = 'Listen to model audio';

        listenWrapper.appendChild(listenBtn);
        listenWrapper.appendChild(listenTip);

        listenBtn.addEventListener('click', () => {

            listenBtn.disabled = true;
            listenBtn.textContent = '🔊Playing...';

            setTimeout(() => {

                const utterance =
                    new SpeechSynthesisUtterance(speechText);

                utterance.lang = 'ja-JP';
                utterance.rate = 0.7;

                utterance.onend = () => {
                    listenBtn.disabled = false;
                    listenBtn.textContent = '🔊 きく';
                };

                speechSynthesis.speak(utterance);

            }, 1000);
        });


        // --------------------------------------------------------------------
        // Record button
        // --------------------------------------------------------------------

        const recordBtn = document.createElement('button');

        recordBtn.className = 'custom-tip-wrap';

        recordBtn.innerHTML =
            '⏺️とる' +
            '<span class="custom-tip-box">' +
            'Start recording your voice.' +
            '</span>';


        // --------------------------------------------------------------------
        // Stop button
        // --------------------------------------------------------------------

        const stopBtn = document.createElement('button');

        stopBtn.className = 'custom-tip-wrap';

        stopBtn.innerHTML =
            '<span class="stop-btn-emoji">⏹️</span>' +
            '<span class="custom-tip-box">' +
            'Stop the active recording.' +
            '</span>';

        stopBtn.disabled = true;


        // --------------------------------------------------------------------
        // Result
        // --------------------------------------------------------------------

        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color =
            'var(--text-secondary)';


        // --------------------------------------------------------------------
        // Recorded audio playback
        // --------------------------------------------------------------------

        const playRecordWrapper =
            document.createElement('span');

        playRecordWrapper.className =
            'tooltip-wrap';

        const playRecordBtn =
            document.createElement('button');

        playRecordBtn.className =
            'play-record-btn';

        playRecordBtn.textContent = '▶️';


        const playRecordTip =
            document.createElement('span');

        playRecordTip.className =
            'tooltip-tip';

        playRecordTip.textContent =
            'Play your recording';

        playRecordWrapper.appendChild(
            playRecordBtn
        );

        playRecordWrapper.appendChild(
            playRecordTip
        );


        resultContainer.appendChild(resultSpan);
        resultContainer.appendChild(
            playRecordWrapper
        );


        // --------------------------------------------------------------------
        // Meaning
        // --------------------------------------------------------------------

        const meaningContainer =
            document.createElement('div');

        meaningContainer.className =
            'meaning-container';

        const meaningWrapper =
            document.createElement('span');

        meaningWrapper.className =
            'tooltip-wrap';

        const meaningBtn =
            document.createElement('button');

        meaningBtn.className =
            'meaning-btn';

        meaningBtn.textContent = '🌐';

        const meaningTip =
            document.createElement('span');

        meaningTip.className =
            'tooltip-tip';

        meaningTip.textContent =
            'Translate sentence';

        meaningWrapper.appendChild(
            meaningBtn
        );

        meaningWrapper.appendChild(
            meaningTip
        );


        const meaningPopup =
            document.createElement('div');

        meaningPopup.className =
            'meaning-popup';

        meaningPopup.textContent =
            itemObj.meaning;


        meaningBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            meaningPopup.classList.toggle(
                'show'
            );
        });


        document.addEventListener('click', () => {
            meaningPopup.classList.remove(
                'show'
            );
        });


        meaningContainer.addEventListener(
            'click',
            (e) => {
                e.stopPropagation();
            }
        );

        meaningContainer.appendChild(
            meaningWrapper
        );

        meaningContainer.appendChild(
            meaningPopup
        );


        // --------------------------------------------------------------------
        // Correction box
        // --------------------------------------------------------------------

        const correctionBox =
            document.createElement('div');

        correctionBox.className =
            'correction-box';


        const corrListenBtn =
            document.createElement('button');

        corrListenBtn.textContent =
            '🔊 きく';

        corrListenBtn.style.marginRight =
            '8px';


        const corrTextSpan =
            document.createElement('span');


        correctionBox.appendChild(
            corrListenBtn
        );

        correctionBox.appendChild(
            corrTextSpan
        );


        // --------------------------------------------------------------------
        // Recording variables
        // --------------------------------------------------------------------

        let mediaRecorder;
        let audioChunks = [];
        let audioStream = null;
        let recognition = null;
        let recordedAudioUrl = null;

        // Manual modeではここに最新の認識結果だけ保持する
        let latestTranscript = "";


        // ====================================================================
        // Transcript processing
        // ====================================================================

        function processTranscript(rawTranscript) {

            if (!rawTranscript) return;

            if (
                rawTranscript
                    .replace(/[\s.,]/g, "")
                    .length < 2
            ) {
                resultSpan.textContent =
                    rawTranscript + " (Too short)";

                resultSpan.style.color =
                    'var(--text-secondary)';

                return;
            }


            const hiraText =
                convertToHiragana(
                    rawTranscript
                );

            const target =
                itemObj.targetText;


            const cleanHira =
                hiraText.replace(
                    /[\s、。]/g,
                    ""
                );

            const cleanTarget =
                target.replace(
                    /[\s、。]/g,
                    ""
                );


            const endParticleRegex =
                '(?:ね|よ|よね|ですね|ですよ)*[.。!]?$';


            const matchRegex =
                new RegExp(
                    `^${cleanTarget}` +
                    endParticleRegex
                );


            if (
                matchRegex.test(cleanHira) ||
                cleanHira === cleanTarget
            ) {

                resultSpan.textContent =
                    hiraText + " ✅";

                resultSpan.style.color =
                    'var(--text-primary)';

                correctionBox.style.display =
                    'none';

            } else {

                resultSpan.textContent =
                    hiraText;

                resultSpan.style.color =
                    'var(--error-text)';

                corrTextSpan.textContent =
                    'Try Again';

                corrListenBtn.style.display =
                    'inline-flex';


                corrListenBtn.onclick = () => {

                    corrListenBtn.disabled = true;

                    corrListenBtn.textContent =
                        '🔊Playing...';


                    setTimeout(() => {

                        const utterance =
                            new SpeechSynthesisUtterance(
                                speechText
                            );

                        utterance.lang = 'ja-JP';
                        utterance.rate = 0.7;


                        utterance.onend = () => {

                            corrListenBtn.disabled =
                                false;

                            corrListenBtn.textContent =
                                '🔊 きく';
                        };


                        speechSynthesis.speak(
                            utterance
                        );

                    }, 1000);
                };


                correctionBox.style.display =
                    'block';
            }
        }


        // ====================================================================
        // Record
        // ====================================================================

        recordBtn.addEventListener(
            'click',
            async () => {

                try {

                    audioChunks = [];
                    latestTranscript = "";

                    audioStream =
                        await navigator.mediaDevices
                            .getUserMedia({
                                audio: true
                            });


                    mediaRecorder =
                        new MediaRecorder(
                            audioStream
                        );


                    mediaRecorder.ondataavailable =
                        (e) => {

                            audioChunks.push(
                                e.data
                            );
                        };


                    mediaRecorder.onstop = () => {

                        const audioBlob =
                            new Blob(
                                audioChunks,
                                {
                                    type:
                                        'audio/webm'
                                }
                            );


                        if (recordedAudioUrl) {
                            URL.revokeObjectURL(
                                recordedAudioUrl
                            );
                        }


                        recordedAudioUrl =
                            URL.createObjectURL(
                                audioBlob
                            );


                        playRecordBtn.style.display =
                            'inline-flex';
                    };


                    mediaRecorder.start();


                    const SpeechRecognition =
                        window.SpeechRecognition ||
                        window.webkitSpeechRecognition;


                    if (SpeechRecognition) {

                        recognition =
                            new SpeechRecognition();

                        recognition.lang =
                            'ja-JP';

                        recognition.interimResults =
                            false;

                        recognition.continuous =
                            isManualStop;


                        recognition.onresult =
                            (e) => {

                                let rawTranscript =
                                    "";

                                for (
                                    let i =
                                        e.resultIndex;
                                    i <
                                        e.results.length;
                                    ++i
                                ) {

                                    rawTranscript +=
                                        e.results[i][0]
                                            .transcript;
                                }


                                latestTranscript =
                                    rawTranscript;


                                // =================================================
                                // Autostop
                                // =================================================

                                if (!isManualStop) {

                                    processTranscript(
                                        latestTranscript
                                    );
                                }

                                // =================================================
                                // Manual stop
                                // =================================================
                                // ここでは表示・判定しない。
                                // ⏹️で停止した後に処理する。
                            };


                        recognition.onerror =
                            (err) => {

                                console.error(
                                    "Speech recognition error:",
                                    err
                                );
                            };


                        recognition.onend =
                            () => {

                                // =================================================
                                // Manual
                                // =================================================

                                if (isManualStop) {

                                    if (
                                        latestTranscript
                                    ) {

                                        processTranscript(
                                            latestTranscript
                                        );
                                    }


                                    if (
                                        mediaRecorder &&
                                        mediaRecorder.state !==
                                            'inactive'
                                    ) {

                                        mediaRecorder.stop();
                                    }


                                    if (audioStream) {

                                        audioStream
                                            .getTracks()
                                            .forEach(
                                                track =>
                                                    track.stop()
                                            );
                                    }


                                    recordBtn.disabled =
                                        false;

                                    stopBtn.disabled =
                                        true;

                                    stopBtn.classList.remove(
                                        'stop-btn-active'
                                    );

                                // =================================================
                                // Autostop
                                // =================================================

                                } else {

                                    if (
                                        mediaRecorder &&
                                        mediaRecorder.state !==
                                            'inactive'
                                    ) {

                                        mediaRecorder.stop();
                                    }


                                    if (audioStream) {

                                        audioStream
                                            .getTracks()
                                            .forEach(
                                                track =>
                                                    track.stop()
                                            );
                                    }


                                    recordBtn.disabled =
                                        false;

                                    stopBtn.disabled =
                                        true;

                                    stopBtn.classList.remove(
                                        'stop-btn-active'
                                    );
                                }
                            };


                        recognition.start();
                    }


                    // ------------------------------------------------------------
                    // Recording UI
                    // ------------------------------------------------------------

                    recordBtn.disabled =
                        true;


                    if (isManualStop) {

                        stopBtn.disabled =
                            false;

                        stopBtn.classList.add(
                            'stop-btn-active'
                        );

                        resultSpan.textContent =
                            'Recording (Max 15s)...';

                    } else {

                        stopBtn.disabled =
                            true;

                        stopBtn.classList.remove(
                            'stop-btn-active'
                        );

                        resultSpan.textContent =
                            'Recording...';
                    }


                    resultSpan.style.color =
                        'var(--accent-color)';


                    playRecordBtn.style.display =
                        'none';

                    correctionBox.style.display =
                        'none';


                } catch (err) {

                    console.error(
                        "Mic error:",
                        err
                    );

                    resultSpan.textContent =
                        'Mic error';

                    resultSpan.style.color =
                        'var(--error-text)';


                    recordBtn.disabled =
                        false;

                    stopBtn.disabled =
                        true;

                    stopBtn.classList.remove(
                        'stop-btn-active'
                    );
                }
            }
        );


        // ====================================================================
        // Manual stop button
        // ====================================================================

        stopBtn.addEventListener(
            'click',
            () => {

                if (recognition) {

                    try {
                        recognition.stop();
                    } catch (e) {}
                }


                if (
                    mediaRecorder &&
                    mediaRecorder.state !==
                        'inactive'
                ) {

                    mediaRecorder.stop();
                }


                if (audioStream) {

                    audioStream
                        .getTracks()
                        .forEach(
                            track =>
                                track.stop()
                        );
                }


                recordBtn.disabled =
                    false;

                stopBtn.disabled =
                    true;

                stopBtn.classList.remove(
                    'stop-btn-active'
                );


                // Manualでは認識結果の処理を
                // recognition.onend に任せる。
            }
        );


        // ====================================================================
        // Recorded audio playback
        // ====================================================================

        playRecordBtn.addEventListener(
            'click',
            () => {

                if (!recordedAudioUrl) {
                    return;
                }


                const audio =
                    new Audio(
                        recordedAudioUrl
                    );


                audio.playbackRate =
                    1.0;


                playRecordBtn.disabled =
                    true;

                // 「再生中」ではなく Playing... に統一
                playRecordBtn.textContent =
                    '▶️ Playing...';


                audio.play();


                audio.onended = () => {

                    playRecordBtn.disabled =
                        false;

                    playRecordBtn.textContent =
                        '▶️';
                };
            }
        );


        // ====================================================================
        // Row construction
        // ====================================================================

        topRow.appendChild(
            numberSpan
        );

        topRow.appendChild(
            listenWrapper
        );

        topRow.appendChild(
            sentenceSpan
        );

        topRow.appendChild(
            recordBtn
        );

        topRow.appendChild(
            stopBtn
        );

        topRow.appendChild(
            resultContainer
        );

        topRow.appendChild(
            meaningContainer
        );


        rowDiv.appendChild(
            topRow
        );

        rowDiv.appendChild(
            correctionBox
        );

        drillList.appendChild(
            rowDiv
        );
    });
}


// ============================================================================
// Initialization
// ============================================================================

document.addEventListener(
    'DOMContentLoaded',
    initDrill
);

if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
) {
    initDrill();
}
