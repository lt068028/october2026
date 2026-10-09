// ============================================================================
// Practice 1: XはYです
// ============================================================================

const taskData = [
    { x: "わたし", y: "がくせい", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "わたし", y: "せんせい", yRomaji: "sensei", yMeaning: "teacher", isNeg: true },
    { x: "わたし", y: "日本人", yRomaji: "nihonjin", yMeaning: "Japanese", isNeg: false },
    { x: "わたし", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee", isNeg: true },
    { x: "ともだち", y: "がくせい", yRomaji: "gakusei", yMeaning: "student", isNeg: false },
    { x: "ともだち", y: "かいしゃいん", yRomaji: "kaishain", yMeaning: "company employee", isNeg: true },
    { x: "ともだち", y: "アメリカ人", yRomaji: "amerikajin", yMeaning: "American", isNeg: false }
];

const customDict = {
    "i": { hira: "わたし", romaji: "watashi", meaning: "I" },
    "friend": { hira: "ともだち", romaji: "tomodachi", meaning: "friend" },
    "family": { hira: "かぞく", romaji: "kazoku", meaning: "family" },
    "colleague": { hira: "どうりょう", romaji: "douryou", meaning: "colleague" },
    "boss": { hira: "じょうし", romaji: "joushi", meaning: "boss" },
    "partner": { hira: "パートナー", romaji: "paatanaa", meaning: "partner" },
    "Bf/Gf": { hira: "こいびと", romaji: "koibito", meaning: "Bf/Gf" },
    "best friend": { hira: "しんゆう", romaji: "shinyuu", meaning: "best friend" },
    "child": { hira: "こども", romaji: "kodomo", meaning: "child" },
    "grandchild": { hira: "まご", romaji: "mago", meaning: "grandchild" },
    "sibling": { hira: "きょうだい", romaji: "kyoudai", meaning: "sibling" },
    "foreigner": { hira: "がいこくじん", romaji: "gaikokujin", meaning: "foreigner" },
    "doctor": { hira: "いしゃ", romaji: "isha", meaning: "doctor" },
    "engineer": { hira: "エンジニア", romaji: "enjinia", meaning: "engineer" },
    "researcher": { hira: "けんきゅうしゃ", romaji: "kenkyuusha", meaning: "researcher" },
    "designer": { hira: "デザイナー", romaji: "dezainaa", meaning: "designer" },
    "store staff": { hira: "てんいん", romaji: "tenin", meaning: "store staff" },
    "self-employed": { hira: "じえいぎょう", romaji: "jiei-gyou", meaning: "self-employed" },
    "civil servant": { hira: "こうむいん", romaji: "koumuin", meaning: "civil servant" },
    "nurse": { hira: "かんごし", romaji: "kangoshi", meaning: "nurse" },
    "part-time worker": { hira: "アルバイト", romaji: "arubaito", meaning: "part-time worker" }
};

let isManualStop = false;
let hintMode = "hover";

// 全行で共有する録音セッション。複数行の同時録音を防ぐ。
let activeRecognitionSession = null;

// ============================================================================
// Japanese text conversion
// ============================================================================

function convertToHiragana(text) {
    if (!text) return "";

    let cleaned = text.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g,
        ""
    );

    const dict = {
        "私": "わたし", "学生": "がくせい", "先生": "せんせい",
        "日本人": "にほんじん", "会社員": "かいしゃいん", "友達": "ともだち",
        "家族": "かぞく", "同僚": "どうりょう", "上司": "じょうし",
        "パートナー": "パートナー", "恋人": "こいびと", "親友": "しんゆう",
        "子供": "こども", "子ども": "こども", "孫": "まご",
        "兄弟": "きょうだい", "外国人": "がいこくじん", "医師": "いしゃ",
        "医者": "いしゃ", "エンジニア": "エンジニア", "研究者": "けんきゅうしゃ",
        "デザイナー": "デザイナー", "店員": "てんいん", "自営業": "じえいぎょう",
        "こうむいん": "こうむいん", "公務員": "こうむいん", "看護師": "かんごし",
        "看護婦": "かんごし", "アルバイト": "アルバイト", "です": "です",
        "でした": "でした", "じゃないです": "じゃないです", "ではないです": "ではないです",
        "じゃありません": "じゃありません", "ではありません": "ではありません"
    };

    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }

    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}

// ============================================================================
// Speech synthesis
// ============================================================================

function speakText(text, onEndCallback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";

    utterance.onend = () => { if (onEndCallback) onEndCallback(); };
    utterance.onerror = () => { if (onEndCallback) onEndCallback(); };

    try {
        speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("Speech synthesis error:", err);
        if (onEndCallback) onEndCallback();
    }
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupFooterGuide();
    setupTask3Generator();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
