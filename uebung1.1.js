// Deutsche Übung 1.1: nach / in / zum / zur
// Follows October2026 site standards, architecture, and DrillAudio session management.

// -------------------------------------------------------------
// 1. Data Model
// -------------------------------------------------------------
const drillsData = [
    {
        id: "drill1",
        number: 1,
        title: "Drill 1: nach — Cities & Countries",
        instruction: "💡Use nach with cities and countries that have no grammatical article.",
        learningFocus: "Cities & Countries",
        example: {
            cue: "Salzburg / fahren",
            cueParts: ["Salzburg", "fahren"],
            hints: ["Salzburg (city in Austria)", "to travel / drive"],
            model: "Ich fahre nach Salzburg."
        },
        items: [
            {
                id: "d1_1",
                cue: "Graz / fahren",
                cueParts: ["Graz", "fahren"],
                hints: ["Graz (city in Austria)", "to travel / drive"],
                model: "Ich fahre nach Graz."
            },
            {
                id: "d1_2",
                cue: "Italien / reisen",
                cueParts: ["Italien", "reisen"],
                hints: ["Italy", "to travel"],
                model: "Ich reise nach Italien."
            },
            {
                id: "d1_3",
                cue: "Berlin / fahren",
                cueParts: ["Berlin", "fahren"],
                hints: ["Berlin (city in Germany)", "to travel / drive"],
                model: "Ich fahre nach Berlin."
            }
        ]
    },
    {
        id: "drill2",
        number: 2,
        title: "Drill 2: in — Countries with Articles (Akkusativ)",
        instruction: "💡Use in + Akkusativ for destinations with feminine, plural, or masculine country names.",
        learningFocus: "Countries with Articles",
        example: {
            cue: "die Schweiz / fahren",
            cueParts: ["die Schweiz", "fahren"],
            hints: ["Switzerland (fem.)", "to travel / drive"],
            model: "Ich fahre in die Schweiz."
        },
        items: [
            {
                id: "d2_1",
                cue: "die Türkei / fliegen",
                cueParts: ["die Türkei", "fliegen"],
                hints: ["Turkey (fem.)", "to fly"],
                model: "Ich fliege in die Türkei."
            },
            {
                id: "d2_2",
                cue: "die USA / reisen",
                cueParts: ["die USA", "reisen"],
                hints: ["USA (pl.)", "to travel"],
                model: "Ich reise in die USA."
            },
            {
                id: "d2_3",
                cue: "der Irak / fliegen",
                cueParts: ["der Irak", "fliegen"],
                hints: ["Iraq (masc.)", "to fly"],
                model: "Ich fliege in den Irak."
            }
        ]
    },
    {
        id: "drill3",
        number: 3,
        title: "Drill 3: zum — Masculine & Neuter Destinations",
        instruction: "💡Use zum (zu + dem) for masculine and neuter destinations.",
        learningFocus: "Masculine & Neuter Destinations",
        example: {
            cue: "der Supermarkt / gehen",
            cueParts: ["der Supermarkt", "gehen"],
            hints: ["supermarket (masc.)", "to go / walk"],
            model: "Ich gehe zum Supermarkt."
        },
        items: [
            {
                id: "d3_1",
                cue: "der Arzt / gehen",
                cueParts: ["der Arzt", "gehen"],
                hints: ["doctor (masc.)", "to go"],
                model: "Ich gehe zum Arzt."
            },
            {
                id: "d3_2",
                cue: "das Krankenhaus / fahren",
                cueParts: ["das Krankenhaus", "fahren"],
                hints: ["hospital (neut.)", "to drive / travel"],
                model: "Ich fahre zum Krankenhaus."
            },
            {
                id: "d3_3",
                cue: "der Bahnhof / gehen",
                cueParts: ["der Bahnhof", "gehen"],
                hints: ["train station (masc.)", "to go"],
                model: "Ich gehe zum Bahnhof."
            }
        ]
    },
    {
        id: "drill4",
        number: 4,
        title: "Drill 4: zur — Feminine Destinations",
        instruction: "💡Use zur (zu + der) for feminine destinations.",
        learningFocus: "Feminine Destinations",
        example: {
            cue: "die Post / gehen",
            cueParts: ["die Post", "gehen"],
            hints: ["post office (fem.)", "to go"],
            model: "Ich gehe zur Post."
        },
        items: [
            {
                id: "d4_1",
                cue: "die Bank / gehen",
                cueParts: ["die Bank", "gehen"],
                hints: ["bank (fem.)", "to go"],
                model: "Ich gehe zur Bank."
            },
            {
                id: "d4_2",
                cue: "die Apotheke / gehen",
                cueParts: ["die Apotheke", "gehen"],
                hints: ["pharmacy (fem.)", "to go"],
                model: "Ich gehe zur Apotheke."
            },
            {
                id: "d4_3",
                cue: "die Schule / gehen",
                cueParts: ["die Schule", "gehen"],
                hints: ["school (fem.)", "to go"],
                regionalModels: {
                    DE: "Ich gehe zur Schule.",
                    AT: "Ich gehe in die Schule.",
                    CH: "Ich gehe zur Schule."
                },
                allowedAnswers: [
                    "Ich gehe zur Schule.",
                    "Ich gehe in die Schule."
                ]
            }
        ]
    }
];

