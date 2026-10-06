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


// ============================================================================
// Recording mode
// ============================================================================

/*
 * Manual stopを初期状態にする。
 *
 * false = Autostop
 * true  = Manual stop
 */
let isManualStop = true;


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
    cleaned = cleaned.replace(
        /[\u30a1-\u30f6]/g,
        match => {
            return String.fromCharCode(
                match.charCodeAt(0) - 0x60
            );
        }
    );

    /*
     * SpeechRecognitionが漢字で返した場合の正規化。
     *
     * 重要：
     * 電気 → でんき
     *
     * 天気と同一視するのではない。
     * その後の比較で
     *
     * て ↔ で
     *
     * の違いとして検出する。
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

        const regex =
            new RegExp(key, "g");

        cleaned =
            cleaned.replace(
                regex,
                dict[key]
            );
    }

    return cleaned;
}


// ============================================================================
// Mora utilities
// ============================================================================

const SMALL_Y =
    new Set(["ゃ", "ゅ", "ょ"]);

const SPECIAL_MORA =
    new Set(["っ", "ん", "ー"]);


function splitIntoMora(text) {

    const chars =
        Array.from(text);

    const morae = [];

    for (const ch of chars) {

        /*
         * 拗音は直前のモーラと一体化。
         *
         * きゃ → 1モーラ
         */
        if (
            SMALL_Y.has(ch) &&
            morae.length > 0
        ) {

            morae[
                morae.length - 1
            ].text += ch;

            continue;
        }

        morae.push({
            text: ch,
            special:
                SPECIAL_MORA.has(ch)
        });
    }

    return morae;
}


// ============================================================================
// Model mora data
// ============================================================================

