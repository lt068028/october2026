// ============================================================================
// Practice 7.3: ているform③ past tense
// ============================================================================

(() => {
"use strict";

const W = (kanji, hira, romaji, meaning) => ({
    kanji, hira, romaji, meaning
});

const words = {
    yesterday: W("昨日", "きのう", "kinō", "yesterday"),
    mother: W("母", "はは", "haha", "my mother"),
    phone: W("電話する", "でんわする", "denwa suru", "to call"),
    afternoon: W(
        "昨日の午後", "きのうのごご",
        "kinō no gogo", "yesterday afternoon"
    ),
    morning10: W(
        "昨日の朝10時", "きのうのあさ10じ",
        "kinō no asa jū-ji", "yesterday at 10 a.m."
    ),
    afternoon2: W(
        "昨日の午後2時", "きのうのごご2じ",
        "kinō no gogo ni-ji", "yesterday at 2 p.m."
    ),
    night8: W(
        "昨日の夜8時", "きのうのよる8じ",
        "kinō no yoru hachi-ji", "yesterday at 8 p.m."
    ),
    morning: W(
        "昨日の午前中", "きのうのごぜんちゅう",
        "kinō no gozenchū", "yesterday morning"
    ),
    night9: W(
        "昨日の夜9時", "きのうのよる9じ",
        "kinō no yoru ku-ji", "yesterday at 9 p.m."
    ),
    letter: W("手紙", "てがみ", "tegami", "letter"),
    write: W("書く", "かく", "kaku", "to write"),
    pool: W("プール", "プール", "pūru", "pool"),
    swim: W("泳ぐ", "およぐ", "oyogu", "to swim"),
    karaoke: W("カラオケ", "カラオケ", "karaoke", "karaoke"),
    sing: W("歌う", "うたう", "utau", "to sing"),
    do: W("する", "する", "suru", "to do"),
    wait: W("待つ", "まつ", "matsu", "to wait"),
    help: W("手伝う", "てつだう", "tetsudau", "to help"),
    sister: W("妹", "いもうと", "imōto", "younger sister"),
    english: W("英語", "えいご", "eigo", "English"),
    teach: W("教える", "おしえる", "oshieru", "to teach"),
    kanji: W("漢字", "かんじ", "kanji", "kanji"),
    memorize: W("覚える", "おぼえる", "oboeru", "to memorize"),
    until: W("いつまで", "いつまで", "itsu made", "until when"),
    sleep: W("寝る", "ねる", "neru", "to sleep"),
    nine: W(
        "朝9時まで", "あさ9じまで",
        "asa ku-ji made", "until 9 a.m."
    ),
    company: W(
        "あの会社", "あのかいしゃ",
        "ano kaisha", "that company"
    ),
    work: W("働く", "はたらく", "hataraku", "to work"),
    lastyear: W(
        "去年まで", "きょねんまで",
        "kyonen made", "until last year"
    ),
    tokyo: W("東京", "とうきょう", "Tōkyō", "Tokyo"),
    live: W("住む", "すむ", "sumu", "to live"),
    three: W(
        "3年前まで", "3ねんまえまで",
        "san-nen mae made", "until three years ago"
    ),
    marry: W(
        "結婚する", "けっこんする",
        "kekkon suru", "to get married"
    ),
    bicycle: W("自転車", "じてんしゃ", "jitensha", "bicycle"),
    borrow: W("借りる", "かりる", "kariru", "to borrow"),
    untilYesterday: W(
        "昨日まで", "きのうまで",
        "kinō made", "until yesterday"
    ),
    homework: W(
        "宿題のこと", "しゅくだいのこと",
        "shukudai no koto", "the homework"
    ),
    forget: W("忘れる", "わすれる", "wasureru", "to forget"),
    earlier: W(
        "さっきまで", "さっきまで",
        "sakki made", "until a moment ago"
    )
};

const row = (
    label, cues, text, hira, marks = [], tag = ""
) => ({
    label, cues, text, hira, marks, tag
});

const pair = (a, b) => [a, b];

const sections = [
    {
        title: "Drill 1: Compare Past & Past Continuous",
        instruction:
            "💡 Compare a completed past action with an action " +
            "in progress at a past time.",

        example: pair(
            row(
                "Past Tense:",
                ["yesterday", "mother", "phone"],
                "昨日、母に電話しました。",
                "きのう、ははにでんわしました。",
                ["ました"],
                "past"
            ),
            row(
                "Past Continuous:",
                ["afternoon", "mother", "phone"],
                "昨日の午後、母に電話していました。",
                "きのうのごご、ははにでんわしていました。",
                ["昨日の午後", "きのうのごご", "ていました"],
                "ongoing"
            )
        ),

        items: [
            pair(
                row(
                    "Past:",
                    ["yesterday", "letter", "write"],
                    "昨日、手紙を書きました。",
                    "きのう、てがみをかきました。",
                    [],
                    "past"
                ),
                row(
                    "Past Continuous:",
                    ["morning10", "letter", "write"],
                    "昨日の朝10時、手紙を書いていました。",
                    "きのうのあさ10じ、てがみをかいていました。",
                    [],
                    "ongoing"
                )
            ),
            pair(
                row(
                    "Past:",
                    ["yesterday", "pool", "swim"],
                    "昨日、プールで泳ぎました。",
                    "きのう、プールでおよぎました。",
                    [],
                    "past"
                ),
                row(
                    "Past Continuous:",
                    ["afternoon2", "pool", "swim"],
                    "昨日の午後2時、プールで泳いでいました。",
                    "きのうのごご2じ、プールでおよいでいました。",
                    [],
                    "ongoing"
                )
            ),
            pair(
                row(
                    "Past:",
                    ["yesterday", "karaoke", "sing"],
                    "昨日、カラオケで歌いました。",
                    "きのう、カラオケでうたいました。",
                    [],
                    "past"
                ),
                row(
                    "Past Continuous:",
                    ["night8", "karaoke", "sing"],
                    "昨日の夜8時、カラオケで歌っていました。",
                    "きのうのよる8じ、カラオケでうたっていました。",
                    [],
                    "ongoing"
                )
            )
        ]
    },

    {
        title: "Drill 2: What were you doing?",
        instruction:
            "💡 Ask what someone was doing at the given time, " +
            "then answer using the cues.",

        example: pair(
            row(
                "Question:",
                ["night8", "do"],
                "昨日の夜8時、何をしていましたか。",
                "きのうのよる8じ、なにをしていましたか。",
                [
                    "昨日の夜8時",
                    "きのうのよる8じ",
                    "ていましたか"
                ]
            ),
            row(
                "Response:",
                ["night8", "wait"],
                "昨日の夜8時、友だちを待っていました。",
                "きのうのよる8じ、ともだちをまっていました。",
                [
                    "昨日の夜8時",
                    "きのうのよる8じ",
                    "ていました"
                ]
            )
        ),

        items: [
            pair(
                row(
                    "Question:",
                    ["morning", "do"],
                    "昨日の午前中、何をしていましたか。",
                    "きのうのごぜんちゅう、なにをしていましたか。"
                ),
                row(
                    "Response:",
                    ["morning", "mother", "help"],
                    "昨日の午前中、母を手伝っていました。",
                    "きのうのごぜんちゅう、ははをてつだっていました。"
                )
            ),
            pair(
                row(
                    "Question:",
                    ["afternoon", "do"],
                    "昨日の午後、何をしていましたか。",
                    "きのうのごご、なにをしていましたか。"
                ),
                row(
                    "Response:",
                    ["afternoon", "sister", "english", "teach"],
                    "昨日の午後、妹に英語を教えていました。",
                    "きのうのごご、いもうとにえいごをおしえていました。"
                )
            ),
            pair(
                row(
                    "Question:",
                    ["night9", "do"],
                    "昨日の夜9時、何をしていましたか。",
                    "きのうのよる9じ、なにをしていましたか。"
                ),
                row(
                    "Response:",
                    ["night9", "kanji", "memorize"],
                    "昨日の夜9時、漢字を覚えていました。",
                    "きのうのよる9じ、かんじをおぼえていました。"
                )
            )
        ]
    },

    {
        title: "Drill 3: Until when?",
        instruction:
            "💡 Ask when an activity or state ended. " +
            "Answer using まで and ていました.",

        example: pair(
            row(
                "Question:",
                ["until", "sleep"],
                "いつまで寝ていましたか。",
                "いつまでねていましたか。",
                ["いつまで", "ていましたか"]
            ),
            row(
                "Response:",
                ["nine", "sleep"],
                "朝9時まで寝ていました。",
                "あさ9じまでねていました。",
                ["まで", "ていました"]
            )
        ),

        items: [
            pair(
                row(
                    "Question:",
                    ["until", "company", "work"],
                    "いつまであの会社で働いていましたか。",
                    "いつまであのかいしゃではたらいていましたか。"
                ),
                row(
                    "Response:",
                    ["lastyear", "company", "work"],
                    "去年まで、あの会社で働いていました。",
                    "きょねんまで、あのかいしゃではたらいていました。"
                )
            ),
            pair(
                row(
                    "Question:",
                    ["until", "tokyo", "live"],
                    "いつまで東京に住んでいましたか。",
                    "いつまでとうきょうにすんでいましたか。"
                ),
                row(
                    "Response:",
                    ["three", "tokyo", "live"],
                    "3年前まで、東京に住んでいました。",
                    "3ねんまえまで、とうきょうにすんでいました。"
                )
            ),
            pair(
                row(
                    "Question:",
                    ["until", "marry"],
                    "いつまで結婚していましたか。",
                    "いつまでけっこんしていましたか。"
                ),
                row(
                    "Response:",
                    ["lastyear", "marry"],
                    "去年まで結婚していました。",
                    "きょねんまでけっこんしていました。"
                )
            ),
            pair(
                row(
                    "Question:",
                    ["until", "bicycle", "borrow"],
                    "いつまで自転車を借りていましたか。",
                    "いつまでじてんしゃをかりていましたか。"
                ),
                row(
                    "Response:",
                    ["untilYesterday", "bicycle", "borrow"],
                    "昨日まで自転車を借りていました。",
                    "きのうまでじてんしゃをかりていました。"
                )
            ),
            pair(
                row(
                    "Question:",
                    ["until", "homework", "forget"],
                    "いつまで宿題のことを忘れていましたか。",
                    "いつまでしゅくだいのことをわすれていましたか。"
                ),
                row(
                    "Response:",
                    ["earlier", "homework", "forget"],
                    "さっきまで、宿題のことを忘れていました。",
                    "さっきまで、しゅくだいのことをわすれていました。"
                )
            )
        ]
    }
];

let scriptMode = "kanji";
let hintMode = "hover";
let manual = false;
let autoplay = true;
let session = null;
let preparing = false;
let playingAudio = null;
let utterance = null;
let playButton = null;

const saved = new Map();
const views = new Map();
const $ = id => document.getElementById(id);

const escape = s => String(s).replace(
    /[&<>"']/g,
    c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c])
);

// ============================================================================
// Vocabulary and example formatting
// ============================================================================

function word(key) {
    const w = words[key];
    const text = escape(
        scriptMode === "kanji" ? w.kanji : w.hira
    );
    const hint = escape(w.romaji + ", " + w.meaning);

    if (hintMode === "off") {
        return `<span class="target-word">${text}</span>`;
    }

    if (hintMode === "paren") {
        return (
            `<span class="target-word">${text}</span>` +
            `<span class="vocab-inline">(${hint})</span>`
        );
    }

    return (
        `<span class="tooltip-wrap">` +
        `<span class="target-word">${text}</span>` +
        `<span class="tooltip-tip">${hint}</span>` +
        `</span>`
    );
}

function sentence(r, example = false) {
    const text = scriptMode === "kanji" ? r.text : r.hira;

    if (!example) return escape(text);

    const marks = [...r.marks].sort(
        (a, b) => b.length - a.length
    );

    if (!marks.length) return escape(text);

    const regex = new RegExp(
        marks.map(
            x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        ).join("|"),
        "g"
    );

    let output = "";
    let offset = 0;

    for (const match of text.matchAll(regex)) {
        output +=
            escape(text.slice(offset, match.index)) +
            `<strong class="p73-gold">` +
            escape(match[0]) +
            `</strong>`;

        offset = match.index + match[0].length;
    }

    return output + escape(text.slice(offset));
}

function tag(r) {
    if (!r.tag) return "";

    return (
        `<span class="p73-tense p73-${r.tag}">` +
        (
            r.tag === "past"
                ? "⏪Past"
                : "◀️Past Ongoing"
        ) +
        `</span>`
    );
}

function button(text, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "example-button";
    b.textContent = text;
    b.onclick = fn;
    return b;
}

// ============================================================================
// Model and recording playback
// ============================================================================

function stopPlayback() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    if (playingAudio) {
        playingAudio.pause();
        playingAudio = null;
    }

    if (playButton) {
        playButton.disabled = false;
        playButton.textContent = playButton.dataset.label;
        playButton = null;
    }

    utterance = null;
}
// ============================================================================
// 7.3：Drill3・読み上げ・Example幅の調整
// ============================================================================

