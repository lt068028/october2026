// Practice 7.2：Example 2・Drill 2（肯定・否定の質問応答）
document.addEventListener('DOMContentLoaded', () => {
    const states = Array.from({ length: 5 }, () => ({
        answer: null,
        questionText: false,
        yesText: false,
        noText: false
    }));

    const targets = [
        {
            words: [
                ['おにいさん', 'お兄さん', 'onīsan', 'older brother'],
                ['Tシャツ', 'Tシャツ', 'tīshatsu', 'T-shirt'],
                ['きる', '着る', 'kiru', 'wear']
            ],
            subject: 'お兄さん',
            object: 'Tシャツ',
            stem: '着て',
            optional: ['おにいさん', 'にいさん', 'あに', 'Tしゃつ']
        },
        {
            words: [
                ['おとうさん', 'お父さん', 'otōsan', 'father'],
                ['ふとる', '太る', 'futoru', 'gain weight']
            ],
            subject: 'お父さん',
            object: '',
            stem: '太って',
            optional: ['おとうさん', 'とうさん', 'ちち']
        },
        {
            words: [
                ['おかあさん', 'お母さん', 'okāsan', 'mother'],
                ['やせる', 'やせる', 'yaseru', 'lose weight']
            ],
            subject: 'お母さん',
            object: '',
            stem: 'やせて',
            optional: ['おかあさん', 'かあさん', 'はは']
        },
        {
            words: [
                [
                    'いえのでんわばんごう',
                    '家の電話番号',
                    'ie no denwa bangō',
                    'home phone number'
                ],
                ['おぼえる', '覚える', 'oboeru', 'remember']
            ],
            subject: '',
            object: '家の電話番号',
            stem: '覚えて',
            optional: [
                'いえのでんわばんごう',
                'うちのでんわばんごう',
                'でんわばんごう'
            ]
        },
        {
            words: [
                [
                    '「あるく」のかんじ',
                    '「歩く」の漢字',
                    'aruku no kanji',
                    'the kanji for aruku (to walk)'
                ],
                ['しる', '知る', 'shiru', 'know']
            ],
            subject: '',
            object: '「歩く」の漢字',
            stem: '知って',
            know: true,
            optional: ['あるくのかんじ', 'かんじ']
        }
    ];

    const example = {
        words: [
            ['おねえさん', 'お姉さん', 'onēsan', 'older sister'],
            ['けっこんする', '結婚する', 'kekkon suru', 'be married']
        ],
        subject: 'お姉さん',
        object: '',
        stem: '結婚して'
    };

    const toHira = practice7ToHiragana;

    practice7ToHiragana = text => {
        let value = String(text ?? '');

        [
            ['お兄さん', 'おにいさん'],
            ['お姉さん', 'おねえさん'],
            ['お父さん', 'おとうさん'],
            ['お母さん', 'おかあさん'],
            ['電話番号', 'でんわばんごう'],
            ['歩く', 'あるく'],
            ['家', 'いえ'],
            ['今', 'いま'],
            ['兄', 'あに'],
            ['姉', 'あね'],
            ['父', 'ちち'],
            ['母', 'はは']
        ].forEach(([from, to]) => {
            value = value.split(from).join(to);
        });

        return toHira(value);
    };

    const style = () => document.querySelector(
        '#speechStyleControl button[aria-pressed="true"]'
    )?.dataset.value || 'formal';

    const blocked = () => Boolean(
        activeRecognitionSession ||
        practice7State.startingRow
    );

    const normalize = practice7Normalize;

    const flat = text => practice7ToHiragana(
        String(text ?? '').normalize('NFKC')
    )
        .toLowerCase()
        .replace(/[\s、。．,.!?！？「」『』・]/g, '')
        .replace(/(?:よね|よ|ね)$/, '');

    // 動詞の肯定・否定を必須とし、その他の指定語句は任意。
    practice7Normalize = text => {
        const value = flat(text);

        for (const item of targets) {
            const stem = flat(item.stem);

            const pattern = item.know
                ? /(しって)(いません|います|いない|いる|ない|る)(?:よね|よ|ね)?|しりません(?:よね|よ|ね)?|しらない(?:よね|よ|ね)?/g
                : new RegExp(
                    stem +
                    '(いません|います|いない|いる|ない|る)' +
                    '(?:よね|よ|ね)?',
                    'g'
                );

            const matches = Array.from(
                value.matchAll(pattern)
            );

            if (matches.length !== 1) continue;

            const match = matches[0];

            const core = match[0].replace(
                /(?:よね|よ|ね)$/,
                ''
            );

            // 「知る」の否定は「知りません／知らない」。
            if (
                item.know &&
                [
                    'しっていません',
                    'しっていない',
                    'しってない'
                ].includes(core)
            ) continue;

            const negative =
                /(?:いません|いない|てない|しらない|しりません)$/
                    .test(core);

            let rest =
                value.slice(0, match.index) +
                value.slice(match.index + match[0].length);

            const optional = item.optional
                .map(flat)
                .sort((a, b) => b.length - a.length);

            let valid = true;

            while (rest) {
                // 「家＝いえ」を否定応答と取り違えないよう、
                // 指定語句を先に確認する。
                const token = optional.find(
                    word => rest.startsWith(word)
                );

                if (token) {
                    const subjectToken = item.subject &&
                        (!item.object || token !== flat(item.object));
                    const particle = subjectToken ? /^[はが]/
                        : item.object === '家の電話番号' ? /^[をは]/
                        : /^[をはが]/;
                    rest = rest.slice(token.length).replace(particle, '');

                    continue;
                }

                const response = rest.match(
                    /^(いいえ|いえ|はい|うんんー?|ううん|うん)/
                );

                if (response) {
                    const no =
                        /^(?:いいえ|いえ|うんん|ううん)/
                            .test(response[0]);

                    if (no !== negative) {
                        valid = false;
                        break;
                    }

                    rest = rest.slice(response[0].length);
                    continue;
                }

                const time = rest.match(/^いま(?:は)?/);

                if (time) {
                    rest = rest.slice(time[0].length);
                    continue;
                }

                valid = false;
                break;
            }

            if (valid) {
                return `p72-answer|${core}`;
            }
        }

        return normalize(text);
    };

    const speak = speakText;

    speakText = function(text, rate = 0.8, done) {
        return speak(
            String(text ?? '').replace(
                /^(?:ううんん?|うんん)ー?[、,\s]*/,
                'ううんん、'
            ),
            rate,
            done
        );
    };

    const node = (tag, cls = '', text) => {
        const element = document.createElement(tag);
        element.className = cls;

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    };

    const button = (label, tip, click) => {
        const b = node(
            'button',
            'example-button custom-tip-wrap'
        );

        b.type = 'button';

        b.append(
            document.createTextNode(label),
            node('span', 'custom-tip-box', tip)
        );

        b.onclick = () => {
            if (!blocked()) click();
        };

        return b;
    };

    function model(item, kind) {
        const mode = style();

        const subject = item.subject
            ? item.subject +
                (mode === 'casual' ? '、' : 'は、')
            : '';

        const object = item.object
            ? item.object +
                (mode === 'casual' ? '、' : 'を、')
            : '';

        const ending = kind === 'q'
            ? {
                formal: 'いますか。',
                informal: 'いる？',
                casual: 'る？'
            }[mode]
            : kind === 'yes'
                ? {
                    formal: 'います。',
                    informal: 'いる。',
                    casual: 'るよ。'
                }[mode]
                : {
                    formal: 'いません。',
                    informal: 'いない。',
                    casual: 'ないよ。'
                }[mode];

        const prefix = kind === 'q'
            ? ''
            : mode === 'casual'
                ? (kind === 'yes' ? 'うん、' : 'ううん、')
                : (kind === 'yes' ? 'はい、' : 'いいえ、');

        const verb = kind === 'no' && item.know
            ? {
                formal: '知りません。',
                informal: '知らない。',
                casual: '知らないよ。'
            }[mode]
            : item.stem + ending;

        return kind === 'q' ? subject + object + verb : prefix + verb;    }

    const display = text => scriptMode === 'hiragana'
        ? practice7ToHiragana(text)
        : text;

    const cue = item => item.words.map(word => {
        const english = document.getElementById(
            'practice7EnglishCueButton'
        )?.getAttribute('aria-pressed') === 'true';

        if (english) {
            return node('span', '', word[3]).innerHTML;
        }

        return formatWord(...word);
    }).join('／');

    const listen = (getText, label = '🔊きく') => {
        let b;

        b = button(label, 'Listen to the model.', () => {
            setPlayingStateMultiple([b], 'Playing...');
            speakText(getText(), 0.8, stopAllPlayback);
        });

        return b;
    };

    function highlighted(text) {
        const span = node('span');

        const pattern =
            /ていますか|ていません|ています|ていない|ている|てない|てる|知りません|知らない|しりません|しらない/g;

        let offset = 0;

        for (const match of text.matchAll(pattern)) {
            span.append(
                document.createTextNode(
                    text.slice(offset, match.index)
                ),
                node(
                    'strong',
                    'grammar-highlight',
                    match[0]
                )
            );

            offset = match.index + match[0].length;
        }

        span.append(
            document.createTextNode(text.slice(offset))
        );

        return span;
    }

    function makeExample(parent) {
        const box = node('div', 'example-box');
        const table = node('table', 'drill-example-table');
        const body = node('tbody');

        const question = node('tr');
        const label = node('td');

        label.append(
            node('strong', 'example-label-title', 'Question:')
        );

        const cues = node('td');
        cues.innerHTML = cue(example);

        const sound = node('td');
        sound.append(listen(() => model(example, 'q')));

        const type = node('td');
        type.append(node('span', 'tense-badge tense-badge--present-state', '⏳Present State'));

        const text = node('td');
        text.append(
            highlighted(display(model(example, 'q')))
        );

        question.append(
            label,
            cues,
            node('td', '', '👉'),
            sound,
            type,
            text
        );

        const response = node('tr');
        const responseLabel = node('td');

        responseLabel.append(
            node('strong', 'example-label-title', 'Response:')
        );

        const answers = node('td');
        answers.colSpan = 5;

        ['yes', 'no'].forEach((kind, index) => {
            if (index) {
                answers.append(
                    document.createTextNode(' ↔️ ')
                );
            }

            answers.append(
                listen(
                    () => model(example, kind),
                    index ? '🔊🙅' : '🔊🙆'
                ),
                document.createTextNode(' '),
                highlighted(display(model(example, kind)))
            );
        });

        response.append(responseLabel, answers);
        body.append(question, response);
        table.append(body);
        box.append(table);
        parent.append(box);
    }

    const answerControls = [];

    function recordingRow(
        body,
        item,
        index,
        kind,
        cueCell,
        state
    ) {
        const question = kind === 'q';
        const ready = question || Boolean(state.answer);
        const selected = question ? 'q' : state.answer;

        const key =
            `p72_d2_${index}_${selected || 'answer'}`;

        const getText = () => ready
            ? model(item, selected)
            : '';

        const row = node('tr');

        if (question) {
            const number = node(
                'td',
                'drill-number-cell',
                `${index + 1}.`
            );

            number.rowSpan = 2;
            row.append(number);
        }

        const cell = node('td');
        const layout = node('div', 'recording-controls');
        const actions = node('div', 'recording-actions');

        const sound = listen(getText);

        const record = button(
            '🎙️とる',
            'Record your sentence.',
            () => {}
        );

        const stop = button(
            '⏹️',
            'Stop active recording.',
            () => {}
        );

        record.onclick = null;
        stop.onclick = null;
        stop.disabled = true;

        const shown = node('span');

        const property = question
            ? 'questionText'
            : `${selected}Text`;

        const updateText = () => {
            shown.textContent =
                ready && state[property]
                    ? display(getText())
                    : '';

            text.firstChild.textContent =
                ready && state[property]
                    ? '🕶️Hide'
                    : '👀Text';
        };

        const text = button(
            '👀Text',
            'Show or hide the model answer.',
            () => {
                state[property] = !state[property];
                updateText();
            }
        );

        updateText();

        actions.append(
            sound,
            record,
            stop,
            text,
            shown
        );

        const result = node(
            'span',
            'result-text',
            '(Not recorded yet)'
        );

        const wrap = node('span', 'recording-result');
        wrap.append(result);
        layout.append(actions, wrap);

        const correction = node('div', 'correction-box');

        const correctionListen = node(
            'button',
            'example-button'
        );

        correctionListen.type = 'button';
        correctionListen.hidden = true;

        const correctionText = node('span');

        correction.append(
            correctionListen,
            correctionText
        );

        cell.append(layout, correction);
        row.append(cueCell, cell);
        body.append(row);

        if (ready) {
            bindRecorderEvents(
                record,
                stop,
                result,
                correction,
                correctionListen,
                correctionText,
                () => practice7ToHiragana(getText()),
                getText,
                0.8,
                key
            );
        } else {
            sound.disabled = true;
            record.disabled = true;
            text.disabled = true;

            answerControls.push(sound, record, text);
        }
    }

    const baseSync = practice7SyncRecordingUI;

    practice7SyncRecordingUI = function() {
        baseSync();

        answerControls.forEach(control => {
            control.disabled = true;
        });
    };

    const baseRender = renderAll;

    renderAll = function() {
        if (blocked()) return;

        baseRender();

        const root = document.getElementById(
            'drill1Container'
        );

        if (!root) return;

        const englishPanel = document.getElementById(
            'practice7Drill2Panel'
        );

        const title = englishPanel?.querySelector(
            '.info-panel-title'
        );

        if (title) {
            title.textContent = title.textContent.replace(
                /^Drill 2:/,
                'Drill 3:'
            );
        }

        answerControls.length = 0;

        const section = node(
            'section',
            'practice-section practice-qa-section'
        );

        section.id = 'practice72QuestionSection';

        makeExample(section);

        const panel = node(
            'div',
            'info-panel info-panel-task1'
        );

        panel.append(
            node(
                'span',
                'info-panel-title',
                'Drill 2: Ask and answer — Present State'
            ),
            node(
                'span',
                'info-panel-desc',
                '💡Ask about a present state. ' +
                'Choose 🙆 or 🙅, then record your answer.'
            )
        );

        section.append(panel);

        targets.forEach((item, index) => {
            const state = states[index];
            const card = node('div', 'drill-row');
            const table = node('table', 'recording-table');
            const columns = node('colgroup');

            for (let i = 0; i < 3; i++) {
                columns.append(node('col'));
            }

            columns.children[0].style.width = '34px';

            const body = node('tbody');
            table.append(columns, body);

            const cues = node('td', 'drill-cue-cell');
            cues.innerHTML = cue(item);

            recordingRow(
                body,
                item,
                index,
                'q',
                cues,
                state
            );

            const choices = node('td', 'drill-cue-cell');

            ['yes', 'no'].forEach((kind, i) => {
                const choice = button(
                    i ? '🙅' : '🙆',
                    i
                        ? 'Negative response'
                        : 'Affirmative response',
                    () => {
                        state.answer = kind;
                        stopAllPlayback();
                        renderAll();
                    }
                );

                choice.classList.add('answer-choice');
                choice.dataset.answer = kind;

                choice.setAttribute(
                    'aria-pressed',
                    String(state.answer === kind)
                );

                choices.append(choice);
            });

            recordingRow(
                body,
                item,
                index,
                'a',
                choices,
                state
            );

            card.append(table);
            section.append(card);
        });

        root.insertBefore(section, englishPanel || null);

        let width = 0;

        const cells = section.querySelectorAll(
            '.recording-table .drill-cue-cell'
        );

        cells.forEach(cell => {
            const measure = cell.cloneNode(true);

            measure.querySelectorAll(
                '.tooltip-tip,.custom-tip-box'
            ).forEach(t => t.remove());

            Object.assign(measure.style, {
                position: 'absolute',
                visibility: 'hidden',
                display: 'inline-block',
                width: 'max-content',
                whiteSpace: 'nowrap',
                font: 'inherit'
            });

            cell.append(measure);

            width = Math.max(
                width,
                Math.ceil(
                    measure.getBoundingClientRect().width
                )
            );

            measure.remove();
        });

        section.querySelectorAll(
            '.recording-table colgroup'
        ).forEach(columns => {
            columns.children[1].style.width =
                `${width + 4}px`;
        });

        practice7SyncRecordingUI();
    };
});
// ============================================================================
// Practice 7.2: ているform② Present State
// ============================================================================

