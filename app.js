const drillData = [
    { en: "It's a nice day.", jp: "てんきがいいです" },
    { en: "I want a watch.", jp: "とけいがほしいです" },
    { en: "Work is fun.", jp: "しごとはたのしいです" },
    { en: "Studying is interesting.", jp: "べんきょうはおもしろいです" },
    { en: "Don't you have time?", jp: "じかんがないですか" }
];

let isManualStop = false;

function convertToHiragana(str) {
    return str.replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));
}

function initCompositionDrill() {
    const container = document.getElementById('compositionList');
    if (!container) return;
    container.innerHTML = "";

    const header = document.createElement('div');
    header.className = 'header-panel';
    header.innerHTML = `
        <div class="title-instruction-group"><strong>Composition Drills</strong></div>
        <div class="control-group"><div class="control-item">
            <span class="mode-label ${!isManualStop ? '' : 'inactive-mode'}">Auto Stop</span>
            <label class="switch"><input type="checkbox" id="stopSwitch" ${isManualStop ? 'checked' : ''}><span class="slider"></span></label>
            <span class="mode-label ${isManualStop ? '' : 'inactive-mode'}">Manual</span>
        </div></div>
    `;
    container.appendChild(header);
    document.getElementById('stopSwitch').onchange = (e) => { isManualStop = e.target.checked; initCompositionDrill(); };

    drillData.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'drill-row';

        row.innerHTML = `
            <div class="top-row">
                <span class="prompt-label">${item.en}</span>
                <button class="record-btn">⏺とる</button>
                <button class="stop-btn" disabled>⏹とめる</button>
                <span class="result-text">(未録音)</span>
            </div>
            <div class="correction-box" style="display:none"></div>
        `;
        container.appendChild(row);

        const recBtn = row.querySelector('.record-btn');
        const stopBtn = row.querySelector('.stop-btn');
        const resText = row.querySelector('.result-text');
        const corrBox = row.querySelector('.correction-box');

        let recognition;
        recBtn.onclick = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRec();
                recognition.lang = 'ja-JP';
                recognition.continuous = isManualStop;

                recognition.onresult = (e) => {
                    const transcript = e.results[0][0].transcript;
                    const cleanT = convertToHiragana(transcript).replace(/[.,、。\s]/g, "");
                    const cleanJ = convertToHiragana(item.jp).replace(/[.,、。\s]/g, "");

                    if (cleanT.includes(cleanJ.substring(0,3))) {
                        resText.innerHTML = `${transcript} ✅`;
                        corrBox.style.display = 'none';
                    } else {
                        resText.innerHTML = `${transcript} ❌`;
                        corrBox.innerHTML = `<span>正解: ${item.jp}</span><button onclick="speechSynthesis.speak(new SpeechSynthesisUtterance('${item.jp}'))">🔊 きく</button>`;
                        corrBox.style.display = 'flex';
                    }
                    if(!isManualStop) stopBtn.click();
                };

                recognition.start();
                recBtn.disabled = true; stopBtn.disabled = false;
                stopBtn.classList.add('stop-btn-active');
                resText.textContent = "Recording...";
            } catch (e) { resText.textContent = "Mic Error"; }
        };

        stopBtn.onclick = () => {
            if (recognition) recognition.stop();
            recBtn.disabled = false; stopBtn.disabled = true;
            stopBtn.classList.remove('stop-btn-active');
        };
    });
}
document.addEventListener('DOMContentLoaded', initCompositionDrill);