words.car = W("車", "くるま", "kuruma", "car");
words.hold = W("持つ", "もつ", "motsu", "to have / own");

sections[2].instruction =
    "💡 Until when did that state continue?";

sections[2].items[0] = pair(
    row(
        "Question:",
        ["until", "car", "hold"],
        "いつまで車を持っていましたか。",
        "いつまでくるまをもっていましたか。"
    ),
    row(
        "Response:",
        ["lastyear", "car", "hold"],
        "去年まで、車を持っていました。",
        "きょねんまで、くるまをもっていました。"
    )
);

// 車・持つの抽出文も、表示切替と判定に対応。
const practice73OriginalHira = hira;

hira = function (text) {
    return practice73OriginalHira(
        String(text ?? "")
            .replace(/車/g, "くるま")
            .replace(/持/g, "も")
    );
};

// 表示文・判定文を変えず、読み上げ時だけ読点を追加。
function practice73SpeechText(text) {
    let value = String(text ?? "");

    value = value.replace(
        /^いつまで[、,\s]*/,
        "いつまで、"
    );

    const verb = value.match(
        /(電話し|書き|書い|泳ぎ|泳い|歌い|歌っ|待っ|手伝っ|教え|覚え|寝|働い|住ん|結婚し|借り|忘れ|持っ|し)(?:ました|ていました|でいました)/
    );

    if (verb && verb.index > 0) {
        const before = value
            .slice(0, verb.index)
            .replace(/[、,\s]+$/, "");

        value =
            before +
            "、" +
            value.slice(verb.index);
    }

    return value;
}

