// Practice 2.1: visual demonstratives. Recorder/settings derived from Practice 1.2.
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
    practice2SyncPhotoSpeaker();
}

function stopAllPlayback() {
    document.querySelectorAll('.p21-photo-context').forEach(context => {
        SpeakerGuide.reset(context);
    });
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
    let value=SpeakerGuide.readNames(String(text??''));
    for(const o of Practice21.items) value=value.split(o.kanji).join(o.hira);
    return value.replace(/鞄/g,'かばん').replace(/何(?=ですか)/g,'なん').replace(/何/g,'なに');
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
    STTDisplay.register(kanji, word, meaning);
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
        "#drill2Container button, #drill2Container select, #drill3Container button, #drill4Container button"
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

// Practice 2.1：共通UI・文体・判定
(() => {
    let speechStyle = "formal";
    const speakerName = who => SpeakerGuide.name(who);

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
                ...Practice21.items.flatMap(o=>['あなたの'+o.hira,'あなたの'+o.kanji])];

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
            rawTranscript: String(rawTranscript ?? ""),
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
        const displayed = STTDisplay.format(saved.rawTranscript, {mode:scriptMode, anchor:view.resultSpan, context:[saved.expectedText,saved.modelText].filter(Boolean).join(' ')});

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

            best = STTDisplay.projectDiff(best, displayed);
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
        anchor.setAttribute('aria-label',`${o.colorName?o.colorName+" ":""}${noun(o)} (${o.romaji===o.meaning?o.romaji:o.romaji+", "+o.meaning})`);
        let host=null;
        function close() {
            if(anchor.matches(':hover, :focus'))return;
            host?.remove();host=null;delete anchor.dataset.portalTip;anchor.removeAttribute('aria-describedby');
        }
        function show() {
            if(host)return;
            host=node('span','tooltip-wrap p21-image-tip-host');
            const tip=node('span','tooltip-tip',`${o.colorName?o.colorName+" ":""}${noun(o)} (${o.romaji===o.meaning?o.romaji:o.romaji+", "+o.meaning})`);
            tip.id=`p21-image-tip-${++imageHintSerial}`;tip.setAttribute('role','tooltip');host.append(tip);
            anchor.dataset.portalTip=tip.id;anchor.setAttribute('aria-describedby',tip.id);
            document.body.append(host);window.DrillTooltips.position(anchor,tip);
        }
        anchor.addEventListener('pointerenter',show);anchor.addEventListener('focus',show);
        anchor.addEventListener('pointerleave',close);anchor.addEventListener('blur',close);
    }

    function modelText(getText, object, onlyWhich = false) {
        const span = node("span");
        const text = getText();

        const pattern = onlyWhich ? /どれ/g :
            /(これ|それ|あれ|どれ|の(?=ほん|本|ペン|かばん|鞄|さいふ|財布|かさ|傘|とけい|時計)|じゃないです|じゃないよ|じゃない|なんですか|何ですか|ですか|だよ|です|だ|はい|いいえ|ううん|うん|は、)/g;

        let position = 0;

        for (const match of text.matchAll(pattern)) {
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
            if (label === "A:" && !responseCue) {
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

    const noun=o=>word(o.hira,o.kanji);
    const pro=(speaker,o)=>Practice21.pronoun(speaker,o.zone);
    const englishObject=pronoun=>({'これ':'this','それ':'that','あれ':'that (over there)'}[pronoun]);
    const englishCue=(view,parts)=>{
        if(!practice2State.englishCues)return;
        const source=view.cueCell.querySelector('strong'),role=source&&/Question|Response/.test(source.textContent)?source.cloneNode(true):null;
        view.cueCell.replaceChildren(...(role?[role,document.createTextNode(' ')]:[]),document.createTextNode(parts.join('/')));
    };
    const nameQuestion=(speaker,o)=>question(pro(speaker,o),word(speechStyle==='formal'?'なん':'なに','何'));
    const shortAnswer=(speaker,o)=>pro(speaker,o)+({formal:'です。',informal:'だ。',casual:'だよ。'}[speechStyle]);
    const whichQuestion=o=>question('あなたの'+noun(o),'どれ');
    function prompt(speaker,o,extra='') {
        return `<span class="p21-cue"><span class="p21-role">[Speaker] ${speakerName(speaker)}</span>／<span>[Object] ${o.id}</span>${extra?'／'+extra:''}</span>`;
    }
    function tag(view,speaker,o) {view.row.dataset.speaker=speaker;view.row.dataset.object=o.id;return view;}
    function diagram(container,objects,speaker,target) {
        const box=node('div','p21-diagram p21-drill-scene');box.innerHTML=Practice21.scene(objects,speaker,target);
        box.append(node('p','p21-scene-context',`Speaker ${speakerName(speaker)} → Object ${target}`));container.append(box);return box;
    }
    function exampleDiagram(container,objects,rows) {
        const box=container.querySelector('.example-box');
        const picture=diagram(box,objects,rows[0][0],rows[0][1]);
        picture.classList.replace('p21-drill-scene','p21-example-diagram');box.prepend(picture);
        box.querySelectorAll('tbody tr').forEach((row,i)=>{row.dataset.speaker=rows[i][0];row.dataset.object=rows[i][1];});
    }
    function cardDiagram(current,objects,speaker,target) {
        const box=current.body.closest('.drill-row');
        const picture=diagram(box,objects,speaker,target);box.prepend(picture);
    }
    function renderSections() {
        for(const id of ['drill2Container','drill3Container','drill4Container']) {
            const section=document.getElementById(id);section.replaceChildren();section.hidden=true;
        }
        const container=document.getElementById('drill1Container');container.replaceChildren();
        const objects=[{...Practice21.items[0],id:1,zone:'A'},{...Practice21.items[2],id:2,zone:'B'},{...Practice21.items[5],id:3,zone:'far'}];
        const box=node('section','example-box p21-distance-example');
        box.append(node('h2','p21-distance-heading','こ・そ・あ: three sounds that signal distance'));
        const board=node('div','p21-distance-board');
        const stage=node('div','p21-photo-stage');
        const photo=node('img','p21-photo');photo.src='assets/practice21-table.png';
        photo.alt='X sits at the left end of a table with a book. Y sits at the right end with a bag. A clock hangs on the wall, far from both.';
        photo.width=1536;photo.height=1024;stage.append(photo);
        const context=node('p','p21-photo-context');
        SpeakerGuide.init(context);
        const people=node('div','p21-distance-people');
        for(const person of ['A','B']) {
            const figure=node('div','p21-distance-person');figure.dataset.person=person;
            figure.append(node('strong','p21-person-caption',speakerName(person)));people.append(figure);
        }
        stage.append(people);
        const tableRegions=node('div','p21-table-regions');
        for(const zone of ['A','B','far']) {
            const reach=node('div','p21-reach');reach.dataset.reach=zone;reach.setAttribute('aria-hidden','true');
            (zone==='far'?stage:tableRegions).append(reach);
        }
        stage.append(tableRegions);
        // Reveal the original photographed objects above the changing reach colors.
        for(const item of ['book','bag','clock']) {
            const foreground=node('img',`p21-photo p21-photo-foreground p21-foreground-${item}`);
            foreground.src=photo.src;foreground.alt='';foreground.setAttribute('aria-hidden','true');stage.append(foreground);
        }
        for(const o of objects) {
            const hotspot=node('span','p21-example-item-hint');hotspot.dataset.kind=o.kind;
            imageHint(hotspot,o);stage.append(hotspot);
        }
        board.append(stage,context);
        const areas=node('div','p21-distance-areas');
        const modelList=node('div','p21-model-list');
        function perspective(speaker,target) {
            people.querySelectorAll('[data-person]').forEach(person=>{
                const active=person.dataset.person===speaker;
                person.classList.toggle('is-speaker',active&&Boolean(context.dataset.speaker));
                person.querySelector('strong').textContent=speakerName(person.dataset.person);
            });
            context.dataset.nextSpeaker=speaker;
            board.dataset.speaker=speaker;
            areas.querySelectorAll('[data-zone]').forEach(area=>{
                const sound=area.dataset.zone==='far'?'あ':area.dataset.zone===speaker?'こ':'そ';
                const description=sound==='こ'?'Near the speaker':sound==='そ'?'Near the listener':'Far from both';
                area.querySelector('.p21-area-sound').textContent=sound;
                area.querySelector('.p21-area-description').textContent=description;
                area.dataset.sound=sound;
                area.classList.toggle('is-target',area.dataset.object===String(target));
            });
            const activeObject=objects.find(o=>o.id===Number(target));
            stage.querySelectorAll('.p21-example-item-hint').forEach(item=>item.classList.toggle('is-target',item.dataset.kind===activeObject?.kind));
            modelList.querySelectorAll('[data-model-speaker]').forEach(row=>{
                const active=row.dataset.modelSpeaker===speaker&&row.dataset.object===String(target);
                row.classList.toggle('is-current-model',active);
                if(active)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');
            });
        }
        function emphasizeSpeaker() {SpeakerGuide.play(context,context.dataset.nextSpeaker);}
        for(const o of [objects[0],objects[2],objects[1]]) {
            const area=node('section','p21-distance-area');area.dataset.zone=o.zone;area.dataset.object=o.id;
            const caption=node('div','p21-area-caption');caption.append(node('strong','p21-area-sound'),node('span','p21-area-description'));
            area.append(caption);
            area.append(node('span','p21-object-number',`Object ${o.id}`));
            const controls=node('div','p21-item-audio');
            for(const speaker of ['A','B']) {
                const sound=listen(()=>{perspective(speaker,o.id);return statement(pro(speaker,o),noun(o));},`${speakerName(speaker)}🔊きく`,emphasizeSpeaker);
                sound.dataset.speaker=speaker;sound.dataset.object=o.id;
                controls.append(sound);
            }
            area.append(controls);areas.append(area);
        }
        board.append(areas);box.append(board);
        for(const o of objects) {
            const group=node('section','p21-model-group');const heading=node('h3');heading.innerHTML=formatWord(o.hira,o.kanji,o.romaji,o.meaning);group.append(heading);
            for(const speaker of ['A','B']) {
                const row=node('p','p21-model-line');row.dataset.modelSpeaker=speaker;row.dataset.object=o.id;
                row.append(node('strong','',`${speakerName(speaker)}：`),modelText(()=>statement(pro(speaker,o),noun(o)),o));group.append(row);
            }
            modelList.append(group);
        }
        box.append(modelList);container.append(box);perspective('A');
        renderDrill1(container);
        renderLaterDrills();
        renderEnglishCuePanel();
    }

    function renderDrill1(container) {
        const all=Practice21.items;
        const sets=[[all[1],all[9],all[6]],[all[7],all[12],all[10]]];
        const setIndex=practice2State.activeSet ?? 0;
        const objects=sets[setIndex].map((o,i)=>({...o,zone:['A','B','far'][i]}));
        const drill=node('section','p21-drill1');
        const panel=node('div','info-panel info-panel-task1');
        panel.append(node('span','info-panel-title','Drill 1: Describe the objects'),
            node('span','info-panel-desc',setIndex===0?'💡Complete three sentences as X, then as Y.':'💡X: Ask. Y: Say no and give the correct name.'));
        drill.append(panel);
        const switcher=node('div','p21-set-switcher');
        switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Practice set');
        sets.forEach((_,i)=>{
            const control=node('button','example-button',`Set ${i+1}`);control.type='button';
            control.setAttribute('aria-pressed',String(i===setIndex));
            control.onclick=()=>{if(busy()||i===setIndex)return;practice2State.activeSet=i;renderAll();};
            switcher.append(control);
        });
        drill.append(switcher);
        const picture=node('div','p21-drill-picture');
        const stage=node('div','p21-photo-stage');
        const background=node('img','p21-photo');background.src='assets/practice21-empty-table.png';
        background.width=1536;background.height=1024;
        background.alt='X sits at the left end of a table; Y sits at the right. One object is near each person and another hangs on the distant wall.';
        stage.append(background);
        for(const person of ['A','B']) {
            const label=node('strong','p21-distance-person',speakerName(person));label.dataset.person=person;stage.append(label);
        }
        const foodSprites={pencil:[0,0],onigiri:[50,0],bento:[100,0],sandwich:[0,50]};
        const sprites={pen:[0,0],wallet:[50,0],hat:[100,0],notebook:[0,100],dictionary:[50,100],bag:[100,100]};
        for(const o of objects) {
            const item=node('div','p21-drill-item');item.dataset.zone=o.zone;item.dataset.kind=o.kind;
            item.dataset.set=String(setIndex);
            item.setAttribute('role','img');item.setAttribute('aria-label',o.meaning);
            if(foodSprites[o.kind]) {item.style.backgroundImage="url('assets/practice21-food-items.png')";item.style.backgroundSize='300% 300%';item.style.backgroundPosition=foodSprites[o.kind].map(v=>v+'%').join(' ');}
            else if(o.kind==='newspaper'||o.kind==='tshirt') {
                item.classList.add('p21-replacement-item');
                item.style.backgroundPosition=o.kind==='newspaper'?'0% 0%':'100% 0%';
            } else {
                const [x,y]=sprites[o.kind];item.style.backgroundPosition=`${x}% ${y}%`;
            }
            imageHint(item,o);stage.append(item);
        }
        picture.append(stage);drill.append(picture);
        function showSpeaker(speaker) {
            stage.querySelectorAll('[data-person]').forEach(e=>e.classList.toggle('is-speaker',e.dataset.person===speaker));
            picture.dataset.speaker=speaker;
        }
        if(setIndex===0)for(const speaker of ['A','B']) {
            const current=card(drill,`${speakerName(speaker)}：`);
            current.body.closest('.drill-row').classList.add('p21-speaker-practice');
            const ordered=speaker==='A'?objects:[objects[1],objects[0],objects[2]];
            ordered.forEach((o,i)=>{
                const pronoun=pro(speaker,o);
                const cue=`<strong class="grammar-highlight">${pronoun}は</strong>…`;
                const getText=()=>statement(pronoun,noun(o));
                const view=recordingRow(current,i===0?'q':'a',cue,`p21_d1_s${setIndex}_${speaker}_${i}`,getText);
                englishCue(view,[englishObject(pronoun),'…']);
                view.row.dataset.drillSpeaker=speaker;view.row.dataset.zone=o.zone;
                view.listenBtn.addEventListener('click',()=>showSpeaker(speaker));
                view.recordBtn.addEventListener('click',()=>showSpeaker(speaker));
                for(const control of [view.listenBtn,view.recordBtn])control.addEventListener('focus',()=>showSpeaker(speaker));
            });
        }
        if(setIndex===1) {
            const wrong=[objects[1],objects[2],objects[0]];
            objects.forEach((o,i)=>{
                const current=card(drill,String(i+1));
                current.body.closest('.drill-row').classList.add('p21-dialogue-practice');
                const questionCue=`<strong>X · Q:</strong> ${pro('A',o)}／${formatWord(wrong[i].hira,wrong[i].kanji,wrong[i].romaji,wrong[i].meaning)}`;
                const prefix=speechStyle==='casual'?'ううん':'いいえ';
                const ending={formal:'です',informal:'だ',casual:'だよ'}[speechStyle];
                const answerCue=`<strong>Y · A:</strong> ${prefix}／${formatWord(o.hira,o.kanji,o.romaji,o.meaning)}`;
                const q=recordingRow(current,'q',questionCue,`p21_d1_s1_q_${i}`,()=>question(pro('A',o),noun(wrong[i])));
                const key=`p21_d1_s1_r_${i}`;
                const answer=()=>`${prefix}、${noun(o)}${ending}。`;
                practice2State.replyReferences[key]=()=>{
                    const topic=pro('B',o)+'は、',yes=noun(o)+ending+'。';
                    const negatives=[...negativeForms.slice(0,speechStyle==='formal'?4:6),...(speechStyle==='casual'?['じゃないよ','ではないよ']:[])];
                    return [answer(),`${prefix}、${topic}${yes}`,...negatives.flatMap(negative=>{
                        const no=noun(wrong[i])+negative+'。';
                        return [`${prefix}、${topic}${no}${yes}`,`${prefix}、${no}${topic}${yes}`,`${prefix}、${no}${yes}`,`${prefix}、${topic}${no}${topic}${yes}`];
                    })].flatMap(text=>[text,text.replace(/^(?:いいえ|ううん)、/,'')]);
                };
                const r=recordingRow(current,'a',answerCue,key,answer);
                englishCue(q,[englishObject(pro('A',o)),wrong[i].meaning]);englishCue(r,['no',o.meaning]);
                r.actions.append(node('span','p21-response-lead',`${prefix}…`));
                for(const [view,speaker] of [[q,'A'],[r,'B']]) {
                    view.row.dataset.drillSpeaker=speaker;view.row.dataset.zone=o.zone;
                    for(const control of [view.listenBtn,view.recordBtn])for(const event of ['click','focus'])control.addEventListener(event,()=>showSpeaker(speaker));
                }
            });
        }
        showSpeaker('A');container.append(drill);
    }

    // Shared photo for naming and choosing tasks; all answers remain speaker-relative.
    function laterScene(container,objects,which=false) {
        const picture=node('div','p21-drill-picture p21-shelf-scene');
        const context=container.classList.contains('example-box')?node('p','p21-photo-context'):null;
        if(context){SpeakerGuide.init(context);picture.append(context);}
        if(which) {
            const guide=node('div','p21-which-guide');
            const heading=node('strong');heading.append(node('span','p21-question-sound','ど'),node('span','p21-question-description','Asking about the unknown'));heading.lastElementChild.innerHTML='Asking about <br>the unknown';guide.append(heading);
            guide.insertAdjacentHTML('afterbegin','<svg class="p21-thought-cloud" viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true"><path d="M35 20C35 7 65 2 82 12C96-1 130-1 145 10C165-1 197 1 208 13C230 5 261 13 261 28C286 30 295 50 279 62C291 78 270 92 248 87C231 101 200 96 189 87C170 99 139 99 124 88C102 99 72 96 62 85C34 91 12 78 21 61C4 45 10 26 35 20Z"/></svg>');
            picture._whichGuide=guide;
        }
        const stage=node('div','p21-photo-stage');
        const photo=node('img','p21-photo');photo.src='assets/practice21-shelf-table.png';photo.width=1536;photo.height=1024;
        photo.alt='X sits on the left, Y on the right. Objects are near X, near Y, and on a shelf far from both.';
        stage.append(photo);
        if(picture._whichGuide){
            const dots=node('span','p21-thought-dots');dots.setAttribute('aria-hidden','true');
            if(context)picture._whichGuide.append(dots);else stage.append(dots);stage.append(picture._whichGuide);
        }
        for(const person of ['A','B']) {const label=node('strong','p21-distance-person',speakerName(person));label.dataset.person=person;stage.append(label);}
        for(const o of objects) {
            const item=node('div','p21-drill-item p21-choice-item');item.dataset.zone=o.zone;item.dataset.kind=o.kind;item.dataset.color=o.colorName||'';
            item.setAttribute('role','img');item.setAttribute('aria-label',`${o.colorName||''} ${o.meaning}`.trim());
            const foodSprites={onigiri:[50,0],bento:[100,0],sandwich:[0,50]};
            const clothingSprites={shoes:[0,12.5],jeans:[50,12.5],sweatshirt:[100,12.5]};
            if(clothingSprites[o.kind]) {item.classList.remove('p21-choice-item');item.style.backgroundImage="url('assets/practice21-clothing-items.png')";item.style.backgroundSize='300% 300%';item.style.backgroundPosition=clothingSprites[o.kind].map(v=>v+'%').join(' ');}
            else if(foodSprites[o.kind]) {item.classList.remove('p21-choice-item');item.style.backgroundImage="url('assets/practice21-food-items.png')";item.style.backgroundSize='300% 300%';item.style.backgroundPosition=foodSprites[o.kind].map(v=>v+'%').join(' ');}
            else if(o.kind==='notebook') {item.classList.remove('p21-choice-item');item.style.backgroundPosition='0% 100%';}
            else item.style.backgroundPosition=`${{red:0,blue:50,green:100}[o.colorName||'blue']}% ${{phone:0,dictionary:50,wallet:100}[o.kind]}%`;
            if(o.kind==='wallet')item.style.backgroundImage="url('assets/practice21-wallet-variants.png')";
            if(o.kind==='dictionary')item.style.backgroundImage="url('assets/practice21-dictionary-labels.png')";
            imageHint(item,o);stage.append(item);
        }
        if(context){const canvas=node('div','p21-example-scene-canvas');while(stage.firstChild)canvas.append(stage.firstChild);stage.append(canvas);}
        picture.append(stage);container.append(picture);
        const show=speaker=>{
            picture.dataset.speaker=speaker;
            stage.querySelectorAll('[data-person]').forEach(e=>e.classList.toggle('is-speaker',e.dataset.person===speaker&&(!context||Boolean(context.dataset.speaker))));
        };
        show.announce=speaker=>SpeakerGuide.play(context,speaker);return show;
    }
    function bindSpeaker(view,speaker,showSpeaker) {
        view.row.dataset.drillSpeaker=speaker;
        for(const control of [view.listenBtn,view.recordBtn])for(const event of ['click','focus'])control.addEventListener(event,()=>showSpeaker(speaker));
    }
    function setButtons(container,labels,property) {
        const index=practice2State[property]??0;
        const switcher=node('div','p21-set-switcher');switcher.dataset.setState=property;switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Practice set');
        labels.forEach((label,i)=>{
            const control=node('button','example-button',label);control.type='button';control.setAttribute('aria-pressed',String(i===index));
            control.onclick=()=>{
                if(busy()||i===index)return;
                const top=control.getBoundingClientRect().top;
                practice2State[property]=i;renderAll();
                const next=document.querySelector(`[data-set-state="${property}"] button:nth-child(${i+1})`);
                next.focus({preventScroll:true});window.scrollBy(0,next.getBoundingClientRect().top-top);
            };switcher.append(control);
        });container.append(switcher);return index;
    }
    function renderLaterDrills() {
        const item=kind=>Practice21.items.find(o=>o.kind===kind);
        const d2=document.getElementById('drill2Container');d2.hidden=false;
        const panel2=node('div','info-panel info-panel-task1');panel2.append(node('span','info-panel-title','Drill 2: What is it?'),node('span','info-panel-desc','💡X: Ask what each object is. Y: Answer.'));d2.append(panel2);
        const s2=setButtons(d2,['Set 1','Set 2'],'namingSet');
        const kinds=s2===0?['onigiri','bento','sandwich']:['sweatshirt','jeans','shoes'];
        const objects=kinds.map((kind,i)=>({...item(kind),zone:['A','B','far'][i]}));
        const show2=laterScene(d2,objects);
        objects.forEach((o,i)=>{
            const current=card(d2,String(i+1));
            current.body.closest('.drill-row').classList.add('p21-naming-practice');
            const q=recordingRow(current,'q',`<strong>X · Q:</strong> ${pro('A',o)}／${formatWord('なに','何','nani','what')}`,`p21_d2_s${s2}_q_${i}`,()=>question(pro('A',o),speechStyle==='formal'?'なん':'なに'));
            const key=`p21_d2_s${s2}_r_${i}`;
            const ending={formal:'です。',informal:'だ。',casual:'だよ。'}[speechStyle];
            practice2State.replyReferences[key]=()=>[statement(pro('B',o),noun(o)),noun(o)+ending];
            const r=recordingRow(current,'a',`<strong>Y · A:</strong> ${pro('B',o)}／${formatWord(o.hira,o.kanji,o.romaji,o.meaning)}`,key,()=>statement(pro('B',o),noun(o)));
            englishCue(q,[englishObject(pro('A',o)),'what']);
            englishCue(r,[englishObject(pro('B',o)),o.meaning]);
            bindSpeaker(q,'A',show2);bindSpeaker(r,'B',show2);
        });show2('A');
        const d3=document.getElementById('drill3Container');d3.hidden=false;
        const exampleBox=node('section','example-box p21-which-example');
        const phone=item('phone'),exampleObjects=['red','blue','green'].map((colorName,i)=>({...phone,colorName,zone:['A','B','far'][i]}));
        const showExample=laterScene(exampleBox,exampleObjects,true);
        const mine=exampleObjects[0],yours=exampleObjects[2];
        const intro=()=>statement(word('わたしの','私の')+noun(mine),pro('A',mine));
        const ask=()=>question('Yさんの'+noun(yours),'どれ');
        const reply=()=>shortAnswer('B',yours);
        for(const [speaker,text] of [['A',ask],['B',reply]]) {
            const button=listen(()=>{showExample(speaker);return text();},`${speakerName(speaker)}🔊きく`,()=>showExample.announce(speaker));
            button.classList.add('p21-which-audio');button.dataset.speaker=speaker;
            exampleBox.querySelector('.p21-example-scene-canvas').append(button);
        }
        const models=node('div','p21-which-models');
        for(const [speaker,text,cue,part]of [
            ['A',intro,formatWord('わたしのスマホ','私のスマホ','watashi no sumaho','my smartphone')+'／これ','intro'],
            ['A',ask,formatWord('Yさんのスマホ','Yさんのスマホ','Y-san no sumaho','Y’s smartphone')+'／どれ','question'],
            ['B',reply,'','response']]){
            const line=node('p','p21-which-model-line');line.dataset.part=part;
            line.append(node('strong','',speakerName(speaker)+'：'));
            if(cue){const prompt=node('span','p21-which-cue');prompt.innerHTML=cue;line.append(prompt,node('span','','👉️'));}
            const sound=listen(()=>{showExample(speaker);return text();},'🔊きく',()=>showExample.announce(speaker));sound.dataset.speaker=speaker;
            line.append(sound,modelText(text,phone,true));models.append(line);
        }
        exampleBox.append(models);d3.append(exampleBox);showExample('A');
        const panel3=node('div','info-panel info-panel-task1');panel3.append(node('span','info-panel-title','Drill 3: Which one?'),node('span','info-panel-desc','💡Take turns asking. Use これ／それ／あれ for the color shown.'));d3.append(panel3);
        const s3=setButtons(d3,[noun(item('dictionary')),noun(item('wallet'))],'choosingSet');
        const nounItem=item(['dictionary','wallet'][s3]);
        const choices=['red','blue','green'].map((colorName,i)=>({...nounItem,zone:['A','B','far'][i],colorName}));
        const show3=laterScene(d3,choices,false);
        // The phone is introduced in Example 2; the two Drill sets cover dictionary and wallet.
        const targets=[[1,2],[2,0]][s3];
        targets.forEach((target,i)=>{
            const o=choices[target],current=card(d3,String(i+1)),asking=s3===0?'A':i===0?'A':'B',answering=s3===0?'B':i===0?'B':'A';
            current.body.closest('.drill-row').classList.add('p21-choosing-practice');
            const owner=s3===0?(i===0?'B':'A'):answering;
            const possessive=()=>owner===answering?word('わたしの','私の'):speakerName(owner)+'さんの';
            const q=recordingRow(current,'q',`<strong>${speakerName(asking)} · Q:</strong> ${s3===0?speakerName(owner)+'さん':formatWord('あなた','あなた','anata','you')}／${formatWord(o.hira,o.kanji,o.romaji,o.meaning)}／どれ`,`p21_d3_s${s3}_q_${i}`,()=>s3===0?question(speakerName(owner)+'さんの'+noun(o),'どれ'):whichQuestion(o));
            const cue=node('span');cue.innerHTML=`<strong>${speakerName(answering)} · A:</strong> `;
            const color=node('span','p21-color-cue',o.colorName);color.dataset.color=o.colorName;cue.append(color);
            const key=`p21_d3_s${s3}_r_${i}`;
            const ending={formal:'です。',informal:'だ。',casual:'だよ。'}[speechStyle];
            practice2State.replyReferences[key]=()=>[statement(pro(answering,o),possessive()+noun(o)),statement(possessive()+noun(o),pro(answering,o)),statement(noun(o),pro(answering,o)),statement(pro(answering,o),possessive()),pro(answering,o)+'が'+possessive()+noun(o)+ending];
            const r=recordingRow(current,'a',cue,key,()=>shortAnswer(answering,o));
            englishCue(q,[s3===0?speakerName(owner):'you',o.meaning,'which one']);
            bindSpeaker(q,asking,show3);bindSpeaker(r,answering,show3);
        });show3('A');
    }

    function renderEnglishCuePanel() {
        const container=document.getElementById('drill4Container');container.hidden=false;
        const panel=node('section','info-panel info-panel-task1 drill-cue-panel'),copy=node('div','drill-cue-copy');
        copy.append(node('span','info-panel-title drill-cue-title','Drill 4: Practice with English cues'),node('span','info-panel-desc drill-cue-description','💡Use English cues for Drills 1–3.'));
        const toggle=node('button','drill-cue-button',practice2State.englishCues?'Display Japanese Cues':'Display English Cues');toggle.type='button';
        toggle.classList.toggle('is-english',Boolean(practice2State.englishCues));toggle.setAttribute('aria-pressed',String(Boolean(practice2State.englishCues)));
        toggle.onclick=()=>{
            if(busy())return;
            practice2State.englishCues=!practice2State.englishCues;renderAll();
            requestAnimationFrame(()=>{const example=document.querySelector('#drill1Container .info-panel:not(.drill-cue-panel)');if(!example)return;const style=getComputedStyle(example),line=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.5;window.scrollTo({top:Math.max(0,window.scrollY+example.getBoundingClientRect().top-line),behavior:'smooth'});});
        };
        panel.append(copy,toggle);container.append(panel);
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
            "drill2Container", "drill3Container"
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
        Practice21.refreshTargets();
    };
})();

// ============================================================================
// Practice 2.1: Result conversion, matching and recording
// ============================================================================

function practice2ToHiragana(text) {
    let value = String(text ?? "").normalize("NFKC");

    // このページの語彙を判定用の読みへ変換する。
    value = convertToHiragana(value.replace(/[Tt]シャツ/g, "ティーシャツ"));

    // このページの問題データに登録された語句を追加変換する。
    const pairs = Practice21.items.map(o => [o.kanji,o.hira]);

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
    const pairs=Practice21.items.filter(o=>o.hira!==o.kanji).map(o=>[o.hira,o.kanji]).sort((a,b)=>b[0].length-a[0].length);
    for(const [from,to]of pairs)value=value.split(from).join(to);
    value=value.replace(/何(?=ですか)/g,'なん');
    value=value.replace(/(?:なん|なに)(?=ですか|[？?。]|$)/g,(reading,offset,text)=>text.startsWith('ですか',offset+reading.length)?'なん':'何');
    let prefix = "";

    // 「はい」の「は」を助詞として処理しない。
    const response = value.match(/^(はい|いいえ)[、,\s]*/);

    if (response) {
        prefix = response[1] + "、";
        value = value.slice(response[0].length);
    }

    // このページの文型「N₁はN₂です」の区切り。
    value = value.replace(/は[、,\s]*/, "は、");

    // 否定文の読み上げ用の区切り。
    value = value.replace(
        /じゃ[、,\s]*ないです/g,
        "じゃ、ないです"
    );

    return SpeakerGuide.readNames(prefix + value);
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
    const displayed = STTDisplay.format(saved.rawTranscript, {mode:scriptMode, anchor:view.resultSpan, context:[saved.expectedText,saved.modelText].filter(Boolean).join(' ')});

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

        best = STTDisplay.projectDiff(best, displayed);
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
    const transcript = String(rawTranscript ?? "");
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
