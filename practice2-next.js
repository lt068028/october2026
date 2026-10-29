// New Lesson 2 pages inherit the established recorder and settings without changing Practice 2.1.
const PracticeNext = (()=>{
    const places=[
        {hira:'ぎんこう',kanji:'銀行',romaji:'ginkō',meaning:'bank',zone:'A',kind:'place'},
        {hira:'きっさてん',kanji:'喫茶店',romaji:'kissaten',meaning:'cafe',zone:'B',kind:'place'},
        {hira:'としょかん',kanji:'図書館',romaji:'toshokan',meaning:'library',zone:'far',kind:'place'}
    ];
    const cities=[{hira:'とうきょう',kanji:'東京',romaji:'Tōkyō',meaning:'Tokyo',kind:'city',zone:'A'},{hira:'ロンドン',kanji:'ロンドン',romaji:'Rondon',meaning:'London',kind:'city',zone:'B'},{hira:'ニューヨーク',kanji:'ニューヨーク',romaji:'Nyū Yōku',meaning:'New York',kind:'city',zone:'far'}];
    const countries=[
        {hira:'にほん',kanji:'日本',romaji:'Nihon',meaning:'Japan',kind:'country'},
        {hira:'イギリス',kanji:'イギリス',romaji:'Igirisu',meaning:'United Kingdom',kind:'country'},
        {hira:'フランス',kanji:'フランス',romaji:'Furansu',meaning:'France',kind:'country'},
        {hira:'アメリカ',kanji:'アメリカ',romaji:'Amerika',meaning:'United States',kind:'country'}
    ];
    const people=[
        {hira:'メアリー',kanji:'メアリー',romaji:'Mearī',meaning:'Mary',kind:'person-mary'},
        {hira:'たけし',kanji:'たけし',romaji:'Takeshi',meaning:'Takeshi',kind:'person-takeshi'},
        {hira:'ロバート',kanji:'ロバート',romaji:'Robāto',meaning:'Robert',kind:'person-robert'}
    ];
    const readings=[['弟','おとうと'],['友達','ともだち'],['先生','せんせい'],['クラスメイト','クラスメート'],['何曜日','なんようび'],['土曜日','どようび'],['日曜日','にちようび'],['二十二時','にじゅうにじ'],['22時','にじゅうにじ'],['十三時','じゅうさんじ'],['13時','じゅうさんじ'],['六時','ろくじ'],['6時','ろくじ'],['十時','じゅうじ'],['10時','じゅうじ'],['一時','いちじ'],['1時','いちじ'],['朝六時','あさろくじ'],['朝6時','あさろくじ'],['夜十時','よるじゅうじ'],['夜10時','よるじゅうじ'],['百円','ひゃくえん'],['二百円','にひゃくえん'],['Aさん','えーさん'],['Bさん','びーさん'],['Cさん','しーさん'],['午前6時','ごぜんろくじ'],['午後9時','ごごくじ'],['午後5時','ごごごじ'],['午後2時','ごごにじ'],['午前六時','ごぜんろくじ'],['午後九時','ごごくじ'],['午後五時','ごごごじ'],['午後二時','ごごにじ'],['朝','あさ'],['昼','ひる'],['夜','よる'],['夕方','ゆうがた'],['大阪','おおさか'],['果物','くだもの'],['午後10時','ごごじゅうじ'],['午後1時','ごごいちじ'],['午前9時','ごぜんくじ'],['午後十時','ごごじゅうじ'],['午後一時','ごごいちじ'],['午前九時','ごぜんくじ'],['何時','なんじ'],['今','いま'],['何','なに'],['五千円','ごせんえん'],['六千円','ろくせんえん'],['八千円','はっせんえん'],['九千円','きゅうせんえん'],['一万円','いちまんえん'],['弁当','べんとう'],['六百円','ろっぴゃくえん'],['九百円','きゅうひゃくえん'],['四百円','よんひゃくえん'],['帽子','ぼうし'],['四千円','よんせんえん'],['人','ひと'],['誰','だれ'],['私','わたし'],['武','たけし'],['三万円','さんまんえん'],['3万円','さんまんえん'],['3千円','さんぜんえん'],['2千円','にせんえん'],['3百円','さんびゃくえん'],['円','えん'],['30000円','さんまんえん'],['30,000円','さんまんえん'],['三千円','さんぜんえん'],['3000円','さんぜんえん'],['3,000円','さんぜんえん'],['二千円','にせんえん'],['2000円','にせんえん'],['2,000円','にせんえん'],['三百円','さんびゃくえん'],['300円','さんびゃくえん'],['千円','せんえん']];
    return {items:[...Practice21.items,...places,...people,...cities,...countries,{hira:'おおさか',kanji:'大阪',romaji:'Ōsaka',meaning:'Osaka',kind:'city'},{hira:'パリ',kanji:'パリ',romaji:'Pari',meaning:'Paris',kind:'city'},{hira:'ロサンゼルス',kanji:'ロサンゼルス',romaji:'Rosanzerusu',meaning:'Los Angeles',kind:'city'},{hira:'くだもの',kanji:'果物',romaji:'kudamono',meaning:'fruit',kind:'fruit'}],places,people,cities,countries,readings};
})();
// Practice 2.2 / 2.3: visual demonstratives. Recorder/settings derived from Practice 1.2.
let isManualStop = false;
let hintMode = "hover";
let scriptMode = "hiragana";
let isAutoPlay = true;
let activeRecognitionSession = null;

// Keep the proven Practice 1.2 recorder state and lifecycle structure.
const practice2State = {
    customSelects: {},
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

function practice2SyncCitySpeaker() {
    if(!document.querySelector('.p23-city-picture'))return;
    const key=activeRecognitionSession?.rowKey||practice2State.startingRow;
    const control=activePlayButtons[0];
    const row=key?[...document.querySelectorAll('tr[data-p23-recording-key]')].find(e=>e.dataset.p23RecordingKey===key):control?.closest('tr');
    const who=row?.dataset.drillSpeaker||control?.dataset.speaker;
    const picture=row?row.closest('[id$="Container"]')?.querySelector(':scope > .p23-city-picture'):control?.closest('.example-box')?.querySelector('.p23-city-picture');
    document.querySelectorAll('.p23-city-person').forEach(e=>e.classList.toggle('is-speaking',['A','B'].includes(who)&&e.closest('.p23-city-picture')===picture&&e.closest('.p23-city-region').dataset.zone===who));
}

function practice2SyncPhotoSpeaker() {
    const key = activeRecognitionSession?.rowKey || practice2State.startingRow;
    const control = activePlayButtons[0];
    const row = key ? [...document.querySelectorAll('tr[data-speaker-recording-key]')].find(e => e.dataset.speakerRecordingKey === key) : control?.closest('tr');
    const scope = row?.closest('.p21-drill1') || row?.closest('[id$="Container"]');
    const picture = row ? scope?.querySelector(':scope > .p21-drill-picture, :scope > .p2x-picture') : control?.closest('.example-box')?.querySelector('.p21-distance-board, .p21-drill-picture, .p2x-picture');
    const who = row?.dataset.drillSpeaker || control?.dataset.speaker || picture?.dataset.speaker;
    document.querySelectorAll('.p21-distance-person[data-person], .p2x-person[data-person]').forEach(e => {
        const owner = e.closest('.p21-distance-board, .p21-drill-picture, .p2x-picture');
        e.classList.toggle('is-speaking', Boolean(key || control) && owner === picture && ['A','B'].includes(who) && e.dataset.person === who);
    });
}

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
    practice2SyncCitySpeaker();
    practice2SyncPhotoSpeaker();
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
    practice2SyncCitySpeaker();
    practice2SyncPhotoSpeaker();
}

