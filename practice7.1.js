// Drill 2：動詞の活用を必須とし、応答語・今・目的語は任意にする。
document.addEventListener('DOMContentLoaded', () => {
    const originalNormalize = practice71Normalize;

    const targets = [
        ['ほん', 'よんで'],
        ['あさごはん', 'たべて'],
        ['おんがく', 'きいて'],
        ['しゃしん', 'とって'],
        ['おべんとう', 'かって']
    ];

    practice71Normalize = function(text) {
        const value = practice71ToHiragana(
            String(text ?? '').normalize('NFKC')
        )
            .replace(/[\s、。．,.!?！？「」『』]/g, '')
            .replace(/(?:よね|よ|ね)$/, '');

        for (const [object, verb] of targets) {
            const pattern = new RegExp(
                verb + '(いません|います|いない|いる|ない|る)'
                    + '(?:よね|よ|ね)?',
                'g'
            );

            const matches = Array.from(
                value.matchAll(pattern)
            );

            // 対象の活用が一つ必要。
            if (matches.length !== 1) continue;

            const match = matches[0];
            const ending = match[1];

            const negative = [
                'いません',
                'いない',
                'ない'
            ].includes(ending);

            let rest =
                value.slice(0, match.index) +
                value.slice(match.index + match[0].length);

            let valid = true;

            // 動詞以外が、許容する任意要素だけかを確認する。
            while (rest) {
                const response = rest.match(
                    /^(いいえ|いえ|はい|うんんー?|ううん|うん)/
                );

                if (response) {
                    const no = /^(?:いいえ|いえ|うんん|ううん)/
                        .test(response[0]);

                    // 応答語と動詞の肯定・否定が矛盾する場合。
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

                if (rest.startsWith(object)) {
                    rest = rest.slice(object.length)
                        .replace(/^を/, '');

                    continue;
                }

                // 無関係な語が残っている。
                valid = false;
                break;
            }

            if (valid) {
                return `p71-answer|${verb}|${ending}`;
            }
        }

        return originalNormalize(text);
    };
});
// Drill 2：回答の「はい／いいえ」と目的語の省略を許容する。
document.addEventListener('DOMContentLoaded', () => {
    const originalNormalize = practice71Normalize;

    const answers = [
        ['ほん', 'よんで'],
        ['あさごはん', 'たべて'],
        ['おんがく', 'きいて'],
        ['しゃしん', 'とって'],
        ['おべんとう', 'かって']
    ];

    practice71Normalize = function(text) {
        let value = practice71ToHiragana(
            String(text ?? '').normalize('NFKC')
        )
            .replace(/[\s、。．,.!?！？「」『』]/g, '')
            .replace(/(?:よね|よ|ね)$/, '');

        const prefix = value.match(
            /^(いいえ|はい|うんんー?|ううん|うん)/
        );

        let polarity = null;

        if (prefix) {
            polarity = /^(?:いいえ|うんん|ううん)/.test(
                prefix[0]
            )
                ? 'no'
                : 'yes';

            value = value.slice(prefix[0].length);
        }

        const casual = document.querySelector(
            '#speechStyleControl button[aria-pressed="true"]'
        )?.dataset.value === 'casual';

        for (const [object, verb] of answers) {
            let body = value;

            if (body.startsWith(object + 'を')) {
                body = body.slice(object.length + 1);
            } else if (
                casual &&
                body.startsWith(object)
            ) {
                body = body.slice(object.length);
            }

            if (!body.startsWith(verb)) continue;

            const ending = body.slice(verb.length);

            const yes = [
                'います',
                'いる',
                'る'
            ].includes(ending);

            const no = [
                'いません',
                'いない',
                'ない'
            ].includes(ending);

            if (!yes && !no) continue;

            // 「はい＋否定」「いいえ＋肯定」は許容しない。
            if (
                polarity &&
                polarity !== (yes ? 'yes' : 'no')
            ) continue;

            return `p71-answer|${verb}|${ending}`;
        }

        return originalNormalize(text);
    };
});
// Practice 7.1：Example 2・Drill 2（質問とYes／No回答）
document.addEventListener('DOMContentLoaded', () => {
    const states = Array.from({ length: 5 }, () => ({
        answer: null,
        questionText: false,
        yesText: false,
        noText: false
    }));

    const targets = [
        [
            'ほん', '本', 'hon', 'book',
            'よむ', '読む', 'yomu', 'read',
            '読んで'
        ],
        [
            'あさごはん', '朝ご飯', 'asagohan', 'breakfast',
            'たべる', '食べる', 'taberu', 'eat',
            '食べて'
        ],
        [
            'おんがく', '音楽', 'ongaku', 'music',
            'きく', '聞く', 'kiku', 'listen to',
            '聞いて'
        ],
        [
            'しゃしん', '写真', 'shashin', 'photo',
            'とる', '撮る', 'toru', 'take',
            '撮って'
        ],
        [
            'おべんとう', 'お弁当', 'obentō', 'boxed lunch',
            'かう', '買う', 'kau', 'buy',
            '買って'
        ]
    ];

    const example = [
        'へや', '部屋', 'heya', 'room',
        'そうじする', '掃除する', 'sōji suru', 'clean',
        '掃除して'
    ];

    const toHira = practice71ToHiragana;

    practice71ToHiragana = text => {
        let value = String(text ?? '');

        [
            ['朝ご飯', 'あさごはん'],
            ['お弁当', 'おべんとう'],
            ['掃除', 'そうじ'],
            ['写真', 'しゃしん'],
            ['音楽', 'おんがく'],
            ['部屋', 'へや'],
            ['本', 'ほん'],
            ['読', 'よ'],
            ['食', 'た'],
            ['撮', 'と'],
            ['買', 'か']
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
        practice71State.startingRow
    );

    const normalize = practice71Normalize;

    practice71Normalize = text => {
        let value = String(text ?? '');

        if (style() === 'casual') {
            value = value
                .replace(
                    /^(?:うんんー?|ううん)[、,\s]*/,
                    'いいえ、'
                )
                .replace(/^うん[、,\s]*/, 'はい、');

            for (const item of [example, ...targets]) {
                for (const noun of [item[0], item[1]]) {
                    value = value.replace(noun + 'を', noun);
                }
            }
        }

        return normalize(value);
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

        const object = item[1] +
            (mode === 'casual' ? '、' : 'を、');

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
            ? '今、'
            : mode === 'casual'
                ? (kind === 'yes' ? 'うん、' : 'ううん、')
                : (kind === 'yes' ? 'はい、' : 'いいえ、');

        return prefix + (kind === 'q' ? object : '') + item[8] + ending;    }

    const display = text => scriptMode === 'hiragana'
        ? practice71ToHiragana(text)
        : text;

    const cue = item => [
        formatWord('いま', '今', 'ima', 'now'),
        formatWord(...item.slice(0, 4)),
        formatWord(...item.slice(4, 8))
    ].join('／');

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
            /ていますか|ていません|ています|ていない|ている|てない|てる|今|いま/g;

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
        type.append(node('span', 'tense-badge tense-badge--ongoing', '▶️Ongoing'));

        const text = node('td');
        text.append(
            highlighted(display(model(example, 'q')))
        );

        const heading = node('div', 'example-category-heading');
        heading.append(...type.childNodes);
        box.append(heading);
        question.append(
            label,
            cues,
            node('td', '', '👉'),
            sound,
            text
        );

        body.append(question);
        ['yes', 'no'].forEach((kind, index) => {
            const row = node('tr', 'example-response-row');
            const label = node('td');
            if (!index) label.append(node('strong', 'example-label-title', 'Response:'));
            const cues = node('td', 'example-empty-cell');
            const arrow = node('td', 'example-empty-cell');
            const sound = node('td', 'example-audio-cell');
            sound.append(listen(() => model(example, kind), index ? '🔊🙅' : '🔊🙆'));
            const text = node('td');
            text.append(highlighted(display(model(example, kind))));
            row.append(label, cues, arrow, sound, text);
            body.append(row);
        });
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

        // Yes／Noは別のキーで録音を保持する。
        const key =
            `p71_d2_${index}_${selected || 'answer'}`;

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

        // 録音・停止は既存の録音処理に接続する。
        record.onclick = null;
        stop.onclick = null;
        stop.disabled = true;

        actions.append(sound, record, stop);

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
                () => practice71ToHiragana(getText()),
                getText,
                0.8,
                key
            );
        } else {
            sound.disabled = true;
            record.disabled = true;

            answerControls.push(sound, record);
        }
    }

    const baseSync = practice71SyncRecordingUI;

    practice71SyncRecordingUI = function() {
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

        const heading = root.querySelector(
            '.info-panel:not(.drill-cue-panel) ' +
            '.info-panel-title'
        );

        if (heading) {
            heading.textContent =
                heading.textContent.replace(
                    /^Drill [234]:/,
                    'Drill 1:'
                );
        }

        root.querySelectorAll(
            '.p71-stage-panel .info-panel-title'
        ).forEach(title => {
            title.textContent =
                title.textContent.replace(
                    /^Drill ([23]):/,
                    (_, number) =>
                        `Drill ${Number(number) + 1}:`
                );
        });

        answerControls.length = 0;

        const section = node(
            'section',
            'practice-section practice-qa-section'
        );

        section.id = 'practice71QuestionSection';

        makeExample(section);

        const panel = node(
            'div',
            'info-panel info-panel-task1'
        );

        panel.append(
            node(
                'span',
                'info-panel-title',
                'Drill 2: Ask and answer — 今～ていますか'
            ),
            node(
                'span',
                'info-panel-desc instruction-steps',
                '💡Ask a Yes/No question.\nChoose 🙆 or 🙅 and record your answer.'
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

        root.insertBefore(
            section,
            root.querySelector('.p71-stage-panel')
        );

        // 質問行と回答行のきくボタンを同じ列にそろえる。
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
            columns.parentElement.style.setProperty('--drill-cue-width', `${width + 4}px`);
            columns.children[1].style.width =
                `${width + 4}px`;
        });

        practice71SyncRecordingUI();
    };
});
// ============================================================================
// Practice 7.1: ているform① Habit continuous
// ============================================================================

