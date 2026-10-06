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


// ============================================================================
// Hiragana conversion
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g,
        ""
    );

    /*
     * カタカナ → ひらがな
     */
    cleaned = cleaned.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    /*
     * SpeechRecognitionが漢字で返した場合の正規化。
     *
     * 重要：
     * 「電気」はモデルの「天気」と同一視しない。
     * 電気 → でんき としてから比較することで、
     * 「で」だけを音の違いとして検出できる。
     */
    const dict = {
        "天気": "てんき",
        "電気": "でんき",
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

    for (const key in dict) {
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

        /*
         * 拗音は直前のモーラと一体化する。
         *
         * 例：
         * きゃ → 1モーラ
         */
        if (
            SMALL_Y.has(ch) &&
            morae.length > 0
        ) {

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

        if (part.type === "symbol") {
            return;
        }

        for (const ch of Array.from(part.text)) {

            charPitch.push({
                char: ch,
                low: !!part.low
            });
        }
    });

    const targetText =
        charPitch
            .map(item => item.char)
            .join("");

    const morae = [];
    const chars = Array.from(targetText);

    for (let i = 0; i < chars.length; i++) {

        const ch = chars[i];

        /*
         * 拗音
         */
        if (
            SMALL_Y.has(ch) &&
            morae.length > 0
        ) {

            morae[morae.length - 1].text += ch;
            continue;
        }

        const isSpecial =
            SPECIAL_MORA.has(ch);

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

const styleElement =
    document.createElement('style');

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

    /*
     * 音の違い・ピッチの違い・欠落・余分は
     * すべて同じ赤色。
     */
    .pronunciation-error {
        color: ${PITCH_ERROR_COLOR};
        font-weight: normal !important;
    }

    .pronunciation-missing {
        color: ${PITCH_ERROR_COLOR};
        font-weight: normal !important;
    }

    .pronunciation-extra {
        color: ${PITCH_ERROR_COLOR};
        font-weight: normal !important;
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

            bestCorrelation =
                correlation;

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
// Estimate raw F0 per mora
// ============================================================================

function estimateMoraF0(
    audioBuffer,
    morae
) {

    const frameData =
        extractF0Frames(audioBuffer);

    const validFrames =
        frameData.frames.filter(
            value => value != null
        );

    if (validFrames.length < 3) {
        return [];
    }

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

    const voicedFrameCount =
        lastVoiced - firstVoiced + 1;

    const normalMorae =
        morae.filter(
            mora => !mora.special
        );

    if (!normalMorae.length) {
        return [];
    }

    const result = [];

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
                voicedFrameCount *
                startRatio
            );

        const endFrame =
            Math.max(
                startFrame + 1,
                Math.floor(
                    firstVoiced +
                    voicedFrameCount *
                    endRatio
                )
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

        result.push({
            mora,
            f0: median(values),
            high: null
        });

        normalIndex++;
    }

    return result;
}


// ============================================================================
// Improved pitch classification
// ============================================================================

function classifyLearnerPitch(
    estimated
) {

    const normalItems =
        estimated.filter(
            item =>
                !item.mora.special &&
                item.f0 != null
        );

    if (
        normalItems.length < 3
    ) {
        return estimated;
    }

    const values =
        normalItems.map(
            item => item.f0
        );

    let lowCenter =
        Math.min(...values);

    let highCenter =
        Math.max(...values);

    /*
     * 最初からほぼ同じ高さなら、
     * 無理にHigh / Lowへ分類しない。
     */
    if (
        highCenter - lowCenter <
        Math.max(
            12,
            median(values) * 0.07
        )
    ) {

        estimated.forEach(item => {
            item.high = null;
        });

        return estimated;
    }

    /*
     * 2クラスタに分ける。
     * 単純な1次元k-means。
     */
    for (let iteration = 0; iteration < 8; iteration++) {

        const lowValues = [];
        const highValues = [];

        normalItems.forEach(item => {

            const lowDistance =
                Math.abs(
                    item.f0 - lowCenter
                );

            const highDistance =
                Math.abs(
                    item.f0 - highCenter
                );

            if (
                lowDistance <=
                highDistance
            ) {

                lowValues.push(item.f0);

            } else {

                highValues.push(item.f0);
            }
        });

        if (lowValues.length) {
            lowCenter = median(lowValues);
        }

        if (highValues.length) {
            highCenter = median(highValues);
        }
    }

    /*
     * クラスタ間の差が小さい場合は、
     * ピッチ判定をしない。
     *
     * これが今回追加した重要な安全策。
     */
    const centerDifference =
        highCenter - lowCenter;

    const minimumDifference =
        Math.max(
            15,
            ((highCenter + lowCenter) / 2) * 0.08
        );

    if (
        centerDifference <
        minimumDifference
    ) {

        estimated.forEach(item => {
            item.high = null;
        });

        return estimated;
    }

    estimated.forEach(item => {

        if (
            item.mora.special ||
            item.f0 == null
        ) {

            item.high = null;
            return;
        }

        const lowDistance =
            Math.abs(
                item.f0 - lowCenter
            );

        const highDistance =
            Math.abs(
                item.f0 - highCenter
            );

        item.high =
            highDistance < lowDistance;
    });

    return estimated;
}


// ============================================================================
// Estimate learner pitch per mora
// ============================================================================

function estimateMoraPitch(
    audioBuffer,
    morae
) {

    const estimated =
        estimateMoraF0(
            audioBuffer,
            morae
        );

    if (!estimated.length) {
        return [];
    }

    return classifyLearnerPitch(
        estimated
    );
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
         * 学習者側の余分なモーラ
         */
        if (
            j + 1 < learnerMorae.length &&
            model.text ===
                learnerMorae[j + 1].text
        ) {

            operations.push({
                type: "extra",
                learner: learner,
                learnerIndex: j
            });

            j++;
            continue;
        }

        /*
         * モデル側の欠落モーラ
         */
        if (
            i + 1 < modelMorae.length &&
            modelMorae[i + 1].text ===
                learner.text
        ) {

            operations.push({
                type: "missing",
                model: model,
                modelIndex: i
            });

            i++;
            continue;
        }

        /*
         * 音そのものが違う。
         *
         * 例：
         * て → で
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
// Render basic result
// ============================================================================

function renderPronunciationResult(
    resultSpan,
    operations
) {

    resultSpan.innerHTML = "";

    let hasError = false;

    operations.forEach(operation => {

        if (
            operation.type ===
            "match"
        ) {

            const span =
                document.createElement("span");

            span.className =
                "pronunciation-normal";

            span.textContent =
                operation.learner.text;

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
                "pronunciation-error";

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

    /*
     * まず文字・モーラ判定を表示する。
     * F0解析に失敗しても、この結果は残す。
     */
    renderPronunciationResult(
        resultSpan,
        operations
    );

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

        /*
         * F0解析対象の学習者モーラを作る。
         *
         * operations上のlearnerIndexとの対応を
         * pitchIndexとして保存する。
         */
        const pitchMorae = [];

        operations.forEach(operation => {

            if (
                operation.type === "match" ||
                operation.type === "sound-error"
            ) {

                operation.pitchIndex =
                    pitchMorae.length;

                pitchMorae.push(
                    operation.learner
                );
            }
        });

        if (!pitchMorae.length) {

            await audioContext.close();
            return;
        }

        const estimatedPitch =
            estimateMoraPitch(
                audioBuffer,
                pitchMorae
            );

        if (!estimatedPitch.length) {

            await audioContext.close();
            return;
        }

        /*
         * pitchIndex → 推定Pitch
         */
        const pitchMap = new Map();

        estimatedPitch.forEach(
            (item, index) => {

                pitchMap.set(
                    index,
                    item
                );
            }
        );

        /*
         * もう一度結果を構築。
         *
         * sound-error はすでに音が違うため、
         * ピッチ判定は追加しない。
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

                let pitchError = false;

                if (
                    !operation.model.special
                ) {

                    const pitch =
                        pitchMap.get(
                            operation.pitchIndex
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

                            pitchError = true;
                        }
                    }
                }

                if (pitchError) {

                    span.className =
                        "pronunciation-error";

                    hasError = true;

                } else {

                    span.className =
                        "pronunciation-normal";
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
                    "pronunciation-error";

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
         * F0解析失敗時は、
         * 文字・モーラ判定だけを残す。
         */
        renderPronunciationResult(
            resultSpan,
            operations
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
            // Listen to model
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
            // Recording variables
            // ----------------------------------------------------------------

            let mediaRecorder;
            let audioChunks = [];
            let audioStream = null;
            let recognition = null;
            let recordedAudioUrl = null;
            let latestTranscript = "";
            let recognitionResults = [];
            let recordingTimeout = null;


            // =================================================================
            // Transcript processing
            // =================================================================

            function processTranscript(
                rawTranscript
            ) {

                if (!rawTranscript) {
                    return null;
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

                if (
                    cleanHira.length < 2
                ) {

                    resultSpan.textContent =
                        hiraText +
                        " (Too short)";

                    resultSpan.style.color =
                        'var(--text-secondary)';

                    return null;
                }

                const cleanTarget =
                    itemObj.targetText.replace(
                        /[\s、。]/g,
                        ""
                    );

                /*
                 * 文末のね・よ等は従来どおり許容。
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

                const modelMorae =
                    getModelMoraData(
                        itemObj
                    );

                const learnerMorae =
                    splitIntoMora(
                        cleanHira
                    );

                let operations =
                    compareMoraSequences(
                        modelMorae,
                        learnerMorae
                    );

                /*
                 * ね・よは文末許容。
                 * 結果表示上も余分なエラーにしない。
                 */
                if (exactSentence) {

                    operations =
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
                }

                /*
                 * ここでは文字・モーラの結果だけ表示。
                 * F0解析後にピッチ結果を上書きする。
                 */
                renderPronunciationResult(
                    resultSpan,
                    operations
                );

                return {
                    hiraText,
                    modelMorae,
                    learnerMorae,
                    operations
                };
            }


            // =================================================================
            // Stop active recording
            // =================================================================

            function stopActiveRecording() {

                if (recordingTimeout) {

                    clearTimeout(
                        recordingTimeout
                    );

                    recordingTimeout =
                        null;
                }

                if (recognition) {

                    try {
                        recognition.stop();
                    } catch (e) {}
                }

                if (
                    mediaRecorder &&
                    mediaRecorder.state !==
                        'inactive'
                ) {

                    mediaRecorder.stop();
                }

                if (audioStream) {

                    audioStream
                        .getTracks()
                        .forEach(
                            track =>
                                track.stop()
                        );

                    audioStream = null;
                }

                recordBtn.disabled =
                    false;

                stopBtn.disabled =
                    true;

                stopBtn.classList.remove(
                    'stop-btn-active'
                );
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

                                if (
                                    e.data &&
                                    e.data.size > 0
                                ) {

                                    audioChunks.push(
                                        e.data
                                    );
                                }
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

                                    /*
                                     * Manual modeでは
                                     * final resultを累積する。
                                     */
                                    let rawTranscript =
                                        "";

                                    for (
                                        let i =
                                            e.resultIndex;
                                        i <
                                            e.results.length;
                                        ++i
                                    ) {

                                        if (
                                            e.results[i].isFinal
                                        ) {

                                            rawTranscript +=
                                                e.results[i][0]
                                                    .transcript;
                                        }
                                    }

                                    if (!rawTranscript) {
                                        return;
                                    }

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


                                    /*
                                     * Autostopでは認識時点で
                                     * 一度文字判定を表示。
                                     */
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

                                    /*
                                     * 録音終了処理。
                                     *
                                     * Manual stopでもAutostopでも
                                     * 同じ終了処理にする。
                                     */
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

                                        audioStream =
                                            null;
                                    }

                                    recordBtn.disabled =
                                        false;

                                    stopBtn.disabled =
                                        true;

                                    stopBtn.classList.remove(
                                        'stop-btn-active'
                                    );

                                    if (
                                        recordingTimeout
                                    ) {

                                        clearTimeout(
                                            recordingTimeout
                                        );

                                        recordingTimeout =
                                            null;
                                    }
                                };

                            recognition.start();

                        } else {

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


                        /*
                         * Manual modeは最大15秒。
                         */
                        if (
                            isManualStop
                        ) {

                            recordingTimeout =
                                setTimeout(
                                    () => {

                                        stopActiveRecording();

                                    },
                                    15000
                                );
                        }


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

                    stopActiveRecording();
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