const practice7Data = [
    {
        x: "よる10じ",
        xKanji: "夜10時",
        xRomaji: "yoru jū-ji",
        xMeaning: "10 o'clock at night",
        y: "ねる",
        yKanji: "寝る",
        yRomaji: "neru",
        yMeaning: "to sleep / go to bed",
        pastSentence: "夜10時に寝ました。",
        pastSentenceHira: "よる10じに、ねました。",
        perfectSentence: "夜10時から寝ています。",
        perfectSentenceHira: "よる10じから、ねています。"
    },
    {
        x: "さっき",
        xKanji: "さっき",
        xRomaji: "sakki",
        xMeaning: "a little while ago",
        y: "Tシャツをきる",
        yKanji: "Tシャツを着る",
        yRomaji: "tīshatsu o kiru",
        yMeaning: "to put on / wear a T-shirt",
        pastSentence: "さっきTシャツを着ました。",
        pastSentenceHira: "さっきTしゃつを、きました。",
        perfectSentence: "さっきからTシャツを着ています。",
        perfectSentenceHira: "さっきから、Tしゃつを、きています。"
    },
    {
        x: "おしょうがつ",
        xKanji: "お正月",
        xRomaji: "oshōgatsu",
        xMeaning: "New Year",
        y: "ふとる",
        yKanji: "太る",
        yRomaji: "futoru",
        yMeaning: "to gain weight",
        pastSentence: "お正月に太りました。",
        pastSentenceHira: "おしょうがつに、ふとりました。",
        perfectSentence: "お正月から太っています。",
        perfectSentenceHira: "おしょうがつから、ふとっています。"
    },
    {
        x: "なつやすみ",
        xKanji: "夏休み",
        xRomaji: "natsuyasumi",
        xMeaning: "summer vacation",
        y: "やせる",
        yKanji: "やせる",
        yRomaji: "yaseru",
        yMeaning: "to lose weight",
        pastSentence: "夏休みにやせました。",
        pastSentenceHira: "なつやすみに、やせました。",
        perfectSentence: "夏休みからやせています。",
        perfectSentenceHira: "なつやすみから、やせています。"
    },
    {
        x: "3ねんまえ",
        xKanji: "3年前",
        xRomaji: "san-nen mae",
        xMeaning: "three years ago",
        y: "けっこんする",
        yKanji: "結婚する",
        yRomaji: "kekkon suru",
        yMeaning: "to get married",
        pastSentence: "3年前に結婚しました。",
        pastSentenceHira: "3ねんまえに、けっこんしました。",
        perfectSentence: "3年前から結婚しています。",
        perfectSentenceHira: "3ねんまえから、けっこんしています。"
    },
    {
        x: "かんじ50こ",
        xKanji: "漢字50個",
        xRomaji: "kanji gojūkko",
        xMeaning: "50 kanji characters",
        y: "おぼえる",
        yKanji: "覚える",
        yRomaji: "oboeru",
        yMeaning: "to memorize / remember",
        pastSentence: "漢字を50個覚えました。",
        pastSentenceHira: "かんじを50こ、おぼえました。",
        perfectSentence: "漢字を50個覚えています。",
        perfectSentenceHira: "かんじを50こ、おぼえています。"
    },
    {
        x: "ているForm",
        xKanji: "ているForm",
        xRomaji: "te iru form",
        xMeaning: "the te-iru form",
        y: "しる",
        yKanji: "知る",
        yRomaji: "shiru",
        yMeaning: "to learn of / know",
        pastSentence: "ているフォームを知りました。",
        pastSentenceHira: "ているふぉーむを、しりました。",
        perfectSentence: "ているフォームを知っています。",
        perfectSentenceHira: "ているふぉーむを、しっています。"
    }
].map(item => ({
    ...item,
    xKanji: DrillAnswer.kanjiNumbers(item.xKanji),
    yKanji: DrillAnswer.kanjiNumbers(item.yKanji),
    pastSentence: DrillAnswer.kanjiNumbers(item.pastSentence),
    perfectSentence: DrillAnswer.kanjiNumbers(item.perfectSentence)
}));

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "kanji"; // デフォルトはWith漢字
let isAutoPlay = true;
let activeRecognitionSession = null;

