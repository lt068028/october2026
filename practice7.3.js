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

let scriptMode = 'kanji';
let hintMode = 'hover';
let speechStyle = 'formal';
let englishCues = false;
let manual = false;
let autoplay = true;
let session = null;
let preparing = false;
let playingAudio = null;
let utterance = null;
let playButton = null;

const views = new Map();

// 録音時のモデルと判定を、音声・抽出文と一緒に保持する。
class RecordingResults extends Map {
    set(key, value) {
        const model = views.get(key)?.r;

        return super.set(key, {
            ...value,
            modelText: model?.text,
            modelHira: model?.hira
        });
    }
}

const saved = new RecordingResults();
const $ = id => document.getElementById(id);

const escape = s => String(s).replace(
    /[&<>"']/g,
    c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c])
);

// 確定済みの教材内容
words.car = W('車', 'くるま', 'kuruma', 'car');
words.hold = W('持つ', 'もつ', 'motsu', 'to have / own');
words.do = W(
    '何をする',
    'なにをする',
    'nani o suru',
    'what to do'
);

sections[2].title =
    'Drill 3: Until when did that state continue?';

sections[2].instruction =
    '💡 Until when did that state continue?';

sections[2].items[0] = pair(
    row(
        'Question:',
        ['until', 'car', 'hold'],
        'いつまで車を持っていましたか。',
        'いつまでくるまをもっていましたか。'
    ),
    row(
        'Response:',
        ['lastyear', 'car', 'hold'],
        '去年まで、車を持っていました。',
        'きょねんまで、くるまをもっていました。'
    )
);

const dictionary = [
    ['午前中', 'ごぜんちゅう'],
    ['自転車', 'じてんしゃ'],
    ['友達', 'ともだち'],
    ['友だち', 'ともだち'],
    ['昨日', 'きのう'],
    ['午後', 'ごご'],
    ['手紙', 'てがみ'],
    ['電話', 'でんわ'],
    ['手伝', 'てつだ'],
    ['英語', 'えいご'],
    ['漢字', 'かんじ'],
    ['会社', 'かいしゃ'],
    ['東京', 'とうきょう'],
    ['結婚', 'けっこん'],
    ['宿題', 'しゅくだい'],
    ['去年', 'きょねん'],
    ['年前', 'ねんまえ'],
    ['覚', 'おぼ'],
    ['教', 'おし'],
    ['働', 'はたら'],
    ['住', 'す'],
    ['借', 'か'],
    ['忘', 'わす'],
    ['書', 'か'],
    ['泳', 'およ'],
    ['歌', 'うた'],
    ['待', 'ま'],
    ['寝', 'ね'],
    ['母', 'はは'],
    ['妹', 'いもうと'],
    ['何', 'なに'],
    ['朝', 'あさ'],
    ['夜', 'よる'],
    ['時', 'じ'],
    ['車', 'くるま'],
    ['持', 'も']
];

function hira(text) {
    let value = String(text ?? '').normalize('NFKC');

    for (const [from, to] of dictionary) {
        value = value.split(from).join(to);
    }

    return value.replace(
        /[ァ-ヶ]/g,
        c => String.fromCharCode(c.charCodeAt(0) - 96)
    );
}

function normalize(text) {
    return hira(text)
        .replace(/三(?=ねんまえ)/g, '3')
        .replace(/十(?=じ)/g, '10')
        .replace(/二(?=じ)/g, '2')
        .replace(/八(?=じ)/g, '8')
        .replace(/九(?=じ)/g, '9')
        .replace(/くじ|きゅうじ/g, '9じ')
        .replace(/はちじ/g, '8じ')
        .replace(/じゅうじ/g, '10じ')
        .replace(/にじ/g, '2じ')
        .replace(/さんねんまえ/g, '3ねんまえ')
        .replace(/[\s、。．,.!?！？「」『』]/g, '')
        .replace(/(?:よね|よ|ね)$/, '');
}

function convert(text, question = false) {
    if (speechStyle === 'formal') return text;

    let value = String(text);

    const endings = [
        ['電話しました', '電話した'],
        ['でんわしました', 'でんわした'],
        ['書きました', '書いた'],
        ['かきました', 'かいた'],
        ['泳ぎました', '泳いだ'],
        ['およぎました', 'およいだ'],
        ['歌いました', '歌った'],
        ['うたいました', 'うたった']
    ];

    for (const [from, to] of endings) {
        value = value.replace(from, to);
    }

    value = value.replace(
        /ていました(か)?[。？?]?$/,
        (_, q) =>
            (speechStyle === 'casual' ? 'てた' : 'ていた') +
            (q ? '？' : '。')
    );

    value = value.replace(
        /でいました(か)?[。？?]?$/,
        (_, q) =>
            (speechStyle === 'casual' ? 'でた' : 'でいた') +
            (q ? '？' : '。')
    );

    if (speechStyle === 'casual') {
        value = value.replace(/を/g, '');

        // 質問には「よ」を付けない。
        if (!question) {
            value = value.replace(/。$/, 'よ。');
        }
    }

    return value;
}

function model(r) {
    const question = r.label === 'Question:';

    return {
        ...r,
        text: convert(r.text, question),
        hira: convert(r.hira, question),
        marks: r.marks.map(mark =>
            convert(mark, question)
                .replace(
                    /ました/g,
                    speechStyle === 'formal' ? 'ました' : 'た'
                )
                .replace(/[。？?]$/, '')
        )
    };
}

