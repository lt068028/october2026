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
        instruction: "Use nach with cities and countries that have no grammatical article.",
        learningFocus: "Cities & Countries",
        example: {
            cue: "Ich / fahren / Salzburg",
            cueParts: ["Ich", "fahren", "Salzburg"],
            hints: ["I (subject)", "to travel / drive", "Salzburg (city in Austria)"],
            model: "Ich fahre nach Salzburg."
        },
        items: [
            {
                id: "d1_1",
                cue: "Ich / fliegen / Berlin",
                cueParts: ["Ich", "fliegen", "Berlin"],
                hints: ["I (subject)", "to fly", "Berlin (city in Germany)"],
                model: "Ich fliege nach Berlin."
            },
            {
                id: "d1_2",
                cue: "Ich / reisen / Italien",
                cueParts: ["Ich", "reisen", "Italien"],
                hints: ["I (subject)", "to travel", "Italy"],
                model: "Ich reise nach Italien."
            },
            {
                id: "d1_3",
                cue: "Ich / ziehen / Wien",
                cueParts: ["Ich", "ziehen", "Wien"],
                hints: ["I (subject)", "to move (relocate)", "Vienna (city in Austria)"],
                model: "Ich ziehe nach Wien."
            }
        ]
    },
    {
        id: "drill2",
        number: 2,
        title: "Drill 2: in — Countries with Articles (Akkusativ)",
        instruction: "Use in + Akkusativ for destinations with feminine, plural, or masculine country names.",
        learningFocus: "Countries with Articles",
        example: {
            cue: "Du / fahren / die Schweiz",
            cueParts: ["Du", "fahren", "die Schweiz"],
            hints: ["You (subject, sg.)", "to travel / drive", "Switzerland (fem.)"],
            model: "Du fährst in die Schweiz."
        },
        items: [
            {
                id: "d2_1",
                cue: "Du / fliegen / die Türkei",
                cueParts: ["Du", "fliegen", "die Türkei"],
                hints: ["You (subject, sg.)", "to fly", "Turkey (fem.)"],
                model: "Du fliegst in die Türkei."
            },
            {
                id: "d2_2",
                cue: "Du / reisen / die USA",
                cueParts: ["Du", "reisen", "die USA"],
                hints: ["You (subject, sg.)", "to travel", "USA (pl.)"],
                model: "Du reist in die USA."
            },
            {
                id: "d2_3",
                cue: "Du / kommen / der Irak",
                cueParts: ["Du", "kommen", "der Irak"],
                hints: ["You (subject, sg.)", "to come", "Iraq (masc.)"],
                model: "Du kommst in den Irak."
            }
        ]
    },
    {
        id: "drill3",
        number: 3,
        title: "Drill 3: zum — Masculine & Neuter Destinations",
        instruction: "Use zum (zu + dem) for masculine and neuter destinations.",
        learningFocus: "Masculine & Neuter Destinations",
        example: {
            cue: "Er / gehen / der Supermarkt",
            cueParts: ["Er", "gehen", "der Supermarkt"],
            hints: ["He (subject)", "to go / walk", "supermarket (masc.)"],
            model: "Er geht zum Supermarkt."
        },
        items: [
            {
                id: "d3_1",
                cue: "Er / fahren / das Krankenhaus",
                cueParts: ["Er", "fahren", "das Krankenhaus"],
                regionalCuePlaces: {
                    DE: "das Krankenhaus",
                    AT: "das Spital",
                    CH: "das Spital"
                },
                hints: ["He (subject)", "to drive / travel", "hospital (neut.)"],
                regionalModels: {
                    DE: "Er fährt zum Krankenhaus.",
                    AT: "Er fährt zum Spital.",
                    CH: "Er fährt zum Spital."
                },
                allowedAnswers: [
                    "Er fährt zum Krankenhaus.",
                    "Er fährt zum Spital."
                ]
            },
            {
                id: "d3_2",
                cue: "Er / rennen / der Bahnhof",
                cueParts: ["Er", "rennen", "der Bahnhof"],
                hints: ["He (subject)", "to run", "train station (masc.)"],
                model: "Er rennt zum Bahnhof."
            },
            {
                id: "d3_3",
                cue: "Er / spazieren / der Park",
                cueParts: ["Er", "spazieren", "der Park"],
                hints: ["He (subject)", "to stroll / walk", "park (masc.)"],
                model: "Er spaziert zum Park."
            }
        ]
    },
    {
        id: "drill4",
        number: 4,
        title: "Drill 4: zur — Feminine Destinations",
        instruction: "Use zur (zu + der) for feminine destinations.",
        learningFocus: "Feminine Destinations",
        example: {
            cue: "Ihr / gehen / die Post",
            cueParts: ["Ihr", "gehen", "die Post"],
            hints: ["You (subject, pl.)", "to go", "post office (fem.)"],
            model: "Ihr geht zur Post."
        },
        items: [
            {
                id: "d4_1",
                cue: "Ihr / laufen / die Bank",
                cueParts: ["Ihr", "laufen", "die Bank"],
                hints: ["You (subject, pl.)", "to run / walk", "bank (fem.)"],
                model: "Ihr lauft zur Bank."
            },
            {
                id: "d4_2",
                cue: "Ihr / radeln / die Apotheke",
                cueParts: ["Ihr", "radeln", "die Apotheke"],
                hints: ["You (subject, pl.)", "to cycle", "pharmacy (fem.)"],
                model: "Ihr radelt zur Apotheke."
            },
            {
                id: "d4_3",
                cue: "Ihr / fahren / die Schule",
                cueParts: ["Ihr", "fahren", "die Schule"],
                hints: ["You (subject, pl.)", "to travel / drive", "school (fem.)"],
                regionalModels: {
                    DE: "Ihr fahrt zur Schule.",
                    AT: "Ihr fahrt in die Schule.",
                    CH: "Ihr fahrt zur Schule."
                },
                allowedAnswers: [
                    "Ihr fahrt zur Schule.",
                    "Ihr fahrt in die Schule."
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
    },
    ziehen: {
        präsens: {
            "ich": ["ziehe"],
            "du": ["ziehst"],
            "er": ["zieht"],
            "sie": ["zieht", "ziehen"],
            "es": ["zieht"],
            "man": ["zieht"],
            "wir": ["ziehen"],
            "ihr": ["zieht"],
            "Sie": ["ziehen"]
        },
        präteritum: {
            "ich": ["zog"],
            "du": ["zogst"],
            "er": ["zog"],
            "sie": ["zog", "zogen"],
            "es": ["zog"],
            "man": ["zog"],
            "wir": ["zogen"],
            "ihr": ["zogt"],
            "Sie": ["zogen"]
        },
        partizip: "gezogen"
    },
    kommen: {
        präsens: {
            "ich": ["komme"],
            "du": ["kommst"],
            "er": ["kommt"],
            "sie": ["kommt", "kommen"],
            "es": ["kommt"],
            "man": ["kommt"],
            "wir": ["kommen"],
            "ihr": ["kommt"],
            "Sie": ["kommen"]
        },
        präteritum: {
            "ich": ["kam"],
            "du": ["kamst"],
            "er": ["kam"],
            "sie": ["kam", "kamen"],
            "es": ["kam"],
            "man": ["kam"],
            "wir": ["kamen"],
            "ihr": ["kamt"],
            "Sie": ["kamen"]
        },
        partizip: "gekommen"
    },
    rennen: {
        präsens: {
            "ich": ["renne"],
            "du": ["rennst"],
            "er": ["rennt"],
            "sie": ["rennt", "rennen"],
            "es": ["rennt"],
            "man": ["rennt"],
            "wir": ["rennen"],
            "ihr": ["rennt"],
            "Sie": ["rennen"]
        },
        präteritum: {
            "ich": ["rannte"],
            "du": ["ranntest"],
            "er": ["rannte"],
            "sie": ["rannte", "rannten"],
            "es": ["rannte"],
            "man": ["rannte"],
            "wir": ["rannten"],
            "ihr": ["ranntet"],
            "Sie": ["rannten"]
        },
        partizip: "gerannt"
    },
    spazieren: {
        präsens: {
            "ich": ["spaziere"],
            "du": ["spazierst"],
            "er": ["spaziert"],
            "sie": ["spaziert", "spazieren"],
            "es": ["spaziert"],
            "man": ["spaziert"],
            "wir": ["spazieren"],
            "ihr": ["spaziert"],
            "Sie": ["spazieren"]
        },
        präteritum: {
            "ich": ["spazierte"],
            "du": ["spaziertest"],
            "er": ["spazierte"],
            "sie": ["spazierte", "spazierten"],
            "es": ["spazierte"],
            "man": ["spazierte"],
            "wir": ["spazierten"],
            "ihr": ["spaziertet"],
            "Sie": ["spazierten"]
        },
        partizip: "spaziert"
    },
    laufen: {
        präsens: {
            "ich": ["laufe"],
            "du": ["läufst"],
            "er": ["läuft"],
            "sie": ["läuft", "laufen"],
            "es": ["läuft"],
            "man": ["läuft"],
            "wir": ["laufen"],
            "ihr": ["lauft"],
            "Sie": ["laufen"]
        },
        präteritum: {
            "ich": ["lief"],
            "du": ["liefst"],
            "er": ["lief"],
            "sie": ["lief", "liefen"],
            "es": ["lief"],
            "man": ["lief"],
            "wir": ["liefen"],
            "ihr": ["lieft"],
            "Sie": ["liefen"]
        },
        partizip: "gelaufen"
    },
    radeln: {
        präsens: {
            "ich": ["radele", "radle"],
            "du": ["radelst"],
            "er": ["radelt"],
            "sie": ["radelt", "radeln"],
            "es": ["radelt"],
            "man": ["radelt"],
            "wir": ["radeln"],
            "ihr": ["radelt"],
            "Sie": ["radeln"]
        },
        präteritum: {
            "ich": ["radelte"],
            "du": ["radeltest"],
            "er": ["radelte"],
            "sie": ["radelte", "radelten"],
            "es": ["radelte"],
            "man": ["radelte"],
            "wir": ["radelten"],
            "ihr": ["radeltet"],
            "Sie": ["radelten"]
        },
        partizip: "geradelt"
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
    const hasSubjectCue = item.cueParts && item.cueParts.length >= 3;
    const requiredSubject = hasSubjectCue ? item.cueParts[0].toLowerCase().trim() : "ich";
    const cueVerb = hasSubjectCue ? item.cueParts[1].toLowerCase().trim() : (item.cueParts && item.cueParts[1] ? item.cueParts[1].toLowerCase().trim() : "");
    const cuePlace = hasSubjectCue ? item.cueParts[2] : (item.cueParts && item.cueParts[0] ? item.cueParts[0] : "");

    const models = [];
    if (item.model) models.push(item.model);
    if (item.allowedAnswers) models.push(...item.allowedAnswers);
    if (item.regionalModels) models.push(...Object.values(item.regionalModels));

    const validPrepPhrases = [];
    const targetPreps = new Set();
    const targetPlaces = new Set();

    models.forEach(m => {
        if (!m) return;
        const norm = normalizeGerman(m);
        const words = norm.split(" ");
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            if (w === "nach" || w === "zum" || w === "zur") {
                const phrase = words.slice(i).join(" ");
                validPrepPhrases.push(phrase);
                targetPreps.add(w);
                if (w === "zum") {
                    targetPreps.add("zu dem");
                    validPrepPhrases.push(`zu dem ${words.slice(i + 1).join(" ")}`);
                } else if (w === "zur") {
                    targetPreps.add("zu der");
                    validPrepPhrases.push(`zu der ${words.slice(i + 1).join(" ")}`);
                }
                if (i + 1 < words.length) targetPlaces.add(words[i + 1]);
                break;
            } else if (w === "in" && i + 1 < words.length && ["die", "den", "dem", "das"].includes(words[i + 1])) {
                validPrepPhrases.push(words.slice(i).join(" "));
                targetPreps.add(`in ${words[i + 1]}`);
                if (i + 2 < words.length) targetPlaces.add(words[i + 2]);
                break;
            }
        }
    });

    const normCuePlace = normalizeGerman(cuePlace);
    const placeNoun = normCuePlace.split(" ").pop() || "";
    if (placeNoun) targetPlaces.add(placeNoun);

    return {
        requiredSubject,
        cueVerb,
        validPrepPhrases: Array.from(new Set(validPrepPhrases)),
        targetPreps: Array.from(targetPreps),
        targetPlace: placeNoun,
        targetPlaces: Array.from(targetPlaces)
    };
}

function getAllowedCandidateSentences(item, variety = "DE") {
    const spec = getItemGrammarSpec(item);
    const subj = spec.requiredSubject;
    const verbInfo = GERMAN_VERBS[spec.cueVerb];
    const recModel = getModel(item, variety);

    const baseModels = [];
    if (recModel) baseModels.push(recModel);
    if (item.allowedAnswers) {
        item.allowedAnswers.forEach(ans => {
            if (!baseModels.includes(ans)) baseModels.push(ans);
        });
    }
    if (item.regionalModels) {
        Object.values(item.regionalModels).forEach(rm => {
            if (!baseModels.includes(rm)) baseModels.push(rm);
        });
    }

    const candidates = [];
    const seen = new Set();
    const addCandidate = (sentence) => {
        const norm = normalizeGerman(sentence);
        if (norm && !seen.has(norm)) {
            seen.add(norm);
            candidates.push(norm);
        }
    };

    // 1. Primary models (chosen variety recModel first, then other allowed/regional models)
    baseModels.forEach(m => addCandidate(m));

    // 2. Grammatical variations (inversion, Präteritum, Perfekt) for each valid prep phrase
    const praesensForms = verbInfo ? (verbInfo.präsens[subj] || []) : [];
    const praetForms = verbInfo ? (verbInfo.präteritum[subj] || []) : [];
    const seinForms = SEIN_FORMS[subj] || [];
    const partizip = verbInfo ? verbInfo.partizip : "";

    spec.validPrepPhrases.forEach(pp => {
        praesensForms.forEach(vf => {
            addCandidate(`${subj} ${vf} ${pp}`);
            addCandidate(`${pp} ${vf} ${subj}`);
        });
        praetForms.forEach(vf => {
            addCandidate(`${subj} ${vf} ${pp}`);
            addCandidate(`${pp} ${vf} ${subj}`);
        });
        if (partizip) {
            seinForms.forEach(aux => {
                addCandidate(`${subj} ${aux} ${pp} ${partizip}`);
                addCandidate(`${pp} ${aux} ${subj} ${partizip}`);
            });
        }
    });

    return candidates;
}

function computeTokenDiff(rawText, targetNorm) {
    const rawDisplayTokens = rawText.trim().split(/\s+/).filter(Boolean);
    const rawNormTokens = rawDisplayTokens.map(t => normalizeGerman(t)).filter(Boolean);
    const targetTokens = targetNorm.split(" ").filter(Boolean);

    const m = rawNormTokens.length;
    const n = targetTokens.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = rawNormTokens[i - 1] === targetTokens[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j - 1] + cost,
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1
            );
        }
    }

    // Backtrack with deterministic tie-breaking:
    // 1. Match -> 2. Substitution -> 3. Insertion in STT (extra learner word) -> 4. Deletion in STT (missing word ＿)
    const aligned = [];
    let i = m;
    let j = n;
    let matchedCount = 0;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && rawNormTokens[i - 1] === targetTokens[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
            aligned.push({ text: rawDisplayTokens[i - 1], status: "correct" });
            matchedCount++;
            i--;
            j--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            aligned.push({ text: rawDisplayTokens[i - 1], status: "incorrect" });
            i--;
            j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            aligned.push({ text: rawDisplayTokens[i - 1], status: "incorrect" });
            i--;
        } else {
            aligned.push({ text: "＿", status: "missing" });
            j--;
        }
    }

    aligned.reverse();

    const maxLen = Math.max(m, n);
    const matchRatio = maxLen > 0 ? matchedCount / maxLen : 0;
    const isLowConfidence = matchedCount === 0 || matchRatio < 0.25;

    if (isLowConfidence) {
        return {
            distance: dp[m][n],
            matchedCount,
            diffTokens: rawDisplayTokens.map(t => ({ text: t, status: "incorrect" }))
        };
    }

    return {
        distance: dp[m][n],
        matchedCount,
        diffTokens: aligned
    };
}

