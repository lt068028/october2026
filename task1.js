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
    // 代名詞・人物
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
    
    // 職業
    "student": { hira: "がくせい", romaji: "gakusei", meaning: "student" },
    "teacher": { hira: "せんせい", romaji: "sensei", meaning: "teacher" },
    "engineer": { hira: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "company employee": { hira: "かいしゃいん", romaji: "kaishain", meaning: "company employee" },
    "doctor": { hira: "いしゃ", romaji: "isha", meaning: "doctor" },
    "nurse": { hira: "ナース", romaji: "naasu", meaning: "nurse" },
    "lawyer": { hira: "べんごし", romaji: "bengoshi", meaning: "lawyer" },
    "banker": { hira: "ぎんこういん", romaji: "ginkouin", meaning: "banker" },
    
    // 国籍・人
    "japanese": { hira: "にほんじん", romaji: "nihonjin", meaning: "Japanese" },
    "american": { hira: "アメリカじん", romaji: "amerikajin", meaning: "American" },
    "british": { hira: "イギリスじん", romaji: "igirisujin", meaning: "British" },
    "chinese": { hira: "ちゅうごくじん", romaji: "chuugokujin", meaning: "Chinese" },
    "korean": { hira: "かんこくじん", romaji: "kankokujin", meaning: "Korean" },
    "french": { hira: "フランスじん", romaji: "furansujin", meaning: "French" },
    "german": { hira: "ドイツじん", romaji: "doitsujin", meaning: "German" },
    
    // 一般名詞
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
        align-items: flex-start;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: #f1f5f9;
        border-radius: 6px;
        font-family: sans-serif;
        flex-wrap: wrap;
        gap: 12px;
    }
    .panel-style {
        background-color: #e8f4fd;
        border-left: 4px solid #2196f3;
        padding: 12px 16px;
        border-radius: 0 4px 4px 0;
        color: #333;
        font-size: 14px;
        margin-top: 8px;
        width: 100%;
        box-sizing: border-box;
    }
    .title-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 300px;
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
        min-width: 340px;
        font-size: 16px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .target-word {
        font-weight: bold;
        color: #0f172a;
    }
    .custom-input {
        padding: 4px 8px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 110px;
    }
    .translation-preview {
        font-size: 12px;
        color: #64748b;
        font-weight: normal;
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
        box-sizing: border-box;
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

    const headerPanel = document.createElement('div');
    headerPanel.className = 'header-panel';

    // パネルスタイル適用（Task 1）
    const titleGroup = document.createElement('div');
    titleGroup.className = 'title-group';

    const titleArea = document.createElement('span');
    titleArea.innerHTML = "<strong>Task 1 Drills</strong>";
    titleArea.style.fontSize = "1.1em";

    const descArea1 = document.createElement('div');
    descArea1.className = 'panel-style';
    descArea1.innerHTML = '💡 提示された単語に基づき、「XはYです」（肯定文）または「XはYじゃないです」（否定文）を作成し発声せよ。';

    titleGroup.appendChild(titleArea);
    titleGroup.appendChild(descArea1);

    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';

    // Autostop スイッチ
    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';

    const labelAuto = document.createElement('span');
    labelAuto.className = `mode-label ${!isManualStop ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
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
    labelManual.className = `mode-label ${isManualStop ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
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