const practice73OriginalSpeak = speak;

speak = function (text, b, done) {
    return practice73OriginalSpeak(
        practice73SpeechText(text),
        b,
        done
    );
};

const practice73OriginalRender = render;

render = function () {
    practice73OriginalRender();

    const root = $("drill1Container");

    // Until when?はExample・問題ともPast Stateに統一。
    const examples = root.querySelectorAll(".p73-example");
    const tables = root.querySelectorAll("table.p73-table");

    [examples[2], tables[2]].forEach(container => {
        container?.querySelectorAll(".p73-tense").forEach(label => {
            label.classList.remove(
                "p73-ongoing",
                "p73-past"
            );

            label.classList.add("p73-state");
            label.textContent = "⏳Past State";
        });
    });

    let style = document.getElementById(
        "practice73ExampleWidthStyle"
    );

    if (!style) {
        style = document.createElement("style");
        style.id = "practice73ExampleWidthStyle";
    }

    style.textContent = `
        #drill1Container .p73-example {
            min-width: 0;
            overflow: visible;
        }

        #drill1Container .p73-example table.p73-example-table {
            width: 100% !important;
            min-width: 0 !important;
            table-layout: auto !important;
            border-collapse: collapse;
        }

        #drill1Container .p73-example table.p73-example-table td {
            width: 1%;
            min-width: 0 !important;
            padding-left: 4px;
            padding-right: 4px;
            vertical-align: middle;
            white-space: nowrap !important;
            overflow-wrap: normal;
            word-break: normal;
        }

        #drill1Container .p73-example table.p73-example-table td:first-child {
            padding-left: 0;
        }

        #drill1Container .p73-example table.p73-example-table td:last-child {
            width: auto;
            padding-right: 0;
            white-space: normal !important;
        }

        #drill1Container .p73-example table.p73-example-table .p73-tense {
            display: inline-block;
            box-sizing: border-box;
            padding: 4px 8px;
            margin: 0 6px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: bold;
            white-space: nowrap;
            overflow-wrap: normal;
        }

        #drill1Container .p73-example table.p73-example-table button {
            width: auto;
            max-width: none;
            white-space: nowrap;
            overflow-wrap: normal;
        }
    `;
    document.head.append(style);
};