function stopAllPlayback() {
    document.querySelectorAll(".p2x-speaker-guide").forEach(e=>SpeakerGuide.reset(e));
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

// このページの語彙の読みを正規化する。
function convertToHiragana(text) {
    let value=String(text??'');
    value=value.replace(/(\d[\d,]*)(?:円|えん)/g,(full,amount)=>({30000:'さんまんえん',3000:'さんぜんえん',2000:'にせんえん',300:'さんびゃくえん',100:'ひゃくえん',200:'にひゃくえん',1000:'せんえん',4000:'よんせんえん',600:'ろっぴゃくえん',900:'きゅうひゃくえん',5000:'ごせんえん',6000:'ろくせんえん',8000:'はっせんえん',9000:'きゅうせんえん',10000:'いちまんえん'}[Number(amount.replace(/,/g,''))]||full));
    for(const [from,to] of [...PracticeNext.items.map(o=>[o.kanji,o.hira]),...PracticeNext.readings].sort((a,b)=>b[0].length-a[0].length)) value=value.split(from).join(to);
    return value.replace(/鞄/g,'かばん').replace(/何/g,'なに');
}

function speakText(text, rate = 0.75, onEndCallback) {
    setupPreferredVoice();

    const utterance = new SpeechSynthesisUtterance(
        practice2SpeechText(text)
    );

    utterance.lang = "ja-JP";
    utterance.rate = rate;

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    currentUtteranceRef = utterance;

    let completed = false;

    const finish = () => {
        if (
            completed
            || currentUtteranceRef !== utterance
        ) {
            return;
        }

        completed = true;
        currentUtteranceRef = null;

        if (onEndCallback) {
            onEndCallback();
        }
    };

    utterance.onend = finish;

    utterance.onerror = event => {
        if (
            event.error === "canceled"
            || event.error === "interrupted"
        ) {
            completed = true;

            if (currentUtteranceRef === utterance) {
                currentUtteranceRef = null;
            }

            return;
        }

        finish();
    };

    try {
        DrillAudio.speak(utterance);
    } catch (error) {
        finish();
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

    const hintStr = romaji === meaning ? romaji : `${romaji}, ${meaning}`;

    // OFF: Japanese word only
    if (hintMode === "off") {
        return `<span class="target-word">${displayWord}</span>`;
    }

    // Vocab Display: Always show vocabulary hints
    if (hintMode === "paren") {
        return `<span class="practice12-cue-unit display-cue-unit"><span class="target-word">${displayWord}</span><span class="vocab-inline">(${hintStr})</span></span>`;
    }

    // Vocab Hover: Show vocabulary hints on hover
    return `<span class="tooltip-wrap"><span class="target-word">${displayWord}</span><span class="tooltip-tip">${hintStr}</span></span>`;
}

function initSettingsPanel() {
    const scriptControl =
        document.getElementById("scriptModeControl");

    const hintControl =
        document.getElementById("hintModeControl");

    function updateSegmentedSelection(control, selectedValue) {
        if (!control) return;

        control.querySelectorAll("button[data-value]").forEach(button => {
            const selected = button.dataset.value === selectedValue;

            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    // ==========================================
    // Hiragana Only / With漢字
    // ==========================================

    if (scriptControl) {
        updateSegmentedSelection(scriptControl, scriptMode);

        scriptControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !scriptControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["hiragana", "kanji"].includes(nextMode)) return;
            if (nextMode === scriptMode) return;

            scriptMode = nextMode;

            updateSegmentedSelection(scriptControl, scriptMode);
            renderAll();
        });
    }

    // ==========================================
    // OFF / Vocab Hover / Vocab Display
    // ==========================================

    if (hintControl) {
        updateSegmentedSelection(hintControl, hintMode);

        hintControl.addEventListener("click", event => {
            const button = event.target.closest("button[data-value]");

            if (!button || !hintControl.contains(button)) return;

            const nextMode = button.dataset.value;

            if (!["off", "hover", "paren"].includes(nextMode)) return;
            if (nextMode === hintMode) return;

            hintMode = nextMode;

            updateSegmentedSelection(hintControl, hintMode);
            renderAll();
        });
    }

    // ==========================================
    // Autostop: checked = ON
    // ==========================================

    const toggleRecordMode =
        document.getElementById("toggleRecordMode");

    const labelAutoRecord =
        document.getElementById("labelAutoRecord");

    if (toggleRecordMode) {
        toggleRecordMode.checked = !isManualStop;

        updateToggleLabelStyle(labelAutoRecord, !isManualStop);

        toggleRecordMode.addEventListener("change", event => {
            isManualStop = !event.target.checked;

            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        });
    }

    // ==========================================
    // Autoplay: checked = ON
    // ==========================================

    const togglePlaybackMode =
        document.getElementById("togglePlaybackMode");

    const labelAutoPlay =
        document.getElementById("labelAutoPlay");

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

    labelEl.className =
        `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;

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


let renderAll;
function practice2SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession
        || practice2State.startingRow
    );

    practice2State.lockedControls ??= new Map();

    const locked = practice2State.lockedControls;

    const controls = document.querySelectorAll(
        "#drill1Container button, #drill1Container select, " +
        "#drill2Container button, #drill2Container select, #drill3Container button, #drill4Container button, #drill5Container button"
    );

    if (blocked) {
        // 各操作部品の元の有効・無効状態を保存する。
        controls.forEach(control => {
            if (!locked.has(control)) {
                locked.set(
                    control,
                    control.disabled
                );
            }

            control.disabled = true;
        });

        const session = activeRecognitionSession;

        const view = session
            ? practice2State.views?.[session.rowKey]
            : null;

        if (view) {
            const canStop =
                session.manual
                && !session.stopRequested;

            view.stopBtn.disabled = !canStop;

            view.stopBtn.classList.toggle(
                "stop-btn-active",
                canStop
            );
        }

    } else {
        // 終了後は、選択前・選択後それぞれの元の状態へ戻す。
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
            control.disabled
                ? "not-allowed"
                : "pointer",
            "important"
        );
    });
}

function practice2ShowNotice(resultSpan, message) {
    if (!message) return;

    const notice = document.createElement("span");

    notice.textContent = message + " ";
    notice.style.color = "var(--text-secondary)";

    resultSpan.prepend(notice);
}

// Practice 2.2 / 2.3：共通UI・文体・判定
(() => {
    let speechStyle = "formal";

    const busy = () => Boolean(
        activeRecognitionSession || practice2State.startingRow
    );

    const negativeForms = [
        "じゃないです",
        "ではないです",
        "じゃありません",
        "ではありません",
        "じゃない",
        "ではない"
    ];

    const word = (hira, kanji) =>
        scriptMode === "kanji" ? kanji : hira;

    const node = (tag, className = "", text = "") => {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = text;
        return element;
    };

    const button = (label, tip, action) => {
        const element = node(
            "button",
            "example-button custom-tip-wrap",
            label
        );

        element.type = "button";
        element.append(node("span", "custom-tip-box", tip));

        element.onclick = () => {
            if (!busy()) action?.();
        };

        return element;
    };

    const question = (subject, predicate) => {
        const topic = "は、";
        const ending = speechStyle === "formal" ? "ですか？" : "？";

        return `${subject}${topic}${predicate}${ending}`;
    };

    const statement = (subject, predicate) => {
        const topic = "は、";

        const ending = {
            formal: "です。",
            informal: "だ。",
            casual: "だよ。"
        }[speechStyle];

        return `${subject}${topic}${predicate}${ending}`;
    };

    const response = (predicate, yes) => {
        const prefix = speechStyle === "casual"
            ? (yes ? "うん、" : "ううん、")
            : (yes ? "はい、" : "いいえ、");

        const ending = yes
            ? {
                formal: "です。",
                informal: "だ。",
                casual: "だよ。"
            }[speechStyle]
            : {
                formal: "じゃないです。",
                informal: "じゃない。",
                casual: "じゃないよ。"
            }[speechStyle];

        return prefix + predicate + ending;
    };

    // 比較専用。表示文・録音データは変更しない。
    const normalize = text =>
        practice2Normalize(text)
            .replace(/なん(?=ですか$|$)/, "なに");

    function references(text, style) {
        const value = normalize(text);

        const ending = negativeForms.find(form =>
            value.endsWith(form)
        );

        let values = ending
            ? negativeForms
                .slice(0, style === "formal" ? 4 : 6)
                .map(form =>
                    value.slice(0, -ending.length) + form
                )
            : [value];

        if (style === "casual") {
            values = values.flatMap(value => [
                value,
                value
                    .replace(/^ううん/, "いいえ")
                    .replace(/^うん/, "はい")
            ]);

            const subjects = ['これ','それ','あれ',
                ...PracticeNext.items.flatMap(o=>['あなたの'+o.hira,'あなたの'+o.kanji])];

            values = values.flatMap(value => {
                const subject = subjects
                    .map(normalize)
                    .find(subject => value.startsWith(subject));

                if (!subject) return [value];

                const rest = value
                    .slice(subject.length)
                    .replace(/^は/, "");

                return [
                    subject + rest,
                    subject + "は" + rest
                ];
            });
        }

        return [...new Set(values)];
    }

    const matches = (actual, expected, style) => {
        const value = normalize(actual);

        return DrillAnswer.formAllowed(actual, style) && value.length > 0
            && references(expected, style).includes(value);
    };

    // 保存時だけ判定する。
    // 設定変更時に、保存済み録音の判定をやり直さない。
    processResult = function(
        rawTranscript,
        expectedText,
        getModel,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan,
        getUrl,
        rate,
        key
    ) {
        const modelText = getModel();

        const acceptedTexts=[...new Set([expectedText,modelText,...(practice2State.replyReferences?.[key]?.()||[])])];
        const saved = {
            acceptedTexts,
            rawTranscript: String(rawTranscript ?? "").trim(),
            expectedText,
            modelText,
            speechStyle,
            isCorrect:
                acceptedTexts.some(text=>matches(rawTranscript,text,speechStyle))
        };

        practice2State.savedResults[key] = saved;

        practice2ShowResult(
            {
                resultSpan,
                correctionBox,
                corrListenBtn,
                corrTextSpan
            },
            saved,
            key,
            rate
        );

        if (isAutoPlay) {
            DrillAudio.playRelay({
                recordButton: practice2State.views[key].recordBtn,
                result: resultSpan,
                speak: done => speakText(practice2SpeechText(modelText), rate, done),
                url: getUrl
            });
        }
    };

    practice2ShowResult = function(view, saved, key, rate) {
        const displayed = scriptMode === "hiragana"
            ? practice2ToHiragana(saved.rawTranscript)
            : String(saved.rawTranscript ?? "");

        view.resultSpan.replaceChildren();
        view.resultSpan.style.color = "var(--text-primary)";

        if (saved.isCorrect) {
            view.resultSpan.append(
                document.createTextNode(displayed + " ✅ ")
            );
        } else {
            const candidates = [
                saved.expectedText,
                saved.modelText,
                ...(saved.acceptedTexts||[])
            ]
                .filter(Boolean)
                .flatMap(text =>
                    references(
                        text,
                        saved.speechStyle || "formal"
                    )
                )
                .flatMap(text => [
                    text,
                    text.replace(/なに(?=ですか$|$)/, "なん")
                ]);

            let best = null;

            for (const reference of candidates) {
                const diff = practice2FindDiff(
                    displayed,
                    reference
                );

                if (!best || diff.cost < best.cost) {
                    best = diff;
                }
            }

            if (!best) {
                view.resultSpan.append(
                    document.createTextNode(displayed)
                );
            } else {
                const red = text => {
                    const span = node("span", "", text);
                    span.style.color = "var(--error-text)";
                    view.resultSpan.append(span);
                };

                for (let i = 0; i <= best.chars.length; i++) {
                    if (best.gaps.has(i)) red("＿");

                    if (i === best.chars.length) break;

                    if (best.redIndexes.has(i)) {
                        red(best.chars[i]);
                    } else {
                        view.resultSpan.append(
                            document.createTextNode(
                                best.chars[i]
                            )
                        );
                    }
                }
            }

            view.resultSpan.append(
                document.createTextNode(" ")
            );
        }

        if (practice2State.audioUrls[key]) {
            appendPersistedPlayButton(
                view.resultSpan,
                key,
                rate
            );
        }

        view.corrListenBtn.hidden = true;
        view.corrListenBtn.style.display = "none";

        view.correctionBox.style.display =
            saved.isCorrect ? "none" : "block";

        view.corrTextSpan.textContent = saved.isCorrect
            ? ""
            : "🔥Keep going! Try once more!";
    };

    function listen(getText, label = "🔊きく", onPlay) {
        const element = button(
            label,
            "Listen to the model sentence.",
            () => {
                const text = getText();
                if (!text) return;

                setPlayingStateMultiple(
                    [element],
                    "Playing..."
                );

                onPlay?.();
                practice2SyncPhotoSpeaker();
                speakText(
                    practice2SpeechText(text),
                    0.75,
                    () => stopAllPlayback()
                );
            }
        );

        return element;
    }

    let imageHintSerial=0;
    function imageHint(anchor,o) {
        if(hintMode==='off')return;
        anchor.classList.add('p21-image-hint');anchor.tabIndex=0;
        const tipText=o.hintText||`${o.colorName?o.colorName+" ":""}${noun(o)} (${o.romaji===o.meaning?o.romaji:o.romaji+", "+o.meaning})`;
        anchor.setAttribute('aria-label',o.hintText?`${anchor.textContent}: ${tipText}`:tipText);
        let host=null;
        function close() {
            if(anchor.matches(':hover, :focus'))return;
            host?.remove();host=null;delete anchor.dataset.portalTip;anchor.removeAttribute('aria-describedby');
        }
        function show() {
            if(host)return;
            host=node('span','tooltip-wrap p21-image-tip-host');
            const tip=node('span','tooltip-tip',tipText);
            tip.id=`p21-image-tip-${++imageHintSerial}`;tip.setAttribute('role','tooltip');host.append(tip);
            anchor.dataset.portalTip=tip.id;anchor.setAttribute('aria-describedby',tip.id);
            document.body.append(host);window.DrillTooltips.position(anchor,tip);
        }
        anchor.addEventListener('pointerenter',show);anchor.addEventListener('focus',show);
        anchor.addEventListener('pointerleave',close);anchor.addEventListener('blur',close);
    }

    function modelText(getText, object, placesOnly = false) {
        const span = node("span");
        const text = getText();

        const pattern = placesOnly ? /(あそこ|ここ|そこ|どこ)/g : /(この|その|あの|どの|ここ|そこ|あそこ|どこ|だれ|誰|ですか|ですね|だよね|だね|だよ|です|だ|は、|が、|いくら|の)/g;

        let position = 0;
        const protectedWord=object?noun(object):'';
        const protectedStarts=[];
        if(protectedWord)for(let at=text.indexOf(protectedWord);at!==-1;at=text.indexOf(protectedWord,at+protectedWord.length))protectedStarts.push(at);

        for (const match of text.matchAll(pattern)) {
            if(protectedStarts.some(at=>match.index>=at&&match.index<at+protectedWord.length))continue;
            span.append(
                document.createTextNode(
                    text.slice(position, match.index)
                )
            );

            span.append(node("strong", "grammar-highlight", match[0]));
            position = match.index + match[0].length;
        }

        span.append(
            document.createTextNode(text.slice(position))
        );

        if(object&&hintMode==='hover') {
            const walker=document.createTreeWalker(span,NodeFilter.SHOW_TEXT),texts=[];
            while(walker.nextNode())texts.push(walker.currentNode);
            for(const textNode of texts) {
                const value=noun(object),parts=textNode.textContent.split(value);
                if(parts.length<2)continue;
                const fragment=document.createDocumentFragment();
                parts.forEach((part,i)=>{if(i){const wordNode=node('span');wordNode.innerHTML=formatWord(object.hira,object.kanji,object.romaji,object.meaning);fragment.append(...wordNode.childNodes);}fragment.append(document.createTextNode(part));});
                textNode.replaceWith(fragment);
            }
        }
        return span;
    }

    function example(container, lines, { responseCue = false } = {}) {
        const box = node("div", "example-box");
        const table = node("table", "drill-example-table");
        const body = node("tbody");

        let responseCell = null;

        for (const [label, cue, getText, buttonLabel] of lines) {
            if (label === "Response:" && !responseCue) {
                if (!responseCell) {
                    const row = node("tr");
                    const labelCell = node("td");

                    labelCell.append(
                        node("strong", "example-label-title", label)
                    );

                    responseCell = node("td");
                    responseCell.colSpan = 4;

                    row.append(labelCell, responseCell);
                    body.append(row);
                }

                const answer = node("span", "practice12-example-answer");
                if (responseCell.childElementCount) {
                    const separator = node("span", "practice12-answer-separator", "↔️");
                    separator.setAttribute("aria-hidden", "true");
                    answer.append(separator);
                }
                answer.append(listen(getText, buttonLabel), modelText(getText));
                responseCell.append(answer);

                continue;
            }

            const row = node("tr");

            const labelCell = node("td");
            labelCell.append(
                node("strong", "example-label-title", label)
            );

            const cueCell = node("td");
            cueCell.innerHTML = cue;

            const arrowCell = node("td", "practice12-example-arrow", "👉");

            const listenCell = node("td", "practice12-empty-listen-cell");
            const textCell = node("td", "practice12-example-model");
            textCell.append(listen(getText, buttonLabel), modelText(getText));

            row.append(
                labelCell,
                cueCell,
                arrowCell,
                listenCell,
                textCell
            );

            body.append(row);
        }

        table.append(body);
        box.append(table);
        container.append(box);
    }

    function card(container, number) {
        const box = node("div", "drill-row");
        const table = node("table", "recording-table");
        const columns = node("colgroup");

        columns.append(
            node("col"),
            node("col"),
            node("col")
        );

        columns.children[0].style.width = "34px";

        const body = node("tbody");
        table.append(columns, body);
        box.append(table);
        container.append(box);

        return {body, number};
    }

    function recordingRow(
        card,
        part,
        cue,
        key,
        getText,
        enabled = true
    ) {
        const row = node("tr");
        row.dataset.speakerRecordingKey = key;

        const numberCell = node(
            "td",
            "drill-number-cell",
            part === "q" ? card.number : ""
        );

        const cueCell = node("td", "drill-cue-cell");

        if (typeof cue === "string") {
            cueCell.innerHTML = cue;
        } else {
            cueCell.append(cue);
        }

        const cell = node("td");
        const controls = node("div", "recording-controls");
        const actions = node("div", "recording-actions");

        const listenBtn = listen(getText);

        const recordBtn = button(
            "🎙️とる",
            "Record your voice."
        );

        const stopBtn = button(
            "⏹️",
            "Stop recording."
        );

        listenBtn.disabled = !enabled;
        recordBtn.disabled = !enabled;
        stopBtn.disabled = true;

        const resultSpan = node(
            "span",
            "result-text",
            "(Not recorded yet)"
        );

        const result = node("span", "recording-result");
        result.append(resultSpan);

        actions.append(
            listenBtn,
            recordBtn,
            stopBtn
        );

        controls.append(actions, result);

        const correctionBox = node(
            "div",
            "correction-box"
        );

        const corrListenBtn = node("button");
        corrListenBtn.hidden = true;

        const corrTextSpan = node("span");

        correctionBox.append(
            corrListenBtn,
            corrTextSpan
        );

        cell.append(controls, correctionBox);

        row.append(
            numberCell,
            cueCell,
            cell
        );

        card.body.append(row);

        bindRecorderEvents(
            recordBtn,
            stopBtn,
            resultSpan,
            correctionBox,
            corrListenBtn,
            corrTextSpan,
            getText,
            getText,
            0.75,
            key
        );

        return {
            row,
            actions,
            cueCell,
            controls,
            listenBtn,
            recordBtn
        };
    }

    function section(id, title, instruction) {
        const container = document.getElementById(id);
        container.replaceChildren();

        const panel = node(
            "div",
            "info-panel info-panel-task1"
        );

        panel.append(
            node("span", "info-panel-title", title),
            node("span", "info-panel-desc instruction-steps", instruction)
        );

        return {container, panel};
    }

    const is22 = document.body.dataset.practice === '2.2';
    const pageKey = is22 ? 'p22' : 'p23';
    const noun=o=>word(o.hira,o.kanji);
    const sound=(speaker,zone)=>zone==='far'?'あ':speaker===zone?'こ':'そ';
    const demonstrative=(speaker,o)=>is22?sound(speaker,o.zone)+'の':o.zone==='far'?'あそこ':speaker===o.zone?'ここ':'そこ';
    const ending=()=>({formal:'です。',informal:'だ。',casual:'だよ。'}[speechStyle]);
    const short=text=>text+ending();
    const adnominal=(speaker,o)=>demonstrative(speaker,o)+noun(o);
    const price=o=>word(o.priceHira,o.priceKanji);
    const priceCue=o=>{
        const text=price(o);
        if(hintMode==='off'||scriptMode==='hiragana')return text;
        if(hintMode==='paren')return `<span class="practice12-cue-unit display-cue-unit"><span class="target-word">${text}</span><span class="vocab-inline">(${o.priceHira})</span></span>`;
        return `<span class="tooltip-wrap"><span class="target-word">${text}</span><span class="tooltip-tip">${o.priceHira}</span></span>`;
    };
    const describe=(speaker,o)=>is22?statement(adnominal(speaker,o),price(o)):statement(demonstrative(speaker,o),noun(o));
    const vocabulary=o=>formatWord(o.hira,o.kanji,o.romaji,o.meaning);
    const itemsFor=kinds=>kinds.map((kind,i)=>{
        const prices={phone:['さんまんえん','三万円',30000],dictionary:['さんぜんえん','三千円',3000],wallet:['にせんえん','二千円',2000],notebook:['さんびゃくえん','三百円',300]};
        const [priceHira,priceKanji,priceNumber]=prices[kind];
        return {...PracticeNext.items.find(o=>o.kind===kind),zone:['A','B','far'][i],priceHira,priceKanji,priceNumber};
    });
    const merchandise=(kind)=>{
        const base={fruit:['くだもの','果物','kudamono','fruit'],bag:['かばん','カバン','kaban','bag'],clock:['とけい','時計','tokei','clock / watch'],onigiri:['おにぎり','おにぎり','onigiri','rice ball'],bento:['おべんとう','お弁当','obentō','boxed lunch']}[kind];
        const values=kind==='fruit'?[300,100,200]:kind==='onigiri'?[300,600,900]:kind==='bento'?[1000,2000,3000]:kind==='clock'?[6000,9000,10000]:[2000,5000,8000];
        const names={100:['ひゃくえん','百円'],200:['にひゃくえん','二百円'],5000:['ごせんえん','五千円'],6000:['ろくせんえん','六千円'],8000:['はっせんえん','八千円'],9000:['きゅうせんえん','九千円'],10000:['いちまんえん','一万円'],300:['さんびゃくえん','三百円'],600:['ろっぴゃくえん','六百円'],900:['きゅうひゃくえん','九百円'],1000:['せんえん','千円'],2000:['にせんえん','二千円'],3000:['さんぜんえん','三千円'],4000:['よんせんえん','四千円']};
        return values.map((priceNumber,i)=>({kind,hira:base[0],kanji:base[1],romaji:base[2],meaning:base[3],zone:['A','B','far'][i],photoKind:kind,priceNumber,priceHira:names[priceNumber][0],priceKanji:names[priceNumber][1]}));
    };
    const places=()=>PracticeNext.places.map(o=>({...o}));
    function panel(container,title,instruction) {
        const p=node('div','info-panel info-panel-task1');
        p.append(node('span','info-panel-title',title),node('span','info-panel-desc',instruction));container.append(p);
    }
    function setButtons(container,labels,property) {
        const index=practice2State[property]??0;
        const group=node('div','p21-set-switcher');group.dataset.setState=property;group.setAttribute('role','group');group.setAttribute('aria-label','Practice set');
        labels.forEach((label,i)=>{
            const b=node('button','example-button',label);b.type='button';b.setAttribute('aria-pressed',String(i===index));
            b.onclick=()=>{
                if(busy()||i===index)return;
                const top=b.getBoundingClientRect().top;practice2State[property]=i;renderAll();
                const next=document.querySelector(`[data-set-state="${property}"] button:nth-child(${i+1})`);
                next.focus({preventScroll:true});window.scrollBy(0,next.getBoundingClientRect().top-top);
            };group.append(b);
        });container.append(group);return index;
    }
    function emphasize(context) {SpeakerGuide.play(context,context.dataset.nextSpeaker);}
    const shopAudioCleanups=[];
    function scene(container,objects,{example=false,people=false,which=false,model=false,speakerGuide=example||model}={}) {
        const shop=is22&&!people;
        const hats=shop&&(example||Boolean(objects[0]?.photoKind));
        const photoKind=objects[0]?.photoKind;
        // Coordinates refer to the photographed products, not the surrounding shelf.
        const shopGeometry={
            hats:{centers:[[27,54],[74,54],[50,24]],tops:[47,46,17]},
            bag:{centers:[[27,51],[73,52],[50,23]],tops:[41,43,14.5]},
            clock:{centers:[[27.5,51],[72.5,54],[50,23]],tops:[42,49,15]},
            fruit:{centers:[[27.5,52],[72.5,53],[50,24]],tops:[46,48,19]},
            onigiri:{centers:[[27.5,54],[72.5,54],[50,25]],tops:[49,49,20]},
            bento:{centers:[[30,57],[73,57],[50,28]],tops:[50,50,19]}
        }[photoKind||'hats'];
        const picture=node('div','p21-drill-picture p2x-picture');
        picture.classList.toggle('p2x-shop-picture',shop);picture.classList.toggle('p2x-cropped-picture',shop);
        picture.classList.toggle('p2x-hat-picture',hats);
        picture.classList.toggle('p2x-example-picture',example);picture.classList.toggle('p2x-model-picture',model);picture.classList.toggle('p2x-floor-picture',!is22);
        picture.classList.toggle('p2x-people-picture',people);
        const stage=node('div','p2x-stage');
        const image=node('img','p2x-photo');
        image.src=!is22?'assets/practice23-floors.png':people?'assets/practice22-people.png':hats?(photoKind?`assets/practice22-${photoKind}.png`:'assets/practice22-hats.png'):'assets/practice22-shelves.png';
        image.alt=!is22?'Three comic panels: A is on the first floor at the bank, B on the second floor at the cafe, and neither is on the third floor at the library.':people?'A and Mary stand together in the left foreground, seen from behind and facing the pair on the right. Takeshi, with long dreadlocks, black-framed glasses and a mustard yellow shirt, and B, in his original navy shirt without glasses, stand farther back on the right and face A and Mary across a clear gap. Robert sits at the back reading a book, far from both pairs.':hats?'Rear view of A on the left and B on the right, with a baseball cap near A, a sun hat near B, and a fedora on the upper central shelf.':'A stands on the left beside a nearby shelf, B stands on the right beside another nearby shelf, and a third shelf is far from both at the back of the shop.';
        if(photoKind)image.alt=`A stands on the left and B on the right, seen from behind. ${photoKind==='fruit'?'Apples, bananas, and mandarins':photoKind==='onigiri'?'Three groups of two rice balls':photoKind==='bento'?'Three groups of two boxed lunches':photoKind==='bag'?'Three differently shaped bags':'Three differently shaped clocks and watches'}: one near A, one near B, and one on the upper shelf far from both.`;
        image.width=shop?1774:is22?1536:2172;image.height=shop?887:is22?1024:724;stage.append(image);
        if(is22&&example&&!people) {
            for(const zone of ['A','B','far']) {
                const reach=node('div','p2x-reach');reach.dataset.reach=zone;reach.setAttribute('aria-hidden','true');stage.append(reach);
                const foreground=node('img','p2x-photo p2x-reach-foreground');foreground.src=image.src;foreground.alt='';foreground.dataset.zone=zone;foreground.setAttribute('aria-hidden','true');stage.append(foreground);
            }
        }
        if(!is22) {
            PracticeNext.places.forEach((place,i)=>{
                const label=node('div','p2x-floor-label');label.dataset.zone=place.zone;
                label.append(node('strong','',`${i+1}F · `));
                const name=node('span');name.innerHTML=example&&hintMode==='paren'?noun(place):vocabulary(place);label.append(name);stage.append(label);
            });
        }
        const context=node('p','p21-photo-context p2x-speaker-guide');
        SpeakerGuide.init(context);
        const peoplePositions=hats?{A:[11,78],B:[88,78]}:people?{A:[3,64],B:[85,64]}:is22?{A:[2,4],B:[94,4]}:{A:[6,17],B:[60,17]};
        for(const person of ['A','B']) {
            const label=node('strong','p2x-person',person);label.dataset.person=person;
            label.style.left=peoplePositions[person][0]+'%';label.style.top=peoplePositions[person][1]+'%';stage.append(label);
        }
        const audioGrid=node('div','p2x-audio-grid');
        for(const [i,o] of objects.entries()) {
            const position=hats?shopGeometry.centers[['A','B','far'].indexOf(o.zone)]:!is22?{A:[20,84],B:[51,84],far:[84,76]}[o.zone]:people?{A:[35,56],B:[65,56],far:[50,52]}[o.zone]:{A:[25,52],B:[73,53],far:[50,23.5]}[o.zone];
            const target=node('div',people?'p2x-person-target':'p2x-object');target.dataset.zone=o.zone;target.dataset.kind=o.kind;target.dataset.color=o.colorName||'';
            target.style.left=position[0]+'%';target.style.top=position[1]+'%';
            if(photoKind==='clock'){target.style.width=(o.zone==='A'?11:10)+'%';target.style.aspectRatio=o.zone==='B'?'1.8':'1';}
            if(!people) {
                const sprite=node('span','p2x-sprite');
                if(o.kind==='hat'||o.photoKind) {sprite.style.background='none';}
                else if(o.kind==='place') {sprite.classList.add('p2x-place-target');}
                else if(o.kind==='notebook') {sprite.style.backgroundImage="url('assets/practice21-items.png')";sprite.style.backgroundSize='300% 200%';sprite.style.backgroundPosition='0% 100%';}
                else {sprite.style.backgroundPosition=`${{red:0,blue:50,green:100}[o.colorName||'blue']}% ${{phone:0,dictionary:50,wallet:100}[o.kind]}%`;}
                target.append(sprite);
                if(is22&&(!which||photoKind)) {
                    const tag=node('span','p2x-price',`¥${o.priceNumber.toLocaleString('en-US')}`);
                    if(!example&&!model){tag.classList.add('p2x-price-hint');imageHint(tag,{...o,hintText:o.priceHira});}
                    if(hats) {
                        tag.style.left=position[0]+'%';
                        const itemTop=shopGeometry.tops[['A','B','far'].indexOf(o.zone)];
                        tag.style.top=`calc(${itemTop}% - 3px)`;tag.style.transform='translate(-50%,-100%)';tag.style.bottom='auto';stage.append(tag);
                    }
                    else target.append(tag);
                }
            }
            imageHint(target,people?{...o,hintText:noun(o)}:photoKind==='fruit'?{...o,hintText:['りんご (ringo, apple)','バナナ (banana)','みかん (mikan, mandarin)'][i]}:o);
            if(people)target.setAttribute('aria-label',noun(o));
            stage.append(target);
            if(example) {
                const region=node('div','p2x-distance-label');region.dataset.zone=o.zone;
                region.style.left=(hats?{A:30,B:70,far:68}[o.zone]:position[0])+'%';region.style.top=(hats?(o.zone==='far'?9:57):is22?position[1]+20:39)+'%';
                region.append(node('strong','p21-area-sound'),node('span','p21-area-description'));stage.append(region);
                const buttons=node('div','p21-item-audio p2x-audio');buttons.dataset.zone=o.zone;
                buttons.style.left=(!is22?[17,50,83][i]:position[0])+'%';buttons.style.top=(is22?position[1]+27:73)+'%';
                for(const speaker of ['A','B']) {
                    const b=listen(()=>{select(speaker,o.zone);return describe(speaker,o);},`${speaker}🔊きく`,()=>emphasize(context));
                    b.dataset.speaker=speaker;b.dataset.zone=o.zone;buttons.append(b);
                }
                buttons.style.order=(!is22?['A','B','far']:['A','far','B']).indexOf(o.zone);
                if(hats) {
                    buttons.style.left={A:39,B:61,far:36}[o.zone]+'%';
                    buttons.style.top=(o.zone==='far'?3:37)+'%';
                    stage.append(buttons);
                } else {const heading=node('strong','p2x-audio-heading',noun(o));buttons.prepend(heading);audioGrid.append(buttons);}
            }
        }
        if(which) {
            if(is22) {
                const guide=node('div','p21-which-guide');
                const heading=node('strong');heading.append(node('span','p21-question-sound','ど'),node('span','p21-question-description','Asking about the unknown'));heading.lastElementChild.innerHTML='Asking about <br>the unknown';guide.append(heading);
                guide.insertAdjacentHTML('afterbegin','<svg class="p21-thought-cloud" viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true"><path d="M35 20C35 7 65 2 82 12C96-1 130-1 145 10C165-1 197 1 208 13C230 5 261 13 261 28C286 30 295 50 279 62C291 78 270 92 248 87C231 101 200 96 189 87C170 99 139 99 124 88C102 99 72 96 62 85C34 91 12 78 21 61C4 45 10 26 35 20Z"/></svg>');
                const dots=node('span','p21-thought-dots');dots.setAttribute('aria-hidden','true');guide.append(dots);stage.append(guide);
            } else {
                const guide=node('div','p2x-unknown-guide');guide.append(node('strong','','ど：'),node('span','','Asking about the unknown'));picture.append(guide);
            }
        }
        if(speakerGuide){if(hats)stage.append(context);else picture.append(context);}
        if(shop){const canvas=node('div','p2x-scene-canvas');while(stage.firstChild)canvas.append(stage.firstChild);stage.append(canvas);}
        picture.append(stage);if(example&&!hats)picture.append(audioGrid);
        if(hats&&example){
            const tray=node('div','p2x-compact-audio');tray.setAttribute('aria-label','Model audio: left item, upper item, right item');picture.append(tray);
            const media=matchMedia('(max-width:700px)');
            const moveAudio=()=>{const compact=media.matches;picture.dataset.audioLayout=compact?'tray':'overlay';tray.hidden=!compact;for(const controls of picture.querySelectorAll('.p2x-audio'))(compact?tray:stage.querySelector('.p2x-scene-canvas')).append(controls);};
            moveAudio();media.addEventListener('change',moveAudio);shopAudioCleanups.push(()=>media.removeEventListener('change',moveAudio));
        }
        container.append(picture);
        function select(speaker,zone) {
            picture.dataset.speaker=speaker;picture.dataset.target=zone||'';
            context.dataset.nextSpeaker=speaker;
            stage.querySelectorAll('[data-person]').forEach(e=>e.classList.toggle('is-speaker',e.dataset.person===speaker&&Boolean(context.dataset.speaker)));
            stage.querySelectorAll('.p2x-distance-label').forEach(e=>{
                const value=sound(speaker,e.dataset.zone);e.dataset.sound=value;
                e.querySelector('strong').textContent=value;
                e.querySelector('span').textContent=value==='こ'?'Near the speaker':value==='そ'?'Near the listener':'Far from both';
            });
            stage.querySelectorAll('.p2x-object,.p2x-person-target').forEach(e=>e.classList.toggle('is-target',e.dataset.zone===zone));
            container.querySelectorAll('.p21-model-line').forEach(e=>{
                const selected=e.dataset.modelSpeaker===speaker&&e.dataset.zone===zone;
                e.classList.toggle('is-current-model',selected);if(selected)e.setAttribute('aria-current','true');else e.removeAttribute('aria-current');
            });
        }
        select.announce=speaker=>SpeakerGuide.play(context,speaker);select('A');return select;
    }
    function attach(view,speaker,o,select) {
        view.row.dataset.drillSpeaker=speaker;view.row.dataset.zone=o.zone;
        for(const control of [view.listenBtn,view.recordBtn])for(const event of ['click','focus'])control.addEventListener(event,()=>select(speaker,o.zone));
    }
    const cityObjects=(drill=false)=>{
        const data=drill?[
            ['おおさか','大阪','Ōsaka','Osaka','あさ','朝','ごぜんろくじ','午前六時','06:00'],
            ['パリ','パリ','Pari','Paris','よる','夜','ごごじゅうじ','午後十時','22:00'],
            ['ロサンゼルス','ロサンゼルス','Rosanzerusu','Los Angeles','ひる','昼','ごごにじ','午後二時','14:00']
        ]:[
            ['とうきょう','東京','Tōkyō','Tokyo','あさ','朝','ごぜんろくじ','午前六時','06:00'],
            ['ロンドン','ロンドン','Rondon','London','よる','夜','ごごくじ','午後九時','21:00'],
            ['ニューヨーク','ニューヨーク','Nyū Yōku','New York','ゆうがた','夕方','ごごごじ','午後五時','17:00']
        ];
        return data.map(([hira,kanji,romaji,meaning,periodHira,periodKanji,timeHira,timeKanji,clock],i)=>({hira,kanji,romaji,meaning,periodHira,periodKanji,timeHira,timeKanji,clock,zone:['A','B','far'][i],kind:'city'}));
    };
    function phoneIcon() {
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        for(const [key,value] of Object.entries({class:'p23-phone-icon','aria-hidden':'true',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round'}))svg.setAttribute(key,value);
        svg.innerHTML='<path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.91-8.67A2 2 0 0 1 3.26 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L7.24 8.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92z"/>';
        return svg;
    }
    function cityScene(container,{example=false,times=false,cityLabels=false,objects=cityObjects(),drill=false,indoor=false,call=false,placeHints=true}={}) {
        const picture=node('div','p21-drill-picture p2x-picture p23-city-picture'+(example?' p2x-example-picture':''));
        picture.classList.toggle('p23-indoor-picture',indoor);picture.classList.toggle('p23-practice-picture',!example);
        const context=node('p','p21-photo-context p2x-speaker-guide');
        if(call){context.dataset.prompt='A is calling B and talking about C.';context.dataset.playingLabel='A is calling B and talking about C.';context.classList.add('p23-call-note');picture.classList.add('p23-call-example');}
        SpeakerGuide.init(context);
        if(call)context.prepend(phoneIcon());
        if(example&&!call){picture.append(context);const link=node('p','p23-call-link');link.append(phoneIcon(),node('span','','A ↔ B'));picture.append(link);}
        const stage=node('div','p23-city-stage'),photo=node('img','p23-city-photo');
        photo.src=indoor?'assets/practice23-places.png':drill?'assets/practice23-drill-cities.png':'assets/practice23-cities.png';photo.width=2172;photo.height=724;
        photo.alt=indoor?'A at the bank and B at the cafe are on a phone call. C reads quietly at the library.':'A and B are on a phone call in different cities. C is seated having a drink in a third city, not in their conversation.';stage.append(photo);
        for(const [i,o]of objects.entries()) {
            const region=node('div','p23-city-region');region.dataset.zone=o.zone;region.style.left=(i*100/3)+'%';
            if(example){const caption=node('div','p2x-distance-label');caption.dataset.zone=o.zone;caption.append(node('strong','p21-area-sound'),node('span','p21-area-description'));region.append(caption);}
            if(placeHints){const hint=node('span','p23-city-hint');imageHint(hint,o);region.append(hint);}
            region.append(node('strong','p23-city-person',['A','B','C'][i]));
            if(times&&!call){const clock=node('span','p23-city-time',o.clock);imageHint(clock,{...o,hintText:o.timeHira});region.append(clock);}
            if(cityLabels){const label=node('span','p23-city-time p23-city-name',noun(o));imageHint(label,o);region.append(label);}
            stage.append(region);
        }
        picture.append(stage);
        if(example&&call)picture.append(context);
        container.append(picture);
        function select(speaker,zone){
            picture.dataset.speaker=speaker;picture.dataset.target=zone||'';context.dataset.nextSpeaker=speaker;
            picture.querySelectorAll('.p23-city-region').forEach(e=>{const value=sound(speaker,e.dataset.zone);e.dataset.sound=value;e.classList.toggle('is-target',e.dataset.zone===zone);const caption=e.querySelector('.p2x-distance-label');if(caption){caption.querySelector('.p21-area-sound').textContent=value;caption.querySelector('.p21-area-description').textContent=value==='こ'?'Near the speaker':value==='そ'?'Near the listener':'Far from both';}});
            if(example)container.querySelectorAll('.p21-model-line').forEach(e=>e.classList.toggle('is-current-model',e.dataset.modelSpeaker===speaker&&e.dataset.zone===zone));
        }
        select.placeButton=(button,o)=>{const holder=node('div','p23-in-scene-audio');holder.dataset.zone=o.zone;holder.append(button);stage.querySelector(`.p23-city-region[data-zone="${o.zone}"]`).append(holder);};
        select.announce=speaker=>SpeakerGuide.play(context,speaker);select('A');return select;
    }
    function renderCitySections(){
        practice2State.exampleCueObserver?.disconnect();
        const attachCity=(view,speaker,o,select)=>{view.row.dataset.drillSpeaker=speaker;view.row.dataset.zone=o.zone;for(const control of [view.listenBtn,view.recordBtn])control.addEventListener('click',()=>select(speaker,o.zone));};
        const identifySpeaker=(view,key)=>{view.row.dataset.p23RecordingKey=key;};
        const englishPlace=place=>({'ここ':'here','そこ':'there','あそこ':'over there','Cさん':'C','Bさん':'B','Aさん':'A'}[place]||place);
        const englishCue=(view,parts)=>{
            if(!practice2State.englishCues)return;
            const role=view.cueCell.querySelector('strong')?.cloneNode(true);
            view.cueCell.replaceChildren(...(role?[role,document.createTextNode(' ')]:[]),document.createTextNode(parts.join('/')));
        };
        const cs=cityObjects(),whereContainer=document.getElementById('drill2Container'),describeContainer=document.getElementById('drill1Container'),d3=document.getElementById('drill3Container');
        const period=o=>word(o.periodHira,o.periodKanji),time=o=>word(o.timeHira,o.timeKanji);
        const e1=node('section','example-box p2x-example');e1.append(node('h2','p21-distance-heading','ここ・そこ・あそこ・どこ'));
        const countries=cs.map((o,i)=>({...o,...PracticeNext.countries.find(c=>c.hira===['にほん','イギリス','アメリカ'][i])}));
        const selectEx=cityScene(e1,{example:true,times:true,call:true,objects:countries}),list=node('div','p21-model-list p23-speaking-models');
        const header=node('div','p23-example-header');header.append(e1.querySelector('.p21-distance-heading'),e1.querySelector('.p23-call-note'));e1.prepend(header);
        const unknown=node('div','p21-which-guide p23-unknown-guide');
        const unknownHeading=node('strong');unknownHeading.append(node('span','p21-question-sound','ど'),node('span','p21-question-description'));
        unknownHeading.lastElementChild.innerHTML='Asking about<br>the unknown';unknown.append(unknownHeading);
        unknown.insertAdjacentHTML('afterbegin','<svg class="p21-thought-cloud" viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true"><path d="M35 20C35 7 65 2 82 12C96-1 130-1 145 10C165-1 197 1 208 13C230 5 261 13 261 28C286 30 295 50 279 62C291 78 270 92 248 87C231 101 200 96 189 87C170 99 139 99 124 88C102 99 72 96 62 85C34 91 12 78 21 61C4 45 10 26 35 20Z"/></svg>');
        const dots=node('span','p21-thought-dots');dots.setAttribute('aria-hidden','true');unknown.append(dots);e1.querySelector('.p23-city-stage').append(unknown);
        list.classList.add('p23-conversation-models');
        const periodCue=o=>formatWord(o.periodHira,o.periodKanji,...{あさ:['asa','morning'],よる:['yoru','night'],ゆうがた:['yūgata','evening']}[o.periodHira]);
        const sentences=[
            {who:'A',object:countries[0],intro:()=>statement(word('わたし','私'),noun(countries[0])),cue:()=>`ここ／${periodCue(countries[0])}`,text:()=>statement('ここ',period(countries[0]))},
            {who:'A',object:countries[1],cue:()=>'Bさん／どこ',text:()=>question('Bさん','どこ')},
            {who:'B',object:countries[1],intro:()=>statement(word('わたし','私'),noun(countries[1]))},
            {who:'B',label:'',object:countries[1],cue:()=>`ここ／${periodCue(countries[1])}`,text:()=>statement('ここ',period(countries[1]))},
            {who:'A',object:countries[2],cue:()=>'Cさん／どこ',text:()=>question('Cさん','どこ')},
            {who:'B',object:countries[2],intro:()=>statement('Cさん',noun(countries[2]))},
            {who:'B',label:'',object:countries[2],cue:()=>`あそこ／${periodCue(countries[2])}`,text:()=>statement('あそこ',period(countries[2]))}
        ];
        function exampleCueAudio({who,object:o,text}) {
            const audio=node('span','p23-example-audio'),b=listen(()=>{selectEx(who,o.zone);return text();},'🔊きく',()=>selectEx.announce(who));
            b.dataset.speaker=who;b.dataset.zone=o.zone;audio.append(node('span','','👉️'),b);return audio;
        }
        const displayModel=({text,object:o})=>modelText(()=>speechStyle==='formal'?text().replace(/？/g,'。'):text(),o,true);
        sentences.forEach(sentence=>{
            const {who,object:o,intro,cue,label}=sentence,line=node('div','p21-model-line');line.dataset.modelSpeaker=who;line.dataset.zone=o.zone;
            const introduction=node('span','p23-model-intro');if(intro)introduction.append(modelText(intro,o,true));
            line.append(node('strong','p23-model-speaker',label??who+':'),introduction);
            if(cue){const prompt=node('span','p23-example-cue');prompt.innerHTML=cue();const answer=node('span','p23-model-answer');answer.append(displayModel(sentence));line.append(prompt,exampleCueAudio(sentence),answer);}
            list.append(line);
        });e1.append(list);describeContainer.append(e1);
        const unknownOffset={x:0,y:0};
        function alignExampleCues() {
            if(!list.isConnected)return;
            let width=0;
            list.querySelectorAll('.p21-model-line > .p23-example-cue').forEach(cue=>{
                const measure=cue.cloneNode(true);measure.style.cssText='position:absolute;display:inline-block;width:max-content;max-width:none;white-space:normal;visibility:hidden;';list.append(measure);width=Math.max(width,measure.getBoundingClientRect().width);measure.remove();
            });
            const gap=parseFloat(getComputedStyle(list).columnGap)||0;
            const role=list.querySelector('.p23-model-speaker').getBoundingClientRect().width;
            const audio=list.querySelector('.p23-example-audio').getBoundingClientRect().width;
            const available=list.clientWidth-role-audio-gap*3;
            const value=Math.max(0,Math.min(width,available))+'px';
            if(list.style.getPropertyValue('--p23-example-cue-width')!==value)list.style.setProperty('--p23-example-cue-width',value);
            // The SVG cloud extends beyond its label: align its visible contour.
            const frame=unknown.closest('.p23-city-stage').getBoundingClientRect();
            const contour=unknown.querySelector('path').getBoundingClientRect();
            const dx=frame.left+frame.width/3-4-contour.right,dy=frame.bottom-4-contour.bottom;
            if(Math.abs(dx)>.1||Math.abs(dy)>.1){unknownOffset.x+=dx;unknownOffset.y+=dy;unknown.style.translate=`${unknownOffset.x}px ${unknownOffset.y}px`;}

        }
        practice2State.exampleCueObserver=new ResizeObserver(alignExampleCues);practice2State.exampleCueObserver.observe(list);practice2State.exampleCueObserver.observe(unknown.closest('.p23-city-stage'));alignExampleCues();
        // D2 builds location conversations, after the simpler D1 statements.
        const whereSet=[0,1,2].includes(practice2State.whereDrillSet)?practice2State.whereDrillSet:0;practice2State.whereDrillSet=whereSet;
        panel(whereContainer,'Drill 2: Where?',whereSet===0?'💡Ask where each person is. Answer with the place.':whereSet===2?'💡Check the location. Say no and give the correct location.':'💡Ask where each framed item is. Answer with ');
        if(whereSet===1){const instruction=whereContainer.lastElementChild.querySelector('.info-panel-desc');instruction.append(node('span','p23-locative-options','ここ／そこ／あそこ'),document.createTextNode('.'));}
        setButtons(whereContainer,['People','Item1','Item2'],'whereDrillSet');
        const wherePlaces=PracticeNext.places.map(o=>({...o}));
        const selectWhere=cityScene(whereContainer,{indoor:true,objects:wherePlaces,placeHints:whereSet===0});
        const wherePicture=whereContainer.querySelector(':scope > .p23-city-picture');wherePicture.classList.add('p23-where-picture');
        const objectKinds=['bag','book','notebook','pen'];
        const whereObjects=whereSet===0?[]:objectKinds.map((kind,i)=>({...PracticeNext.items.find(o=>o.kind===kind),zone:['A','far','far','B'][i]}));
        const counters={A:0,B:0,far:0};
        whereObjects.forEach(o=>{
            const target=node('span','p23-where-item');target.dataset.kind=o.kind;target.dataset.zone=o.zone;
            const slot=counters[o.zone]++;
            target.style.right='4px';target.style.top=`calc(4px + ${slot} * (28cqw + 4px))`;
            const sprite=node('span','p23-where-sprite');sprite.style.backgroundPosition={bag:'0% 0%',book:'100% 0%',notebook:'0% 100%',pen:'100% 100%'}[o.kind];target.append(sprite);imageHint(target,o);
            wherePicture.querySelector(`.p23-city-region[data-zone="${o.zone}"]`).append(target);
        });
        const whereConversations=whereSet===0?[
            {ask:'A',reply:'B',object:wherePlaces[1],subject:()=>'Bさん'},
            {ask:'B',reply:'A',object:wherePlaces[0],subject:()=>'Aさん'},
            {ask:'B',reply:'A',object:wherePlaces[2],subject:()=>'Cさん'}
        ]:whereObjects.map((o,i)=>({ask:i===3?'A':'B',reply:i===3?'B':'A',object:o,subject:()=>noun(o)}));
        whereConversations.forEach(({ask,reply,object:o,subject},i)=>{
            const c=card(whereContainer,String(i+1)),prefix=`p23_where_d1_s${whereSet}_${i}`,loc=demonstrative(reply,o);
            const replySubject=()=>whereSet===0?(subject()==='Cさん'?'Cさん':'ここ'):noun(o);
            const wrongPlace={zone:['far','B','A','far'][i]},wrongQuestion=demonstrative(ask,wrongPlace),wrongReply=demonstrative(reply,wrongPlace);
            const correct=()=>statement(replySubject(),whereSet===0?noun(o):loc);
            const answer=()=>whereSet===2?response(wrongReply,false)+short(loc):whereSet===1&&i===2?correct().replace(replySubject()+'は、',replySubject()+'も、'):correct();
            practice2State.replyReferences[prefix+'_r']=()=>whereSet===2?[correct(),short(loc),...(i===2?[correct().replace(replySubject()+'は、',replySubject()+'も、'),response(wrongReply,false)+correct().replace(replySubject()+'は、',replySubject()+'も、')]:[]),response(wrongReply,false)+short(loc),...[...(negativeForms.slice(0,speechStyle==='formal'?4:6)),...(speechStyle==='casual'?['じゃないよ','ではないよ']:[])].flatMap(negative=>[wrongReply+negative+'。'+correct(),wrongReply+negative+'。'+short(loc)]).flatMap(text=>[text,(speechStyle==='casual'?'ううん、':'いいえ、')+text]),(speechStyle==='casual'?'ううん、':'いいえ、')+correct(),(speechStyle==='casual'?'ううん、':'いいえ、')+short(loc)]:whereSet===0?[short(noun(o)),statement(loc,noun(o)),statement(subject()==='Cさん'?'Cさん':word('わたし','私'),noun(o)),...(o.hira==='きっさてん'?[short('カフェ'),statement(loc,'カフェ'),statement(word('わたし','私'),'カフェ')]:[])]:[short(loc),statement(noun(o),loc)];
            const cue=whereSet===0?subject():vocabulary(o);
            const q=recordingRow(c,'q',`<strong>${ask} · Question:</strong> ${cue}／${whereSet===2?wrongQuestion:'どこ'}`,prefix+'_q',()=>question(subject(),whereSet===2?wrongQuestion:'どこ'));
            const replyCue=whereSet===0?replySubject():vocabulary(o);
            const r=recordingRow(c,'a',`<strong>${reply} · Response:</strong> ${whereSet===2?wrongReply+'／'+loc:replyCue+(whereSet===0?'／'+vocabulary(o):i===3?'／'+loc:'')}`,prefix+'_r',answer);
            identifySpeaker(q,prefix+'_q');identifySpeaker(r,prefix+'_r');
            englishCue(q,[whereSet===0?englishPlace(subject()):o.meaning,whereSet===2?englishPlace(wrongQuestion):'where']);
            englishCue(r,whereSet===2?[englishPlace(wrongReply),englishPlace(loc)]:whereSet===0?[replySubject()==='Cさん'?'C':'here',o.meaning]:[o.meaning,...(i===3?[englishPlace(loc)]:[])]);
            if(whereSet===2)r.actions.append(node('span','p21-response-lead',speechStyle==='casual'?'ううん…':'いいえ…'));
            const select=(who,zone)=>{selectWhere(who,zone);wherePicture.querySelectorAll('.p23-where-item').forEach(e=>e.classList.toggle('is-target',e.dataset.kind===o.kind));};
            attachCity(q,ask,o,select);attachCity(r,reply,o,select);
        });
        panel(describeContainer,'Drill 1: From A’s point of view','💡You are A. Make each sentence using ここ, そこ, or あそこ.');
        const set1=setButtons(describeContainer,['Country','Cities','Time'],'cityDrillSet');
        // D1 and D3 share the same locations and simultaneous winter-standard times.
        const ds=cityObjects(true).map((o,i)=>({...o,country:PracticeNext.countries.find(c=>c.hira===['にほん','フランス','アメリカ'][i]),clock:['6:00','22:00','13:00'][i],timeHira:['あさろくじ','よるじゅうじ','ごごいちじ'][i],timeKanji:['朝六時','夜十時','午後一時'][i]}));
        const drillClockPlaces=ds.map(o=>set1===1?o:{...o,...o.country});
        const timeHints=[['asa rokuji','6 a.m.'],['yoru jūji','10 p.m.'],['gogo ichiji','1 p.m.']];
        const hintPlaces=drillClockPlaces.map((o,i)=>set1===2?{...o,hira:o.timeHira,kanji:o.timeKanji,romaji:timeHints[i][0],meaning:timeHints[i][1]}:o);
        const select1=cityScene(describeContainer,{objects:hintPlaces,drill:true,times:set1===2,cityLabels:set1===1});
        describeContainer.querySelector(':scope > .p23-city-picture').classList.add('p23-describe-picture');
        drillClockPlaces.forEach((o,i)=>{
            const c=card(describeContainer,String(i+1));
            const model=()=>statement(demonstrative('A',o),set1===2?time(o):noun(o));
            const cue=set1===2?formatWord(o.timeHira,o.timeKanji,...timeHints[i]):vocabulary(o);
            const key=set1===1?`p23_describe_cities_${i}`:set1===2?`p23_describe_time_${i}`:`p23_describe_s${set1}_${i}`;
            const r=recordingRow(c,'q',cue,key,model);attachCity(r,'A',o,select1);identifySpeaker(r,key);englishCue(r,[set1===2?timeHints[i][1]:o.meaning]);
        });
        // D3 reuses the D1 settings and scene for real question/response turns.
        panel(d3,'Drill 3: Ask and answer','💡Ask your partner. Answer from the speaker’s point of view.');
        const dialogueMode=setButtons(d3,['Country','Cities','Time','Day'],'cityDialogueSet');
        const days=[{hira:'にちようび',kanji:'日曜日',romaji:'nichiyōbi',meaning:'Sunday'},{hira:'どようび',kanji:'土曜日',romaji:'doyōbi',meaning:'Saturday'},{hira:'どようび',kanji:'土曜日',romaji:'doyōbi',meaning:'Saturday'}];
        const locations=ds;
        const dialogueHints=locations.map((o,i)=>dialogueMode===3?{...o,...days[i],clock:i===0?'Sun.':'Sat.',timeHira:days[i].hira}:dialogueMode===0?{...o,...o.country}:dialogueMode===2?{...o,hira:o.timeHira,kanji:o.timeKanji,romaji:timeHints[i][0],meaning:timeHints[i][1]}:o);
        const selectDialogue=cityScene(d3,{objects:dialogueHints,drill:true,times:dialogueMode===2||dialogueMode===3,cityLabels:dialogueMode===1});
        d3.querySelector('.p23-city-picture').classList.add('p23-describe-picture','p23-dialogue-picture');
        const turns=dialogueMode===0?[
            {ask:'A',reply:'B',index:1,qsubject:'そこ',rsubject:'ここ'},
            {ask:'B',reply:'A',index:0,qsubject:'そこ',rsubject:'ここ'},
            {ask:'B',reply:'A',index:2,qsubject:'Cさん',rsubject:'Cさん'}
        ]:dialogueMode===1?[
            {ask:'A',reply:'B',index:1,qsubject:'そこ',rsubject:'ここ'},
            {ask:'B',reply:'A',index:0,qsubject:'そこ',rsubject:'ここ'},
            {ask:'A',reply:'B',index:2,qsubject:'Cさん',rsubject:'Cさん'}
        ]:[
            {ask:'A',reply:'B',index:1,qsubject:'そこ',rsubject:'ここ'},
            {ask:'B',reply:'A',index:0,qsubject:'そこ',rsubject:'ここ'},
            {ask:'A',reply:'B',index:2,qsubject:'あそこ',rsubject:'あそこ'}
        ];
        turns.forEach(({ask,reply,index,qsubject,rsubject},i)=>{
            const o=locations[index],c=card(d3,String(i+1)),prefix=`p23_dialogue_s${dialogueMode}_${i}`;
            const cityPhrase=()=>noun(o.country)+'の'+noun(o);
            const qpredicate=()=>dialogueMode===3?word('なんようび','何曜日'):dialogueMode===0?'どこ':dialogueMode===1?noun(o.country)+'のどこ':word('なんじ','何時');
            const rpredicate=()=>dialogueMode===3?word(days[index].hira,days[index].kanji):dialogueMode===0?noun(o.country):dialogueMode===1?cityPhrase():time(o);
            const whereCue=()=>formatWord(o.country.hira+'のどこ',o.country.kanji+'のどこ',o.country.romaji+' no doko','where in '+o.country.meaning);
            const qcue=dialogueMode===3?formatWord('なんようび','何曜日',"nan'yōbi",'what day of the week'):dialogueMode===0?'どこ':dialogueMode===1?whereCue():word('なんじ','何時');
            const rcue=dialogueMode===3?vocabulary(days[index]):dialogueMode===0?vocabulary(o.country):dialogueMode===1?vocabulary(o):formatWord(o.timeHira,o.timeKanji,...timeHints[index]);
            const q=recordingRow(c,'q',`<strong>${ask} · Question:</strong> ${qsubject}／${qcue}`,prefix+'_q',()=>question(qsubject,qpredicate()));
            const responseSubject=dialogueMode===1?(index===2?'あそこ':'ここ'):rsubject;
            const r=recordingRow(c,'a',`<strong>${reply} · Response:</strong> ${responseSubject}／${rcue}`,prefix+'_r',()=>{const text=statement(responseSubject,dialogueMode===1?noun(o):rpredicate());return dialogueMode===3&&i===2?text.replace(responseSubject+'は、',responseSubject+'も、'):text;});
            practice2State.replyReferences[prefix+'_r']=()=>{
                const alternatives=[short(rpredicate())];
                if(dialogueMode===0)alternatives.push(statement(index===2?'あそこ':word('わたし','私'),rpredicate()));
                if(dialogueMode===1)alternatives.push(short(noun(o)),short(cityPhrase()),statement(rsubject,cityPhrase()),statement(rsubject,noun(o)),statement(index===2?'あそこ':word('わたし','私'),cityPhrase()),statement(index===2?'あそこ':word('わたし','私'),noun(o)));
                if(dialogueMode===3)alternatives.push(statement(rsubject,rpredicate()));
                if(dialogueMode===2)for(const variant of [['朝六時','午前六時','六時'],['夜十時','午後十時','二十二時','十時'],['午後一時','十三時','一時']][index])alternatives.push(short(variant),statement(rsubject,variant),statement(noun(o),variant),statement(noun(o.country),variant));
                return alternatives;
            };
            attachCity(q,ask,o,selectDialogue);attachCity(r,reply,o,selectDialogue);identifySpeaker(q,prefix+'_q');identifySpeaker(r,prefix+'_r');
            englishCue(q,[englishPlace(qsubject),dialogueMode===0?'where':dialogueMode===1?'where in '+o.country.meaning:dialogueMode===2?'what time':'what day of the week']);
            englishCue(r,[englishPlace(responseSubject),dialogueMode===0?o.country.meaning:dialogueMode===1?o.meaning:dialogueMode===2?timeHints[index][1]:days[index].meaning]);
        });
        const d4=document.getElementById('drill4Container'),cuePanel=node('section','info-panel info-panel-task1 drill-cue-panel'),copy=node('div','drill-cue-copy');
        copy.append(node('span','info-panel-title drill-cue-title','Drill 4: Practice with English cues'),node('span','info-panel-desc drill-cue-description','💡Use English cues for Drills 1–3.'));
        const toggle=node('button','drill-cue-button',practice2State.englishCues?'Display Japanese Cues':'Display English Cues');toggle.type='button';
        toggle.classList.toggle('is-english',Boolean(practice2State.englishCues));toggle.setAttribute('aria-pressed',String(Boolean(practice2State.englishCues)));
        toggle.onclick=()=>{
            if(busy())return;
            practice2State.englishCues=!practice2State.englishCues;renderAll();
            requestAnimationFrame(()=>{const example=document.querySelector('#drill1Container .info-panel:not(.drill-cue-panel)');if(!example)return;const style=getComputedStyle(example),line=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.5;window.scrollTo({top:Math.max(0,window.scrollY+example.getBoundingClientRect().top-line),behavior:'smooth'});});
        };
        cuePanel.append(copy,toggle);d4.append(cuePanel);
    }

    function renderSections() {
        shopAudioCleanups.splice(0).forEach(cleanup=>cleanup());
        for(const id of ['drill1Container','drill2Container','drill3Container','drill4Container','drill5Container']){const c=document.getElementById(id);if(c){c.replaceChildren();c.hidden=false;}}
        if(!is22){renderCitySections();return;}
        const d1=document.getElementById('drill1Container');
        const exObjects=is22?[['A','せんえん','千円',1000],['B','さんぜんえん','三千円',3000],['far','よんせんえん','四千円',4000]].map(([zone,priceHira,priceKanji,priceNumber])=>({kind:'hat',hira:'ぼうし',kanji:'帽子',romaji:'bōshi',meaning:'hat',zone,priceHira,priceKanji,priceNumber})):places();
        const box=node('section','example-box p2x-example');
        box.append(node('h2','p21-distance-heading',is22?'この・その・あの + noun':'ここ・そこ・あそこ: three places, three floors'));
        const selectExample=scene(box,exObjects,{example:true});
        const list=node('div','p21-model-list');
        if(is22) {
            list.classList.add('p2x-speaker-models');
            for(const speaker of ['A','B']) {
                const group=node('section','p21-model-group');group.classList.add('p2x-speaker-group');group.append(node('h3','',speaker));
                const sentences=node('div','p2x-speaker-sentences');
                for(const o of exObjects) {
                    const row=node('p','p21-model-line');row.dataset.modelSpeaker=speaker;row.dataset.zone=o.zone;
                    row.append(modelText(()=>describe(speaker,o),o));sentences.append(row);
                }group.append(sentences);list.append(group);
            }
        } else {
            for(const o of exObjects) {
                const group=node('section','p21-model-group'),heading=node('h3');heading.innerHTML=vocabulary(o);group.append(heading);
                for(const speaker of ['A','B']) {
                    const row=node('p','p21-model-line');row.dataset.modelSpeaker=speaker;row.dataset.zone=o.zone;
                    row.append(node('strong','',`${speaker}：`),modelText(()=>describe(speaker,o),o));group.append(row);
                }list.append(group);
            }
        }
        box.append(list);d1.append(box);selectExample('A');
        if(is22)renderPriceStatements(d1);
        else {
        panel(d1,is22?'Drill 1: この・その・あの + noun':'Drill 1: Describe each place',is22?'💡A, then B: Name each object and say its price.':(practice2State.describeSet===1?'💡A, then B: Say where each object is.':'💡A, then B: Name the three places.'));
        const set1=setButtons(d1,['Set 1','Set 2'],'describeSet');
        const objects=is22?itemsFor(set1===0?['phone','wallet','dictionary']:['notebook','dictionary','wallet']):places();
        if(!is22&&set1===1)objects.splice(0,objects.length,...itemsFor(['phone','dictionary','wallet']));
        const select1=scene(d1,objects);
        for(const speaker of ['A','B']) {
            const order=[...objects].sort((a,b)=>['こ','そ','あ'].indexOf(sound(speaker,a.zone))-['こ','そ','あ'].indexOf(sound(speaker,b.zone)));
            order.forEach((o,i)=>{
                const current=card(d1,`${speaker}${i+1}`),cue=`<strong>${speaker}:</strong> ${demonstrative(speaker,o)}${is22?'／'+vocabulary(o)+'／'+price(o):'／'+vocabulary(o)}`;
                const row=recordingRow(current,'q',cue,`${pageKey}_d1_s${set1}_${speaker}_${i}`,()=>!is22&&set1===1?statement(noun(o),demonstrative(speaker,o)):describe(speaker,o));attach(row,speaker,o,select1);
            });
        }
        }
        if(is22){renderPriceDialogue(document.getElementById('drill2Container'));renderFoodChoosing(document.getElementById('drill3Container'));renderPeopleChoosing(document.getElementById('drill4Container'));renderUmbrellaComparison(document.getElementById('drill5Container'));}
        else {renderDialogue();renderChoosing();}
    }
    function renderPriceStatements(container) {
        panel(container,'Drill 1: この・その・あの＋Noun','💡Name the item and say its price.');
        const set=setButtons(container,[word('かばん','カバン'),word('とけい','時計')],'describeSet'),objects=merchandise(set===0?'bag':'clock'),select=scene(container,objects,{speakerGuide:false});
        [['B',objects[0]],['A',objects[0]],['B',objects[2]]].forEach(([speaker,o],i)=>{
            const current=card(container,String(i+1));
            const row=recordingRow(current,'q',`<strong>${speaker}:</strong> ${demonstrative(speaker,o)}／${vocabulary(o)}／Price`,`p22_statements_s${set}_${speaker}_${i}`,()=>describe(speaker,o));attach(row,speaker,o,select);
        });
        select('B');
    }

    function priceConversationExample(container) {
        const objects=merchandise('clock');objects[1]={...objects[1],priceNumber:4000,priceHira:'よんせんえん',priceKanji:'四千円'};
        const sample=objects[0],box=node('section','example-box p2x-dialogue-example p2x-price-example');
        const select=scene(box,objects,{model:true}),q=node('p'),r=node('p');
        q.append(node('strong','','A · Question: '),listen(()=>{select('A','A');return question(adnominal('A',sample),'いくら');},'🔊きく',()=>select.announce('A')),modelText(()=>question(adnominal('A',sample),'いくら'),sample));
        r.append(node('strong','','B · Response: '),listen(()=>{select('B','A');return statement(adnominal('B',sample),price(sample));},'🔊きく',()=>select.announce('B')),modelText(()=>statement(adnominal('B',sample),price(sample)),sample));box.append(q,r);container.append(box);
    }
    function renderPriceDialogue(container) {
        priceConversationExample(container);
        panel(container,'Drill 2: いくらですか','💡A: Ask the price and answer.');
        const set=setButtons(container,[word('かばん','カバン'),word('とけい','時計')],'priceDialogueSet'),objects=merchandise(set===0?'bag':'clock'),select=scene(container,objects);
        objects.forEach((o,i)=>{
            const current=card(container,String(i+1)),prefix=`p22_price_s${set}_A_${i}`;
            const q=recordingRow(current,'q',`<strong>A · Question:</strong> ${demonstrative('A',o)}／${vocabulary(o)}／${formatWord('いくら','いくら','ikura','how much')}`,prefix+'_q',()=>question(adnominal('A',o),'いくら'));
            const r=recordingRow(current,'a','<strong>B · Response:</strong> …',prefix+'_r',()=>statement(adnominal('B',o),price(o)));
            attach(q,'A',o,select);attach(r,'B',o,select);
        });
    }
    function renderFoodChoosing(container) {
        const exampleObjects=merchandise('fruit'),sample=exampleObjects[0],box=node('section','example-box p2x-dialogue-example p2x-food-example');
        const selectExample=scene(box,exampleObjects,{which:true,model:true});
        const qText=o=>'どの'+noun(o)+'が、'+price(o)+(speechStyle==='formal'?'ですか？':'？');
        const q=node('p'),r=node('p');
        q.append(node('strong','','A · Question: '),listen(()=>{selectExample('A',sample.zone);return qText(sample);},'🔊きく',()=>selectExample.announce('A')),modelText(()=>qText(sample),sample));
        r.append(node('strong','','B · Response: '),listen(()=>{selectExample('B',sample.zone);return short(adnominal('B',sample));},'🔊きく',()=>selectExample.announce('B')),modelText(()=>short(adnominal('B',sample)),sample));box.append(q,r);container.append(box);
        panel(container,'Drill 3: どの＋Noun','💡Ask with どの＋noun.');
        const set=setButtons(container,['おにぎり',word('おべんとう','お弁当')],'choosingSet'),objects=merchandise(set===0?'onigiri':'bento'),select=scene(container,objects,{which:false,speakerGuide:false});
        objects.forEach((o,i)=>{
            const current=card(container,String(i+1)),prefix=`p22_food_s${set}_A_${i}`;
            const q=recordingRow(current,'q',`<strong>A · Question:</strong> どの／${vocabulary(o)}／${priceCue(o)}`,prefix+'_q',()=>qText(o));
            practice2State.replyReferences[prefix+'_r']=()=>[adnominal('B',o)+'が、'+price(o)+ending(),statement(adnominal('B',o),price(o))];
            const r=recordingRow(current,'a','<strong>B · Response:</strong> …',prefix+'_r',()=>short(adnominal('B',o)));
            attach(q,'A',o,select);attach(r,'B',o,select);
        });
    }
    function renderPeopleChoosing(container) {
        const relationshipSet=practice2State.peopleConversationSet===1;
        const objects=PracticeNext.people.map((o,i)=>({...o,zone:['A','B','far'][i]}));
        panel(container,'Drill 4: どの人ですか？だれですか？','');
        const instruction=container.lastElementChild.querySelector('.info-panel-desc');
        if(relationshipSet)instruction.textContent='💡Ask about each person.';
        else instruction.append(document.createTextNode('💡Use '),node('strong','grammar-highlight','だれ'),document.createTextNode(' to ask who someone is.'));
        setButtons(container,['Set 1','Set 2'],'peopleConversationSet');
        const select=scene(container,objects,{people:true,speakerGuide:false});
        const turns=[{asker:'A',answerer:'B',object:objects[1],full:true},{asker:'B',answerer:'A',object:objects[0],full:true},{asker:'A',answerer:'B',object:objects[2],full:true}];
        turns.forEach(({asker,answerer,object:o,full},i)=>{
            const c=card(container,String(i+1)),prefix=relationshipSet?'p22_people_relations':'p22_people_mixed';
            const subject=speaker=>demonstrative(speaker,o)+word('ひと','人');
            const personCue=speaker=>{const d=demonstrative(speaker,o);return formatWord(d+'ひと',d+'人',({この:'kono',その:'sono',あの:'ano'}[d])+' hito',({この:'this person',その:'that person',あの:'that person over there'}[d]));};
            if(relationshipSet){
                if(i===2){
                    const key='p22_people_classmate';
                    const mine=()=>word('わたし','私')+'のクラスメート';
                    const which=()=>word('どのひと','どの人');
                    const q=recordingRow(c,'q',`<strong>${asker} · Question:</strong> ${formatWord('どのひと','どの人','dono hito','which person')}／${formatWord('Bさんのクラスメート','Bさんのクラスメート','B-san no kurasumēto','B’s classmate')}`,key+'_q_2',()=>`${which()}が、Bさんのクラスメート${speechStyle==='formal'?'ですか？':'？'}`);
                    practice2State.replyReferences[key+'_r_2']=()=>[short(subject(answerer)),statement(mine(),subject(answerer))];
                    const r=recordingRow(c,'a',`<strong>${answerer} · Response:</strong> ${personCue(answerer)}`,key+'_r_2',()=>short(subject(answerer)));
                    attach(q,asker,o,select);attach(r,answerer,o,select);return;
                }
                const relation=[{hira:'おとうと',kanji:'弟',romaji:'otōto',meaning:'younger brother'},{hira:'ともだち',kanji:'友達',romaji:'tomodachi',meaning:'friend'}][i];
                const predicate=()=>word('わたし','私')+'の'+noun(relation);
                const correct=()=>statement(subject(answerer),predicate());
                const no=()=>speechStyle==='casual'?'ううん、':'いいえ、';
                const classmate=()=>answerer+'さんのクラスメート';
                const q=recordingRow(c,'q',`<strong>${asker} · Question:</strong> ${personCue(asker)}／${formatWord(answerer+'さんのクラスメート',answerer+'さんのクラスメート',answerer+'-san no kurasumēto',answerer+"’s classmate")}`,`${prefix}_q_${i}`,()=>question(subject(asker),classmate()));
                const key=`${prefix}_r_${i}`;
                practice2State.replyReferences[key]=()=>[no()+correct(),no()+short(predicate()),no()+short(noun(relation)),response(word('わたし','私')+'のクラスメート',false)+correct(),response(word('わたし','私')+'のクラスメート',false)+short(predicate()),response(word('わたし','私')+'のクラスメート',false)+short(noun(relation))];
                const r=recordingRow(c,'a',`<strong>${answerer} · Response:</strong> ${personCue(answerer)}／${formatWord('わたしの'+relation.hira,'私の'+relation.kanji,'watashi no '+relation.romaji,'my '+relation.meaning)}`,key,()=>no()+correct());
                r.actions.append(node('span','p21-response-lead',speechStyle==='casual'?'ううん…':'いいえ…'));
                attach(q,asker,o,select);attach(r,answerer,o,select);return;
            }
            const q=recordingRow(c,'q',`<strong>${asker} · Question:</strong> ${personCue(asker)}／${formatWord('だれ','誰','dare','who')}`,`${prefix}_q_${i}`,()=>question(subject(asker),word('だれ','誰')));
            const key=`${prefix}_r_${i}`;
            practice2State.replyReferences[key]=()=>[short(noun(o)+'さん'),short(noun(o)),statement(subject(answerer),noun(o)+'さん'),statement(subject(answerer),noun(o))];
            const cue=(full?personCue(answerer)+'／':'')+vocabulary(o);
            const r=recordingRow(c,'a',`<strong>${answerer} · Response:</strong> ${cue}`,key,()=>full?statement(subject(answerer),noun(o)+'さん'):short(noun(o)+'さん'));
            attach(q,asker,o,select);attach(r,answerer,o,select);
        });select('A');
    }

    function renderUmbrellaComparison(container) {
        panel(container,'Drill 5: どのかさ・どれ','💡Compare the same umbrella: どのかさ → そのかさ; どれ → それ.');
        const picture=node('div','p2x-picture p2x-umbrella-picture'),stage=node('div','p2x-stage');
        const photo=node('img','p2x-photo');photo.src='assets/practice22-umbrellas.png';photo.width=1774;photo.height=887;
        photo.alt='A stands at the left and B at the right of a long umbrella rack. A’s red umbrella and B’s blue umbrella are both near B. The teacher’s yellow umbrella is far from both.';stage.append(photo);
        for(const who of ['A','B']){const label=node('strong','p2x-person',who);label.dataset.person=who;stage.append(label);}
        const umbrellas=[{owner:'A',zone:'B',x:74.6,label:'Aさんの'},{owner:'B',zone:'B',x:80.7,label:'Bさんの'},{owner:'teacher',zone:'far',x:46.6,label:word('せんせいの','先生の')}];
        for(const o of umbrellas){const target=node('span','p2x-umbrella-target');target.dataset.owner=o.owner;target.style.left=o.x+'%';target.append(node('span','p2x-umbrella-owner',o.label));imageHint(target,{hintText:o.label+word('かさ','傘')});target.setAttribute('aria-label',o.label+word('かさ','傘'));stage.append(target);}
        picture.append(stage);container.append(picture);
        const select=(who,owner)=>{picture.dataset.speaker=who;stage.querySelectorAll('.p2x-umbrella-target').forEach(e=>e.classList.toggle('is-target',e.dataset.owner===owner));};
        const turns=[{asker:'B',answerer:'A',o:umbrellas[0],adj:'その',pro:'それ'},{asker:'A',answerer:'B',o:umbrellas[1],adj:'この',pro:'これ'},{asker:'B',answerer:'A',o:umbrellas[2],adj:'あの',pro:'あれ'}];
        const umbrella=()=>word('かさ','傘');
        turns.forEach(({asker,answerer,o,adj,pro},i)=>{
            const current=card(container,String(i+1));
            for(const mode of ['adjective','pronoun']){
                const title=mode==='adjective'?'Adjectives':'Pronouns',prefix=`p22_d5_${mode}_${i}`;
                const owner=()=>o.owner==='teacher'?word('せんせいの','先生の'):o.owner+'さんの';
                const subject=()=>owner()+umbrella();
                const wh=()=>mode==='adjective'?word('どのかさ','どの傘'):'どれ';
                const answer=()=>mode==='adjective'?adj+umbrella():pro;
                const ownerCue=formatWord((o.owner==='teacher'?'せんせいの':o.owner+'さんの')+'かさ',(o.owner==='teacher'?'先生の':o.owner+'さんの')+'傘',(o.owner==='teacher'?'sensei no':o.owner+'-san no')+' kasa',(o.owner==='teacher'?'the teacher':o.owner)+'’s umbrella');
                const whCue=mode==='adjective'?formatWord('どのかさ','どの傘','dono kasa','which umbrella'):formatWord('どれ','どれ','dore','which one');
                const q=recordingRow(current,mode==='adjective'?'q':'a',`<strong><span class="p2x-comparison-mode">${title}</span>${asker} · Question:</strong> ${ownerCue}／${whCue}`,prefix+'_q',()=>question(subject(),wh()));
                const replyCue=mode==='adjective'?formatWord(adj+'かさ',adj+'傘',({この:'kono',その:'sono',あの:'ano'}[adj])+' kasa',adj==='この'?'this umbrella':adj==='その'?'that umbrella':'that umbrella over there'):formatWord(pro,pro,{これ:'kore',それ:'sore',あれ:'are'}[pro],pro==='これ'?'this one':pro==='それ'?'that one':'that one over there');
                practice2State.replyReferences[prefix+'_r']=()=>[short(answer()),statement(subject(),answer())];
                const r=recordingRow(current,'a',`<strong><span class="p2x-comparison-mode">${title}</span>${answerer} · Response:</strong> ${replyCue}`,prefix+'_r',()=>short(answer()));
                for(const [view,who]of [[q,asker],[r,answerer]]){view.row.dataset.drillSpeaker=who;view.row.dataset.exerciseMode=mode;for(const control of [view.listenBtn,view.recordBtn])control.addEventListener('click',()=>select(who,o.owner));}
            }
        });
    }

    function renderDialogue() {
        const d2=document.getElementById(is22?'peopleContainer':'drill2Container');
        panel(d2,is22?'この人はだれですか — Under review':'Drill 2: Where is it?',is22?'💡A: Ask who each person is. B: Answer with the name.':'💡A: Ask where each object is. B: Answer with ここ／そこ／あそこ.');
        if(is22)d2.append(node('p','p2x-context-note','どれ = which one? · だれ = who?'));
        const set=setButtons(d2,['Set 1','Set 2'],'dialogueSet');
        const objects=is22?PracticeNext.people.map((o,i)=>({...o,zone:['A','B','far'][i]})):itemsFor(set===0?['phone','wallet','dictionary']:['notebook','dictionary','wallet']);
        // The photographed people stay in the same positions; Set 2 reverses the speakers.
        const select=scene(d2,objects,{people:is22});
        const asker=is22&&set===1?'B':'A',answerer=asker==='A'?'B':'A';
        if(is22) {
            const sample=objects[0],exampleBox=node('section','example-box p2x-dialogue-example');
            const q=node('p');q.append(node('strong','',`${asker} · Question: `),listen(()=>{select(asker,sample.zone);return question(demonstrative(asker,sample)+word('ひと','人'),word('だれ','誰'));}),modelText(()=>question(demonstrative(asker,sample)+word('ひと','人'),word('だれ','誰'))));
            const r=node('p');r.append(node('strong','',`${answerer} · Response: `),listen(()=>{select(answerer,sample.zone);return short(noun(sample)+'さん');}),modelText(()=>short(noun(sample)+'さん')));exampleBox.append(q,r);d2.append(exampleBox);
        }
        objects.forEach((o,i)=>{
            const current=card(d2,String(i+1));
            const subject=()=>is22?demonstrative(asker,o)+word('ひと','人'):noun(o);
            const cue=`<strong>${asker} · Question:</strong> ${is22?demonstrative(asker,o)+'／'+formatWord('ひと','人','hito','person')+'／'+formatWord('だれ','誰','dare','who'):vocabulary(o)+'／どこ'}`;
            const q=recordingRow(current,'q',cue,`${pageKey}_d2_s${set}_q_${i}`,()=>question(subject(),is22?word('だれ','誰'):'どこ'));
            const reply=()=>is22?short(noun(o)+'さん'):short(demonstrative(answerer,o));
            const key=`${pageKey}_d2_s${set}_r_${i}`;
            practice2State.replyReferences[key]=()=>is22?[short(noun(o)),statement(demonstrative(answerer,o)+word('ひと','人'),noun(o)+'さん'),statement(demonstrative(answerer,o)+word('ひと','人'),noun(o))]:[statement(noun(o),demonstrative(answerer,o))];
            const r=recordingRow(current,'a',`<strong>${answerer} · Response:</strong> …`,key,reply);
            attach(q,asker,o,select);attach(r,answerer,o,select);
        });
        select(asker);
    }
    function renderChoosing() {
        const d3=document.getElementById('drill3Container');
        if(is22){renderFoodChoosing(d3);return;}
        panel(d3,is22?'Drill 3: どの＋Noun':'Drill 3: Where is yours?',is22?'💡Take turns asking. Use この／その／あの + noun for the color shown.':'💡Take turns asking. Use ここ／そこ／あそこ for the color shown.');
        const set=setButtons(d3,['スマホ',word('じしょ','辞書'),word('さいふ','財布')],'choosingSet');
        const source=PracticeNext.items.find(o=>o.kind===['phone','dictionary','wallet'][set]);
        const objects=['red','blue','green'].map((colorName,i)=>({...source,colorName,zone:['A','B','far'][i]}));
        const select=scene(d3,objects,{which:true});
        const targets=[[0,1],[1,2],[2,0]][set];
        targets.forEach((target,i)=>{
            const o=objects[target],asker=i===0?'A':'B',answerer=asker==='A'?'B':'A',current=card(d3,String(i+1));
            const qText=()=>is22?question('あなたの','どの'+noun(o)):question('あなたの'+noun(o),'どこ');
            const cue=`<strong>${asker} · Question:</strong> ${formatWord('あなた','あなた','anata','you')}／${vocabulary(o)}／${is22?'どの':'どこ'}`;
            const qKey=`${pageKey}_d3_s${set}_q_${i}`;
            if(is22)practice2State.replyReferences[qKey]=()=>[question('あなたの'+noun(o),'どの'+noun(o))];
            const q=recordingRow(current,'q',cue,qKey,qText);
            const key=`${pageKey}_d3_s${set}_r_${i}`,answer=()=>short(is22?adnominal(answerer,o):demonstrative(answerer,o));
            practice2State.replyReferences[key]=()=>is22?[statement(word('わたしの','私の')+noun(o),adnominal(answerer,o)),statement(word('わたしの','私の'),adnominal(answerer,o)),statement(adnominal(answerer,o),word('わたしの','私の')),adnominal(answerer,o)+'が'+word('わたしの','私の')+ending()]:[statement(word('わたしの','私の')+noun(o),demonstrative(answerer,o)),statement(noun(o),demonstrative(answerer,o))];
            const response=node('span');response.innerHTML=`<strong>${answerer} · Response:</strong> `;const color=node('span','p21-color-cue',o.colorName);color.dataset.color=o.colorName;response.append(color);
            const r=recordingRow(current,'a',response,key,answer);attach(q,asker,o,select);attach(r,answerer,o,select);
        });
    }

    function installSettings() {
        const anchor = document
            .getElementById("scriptModeControl")
            ?.closest(".control-item");

        if (
            anchor
            && !document.getElementById("speechStyleControl")
        ) {
            const item = node("div", "control-item");
            const control = node(
                "div",
                "segmented-control"
            );

            control.id = "speechStyleControl";
            control.setAttribute("role", "group");
            control.setAttribute(
                "aria-label",
                "Speech Style"
            );

            for (const [value, label, tip] of [
                [
                    "formal",
                    "👔Formal",
                    "Polite speech for work or unfamiliar people."
                ],
                [
                    "informal",
                    "✏️Informal",
                    "Plain forms used in writing"
                ],
                [
                    "casual",
                    "💬Casual",
                    "Relaxed speech with family and friends."
                ]
            ]) {
                const option = node(
                    "button",
                    "segmented-option custom-tip-wrap",
                    label
                );

                option.type = "button";
                option.dataset.value = value;

                option.append(
                    node("span", "custom-tip-box", tip)
                );

                option.onclick = () => {
                    if (busy() || speechStyle === value) {
                        return;
                    }

                    speechStyle = value;
                    renderAll();
                };

                control.append(option);
            }

            item.append(control);
            anchor.after(item);
        }

        document.querySelectorAll(
            "#speechStyleControl button"
        ).forEach(option => {
            const selected =
                option.dataset.value === speechStyle;

            option.classList.toggle(
                "is-selected",
                selected
            );

            option.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });

        for (const [value, label] of [
            ["hover", "🔎Hover"],
            ["paren", "🔡Display"]
        ]) {
            const option = document.querySelector(
                `#hintModeControl [data-value="${value}"]`
            );

            if (!option) continue;

            const tip = option.querySelector(
                ".custom-tip-box"
            );

            option.replaceChildren(
                document.createTextNode(label)
            );

            if (tip) option.append(tip);
        }

        const tip = document.querySelector(
            "#labelAutoRecord > .custom-tip-box"
        );

        if (tip) {
            tip.textContent =
                "ON: Stop after 2 seconds of silence following speech. OFF: Use the stop button. All recordings stop after 20 seconds.";
        }
    }

    function alignColumns() {
        for (const id of [
            "drill1Container",
            "drill2Container", "drill3Container", "drill4Container", "drill5Container"
        ]) {
            const tables = [
                ...document.querySelectorAll(
                    `#${id} .recording-table`
                )
            ];

            let width = 0;

            for (const table of tables) {
                for (
                    const cell
                    of table.querySelectorAll(
                        ".drill-cue-cell"
                    )
                ) {
                    const measure = node("span");

                    cell.childNodes.forEach(child =>
                        measure.append(
                            child.cloneNode(true)
                        )
                    );

                    measure.querySelectorAll(
                        ".tooltip-tip, .custom-tip-box"
                    ).forEach(tip => tip.remove());

                    // 内容幅の測定専用。固定の外観は共通CSSを使用。
                    Object.assign(measure.style, {
                        position: "absolute",
                        visibility: "hidden",
                        display: "inline-block",
                        width: "max-content",
                        whiteSpace: "nowrap",
                        font: "inherit"
                    });

                    cell.append(measure);

                    width = Math.max(
                        width,
                        Math.ceil(
                            measure
                                .getBoundingClientRect()
                                .width
                        )
                    );

                    measure.remove();
                }
            }

            tables.forEach(table => {
                table.style.setProperty("--practice12-cue-width", `${width + 8}px`);
                table.querySelector(
                    "colgroup"
                ).children[1].style.width =
                    `${width + 8}px`;
            });
        }
    }

    const originalSync = practice2SyncRecordingUI;

    practice2SyncRecordingUI = function() {
        originalSync();
        practice2SyncPhotoSpeaker();
        practice2SyncCitySpeaker();

        document.querySelectorAll(
            ".compact-settings .segmented-option, " +
            ".compact-settings input"
        ).forEach(control => {
            control.disabled = busy();
        });
    };

    document.addEventListener("click", event => {
        if (
            busy()
            && event.target.closest(
                ".compact-settings .segmented-option"
            )
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    renderAll = function() {
        if (busy()) return;

        stopAllPlayback();

        document.querySelectorAll(".p21-image-tip-host").forEach(e=>e.remove());
        practice2State.views = {};
        practice2State.replyReferences = {};

        installSettings();
        renderSections();
        alignColumns();
        practice2SyncRecordingUI();

    };
})();

// ============================================================================
// Practice 2.2 / 2.3: Result conversion, matching and recording
// ============================================================================

function practice2ToHiragana(text) {
    let value = String(text ?? "").normalize("NFKC");

    // このページの語彙を判定用の読みへ変換する。
    value = convertToHiragana(value.replace(/[Tt]シャツ/g, "ティーシャツ"));

    // このページの問題データに登録された語句を追加変換する。
    const pairs = PracticeNext.items.map(o => [o.kanji,o.hira]);

    for (const [from, to] of pairs) {
        if (from) value = value.split(from).join(to);
    }

    return value.replace(/[ァ-ヶ]/g, character =>
        String.fromCharCode(character.charCodeAt(0) - 96)
    );
}

function practice2Normalize(text) {
    return practice2ToHiragana(text)
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, "")
        .replace(/(?:よね|よ|ね)$/, "").replace(/^ううんん?/, "ううん");
}

