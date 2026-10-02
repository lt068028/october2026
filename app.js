let mediaRecorder;
let audioChunks = [];
let audioStream = null;
let recognition = null;
let currentTranscript = "";

// --- 1. スタイル設定（スイッチのサイズを完全に統一） ---
const styleElement = document.createElement('style');
styleElement.textContent = `
    .controls-wrapper {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 15px;
        font-family: sans-serif;
        flex-wrap: wrap;
    }
    .control-group {
        display: flex;
        align-items: center;
        gap: 8px;
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
    ruby { ruby-align: center; }
    rt { font-size: 0.7em; color: #666; }
`;
document.head.appendChild(styleElement);

// 既存のボタン要素を取得
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');

if (recordBtn && stopBtn) {
    recordBtn.textContent = 'Record';
    stopBtn.textContent = 'Stop';
}

// --- 2. 全体のコントロール配置用ラッパー ---
const controlsWrapper = document.createElement('div');
controlsWrapper.className = 'controls-wrapper';

// 録音・停止ボタンをグループ化
const recStopGroup = document.createElement('div');
recStopGroup.style.display = 'flex';
recStopGroup.style.gap = '8px';
if (recordBtn) recStopGroup.appendChild(recordBtn);
if (stopBtn) recStopGroup.appendChild(stopBtn);
controlsWrapper.appendChild(recStopGroup);

// --- 3. ふりがな切り替えスイッチ（左：Withふりがな / 右：Noふりがな） ---
const rubyGroup = document.createElement('div');
rubyGroup.className = 'control-group';

const labelWithRuby = document.createElement('span');
labelWithRuby.className = 'mode-label active-mode'; // デフォルト左なのでアクティブ
labelWithRuby.textContent = 'Withふりがな';

const rubySwitchLabel = document.createElement('label');
rubySwitchLabel.className = 'switch';
const rubyToggleInput = document.createElement('input');
rubyToggleInput.type = 'checkbox';
rubyToggleInput.id = 'rubyToggleInput';
rubyToggleInput.checked = false; // デフォルト左 (Withふりがな)
const rubySlider = document.createElement('span');
rubySlider.className = 'slider';
rubySwitchLabel.appendChild(rubyToggleInput);
rubySwitchLabel.appendChild(rubySlider);

const labelNoRuby = document.createElement('span');
labelNoRuby.className = 'mode-label inactive-mode';
labelNoRuby.textContent = 'Noふりがな';

rubyGroup.appendChild(labelWithRuby);
rubyGroup.appendChild(rubySwitchLabel);
rubyGroup.appendChild(labelNoRuby);
controlsWrapper.appendChild(rubyGroup);

// --- 4. 自動／手動停止スイッチ（左：Auto Stop / 右：Manual Stop） ---
const stopGroup = document.createElement('div');
stopGroup.className = 'control-group';

const labelAuto = document.createElement('span');
labelAuto.className = 'mode-label active-mode'; // デフォルト左なのでアクティブ
labelAuto.textContent = 'Auto Stop';

const stopSwitchLabel = document.createElement('label');
stopSwitchLabel.className = 'switch';
const stopModeToggle = document.createElement('input');
stopModeToggle.type = 'checkbox';
stopModeToggle.id = 'stopModeToggle';
stopModeToggle.checked = false; // デフォルト左 (Auto Stop)
const stopSlider = document.createElement('span');
stopSlider.className = 'slider';
stopSwitchLabel.appendChild(stopModeToggle);
stopSwitchLabel.appendChild(stopSlider);

const labelManual = document.createElement('span');
labelManual.className = 'mode-label inactive-mode';
labelManual.textContent = 'Manual Stop';

stopGroup.appendChild(labelAuto);
stopGroup.appendChild(stopSwitchLabel);
stopGroup.appendChild(labelManual);
controlsWrapper.appendChild(stopGroup);

// 画面に配置
if (recStopGroup.parentNode === null) {
    document.body.insertBefore(controlsWrapper, document.body.firstChild);
} else {
    // 既存の親要素の先頭付近に挿入
    const refNode = recStopGroup.nextSibling || document.body.firstChild;
    document.body.insertBefore(controlsWrapper, refNode);
}

// ステータス表示
const statusDisplay = document.createElement('p');
statusDisplay.id = 'statusDisplay';
statusDisplay.style.fontWeight = 'bold';
statusDisplay.style.color = '#2c3e50';
statusDisplay.textContent = 'Ready...';
document.body.insertBefore(statusDisplay, controlsWrapper);

const listContainer = document.createElement('div');
listContainer.id = 'recordingList';
listContainer.style.marginTop = '20px';
document.body.appendChild(listContainer);

let isRubyEnabled = true; // 左側がデフォルトなのでON
let isManualStop = false; // 左側がデフォルトなのでAuto (false)

// イベント連動
rubyToggleInput.addEventListener('change', (e) => {
    isRubyEnabled = !e.target.checked; // 左(false)=With, 右(true)=No
    if (isRubyEnabled) {
        labelWithRuby.className = 'mode-label active-mode';
        labelNoRuby.className = 'mode-label inactive-mode';
    } else {
        labelNoRuby.className = 'mode-label active-mode';
        labelWithRuby.className = 'mode-label inactive-mode';
    }
});

stopModeToggle.addEventListener('change', (e) => {
    isManualStop = e.target.checked; // 左(false)=Auto, 右(true)=Manual
    if (!isManualStop) {
        labelAuto.className = 'mode-label active-mode';
        labelManual.className = 'mode-label inactive-mode';
    } else {
        labelManual.className = 'mode-label active-mode';
        labelAuto.className = 'mode-label inactive-mode';
    }
});

// --- 5. 変換辞書（漢字 -> ルビ用） ---
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

function processText(text, rubyOn) {
    if (!text) return "（No transcription）";
    let processed = text;
    if (rubyOn) {
        for (const [kanji, hira] of Object.entries(kanjiMap)) {
            const regex = new RegExp(kanji, 'g');
            processed = processed.replace(regex, `<ruby>${kanji}<rt>${hira}</rt></ruby>`);
        }
    }
    return processed;
}

// --- 6. 録音および音声認識の制御 ---
function finalizeRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

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
    const formattedHTML = processText(currentTranscript, isRubyEnabled);
    textSpan.innerHTML = formattedHTML;

    itemDiv.appendChild(audioElement);
    itemDiv.appendChild(textSpan);
    
    listContainer.appendChild(itemDiv);
    statusDisplay.textContent = 'Ready...';

    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }

    if (recordBtn) recordBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
}

async function startRecording() {
    try {
        audioChunks = [];
        currentTranscript = "";
        
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(audioStream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.start();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'ja-JP';
            recognition.interimResults = false;
            recognition.continuous = isManualStop;

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                currentTranscript = transcript;
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
            };

            recognition.onend = () => {
                if (!isManualStop) {
                    finalizeRecording();
                }
            };

            recognition.start();
        }

        statusDisplay.textContent = "Recording...";
        if (recordBtn) recordBtn.disabled = true;

        if (isManualStop) {
            if (stopBtn) stopBtn.disabled = false;
        } else {
            if (stopBtn) stopBtn.disabled = true;
        }

    } catch (error) {
        console.error("Microphone access error:", error);
        statusDisplay.textContent = "Microphone access error.";
    }
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
    }
    statusDisplay.textContent = "Processing...";
    finalizeRecording();
}

if (recordBtn) recordBtn.addEventListener('click', startRecording);
if (stopBtn) {
    stopBtn.addEventListener('click', stopRecording);
    stopBtn.disabled = true;
}