function word(key) {
    const w = words[key];

    if (englishCues) {
        return (
            `<span class="target-word">` +
            escape(w.meaning.replace(/^to\s+/, '')) +
            `</span>`
        );
    }

    const text = escape(
        scriptMode === 'kanji' ? w.kanji : w.hira
    );
    const hint = escape(w.romaji + ', ' + w.meaning);

    if (hintMode === 'off') {
        return `<span class="target-word">${text}</span>`;
    }

    if (hintMode === 'paren') {
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

function sentence(r) {
    const text = scriptMode === 'kanji' ? r.text : r.hira;

    const marks = [...new Set(r.marks)]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);

    if (!marks.length) return escape(text);

    const pattern = new RegExp(
        marks.map(x =>
            x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ).join('|'),
        'g'
    );

    let out = '';
    let offset = 0;

    for (const match of text.matchAll(pattern)) {
        out +=
            escape(text.slice(offset, match.index)) +
            `<strong class="p73-gold">` +
            escape(match[0]) +
            `</strong>`;

        offset = match.index + match[0].length;
    }

    return out + escape(text.slice(offset));
}

function badge(r, section) {
    const type = section === 2
        ? 'state'
        : r.tag === 'past'
            ? 'past'
            : 'ongoing';

    const label = {
        past: '⏪Past',
        ongoing: '◀️Past Ongoing',
        state: '⏳Past State'
    };

    return (
        `<span class="p73-tense p73-${type}">` +
        label[type] +
        `</span>`
    );
}

function button(text, fn, tip = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'example-button';
    b.append(document.createTextNode(text));
    b.onclick = fn;

    if (tip) {
        b.classList.add('custom-tip-wrap');

        const t = document.createElement('span');
        t.className = 'custom-tip-box';
        t.textContent = tip;
        b.append(t);
    }

    return b;
}

function stopPlayback() {
    window.speechSynthesis?.cancel();

    if (playingAudio) {
        playingAudio.pause();
        playingAudio = null;
    }

    if (playButton) {
        playButton.disabled = false;
        playButton.replaceChildren(...playButton._contents);
        playButton = null;
    }

    utterance = null;
}

function markPlaying(b) {
    if (!b) return;

    playButton = b;
    b._contents = Array.from(b.childNodes);
    b.disabled = true;
    b.textContent = 'Playing...';
}

function speechText(text) {
    let value = String(text)
        .replace(/夜(?:9|９|九)時/g, 'よるくじ')
        .replace(/よる(?:9|９|九)じ/g, 'よるくじ')
        .replace(
            /^いつまで[、,\s]*/,
            'いつまで、'
        );

    const verb = value.match(
        /(電話し|書き|書い|泳ぎ|泳い|歌い|歌っ|待っ|手伝っ|教え|覚え|寝|働い|住ん|結婚し|借り|忘れ|持っ|し)(?:ました|ていました|でいました|ていた|でいた|てた|でた|た|だ)/
    );

    if (verb && verb.index > 0) {
        value =
            value.slice(0, verb.index)
                .replace(/[、,\s]+$/, '') +
            '、' +
            value.slice(verb.index);
    }

    return value;
}

const VOICE_STORAGE_KEY73 = 'october2026.selectedVoiceName';
let preferredVoice73 = null;

function setupPreferredVoice73() {
    try {
        const synth = window.speechSynthesis;
        const voices = synth ? synth.getVoices() : [];

        const japanese = (voices || []).filter(
            v => v && v.lang && /^ja/i.test(v.lang)
        );

        let savedName = null;
        try {
            savedName = localStorage.getItem(VOICE_STORAGE_KEY73);
        } catch (e) {}

        let selected = savedName
            ? japanese.find(v => v.name === savedName)
            : null;

        if (!selected) {
            selected =
                japanese.find(v =>
                    v.name && /chrome os/i.test(v.name)
                )
                || japanese.find(v =>
                    v.name && /keita/i.test(v.name)
                )
                || japanese.find(v =>
                    v.name && /nanami/i.test(v.name)
                )
                || japanese.find(v =>
                    v.name && /google/i.test(v.name)
                )
                || japanese[0]
                || null;
        }

        preferredVoice73 = selected;

        const selectEl = document.getElementById('voiceSelect');
        if (selectEl) {
            selectEl.setAttribute('translate', 'no');
            selectEl.classList.add('notranslate', 'is-enhanced');

            const labelEl = document.querySelector('label[for="voiceSelect"]');
            if (labelEl) {
                labelEl.setAttribute('for', 'voiceDropdownBtn');
            }

            let dropdownEl = document.getElementById('voiceDropdown');
            if (!dropdownEl) {
                dropdownEl = document.createElement('div');
                dropdownEl.id = 'voiceDropdown';
                dropdownEl.className = 'voice-dropdown notranslate';
                dropdownEl.setAttribute('translate', 'no');

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.id = 'voiceDropdownBtn';
                btn.className = 'voice-dropdown-btn notranslate';
                btn.setAttribute('translate', 'no');
                btn.setAttribute('aria-haspopup', 'listbox');
                btn.setAttribute('aria-expanded', 'false');

                const btnLabel = document.createElement('span');
                btnLabel.className = 'voice-dropdown-btn-label';

                const btnArrow = document.createElement('span');
                btnArrow.className = 'voice-dropdown-btn-arrow';
                btnArrow.setAttribute('aria-hidden', 'true');
                btnArrow.textContent = '▾';

                btn.append(btnLabel, btnArrow);

                const menu = document.createElement('ul');
                menu.id = 'voiceDropdownMenu';
                menu.className = 'voice-dropdown-menu notranslate';
                menu.setAttribute('translate', 'no');
                menu.setAttribute('role', 'listbox');
                menu.hidden = true;

                dropdownEl.append(btn, menu);
                selectEl.insertAdjacentElement('afterend', dropdownEl);

                btn.addEventListener('click', event => {
                    event.stopPropagation();
                    if (btn.disabled) return;
                    const willOpen = menu.hidden;
                    menu.hidden = !willOpen;
                    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                });

                document.addEventListener('click', event => {
                    if (!dropdownEl.contains(event.target)) {
                        menu.hidden = true;
                        btn.setAttribute('aria-expanded', 'false');
                    }
                });

                document.addEventListener('keydown', event => {
                    if (event.key === 'Escape' && !menu.hidden) {
                        menu.hidden = true;
                        btn.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            const btn = document.getElementById('voiceDropdownBtn');
            const btnLabel = dropdownEl.querySelector('.voice-dropdown-btn-label');
            const menu = document.getElementById('voiceDropdownMenu');

            if (!selectEl.dataset.bound) {
                selectEl.dataset.bound = 'true';
                selectEl.addEventListener('change', () => {
                    try {
                        localStorage.setItem(
                            VOICE_STORAGE_KEY73,
                            selectEl.value
                        );
                    } catch (e) {}
                    setupPreferredVoice73();
                });
            }

            const signature = japanese.map(v => v.name).join('||');
            if (selectEl.dataset.voicesSignature !== signature) {
                selectEl.dataset.voicesSignature = signature;
                selectEl.replaceChildren();
                if (menu) menu.replaceChildren();

                if (!japanese.length) {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.textContent = 'No Japanese voice available';
                    selectEl.append(opt);
                    selectEl.disabled = true;
                    if (btn) btn.disabled = true;
                    if (btnLabel) btnLabel.textContent = 'No Japanese voice available';
                    if (menu) menu.hidden = true;
                } else {
                    selectEl.disabled = false;
                    if (btn) btn.disabled = false;
                    japanese.forEach(v => {
                        const opt = document.createElement('option');
                        opt.value = v.name;
                        opt.textContent = v.name;
                        opt.setAttribute('translate', 'no');
                        opt.className = 'notranslate';
                        selectEl.append(opt);

                        if (menu) {
                            const item = document.createElement('li');
                            item.className = 'voice-dropdown-item notranslate';
                            item.setAttribute('translate', 'no');
                            item.setAttribute('role', 'option');
                            item.dataset.voiceName = v.name;
                            item.textContent = v.name;
                            item.addEventListener('click', event => {
                                event.stopPropagation();
                                try {
                                    localStorage.setItem(VOICE_STORAGE_KEY73, v.name);
                                } catch (e) {}
                                menu.hidden = true;
                                if (btn) btn.setAttribute('aria-expanded', 'false');
                                setupPreferredVoice73();
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
                    item.classList.toggle('is-selected', isSelected);
                    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                });
            }
        }
    } catch (e) {
        console.warn('Voice setup error:', e);
    }
}

if (window.speechSynthesis) {
    setupPreferredVoice73();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged =
            setupPreferredVoice73;
    }
}

function speak(text, b, done) {
    stopPlayback();

    if (!window.speechSynthesis) {
        if (done) done();
        return;
    }

    setupPreferredVoice73();

    const u = new SpeechSynthesisUtterance(
        speechText(text)
    );

    u.lang = 'ja-JP';
    u.rate = 0.9;

    if (preferredVoice73) {
        u.voice = preferredVoice73;
    }

    markPlaying(b);
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

    markPlaying(b);

    playingAudio.onended = stopPlayback;
    playingAudio.onerror = stopPlayback;
    playingAudio.play().catch(stopPlayback);
}

function diffTokens(text) {
    const chars = Array.from(
        String(text).normalize('NFKC')
    );
    const tokens = [];

    const units = dictionary.map(x => x[0])
        .sort((a, b) => b.length - a.length);

    for (let i = 0; i < chars.length;) {
        const rest = chars.slice(i).join('');
        const unit = units.find(w => rest.startsWith(w))
            || chars[i];
        const end = i + Array.from(unit).length;

        // 語の途中の「よ・ね」は削除しない。
        for (const c of normalize(unit + '§').slice(0, -1)) {
            tokens.push({ c, start: i, end });
        }

        i = end;
    }

    while (
        tokens.length &&
        /[よね]/.test(tokens[tokens.length - 1].c)
    ) {
        tokens.pop();
    }

    return { chars, tokens };
}

function findDiff(actual, reference) {
    const a = diffTokens(actual);
    const b = diffTokens(reference);
    const n = a.tokens.length;
    const m = b.tokens.length;

    const costs = Array.from(
        { length: n + 1 },
        () => Array(m + 1).fill(0)
    );

    for (let i = 0; i <= n; i++) costs[i][0] = i;
    for (let j = 0; j <= m; j++) costs[0][j] = j;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            costs[i][j] = Math.min(
                costs[i - 1][j] + 1,
                costs[i][j - 1] + 1,
                costs[i - 1][j - 1] +
                    (a.tokens[i - 1].c === b.tokens[j - 1].c
                        ? 0 : 1)
            );
        }
    }

    const red = new Set();
    const gaps = new Set();

    const mark = token => {
        for (let k = token.start; k < token.end; k++) {
            red.add(k);
        }
    };

    let i = n;
    let j = m;

    while (i || j) {
        if (
            i && j &&
            costs[i][j] === costs[i - 1][j - 1] +
                (a.tokens[i - 1].c === b.tokens[j - 1].c
                    ? 0 : 1)
        ) {
            if (a.tokens[i - 1].c !== b.tokens[j - 1].c) {
                mark(a.tokens[i - 1]);
            }

            i--;
            j--;
        } else if (
            j &&
            costs[i][j] === costs[i][j - 1] + 1
        ) {
            gaps.add(
                i < n
                    ? a.tokens[i].start
                    : n
                        ? a.tokens[n - 1].end
                        : 0
            );
            j--;
        } else {
            mark(a.tokens[i - 1]);
            i--;
        }
    }

    return {
        chars: a.chars,
        red,
        gaps,
        cost: costs[n][m]
    };
}

function showResult(key, notice = '') {
    const v = views.get(key);
    if (!v) return;

    const value = saved.get(key);

    v.result.replaceChildren();
    v.correction.replaceChildren();
    v.correction.hidden = true;

    if (session?.key === key) {
        v.result.textContent = 'Recording...';
        return;
    }

    if (value?.raw) {
        const displayed = scriptMode === 'hiragana'
            ? hira(value.raw)
            : value.raw;

        if (value.correct) {
            v.result.append(
                document.createTextNode(displayed + ' ✅')
            );
        } else {
            const refs = [
                value.modelText || v.r.text,
                value.modelHira || v.r.hira
            ];

            const best = refs
                .map(ref => findDiff(displayed, ref))
                .sort((a, b) => a.cost - b.cost)[0];

            const red = text => {
                const span = document.createElement('span');
                span.style.color = 'var(--error-text)';
                span.textContent = text;
                v.result.append(span);
            };

            for (let i = 0; i <= best.chars.length; i++) {
                if (best.gaps.has(i)) red('＿');
                if (i === best.chars.length) break;

                if (best.red.has(i)) {
                    red(best.chars[i]);
                } else {
                    v.result.append(
                        document.createTextNode(best.chars[i])
                    );
                }
            }

            const message = document.createElement('span');
            message.textContent = '🔥Keep going! Try once more!';
            
            v.correction.append(message);
            v.correction.hidden = false;
        }
    } else {
        v.result.textContent = '(Not recorded yet)';
    }

    if (value?.url) {
        const play = button(
            '▶️',
            () => playRecording(key, play),
            'Play your recorded voice'
        );

        play.classList.add('play-recording-btn');
        v.result.append(play);
    }

    if (notice) {
        const n = document.createElement('span');
        n.className = 'p73-notice';
        n.textContent = notice;
        v.result.append(n);
    }
}

function render() {
    const root = $('drill1Container');
    root.replaceChildren();
    views.clear();

    sections.forEach((section, si) => {
        const example = document.createElement('div');
        example.className = 'example-box p73-example';

        if (si) example.classList.add('p73-new-section');

        const et = document.createElement('table');
        et.className = 'p73-example-table';

        const eb = document.createElement('tbody');
        et.append(eb);

        section.example.forEach(source => {
            const r = model(source);
            const tr = document.createElement('tr');

            const kind = document.createElement('td');
            kind.className = 'p73-example-kind';
            kind.textContent = r.label.replace(
                'Past Continuous',
                'Past Ongoing'
            );

            const cue = document.createElement('td');
            cue.className = 'p73-example-cues';
            cue.innerHTML = r.cues.map(word).join('／');

            const arrow = document.createElement('td');
            arrow.textContent = '👉';

            const lc = document.createElement('td');
            const listen = button('🔊きく', () => {
                if (!session && !preparing) {
                    speak(r.text, listen);
                }
            });
            lc.append(listen);

            const type = document.createElement('td');
            type.innerHTML = badge(r, si);

            const text = document.createElement('td');
            text.className = 'p73-example-model';
            text.innerHTML = sentence(r);

            tr.append(kind, cue, arrow, lc, type, text);
            eb.append(tr);
        });

        example.append(et);
        root.append(example);

        const panel = document.createElement('div');
        panel.className = 'info-panel info-panel-task1';
        panel.innerHTML =
            `<span class="info-panel-title">` +
            escape(section.title.replace(
                'Past Continuous',
                'Past Ongoing'
            )) +
            `</span>` +
            `<span class="info-panel-desc">` +
            escape(section.instruction) +
            `</span>`;

        root.append(panel);

        const cards = [];

        section.items.forEach((sources, index) => {
            const card = document.createElement('div');
            card.className = 'drill-row p73-question-card';

            const table = document.createElement('table');
            table.className =
                'p73-question-table recording-table';

            const cols = document.createElement('colgroup');

            for (let k = 0; k < 3; k++) {
                cols.append(document.createElement('col'));
            }

            cols.children[0].style.width = '34px';
            table.append(cols);

            const body = document.createElement('tbody');
            table.append(body);

            sources.forEach((source, ri) => {
                const r = model(source);
                const key = `${si}-${index}-${ri}`;
                const tr = document.createElement('tr');

                if (!ri) {
                    const num = document.createElement('td');
                    num.rowSpan = sources.length;
                    num.className = 'p73-number';
                    num.textContent = (index + 1) + '.';
                    tr.append(num);
                }

                const cue = document.createElement('td');
                cue.className = 'prompt-label';
                cue.innerHTML = r.cues.map(word).join('／');

                const cell = document.createElement('td');
                cell.className = 'p73-controls';

                const line = document.createElement('div');
                line.className = 'recording-controls';

                const actions = document.createElement('div');
                actions.className = 'recording-actions';

                const listen = button('🔊きく', () => {
                    if (!session && !preparing) {
                        speak(r.text, listen);
                    }
                });

                const type = document.createElement('span');
                type.innerHTML = badge(r, si);

                const rec = button(
                    '🎙️とる',
                    () => record(key, r)
                );

                const stop = button('⏹️', () => {
                    if (session?.key === key) session.stop();
                });
                stop.disabled = true;

                actions.append(listen, type, rec, stop);

                const wrap = document.createElement('span');
                wrap.className = 'recording-result';

                const result = document.createElement('span');
                result.className = 'result-text';
                wrap.append(result);

                line.append(actions, wrap);

                const correction = document.createElement('div');
                correction.className = 'correction-box';
                correction.hidden = true;

                cell.append(line, correction);
                tr.append(cue, cell);
                body.append(tr);

                views.set(key, {
                    r, rec, stop, result, correction
                });

                showResult(key);
            });

            card.append(table);
            root.append(card);
            cards.push(table);
        });

        let width = 0;

        cards.forEach(table => {
            table.querySelectorAll('.prompt-label')
                .forEach(cell => {
                    const measure =
                        document.createElement('span');

                    measure.innerHTML = cell.innerHTML;

                    Object.assign(measure.style, {
                        position: 'absolute',
                        visibility: 'hidden',
                        display: 'inline-block',
                        width: 'max-content',
                        whiteSpace: 'nowrap',
                        font: 'inherit'
                    });

                    measure.querySelectorAll(
                        '.tooltip-tip,.custom-tip-box'
                    ).forEach(t => t.remove());

                    cell.append(measure);

                    width = Math.max(
                        width,
                        Math.ceil(
                            measure.getBoundingClientRect().width
                        )
                    );

                    measure.remove();
                });
        });

        cards.forEach(table => {
            table.querySelector('colgroup')
                .children[1].style.width = (width + 8) + 'px';
        });
    });

    const panel = document.createElement('section');
    panel.id = 'practice73Drill4Panel';
    panel.className =
        'info-panel info-panel-task1 drill-cue-panel';

    const copy = document.createElement('div');
    copy.className = 'drill-cue-copy';
    copy.innerHTML =
        '<span class="info-panel-title drill-cue-title">' +
        'Drill 4: Practice with English cues</span>' +
        '<span class="info-panel-desc drill-cue-description">' +
        '💡 Practise all questions and responses in Drills 1–3 ' +
        'using English cues.</span>';

    const toggle = button(
        englishCues
            ? 'Display Japanese Cues'
            : 'Display English Cues',
        () => {
            if (session || preparing) return;

            stopPlayback();
            englishCues = !englishCues;
            render();
        }
    );

    toggle.className = 'drill-cue-button';
    toggle.classList.toggle('is-english', englishCues);
    toggle.setAttribute('aria-pressed', String(englishCues));

    panel.append(copy, toggle);
    root.append(panel);

    sync();
}

function sync() {
    const blocked = Boolean(session || preparing);

    $('drill1Container')?.querySelectorAll('button')
        .forEach(b => b.disabled = blocked);

    document.querySelectorAll(
        '.compact-settings .segmented-option, ' +
        '.compact-settings input'
    ).forEach(control => {
        control.disabled = blocked;
    });
    views.forEach((v, key) => {
        const canStop =
            session?.key === key &&
            session.manual &&
            !session.stopping;

        v.stop.disabled = !canStop;
        v.stop.classList.toggle(
            'stop-btn-active',
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

// Settings and footer
function init() {
    const anchor = $('scriptModeControl')
        ?.closest('.control-item');

    if (anchor) {
        const item = document.createElement('div');
        item.className = 'control-item';

        const control = document.createElement('div');
        control.id = 'speechStyleControl';
        control.className = 'segmented-control';
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', 'Speech style');

        [
            [
                'formal',
                '👔Formal',
                'Polite speech for work or unfamiliar people.'
            ],
            [
                'informal',
                '✏️Informal',
                'Plain forms used in writing'
            ],
            [
                'casual',
                '💬Casual',
                'Relaxed speech with family and friends.'
            ]
        ].forEach(([value, label, tip]) => {
            const b = button(label, () => {}, tip);
            b.classList.add('segmented-option');
            b.dataset.value = value;
            control.append(b);
        });

        item.append(control);
        anchor.after(item);
    }

    [
        [
            'scriptModeControl',
            () => scriptMode,
            v => scriptMode = v
        ],
        [
            'speechStyleControl',
            () => speechStyle,
            v => speechStyle = v
        ],
        [
            'hintModeControl',
            () => hintMode,
            v => hintMode = v
        ]
    ].forEach(([id, get, set]) => {
        const control = $(id);
        if (!control) return;

        const update = () => {
            control.querySelectorAll('button[data-value]')
                .forEach(b => {
                    const selected = b.dataset.value === get();

                    b.classList.toggle('is-selected', selected);
                    b.setAttribute(
                        'aria-pressed',
                        String(selected)
                    );
                });
        };

        update();

        control.addEventListener('click', e => {
            const b = e.target.closest('button[data-value]');

            if (
                session ||
                preparing ||
                !b ||
                !control.contains(b) ||
                b.dataset.value === get()
            ) return;

            stopPlayback();
            set(b.dataset.value);
            update();
            render();
        });
    });

    [
        [
            'toggleRecordMode',
            'labelAutoRecord',
            on => manual = !on
        ],
        [
            'togglePlaybackMode',
            'labelAutoPlay',
            on => autoplay = on
        ]
    ].forEach(([id, label, change]) => {
        const input = $(id);
        if (!input) return;

        input.checked = true;

        input.addEventListener('change', () => {
            change(input.checked);

            $(label)?.classList.toggle(
                'active-mode',
                input.checked
            );
            $(label)?.classList.toggle(
                'inactive-mode',
                !input.checked
            );
        });
    });

    setupPreferredVoice73();

    render();
}

// Example 2・Drill 2：過去進行の肯定／否定
const qa73 = {
    example: ['qaEarlier', 'qaStudy'],
    items: [
        ['qaMorning', 'qaFriend', 'qaMeet'],
        ['qaAfternoon', 'qaBus', 'qaRide'],
        ['qaNight', 'qaOut'],
        ['qaNoon', 'qaBath'],
        ['qaEarlier', 'qaFamily', 'qaCall']
    ],
    states: Array.from({ length: 5 }, () => ({
        answer: null,
        text: {}
    }))
};

Object.assign(words, {
    qaEarlier: W(
        'さっき', 'さっき',
        'sakki', 'a little while ago'
    ),
    qaMorning: W(
        '今日の午前中', 'きょうのごぜんちゅう',
        'kyō no gozenchū', 'this morning'
    ),
    qaAfternoon: W(
        '今日の午後', 'きょうのごご',
        'kyō no gogo', 'this afternoon'
    ),
    qaNight: W(
        '昨日の夜', 'きのうのよる',
        'kinō no yoru', 'last night'
    ),
    qaNoon: W(
        '昨日の昼', 'きのうのひる',
        'kinō no hiru', 'yesterday at midday'
    ),
    qaFriend: W(
        '友達', 'ともだち',
        'tomodachi', 'friend'
    ),
    qaBus: W(
        'バス', 'ばす',
        'basu', 'bus'
    ),
    qaFamily: W(
        '家族', 'かぞく',
        'kazoku', 'family'
    ),
    qaStudy: W(
        '勉強する', 'べんきょうする',
        'benkyō suru', 'to study'
    ),
    qaMeet: W(
        '会う', 'あう',
        'au', 'to meet'
    ),
    qaRide: W(
        '乗る', 'のる',
        'noru', 'to ride'
    ),
    qaOut: W(
        '出かける', 'でかける',
        'dekakeru', 'to go out'
    ),
    qaBath: W(
        'お風呂に入る', 'おふろにはいる',
        'ofuro ni hairu', 'to take a bath'
    ),
    qaCall: W(
        '電話をかける', 'でんわをかける',
        'denwa o kakeru', 'to make a phone call'
    )
});

dictionary.unshift(
    ['今日', 'きょう'],
    ['午前中', 'ごぜんちゅう'],
    ['家族', 'かぞく'],
    ['勉強', 'べんきょう'],
    ['お風呂', 'おふろ'],
    ['風呂', 'ふろ'],
    ['出掛け', 'でかけ'],
    ['出かけ', 'でかけ'],
    ['会っ', 'あっ'],
    ['乗っ', 'のっ'],
    ['入っ', 'はいっ'],
    ['掛け', 'かけ'],
    ['昼', 'ひる']
);

const qa73Verbs = {
    qaStudy: [
        '勉強して', '', []
    ],
    qaMeet: [
        '会って', '友達に',
        ['ともだち(?:に)?']
    ],
    qaRide: [
        '乗って', 'バスに',
        ['ばす(?:に)?']
    ],
    qaOut: [
        '出かけて', '', []
    ],
    qaBath: [
        '入って', 'お風呂に',
        ['お?ふろ(?:に)?']
    ],
    qaCall: [
        'かけて', '家族に電話を',
        ['かぞく(?:に)?', 'でんわ(?:を)?']
    ]
};

function qa73Model(cues, kind) {
    const data = qa73Verbs[cues[cues.length - 1]];
    const negative = kind === 'no';
    const question = kind === 'q';

    const ending = speechStyle === 'formal'
        ? (negative ? 'いませんでした' : 'いました')
        : speechStyle === 'informal'
            ? (negative ? 'いなかった' : 'いた')
            : (negative ? 'なかった' : 'た');

    const prefix = question
        ? ''
        : speechStyle === 'casual'
            ? (negative ? 'うんん、' : 'うん、')
            : (negative ? 'いいえ、' : 'はい、');

    let body = question
        ? words[cues[0]].kanji + '、' + data[1]
        : '';

    // 意味を明確にするため、モデルには語句を残す。
    if (!question && cues.includes('qaBath')) {
        body = 'お風呂に';
    }

    if (!question && cues.includes('qaCall')) {
        body = '電話を';
    }

    if (speechStyle === 'casual') {
        body = body.replace(/を/g, '');
    }

    const text = prefix + body + data[0] + ending +
        (question
            ? (speechStyle === 'formal' ? 'か。' : '？')
            : (speechStyle === 'casual' ? 'よ。' : '。'));

    return row(
        question ? 'Question:' : 'Response:',
        cues,
        text,
        hira(text),
        [
            words[cues[0]].kanji,
            words[cues[0]].hira,
            'て' + ending +
                (question && speechStyle === 'formal' ? 'か' : '')
        ]
    );
}

// 動詞部分を必須とし、対応する時間・名詞・応答語の省略を許容。
const qa73BaseNormalize = normalize;

normalize = function (text) {
    let value = qa73BaseNormalize(text);

    // 「会う」の相手を示す「友達に／友達と」を同じ判定にする。
    if (
        /あって(?:いました|いませんでした|いた|いなかった|た|なかった)/
            .test(value)
    ) {
        value = value.replace(/ともだちと/g, 'ともだちに');
    }

    // 質問文は既存の判定を使用する。
    if (
        /[?？]/.test(String(text)) ||
        /か$/.test(value)
    ) {
        return value;
    }
    for (const [verbKey, data] of Object.entries(qa73Verbs)) {
        const stem = hira(data[0]);

        const matches = [...value.matchAll(
            new RegExp(
                stem +
                '(いませんでした|いました|いなかった|いた|なかった|た)',
                'g'
            )
        )];

        if (matches.length !== 1) continue;

        const match = matches[0];
        const negative =
            /いませんでした|いなかった|なかった/.test(match[1]);

        let rest =
            value.slice(0, match.index) +
            value.slice(match.index + match[0].length);

        const optional = [
            ...data[2],
            'さっき(?:は)?',
            'きょうの(?:ごぜんちゅう|ごご)(?:は)?',
            'きのうの(?:よる|ひる)(?:は)?',
            'いま(?:は)?',
            'わたし(?:は|が)?'
        ].sort((a, b) => b.length - a.length);

        let valid = true;

        while (rest) {
            const token = optional
                .map(pattern =>
                    rest.match(new RegExp('^(?:' + pattern + ')'))
                )
                .find(Boolean);

            if (token) {
                rest = rest.slice(token[0].length);
                continue;
            }

            const prefix = rest.match(
                /^(いいえ|いえ|はい|うんんー?|ううん|うん)/
            );

            if (!prefix) {
                valid = false;
                break;
            }

            const saysNo =
                /^(いいえ|いえ|うんん|ううん)/.test(prefix[0]);

            if (saysNo !== negative) {
                valid = false;
                break;
            }

            rest = rest.slice(prefix[0].length);
        }

        if (valid) {
            return 'p73-qa|' + verbKey + '|' + match[1];
        }
    }

    return value;
};

const qa73BaseSpeechText = speechText;

speechText = text => {
    const value =
        /勉強|会って|乗って|出かけて|お風呂|電話を?かけて/.test(text)
            ? String(text)
            : qa73BaseSpeechText(text);

    return value.replace(/^うんん、?/, 'うんんー、');
};

// 既存問題の録音キーは変えず、表示番号を変更する。
sections[1].title = 'Drill 3: What were you doing?';

sections[2].title =
    'Drill 4: Until when did that state continue?';

function qa73Align(tables) {
    let width = 0;

    tables.forEach(table => {
        table.querySelectorAll('.prompt-label').forEach(cell => {
            const probe = document.createElement('span');
            probe.innerHTML = cell.innerHTML;

            probe.querySelectorAll(
                '.tooltip-tip,.custom-tip-box'
            ).forEach(t => t.remove());

            Object.assign(probe.style, {
                position: 'absolute',
                visibility: 'hidden',
                width: 'max-content',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                font: 'inherit'
            });

            cell.append(probe);

            width = Math.max(
                width,
                Math.ceil(probe.getBoundingClientRect().width)
            );

            probe.remove();
        });
    });

    tables.forEach(table => {
        table.querySelector('colgroup')
            .children[1].style.width = (width + 8) + 'px';
    });
}

const qa73BaseRender = render;

render = function () {
    qa73BaseRender();

    const root = $('drill1Container');
    const anchor = root.querySelectorAll('.example-box')[1];

    const section = document.createElement('section');
    section.className = 'practice-qa-section';

    const example = document.createElement('div');
    example.className =
        'example-box p73-example p73-new-section';

    const et = document.createElement('table');
    et.className = 'p73-example-table';

    const eb = document.createElement('tbody');
    et.append(eb);

    const q = qa73Model(qa73.example, 'q');
    const tr = document.createElement('tr');

    ['Question:', null, '👉', null, null, null]
        .forEach((content, index) => {
            const td = document.createElement('td');

            if (index === 0) {
                td.className = 'p73-example-kind';
            }

            if (index === 1) {
                td.className = 'p73-example-cues';
                td.innerHTML = q.cues.map(word).join('／');
            } else if (index === 3) {
                const listen = button(
                    '🔊きく',
                    () => speak(q.text, listen)
                );
                td.append(listen);
            } else if (index === 4) {
                td.innerHTML = badge(q, 0);
            } else if (index === 5) {
                td.className = 'p73-example-model';
                td.innerHTML = sentence(q);
            } else if (content) {
                td.textContent = content;
            }

            tr.append(td);
        });

    eb.append(tr);

    const response = document.createElement('tr');

    const label = document.createElement('td');
    label.className = 'p73-example-kind';
    label.textContent = 'Response:';

    const answers = document.createElement('td');
    answers.colSpan = 5;

    ['yes', 'no'].forEach((kind, index) => {
        if (index) {
            answers.append(document.createTextNode(' ↔️ '));
        }

        const r = qa73Model(qa73.example, kind);

        const listen = button(
            kind === 'yes' ? '🔊🙆' : '🔊🙅',
            () => speak(r.text, listen)
        );

        const text = document.createElement('span');
        text.className = 'p73-example-model';
        text.innerHTML = sentence(r);

        answers.append(listen, text);
    });

    response.append(label, answers);
    eb.append(response);
    example.append(et);
    section.append(example);

    const panel = document.createElement('div');
    panel.className = 'info-panel info-panel-task1';

    panel.innerHTML =
        '<span class="info-panel-title">' +
        'Drill 2: Yes / No — Past Ongoing</span>' +
        '<span class="info-panel-desc">' +
        '💡Ask the question. Choose Yes or No, then answer.</span>';

    section.append(panel);

    const tables = [];

    qa73.items.forEach((cues, index) => {
        const state = qa73.states[index];

        const card = document.createElement('div');
        card.className = 'drill-row p73-question-card';

        const table = document.createElement('table');
        table.className =
            'p73-question-table recording-table';

        const cols = document.createElement('colgroup');

        for (let i = 0; i < 3; i++) {
            cols.append(document.createElement('col'));
        }

        cols.children[0].style.width = '34px';

        const body = document.createElement('tbody');
        table.append(cols, body);

        ['q', state.answer || 'none'].forEach((kind, ri) => {
            const enabled = kind !== 'none';

            const r = qa73Model(
                cues,
                enabled ? kind : 'yes'
            );

            const key = `p73-qa-${index}-${kind}`;
            const tr = document.createElement('tr');

            if (!ri) {
                const num = document.createElement('td');
                num.className = 'p73-number';
                num.rowSpan = 2;
                num.textContent = (index + 1) + '.';
                tr.append(num);
            }

            const cue = document.createElement('td');
            cue.className = 'prompt-label';

            if (!ri) {
                cue.innerHTML = cues.map(word).join('／');
            } else {
                ['yes', 'no'].forEach(answer => {
                    const choice = button(
                        answer === 'yes' ? '🙆' : '🙅',
                        () => {
                            if (
                                session ||
                                preparing ||
                                state.answer === answer
                            ) return;

                            stopPlayback();
                            state.answer = answer;
                            render();
                        }
                    );

                    choice.classList.add('answer-choice');
                    choice.dataset.answer = answer;

                    choice.setAttribute(
                        'aria-pressed',
                        String(state.answer === answer)
                    );

                    choice.setAttribute(
                        'aria-label',
                        answer === 'yes' ? 'Yes' : 'No'
                    );

                    cue.append(choice);
                });
            }

            const cell = document.createElement('td');
            cell.className = 'p73-controls';

            const line = document.createElement('div');
            line.className = 'recording-controls';

            const actions = document.createElement('div');
            actions.className = 'recording-actions';

            const listen = button('🔊きく', () => {
                if (enabled && !session && !preparing) {
                    speak(r.text, listen);
                }
            });

            const rec = button('🎙️とる', () => {
                if (enabled && !session && !preparing) {
                    record(key, r);
                }
            });

            const stop = button('⏹️', () => {
                if (session?.key === key) {
                    session.stop();
                }
            });

            const toggle = button(
                state.text[kind] ? '🕶️Hide' : '👀Text',
                () => {
                    if (
                        !enabled ||
                        session ||
                        preparing
                    ) return;

                    state.text[kind] = !state.text[kind];
                    render();
                }
            );

            const shown = document.createElement('span');

            shown.textContent =
                scriptMode === 'kanji' ? r.text : r.hira;

            shown.hidden =
                !enabled || !state.text[kind];

            actions.append(
                listen, rec, stop, toggle, shown
            );

            const wrap = document.createElement('span');
            wrap.className = 'recording-result';

            const result = document.createElement('span');
            result.className = 'result-text';

            wrap.append(result);
            line.append(actions, wrap);

            const correction = document.createElement('div');
            correction.className = 'correction-box';
            correction.hidden = true;

            cell.append(line, correction);
            tr.append(cue, cell);
            body.append(tr);

            views.set(key, {
                r,
                rec,
                stop,
                result,
                correction,
                qaDisabled: !enabled,
                qaButtons: [listen, rec, toggle]
            });

            showResult(key);
        });

        card.append(table);
        section.append(card);
        tables.push(table);
    });

    root.insertBefore(section, anchor);
    qa73Align(tables);

    const copy = root.querySelector('.drill-cue-copy');

    copy.querySelector('.info-panel-title').textContent =
        'Drill 5: Practice with English cues';

    copy.querySelector('.info-panel-desc').textContent =
        '💡Practise all questions and responses in Drills 1–4 ' +
        'using English cues.';

    sync();
};

const qa73BaseSync = sync;

sync = function () {
    qa73BaseSync();

    views.forEach(v => {
        if (v.qaDisabled) {
            v.qaButtons.forEach(b => {
                b.disabled = true;
            });
        }
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();