const practice7State = {
    audioUrls: {},
    savedResults: {}
};

const VOICE_STORAGE_KEY = "october2026.selectedVoiceName";
let preferredVoice = null;

function voicePriorityRank(v) {
    if (DrillAudio.isChromeJapanese3(v)) return -1;
    const name = (v && v.name) ? v.name : "";
    if (/chrome os/i.test(name)) return 0;
    if (/google/i.test(name)) return 1;
    if (/nanami/i.test(name)) return 2;
    if (/keita/i.test(name)) return 3;
    if (/haruka/i.test(name)) return 4;
    return 5;
}

function setupPreferredVoice() {
    try {
        const voices =
            typeof speechSynthesis !== "undefined"
                ? speechSynthesis.getVoices()
                : [];

        const japanese = (voices || [])
            .filter(v => v && v.lang && /^ja(?:$|[-_])/i.test(v.lang))
            .sort((a, b) => voicePriorityRank(a) - voicePriorityRank(b));

        let savedName = null;
        try {
            savedName = localStorage.getItem(VOICE_STORAGE_KEY);
        } catch (e) {}

        let selected = savedName
            ? japanese.find(v => v.name === savedName)
            : null;

        if (!selected) {
            selected = japanese[0] || null;
        }

        preferredVoice = selected;

        const selectEl = document.getElementById("voiceSelect");
        if (selectEl) {
            selectEl.setAttribute("translate", "no");
            selectEl.classList.add("notranslate", "is-enhanced");

            const labelEl = document.querySelector('label[for="voiceSelect"]');
            if (labelEl) {
                labelEl.setAttribute("for", "voiceDropdownBtn");
            }

            let dropdownEl = document.getElementById("voiceDropdown");
            if (!dropdownEl) {
                dropdownEl = document.createElement("div");
                dropdownEl.id = "voiceDropdown";
                dropdownEl.className = "voice-dropdown notranslate";
                dropdownEl.setAttribute("translate", "no");

                const btn = document.createElement("button");
                btn.type = "button";
                btn.id = "voiceDropdownBtn";
                btn.className = "voice-dropdown-btn notranslate";
                btn.setAttribute("translate", "no");
                btn.setAttribute("aria-haspopup", "listbox");
                btn.setAttribute("aria-expanded", "false");

                const btnLabel = document.createElement("span");
                btnLabel.className = "voice-dropdown-btn-label";

                const btnArrow = document.createElement("span");
                btnArrow.className = "voice-dropdown-btn-arrow";
                btnArrow.setAttribute("aria-hidden", "true");
                btnArrow.textContent = "▾";

                btn.append(btnLabel, btnArrow);

                const menu = document.createElement("ul");
                menu.id = "voiceDropdownMenu";
                menu.className = "voice-dropdown-menu notranslate";
                menu.setAttribute("translate", "no");
                menu.setAttribute("role", "listbox");
                menu.hidden = true;

                dropdownEl.append(btn, menu);
                selectEl.insertAdjacentElement("afterend", dropdownEl);

                btn.addEventListener("click", event => {
                    event.stopPropagation();
                    if (btn.disabled) return;
                    const willOpen = menu.hidden;
                    menu.hidden = !willOpen;
                    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
                });

                document.addEventListener("click", event => {
                    if (!dropdownEl.contains(event.target)) {
                        menu.hidden = true;
                        btn.setAttribute("aria-expanded", "false");
                    }
                });

                document.addEventListener("keydown", event => {
                    if (event.key === "Escape" && !menu.hidden) {
                        menu.hidden = true;
                        btn.setAttribute("aria-expanded", "false");
                    }
                });
            }

            const btn = document.getElementById("voiceDropdownBtn");
            const btnLabel = dropdownEl.querySelector(".voice-dropdown-btn-label");
            const menu = document.getElementById("voiceDropdownMenu");

            if (!selectEl.dataset.bound) {
                selectEl.dataset.bound = "true";
                selectEl.addEventListener("change", () => {
                    try {
                        localStorage.setItem(
                            VOICE_STORAGE_KEY,
                            selectEl.value
                        );
                    } catch (e) {}
                    setupPreferredVoice();
                });
            }

            const signature = japanese.map(v => v.name).join("||");
            if (selectEl.dataset.voicesSignature !== signature) {
                selectEl.dataset.voicesSignature = signature;
                selectEl.replaceChildren();
                if (menu) menu.replaceChildren();

                if (!japanese.length) {
                    const opt = document.createElement("option");
                    opt.value = "";
                    opt.textContent = "No Japanese voice available";
                    selectEl.append(opt);
                    selectEl.disabled = true;
                    if (btn) btn.disabled = true;
                    if (btnLabel) btnLabel.textContent = "No Japanese voice available";
                    if (menu) menu.hidden = true;
                } else {
                    selectEl.disabled = false;
                    if (btn) btn.disabled = false;
                    japanese.forEach(v => {
                        const opt = document.createElement("option");
                        opt.value = v.name;
                        opt.textContent = v.name;
                        opt.setAttribute("translate", "no");
                        opt.className = "notranslate";
                        selectEl.append(opt);

                        if (menu) {
                            const item = document.createElement("li");
                            item.className = "voice-dropdown-item notranslate";
                            item.setAttribute("translate", "no");
                            item.setAttribute("role", "option");
                            item.dataset.voiceName = v.name;
                            item.textContent = v.name;
                            item.addEventListener("click", event => {
                                event.stopPropagation();
                                try {
                                    localStorage.setItem(VOICE_STORAGE_KEY, v.name);
                                } catch (e) {}
                                menu.hidden = true;
                                if (btn) btn.setAttribute("aria-expanded", "false");
                                setupPreferredVoice();
                            });
                            menu.append(item);
                        }
                    });
                }
            }

            if (selected && selectEl.value !== selected.name) {
                selectEl.value = selected.name;
            }
            if (btnLabel && japanese.length) {
                btnLabel.textContent = selected ? selected.name : japanese[0].name;
            }
            if (menu) {
                Array.from(menu.children).forEach(item => {
                    const isSelected = Boolean(
                        selected && item.dataset.voiceName === selected.name
                    );
                    item.classList.toggle("is-selected", isSelected);
                    item.setAttribute("aria-selected", isSelected ? "true" : "false");
                });
            }
        }
    } catch (e) {
        console.warn("Voice setup error:", e);
    }
}

if (typeof speechSynthesis !== "undefined") {
    setupPreferredVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => setupPreferredVoice();
    }
}

let currentPlayingAudio = null;
let currentPlayTimeoutId = null;
let activePlayButtons = [];
let currentUtteranceRef = null;

function setPlayingStateMultiple(buttons, text) {
    stopAllPlayback();
    activePlayButtons = buttons;

    buttons.forEach(btn => {
        if (!btn) return;
        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }
        btn.disabled = true;
        btn.textContent = text;
    });
}

function restorePlayButtons() {
    activePlayButtons.forEach(btn => {
        if (!btn) return;
        btn.disabled = false;
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
        } else {
            btn.innerHTML = "Play";
        }
    });
    activePlayButtons = [];
}

function stopAllPlayback() {
    DrillAudio.invalidatePlayback();
    // Detach callbacks before cancel: browsers may deliver an error synchronously.
    if (currentUtteranceRef) {
        currentUtteranceRef.onend = null;
        currentUtteranceRef.onerror = null;
    }
    if (currentPlayingAudio) {
        currentPlayingAudio.onended = null;
        currentPlayingAudio.onerror = null;
    }
    if (currentPlayTimeoutId) {
        clearTimeout(currentPlayTimeoutId);
        currentPlayTimeoutId = null;
    }

    try {
        speechSynthesis.cancel();
    } catch (e) {}

    currentUtteranceRef = null;

    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio = null;
    }

    restorePlayButtons();
}

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}

function speakText(text, rate = 0.8, onEndCallback) {
    setupPreferredVoice();

    // 読み上げ専用。表示文・判定文には反映しない。
    const speechText = String(text ?? "")
        .replace(/朝(?:五|5)時に(?=起き)/g, "朝五時に、")
        .replace(/朝(?:五|5)時から(?=起き)/g, "朝五時から、")
        .replace(/夜(?:十|10)時に(?=寝)/g, "夜十時に、")
        .replace(/夜(?:十|10)時から(?=寝)/g, "夜十時から、")
        .replace(/さっきから(?=Tシャツ)/g, "さっきから、")
        .replace(/さっき(?=Tシャツ)/g, "さっき、")
        .replace(/お正月に(?=太)/g, "お正月に、")
        .replace(/お正月から(?=太)/g, "お正月から、")
        .replace(/夏休みに(?=やせ)/g, "夏休みに、")
        .replace(/夏休みから(?=やせ)/g, "夏休みから、")
        .replace(/漢字を(?:五十|50)個(?=覚え)/g, "漢字を五十個、")
        .replace(/(?:三|3)年前に(?=結婚)/g, "三年前に、")
        .replace(/(?:三|3)年前から(?=結婚)/g, "三年前から、")
        .replace(/ているフォームを(?=知)/g, "ているフォームを、");

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "ja-JP";
    utterance.rate = rate;

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    currentUtteranceRef = utterance;

    utterance.onend = () => {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    };

    try {
        DrillAudio.speak(utterance);
    } catch (err) {
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    renderAll();
    setupFooterGuide();
});

function setupFooterGuide() {
    setupPreferredVoice();
}

