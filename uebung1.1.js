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
            hints: ["I", "to drive", "Salzburg (city in Austria)"],
            model: "Ich fahre nach Salzburg."
        },
        items: [
            {
                id: "d1_1",
                cue: "Ich / fliegen / Berlin",
                cueParts: ["Ich", "fliegen", "Berlin"],
                hints: ["I", "to fly", null],
                model: "Ich fliege nach Berlin."
            },
            {
                id: "d1_2",
                cue: "Ich / reisen / Italien",
                cueParts: ["Ich", "reisen", "Italien"],
                hints: ["I", "to travel", "Italy"],
                model: "Ich reise nach Italien."
            },
            {
                id: "d1_3",
                cue: "Ich / ziehen / Wien",
                cueParts: ["Ich", "ziehen", "Wien"],
                hints: ["I", "to move", "Vienna (city in Austria)"],
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
            hints: ["You", "to drive", "Switzerland"],
            model: "Du fährst in die Schweiz."
        },
        items: [
            {
                id: "d2_1",
                cue: "Du / fliegen / die Türkei",
                cueParts: ["Du", "fliegen", "die Türkei"],
                hints: ["You", "to fly", "Turkey"],
                model: "Du fliegst in die Türkei."
            },
            {
                id: "d2_2",
                cue: "Du / reisen / die USA",
                cueParts: ["Du", "reisen", "die USA"],
                hints: ["You", "to travel", "USA"],
                model: "Du reist in die USA."
            },
            {
                id: "d2_3",
                cue: "Du / kommen / der Irak",
                cueParts: ["Du", "kommen", "der Irak"],
                hints: ["You", "to come", "Iraq"],
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
            hints: ["He", "to go", "supermarket"],
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
                hints: ["He", "to drive", "hospital"],
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
                hints: ["He", "to run", "train station"],
                model: "Er rennt zum Bahnhof."
            },
            {
                id: "d3_3",
                cue: "Er / spazieren / der Park",
                cueParts: ["Er", "spazieren", "der Park"],
                hints: ["He", "to take a walk", "park"],
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
            hints: ["You all", "to go", "post office"],
            model: "Ihr geht zur Post."
        },
        items: [
            {
                id: "d4_1",
                cue: "Ihr / laufen / die Bank",
                cueParts: ["Ihr", "laufen", "die Bank"],
                hints: ["You all", "to run", "bank"],
                model: "Ihr lauft zur Bank."
            },
            {
                id: "d4_2",
                cue: "Ihr / radeln / die Apotheke",
                cueParts: ["Ihr", "radeln", "die Apotheke"],
                hints: ["You all", "to cycle", "pharmacy"],
                model: "Ihr radelt zur Apotheke."
            },
            {
                id: "d4_3",
                cue: "Ihr / fahren / die Schule",
                cueParts: ["Ihr", "fahren", "die Schule"],
                hints: ["You all", "to drive", "school"],
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
    const stripped = typeof DrillAnswer !== "undefined" && typeof DrillAnswer.stripSpeechFillers === "function"
        ? DrillAnswer.stripSpeechFillers(text, "de")
        : String(text);
    return stripped
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
    const evalTokens = [];
    const fillerTokens = [];
    rawDisplayTokens.forEach((t, origIdx) => {
        const norm = normalizeGerman(t);
        if (norm) {
            evalTokens.push({ display: t, norm, origIdx });
        } else {
            fillerTokens.push({ text: t, status: "correct", origIdx });
        }
    });
    const targetTokens = targetNorm.split(" ").filter(Boolean);

    const m = evalTokens.length;
    const n = targetTokens.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = evalTokens[i - 1].norm === targetTokens[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j - 1] + cost,
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1
            );
        }
    }

    // Backtrack with deterministic tie-breaking:
    // 1. Match -> 2. Substitution -> 3. Insertion in STT (extra learner word) -> 4. Deletion in STT (missing word ＿)
    const alignedCore = [];
    let i = m;
    let j = n;
    let matchedCount = 0;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && evalTokens[i - 1].norm === targetTokens[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
            alignedCore.push({ text: evalTokens[i - 1].display, status: "correct", origIdx: evalTokens[i - 1].origIdx });
            matchedCount++;
            i--;
            j--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            alignedCore.push({ text: evalTokens[i - 1].display, status: "incorrect", origIdx: evalTokens[i - 1].origIdx });
            i--;
            j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            alignedCore.push({ text: evalTokens[i - 1].display, status: "incorrect", origIdx: evalTokens[i - 1].origIdx });
            i--;
        } else {
            alignedCore.push({ text: "＿", status: "missing", origIdx: null });
            j--;
        }
    }

    alignedCore.reverse();

    const aligned = [];
    let fIdx = 0;
    for (const item of alignedCore) {
        while (fIdx < fillerTokens.length && (item.origIdx === null ? false : fillerTokens[fIdx].origIdx < item.origIdx)) {
            aligned.push({ text: fillerTokens[fIdx].text, status: "correct" });
            fIdx++;
        }
        aligned.push({ text: item.text, status: item.status });
    }
    while (fIdx < fillerTokens.length) {
        aligned.push({ text: fillerTokens[fIdx].text, status: "correct" });
        fIdx++;
    }

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

