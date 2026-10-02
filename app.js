let mediaRecorder;
let audioChunks = [];
let currentTranscript = "";

// --- 1. 画面スタイルとUIの構築 ---
const styleElement = document.createElement('style');
styleElement.textContent = `
    .mode-container {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        font-family: sans-serif;
    }
    .mode-label {
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: color 0.3s, opacity 0.3s;
    }
    .inactive-mode {
        color: #aaa;
        opacity: 0.4;
    }
    .active-mode {
        color: #2196F3;
        opacity: 1.0;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #2196F3;
        transition: .4s;
        border-radius: 28px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider:before {
        transform: translateX(22px);
    }
`;
document.head.appendChild(styleElement);

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

const controlPanel = document.createElement('div');
controlPanel.className = 'mode-container';

const labelHiragana = document.createElement('span');
labelHiragana.className = 'mode-label active-mode';
labelHiragana.textContent = 'ひらがなOnly';

const switchLabel = document.createElement('label');
switchLabel.className = 'switch';

const modeToggleInput = document.createElement('input');
modeToggleInput.type = 'checkbox';
modeToggleInput.id = 'modeToggleInput';

const sliderSpan = document.createElement('span');
sliderSpan.className = 'slider';

switchLabel.appendChild(modeToggleInput);
switchLabel.appendChild(sliderSpan);

const labelKanji = document.createElement('span');
labelKanji.className = 'mode-label inactive-mode';
labelKanji.textContent = 'With漢字';

controlPanel.appendChild(labelHiragana);
controlPanel.appendChild(switchLabel);
controlPanel.appendChild(labelKanji);
document.body.insertBefore(controlPanel, recordBtn);

const currentDisplay = document.createElement('p');
currentDisplay.id = 'currentDisplay';
currentDisplay.style.fontWeight = 'bold';
currentDisplay.style.color = '#2c3e50';
currentDisplay.textContent = '待機中...';
document.body.insertBefore(currentDisplay, recordBtn);

const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

let isKanjiEnabled = false;

modeToggleInput.addEventListener('change', (e) => {
    isKanjiEnabled = e.target.checked;
    if (isKanjiEnabled) {
        labelKanji.className = 'mode-label active-mode';
        labelHiragana.className = 'mode-label inactive-mode';
    } else {
        labelHiragana.className = 'mode-label active-mode';
        labelKanji.className = 'mode-label inactive-mode';
    }
});

// --- 2. 日本語の文字種変換（カタカナをひらがな化する処理等） ---
function convertToHiragana(text) {
    if (!text) return "";
    // カタカナをひらがなに変換する
    let converted = text.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
    // ※ブラウザが返す漢字部分については完全な辞書がないため、
    // ここで代表的な学習用表現や助詞・動詞のマッピング、または全体のクレンジングを適用できる。
    return converted;
}

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
        
        let displayStr = currentTranscript;
        if (!isKanjiEnabled) {
            displayStr = convertToHiragana(currentTranscript);
        }
        currentDisplay.textContent = `音声認識中: ${displayStr}`;
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
            let finalText = currentTranscript;
            
            if (!isKanjiEnabled) {
                finalText = convertToHiragana(currentTranscript);
                textSpan.textContent = finalText ? `[ひらがな] ${finalText}` : "（認識テキストなし）";
            } else {
                textSpan.textContent = finalText ? `[漢字] ${finalText}` : "（認識テキストなし）";
            }

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