// -------------------------------------------------------------
// German Motion Grammar Engine & Variety Evaluation (3-State)
// -------------------------------------------------------------
const GERMAN_VERBS = {
    fahren: {
        präsens: {
            "ich": ["fahre"],
            "du": ["fährst"],
            "er": ["fährt"],
            "sie": ["fährt", "fahren"],
            "es": ["fährt"],
            "man": ["fährt"],
            "wir": ["fahren"],
            "ihr": ["fahrt"],
            "Sie": ["fahren"]
        },
        präteritum: {
            "ich": ["fuhr"],
            "du": ["fuhrst"],
            "er": ["fuhr"],
            "sie": ["fuhr", "fuhren"],
            "es": ["fuhr"],
            "man": ["fuhr"],
            "wir": ["fuhren"],
            "ihr": ["fuhrt"],
            "Sie": ["fuhren"]
        },
        partizip: "gefahren"
    },
    reisen: {
        präsens: {
            "ich": ["reise"],
            "du": ["reist"],
            "er": ["reist"],
            "sie": ["reist", "reisen"],
            "es": ["reist"],
            "man": ["reist"],
            "wir": ["reisen"],
            "ihr": ["reist"],
            "Sie": ["reisen"]
        },
        präteritum: {
            "ich": ["reiste"],
            "du": ["reistest"],
            "er": ["reiste"],
            "sie": ["reiste", "reisten"],
            "es": ["reiste"],
            "man": ["reiste"],
            "wir": ["reisten"],
            "ihr": ["reistet"],
            "Sie": ["reisten"]
        },
        partizip: "gereist"
    },
    fliegen: {
        präsens: {
            "ich": ["fliege"],
            "du": ["fliegst"],
            "er": ["fliegt"],
            "sie": ["fliegt", "fliegen"],
            "es": ["fliegt"],
            "man": ["fliegt"],
            "wir": ["fliegen"],
            "ihr": ["fliegt"],
            "Sie": ["fliegen"]
        },
        präteritum: {
            "ich": ["flog"],
            "du": ["flogst"],
            "er": ["flog"],
            "sie": ["flog", "flogen"],
            "es": ["flog"],
            "man": ["flog"],
            "wir": ["flogen"],
            "ihr": ["flogt"],
            "Sie": ["flogen"]
        },
        partizip: "geflogen"
    },
    gehen: {
        präsens: {
            "ich": ["gehe"],
            "du": ["gehst"],
            "er": ["geht"],
            "sie": ["geht", "gehen"],
            "es": ["geht"],
            "man": ["geht"],
            "wir": ["gehen"],
            "ihr": ["geht"],
            "Sie": ["gehen"]
        },
        präteritum: {
            "ich": ["ging"],
            "du": ["gingst"],
            "er": ["ging"],
            "sie": ["ging", "gingen"],
            "es": ["ging"],
            "man": ["ging"],
            "wir": ["gingen"],
            "ihr": ["gingt"],
            "Sie": ["gingen"]
        },
        partizip: "gegangen"
    }
};

const SEIN_FORMS = {
    "ich": ["bin"],
    "du": ["bist"],
    "er": ["ist"],
    "sie": ["ist", "sind"],
    "es": ["ist"],
    "man": ["ist"],
    "wir": ["sind"],
    "ihr": ["seid"],
    "Sie": ["sind"]
};

const ALL_SEIN = new Set(["bin", "bist", "ist", "sind", "seid", "war", "warst", "waren", "wart"]);
const KNOWN_SUBJECTS = new Set(["ich", "du", "er", "sie", "es", "man", "wir", "ihr"]);

function normalizeGerman(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'„“…]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getModel(item, variety = (typeof currentVariety !== "undefined" ? currentVariety : "DE")) {
    if (item.regionalModels) {
        return item.regionalModels[variety] || item.regionalModels.DE;
    }
    return item.model;
}

function getAllowed(item, variety = (typeof currentVariety !== "undefined" ? currentVariety : "DE")) {
    if (item.allowedAnswers) {
        return item.allowedAnswers;
    }
    return [getModel(item, variety)];
}

function getItemGrammarSpec(item) {
    const cueVerb = item.cueParts && item.cueParts[1] ? item.cueParts[1].toLowerCase().trim() : "";
    const cuePlace = item.cueParts && item.cueParts[0] ? item.cueParts[0] : "";

    const models = [item.model];
    if (item.allowedAnswers) models.push(...item.allowedAnswers);
    if (item.regionalModels) models.push(...Object.values(item.regionalModels));

    const validPrepPhrases = [];
    const targetPreps = new Set();

    models.forEach(m => {
        if (!m) return;
        const norm = normalizeGerman(m);
        const words = norm.split(" ");
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            if (w === "nach" || w === "zum" || w === "zur") {
                validPrepPhrases.push(words.slice(i).join(" "));
                targetPreps.add(w);
                break;
            } else if (w === "in" && i + 1 < words.length && ["die", "den", "dem", "das"].includes(words[i + 1])) {
                validPrepPhrases.push(words.slice(i).join(" "));
                targetPreps.add(`in ${words[i + 1]}`);
                break;
            }
        }
    });

    const normCuePlace = normalizeGerman(cuePlace);
    const placeNoun = normCuePlace.split(" ").pop() || "";

    return {
        cueVerb,
        validPrepPhrases: Array.from(new Set(validPrepPhrases)),
        targetPreps: Array.from(targetPreps),
        targetPlace: placeNoun
    };
}