const practice71Data = [];
let renderAll, speakText, practice71ToHiragana, practice71Normalize;

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "kanji"; // デフォルトはWith漢字
let isAutoPlay = true;
let activeRecognitionSession = null;

const practice71State = {
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

function createPractice71TableCard(container, indexLabel, item, rowIndex, playRate) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "drill-row";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // ----------------------------------------------------
    // 1行目: Past
    // ----------------------------------------------------
    const tr1 = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.rowSpan = 2;
    tdIndex.textContent = indexLabel;
    tdIndex.style.fontWeight = "bold";
    tdIndex.style.verticalAlign = "middle";
    tdIndex.style.width = "30px";
    tdIndex.style.paddingRight = "4px";

    const tdPrompt = document.createElement("td");
    tdPrompt.rowSpan = 2;
    tdPrompt.className = "prompt-label";
    const cueParts = item.xKanji === "漢字50個"
        ? [
            formatWord(
                "かんじ", "漢字",
                "kanji", "kanji characters"
            ),
            formatWord(
                "50こ", "50個",
                "gojūkko", "50 items"
            ),
            formatWord(
                item.y, item.yKanji,
                item.yRomaji, item.yMeaning
            )
        ]
        : [
            formatWord(
                item.x, item.xKanji,
                item.xRomaji, item.xMeaning
            ),
            formatWord(
                item.y, item.yKanji,
                item.yRomaji, item.yMeaning
            )
        ];

    tdPrompt.innerHTML = cueParts.join(" ／ ");    tdPrompt.style.verticalAlign = "middle";
    tdPrompt.style.width = "220px";
    tdPrompt.style.paddingRight = "10px";

    const tdPastControls = document.createElement("td");
    tdPastControls.style.paddingBottom = "4px";
    tdPastControls.style.whiteSpace = "nowrap";

    const listenBtn1 = document.createElement("button");
    listenBtn1.className = "example-button custom-tip-wrap";
    listenBtn1.innerHTML = '🔊きく<span class="custom-tip-box">Listen to past tense.</span>';

    const pastLabel = document.createElement("span");
    pastLabel.style.fontWeight = "bold";
    pastLabel.style.display = "inline-block";
    pastLabel.style.padding = "4px 8px";
    pastLabel.style.margin = "0 6px";
    pastLabel.style.borderRadius = "4px";
    pastLabel.style.backgroundColor = "#bae6fd";
    pastLabel.style.color = "#0369a1";
    pastLabel.style.fontSize = "13px";
    pastLabel.innerHTML = "⏪ Past";

    const recordBtn1 = document.createElement("button");
    recordBtn1.className = "example-button custom-tip-wrap";
    recordBtn1.innerHTML = '⏺️とる<span class="custom-tip-box">Record past tense.</span>';

    const stopBtn1 = document.createElement("button");
    stopBtn1.className = "example-button custom-tip-wrap";
    stopBtn1.innerHTML = '⏹️<span class="custom-tip-box">Stop active recording.</span>';
    stopBtn1.disabled = true;

    const rightWrapper1 = document.createElement("span");
    rightWrapper1.style.float = "right";
    rightWrapper1.style.display = "inline-flex";
    rightWrapper1.style.alignItems = "center";

    const resultSpan1 = document.createElement("span");
    resultSpan1.className = "result-text";
    resultSpan1.textContent = "(Not recorded yet)";
    resultSpan1.style.color = "var(--text-secondary)";
    resultSpan1.style.marginLeft = "8px";

    rightWrapper1.appendChild(resultSpan1);

    listenBtn1.onclick = () => {
        setPlayingStateMultiple([listenBtn1], "Playing...");
        speakText(item.pastSentence, playRate, () => stopAllPlayback());
    };

    tdPastControls.appendChild(listenBtn1);
    tdPastControls.appendChild(pastLabel);
    tdPastControls.appendChild(recordBtn1);
    tdPastControls.appendChild(stopBtn1);
    tdPastControls.appendChild(rightWrapper1);

    tr1.appendChild(tdIndex);
    tr1.appendChild(tdPrompt);
    tr1.appendChild(tdPastControls);
    table.appendChild(tr1);

    const correctionBox1 = document.createElement("div");
    correctionBox1.className = "correction-box";
    const corrListenBtn1 = document.createElement("button");
    corrListenBtn1.className = "example-button";
    corrListenBtn1.innerHTML = "🔊 きく";
    corrListenBtn1.style.marginRight = "8px";
    const corrTextSpan1 = document.createElement("span");
    correctionBox1.appendChild(corrListenBtn1);
    correctionBox1.appendChild(corrTextSpan1);

    bindRecorderEvents(
        recordBtn1, stopBtn1, resultSpan1, correctionBox1, corrListenBtn1, corrTextSpan1,
        () => item.pastSentenceHira,
        () => item.pastSentence,
        playRate,
        `p7_drill_past_${rowIndex}`
    );

    // ----------------------------------------------------
    // 2行目: Perfect
    // ----------------------------------------------------
    const tr2 = document.createElement("tr");
    tr2.style.borderTop = "1px dashed var(--border-color)";

    const tdPerfControls = document.createElement("td");
    tdPerfControls.style.paddingTop = "4px";
    tdPerfControls.style.whiteSpace = "nowrap";

    const listenBtn2 = document.createElement("button");
    listenBtn2.className = "example-button custom-tip-wrap";
    listenBtn2.innerHTML = '🔊きく<span class="custom-tip-box">Listen to Habit perfect.</span>';

    const perfLabel = document.createElement("span");
    perfLabel.style.fontWeight = "bold";
    perfLabel.style.display = "inline-block";
    perfLabel.style.padding = "4px 8px";
    perfLabel.style.margin = "0 6px";
    perfLabel.style.borderRadius = "4px";
    perfLabel.style.backgroundColor = "#dcfce7";
    perfLabel.style.color = "#15803d";
    perfLabel.style.fontSize = "13px";
    perfLabel.innerHTML = "⏳ Perfect";

    const recordBtn2 = document.createElement("button");
    recordBtn2.className = "example-button custom-tip-wrap";
    recordBtn2.innerHTML = '⏺️とる<span class="custom-tip-box">Record Habit perfect.</span>';

    const stopBtn2 = document.createElement("button");
    stopBtn2.className = "example-button custom-tip-wrap";
    stopBtn2.innerHTML = '⏹️<span class="custom-tip-box">Stop active recording.</span>';
    stopBtn2.disabled = true;

    const rightWrapper2 = document.createElement("span");
    rightWrapper2.style.float = "right";
    rightWrapper2.style.display = "inline-flex";
    rightWrapper2.style.alignItems = "center";

    const resultSpan2 = document.createElement("span");
    resultSpan2.className = "result-text";
    resultSpan2.textContent = "(Not recorded yet)";
    resultSpan2.style.color = "var(--text-secondary)";
    resultSpan2.style.marginLeft = "8px";

    rightWrapper2.appendChild(resultSpan2);

    listenBtn2.onclick = () => {
        setPlayingStateMultiple([listenBtn2], "Playing...");
        speakText(item.perfectSentence, playRate, () => stopAllPlayback());
    };

    tdPerfControls.appendChild(listenBtn2);
    tdPerfControls.appendChild(perfLabel);
    tdPerfControls.appendChild(recordBtn2);
    tdPerfControls.appendChild(stopBtn2);
    tdPerfControls.appendChild(rightWrapper2);

    tr2.appendChild(tdPerfControls);
    table.appendChild(tr2);

    const correctionBox2 = document.createElement("div");
    correctionBox2.className = "correction-box";
    const corrListenBtn2 = document.createElement("button");
    corrListenBtn2.className = "example-button";
    corrListenBtn2.innerHTML = "🔊 きく";
    corrListenBtn2.style.marginRight = "8px";
    const corrTextSpan2 = document.createElement("span");
    correctionBox2.appendChild(corrListenBtn2);
    correctionBox2.appendChild(corrTextSpan2);

    bindRecorderEvents(
        recordBtn2, stopBtn2, resultSpan2, correctionBox2, corrListenBtn2, corrTextSpan2,
        () => item.perfectSentenceHira,
        () => item.perfectSentence,
        playRate,
        `p7_drill_perf_${rowIndex}`
    );
    cardDiv.appendChild(table);
    cardDiv.appendChild(correctionBox1);
    cardDiv.appendChild(correctionBox2);
    container.appendChild(cardDiv);
}

