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
    return { numbers, kanjiNumbers, formAllowed };
})();