function evaluateGermanAnswer(raw, item, variety = "DE") {
    const normRaw = normalizeGerman(raw);
    if (!normRaw) {
        return { judgment: "undetermined", redPart: null, supplement: null, reason: "empty" };
    }

    const recModel = getModel(item, variety);
    const normRec = normalizeGerman(recModel);

    // Exact model match
    if (normRaw === normRec) {
        return { judgment: "accepted", redPart: null, supplement: null, reason: "exact_model" };
    }

    // Allowed answers check (e.g. regional differences like zur Schule / in die Schule)
    const allowed = getAllowed(item, variety);
    if (allowed.some(ans => normalizeGerman(ans) === normRaw)) {
        const flag = variety === "AT" ? "🇦🇹 " : (variety === "CH" ? "🇨🇭 " : "🇩🇪 ");
        return { judgment: "accepted", redPart: null, supplement: flag + recModel, reason: "allowed_answer" };
    }

    const words = normRaw.split(" ");
    if (words.length < 3) {
        return { judgment: "undetermined", redPart: null, supplement: null, reason: "incomplete_speech" };
    }

    // Complex / unsupported structures (modals, conjunctions) -> undetermined
    const unsupportedMarkers = new Set(["möchte", "will", "kann", "muss", "soll", "darf", "weil", "dass", "wenn", "ob", "obwohl"]);
    if (words.some(w => unsupportedMarkers.has(w))) {
        return { judgment: "undetermined", redPart: null, supplement: null, reason: "complex_structure" };
    }

    const spec = getItemGrammarSpec(item);
    const cueVerb = spec.cueVerb;
    const targetPreps = spec.targetPreps;
    const targetPlace = spec.targetPlace;
    const validPrepPhrases = spec.validPrepPhrases;

    // Check subject pronoun
    let subj = null;
    let subjPos = -1;
    for (let i = 0; i < words.length; i++) {
        if (KNOWN_SUBJECTS.has(words[i])) {
            subj = words[i];
            subjPos = i;
            break;
        }
    }

    if (!subj) {
        return { judgment: "undetermined", redPart: null, supplement: null, reason: "unknown_subject" };
    }

    // Determine finite verb position based on subject position
    let finiteVerb = null;
    if (subjPos === 0) {
        finiteVerb = words[1];
    } else if (subjPos === 3) {
        // e.g. Nach Graz fahre ich.
        finiteVerb = words[2];
    } else if (subjPos === 4) {
        // e.g. In die Türkei fliegen wir.
        finiteVerb = words[3];
    }

    // Preposition and place extracted from learner words
    let prepWord = null;
    let placeWord = null;
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w === "nach" || w === "zum" || w === "zur" || w === "zu") {
            prepWord = w;
            if (i + 1 < words.length) placeWord = words[i + 1];
            break;
        } else if (w === "in" && i + 2 < words.length && ["die", "den", "dem", "das"].includes(words[i + 1])) {
            prepWord = `in ${words[i + 1]}`;
            placeWord = words[i + 2];
            break;
        } else if (w === "in" && i + 1 < words.length) {
            prepWord = "in";
            placeWord = words[i + 1];
            break;
        }
    }

    // Check if another motion verb root was erroneously used
    for (const [otherVerb, otherInfo] of Object.entries(GERMAN_VERBS)) {
        if (otherVerb !== cueVerb) {
            const allForms = [];
            Object.values(otherInfo.präsens).forEach(forms => allForms.push(...forms));
            Object.values(otherInfo.präteritum).forEach(forms => allForms.push(...forms));
            allForms.push(otherInfo.partizip);
            for (const f of allForms) {
                if (words.includes(f)) {
                    return { judgment: "mismatch", redPart: f, supplement: null, reason: "wrong_verb_root" };
                }
            }
        }
    }

    const verbInfo = GERMAN_VERBS[cueVerb];
    const isPerfekt = words.some(w => ALL_SEIN.has(w));
    let participle = null;
    for (const vInfo of Object.values(GERMAN_VERBS)) {
        if (words.includes(vInfo.partizip)) {
            participle = vInfo.partizip;
            break;
        }
    }

    if (verbInfo) {
        if (isPerfekt) {
            const expectedAux = SEIN_FORMS[subj] || [];
            let auxFound = null;
            for (const w of words) {
                if (ALL_SEIN.has(w)) {
                    auxFound = w;
                    break;
                }
            }
            if (auxFound && !expectedAux.includes(auxFound)) {
                return { judgment: "mismatch", redPart: auxFound, supplement: null, reason: "aux_agreement_mismatch" };
            }
            if (participle !== verbInfo.partizip) {
                if (participle) {
                    return { judgment: "mismatch", redPart: participle, supplement: null, reason: "wrong_participle" };
                } else {
                    return { judgment: "undetermined", redPart: null, supplement: null, reason: "missing_participle" };
                }
            }
        } else if (finiteVerb) {
            const expectedPraesens = verbInfo.präsens[subj] || [];
            const expectedPraet = verbInfo.präteritum[subj] || [];
            const expectedForms = [...expectedPraesens, ...expectedPraet];

            const allCueForms = [];
            Object.values(verbInfo.präsens).forEach(forms => allCueForms.push(...forms));
            Object.values(verbInfo.präteritum).forEach(forms => allCueForms.push(...forms));
            allCueForms.push(cueVerb);

            if (allCueForms.includes(finiteVerb) && !expectedForms.includes(finiteVerb)) {
                return { judgment: "mismatch", redPart: finiteVerb, supplement: null, reason: "agreement_mismatch" };
            } else if (!expectedForms.includes(finiteVerb)) {
                return { judgment: "undetermined", redPart: null, supplement: null, reason: "unrecognized_finite_verb" };
            }
        }
    }

    // Check wrong preposition
    if (prepWord && targetPreps.length > 0 && !targetPreps.includes(prepWord)) {
        return { judgment: "mismatch", redPart: prepWord, supplement: null, reason: "wrong_preposition" };
    }

    // Check wrong destination place
    if (placeWord && targetPlace && placeWord !== targetPlace) {
        return { judgment: "mismatch", redPart: placeWord, supplement: null, reason: "wrong_place" };
    }

    // Valid preposition phrase match
    const hasValidPrepPhrase = validPrepPhrases.some(pp => normRaw.includes(pp));
    if (hasValidPrepPhrase) {
        return { judgment: "accepted", redPart: null, supplement: null, reason: "valid_motion_sentence" };
    }

    return { judgment: "undetermined", redPart: null, supplement: null, reason: "fallback_undetermined" };
}