// 読み上げ専用。表示・判定用の文は変更しない。
function practice2SpeechText(text) {
    let value = String(text ?? "").trim().replace(/^ううん、/, "ううんん、");
    const pairs=[...PracticeNext.items.filter(o=>o.hira!==o.kanji).map(o=>[o.hira,o.kanji]),...PracticeNext.readings.filter(([kanji])=>/^[\p{Script=Han}]+$/u.test(kanji)&&kanji!=='武').map(([kanji,hira])=>[hira,kanji])].sort((a,b)=>b[0].length-a[0].length);
    for(const [from,to]of pairs)value=value.split(from).join(to);
    value=value.replace(/(?:なん|なに)(?=ですか|[？?。]|$)/g,'何');
    let prefix = "";

    // 「はい」の「は」を助詞として処理しない。
    const response = value.match(/^(はい|いいえ)[、,\s]*/);

    if (response) {
        prefix = response[1] + "、";
        value = value.slice(response[0].length);
    }

    // このページの文型「XはYです」の区切り。
    value = value.replace(/は[、,\s]*/, "は、");

    // 否定文の読み上げ用の区切り。
    value = value.replace(
        /じゃ[、,\s]*ないです/g,
        "じゃ、ないです"
    );

    return prefix + value;
}// 比較用の読みを作る。
// 文末専用の「わ→は」が単語の途中に適用されることを防ぐ。
function practice2DiffReading(text) {
    return practice2ToHiragana(String(text ?? "") + "\uE000")
        .replace(/\uE000$/, "")
        .toLowerCase()
        .replace(/[\s、。,.!?！？「」『』・]/g, "");
}

