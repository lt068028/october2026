// Casualの否定：表示「ううん」／モデル音声「ううんん」
(() => {
    const originalSpeechText = practice2SpeechText;
    const originalNormalize = practice2Normalize;
    const originalDiffReading = practice2DiffReading;

    practice2SpeechText = function(text) {
        const value = String(text ?? "")
            .trim()
            .replace(
                /^(?:ううんん?|うんん)ー?/,
                "ううんん"
            )
            .replace(
                /の(?=専攻|せんこう)/g,
                "の、"
            );

        return originalSpeechText(value);
    };

    // 認識された表記の違いは、比較時だけ吸収する。
    practice2Normalize = function(text) {
        return originalNormalize(text).replace(
            /^うんんー?/,
            "ううん"
        );
    };

    practice2DiffReading = function(text) {
        return originalDiffReading(text).replace(
            /^うんんー?/,
            "ううん"
        );
    };

    function updateModelLabels() {
        function visit(element) {
            for (const child of element.childNodes) {
                if (child.nodeType === 3) {
                    child.textContent =
                        child.textContent.replace(
                            /^うんん(?=[、,])/,
                            "ううん"
                        );
                } else if (
                    child.nodeType === 1
                    && !child.matches(
                        ".custom-tip-box, .tooltip-tip"
                    )
                ) {
                    visit(child);
                }
            }
        }

        // モデル表示だけを変更し、抽出文は変更しない。
        document.querySelectorAll(
            ".drill-example-table, .recording-actions"
        ).forEach(visit);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const previousRender = renderAll;

        renderAll = function() {
            if (
                activeRecognitionSession
                || practice2State.startingRow
            ) {
                return;
            }

            previousRender();
            updateModelLabels();
        };

        updateModelLabels();
    });

    // Textボタンで後から表示するモデル文にも適用する。
    document.addEventListener(
        "click",
        updateModelLabels
    );
})();
// ============================================================================
// Practice 1.2: Yes/No & Wh- Questions (Genki Lesson 2 - 「せんこう」同音異義語完全網羅版)
// ============================================================================

const practice2Data = [
    { x: "おにいさん", xKanji: "お兄さん", xRomaji: "onīsan", xMeaning: "older brother", y: "がくせい", yKanji: "学生", yRomaji: "gakusei", yMeaning: "student" },
    { x: "おかあさん", xKanji: "お母さん", xRomaji: "okāsan", xMeaning: "mother", y: "かいしゃいん", yKanji: "会社員", yRomaji: "kaishain", yMeaning: "company employee" },
    { x: "おねえさん", xKanji: "お姉さん", xRomaji: "onēsan", xMeaning: "older sister", y: "こうこうせい", yKanji: "高校生", yRomaji: "kōkōsei", yMeaning: "high school student" },
    { x: "おとうさん", xKanji: "お父さん", xRomaji: "otōsan", xMeaning: "father", y: "じえいぎょう", yKanji: "自営業", yRomaji: "jiēgyō", yMeaning: "self-employed" },
    { x: "いもうと", xKanji: "妹", xRomaji: "imōto", xMeaning: "younger sister", y: "フリーター", yKanji: "フリーター", yRomaji: "furītā", yMeaning: "part-time worker" }
];

const drill2Targets = [
    { label: "ともだち", labelKanji: "友達", labelRomaji: "tomodachi", labelMeaning: "friend", possessive: "ともだちの", possessiveKanji: "友達の" },
    { label: "しんゆう", labelKanji: "親友", labelRomaji: "shinyū", labelMeaning: "best friend", possessive: "しんゆうの", possessiveKanji: "親友の" },
    { label: "どうりょう", labelKanji: "同僚", labelRomaji: "dōryō", labelMeaning: "colleague", possessive: "どうりょうの", possessiveKanji: "同僚の" }
];

