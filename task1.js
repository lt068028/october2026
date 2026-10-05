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
        }
    });

    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);
    controlGroup.appendChild(controlItem);

    const vocabControl = document.createElement('div');
    vocabControl.className = 'control-item';

    const labelHover = document.createElement('span');
    labelHover.id = 'labelHover';
    labelHover.className = `mode-label ${hintMode === 'hover' ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
    labelHover.innerHTML = '💬 Vocab Hint<span class="custom-tip-box">Shows word pronunciation and meaning when you hover over them.</span>';

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
    labelParen.id = 'labelParen';
    labelParen.className = `mode-label ${hintMode === 'paren' ? 'active-mode' : 'inactive-mode'} custom-tip-wrap`;
    labelParen.innerHTML = '🔡Display Vocab<span class="custom-tip-box">Always shows word\'s meaning in parentheses.</span>';

    vocabSwitchInput.addEventListener('change', (e) => {
        hintMode = e.target.checked ? 'paren' : 'hover';
        const hoverEl = document.getElementById('labelHover');
        const parenEl = document.getElementById('labelParen');
        if (hintMode === 'paren') {
            parenEl.className = 'mode-label active-mode custom-tip-wrap';
            hoverEl.className = 'mode-label inactive-mode custom-tip-wrap';
        } else {
            hoverEl.className = 'mode-label active-mode custom-tip-wrap';
            parenEl.className = 'mode-label inactive-mode custom-tip-wrap';
        }
        updateWordsDisplay();
    });

    vocabControl.appendChild(labelHover);
    vocabControl.appendChild(vocabSwitchLabel);
    vocabControl.appendChild(labelParen);
    controlGroup.appendChild(vocabControl);

    headerPanel.appendChild(titleInstructionGroup1);
    headerPanel.appendChild(controlGroup);
    container.appendChild(headerPanel);

    taskData.forEach((item, index) => {
        const currentXWord = index < 4 ? "わたし" : "ともだち";
        const currentXRomaji = index < 4 ? "watashi" : "tomodachi";
        const currentXMeaning = index < 4 ? "I" : "friend";

        const formattedX = formatWord(currentXWord, currentXRomaji, currentXMeaning);
        const formattedY = formatWord(item.y, item.yRomaji, item.yMeaning);

        createDrillRow(container, `${index + 1}.`, formattedX, formattedY, currentXWord, item.y);
    });

    const customHeaderPanel = document.createElement('div');
    customHeaderPanel.className = 'header-panel';
    customHeaderPanel.style.marginTop = "30px";

    const titleInstructionGroup2 = document.createElement('div');
    titleInstructionGroup2.className = 'title-instruction-group';

    const titleArea2 = document.createElement('span');
    titleArea2.innerHTML = "<strong>Task 2；Custom Practice</strong>";

    const descArea2 = document.createElement('span');
    descArea2.style.color = 'var(--text-primary)';
    descArea2.style.fontSize = '15px';
    descArea2.innerHTML = '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup2.appendChild(titleArea2);
    titleInstructionGroup2.appendChild(descArea2);

    customHeaderPanel.appendChild(titleInstructionGroup2);
    container.appendChild(customHeaderPanel);

    const optionsXHtml = `
        <option value="" disabled selected>-- Choose X --</option>
        <option value="ともだち" data-eng="friend">Friend</option>
        <option value="かぞく" data-eng="family">Family</option>
        <option value="どうりょう" data-eng="colleague">Colleague</option>
        <option value="じょうし" data-eng="boss">Boss</option>
        <option value="パートナー" data-eng="partner">Partner</option>
        <option value="こいびと" data-eng="Bf/Gf">Bf/Gf</option>
        <option value="しんゆう" data-eng="best friend">Best friend</option>
        <option value="こども" data-eng="child">Child</option>
        <option value="まご" data-eng="grandchild">Grandchild</option>
        <option value="きょうだい" data-eng="sibling">Sibling</option>
    `;

    const optionsYHtml = `
        <option value="" disabled selected>-- Choose Y --</option>
        <option value="がいこくじん" data-eng="foreigner">Foreigner</option>
        <option value="いしゃ" data-eng="doctor">Doctor</option>
        <option value="エンジニア" data-eng="engineer">Engineer</option>
        <option value="けんきゅうしゃ" data-eng="researcher">Researcher</option>
        <option value="デザイナー" data-eng="designer">Designer</option>
        <option value="てんいん" data-eng="store staff">Store staff</option>
        <option value="じえいぎょう" data-eng="self-employed">Self-employed</option>
        <option value="こうむいん" data-eng="civil servant">Civil servant</option>
        <option value="かんごし" data-eng="nurse">Nurse</option>
        <option value="アルバイト" data-eng="part-time worker">Part-time worker</option>
    `;

    for (let i = 1; i <= 3; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'drill-row';
        rowDiv.setAttribute('data-custom-index', i);

        const topRow = document.createElement('div');
        topRow.className = 'top-row';

        const listenBtn = document.createElement('button');
        listenBtn.className = 'example-button custom-tip-wrap';
        listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';
        listenBtn.disabled = true;

        const indexSpan = document.createElement('span');
        indexSpan.textContent = `${taskData.length + i}.`;

        const selectX = document.createElement('select');
        selectX.id = `customX_${i}`;
        selectX.className = 'custom-select';
        selectX.innerHTML = optionsXHtml;

        const previewX = document.createElement('span');
        previewX.id = `previewX_${i}`;
        previewX.className = 'translation-preview';

        const labelHa = document.createElement('span');
        labelHa.id = `labelHa_${i}`;
        labelHa.textContent = 'は';

        const selectY = document.createElement('select');
        selectY.id = `customY_${i}`;
        selectY.className = 'custom-select';
        selectY.innerHTML = optionsYHtml;

        const previewY = document.createElement('span');
        previewY.id = `previewY_${i}`;
        previewY.className = 'translation-preview';

        const recordBtn = document.createElement('button');
        recordBtn.className = 'example-button custom-tip-wrap';
        recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';
        recordBtn.disabled = true;

        const stopBtn = document.createElement('button');
        stopBtn.className = 'example-button custom-tip-wrap';
        stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
        stopBtn.disabled = true;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.textContent = '(Not recorded yet)';
        resultSpan.style.color = 'var(--text-secondary)';

        topRow.appendChild(listenBtn);
        topRow.appendChild(indexSpan);
        topRow.appendChild(selectX);
        topRow.appendChild(previewX);
        topRow.appendChild(labelHa);
        topRow.appendChild(selectY);
        topRow.appendChild(previewY);
        topRow.appendChild(recordBtn);
        topRow.appendChild(stopBtn);
        topRow.appendChild(resultSpan);

        const correctionBox = document.createElement('div');
        correctionBox.className = 'correction-box';
        
        const corrListenBtn = document.createElement('button');
        corrListenBtn.className = 'example-button';
        corrListenBtn.textContent = '🔊 きく';
        corrListenBtn.style.marginRight = '8px';

        const corrTextSpan = document.createElement('span');
        
        correctionBox.appendChild(corrListenBtn);
        correctionBox.appendChild(corrTextSpan);

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

        const updateDisplay = () => {
            const selectedOptX = selectX.options[selectX.selectedIndex];
            const selectedOptY = selectY.options[selectY.selectedIndex];

            const valX = selectX.value;
            const valY = selectY.value;

            if (valX && selectedOptX) {
                const engKey = selectedOptX.getAttribute('data-eng');
                previewX.innerHTML = formatCustomWord(valX, engKey);
            } else {
                previewX.innerHTML = "";
            }

            if (valY && selectedOptY) {
                const engKey = selectedOptY.getAttribute('data-eng');
                previewY.innerHTML = formatCustomWord(valY, engKey);
            } else {
                previewY.innerHTML = "";
            }

            if (valX) {
                labelHa.style.display = 'none';
            } else {
                labelHa.style.display = 'inline';
            }

            if (valX && valY) {
                recordBtn.disabled = false;
                listenBtn.disabled = false;
                listenBtn.onclick = () => {
                    const textToSpeak = `${valX}は、${valY}です。`;
                    playSyntheticAudio(textToSpeak, listenBtn, '🔊きく');
                };
            } else {
                recordBtn.disabled = true;
                listenBtn.disabled = true;
            }
        };

        selectX.addEventListener('change', updateDisplay);
        selectY.addEventListener('change', updateDisplay);

        const getXValue = () => selectX.value || "ともだち";
        const getYValue = () => selectY.value || "いしゃ";

        bindRecorderEvents(recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan, getXValue, getYValue);

        container.appendChild(rowDiv);
    }
}

function updateWordsDisplay() {
    const drillRows = document.querySelectorAll('.drill-row');
    drillRows.forEach(row => {
        const customIdx = row.getAttribute('data-custom-index');
        if (customIdx) {
            const selectX = document.getElementById(`customX_${customIdx}`);
            const selectY = document.getElementById(`customY_${customIdx}`);
            const previewX = document.getElementById(`previewX_${customIdx}`);
            const previewY = document.getElementById(`previewY_${customIdx}`);

            if (selectX && selectX.value && selectX.selectedIndex >= 0) {
                const optX = selectX.options[selectX.selectedIndex];
                previewX.innerHTML = formatCustomWord(selectX.value, optX.getAttribute('data-eng'));
            }
            if (selectY && selectY.value && selectY.selectedIndex >= 0) {
                const optY = selectY.options[selectY.selectedIndex];
                previewY.innerHTML = formatCustomWord(selectY.value, optY.getAttribute('data-eng'));
            }
        }
    });
}

function createDrillRow
