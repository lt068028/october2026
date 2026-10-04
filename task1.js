const modelSentences = [
    {
        // 1. て↘んきが｜い↘いです
        sentence: [
            { text: "て", low: false }, { type: "symbol", val: "↘" },
            { text: "んきが", low: true }, { type: "symbol", val: "｜" },
            { text: "い", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The weather is fine."
    },
    {
        // 2. じ↗かんが｜な↘いです
        sentence: [
            { text: "じ", low: false }, { type: "symbol", val: "↗" },
            { text: "かんが", low: false }, { type: "symbol", val: "｜" },
            { text: "な", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I don't have time."
    },
    {
        // 3. し↗ごとが｜ほ↗し↘いです
        sentence: [
            { text: "し", low: false }, { type: "symbol", val: "↗" },
            { text: "ごとが", low: false }, { type: "symbol", val: "｜" },
            { text: "ほ", low: false }, { type: "symbol", val: "↗" },
            { text: "し", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I want a job."
    },
    {
        // 4. せ↗んせ↘いは｜お↗もしろ↘いです
        sentence: [
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
        // 5. が↗っこうは｜た↗のし↘いです
        sentence: [
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

// カタカナをひらがなに変換しつつ、主要な漢字を置換するユーティリティ
function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    
    // カタカナをひらがなに変換
    cleaned = cleaned.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    const dict = {
        "天気": "てんき",
        "時間": "じかん",
        "仕事": "しごと",
        "欲しい": "ほしい",
        "先生": "せんせい",
        "学校": "がっこう",
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
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px;
        background: var(--bg-row);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-family: sans-serif;
        flex-wrap: wrap;
        position: relative;
    }
    .sentence-number {
        font-weight: bold;
        min-width: 30px;
        font-size: 16px;
        color: var(--text-secondary);
    }
    .sentence-label {
        font-weight: normal !important; /* 強制的に太字を解除 */
        min-width: 220px;
        font-size: 16px;
        color: var(--text-primary);
    }
    button {
        padding: 6px 12px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--button-bg);
        color: var(--text-primary);
        font-size: 14px;
    }
    button:hover { background: var(--button-hover); }
    button:disabled { background: var(--button-disabled-bg); color: var(--button-disabled-text); cursor: not-allowed; border-color: var(--border-color); }
    .result-text {
        margin-left: 10px;
        font-size: 15px;
        color: var(--text-primary);
        flex-grow: 1;
        font-weight: normal !important; /* 結果表示の太字も解除 */
    }
    .pitch-symbol {
        color: #2563eb;
        font-weight: normal !important;
    }
    .low-pitch {
        text-decoration: underline;
        text-decoration-color: #2563eb;
        text-decoration-thickness: 1px;
    }
    .meaning-container {
        position: relative;
        margin-left: auto;
    }
    .meaning-btn {
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        line-height: 1;
        background-color: #e0f2fe;
    }
    .meaning-btn:hover {
        opacity: 0.8;
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

        const numberSpan = document.createElement('span');
        numberSpan.className = 'sentence-number';
        numberSpan.textContent = `${index + 1}.`;

        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'sentence-label';

        let speechText = "";

        itemObj.sentence.forEach(part => {
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

        const listenBtn = document.createElement('button');
        listenBtn.textContent = '🔊 きく';

        listenBtn.addEventListener('click', () => {
            listenBtn.disabled = true;
            listenBtn.textContent = '🔊 再生中...';

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(speechText);
                utterance.lang = 'ja-JP';
                utterance.rate = 0.7; // 70%
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

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = 'var(--text-secondary)';

        const meaningContainer = document.createElement('div');
        meaningContainer.className = 'meaning-container';

        const meaningBtn = document.createElement('button');
        meaningBtn.className = 'meaning-btn';
        meaningBtn.textContent = '🌐';

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

        meaningContainer.appendChild(meaningBtn);
        meaningContainer.appendChild(meaningPopup);

        let mediaRecorder;
        let audioChunks = [];
        let audioStream = null;
        let recognition = null;

        recordBtn.addEventListener('click', async () => {
            try {
                audioChunks = [];
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(audioStream);

                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
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
                        const hiraganaTranscript = convertToHiragana(rawTranscript);
                        resultSpan.textContent = hiraganaTranscript;
                        resultSpan.style.color = 'var(--text-primary)';
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

        rowDiv.appendChild(numberSpan);
        rowDiv.appendChild(listenBtn);
        rowDiv.appendChild(sentenceSpan);
        rowDiv.appendChild(recordBtn);
        rowDiv.appendChild(stopBtn);
        rowDiv.appendChild(resultSpan);
        rowDiv.appendChild(meaningContainer);

        drillList.appendChild(rowDiv);
    });
}

document.addEventListener('DOMContentLoaded', initDrill);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDrill();
}