const majorsData = [
    { word: "せいじ", kanji: "政治", romaji: "seiji", meaning: "politics" },
    { word: "けいざい", kanji: "経済", romaji: "keizai", meaning: "economics" },
    { word: "ビジネス", kanji: "ビジネス", romaji: "bijinesu", meaning: "business" },
    { word: "こくさいかんけい", kanji: "国際関係", romaji: "kokusai kankei", meaning: "international relations" },
    { word: "れきし", kanji: "歴史", romaji: "rekishi", meaning: "history" },
    { word: "にほんご", kanji: "日本語", romaji: "nihongo", meaning: "Japanese" },
    { word: "コンピューター", kanji: "コンピューター", romaji: "konpyūtā", meaning: "computer science" }
];

const rowColorThemes = [
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" },
    { unselected: "#bae6fd", yesActive: "#4ade80", noActive: "#fca5a5" }
];

let isManualStop = false;
let hintMode = "hover";
let scriptMode = "hiragana";
let isAutoPlay = true;
let activeRecognitionSession = null;

// 変数名は構文エラーを防ぐため practice2State のまま維持
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

// ひらがな正規化処理 ＆ 「せんこう」関連の同音異義語網羅補正
function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");

    const dict = {
        "お母さん": "おかあさん",
        "お父さん": "おとうさん",
        "お兄さん": "おにいさん",
        "お姉さん": "おねえさん",
        "弟": "おとうと",
        "妹": "いもうと",
        "会社員": "かいしゃいん",
        "自営業": "じえいぎょう",
        "高校生": "こうこうせい",
        "看護師": "かんごし",
        "主婦": "しゅふ",
        "政治": "せいじ",
        "経済": "けいざい",
        "歴史": "れきし",
        "日本語": "にほんご",
        "友達": "ともだち",
        "親友": "しんゆう",
        "同僚": "どうりょう",
        "専攻": "せんこう",
        "千校": "せんこう",
        "千項": "せんこう",
        "先行": "せんこう",
        "選考": "せんこう",
        "線香": "せんこう",
        "閃光": "せんこう",
        "潜行": "せんこう",
        "せんこう": "せんこう",
        "学生": "がくせい",
        "先生": "せんせい",
        "です": "です",
        "ですか": "ですか",
        "はい、": "はい、",
        "いいえ、": "いいえ、",
        "じゃないです": "じゃないです",
        "じゃ、ないです": "じゃ、ないです",
        "ではないです": "ではないです"
    };

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    cleaned = cleaned.replace(/わ$/g, "は");

    return cleaned;
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

    const hintStr = `${romaji}, ${meaning}`;

    // OFF: Japanese word only
    if (hintMode === "off") {
        return `<span class="target-word">${displayWord}</span>`;
    }

    // Vocab Display: Always show vocabulary hints
    if (hintMode === "paren") {
        return `<span class="practice12-cue-unit"><span class="target-word">${displayWord}</span><span class="vocab-inline">(${hintStr})</span></span>`;
    }

    // Vocab Hover: Show vocabulary hints on hover
    return `
        <span class="tooltip-wrap">
            <span class="target-word">${displayWord}</span>
            <span class="tooltip-tip">${hintStr}</span>
        </span>
    `;
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