function practice2DiffTokens(text) {
    const chars = Array.from(
        String(text ?? "").normalize("NFKC")
    );

    const tokens = chars
        .map((char, index) => ({char, index}))
        .filter(token =>
            practice2DiffReading(token.char) !== ""
        );

    // 元の正規化処理にある文末の「わ→は」を維持する。
    if (
        tokens.length
        && tokens[tokens.length - 1].char === "わ"
    ) {
        tokens[tokens.length - 1] = {
            ...tokens[tokens.length - 1],
            char: "は"
        };
    }

    // 終助詞は表示に残し、比較対象からだけ外す。
    const joined = tokens
        .map(token => token.char)
        .join("");

    const suffix = joined.match(/(?:よね|よ|ね)$/);

    if (suffix) {
        tokens.splice(
            tokens.length - suffix[0].length
        );
    }

    return {chars, tokens};
}

function practice2FindDiff(actual, reference) {
    const a = practice2DiffTokens(actual);
    const b = practice2DiffTokens(reference);

    const n = a.tokens.length;
    const m = b.tokens.length;

    function spans(tokens) {
        return tokens.map((_, start) => {
            const readings = new Map();
            let text = "";

            for (
                let end = start + 1;
                end <= tokens.length;
                end++
            ) {
                text += tokens[end - 1].char;

                const reading =
                    practice2DiffReading(text);

                if (!reading) continue;

                if (!readings.has(reading)) {
                    readings.set(reading, []);
                }

                readings.get(reading).push(end);
            }

            return readings;
        });
    }

    const aSpans = spans(a.tokens);
    const bSpans = spans(b.tokens);

    const costs = Array.from(
        {length: n + 1},
        () => Array(m + 1).fill(Infinity)
    );

    const steps = Array.from(
        {length: n + 1},
        () => Array(m + 1).fill(null)
    );

    costs[0][0] = 0;

    function update(i, j, nextI, nextJ, extra, red) {
        const cost = costs[i][j] + extra;

        if (cost < costs[nextI][nextJ]) {
            costs[nextI][nextJ] = cost;
            steps[nextI][nextJ] = {i, j, red};
        }
    }

    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            if (!Number.isFinite(costs[i][j])) {
                continue;
            }

            if (i < n && j < m) {
                const same =
                    a.tokens[i].char === b.tokens[j].char;

                update(
                    i,
                    j,
                    i + 1,
                    j + 1,
                    same ? 0 : 1,
                    !same
                );

                // 漢字と読みなど、登録済み表記差は一致扱い。
                for (
                    const [reading, endsA]
                    of aSpans[i]
                ) {
                    const endsB =
                        bSpans[j].get(reading);

                    if (!endsB) continue;

                    for (const endA of endsA) {
                        for (const endB of endsB) {
                            update(
                                i,
                                j,
                                endA,
                                endB,
                                0,
                                false
                            );
                        }
                    }
                }
            }

            // 抽出文に余分な文字がある場合は、その文字を着色。
            if (i < n) {
                update(i, j, i + 1, j, 1, true);
            }

            // 不足文字は存在しないため、代わりの文字を着色しない。
            if (j < m) {
                update(i, j, i, j + 1, 1, false);
            }
        }
    }

    const redIndexes = new Set();
    const gaps = new Set();

    let i = n;
    let j = m;

    while (i || j) {
        const step = steps[i][j];

        if (!step) break;

        if (step.red) {
            for (let k = step.i; k < i; k++) {
                redIndexes.add(a.tokens[k].index);
            }
        }

        // 正解側だけに文字がある場合、その位置に不足印を置く。
        // 連続した不足は同じ位置の「＿」一つにまとめる。
        if (step.i === i && step.j < j) {
            const position = i < a.tokens.length
                ? a.tokens[i].index
                : a.tokens.length
                    ? a.tokens[a.tokens.length - 1].index + 1
                    : 0;

            gaps.add(position);
        }

        i = step.i;
        j = step.j;
    }


    return {
        cost: costs[n][m],
        chars: a.chars,
        redIndexes,
        gaps
    };
}

