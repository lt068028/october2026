// 8つのモデル文と、それぞれに対応する簡易ピッチパターン（高低の相対値: 1=低, 3=高）
const modelData = [
    { text: "てんきがいいです", pitch: [1, 3, 3, 1, 3, 1, 1] },
    { text: "とけいがほしいです", pitch: [1, 3, 1, 1, 3, 1, 1, 1] },
    { text: "しごとはたのしいです", pitch: [1, 3, 3, 1, 1, 3, 3, 3, 1] },
    { text: "べんきょうはおもしろいです", pitch: [1, 3, 3, 3, 1, 1, 3, 3, 3, 1, 1] },
    { text: "時間がないですか", pitch: [1, 3, 3, 1, 3, 1, 1, 3] },
    { text: "てんきがわるいですか", pitch: [1, 3, 3, 1, 1, 3, 1, 1, 3] },
    { text: "てんきがよくないです", pitch: [1, 3, 3, 1, 1, 3, 3, 1, 1] },
    { text: "かさがほしいです", pitch: [3, 1, 1, 3, 1, 1, 1] }
];

let isManualStop = false;

// スタイル設定
const styleElement = document.createElement('style');
styleElement.textContent = `
    .header-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 10px;
        background: #f1f5f9;
        border-radius: 6px;
        font-family: sans-serif;
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
    .inactive-mode { color: #aaa; opacity: 0.5; }
    .active-mode { color: #2196F3; opacity: 1.0; }
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
        background-color: #2196F3;
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
        padding: 10px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-family: sans-serif;
        flex-wrap: wrap;
    }
    .sentence-container {
        display: flex;
        flex-direction: column;
        min-width: 180px;
    }
    .sentence-label {
        font-weight: bold;
        font-size: 16px;
    }
    .pitch-graph {
        height: 14px;
        margin-top: 4px;
    }
    button {
        padding: 6px 12px;
        cursor: pointer;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #f8f9fa;
        font-size: 14px;
    }
    button:hover { background: #e9ecef; }
    button:disabled { background: #e2e8f0; color: #a0aec0; cursor: not-allowed; }
    .result-text {
        margin-left: 10px;
        font-size: 15px;
    }
`;
document.head.appendChild(styleElement);

// ピッチライン（SVG）を生成する関数
function createPitchSVG(pitchArray) {
    const width = 160;
    const height = 14;
    const step = width / Math.max(pitchArray.length - 1, 1);
    
    let points = "";
    pitchArray.forEach((val, i) => {
        const x = i * step;
        // val=3が上(2px)、val=1が下(12px)
        const y = val === 3 ? 2 : 12;
        points += `${x},${y} `;
    });

    return `<svg class="pitch-graph" width="${width}" height="${height}">
        <polyline fill="none" stroke="#2196F3" stroke-width="2" points="${points.trim()}" />
    </svg>`;
}

// 画面の構築
function initDrill() {
    const drillList = document.getElementById('drillList');
    if (!drillList) return;
    drillList.innerHTML = "";

    const headerPanel = document.createElement('div');
    headerPanel.className = 'header-panel';

    const titleArea = document.createElement('span');
    titleArea.innerHTML = "<strong>Pronunciation Drills</strong>";

    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';

    const modeTitle = document.createElement('span');
    modeTitle.style.fontSize = '13px';
    modeTitle.style.fontWeight = 'bold';
    modeTitle.textContent = 'Recording:';

    const labelAuto = document.createElement('span');
    labelAuto.className = 'mode-label active-mode';
    labelAuto.textContent = 'Autostop';

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
    labelManual.textContent = 'Manual stop';

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

    controlItem.appendChild(modeTitle);
    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);

    headerPanel.appendChild(titleArea);
    headerPanel.appendChild(controlItem);
    drillList.appendChild(headerPanel);

    modelData.forEach((item) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const sentenceContainer = document.createElement('div');
        sentenceContainer.className = 'sentence-container';

        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'sentence-label';
        sentenceSpan.textContent = item.text;

        const pitchContainer = document.createElement('div');
        pitchContainer.style.display = 'none'; // 初期状態は非表示
        pitchContainer.innerHTML = createPitchSVG(item.pitch);

        sentenceContainer.appendChild(sentenceSpan);
        sentenceContainer.appendChild(pitchContainer);

        const listenBtn = document.createElement('button');
        listenBtn.textContent = 'きく';
        listenBtn.addEventListener('click', () => {
            pitchContainer.style.display = 'block'; // 再生時に高低ラインを表示
            const utterance = new SpeechSynthesisUtterance(item.text);
            utterance.lang = 'ja-JP';
            speechSynthesis.speak(utterance);
        });

        const recordBtn = document.createElement('button');
        recordBtn.textContent = 'Record';

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop';
        stopBtn.disabled = true;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = '#888';

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
                        resultSpan.style.color = '#333';
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
                resultStrColor = '#2196F3';

            } catch (err) {
                console.error("Mic error:", err);
                resultSpan.textContent = 'Mic error';
                resultSpan.style.color = 'red';
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

        rowDiv.appendChild(sentenceContainer);
        rowDiv.appendChild(listenBtn);
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
