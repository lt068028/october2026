// ============================================================================
// Pronunciation Drill
// ============================================================================

const modelSentences = [
    {
        targetText: "てんきがいいです",
        targetWord: "てんきが",
        symbolColor: "#fb7185",
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
        targetWord: "じかんが",
        symbolColor: "#f43f5e",
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
        targetWord: "しごとが",
        symbolColor: "#fda4af",
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
        targetWord: "せんせいは",
        symbolColor: "#e879f9",
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
        targetWord: "がっこうは",
        symbolColor: "#34d399",
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

let isManualStop = false;


// ============================================================================
// Colors
// ============================================================================

const PITCH_ERROR_COLOR = "#ef4444";
const SOUND_ERROR_COLOR = "#f59e0b";


// ============================================================================
// Hiragana conversion
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g,
        ""
    );

    cleaned = cleaned.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    const dict = {
        "天気": "てんき",
        "時間": "じかん",
        "仕事": "しごと",
        "欲しい": "ほしい",
        "先生": "せんせい",
        "面白い": "おもしろい",
        "学校": "がっこう",
        "楽しい": "たのしい",
        "です": "です",
        "でした": "でした"
    };

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    return cleaned;
}


// ============================================================================
// Mora utilities
// ============================================================================

const SMALL_Y = new Set(["ゃ", "ゅ", "ょ"]);
const SPECIAL_MORA = new Set(["っ", "ん", "ー"]);

function splitIntoMora(text) {
    const chars = Array.from(text);
    const morae = [];

    for (const ch of chars) {

        if (SMALL_Y.has(ch) && morae.length > 0) {
            morae[morae.length - 1].text += ch;
            continue;
        }

        morae.push({
            text: ch,
            special: SPECIAL_MORA.has(ch)
        });
    }

    return morae;
}


// ============================================================================
// Model mora data
// ============================================================================

function getModelMoraData(itemObj) {

    const charPitch = [];

    itemObj.displayHtml.forEach(part => {

        if (part.type === "symbol") return;

        for (const ch of Array.from(part.text)) {
            charPitch.push({
                char: ch,
                low: !!part.low
            });
        }
    });

    const targetText = charPitch
        .map(item => item.char)
        .join("");

    const morae = [];
    const chars = Array.from(targetText);

    for (let i = 0; i < chars.length; i++) {

        const ch = chars[i];

        if (
            SMALL_Y.has(ch) &&
            morae.length > 0
        ) {
            morae[morae.length - 1].text += ch;
            continue;
        }

        const isSpecial = SPECIAL_MORA.has(ch);

        morae.push({
            text: ch,
            special: isSpecial,
            low: isSpecial
                ? null
                : charPitch[i].low
        });
    }

    return morae;
}


// ============================================================================
// Dynamic CSS
// ============================================================================

const styleElement = document.createElement('style');