function formatWord(word, kanji, romaji, meaning) {
    const displayWord =
        (scriptMode === "kanji" && kanji) ? kanji : word;

    const hintStr = `${romaji}, ${meaning}`;

    if (hintMode === "off") {
        return `<span class="target-word">${displayWord}</span>`;
    }

    if (hintMode === "paren") {
        return `<span class="target-word">${displayWord}</span><span class="vocab-inline">(${hintStr})</span>`;
    }

    return `
        <span class="tooltip-wrap">
            <span class="target-word">${displayWord}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
}

function initSettingsPanel() {
    const scriptControl = document.getElementById("scriptModeControl");
    const hintControl = document.getElementById("hintModeControl");

    function updateSegmentedSelection(control, selectedValue) {
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === selectedValue;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    if (scriptControl) {
        updateSegmentedSelection(scriptControl, scriptMode);

        scriptControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");
            if (!button || !scriptControl.contains(button)) return;

            const value = button.dataset.value;
            if (value !== "hiragana" && value !== "kanji") return;
            if (value === scriptMode) return;

            scriptMode = value;
            updateSegmentedSelection(scriptControl, scriptMode);
            renderAll();
        });
    }

    if (hintControl) {
        updateSegmentedSelection(hintControl, hintMode);

        hintControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");
            if (!button || !hintControl.contains(button)) return;

            const value = button.dataset.value;
            if (!["off", "hover", "paren"].includes(value)) return;
            if (value === hintMode) return;

            hintMode = value;
            updateSegmentedSelection(hintControl, hintMode);
            renderAll();
        });
    }

    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = !isManualStop;
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);

        toggleRecordMode.addEventListener("change", event => {
            isManualStop = !event.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        });
    }

    const togglePlaybackMode = document.getElementById("togglePlaybackMode");
    const labelAutoPlay = document.getElementById("labelAutoPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.checked = isAutoPlay;
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);

        togglePlaybackMode.addEventListener("change", event => {
            isAutoPlay = event.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        });
    }
}

function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;

    labelEl.className = `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    const emoji = labelEl.querySelector(".icon-emoji");

    if (emoji) {
        if (isActive) {
            emoji.style.filter = "none";
            emoji.style.opacity = "1";
        } else {
            emoji.style.filter = "grayscale(100%)";
            emoji.style.opacity = "0.55";
        }
    }
}

function renderAll() {
    renderDrill1Section();

    const container = document.getElementById('drill1Container');
    if (!container) return;

    const instruction = container.querySelector('.info-panel-desc');

    if (instruction) {
        instruction.innerHTML =
            '💡Compare a past action with the state that continues now. ' +
            'Use <strong class="grammar-highlight">から</strong> ' +
            'after a time expression to show when that state began.';
    }
}

function renderDrill1Section() {
    let container = document.getElementById('drill1Container');

    if (!container) {
        container = document.createElement('div');
        container.id = 'drill1Container';

        document.body.insertBefore(
            container,
            document.querySelector('.voice-guide-footer')
        );
    }

    container.replaceChildren();

    const example = document.createElement('div');
    example.className = 'example-box';

    const time = formatWord(
        'あさ5じ',
        '朝五時',
        'asa go-ji',
        "5 o'clock in the morning"
    );

    const verb = formatWord(
        'おきる',
        '起きる',
        'okiru',
        'to wake up / get up'
    );

    const stem = scriptMode === 'kanji' ? '起き' : 'おき';

    example.innerHTML = `
        <div class="example-line">
            <strong class="example-label-title">Past:</strong>
            ${time}／${verb}
            <span>👉</span>
            <button
                id="exPastListen"
                type="button"
                class="example-button"
            >🔊きく</button>
            <span class="tense-badge tense-badge--past">⏪Past</span>
            <span>${time}に${stem}<strong class="grammar-highlight">ました</strong>。</span>
        </div>

        <div class="example-line">
            <strong class="example-label-title">Present State:</strong>
            ${time}／${verb}
            <span>👉</span>
            <button
                id="exPerfListen"
                type="button"
                class="example-button"
            >🔊きく</button>
            <span class="tense-badge tense-badge--present-state">⏳Present State</span>
            <span>${time}<strong class="grammar-highlight">から</strong>${stem}<strong class="grammar-highlight">ています</strong>。</span>
        </div>
    `;

    container.append(example);

    [
        ['exPastListen', '朝五時に起きました。'],
        ['exPerfListen', '朝五時から起きています。']
    ].forEach(([id, model]) => {
        const button = document.getElementById(id);

        button.onclick = () => {
            setPlayingStateMultiple([button], 'Playing...');
            speakText(model, 0.8, () => stopAllPlayback());
        };
    });

    const panel = document.createElement('div');
    panel.className = 'info-panel info-panel-task1';

    panel.innerHTML = `
        <span class="info-panel-title">
            Drill 1: Compare Past & Present State
        </span>
        <span class="info-panel-desc"></span>
    `;

    const list = document.createElement('div');
    list.id = 'drill1List';

    container.append(panel, list);

    practice7Data.forEach((item, index) => {
        createPractice7TableCard(
            list,
            `${index + 1}.`,
            item,
            index,
            0.8
        );
    });
}

function createPractice7TableCard(
    container,
    indexLabel,
    item,
    rowIndex,
    playRate
) {
    const card = document.createElement('div');
    card.className = 'drill-row';

    const table = document.createElement('table');
    table.className = 'recording-table';

    const body = document.createElement('tbody');
    table.append(body);

    const number = document.createElement('td');
    number.className = 'drill-number-cell';
    number.rowSpan = 2;
    number.textContent = indexLabel;

    const cue = document.createElement('td');
    cue.className = 'prompt-label drill-cue-cell';
    cue.rowSpan = 2;

    const parts = item.xKanji === '漢字50個'
        ? [
            formatWord(
                'かんじ',
                '漢字',
                'kanji',
                'kanji characters'
            ),
            formatWord(
                '50こ',
                '50個',
                'gojūkko',
                '50 items'
            )
        ]
        : [
            formatWord(
                item.x,
                item.xKanji,
                item.xRomaji,
                item.xMeaning
            )
        ];

    parts.push(
        formatWord(
            item.y,
            item.yKanji,
            item.yRomaji,
            item.yMeaning
        )
    );

    cue.innerHTML = parts.join('／');

    const makeButton = (label, tip) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'example-button custom-tip-wrap';

        const tooltip = document.createElement('span');
        tooltip.className = 'custom-tip-box';
        tooltip.textContent = tip;

        button.append(
            document.createTextNode(label),
            tooltip
        );

        return button;
    };

    [
        [
            'past',
            'pastSentence',
            'pastSentenceHira',
            '⏪Past',
            'tense-badge--past',
            'past tense'
        ],
        [
            'perf',
            'perfectSentence',
            'perfectSentenceHira',
            '⏳Present State',
            'tense-badge--present-state',
            'Present State'
        ]
    ].forEach(([
        kind,
        kanjiKey,
        hiraKey,
        label,
        badgeClass,
        description
    ], index) => {
        const row = document.createElement('tr');

        if (index === 0) {
            row.append(number, cue);
        }

        const cell = document.createElement('td');

        const layout = document.createElement('div');
        layout.className = 'recording-controls';

        const actions = document.createElement('div');
        actions.className = 'recording-actions';

        const listen = makeButton(
            '🔊きく',
            `Listen to ${description}.`
        );

        const badge = document.createElement('span');
        badge.className = `tense-badge ${badgeClass}`;
        badge.textContent = label;

        const record = makeButton(
            '🎙️とる',
            `Record ${description}.`
        );

        const stop = makeButton(
            '⏹️',
            'Stop active recording.'
        );

        stop.disabled = true;

        const resultWrap = document.createElement('span');
        resultWrap.className = 'recording-result';

        const result = document.createElement('span');
        result.className = 'result-text';
        result.textContent = '(Not recorded yet)';

        resultWrap.append(result);
        actions.append(listen, badge, record, stop);
        layout.append(actions, resultWrap);

        const correction = document.createElement('div');
        correction.className = 'correction-box';

        const correctionListen = document.createElement('button');
        correctionListen.type = 'button';
        correctionListen.className = 'example-button';
        correctionListen.textContent = '🔊きく';
        correctionListen.hidden = true;

        const correctionText = document.createElement('span');

        correction.append(
            correctionListen,
            correctionText
        );

        cell.append(layout, correction);
        row.append(cell);
        body.append(row);

        listen.onclick = () => {
            setPlayingStateMultiple([listen], 'Playing...');

            speakText(
                item[kanjiKey],
                playRate,
                () => stopAllPlayback()
            );
        };

        bindRecorderEvents(
            record,
            stop,
            result,
            correction,
            correctionListen,
            correctionText,
            () => item[hiraKey],
            () => item[kanjiKey],
            playRate,
            `p7_drill_${kind}_${rowIndex}`
        );
    });

    const notes = {
        '覚える': {
            kanji: ['覚えました', '覚えています'],
            hiragana: ['おぼえました', 'おぼえています'],
            english: ['memorized', 'remember']
        },
        '知る': {
            kanji: ['知りました', '知っています'],
            hiragana: ['しりました', 'しっています'],
            english: ['learned', 'know']
        }
    };

    const note = notes[item.yKanji];

    if (note) {
        const row = document.createElement('tr');
        row.className = 'meaning-change-row';

        row.dataset.pastKey = `p7_drill_past_${rowIndex}`;
        row.dataset.perfectKey = `p7_drill_perf_${rowIndex}`;

        row.hidden = !(
            practice7State.audioUrls[row.dataset.pastKey] ||
            practice7State.audioUrls[row.dataset.perfectKey]
        );

        const spacer = document.createElement('td');
        spacer.colSpan = 2;

        const cell = document.createElement('td');
        cell.className = 'meaning-change-note';

        const title = document.createElement('div');
        title.className = 'meaning-change-note-title';
        title.textContent = '✨Notice the meaning change:';

        const comparison = document.createElement('strong');
        comparison.className = 'meaning-change-comparison';

        const forms = scriptMode === 'hiragana'
            ? note.hiragana
            : note.kanji;

        comparison.textContent =
            `${forms[0]} = ${note.english[0]} / ` +
            `${forms[1]} = ${note.english[1]}`;

        cell.append(title, comparison);
        row.append(spacer, cell);
        body.append(row);
    }

    practice7State.refreshMeaningNotes = () => {
        document.querySelectorAll(
            '#drill1Container .meaning-change-row'
        ).forEach(row => {
            row.hidden = !(
                practice7State.audioUrls[row.dataset.pastKey] ||
                practice7State.audioUrls[row.dataset.perfectKey]
            );
        });
    };

    card.append(table);
    container.append(card);
}

// ============================================================================
// Practice 7.2: Recognition, Recording & Result Display
// ============================================================================

