const taskData = [
    { x: "わたし", y: "がくせい", hint: "student" },
    { x: "わたし", y: "せんせい", hint: "teacher" },
    { x: "わたし", y: "日本人", hint: "Japanese" },
    { x: "わたし", y: "かいしゃいん", hint: "office worker" },
    { x: "ともだち", y: "がくせい", hint: "student" },
    { x: "ともだち", y: "かいしゃいん", hint: "office worker" },
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
        min-width: 220px;
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
    .correction-box {
        display: none;
        margin-top: 6px;
        width: 100%;
        padding: 8px;
        background: #fff1f2;
        border: 1px solid #fda4af;
        border-radius: 4px;
        font-size: 14px;
        color: #be123c;
    }
`;
document.head.appendChild(styleElement);

document.addEventListener('DOMContentLoaded', () => {
    const setupExampleListen = (btnId, text) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                btn.disabled = true;
                btn.textContent = '🔊 再生中...';

                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'ja-JP';
                    speechSynthesis.speak(utterance);

                    utterance.onend = () => {
                        btn.disabled = false;
                        btn.textContent = '🔊 きく';
                    };
                }, 1000);
            });
        }
    };

    setupExampleListen('ex1Listen', "わたしは、がくせいです。");
    setupExampleListen('ex2Listen', "わたしは、せんせいじゃないです。");

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
        rowDiv.style.flexDirection = 'column';
        rowDiv.style.alignItems = 'flex-start';

        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.alignItems = 'center';
        topRow.style.gap = '12px';
        topRow.style.width = '100%';

        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt-label';
        promptSpan.textContent = `${index + 1}. ${item.x} ／${item.y}`;

        const recordBtn = document.createElement('button');
        recordBtn.textContent = '⏺とる';

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹とめる';
        stopBtn.disabled = true;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = '#888';

        topRow.appendChild(promptSpan);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

        // 誤答時の訂正ボックス（「きく」ボタン＋正しいテキスト）
        const correctionBox = document.createElement('div');
        correctionBox.className = 'correction-box';
        
        const corrListenBtn = document.createElement('button');
        corrListenBtn.textContent = '🔊 きく';
        corrListenBtn.style.marginRight = '8px';

        const corrTextSpan = document.createElement('span');
        
        correctionBox.appendChild(corrListenBtn);
        correctionBox.appendChild(corrTextSpan);

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

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

                        // 極端に短い雑音や無音を排除
                        if (transcript.replace(/[\s.,]/g, "").length < 2) {
                            resultSpan.textContent = transcript + " (Too short)";
                            resultSpan.style.color = '#666';
                            return;
                        }

                        // ひらがな正規化の簡易処理
                        let clean = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "")
                                              .replace(/私/g, "わたし")
                                              .replace(/学生/g, "がくせい")
                                              .replace(/先生/g, "せんせい")
                                              .replace(/会社員/g, "かいしゃいん")
                                              .replace(/友達/g, "ともだち");

                        const targetX = item.x;
                        const targetY = item.y;

                        // 許容パターンの判定（肯定 または 否定）
                        const isAffirmative = clean.includes(targetX) && clean.includes(targetY) && clean.includes("です") && !clean.includes("ない");
                        const isNegative = clean.includes(targetX) && clean.includes(targetY) && (clean.includes("じゃない") || clean.includes("ではありません"));

                        if (isAffirmative || isNegative) {
                            // 正解の場合：✅表示のみ、他は出さない
                            resultSpan.textContent = transcript + " ✅";
                            resultSpan.style.color = '#333';
                            correctionBox.style.display = 'none';
                        } else {
                            // 間違いの場合：テキスト表示 ＋ 訂正ボックス出現
                            resultSpan.textContent = transcript;
                            resultSpan.style.color = '#e11d48';

                            const correctSentence = `${targetX}は、${targetY}です。`;
                            corrTextSpan.textContent = `正解例: ${correctSentence}`;
                            
                            // 訂正ボックス内の「きく」ボタン設定
                            corrListenBtn.onclick = () => {
                                corrListenBtn.disabled = true;
                                corrListenBtn.textContent = '🔊 再生中...';
                                setTimeout(() => {
                                    const utterance = new SpeechSynthesisUtterance(correctSentence);
                                    utterance.lang = 'ja-JP';
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
                resultSpan.style.color = '#2196F3';
                correctionBox.style.display = 'none';

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

        container.appendChild(rowDiv);
    });
}