function initSttGuideD11() {
    window.DrillTooltips?.initGuideTooltips({
        selector: '.uebung11-page .p82-guide-tip-wrap',
    });
}

function initGermanDrill() {
    window.__enableDrillTooltipEscapeDismiss = true;
    window.DrillTooltips?.enableEscapeDismiss();
    initSttGuideD11();

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
    const views = new Map(); // key -> { item, rec, listen, result, correction }

    const VOICE_STORAGE_KEY = "october2026.german.selectedVoiceName";
    let preferredVoiceName = localStorage.getItem(VOICE_STORAGE_KEY) || null;
    const INCOMPLETE_TIPS = ["Getting closer!", "Almost there!", "Keep it up!", "Nice flow!", "Great start!"];

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
        if (item.cueParts && item.hints && item.cueParts.length === item.hints.length) {
            const parts = item.cueParts.map((rawPart, idx) => {
                const isRegionalPlace = idx === 2 && Boolean(item.regionalCuePlaces);
                const part = isRegionalPlace
                    ? (item.regionalCuePlaces[currentVariety] || rawPart)
                    : rawPart;
                let partHtml;
                if (hintMode === "off") {
                    partHtml = part;
                } else {
                    const hint = item.hints[idx];
                    if (!hint) {
                        partHtml = part;
                    } else if (hintMode === "paren") {
                        partHtml = `${part} <span class="vocab-inline">(${hint})</span>`;
                    } else {
                        partHtml = `<span class="tooltip-wrap" tabindex="0"><span class="target-word">${part}</span><span class="tooltip-tip">${hint}</span></span>`;
                    }
                }
                if (isRegionalPlace) {
                    const altHtml = currentVariety === "DE"
                        ? `<span class="uebung-cue-alt-line"><span class="uebung-cue-alt-flags">${createFlagSvgMarkup("AT")}${createFlagSvgMarkup("CH")}</span><span class="uebung-cue-alt-text">das Spital</span></span>`
                        : `<span class="uebung-cue-alt-line"><span class="uebung-cue-alt-flags">${createFlagSvgMarkup("DE")}</span><span class="uebung-cue-alt-text">das Krankenhaus</span></span>`;
                    return `<span class="uebung-cue-place-stack">${partHtml}${altHtml}</span>`;
                }
                return partHtml;
            });
            return parts.join(" / ");
        }
        return item.cue;
    }

    function wrapAudioIcon(iconNode) {
        const span = node("span", "ex-audio-icon");
        if (iconNode) span.append(iconNode);
        return span;
    }

    function setButtonAudioIcon(btn, iconName, variant = "regular") {
        if (!btn || !window.FluentIcons) return;
        const icon = window.FluentIcons.create(iconName, 20, "", variant);
        const iconWrap = btn.querySelector(".ex-audio-icon");
        if (iconWrap) {
            iconWrap.replaceChildren(icon);
        } else {
            btn.prepend(wrapAudioIcon(icon));
        }
    }

    function sync() {
        const busy = Boolean(session || preparing);
        const playing = Boolean(playingButton || activeExButton || relayKey);
        const locked = busy || playing;
        const relayView = relayKey ? views.get(relayKey) : null;
        const relayPlayBtn = relayView?.mainRow?.querySelector(".play-recording-btn");

        document.querySelectorAll(
            ".compact-settings button, .compact-settings input, #voiceSelect"
        ).forEach(el => {
            el.disabled = locked;
        });

        document.querySelectorAll(
            "#drillsContainer button:not(.uebung-copy-button)"
        ).forEach(el => {
            const isCurrentPlaybackStop =
                el === playingButton ||
                el === activeExButton ||
                (relayView && (el === relayView.listen || el === relayPlayBtn));
            el.disabled = isCurrentPlaybackStop ? busy : locked;
        });

        views.forEach((v, key) => {
            const isRecordingTarget = session?.key === key;
            const canManualStop = isRecordingTarget && session.manual && !session.stopping;
            v.rec.classList.toggle("stop-btn-active", canManualStop);
            setButtonAudioIcon(v.rec, isRecordingTarget ? "stop" : "mic", "regular");
            v.rec.setAttribute(
                "aria-label",
                isRecordingTarget ? (canManualStop ? "Aufnahme stoppen" : "Aufnahme läuft") : "Antwort aufnehmen"
            );
            v.rec.disabled = isRecordingTarget ? !canManualStop : locked;

            const showAutostop = isRecordingTarget && Boolean(session?.recordingStarted && !session.manual && !session.stopping);
            if (v.autostopHost) {
                const wasOpen = v.autostopHost.classList.contains("p82-autostop-open");
                if (showAutostop) {
                    if (!wasOpen) {
                        v.autostopHost.classList.add("custom-tip-wrap", "p82-autostop-open");
                        window.DrillTooltips?.position(v.autostopHost, v.autostopTip);
                    }
                } else {
                    v.autostopHost.classList.remove("custom-tip-wrap", "p82-autostop-open");
                }
            }

            if (v.rec.dataset.introTip && !isRecordingTarget) {
                let tip = v.rec.querySelector(".custom-tip-box");
                if (!tip) {
                    tip = node("span", "custom-tip-box", v.rec.dataset.introTip);
                    v.rec.append(tip);
                } else if (tip.textContent !== v.rec.dataset.introTip) {
                    tip.textContent = v.rec.dataset.introTip;
                }
                v.rec.classList.add("custom-tip-wrap");
            } else {
                v.rec.querySelector(".custom-tip-box")?.remove();
                v.rec.classList.remove("custom-tip-wrap");
            }
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
                delete tip.dataset.viewportTip;
                tip.style.removeProperty("--tip-left");
                tip.style.removeProperty("--tip-top");
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
        const playBtn = rv.mainRow?.querySelector(".play-recording-btn");
        if (rv.listen) {
            setButtonAudioIcon(rv.listen, "speaker2", "regular");
        }
        if (playBtn) {
            setButtonAudioIcon(playBtn, "playCircle", "regular");
        }
        [rv.listen, playBtn].forEach(b => {
            if (!b) return;
            b.classList.remove("is-playing", "p82-autoplay-stop");
            delete b.dataset.keepPlayback;
            if (b._relayAriaLabel !== undefined) {
                if (b._relayAriaLabel === null) b.removeAttribute("aria-label");
                else b.setAttribute("aria-label", b._relayAriaLabel);
                delete b._relayAriaLabel;
            }
            if (b._relayTipText !== undefined) {
                applyRelayTip(b, b._relayTipText);
                delete b._relayTipText;
            }
            if (b.matches(":hover") || b.matches(":focus-visible") || Boolean(b.querySelector(":focus-visible"))) {
                b.setAttribute("data-tip-action-suppressed", "true");
            }
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
            delete activeExButton.dataset.keepPlayback;
            setButtonAudioIcon(activeExButton, "speaker2", "regular");
            if (activeExButton._originalAriaLabel !== undefined) {
                if (activeExButton._originalAriaLabel === null) activeExButton.removeAttribute("aria-label");
                else activeExButton.setAttribute("aria-label", activeExButton._originalAriaLabel);
                delete activeExButton._originalAriaLabel;
            }
            activeExButton = null;
        }
        if (playingButton) {
            const restoredName = playingButton.classList.contains("play-recording-btn") ? "playCircle" : "speaker2";
            setButtonAudioIcon(playingButton, restoredName, "regular");
            delete playingButton.dataset.keepPlayback;
            if (playingButton._originalAriaLabel !== undefined) {
                if (playingButton._originalAriaLabel === null) playingButton.removeAttribute("aria-label");
                else playingButton.setAttribute("aria-label", playingButton._originalAriaLabel);
                delete playingButton._originalAriaLabel;
            }
            playingButton.classList.remove("is-playing");
            if (playingButton._savedTipText !== undefined) {
                applyRelayTip(playingButton, playingButton._savedTipText);
                delete playingButton._savedTipText;
            }
            if (playingButton.matches(":hover") || playingButton.matches(":focus-visible") || Boolean(playingButton.querySelector(":focus-visible"))) {
                playingButton.setAttribute("data-tip-action-suppressed", "true");
            }
            playingButton = null;
        }
        sync();
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
        DrillAudio.invalidatePlayback();
        stopPlayback();
    }

    function markExPlaying(b) {
        if (!b) return;
        activeExButton = b;
        b.classList.add("is-playing");
        b.dataset.keepPlayback = "true";
        setButtonAudioIcon(b, "stop", "regular");
        b._originalAriaLabel = b.getAttribute("aria-label");
        b.setAttribute("aria-label", "Wiedergabe stoppen");
        b.disabled = false;
        sync();
    }

    function markPlaying(b) {
        if (!b) return;
        if (b.dataset?.isExAudio === "true") {
            markExPlaying(b);
            return;
        }
        playingButton = b;
        const existingTip = b.querySelector(".custom-tip-box");
        if (existingTip) {
            b._savedTipText = existingTip.textContent;
            existingTip.remove();
            b.classList.remove("custom-tip-wrap");
        }
        b.classList.add("is-playing");
        b.dataset.keepPlayback = "true";
        b.disabled = false;
        b._originalAriaLabel = b.getAttribute("aria-label");
        b.setAttribute("aria-label", "Wiedergabe stoppen");
        setButtonAudioIcon(b, "stop", "regular");
        sync();
    }

    // -------------------------------------------------------------
    // German TTS Notice Banner Controller
    // -------------------------------------------------------------
    let currentNoticeKind = null; // 'startup' | 'playback' | null

    function showGermanTtsNotice({ type = "warning", title, message, isStartup = false }) {
        const banner = document.getElementById("germanTtsNotice");
        if (!banner) return;

        const iconEl = banner.querySelector(".german-tts-notice-icon");
        const titleEl = banner.querySelector(".german-tts-notice-title");
        const msgEl = banner.querySelector(".german-tts-notice-message");

        if (iconEl && window.FluentIcons) {
            const iconName = type === "error" ? "errorCircleFilled" : "warningFilled";
            iconEl.replaceChildren(window.FluentIcons.create(iconName, 20, "uebung-warning-svg", "filled"));
        }
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
            if (isDelayedCheck) {
                updateVoiceSelector();
            }
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
            const setInfoNotice = (msg) => {
                notice.replaceChildren();
                if (window.FluentIcons) {
                    notice.append(window.FluentIcons.create("info", 20, "uebung-info-svg", "regular"), document.createTextNode(" " + msg));
                } else {
                    notice.textContent = msg;
                }
                notice.setAttribute("role", "status");
                notice.setAttribute("aria-live", "polite");
                notice.hidden = false;
            };
            if (!voices.length) {
                notice.replaceChildren();
                notice.hidden = true;
            } else if (!hasDirectLocale) {
                const label = currentVariety === "AT" ? "de-AT (Austria)" : (currentVariety === "CH" ? "de-CH (Switzerland)" : "de-DE (Germany)");
                setInfoNotice(`No native ${label} voice detected on this device. Using ${chosen ? chosen.name : "system voice"} with ${targetLocaleForVariety(currentVariety)} tag.`);
            } else {
                notice.replaceChildren();
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
            stopAllPlayback();
            if (btn) markPlaying(btn);
        }

        if (!("speechSynthesis" in window)) {
            showGermanTtsNotice({
                type: "error",
                title: "German audio is not supported",
                message: "Your browser does not support speech synthesis. Please try a compatible browser.",
                isStartup: false
            });
            if (!isRelay) stopPlayback(true);
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

        const playGen = playbackGeneration;
        const token = {
            id: ++playbackTokenSeq,
            playGen,
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
            if (activePlaybackToken === token && token.playGen === playbackGeneration && !token.started && !token.userCancelled) {
                token.userCancelled = true;
                if (currentUtterance === u) currentUtterance = null;
                activePlaybackToken = null;
                if (!isRelay) {
                    stopPlayback(true);
                } else {
                    onDone?.();
                }
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
            if (token.playGen !== playbackGeneration || activePlaybackToken !== token || currentUtterance !== u) return;
            token.handled = true;

            currentUtterance = null;
            activePlaybackToken = null;

            if (!isRelay) {
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

        if (btn) markPlaying(btn);
        const gen = playbackGeneration;
        const audio = new Audio(entry.url);
        activeAudio = audio;

        let cleaned = false;

        const cleanup = () => {
            if (cleaned || gen !== playbackGeneration || activeAudio !== audio) return;
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
            v.mainRow.replaceChildren(v.result);
            v.subRow.replaceChildren();
            v.subRow.hidden = true;
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

        const autoRecEl = document.getElementById("toggleRecordMode");
        const isManual = autoRecEl ? !autoRecEl.checked : manual;
        manual = isManual;

        const s = {
            key,
            manual: isManual,
            recordingStarted: false,
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

        const recordingStartedAt = Date.now();
        let firstRecognizedAt = null;
        const hasValidSttText = text => {
            const cleaned = normalizeGerman(text || "").replace(/[\p{P}\p{S}\s]/gu, "");
            return Boolean(cleaned);
        };
        const hasRecognizedText = () => hasValidSttText(s.raw) || hasValidSttText(s.interim);
        const hasProtected5sStt = () =>
            firstRecognizedAt !== null &&
            (firstRecognizedAt - recordingStartedAt) <= 5000 &&
            hasRecognizedText();
        const hasProtectedStt = () => s.manual ? hasRecognizedText() : hasProtected5sStt();

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

            if (!s.discard && s.interim?.trim()) {
                s.raw += s.interim;
            }
            s.interim = "";

            const raw = s.discard ? "" : s.raw.trim();
            const recModel = getModel(item, currentVariety);

            const previous = saved.get(key) || {};
            const normRaw = normalizeGerman(raw);
            let url = "";

            const hasValidAudio = !s.discard && (s.speechStarted || Boolean(raw && normRaw)) && s.chunks.length > 0;
            if (raw && normRaw && hasValidAudio) {
                try {
                    url = URL.createObjectURL(
                        new Blob(s.chunks, { type: s.recorder?.mimeType || "audio/webm" })
                    );
                } catch (_) {
                    url = "";
                }
            }

            if (!s.discard && raw && normRaw) {
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

            if (autoplay && !s.discard && raw && url) {
                stopAllPlayback();
                const currentView = views.get(key);
                const playBtn = currentView?.mainRow?.querySelector(".play-recording-btn");
                const gen = ++playbackGeneration;
                relayKey = key;
                [currentView?.listen, playBtn].forEach(b => {
                    if (!b) return;
                    b._relayAriaLabel = b.getAttribute("aria-label");
                    const existingTip = b.querySelector(".custom-tip-box");
                    b._relayTipText = existingTip ? existingTip.textContent : null;
                    b.classList.add("is-playing", "p82-autoplay-stop");
                    b.removeAttribute("data-tip-action-suppressed");
                    b.dataset.keepPlayback = "true";
                    b.disabled = false;
                    b.setAttribute("aria-label", "Wiedergabe stoppen");
                    setButtonAudioIcon(b, "stop", "regular");
                    applyRelayTip(b, "Auto-Compare: ON");
                });
                sync();
                suppressRelayPreStop = true;
                try {
                    DrillAudio.playRelay({
                        recordButton: currentView.rec,
                        result: currentView.mainRow,
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
            s.discard = discard || (!s.speechStarted && !hasProtectedStt());

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
                if (s.finished || s.discard) return;
                let finalStr = "";
                let interimStr = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const trans = event.results[i][0].transcript;
                    if (event.results[i].isFinal) finalStr += trans;
                    else if (!s.stopping) interimStr += trans;
                }
                if (finalStr) {
                    s.raw += finalStr;
                    if (s.stopping) s.interim = "";
                }
                if (!s.stopping) {
                    s.interim = interimStr;
                }
                if (firstRecognizedAt === null && hasRecognizedText()) {
                    firstRecognizedAt = Date.now();
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
            s.recordingStarted = true;
            sync();
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
            analyser.fftSize = 1024;
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

                const sound = volume > 0.015;
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
        // 1. 5s limit before speech starts (Autostop ON only)
        if (!s.manual) {
            s.timers.push(setTimeout(() => {
                if (!s.speechStarted && !hasProtected5sStt()) {
                    s.stop("No speech detected within 5 seconds.", true, "timeout-5s");
                }
            }, 5000));
        }

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
        v.mainRow.replaceChildren(v.result);
        v.subRow.replaceChildren();
        v.subRow.hidden = true;
        v.correction.replaceChildren();
        v.correction.hidden = true;

        if (session?.key === key) {
            v.result.classList.remove("not-recorded-yet");
            v.result.classList.add("recording-status");
            v.result.textContent = "Recording...";
            return;
        }

        let noticeHandledInMain = false;

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
                tipWrap.tabIndex = 0;
                const tip = node("span", "custom-tip-box", INCOMPLETE_TIPS[Math.floor(Math.random() * INCOMPLETE_TIPS.length)]);
                tip.setAttribute("role", "tooltip");
                tipWrap.append(svg, tip);
                const reroll = () => {
                    tip.textContent = INCOMPLETE_TIPS[Math.floor(Math.random() * INCOMPLETE_TIPS.length)];
                    window.DrillTooltips?.position(tipWrap, tip);
                };
                tipWrap.addEventListener("mouseenter", reroll);
                tipWrap.addEventListener("focus", reroll);
                v.result.append(tipWrap, document.createTextNode(val.raw.trimEnd() + "…"));
                v.correction.hidden = true;
            } else if (judgment === "mismatch") {
                FeedbackStatus.setMismatch(v.correction);
                const retryUnit = v.correction.firstElementChild || v.correction;
                const fire = retryUnit.querySelector(".feedback-retry-fire") || retryUnit.querySelector("svg");
                if (fire) v.result.append(fire);

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

                v.subRow.append(retryUnit);
                v.correction.hidden = true;
            }
        } else if (val?.judgment === "empty" || notice === "No transcription available.") {
            v.result.append(node("span", "result-notice", "No transcription available."));
            if (notice === "No transcription available.") {
                noticeHandledInMain = true;
            }
        } else {
            v.result.classList.add("not-recorded-yet");
            v.result.textContent = "… Not yet";
        }

        if (val?.url) {
            const playIcon = wrapAudioIcon(window.FluentIcons.create("playCircle", 20));
            const playTip = key === "d1_1" ? "Play your recorded voice." : "";
            const play = button(playIcon, playTip, () => {
                playRecording(key, play);
            });
            play.classList.add("play-recording-btn");
            play.dataset.audioRole = "play";
            v.mainRow.append(play);
        }

        if (val?.raw && val.judgment === "accepted" && val.supplement) {
            const noteText = val.supplement.replace(/^(?:🇩🇪|🇦🇹|🇨🇭)\s*/, "");
            const noteVariety = val.supplement.startsWith("🇦🇹") ? "AT" : (val.supplement.startsWith("🇨🇭") ? "CH" : "DE");
            const supp = node("span", "uebung-regional-note");
            supp.append(createFlagSvgElement(noteVariety), document.createTextNode(" " + noteText));
            v.subRow.append(supp);
        }

        if (notice && !noticeHandledInMain) {
            v.subRow.append(node("span", "result-notice", notice));
        }

        v.subRow.hidden = v.subRow.childElementCount === 0;
    }

    // -------------------------------------------------------------
    // 6. Copy My Sentences
    // -------------------------------------------------------------
    function buildDrillCopyBlock(drill, dateStr) {
        const entries = [];
        drill.items.forEach((item, idx) => {
            const entry = saved.get(item.id);
            if (entry?.raw && entry.judgment !== "empty") {
                const marker = entry.judgment === "accepted" ? "✅" : (entry.judgment === "incomplete" ? "👣" : "🔥");
                entries.push(`${idx + 1}. ${marker} ${entry.raw}`);
            }
        });
        if (!entries.length) return "";
        const cleanTitle = drill.title.replace(/^Drill \d+:\s*/, "").split(/\s*—\s*/)[0].trim();
        const header = `Deutsche Übung 1.1 — Drill ${drill.number}: ${cleanTitle} — ${dateStr}`;
        return `${header}\n${entries.join("\n")}`;
    }

    function updateCopyButtons() {
        let hasAnyUpTo = false;
        drillsData.forEach(drill => {
            const hasDrillRecordings = drill.items.some(item => {
                const s = saved.get(item.id);
                return Boolean(s?.raw && s.judgment !== "empty");
            });
            if (hasDrillRecordings) hasAnyUpTo = true;

            const area = document.querySelector(`.uebung-copy-area[data-drill="${drill.number}"]`);
            if (!area) return;
            const btn = area.querySelector(".uebung-copy-button");
            if (!btn) return;

            btn.disabled = Boolean(session || preparing || !hasAnyUpTo);
            btn.style.setProperty("cursor", btn.disabled ? "default" : "pointer", "important");
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

        const help = node("span", "uebung-copy-help", "Copy your drill results to review or share.");

        let copyTimer = null;

        btn.onclick = async () => {
            if (session || preparing) return;
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const targetIdx = drillsData.indexOf(drill);
            const blocks = drillsData
                .slice(0, targetIdx >= 0 ? targetIdx + 1 : drillsData.length)
                .map(d => buildDrillCopyBlock(d, dateStr))
                .filter(Boolean);
            if (!blocks.length) return;
            const fullText = blocks.join("\n\n");

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

    const lastRowWidths = new WeakMap();

    function alignDrillCues(force = true) {
        const measureIntrinsicWidth = (target, host, displayMode = "inline-block") => {
            const copy = target.cloneNode(true);
            copy.querySelectorAll(".tooltip-tip, .custom-tip-box").forEach(t => t.remove());
            Object.assign(copy.style, {
                position: "absolute",
                visibility: "hidden",
                display: displayMode,
                width: "max-content",
                minWidth: "0",
                maxWidth: "none",
                whiteSpace: "nowrap",
                transform: "none"
            });
            host.append(copy);
            const w = copy.getBoundingClientRect().width;
            copy.remove();
            return w;
        };

        ["drill1", "drill2", "drill3", "drill4"].forEach(drillId => {
            const section = document.getElementById(drillId);
            if (!section) return;
            const rows = [...section.querySelectorAll(".drill-row")];
            if (!rows.length) return;

            const widthChanged = force || rows.some(row => {
                const style = getComputedStyle(row);
                const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
                const available = row.clientWidth - pad;
                const prev = lastRowWidths.get(row);
                return prev === undefined || Math.abs(available - prev) >= 0.25;
            });
            if (!widthChanged) return;

            const cues = section.querySelectorAll(".drill-row .drill-cue-cell");
            let max = 0;
            cues.forEach(cell => {
                const span = cell.querySelector(".cue-content") || cell;
                const w = measureIntrinsicWidth(span, cell, "inline-block");
                if (w > max) max = w;
            });
            const cueWidth = max > 0 ? Math.ceil(max) + 8 : 0;
            if (cueWidth > 0) {
                section.style.setProperty("--drill-cue-width", `${cueWidth}px`);
            }

            const minResultWidth = 120;
            rows.forEach(row => {
                const table = row.querySelector(".recording-table");
                const actions = row.querySelector(".recording-actions");
                if (!table || !actions) return;

                const style = getComputedStyle(row);
                const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
                const available = row.clientWidth - pad;
                if (available <= 0) return;

                lastRowWidths.set(row, available);

                const actionsWidth = Math.ceil(measureIntrinsicWidth(actions, row, "inline-flex"));
                const maxCueAllowed = Math.max(0, Math.floor(available - 34 - 16 - actionsWidth - minResultWidth));
                table.style.setProperty("--drill-cue-max-width", `${maxCueAllowed}px`);

                const needed = 34 + 16 + cueWidth + actionsWidth + minResultWidth;
                const currentLayout = table.dataset.controlsLayout || "";
                const nextLayout = !currentLayout
                    ? (needed <= available + 0.25 ? "inline" : "stacked")
                    : (needed <= available - 25
                        ? "inline"
                        : (needed > available + 0.25 ? "stacked" : currentLayout));
                table.dataset.controlsLayout = nextLayout;
            });
        });
    }

    function alignDrill1Cues(force = true) {
        alignDrillCues(force);
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
            const bulb = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            bulb.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            bulb.setAttribute("width", "20");
            bulb.setAttribute("height", "20");
            bulb.setAttribute("viewBox", "0 0 24 24");
            bulb.setAttribute("fill", "none");
            bulb.setAttribute("aria-hidden", "true");
            bulb.setAttribute("class", "p82-lightbulb-icon uebung-instruction-bulb fluent-icon fluent-icon-lightbulb");
            const bulbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            bulbPath.setAttribute("d", "M12 2a7.25 7.25 0 0 1 4.48 12.94c-.28.22-.48.54-.55.89l-.45 2.17H8.52l-.45-2.17a1.75 1.75 0 0 0-.55-.89A7.25 7.25 0 0 1 12 2Zm0 1.5a5.75 5.75 0 0 0-3.55 10.27c.59.46 1 1.12 1.15 1.85l.15.73h4.5l.15-.73c.15-.73.56-1.39 1.15-1.85A5.75 5.75 0 0 0 12 3.5ZM8.76 19h6.48l-.24 1.15A2.25 2.25 0 0 1 12.8 22h-1.6a2.25 2.25 0 0 1-2.2-1.85L8.76 19Zm1.83 1.5c.14.3.44.5.81.5h1.2c.37 0 .67-.2.81-.5h-2.82Z");
            bulbPath.setAttribute("fill", "currentColor");
            bulb.append(bulbPath);
            desc.append(bulb, document.createTextNode(drill.instruction));
            panel.append(
                node("span", "info-panel-title", drill.title),
                desc
            );

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
            section.append(panel);

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
                const listenIcon = wrapAudioIcon(window.FluentIcons.create("speaker2", 20));
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
                const recIcon = wrapAudioIcon(window.FluentIcons.create("mic", 20));
                const recBtn = button(recIcon, recTip, () => {
                    if (session?.key === item.id) {
                        if (session.manual && !session.stopping) {
                            session.stop("", false, "manual");
                        }
                        return;
                    }
                    if (session || preparing) return;
                    if (playingButton || activeExButton || relayKey) return;
                    record(item.id, item);
                });
                if (isFirstItemOfDrill1) {
                    recBtn.dataset.introTip = recTip;
                }
                recBtn.classList.add("drill-record-btn");
                recBtn.dataset.audioRole = "record";
                recBtn.setAttribute("aria-label", "Antwort aufnehmen");

                const autostopHost = node("span", "p82-autostop-tip-host");
                const autostopTip = node("span", "custom-tip-box", "Autostop: ON");
                autostopTip.setAttribute("role", "tooltip");
                autostopHost.append(recBtn, autostopTip);

                actions.append(listenBtn, autostopHost);

                const wrap = node("span", "recording-result");
                const mainRow = node("div", "result-main-row");
                const result = node("span", "result-text");
                mainRow.append(result);
                const subRow = node("div", "result-sub-row");
                subRow.hidden = true;
                const correction = node("div", "correction-box");
                correction.hidden = true;
                wrap.append(mainRow, subRow, correction);
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
                    result,
                    mainRow,
                    subRow,
                    autostopHost,
                    autostopTip,
                    correction
                });

                showResult(item.id);
            });

            // Copy Area (positioned after the last card, outside the card)
            setupCopyArea(drill, section);

            container.append(section);
        });

        alignDrill1Cues(true);
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
        manual = !autoRecInput.checked;
        autoRecInput.addEventListener("change", () => {
            manual = !autoRecInput.checked;
            autoRecLabel?.classList.toggle("active-mode", autoRecInput.checked);
            sync();
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
        alignDrill1Cues(false);
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
    document.fonts?.ready?.then(() => {
        alignDrill1Cues(true);
    });
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
