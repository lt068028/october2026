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
    "family": { hira: "かぞく", romaji: "kazoku", meaning: "family" },
    "colleague": { hira: "どうりょう", romaji: "douryou", meaning: "colleague" },
    "boss": { hira: "じょうし", romaji: "joushi", meaning: "boss" },
    "partner": { hira: "パートナー", romaji: "paatanaa", meaning: "partner" },
    "Bf/Gf": { hira: "こいびと", romaji: "koibito", meaning: "Bf/Gf" },
    "best friend": { hira: "しんゆう", romaji: "shinyuu", meaning: "best friend" },
    "child": { hira: "こども", romaji: "kodomo", meaning: "child" },
    "grandchild": { hira: "まご", romaji: "mago", meaning: "grandchild" },
    "sibling": { hira: "きょうだい", romaji: "kyoudai", meaning: "sibling" },
    "foreigner": { hira: "がいこくじん", romaji: "gaikokujin", meaning: "foreigner" },
    "doctor": { hira: "いしゃ", romaji: "isha", meaning: "doctor" },
    "engineer": { hira: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "researcher": { hira: "けんきゅうしゃ", romaji: "kenkyuusha", meaning: "researcher" },
    "designer": { hira: "デザイナー", romaji: "dezainaa", meaning: "designer" },
    "store staff": { hira: "てんいん", romaji: "tenin", meaning: "store staff" },
    "self-employed": { hira: "じえいぎょう", romaji: "jiei-gyou", meaning: "self-employed" },
    "civil servant": { hira: "こうむいん", romaji: "koumuin", meaning: "civil servant" },
    "nurse": { hira: "かんごし", romaji: "kangoshi", meaning: "nurse" },
    "part-time worker": { hira: "アルバイト", romaji: "arubaito", meaning: "part-time worker" }
};

let isManualStop = false;
let hintMode = "hover";

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    
    const dict = {
        "私": "わたし",
        "学生": "がくせい",
        "先生": "せんせい",
        "日本人": "にほんじん",
        "会社員": "かいしゃいん",
        "友達": "ともだち",
        "家族": "かぞく",
        "同僚": "どうりょう",
        "上司": "じょうし",
        "パートナー": "パートナー",
        "恋人": "こいびと",
        "親友": "しんゆう",
        "子供": "こども",
        "子ども": "こども",
        "孫": "まご",
        "兄弟": "きょうだい",
        "外国人": "がいこくじん",
        "医師": "いしゃ",
        "医者": "いしゃ",
        "エンジニア": "エンジニア",
        "研究者": "けんきゅうしゃ",
        "デザイナー": "デザイナー",
        "店員": "てんいん",
        "自営業": "じえいぎょう",
        "こうむいん": "こうむいん",
        "公務員": "こうむいん",
        "看護師": "かんごし",
        "看護婦": "かんごし",
        "アルバイト": "アルバイト",
        "です": "です",
        "でした": "でした",
        "じゃないです": "じゃないです",
        "ではないです": "ではないです",
        "じゃありません": "じゃありません",
        "ではありません": "ではありません"
    };

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function formatWord(word, romaji, meaning) {
    const hintStr = `${romaji}, ${meaning}`;
    if (hintMode === 'paren') {
        return `<span class="target-word">${word}</span> (${hintStr})`;
    } else {
        return `<span class="tooltip-wrap"><span class="target-word">${word}</span><span class="tooltip-tip">${hintStr}</span></span>`;
    }
}

function formatCustomWord(hira, engKey) {
    const entry = customDict[engKey];
    if (!entry) return hira;
    return formatWord(hira, entry.romaji, entry.meaning);
}

function initApp() {
    const exampleSection = document.getElementById('exampleSection');
    if (exampleSection) {
        const ex1X = formatWord("わたし", "watashi", "I");
        const ex1Y = formatWord("がくせい", "gakusei", "student");
        const ex2X = formatWord("わたし", "watashi", "I");
        const ex2Y = formatWord("せんせい", "sensei", "teacher");

        exampleSection.className = "example-box";

        exampleSection.innerHTML = `
            <div class="example-row">
                <strong>Affirmative:</strong> ${ex1X} ／ ${ex1Y} 
                <button id="ex1Listen" class="example-button">🔊 きく</button>
                <span class="example-desc">わたしは、がくせいです。(I am a student)</span>
            </div>
            <div class="example-row">
                <strong>Negative:</strong> ${ex2X} ／ ${ex2Y} 
                <button id="ex2Listen" class="example-button">🔊 きく</button>
                <span class="example-desc">わたしは、せんせいじゃないです。(I am not a teacher)</span>
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

    const titleInstructionGroup1 = document.createElement('div');
    titleInstructionGroup1.className = 'title-instruction-group';

    const titleArea1 = document.createElement('span');
    titleArea1.innerHTML = "<strong>Task 1；Drills</strong>";

    const descArea1 = document.createElement('span');
    descArea1.style.color = 'var(--text-primary)';
    descArea1.style.fontSize = '15px';
    descArea1.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup1.appendChild(titleArea1);
    titleInstructionGroup1.appendChild(descArea1);

    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';

    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';

    const labelAuto = document.createElement('span');
    labelAuto.id = 'labelAuto';
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
    labelManual.id = 'labelManual';
    labelManual.className = `mode-label ${isManualStop ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
    labelManual.innerHTML = '⏹Manual stop<span class="custom-tip-box">Records continuously until you click the stop button.</span>';

    switchInput.addEventListener('change', (e) => {
        isManualStop = e.target.checked;
        const autoEl = document.getElementById('labelAuto');
        const manualEl = document.getElementById('labelManual');
        if (isManualStop) {
            manualEl.className = 'mode-label active-mode custom-tip-wrap';
            autoEl.className = 'mode-label inactive-mode custom-tip-wrap';
        } else {
            autoEl.className = 'mode-label active-mode custom-tip-wrap';
            manualEl.className = 'mode-label inactive-mode custom-tip-wrap';