function selectBestMismatchDiff(rawText, item, variety = "DE") {
    const candidates = getAllowedCandidateSentences(item, variety);
    if (candidates.length === 0) {
        const rawDisplayTokens = rawText.trim().split(/\s+/).filter(Boolean);
        return rawDisplayTokens.map(t => ({ text: t, status: "incorrect" }));
    }

    let bestResult = null;
    for (const cand of candidates) {
        const res = computeTokenDiff(rawText, cand);
        if (!bestResult || res.distance < bestResult.distance) {
            bestResult = res;
        }
    }
    return bestResult.diffTokens;
}

function evaluateGermanAnswer(raw, item, variety = "DE") {
    const normRaw = normalizeGerman(raw);
    if (!normRaw) {
        return { judgment: "empty", redPart: null, supplement: null, reason: "empty", diffTokens: null };
    }

    const recModel = getModel(item, variety);
    const normRec = normalizeGerman(recModel);

    // 1. Accepted: Exact model match
    if (normRaw === normRec) {
        return { judgment: "accepted", redPart: null, supplement: null, reason: "exact_model", diffTokens: null };
    }

    // 2. Accepted: Allowed answers check (e.g. regional differences like zur Schule / in die Schule)
    const allowed = getAllowed(item, variety);
    if (allowed.some(ans => normalizeGerman(ans) === normRaw)) {
        const flag = variety === "AT" ? "🇦🇹 " : (variety === "CH" ? "🇨🇭 " : "🇩🇪 ");
        return { judgment: "accepted", redPart: null, supplement: flag + recModel, reason: "allowed_answer", diffTokens: null };
    }

    const words = normRaw.split(" ");
    const spec = getItemGrammarSpec(item);
    const candidates = getAllowedCandidateSentences(item, variety);

    // 3. Accepted: Exact registered grammatical candidates only.
    // Candidate generation already accounts for the item's registered subject, verb forms,
    // allowed regional destinations, contractions, Perfekt / Präteritum, and inversion.
    // Compare the whole normalized sentence so unrelated trailing or inserted words cannot pass.
    if (candidates.includes(normRaw)) {
        return { judgment: "accepted", redPart: null, supplement: null, reason: "valid_motion_sentence", diffTokens: null };
    }

    // 4. Incomplete: True token-level prefix match against any allowed candidate
    const isPrefixMatch = candidates.some(cand => {
        const targetTokens = cand.split(" ").filter(Boolean);
        return words.length > 0 &&
            words.length < targetTokens.length &&
            words.every((w, idx) => w === targetTokens[idx]);
    });

    if (isPrefixMatch) {
        return { judgment: "incomplete", redPart: null, supplement: null, reason: "incomplete_prefix", diffTokens: null };
    }

    // 5. Mismatch: Word-level diff against best candidate
    const diffTokens = selectBestMismatchDiff(raw, item, variety);
    return { judgment: "mismatch", redPart: null, supplement: null, reason: "mismatch_diff", diffTokens };
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

    function createExampleArrowSvg() {
        const NS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", "28");
        svg.setAttribute("height", "28");
        svg.setAttribute("viewBox", "0 0 28 28");
        svg.setAttribute("fill", "#F28C28");
        svg.setAttribute("stroke", "#F28C28");
        svg.setAttribute("stroke-width", "1");
        svg.setAttribute("stroke-linejoin", "round");
        svg.setAttribute("aria-hidden", "true");
        svg.style.display = "inline-block";
        svg.style.verticalAlign = "middle";
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", "M15.7048 4.28868C15.312 3.9005 14.6788 3.90428 14.2906 4.29713C13.9025 4.68998 13.9062 5.32313 14.2991 5.71132L21.6753 13H4C3.44772 13 3 13.4477 3 14C3 14.5523 3.44772 15 4 15H21.673L14.2991 22.2864C13.9062 22.6746 13.9025 23.3078 14.2906 23.7006C14.6788 24.0935 15.312 24.0972 15.7048 23.7091L24.6318 14.888C25.127 14.3987 25.127 13.5991 24.6318 13.1097L15.7048 4.28868Z");
        path.setAttribute("fill", "#F28C28");
        path.setAttribute("stroke", "#F28C28");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("stroke-linejoin", "round");
        svg.append(path);
        return svg;
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

    function createFlagSvgMarkup(variety) {
        if (variety === "AT") {
            return '<svg class="uebung-flag-svg" width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><rect width="16" height="4" y="0" fill="#ED2939"/><rect width="16" height="4" y="4" fill="#FFFFFF"/><rect width="16" height="4" y="8" fill="#ED2939"/></svg>';
        }
        if (variety === "CH") {
            return '<svg class="uebung-flag-svg" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect width="12" height="12" fill="#D52B1E"/><rect x="5" y="2.2" width="2" height="7.6" fill="#FFFFFF"/><rect x="2.2" y="5" width="7.6" height="2" fill="#FFFFFF"/></svg>';
        }
        return '<svg class="uebung-flag-svg" width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><rect width="16" height="4" y="0" fill="#000000"/><rect width="16" height="4" y="4" fill="#DD0000"/><rect width="16" height="4" y="8" fill="#FFCE00"/></svg>';
    }

    function createFlagSvgElement(variety) {
        const wrap = document.createElement("span");
        wrap.className = "uebung-flag-icon";
        wrap.innerHTML = createFlagSvgMarkup(variety);
        return wrap.firstElementChild;
    }

    function formatCue(item, isDrill1 = true) {
        let baseHtml = "";
        if (item.cueParts && item.hints && item.cueParts.length === item.hints.length) {
            const parts = item.cueParts.map((rawPart, idx) => {
                const part = (idx === 2 && item.regionalCuePlaces)
                    ? (item.regionalCuePlaces[currentVariety] || rawPart)
                    : rawPart;
                if (hintMode === "off") {
                    return part;
                }
                const hint = item.hints[idx];
                if (hintMode === "paren") {
                    return `${part} <span class="vocab-inline">(${hint})</span>`;
                }
                return `<span class="tooltip-wrap"><span class="target-word">${part}</span><span class="tooltip-tip">${hint}</span></span>`;
            });
            baseHtml = parts.join(" / ");
        } else {
            baseHtml = item.cue;
        }

        if (item.regionalCuePlaces) {
            const altHtml = currentVariety === "DE"
                ? `<span class="uebung-cue-alt-line">${createFlagSvgMarkup("AT")}${createFlagSvgMarkup("CH")} <span class="uebung-cue-alt-text">das Spital</span></span>`
                : `<span class="uebung-cue-alt-line">${createFlagSvgMarkup("DE")} <span class="uebung-cue-alt-text">das Krankenhaus</span></span>`;
            return `${baseHtml}${altHtml}`;
        }
        return baseHtml;
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
    let activeExButton = null;
    let stoppedExButton = null;
    let stoppedExTime = 0;
    let playbackGeneration = 0;
    let relayKey = null;
    let suppressRelayPreStop = false;

    function applyRelayTip(btn, text) {
        if (!btn) return;
        let tip = btn.querySelector(".custom-tip-box");
        if (text) {
            if (!tip) {
                btn.classList.add("custom-tip-wrap");
                tip = node("span", "custom-tip-box", text);
                btn.append(tip);
            } else {
                tip.textContent = text;
            }
        } else if (tip) {
            tip.remove();
            btn.classList.remove("custom-tip-wrap");
        }
    }

    function clearRelayState(expectedGen) {
        if (expectedGen !== undefined && expectedGen !== playbackGeneration) return;
        if (!relayKey) return;
        const keyToClear = relayKey;
        relayKey = null;
        const rv = views.get(keyToClear);
        if (!rv) return;
        const playBtn = rv.result?.querySelector(".play-recording-btn");
        [rv.listen, playBtn].forEach(b => {
            if (!b) return;
            b.classList.remove("is-playing");
            delete b.dataset.keepPlayback;
            if (b._relayContents) {
                b.replaceChildren(...b._relayContents);
                delete b._relayContents;
            }
            if (b._relayAriaLabel !== undefined) {
                if (b._relayAriaLabel === null) b.removeAttribute("aria-label");
                else b.setAttribute("aria-label", b._relayAriaLabel);
                delete b._relayAriaLabel;
            }
            if (b._relayTipText !== undefined) {
                applyRelayTip(b, b._relayTipText);
                delete b._relayTipText;
            }
            b.disabled = Boolean(session || preparing);
        });
    }

    function stopPlayback(isNaturalFinish = false) {
        playbackGeneration++;
        if (!suppressRelayPreStop) clearRelayState();
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
        if (activeExButton) {
            if (!isNaturalFinish) {
                stoppedExButton = activeExButton;
                stoppedExTime = performance.now();
            }
            activeExButton.classList.remove("is-playing");
            const iconWrap = activeExButton.querySelector(".ex-audio-icon");
            if (iconWrap && window.FluentIcons) {
                iconWrap.replaceChildren(window.FluentIcons.create("speaker2", 20));
            }
            if (activeExButton._originalAriaLabel !== undefined) {
                if (activeExButton._originalAriaLabel === null) activeExButton.removeAttribute("aria-label");
                else activeExButton.setAttribute("aria-label", activeExButton._originalAriaLabel);
                delete activeExButton._originalAriaLabel;
            }
            activeExButton = null;
        }
        if (playingButton) {
            playingButton.disabled = false;
            if (playingButton._contents) {
                playingButton.replaceChildren(...playingButton._contents);
            }
            if (playingButton._originalAriaLabel !== undefined) {
                if (playingButton._originalAriaLabel === null) playingButton.removeAttribute("aria-label");
                else playingButton.setAttribute("aria-label", playingButton._originalAriaLabel);
                delete playingButton._originalAriaLabel;
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

    function markExPlaying(b) {
        if (!b) return;
        activeExButton = b;
        b.classList.add("is-playing");
        const iconWrap = b.querySelector(".ex-audio-icon");
        if (iconWrap && window.FluentIcons) {
            iconWrap.replaceChildren(window.FluentIcons.create("stop", 20, "", "regular"));
        }
        b._originalAriaLabel = b.getAttribute("aria-label");
        b.setAttribute("aria-label", "Wiedergabe stoppen");
        b.disabled = false;
    }

    function markPlaying(b) {
        if (!b) return;
        if (b.dataset?.isExAudio === "true") {
            markExPlaying(b);
            return;
        }
        stopPlayback();
        playingButton = b;
        b._contents = Array.from(b.childNodes);
        if (b.classList.contains("play-recording-btn")) {
            b.classList.add("is-playing");
            b.disabled = false;
            b._originalAriaLabel = b.getAttribute("aria-label");
            b.setAttribute("aria-label", "Wiedergabe stoppen");
            if (window.FluentIcons) {
                b.replaceChildren(window.FluentIcons.create("stop", 20, "", "regular"));
            }
            return;
        }
        b.disabled = false;
        b.classList.add("is-playing");
        b._originalAriaLabel = b.getAttribute("aria-label");
        b.setAttribute("aria-label", "Wiedergabe stoppen");
        if (window.FluentIcons) {
            b.replaceChildren(window.FluentIcons.create("stop", 20, "", "regular"));
        }
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
        if (relayKey === key || playingButton === btn) {
            stopAllPlayback();
            return;
        }
        stopAllPlayback();

        const entry = saved.get(key);
        if (!entry?.url) return;

        const audio = new Audio(entry.url);
        if (btn) markPlaying(btn);
        activeAudio = audio;

        let cleaned = false;
        const gen = ++playbackGeneration;

        const cleanup = () => {
            if (cleaned || gen !== playbackGeneration) return;
            cleaned = true;
            stopPlayback(true);
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
        if (!Recognition && !window.MediaRecorder) {
            showResult(key, "Speech recognition and recording are not supported in this browser.");
            return;
        }
        if (!Recognition) {
            showResult(key, "Speech recognition is not supported in this browser.");
            return;
        }
        if (!window.MediaRecorder) {
            showResult(key, "Recording is not supported in this browser.");
            return;
        }

        stopAllPlayback();
        preparing = true;
        sync();

        const v = views.get(key);
        if (v) {
            v.result.classList.remove("not-recorded-yet");
            v.result.classList.add("recording-status");
            v.result.textContent = "Preparing microphone...";
        }

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
            speechStarted: false,
            lastSoundAt: null,
            stopReason: "",
            raw: "",
            interim: "",
            chunks: [],
            timers: [],
            recognitionDone: false,
            recorderDone: false,
            discard: false,
            notice: "",
            context: null,
            recorder: null,
            recognition: null
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

            if (s.context) {
                try { s.context.close().catch(() => {}); } catch (_) {}
                s.context = null;
            }

            if (s.recognition) {
                s.recognition.onend = null;
                s.recognition.onresult = null;
                s.recognition.onerror = null;
                s.recognition.onspeechstart = null;
                try { s.recognition.abort(); } catch (_) {}
            }

            session = null;

            if (s.interim?.trim()) {
                s.raw += s.interim;
            }

            const raw = s.raw.trim();
            const recModel = getModel(item, currentVariety);

            const previous = saved.get(key) || {};
            const normRaw = normalizeGerman(raw);
            let url = "";

            const hasValidAudio = !s.discard && s.speechStarted && s.chunks.length > 0;
            if (raw && normRaw && hasValidAudio) {
                try {
                    url = URL.createObjectURL(
                        new Blob(s.chunks, { type: s.recorder?.mimeType || "audio/webm" })
                    );
                } catch (_) {
                    url = "";
                }
            }

            if (raw && normRaw) {
                if (previous.url) {
                    try { URL.revokeObjectURL(previous.url); } catch (_) {}
                }
                const evalResult = evaluateGermanAnswer(raw, item, currentVariety);
                const isCorrect = evalResult.judgment === "accepted";
                saved.set(key, {
                    url,
                    raw: s.raw,
                    correct: isCorrect,
                    judgment: evalResult.judgment,
                    redPart: evalResult.redPart,
                    diffTokens: evalResult.diffTokens,
                    modelText: recModel,
                    supplement: evalResult.supplement,
                    variety: currentVariety
                });
            } else if (hasValidAudio) {
                if (previous.url) {
                    try { URL.revokeObjectURL(previous.url); } catch (_) {}
                }
                saved.delete(key);
            } else if (s.speechStarted && !hasValidAudio) {
                if (previous.url) {
                    try { URL.revokeObjectURL(previous.url); } catch (_) {}
                }
                saved.delete(key);
            }

            s.chunks = [];

            let noticeMessage = s.notice;
            if (!noticeMessage) {
                if (!raw) {
                    if (hasValidAudio) {
                        noticeMessage = "No transcription available.";
                    } else if (s.speechStarted) {
                        noticeMessage = "Recording error.";
                    } else if (s.stopReason === "timeout-5s") {
                        noticeMessage = "No speech detected within 5 seconds.";
                    } else if (s.stopReason === "manual") {
                        noticeMessage = "";
                    }
                }
            } else if (!raw && !hasValidAudio && s.notice === "No transcription available.") {
                noticeMessage = "Recording error.";
            }

            showResult(key, noticeMessage);
            sync();

            if (autoplay && !s.discard && raw) {
                stopAllPlayback();
                const currentView = views.get(key);
                const playBtn = currentView?.result?.querySelector(".play-recording-btn");
                const gen = ++playbackGeneration;
                relayKey = key;
                [currentView?.listen, playBtn].forEach(b => {
                    if (!b) return;
                    b._relayContents = Array.from(b.childNodes);
                    b._relayAriaLabel = b.getAttribute("aria-label");
                    const existingTip = b.querySelector(".custom-tip-box");
                    b._relayTipText = existingTip ? existingTip.textContent : null;
                    b.classList.add("is-playing");
                    b.dataset.keepPlayback = "true";
                    b.disabled = false;
                    b.setAttribute("aria-label", "Wiedergabe stoppen");
                    if (window.FluentIcons) {
                        b.replaceChildren(window.FluentIcons.create("stop", 20, "", "regular"));
                    }
                    applyRelayTip(b, "Auto-Compare: ON");
                });
                suppressRelayPreStop = true;
                try {
                    DrillAudio.playRelay({
                        recordButton: currentView.rec,
                        result: currentView.result,
                        keepButtons: true,
                        speak: done => {
                            suppressRelayPreStop = false;
                            speakModel(recModel, null, done, true);
                        },
                        url: () => saved.get(key)?.url
                    });
                } finally {
                    suppressRelayPreStop = false;
                }
            }
        };

        s.stop = (notice = "", discard = false, reason = "") => {
            if (s.stopping || s.finished) return;
            s.stopping = true;
            if (reason) s.stopReason = reason;
            else if (!s.stopReason) s.stopReason = notice ? "error" : "manual";
            if (notice) s.notice = notice;
            s.discard = discard || !s.speechStarted;

            clear();
            sync();

            if (s.recognition && !s.recognitionDone) {
                try {
                    s.recognition.stop();
                } catch (_) {
                    s.recognitionDone = true;
                }
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
                if (!s.recorderDone) {
                    s.discard = true;
                    s.recorderDone = true;
                }
                finish();
            }, 2500));

            finish();
        };

        // Initialize SpeechRecognition
        try {
            s.recognition = new Recognition();
            s.recognition.lang = targetLocaleForVariety(currentVariety);
            s.recognition.interimResults = true;
            s.recognition.continuous = true;
            s.recognition.maxAlternatives = 1;

            // SpeechRecognition events (such as Chrome's premature onspeechstart) MUST NOT trigger
            // speech detection or silence stopping. Speech detection and silence auto-stop are
            // strictly governed by microphone audio volume monitoring via AudioContext.

            s.recognition.onresult = event => {
                let finalStr = "";
                let interimStr = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const trans = event.results[i][0].transcript;
                    if (event.results[i].isFinal) finalStr += trans;
                    else interimStr += trans;
                }
                if (finalStr) s.raw += finalStr;
                s.interim = interimStr;

                const display = (s.raw + (s.interim ? ` (${s.interim})` : "")).trim();
                const view = views.get(key);
                if (view && display) {
                    view.result.textContent = display;
                }
            };

            s.recognition.onerror = event => {
                if (s.finished || s.stopping || event?.error === "no-speech") return;
                s.recognitionDone = true;
                s.stop("Recognition error.", false, "stt-error");
            };

            s.recognition.onend = () => {
                s.recognitionDone = true;
                finish();
            };

            try {
                s.recognition.start();
            } catch (_) {
                s.recognitionDone = true;
                s.stop("Recognition error.", false, "stt-error");
                return;
            }
        } catch (_) {
            s.recognitionDone = true;
            s.stop("Recognition error.", false, "stt-error");
            return;
        }

        // Initialize MediaRecorder
        try {
            s.recorder = new MediaRecorder(stream);
            s.recorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) s.chunks.push(e.data);
            };
            s.recorder.onstop = () => {
                s.recorderDone = true;
                finish();
            };
            s.recorder.onerror = () => {
                s.stop("Recording error.", true, "rec-error");
            };
            s.recorder.start();
        } catch (_) {
            s.recorderDone = true;
            s.stop("Could not start recording.", true, "rec-error");
            return;
        }

        // Audio monitoring via AudioContext
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error("AudioContext not supported");
            }
            const context = new AudioContextClass();
            s.context = context;

            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);

            const resumePromise = context.resume?.();
            if (resumePromise && typeof resumePromise.catch === "function") {
                resumePromise.catch(() => {
                    s.stop("Recording error.", true, "audio-error");
                });
            }

            const samples = new Float32Array(analyser.fftSize);
            let soundFrames = 0;

            s.timers.push(setInterval(() => {
                if (s.stopping || s.finished) return;

                analyser.getFloatTimeDomainData(samples);
                let sum = 0;
                for (const sample of samples) {
                    sum += sample * sample;
                }
                const volume = Math.sqrt(sum / samples.length);

                const sound = volume > 0.025;
                soundFrames = sound ? soundFrames + 1 : 0;

                if (sound && s.speechStarted) {
                    s.lastSoundAt = Date.now();
                }

                if (soundFrames >= 3) {
                    s.speechStarted = true;
                    s.lastSoundAt = Date.now();
                }

                // Autostop: 2.0s continuous silence after speech
                if (
                    !s.manual &&
                    s.speechStarted &&
                    s.lastSoundAt &&
                    Date.now() - s.lastSoundAt >= 2000
                ) {
                    s.stop("", false, "silence-2s");
                }
            }, 100));
        } catch (_) {
            s.stop("Recording error.", true, "audio-error");
            return;
        }

        // Watchdog timers
        // 1. 5s limit before speech starts (Autostop ON/OFF common)
        s.timers.push(setTimeout(() => {
            if (!s.speechStarted) {
                s.stop("No speech detected within 5 seconds.", true, "timeout-5s");
            }
        }, 5000));

        // 2. 20s absolute upper limit (Autostop ON/OFF common)
        s.timers.push(setTimeout(() => {
            s.stop("Auto-stopped after 20 seconds.", false, "limit-20s");
        }, 20000));

        showResult(key);
        sync();
    }

    function showResult(key, notice = "") {
        const v = views.get(key);
        if (!v) return;

        const val = saved.get(key);
        v.result.classList.remove("recording-status");
        v.result.classList.remove("not-recorded-yet");
        v.result.replaceChildren();
        v.correction.replaceChildren();
        v.correction.hidden = true;

        if (session?.key === key) {
            v.result.classList.remove("not-recorded-yet");
            v.result.classList.add("recording-status");
            v.result.textContent = "Recording...";
            return;
        }

        if (val?.raw && val.judgment !== "empty") {
            const judgment = val.judgment || (val.correct ? "accepted" : "mismatch");

            if (judgment === "accepted") {
                FeedbackStatus.appendAccepted(v.result, val.raw);
                v.correction.hidden = true;
            } else if (judgment === "incomplete") {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.setAttribute("width", "25");
                svg.setAttribute("height", "25");
                svg.setAttribute("fill", "none");
                svg.setAttribute("stroke", "currentColor");
                svg.setAttribute("stroke-width", "2");
                svg.setAttribute("stroke-linecap", "round");
                svg.setAttribute("stroke-linejoin", "round");
                svg.setAttribute("aria-hidden", "true");
                svg.classList.add("uebung-incomplete-svg");
                [
                    "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
                    "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
                    "M16 17h4",
                    "M4 13h4"
                ].forEach(d => {
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", d);
                    svg.appendChild(path);
                });
                const tipWrap = node("span", "custom-tip-wrap uebung-incomplete-wrap");
                tipWrap.append(svg, node("span", "custom-tip-box", "Incomplete sentence."));
                v.result.append(tipWrap, document.createTextNode(val.raw.trimEnd() + "…"));
                v.correction.hidden = true;
            } else if (judgment === "mismatch") {
                if (Array.isArray(val.diffTokens) && val.diffTokens.length > 0) {
                    val.diffTokens.forEach((tok, idx) => {
                        if (idx > 0) v.result.append(document.createTextNode(" "));
                        if (tok.status === "missing") {
                            v.result.append(node("span", "result-missing", tok.text));
                        } else if (tok.status === "incorrect") {
                            v.result.append(node("span", "result-incorrect", tok.text));
                        } else {
                            v.result.append(document.createTextNode(tok.text));
                        }
                    });
                } else if (val.redPart) {
                    const nodes = highlightRedPart(val.raw, val.redPart);
                    v.result.append(...nodes);
                } else {
                    v.result.append(document.createTextNode(val.raw));
                }

                v.correction.hidden = false;
                FeedbackStatus.setMismatch(v.correction);
            }
        } else if (notice || val?.judgment === "empty") {
            const note = node("span", "result-notice", notice || "No transcription available.");
            note.style.color = "var(--text-secondary)";
            v.result.append(note);
        } else {
            v.result.append(node("span", "result-text not-recorded-yet", "… Not yet"));
        }

        if (val?.url) {
            const playIcon = window.FluentIcons ? window.FluentIcons.create("playCircle", 20) : document.createTextNode("▶️");
            const playTip = key === "d1_1" ? "Play your recorded voice." : "";
            const play = button(playIcon, playTip, () => {
                playRecording(key, play);
            });
            play.classList.add("play-recording-btn");
            play.dataset.audioRole = "play";
            play.style.marginLeft = "8px";
            v.result.append(play);
        }

        if (val?.raw && val.judgment === "accepted" && val.supplement) {
            const noteText = val.supplement.replace(/^(?:🇩🇪|🇦🇹|🇨🇭)\s*/, "");
            const noteVariety = val.supplement.startsWith("🇦🇹") ? "AT" : (val.supplement.startsWith("🇨🇭") ? "CH" : "DE");
            const supp = node("span", "uebung-regional-note");
            supp.append(createFlagSvgElement(noteVariety), document.createTextNode(" " + noteText));
            v.result.append(supp);
        }

        if (val?.raw && notice) {
            const note = node("span", "result-notice", ` ${notice}`);
            note.style.color = "var(--text-secondary)";
            v.result.append(note);
        }
    }

    // -------------------------------------------------------------
    // 6. Copy My Sentences
    // -------------------------------------------------------------
    function updateCopyButtons() {
        const hasAnyRecordings = drillsData.some(drill =>
            drill.items.some(item => {
                const s = saved.get(item.id);
                return Boolean(s?.raw && s.judgment !== "empty");
            })
        );

        drillsData.forEach(drill => {
            const area = document.querySelector(`.uebung-copy-area[data-drill="${drill.number}"]`);
            if (!area) return;
            const btn = area.querySelector(".uebung-copy-button");
            if (!btn) return;

            btn.disabled = Boolean(session || preparing || !hasAnyRecordings);
        });
    }

    function setupCopyArea(drill, container) {
        const area = node("div", "uebung-copy-area");
        area.dataset.drill = String(drill.number);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "example-button uebung-copy-button";
        btn.dataset.keepPlayback = "true";
        btn.disabled = true;

        btn.innerHTML = window.FluentIcons.markup('clipboard', 20, 'uebung-copy-icon') + '<span class="uebung-copy-label">Copy my sentences</span>';

        const help = node("span", "uebung-copy-help", "Copy all your recorded answers to review or share.");

        let copyTimer = null;

        btn.onclick = async () => {
            if (session || preparing) return;
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

            const drillBlocks = [];
            drillsData.forEach(d => {
                const entries = [];
                d.items.forEach((item, idx) => {
                    const entry = saved.get(item.id);
                    if (entry?.raw && entry.judgment !== "empty") {
                        const marker = entry.judgment === "accepted" ? "✅" : (entry.judgment === "incomplete" ? "👣" : "🔥");
                        entries.push(`${idx + 1}. ${marker} ${entry.raw}`);
                    }
                });
                if (entries.length > 0) {
                    const cleanTitle = d.title.replace(/^Drill \d+:\s*/, "").trim();
                    const header = `Deutsche Übung 1.1 — Drill ${d.number}: ${cleanTitle} — ${dateStr}`;
                    drillBlocks.push(`${header}\n${entries.join("\n")}`);
                }
            });

            if (!drillBlocks.length) return;
            const fullText = drillBlocks.join("\n\n");

            try {
                await navigator.clipboard.writeText(fullText);
                const labelEl = btn.querySelector(".uebung-copy-label");
                if (labelEl) labelEl.textContent = "Copied";
                if (copyTimer) clearTimeout(copyTimer);
                copyTimer = setTimeout(() => {
                    if (labelEl) labelEl.textContent = "Copy my sentences";
                    copyTimer = null;
                }, 2000);
            } catch (_) {
                // Keep label unchanged on failure
            }
        };

        area.append(btn, help);
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
            const desc = node("span", "info-panel-desc instruction-steps");
            if (window.FluentIcons) {
                const bulb = window.FluentIcons.create("lightbulbFilled", 20, "uebung-instruction-bulb", "filled");
                desc.append(bulb, document.createTextNode(drill.instruction));
            } else {
                desc.textContent = drill.instruction;
            }
            panel.append(
                node("span", "info-panel-title", drill.title),
                desc
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
            const exArrowTd = node("td", "example-arrow-cell");
            exArrowTd.append(createExampleArrowSvg());
            exArrowTd.style.width = "28px";
            exArrowTd.style.textAlign = "center";

            // Listen button
            const exAudioTd = node("td", "example-audio-cell");
            const exModelSentence = getModel(drill.example, currentVariety);
            const exListenTip = drill.number === 1 ? "Listen to the example." : "";
            const iconSpan = node("span", "ex-audio-icon");
            if (window.FluentIcons) {
                iconSpan.append(window.FluentIcons.create("speaker2", 20));
            }
            const frag = document.createDocumentFragment();
            frag.append(iconSpan);
            const exListenBtn = button(frag, exListenTip, () => {
                if (session || preparing) return;
                if (stoppedExButton === exListenBtn && (performance.now() - stoppedExTime) < 150) {
                    stoppedExButton = null;
                    return;
                }
                if (activeExButton === exListenBtn) {
                    stopAllPlayback();
                    return;
                }
                speakModel(getModel(drill.example, currentVariety), exListenBtn);
            });
            exListenBtn.classList.add("ex-audio-btn");
            exListenBtn.dataset.isExAudio = "true";
            exListenBtn.dataset.audioRole = "listen";
            exListenBtn.setAttribute("aria-label", "Beispiel anhören");
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
                const listenIcon = window.FluentIcons ? window.FluentIcons.create("speaker2", 20) : document.createTextNode("🔊");
                const listenBtn = button(listenIcon, listenTip, () => {
                    if (session || preparing) return;
                    if (relayKey === item.id || playingButton === listenBtn) {
                        stopAllPlayback();
                        return;
                    }
                    speakModel(getModel(item, currentVariety), listenBtn);
                });
                listenBtn.classList.add("drill-listen-btn");
                listenBtn.dataset.audioRole = "listen";
                listenBtn.setAttribute("aria-label", "Modellantwort anhören");

                const recTip = isFirstItemOfDrill1 ? "Record your answer." : "";
                const recIcon = window.FluentIcons ? window.FluentIcons.create("mic", 20) : document.createTextNode("🎙️");
                const recBtn = button(recIcon, recTip, () => {
                    record(item.id, item);
                });
                recBtn.classList.add("drill-record-btn");
                recBtn.dataset.audioRole = "record";
                recBtn.setAttribute("aria-label", "Antwort aufnehmen");

                let stopTip = "";
                if (isFirstItemOfDrill1) {
                    stopTip = manual ? "Stop recording." : "No need to press. Autostop is ON.";
                }
                const stopBtn = button("⏹️", stopTip, () => {
                    if (session?.key === item.id) session.stop("", false, "manual");
                });
                stopBtn.dataset.stop = "true";
                stopBtn.disabled = true;
                if (isFirstItemOfDrill1) {
                    drill1FirstStopTipBox = stopBtn.querySelector(".custom-tip-box");
                }

                actions.append(listenBtn, recBtn, stopBtn);

                const wrap = node("span", "recording-result");
                const result = node("span", "result-text");
                const correction = node("div", "correction-box");
                correction.hidden = true;
                wrap.append(result, correction);
                layout.append(actions, wrap);

                ctrlTd.append(layout);
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

    const cleanupOnLeave = () => {
        stopAllPlayback();
        preparing = false;
        if (session) {
            session.discard = true;
            session.stop("", true);
        }
    };
    window.addEventListener("pagehide", cleanupOnLeave);
    window.addEventListener("beforeunload", cleanupOnLeave);

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
