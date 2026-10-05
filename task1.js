const taskData = [
    { x: "わたし", y: "がくせい", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "わたし", y: "せんせい", yRomaji: "sensei", yMeaning: "teacher", isNeg: true },
    { x: "わたし", y: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese", isNeg: false },
    { x: "わたし", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee", isNeg: true },
    { x: "ともだち", y: "がくせい", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "ともだち", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee", isNeg: true },
    { x: "ともだち", y: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American", isNeg: false }
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

function speakText(text, onEndCallback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';

    utterance.onend = () => {
        if (onEndCallback) onEndCallback();
    };

    speechSynthesis.speak(utterance);
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupFooterGuide();
    setupTask3Generator();
});

function setupFooterGuide() {
    const trigger = document.getElementById('guideTrigger');
    const box = document.getElementById('guideBox');

    if (trigger && box) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();

            box.style.display =
                (box.style.display === 'none' ? 'block' : 'none');
        });

        document.addEventListener('click', () => {
            box.style.display = 'none';
        });
    }
}

function formatWord(word, romaji, meaning) {
    const hintStr = `${romaji}, ${meaning}`;

    if (hintMode === 'paren') {
        return `<span class="target-word">${word}</span> (${hintStr})`;
    }

    return `
        <span class="tooltip-wrap">
            <span class="target-word">${word}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}

function formatCustomWord(hira, engKey) {
    const entry = customDict[engKey];

    if (!entry) return hira;

    return formatWord(
        hira,
        entry.romaji,
        entry.meaning
    );
}

/* =========================================================
   initApp
   ========================================================= */

function initApp() {

    const exampleSection =
        document.getElementById('exampleSection');

    if (exampleSection) {

        const ex1X =
            formatWord("わたし", "watashi", "I");

        const ex1Y =
            formatWord("がくせい", "gakusei", "student");

        const ex2X =
            formatWord("わたし", "watashi", "I");

        const ex2Y =
            formatWord("せんせい", "sensei", "teacher");

        exampleSection.className = "example-box";

        exampleSection.innerHTML = `
            <div class="example-row">
                <strong>Affirmative:</strong>
                ${ex1X} ／ ${ex1Y}

                <button
                    id="ex1Listen"
                    class="example-button"
                >
                    🔊 きく
                </button>

                <span class="example-desc">
                    わたしは、がくせいです。(I am a student)
                </span>
            </div>

            <div class="example-row">
                <strong>Negative:</strong>
                ${ex2X} ／ ${ex2Y}

                <button
                    id="ex2Listen"
                    class="example-button"
                >
                    🔊 きく
                </button>

                <span class="example-desc">
                    わたしは、せんせいじゃないです。(I am not a teacher)
                </span>
            </div>
        `;

        setupExampleListen(
            'ex1Listen',
            "わたしは、がくせいです。"
        );

        setupExampleListen(
            'ex2Listen',
            "わたしは、せんせいじゃないです。"
        );
    }

    const container =
        document.getElementById('task1List');

    if (!container) return;

    container.innerHTML = "";

    /* ---------------------------------------------------------
       Task 1 header
       --------------------------------------------------------- */

    const headerPanel =
        document.createElement('div');

    headerPanel.className =
        'header-panel';

    const titleInstructionGroup1 =
        document.createElement('div');

    titleInstructionGroup1.className =
        'title-instruction-group';

    const titleArea1 =
        document.createElement('span');

    titleArea1.innerHTML =
        "<strong>Task 1；Drills</strong>";

    const descArea1 =
        document.createElement('span');

    descArea1.style.color =
        'var(--text-primary)';

    descArea1.style.fontSize =
        '15px';

    descArea1.innerHTML =
        '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup1.appendChild(
        titleArea1
    );

    titleInstructionGroup1.appendChild(
        descArea1
    );

    const controlGroup =
        document.createElement('div');

    controlGroup.className =
        'control-group';

    const controlItem =
        document.createElement('div');

    controlItem.className =
        'control-item';

    const labelAuto =
        document.createElement('span');

    labelAuto.id =
        'labelAuto';

    labelAuto.className =
        `mode-label ${
            !isManualStop
                ? 'active-mode'
                : 'inactive-mode'
        } custom-tip-wrap`;

    labelAuto.innerHTML =
        '⏹Autostop<span class="custom-tip-box">Automatically stops recording when you stop speaking.</span>';

    const switchLabel =
        document.createElement('label');

    switchLabel.className =
        'switch';

    const switchInput =
        document.createElement('input');

    switchInput.type =
        'checkbox';

    switchInput.checked =
        isManualStop;

    const slider =
        document.createElement('span');

    slider.className =
        'slider';

    switchLabel.appendChild(
        switchInput
    );

    switchLabel.appendChild(
        slider
    );

    const labelManual =
        document.createElement('span');

    labelManual.id =
        'labelManual';

    labelManual.className =
        `mode-label ${
            isManualStop
                ? 'active-mode'
                : 'inactive-mode'
        } custom-tip-wrap`;

    labelManual.innerHTML =
        '⏹Manual stop<span class="custom-tip-box">Records continuously until you click the stop button.</span>';

    switchInput.addEventListener(
        'change',
        (e) => {

            isManualStop =
                e.target.checked;

            const autoEl =
                document.getElementById(
                    'labelAuto'
                );

            const manualEl =
                document.getElementById(
                    'labelManual'
                );

            if (isManualStop) {

                manualEl.className =
                    'mode-label active-mode custom-tip-wrap';

                autoEl.className =
                    'mode-label inactive-mode custom-tip-wrap';

            } else {

                autoEl.className =
                    'mode-label active-mode custom-tip-wrap';

                manualEl.className =
                    'mode-label inactive-mode custom-tip-wrap';
            }
        }
    );

    controlItem.appendChild(labelAuto);
    controlItem.appendChild(switchLabel);
    controlItem.appendChild(labelManual);

    controlGroup.appendChild(
        controlItem
    );

    const vocabControl =
        document.createElement('div');

    vocabControl.className =
        'control-item';

    const labelHover =
        document.createElement('span');

    labelHover.id =
        'labelHover';

    labelHover.className =
        `mode-label ${
            hintMode === 'hover'
                ? 'active-mode'
                : 'inactive-mode'
        } custom-tip-wrap`;

    labelHover.innerHTML =
        '💬 Vocab Hint<span class="custom-tip-box">Shows word pronunciation and meaning when you hover over them.</span>';

    const vocabSwitchLabel =
        document.createElement('label');

    vocabSwitchLabel.className =
        'switch';

    const vocabSwitchInput =
        document.createElement('input');

    vocabSwitchInput.type =
        'checkbox';

    vocabSwitchInput.checked =
        (hintMode === 'paren');

    const vocabSlider =
        document.createElement('span');

    vocabSlider.className =
        'slider';

    vocabSwitchLabel.appendChild(
        vocabSwitchInput
    );

    vocabSwitchLabel.appendChild(
        vocabSlider
    );

    const labelParen =
        document.createElement('span');

    labelParen.id =
        'labelParen';

    labelParen.className =
        `mode-label ${
            hintMode === 'paren'
                ? 'active-mode'
                : 'inactive-mode'
        } custom-tip-wrap`;

    labelParen.innerHTML =
        '🔡Display Vocab<span class="custom-tip-box">Always shows word\'s meaning in parentheses.</span>';

    vocabSwitchInput.addEventListener(
        'change',
        (e) => {

            hintMode =
                e.target.checked
                    ? 'paren'
                    : 'hover';

            const hoverEl =
                document.getElementById(
                    'labelHover'
                );

            const parenEl =
                document.getElementById(
                    'labelParen'
                );

            if (hintMode === 'paren') {

                parenEl.className =
                    'mode-label active-mode custom-tip-wrap';

                hoverEl.className =
                    'mode-label inactive-mode custom-tip-wrap';

            } else {

                hoverEl.className =
                    'mode-label active-mode custom-tip-wrap';

                parenEl.className =
                    'mode-label inactive-mode custom-tip-wrap';
            }

            updateWordsDisplay();
        }
    );

    vocabControl.appendChild(
        labelHover
    );

    vocabControl.appendChild(
        vocabSwitchLabel
    );

    vocabControl.appendChild(
        labelParen
    );

    controlGroup.appendChild(
        vocabControl
    );

    headerPanel.appendChild(
        titleInstructionGroup1
    );

    headerPanel.appendChild(
        controlGroup
    );

    container.appendChild(
        headerPanel
    );

    /* ---------------------------------------------------------
       Task 1 rows
       --------------------------------------------------------- */

    taskData.forEach((item, index) => {

        const currentXWord =
            index < 4
                ? "わたし"
                : "ともだち";

        const currentXRomaji =
            index < 4
                ? "watashi"
                : "tomodachi";

        const currentXMeaning =
            index < 4
                ? "I"
                : "friend";

        const formattedX =
            formatWord(
                currentXWord,
                currentXRomaji,
                currentXMeaning
            );

        const formattedY =
            formatWord(
                item.y,
                item.yRomaji,
                item.yMeaning
            );

        createDrillRow(
            container,
            `${index + 1}.`,
            formattedX,
            formattedY,
            currentXWord,
            item.y,
            item.isNeg
        );
    });

    /* ---------------------------------------------------------
       Task 2 header
       --------------------------------------------------------- */

    const customHeaderPanel =
        document.createElement('div');

    customHeaderPanel.className =
        'header-panel';

    customHeaderPanel.style.marginTop =
        "30px";

    const titleInstructionGroup2 =
        document.createElement('div');

    titleInstructionGroup2.className =
        'title-instruction-group';

    const titleArea2 =
        document.createElement('span');

    titleArea2.innerHTML =
        "<strong>Task 2；Custom Practice</strong>";

    const descArea2 =
        document.createElement('span');

    descArea2.style.color =
        'var(--text-primary)';

    descArea2.style.fontSize =
        '15px';

    descArea2.innerHTML =
        '💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.';

    titleInstructionGroup2.appendChild(
        titleArea2
    );

    titleInstructionGroup2.appendChild(
        descArea2
    );

    customHeaderPanel.appendChild(
        titleInstructionGroup2
    );

    container.appendChild(
        customHeaderPanel
    );

    const optionsXHtml = `
        <option value="" disabled selected>
            -- Choose X --
        </option>

        <option value="ともだち" data-eng="friend">
            Friend
        </option>

        <option value="かぞく" data-eng="family">
            Family
        </option>

        <option value="どうりょう" data-eng="colleague">
            Colleague
        </option>

        <option value="じょうし" data-eng="boss">
            Boss
        </option>

        <option value="パートナー" data-eng="partner">
            Partner
        </option>

        <option value="こいびと" data-eng="Bf/Gf">
            Bf/Gf
        </option>

        <option value="しんゆう" data-eng="best friend">
            Best friend
        </option>

        <option value="こども" data-eng="child">
            Child
        </option>

        <option value="まご" data-eng="grandchild">
            Grandchild
        </option>

        <option value="きょうだい" data-eng="sibling">
            Sibling
        </option>
    `;

    const optionsYHtml = `
        <option value="" disabled selected>
            -- Choose Y --
        </option>

        <option value="がいこくじん" data-eng="foreigner">
            Foreigner
        </option>

        <option value="いしゃ" data-eng="doctor">
            Doctor
        </option>

        <option value="エンジニア" data-eng="engineer">
            Engineer
        </option>

        <option value="けんきゅうしゃ" data-eng="researcher">
            Researcher
        </option>

        <option value="デザイナー" data-eng="designer">
            Designer
        </option>

        <option value="てんいん" data-eng="store staff">
            Store staff
        </option>

        <option value="じえいぎょう" data-eng="self-employed">
            Self-employed
        </option>

        <option value="こうむいん" data-eng="civil servant">
            Civil servant
        </option>

        <option value="かんごし" data-eng="nurse">
            Nurse
        </option>

        <option value="アルバイト" data-eng="part-time worker">
            Part-time worker
        </option>
    `;

    for (let i = 1; i <= 3; i++) {

        const rowDiv =
            document.createElement('div');

        rowDiv.className =
            'drill-row';

        rowDiv.setAttribute(
            'data-custom-index',
            i
        );

        const topRow =
            document.createElement('div');

        topRow.className =
            'top-row';

        const listenBtn =
            document.createElement('button');

        listenBtn.className =
            'example-button custom-tip-wrap';

        listenBtn.innerHTML =
            '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';

        listenBtn.disabled = true;

        const indexSpan =
            document.createElement('span');

        indexSpan.textContent =
            `${taskData.length + i}.`;

        const selectX =
            document.createElement('select');

        selectX.id =
            `customX_${i}`;

        selectX.className =
            'custom-select';

        selectX.innerHTML =
            optionsXHtml;

        const previewX =
            document.createElement('span');

        previewX.id =
            `previewX_${i}`;

        previewX.className =
            'translation-preview';

        const labelHa =
            document.createElement('span');

        labelHa.id =
            `labelHa_${i}`;

        labelHa.textContent =
            'は';

        const selectY =
            document.createElement('select');

        selectY.id =
            `customY_${i}`;

        selectY.className =
            'custom-select';

        selectY.innerHTML =
            optionsYHtml;

        const previewY =
            document.createElement('span');

        previewY.id =
            `previewY_${i}`;

        previewY.className =
            'translation-preview';

        const recordBtn =
            document.createElement('button');

        recordBtn.className =
            'example-button custom-tip-wrap';

        recordBtn.innerHTML =
            '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

        recordBtn.disabled = true;

        const stopBtn =
            document.createElement('button');

        stopBtn.className =
            'example-button custom-tip-wrap';

        stopBtn.innerHTML =
            '⏹️<span class="custom-tip-box">Stop the active recording.</span>';

        stopBtn.disabled = true;

        const resultSpan =
            document.createElement('span');

        resultSpan.className =
            'result-text';

        resultSpan.textContent =
            '(Not recorded yet)';

        resultSpan.style.color =
            'var(--text-secondary)';

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

        const correctionBox =
            document.createElement('div');

        correctionBox.className =
            'correction-box';

        const corrListenBtn =
            document.createElement('button');

        corrListenBtn.className =
            'example-button';

        corrListenBtn.textContent =
            '🔊 きく';

        corrListenBtn.style.marginRight =
            '8px';

        const corrTextSpan =
            document.createElement('span');

        correctionBox.appendChild(
            corrListenBtn
        );

        correctionBox.appendChild(
            corrTextSpan
        );

        rowDiv.appendChild(topRow);
        rowDiv.appendChild(correctionBox);

        const isCustomNeg =
            (i !== 2);

        const updateDisplay =
            () => {

                const selectedOptX =
                    selectX.options[
                        selectX.selectedIndex
                    ];

                const selectedOptY =
                    selectY.options[
                        selectY.selectedIndex
                    ];

                const valX =
                    selectX.value;

                const valY =
                    selectY.value;

                if (valX && selectedOptX) {

                    const engKey =
                        selectedOptX.getAttribute(
                            'data-eng'
                        );

                    previewX.innerHTML =
                        formatCustomWord(
                            valX,
                            engKey
                        );

                } else {

                    previewX.innerHTML =
                        "";
                }

                if (valY && selectedOptY) {

                    const engKey =
                        selectedOptY.getAttribute(
                            'data-eng'
                        );

                    previewY.innerHTML =
                        formatCustomWord(
                            valY,
                            engKey
                        );

                } else {

                    previewY.innerHTML =
                        "";
                }

                if (valX) {

                    labelHa.style.display =
                        'none';

                } else {

                    labelHa.style.display =
                        'inline';
                }

                if (valX && valY) {

                    recordBtn.disabled =
                        false;

                    listenBtn.disabled =
                        false;

                    listenBtn.onclick =
                        () => {

                            const textToSpeak =
                                isCustomNeg
                                    ? `${valX}は、${valY}じゃないです。`
                                    : `${valX}は、${valY}です。`;

                            playSyntheticAudio(
                                textToSpeak,
                                listenBtn,
                                '🔊きく'
                            );
                        };

                } else {

                    recordBtn.disabled =
                        true;

                    listenBtn.disabled =
                        true;

                    stopBtn.disabled =
                        true;
                }
            };

        selectX.addEventListener(
            'change',
            updateDisplay
        );

        selectY.addEventListener(
            'change',
            updateDisplay
        );

        const getXValue =
            () =>
                selectX.value ||
                "ともだち";

        const getYValue =
            () =>
                selectY.value ||
                "いしゃ";

        bindRecorderEvents(
            recordBtn,
            stopBtn,
            resultSpan,
            correctionBox,
            corrListenBtn,
            corrTextSpan,
            getXValue,
            getYValue,
            isCustomNeg
        );

        container.appendChild(
            rowDiv
        );

        /* 初期状態を明示的に適用 */
        updateDisplay();
    }
}

/* =========================================================
   Task 3 Vocabulary Definition
   ========================================================= */

const TASK3_X_VOCAB = [

    {
        aliases: ["わたし", "私"],
        word: "わたし",
        romaji: "watashi",
        meaning: "I"
    },

    {
        aliases: ["ともだち", "友達", "友だち"],
        word: "ともだち",
        romaji: "tomodachi",
        meaning: "friend"
    },

    {
        aliases: ["かぞく", "家族"],
        word: "かぞく",
        romaji: "kazoku",
        meaning: "family"
    },

    {
        aliases: ["どうりょう", "同僚"],
        word: "どうりょう",
        romaji: "douryou",
        meaning: "colleague"
    },

    {
        aliases: ["じょうし", "上司"],
        word: "じょうし",
        romaji: "joushi",
        meaning: "boss"
    },

    {
        aliases: ["パートナー"],
        word: "パートナー",
        romaji: "paatanaa",
        meaning: "partner"
    },

    {
        aliases: ["こいびと", "恋人"],
        word: "こいびと",
        romaji: "koibito",
        meaning: "Bf/Gf"
    },

    {
        aliases: ["しんゆう", "親友"],
        word: "しんゆう",
        romaji: "shinyuu",
        meaning: "best friend"
    },

    {
        aliases: ["こども", "子供", "子ども"],
        word: "こども",
        romaji: "kodomo",
        meaning: "child"
    },

    {
        aliases: ["まご", "孫"],
        word: "まご",
        romaji: "mago",
        meaning: "grandchild"
    },

    {
        aliases: ["きょうだい", "兄弟"],
        word: "きょうだい",
        romaji: "kyoudai",
        meaning: "sibling"
    }
];

const TASK3_Y_VOCAB = [

    {
        aliases: ["がくせい", "学生"],
        word: "がくせい",
        romaji: "gakusei",
        meaning: "student"
    },

    {
        aliases: ["せんせい", "先生"],
        word: "せんせい",
        romaji: "sensei",
        meaning: "teacher"
    },

    {
        aliases: ["にほんじん", "日本人"],
        word: "日本人",
        romaji: "nihonjin",
        meaning: "Japanese"
    },

    {
        aliases: ["かいしゃいん", "会社員"],
        word: "かいしゃいん",
        romaji: "kaishain",
        meaning: "company employee"
    },

    {
        aliases: ["アメリカじん", "アメリカ人", "あめりかじん"],
        word: "アメリカ人",
        romaji: "amerikajin",
        meaning: "American"
    },

    {
        aliases: ["がいこくじん", "外国人"],
        word: "がいこくじん",
        romaji: "gaikokujin",
        meaning: "foreigner"
    },

    {
        aliases: ["いしゃ", "医者", "医師"],
        word: "いしゃ",
        romaji: "isha",
        meaning: "doctor"
    },

    {
        aliases: ["エンジニア"],
        word: "エンジニア",
        romaji: "enjinia",
        meaning: "engineer"
    },

    {
        aliases: ["けんきゅうしゃ", "研究者"],
        word: "けんきゅうしゃ",
        romaji: "kenkyuusha",
        meaning: "researcher"
    },

    {
        aliases: ["デザイナー"],
        word: "デザイナー",
        romaji: "dezainaa",
        meaning: "designer"
    },

    {
        aliases: ["てんいん", "店員"],
        word: "てんいん",
        romaji: "tenin",
        meaning: "store staff"
    },

    {
        aliases: ["じえいぎょう", "自営業"],
        word: "じえいぎょう",
        romaji: "jiei-gyou",
        meaning: "self-employed"
    },

    {
        aliases: ["こうむいん", "公務員"],
        word: "こうむいん",
        romaji: "koumuin",
        meaning: "civil servant"
    },

    {
        aliases: ["かんごし", "看護師", "看護婦"],
        word: "かんごし",
        romaji: "kangoshi",
        meaning: "nurse"
    },

    {
        aliases: ["アルバイト"],
        word: "アルバイト",
        romaji: "arubaito",
        meaning: "part-time worker"
    }
];

let task3UsableX = [];
let task3UsableY = [];
let task3UsedSentences = new Set();

/* =========================================================
   Task 3 Helpers
   ========================================================= */

function task3Normalize(text) {

    return convertToHiragana(
        String(text || "")
    )
        .replace(/[\r\n\t ]/g, "")
        .trim();
}

function task3FindVocabulary(sourceText) {

    const normalized =
        task3Normalize(sourceText);

    const foundX = [];
    const foundY = [];

    TASK3_X_VOCAB.forEach(entry => {

        if (
            entry.aliases.some(
                alias =>
                    normalized.includes(
                        task3Normalize(alias)
                    )
            )
        ) {

            if (
                !foundX.some(
                    v => v.word === entry.word
                )
            ) {
                foundX.push(entry);
            }
        }
    });

    TASK3_Y_VOCAB.forEach(entry => {

        if (
            entry.aliases.some(
                alias =>
                    normalized.includes(
                        task3Normalize(alias)
                    )
            )
        ) {

            if (
                !foundY.some(
                    v => v.word === entry.word
                )
            ) {
                foundY.push(entry);
            }
        }
    });

    return {
        x: foundX,
        y: foundY
    };
}

/* =========================================================
   Existing sentence exclusion
   ========================================================= */

function task3GetExistingSentences() {

    const used = new Set();

    /* Task 1 */
    taskData.forEach(item => {

        const sentence =
            item.isNeg
                ? `${item.x}は、${item.y}じゃないです。`
                : `${item.x}は、${item.y}です。`;

        used.add(
            task3Normalize(sentence)
        );
    });

    /* Task 2 */
    document
        .querySelectorAll('[data-custom-index]')
        .forEach(row => {

            const idx =
                row.getAttribute(
                    'data-custom-index'
                );

            const x =
                document.getElementById(
                    `customX_${idx}`
                )?.value;

            const y =
                document.getElementById(
                    `customY_${idx}`
                )?.value;

            if (x && y) {

                const isNeg =
                    idx !== "2";

                const sentence =
                    isNeg
                        ? `${x}は、${y}じゃないです。`
                        : `${x}は、${y}です。`;

                used.add(
                    task3Normalize(sentence)
                );
            }
        });

    /* Task 3 */
    task3UsedSentences.forEach(
        sentence =>
            used.add(sentence)
    );

    return used;
}

/* =========================================================
   Build Task 3 candidates
   ========================================================= */

function task3BuildCandidates() {

    const candidates = [];

    const used =
        task3GetExistingSentences();

    task3UsableX.forEach(x => {

        task3UsableY.forEach(y => {

            [false, true].forEach(
                isNeg => {

                    const sentence =
                        isNeg
                            ? `${x.word}は、${y.word}じゃないです。`
                            : `${x.word}は、${y.word}です。`;

                    const key =
                        task3Normalize(
                            sentence
                        );

                    if (!used.has(key)) {

                        candidates.push({
                            x,
                            y,
                            isNeg,
                            sentence,
                            key
                        });
                    }
                }
            );
        });
    });

    return candidates;
}

function task3Shuffle(array) {

    const result =
        [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}

/* =========================================================
   Task 3 Preview
   ========================================================= */

function task3RenderPreview() {

    const preview =
        document.getElementById(
            'task3Preview'
        );

    if (!preview) return;

    preview.innerHTML =
        "";

    const all = [
        ...task3UsableX,
        ...task3UsableY
    ];

    if (!all.length) {

        preview.innerHTML =
            '<span class="task3-empty">No usable vocabulary was recognized.</span>';

        return;
    }

    const list =
        document.createElement(
            'div'
        );

    list.className =
        'task3-vocab-list';

    all.forEach(entry => {

        const item =
            document.createElement(
                'span'
            );

        item.className =
            'task3-vocab-item';

        item.textContent =
            entry.word;

        list.appendChild(item);
    });

    preview.appendChild(list);
}

/* =========================================================
   Generate Task 3 rows
   ========================================================= */

function task3CreateRows(count) {

    const container =
        document.getElementById(
            'task3List'
        );

    const moreBtn =
        document.getElementById(
            'task3MoreBtn'
        );

    if (!container) return 0;

    const candidates =
        task3Shuffle(
            task3BuildCandidates()
        );

    const selected =
        candidates.slice(
            0,
            Math.min(
                count,
                candidates.length
            )
        );

    const startNumber =
        11 +
        container.querySelectorAll(
            '.drill-row'
        ).length;

    selected.forEach(
        (pair, idx) => {

            const rowNumber =
                startNumber + idx;

            const formattedX =
                formatWord(
                    pair.x.word,
                    pair.x.romaji,
                    pair.x.meaning
                );

            const formattedY =
                formatWord(
                    pair.y.word,
                    pair.y.romaji,
                    pair.y.meaning
                );

            createDrillRow(
                container,
                `${rowNumber}.`,
                formattedX,
                formattedY,
                pair.x.word,
                pair.y.word,
                pair.isNeg
            );

            task3UsedSentences.add(
                pair.key
            );

            const rows =
                container.querySelectorAll(
                    '.drill-row'
                );

            const row =
                rows[
                    rows.length - 1
                ];

            const prompt =
                row
                    ? row.querySelector(
                        '.prompt-content'
                    )
                    : null;

            if (prompt) {

                prompt.dataset.xRomaji =
                    pair.x.romaji;

                prompt.dataset.xMeaning =
                    pair.x.meaning;

                prompt.dataset.yRomaji =
                    pair.y.romaji;

                prompt.dataset.yMeaning =
                    pair.y.meaning;
            }
        }
    );

    const remaining =
        task3BuildCandidates().length;

    if (moreBtn) {

        moreBtn.disabled =
            remaining === 0;
    }

    return selected.length;
}

/* =========================================================
   Tesseract.js OCR
   ========================================================= */

async function task3RunOCR(file) {

    if (!window.Tesseract) {
        throw new Error(
            'Tesseract.js is not available.'
        );
    }

    const result =
        await Tesseract.recognize(
            file,
            'jpn',
            {
                logger: message => {

                    const status =
                        document.getElementById(
                            'task3ImportStatus'
                        );

                    if (
                        status &&
                        message &&
                        typeof message.progress ===
                            'number'
                    ) {

                        status.textContent =
                            `Reading image... ${
                                Math.round(
                                    message.progress *
                                    100
                                )
                            }%`;
                    }
                }
            }
        );

    return result.data.text || "";
}

/* =========================================================
   Task 3 Main Controller
   ========================================================= */

function setupTask3Generator() {

    const importBtn =
        document.getElementById(
            'task3ImportBtn'
        );

    const generateBtn =
        document.getElementById(
            'task3GenerateBtn'
        );

    const moreBtn =
        document.getElementById(
            'task3MoreBtn'
        );

    const container =
        document.getElementById(
            'task3List'
        );

    const textarea =
        document.getElementById(
            'task3Textarea'
        );

    const imageInput =
        document.getElementById(
            'task3ImageInput'
        );

    const dropZone =
        document.getElementById(
            'task3DropZone'
        );

    const status =
        document.getElementById(
            'task3ImportStatus'
        );

    if (
        !importBtn ||
        !generateBtn ||
        !moreBtn ||
        !container ||
        !textarea ||
        !imageInput
    ) {
        return;
    }

    let importedText = "";
    let importedImageFile = null;

    /* ---------------------------------------------------------
       Process imported text
       --------------------------------------------------------- */

    const importText =
        text => {

            importedText =
                String(
                    text || ""
                ).trim();

            const found =
                task3FindVocabulary(
                    importedText
                );

            task3UsableX =
                found.x;

            task3UsableY =
                found.y;

            task3UsedSentences =
                new Set();

            container.innerHTML =
                "";

            task3RenderPreview();

            generateBtn.disabled =
                !(
                    task3UsableX.length &&
                    task3UsableY.length
                );

            moreBtn.disabled =
                true;

            if (status) {

                status.textContent =
                    `${
                        task3UsableX.length +
                        task3UsableY.length
                    } usable vocabulary found.`;
            }
        };

    /* ---------------------------------------------------------
       Import
       --------------------------------------------------------- */

    importBtn.addEventListener(
        'click',
        async () => {

            const text =
                textarea.value.trim();

            if (text) {

                importText(text);
                return;
            }

            if (importedImageFile) {

                try {

                    importBtn.disabled =
                        true;

                    if (status) {
                        status.textContent =
                            'Reading image...';
                    }

                    const textFromImage =
                        await task3RunOCR(
                            importedImageFile
                        );

                    importText(
                        textFromImage
                    );

                } catch (err) {

                    console.error(err);

                    if (status) {
                        status.textContent =
                            'Could not read the image.';
                    }

                    alert(
                        'The image could not be read. Please try a clearer JPG/PNG image.'
                    );

                } finally {

                    importBtn.disabled =
                        false;
                }

                return;
            }

            alert(
                'Please paste your vocabulary text or choose/drop a JPG/PNG image first.'
            );
        }
    );

    /* ---------------------------------------------------------
       Choose image
       --------------------------------------------------------- */

    imageInput.addEventListener(
        'change',
        () => {

            importedImageFile =
                imageInput.files &&
                imageInput.files[0]
                    ? imageInput.files[0]
                    : null;

            if (
                status &&
                importedImageFile
            ) {

                status.textContent =
                    'Image ready to import.';
            }
        }
    );

    /* ---------------------------------------------------------
       Drag & Drop visual state
       --------------------------------------------------------- */

    [
        'dragenter',
        'dragover'
    ].forEach(
        eventName => {

            dropZone?.addEventListener(
                eventName,
                e => {

                    e.preventDefault();

                    dropZone.classList.add(
                        'task3-drop-active'
                    );
                }
            );
        }
    );

    [
        'dragleave',
        'drop'
    ].forEach(
        eventName => {

            dropZone?.addEventListener(
                eventName,
                e => {

                    e.preventDefault();

                    dropZone.classList.remove(
                        'task3-drop-active'
                    );
                }
            );
        }
    );

    /* ---------------------------------------------------------
       Drop image
       --------------------------------------------------------- */

    dropZone?.addEventListener(
        'drop',
        e => {

            const file =
                e.dataTransfer.files &&
                e.dataTransfer.files[0];

            if (
                !file ||
                !/^image\/(png|jpeg)$/.test(
                    file.type
                )
            ) {

                alert(
                    'Please drop a JPG or PNG image.'
                );

                return;
            }

            importedImageFile =
                file;

            if (status) {

                status.textContent =
                    'Image ready to import.';
            }
        }
    );

    /* ---------------------------------------------------------
       First 5 drills
       --------------------------------------------------------- */

    generateBtn.addEventListener(
        'click',
        () => {

            if (
                !task3UsableX.length ||
                !task3UsableY.length
            ) {

                alert(
                    'No usable X/Y vocabulary is available.'
                );

                return;
            }

            container.innerHTML =
                "";

            task3UsedSentences =
                new Set();

            const created =
                task3CreateRows(5);

            moreBtn.disabled =
                created === 0 ||
                task3BuildCandidates().length === 0;
        }
    );

    /* ---------------------------------------------------------
       Additional drills
       --------------------------------------------------------- */

    moreBtn.addEventListener(
        'click',
        () => {

            if (moreBtn.disabled) {
                return;
            }

            const created =
                task3CreateRows(5);

            if (created === 0) {
                moreBtn.disabled =
                    true;
            }
        }
    );
}

/* =========================================================
   Update word display
   ========================================================= */

function updateWordsDisplay() {

    const drillRows =
        document.querySelectorAll(
            '.drill-row'
        );

    drillRows.forEach(
        row => {

            const customIdx =
                row.getAttribute(
                    'data-custom-index'
                );

            if (customIdx) {

                const selectX =
                    document.getElementById(
                        `customX_${customIdx}`
                    );

                const selectY =
                    document.getElementById(
                        `customY_${customIdx}`
                    );

                const previewX =
                    document.getElementById(
                        `previewX_${customIdx}`
                    );

                const previewY =
                    document.getElementById(
                        `previewY_${customIdx}`
                    );

                if (
                    selectX &&
                    selectX.value &&
                    selectX.selectedIndex >= 0
                ) {

                    const optX =
                        selectX.options[
                            selectX.selectedIndex
                        ];

                    previewX.innerHTML =
                        formatCustomWord(
                            selectX.value,
                            optX.getAttribute(
                                'data-eng'
                            )
                        );
                }

                if (
                    selectY &&
                    selectY.value &&
                    selectY.selectedIndex >= 0
                ) {

                    const optY =
                        selectY.options[
                            selectY.selectedIndex
                        ];

                    previewY.innerHTML =
                        formatCustomWord(
                            selectY.value,
                            optY.getAttribute(
                                'data-eng'
                            )
                        );
                }

            } else {

                const promptSpan =
                    row.querySelector(
                        '.prompt-content'
                    );

                if (
                    promptSpan &&
                    promptSpan.dataset.xWord &&
                    promptSpan.dataset.yWord
                ) {

                    const xW =
                        promptSpan.dataset.xWord;

                    const xR =
                        promptSpan.dataset.xRomaji;

                    const xM =
                        promptSpan.dataset.xMeaning;

                    const yW =
                        promptSpan.dataset.yWord;

                    const yR =
                        promptSpan.dataset.yRomaji;

                    const yM =
                        promptSpan.dataset.yMeaning;

                    promptSpan.innerHTML =
                        `${formatWord(
                            xW,
                            xR,
                            xM
                        )} ／ ${formatWord(
                            yW,
                            yR,
                            yM
                        )}`;
                }
            }
        }
    );
}

/* =========================================================
   Create standard drill row
   ========================================================= */

function createDrillRow(
    container,
    indexLabel,
    formattedX,
    formattedY,
    targetX,
    targetY,
    isNeg
) {

    const rowDiv =
        document.createElement('div');

    rowDiv.className =
        'drill-row';

    const topRow =
        document.createElement('div');

    topRow.className =
        'top-row';

    const listenBtn =
        document.createElement('button');

    listenBtn.className =
        'example-button custom-tip-wrap';

    listenBtn.innerHTML =
        '🔊きく<span class="custom-tip-box">Listen to the correct sample sentence.</span>';

    listenBtn.disabled =
        false;

    listenBtn.onclick =
        () => {

            const textToSpeak =
                isNeg
                    ? `${targetX}は、${targetY}じゃないです。`
                    : `${targetX}は、${targetY}です。`;

            playSyntheticAudio(
                textToSpeak,
                listenBtn,
                '🔊きく'
            );
        };

    const indexSpan =
        document.createElement('span');

    indexSpan.textContent =
        indexLabel;

    const promptSpan =
        document.createElement('span');

    promptSpan.className =
        'prompt-label prompt-content';

    promptSpan.dataset.xWord =
        targetX;

    promptSpan.dataset.xRomaji =
        (
            targetX === "わたし"
                ? "watashi"
                : "tomodachi"
        );

    promptSpan.dataset.xMeaning =
        (
            targetX === "わたし"
                ? "I"
                : "friend"
        );

    promptSpan.dataset.yWord =
        targetY;

    const foundData =
        taskData.find(
            d => d.y === targetY
        );

    promptSpan.dataset.yRomaji =
        foundData
            ? foundData.yRomaji
            : "noun";

    promptSpan.dataset.yMeaning =
        foundData
            ? foundData.yMeaning
            : "noun";

    promptSpan.innerHTML =
        `${formattedX} ／ ${formattedY}`;

    const recordBtn =
        document.createElement('button');

    recordBtn.className =
        'example-button custom-tip-wrap';

    recordBtn.innerHTML =
        '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn =
        document.createElement('button');

    stopBtn.className =
        'example-button custom-tip-wrap';

    stopBtn.innerHTML =
        '⏹️<span class="custom-tip-box">Stop the active recording.</span>';

    stopBtn.disabled =
        true;

    const resultSpan =
        document.createElement('span');

    resultSpan.className =
        'result-text';

    resultSpan.textContent =
        '(Not recorded yet)';

    resultSpan.style.color =
        'var(--text-secondary)';

    topRow.appendChild(listenBtn);
    topRow.appendChild(indexSpan);
    topRow.appendChild(promptSpan);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

    const correctionBox =
        document.createElement('div');

    correctionBox.className =
        'correction-box';

    const corrListenBtn =
        document.createElement('button');

    corrListenBtn.className =
        'example-button';

    corrListenBtn.textContent =
        '🔊 きく';

    corrListenBtn.style.marginRight =
        '8px';

    const corrTextSpan =
        document.createElement('span');

    correctionBox.appendChild(
        corrListenBtn
    );

    correctionBox.appendChild(
        corrTextSpan
    );

    rowDiv.appendChild(topRow);
    rowDiv.appendChild(correctionBox);

    bindRecorderEvents(
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        () => targetX,
        () => targetY,
        isNeg
    );

    container.appendChild(
        rowDiv
    );
}

/* =========================================================
   Synthetic audio
   ========================================================= */

function playSyntheticAudio(
    text,
    btnElement,
    originalText
) {

    btnElement.disabled =
        true;

    btnElement.textContent =
        '🔊Playing...';

    speakText(
        text,
        () => {

            btnElement.disabled =
                false;

            btnElement.textContent =
                originalText;
        }
    );
}

/* =========================================================
   Recorder
   ========================================================= */

function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getXFn,
    getYFn,
    expectedIsNeg = false
) {

    let mediaRecorder;
    let audioChunks = [];
    let audioStream = null;
    let recognition = null;
    let recordedAudioUrl = null;
    let timeoutTimer = null;
    let accumulatedTranscript = "";

    const stopRecordingProcess =
        () => {

            if (timeoutTimer) {

                clearTimeout(
                    timeoutTimer
                );

                timeoutTimer =
                    null;
            }

            if (recognition) {

                try {
                    recognition.stop();
                } catch (e) {}
            }

            if (
                mediaRecorder &&
                mediaRecorder.state !==
                    'inactive'
            ) {

                mediaRecorder.stop();
            }

            if (audioStream) {

                audioStream
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );
            }

            recordBtn.disabled =
                false;

            recordBtn.classList.remove(
                'stop-btn-active'
            );

            recordBtn.innerHTML =
                '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

            stopBtn.disabled =
                true;

            stopBtn.classList.remove(
                'stop-btn-active'
            );
        };

    recordBtn.addEventListener(
        'click',
        async () => {

            if (recordedAudioUrl) {

                URL.revokeObjectURL(
                    recordedAudioUrl
                );

                recordedAudioUrl =
                    null;
            }

            const oldPlayBtn =
                resultSpan.querySelector(
                    '.play-recording-btn'
                );

            if (oldPlayBtn) {
                oldPlayBtn.remove();
            }

            const currentX =
                getXFn();

            const currentY =
                getYFn();

            accumulatedTranscript =
                "";

            try {

                audioChunks =
                    [];

                audioStream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({
                            audio: true
                        });

                mediaRecorder =
                    new MediaRecorder(
                        audioStream
                    );

                mediaRecorder.ondataavailable =
                    e =>
                        audioChunks.push(
                            e.data
                        );

                mediaRecorder.onstop =
                    () => {

                        const audioBlob =
                            new Blob(
                                audioChunks,
                                {
                                    type:
                                        'audio/webm'
                                }
                            );

                        recordedAudioUrl =
                            URL.createObjectURL(
                                audioBlob
                            );

                        if (
                            accumulatedTranscript
                        ) {

                            processRecognitionResult(
                                accumulatedTranscript,
                                currentX,
                                currentY,
                                expectedIsNeg,
                                resultSpan,
                                correctionBox,
                                corrListenBtn,
                                corrTextSpan,
                                () =>
                                    recordedAudioUrl
                            );
                        }
                    };

                mediaRecorder.start();

                const SpeechRecognition =
                    window.SpeechRecognition ||
                    window.webkitSpeechRecognition;

                if (SpeechRecognition) {

                    recognition =
                        new SpeechRecognition();

                    recognition.lang =
                        'ja-JP';

                    recognition.interimResults =
                        false;

                    recognition.continuous =
                        true;

                    recognition.onresult =
                        e => {

                            let rawTranscript =
                                "";

                            for (
                                let i =
                                    e.resultIndex;
                                i <
                                    e.results.length;
                                ++i
                            ) {

                                rawTranscript +=
                                    e.results[
                                        i
                                    ][0].transcript;
                            }

                            accumulatedTranscript +=
                                rawTranscript;

                            if (!isManualStop) {
                                stopRecordingProcess();
                            }
                        };

                    recognition.onerror =
                        err => {

                            console.error(
                                "Speech recognition error:",
                                err
                            );
                        };

                    recognition.start();
                }

                timeoutTimer =
                    setTimeout(
                        () => {
                            stopRecordingProcess();
                        },
                        15000
                    );

                if (isManualStop) {

                    recordBtn.disabled =
                        true;

                    stopBtn.disabled =
                        false;

                    stopBtn.classList.add(
                        'stop-btn-active'
                    );

                    resultSpan.textContent =
                        'Recording (Max 15s)...';

                    resultSpan.style.color =
                        'var(--accent-color)';

                } else {

                    recordBtn.disabled =
                        true;

                    stopBtn.disabled =
                        true;

                    resultSpan.textContent =
                        'Recording...';

                    resultSpan.style.color =
                        'var(--accent-color)';
                }

                correctionBox.style.display =
                    'none';

            } catch (err) {

                console.error(
                    "Mic error:",
                    err
                );

                resultSpan.textContent =
                    'Mic error';

                resultSpan.style.color =
                    'var(--error-text)';
            }
        }
    );

    stopBtn.addEventListener(
        'click',
        () => {
            stopRecordingProcess();
        }
    );
}

/* =========================================================
   Recognition result
   ========================================================= */

function processRecognitionResult(
    rawTranscript,
    currentX,
    currentY,
    expectedIsNeg,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getUrlFn
) {

    if (
        rawTranscript
            .replace(/[\s.,]/g, "")
            .length < 2
    ) {

        resultSpan.textContent =
            rawTranscript +
            " (Too short)";

        resultSpan.style.color =
            'var(--text-secondary)';

        return;
    }

    const hiraText =
        convertToHiragana(
            rawTranscript
        );

    const hiraX =
        convertToHiragana(
            currentX
        );

    const hiraY =
        convertToHiragana(
            currentY
        );

    const endParticleRegex =
        '(?:ね|よ|よね|ですね|ですよ)*[.。!]?$';

    const affRegex =
        new RegExp(
            `^${hiraX}は${hiraY}です` +
            endParticleRegex
        );

    const isAffirmative =
        affRegex.test(
            hiraText
        );

    const negRegex1 =
        new RegExp(
            `^${hiraX}は${hiraY}じゃないです` +
            endParticleRegex
        );

    const negRegex2 =
        new RegExp(
            `^${hiraX}は${hiraY}ではないです` +
            endParticleRegex
        );

    const negRegex3 =
        new RegExp(
            `^${hiraX}は${hiraY}じゃありません` +
            endParticleRegex
        );

    const negRegex4 =
        new RegExp(
            `^${hiraX}は${hiraY}ではありません` +
            endParticleRegex
        );

    const isNegative =
        negRegex1.test(hiraText) ||
        negRegex2.test(hiraText) ||
        negRegex3.test(hiraText) ||
        negRegex4.test(hiraText);

    const recordedAudioUrl =
        getUrlFn();

    const appendPlayButton =
        () => {

            if (recordedAudioUrl) {

                let playBtn =
                    resultSpan.querySelector(
                        '.play-recording-btn'
                    );

                if (!playBtn) {

                    playBtn =
                        document.createElement(
                            'button'
                        );

                    playBtn.className =
                        'example-button play-recording-btn custom-tip-wrap';

                    playBtn.style.marginLeft =
                        '8px';

                    playBtn.innerHTML =
                        '▶<span class="custom-tip-box">Play the recorded audio</span>';

                    playBtn.onclick =
                        () => {

                            const audio =
                                new Audio(
                                    recordedAudioUrl
                                );

                            audio.playbackRate =
                                1.0;

                            audio.play();
                        };

                    resultSpan.appendChild(
                        playBtn
                    );
                }
            }
        };

    if (
        isAffirmative ||
        isNegative
    ) {

        resultSpan.textContent =
            hiraText +
            " ✅ ";

        resultSpan.style.color =
            'var(--text-primary)';

        appendPlayButton();

        correctionBox.style.display =
            'none';

    } else {

        const hasCorrectY =
            hiraText.includes(
                hiraY
            );

        if (!hasCorrectY) {

            let highlightedText =
                hiraText;

            highlightedText =
                highlightedText.replace(
                    new RegExp(
                        `(${hiraX}は)(.*?)((?:です|じゃないです|ではないです|じゃありません|ではありません))`,
                        'g'
                    ),
                    `$1<span style="color: var(--accent-color);">$2</span>$3`
                );

            resultSpan.innerHTML =
                highlightedText +
                " ";

            resultSpan.style.color =
                'var(--text-primary)';

            appendPlayButton();

            corrTextSpan.textContent =
                `Wrong word used.`;

            corrListenBtn.style.display =
                'none';

        } else {

            resultSpan.textContent =
                hiraText +
                " ";

            resultSpan.style.color =
                'var(--error-text)';

            appendPlayButton();

            corrTextSpan.textContent =
                `Structure error, try it again`;

            corrListenBtn.style.display =
                'inline-block';

            const correctSentence =
                expectedIsNeg
                    ? `${currentX}は、${currentY}じゃないです。`
                    : `${currentX}は、${currentY}です。`;

            corrListenBtn.onclick =
                () => {

                    corrListenBtn.disabled =
                        true;

                    corrListenBtn.textContent =
                        '🔊 Playing...';

                    speakText(
                        correctSentence,
                        () => {

                            corrListenBtn.disabled =
                                false;

                            corrListenBtn.textContent =
                                '🔊 きく';
                        }
                    );
                };
        }

        correctionBox.style.display =
            'block';
    }
}

/* =========================================================
   Example listen
   ========================================================= */

function setupExampleListen(
    btnId,
    text
) {

    const btn =
        document.getElementById(
            btnId
        );

    if (btn) {

        btn.addEventListener(
            'click',
            () => {

                btn.disabled =
                    true;

                btn.textContent =
                    '🔊 Playing...';

                speakText(
                    text,
                    () => {

                        btn.disabled =
                            false;

                        btn.textContent =
                            '🔊 きく';
                    }
                );
            }
        );
    }
}