styleElement.textContent = `
    .header-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: var(--bg-panel);
        border-radius: 6px;
        font-family: sans-serif;
        border: 1px solid var(--border-color);
        flex-wrap: wrap;
        gap: 12px;
    }

    .control-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .mode-label {
        font-weight: bold;
        font-size: 14px;
    }

    .mode-label .emoji-gray {
        filter: grayscale(100%);
        opacity: 0.55;
    }

    .mode-label.active-mode .emoji-gray {
        filter: none;
        opacity: 1;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--button-disabled-bg);
        transition: .3s;
        border-radius: 20px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--accent-color);
    }

    input:checked + .slider:before {
        transform: translateX(16px);
    }

    .drill-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px;
        background: var(--bg-row);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-family: sans-serif;
    }

    .top-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        flex-wrap: wrap;
    }

    .sentence-number {
        font-weight: bold;
        min-width: 30px;
        font-size: 16px;
        color: var(--text-secondary);
    }

    .sentence-label {
        font-weight: normal !important;
        min-width: 220px;
        font-size: 16px;
        color: var(--text-primary);
    }

    button,
    .play-record-btn,
    .meaning-btn {
        padding: 6px 12px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--button-bg);
        color: var(--text-primary);
        font-size: 14px;
        line-height: 1.4;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    button:hover,
    .play-record-btn:hover,
    .meaning-btn:hover {
        background: var(--button-hover);
    }

    button:disabled {
        background: var(--button-disabled-bg);
        color: var(--button-disabled-text);
        cursor: not-allowed;
        border-color: var(--border-color);
    }

    .stop-btn-emoji {
        filter: grayscale(100%);
        opacity: 0.55;
    }

    .stop-btn-active .stop-btn-emoji {
        filter: none;
        opacity: 1;
    }

    .stop-btn-active {
        background-color: var(--rec-active-bg) !important;
        color: var(--rec-active-text) !important;
        border-color: var(--rec-active-bg) !important;
        font-weight: bold;
    }

    .play-record-btn {
        display: none;
        background-color: var(--button-bg);
    }

    .result-container {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-grow: 1;
        margin-left: 10px;
    }

    .result-text {
        font-size: 15px;
        color: var(--text-primary);
        font-weight: normal !important;
    }

    .pronunciation-normal {
        color: var(--text-primary);
    }

    .pronunciation-pitch-error {
        color: ${PITCH_ERROR_COLOR};
        font-weight: normal !important;
    }

    .pronunciation-sound-error {
        color: ${SOUND_ERROR_COLOR};
        font-weight: normal !important;
    }

    .pronunciation-missing {
        color: ${SOUND_ERROR_COLOR};
        font-weight: normal !important;
    }

    .pronunciation-extra {
        color: ${SOUND_ERROR_COLOR};
        font-weight: normal !important;
    }

    .correction-box {
        display: none;
        margin-top: 6px;
        width: 100%;
        padding: 8px;
        background: var(--error-bg);
        border: 1px solid var(--error-border);
        border-radius: 4px;
        font-size: 14px;
        color: var(--error-text);
    }

    .high-pitch {
        text-decoration: overline;
        text-decoration-thickness: 1px;
        font-weight: normal !important;
    }

    .low-pitch {
        text-decoration: underline;
        text-decoration-thickness: 1px;
        font-weight: normal !important;
    }

    .meaning-container {
        position: relative;
        margin-left: auto;
    }

    .meaning-popup {
        display: none;
        position: absolute;
        right: 0;
        bottom: 100%;
        margin-bottom: 6px;
        background: var(--bg-panel);
        border: 1px solid var(--border-color);
        padding: 8px 12px;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        white-space: nowrap;
        font-size: 14px;
        color: var(--text-primary);
        z-index: 10;
        font-weight: normal !important;
    }

    .meaning-popup.show {
        display: block;
    }

    .tooltip-wrap {
        position: relative;
        display: inline-block;
    }

    .tooltip-wrap .tooltip-tip {
        visibility: hidden;
        background-color: var(--tooltip-bg, #333);
        color: var(--tooltip-text, #fff);
        text-align: center;
        border-radius: 4px;
        padding: 4px 8px;
        position: absolute;
        z-index: 20;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 11px;
        white-space: nowrap;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .tooltip-wrap:hover .tooltip-tip {
        visibility: visible;
        opacity: 1;
    }
`;

document.head.appendChild(styleElement);


// ============================================================================
// F0 analysis
// ============================================================================

function calculateRMS(buffer, start, end) {

    let sum = 0;
    let count = 0;

    for (let i = start; i < end; i++) {
        const value = buffer[i];
        sum += value * value;
        count++;
    }

    if (!count) return 0;

    return Math.sqrt(sum / count);
}


function autocorrelationF0(buffer, sampleRate) {

    const minFreq = 70;
    const maxFreq = 350;

    const minLag =
        Math.floor(sampleRate / maxFreq);

    const maxLag =
        Math.floor(sampleRate / minFreq);

    let bestLag = -1;
    let bestCorrelation = 0;

    for (
        let lag = minLag;
        lag <= maxLag;
        lag++
    ) {

        let sum = 0;
        let sumA = 0;
        let sumB = 0;
        let count = 0;

        const limit =
            buffer.length - lag;

        for (let i = 0; i < limit; i++) {

            const a = buffer[i];
            const b = buffer[i + lag];

            sum += a * b;
            sumA += a * a;
            sumB += b * b;

            count++;
        }

        if (!count) continue;

        const denominator =
            Math.sqrt(sumA * sumB);

        if (!denominator) continue;

        const correlation =
            sum / denominator;

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestLag = lag;
        }
    }

    if (
        bestLag < 0 ||
        bestCorrelation < 0.45
    ) {
        return null;
    }

    return sampleRate / bestLag;
}


function extractF0Frames(audioBuffer) {

    const channelData =
        audioBuffer.getChannelData(0);

    const sampleRate =
        audioBuffer.sampleRate;

    const frameDuration = 0.04;
    const hopDuration = 0.02;

    const frameSize =
        Math.floor(
            sampleRate * frameDuration
        );

    const hopSize =
        Math.floor(
            sampleRate * hopDuration
        );

    const frames = [];

    for (
        let start = 0;
        start + frameSize < channelData.length;
        start += hopSize
    ) {

        const end =
            start + frameSize;

        const frame =
            channelData.slice(start, end);

        const rms =
            calculateRMS(
                frame,
                0,
                frame.length
            );

        if (rms < 0.015) {
            frames.push(null);
            continue;
        }

        const f0 =
            autocorrelationF0(
                frame,
                sampleRate
            );

        frames.push(f0);
    }

    return {
        frames,
        frameDuration,
        hopDuration
    };
}


function median(values) {

    const valid =
        values
            .filter(v => v != null)
            .sort((a, b) => a - b);

    if (!valid.length) return null;

    const middle =
        Math.floor(valid.length / 2);

    if (valid.length % 2) {
        return valid[middle];
    }

    return (
        valid[middle - 1] +
        valid[middle]
    ) / 2;
}


