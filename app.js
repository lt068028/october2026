let mediaRecorder;
let audioChunks = [];
let currentTranscript = "";

// --- 1. 画面のスタイル（iOS風トグルスイッチ等）の動的注入 ---
const styleElement = document.createElement('style');
styleElement.textContent = `
    .toggle-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
        font-family: sans-serif;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }
    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider {
        background-color: #2196F3;
    }
    input:checked + .slider:before {
        transform: translateX(26px);
    }
    .toggle-label {
        font-weight: bold;
        font-size: 14px;
        color: #333;
    }
`;
document.head.appendChild(styleElement);

// --- 2. UI要素の動的生成 ---
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

// トグルスイッチエリア
const controlPanel = document.createElement('div');
controlPanel.className = 'toggle-container';

const labelLeft = document.createElement('span');
labelLeft.className = 'toggle-label';
labelLeft.textContent = 'ひらがな';

const switchLabel = document.createElement('label');
switchLabel.className = 'switch';

const kanjiToggleInput = document.createElement('input');
kanjiToggleInput.type = 'checkbox';
kanjiToggleInput.id = 'kanjiToggleInput';

const sliderSpan = document.createElement('span');
sliderSpan.className = 'slider';

switchLabel.appendChild(kanjiToggleInput);
switchLabel.appendChild(sliderSpan);

const labelRight = document.createElement('span');
labelRight.className = 'toggle-label';
labelRight.textContent = '漢字ON';

controlPanel.appendChild(labelLeft);
controlPanel.appendChild(switchLabel);
controlPanel.appendChild(labelRight);
document.body.insertBefore(controlPanel, recordBtn);

// ライブ表示エリア
const currentDisplay = document.createElement('p');
currentDisplay.id = 'currentDisplay';
currentDisplay.style.fontWeight = 'bold';
currentDisplay.style.color = '#2c3e50';
currentDisplay.textContent = '待機中...';
document.body.insertBefore(currentDisplay, recordBtn);

// 過去の録音結果を蓄積するリスト用コンテナ
const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

// 漢字モードの状態管理（初期値 OFF = ひらがな）
let isKanjiEnabled = false;

kanjiToggleInput.addEventListener('change', (e) => {
    isKanjiEnabled = e.target.checked;
});

// --- 3. 音声認識のセットアップ ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let finalTranscriptCache = "";

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            finalTranscriptCache += finalTranscript;
        }

        currentTranscript = finalTranscriptCache + interimTranscript;
        
        // 録音中はモードに関わらずライブ表示
        currentDisplay.textContent = `音声認識中: ${currentTranscript}`;
    };

    recognition.onerror = (event) => {
        console.error("音声認識エラー:", event.error);
    };
} else {
    currentDisplay.textContent = "このブラウザは音声認識に対応していない。";
}

// --- 4. 録音機能のセットアップ ---
async function initRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 1件分のコンテナ作成
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '15px';
            itemDiv.style.marginBottom = '10px';
            itemDiv.style.padding = '8px';
            itemDiv.style.backgroundColor = '#fff';
            itemDiv.style.border = '1px solid #ddd';
            itemDiv.style.borderRadius = '4px';

            const audioElement = document.createElement('audio');
            audioElement.src = audioUrl;
            audioElement.controls = true;

            const textSpan = document.createElement('span');
            
            // 録音停止時にモードを判定
            let displayText = currentTranscript;
            if (!isKanjiEnabled) {
                // ひらがなモードの場合の表示ラベル・調整
                displayText = currentTranscript ? `[ひらがな] ${currentTranscript}` : "（認識テキストなし）";
            } else {
                displayText = currentTranscript ? `[漢字] ${currentTranscript}` : "（認識テキストなし）";
            }
            textSpan.textContent = displayText;

            itemDiv.appendChild(audioElement);
            itemDiv.appendChild(textSpan);
            
            listContainer.appendChild(itemDiv);
            
            audioChunks = [];
            currentTranscript = "";
            finalTranscriptCache = "";
            currentDisplay.textContent = '待機中...';
        };

        console.log("マイクの準備が完了した。");
    } catch (error) {
        console.error("マイクの初期化に失敗した。", error);
    }
}

recordBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    audioChunks = [];
    currentTranscript = "";
    finalTranscriptCache = "";
    currentDisplay.textContent = "音声認識中...";
    mediaRecorder.start();
    if (recognition) {
        recognition.start();
    }
    recordBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    if (recognition) {
        recognition.stop();
    }
    recordBtn.disabled = false;
    stopBtn.disabled = true;
});

initRecorder();
