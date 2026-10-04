const modelSentences = [
    // 1つ目の文はHTMLタグを含めた形式で直接定義
    'て<span class="pitch-symbol">↘</span><span class="low-pitch">んきが</span><span class="pitch-symbol">｜</span>い<span class="pitch-symbol">↘</span><span class="low-pitch">です</span>',
    "とけいがほしいです",
    "しごとはたのしいです",
    "べんきょうはおもしろいです",
    "時間がないですか",
    "てんきがわるいですか",
    "てんきがよくないです",
    "かさがほしいです"
];

let isManualStop = false;

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
    }
    .sentence-label {
        font-weight: bold;
        min-width: 180px;
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
    }
    .pitch-symbol {
        color: #2563eb;
    }
    .low-pitch {
        text-decoration: underline;
        text-decoration-color: #2563eb;
        text-decoration-thickness: 1px;
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

    modelSentences.forEach((sentence, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const listenBtn = document.createElement('button');
        listenBtn.textContent = '🔊 きく';
        
        // 読み上げ用テキスト（1つ目はHTMLタグを除いた平文を指定）
        const speechText = (index === 0) ? "てんきがいいです" : sentence;

        listenBtn.addEventListener('click', () => {
            listenBtn.disabled = true;
            listenBtn.textContent = '🔊 再生中...';

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(speechText);
                utterance.lang = 'ja-JP';
                speechSynthesis.speak(utterance);

                utterance.onend = () => {
                    listenBtn.disabled = false;
                    listenBtn.textContent = '🔊 きく';
                };
            }, 1000);
        });

        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'sentence-label';

        // 1つ目はinnerHTMLでHTMLタグを反映、それ以外はtextContentで安全に出力
        if (index === 0) {
            sentenceSpan.innerHTML = sentence;
        } else {
            sentenceSpan.textContent = sentence;
        }

        const recordBtn = document.createElement('button');
        recordBtn.textContent = '⏺とる';

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹とめる';
        stopBtn.disabled = true;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = 'var(--text-secondary)';

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
                        let transcript = "";
                        for (let i = e.resultIndex; i < e.results.length; ++i) {
                            transcript += e.results[i][0].transcript;
                        }
                        resultSpan.textContent = transcript;
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
                resultSpan.style.color = 'var(--error-text)';
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

        rowDiv.appendChild(listenBtn);
        rowDiv.appendChild(sentenceSpan);
        rowDiv.appendChild(recordBtn);
        rowDiv.appendChild(stopBtn);
        rowDiv.appendChild(resultSpan);

        drillList.appendChild(rowDiv);
    });
}

document.addEventListener('DOMContentLoaded', initDrill);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDrill();
}