// ============================================================================
// Estimate learner pitch per mora
// ============================================================================

function estimateMoraPitch(
    audioBuffer,
    morae
) {

    const channelData =
        audioBuffer.getChannelData(0);

    const sampleRate =
        audioBuffer.sampleRate;

    const totalSamples =
        channelData.length;

    const frameData =
        extractF0Frames(audioBuffer);

    const f0Values =
        frameData.frames.filter(
            value => value != null
        );

    if (f0Values.length < 2) {
        return [];
    }

    const globalMedian =
        median(f0Values);

    if (!globalMedian) {
        return [];
    }

    /*
     * 簡易方式：
     * 有声F0が存在する全体区間をモーラ数に応じて分割する。
     *
     * これは精密なモーラ境界検出ではない。
     * 今回はまず「ブラウザだけで簡易判定できるか」を
     * 確認するための第一段階として使用する。
     */

    let firstVoiced = -1;
    let lastVoiced = -1;

    for (
        let i = 0;
        i < frameData.frames.length;
        i++
    ) {

        if (
            frameData.frames[i] != null
        ) {

            if (firstVoiced < 0) {
                firstVoiced = i;
            }

            lastVoiced = i;
        }
    }

    if (
        firstVoiced < 0 ||
        lastVoiced < firstVoiced
    ) {
        return [];
    }

    const result = [];

    const voicedFrameCount =
        lastVoiced - firstVoiced + 1;

    const normalMorae =
        morae.filter(
            mora => !mora.special
        );

    if (!normalMorae.length) {
        return [];
    }

    let normalIndex = 0;

    for (const mora of morae) {

        if (mora.special) {
            result.push({
                mora,
                f0: null,
                high: null
            });

            continue;
        }

        const startRatio =
            normalIndex /
            normalMorae.length;

        const endRatio =
            (normalIndex + 1) /
            normalMorae.length;

        const startFrame =
            Math.floor(
                firstVoiced +
                voicedFrameCount * startRatio
            );

        const endFrame =
            Math.floor(
                firstVoiced +
                voicedFrameCount * endRatio
            );

        const values = [];

        for (
            let i = startFrame;
            i < endFrame;
            i++
        ) {

            if (
                frameData.frames[i] != null
            ) {
                values.push(
                    frameData.frames[i]
                );
            }
        }

        const moraF0 =
            median(values);

        result.push({
            mora,
            f0: moraF0,
            high:
                moraF0 == null
                    ? null
                    : moraF0 >= globalMedian
        });

        normalIndex++;
    }

    return result;
}


// ============================================================================
// Compare mora sequence
// ============================================================================

function compareMoraSequences(
    modelMorae,
    learnerMorae
) {

    const operations = [];

    let i = 0;
    let j = 0;

    while (
        i < modelMorae.length ||
        j < learnerMorae.length
    ) {

        if (
            i >= modelMorae.length
        ) {

            operations.push({
                type: "extra",
                learner: learnerMorae[j]
            });

            j++;
            continue;
        }

        if (
            j >= learnerMorae.length
        ) {

            operations.push({
                type: "missing",
                model: modelMorae[i]
            });

            i++;
            continue;
        }

        const model =
            modelMorae[i];

        const learner =
            learnerMorae[j];

        if (
            model.text ===
            learner.text
        ) {

            operations.push({
                type: "match",
                model,
                learner,
                modelIndex: i,
                learnerIndex: j
            });

            i++;
            j++;

            continue;
        }

        /*
         * 直後の文字が一致する場合、
         * 現在の学習者側が余分と判断する。
         */

        if (
            j + 1 < learnerMorae.length &&
            model.text ===
                learnerMorae[j + 1].text
        ) {

            operations.push({
                type: "extra",
                learner: learner
            });

            j++;
            continue;
        }

        /*
         * 直後のモデル文字が一致する場合、
         * 現在のモデル側が欠落と判断する。
         */

        if (
            i + 1 < modelMorae.length &&
            modelMorae[i + 1].text ===
                learner.text
        ) {

            operations.push({
                type: "missing",
                model: model
            });

            i++;
            continue;
        }

        /*
         * どちらにも対応しない場合は、
         * 音そのものの不一致。
         */

        operations.push({
            type: "sound-error",
            model,
            learner,
            modelIndex: i,
            learnerIndex: j
        });

        i++;
        j++;
    }

    return operations;
}


// ============================================================================
// Render pronunciation result
// ============================================================================

