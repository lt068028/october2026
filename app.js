let mediaRecorder;
let audioChunks = [];
let audioStream = null;

// --- 1. スタイル設定 ---
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
    .ruby-control-container {
        display: none;
        align-items: center;
        gap: 8px;
        margin-left: 10px;
        padding-left: 10px;
        border-left: 1px solid #ccc;
    }
    ruby {
        ruby-align: center;
    }
    rt {
        font-size: 0.7em;
        color: #666;
    }
`;
document.head.appendChild(styleElement);

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

// --- 2. UI要素の構築 ---
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

// With漢字がONのときに出現する「Withふりがな / Noふりがな」コントロール
const rubyControlContainer = document.createElement('div');
rubyControlContainer.className = 'ruby-control-container';

const rubyLabelOff = document.createElement('span');
rubyLabelOff.className = 'mode-label active-mode';
rubyLabelOff.style.fontSize = '13px';
rubyLabelOff.textContent = 'Noふりがな';

const rubySwitchLabel = document.createElement('label');
rubySwitchLabel.className = 'switch';
rubySwitchLabel.style.width = '40px';
rubySwitchLabel.style.height = '22px';

const rubyToggleInput = document.createElement('input');
rubyToggleInput.type = 'checkbox';
rubyToggleInput.id = 'rubyToggleInput';

const rubySliderSpan = document.createElement('span');
rubySliderSpan.className = 'slider';
rubySwitchLabel.appendChild(rubyToggleInput);
rubySwitchLabel.appendChild(rubySliderSpan);

const rubyLabelOn = document.createElement('span');
rubyLabelOn.className = 'mode-label inactive-mode';
rubyLabelOn.style.fontSize = '13px';
rubyLabelOn.textContent = 'Withふりがな';

rubyControlContainer.appendChild(rubyLabelOff);
rubyControlContainer.appendChild(rubySwitchLabel);
rubyControlContainer.appendChild(rubyLabelOn);

controlPanel.appendChild(labelHiragana);
controlPanel.appendChild(switchLabel);
controlPanel.appendChild(labelKanji);
controlPanel.appendChild(rubyControlContainer);
document.body.insertBefore(controlPanel, recordBtn);

const statusDisplay = document.createElement('p');
statusDisplay.id = 'statusDisplay';
statusDisplay.style.fontWeight = 'bold';
statusDisplay.style.color = '#2c3e50';
statusDisplay.textContent = '待機中...';
document.body.insertBefore(statusDisplay, recordBtn);

const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

let isKanjiEnabled = false;
let isRubyEnabled = false; // デフォルトはNoふりがな（オフ）

modeToggleInput.addEventListener('change', (e) => {
    isKanjiEnabled = e.target.checked;
    if (isKanjiEnabled) {
        labelKanji.className = 'mode-label active-mode';
        labelHiragana.className = 'mode-label inactive-mode';
        rubyControlContainer.style.display = 'flex';
    } else {
        labelHiragana.className = 'mode-label active-mode';
        labelKanji.className = 'mode-label inactive-mode';
        rubyControlContainer.style.display = 'none';
    }
});

rubyToggleInput.addEventListener('change', (e) => {
    isRubyEnabled = e.target.checked;
    if (isRubyEnabled) {
        rubyLabelOn.className = 'mode-label active-mode';
        rubyLabelOff.className = 'mode-label inactive-mode';
    } else {
        rubyLabelOff.className = 'mode-label active-mode';
        rubyLabelOn.className = 'mode-label inactive-mode';
    }
});

// --- 3. 変換辞書（漢字 -> ひらがな・ルビ用） ---
const kanjiMap = {
    "私": "わたし",
    "学生": "がくせい",
    "先生": "せんせい",
    "本": "ほん",
    "机": "つくえ",
    "椅子": "いす",
    "車": "くるま",
    "部屋": "へや",
    "猫": "ねこ",
    "犬": "いぬ",
    "私達": "わたしたち",
    "今日": "きょう",
    "明日": "あした",
    "昨日": "きのう",
    "日本語": "にほんご",
    "英語": "えいご",
    "友達": "ともだち"
};

function processText(text, kanjiOn, rubyOn) {
    if (!text) return "（認識テキストなし）";

    let processed = text;

    // カタカナをひらがなに変換
    processed = processed.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    if (!kanjiOn) {
        for (const [kanji, hira] of Object.entries(kanjiMap)) {
            const regex = new RegExp(kanji, 'g');
            processed = processed.replace(regex, hira);
        }
        return processed; // [ひらがな] などの不要なラベルを排除
    } else {
        if (rubyOn) {
            for (const [kanji, hira] of Object.entries(kanjiMap)) {
                const regex = new RegExp(kanji, 'g');
                processed = processed.replace(regex, `<ruby>${kanji}<rt>${hira}</rt></ruby>`);
            }
            return processed;
        } else {
            return processed;
        }
    }
}

// --- 4. 録音および音声認識の実行（必要なときだけマイクを有効化） ---
let recognition;
let currentTranscript = "";

async function startRecording() {
    try {
        audioChunks = [];
        currentTranscript = "";
        
        // 録音開始時のみマイクストリームを取得（タブの赤い丸を点灯）
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(audioStream);

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
            const formattedHTML = processText(currentTranscript, isKanjiEnabled, isRubyEnabled);
            textSpan.innerHTML = formattedHTML;

            itemDiv.appendChild(audioElement);
            itemDiv.appendChild(textSpan);
            
            listContainer.appendChild(itemDiv);
            statusDisplay.textContent = '待機中...';
        };

        mediaRecorder.start();

        // 音声認識の開始
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'ja-JP';
            recognition.interimResults = false;
            recognition.continuous = false;

            recognition.onresult = (event) => {
                currentTranscript = event.results[0][0].transcript;
            };

            recognition.onerror = (event) => {
                console.error("音声認識エラー:", event.error);
            };

            recognition.start();
        }

        statusDisplay.textContent = "録音中...";
        recordBtn.disabled = true;
        stopBtn.disabled = false;

    } catch (error) {
        console.error("マイクの取得に失敗した。", error);
        statusDisplay.textContent = "マイクへのアクセスが拒否されたか、エラーが発生した。";
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (recognition) {
        recognition.stop();
    }

    // 録音停止時にマイクのストリームを完全に停止（タブの赤い丸を消灯）
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }

    recordBtn.disabled = false;
    stopBtn.disabled = true;
    statusDisplay.textContent = "処理中...";
}

recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
stopBtn.disabled = true;