function renderAll() {
    practice2State.ui ??= {};
    practice2State.generatedKeyIndex = 0;

    stopAllPlayback();
    renderDrill1Section();
    renderDrill2Section();

    function connectRows(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rows = container.querySelectorAll(".drill-row");

        rows.forEach((row, index) => {
            const key = `${containerId}_${index}`;
            const state = practice2State.ui[key] ??= {
                answerMode: null,
                selectedValue: "",
                textVisible: false
            };

            const buttons = Array.from(row.querySelectorAll("button"));
            const yes = buttons.find(button =>
                button.textContent.trim() === "🙆"
            );
            const no = buttons.find(button =>
                button.textContent.trim() === "🙅"
            );
            const textButton = buttons.find(button =>
                button.textContent.startsWith("👀Text") ||
                button.textContent.startsWith("🕶️Hide")
            );
            const select = row.querySelector("select");

            // 再描画前の選択を、元のハンドラーで復元する。
            if (state.answerMode === "yes") yes?.click();
            if (state.answerMode === "no") no?.click();

            if (select && state.selectedValue) {
                select.value = state.selectedValue;
                select.dispatchEvent(new Event("change"));
            }

            if (state.textVisible &&
                textButton && !textButton.disabled) {
                textButton.click();
            }

            // 選択状態を、見た目と独立して保存する。
            if (yes) {
                const original = yes.onclick;
                yes.onclick = event => {
                    state.answerMode =
                        state.answerMode === "yes" ? null : "yes";
                    state.textVisible = false;
                    original?.call(yes, event);
                };
            }

            if (no) {
                const original = no.onclick;
                no.onclick = event => {
                    state.answerMode =
                        state.answerMode === "no" ? null : "no";
                    state.textVisible = false;
                    original?.call(no, event);
                };
            }

            if (select) {
                const original = select.onchange;
                select.onchange = event => {
                    state.selectedValue = select.value;
                    state.textVisible = false;
                    original?.call(select, event);
                };
            }

            if (textButton) {
                const original = textButton.onclick;
                textButton.onclick = event => {
                    state.textVisible = !state.textVisible;
                    original?.call(textButton, event);
                };
            }

            // 通常のモデル再生にも、読み上げ専用の読点を適用。
            buttons.forEach(button => {
                if (!button.textContent.startsWith("🔊きく")) return;

                const original = button.onclick;
                if (!original) return;

                button.onclick = event => {
                    if (activeRecognitionSession ||
                        practice2State.startingRow) return;

                    original.call(button, event);
                };
            });
        });
    }

    connectRows("drill1Container");
    connectRows("drill2Container");

    practice2SyncRecordingUI();
}