function speak(text, b, done) {
    stopPlayback();

    if (!window.speechSynthesis) {
        if (done) done();
        return;
    }

    const voices = window.speechSynthesis.getVoices();

    const voice = [
        "chrome os", "keita", "nanami", "google"
    ].map(name =>
        voices.find(v =>
            v.lang.startsWith("ja") &&
            v.name.toLowerCase().includes(name)
        )
    ).find(Boolean) || voices.find(
        v => v.lang.startsWith("ja")
    );

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;

    if (voice) u.voice = voice;

    if (b) {
        playButton = b;
        b.dataset.label = b.textContent;
        b.disabled = true;
        b.textContent = "Playing...";
    }

    utterance = u;

    const finish = () => {
        if (utterance !== u) return;
        stopPlayback();
        if (done) done();
    };

    u.onend = finish;
    u.onerror = finish;

    window.speechSynthesis.speak(u);
}

function playRecording(key, b) {
    const value = saved.get(key);

    if (!value?.url || session || preparing) return;

    stopPlayback();

    playingAudio = new Audio(value.url);
    playingAudio.playbackRate = 1;

    if (b) {
        playButton = b;
        b.dataset.label = b.textContent;
        b.disabled = true;
        b.textContent = "Playing...";
    }

    playingAudio.onended = stopPlayback;
    playingAudio.onerror = stopPlayback;
    playingAudio.play().catch(stopPlayback);
}

// ============================================================================
// Rendering
// ============================================================================

