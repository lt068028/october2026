```js
// ============================================================================
// Pronunciation Drill
// ============================================================================

const modelSentences = [
    {
        targetText: "てんきがいいです",
        symbolColor: "#facc15",
        displayHtml: [
            { text: "て", low: false }, { type: "symbol", val: "↘" },
            { text: "んきが", low: true }, { type: "symbol", val: "｜" },
            { text: "い", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The weather is fine."
    },
    {
        targetText: "じかんがないです",
        symbolColor: "#34d399",
        displayHtml: [
            { text: "じ", low: true }, { type: "symbol", val: "↗" },
            { text: "かんが", low: false }, { type: "symbol", val: "｜" },
            { text: "な", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I don't have time."
    },
    {
        targetText: "しごとがほしいです",
        symbolColor: "#22d3ee",
        displayHtml: [
            { text: "し", low: true }, { type: "symbol", val: "↗" },
            { text: "ごとが", low: false }, { type: "symbol", val: "｜" },
            { text: "ほ", low: true }, { type: "symbol", val: "↗" },
            { text: "し", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "I want a job."
    },
    {
        targetText: "せんせいはおもしろいです",
        symbolColor: "#fb7185",
        displayHtml: [
            { text: "せ", low: true }, { type: "symbol", val: "↗" },
            { text: "んせ", low: false }, { type: "symbol", val: "↘" },
            { text: "いは", low: true }, { type: "symbol", val: "｜" },
            { text: "お", low: true }, { type: "symbol", val: "↗" },
            { text: "もしろ", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "The teacher is interesting."
    },
    {
        targetText: "がっこうはたのしいです",
        symbolColor: "#c084fc",
        displayHtml: [
            { text: "が", low: true }, { type: "symbol", val: "↗" },
            { text: "っこうは", low: false }, { type: "symbol", val: "｜" },
            { text: "た", low: true }, { type: "symbol", val: "↗" },
            { text: "のし", low: false }, { type: "symbol", val: "↘" },
            { text: "いです", low: true }
        ],
        meaning: "School is fun."
    }
];

// ============================================================================
// State & Constants
// ============================================================================

let isManualStop = false;
let isAutoPlay = true; // 基本設定はAutoplay

const SMALL_Y = new Set(["ゃ", "ゅ", "ょ"]);
const SPECIAL_MORA = new Set(["っ", "ん", "ー"]);

// グローバルな再生管理オブジェクト（キャンセル処理用）
let activePlayback = {
    audio: null,
    timeoutId: null,
    cancel: function() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        speechSynthesis.cancel(); // 進行中のTTSを停止
    }
};

// ============================================================================
// Text & Mora Processing
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_~()（）「」。、\s]/g, "");
    cleaned = cleaned.replace(/[ァ-ヶ]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));

    const dict = {
        "天気": "てんき", "電気": "でんき", "時間": "じかん", "仕事": "しごと",
        "欲しい": "ほしい", "先生": "せんせい", "面白い": "おもしろい",
        "学校": "がっこう", "楽しい": "たのしい", "です": "です", "でした": "でした"
    };

    for (const key in dict) {
        cleaned = cleaned.replace(new RegExp(key, "g"), dict[key]);
    }
    return cleaned;
}

function splitIntoMora(text) {
    const chars = Array.from(text);
    const morae = [];
    for (const ch of chars) {
        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }
        morae.push({ text: ch, special: SPECIAL_MORA.has(ch) });
    }
    return morae;
}

function getModelMoraData(itemObj) {
    const charPitch = [];
    itemObj.displayHtml.forEach(part => {
        if (part.type === "symbol") return;
        for (const ch of Array.from(part.text)) {
            charPitch.push({ char: ch, low: !!part.low });
        }
    });
    const targetText = charPitch.map(item => item.char).join("");
    const morae = [];
    const chars = Array.from(targetText);
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }
        const isSpecial = SPECIAL_MORA.has(ch);
        morae.push({
            text: ch,
            special: isSpecial,
            low: isSpecial ? null : charPitch[i].low
        });
    }
    return morae;
}

function compareMoraSequences(modelMorae, learnerMorae) {
    const operations = [];
    let i = 0; let j = 0;

    while (i < modelMorae.length || j < learnerMorae.length) {
        if (i >= modelMorae.length) {
            operations.push({ type: "extra", learner: learnerMorae[j], learnerIndex: j });
            j++; continue;
        }
        if (j >= learnerMorae.length) {
            operations.push({ type: "missing", model: modelMorae[i], modelIndex: i });
            i++; continue;
        }

        const model = modelMorae[i];
        const learner = learnerMorae[j];

        if (model.text === learner.text) {
            operations.push({ type: "match", model, learner, modelIndex: i, learnerIndex: j });
            i++; j++; continue;
        }

        if (j + 1 < learnerMorae.length && model.text === learnerMorae[j + 1].text) {
            operations.push({ type: "extra", learner, learnerIndex: j });
            j++; continue;
        }

        if (i + 1 < modelMorae.length && modelMorae[i + 1].text === learner.text) {
            operations.push({ type: "missing", model, modelIndex: i });
            i++; continue;
        }

        operations.push({ type: "sound-error", model, learner, modelIndex: i, learnerIndex: j });
        i++; j++;
    }
    return operations;
}

// ============================================================================
// UI Rendering
// ============================================================================

function renderPronunciationResult(resultSpan, operations) {
    resultSpan.innerHTML = "";
    resultSpan.style.color = "";

    const recognizedText = operations
        .filter(op => op.type !== "missing")
        .map(op => op.learner ? op.learner.text : "")
        .join("");

    if (recognizedText) {
        const span = document.createElement("span");
        span.className = "pronunciation-normal";
        span.textContent = recognizedText;
        resultSpan.appendChild(span);
    }
    return false;
}

function buildHtmlParts(itemObj) {
    let speechText = "";
    let htmlParts = "";
    itemObj.displayHtml.forEach(part => {
```