function getModelMoraData(itemObj) {

    const charPitch = [];

    itemObj.displayHtml.forEach(
        part => {

            if (
                part.type === "symbol"
            ) {
                return;
            }

            for (
                const ch of Array.from(
                    part.text
                )
            ) {

                charPitch.push({
                    char: ch,
                    low: !!part.low
                });
            }
        }
    );

    const targetText =
        charPitch
            .map(item => item.char)
            .join("");

    const morae = [];

    const chars =
        Array.from(targetText);

    for (
        let i = 0;
        i < chars.length;
        i++
    ) {

        const ch =
            chars[i];

        /*
         * 拗音
         */
        if (
            SMALL_Y.has(ch) &&
            morae.length > 0
        ) {

            morae[
                morae.length - 1
            ].text += ch;

            continue;
        }

        const isSpecial =
            SPECIAL_MORA.has(ch);

        morae.push({
            text: ch,

            /*
             * っ・ん・ーはPitch対象外
             */
            special: isSpecial,

            low:
                isSpecial
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
    document.createElement("style");

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
        font-weight: normal !important;
    }

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

document.head.appendChild(
    styleElement
);


// ============================================================================
// F0 analysis
// ============================================================================

function calculateRMS(
    buffer,
    start,
    end
) {

    let sum = 0;
    let count = 0;

    for (
        let i = start;
        i < end;
        i++
    ) {

        const value =
            buffer[i];

        sum += value * value;
        count++;
    }

    if (!count) return 0;

    return Math.sqrt(
        sum / count
    );
}


// ----------------------------------------------------------------------------
// Autocorrelation F0
// ----------------------------------------------------------------------------

function autocorrelationF0(
    buffer,
    sampleRate
) {

    const minFreq = 70;
    const maxFreq = 350;

    const minLag =
        Math.floor(
            sampleRate / maxFreq
        );

    const maxLag =
        Math.floor(
            sampleRate / minFreq
        );

    let bestLag = -1;
    let bestCorrelation = 0;

    /*
     * DC offset除去
     */
    let mean = 0;

    for (
        let i = 0;
        i < buffer.length;
        i++
    ) {
        mean += buffer[i];
    }

    mean /=
        buffer.length || 1;

    const centered =
        new Float32Array(
            buffer.length
        );

    for (
        let i = 0;
        i < buffer.length;
        i++
    ) {

        centered[i] =
            buffer[i] - mean;
    }

    for (
        let lag = minLag;
        lag <= maxLag;
        lag++
    ) {

        let sum = 0;
        let sumA = 0;
        let sumB = 0;

        const limit =
            centered.length - lag;

        for (
            let i = 0;
            i < limit;
            i++
        ) {

            const a =
                centered[i];

            const b =
                centered[i + lag];

            sum += a * b;
            sumA += a * a;
            sumB += b * b;
        }

        const denominator =
            Math.sqrt(
                sumA * sumB
            );

        if (!denominator) {
            continue;
        }

        const correlation =
            sum / denominator;

        if (
            correlation >
            bestCorrelation
        ) {

            bestCorrelation =
                correlation;

            bestLag =
                lag;
        }
    }

    if (
        bestLag < 0 ||
        bestCorrelation < 0.45
    ) {
        return null;
    }

    return (
        sampleRate /
        bestLag
    );
}


// ----------------------------------------------------------------------------
// Extract F0 frames
// ----------------------------------------------------------------------------

function extractF0Frames(
    audioBuffer
) {

    const channelData =
        audioBuffer.getChannelData(0);

    const sampleRate =
        audioBuffer.sampleRate;

    /*
     * 40ms frame / 10ms hop
     *
     * 従来の20ms hopより細かくして、
     * モーラ境界の自由度を上げる。
     */
    const frameDuration =
        0.04;

    const hopDuration =
        0.01;

    const frameSize =
        Math.floor(
            sampleRate *
            frameDuration
        );

    const hopSize =
        Math.floor(
            sampleRate *
            hopDuration
        );

    const frames = [];

    for (
        let start = 0;
        start + frameSize <=
            channelData.length;
        start += hopSize
    ) {

        const end =
            start + frameSize;

        const frame =
            channelData.slice(
                start,
                end
            );

        const rms =
            calculateRMS(
                frame,
                0,
                frame.length
            );

        /*
         * 無音・極端に小さい音。
         */
        if (
            rms < 0.012
        ) {

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


// ============================================================================
// Median
// ============================================================================

function median(values) {

    const valid =
        values
            .filter(
                value =>
                    value != null &&
                    Number.isFinite(value)
            )
            .sort(
                (a, b) =>
                    a - b
            );

    if (!valid.length) {
        return null;
    }

    const middle =
        Math.floor(
            valid.length / 2
        );

    if (
        valid.length % 2
    ) {

        return valid[middle];
    }

    return (
        valid[middle - 1] +
        valid[middle]
    ) / 2;
}


// ============================================================================
// F0 smoothing
// ============================================================================

function smoothF0Frames(
    frames
) {

    const result =
        frames.slice();

    for (
        let i = 1;
        i < frames.length - 1;
        i++
    ) {

        if (
            frames[i] == null
        ) {
            continue;
        }

        const neighbours = [
            frames[i - 1],
            frames[i],
            frames[i + 1]
        ].filter(
            value =>
                value != null
        );

        if (
            neighbours.length >= 2
        ) {

            result[i] =
                median(neighbours);
        }
    }

    return result;
}


// ============================================================================
// F0 normalization
// ============================================================================

function normalizeF0Frames(
    frames
) {

    const valid =
        frames.filter(
            value =>
                value != null
        );

    if (
        valid.length < 5
    ) {
        return null;
    }

    /*
     * 話者固有の声の高さを消すため、
     * Hzではなくsemitoneへ変換し、
     * 話者の中央値を0とする。
     */
    const center =
        median(valid);

    if (
        center == null ||
        center <= 0
    ) {
        return null;
    }

    return frames.map(
        value => {

            if (
                value == null
            ) {
                return null;
            }

            return (
                12 *
                Math.log2(
                    value / center
                )
            );
        }
    );
}


// ============================================================================
// Find voiced range
// ============================================================================

function findVoicedRange(
    frames
) {

    let first = -1;
    let last = -1;

    for (
        let i = 0;
        i < frames.length;
        i++
    ) {

        if (
            frames[i] != null
        ) {

            if (first < 0) {
                first = i;
            }

            last = i;
        }
    }

    if (
        first < 0 ||
        last < first
    ) {

        return null;
    }

    return {
        first,
        last
    };
}


// ============================================================================
// Pitch segmentation
// ============================================================================

/*
 * ここが従来方式との大きな違い。
 *
 * 従来：
 *
 *   音声全体
 *       ↓
 *   モーラ数で均等分割
 *
 * 今回：
 *
 *   F0フレーム列
 *       ↓
 *   各モーラに何フレーム割り当てるかをDPで探索
 *
 * したがって、
 *
 *   て   が長い
 *   ん   が短い
 *   き   が長い
 *
 * のような実際の発話時間の違いを許容する。
 */


function buildPrefixStatistics(
    frames
) {

    const n =
        frames.length;

    const count =
        new Array(n + 1).fill(0);

    const sum =
        new Array(n + 1).fill(0);

    const sumSq =
        new Array(n + 1).fill(0);

    for (
        let i = 0;
        i < n;
        i++
    ) {

        count[i + 1] =
            count[i];

        sum[i + 1] =
            sum[i];

        sumSq[i + 1] =
            sumSq[i];

        const value =
            frames[i];

        if (
            value != null
        ) {

            count[i + 1]++;

            sum[i + 1] +=
                value;

            sumSq[i + 1] +=
                value * value;
        }
    }

    return {
        count,
        sum,
        sumSq
    };
}


function segmentMean(
    stats,
    start,
    end
) {

    const count =
        stats.count[end] -
        stats.count[start];

    if (!count) {
        return null;
    }

    return (
        stats.sum[end] -
        stats.sum[start]
    ) / count;
}


function segmentVariance(
    stats,
    start,
    end
) {

    const count =
        stats.count[end] -
        stats.count[start];

    if (
        count < 2
    ) {
        return 0;
    }

    const sum =
        stats.sum[end] -
        stats.sum[start];

    const sumSq =
        stats.sumSq[end] -
        stats.sumSq[start];

    const mean =
        sum / count;

    const variance =
        (
            sumSq -
            count * mean * mean
        ) / count;

    return Math.max(
        0,
        variance
    );
}


/*
 * F0値から2つの中心値を推定。
 *
 * これは「モーラを均等に区切る」ためではなく、
 * 話者の中で実際に存在する低・高の2領域を
 * 推定するために使う。
 */
function estimatePitchCenters(
    normalizedFrames
) {

    const values =
        normalizedFrames.filter(
            value =>
                value != null
        );

    if (
        values.length < 5
    ) {
        return null;
    }

    let low =
        Math.min(...values);

    let high =
        Math.max(...values);

    /*
     * 初期差が極端に小さい場合、
     * Pitch判定自体を行わない。
     */
    if (
        high - low < 1.5
    ) {
        return null;
    }

    for (
        let iteration = 0;
        iteration < 12;
        iteration++
    ) {

        const lowValues = [];
        const highValues = [];

        values.forEach(
            value => {

                if (
                    Math.abs(
                        value - low
                    ) <=
                    Math.abs(
                        value - high
                    )
                ) {

                    lowValues.push(
                        value
                    );

                } else {

                    highValues.push(
                        value
                    );
                }
            }
        );

        if (lowValues.length) {
            low =
                median(lowValues);
        }

        if (highValues.length) {
            high =
                median(highValues);
        }
    }

    if (
        low == null ||
        high == null
    ) {
        return null;
    }

    if (low > high) {
        [low, high] =
            [high, low];
    }

    /*
     * 1.5 semitone未満なら
     * High / Lowの区別が不十分とする。
     */
    if (
        high - low < 1.5
    ) {
        return null;
    }

    return {
        low,
        high
    };
}


// ============================================================================
// Dynamic programming pitch alignment
// ============================================================================

function alignPitchToMorae(
    normalizedFrames,
    targetMorae,
    centers
) {

    const voicedRange =
        findVoicedRange(
            normalizedFrames
        );

    if (!voicedRange) {
        return null;
    }

    const frames =
        normalizedFrames.slice(
            voicedRange.first,
            voicedRange.last + 1
        );

    const n =
        frames.length;

    const normalMorae =
        targetMorae.filter(
            mora =>
                !mora.special
        );

    const m =
        normalMorae.length;

    if (
        m < 1 ||
        n < m * 2
    ) {
        return null;
    }

    const stats =
        buildPrefixStatistics(
            frames
        );

    /*
     * 1モーラに割り当てる最小・最大フレーム数。
     *
     * 10ms hopなので、
     * 20ms〜300ms程度を許容する。
     */
    const minFrames = 2;
    const maxFrames = 30;

    const INF =
        Number.POSITIVE_INFINITY;

    /*
     * dp[i][j]
     *
     * i = 何モーラ処理したか
     * j = 何フレーム処理したか
     */
    const dp =
        Array.from(
            { length: m + 1 },
            () =>
                new Array(n + 1)
                    .fill(INF)
        );

    const back =
        Array.from(
            { length: m + 1 },
            () =>
                new Array(n + 1)
                    .fill(null)
        );

    dp[0][0] = 0;

    for (
        let i = 0;
        i < m;
        i++
    ) {

        const expectedHigh =
            !normalMorae[i].low;

        const expectedCenter =
            expectedHigh
                ? centers.high
                : centers.low;

        for (
            let start = 0;
            start <= n;
            start++
        ) {

            if (
                !Number.isFinite(
                    dp[i][start]
                )
            ) {
                continue;
            }

            const remainingMorae =
                m - i - 1;

            const remainingFrames =
                n - start;

            const minRemaining =
                remainingMorae *
                minFrames;

            const maxRemaining =
                remainingMorae *
                maxFrames;

            let minEnd =
                start + minFrames;

            let maxEnd =
                Math.min(
                    n,
                    start + maxFrames
                );

            /*
             * 後続モーラに最低限必要な
             * フレーム数を確保。
             */
            minEnd =
                Math.max(
                    minEnd,
                    n -
                    maxRemaining
                );

            maxEnd =
                Math.min(
                    maxEnd,
                    n -
                    minRemaining
                );

            if (
                minEnd > maxEnd
            ) {
                continue;
            }

            for (
                let end = minEnd;
                end <= maxEnd;
                end++
            ) {

                const count =
                    stats.count[end] -
                    stats.count[start];

                if (!count) {
                    continue;
                }

                const mean =
                    segmentMean(
                        stats,
                        start,
                        end
                    );

                if (mean == null) {
                    continue;
                }

                const variance =
                    segmentVariance(
                        stats,
                        start,
                        end
                    );

                /*
                 * 期待するPitch中心との距離。
                 *
                 * 分散も少しだけ加える。
                 * ただし分散を強くすると
                 * 極端に短い区間を選びやすくなるので
                 * 小さくする。
                 */
                const centerCost =
                    Math.pow(
                        mean -
                        expectedCenter,
                        2
                    );

                const varianceCost =
                    variance * 0.12;

                /*
                 * 極端に短い区間を避ける。
                 */
                const duration =
                    end - start;

                const durationPenalty =
                    duration === minFrames
                        ? 0.8
                        : 0;

                const cost =
                    dp[i][start] +
                    centerCost +
                    varianceCost +
                    durationPenalty;

                if (
                    cost <
                    dp[i + 1][end]
                ) {

                    dp[i + 1][end] =
                        cost;

                    back[i + 1][end] = {
                        start,
                        end
                    };
                }
            }
        }
    }

    if (
        !Number.isFinite(
            dp[m][n]
        )
    ) {
        return null;
    }

    /*
     * Backtrack
     */
    const segments =
        new Array(m);

    let end =
        n;

    for (
        let i = m;
        i > 0;
        i--
    ) {

        const item =
            back[i][end];

        if (!item) {
            return null;
        }

        const start =
            item.start;

        segments[i - 1] = {
            start,
            end,
            mean:
                segmentMean(
                    stats,
                    start,
                    end
                )
        };

        end =
            start;
    }

    return {
        segments,
        voicedStart:
            voicedRange.first,
        voicedEnd:
            voicedRange.last,
        cost:
            dp[m][n]
    };
}


// ============================================================================
// Estimate pitch pattern
// ============================================================================

function estimatePitchPattern(
    audioBuffer,
    modelMorae
) {

    const frameData =
        extractF0Frames(
            audioBuffer
        );

    if (
        !frameData.frames.length
    ) {
        return null;
    }

    const smoothedFrames =
        smoothF0Frames(
            frameData.frames
        );

    const normalizedFrames =
        normalizeF0Frames(
            smoothedFrames
        );

    if (!normalizedFrames) {
        return null;
    }

    const centers =
        estimatePitchCenters(
            normalizedFrames
        );

    if (!centers) {
        return null;
    }

    const alignment =
        alignPitchToMorae(
            normalizedFrames,
            modelMorae,
            centers
        );

    if (!alignment) {
        return null;
    }

    const normalMorae =
        modelMorae.filter(
            mora =>
                !mora.special
        );

    const results =
        normalMorae.map(
            (mora, index) => {

                const segment =
                    alignment.segments[
                        index
                    ];

                if (!segment) {
                    return {
                        mora,
                        high: null,
                        mean: null
                    };
                }

                const expectedHigh =
                    !mora.low;

                /*
                 * セグメントの平均F0が
                 * 2中心のどちらに近いか。
                 */
                const lowDistance =
                    Math.abs(
                        segment.mean -
                        centers.low
                    );

                const highDistance =
                    Math.abs(
                        segment.mean -
                        centers.high
                    );

                const learnerHigh =
                    highDistance <
                    lowDistance;

                /*
                 * 中間領域では無理に判定しない。
                 */
                const midpoint =
                    (
                        centers.low +
                        centers.high
                    ) / 2;

                const centerGap =
                    centers.high -
                    centers.low;

                const uncertainty =
                    centerGap * 0.18;

                let high =
                    learnerHigh;

                if (
                    Math.abs(
                        segment.mean -
                        midpoint
                    ) <
                    uncertainty
                ) {

                    high = null;
                }

                return {
                    mora,
                    high,
                    mean:
                        segment.mean,
                    expectedHigh
                };
            }
        );

    return {
        results,
        centers,
        alignment
    };
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
                learner:
                    learnerMorae[j],
                learnerIndex: j
            });

            j++;
            continue;
        }

        if (
            j >= learnerMorae.length
        ) {

            operations.push({
                type: "missing",
                model:
                    modelMorae[i],
                modelIndex: i
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
            j + 1 <
                learnerMorae.length &&
            model.text ===
                learnerMorae[
                    j + 1
                ].text
        ) {

            operations.push({
                type: "extra",
                learner,
                learnerIndex: j
            });

            j++;
            continue;
        }

        /*
         * モデル側の欠落モーラ
         */
        if (
            i + 1 <
                modelMorae.length &&
            modelMorae[
                i + 1
            ].text ===
                learner.text
        ) {

            operations.push({
                type: "missing",
                model,
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
// Check whether text/mora stage is completely correct
// ============================================================================

function isTextStageCorrect(
    operations
) {

    return operations.every(
        operation =>
            operation.type ===
            "match"
    );
}


// ============================================================================
// Render basic text result
// ============================================================================

function renderPronunciationResult(
    resultSpan,
    operations
) {

    resultSpan.innerHTML = "";

    let hasError = false;

    operations.forEach(
        operation => {

            if (
                operation.type ===
                "match"
            ) {

                const span =
                    document.createElement(
                        "span"
                    );

                span.className =
                    "pronunciation-normal";

                span.textContent =
                    operation.learner.text;

                resultSpan.appendChild(
                    span
                );

                return;
            }

            if (
                operation.type ===
                "sound-error"
            ) {

                const span =
                    document.createElement(
                        "span"
                    );

                span.className =
                    "pronunciation-error";

                span.textContent =
                    operation.learner.text;

                resultSpan.appendChild(
                    span
                );

                hasError = true;

                return;
            }

            if (
                operation.type ===
                "missing"
            ) {

                const span =
                    document.createElement(
                        "span"
                    );

                span.className =
                    "pronunciation-missing";

                span.textContent =
                    `[${operation.model.text}×]`;

                resultSpan.appendChild(
                    span
                );

                hasError = true;

                return;
            }

            if (
                operation.type ===
                "extra"
            ) {

                const span =
                    document.createElement(
                        "span"
                    );

                span.className =
                    "pronunciation-extra";

                span.textContent =
                    `[${operation.learner.text}+]`;

                resultSpan.appendChild(
                    span
                );

                hasError = true;
            }
        }
    );

    if (!hasError) {

        const checkSpan =
            document.createElement(
                "span"
            );

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
// Render pitch result
// ============================================================================

function renderPitchResult(
    resultSpan,
    modelMorae,
    pitchAnalysis
) {

    resultSpan.innerHTML = "";

    /*
     * Pitch解析が成立していない場合、
     * 誤ってOKにはしない。
     */
    if (
        !pitchAnalysis ||
        !pitchAnalysis.results
    ) {

        renderPronunciationResult(
            resultSpan,
            modelMorae.map(
                mora => ({
                    type: "match",
                    model: mora,
                    learner: mora
                })
            )
        );

        /*
         * 上記では一旦✅が出るため、
         * Pitch解析不能表示に差し替える。
         */
        const last =
            resultSpan.lastChild;

        if (last) {
            last.remove();
        }

        const note =
            document.createElement(
                "span"
            );

        note.textContent =
            "（Pitch判定できず）";

        note.style.color =
            "var(--text-secondary)";

        resultSpan.appendChild(
            note
        );

        return false;
    }

    /*
     * special moraを含めたモデルモーラ順に戻す。
     *
     * Pitch結果は通常モーラだけなので、
     * special moraはそのまま表示する。
     */
    const pitchByTextIndex =
        new Map();

    let normalIndex = 0;

    modelMorae.forEach(
        (mora, modelIndex) => {

            if (
                mora.special
            ) {
                return;
            }

            pitchByTextIndex.set(
                modelIndex,
                pitchAnalysis.results[
                    normalIndex
                ]
            );

            normalIndex++;
        }
    );

    let hasError = false;

    modelMorae.forEach(
        (mora, modelIndex) => {

            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                mora.text;

            /*
             * っ・ん・ーはPitch判定しない。
             */
            if (
                mora.special
            ) {

                span.className =
                    "pronunciation-normal";

                resultSpan.appendChild(
                    span
                );

                return;
            }

            const pitch =
                pitchByTextIndex.get(
                    modelIndex
                );

            let pitchError = false;

            if (
                pitch &&
                pitch.high != null
            ) {

                const expectedHigh =
                    !mora.low;

                if (
                    pitch.high !==
                    expectedHigh
                ) {

                    pitchError = true;
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

            resultSpan.appendChild(
                span
            );
        }
    );

    /*
     * Pitch判定不能なモーラがあれば、
     * 全体OKとはしない。
     */
    const hasUnknown =
        pitchAnalysis.results.some(
            item =>
                item.high == null
        );

    if (
        hasUnknown
    ) {

        const note =
            document.createElement(
                "span"
            );

        note.textContent =
            "（Pitch判定不明）";

        note.style.color =
            "var(--text-secondary)";

        resultSpan.appendChild(
            note
        );

        return hasError;
    }

    if (!hasError) {

        const checkSpan =
            document.createElement(
                "span"
            );

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

    if (!audioBlob) {
        return;
    }

    /*
     * まず文字・モーラ判定を表示。
     */
    renderPronunciationResult(
        resultSpan,
        operations
    );

    /*
     * 文字・モーラが完全一致していない場合、
     * Pitch解析には進まない。
     *
     * これが今回のステージ分離の重要部分。
     */
    if (
        !isTextStageCorrect(
            operations
        )
    ) {
        return;
    }

    /*
     * SpeechRecognitionの結果は
     * ここから先のPitch判定には使用しない。
     */

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

        const pitchAnalysis =
            estimatePitchPattern(
                audioBuffer,
                modelMorae
            );

        await audioContext.close();

        renderPitchResult(
            resultSpan,
            modelMorae,
            pitchAnalysis
        );

    } catch (error) {

        console.error(
            "Pitch analysis error:",
            error
        );

        /*
         * Pitch解析失敗時に
         * 勝手に✅にはしない。
         */
        resultSpan.innerHTML = "";

        const textSpan =
            document.createElement(
                "span"
            );

        textSpan.className =
            "pronunciation-normal";

        modelMorae.forEach(
            mora => {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    mora.text;

                textSpan.appendChild(
                    span
                );
            }
        );

        resultSpan.appendChild(
            textSpan
        );

        const note =
            document.createElement(
                "span"
            );

        note.textContent =
            "（Pitch判定できず）";

        note.style.color =
            "var(--text-secondary)";

        resultSpan.appendChild(
            note
        );
    }
}


// ============================================================================
// Drill initialization
// ============================================================================

function initDrill() {

    const drillList =
        document.getElementById(
            "drillList"
        );

    if (!drillList) {
        return;
    }

    drillList.innerHTML = "";

    const headerPanel =
        document.createElement(
            "div"
        );

    headerPanel.className =
        "header-panel";

    const titleArea =
        document.createElement(
            "span"
        );

    titleArea.innerHTML =
        "<strong>Pronunciation Drills</strong>";

    titleArea.style.color =
        "var(--text-primary)";

    const controlItem =
        document.createElement(
            "div"
        );

    controlItem.className =
        "control-item";


    // ========================================================================
    // Auto stop label
    // ========================================================================

    const labelAuto =
        document.createElement(
            "span"
        );

    labelAuto.className =
        isManualStop
            ? "mode-label inactive-mode custom-tip-wrap"
            : "mode-label active-mode custom-tip-wrap";

    labelAuto.innerHTML =
        '<span class="emoji-gray">⏹</span>Autostop' +
        '<span class="custom-tip-box">' +
        'Automatically stops recording when you stop speaking.' +
        "</span>";


    // ========================================================================
    // Switch
    // ========================================================================

    const switchLabel =
        document.createElement(
            "label"
        );

    switchLabel.className =
        "switch";

    const switchInput =
        document.createElement(
            "input"
        );

    switchInput.type =
        "checkbox";

    /*
     * Manual = checked
     */
    switchInput.checked =
        isManualStop;

    const slider =
        document.createElement(
            "span"
        );

    slider.className =
        "slider";

    switchLabel.appendChild(
        switchInput
    );

    switchLabel.appendChild(
        slider
    );


    // ========================================================================
    // Manual stop label
    // ========================================================================

    const labelManual =
        document.createElement(
            "span"
        );

    labelManual.className =
        isManualStop
            ? "mode-label active-mode custom-tip-wrap"
            : "mode-label inactive-mode custom-tip-wrap";

    labelManual.innerHTML =
        '<span class="emoji-gray">⏹</span>Manual stop' +
        '<span class="custom-tip-box">' +
        'Records continuously until you click the stop button.' +
        "</span>";


    // ========================================================================
    // Switch event
    // ========================================================================

    switchInput.addEventListener(
        "change",
        e => {

            isManualStop =
                e.target.checked;

            if (
                isManualStop
            ) {

                labelManual.className =
                    "mode-label active-mode custom-tip-wrap";

                labelAuto.className =
                    "mode-label inactive-mode custom-tip-wrap";

            } else {

                labelAuto.className =
                    "mode-label active-mode custom-tip-wrap";

                labelManual.className =
                    "mode-label inactive-mode custom-tip-wrap";
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
                document.createElement(
                    "div"
                );

            rowDiv.className =
                "drill-row";

            const topRow =
                document.createElement(
                    "div"
                );

            topRow.className =
                "top-row";


            // ----------------------------------------------------------------
            // Number
            // ----------------------------------------------------------------

            const numberSpan =
                document.createElement(
                    "span"
                );

            numberSpan.className =
                "sentence-number";

            numberSpan.textContent =
                `${index + 1}.`;


            // ----------------------------------------------------------------
            // Sentence + pitch display
            // ----------------------------------------------------------------

            const sentenceSpan =
                document.createElement(
                    "span"
                );

            sentenceSpan.className =
                "sentence-label";

            let speechText = "";

            itemObj.displayHtml.forEach(
                part => {

                    const span =
                        document.createElement(
                            "span"
                        );

                    if (
                        part.type ===
                        "symbol"
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

                        if (
                            part.low
                        ) {

                            span.className =
                                "low-pitch";

                            span.style.textDecorationColor =
                                itemObj.symbolColor;

                        } else {

                            span.className =
                                "high-pitch";

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
                document.createElement(
                    "span"
                );

            listenWrapper.className =
                "tooltip-wrap";

            const listenBtn =
                document.createElement(
                    "button"
                );

            listenBtn.textContent =
                "🔊 きく";

            const listenTip =
                document.createElement(
                    "span"
                );

            listenTip.className =
                "tooltip-tip";

            listenTip.textContent =
                "Listen to model audio";

            listenWrapper.appendChild(
                listenBtn
            );

            listenWrapper.appendChild(
                listenTip
            );

            listenBtn.addEventListener(
                "click",
                () => {

                    listenBtn.disabled =
                        true;

                    listenBtn.textContent =
                        "🔊Playing...";

                    setTimeout(
                        () => {

                            const utterance =
                                new SpeechSynthesisUtterance(
                                    speechText
                                );

                            utterance.lang =
                                "ja-JP";

                            utterance.rate =
                                0.7;

                            utterance.onend =
                                () => {

                                    listenBtn.disabled =
                                        false;

                                    listenBtn.textContent =
                                        "🔊 きく";
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
                document.createElement(
                    "button"
                );

            recordBtn.className =
                "custom-tip-wrap";

            recordBtn.innerHTML =
                "⏺️とる" +
                '<span class="custom-tip-box">' +
                "Start recording your voice." +
                "</span>";


            // ----------------------------------------------------------------
            // Stop button
            // ----------------------------------------------------------------

            const stopBtn =
                document.createElement(
                    "button"
                );

            stopBtn.className =
                "custom-tip-wrap";

            stopBtn.innerHTML =
                '<span class="stop-btn-emoji">⏹️</span>' +
                '<span class="custom-tip-box">' +
                "Stop the active recording." +
                "</span>";

            stopBtn.disabled =
                true;


            // ----------------------------------------------------------------
            // Result
            // ----------------------------------------------------------------

            const resultContainer =
                document.createElement(
                    "div"
                );

            resultContainer.className =
                "result-container";

            const resultSpan =
                document.createElement(
                    "span"
                );

            resultSpan.className =
                "result-text";

            resultSpan.textContent =
                "(Not recorded yet)";

            resultSpan.style.color =
                "var(--text-secondary)";


            // ----------------------------------------------------------------
            // Recorded audio playback
            // ----------------------------------------------------------------

            const playRecordWrapper =
                document.createElement(
                    "span"
                );

            playRecordWrapper.className =
                "tooltip-wrap";

            const playRecordBtn =
                document.createElement(
                    "button"
                );

            playRecordBtn.className =
                "play-record-btn";

            playRecordBtn.textContent =
                "▶️";

            const playRecordTip =
                document.createElement(
                    "span"
                );

            playRecordTip.className =
                "tooltip-tip";

            playRecordTip.textContent =
                "Play your recording";

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
                document.createElement(
                    "div"
                );

            meaningContainer.className =
                "meaning-container";

            const meaningWrapper =
                document.createElement(
                    "span"
                );

            meaningWrapper.className =
                "tooltip-wrap";

            const meaningBtn =
                document.createElement(
                    "button"
                );

            meaningBtn.className =
                "meaning-btn";

            meaningBtn.textContent =
                "🌐";

            const meaningTip =
                document.createElement(
                    "span"
                );

            meaningTip.className =
                "tooltip-tip";

            meaningTip.textContent =
                "Translate sentence";

            meaningWrapper.appendChild(
                meaningBtn
            );

            meaningWrapper.appendChild(
                meaningTip
            );

            const meaningPopup =
                document.createElement(
                    "div"
                );

            meaningPopup.className =
                "meaning-popup";

            meaningPopup.textContent =
                itemObj.meaning;

            meaningBtn.addEventListener(
                "click",
                e => {

                    e.stopPropagation();

                    meaningPopup.classList.toggle(
                        "show"
                    );
                }
            );

            document.addEventListener(
                "click",
                () => {

                    meaningPopup.classList.remove(
                        "show"
                    );
                }
            );

            meaningContainer.addEventListener(
                "click",
                e => {

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

            let recordingTimeout = null;

            /*
             * Autostop判定用。
             */
            let silenceTimer = null;

            /*
             * 録音終了処理の二重実行防止。
             */
            let recordingActive = false;
            let finishingRecording = false;


            // =================================================================
            // Recognition helpers
            // =================================================================

            function clearSilenceTimer() {

                if (
                    silenceTimer
                ) {

                    clearTimeout(
                        silenceTimer
                    );

                    silenceTimer =
                        null;
                }
            }


            function scheduleAutostop() {

                if (
                    isManualStop ||
                    !recordingActive ||
                    finishingRecording
                ) {
                    return;
                }

                clearSilenceTimer();

                /*
                 * 最後のfinal resultから1.5秒。
                 *
                 * ここでは recognition.onend だけを
                 * 「発話終了」とみなさない。
                 */
                silenceTimer =
                    setTimeout(
                        () => {

                            if (
                                !recordingActive ||
                                finishingRecording
                            ) {
                                return;
                            }

                            finishRecording();

                        },
                        1500
                    );
            }


            // =================================================================
            // Transcript processing
            // =================================================================

            function processTranscript(
                rawTranscript
            ) {

                if (!rawTranscript) {
                    return null;
                }

                /*
                 * 表示・比較ともに必ずひらがな化。
                 */
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
                        "var(--text-secondary)";

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
                    "(?:ね|よ|よね|ですね|ですよ)*$";

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
                 */
                if (
                    exactSentence
                ) {

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
            // Finish recording
            // =================================================================

            function finishRecording() {

                if (
                    finishingRecording
                ) {
                    return;
                }

                finishingRecording =
                    true;

                recordingActive =
                    false;

                clearSilenceTimer();

                if (
                    recordingTimeout
                ) {

                    clearTimeout(
                        recordingTimeout
                    );

                    recordingTimeout =
                        null;
                }

                if (
                    recognition
                ) {

                    try {
                        recognition.stop();
                    } catch (e) {}
                }

                if (
                    mediaRecorder &&
                    mediaRecorder.state !==
                        "inactive"
                ) {

                    try {
                        mediaRecorder.stop();
                    } catch (e) {}
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
                    "stop-btn-active"
                );
            }


            // =================================================================
            // Record
            // =================================================================

            recordBtn.addEventListener(
                "click",
                async () => {

                    /*
                     * 前回の録音状態を完全にリセット。
                     */
                    clearSilenceTimer();

                    recordingActive =
                        false;

                    finishingRecording =
                        false;

                    audioChunks = [];

                    latestTranscript =
                        "";

                    try {

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
                            e => {

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

                                recordingActive =
                                    false;

                                const audioBlob =
                                    new Blob(
                                        audioChunks,
                                        {
                                            type:
                                                "audio/webm"
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
                                    "inline-flex";

                                /*
                                 * 最終認識結果を使う。
                                 */
                                if (
                                    latestTranscript
                                ) {

                                    const analysis =
                                        processTranscript(
                                            latestTranscript
                                        );

                                    if (
                                        analysis
                                    ) {

                                        await analyzeRecordedAudio(
                                            audioBlob,
                                            analysis.modelMorae,
                                            analysis.operations,
                                            resultSpan
                                        );
                                    }

                                } else {

                                    resultSpan.textContent =
                                        "（音声を認識できませんでした）";

                                    resultSpan.style.color =
                                        "var(--text-secondary)";
                                }

                                finishingRecording =
                                    false;
                            };


                        mediaRecorder.start();

                        recordingActive =
                            true;


                        // ====================================================
                        // SpeechRecognition
                        // ====================================================

                        const SpeechRecognition =
                            window.SpeechRecognition ||
                            window.webkitSpeechRecognition;

                        if (
                            SpeechRecognition
                        ) {

                            recognition =
                                new SpeechRecognition();

                            recognition.lang =
                                "ja-JP";

                            recognition.interimResults =
                                false;

                            /*
                             * SpeechRecognitionを録音中に
                             * 自動再起動しない。
                             */
                            recognition.continuous =
                                false;


                            recognition.onresult =
                                e => {

                                    let rawTranscript =
                                        "";

                                    for (
                                        let i =
                                            e.resultIndex;
                                        i <
                                            e.results.length;
                                        i++
                                    ) {

                                        if (
                                            e.results[i].isFinal
                                        ) {

                                            rawTranscript +=
                                                e.results[i][0]
                                                    .transcript;
                                        }
                                    }

                                    if (
                                        !rawTranscript
                                    ) {
                                        return;
                                    }

                                    latestTranscript =
                                        rawTranscript;

                                    console.log(
                                        "[SpeechRecognition]",
                                        latestTranscript
                                    );

                                    /*
                                     * 発話が来たので
                                     * Autostopタイマーを延長。
                                     */
                                    if (
                                        !isManualStop
                                    ) {

                                        processTranscript(
                                            latestTranscript
                                        );

                                        scheduleAutostop();
                                    }
                                };


                            recognition.onerror =
                                err => {

                                    console.error(
                                        "Speech recognition error:",
                                        err
                                    );
                                };


                            recognition.onend =
                                () => {

                                    console.log(
                                        "[SpeechRecognition] ended"
                                    );
                                };


                            try {

                                recognition.start();

                            } catch (e) {

                                console.error(
                                    "Recognition start error:",
                                    e
                                );
                            }

                        } else {

                            latestTranscript =
                                "";
                        }


                        // ====================================================
                        // Recording UI
                        // ====================================================

                        recordBtn.disabled =
                            true;

                        if (
                            isManualStop
                        ) {

                            stopBtn.disabled =
                                false;

                            stopBtn.classList.add(
                                "stop-btn-active"
                            );

                            resultSpan.textContent =
                                "Recording (Max 15s)...";

                        } else {

                            stopBtn.disabled =
                                true;

                            stopBtn.classList.remove(
                                "stop-btn-active"
                            );

                            resultSpan.textContent =
                                "Recording...";
                        }

                        resultSpan.style.color =
                            "var(--accent-color)";

                        playRecordBtn.style.display =
                            "none";


                        // ====================================================
                        // Manual mode maximum 15 seconds
                        // ====================================================

                        if (
                            isManualStop
                        ) {

                            recordingTimeout =
                                setTimeout(
                                    () => {

                                        finishRecording();

                                    },
                                    15000
                                );
                        }

                    } catch (err) {

                        console.error(
                            "Mic error:",
                            err
                        );

                        recordingActive =
                            false;

                        finishingRecording =
                            false;

                        resultSpan.textContent =
                            "Mic error";

                        resultSpan.style.color =
                            "var(--error-text)";

                        recordBtn.disabled =
                            false;

                        stopBtn.disabled =
                            true;

                        stopBtn.classList.remove(
                            "stop-btn-active"
                        );
                    }
                }
            );


            // =================================================================
            // Manual stop button
            // =================================================================

            stopBtn.addEventListener(
                "click",
                () => {

                    finishRecording();
                }
            );


            // =================================================================
            // Recorded audio playback
            // =================================================================

            playRecordBtn.addEventListener(
                "click",
                () => {

                    if (
                        !recordedAudioUrl
                    ) {
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
                        "▶️ Playing...";

                    audio.play();

                    audio.onended =
                        () => {

                            playRecordBtn.disabled =
                                false;

                            playRecordBtn.textContent =
                                "▶️";
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
    "DOMContentLoaded",
    initDrill
);