function practice2ShowResult(view, saved, rowKey, playRate) {
    const displayed = scriptMode === "hiragana"
        ? practice2ToHiragana(saved.rawTranscript)
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
                    typeof text === "string"
                    && text.length > 0
                )
                .flatMap(text => [
                    text,
                    practice2ToHiragana(text)
                ])
        )];

        let best = null;

        for (const reference of references) {
            const diff = practice2FindDiff(
                displayed,
                reference
            );

            if (!best || diff.cost < best.cost) {
                best = diff;
            }
        }

        if (!best) {
            view.resultSpan.appendChild(
                document.createTextNode(displayed)
            );

        } else {
            const appendRed = text => {
                const span = document.createElement("span");

                span.textContent = text;
                span.style.color = "var(--error-text)";

                view.resultSpan.appendChild(span);
            };

            // 末尾の不足も含めて表示する。
            for (
                let index = 0;
                index <= best.chars.length;
                index++
            ) {
                if (best.gaps.has(index)) {
                    appendRed("＿");
                }

                if (index === best.chars.length) {
                    break;
                }

                const char = best.chars[index];

                if (best.redIndexes.has(index)) {
                    appendRed(char);
                } else {
                    view.resultSpan.appendChild(
                        document.createTextNode(char)
                    );
                }
            }
        }

        view.resultSpan.appendChild(
            document.createTextNode(" ")
        );
    }

    if (practice2State.audioUrls[rowKey]) {
        appendPersistedPlayButton(
            view.resultSpan,
            rowKey,
            playRate
        );
    }

    view.correctionBox.style.display =
        saved.isCorrect ? "none" : "block";

    if (!saved.isCorrect) {
        view.corrTextSpan.textContent =
            "🔥 Keep going! Try once more!";

        view.corrListenBtn.style.display =
            "inline-block";

        view.corrListenBtn.onclick = () => {
            if (
                activeRecognitionSession
                || practice2State.startingRow
            ) {
                return;
            }

            setPlayingStateMultiple(
                [view.corrListenBtn],
                "Playing..."
            );

            speakText(
                practice2SpeechText(saved.modelText),
                0.75,
                () => stopAllPlayback()
            );
        };
    }
}