// ============================================================================
// Practice 7.1: Recognition, Recording & Result Display
// ============================================================================

// 実際の認識結果を、このページで扱う語句の範囲で変換する。
// モデル文そのものへの置き換えは行わない。
function practice71BaseToHiragana(text) {
    let value = String(text ?? "").normalize("NFKC");

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

function practice71DiffTokens(text) {
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

        const reading = practice71ToHiragana(unit)
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

function practice71FindDiff(actual, reference) {
    const a = practice71DiffTokens(actual);
    const b = practice71DiffTokens(reference);

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

function practice71ShowResult(view, saved, rowKey, playRate) {
    // モード変更による再描画では、録音時の判定を保持する。
    // 新しい録音の判定はprocessResult側で保存される。
    if (typeof saved.isCorrect !== 'boolean') {
        const normalized = practice71Normalize(
            saved.rawTranscript
        );

        saved.isCorrect = DrillAnswer.formAllowed(saved.rawTranscript) && normalized.length > 0 && [
            saved.expectedText,
            saved.modelText
        ].some(text =>
            typeof text === 'string' &&
            text.length > 0 &&
            normalized === practice71Normalize(text)
        );
    }
    const displayed = scriptMode === "hiragana"
        ? practice71ToHiragana(saved.rawTranscript)
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
                    practice71ToHiragana(text)
                ])
        )];

        let best = null;

        for (const reference of references) {
            const diff = practice71FindDiff(
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

    if (practice71State.audioUrls[rowKey]) {
        appendPersistedPlayButton(
            view.resultSpan, rowKey, playRate
        );
    }

    view.correctionBox.style.display =
        saved.isCorrect ? "none" : "block";

    if (!saved.isCorrect) {
        view.corrTextSpan.textContent =
            "🔥 Keep going! Try once more!";

        view.corrListenBtn.style.display = "none";
        view.correctionBox.style.textAlign = "right";
        view.corrListenBtn.onclick = () => {
            if (
                activeRecognitionSession ||
                practice71State.startingRow
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
function practice71SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession || practice71State.startingRow
    );

    practice71State.lockedControls ??= new Map();
    const locked = practice71State.lockedControls;

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
            ? practice71State.views?.[session.rowKey]
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

function practice71ShowNotice(resultSpan, message) {
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
    practice71State.views ??= {};

    const view = {
        recordBtn, stopBtn, resultSpan,
        correctionBox, corrListenBtn, corrTextSpan
    };

    practice71State.views[rowKey] = view;

    const currentView = () =>
        practice71State.views[rowKey] || view;

    const restoreResult = message => {
        const v = currentView();
        const saved = practice71State.savedResults[rowKey];

        if (saved?.rawTranscript !== undefined) {
            practice71ShowResult(
                v, saved, rowKey, playRate
            );
        } else {
            v.resultSpan.textContent =
                saved?.text || "(Not recorded yet)";
            v.resultSpan.style.color =
                "var(--text-secondary)";
            v.correctionBox.style.display = "none";

            if (practice71State.audioUrls[rowKey]) {
                appendPersistedPlayButton(
                    v.resultSpan, rowKey, playRate
                );
            }
        }

        practice71ShowNotice(v.resultSpan, message);
    };

    restoreResult("");

    if (activeRecognitionSession?.rowKey === rowKey) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (practice71State.startingRow === rowKey) {
        resultSpan.textContent = "Preparing microphone...";
    }

    // 再描画後の新しいボタンにも録音中の制御を適用する。
    queueMicrotask(practice71SyncRecordingUI);

    recordBtn.addEventListener("click", async () => {
        if (
            recordBtn.disabled ||
            activeRecognitionSession ||
            practice71State.startingRow
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
        practice71State.startingRow = rowKey;
        practice71SyncRecordingUI();

        let stream;

        try {
            stream = await DrillAudio.getUserMedia({
                audio: true
            });
        } catch (error) {
            if (error.name === "AbortError") return;
            practice71State.startingRow = null;
            practice71SyncRecordingUI();
            restoreResult(DrillAudio.microphoneError(error));
            practice71SyncRecordingUI();
            return;
        }

        practice71State.startingRow = null;

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

            practice71SyncRecordingUI();

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
                    practice71State.audioUrls[rowKey];

                practice71State.audioUrls[rowKey] = newUrl;

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
                    () => practice71State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

                practice71ShowNotice(
                    v.resultSpan,
                    session.message
                );
            } else {
                restoreResult(
                    session.message || "No speech recognized."
                );
            }

            practice71SyncRecordingUI();
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
            practice71SyncRecordingUI();

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

            practice71SyncRecordingUI();

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
    const normalized = practice71Normalize(transcript);

    const isCorrect = DrillAnswer.formAllowed(transcript) && normalized.length > 0 && (
        normalized === practice71Normalize(expectedText) ||
        normalized === practice71Normalize(modelText)
    );

    const saved = {
        rawTranscript: transcript,
        modelText,
        expectedText,
        isCorrect
    };
    practice71State.savedResults[rowKey] = saved;

    practice71ShowResult(
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
            recordButton: practice71State.views[rowKey].recordBtn,
            result: resultSpan,
            speak: done => speakText(modelText, playRate, done),
            url: getUrlFn
        });
    }
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
        queueMicrotask(() => {
        practice71State.refreshMeaningNotes?.();
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
            practice71State.startingRow) return;

        const url = practice71State.audioUrls[rowKey];
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
// Practice 7.1: ているform① Habit continuous
// ============================================================================
(() => {
    let english = false;
    let previousHint = hintMode;
    const word = (h, k, r, e) => ({ h, k, r, e });
    const data = [
        [
            [word('へや','部屋','heya','room'), word('Switch','Switch','suitchi','Switch'), word('プレイする','プレイする','purei suru','play')],
            '部屋で、Switchを、', 'プレイします', 'プレイしています'
        ],
        [
            [word('がっこう','学校','gakkō','school'), word('せんせい','先生','sensei','teacher'), word('えいご','英語','eigo','English'), word('はなす','話す','hanasu','speak')],
            '学校で、先生と、英語を、', '話します', '話しています'
        ],
        [
            [word('えいがかん','映画館','eigakan','cinema'), word('えいが','映画','eiga','movie'), word('みる','見る','miru','watch')],
            '映画館で、映画を、', '見ます', '見ています'
        ],
        [
            [word('いえ','家','ie','home'), word('シャワー','シャワー','shawā','shower'), word('あびる','浴びる','abiru','take')],
            '家で、シャワーを、', '浴びます', '浴びています'
        ],
        [
            [word('でんしゃ','電車','densha','train'), word('スマホ','スマホ','sumaho','smartphone'), word('つかう','使う','tsukau','use')],
            '電車で、スマホを、', '使います', '使っています'
        ],
        [
            [word('そと','外','soto','outside'), word('タバコ','タバコ','tabako','cigarette'), word('すう','吸う','suu','smoke')],
            '外で、タバコを、', '吸います', '吸っています'
        ],
        [
            [word('こうえん','公園','kōen','park'), word('ともだち','友達','tomodachi','friend'), word('あそぶ','遊ぶ','asobu','play')],
            '公園で、友達と、', '遊びます', '遊んでいます'
        ],
        [
            [word('きっさてん','喫茶店','kissaten','café'), word('コーヒー','コーヒー','kōhī','coffee'), word('のむ','飲む','nomu','drink')],
            '喫茶店で、コーヒーを、', '飲みます', '飲んでいます'
        ],
        [
            [word('だいがく','大学','daigaku','university'), word('せんせい','先生','sensei','teacher'), word('きく','聞く','kiku','ask')],
            '大学で、先生に、', '聞きます', '聞いています'
        ],
        [[word('いそぐ','急ぐ','isogu','hurry')], '', '急ぎます', '急いでいます']
    ];

    const originalToHiragana = practice71BaseToHiragana;

    practice71ToHiragana = function (text) {
        let value = String(text ?? '').normalize('NFKC');

        value = value.replace(
            /(?:Nintendo\s*Switch|任天堂\s*スイッチ|ニンテンドー\s*スイッチ|ニンテンドウ\s*スイッチ|Switch)/gi,
            'すいっち'
        ).replace(/スマートフォン|スマートホン/g, 'スマホ');

        const dictionary = [
            ['映画館','えいがかん'], ['喫茶店','きっさてん'],
            ['学校','がっこう'], ['大学','だいがく'], ['先生','せんせい'],
            ['英語','えいご'], ['映画','えいが'], ['部屋','へや'],
            ['電車','でんしゃ'], ['公園','こうえん'], ['友達','ともだち'],
            ['友だち','ともだち'], ['今','いま'], ['家','いえ'], ['外','そと'],
            ['話','はな'], ['見','み'], ['浴','あ'], ['使','つか'],
            ['吸','す'], ['遊','あそ'], ['飲','の'], ['聞','き'], ['急','いそ']
        ];

        dictionary.forEach(([from, to]) => {
            value = value.split(from).join(to);
        });

        return originalToHiragana(value);
    };

    const flat = text => practice71ToHiragana(text)
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, '');

    practice71Data.splice(
        0,
        practice71Data.length,
        ...data.map((row, index) => {
            const [words, clauses, Habit, ongoing] = row;
            const last = words[words.length - 1];
            const a = `いつも、${clauses}${Habit}。`;
            const b = `いま、${clauses}${ongoing}。`;

            return {
                words,
                clauses,
                Habit,
                ongoing,
                x: words[0].h,
                xKanji: words[0].k,
                xRomaji: words[0].r,
                xMeaning: words[0].e,
                y: last.h,
                yKanji: last.k,
                yRomaji: last.r,
                yMeaning: last.e,
                pastSentence: a,
                pastSentenceHira: practice71ToHiragana(a),
                perfectSentence: b,
                perfectSentenceHira: practice71ToHiragana(b),
                itemIndex: index
            };
        })
    );

    // 助詞付き語句を、順不同で過不足なく使用したか確認する。
    practice71Normalize = function (text) {
        const value = flat(text);

        for (const item of practice71Data) {
            const chunks = item.clauses
                .split('、')
                .filter(Boolean)
                .map(flat);

            for (const [time, verb] of [
                ['いつも', item.Habit],
                ['いま', item.ongoing]
            ]) {
                const ending = flat(verb);
                if (!value.endsWith(ending)) continue;

                let rest = value.slice(0, -ending.length);
                const remaining = [time, ...chunks];

                while (rest && remaining.length) {
                    const index = remaining.findIndex(
                        chunk => rest.startsWith(chunk)
                    );

                    if (index < 0) break;

                    rest = rest.slice(remaining[index].length);
                    remaining.splice(index, 1);
                }

                if (!rest && !remaining.length) {
                    return `${time}|${chunks.slice().sort().join('|')}|${ending}`;
                }
            }
        }

        return value;
    };

    // 読み上げの区切りとSwitchの読みを指定する。
    speakText = function (text, rate = 0.8, onEndCallback) {
        setupPreferredVoice();

        const utterance = new SpeechSynthesisUtterance(
            String(text ?? '').replace(
                /(?:Nintendo\s*)?Switch/gi,
                'スイッチ'
            )
        );

        utterance.lang = 'ja-JP';
        utterance.rate = rate;

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        currentUtteranceRef = utterance;

        const finish = () => {
            if (currentUtteranceRef !== utterance) return;

            currentUtteranceRef = null;
            onEndCallback?.();
        };

        utterance.onend = finish;
        utterance.onerror = finish;

        try {
            DrillAudio.speak(utterance);
        } catch (error) {
            finish();
        }
    };

    function cue(item) {
        const words = item.words.map(w => {
            const content = english
                ? w.e
                : formatWord(w.h, w.k, w.r, w.e);

            return `<span class="p71-cue-word">${content}</span>`;
        });

        return `<span class="p71-cues">${
            words.join(
                '<span class="p71-cue-separator">／</span><wbr>'
            )
        }</span>`;
    }


    function exampleSentence(item, ongoing) {
        const text = ongoing
            ? item.perfectSentence
            : item.pastSentence;

        return scriptMode === 'hiragana'
            ? practice71ToHiragana(text)
            : text;
    }

    renderAll = function () {
        let container = document.getElementById('drill1Container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'drill1Container';

            document.body.insertBefore(
                container,
                document.querySelector('.voice-guide-footer')
            );
        }

        container.classList.add('practice-section');
        container.replaceChildren();

        practice71State.views = {};
        practice71State.refreshMeaningNotes = () => {};

        const item = practice71Data[0];

        const example = document.createElement('div');
        example.className = 'example-box';
        example.id = 'practice71Example';

        const exampleTable = document.createElement('table');
        exampleTable.className = 'drill-example-table';

        const body = document.createElement('tbody');

        [false, true].forEach(ongoing => {
            const row = document.createElement('tr');
            row.className = 'example-line';

            row.innerHTML = `
                <td>
                    <span class="p71-tense ${ongoing ? 'p71-ongoing' : 'p71-present'}">${ongoing ? '▶️Ongoing' : '🔁Habit'}</span>
                </td>
                <td>${cue(item)}</td>
                <td>👉</td>
                <td>
                    <button
                        type="button"
                        class="example-button"
                        data-model="${ongoing ? 'ongoing' : 'Habit'}"
                    >🔊きく</button>
                </td>
                <td class="p71-example-model">${exampleSentence(item, ongoing)}</td>
            `;

            const button = row.querySelector('button');

            button.onclick = () => {
                if (
                    activeRecognitionSession ||
                    practice71State.startingRow
                ) return;

                setPlayingStateMultiple([button], 'Playing...');

                speakText(
                    ongoing
                        ? item.perfectSentence
                        : item.pastSentence,
                    0.8,
                    stopAllPlayback
                );
            };

            body.append(row);
        });

        exampleTable.append(body);
        example.append(exampleTable);

        const info = document.createElement('div');
        info.className = 'info-panel info-panel-task1';

        info.innerHTML =
            '<span class="info-panel-title">' +
            'Drill 1: Compare Habit &amp; Ongoing' +
            '</span>' +
            '<span class="info-panel-desc">' +
            '💡Use all cues; start with いつも or いま.' +
            '</span>';

        const list = document.createElement('div');
        list.id = 'drill1List';

        container.append(example, info, list);

        practice71Data.slice(1).forEach((item, index) => {
            createPractice71TableCard(
                list,
                `${index + 1}.`,
                item,
                index,
                0.8
            );

            const card = list.lastElementChild;
            const table = card.querySelector('table');

            table.classList.add('recording-table');
            table.removeAttribute('style');

            const rows = Array.from(table.querySelectorAll('tr'));

            const number = rows[0].firstElementChild;
            number.classList.add('drill-number-cell');
            number.removeAttribute('style');

            const prompt = card.querySelector('.prompt-label');
            prompt.classList.add('drill-cue-cell');
            prompt.removeAttribute('style');
            prompt.innerHTML = cue(item);

            [false, true].forEach((ongoing, rowIndex) => {
                const cell = rows[rowIndex].lastElementChild;
                cell.removeAttribute('style');

                const label = Array.from(cell.children).find(
                    element => element.tagName === 'SPAN'
                );

                if (label) {
                    label.textContent = ongoing
                        ? '▶️Ongoing'
                        : '🔁Habit';

                    label.className =
                        'p71-tense ' +
                        (ongoing ? 'p71-ongoing' : 'p71-present');

                    label.removeAttribute('style');
                }

                const key =
                    `p7_drill_${ongoing ? 'perf' : 'past'}_${index}`;

                const view = practice71State.views[key];
                if (!view) return;

                const tip = view.recordBtn.querySelector(
                    '.custom-tip-box'
                );

                view.recordBtn.replaceChildren(
                    document.createTextNode('🎙️とる')
                );

                if (tip) {
                    view.recordBtn.append(tip);
                }

                cell.querySelectorAll('.custom-tip-box')
                    .forEach(tooltip => {
                        tooltip.textContent = tooltip.textContent
                            .replace(
                                /past tense/gi,
                                'habitual action'
                            )
                            .replace(
                                /Habit perfect/gi,
                                'ongoing action'
                            );
                    });

                const hint = document.createElement('span');
                hint.className = 'p71-start-hint';

                hint.textContent = ongoing
                    ? (
                        scriptMode === 'hiragana'
                            ? 'いま…'
                            : '今…'
                    )
                    : 'いつも…';

                view.stopBtn.insertAdjacentElement(
                    'afterend',
                    hint
                );

                const wrap = view.resultSpan.parentElement;
                wrap.removeAttribute('style');
                wrap.classList.add('recording-result');

                view.resultSpan.style.removeProperty(
                    'margin-left'
                );

                const layout = document.createElement('div');
                layout.className = 'recording-controls';

                const actions = document.createElement('div');
                actions.className = 'recording-actions';

                Array.from(cell.childNodes).forEach(node => {
                    if (node !== wrap) {
                        actions.append(node);
                    }
                });

                layout.append(actions, wrap);
                cell.append(layout, view.correctionBox);

                view.corrListenBtn.hidden = true;
                view.corrListenBtn.style.display = 'none';
            });
        });

        // 最長キューの一行表示幅を実測する。
        const cues = Array.from(
            list.querySelectorAll('.prompt-label')
        );

        let cueWidth = 0;

        cues.forEach(cell => {
            const measure = document.createElement('span');
            measure.innerHTML = cell.innerHTML;

            Object.assign(measure.style, {
                position: 'absolute',
                visibility: 'hidden',
                display: 'inline-block',
                width: 'max-content',
                maxWidth: 'none',
                whiteSpace: 'nowrap',
                font: 'inherit',
                pointerEvents: 'none'
            });

            cell.append(measure);

            cueWidth = Math.max(
                cueWidth,
                Math.ceil(measure.getBoundingClientRect().width)
            );

            measure.remove();
        });

        cues.forEach(cell => {

            const columns = document.createElement('colgroup');
            columns.className = 'recording-columns';

            for (let index = 0; index < 3; index++) {
                columns.append(
                    document.createElement('col')
                );
            }

            columns.children[0].style.width = '34px';
            columns.children[1].style.width =
                `${cueWidth + 4}px`;

            cell.closest('table').style.setProperty('--drill-cue-width', `${cueWidth + 4}px`);
            cell.closest('table').prepend(columns);
        });

        practice71SyncRecordingUI();
    };

    const originalSync = practice71SyncRecordingUI;

    practice71SyncRecordingUI = function () {
        originalSync();

        const blocked = Boolean(
            activeRecognitionSession ||
            practice71State.startingRow
        );

        document.querySelectorAll(
            '.compact-settings .segmented-option, ' +
            '.compact-settings input'
        ).forEach(control => {
            control.disabled = blocked;
        });
    };

    document.addEventListener('click', event => {
        if (
            (
                activeRecognitionSession ||
                practice71State.startingRow
            ) &&
            event.target.closest(
                '.compact-settings .segmented-option'
            )
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);
})();

// ============================================================================
// Practice 7.1：基本キュー／で・と／英語キュー
// ============================================================================
(() => {
    let stage = 1;
    let previousHint = hintMode;
    let speechStyle = 'formal';

    const baseRender = renderAll;
    const baseNormalize = practice71Normalize;
    const baseShowResult = practice71ShowResult;
    const originalSync = practice71SyncRecordingUI;
    const baseFormatWord = formatWord;
    const baseToHiragana = practice71ToHiragana;

    const w = (h, k, r, e) => ({ h, k, r, e });
    const originalItems = practice71Data.slice();
    const order = [2, 3, 0, 1, 4, 5, 6, 7, 8, 9];
    const items = order.map(index => ({
        ...originalItems[index]
    }));

    const basicIndexes = [
        [1, 2], [1, 2], [1, 2], [2, 3], [1, 2],
        [1, 2], [2], [1, 2], [1, 2], [0]
    ];

    const basicClauses = [
        '映画を、',
        'シャワーを、',
        'Switchを、',
        '英語を、',
        'スマホを、',
        'タバコを、',
        '',
        'コーヒーを、',
        '先生に、',
        ''
    ];

    items.forEach((item, index) => {
        item.basicWords = basicIndexes[index].map(
            i => item.words[i]
        );
        item.basicClauses = basicClauses[index];
        item.expandedWords = item.words.slice();
        item.expandedClauses = item.clauses;
    });

    items[2].expandedWords.splice(
        1, 0,
        w('いもうと', '妹', 'imōto', 'younger sister')
    );
    items[2].expandedClauses = '部屋で、妹と、Switchを、';

    items[3].expandedWords[1] = w(
        'クラスメート', 'クラスメート',
        'kurasumēto', 'classmate'
    );
    items[3].expandedClauses =
        '学校で、クラスメートと、英語を、';

    // Example：見る。
    // 問題：浴びる、プレイする、話す、使う、吸う、
    //       遊ぶ、飲む、聞く、急ぐ。
    const plainHabit = [
        '見る', '浴びる', 'プレイする', '話す', '使う',
        '吸う', '遊ぶ', '飲む', '聞く', '急ぐ'
    ];

    const plainOngoing = [
        '見ている',
        '浴びている',
        'プレイしている',
        '話している',
        '使っている',
        '吸っている',
        '遊んでいる',
        '飲んでいる',
        '聞いている',
        '急いでいる'
    ];

    const casualHabit = [
        '見るよ', '浴びるよ', 'プレイするよ',
        '話すよ', '使うよ', '吸うよ', '遊ぶよ',
        '飲むよ', '聞くよ', '急ぐよ'
    ];

    const casualOngoing = [
        '見てるよ',
        '浴びてるよ',
        'プレイしてるよ',
        '話してるよ',
        '使ってるよ',
        '吸ってるよ',
        '遊んでるよ',
        '飲んでるよ',
        '聞いてるよ',
        '急いでるよ'
    ];

    // Casualの助詞省略は各問題に明示する。
    const casualBasic = [
        '映画、',
        'シャワー、',
        'Switch、',
        '英語、',
        'スマホ、',
        'タバコ、',
        '',
        'コーヒー、',
        '先生に、',
        ''
    ];

    const casualExpanded = [
        '映画館で、映画、',
        '家で、シャワー、',
        '部屋で、妹と、Switch、',
        '学校で、クラスメートと、英語、',
        '電車で、スマホ、',
        '外で、タバコ、',
        '公園で、友達と、',
        '喫茶店で、コーヒー、',
        '大学で、先生に、',
        ''
    ];

    // モードにかかわらず、同じ問題の抽出文・録音を表示する。
    const sharedRecord = {
        savedResults: practice71State.savedResults,
        audioUrls: practice71State.audioUrls
    };

    const emptyRecords = () => ({
        1: sharedRecord,
        2: sharedRecord,
        3: sharedRecord
    });

    const styleRecords = {
        formal: emptyRecords(),
        informal: emptyRecords(),
        casual: emptyRecords()
    };

    let records = styleRecords.formal;

    practice71ToHiragana = text => baseToHiragana(
        String(text ?? '').replace(/妹/g, 'いもうと')
    );

    formatWord = function (h, k, r, e) {
        if (stage !== 3) {
            return baseFormatWord(h, k, r, e);
        }

        const span = document.createElement('span');
        span.textContent = e;
        return span.innerHTML;
    };

    function blocked() {
        return Boolean(
            activeRecognitionSession ||
            practice71State.startingRow
        );
    }

    function syncSpeechStyle() {
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

        document.querySelectorAll(
            '#drill1List .result-text'
        ).forEach(result => {
            const cell = result.closest('td');
            if (!cell) return;

            // 作成済みの行は再構成しない。
            if (cell.querySelector('.recording-controls')) {
                return;
            }

            const resultWrap = result.parentElement;
            resultWrap.classList.add('recording-result');

            const layout = document.createElement('div');
            layout.className = 'recording-controls';

            const actions = document.createElement('div');
            actions.className = 'recording-actions';

            // 操作ボタンと結果欄を、それぞれまとめる。
            // 既存要素を移動するため、クリック処理は保持される。
            Array.from(cell.childNodes).forEach(node => {
                if (node !== resultWrap) {
                    actions.appendChild(node);
                }
            });

            layout.append(actions, resultWrap);
            cell.appendChild(layout);
        });
    }

    const baseSync = function () {
        originalSync();
        syncSpeechStyle();
    };

    function installSpeechStyle() {
        const script = document.getElementById(
            'scriptModeControl'
        );
        const anchor = script?.closest('.control-item');
        if (!anchor) return;

        const existing = document.getElementById(
            'speechStyleControl'
        );

        if (existing) {
            anchor.after(existing.closest('.control-item'));
            syncSpeechStyle();
            return;
        }

        const item = document.createElement('div');
        item.className = 'control-item speech-style-item';

        const control = document.createElement('div');
        control.id = 'speechStyleControl';
        control.className = 'segmented-control';
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', 'Speech style');

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
            const button = document.createElement('button');
            button.type = 'button';
            button.className =
                'segmented-option custom-tip-wrap';
            button.dataset.value = value;
            button.append(document.createTextNode(label));

            const tip = document.createElement('span');
            tip.className = 'custom-tip-box';
            tip.textContent = description;
            button.append(tip);

            button.onclick = () => {
                if (blocked() || speechStyle === value) return;

                stopAllPlayback();

                // 保存済みの録音・抽出文は保持する。
                speechStyle = value;
                records = styleRecords[value];

                renderAll();
            };

            control.append(button);
        });

        item.append(control);

        // 文字表示 → 文体 → 語彙表示
        anchor.after(item);
        syncSpeechStyle();
    }

    function applyStage() {
        installSpeechStyle();

        practice71Data.splice(
            0,
            practice71Data.length,
            ...items.map((item, index) => {
                const words = stage === 1
                    ? item.basicWords
                    : item.expandedWords;

                const clauses = speechStyle === 'casual'
                    ? (
                        stage === 1
                            ? casualBasic[index]
                            : casualExpanded[index]
                    )
                    : (
                        stage === 1
                            ? item.basicClauses
                            : item.expandedClauses
                    );

                const Habit = speechStyle === 'formal'
                    ? item.Habit
                    : speechStyle === 'informal'
                        ? plainHabit[index]
                        : casualHabit[index];

                const ongoing = speechStyle === 'formal'
                    ? item.ongoing
                    : speechStyle === 'informal'
                        ? plainOngoing[index]
                        : casualOngoing[index];

                const a = `いつも、${clauses}${Habit}。`;
                const b = `いま、${clauses}${ongoing}。`;

                const first = words[0];
                const last = words[words.length - 1];

                return {
                    ...item,
                    words,
                    clauses,
                    Habit,
                    ongoing,
                    itemIndex: index,
                    x: first.h,
                    xKanji: first.k,
                    xRomaji: first.r,
                    xMeaning: first.e,
                    y: last.h,
                    yKanji: last.k,
                    yRomaji: last.r,
                    yMeaning: last.e,
                    pastSentence: a,
                    pastSentenceHira:
                        practice71ToHiragana(a),
                    perfectSentence: b,
                    perfectSentenceHira:
                        practice71ToHiragana(b)
                };
            })
        );
    }

    function styleExampleSentence(ongoing) {
        const item = practice71Data[0];

        const suffix = ongoing
            ? {
                formal: 'ています',
                informal: 'ている',
                casual: 'てるよ'
            }[speechStyle]
            : {
                formal: 'ます',
                informal: 'る',
                casual: 'るよ'
            }[speechStyle];

        const gold = text =>
            `<span class="p71-grammar-highlight">${text}</span>`;

        const start = ongoing
            ? (scriptMode === 'hiragana' ? 'いま' : '今')
            : 'いつも';

        if (stage === 3) {
            const under = text =>
                `<span class="p71-underlined">${text}</span>`;

            return gold(start) + '、' +
                under('cinema') + ' で、' +
                under('movie') +
                (speechStyle === 'casual' ? '、' : ' を、') +
                under('watch') + ' ' +
                gold(suffix) + '。';
        }

        let text = ongoing
            ? item.perfectSentence
            : item.pastSentence;

        if (scriptMode === 'hiragana') {
            text = practice71ToHiragana(text);
        }

        return text
            .replace(
                /^(?:いつも|いま|今)/,
                () => gold(start)
            )
            .replace(
                new RegExp(suffix + '。$'),
                () => gold(suffix) + '。'
            );
    }

    // 比較時だけ表記をそろえる。抽出文は変更しない。
    practice71Normalize = text => {
        let value = String(text ?? '').replace(
            /(英語|えいご)([\s、，,]*)で/g,
            '$1$2を'
        );

        // 全スタイルで文末の「よ／ね／よね」を任意とする。
        value = value
            .replace(/[\s、。．,.!?！？「」『』・]+$/g, '')
            .replace(/(?:よね|よ|ね)$/, '');

        // 各スタイルのモデル語尾に合わせて比較する。
        if (speechStyle === 'casual') value += 'よ';

        return baseNormalize(value);
    };
    // 「英語を／英語で」の対象は並べ替え後の3番。
    practice71ShowResult = function (
        view, saved, rowKey, playRate
    ) {
        const target =
            /^p7_drill_(past|perf)_2$/.test(rowKey);

        const usesDe = target &&
            /(?:英語|えいご)[\s、，,]*で/.test(
                String(saved.rawTranscript ?? '')
            );

        const withDe = text => String(text ?? '').replace(
            /(英語|えいご)([\s、，,]*)を/g,
            '$1$2で'
        );

        const result = usesDe ? {
            ...saved,
            expectedText: withDe(saved.expectedText),
            modelText: withDe(saved.modelText)
        } : saved;

        baseShowResult(view, result, rowKey, playRate);
        saved.isCorrect = result.isCorrect;

        if (!target || !result.isCorrect) return;

        const recording = view.resultSpan.querySelector(
            '.play-recording-btn'
        );

        const displayed = scriptMode === 'hiragana'
            ? practice71ToHiragana(saved.rawTranscript)
            : String(saved.rawTranscript ?? '');

        view.resultSpan.replaceChildren();

        const match = usesDe
            ? /(?:英語|えいご)[\s、，,]*で/.exec(displayed)
            : null;

        if (match) {
            const index =
                match.index + match[0].length - 1;

            const particle = document.createElement('span');
            particle.className = 'p71-accepted-particle';
            particle.textContent = 'で';

            view.resultSpan.append(
                document.createTextNode(
                    displayed.slice(0, index)
                ),
                particle,
                document.createTextNode(
                    displayed.slice(index + 1)
                )
            );
        } else {
            view.resultSpan.append(
                document.createTextNode(displayed)
            );
        }

        view.resultSpan.append(
            document.createTextNode(' ✅ ')
        );



        if (recording) {
            view.resultSpan.append(recording);
        }

        if (usesDe) {
            const note = document.createElement('span');
            note.className = 'p71-particle-note';
            note.textContent =
                'Both ‘を’ and ‘で’ are correct in this context.';
            view.resultSpan.append(note);
        }
    };

    function selectStage(next) {
        if (activeRecognitionSession ||
            practice71State.startingRow) return;

        stopAllPlayback();

        records[stage] = {
            savedResults: practice71State.savedResults,
            audioUrls: practice71State.audioUrls
        };

        if (next === 3 && stage !== 3) {
            previousHint = hintMode;
            hintMode = 'off';
        } else if (stage === 3 && next !== 3) {
            hintMode = previousHint;
        }

        stage = next;

        practice71State.savedResults =
            records[stage].savedResults;

        practice71State.audioUrls =
            records[stage].audioUrls;

        renderAll();

        document.getElementById(
            'practice71Example'
        )?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    function makePanel(
        number, title, description, text, active, next
    ) {
        const panel = document.createElement('section');
        panel.className =
            'info-panel info-panel-task1 ' +
            'drill-cue-panel p71-stage-panel';

        const copy = document.createElement('div');
        copy.className = 'p71-stage-copy';

        const heading = document.createElement('span');
        heading.className = 'info-panel-title';
        heading.textContent = title;

        const desc = document.createElement('span');
        desc.className = 'info-panel-desc';
        desc.textContent = description;

        copy.append(heading, desc);

        const button = document.createElement('button');
        button.type = 'button';
        button.id = `practice71Stage${number}Button`;
        button.className = 'drill-cue-button';
        button.classList.toggle('is-english', active);
        button.setAttribute('aria-pressed', String(active));
        button.textContent = text;
        button.onclick = () => selectStage(next);

        panel.append(copy, button);
        return panel;
    }

    renderAll = function () {
        applyStage();
        baseRender();

        const container =
            document.getElementById('drill1Container');

        document.getElementById(
            'practice71Drill2Panel'
        )?.remove();

        const titles = {
            1: 'Drill 1: Compare Habit & Ongoing — Basic cues',
            2: 'Drill 2: Add a place or a person — で・と',
            3: 'Drill 3: Practice with English cues'
        };

        const heading = container.querySelector(
            '.info-panel:not(.drill-cue-panel) .info-panel-title'
        );

        if (heading) {
            heading.textContent = titles[stage];
        }

        const desc = heading?.parentElement.querySelector(
            '.info-panel-desc'
        );

        if (desc) {
            desc.textContent = stage === 1
                ? '💡Use all cues; start with いつも or いま.'
                : stage === 2
                    ? '💡Use all cues.\nPlace: で · With someone: と.\nKeep 先生に with 聞く. No extra cues for 急ぐ.'
                    : '💡Use all English cues; start with いつも or いま.';
            desc.classList.toggle('instruction-steps', stage === 2);
        }

        container.querySelectorAll(
            '#practice71Example .example-line'
        ).forEach((line, index) => {
            line.lastElementChild.innerHTML =
                styleExampleSentence(Boolean(index));
        });
        container.append(
            makePanel(
                2,
                titles[2],
                '💡Add place and person cues.',
                stage === 2
                    ? 'Display basic cues'
                    : 'Display expanded cues',
                stage === 2,
                stage === 2 ? 1 : 2
            ),
            makePanel(
                3,
                titles[3],
                '💡Use English cues for the same sentences.',
                stage === 3
                    ? 'Display Japanese cues'
                    : 'Display English cues',
                stage === 3,
                stage === 3 ? 2 : 3
            )
        );

        document.querySelectorAll(
            '#hintModeControl button[data-value]'
        ).forEach(button => {
            const selected =
                button.dataset.value === hintMode;

            button.classList.toggle(
                'is-selected', selected
            );

            button.setAttribute(
                'aria-pressed', String(selected)
            );
        });

        practice71SyncRecordingUI();
    };

    practice71SyncRecordingUI = function () {
        baseSync();

        const blocked = Boolean(
            activeRecognitionSession ||
            practice71State.startingRow
        );

        document.querySelectorAll(
            '.p71-stage-panel button'
        ).forEach(button => {
            button.disabled = blocked;
        });
    };

    applyStage();
})();


// Keep lifecycle and Voice locks aligned with this page's existing recorder.
DrillAudio.configure({
    busy: () => Boolean(activeRecognitionSession || practice71State.startingRow),
    sync: () => practice71SyncRecordingUI(),
    stop: () => stopAllPlayback(),
    cancel: () => {
        practice71State.startingRow = null;
        const capture = activeRecognitionSession;
        if (capture) {
            capture.discard = true;
            capture.stop?.("", true);
        }
    }
});