function initGermanDrill() {

    // -------------------------------------------------------------
    // 2. Global State
    // -------------------------------------------------------------
    let currentVariety = "DE"; // 'DE', 'AT', 'CH'
    let hintMode = "hover"; // 'off', 'hover', 'paren'
    let manual = false; // true = manual stop, false = autostop ON
    let autoplay = true; // true = relay model + user voice

    let session = null;
    let preparing = false;
    let activeAudio = null;
    let playingButton = null;
    let currentUtterance = null;

    const saved = new Map(); // key -> { url, raw, correct, modelText, supplement, variety }
    const views = new Map(); // key -> { item, rec, listen, stop, result, correction }

    const VOICE_STORAGE_KEY = "october2026.german.selectedVoiceName";
    let preferredVoiceName = localStorage.getItem(VOICE_STORAGE_KEY) || null;

    let drill1FirstStopTipBox = null;
    function updateFirstStopTip() {
        if (!drill1FirstStopTipBox) return;
        drill1FirstStopTipBox.textContent = manual
            ? "Stop recording."
            : "No need to press. Autostop is ON.";
    }

    // -------------------------------------------------------------
    // 3. Helper Functions
    // -------------------------------------------------------------
    function node(tag, className = "", content = "") {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (typeof content === "string") {
            if (content) el.textContent = content;
        } else if (content instanceof Node) {
            el.append(content);
        }
        return el;
    }

    function button(label, tip, click) {
        const hasTip = Boolean(tip);
        const b = node("button", "example-button" + (hasTip ? " custom-tip-wrap" : ""));
        b.type = "button";
        if (typeof label === "string") {
            b.append(document.createTextNode(label));
        } else if (label instanceof Node) {
            b.append(label);
        }
        if (hasTip) {
            b.append(node("span", "custom-tip-box", tip));
        }
        b.onclick = () => {
            if (DrillAudio.leaving) return;
            click?.();
        };
        return b;
    }

    function highlightRedPart(rawText, redPart) {
        if (!redPart) return [document.createTextNode(rawText)];
        const escaped = redPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rx = new RegExp(`(^|\\s|[.,!?;:])(${escaped})($|\\s|[.,!?;:])`, "i");
        const match = rx.exec(rawText);
        if (match) {
            const prefix = match[1];
            const matchStart = match.index + prefix.length;
            const matchStr = rawText.slice(matchStart, matchStart + redPart.length);
            const before = rawText.slice(0, matchStart);
            const after = rawText.slice(matchStart + redPart.length);
            const nodes = [];
            if (before) nodes.push(document.createTextNode(before));
            const mark = node("span", "result-incorrect", matchStr);
            mark.style.color = "var(--semantic-negative-color, #E11D48)";
            mark.style.fontWeight = "700";
            nodes.push(mark);
            if (after) nodes.push(document.createTextNode(after));
            return nodes;
        }
        const idx = rawText.toLowerCase().indexOf(redPart.toLowerCase());
        if (idx !== -1) {
            const before = rawText.slice(0, idx);
            const matchStr = rawText.slice(idx, idx + redPart.length);
            const after = rawText.slice(idx + redPart.length);
            const nodes = [];
            if (before) nodes.push(document.createTextNode(before));
            const mark = node("span", "result-incorrect", matchStr);
            mark.style.color = "var(--semantic-negative-color, #E11D48)";
            mark.style.fontWeight = "700";
            nodes.push(mark);
            if (after) nodes.push(document.createTextNode(after));
            return nodes;
        }
        return [document.createTextNode(rawText)];
    }

    function highlightGrammar(text) {
        return text
            .replace(/\b(nach)\b/g, '<strong class="grammar-highlight">$1</strong>')
            .replace(/\b(in die|in den)\b/g, '<strong class="grammar-highlight">$1</strong>')
            .replace(/\b(zum|zur)\b/g, '<strong class="grammar-highlight">$1</strong>');
    }

    function formatCue(item, isDrill1 = true) {
        if (hintMode === "off") {
            return item.cue;
        }
        if (item.cueParts && item.hints && item.cueParts.length === item.hints.length) {
            const parts = item.cueParts.map((part, idx) => {
                const hint = item.hints[idx];
                if (hintMode === "paren") {
                    return `${part} <span class="vocab-inline">(${hint})</span>`;
                }
                return `<span class="tooltip-wrap"><span class="target-word">${part}</span><span class="tooltip-tip">${hint}</span></span>`;
            });
            return parts.join(" / ");
        }
        return item.cue;
    }

    function sync() {
        const busy = Boolean(session || preparing);
        document.querySelectorAll(
            ".compact-settings button, .compact-settings input, #drillsContainer button:not([data-stop])"
        ).forEach(el => {
            el.disabled = busy;
        });

        views.forEach((v, key) => {
            const canStop = session?.key === key && session.manual && !session.stopping;
            v.stop.disabled = !canStop;
            v.stop.setAttribute("aria-disabled", String(!canStop));
            v.stop.classList.toggle("stop-btn-active", Boolean(canStop));
        });

        updateCopyButtons();
    }

    // -------------------------------------------------------------
    // 4. Audio & Speech Synthesis
    // -------------------------------------------------------------
    function stopPlayback() {
        if (currentUtterance) {
            currentUtterance.onend = null;
            currentUtterance.onerror = null;
            currentUtterance = null;
        }
        if (activeAudio) {
            activeAudio.onended = null;
            activeAudio.onerror = null;
            try {
                activeAudio.pause();
                activeAudio.currentTime = 0;
                activeAudio.src = "";
            } catch (_) {}
            activeAudio = null;
        }
        if (window.speechSynthesis) {
            try {
                window.speechSynthesis.pause();
                window.speechSynthesis.cancel();
            } catch (_) {}
        }
        if (!isNaturalFinish) {
            cancelActivePlaybackToken(true);
        }
        if (playingButton) {
            playingButton.disabled = false;
            if (playingButton._contents) {
                playingButton.replaceChildren(...playingButton._contents);
            }
            playingButton.classList.remove("is-playing");
            playingButton = null;
        }
    }

    function cancelActivePlaybackToken(intentional = true) {
        if (activePlaybackToken) {
            if (intentional) {
                activePlaybackToken.userCancelled = true;
            }
            if (activePlaybackToken.startTimeoutTimer) {
                clearTimeout(activePlaybackToken.startTimeoutTimer);
                activePlaybackToken.startTimeoutTimer = null;
            }
            activePlaybackToken = null;
        }
    }

    function stopAllPlayback() {
        cancelActivePlaybackToken(true);
        DrillAudio.invalidatePlayback();
        stopPlayback();
    }

    function markPlaying(b) {
        if (!b) return;
        stopPlayback();
        playingButton = b;
        b._contents = Array.from(b.childNodes);
        b.disabled = true;
        b.classList.add("is-playing");
        b.textContent = "Playing...";
    }

    // -------------------------------------------------------------
    // German TTS Notice Banner Controller
    // -------------------------------------------------------------
    let currentNoticeKind = null; // 'startup' | 'playback' | null

    function showGermanTtsNotice({ type = "warning", title, message, isStartup = false }) {
        const banner = document.getElementById("germanTtsNotice");
        if (!banner) return;

        const titleEl = banner.querySelector(".german-tts-notice-title");
        const msgEl = banner.querySelector(".german-tts-notice-message");

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;

        banner.classList.toggle("is-error", type === "error");
        banner.setAttribute("role", type === "error" ? "alert" : "status");
        banner.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

        currentNoticeKind = isStartup ? "startup" : "playback";
        banner.hidden = false;
    }

    function hideGermanTtsNotice(force = false) {
        const banner = document.getElementById("germanTtsNotice");
        if (!banner) return;
        banner.hidden = true;
        currentNoticeKind = null;
    }

    function setupGermanTtsNoticeEvents() {
        const closeBtn = document.getElementById("germanTtsNoticeClose");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                hideGermanTtsNotice(true);
            });
        }
    }

    // -------------------------------------------------------------
    // German TTS Startup Diagnostics
    // -------------------------------------------------------------
    let ttsStartupStatus = "unknown"; // 'available' | 'unavailable' | 'unknown' | 'unsupported'
    let startupDiagnosticsTimer = null;

    function diagnoseTtsStartup(isDelayedCheck = false) {
        if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
            ttsStartupStatus = "unsupported";
            showGermanTtsNotice({
                type: "error",
                title: "German audio is not supported",
                message: "Your browser does not support speech synthesis. Please try a compatible browser.",
                isStartup: true
            });
            return ttsStartupStatus;
        }

        const germanVoices = getGermanVoices();
        if (germanVoices.length > 0) {
            ttsStartupStatus = "available";
            if (currentNoticeKind === "startup") {
                hideGermanTtsNotice();
            }
            if (startupDiagnosticsTimer) {
                clearTimeout(startupDiagnosticsTimer);
                startupDiagnosticsTimer = null;
            }
            return ttsStartupStatus;
        }

        // Check if voices array has loaded at all
        const allVoices = window.speechSynthesis.getVoices?.() || [];
        if (allVoices.length === 0 && !isDelayedCheck) {
            // Voices still loading asynchronously (common in Chromium/Chrome OS)
            ttsStartupStatus = "unknown";
            if (!startupDiagnosticsTimer) {
                startupDiagnosticsTimer = setTimeout(() => {
                    startupDiagnosticsTimer = null;
                    diagnoseTtsStartup(true);
                }, 1000);
            }
            return ttsStartupStatus;
        }

        // Either voices loaded and 0 are German, or delayed timeout elapsed with no German voices
        ttsStartupStatus = "unavailable";
        showGermanTtsNotice({
            type: "warning",
            title: "German voice not detected",
            message: "Your browser could not find a German voice. Model audio may not work on this device. Please check your browser or system speech settings.",
            isStartup: true
        });
        return ttsStartupStatus;
    }

    function normalizeLang(lang) {
        return (lang || "").toLowerCase().replace(/_/g, "-");
    }

    function targetLocaleForVariety(variety) {
        return variety === "AT" ? "de-AT" : (variety === "CH" ? "de-CH" : "de-DE");
    }

    function getGermanVoices() {
        if (!window.speechSynthesis) return [];
        return window.speechSynthesis.getVoices().filter(v =>
            normalizeLang(v.lang).startsWith("de")
        );
    }

    function selectVoiceForVariety(variety) {
        const voices = getGermanVoices();
        if (!voices.length) return null;

        if (preferredVoiceName) {
            const found = voices.find(v => v.name === preferredVoiceName);
            if (found) return found;
        }

        const targetLocale = normalizeLang(targetLocaleForVariety(variety));
        const localeMatch = voices.find(v => normalizeLang(v.lang) === targetLocale);
        if (localeMatch) return localeMatch;

        const startsMatch = voices.find(v => normalizeLang(v.lang).startsWith(targetLocale));
        if (startsMatch) return startsMatch;

        const deMatch = voices.find(v => normalizeLang(v.lang).startsWith("de-de"));
        if (deMatch) return deMatch;

        return voices[0];
    }

    function updateVoiceSelector() {
        const select = document.getElementById("voiceSelect");
        const notice = document.getElementById("voiceRegionNotice");
        if (!select) return;

        const voices = getGermanVoices();
        select.replaceChildren();

        if (!voices.length) {
            const opt = node("option", "", "No German Voice Detected");
            opt.value = "";
            select.append(opt);
        } else {
            voices.forEach(v => {
                const opt = node("option", "", `${v.name} (${v.lang})`);
                opt.value = v.name;
                select.append(opt);
            });
        }

        const chosen = selectVoiceForVariety(currentVariety);
        if (chosen) {
            select.value = chosen.name;
        }

        const targetLocale = normalizeLang(targetLocaleForVariety(currentVariety));
        const hasDirectLocale = voices.some(v => normalizeLang(v.lang) === targetLocale);

        if (notice) {
            if (!voices.length) {
                notice.textContent = "⚠️ No German speech synthesis voice detected on this device. (Please verify your system TTS settings).";
                notice.hidden = false;
            } else if (!hasDirectLocale) {
                const label = currentVariety === "AT" ? "de-AT (Austria)" : (currentVariety === "CH" ? "de-CH (Switzerland)" : "de-DE (Germany)");
                notice.textContent = `⚠️ No native ${label} voice detected on this device. Using ${chosen ? chosen.name : "system voice"} with ${targetLocaleForVariety(currentVariety)} tag.`;
                notice.hidden = false;
            } else {
                notice.hidden = true;
            }
        }
    }

    // Active playback token tracking
    let activePlaybackToken = null;
    let playbackTokenSeq = 0;

    function speakModel(text, btn = null, onDone = null, isRelay = false) {
        if ((session || preparing) && !isRelay) return;
        if (!isRelay) {
            cancelActivePlaybackToken(true);
            stopAllPlayback();
        }

        if (!("speechSynthesis" in window)) {
            showGermanTtsNotice({
                type: "error",
                title: "German audio is not supported",
                message: "Your browser does not support speech synthesis. Please try a compatible browser.",
                isStartup: false
            });
            onDone?.();
            return;
        }

        // Resume if stalled/paused by browser bug
        if (window.speechSynthesis.paused) {
            try { window.speechSynthesis.resume(); } catch (_) {}
        }

        const u = new SpeechSynthesisUtterance(text);
        const locale = targetLocaleForVariety(currentVariety);
        u.lang = locale;
        u.rate = 0.85;

        const voice = selectVoiceForVariety(currentVariety);
        if (voice) {
            u.voice = voice;
        }

        const token = {
            id: ++playbackTokenSeq,
            text,
            btn,
            started: false,
            ended: false,
            userCancelled: false,
            startTimeoutTimer: null,
            startTime: 0,
            requestTime: performance.now(),
            handled: false
        };
        activePlaybackToken = token;
        currentUtterance = u;

        if (btn) markPlaying(btn);

        const handlePlaybackError = (errorEvent) => {
            if (token.startTimeoutTimer) {
                clearTimeout(token.startTimeoutTimer);
                token.startTimeoutTimer = null;
            }
            if (token.userCancelled || activePlaybackToken !== token) {
                return;
            }
            const errCode = errorEvent?.error;
            if (errCode === "canceled" || errCode === "interrupted") {
                if (token.userCancelled) return;
            }

            const errorDetail = errCode ? ` (${errCode})` : "";
            showGermanTtsNotice({
                type: "error",
                title: "German audio could not be played",
                message: `The speech service reported an error${errorDetail}. Try another German voice, check your speech settings, or reload the page.`,
                isStartup: false
            });
        };

        const handlePlaybackStart = () => {
            if (token.userCancelled || activePlaybackToken !== token) return;
            token.started = true;
            token.startTime = performance.now();
            if (token.startTimeoutTimer) {
                clearTimeout(token.startTimeoutTimer);
                token.startTimeoutTimer = null;
            }
        };

        const handlePlaybackEnd = () => {
            if (token.startTimeoutTimer) {
                clearTimeout(token.startTimeoutTimer);
                token.startTimeoutTimer = null;
            }
            if (token.userCancelled || activePlaybackToken !== token) return;
            token.ended = true;

            const duration = performance.now() - (token.startTime || token.requestTime);
            // B3. Short duration end check:
            // Do not treat unconditionally as error. Only warn if substantial text (>= 10 chars)
            // finishes suspiciously fast (< 150ms).
            if (text.trim().length >= 10 && duration < 150) {
                showGermanTtsNotice({
                    type: "warning",
                    title: "Can't hear the audio?",
                    message: "Check your device volume, mute settings, and audio output. You can also try another German voice.",
                    isStartup: false
                });
            } else {
                // Normal playback succeeded! Clear any stale playback failure notice.
                if (currentNoticeKind === "playback") {
                    hideGermanTtsNotice();
                }
            }
        };

        // B2. Start timeout watchdog (5000ms)
        token.startTimeoutTimer = setTimeout(() => {
            if (activePlaybackToken === token && !token.started && !token.userCancelled) {
                token.userCancelled = true;
                if (!isRelay) stopPlayback(true);
                showGermanTtsNotice({
                    type: "error",
                    title: "German audio did not start",
                    message: "The speech service did not respond in time. Please try again or reload the page.",
                    isStartup: false
                });
            }
        }, 5000);

        // Attach listeners directly to u to guarantee event arrival regardless of guardUtterance
        if (typeof u.addEventListener === "function") {
            u.addEventListener("start", handlePlaybackStart);
            u.addEventListener("error", handlePlaybackError);
            u.addEventListener("end", handlePlaybackEnd);
        }

        const finish = (errorEvent = null) => {
            if (token.startTimeoutTimer) {
                clearTimeout(token.startTimeoutTimer);
                token.startTimeoutTimer = null;
            }
            if (token.handled) return;
            token.handled = true;

            if (currentUtterance !== u) return;
            currentUtterance = null;
            if (activePlaybackToken === token) {
                activePlaybackToken = null;
            }

            if (isRelay) {
                // Relay owns restoring buttons
            } else {
                stopPlayback(true);
            }

            if (errorEvent) {
                handlePlaybackError(errorEvent);
            }

            onDone?.();
        };

        // Attach callbacks BEFORE DrillAudio.speak so guardUtterance can wrap them
        u.onend = () => finish();
        u.onerror = (e) => finish(e);

        try {
            DrillAudio.speak(u);
        } catch (err) {
            console.error("DrillAudio.speak execution error:", err);
            handlePlaybackError(err);
            finish(err);
        }
    }

    function playRecording(key, btn) {
        if (session || preparing) return;
        stopAllPlayback();

        const entry = saved.get(key);
        if (!entry?.url) return;

        const audio = new Audio(entry.url);
        activeAudio = audio;
        if (btn) markPlaying(btn);

        const cleanup = () => {
            stopPlayback();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        DrillAudio.play(audio, cleanup);
    }

    // -------------------------------------------------------------
    // 5. Recording & STT Evaluation
    // -------------------------------------------------------------
    async function record(key, item) {
        if (session || preparing) return;

        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition || !window.MediaRecorder) {
            showResult(key, "Speech recognition or recording is not supported in this browser.");
            return;
        }

        stopAllPlayback();
        preparing = true;
        sync();

        const v = views.get(key);
        if (v) v.result.textContent = "Preparing microphone...";

        let stream;
        try {
            stream = await DrillAudio.getUserMedia({ audio: true });
        } catch (e) {
            preparing = false;
            sync();
            if (e.name === "AbortError") return;
            showResult(key, DrillAudio.microphoneError(e));
            return;
        }

        preparing = false;

        const s = {
            key,
            manual,
            stopping: false,
            finished: false,
            heard: false,
            raw: "",
            interim: "",
            chunks: [],
            timers: [],
            recognitionDone: false,
            recorderDone: false,
            discard: false,
            notice: ""
        };
        session = s;

        const clear = () => {
            s.timers.forEach(id => {
                clearTimeout(id);
                clearInterval(id);
            });
            s.timers = [];
        };

        const finish = () => {
            if (s.finished || !s.recognitionDone || !s.recorderDone) return;
            s.finished = true;
            clear();

            stream.getTracks().forEach(t => t.stop());

            if (s.recognition) {
                s.recognition.onend = null;
                s.recognition.onresult = null;
                s.recognition.onerror = null;
                try { s.recognition.abort(); } catch (_) {}
            }

            session = null;

            if (s.interim?.trim()) {
                s.raw += s.interim;
            }

            const raw = s.raw.trim();
            const recModel = getModel(item, currentVariety);
            const evalResult = evaluateGermanAnswer(raw, item, currentVariety);
            const isCorrect = evalResult.judgment === "accepted";
            const supplement = evalResult.supplement;

            const previous = saved.get(key) || {};
            let url = previous.url;

            if (!s.discard && s.heard && s.chunks.length) {
                url = URL.createObjectURL(
                    new Blob(s.chunks, { type: s.recorder.mimeType || "audio/webm" })
                );
                if (previous.url) {
                    URL.revokeObjectURL(previous.url);
                }
            }

            if (!s.discard && raw) {
                saved.set(key, {
                    url,
                    raw: s.raw,
                    correct: isCorrect,
                    judgment: evalResult.judgment,
                    redPart: evalResult.redPart,
                    modelText: recModel,
                    supplement,
                    variety: currentVariety
                });
            }

            s.chunks = [];

            showResult(key, s.notice || (!raw ? "No speech recognized." : ""));
            sync();

            if (autoplay && !s.discard && raw) {
                const currentView = views.get(key);
                DrillAudio.playRelay({
                    recordButton: currentView.rec,
                    result: currentView.result,
                    speak: done => speakModel(recModel, null, done, true),
                    url: () => saved.get(key)?.url
                });
            }
        };

        s.stop = (notice = "", discard = false) => {
            if (s.stopping || s.finished) return;
            s.stopping = true;
            s.notice = notice;
            s.discard = discard || !s.heard;

            clear();
            sync();

            try {
                s.recognition.stop();
            } catch (_) {
                s.recognitionDone = true;
            }

            if (!s.recorder || s.recorder.state === "inactive") {
                s.recorderDone = true;
            } else {
                try {
                    s.recorder.stop();
                } catch (_) {
                    s.recorderDone = true;
                    s.discard = true;
                }
            }

            s.timers.push(setTimeout(() => {
                s.recognitionDone = true;
                s.recorderDone = true;
                finish();
            }, 500));
        };

        // Initialize SpeechRecognition
        try {
            s.recognition = new Recognition();
            s.recognition.lang = targetLocaleForVariety(currentVariety);
            s.recognition.interimResults = true;
            s.recognition.maxAlternatives = 1;

            s.recognition.onresult = event => {
                let finalStr = "";
                let interimStr = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const trans = event.results[i][0].transcript;
                    if (event.results[i].isFinal) finalStr += trans;
                    else interimStr += trans;
                }
                if (finalStr || interimStr) s.heard = true;
                if (finalStr) s.raw += finalStr;
                s.interim = interimStr;

                const display = (s.raw + (s.interim ? ` (${s.interim})` : "")).trim();
                const view = views.get(key);
                if (view && display) {
                    view.result.textContent = display;
                }

                if (!s.manual && s.heard) {
                    clear();
                    s.timers.push(setTimeout(() => {
                        s.stop();
                    }, 2000));
                }
            };

            s.recognition.onerror = () => {
                s.recognitionDone = true;
                finish();
            };

            s.recognition.onend = () => {
                s.recognitionDone = true;
                finish();
            };

            s.recognition.start();
        } catch (_) {
            s.recognitionDone = true;
        }

        // Initialize MediaRecorder
        try {
            s.recorder = new MediaRecorder(stream);
            s.recorder.ondataavailable = e => {
                if (e.data.size > 0) s.chunks.push(e.data);
            };
            s.recorder.onstop = () => {
                s.recorderDone = true;
                finish();
            };
            s.recorder.start();
        } catch (_) {
            s.recorderDone = true;
        }

        // Watchdog timers
        s.timers.push(setTimeout(() => {
            if (!s.heard) s.stop("Recording stopped: no speech detected.", true);
        }, 15000));

        s.timers.push(setTimeout(() => {
            s.stop("Recording stopped: 20-second limit reached.");
        }, 20000));

        sync();
    }

    function showResult(key, notice = "") {
        const v = views.get(key);
        if (!v) return;

        const val = saved.get(key);
        v.result.replaceChildren();
        v.correction.replaceChildren();
        v.correction.hidden = true;

        if (session?.key === key) {
            v.result.textContent = "Recording...";
            return;
        }

        if (val?.raw) {
            const judgment = val.judgment || (val.correct ? "accepted" : "mismatch");

            if (judgment === "accepted") {
                v.result.append(document.createTextNode(val.raw + " ✅ "));
                if (val.supplement) {
                    const supp = node("span", "uebung-supplement-badge", val.supplement);
                    v.result.append(supp);
                }
                v.correction.hidden = true;
            } else if (judgment === "mismatch") {
                if (val.redPart) {
                    const nodes = highlightRedPart(val.raw, val.redPart);
                    v.result.append(...nodes);
                } else {
                    v.result.append(document.createTextNode(val.raw));
                }

                v.correction.hidden = false;
                const corrText = node("span", "", "🔥 Keep going!");
                v.correction.append(corrText);
            } else if (judgment === "undetermined") {
                const footWrap = node("span", "custom-tip-wrap undetermined-footprint", " 👣");
                footWrap.append(node("span", "custom-tip-box", "Could not be evaluated reliably."));
                v.result.append(document.createTextNode(val.raw), footWrap);
                v.correction.hidden = true;
            }
        } else {
            v.result.append(node("span", "result-text not-recorded-yet", "… Not yet"));
        }

        if (val?.url) {
            const play = button("▶️", "Play your recorded voice.", () => {
                playRecording(key, play);
            });
            play.classList.add("play-recording-btn");
            play.style.marginLeft = "8px";
            v.result.append(play);
        }

        if (notice) {
            const note = node("span", "result-notice", ` ${notice}`);
            note.style.color = "var(--text-secondary)";
            v.result.append(note);
        }
    }

    // -------------------------------------------------------------
    // 6. Copy My Sentences
    // -------------------------------------------------------------
    function updateCopyButtons() {
        drillsData.forEach(drill => {
            const area = document.querySelector(`.uebung-copy-area[data-drill="${drill.number}"]`);
            if (!area) return;
            const btn = area.querySelector(".uebung-copy-button");
            if (!btn) return;

            const hasRecordings = drill.items.some(item => {
                const s = saved.get(item.id);
                return Boolean(s?.raw);
            });

            btn.disabled = Boolean(session || preparing || !hasRecordings);
        });
    }

    function setupCopyArea(drill, container) {
        const area = node("div", "uebung-copy-area");
        area.dataset.drill = String(drill.number);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "example-button uebung-copy-button";
        btn.disabled = true;

        btn.innerHTML = window.FluentIcons.markup('clipboard', 20, 'uebung-copy-icon') + '<span>Copy my sentences</span>';

        const help = node("span", "uebung-copy-help", "Copy your drill results to review or share.");
        const status = node("span", "uebung-copy-status", "");
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        status.hidden = true;

        btn.onclick = async () => {
            if (session || preparing) return;
            const entries = [];
            drill.items.forEach((item, idx) => {
                const entry = saved.get(item.id);
                if (entry?.raw) {
                    entries.push(`${idx + 1}. ${item.cue}: ${entry.raw}`);
                }
            });

            if (!entries.length) return;

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const header = `Deutsche Übung 1.1 — Drill ${drill.number}: ${drill.title.replace(/^Drill \d+:\s*/, "")} — ${drill.learningFocus} — ${dateStr}`;
            const fullText = `${header}\n${entries.join("\n")}`;

            try {
                await navigator.clipboard.writeText(fullText);
                status.textContent = "Copied!";
                status.style.color = "var(--semantic-positive-color, #0057E7)";
            } catch (_) {
                status.textContent = "Could not copy. Please allow clipboard access.";
                status.style.color = "var(--semantic-negative-color, #E11D48)";
            }
            status.hidden = false;
        };

        area.append(btn, help, status);
        container.append(area);
    }

    function alignDrillCues() {
        ["drill1", "drill2", "drill3", "drill4"].forEach(drillId => {
            const section = document.getElementById(drillId);
            if (!section) return;
            const cues = section.querySelectorAll(".drill-row .drill-cue-cell");
            let max = 0;
            cues.forEach(cell => {
                const span = cell.querySelector(".cue-content") || cell;
                const copy = span.cloneNode(true);
                copy.querySelectorAll(".tooltip-tip, .custom-tip-box").forEach(t => t.remove());
                Object.assign(copy.style, {
                    position: "absolute",
                    visibility: "hidden",
                    display: "inline-block",
                    width: "max-content",
                    minWidth: "0",
                    maxWidth: "none",
                    whiteSpace: "nowrap",
                    transform: "none"
                });
                cell.append(copy);
                const w = copy.getBoundingClientRect().width;
                copy.remove();
                if (w > max) max = w;
            });
            if (max > 0) {
                section.style.setProperty("--drill-cue-width", `${Math.ceil(max) + 4}px`);
            }
        });
    }

    function alignDrill1Cues() {
        alignDrillCues();
    }

    // -------------------------------------------------------------
    // 7. Render All Drills
    // -------------------------------------------------------------
    function renderAll() {
        const container = document.getElementById("drillsContainer");
        if (!container) return;
        container.replaceChildren();
        views.clear();

        drillsData.forEach(drill => {
            const isDrill1 = drill.number === 1;
            const section = node("section", "drill-section");
            section.id = drill.id;

            // Info Panel
            const panel = node("div", "info-panel info-panel-task1");
            panel.append(
                node("span", "info-panel-title", drill.title),
                node("span", "info-panel-desc instruction-steps", drill.instruction)
            );
            section.append(panel);

            // Example Box
            const exBox = node("div", "example-box example-text-layout");
            const exTable = node("table", "drill-example-table");
            const exBody = node("tbody");
            const exRow = node("tr");

            // Ex cue
            const exCueTd = node("td", "prompt-label drill-cue-cell");
            const exCueSpan = node("span", "cue-content");
            exCueSpan.innerHTML = formatCue(drill.example, true);
            exCueTd.append(exCueSpan);

            // Arrow
            const exArrowTd = node("td", "example-arrow-cell", "👉️");
            exArrowTd.style.width = "28px";
            exArrowTd.style.textAlign = "center";

            // Listen button
            const exAudioTd = node("td", "example-audio-cell");
            const exModelSentence = getModel(drill.example, currentVariety);
            const exListenTip = drill.number === 1 ? "Listen to the example." : "";
            const exListenBtn = button("🔊 Anhören", exListenTip, () => {
                speakModel(getModel(drill.example, currentVariety), exListenBtn);
            });
            exAudioTd.append(exListenBtn);

            // Model text
            const exModelTd = node("td", "example-model-cell");
            const exModelSpan = node("span", "model-text");
            exModelSpan.innerHTML = highlightGrammar(exModelSentence);
            exModelTd.append(exModelSpan);

            exRow.append(exCueTd, exArrowTd, exAudioTd, exModelTd);
            exBody.append(exRow);
            exTable.append(exBody);
            exBox.append(exTable);
            section.append(exBox);

            // Drill Cards
            drill.items.forEach((item, index) => {
                const card = node("div", "drill-row");
                const table = node("table", "recording-table");
                const cols = node("colgroup");
                const colNum = node("col");
                colNum.style.width = "34px";
                cols.append(colNum, node("col"), node("col"));
                table.append(cols);

                const body = node("tbody");
                const tr = node("tr");

                // Number
                const numTd = node("td", "drill-number-cell", `${index + 1}.`);

                // Cue
                const cueTd = node("td", "prompt-label drill-cue-cell");
                const cueSpan = node("span", "cue-content");
                cueSpan.innerHTML = formatCue(item, true);
                cueTd.append(cueSpan);

                // Controls
                const ctrlTd = node("td", "recording-controls-cell");
                const layout = node("div", "recording-controls");
                const actions = node("div", "recording-actions");

                const isFirstItemOfDrill1 = drill.number === 1 && index === 0;

                const listenTip = isFirstItemOfDrill1 ? "Listen to the model answer." : "";
                const listenBtn = button("🔊 Anhören", listenTip, () => {
                    speakModel(getModel(item, currentVariety), listenBtn);
                });

                const recTip = isFirstItemOfDrill1 ? "Record your answer." : "";
                const recBtn = button("⏺️ Aufnehmen", recTip, () => {
                    record(item.id, item);
                });

                let stopTip = "";
                if (isFirstItemOfDrill1) {
                    stopTip = manual ? "Stop recording." : "No need to press. Autostop is ON.";
                }
                const stopBtn = button("⏹️", stopTip, () => {
                    if (session?.key === item.id) session.stop();
                });
                stopBtn.dataset.stop = "true";
                stopBtn.disabled = true;
                if (isFirstItemOfDrill1) {
                    drill1FirstStopTipBox = stopBtn.querySelector(".custom-tip-box");
                }

                actions.append(listenBtn, recBtn, stopBtn);

                const wrap = node("span", "recording-result");
                const result = node("span", "result-text not-recorded-yet", "… Not yet");
                wrap.append(result);
                layout.append(actions, wrap);

                const correction = node("div", "correction-box");
                correction.hidden = true;

                ctrlTd.append(layout, correction);
                tr.append(numTd, cueTd, ctrlTd);
                body.append(tr);
                table.append(body);
                card.append(table);
                section.append(card);

                views.set(item.id, {
                    item,
                    rec: recBtn,
                    listen: listenBtn,
                    stop: stopBtn,
                    result,
                    correction
                });

                showResult(item.id);
            });

            // Copy Area (positioned after the last card, outside the card)
            setupCopyArea(drill, section);

            container.append(section);
        });

        alignDrill1Cues();
        sync();
    }

    // -------------------------------------------------------------
    // 8. Event Listeners & Global Controls
    // -------------------------------------------------------------
    // German Variety Control
    const varietyButtons = document.querySelectorAll("#germanVarietyControl .segmented-option");
    varietyButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (session || preparing) return;
            stopAllPlayback();
            varietyButtons.forEach(b => {
                b.classList.remove("is-selected");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("is-selected");
            btn.setAttribute("aria-pressed", "true");
            currentVariety = btn.dataset.value;

            updateVoiceSelector();
            renderAll();
        });
    });

    // Hint Mode Control
    const hintButtons = document.querySelectorAll("#hintModeControl .segmented-option");
    hintButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (session || preparing) return;
            hintButtons.forEach(b => {
                b.classList.remove("is-selected");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("is-selected");
            btn.setAttribute("aria-pressed", "true");
            hintMode = btn.dataset.value;
            renderAll();
        });
    });

    // Autostop Switch
    const autoRecInput = document.getElementById("toggleRecordMode");
    const autoRecLabel = document.getElementById("labelAutoRecord");
    if (autoRecInput) {
        autoRecInput.addEventListener("change", () => {
            manual = !autoRecInput.checked;
            autoRecLabel?.classList.toggle("active-mode", autoRecInput.checked);
            updateFirstStopTip();
        });
    }

    // Autoplay Switch
    const autoPlayInput = document.getElementById("togglePlaybackMode");
    const autoPlayLabel = document.getElementById("labelAutoPlay");
    if (autoPlayInput) {
        autoPlayInput.addEventListener("change", () => {
            autoplay = autoPlayInput.checked;
            autoPlayLabel?.classList.toggle("active-mode", autoPlayInput.checked);
        });
    }

    // Voice Selector
    const voiceSelect = document.getElementById("voiceSelect");
    if (voiceSelect) {
        voiceSelect.addEventListener("change", () => {
            stopAllPlayback();
            preferredVoiceName = voiceSelect.value;
            if (preferredVoiceName) {
                localStorage.setItem(VOICE_STORAGE_KEY, preferredVoiceName);
            } else {
                localStorage.removeItem(VOICE_STORAGE_KEY);
            }
            updateVoiceSelector();
        });
    }

    if (window.speechSynthesis) {
        const handleVoicesChanged = () => {
            updateVoiceSelector();
            diagnoseTtsStartup();
        };
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        }
        window.speechSynthesis.addEventListener?.("voiceschanged", handleVoicesChanged);
    }

    // -------------------------------------------------------------
    // 9. DrillAudio Registration
    // -------------------------------------------------------------
    DrillAudio.configure({
        busy: () => Boolean(session || preparing),
        sync,
        stop: stopAllPlayback,
        cancel: () => {
            preparing = false;
            if (session) {
                session.discard = true;
                session.stop("", true);
            }
        }
    });

    window.addEventListener("resize", () => {
        alignDrill1Cues();
    });

    // Initial setup and render
    setupGermanTtsNoticeEvents();
    updateVoiceSelector();
    diagnoseTtsStartup();
    renderAll();
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initGermanDrill);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        drillsData,
        evaluateGermanAnswer,
        normalizeGerman,
        getModel,
        getAllowed,
        getItemGrammarSpec,
        GERMAN_VERBS,
        SEIN_FORMS,
        ALL_SEIN
    };
}
