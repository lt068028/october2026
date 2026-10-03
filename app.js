// 英語プロンプトと期待される日本語のデータセット
const drillData = [
    { en: "It's a nice day.", jp: "てんきがいいです" },
    { en: "I want a watch.", jp: "とけいがほしいです" },
    { en: "Work is fun.", jp: "しごとはたのしいです" },
    { en: "Studying is interesting.", jp: "べんきょうはおもしろいです" },
    { en: "Don't you have time?", jp: "時間がないですか" },
    { en: "Is the weather bad?", jp: "てんきがわるいですか" },
    { en: "The weather is not good.", jp: "てんきがよくないです" },
    { en: "I want an umbrella.", jp: "かさがほしいです" }
];

// スタイル設定
const styleElement = document.createElement('style');
styleElement.textContent = `
    .drill-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
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
`;
document.head.appendChild(styleElement);

// 画面の構築
function initCompositionDrill() {
    const container = document.getElementById('compositionList');
    if (!container) return;
    container.innerHTML = "";

    drillData.forEach((item) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        // 英語プロンプト表示
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt-label';
        promptSpan.textContent = item.en;

        // 録音開始ボタン
        const recordBtn = document.createElement('button');
        recordBtn.textContent = 'Record';

        // 録音停止ボタン
        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop';
        stopBtn.disabled = true;

        // 結果表示エリア
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
                    recognition.continuous = false;

                    recognition.onresult = (e) => {
                        const transcript = e.results[0][0].transcript;
                        resultSpan.textContent = transcript;
                        resultSpan.style.color = '#333';
                    };

                    recognition.onerror = (err) => {
                        console.error("Speech recognition error:", err);
                    };

                    recognition.onend = () => {
                        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                            mediaRecorder.stop();
                        }
                        if (audioStream) {
                            audioStream.getTracks().forEach(track => track.stop());
                        }
                        recordBtn.disabled = false;
                        stopBtn.disabled = true;
                    };

                    recognition.start();
                }

                recordBtn.disabled = true;
                stopBtn.disabled = false;
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

// 即時実行
document.addEventListener('DOMContentLoaded', initCompositionDrill);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initCompositionDrill();
}
