const taskData = [
    { x: "わたし", y: "がくせい", yRomaji: "gakusei", yMeaning: "student" },
    { x: "わたし", y: "せんせい", yRomaji: "sensei", yMeaning: "teacher" },
    { x: "わたし", y: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese" },
    { x: "わたし", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee" },
    { x: "ともだち", y: "がくせい", yRomaji: "gakusei", yMeaning: "student" },
    { x: "ともだち", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee" },
    { x: "ともだち", y: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American" }
];

const customDict = {
    "i": { hira: "わたし", romaji: "watashi", meaning: "I" },
    "friend": { hira: "ともだち", romaji: "tomodachi", meaning: "friend" },
    "child": { hira: "こども", romaji: "kodomo", meaning: "child" },
    "best friend": { hira: "しんゆう", romaji: "shinyuu", meaning: "best friend" },
    "colleague": { hira: "同僚", romaji: "douryou", meaning: "colleague" },
    "father": { hira: "ちち", romaji: "chichi", meaning: "father" },
    "mother": { hira: "はは", romaji: "haha", meaning: "mother" },
    "husband": { hira: "おっと", romaji: "otto", meaning: "husband" },
    "wife": { hira: "つま", romaji: "tsuma", meaning: "wife" },
    "daughter": { hira: "むすめ", romaji: "musume", meaning: "daughter" },
    "son": { hira: "むすこ", romaji: "musuko", meaning: "son" },
    "student": { hira: "がくせい", romaji: "gakusei", meaning: "student" },
    "teacher": { hira: "せんせい", romaji: "sensei", meaning: "teacher" },
    "engineer": { hira: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "company employee": { hira: "かいしゃいん", romaji: "kaishain", meaning: "company employee" },
    "doctor": { hira: "いしゃ", romaji: "isha", meaning: "doctor" },
    "nurse": { hira: "ナース", romaji: "naasu", meaning: "nurse" },
    "lawyer": { hira: "べんごし", romaji: "bengoshi", meaning: "lawyer" },
    "banker": { hira: "ぎんこういん", romaji: "ginkouin", meaning: "banker" },
    "japanese": { hira: "にほんじん", romaji: "nihonjin", meaning: "Japanese" },
    "american": { hira: "アメリカじん", romaji: "amerikajin", meaning: "American" },
    "british": { hira: "イギリスじん", romaji: "igirisujin", meaning: "British" },
    "chinese": { hira: "ちゅうごくじん", romaji: "chuugokujin", meaning: "Chinese" },
    "korean": { hira: "かんこくじん", romaji: "kankokujin", meaning: "Korean" },
    "french": { hira: "フランスじん", romaji: "furansujin", meaning: "French" },
    "german": { hira: "ドイツじん", romaji: "doitsujin", meaning: "German" },
    "car": { hira: "くるま", romaji: "kuruma", meaning: "car" },
    "book": { hira: "ほん", romaji: "hon", meaning: "book" },
    "dog": { hira: "いぬ", romaji: "inu", meaning: "dog" },
    "cat": { hira: "ねこ", romaji: "neko", meaning: "cat" },
    "coffee": { hira: "コーヒー", romaji: "koohii", meaning: "coffee" },
    "water": { hira: "みず", romaji: "mizu", meaning: "water" },
    "house": { hira: "いえ", romaji: "ie", meaning: "house" }
};

let isManualStop = false;
let hintMode = "hover";

const styleElement = document.createElement('style');
styleElement.textContent = `
    .header-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: #f1f5f9;
        border-radius: 6px;
        font-family: sans-serif;
        flex-wrap: wrap;
        gap: 12px;
    }
    .title-instruction-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
    }
    .control-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .mode-label {
        font-weight: bold;
        font-size: 13px;
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
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-family: sans-serif;
    }
    .top-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        flex-wrap: wrap;
    }
    .prompt-label {
        font-weight: bold;
        min-width: 400px;
        font-size: 16px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .target-word {
        font-weight: 700;
        color: #0f172a;
        font-size: 16px;
    }
    .custom-select {
        padding: 6px 10px;
        font-size: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #fff;
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
    .custom-tip-wrap {
        position: relative;
        display: inline-block;
        border-bottom: 1px dotted #2196F3;
        cursor: help;
    }
    .custom-tip-wrap .custom-tip-box {
        visibility: hidden;
        width: 220px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 4px;
        padding: 6px;
        position: absolute;
        z-index: 10;
        bottom: 125%;
        left: 50%;
        margin-left: -110px;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 12px;
        font-weight: normal;
        line-height: 1.4;
    }
    .custom-tip-wrap:hover .custom-tip-box {
        visibility: visible;
        opacity: 1;
    }
    .tooltip-wrap {
        position: relative;
        display: inline-block;
        border-bottom: 1px dotted #2196F3;
    }
    .tooltip-wrap .tooltip-tip {
        visibility: hidden;
        width: 90px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 4px;
        padding: 3px 0;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -45px;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 11px;
    }
    .tooltip-wrap:hover .tooltip-tip {
        visibility: visible;
        opacity: 1;
    }
`;
document.head.appendChild(styleElement);

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    
    const dict = {
        "私": "わたし",
        "私わ": "わたしは",
        "学生": "がくせい",
        "先生": "せんせい",
        "日本人": "にほんじん",
        "会社員": "かいしゃいん",
        "友達": "ともだち",
        "同僚": "どうりょう",
        "しんゆう": "しんゆう",
        "アメリカじん": "あめりかじん",
        "イギリスじん": "いぎりすじん",
        "エンジニア": "えんじにあ",
        "デス": "です",
        "デシタ": "でした",
        "じゃ無い": "じゃない",
        "ヂャナイ": "じゃない",
        "では": "では",
        "じゃ": "じゃ"
    };

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}

document.addEventListener('DOMContentLoaded', () => {
    initTask1();
});

function formatWord(word, romaji, meaning) {
    const hintStr = `${romaji}, ${meaning}`;
    if (hintMode === 'paren') {
        return `<span class="target-word">${word}</span> (${hintStr})`;
    } else {
        return `<span class="tooltip-wrap"><span class="target-word">${word}</span><span class="tooltip-tip">${hintStr}</span></span>`;
    }
}

function initTask1() {
    const exampleSection = document.getElementById('exampleSection');
    if (exampleSection) {
        const ex1X = formatWord("わたし", "watashi", "I");
        const ex1Y = formatWord("がくせい", "gakusei", "student");
        const ex2X = formatWord("わたし", "watashi", "I");
        const ex2Y = formatWord("せんせい", "sensei", "teacher");

        exampleSection.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-family: sans-serif; display: flex; flex-direction: column; gap: 8px;">
                <div>
                    <strong>Affirmative:</strong> ${ex1X} ／ ${ex1Y} 
                    <button id="ex1Listen" style="padding: 4px 8px; font-size: 13px; margin-left: 8px;">🔊 きく</button>
                    <span style="font-size: 14px; color: #334155; margin-left: 10px;">わたしは、がくせいです。(I am a student)</span>
                </div>
                <div>
                    <strong>Negative:</strong> ${ex2X} ／ ${ex2Y} 
                    <button id="ex2Listen" style="padding: 4px 8px; font-size: 13px; margin-left: 8px;">🔊 きく</button>
                    <span style="font-size: 14px; color: #334155; margin-left: 10px;">わたしは、せんせいじゃないです。(I am not a teacher)</span>
                </div>
            </div>
        `;

        setupExampleListen('ex1Listen', "わたしは、がくせいです。");
        setupExampleListen('ex2Listen', "わたしは、せんせいじゃないです。");
    }

    const container = document.getElementById('task1List');
    if (!container) return;
    container.innerHTML = "";

    // 1つ目のパネル：Task 1；Drills
    const headerPanel = document.createElement('div');
    headerPanel.className = 'header-panel';

    const titleInstructionGroup1 = document.createElement('div');
    titleInstructionGroup1.className = 'title-instruction-group';

    const titleArea1 = document.createElement('span');
    titleArea1.innerHTML = "<strong>Task 1；Drills</strong>";

    const descArea1 = document.createElement('span');
    descArea1.style.color = '#333';
    descArea1.style.fontSize = '15px'; // フォントサイズを拡大
    descArea1.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup1.appendChild(titleArea1);
    titleInstructionGroup1.appendChild(descArea1);

    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';

    // Autostop スイッチ
    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';

    const labelAuto = document.createElement('span');
    labelAuto.className = 'mode-label active-mode custom-tip-wrap';
    labelAuto.innerHTML = '⏹Autostop<span class="custom-tip-box">Automatically stops recording when you stop speaking.</span>';

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
    labelManual.className = 'mode-label inactive-mode custom-tip-wrap';
    labelManual.innerHTML = '⏹Manual stop<span class="custom-tip-box">Records continuously until you click the stop button.</span>';

    switchInput.addEventListener('change', (e) => {
        isManualStop = e.target.checked;
        if (isManualStop) {
            labelManual.className = 'mode-label active-mode custom-tip-wrap';
            labelAuto.className = 'mode-label inactive-mode custom-tip-wrap';
        } else {
            labelAuto.className = 'mode-label active-mode custom-tip-wrap';
            labelManual.className = 'mode-label inactive-mode custom-tip-wrap';
        }
    });

    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);
    controlGroup.appendChild(controlItem);

    // 🏷️ Vocab スイッチ
    const vocabControl = document.createElement('div');
    vocabControl.className = 'control-item';

    const labelHover = document.createElement('span');
    labelHover.className = `mode-label ${hintMode === 'hover' ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
    labelHover.innerHTML = '🏷️️ Vocab Hover<span class="custom-tip-box">Shows word pronunciation and meaning when you hover over them.</span>';

    const vocabSwitchLabel = document.createElement('label');
    vocabSwitchLabel.className = 'switch';
    const vocabSwitchInput = document.createElement('input');
    vocabSwitchInput.type = 'checkbox';
    vocabSwitchInput.checked = (hintMode === 'paren');
    const vocabSlider = document.createElement('span');
    vocabSlider.className = 'slider';
    vocabSwitchLabel.appendChild(vocabSwitchInput);
    vocabSwitchLabel.appendChild(vocabSlider);

    const labelParen = document.createElement('span');
    labelParen.className = `mode-label ${hintMode === 'paren' ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
    labelParen.innerHTML = '🏷️ Vocab Paren<span class="custom-tip-box">Always shows word\'s meaning in parentheses.</span>';

    vocabSwitchInput.addEventListener('change', (e) => {
        hintMode = e.target.checked ? 'paren' : 'hover';
        initTask1();
    });

    vocabControl.appendChild(labelHover);
    vocabControl.appendChild(vocabSwitchLabel);
    vocabControl.appendChild(labelParen);
    controlGroup.appendChild(vocabControl);

    headerPanel.appendChild(titleInstructionGroup1);
    headerPanel.appendChild(controlGroup);
    container.appendChild(headerPanel);

    // 既存の問題リスト
    taskData.forEach((item, index) => {
        createDrillRow(container, `${index + 1}. ${formatWord("わたし", "watashi", "I")} ／ ${formatWord(item.y, item.yRomaji, item.yMeaning)}`, "わたし", item.y);
    });

    // 2つ目のパネル：Task 2；Custom Practice
    const customHeaderPanel = document.createElement('div');
    customHeaderPanel.className = 'header-panel';
    customHeaderPanel.style.marginTop = "30px";

    const titleInstructionGroup2 = document.createElement('div');
    titleInstructionGroup2.className = 'title-instruction-group';

    const titleArea2 = document.createElement('span');
    titleArea2.innerHTML = "<strong>Task 2；Custom Practice</strong>";

    const descArea2 = document.createElement('span');
    descArea2.style.color = '#333';
    descArea2.style.fontSize = '15px'; // フォントサイズを拡大
    descArea2.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup2.appendChild(titleArea2);
    titleInstructionGroup2.appendChild(descArea2);

    customHeaderPanel.appendChild(titleInstructionGroup2);
    container.appendChild(customHeaderPanel);

    // プルダウン用のサンプル候補（3つずつ）
    const optionsX = [
        { label: "わたし (I)", value: "わたし" },
        { label: "ともだち (friend)", value: "ともだち" },
        { label: "こども (child)", value: "こども" }
    ];

    const optionsY = [
        { label: "がくせい (student)", value: "がくせい" },
        { label: "せんせい (teacher)", value: "せんせい" },
        { label: "エンジニア (engineer)", value: "エンジニア" }
    ];

    for (let i = 1; i <= 3; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';

        const topRow = document.createElement('div');
        topRow.className = 'top-row';

        const promptLabel = document.createElement('span');
        promptLabel.className = 'prompt-label';
        
        // X用プルダウンの生成
        let selectXHtml = `<select id="customX_${i}" class="custom-select">`;
        optionsX.forEach(opt => {
            selectXHtml += `<option value="${opt.value}">${opt.label}</option>`;
        });
        selectXHtml += `</select>`;

        // Y用プルダウンの生成
        let selectYHtml = `<select id="customY_${i}" class="custom-select">`;
        optionsY.forEach(opt => {
            selectYHtml += `<option value="${opt.value}">${opt.label}</option>`;
        });
        selectYHtml += `</select>`;

        promptLabel.innerHTML = `
            ${taskData.length + i}. 
            ${selectXHtml} は 
            ${selectYHtml}
        `;

        const recordBtn = document.createElement('button');
        recordBtn.textContent = '⏺とる';

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹とめる';
        stopBtn.disabled = true;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = '#888';

        topRow.appendChild(promptLabel);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

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

        const selectX = promptLabel.querySelector(`#customX_${i}`);
        const selectY = promptLabel.querySelector(`#customY_${i}`);

        const getXValue = () => selectX.value;
        const getYValue = () => selectY.value;

        bindRecorderEvents(recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan, getXValue, getYValue);

        container.appendChild(rowDiv);
    }
}

function createDrillRow(container, promptHtml, targetX, targetY) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'drill-row';

    const topRow = document.createElement('div');
    topRow.className = 'top-row';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt-label';
    promptSpan.innerHTML = promptHtml;

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

    bindRecorderEvents(recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan, () => targetX, () => targetY);

    container.appendChild(rowDiv);
}

function bindRecorderEvents(recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan, getXFn, getYFn) {
    let mediaRecorder;
    let audioChunks = [];
    let audioStream = null;
    let recognition = null;

    recordBtn.addEventListener('click', async () => {
        const currentX = getXFn();
        const currentY = getYFn();

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
                    let rawTranscript = "";
                    for (let i = e.resultIndex; i < e.results.length; ++i) {
                        rawTranscript += e.results[i][0].transcript;
                    }

                    if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
                        resultSpan.textContent = rawTranscript + " (Too short)";
                        resultSpan.style.color = '#666';
                        return;
                    }

                    const hiraText = convertToHiragana(rawTranscript);
                    const hiraX = convertToHiragana(currentX);
                    const hiraY = convertToHiragana(currentY);

                    const affPattern = `${hiraX}は${hiraY}です`;
                    const isAffirmative = (hiraText === affPattern);

                    const negPattern1 = `${hiraX}は${hiraY}じゃないです`;
                    const negPattern2 = `${hiraX}は${hiraY}ではないです`;
                    const negPattern3 = `${hiraX}は${hiraY}じゃありません`;
                    const negPattern4 = `${hiraX}は${hiraY}ではありません`;
                    const isNegative = (hiraText === negPattern1 || hiraText === negPattern2 || hiraText === negPattern3 || hiraText === negPattern4);

                    if (isAffirmative || isNegative) {
                        resultSpan.textContent = hiraText + " ✅";
                        resultSpan.style.color = '#333';
                        correctionBox.style.display = 'none';
                    } else {
                        const hasCorrectY = hiraText.includes(hiraY);

                        if (!hasCorrectY) {
                            let highlightedText = hiraText;
                            highlightedText = highlightedText.replace(new RegExp(`(${hiraX}は)(.*?)((?:です|じゃないです|ではないです|じゃありません|ではありません))`, 'g'), `$1<span style="color: #2563eb;">$2</span>$3`);
                            
                            resultSpan.innerHTML = highlightedText;
                            resultSpan.style.color = '#333';

                            corrTextSpan.textContent = `Wrong word used.`;
                            corrListenBtn.style.display = 'none';
                        } else {
                            resultSpan.textContent = hiraText;
                            resultSpan.style.color = '#e11d48';

                            corrTextSpan.textContent = `Structure error, try it again`;
                            corrListenBtn.style.display = 'inline-block';

                            const correctAff = `${currentX}は、${currentY}です。`;
                            corrListenBtn.onclick = () => {
                                corrListenBtn.disabled = true;
                                corrListenBtn.textContent = '🔊 再生中...';
                                setTimeout(() => {
                                    const utterance = new SpeechSynthesisUtterance(correctAff);
                                    utterance.lang = 'ja-JP';
                                    speechSynthesis.speak(utterance);
                                    utterance.onend = () => {
                                        corrListenBtn.disabled = false;
                                        corrListenBtn.textContent = '🔊 きく';
                                    };
                                }, 1000);
                            };
                        }

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
}

function setupExampleListen(btnId, text) {
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
}
