// Comparison rules only. Never rewrite the saved recognition transcript.
window.DrillAnswer = (() => {
    const readings = new Map();
    const digits = ['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
    for (let n = 1; n < 100; n++) {
        const tens = Math.floor(n / 10), ones = n % 10;
        const reading = (tens ? (tens === 1 ? '' : digits[tens]) + 'じゅう' : '') + digits[ones];
        readings.set(reading, String(n));
        if (tens && !ones) {
            readings.set(reading.replace(/じゅう$/, 'じゅっ'), String(n));
            readings.set(reading.replace(/じゅう$/, 'じっ'), String(n));
        }
    }
    readings.set('しち', '7');
    const kanaNumbers = new RegExp('(?:' + [...readings.keys()].sort((a,b) => b.length-a.length).join('|') + ')(?=じ|こ|ねんまえ|時|個|年前)', 'g');
    const kanjiDigits = '〇一二三四五六七八九';
    function fromKanji(value) {
        if (/^\d+$/.test(value)) return Number(value);
        if (value.includes('十')) {
            const [a,b] = value.split('十');
            if (value.split('十').length !== 2) return null;
            const tens = a ? kanjiDigits.indexOf(a) : 1;
            const ones = b ? kanjiDigits.indexOf(b) : 0;
            return tens > 0 && ones >= 0 ? tens * 10 + ones : null;
        }
        const result = [...value].map(c => c === '零' ? 0 : kanjiDigits.indexOf(c));
        return result.every(n => n >= 0) ? Number(result.join('')) : null;
    }
    function numbers(text) {
        return String(text ?? '').normalize('NFKC')
            .replace(/[〇零一二三四五六七八九十\d]+(?=じ|こ|ねんまえ|時|個|年前)/g, value => {
                const n = fromKanji(value);
                return n === null ? value : String(n);
            })
            .replace(kanaNumbers, value => readings.get(value))
            .replace(/よ(?=じ|時)/g, '4').replace(/く(?=じ|時)/g, '9');
    }
    function kanjiNumbers(text) {
        return String(text ?? '').replace(/\d+(?=時|個|年前)/g, value => {
            const n = Number(value);
            if (n < 1 || n >= 100) return value;
            const tens = Math.floor(n/10), ones = n%10;
            return (tens ? (tens === 1 ? '' : kanjiDigits[tens]) + '十' : '') + (ones ? kanjiDigits[ones] : '');
        });
    }
    function formAllowed(text, style = document.querySelector('#speechStyleControl [aria-pressed="true"]')?.dataset.value || 'formal') {
        if (style !== 'formal' || !/[?？]/.test(String(text))) return true;
        const body = String(text).normalize('NFKC')
            .replace(/[\p{P}\p{Z}\s]/gu, '').replace(/(?:よね|よ|ね)$/, '');
        return body.endsWith('か');
    }
    function collapseAdjacentRepeats(text) {
        let s = String(text ?? '').normalize('NFKC');
        let prev;
        do {
            prev = s;
            s = s.replace(/(はい|いいえ|うん|ううん)(?:[、,\s]*\1)+/g, '$1');
            s = s.replace(/([^\s、,。.?？!！]{2,}?)(?:[、,\s]*\1)+/g, '$1');
        } while (s !== prev);
        return s;
    }
    const SPEECH_FILLERS = {
        ja: ['えーと', 'えっと', 'あのう', 'あのー', 'うーん', 'えー', 'あの', 'まあ'],
        de: ['ähm', 'öhm', 'äh', 'öh'],
    };
    const JA_FILLER_RE = new RegExp('^(?:(?:' + SPEECH_FILLERS.ja.join('|') + ')[、,。.?？!！\\s]*)+');
    const DE_FILLER_RE = new RegExp('(?<![\\p{L}\\p{N}])(?:' + SPEECH_FILLERS.de.join('|') + ')(?![\\p{L}\\p{N}])', 'giu');
    function stripSpeechFillers(text, lang) {
        const s = String(text ?? '').normalize('NFKC');
        if (lang === 'ja') {
            return s.replace(JA_FILLER_RE, '').trim();
        }
        if (lang === 'de') {
            return s
                .replace(DE_FILLER_RE, ' ')
                .replace(/\s+([,.;:!?])/g, '$1')
                .replace(/^[\s,.;:!?]+/, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
        }
        return String(text ?? '');
    }
    function isResponseWordOnly(text) {
        const cleaned = stripSpeechFillers(text, 'ja')
            .replace(/[\p{P}\p{Z}\s]/gu, '');
        return /^(?:はい|いいえ|うん|ううん)+$/.test(cleaned);
    }
    const COMMON_YN_ALTERNATIVES = {
        morning: [['今日の午前中', '今朝'], ['きょうのごぜんちゅう', 'けさ']],
        meet_friend: [['友達と', '友達に'], ['ともだちと', 'ともだちにあう'.slice(0, 5)]],
    };
    function expandYnAlternatives(text, keys = []) {
        const base = String(text ?? '');
        const results = new Set([base]);
        for (const key of keys) {
            const groups = COMMON_YN_ALTERNATIVES[key] || [];
            for (const pair of groups) {
                for (const src of pair) {
                    for (const current of [...results]) {
                        if (current.includes(src)) {
                            for (const dst of pair) results.add(current.replace(src, dst));
                        }
                    }
                }
            }
        }
        return [...results];
    }
    return {
        numbers,
        kanjiNumbers,
        formAllowed,
        collapseAdjacentRepeats,
        SPEECH_FILLERS,
        stripSpeechFillers,
        isResponseWordOnly,
        COMMON_YN_ALTERNATIVES,
        expandYnAlternatives,
    };
})();