function appendPersistedPlayButton(resultSpan, rowKey, playRate) {
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
            practice2State.startingRow) return;

        const url = practice2State.audioUrls[rowKey];
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
    if (!rowKey) {
        practice2State.generatedKeyIndex ??= 0;
        rowKey = `p21_generated_${practice2State.generatedKeyIndex++}`;
    }

    practice2State.views ??= {};

    const view = {
        recordBtn,
        stopBtn,
        resultSpan,
        correctionBox,
        corrListenBtn,
        corrTextSpan
    };

    practice2State.views[rowKey] = view;

    const currentView = () =>
        practice2State.views[rowKey] || view;

    const saved = practice2State.savedResults[rowKey];

    if (saved?.rawTranscript !== undefined) {
        practice2ShowResult(
            view, saved, rowKey, playRate
        );
    } else if (saved) {
        resultSpan.textContent =
            saved.text ?? saved.html ?? "";

        resultSpan.style.color =
            saved.color || "var(--text-primary)";
    } else {
        resultSpan.textContent = "(Not recorded yet)";
        resultSpan.style.color = "var(--text-secondary)";
    }

    if (practice2State.audioUrls[rowKey]) {
        appendPersistedPlayButton(
            resultSpan, rowKey, playRate
        );
    }

    if (activeRecognitionSession?.rowKey === rowKey) {
        resultSpan.textContent = "Recording...";
        resultSpan.style.color = "var(--accent-color)";
        correctionBox.style.display = "none";
    } else if (practice2State.startingRow === rowKey) {
        resultSpan.textContent = "Preparing microphone...";
    }

    recordBtn.addEventListener("click", async () => {
        if (
            recordBtn.disabled
            || activeRecognitionSession
            || practice2State.startingRow
        ) {
            return;
        }

        const Recognition =
            window.SpeechRecognition
            || window.webkitSpeechRecognition;

        if (!Recognition) {
            practice2ShowNotice(
                currentView().resultSpan,
                "Speech recognition is not supported."
            );
            return;
        }

        // 録音開始時点の選択と設定を固定する。
        const expectedText = getExpectedTextFn();
        const modelText = getExpectedKanjiFn();
        const manual = isManualStop;

        stopAllPlayback();

        practice2State.startingRow = rowKey;
        practice2SyncRecordingUI();

        let stream;

        try {
            stream = await DrillAudio.getUserMedia({
                audio: true
            });
        } catch (error) {
            if (error.name === "AbortError") return;
            practice2State.startingRow = null;
            practice2SyncRecordingUI();

            practice2ShowNotice(
                currentView().resultSpan,
                DrillAudio.microphoneError(error)
            );
            return;
        }

        practice2State.startingRow = null;

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
                session.finished
                || !session.recognitionDone
                || !session.recorderDone
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
            practice2SyncRecordingUI();

            // 無音・失敗時は前の録音を置き換えない。
            if (
                !session.discard
                && session.speechStarted
                && session.chunks.length
            ) {
                const blob = new Blob(session.chunks, {
                    type:
                        session.recorder.mimeType
                        || "audio/webm"
                });

                const oldUrl =
                    practice2State.audioUrls[rowKey];

                practice2State.audioUrls[rowKey] =
                    URL.createObjectURL(blob);

                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl);
                }
            }

            session.chunks = [];

            if (
                !session.discard
                && session.transcript.trim()
            ) {
                processResult(
                    session.transcript,
                    expectedText,
                    () => modelText,
                    v.resultSpan,
                    v.correctionBox,
                    v.corrListenBtn,
                    v.corrTextSpan,
                    () => practice2State.audioUrls[rowKey],
                    playRate,
                    rowKey
                );

                // 文の一致・不一致とは別の色で停止理由を表示する。
                practice2ShowNotice(
                    v.resultSpan,
                    session.message
                );

            } else {
                const previous =
                    practice2State.savedResults[rowKey];

                if (previous?.rawTranscript !== undefined) {
                    practice2ShowResult(
                        v,
                        previous,
                        rowKey,
                        playRate
                    );
                } else {
                    v.resultSpan.textContent = previous
                        ? previous.text ?? previous.html ?? ""
                        : "";

                    v.resultSpan.style.color =
                        "var(--text-secondary)";

                    v.correctionBox.style.display = "none";

                    if (practice2State.audioUrls[rowKey]) {
                        appendPersistedPlayButton(
                            v.resultSpan,
                            rowKey,
                            playRate
                        );
                    }
                }

                practice2ShowNotice(
                    v.resultSpan,
                    session.message || "No speech recognized."
                );
            }

            practice2SyncRecordingUI();
        }

        function stop(message = "", discard = false) {
            if (
                session.finished
                || session.stopRequested
            ) {
                return;
            }

            session.stopRequested = true;
            session.message = message;

            session.discard =
                discard || !session.speechStarted;

            clearMonitoring();
            practice2SyncRecordingUI();

            if (
                session.recognition
                && !session.recognitionDone
            ) {
                try {
                    session.recognition.stop();
                } catch (error) {
                    session.recognitionDone = true;
                }
            }

            if (
                !session.recorder
                || session.recorder.state === "inactive"
            ) {
                session.recorderDone = true;
            } else {
                try {
                    session.recorder.stop();
                } catch (error) {
                    session.recorderDone = true;
                    session.discard = true;
                }
            }

            // 終了通知が届かない場合もマイクを解放する。
            session.timers.push(
                setTimeout(() => {
                    session.recognitionDone = true;

                    if (!session.recorderDone) {
                        session.discard = true;
                        session.recorderDone = true;
                    }

                    finish();
                }, 2500)
            );

            finish();
        }

        session.stop = stop;

        try {
            const recognition = new Recognition();

            session.recognition = recognition;

            recognition.lang = "ja-JP";
            recognition.interimResults = true;
            recognition.continuous = manual;

            recognition.onspeechstart = () => {
                session.speechStarted = true;
            };

            recognition.onresult = event => {
                if (
                    session.finished
                    || session.discard
                ) {
                    return;
                }

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    const result = event.results[i];

                    if (result[0].transcript.trim()) {
                        session.speechStarted = true;
                    }

                    if (result.isFinal) {
                        session.transcript +=
                            result[0].transcript;
                    }
                }
            };

            recognition.onerror = event => {
                if (
                    session.finished
                    || session.stopRequested
                    || event.error === "no-speech"
                ) {
                    return;
                }

                session.recognitionDone = true;
                stop("Recognition error.", true);
            };

            recognition.onend = () => {
                if (session.finished) return;

                session.recognitionDone = true;

                if (session.stopRequested) {
                    finish();
                    return;
                }

                if (manual || !session.speechStarted) {
                    try {
                        recognition.start();
                        session.recognitionDone = false;
                        return;
                    } catch (error) {
                        // Manualでは録音を継続する。
                        if (manual) return;

                        stop(
                            "Could not restart recognition.",
                            true
                        );
                        return;
                    }
                }

                stop();
            };

            const recorder = new MediaRecorder(stream);

            session.recorder = recorder;

            recorder.ondataavailable = event => {
                if (
                    !session.finished
                    && event.data.size
                ) {
                    session.chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                session.recorderDone = true;

                if (!session.stopRequested) {
                    stop("Recording stopped.");
                }

                finish();
            };

            recorder.onerror = () => {
                stop("Recording error.", true);
            };

            const v = currentView();

            v.resultSpan.textContent = "Recording...";
            v.resultSpan.style.color = "var(--accent-color)";
            v.correctionBox.style.display = "none";

            practice2SyncRecordingUI();

            recorder.start();
            recognition.start();

            try {
                const AudioContextClass =
                    window.AudioContext
                    || window.webkitAudioContext;

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

                session.timers.push(
                    setInterval(() => {
                        if (
                            session.stopRequested
                            || session.speechStarted
                        ) {
                            return;
                        }

                        analyser.getFloatTimeDomainData(samples);

                        let sum = 0;

                        for (const sample of samples) {
                            sum += sample * sample;
                        }

                        const volume = Math.sqrt(
                            sum / samples.length
                        );

                        soundFrames = volume > 0.015
                            ? soundFrames + 1
                            : 0;

                        if (soundFrames >= 3) {
                            session.speechStarted = true;
                        }
                    }, 100)
                );

            } catch (error) {}

            session.timers.push(
                setTimeout(() => {
                    if (!session.speechStarted) {
                        stop(
                            "No speech detected within 15 seconds.",
                            true
                        );
                    }
                }, 15000)
            );

            session.timers.push(
                setTimeout(() => {
                    stop(
                        "Auto-stopped after 20 seconds."
                    );
                }, 20000)
            );

        } catch (error) {
            session.recognitionDone = true;
            stop("Could not start recording.", true);
        }
    });

    stopBtn.addEventListener("click", () => {
        const session = activeRecognitionSession;

        if (session?.rowKey === rowKey) {
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
    const normalized = practice2Normalize(transcript);

    const isCorrect = normalized.length > 0 && (
        normalized === practice2Normalize(expectedText) ||
        normalized === practice2Normalize(modelText)
    );

    const saved = {
        rawTranscript: transcript,
        expectedText,
        modelText,
        isCorrect
    };
    practice2State.savedResults[rowKey] = saved;

    practice2ShowResult(
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
            recordButton: practice2State.views[rowKey].recordBtn,
            result: resultSpan,
            speak: done => speakText(practice2SpeechText(modelText), playRate, done),
            url: getUrlFn
        });
    }
}


// Keep lifecycle and Voice locks aligned with this page's existing recorder.
DrillAudio.configure({
    busy: () => Boolean(activeRecognitionSession || practice2State.startingRow),
    sync: () => practice2SyncRecordingUI(),
    stop: () => stopAllPlayback(),
    cancel: () => {
        practice2State.startingRow = null;
        const capture = activeRecognitionSession;
        if (capture) {
            capture.discard = true;
            capture.stop?.("", true);
        }
    }
});