function renderPronunciationResult(
    resultSpan,
    operations,
    learnerPitch,
    targetText
) {

    resultSpan.innerHTML = "";

    let hasError = false;

    const learnerPitchMap = new Map();

    learnerPitch.forEach(
        (item, index) => {
            learnerPitchMap.set(
                index,
                item
            );
        }
    );

    operations.forEach(operation => {

        if (
            operation.type ===
            "match"
        ) {

            const span =
                document.createElement("span");

            span.textContent =
                operation.learner.text;

            /*
             * 特殊モーラは高低比較しない。
             */

            if (
                operation.model.special
            ) {

                span.className =
                    "pronunciation-normal";

            } else {

                const pitch =
                    learnerPitchMap.get(
                        operation.learnerIndex
                    );

                if (
                    pitch &&
                    pitch.high != null &&
                    operation.model.low != null
                ) {

                    const learnerLow =
                        !pitch.high;

                    if (
                        learnerLow !==
                        operation.model.low
                    ) {

                        span.className =
                            "pronunciation-pitch-error";

                        hasError = true;

                    } else {

                        span.className =
                            "pronunciation-normal";
                    }

                } else {

                    span.className =
                        "pronunciation-normal";
                }
            }

            resultSpan.appendChild(span);

            return;
        }


        if (
            operation.type ===
            "sound-error"
        ) {

            const span =
                document.createElement("span");

            span.className =
                "pronunciation-sound-error";

            span.textContent =
                operation.learner.text;

            resultSpan.appendChild(span);

            hasError = true;

            return;
        }


        if (
            operation.type ===
            "missing"
        ) {

            const span =
                document.createElement("span");

            span.className =
                "pronunciation-missing";

            span.textContent =
                `[${operation.model.text}×]`;

            resultSpan.appendChild(span);

            hasError = true;

            return;
        }


        if (
            operation.type ===
            "extra"
        ) {

            const span =
                document.createElement("span");

            span.className =
                "pronunciation-extra";

            span.textContent =
                `[${operation.learner.text}+]`;

            resultSpan.appendChild(span);

            hasError = true;
        }
    });


    if (!hasError) {

        const checkSpan =
            document.createElement("span");

        checkSpan.textContent =
            " ✅️";

        checkSpan.style.color =
            "var(--text-primary)";

        resultSpan.appendChild(
            checkSpan
        );
    }

    return hasError;
}


// ============================================================================
// Analyze recorded audio
// ============================================================================

async function analyzeRecordedAudio(
    audioBlob,
    modelMorae,
    operations,
    resultSpan
) {

    if (!audioBlob) return;

    try {

        const arrayBuffer =
            await audioBlob.arrayBuffer();

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audioContext =
            new AudioContext();

        const audioBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer
            );

        const normalMoraCount =
            modelMorae.filter(
                mora => !mora.special
            ).length;

        if (!normalMoraCount) {
            await audioContext.close();
            return;
        }

        const learnerMorae =
            operations
                .filter(
                    operation =>
                        operation.type ===
                        "match" ||
                        operation.type ===
                        "sound-error"
                )
                .map(
                    operation =>
                        operation.learner
                );

        /*
         * 高低解析は、認識された発話側の
         * 通常モーラ数を基準に行う。
         */

        const pitchMorae =
            learnerMorae.map(
                mora => ({
                    ...mora
                })
            );

        const estimatedPitch =
            estimateMoraPitch(
                audioBuffer,
                pitchMorae
            );

        /*
         * operationsの learnerIndex に
         * 対応する簡易F0を戻す。
         */

        let pitchIndex = 0;

        const learnerPitchMap =
            new Map();

        for (
            let i = 0;
            i < pitchMorae.length;
            i++
        ) {

            const item =
                estimatedPitch[i];

            learnerPitchMap.set(
                pitchIndex,
                item
            );

            pitchIndex++;
        }

        /*
         * 実際の表示をもう一度構築する。
         */

        resultSpan.innerHTML = "";

        let hasError = false;

        operations.forEach(operation => {

            if (
                operation.type ===
                "match"
            ) {

                const span =
                    document.createElement("span");

                span.textContent =
                    operation.learner.text;

                if (
                    operation.model.special
                ) {

                    span.className =
                        "pronunciation-normal";

                } else {

                    const pitch =
                        learnerPitchMap.get(
                            operation.learnerIndex
                        );

                    if (
                        pitch &&
                        pitch.high != null
                    ) {

                        const learnerLow =
                            !pitch.high;

                        if (
                            learnerLow !==
                            operation.model.low
                        ) {

                            span.className =
                                "pronunciation-pitch-error";

                            hasError = true;

                        } else {

                            span.className =
                                "pronunciation-normal";
                        }

                    } else {

                        span.className =
                            "pronunciation-normal";
                    }
                }

                resultSpan.appendChild(span);

                return;
            }


            if (
                operation.type ===
                "sound-error"
            ) {

                const span =
                    document.createElement("span");

                span.className =
                    "pronunciation-sound-error";

                span.textContent =
                    operation.learner.text;

                resultSpan.appendChild(span);

                hasError = true;

                return;
            }


            if (
                operation.type ===
                "missing"
            ) {

                const span =
                    document.createElement("span");

                span.className =
                    "pronunciation-missing";

                span.textContent =
                    `[${operation.model.text}×]`;

                resultSpan.appendChild(span);

                hasError = true;

                return;
            }


            if (
                operation.type ===
                "extra"
            ) {

                const span =
                    document.createElement("span");

                span.className =
                    "pronunciation-extra";

                span.textContent =
                    `[${operation.learner.text}+]`;

                resultSpan.appendChild(span);

                hasError = true;
            }
        });


        if (!hasError) {

            const checkSpan =
                document.createElement("span");

            checkSpan.textContent =
                " ✅️";

            checkSpan.style.color =
                "var(--text-primary)";

            resultSpan.appendChild(
                checkSpan
            );
        }

        await audioContext.close();

    } catch (error) {

        console.error(
            "F0 analysis error:",
            error
        );

        /*
         * F0解析に失敗しても、
         * 文字・モーラ判定自体は残す。
         */

        renderPronunciationResult(
            resultSpan,
            operations,
            [],
            ""
        );
    }
}