function practice2SyncRecordingUI() {
    const blocked = Boolean(
        activeRecognitionSession
        || practice2State.startingRow
    );

    practice2State.lockedControls ??= new Map();

    const locked = practice2State.lockedControls;

    const controls = document.querySelectorAll(
        "#drill1Container button, #drill1Container select, " +
        "#drill2Container button, #drill2Container select"
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

// ============================================================================
// Render Drill 1 Section
// ============================================================================
// 共通UI：セクション間隔・モデル音声・質問キュー
(() => {
    const originalSpeechText = practice2SpeechText;

    const pairs = [
        ...practice2Data.flatMap(item => [
            [item.x, item.xKanji],
            [item.y, item.yKanji]
        ]),
        ...drill2Targets.flatMap(item => [
            [item.possessive, item.possessiveKanji],
            [item.label, item.labelKanji]
        ]),
        ...majorsData.map(item => [
            item.word,
            item.kanji
        ]),
        ["おとうさん", "お父さん"],
        ["かんごし", "看護師"],
        ["せんこう", "専攻"]
    ]
        .filter(([from, to]) =>
            from && to && from !== to
        )
        .sort((a, b) => b[0].length - a[0].length);

    // 表示モードにかかわらず、読み上げ用は漢字表記に統一する。
    // 表示文・抽出文・判定用テキストは変更しない。
    practice2SpeechText = function(text) {
        let value = String(text ?? "");

        for (const [from, to] of pairs) {
            value = value.split(from).join(to);
        }

        value = value.replace(
            /(?:なん|なに)(?=ですか|[？?。]|$)/g,
            "何"
        );

        return originalSpeechText(value);
    };

    function finishLayout() {
        const first = document.getElementById(
            "drill1Container"
        );

        const second = document.getElementById(
            "drill2Container"
        );

        first?.classList.add("practice-section");
        second?.classList.add("practice-section");

        if (!second) return;

        // Example2：上下行を同じ5列にする。
        const example = second.querySelector(
            ".drill-example-table"
        );

        const response = example
            ?.querySelector("tbody")
            ?.children[1];

        const merged = response?.children[1];

        if (merged?.colSpan === 4) {
            const label = response.children[0];
            const listen = merged.querySelector("button");

            const model = Array.from(
                merged.children
            ).find(element =>
                element.tagName === "SPAN"
            );

            if (listen && model) {
                const cells = Array.from(
                    {length: 4},
                    () => document.createElement("td")
                );

                cells[2].append(listen);
                cells[3].append(model);

                response.replaceChildren(
                    label,
                    ...cells
                );
            }
        }

        // Drill2の質問キューに「何」を追加する。
        const tables = Array.from(
            second.querySelectorAll(".recording-table")
        );

        for (const table of tables) {
            const cue = table.querySelector(
                ".drill-cue-cell"
            );

            if (!cue || cue.dataset.whCueAdded) continue;

            const what = document.createElement("span");

            what.innerHTML = formatWord(
                "なに",
                "何",
                "nani",
                "what"
            );

            cue.append(
                document.createTextNode("／"),
                what
            );

            cue.dataset.whCueAdded = "true";
        }

        // 追加後のキュー幅で聞くボタンの列をそろえる。
        let width = 0;

        for (const table of tables) {
            for (
                const cell of table.querySelectorAll(
                    ".drill-cue-cell"
                )
            ) {
                const measure = document.createElement("span");

                cell.childNodes.forEach(child =>
                    measure.append(child.cloneNode(true))
                );

                measure.querySelectorAll(
                    ".tooltip-tip, .custom-tip-box"
                ).forEach(tip => tip.remove());

                // 内容幅の測定専用。
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
                        measure.getBoundingClientRect().width
                    )
                );

                measure.remove();
            }
        }

        tables.forEach(table => {
            table.style.setProperty("--practice12-cue-width", `${width + 8}px`);
            table.querySelector(
                "colgroup"
            ).children[1].style.width = `${width + 8}px`;
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const originalRender = renderAll;

        renderAll = function() {
            if (
                activeRecognitionSession
                || practice2State.startingRow
            ) {
                return;
            }

            originalRender();
            finishLayout();
        };

        finishLayout();
    });
})();
// Practice 1.2：共通UI・文体・判定
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
        const topic = speechStyle === "casual" ? "、" : "は、";
        const ending = speechStyle === "formal" ? "ですか？" : "？";

        return `${subject}${topic}${predicate}${ending}`;
    };

    const statement = (subject, predicate) => {
        const topic = speechStyle === "casual" ? "、" : "は、";

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

            const subjects = [
                ...practice2Data.flatMap(item => [
                    item.x,
                    item.xKanji
                ]),
                ...drill2Targets.flatMap(item => [
                    item.label + "の専攻",
                    item.labelKanji + "の専攻"
                ]),
                "お父さん",
                "あなたの専攻",
                "わたしの専攻"
            ];

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

        const saved = {
            rawTranscript: String(rawTranscript ?? "").trim(),
            expectedText,
            modelText,
            speechStyle,
            isCorrect:
                matches(rawTranscript, expectedText, speechStyle)
                || matches(rawTranscript, modelText, speechStyle)
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
                saved.modelText
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

    function listen(getText, label = "🔊きく") {
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

                speakText(
                    practice2SpeechText(text),
                    0.75,
                    () => stopAllPlayback()
                );
            }
        );

        return element;
    }

    function modelText(getText) {
        const span = node("span");
        const text = getText();

        const pattern =
            /(じゃないです|じゃないよ|じゃない|なんですか|何ですか|の(?=せんこう|専攻)|ですか|だよ|です|だ|はい|いいえ|ううん|うん|は、)/g;

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

            const arrowHost = cueCell.lastElementChild?.classList.contains("practice12-cue-unit")
                ? cueCell.lastElementChild
                : cueCell;
            arrowHost.append(node("span", "practice12-cue-arrow", " 👉"));
            const arrowCell = node("td", "practice12-empty-arrow-cell");

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
            actions,
            cueCell,
            controls,
            listenBtn,
            recordBtn
        };
    }

    function textToggle(view, getText, enabled) {
        const answer = node("span", "practice12-shown-model");

        const toggle = button(
            "👀Text",
            "Show or hide the model answer.",
            () => {
                const visible =
                    enabled.textVisible = !enabled.textVisible;

                answer.textContent = visible
                    ? getText()
                    : "";

                toggle.firstChild.textContent = visible
                    ? "🕶️Hide"
                    : "👀Text";

                alignColumns();
            }
        );

        toggle.disabled = !enabled.ready;

        if (enabled.textVisible && enabled.ready) {
            answer.textContent = getText();
            toggle.firstChild.textContent = "🕶️Hide";
        }

        // Keep selection and Text together, before the shared Listen/Record/Stop column.
        view.cueCell.lastElementChild.append(toggle);
        view.controls.append(answer);
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
            node("span", "info-panel-desc", instruction)
        );

        return {container, panel};
    }

    function renderSections() {
        practice2State.ui ??= {};

        const first = section(
            "drill1Container",
            "Drill 1: Yes/No Questions",
            "💡Form a question from the prompts and practice both affirmative and negative responses."
        );

        const father = formatWord(
            "おとうさん",
            "お父さん",
            "otōsan",
            "father"
        );

        const nurse = formatWord(
            "かんごし",
            "看護師",
            "kangoshi",
            "nurse"
        );

        example(first.container, [
            [
                "Question:",
                father + "／" + nurse,
                () => question(
                    word("おとうさん", "お父さん"),
                    word("かんごし", "看護師")
                )
            ],
            [
                "Response:",
                nurse,
                () => response(
                    word("かんごし", "看護師"),
                    true
                ),
                "🔊🙆"
            ],
            [
                "Response:",
                nurse,
                () => response(
                    word("かんごし", "看護師"),
                    false
                ),
                "🔊🙅"
            ]
        ]);

        first.container.append(first.panel);

        practice2Data.forEach((item, index) => {
            const state = practice2State.ui[
                `drill1Container_${index}`
            ] ??= {
                answerMode: null,
                textVisible: false
            };

            const current = card(
                first.container,
                `${index + 1}.`
            );

            const y = () => word(item.y, item.yKanji);

            const cue =
                formatWord(
                    item.x,
                    item.xKanji,
                    item.xRomaji,
                    item.xMeaning
                )
                + "／"
                + formatWord(
                    item.y,
                    item.yKanji,
                    item.yRomaji,
                    item.yMeaning
                );

            recordingRow(
                current,
                "q",
                cue,
                `p2_drill1_q_${index}`,
                () => question(
                    word(item.x, item.xKanji),
                    y()
                )
            );

            const choices = node("span");

            for (
                const [mode, label]
                of [["yes", "🙆"], ["no", "🙅"]]
            ) {
                const choice = button(
                    label,
                    mode === "yes"
                        ? "Affirmative response"
                        : "Negative response",
                    () => {
                        state.answerMode =
                            state.answerMode === mode
                                ? null
                                : mode;

                        state.textVisible = false;
                        renderAll();
                    }
                );

                choice.setAttribute(
                    "aria-pressed",
                    String(state.answerMode === mode)
                );

                choice.classList.toggle(
                    "is-selected",
                    state.answerMode === mode
                );

                const theme = rowColorThemes[
                    index % rowColorThemes.length
                ];

                choice.style.backgroundColor =
                    state.answerMode === mode
                        ? (
                            mode === "yes"
                                ? theme.yesActive
                                : theme.noActive
                        )
                        : theme.unselected;

                choices.append(choice);
            }

            const getText = () => state.answerMode
                ? response(y(), state.answerMode === "yes")
                : "";

            const answer = recordingRow(
                current,
                "a",
                choices,
                `p2_drill1_a_${index}`,
                getText,
                Boolean(state.answerMode)
            );

            textToggle(answer, getText, {
                get textVisible() {
                    return state.textVisible;
                },
                set textVisible(value) {
                    state.textVisible = value;
                },
                ready: Boolean(state.answerMode)
            });
        });

        const second = section(
            "drill2Container",
            "Drill 2: Wh- Questions",
            "💡Ask about majors. Select a major from the dropdown menu and reply using the possessive form."
        );

        example(second.container, [
            [
                "Question:",
                formatWord(
                    "あなた",
                    "あなた",
                    "anata",
                    "you"
                )
                + "／"
                + formatWord(
                    "せんこう",
                    "専攻",
                    "senkō",
                    "major"
                )
                + "／"
                + formatWord("なに", "何", "nani", "what"),
                () => question(
                    word(
                        "あなたのせんこう",
                        "あなたの専攻"
                    ),
                    word(speechStyle === "casual" ? "なに" : "なん", "何")
                )
            ],
            [
                "Response:",
                formatWord("あなた", "あなた", "anata", "you")
                + "／"
                + formatWord("せんこう", "専攻", "senkō", "major")
                + "／"
                + formatWord(
                    "せいじ",
                    "政治",
                    "seiji",
                    "politics"
                ),
                () => statement(
                    word(
                        "わたしのせんこう",
                        "わたしの専攻"
                    ),
                    word("せいじ", "政治")
                )
            ]
        ], {
            responseCue: true
        });

        second.container.append(second.panel);

        drill2Targets.forEach((target, index) => {
            const state = practice2State.ui[
                `drill2Container_${index}`
            ] ??= {
                selectedValue: "",
                textVisible: false
            };

            const current = card(
                second.container,
                `${index + 1}.`
            );

            const subject = () => word(
                target.possessive + "せんこう",
                target.possessiveKanji + "専攻"
            );

            const cue =
                formatWord(
                    target.label,
                    target.labelKanji,
                    target.labelRomaji,
                    target.labelMeaning
                )
                + "／"
                + formatWord(
                    "せんこう",
                    "専攻",
                    "senkō",
                    "major"
                );

            const key = `p2_drill2_${target.label}`;

            recordingRow(
                current,
                "q",
                cue,
                `${key}_q`,
                () => question(
                    subject(),
                    word("なん", "何")
                )
            );

            const choices = node("span");
            choices.innerHTML = cue + "／";

            const select = node(
                "select",
                "custom-select"
            );

            const placeholder = node(
                "option",
                "",
                "📋Select"
            );

            placeholder.value = "";
            placeholder.disabled = true;
            select.append(placeholder);

            majorsData.forEach(major => {
                const option = node(
                    "option",
                    "",
                    word(major.word, major.kanji)
                );

                option.value = major.word;
                option.title =
                    `${major.romaji}, ${major.meaning}`;

                select.append(option);
            });

            select.value = state.selectedValue;

            select.onchange = () => {
                if (busy()) return;

                state.selectedValue = select.value;
                state.textVisible = false;
                renderAll();
            };

            choices.append(select);

            const getText = () => {
                const major = majorsData.find(major =>
                    major.word === state.selectedValue
                );

                return major
                    ? statement(
                        subject(),
                        word(major.word, major.kanji)
                    )
                    : "";
            };

            const answer = recordingRow(
                current,
                "a",
                choices,
                `${key}_a`,
                getText,
                Boolean(state.selectedValue)
            );

            textToggle(answer, getText, {
                get textVisible() {
                    return state.textVisible;
                },
                set textVisible(value) {
                    state.textVisible = value;
                },
                ready: Boolean(state.selectedValue)
            });
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
            ["hover", "💬Hover"],
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
            "drill2Container"
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

        practice2State.views = {};

        installSettings();
        renderSections();
        alignColumns();
        practice2SyncRecordingUI();
    };
})();