// 実際の認識結果を、このページで扱う語句の範囲で変換する。
// モデル文そのものへの置き換えは行わない。
function practice7ToHiragana(text) {
    let value = DrillAnswer.numbers(text);

    const dictionary = [
        ["お正月", "おしょうがつ"],
        ["夏休み", "なつやすみ"],
        ["結婚", "けっこん"],
        ["漢字", "かんじ"],
        ["年前", "ねんまえ"],
        ["覚", "おぼ"],
        ["知", "し"],
        ["起", "お"],
        ["寝", "ね"],
        ["着", "き"],
        ["太", "ふと"],
        ["痩", "や"],
        ["朝", "あさ"],
        ["夜", "よる"],
        ["時", "じ"],
        ["個", "こ"]
    ];

    for (const [from, to] of dictionary) {
        value = value.split(from).join(to);
    }

    return value
        .replace(/[ァ-ヶ]/g, character =>
            String.fromCharCode(character.charCodeAt(0) - 96)
        )
        .replace(/五十(?=こ)/g, "50")
        .replace(/十(?=じ)/g, "10")
        .replace(/五(?=じ)/g, "5")
        .replace(/三(?=ねんまえ)/g, "3")
        .replace(
            /(?:t\s*しゃつ|てぃー\s*しゃつ|てぃ\s*しゃつ)/gi,
            "Tしゃつ"
        )
        .replace(/ふぉーむ|form/gi, "Form");
}

function practice7Normalize(text) {
    return practice7ToHiragana(text)
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, "")
        .replace(/(?:よね|よ|ね)$/, "")
        .replace(
            /^(おしょうがつ|なつやすみ|3ねんまえ)に/,
            "$1"
        );
}

function practice7DiffTokens(text) {
    const value = String(text ?? "").normalize("NFKC");
    const chars = Array.from(value);
    const tokens = [];

    const units = [
        "お正月", "夏休み", "結婚", "漢字", "年前",
        "おしょうがつ", "なつやすみ", "3ねんまえ",
        "3年前",
        "フォーム", "ふぉーむ", "Form", "form", "FORM",
        "Tシャツ", "Tしゃつ", "tしゃつ",
        "ティーシャツ", "てぃーしゃつ",
        "ティシャツ", "てぃしゃつ",
        "五十個", "五十こ", "三年前", "十時", "五時",
        "覚", "知", "起", "寝", "着", "太", "痩",
        "朝", "夜", "時", "個"
    ].sort((a, b) => b.length - a.length);

    const timeWord =
        /^(おしょうがつ|なつやすみ|3ねんまえ)$/;

    const suffix = value.match(
        /(?:よね|よ|ね)[。！？!?\s]*$/
    );

    const limit = suffix
        ? Array.from(value.slice(0, suffix.index)).length
        : chars.length;

    for (let index = 0; index < limit;) {
        const rest = chars.slice(index, limit).join("");

        const spacedShirt = rest.match(
            /^(?:t\s*しゃつ|t\s*シャツ|てぃー\s*しゃつ|ティー\s*シャツ)/i
        );

        const unit =
            spacedShirt?.[0] ||
            units.find(word => rest.startsWith(word)) ||
            chars[index];

        const length = Array.from(unit).length;

        const reading = practice7ToHiragana(unit)
            .toLowerCase()
            .replace(/[\s、。,.!?！？「」『』・]/g, "");

        // 時間表現の置き換えを欠落と誤認しない。
        const comparisonUnits = timeWord.test(reading)
            ? [reading]
            : Array.from(reading);

        for (const character of comparisonUnits) {
            tokens.push({
                character,
                start: index,
                end: index + length
            });
        }

        index += length;
    }

    // この３つの時間表現だけ「に」の省略を許容。
    if (
        timeWord.test(tokens[0]?.character || "") &&
        tokens[1]?.character === "に"
    ) {
        tokens.splice(1, 1);
    }

    return { chars, tokens };
}

function practice7FindDiff(actual, reference) {
    const a = practice7DiffTokens(actual);
    const b = practice7DiffTokens(reference);

    const rows = a.tokens.length;
    const columns = b.tokens.length;

    const costs = Array.from(
        { length: rows + 1 },
        () => Array(columns + 1).fill(0)
    );

    for (let i = 0; i <= rows; i++) {
        costs[i][0] = i;
    }

    for (let j = 0; j <= columns; j++) {
        costs[0][j] = j;
    }

    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= columns; j++) {
            const same =
                a.tokens[i - 1].character ===
                b.tokens[j - 1].character;

            costs[i][j] = Math.min(
                costs[i - 1][j - 1] + (same ? 0 : 1),
                costs[i - 1][j] + 1,
                costs[i][j - 1] + 1
            );
        }
    }

    const redIndexes = new Set();
    const gaps = new Set();

    const markToken = token => {
        for (
            let index = token.start;
            index < token.end;
            index++
        ) {
            redIndexes.add(index);
        }
    };

    let i = rows;
    let j = columns;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0) {
            const same =
                a.tokens[i - 1].character ===
                b.tokens[j - 1].character;

            if (
                costs[i][j] ===
                costs[i - 1][j - 1] + (same ? 0 : 1)
            ) {
                if (!same) {
                    markToken(a.tokens[i - 1]);
                }

                i--;
                j--;
                continue;
            }
        }

        if (
            j > 0 &&
            costs[i][j] === costs[i][j - 1] + 1
        ) {
            const position = i < rows
                ? a.tokens[i].start
                : rows > 0
                    ? a.tokens[rows - 1].end
                    : 0;

            gaps.add(position);
            j--;
            continue;
        }

        if (i > 0) {
            markToken(a.tokens[i - 1]);
            i--;
        }
    }


    return {
        cost: costs[rows][columns],
        chars: a.chars,
        redIndexes,
        gaps
    };
}

function practice7ShowResult(view, saved, rowKey, playRate) {
    // 設定変更による再描画では、録音時の判定を保持する。
    if (typeof saved.isCorrect !== "boolean") {
        const normalized = practice7Normalize(
            saved.rawTranscript
        );

        saved.isCorrect = DrillAnswer.formAllowed(saved.rawTranscript) && normalized.length > 0 && [
            saved.expectedText,
            saved.modelText
        ].some(text =>
            typeof text === "string" &&
            text.length > 0 &&
            normalized === practice7Normalize(text)
        );
    }
    const displayed = scriptMode === "hiragana"
        ? practice7ToHiragana(saved.rawTranscript)
        : String(saved.rawTranscript ?? "");
    view.resultSpan.textContent = "";
    view.resultSpan.style.color = "var(--text-primary)";

    if (saved.isCorrect) {
        view.resultSpan.appendChild(
            document.createTextNode(displayed + " ✅ ")
        );
    } else {
        const references = [...new Set(
            [saved.expectedText, saved.modelText]
                .filter(text =>
                    typeof text === "string" &&
                    text.length > 0
                )
                .flatMap(text => [
                    text,
                    practice7ToHiragana(text)
                ])
        )];

        let best = null;

        for (const reference of references) {
            const diff = practice7FindDiff(
                displayed,
                reference
            );

            if (!best || diff.cost < best.cost) {
                best = diff;
            }
        }

        const appendRed = text => {
            const span = document.createElement("span");
            span.textContent = text;
            span.style.color = "var(--error-text)";
            view.resultSpan.appendChild(span);
        };

        if (best) {
            for (
                let index = 0;
                index <= best.chars.length;
                index++
            ) {
                if (best.gaps.has(index)) {
                    appendRed("＿");
                }

                if (index === best.chars.length) break;

                const character = best.chars[index];

                if (best.redIndexes.has(index)) {
                    appendRed(character);
                } else {
                    view.resultSpan.appendChild(
                        document.createTextNode(character)
                    );
                }
            }
        } else {
            view.resultSpan.appendChild(
                document.createTextNode(displayed)
            );
        }

        view.resultSpan.appendChild(
            document.createTextNode(" ")
        );
    }

    if (practice7State.audioUrls[rowKey]) {
        appendPersistedPlayButton(
            view.resultSpan, rowKey, playRate
        );
    }

    view.correctionBox.style.display =
        saved.isCorrect ? "none" : "block";

    if (!saved.isCorrect) {
        view.corrTextSpan.textContent =
            "🔥 Keep going! Try once more!";

        view.corrListenBtn.style.display = "inline-block";

        view.corrListenBtn.onclick = () => {
            if (
                activeRecognitionSession ||
                practice7State.startingRow
            ) {
                return;
            }

            setPlayingStateMultiple(
                [view.corrListenBtn],
                "Playing..."
            );

            speakText(
                saved.modelText,
                0.8,
                () => stopAllPlayback()
            );
        };
    }
}
function practice7SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession || practice7State.startingRow
    );

    practice7State.lockedControls ??= new Map();
    const locked = practice7State.lockedControls;

    const controls = document.querySelectorAll(
        "#drill1Container button, #drill1Container select, " +
        "#drill1Container input"
    );

    if (blocked) {
        controls.forEach(control => {
            if (!locked.has(control)) {
                locked.set(control, control.disabled);
            }
            control.disabled = true;
        });

        const session = activeRecognitionSession;
        const view = session
            ? practice7State.views?.[session.rowKey]
            : null;

        if (view) {
            const canStop =
                session.manual && !session.stopRequested;

            view.stopBtn.disabled = !canStop;
            view.stopBtn.classList.toggle(
                "stop-btn-active",
                canStop
            );
        }
    } else {
        locked.forEach((disabled, control) => {
            if (control.isConnected) {
                control.disabled = disabled;
            }
        });
        locked.clear();
    }

    controls.forEach(control => {
        control.style.setProperty(
            "cursor",
            control.disabled ? "not-allowed" : "pointer",
            "important"
        );
    });
}

function practice7ShowNotice(resultSpan, message) {
    if (!message) return;

    const notice = document.createElement("span");
    notice.textContent = message + " ";
    notice.style.color = "var(--text-secondary)";
    resultSpan.prepend(notice);
}