// ============================================================================
// Drill initialization
// ============================================================================

function initDrill() {

    const drillList =
        document.getElementById(
            'drillList'
        );

    if (!drillList) return;

    drillList.innerHTML = "";

    const headerPanel =
        document.createElement('div');

    headerPanel.className =
        'header-panel';

    const titleArea =
        document.createElement('span');

    titleArea.innerHTML =
        "<strong>Pronunciation Drills</strong>";

    titleArea.style.color =
        "var(--text-primary)";

    const controlItem =
        document.createElement('div');

    controlItem.className =
        'control-item';

    const labelAuto =
        document.createElement('span');

    labelAuto.className =
        'mode-label active-mode custom-tip-wrap';

    labelAuto.innerHTML =
        '<span class="emoji-gray">⏹</span>Autostop' +
        '<span class="custom-tip-box">' +
        'Automatically stops recording when you stop speaking.' +
        '</span>';

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

    labelManual.className =
        'mode-label inactive-mode custom-tip-wrap';

    labelManual.innerHTML =
        '<span class="emoji-gray">⏹</span>Manual stop' +
        '<span class="custom-tip-box">' +
        'Records continuously until you click the stop button.' +
        '</span>';

    switchInput.addEventListener(
        'change',
        (e) => {

            isManualStop =
                e.target.checked;

            if (isManualStop) {

                labelManual.className =
                    'mode-label active-mode custom-tip-wrap';

                labelAuto.className =
                    'mode-label inactive-mode custom-tip-wrap';

            } else {

                labelAuto.className =
                    'mode-label active-mode custom-tip-wrap';

                labelManual.className =
                    'mode-label inactive-mode custom-tip-wrap';
            }
        }
    );

    controlItem.appendChild(
        labelAuto
    );

    controlItem.appendChild(
        switchLabel
    );

    controlItem.appendChild(
        labelManual
    );

    headerPanel.appendChild(
        titleArea
    );

    headerPanel.appendChild(
        controlItem
    );

    drillList.appendChild(
        headerPanel
    );


    // ========================================================================
    // Each sentence
    // ========================================================================

    modelSentences.forEach(
        (itemObj, index) => {

            const rowDiv =
                document.createElement('div');

            rowDiv.className =
                'drill-row';

            const topRow =
                document.createElement('div');

            topRow.className =
                'top-row';


            // ----------------------------------------------------------------
            // Number
            // ----------------------------------------------------------------

            const numberSpan =
                document.createElement('span');

            numberSpan.className =
                'sentence-number';

            numberSpan.textContent =
                `${index + 1}.`;


            // ----------------------------------------------------------------
            // Sentence + pitch lines
            // ----------------------------------------------------------------

            const sentenceSpan =
                document.createElement('span');

            sentenceSpan.className =
                'sentence-label';

            let speechText = "";

            itemObj.displayHtml.forEach(
                part => {

                    const span =
                        document.createElement('span');

                    if (
                        part.type ===
                        'symbol'
                    ) {

                        span.style.color =
                            itemObj.symbolColor;

                        span.textContent =
                            part.val;

                    } else {

                        span.textContent =
                            part.text;

                        speechText +=
                            part.text;

                        if (part.low) {

                            span.className =
                                'low-pitch';

                            span.style.textDecorationColor =
                                itemObj.symbolColor;

                        } else {

                            span.className =
                                'high-pitch';

                            span.style.textDecorationColor =
                                itemObj.symbolColor;
                        }
                    }

                    sentenceSpan.appendChild(
                        span
                    );
                }
            );


            // ----------------------------------------------------------------
            // Listen
            // ----------------------------------------------------------------

            const listenWrapper =
                document.createElement('span');

            listenWrapper.className =
                'tooltip-wrap';

            const listenBtn =
                document.createElement('button');

            listenBtn.textContent =
                '🔊 きく';

            const listenTip =
                document.createElement('span');

            listenTip.className =
                'tooltip-tip';

            listenTip.textContent =
                'Listen to model audio';

            listenWrapper.appendChild(
                listenBtn
            );

            listenWrapper.appendChild(
                listenTip
            );

            listenBtn.addEventListener(
                'click',
                () => {

                    listenBtn.disabled =
                        true;

                    listenBtn.textContent =
                        '🔊Playing...';

                    setTimeout(
                        () => {

                            const utterance =
                                new SpeechSynthesisUtterance(
                                    speechText
                                );

                            utterance.lang =
                                'ja-JP';

                            utterance.rate =
                                0.7;

                            utterance.onend =
                                () => {

                                    listenBtn.disabled =
                                        false;

                                    listenBtn.textContent =
                                        '🔊 きく';
                                };

                            speechSynthesis.speak(
                                utterance
                            );

                        },
                        1000
                    );
                }
            );


            // ----------------------------------------------------------------
            // Record button
            // ----------------------------------------------------------------

            const recordBtn =
                document.createElement('button');

            recordBtn.className =
                'custom-tip-wrap';

            recordBtn.innerHTML =
                '⏺️とる' +
                '<span class="custom-tip-box">' +
                'Start recording your voice.' +
                '</span>';


            // ----------------------------------------------------------------
            // Stop button
            // ----------------------------------------------------------------

            const stopBtn =
                document.createElement('button');

            stopBtn.className =
                'custom-tip-wrap';

            stopBtn.innerHTML =
                '<span class="stop-btn-emoji">⏹️</span>' +
                '<span class="custom-tip-box">' +
                'Stop the active recording.' +
                '</span>';

            stopBtn.disabled =
                true;


            // ----------------------------------------------------------------
            // Result
            // ----------------------------------------------------------------

            const resultContainer =
                document.createElement('div');

            resultContainer.className =
                'result-container';

            const resultSpan =
                document.createElement('span');

            resultSpan.className =
                'result-text';

            resultSpan.textContent =
                '(Not recorded yet)';

            resultSpan.style.color =
                'var(--text-secondary)';


            // ----------------------------------------------------------------
            // Recorded audio playback
            // ----------------------------------------------------------------

            const playRecordWrapper =
                document.createElement('span');

            playRecordWrapper.className =
                'tooltip-wrap';

            const playRecordBtn =
                document.createElement('button');

            playRecordBtn.className =
                'play-record-btn';

            playRecordBtn.textContent =
                '▶️';

            const playRecordTip =
                document.createElement('span');

            playRecordTip.className =
                'tooltip-tip';

            playRecordTip.textContent =
                'Play your recording';

            playRecordWrapper.appendChild(
                playRecordBtn
            );

            playRecordWrapper.appendChild(
                playRecordTip
            );

            resultContainer.appendChild(
                resultSpan
            );

            resultContainer.appendChild(
                playRecordWrapper
            );


            // ----------------------------------------------------------------
            // Meaning
            // ----------------------------------------------------------------

            const meaningContainer =
                document.createElement('div');

            meaningContainer.className =
                'meaning-container';

            const meaningWrapper =
                document.createElement('span');

            meaningWrapper.className =
                'tooltip-wrap';

            const meaningBtn =
                document.createElement('button');

            meaningBtn.className =
                'meaning-btn';

            meaningBtn.textContent =
                '🌐';

            const meaningTip =
                document.createElement('span');

            meaningTip.className =
                'tooltip-tip';

            meaningTip.textContent =
                'Translate sentence';

            meaningWrapper.appendChild(
                meaningBtn
            );

            meaningWrapper.appendChild(
                meaningTip
            );

            const meaningPopup =
                document.createElement('div');

            meaningPopup.className =
                'meaning-popup';

            meaningPopup.textContent =
                itemObj.meaning;

            meaningBtn.addEventListener(
                'click',
                (e) => {

                    e.stopPropagation();

                    meaningPopup.classList.toggle(
                        'show'
                    );
                }
            );

            document.addEventListener(
                'click',
                () => {

                    meaningPopup.classList.remove(
                        'show'
                    );
                }
            );

            meaningContainer.addEventListener(
                'click',
                (e) => {

                    e.stopPropagation();
                }
            );

            meaningContainer.appendChild(
                meaningWrapper
            );

            meaningContainer.appendChild(
                meaningPopup
            );


            // ----------------------------------------------------------------
            // Correction box
            // ----------------------------------------------------------------

            const correctionBox =
                document.createElement('div');

            correctionBox.className =
                'correction-box';

            const corrListenBtn =
                document.createElement('button');

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


            // ----------------------------------------------------------------
            // Recording variables
            // ----------------------------------------------------------------

            let mediaRecorder;
            let audioChunks = [];
            let audioStream = null;
            let recognition = null;
            let recordedAudioUrl = null;
            let latestTranscript = "";
            let recognitionResults = [];


            // =================================================================
            // Transcript processing
            // =================================================================

            function processTranscript(
                rawTranscript
            ) {

                if (!rawTranscript) {
                    return;
                }

                const hiraText =
                    convertToHiragana(
                        rawTranscript
                    );

                const cleanHira =
                    hiraText.replace(
                        /[\s、。]/g,
                        ""
                    );

                const cleanTarget =
                    itemObj.targetText.replace(
                        /[\s、。]/g,
                        ""
                    );

                if (
                    cleanHira.length < 2
                ) {

                    resultSpan.textContent =
                        rawTranscript +
                        " (Too short)";

                    resultSpan.style.color =
                        'var(--text-secondary)';

                    return;
                }

                /*
                 * 文末のね・よ等は従来どおり許容する。
                 */

                const endParticleRegex =
                    '(?:ね|よ|よね|ですね|ですよ)*$';

                const matchRegex =
                    new RegExp(
                        `^${cleanTarget}` +
                        endParticleRegex
                    );

                const exactSentence =
                    matchRegex.test(
                        cleanHira
                    );

                /*
                 * まずモーラ単位で比較する。
                 * 完全一致でなくても、
                 * 欠落・追加・音違いを表示できる。
                 */

                const modelMorae =
                    getModelMoraData(
                        itemObj
                    );

                const learnerMorae =
                    splitIntoMora(
                        cleanHira
                    );

                const operations =
                    compareMoraSequences(
                        modelMorae,
                        learnerMorae
                    );

                /*
                 * 認識文字列が完全一致なら
                 * 音そのものの比較エラーはない。
                 * それ以外はoperationsに従う。
                 */

                if (exactSentence) {

                    /*
                     * 文末の追加「ね」「よ」などは
                     * 今回は余分な音として赤橙判定しない。
                     */

                    const filteredOperations =
                        operations.filter(
                            operation => {

                                if (
                                    operation.type !==
                                    "extra"
                                ) {
                                    return true;
                                }

                                return !(
                                    operation.learner &&
                                    (
                                        operation.learner.text ===
                                            "ね" ||
                                        operation.learner.text ===
                                            "よ"
                                    )
                                );
                            }
                        );

                    renderPronunciationResult(
                        resultSpan,
                        filteredOperations,
                        [],
                        itemObj.targetText
                    );

                } else {

                    renderPronunciationResult(
                        resultSpan,
                        operations,
                        [],
                        itemObj.targetText
                    );
                }


                /*
                 * correction boxは、
                 * 旧仕様の「Try Again」表示を残す。
                 * 今回の主判定はresultSpan側。
                 */

                const hasStructuralError =
                    operations.some(
                        operation =>
                            operation.type !==
                            "match"
                    );

                if (
                    hasStructuralError
                ) {

                    corrTextSpan.textContent =
                        'Try Again';

                    corrListenBtn.style.display =
                        'inline-flex';

                    corrListenBtn.onclick =
                        () => {

                            corrListenBtn.disabled =
                                true;

                            corrListenBtn.textContent =
                                '🔊Playing...';

                            setTimeout(
                                () => {

                                    const utterance =
                                        new SpeechSynthesisUtterance(
                                            speechText
                                        );

                                    utterance.lang =
                                        'ja-JP';

                                    utterance.rate =
                                        0.7;

                                    utterance.onend =
                                        () => {

                                            corrListenBtn.disabled =
                                                false;

                                            corrListenBtn.textContent =
                                                '🔊 きく';
                                        };

                                    speechSynthesis.speak(
                                        utterance
                                    );

                                },
                                1000
                            );
                        };

                    correctionBox.style.display =
                        'block';

                } else {

                    correctionBox.style.display =
                        'none';
                }

                return {
                    hiraText,
                    modelMorae,
                    learnerMorae,
                    operations
                };
            }


            // =================================================================
            // Record
            // =================================================================

            recordBtn.addEventListener(
                'click',
                async () => {

                    try {

                        audioChunks = [];
                        latestTranscript = "";
                        recognitionResults = [];

                        audioStream =
                            await navigator.mediaDevices
                                .getUserMedia({
                                    audio: true
                                });

                        mediaRecorder =
                            new MediaRecorder(
                                audioStream
                            );

                        mediaRecorder.ondataavailable =
                            (e) => {

                                audioChunks.push(
                                    e.data
                                );
                            };

                        mediaRecorder.onstop =
                            async () => {

                                const audioBlob =
                                    new Blob(
                                        audioChunks,
                                        {
                                            type:
                                                'audio/webm'
                                        }
                                    );

                                if (
                                    recordedAudioUrl
                                ) {

                                    URL.revokeObjectURL(
                                        recordedAudioUrl
                                    );
                                }

                                recordedAudioUrl =
                                    URL.createObjectURL(
                                        audioBlob
                                    );

                                playRecordBtn.style.display =
                                    'inline-flex';

                                /*
                                 * 文字列・モーラ判定ができている場合のみ
                                 * F0解析を実行する。
                                 */

                                if (
                                    latestTranscript
                                ) {

                                    const analysis =
                                        processTranscript(
                                            latestTranscript
                                        );

                                    if (analysis) {

                                        await analyzeRecordedAudio(
                                            audioBlob,
                                            analysis.modelMorae,
                                            analysis.operations,
                                            resultSpan
                                        );
                                    }
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
                                isManualStop;


                            recognition.onresult =
                                (e) => {

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
                                            e.results[i][0]
                                                .transcript;
                                    }

                                    /*
                                     * Manual modeでは、
                                     * 最後の結果だけでなく
                                     * それまでの結果を蓄積する。
                                     */

                                    if (
                                        isManualStop
                                    ) {

                                        recognitionResults.push(
                                            rawTranscript
                                        );

                                        latestTranscript =
                                            recognitionResults.join(
                                                ""
                                            );

                                    } else {

                                        latestTranscript =
                                            rawTranscript;
                                    }


                                    if (
                                        !isManualStop
                                    ) {

                                        processTranscript(
                                            latestTranscript
                                        );
                                    }
                                };


                            recognition.onerror =
                                (err) => {

                                    console.error(
                                        "Speech recognition error:",
                                        err
                                    );
                                };


                            recognition.onend =
                                () => {

                                    if (
                                        isManualStop
                                    ) {

                                        if (
                                            mediaRecorder &&
                                            mediaRecorder.state !==
                                                'inactive'
                                        ) {

                                            mediaRecorder.stop();
                                        }

                                        if (
                                            audioStream
                                        ) {

                                            audioStream
                                                .getTracks()
                                                .forEach(
                                                    track =>
                                                        track.stop()
                                                );
                                        }

                                        recordBtn.disabled =
                                            false;

                                        stopBtn.disabled =
                                            true;

                                        stopBtn.classList.remove(
                                            'stop-btn-active'
                                        );

                                    } else {

                                        if (
                                            mediaRecorder &&
                                            mediaRecorder.state !==
                                                'inactive'
                                        ) {

                                            mediaRecorder.stop();
                                        }

                                        if (
                                            audioStream
                                        ) {

                                            audioStream
                                                .getTracks()
                                                .forEach(
                                                    track =>
                                                        track.stop()
                                                );
                                        }

                                        recordBtn.disabled =
                                            false;

                                        stopBtn.disabled =
                                            true;

                                        stopBtn.classList.remove(
                                            'stop-btn-active'
                                        );
                                    }
                                };

                            recognition.start();

                        } else {

                            /*
                             * SpeechRecognitionがない場合。
                             */

                            latestTranscript = "";
                        }


                        // ------------------------------------------------------
                        // Recording UI
                        // ------------------------------------------------------

                        recordBtn.disabled =
                            true;

                        if (
                            isManualStop
                        ) {

                            stopBtn.disabled =
                                false;

                            stopBtn.classList.add(
                                'stop-btn-active'
                            );

                            resultSpan.textContent =
                                'Recording (Max 15s)...';

                        } else {

                            stopBtn.disabled =
                                true;

                            stopBtn.classList.remove(
                                'stop-btn-active'
                            );

                            resultSpan.textContent =
                                'Recording...';
                        }

                        resultSpan.style.color =
                            'var(--accent-color)';

                        playRecordBtn.style.display =
                            'none';

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

                        recordBtn.disabled =
                            false;

                        stopBtn.disabled =
                            true;

                        stopBtn.classList.remove(
                            'stop-btn-active'
                        );
                    }
                }
            );


            // =================================================================
            // Manual stop button
            // =================================================================

            stopBtn.addEventListener(
                'click',
                () => {

                    if (recognition) {

                        try {
                            recognition.stop();
                        } catch (e) {}
                    }

                    /*
                     * 判定はrecognition.onend後に行う。
                     */

                    recordBtn.disabled =
                        false;

                    stopBtn.disabled =
                        true;

                    stopBtn.classList.remove(
                        'stop-btn-active'
                    );
                }
            );


            // =================================================================
            // Recorded audio playback
            // =================================================================

            playRecordBtn.addEventListener(
                'click',
                () => {

                    if (!recordedAudioUrl) {
                        return;
                    }

                    const audio =
                        new Audio(
                            recordedAudioUrl
                        );

                    audio.playbackRate =
                        1.0;

                    playRecordBtn.disabled =
                        true;

                    playRecordBtn.textContent =
                        '▶️ Playing...';

                    audio.play();

                    audio.onended =
                        () => {

                            playRecordBtn.disabled =
                                false;

                            playRecordBtn.textContent =
                                '▶️';
                        };
                }
            );


            // =================================================================
            // Row construction
            // =================================================================

            topRow.appendChild(
                numberSpan
            );

            topRow.appendChild(
                listenWrapper
            );

            topRow.appendChild(
                sentenceSpan
            );

            topRow.appendChild(
                recordBtn
            );

            topRow.appendChild(
                stopBtn
            );

            topRow.appendChild(
                resultContainer
            );

            topRow.appendChild(
                meaningContainer
            );

            rowDiv.appendChild(
                topRow
            );

            rowDiv.appendChild(
                correctionBox
            );

            drillList.appendChild(
                rowDiv
            );
        }
    );
}


// ============================================================================
// Initialization
// ============================================================================

document.addEventListener(
    'DOMContentLoaded',
    initDrill
);

if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
) {
    initDrill();
}