function render() {
    stopPlayback();
    views.clear();

    words.do = W(
        "何をする",
        "なにをする",
        "nani o suru",
        "what to do"
    );

    let style = document.getElementById("practice73LayoutStyle");

    if (!style) {
        style = document.createElement("style");
        style.id = "practice73LayoutStyle";
        document.head.append(style);
    }

    style.textContent = `
        #drill1Container .p73-example {
            overflow-x: auto;
        }

        #drill1Container .p73-example-table,
        #drill1Container .p73-table {
            display: table !important;
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
        }

        #drill1Container .p73-example-table tr,
        #drill1Container .p73-table tr.drill-row {
            display: table-row !important;
        }

        #drill1Container .p73-example-table td,
        #drill1Container .p73-table td {
            display: table-cell !important;
            vertical-align: middle;
            padding: 6px 4px;
        }

        #drill1Container .p73-example-table tr + tr td {
            border-top: 1px dashed var(--border-color, #b8a971);
            padding-top: 10px;
        }

        #drill1Container .p73-example-kind,
        #drill1Container .p73-example-cues,
        #drill1Container .p73-example-arrow,
        #drill1Container .p73-example-listen,
        #drill1Container .p73-example-tag {
            width: 1%;
            white-space: nowrap;
        }

        #drill1Container .p73-example-kind {
            font-weight: bold;
            background: none;
            color: var(--text-primary);
        }

        #drill1Container .p73-example-model {
            line-height: 1.8;
        }

        #drill1Container .p73-example-tag .p73-tense {
            margin: 0;
        }

        #drill1Container .p73-example .p73-gold {
            color: #CA8A04;
            font-weight: bold;
        }

        #drill1Container .p73-table .prompt-label {
            width: 1% !important;
            min-width: 0 !important;
            white-space: nowrap !important;
            padding-right: 4px !important;
        }

        #drill1Container .p73-control-line {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        #drill1Container .p73-actions {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
            white-space: nowrap;
        }

        #drill1Container .p73-actions button {
            margin: 0;
        }

        #drill1Container .p73-result-wrap {
            margin-left: auto;
            padding-left: 12px;
            text-align: right;
            min-width: 0;
        }

        #drill1Container .p73-result-wrap .result-text {
            margin: 0;
            overflow-wrap: anywhere;
        }

        #drill1Container .p73-controls .correction-box {
            text-align: right;
        }

        #drill1Container .p73-state {
            background: #dcfce7;
            color: #15803d;
        }

        @media (prefers-color-scheme: dark) {
            #drill1Container .p73-example .p73-gold {
                color: #FBBF24;
            }

            #drill1Container .p73-state {
                background: #14532d;
                color: #bbf7d0;
            }
        }
    `;

    const root = $("drill1Container");
    root.replaceChildren();

    function badge(r, sectionIndex) {
        if (r.tag === "past") {
            return tag(r);
        }

        const state =
            sectionIndex === 2 &&
            r.cues.some(key =>
                ["live", "marry", "borrow", "forget"].includes(key)
            );

        const className = state
            ? "p73-state"
            : "p73-ongoing";

        const label = state
            ? "⏳Past State"
            : "◀️Past Ongoing";

        return (
            `<span class="p73-tense ${className}">` +
            label +
            `</span>`
        );
    }

    sections.forEach((section, si) => {
        // ====================================================
        // Example：種類・キュー・👉・きく・分類・全文の6列
        // ====================================================

        const example = document.createElement("div");
        example.className = "example-box p73-example";

        const exampleTable = document.createElement("table");
        exampleTable.className = "p73-example-table";

        const exampleBody = document.createElement("tbody");
        exampleTable.append(exampleBody);

        section.example.forEach(r => {
            const tr = document.createElement("tr");

            const kind = document.createElement("td");
            kind.className = "p73-example-kind";
            kind.textContent = r.label.replace(
                "Past Continuous",
                "Past Ongoing"
            );

            const cue = document.createElement("td");
            cue.className = "p73-example-cues";
            cue.innerHTML = r.cues.map(word).join("／");

            const arrow = document.createElement("td");
            arrow.className = "p73-example-arrow";
            arrow.textContent = "👉";

            const listenCell = document.createElement("td");
            listenCell.className = "p73-example-listen";

            const listen = button("🔊きく", () => {
                if (!session && !preparing) {
                    speak(r.text, listen);
                }
            });

            listenCell.append(listen);

            const type = document.createElement("td");
            type.className = "p73-example-tag";
            type.innerHTML = badge(r, si);

            const model = document.createElement("td");
            model.className = "p73-example-model";
            model.innerHTML = sentence(r, true);

            tr.append(
                kind,
                cue,
                arrow,
                listenCell,
                type,
                model
            );

            exampleBody.append(tr);
        });

        example.append(exampleTable);
        root.append(example);

        // ====================================================
        // Drill見出し・Instruction
        // ====================================================

        const panel = document.createElement("div");
        panel.className = "info-panel info-panel-task1";

        const title = section.title.replace(
            "Past Continuous",
            "Past Ongoing"
        );

        panel.innerHTML =
            `<span class="info-panel-title">` +
            escape(title) +
            `</span>` +
            `<span class="info-panel-desc">` +
            escape(section.instruction) +
            `</span>`;

        root.append(panel);

        // ====================================================
        // Drill：番号・キュー・操作と抽出文
        // ====================================================

        const table = document.createElement("table");
        table.className = "p73-table";

        const body = document.createElement("tbody");
        table.append(body);

        section.items.forEach((rows, index) => {
            rows.forEach((r, ri) => {
                const key = `${si}-${index}-${ri}`;

                const tr = document.createElement("tr");
                tr.className = "drill-row";

                if (!ri) {
                    const num = document.createElement("td");
                    num.rowSpan = 2;
                    num.className = "p73-number";
                    num.textContent = (index + 1) + ".";
                    tr.append(num);
                }

                const cue = document.createElement("td");
                cue.className = "prompt-label";
                cue.innerHTML = r.cues.map(word).join("／");
                tr.append(cue);

                const controls = document.createElement("td");
                controls.className = "p73-controls";

                const line = document.createElement("div");
                line.className = "p73-control-line";

                const actions = document.createElement("span");
                actions.className = "p73-actions";

                const listen = button("🔊きく", () => {
                    if (!session && !preparing) {
                        speak(r.text, listen);
                    }
                });

                const type = document.createElement("span");
                type.innerHTML = badge(r, si);

                const rec = button(
                    "🎙️とる",
                    () => record(key, r)
                );

                rec.setAttribute("aria-label", "Record");

                const stop = button("⏹️", () => {
                    if (session?.key === key) {
                        session.stop();
                    }
                });

                stop.setAttribute(
                    "aria-label",
                    "Stop recording"
                );

                stop.disabled = true;

                actions.append(
                    listen,
                    type,
                    rec,
                    stop
                );

                const resultWrap = document.createElement("span");
                resultWrap.className = "p73-result-wrap";

                const result = document.createElement("span");
                result.className = "result-text";

                resultWrap.append(result);

                line.append(
                    actions,
                    resultWrap
                );

                const correction = document.createElement("div");
                correction.className = "correction-box";
                correction.hidden = true;

                controls.append(
                    line,
                    correction
                );

                tr.append(controls);
                body.append(tr);

                views.set(key, {
                    r,
                    rec,
                    stop,
                    result,
                    correction
                });

                showResult(key);
            });
        });

        const wrap = document.createElement("div");
        wrap.className = "p73-table-wrap";
        wrap.append(table);
        root.append(wrap);
    });
    // 質問・返答の2行を、7.2と同じ角丸カードで囲む。
    let cardStyle = document.getElementById(
        "practice73CardRestoreStyle"
    );

    if (!cardStyle) {
        cardStyle = document.createElement("style");
        cardStyle.id = "practice73CardRestoreStyle";
        document.head.append(cardStyle);
    }

    cardStyle.textContent = `
        #drill1Container .p73-example .p73-example-heading {
            display: none !important;
        }

        #drill1Container .p73-card-list-wrap {
            overflow: visible !important;
        }

        #drill1Container .p73-table > tbody > tr > td.p73-card-cell {
            padding: 0 !important;
            border: 0;
        }

        #drill1Container div.p73-question-card.drill-row {
            display: block !important;
            overflow: visible !important;
        }

        #drill1Container .p73-question-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
        }

        #drill1Container .p73-question-table > tbody > tr {
            display: table-row !important;
            background: transparent;
            border: 0;
        }
    `;

    root.querySelectorAll("table.p73-table").forEach(table => {
        const body = table.tBodies[0];
        const rows = Array.from(body.children);

        table.parentElement.classList.add(
            "p73-card-list-wrap"
        );

        body.replaceChildren();

        for (
            let index = 0;
            index < rows.length;
            index += 2
        ) {
            const card = document.createElement("div");
            card.className = "drill-row p73-question-card";

            const innerTable = document.createElement("table");
            innerTable.className = "p73-question-table";

            const innerBody = document.createElement("tbody");

            rows.slice(index, index + 2).forEach(row => {
                row.classList.remove("drill-row");
                innerBody.append(row);
            });

            innerTable.append(innerBody);
            card.append(innerTable);

            const cardRow = document.createElement("tr");
            const cardCell = document.createElement("td");

            cardCell.className = "p73-card-cell";
            cardCell.colSpan = 3;
            cardCell.append(card);

            cardRow.append(cardCell);
            body.append(cardRow);
        }
    });
    sync();
}

// ============================================================================
// Recognition normalization
// ============================================================================