function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getExpectedTextFn,
    getExpectedKanjiFn,
    playRate,
    rowKey
) {
    practice7State.views ??= {};

    const view = {
        recordBtn, stopBtn, resultSpan,
        correctionBox, corrListenBtn, corrTextSpan
    };

    practice7State.views[rowKey] = view;

    const currentView = () =>
        practice7State.views[rowKey] || view;

    const restoreResult = message => {
        const v = currentView();
        const saved = practice7State.savedResults[rowKey];

        if (saved?.rawTranscript !== undefined) {
            practice7ShowResult(
                v, saved, rowKey, playRate
            );
        } else {
            v.resultSpan.textContent =
                saved?.text || "(Not recorded yet)";
            v.resultSpan.style.color =
                "var(--text-secondary)";
            v.correctionBox.style.display = "none";

            if (practice7State.audioUrls[rowKey]) {
                appendPersistedPlayButton(
                    v.resultSpan, rowKey, playRate
                );
            }
        }

        practice7ShowNotice(v.resultSpan, message);
    };

    restoreResult("");

    if (activeRecognitionSession?.rowKey === rowKey) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (practice7State.startingRow === rowKey) {
        resultSpan.textContent = "Preparing microphone...";
    }

    // 再描画後の新しいボタンにも録音中の制御を適用する。
    queueMicrotask(practice7SyncRecordingUI);

    recordBtn.addEventListener("click", async () => {
        if (
            recordBtn.disabled ||
            activeRecognitionSession ||
            practice7State.startingRow
        ) {
            return;
        }

        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!Recognition) {
            restoreResult(
                "Speech recognition is not supported."
            );
            return;
        }

        if (
            !navigator.mediaDevices?.getUserMedia ||
            !window.MediaRecorder
        ) {
            restoreResult("Recording is not supported.");
            return;
        }

        // 録音開始時の問題文・設定を固定する。
        const expectedText = getExpectedTextFn();
        const modelText = getExpectedKanjiFn();
        const manual = isManualStop;

        stopAllPlayback();
        practice7State.startingRow = rowKey;
        practice7SyncRecordingUI();

        let stream;

        try {
            stream = await DrillAudio.getUserMedia({
                audio: true
            });
        } catch (error) {
            if (error.name === "AbortError") return;
            practice7State.startingRow = null;
            practice7SyncRecordingUI();
            restoreResult("Microphone access denied.");
            practice7SyncRecordingUI();
            return;
        }

        practice7State.startingRow = null;

        const session = {
            rowKey,
            manual,
            stopRequested: false,
            finished: false,
            speechStarted: false,
            recognitionDone: false,
            recorderDone: false,
            discard: false,
            transcript: "",
            message: "",
            chunks: [],
            timers: [],
            context: null,
            recognition: null,
            recorder: null,
            stop: null
        };

        activeRecognitionSession = session;

        function clearMonitoring() {
            session.timers.forEach(id => {
                clearTimeout(id);
                clearInterval(id);
            });
            session.timers = [];

            if (session.context) {
                session.context.close().catch(() => {});
                session.context = null;
            }
        }

        function finish() {
            if (
                session.finished ||
                !session.recognitionDone ||
                !session.recorderDone
            ) {
                return;
            }

            session.finished = true;
            clearMonitoring();

            stream.getTracks().forEach(track => track.stop());

            if (session.recognition) {
                session.recognition.onend = null;
                session.recognition.onresult = null;
                session.recognition.onerror = null;
                session.recognition.onspeechstart = null;

                try {
                    session.recognition.abort();
                } catch (error) {}
            }

            if (activeRecognitionSession === session) {
                activeRecognitionSession = null;
            }

            const v = currentView();
            v.stopBtn.classList.remove("stop-btn-active");

            practice7SyncRecordingUI();

            const valid =
                !session.discard &&
                session.speechStarted &&
                session.chunks.some(chunk => chunk.size > 0);

            if (valid) {
                const blob = new Blob(session.chunks, {
                    type:
                        session.recorder.mimeType ||
                        "audio/webm"
                });

                const newUrl = URL.createObjectURL(blob);
                const oldUrl =
                    practice7State.audioUrls[rowKey];

                practice7State.audioUrls[rowKey] = newUrl;

                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl);
                }
            }

            session.chunks = [];

            if (valid && session.transcript.trim()) {
                processResult(
                    session.transcript,
                    expectedText,
                    () => modelText,
                    v.resultSpan,
                    v.correctionBox,
                    v.corrListenBtn,
                    v.corrTextSpan,
                    () => practice7State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

                practice7ShowNotice(
                    v.resultSpan,
                    session.message
                );
            } else {
                restoreResult(
                    session.message || "No speech recognized."
                );
            }

            practice7SyncRecordingUI();
        }

        function stop(message = "", discard = false) {
            if (
                session.finished ||
                session.stopRequested
            ) {
                return;
            }

            session.stopRequested = true;
            session.message = message;
            session.discard = discard;
            clearMonitoring();
            practice7SyncRecordingUI();

            if (session.recognition) {
                try {
                    session.recognition.stop();
                } catch (error) {
                    session.recognitionDone = true;
                }
            } else {
                session.recognitionDone = true;
            }

            if (
                !session.recorder ||
                session.recorder.state === "inactive"
            ) {
                session.recorderDone = true;
            } else {
                try {
                    session.recorder.stop();
                } catch (error) {
                    session.discard = true;
                    session.recorderDone = true;
                }
            }

            session.timers.push(setTimeout(() => {
                try {
                    session.recognition?.abort();
                } catch (error) {}

                session.recognitionDone = true;

                if (!session.recorderDone) {
                    session.discard = true;
                    session.recorderDone = true;
                }

                finish();
            }, 2500));

            finish();
        }

        session.stop = stop;

        try {
            const recognition = new Recognition();
            session.recognition = recognition;

            recognition.lang = "ja-JP";
            recognition.interimResults = true;
            recognition.continuous = true;

            session.lastSpeechAt = 0;

            const noteSpeech = () => {
                session.speechStarted = true;
                session.lastSpeechAt = performance.now();
            };

            recognition.onspeechstart = noteSpeech;

            recognition.onresult = event => {
                if (session.finished || session.discard) {
                    return;
                }

                for (
                    let index = event.resultIndex;
                    index < event.results.length;
                    index++
                ) {
                    const result = event.results[index];
                    const text = result[0].transcript;

                    if (text.trim()) {
                        noteSpeech();
                    }

                    if (result.isFinal) {
                        session.transcript += text;
                    }
                }
            };

            recognition.onerror = event => {
                if (
                    session.finished ||
                    session.stopRequested
                ) {
                    return;
                }

                if (event.error === "no-speech") return;

                session.recognitionDone = true;
                stop("Recognition error.", true);
            };

            recognition.onend = () => {
                if (session.finished) return;

                if (session.stopRequested) {
                    session.recognitionDone = true;
                    finish();
                    return;
                }

                // 文中の間で認識が終了しても録音を続ける。
                try {
                    recognition.start();
                } catch (error) {
                    session.recognitionDone = true;
                    stop(
                        "Could not restart recognition.",
                        true
                    );
                }
            };

            const recorder = new MediaRecorder(stream);
            session.recorder = recorder;

            recorder.ondataavailable = event => {
                if (
                    !session.finished &&
                    event.data.size > 0
                ) {
                    session.chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                session.recorderDone = true;
                finish();
            };

            recorder.onerror = () => {
                stop("Recording error.", true);
            };

            const v = currentView();
            v.resultSpan.textContent = "Recording...";
            v.resultSpan.style.color =
                "var(--accent-color)";
            v.correctionBox.style.display = "none";

            practice7SyncRecordingUI();

            recorder.start();
            recognition.start();

            try {
                const AudioContextClass =
                    window.AudioContext ||
                    window.webkitAudioContext;

                const context = new AudioContextClass();
                session.context = context;

                const source =
                    context.createMediaStreamSource(stream);

                const analyser = context.createAnalyser();
                analyser.fftSize = 1024;
                source.connect(analyser);

                const samples = new Float32Array(
                    analyser.fftSize
                );

                let soundFrames = 0;

                context.resume().catch(() => {});

                session.timers.push(setInterval(() => {
                    if (
                        session.finished ||
                        session.stopRequested
                    ) {
                        return;
                    }

                    analyser.getFloatTimeDomainData(samples);

                    let sum = 0;

                    for (const sample of samples) {
                        sum += sample * sample;
                    }

                    const volume =
                        Math.sqrt(sum / samples.length);

                    const now = performance.now();

                    if (volume > 0.015) {
                        soundFrames++;

                        if (soundFrames >= 3) {
                            session.speechStarted = true;
                        }

                        if (session.speechStarted) {
                            session.lastSpeechAt = now;
                        }
                    } else {
                        soundFrames = 0;
                    }

                    if (
                        !manual &&
                        session.speechStarted &&
                        session.lastSpeechAt > 0 &&
                        now - session.lastSpeechAt >= 2000
                    ) {
                        stop();
                    }
                }, 100));
            } catch (error) {
                // 音量監視が使えなくても、
                // 手動停止と20秒上限は維持する。
            }

            session.timers.push(setTimeout(() => {
                if (!session.speechStarted) {
                    stop(
                        "No speech detected within 15 seconds.",
                        true
                    );
                }
            }, 15000));

            session.timers.push(setTimeout(() => {
                stop("Auto-stopped after 20 seconds.");
            }, 20000));
        } catch (error) {
            session.recognitionDone = true;
            stop("Could not start recording.", true);
        }
    });

    stopBtn.addEventListener("click", () => {
        const session = activeRecognitionSession;

        if (
            session?.rowKey === rowKey &&
            session.manual
        ) {
            stopAllPlayback();
            session.stop();
        }
    });
}

