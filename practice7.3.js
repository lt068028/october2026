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
                ? "⏪ Past"
                : "⏪ Past Continuous"
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

    const root = $("drill1Container");
    root.replaceChildren();

    sections.forEach((section, si) => {
        const example = document.createElement("div");
        example.className = "example-box p73-example";

        section.example.forEach((r, ri) => {
            const line = document.createElement("div");

            line.className =
                "example-line flex-row-center" +
                (ri ? " dashed-border" : "");

            line.innerHTML =
                `<strong class="example-label-title">` +
                r.label +
                `</strong>` +
                `<span class="p73-cues">` +
                r.cues.map(word).join("／") +
                `</span><span>👉</span>`;

            const listen = button("🔊きく", () => {
                if (!session && !preparing) {
                    speak(r.text, listen);
                }
            });

            line.append(listen);

            const model = document.createElement("span");
            model.className = "p73-example-model";
            model.innerHTML = tag(r) + sentence(r, true);

            line.append(model);
            example.append(line);
        });

        root.append(example);

        const panel = document.createElement("div");
        panel.className = "info-panel info-panel-task1";

        panel.innerHTML =
            `<span class="info-panel-title">` +
            section.title +
            `</span><span class="info-panel-desc">` +
            section.instruction +
            `</span>`;

        root.append(panel);

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

                const label = document.createElement("td");
                label.className = "p73-label";
                label.textContent = r.label;
                tr.append(label);

                const cue = document.createElement("td");
                cue.className = "prompt-label";
                cue.innerHTML = r.cues.map(word).join("／");
                tr.append(cue);

                const controls = document.createElement("td");
                controls.className = "p73-controls";

                const listen = button("🔊きく", () => {
                    if (!session && !preparing) {
                        speak(r.text, listen);
                    }
                });

                controls.append(listen);

                if (r.tag) {
                    const t = document.createElement("span");
                    t.innerHTML = tag(r);
                    controls.append(t);
                }

                const rec = button("🎤", () => record(key, r));
                rec.setAttribute("aria-label", "Record");

                const stop = button("⏹️", () => {
                    if (session?.key === key) session.stop();
                });

                stop.setAttribute(
                    "aria-label", "Stop recording"
                );
                stop.disabled = true;

                const result = document.createElement("span");
                result.className = "result-text";

                const correction = document.createElement("div");
                correction.className = "correction-box";
                correction.hidden = true;

                controls.append(rec, stop, result, correction);
                tr.append(controls);
                body.append(tr);

                views.set(key, {
                    r, rec, stop, result, correction
                });

                showResult(key);
            });
        });

        const wrap = document.createElement("div");
        wrap.className = "p73-table-wrap";
        wrap.append(table);
        root.append(wrap);
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
                        "is-selected", selected
                    );

                    b.setAttribute(
                        "aria-pressed", String(selected)
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

            // savedの抽出文・録音URLは消去しない。
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
                "active-mode", input.checked
            );

            $(label)?.classList.toggle(
                "inactive-mode", !input.checked
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