const dictionary = [
    ["午前中", "ごぜんちゅう"],
    ["自転車", "じてんしゃ"],
    ["友達", "ともだち"],
    ["友だち", "ともだち"],
    ["昨日", "きのう"],
    ["午後", "ごご"],
    ["手紙", "てがみ"],
    ["電話", "でんわ"],
    ["手伝", "てつだ"],
    ["英語", "えいご"],
    ["漢字", "かんじ"],
    ["会社", "かいしゃ"],
    ["東京", "とうきょう"],
    ["結婚", "けっこん"],
    ["宿題", "しゅくだい"],
    ["去年", "きょねん"],
    ["年前", "ねんまえ"],
    ["覚", "おぼ"],
    ["教", "おし"],
    ["働", "はたら"],
    ["住", "す"],
    ["借", "か"],
    ["忘", "わす"],
    ["書", "か"],
    ["泳", "およ"],
    ["歌", "うた"],
    ["待", "ま"],
    ["寝", "ね"],
    ["母", "はは"],
    ["妹", "いもうと"],
    ["何", "なに"],
    ["朝", "あさ"],
    ["夜", "よる"],
    ["時", "じ"]
];

function hira(text) {
    let s = String(text).normalize("NFKC");

    for (const [a, b] of dictionary) {
        s = s.split(a).join(b);
    }

    return s.replace(
        /[ァ-ヶ]/g,
        c => String.fromCharCode(c.charCodeAt(0) - 96)
    );
}

function normalize(text) {
    return hira(text)
        .replace(/三(?=ねんまえ)/g, "3")
        .replace(/十(?=じ)/g, "10")
        .replace(/二(?=じ)/g, "2")
        .replace(/八(?=じ)/g, "8")
        .replace(/九(?=じ)/g, "9")
        .replace(/くじ|きゅうじ/g, "9じ")
        .replace(/はちじ/g, "8じ")
        .replace(/じゅうじ/g, "10じ")
        .replace(/にじ/g, "2じ")
        .replace(/さんねんまえ/g, "3ねんまえ")
        .replace(/[\s、。,.!?！？「」『』]/g, "");
}

// ============================================================================
// Result display and recording controls
// ============================================================================

function showResult(key, notice = "") {
    const v = views.get(key);
    if (!v) return;

    const value = saved.get(key);

    v.result.replaceChildren();
    v.correction.replaceChildren();
    v.correction.hidden = true;

    if (session?.key === key) {
        v.result.textContent = "Recording...";
        return;
    }

    if (value?.raw) {
        const text = document.createElement("span");

        text.textContent =
            (
                scriptMode === "hiragana"
                    ? hira(value.raw)
                    : value.raw
            ) +
            (value.correct ? " ✅" : "");

        v.result.append(text);

        if (value.url) {
            const play = button(
                "▶️", () => playRecording(key, play)
            );

            play.setAttribute(
                "aria-label", "Play your recording"
            );

            v.result.append(play);
        }

        if (!value.correct) {
            v.correction.hidden = false;

            const model = button("🔊きく", () => {
                if (!session && !preparing) {
                    speak(v.r.text, model);
                }
            });

            const t = document.createElement("span");

            t.textContent =
                scriptMode === "kanji"
                    ? v.r.text
                    : v.r.hira;

            v.correction.append(model, t);
        }
    } else {
        v.result.textContent = "(Not recorded yet)";

        if (value?.url) {
            const play = button(
                "▶️", () => playRecording(key, play)
            );
            v.result.append(play);
        }
    }

    if (notice) {
        const n = document.createElement("span");
        n.className = "p73-notice";
        n.textContent = notice;
        v.result.append(n);
    }
}

function sync() {
    const blocked = Boolean(session || preparing);

    $("drill1Container")
        .querySelectorAll("button")
        .forEach(b => {
            b.disabled = blocked;
        });

    views.forEach((v, key) => {
        const canStop =
            session?.key === key &&
            session.manual &&
            !session.stopping;

        v.stop.disabled = !canStop;

        v.stop.classList.toggle(
            "stop-btn-active",
            Boolean(canStop)
        );
    });
}