function processResult(
    rawTranscript,
    expectedText,
    getExpectedKanjiFn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getUrlFn,
    playRate,
    rowKey
) {
    const transcript = String(rawTranscript ?? "").trim();
    const modelText = getExpectedKanjiFn();
    const normalized = practice7Normalize(transcript);

    const isCorrect = DrillAnswer.formAllowed(transcript) && normalized.length > 0 && (
        normalized === practice7Normalize(expectedText) ||
        normalized === practice7Normalize(modelText)
    );

    const saved = {
        rawTranscript: transcript,
        modelText,
        expectedText,
        isCorrect
    };
    practice7State.savedResults[rowKey] = saved;

    practice7ShowResult(
        {
            resultSpan, correctionBox,
            corrListenBtn, corrTextSpan
        },
        saved,
        rowKey,
        playRate
    );

    if (isAutoPlay) {
        DrillAudio.playRelay({
            recordButton: practice7State.views[rowKey].recordBtn,
            result: resultSpan,
            speak: done => speakText(modelText, playRate, done),
            url: getUrlFn
        });
    }
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
        queueMicrotask(() => {
        practice7State.refreshMeaningNotes?.();
    });
    if (resultSpan.querySelector(".play-recording-btn")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className =
        "example-button play-recording-btn custom-tip-wrap";
    button.style.marginLeft = "8px";
    button.innerHTML =
        '▶️<span class="custom-tip-box">Play your recorded voice</span>';

    button.onclick = () => {
        if (activeRecognitionSession ||
            practice7State.startingRow) return;

        const url = practice7State.audioUrls[rowKey];
        if (!url) return;

        stopAllPlayback();
        setPlayingStateMultiple([button], "Playing...");

        const audio = new Audio(url);
        currentPlayingAudio = audio;
        audio.playbackRate = 1.0;
        audio.onended = () => stopAllPlayback();
        DrillAudio.play(audio, () => stopAllPlayback());
    };

    resultSpan.appendChild(button);
}
// ============================================================================
// Practice 7.2: Drill 2 — Practice with English cues
// ============================================================================

(() => {
    let englishCuesEnabled = false;
    let previousHintMode = hintMode;

    const englishCues = {
        "寝る": ["22:00", "go to bed"],
        "太る": ["New Year", "gain weight"],
        "やせる": ["summer vacation", "lose weight"],
        "結婚する": ["3 years ago", "get married"],
        "Tシャツを着る": ["earlier", "put on a T-shirt"],
        "覚える": ["kanji", "50", "memorize"],
        "知る": ["ているForm", "learn of"]
    };

    // 「着る」を5番に移動。初回描画前に実行する。
    const shirtIndex = practice7Data.findIndex(
        item => item.yKanji === "Tシャツを着る"
    );

    if (shirtIndex !== -1 && shirtIndex !== 4) {
        const [shirtItem] = practice7Data.splice(shirtIndex, 1);
        practice7Data.splice(4, 0, shirtItem);
    }

    const originalRenderAll = renderAll;
    const originalSyncRecordingUI = practice7SyncRecordingUI;

    // 装飾はstyle.cssを使用する。
    function installStyles() {}

    const originalAddDrill2Panel = addDrill2Panel;

    addDrill2Panel = function(container) {
        originalAddDrill2Panel(container);

        const copy = container.querySelector(
            '#practice7Drill2Panel > .p7-drill2-copy'
        );

        if (copy) {
            copy.classList.add('drill-cue-copy');
        }
    };
    function updateHintControl() {
        const control = document.getElementById("hintModeControl");
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === hintMode;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }
    function updateExample(container) {
        if (!englishCuesEnabled) return;

        const example = container.querySelector(".example-box");
        if (!example) return;

        example.querySelectorAll(".example-line").forEach((line, index) => {
            // 元の日本語キューを、同じ位置で英語に変更する。
            line.querySelectorAll(".target-word").forEach((word, wordIndex) => {
                word.textContent = wordIndex === 0 ? "05:00" : "get up";
                word.classList.add("p7-underlined-cue");
            });

            // ボタン・Past／Perfectラベルの位置は変更しない。
            const sentence = line.lastElementChild;
            if (!sentence || sentence.tagName !== "SPAN") return;

            sentence.innerHTML = index === 0
                ? '<span class="p7-underlined-cue">05:00</span> に ' +
                  '<span class="p7-underlined-cue">get up</span> ' +
                  '<strong class="grammar-highlight">ました</strong>。'
                : '<span class="p7-underlined-cue">05:00</span> ' +
                  '<strong class="grammar-highlight">から</strong> ' +
                  '<span class="p7-underlined-cue">get up</span> ' +
                  '<strong class="grammar-highlight">ています</strong>。';        });
    }
    function updatePracticeCues(container) {
        if (!englishCuesEnabled) return;

        container.querySelectorAll(
            "#drill1List .prompt-label"
        ).forEach((prompt, index) => {
            const item = practice7Data[index];
            const parts = englishCues[item?.yKanji];
            if (!parts) return;

            const cue = document.createElement("strong");
            cue.className = "p7-english-cue";
            cue.textContent = parts.join(" ／ ");
            prompt.replaceChildren(cue);
        });
    }

    function addShirtMeaningNote(container) {
        const rowIndex = practice7Data.findIndex(
            item => item.yKanji === "Tシャツを着る"
        );

        const cards = container.querySelectorAll("#drill1List .drill-row");
        const table = cards[rowIndex]?.querySelector("table");
        if (!table) return;

        // 既存コードで追加済みの場合は重複させない。
        if (table.querySelector(".meaning-change-row")) return;

        const pastKey = `p7_drill_past_${rowIndex}`;
        const perfectKey = `p7_drill_perf_${rowIndex}`;

        const row = document.createElement("tr");
        row.className = "meaning-change-row p7-shirt-note";
        row.dataset.pastKey = pastKey;
        row.dataset.perfectKey = perfectKey;
        row.hidden = !(
            practice7State.audioUrls[pastKey] ||
            practice7State.audioUrls[perfectKey]
        );

        const spacer = document.createElement("td");
        spacer.colSpan = 2;

        const cell = document.createElement("td");
        cell.className = "meaning-change-note";

        const title = document.createElement("small");
        title.textContent = "✨ Notice the meaning change:";

        const comparison = document.createElement("strong");
        comparison.className = "meaning-change-comparison";
        comparison.textContent = scriptMode === "hiragana"
            ? "きました = put on / きています = am wearing"
            : "着ました = put on / 着ています = am wearing";

        cell.append(title, comparison);
        row.append(spacer, cell);
        (table.tBodies[0] || table).appendChild(row);
    }

    function addDrill2Panel(container) {
        const panel = document.createElement("section");
        panel.id = "practice7Drill2Panel";
        panel.className = "info-panel info-panel-task1 drill-cue-panel";
        panel.setAttribute("aria-labelledby", "practice7Drill2Title");

        const title = document.createElement("span");
        title.id = "practice7Drill2Title";
        title.className = "info-panel-title drill-cue-title";
        title.textContent = "Drill 2: Practice with English cues";

        const description = document.createElement("span");
        description.className = "info-panel-desc drill-cue-description";
        description.textContent =
            "💡 Practise making sentences with this lesson’s vocabulary, using English cues.";

        const button = document.createElement("button");
        button.id = "practice7EnglishCueButton";
        button.type = "button";
        button.className = "drill-cue-button";
        button.classList.toggle("is-english", englishCuesEnabled);
        button.setAttribute("aria-pressed", String(englishCuesEnabled));
        button.textContent = englishCuesEnabled
            ? "Display Japanese cues"
            : "Display English cues";

        button.addEventListener("click", () => {
            if (activeRecognitionSession || practice7State.startingRow) {
                return;
            }

            stopAllPlayback();

            if (!englishCuesEnabled) {
                previousHintMode = hintMode;
                englishCuesEnabled = true;
                hintMode = "off";
            } else {
                englishCuesEnabled = false;
                hintMode = previousHintMode;
            }

            // キュー変更でも抽出文・判定・録音音声を保持する。
            
            updateHintControl();
            renderAll();

            requestAnimationFrame(() => {
                const example = document.querySelector(
                    "#drill1Container .example-box"
                );
                if (!example) return;

                const computed = getComputedStyle(example);
                const fontSize = parseFloat(computed.fontSize) || 16;
                const lineHeight =
                    parseFloat(computed.lineHeight) || fontSize * 1.5;

                const top =
                    window.scrollY +
                    example.getBoundingClientRect().top -
                    lineHeight;

                window.scrollTo({
                    top: Math.max(0, top),
                    behavior: "smooth"
                });
            });
        });

        panel.classList.add("p7-copy-layout");

        const copy = document.createElement("div");
        copy.className = "p7-drill2-copy";
        copy.append(title, description);

        panel.append(copy, button);
        container.appendChild(panel);
    }
    renderAll = function () {
        originalRenderAll();

        const container = document.getElementById("drill1Container");
        if (!container) return;

        installStyles();
        updateExample(container);
        updatePracticeCues(container);

        // 最長キューの幅に、全行のキュー列を揃える。
        const cueCells = Array.from(
            container.querySelectorAll("#drill1List .prompt-label")
        );

        let cueWidth = 0;

        cueCells.forEach(cell => {
            const measure = document.createElement("span");
            measure.innerHTML = cell.innerHTML;

            Object.assign(measure.style, {
                position: "absolute",
                visibility: "hidden",
                display: "inline-block",
                width: "max-content",
                maxWidth: "none",
                whiteSpace: "nowrap",
                font: "inherit",
                pointerEvents: "none"
            });

            cell.appendChild(measure);

            cueWidth = Math.max(
                cueWidth,
                Math.ceil(measure.getBoundingClientRect().width)
            );

            measure.remove();
        });

        cueCells.forEach(cell => {
            cell.style.setProperty("width", `${cueWidth}px`, "important");
            cell.style.setProperty("padding-right", "4px", "important");
            cell.style.setProperty("white-space", "nowrap", "important");
        });

        addShirtMeaningNote(container);
        addDrill2Panel(container);
        practice7State.refreshMeaningNotes?.();
        practice7SyncRecordingUI();
    };

    practice7SyncRecordingUI = function () {
        originalSyncRecordingUI();

        const button = document.getElementById(
            "practice7EnglishCueButton"
        );

        if (button) {
            button.disabled = Boolean(
                activeRecognitionSession ||
                practice7State.startingRow
            );
        }
    };
})();

// 共通設定：Formal / Informal / Casual
(() => {
    let speechStyle = 'formal';

    const fields = [
        'pastSentence',
        'pastSentenceHira',
        'perfectSentence',
        'perfectSentenceHira'
    ];

    const originals = practice7Data.map(item =>
        Object.fromEntries(
            fields.map(key => [key, item[key]])
        )
    );

    function convert(text) {
        if (speechStyle === 'formal') return text;

        let value = String(text);

        const endings = [
            ['寝ました', '寝た'],
            ['ねました', 'ねた'],
            ['着ました', '着た'],
            ['きました', 'きた'],
            ['太りました', '太った'],
            ['ふとりました', 'ふとった'],
            ['やせました', 'やせた'],
            ['結婚しました', '結婚した'],
            ['けっこんしました', 'けっこんした'],
            ['覚えました', '覚えた'],
            ['おぼえました', 'おぼえた'],
            ['知りました', '知った'],
            ['しりました', 'しった'],
            ['起きました', '起きた'],
            ['おきました', 'おきた']
        ];

        endings.forEach(([from, to]) => {
            value = value.replace(from, to);
        });

        // 文末の活用だけを変える。
        value = value.replace(
            /ています(?=[。．.!！]?$)/g,
            'ている'
        );

        if (speechStyle === 'casual') {
            value = value
                .replace(
                    /ている(?=[。．.!！]?$)/g,
                    'てる'
                )
                .replace(/を/g, '');

            return value.replace(/。$/, 'よ。');
        }

        // Informalには終助詞を付けない。
        return value;
    }

    function blocked() {
        return Boolean(
            activeRecognitionSession ||
            practice7State.startingRow
        );
    }

    function syncStyleButtons() {
        document.querySelectorAll(
            '#speechStyleControl button[data-value]'
        ).forEach(button => {
            const selected =
                button.dataset.value === speechStyle;

            button.classList.toggle('is-selected', selected);
            button.setAttribute(
                'aria-pressed',
                String(selected)
            );
            button.disabled = blocked();
        });
    }

    function installSettings() {
        const anchor = document.getElementById(
            'scriptModeControl'
        )?.closest('.control-item');

        if (!anchor) return;

        let item = document.getElementById(
            'speechStyleControl'
        )?.closest('.control-item');

        if (!item) {
            item = document.createElement('div');
            item.className =
                'control-item speech-style-item';

            const control = document.createElement('div');
            control.id = 'speechStyleControl';
            control.className = 'segmented-control';
            control.setAttribute('role', 'group');
            control.setAttribute(
                'aria-label',
                'Speech style'
            );

            [
                [
                    'formal',
                    '👔Formal',
                    'Polite speech for work or unfamiliar people.'
                ],
                [
                    'informal',
                    '✏️Informal',
                    'Plain forms used in writing'
                ],
                [
                    'casual',
                    '💬Casual',
                    'Relaxed speech with family and friends.'
                ]
            ].forEach(([value, label, description]) => {
                const button =
                    document.createElement('button');

                button.type = 'button';
                button.className =
                    'segmented-option custom-tip-wrap';
                button.dataset.value = value;
                button.append(
                    document.createTextNode(label)
                );

                const tip = document.createElement('span');
                tip.className = 'custom-tip-box';
                tip.textContent = description;
                button.append(tip);

                button.onclick = () => {
                    if (
                        blocked() ||
                        speechStyle === value
                    ) return;

                    stopAllPlayback();
                    speechStyle = value;
                    renderAll();
                };

                control.append(button);
            });

            item.append(control);
        }

        anchor.after(item);

        const labels = {
            hover: '💬Hover',
            paren: '🔡Display',
            off: 'OFF'
        };

        document.querySelectorAll(
            '#hintModeControl button[data-value]'
        ).forEach(button => {
            const label = labels[button.dataset.value];
            if (!label) return;

            const tip = button.querySelector(
                '.custom-tip-box'
            );

            button.replaceChildren(
                document.createTextNode(label)
            );

            if (tip) button.append(tip);
        });

        syncStyleButtons();
    }

    function updateLayout() {
        Object.values(
            practice7State.views || {}
        ).forEach(view => {
            const tip = view.recordBtn.querySelector(
                '.custom-tip-box'
            );

            view.recordBtn.replaceChildren(
                document.createTextNode('🎙️とる')
            );

            if (tip) view.recordBtn.append(tip);
        });

        document.querySelectorAll(
            '#drill1List .result-text'
        ).forEach(result => {
            const cell = result.closest('td');
            if (!cell) return;

            let layout = cell.querySelector(
                '.recording-controls'
            );

            if (!layout) {
                const wrap = result.parentElement;
                wrap.classList.add('recording-result');

                [
                    'float',
                    'display',
                    'align-items'
                ].forEach(name =>
                    wrap.style.removeProperty(name)
                );

                layout = document.createElement('div');
                layout.className = 'recording-controls';

                const actions = document.createElement('div');
                actions.className = 'recording-actions';

                Array.from(cell.childNodes).forEach(node => {
                    if (node !== wrap) actions.append(node);
                });

                layout.append(actions, wrap);
                cell.append(layout);
            }

            cell.style.removeProperty('white-space');
        });

        // 訂正欄を対応する録音行の直下へ移動する。
        Object.values(
            practice7State.views || {}
        ).forEach(view => {
            const cell = view.resultSpan.closest('td');

            if (
                cell
                && view.correctionBox.parentElement !== cell
            ) {
                cell.append(view.correctionBox);
            }

            view.corrListenBtn.hidden = true;
            view.corrListenBtn.style.display = 'none';
        });

        document.querySelectorAll(
            '#drill1List .prompt-label'
        ).forEach(cell => {
            const table = cell.closest('table');
            if (!table) return;

            cell.classList.add('drill-cue-cell');
            table.classList.add('recording-table');

            table.style.removeProperty('width');
            table.style.removeProperty('border-collapse');

            let cols = table.querySelector(
                'colgroup.recording-columns'
            );

            if (!cols) {
                cols = document.createElement('colgroup');
                cols.className = 'recording-columns';

                for (let i = 0; i < 3; i++) {
                    cols.append(
                        document.createElement('col')
                    );
                }

                table.prepend(cols);
            }

            cols.children[0].style.width = '34px';
            cols.children[1].style.width =
                `${(parseFloat(cell.style.width) || 0) + 4}px`;
        });

        document.querySelectorAll(
            '.meaning-change-note-title, ' +
            '.meaning-change-note small'
        ).forEach(title => {
            title.textContent = title.textContent.replace(
                /^✨\s+/,
                '✨'
            );
        });

        document.querySelectorAll(
            '#drill1Container .info-panel-desc'
        ).forEach(description => {
            description.childNodes.forEach(node => {
                if (node.nodeType === 3) {
                    node.textContent = node.textContent.replace(
                        /💡\s+/,
                        '💡'
                    );
                }
            });
        });
    }

    function updateExample() {
        document.querySelectorAll(
            '#drill1Container .example-box .example-line'
        ).forEach(line => {
            const sentence = line.lastElementChild;

            if (
                !sentence
                || sentence.tagName !== 'SPAN'
            ) {
                return;
            }

            sentence.querySelectorAll(
                'strong'
            ).forEach(strong => {
                const text = strong.textContent;
                let ending;

                if (text.startsWith('ました')) {
                    ending = speechStyle === 'formal'
                        ? 'ました'
                        : speechStyle === 'informal'
                            ? 'た'
                            : 'たよ';
                } else if (text.startsWith('ています')) {
                    ending = speechStyle === 'formal'
                        ? 'ています'
                        : speechStyle === 'informal'
                            ? 'ている'
                            : 'てるよ';
                } else {
                    return;
                }

                strong.textContent = ending
                    + (text.endsWith('。') ? '。' : '');
            });
        });

        [
            ['exPastListen', '朝五時に起きました。'],
            ['exPerfListen', '朝五時から起きています。']
        ].forEach(([id, text]) => {
            const button = document.getElementById(id);
            if (!button) return;

            const model = convert(text);

            button.onclick = () => {
                if (blocked()) return;

                setPlayingStateMultiple(
                    [button],
                    'Playing...'
                );

                speakText(
                    model,
                    0.8,
                    () => stopAllPlayback()
                );
            };
        });

        // 元の要素を移し、Exampleの各列をそろえる。
        document.querySelectorAll(
            '#drill1Container .example-box'
        ).forEach(box => {
            const lines = Array.from(
                box.querySelectorAll('.example-line')
            );

            if (!lines.length) return;

            const table = document.createElement('table');
            table.className = 'drill-example-table';

            const body = document.createElement('tbody');

            for (const line of lines) {
                const label = line.firstElementChild;
                const listen = line.querySelector('button');
                const arrow = listen?.previousElementSibling;
                const badge = listen?.nextElementSibling;
                const sentence = line.lastElementChild;

                if (
                    !label
                    || !listen
                    || !arrow
                    || !badge
                    || badge === sentence
                ) {
                    return;
                }

                const cue = document.createElement('td');
                let current = label.nextSibling;

                while (current && current !== arrow) {
                    const next = current.nextSibling;
                    cue.append(current);
                    current = next;
                }

                label.style.removeProperty('min-width');
                label.style.removeProperty('width');

                const row = document.createElement('tr');

                for (const element of [
                    label,
                    cue,
                    arrow,
                    listen,
                    badge,
                    sentence
                ]) {
                    if (element === cue) {
                        row.append(cue);
                    } else {
                        const cell = document.createElement('td');
                        cell.append(element);
                        row.append(cell);
                    }
                }

                body.append(row);
            }

            table.append(body);
            box.replaceChildren(table);
        });
    }

    const originalShow = practice7ShowResult;

    practice7ShowResult = function(
        view,
        saved,
        rowKey,
        playRate
    ) {
        originalShow(view, saved, rowKey, playRate);

        view.corrListenBtn.hidden = true;
        view.corrListenBtn.style.display = 'none';

        view.corrTextSpan.textContent =
            view.corrTextSpan.textContent.replace(
                /^🔥\s+/,
                '🔥'
            );
    };

    const originalRender = renderAll;

    renderAll = function() {
        if (blocked()) return;

        practice7Data.forEach((item, index) => {
            fields.forEach(key => {
                item[key] = convert(
                    originals[index][key]
                );
            });
        });

        originalRender();
        installSettings();
        updateLayout();
        updateExample();
    };

    const originalSync = practice7SyncRecordingUI;

    practice7SyncRecordingUI = function() {
        originalSync();

        document.querySelectorAll(
            '.compact-settings .segmented-option, ' +
            '.compact-settings input'
        ).forEach(control => {
            control.disabled = blocked();
        });

        syncStyleButtons();
    };

    document.addEventListener('click', event => {
        if (
            blocked()
            && event.target.closest(
                '.compact-settings .segmented-option'
            )
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);
})();


// Keep lifecycle and Voice locks aligned with this page's existing recorder.
DrillAudio.configure({
    busy: () => Boolean(activeRecognitionSession || practice7State.startingRow),
    sync: () => practice7SyncRecordingUI(),
    stop: () => stopAllPlayback(),
    cancel: () => {
        practice7State.startingRow = null;
        const capture = activeRecognitionSession;
        if (capture) {
            capture.discard = true;
            capture.stop?.("", true);
        }
    }
});
