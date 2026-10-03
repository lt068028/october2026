let tokenizer = null;

// 指定された8つのモデル文
const modelSentences = [
    "てんきがいいです",
    "とけいがほしいです",
    "しごとはたのしいです",
    "べんきょうはおもしろいです",
    "時間がないですか",
    "てんきがわるいですか",
    "てんきがよくないです",
    "かさがほしいです"
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
    .sentence-label {
        font-weight: bold;
        min-width: 180px;
        font-size: 16px;
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
    ruby { ruby-align: center; }
    rt { font-size: 0.7em; color: #666; }
    .result-text {
        margin-left: 10px;
        font-size: 15px;
    }
`;
document.head.appendChild(styleElement);

// テキストにふりがなを付与する関数（tokenizer未読込時はそのまま返す）
function addRuby(text) {
    if (!text) return "";
    if (!tokenizer) return text;
    
    try {
        const tokens = tokenizer.tokenize(text);
        let resultHTML = "";

        for (const token of tokens) {
            const surface = token.surface_form;
            const reading = token.reading;

            if (reading && /[一-龯]/.test(surface)) {
                const hiraReading = reading.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
                resultHTML += `<ruby>${surface}<rt>${hiraReading}</rt></ruby>`;
            } else {
                resultHTML += surface;
            }
        }
        return resultHTML;
    } catch (e) {
        return text;
    }
}

// 画面の構築（初期化を待たずに即時実行）
function initDrill() {
    const drillList = document.getElementById('drillList');
    if (!drillList) return;
    drillList.innerHTML = "";

    modelSentences.forEach((sentence) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const sentenceSpan = document.createElement('span');
        sentenceSpan.className = 'sentence-label';
        sentenceSpan.innerHTML = addRuby(sentence);

        const listenBtn = document.createElement('button');
        listenBtn.textContent = '🔊 Listen';
        listenBtn.addEventListener('click', () => {
            const utterance = new SpeechSynthesisUtterance(sentence);
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
        resultSpan.innerHTML = '<span style="color: #888;">(Not recorded yet)</span>';

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
                        resultSpan.innerHTML = addRuby(transcript);
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
                resultSpan.innerHTML = '<span style="color: #2196F3;">Recording...</span>';

            } catch (err) {
                console.error("Mic error:", err);
                resultSpan.innerHTML = '<span style="color: red;">Mic error</span>';
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

        rowDiv.appendChild(sentenceSpan);
        rowDiv.appendChild(listenBtn);
        rowDiv.appendChild(recordBtn);
        rowDiv.appendChild(stopBtn);
        rowDiv.appendChild(resultSpan);

        drillList.appendChild(rowDiv);
    });
}

// ページ読み込み時にUIを即時生成
document.addEventListener('DOMContentLoaded', initDrill);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDrill();
}

// kuromoji の初期化（バックグラウンドで実行）
if (typeof kuromoji !== 'undefined') {
    kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/" }).build((err, t) => {
        if (!err) {
            tokenizer = t;
            console.log("Kuromoji initialized successfully.");
            initDrill(); // 辞書読込完了後に再描画してルビを反映
        } else {
            console.warn("Kuromoji dict load failed, falling back to plain text:", err);
        }
    });
}