// ============================================================================
// Practice 1.2: Result conversion, matching and recording
// ============================================================================

function practice2ToHiragana(text) {
    let value = String(text ?? "").normalize("NFKC");

    // 元の専攻用辞書を含む変換処理を維持する。
    value = convertToHiragana(value);

    // このページの問題データに登録された語句を追加変換する。
    const pairs = [
        ...practice2Data.flatMap(item => [
            [item.xKanji, item.x],
            [item.yKanji, item.y]
        ]),
        ...drill2Targets.flatMap(item => [
            [item.possessiveKanji, item.possessive],
            [item.labelKanji, item.label]
        ]),
        ...majorsData.map(item => [item.kanji, item.word]),
        ["専攻", "せんこう"],
        ["何", "なに"]
    ].sort((a, b) => b[0].length - a[0].length);

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
        .replace(/(?:よね|よ|ね)$/, "");
}

// 読み上げ専用。表示・判定用の文は変更しない。
function practice2SpeechText(text) {
    let value = String(text ?? "").trim();
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
        : String(saved.rawTranscript ?? "").replace(
            /千校|千項|先行|選考|線香|閃光|潜行|せんこう/g,
            "専攻"
        );

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

        const index = practice2State.generatedKeyIndex++;
        const targetIndex = Math.floor(index / 2);
        const part = index % 2 === 0 ? "q" : "a";
        const target = drill2Targets[targetIndex];

        rowKey =
            `p2_drill2_${target?.label || targetIndex}_${part}`;
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
                "Microphone access denied."
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
