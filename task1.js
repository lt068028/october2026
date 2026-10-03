const taskData = [
    { x: "わたし", y: "がくせい", hint: "Student" },
    { x: "わたし", y: "せんせい", hint: "Teacher" },
    { x: "わたし", y: "日本人", hint: "Japanese" },
    { x: "わたし", y: "かいしゃいん", hint: "Office worker" },
    { x: "ともだち", y: "がくせい", hint: "Student" },
    { x: "ともだち", y: "かいしゃいん", hint: "Office worker" },
    { x: "ともだち", y: "アメリカ人", hint: "American" }
];

let isManualStop = false;

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
    .prompt-label {
        font-weight: bold;
        min-width: 180px;
        font-size: 16px;
        color: #333;
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

// 例文の音声再生イベント設定
document.addEventListener('DOMContentLoaded', () => {
    const ex1Listen = document.getElementById('ex1Listen');
    const ex2Listen = document.getElementById('ex2Listen');

    if (ex1Listen) {
        ex1Listen.addEventListener('click', () => {
            const utterance = new SpeechSynthesisUtterance("わたしは、せいとです。");
            utterance.lang = 'ja-JP';
            speechSynthesis.speak(utterance);
        });
    }
    if (ex2Listen) {
        ex2Listen.addEventListener('click', () => {
            const utterance = new SpeechSynthesisUtterance("わたしは、せんせいじゃないです。");
            utterance.lang = 'ja-JP';
            speechSynthesis.speak(utterance);
        });
    }

    initTask1();
});

function initTask1() {
    const container = document.getElementById('task1List');
    if (!container) return;
    container.innerHTML = "";

    const headerPanel = document.createElement('div');
    headerPanel.className = 'header-panel';

    const titleArea = document.createElement('span');
    titleArea.innerHTML = "<strong>Task 1 Drills</strong>";

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
    container.appendChild(headerPanel);

    taskData.forEach((item, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt-label';
        promptSpan.textContent = `${index + 1}. ${item.x} /${item.y}`;

        const recordBtn = document.createElement('button');
        recordBtn.textContent = '⏺とる';

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹とめる';
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

                        // 肯定（〜です）または否定（〜じゃないです／ではありません）のパターン判定
                        const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
                        const targetX = item.x;
                        const targetY = item.y;
                        
                        const isAffirmative = cleanTranscript.includes(targetX) && cleanTranscript.includes(targetY) && cleanTranscript.includes("です") && !cleanTranscript.includes("ない");
                        const isNegative = cleanTranscript.includes(targetX) && cleanTranscript.includes(targetY) && (cleanTranscript.includes("じゃない") || cleanTranscript.includes("ではありません"));

                        if (isAffirmative || isNegative) {
                            resultSpan.textContent = transcript + " ✅";
                            resultSpan.style.color = '#333';
                        } else {
                            resultSpan.textContent = transcript;
                            resultSpan.style.color = '#e11d48'; // 不一致・不完全な場合は赤系
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
                resultSpan.style.color = '#2196F3';

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

        rowDiv.appendChild(promptSpan);
        rowDiv.appendChild(recordBtn);
        rowDiv.appendChild(stopBtn);
        rowDiv.appendChild(resultSpan);

        container.appendChild(rowDiv);
    });
}