async function record(key, r) {
    if (session || preparing) return;

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition || !window.MediaRecorder) {
        showResult(
            key,
            "Speech recognition or recording is not supported."
        );
        return;
    }

    stopPlayback();
    preparing = true;
    sync();

    views.get(key).result.textContent =
        "Preparing microphone...";

    let stream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
    } catch (e) {
        preparing = false;
        showResult(key, "Microphone access denied.");
        sync();
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
        notice: "",
        context: null
    };

    session = s;

    const clear = () => {
        s.timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });

        s.timers = [];

        if (s.context) {
            s.context.close().catch(() => {});
            s.context = null;
        }
    };

    const finish = () => {
        if (
            s.finished ||
            !s.recognitionDone ||
            !s.recorderDone
        ) {
            return;
        }

        s.finished = true;
        clear();

        stream.getTracks().forEach(t => t.stop());

        if (s.recognition) {
            s.recognition.onend = null;
            s.recognition.onresult = null;
            s.recognition.onerror = null;

            try {
                s.recognition.abort();
            } catch (e) {}
        }

        session = null;

        if (s.interim?.trim()) {
            s.raw += s.interim;
        }

        const previous = saved.get(key) || {};

        if (
            !s.discard &&
            s.heard &&
            s.chunks.length
        ) {
            const url = URL.createObjectURL(
                new Blob(s.chunks, {
                    type: s.recorder.mimeType || "audio/webm"
                })
            );

            if (previous.url) {
                URL.revokeObjectURL(previous.url);
            }

            saved.set(key, {
                url,
                raw: s.raw.trim(),
                correct:
                    Boolean(s.raw.trim()) &&
                    normalize(s.raw) === normalize(r.hira)
            });
        }

        s.chunks = [];

        showResult(
            key,
            s.notice ||
            (!s.raw.trim() ? "No speech recognized." : "")
        );

        sync();

        if (
            autoplay &&
            !s.discard &&
            s.raw.trim()
        ) {
            speak(r.text, null, () => {
                if (!session && !preparing) {
                    playRecording(key);
                }
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
        } catch (e) {
            s.recognitionDone = true;
        }

        if (
            !s.recorder ||
            s.recorder.state === "inactive"
        ) {
            s.recorderDone = true;
        } else {
            try {
                s.recorder.stop();
            } catch (e) {
                s.recorderDone = true;
                s.discard = true;
            }
        }

        s.timers.push(
            setTimeout(() => {
                s.recognitionDone = true;

                if (!s.recorderDone) {
                    s.recorderDone = true;
                    s.discard = true;
                }

                finish();
            }, 2500)
        );

        finish();
    };

    try {
        const recognition = new Recognition();
        s.recognition = recognition;

        recognition.lang = "ja-JP";
        recognition.continuous = true;
        recognition.interimResults = true;

        let interim = "";
        let lastSound = Date.now();

        const heard = () => {
            s.heard = true;
            lastSound = Date.now();
        };

        recognition.onspeechstart = heard;

        recognition.onresult = e => {
            if (s.finished || s.discard) return;

            interim = "";

            for (
                let i = e.resultIndex;
                i < e.results.length;
                i++
            ) {
                const text = e.results[i][0].transcript;

                if (text.trim()) heard();

                if (e.results[i].isFinal) {
                    s.raw += text;
                } else {
                    interim += text;
                }
            }

            s.interim = interim;
        };

        recognition.onerror = e => {
            if (
                s.stopping ||
                e.error === "no-speech"
            ) {
                return;
            }

            s.recognitionDone = true;
            s.stop("Recognition error.", true);
        };

        recognition.onend = () => {
            s.recognitionDone = true;

            if (s.stopping) {
                finish();
                return;
            }

            try {
                recognition.start();
                s.recognitionDone = false;
            } catch (e) {
                s.stop(
                    "Could not restart recognition.",
                    true
                );
            }
        };

        const recorder = new MediaRecorder(stream);
        s.recorder = recorder;

        recorder.ondataavailable = e => {
            if (!s.finished && e.data.size) {
                s.chunks.push(e.data);
            }
        };

        recorder.onstop = () => {
            s.recorderDone = true;

            if (!s.stopping) {
                s.stop("Recording stopped.");
            }

            finish();
        };

        recorder.onerror = () => {
            s.stop("Recording error.", true);
        };

        showResult(key);
        sync();

        recorder.start();
        recognition.start();

        try {
            const Context =
                window.AudioContext ||
                window.webkitAudioContext;

            const context = new Context();
            s.context = context;

            context.resume().catch(() => {});

            const analyser = context.createAnalyser();
            analyser.fftSize = 1024;

            context
                .createMediaStreamSource(stream)
                .connect(analyser);

            const samples = new Float32Array(
                analyser.fftSize
            );

            let frames = 0;

            s.timers.push(
                setInterval(() => {
                    if (s.stopping) return;

                    analyser.getFloatTimeDomainData(samples);

                    let sum = 0;

                    for (const n of samples) {
                        sum += n * n;
                    }

                    const sound =
                        Math.sqrt(sum / samples.length) > 0.015;

                    frames = sound ? frames + 1 : 0;

                    if (sound && s.heard) {
                        lastSound = Date.now();
                    }

                    if (frames >= 3) heard();
                }, 100)
            );
        } catch (e) {}

        // Autostop：発話後の無音2秒
        s.timers.push(
            setInterval(() => {
                if (
                    !s.manual &&
                    s.heard &&
                    Date.now() - lastSound >= 2000
                ) {
                    s.stop();
                }
            }, 100)
        );

        // 発話開始前の無音15秒：新しい録音を保存しない
        s.timers.push(
            setTimeout(() => {
                if (!s.heard) {
                    s.stop(
                        "No speech detected within 15 seconds.",
                        true
                    );
                }
            }, 15000)
        );

        // Autostop・手動停止の共通上限
        s.timers.push(
            setTimeout(() => {
                s.stop("Auto-stopped after 20 seconds.");
            }, 20000)
        );
    } catch (e) {
        s.recognitionDone = true;
        s.stop("Could not start recording.", true);
    }
}

// ============================================================================
// Settings and footer
// ============================================================================
// Example番号・区切りの余白・Drill4
let practice73EnglishCues = false;
const practice73RenderBeforeDrill4 = render;

function practice73EnglishCue(key) {
    if (key === "do") return "what to do";
    if (key === "hold") return "have / own";

    return words[key].meaning.replace(/^to\s+/, "");
}

render = function () {
    // 今回変更するのはDrill3の見出しのみ。
    sections[2].title =
        "Drill 3: Until when did that state continue?";

    practice73RenderBeforeDrill4();

    const root = $("drill1Container");

    let style = document.getElementById(
        "practice73Drill4Style"
    );

    if (!style) {
        style = document.createElement("style");
        style.id = "practice73Drill4Style";
        document.head.append(style);
    }

    style.textContent = `
        #drill1Container .p73-example-heading {
            margin: 0 0 10px;
            font-size: inherit;
            font-weight: bold;
            color: var(--text-primary);
        }

        #drill1Container .p73-example.p73-new-section {
            margin-top: 44px !important;
        }

        #drill1Container #practice73Drill4Panel {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 10px 24px;
            margin-top: 32px;
        }

        #drill1Container #practice73Drill4Panel .drill-cue-title {
            grid-column: 1;
            grid-row: 1;
            margin: 0;
            min-width: 0;
        }

        #drill1Container #practice73Drill4Panel .drill-cue-description {
            grid-column: 1 / -1;
            grid-row: 2;
            margin: 0;
        }

        #drill1Container #practice73Drill4Panel .drill-cue-button {
            grid-column: 2;
            grid-row: 1;
            justify-self: end;
        }

        @media (max-width: 600px) {
            #drill1Container #practice73Drill4Panel {
                grid-template-columns:
                    minmax(0, 1fr) minmax(0, 150px);
                gap: 10px 12px;
            }
        }
    `;

    root.querySelectorAll(".p73-example").forEach((example, index) => {
        const heading = document.createElement("h2");
        heading.className = "p73-example-heading";
        heading.textContent = `Example ${index + 1}`;

        example.prepend(heading);
        example.classList.toggle(
            "p73-new-section",
            index > 0
        );
    });

    if (practice73EnglishCues) {
        const tables = root.querySelectorAll(
            "table.p73-table"
        );

        sections.forEach((section, index) => {
            const cells = tables[index].querySelectorAll(
                "td.prompt-label"
            );

            section.items.flat().forEach((r, rowIndex) => {
                cells[rowIndex].textContent =
                    r.cues.map(practice73EnglishCue).join("／");
            });
        });
    }

    const panel = document.createElement("section");
    panel.id = "practice73Drill4Panel";
    panel.className =
        "info-panel info-panel-task1 drill-cue-panel";

    panel.setAttribute(
        "aria-labelledby",
        "practice73Drill4Title"
    );

    const title = document.createElement("span");
    title.id = "practice73Drill4Title";
    title.className = "info-panel-title drill-cue-title";
    title.textContent =
        "Drill 4: Practice with English cues";

    const description = document.createElement("span");
    description.className =
        "info-panel-desc drill-cue-description";

    description.textContent =
        "💡 Practise all questions and responses in Drills 1–3 using English cues.";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "practice73EnglishCueButton";
    toggle.className = "drill-cue-button";

    toggle.classList.toggle(
        "is-english",
        practice73EnglishCues
    );

    toggle.setAttribute(
        "aria-pressed",
        String(practice73EnglishCues)
    );

    toggle.textContent = practice73EnglishCues
        ? "Display Japanese Cues"
        : "Display English Cues";

    toggle.addEventListener("click", () => {
        if (session || preparing) return;

        practice73EnglishCues = !practice73EnglishCues;

        // 抽出文・判定結果・録音URLは保持。
        render();
    });

    panel.append(title, toggle, description);
    root.append(panel);

    // 各Drill内のキュー列を、最長キューに必要な幅へ統一する。
    root.querySelectorAll("table.p73-table").forEach(sectionTable => {
        const cards = Array.from(
            sectionTable.querySelectorAll("table.p73-question-table")
        );

        let cueWidth = 0;

        cards.forEach(table => {
            table.querySelectorAll("td.prompt-label").forEach(cue => {
                const measure = document.createElement("span");
                measure.innerHTML = cue.innerHTML;

                // Hoverの説明文は列幅の計算に含めない。
                measure.querySelectorAll(".custom-tip-box").forEach(
                    tip => tip.remove()
                );

                Object.assign(measure.style, {
                    position: "absolute",
                    visibility: "hidden",
                    display: "inline-block",
                    width: "max-content",
                    maxWidth: "none",
                    whiteSpace: "nowrap",
                    padding: "0",
                    margin: "0",
                    border: "0",
                    pointerEvents: "none"
                });

                cue.append(measure);
                cueWidth = Math.max(
                    cueWidth,
                    measure.getBoundingClientRect().width
                );
                measure.remove();
            });
        });

        cards.forEach(table => {
            const columns = document.createElement("colgroup");

            // 番号列、キュー列、操作・抽出文の列。
            [38, Math.ceil(cueWidth) + 8, null].forEach(width => {
                const column = document.createElement("col");

                if (width !== null) {
                    column.style.width = `${width}px`;
                }

                columns.append(column);
            });

            table.prepend(columns);
            table.style.width = "100%";
            table.style.tableLayout = "fixed";
        });
    });

    sync();
};

function init() {
    const segmentedSettings = [
        [
            "scriptModeControl",
            () => scriptMode,
            v => scriptMode = v
        ],
        [
            "hintModeControl",
            () => hintMode,
            v => hintMode = v
        ]
    ];

    for (const [id, get, set] of segmentedSettings) {
        const control = $(id);
        if (!control) continue;

        const update = () => {
            control
                .querySelectorAll("button[data-value]")
                .forEach(b => {
                    const selected =
                        b.dataset.value === get();

                    b.classList.toggle(
                        "is-selected",
                        selected
                    );

                    b.setAttribute(
                        "aria-pressed",
                        String(selected)
                    );
                });
        };

        update();

        control.addEventListener("click", e => {
            const b = e.target.closest(
                "button[data-value]"
            );

            if (
                !b ||
                !control.contains(b) ||
                b.dataset.value === get()
            ) {
                return;
            }

            set(b.dataset.value);
            update();

            // 抽出文・録音URLは保持。
            render();
        });
    }

    const toggleSettings = [
        [
            "toggleRecordMode",
            "labelAutoRecord",
            on => manual = !on
        ],
        [
            "togglePlaybackMode",
            "labelAutoPlay",
            on => autoplay = on
        ]
    ];

    for (const [id, label, change] of toggleSettings) {
        const input = $(id);
        if (!input) continue;

        input.checked = true;

        input.addEventListener("change", () => {
            change(input.checked);

            $(label)?.classList.toggle(
                "active-mode",
                input.checked
            );

            $(label)?.classList.toggle(
                "inactive-mode",
                !input.checked
            );
        });
    }

    $("guideTrigger")?.addEventListener("click", e => {
        e.stopPropagation();

        $("guideBox").style.display =
            $("guideBox").style.display === "none"
                ? "block"
                : "none";
    });

    document.addEventListener("click", () => {
        if ($("guideBox")) {
            $("guideBox").style.display = "none";
        }
    });

    render();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

})();
