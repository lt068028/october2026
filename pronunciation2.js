const drill1Data = [
    { kanji: "天気が、いいです", hira: "てんきが、いいです", text: "て↘んきが｜い↘いいです", color: "#facc15" },
    { kanji: "時間が、ないです", hira: "じかんが、ないです", text: "じ↗かんが｜な↘いです", color: "#34d399" },
    { kanji: "仕事が、ほしいです", hira: "しごとが、ほしいです", text: "し↗ごとは｜ほ↗し↘いです", color: "#22d3ee" },
    { kanji: "先生は、おもしろいです", hira: "せんせいは、おもしろいです", text: "せ↗んせ↘いは｜お↗もしろ↘いです", color: "#e879f9" },
    { kanji: "学校は、たのしいです", hira: "가っこうは、たのしいです", text: "が↗っこうは｜た↗のし↘いです", color: "#fda4af" }
];

// スペースなしの構造に対応した安全なピッチアクセントHTMLパーサー
function renderPitchAccentHTML(textStr, color) {
    let resultHTML = '';
    let isHigh = true; 
    
    let i = 0;
    while (i < textStr.length) {
        let ch = textStr[i];
        if (ch === '↘' || ch === '＼') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;
            isHigh = false; 
            i++;
        } else if (ch === '↗' || ch === '/') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;
            isHigh = true; 
            i++;
        } else if (ch === '｜') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 4px;">${ch}</span>`;
            i++;
        } else {
            let nextCh = textStr[i+1];
            let effectiveHigh = isHigh;
            
            if (nextCh === '↘' || nextCh === '＼') {
                effectiveHigh = true; 
            } else if (nextCh === '↗' || nextCh === '/') {
                effectiveHigh = false;
            }
            
            let decorationStyle = effectiveHigh
                ? `text-decoration: overline; text-decoration-color: ${color}; text-decoration-thickness: 2px;`
                : `text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 2px;`;
            
            resultHTML += `<span style="${decorationStyle}">${ch}</span>`;
            i++;
        }
    }
    return resultHTML;
}
