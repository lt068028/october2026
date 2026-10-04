const modelSentences = [
    {
        targetText: "てんきがいです",
        targetWord: "てんきが",
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
        displayHtml: [
            { text: "じ", low: false }, { type: "symbol", val: "↗" },
            { text: "かんが", low: false }, { type: "symbol", val: "｜" },
            { text: "な", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I don't have time."
    },
    {
        targetText: "しごとがほしいです",
        targetWord: "しごとが",
        displayHtml: [
            { text: "し", low: false }, { type: "symbol", val: "↗" },
            { text: "ごとが", low: false }, { type: "symbol", val: "｜" },
            { text: "ほ", low: false }, { type: "symbol", val: "↗" },
            { text: "し", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I want a job."
    },
    {
        targetText: "せんせいはおもしろいです",
        targetWord: "せんせいは",
        displayHtml: [
            { text: "せ", low: false }, { type: "symbol", val: "↗" },
            { text: "んせ", low: false }, { type: "symbol", val: "↘" },
            { text: "いは", low: true }, { type: "symbol", val: "｜" },
            { text: "お", low: false }, { type: "symbol", val: "↗" },
            { text: "もしろ", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The teacher is interesting."
    },
    {
        targetText: "がっこうはたのしいです",
        targetWord: "がっこうは",
        displayHtml: [
            { text: "が", low: false }, { type: "symbol", val: "↗" },
            { text: "っこうは", low: false }, { type: "symbol", val: "｜" },
            { text: "た", low: false }, { type: "symbol", val: "↗" },
            { text: "のし", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "School is fun."
    }
];

let isManualStop = false;

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    
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
    .inactive-mode { color: var(--text-secondary); opacity: 0.5; }
    .active-mode { color: var(--accent-color); opacity: 1.0; }
    .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: var(--accent-color);
        transition: .4s;
        border-radius: 24px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider:before {
        transform: translateX(20px);
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
    /* すべてのボタンのサイズ感・枠線を完全に統一 */
    button, .play-record-btn, .meaning-btn {
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
    button:hover, .play-record-btn:hover, .meaning-btn:hover { 
        background: var(--button-hover); 
    }
    button:disabled { 
        background: var(--button-disabled-bg); 
        color: var(--button-disabled-text); 
        cursor: not-allowed; 
        border-color: var(--border-color); 
    }
    /* 特別色のボタン（🌐意味ボタン）も共通の枠線とサイズを維持しつつ背景色のみ指定 */
    .meaning-btn {
        background-color: #e0f2fe;
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
    .pitch-symbol {
        color: #2563eb;
        font-weight: normal !important;
    }
    .low-pitch {
        text-decoration: underline;
        text-decoration-color: #2563eb;
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
    /* ツールチップ（ホバー用英文）スタイル */
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
    labelAuto.className = 'mode-label active-mode';
    labelAuto.textContent = '⏹Autostop';

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
    labelManual.className = 'mode-label inactive-mode';
    labelManual.textContent = '⏹Manual stop';

    switchInput.addEventListener('change', (e) => {
        isManualStop = e.target.checked;
        if (isManualStop) {
            labelManual.className = 'mode-label active-mode';
            labelAuto.className = 'mode-label inactive-mode';
        } else {
            labelAuto.className = 'mode-label active-mode';
            labelManual.className = 'mode-label inactive-mode';
        }
    });

    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);

    headerPanel.appendChild(titleArea);
    headerPanel.appendChild(controlItem);
    drillList.appendChild(headerPanel);

    modelSentences.forEach((itemObj, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const topRow = document.createElement('div');
        topRow.className = 'top-row';

        const numberSpan = document.createElement('span');
        numberSpan.className = 'sentence-number';
        numberSpan.textContent = `${index + 1}.`;

        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'sentence-label';

        let speechText = "";

        itemObj.displayHtml.forEach(part => {
            const span = document.createElement('span');
            if (part.type === 'symbol') {
                span.className = 'pitch-symbol';
                span.textContent = part.val;
            } else {
                span.textContent = part.text;
                speechText += part.text;
                if (part.low) {
                    span.className = 'low-pitch';
                }
            }
            sentenceSpan.appendChild(span);
        });

        // 🔊 聞くボタン
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
            listenBtn.textContent = '🔊 再生中...';

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(speechText);
                utterance.lang = 'ja-JP';
                utterance.rate = 0.7;
                speechSynthesis.speak(utterance);

                utterance.onend = () => {
                    listenBtn.disabled = false;
                    listenBtn.textContent = '🔊 きく';
                };
            }, 1000);
        });

        const recordBtn = document.createElement('button');
        recordBtn.textContent = '⏺とる';

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹とめる';
        stopBtn.disabled = true;

        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = 'var(--text-secondary)';

        // ▶️ 自分の声再生ボタン
        const playRecordWrapper = document.createElement('span');
        playRecordWrapper.className = 'tooltip-wrap';
        const playRecordBtn = document.createElement('button');
        playRecordBtn.className = 'play-record-btn';
        playRecordBtn.textContent = '▶️';
        const playRecordTip = document.createElement('span');
        playRecordTip.className = 'tooltip-tip';
        playRecordTip.textContent = 'Play your recording';
        playRecordWrapper.appendChild(playRecordBtn);
        playRecordWrapper.appendChild(playRecordTip);

        resultContainer.appendChild(resultSpan);
        resultContainer.appendChild(playRecordWrapper);

        // 🌐 意味確認ボタン
        const meaningContainer = document.createElement('div');
        meaningContainer.className = 'meaning-container';

        const meaningWrapper = document.createElement('span');
        meaningWrapper.className = 'tooltip-wrap';
        const meaningBtn = document.createElement('button');
        meaningBtn.className = 'meaning-btn';
        meaningBtn.textContent = '🌐';
        const meaningTip = document.createElement('span');
        meaningTip.className = 'tooltip-tip';
        meaningTip.textContent = 'Translate sentence';
        meaningWrapper.appendChild(meaningBtn);
        meaningWrapper.appendChild(meaningTip);

        const meaningPopup = document.createElement('div');
        meaningPopup.className = 'meaning-popup';
        meaningPopup.textContent = itemObj.meaning;

        meaningBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            meaningPopup.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            meaningPopup.classList.remove('show');
        });

        meaningContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        meaningContainer.appendChild(meaningWrapper);
        meaningContainer.appendChild(meaningPopup);

        const correctionBox = document.createElement('div');
        correctionBox.className = 'correction-box';

        const corrListenBtn = document.createElement('button');
        corrListenBtn.textContent = '🔊 きく';
        corrListenBtn.style.marginRight = '8px';

        const corrTextSpan = document.createElement('span');

        correctionBox.appendChild(corrListenBtn);
        correctionBox.appendChild(corrTextSpan);

        let mediaRecorder;
        let audioChunks = [];
        let audioStream = null;
        let recognition = null;
        let recordedAudioUrl = null;

        recordBtn.addEventListener('click', async () => {
            try {
                audioChunks = [];
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(audioStream);

                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    if (recordedAudioUrl) {
                        URL.revokeObjectURL(recordedAudioUrl);
                    }
                    recordedAudioUrl = URL.createObjectURL(audioBlob);
                    playRecordBtn.style.display = 'inline-flex';
                };

                mediaRecorder.start();

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    recognition = new SpeechRecognition();
                    recognition.lang = 'ja-JP';
                    recognition.interimResults = false;
                    recognition.continuous = isManualStop;

                    recognition.onresult = (e) => {
                        let rawTranscript = "";
                        for (let i = e.resultIndex; i < e.results.length; ++i) {
                            rawTranscript += e.results[i][0].transcript;
                        }

                        if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
                            resultSpan.textContent = rawTranscript + " (Too short)";
                            resultSpan.style.color = 'var(--text-secondary)';
                            return;
                        }

                        const hiraText = convertToHiragana(rawTranscript);
                        const target = itemObj.targetText;

                        const endParticleRegex = '(?:ね|よ|よね|ですね|ですよ)*[.。!]?$';
                        const matchRegex = new RegExp(`^${target}` + endParticleRegex);

                        if (matchRegex.test(hiraText)) {
                            resultSpan.textContent = hiraText + " ✅";
                            resultSpan.style.color = 'var(--text-primary)';
                            correctionBox.style.display = 'none';
                        } else {
                            const targetCore = itemObj.targetWord;
                            if (hiraText.startsWith(targetCore)) {
                                const correctPart = targetCore;
                                const wrongPart = hiraText.slice(targetCore.length);
                                resultSpan.innerHTML = `${correctPart}<span style="color: var(--error-text);">${wrongPart}</span>`;
                            } else {
                                resultSpan.innerHTML = `<span style="color: var(--error-text);">${hiraText}</span>`;
                            }

                            corrTextSpan.textContent = `Try Again`;
                            corrListenBtn.style.display = 'inline-flex';

                            corrListenBtn.onclick = () => {
                                corrListenBtn.disabled = true;
                                corrListenBtn.textContent = '🔊 再生中...';
                                setTimeout(() => {
                                    const utterance = new SpeechSynthesisUtterance(speechText);
                                    utterance.lang = 'ja-JP';
                                    utterance.rate = 0.7;
                                    speechSynthesis.speak(utterance);
                                    utterance.onend = () => {
                                        corrListenBtn.disabled = false;
                                        corrListenBtn.textContent = '🔊 きく';
                                    };
                                }, 1000);
                            };

                            correctionBox.style.display = 'block';
                        }
                    };

                    recognition.onerror = (err) => {
                        console.error("Speech recognition error:", err);
                    };

                    recognition.onend = () => {
                        if (!isManualStop) {
                            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                                mediaRecorder.stop();
                            }
                            if (audioStream) {
                                audioStream.getTracks().forEach(track => track.stop());
                            }
                            recordBtn.disabled = false;
                            stopBtn.disabled = true;
                        }
                    };

                    recognition.start();
                }

                recordBtn.disabled = true;
                stopBtn.disabled = !isManualStop;
                resultSpan.textContent = 'Recording...';
                resultSpan.style.color = 'var(--accent-color)';
                playRecordBtn.style.display = 'none';
                correctionBox.style.display = 'none';

            } catch (err) {
                console.error("Mic error:", err);
                resultSpan.textContent = 'Mic error';
            }
        });

        stopBtn.addEventListener('click', () => {
            if (recognition) {
                recognition.stop();
            }
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
            recordBtn.disabled = false;
            stopBtn.disabled = true;
        });

        playRecordBtn.addEventListener('click', () => {
            if (recordedAudioUrl) {
                const audio = new Audio(recordedAudioUrl);
                playRecordBtn.disabled = true;
                playRecordBtn.textContent = '▶️ 再生中...';
                audio.play();
                audio.onended = () => {
                    playRecordBtn.disabled = false;
                    playRecordBtn.textContent = '▶️';
                };
            }
        });

        topRow.appendChild(numberSpan);
        topRow.appendChild(listenWrapper);
        topRow.appendChild(sentenceSpan);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultContainer);
        topRow.appendChild(meaningContainer);

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

        drillList.appendChild(rowDiv);
    });
}

document.addEventListener('DOMContentLoaded', initDrill);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDrill();
}
