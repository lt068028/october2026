// ============================================================================
// Pronunciation Practice 2
// ============================================================================

const drill1Data = [
    { kanji: "天気が、いいです", hira: "てんきが、いいです", text: "て ↘ んきが ｜ い ↘ いいです", color: "#facc15" },
    { kanji: "時間が、ないです", hira: "じかんが、ないです", text: "じ ↗ かんが ｜ な ↘ いです", color: "#34d399" },
    { kanji: "仕事が、ほしいです", hira: "しごとが、ほしいです", text: "し ↗ ごとが ｜ ほ ↗ し ↘ いです", color: "#22d3ee" },
    { kanji: "先生は、おもしろいです", hira: "せんせいは、おもしろいです", text: "せ ↗ んせ ↘ いは ｜ お ↗ もしろ ↘ いです", color: "#e879f9" },
    { kanji: "学校は、たのしいです", hira: "がっこうは、たのしいです", text: "が ↗ っこうは ｜ た ↗ のし ↘ いです", color: "#fda4af" }
];

let isManualStop = true; // デフォルトは Manual stop
let isAutoPlay = true; 
let useHiraganaOnly = false;
let activeRecognitionSession = null;

// ============================================================================
// Voice Setup
// ============================================================================
let preferredVoice = null;

function setupPreferredVoice() {
    try {
        const voices = speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        let selected = voices.find(v => v.name && v.lang && v.name.toLowerCase().includes("chrome os") && v.lang.includes("ja"));
        if (!selected) selected = voices.find(v => v.name && v.name.toLowerCase().includes("keita"));
        if (!selected) selected = voices.find(v => v.name && v.name.toLowerCase().includes("nanami"));
        if (!selected) selected = voices.find(v => v.name && v.lang && v.name.toLowerCase().includes("google") && v.lang.includes("ja"));
        if (!selected) selected = voices.find(v => v.lang && v.lang.includes("ja"));
        
        if (selected) preferredVoice = selected;
    } catch (e) { console.warn("Voice setup error:", e); }
}

if (typeof speechSynthesis !== "undefined") {
    setupPreferredVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => setupPreferredVoice();
    }
}

// ============================================================================
// Playback Control & Simultaneous Button State
// ============================================================================
let currentPlayingAudio = null;
let currentPlayTimeoutId = null;
let activePlayButtons = [];
let currentUtteranceRef = null; 

function setPlayingStateMultiple(buttons, text) {
    stopAllPlayback();
    activePlayButtons = buttons;
    buttons.forEach(btn => {
        if (!btn) return;
        if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = text;
    });
}

function restorePlayButtons() {
    activePlayButtons.forEach(btn => {
        if (!btn) return;
        btn.disabled = false;
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
        } else {
            btn.innerHTML = 'Play';
        }
    });
    activePlayButtons = [];
}

function stopAllPlayback() {
    if (currentPlayTimeoutId) { clearTimeout(currentPlayTimeoutId); currentPlayTimeoutId = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    currentUtteranceRef = null;
    if (currentPlayingAudio) { currentPlayingAudio.pause(); currentPlayingAudio = null; }
    restorePlayButtons();
}

function convertToHiragana(text) {
    if (!text) return "";
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()（）「」。、\s]/g, "");
    const dict = {
        "天気": "てんき", "時間": "じかん", "仕事": "しごと", "先生": "せんせい", "学校": "がっこう",
        "悪い": "わるい", "傘": "かさ", "良い": "いい", "楽しい": "たのしい", "欲しい": "ほしい", "面白い": "おもしろい"
    };
    for (let key in dict) {
        const regex = new RegExp(key, "g");
        cleaned = cleaned.replace(regex, dict[key]);
    }
    cleaned = cleaned.replace(/わ$/g, "は");
    return cleaned;
}

// 上線（overline: 高ピッチ）と下線（underline: 低ピッチ）を組み合わせたピッチアクセントパーサー
function renderPitchAccentHTML(textStr, color) {
    let resultHTML = '';
    let isHigh = true; // 初期状態は高ピッチ（上線）
    
    let i = 0;
    while (i < textStr.length) {
        let ch = textStr[i];
        if (ch === '↘' || ch === '＼') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;
            isHigh = false; // 下落後は低ピッチ（下線）
            i++;
        } else if (ch === '↗' || ch === '/') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 1px;">${ch}</span>`;
            isHigh = true; // 上昇後は高ピッチ（上線）
            i++;
        } else if (ch === '｜') {
            resultHTML += `<span style="color: ${color}; font-weight: bold; margin: 0 4px;">${ch}</span>`;
            i++;
        } else if (ch === ' ' || ch === '、') {
            resultHTML += ch;
            i++;
        } else {
            let nextCh = textStr[i+1];
            let isPrecedingSymbol = (nextCh === '↘' || nextCh === '↗' || nextCh === '＼' || nextCh === '/');
            
            let decorationStyle = '';
            if (isHigh && !isPrecedingSymbol) {
                decorationStyle = `text-decoration: overline; text-decoration-color: ${color}; text-decoration-thickness: 2px;`;
            } else if (!isHigh && !isPrecedingSymbol) {
                decorationStyle = `text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 2px;`;
            }
            
            if (decorationStyle) {
                resultHTML += `<span style="${decorationStyle}">${ch}</span>`;
            } else {
                resultHTML += `<span>${ch}</span>`;
            }
            i++;
        }
    }
    return resultHTML;
}

function speakText(text, rate = 0.9, onEndCallback) {
    setupPreferredVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;
    if (preferredVoice) utterance.voice = preferredVoice;
    
    currentUtteranceRef = utterance;
    utterance.onend = () => { currentUtteranceRef = null; if (onEndCallback) onEndCallback(); };
    utterance.onerror = () => { currentUtteranceRef = null; if (onEndCallback) onEndCallback(); };
    try { speechSynthesis.speak(utterance); } catch (err) {
        console.error("Speech synthesis error:", err);
        currentUtteranceRef = null;
        if (onEndCallback) onEndCallback();
    }
}

// ============================================================================
// Initialization & DOM Setup
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    initSettingsPanel();
    initDrill1();
    setupFooterGuide();
});

function setupFooterGuide() {
    const trigger = document.getElementById("guideTrigger");
    const box = document.getElementById("guideBox");
    if (trigger && box) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            box.style.display = box.style.display === "none" ? "block" : "none";
        });
        document.addEventListener("click", () => { box.style.display = "none"; });
    }
}

function updateToggleLabelStyle(labelEl, isActive) {
    if (!labelEl) return;
    labelEl.className = `mode-label ${isActive ? "active-mode" : "inactive-mode"} custom-tip-wrap`;
    const emoji = labelEl.querySelector('.icon-emoji');
    if (emoji) {
        if (isActive) { emoji.style.filter = "none"; emoji.style.opacity = "1"; }
        else { emoji.style.filter = "grayscale(100%)"; emoji.style.opacity = "0.55"; }
    }
}

function initSettingsPanel() {
    const toggleRecordMode = document.getElementById("toggleRecordMode");
    const labelAutoRecord = document.getElementById("labelAutoRecord");
    const labelManualRecord = document.getElementById("labelManualRecord");

    if (toggleRecordMode) {
        toggleRecordMode.addEventListener("change", (e) => {
            isManualStop = e.target.checked;
            updateToggleLabelStyle(labelAutoRecord, !isManualStop);
            updateToggleLabelStyle(labelManualRecord, isManualStop);
        });
        updateToggleLabelStyle(labelAutoRecord, !isManualStop);
        updateToggleLabelStyle(labelManualRecord, isManualStop);
    }

    const togglePlaybackMode = document.getElementById("togglePlaybackMode");
    const labelAutoPlay = document.getElementById("labelAutoPlay");
    const labelManualPlay = document.getElementById("labelManualPlay");

    if (togglePlaybackMode) {
        togglePlaybackMode.addEventListener("change", (e) => {
            isAutoPlay = !e.target.checked;
            updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
            updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
        });
        updateToggleLabelStyle(labelAutoPlay, isAutoPlay);
        updateToggleLabelStyle(labelManualPlay, !isAutoPlay);
    }

    const toggleScriptMode = document.getElementById("toggleScriptMode");
    const labelKanji = document.getElementById("labelKanji");
    const labelHiragana = document.getElementById("labelHiragana");

    if (toggleScriptMode) {
        toggleScriptMode.addEventListener("change", (e) => {
            useHiraganaOnly = e.target.checked;
            updateToggleLabelStyle(labelKanji, !useHiraganaOnly);
            updateToggleLabelStyle(labelHiragana, useHiraganaOnly);
            initDrill1(); // Only Hiragana切り替え時に即時再描画
        });
        updateToggleLabelStyle(labelKanji, !useHiraganaOnly);
        updateToggleLabelStyle(labelHiragana, useHiraganaOnly);
    }
}

// ----------------------------------------------------------------------------
// Drill 1 Initialization
// ----------------------------------------------------------------------------
function initDrill1() {
    const container = document.getElementById("drill1List");
    if (!container) return;
    container.innerHTML = "";

    drill1Data.forEach((item, index) => {
        createDrill1Row(
            container,
            `${index + 1}.`,
            item,
            0.9
        );
    });
}

function createDrill1Row(container, indexLabel, item, playRate) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "drill-row";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const listenBtn = document.createElement("button");
    listenBtn.className = "example-button custom-tip-wrap";
    listenBtn.innerHTML = '🔊きく<span class="custom-tip-box">Listen to the model sentence.</span>';

    listenBtn.onclick = () => {
        const recordBtnEl = rowDiv.querySelector(".play-recording-btn");
        setPlayingStateMultiple([listenBtn, recordBtnEl], "Playing...");
        speakText(item.hira, playRate, () => stopAllPlayback());
    };

    const indexSpan = document.createElement("span");
    indexSpan.textContent = indexLabel;
    indexSpan.style.fontWeight = "bold";
    indexSpan.style.marginRight = "6px";

    const promptSpan = document.createElement("span");
    promptSpan.className = "prompt-label";
    promptSpan.innerHTML = renderPitchAccentHTML(item.text, item.color);
    promptSpan.style.minWidth = "260px";
    promptSpan.style.paddingLeft = "4px"; // 左側の余計なボーダー線を除去

    const recordBtn = document.createElement("button");
    recordBtn.className = "example-button custom-tip-wrap";
    recordBtn.innerHTML = '⏺️とる<span class="custom-tip-box">Start recording your voice.</span>';

    const stopBtn = document.createElement("button");
    stopBtn.className = "example-button custom-tip-wrap";
    stopBtn.innerHTML = '⏹️<span class="custom-tip-box">Stop the active recording.</span>';
    stopBtn.disabled = !isManualStop;
    if (isManualStop && recordBtn.disabled) {
        // 初期状態の調整
    }

    const resultSpan = document.createElement("span");
    resultSpan.className = "result-text";
    resultSpan.textContent = "(Not recorded yet)";
    resultSpan.style.color = "var(--text-secondary)";

    topRow.appendChild(listenBtn);
    topRow.appendChild(indexSpan);
    topRow.appendChild(promptSpan);
    topRow.appendChild(recordBtn);
    topRow.appendChild(stopBtn);
    topRow.appendChild(resultSpan);

    const correctionBox = document.createElement("div");
    correctionBox.className = "correction-box";
    const corrListenBtn = document.createElement("button");
    corrListenBtn.className = "example-button";
    corrListenBtn.innerHTML = "🔊 きく";
    corrListenBtn.style.marginRight = "8px";
    const corrTextSpan = document.createElement("span");
    correctionBox.appendChild(corrListenBtn);
    correctionBox.appendChild(corrTextSpan);

    rowDiv.appendChild(topRow);
    rowDiv.appendChild(correctionBox);

    bindDrill1RecorderEvents(
        recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
        item.hira, playRate
    );

    container.appendChild(rowDiv);
}

function bindDrill1RecorderEvents(
    recordBtn, stopBtn, resultSpan, correctionBox, corrListenBtn, corrTextSpan,
    expectedHiraText, playRate = 0.9
) {
    let session = null;
    let lastAudioUrl = null;

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;
        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
        }

        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (e) {}
        }

        if (currentSession.stream) {
            currentSession.stream.getTracks().forEach(track => track.stop());
        }

        if (activeRecognitionSession === currentSession) {
            activeRecognitionSession = null;
        }

        if (session === currentSession) {
            session = null;
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            stopBtn.classList.remove("stop-btn-active");
        }
    }

    function requestStop(currentSession, abort = false, errorMessage = "") {
        if (!currentSession || currentSession.finished) return;

        if (errorMessage) {
            currentSession.errorMessage = errorMessage;
            resultSpan.textContent = errorMessage;
            resultSpan.style.color = "var(--error-text)";
        }

        const currentRecognition = currentSession.recognition;
        if (!currentRecognition) { releaseSession(currentSession); return; }

        if (currentSession.watchdog === null) {
            currentSession.watchdog = setTimeout(() => { releaseSession(currentSession); }, 2500);
        }

        try { if (abort) currentRecognition.abort(); else currentRecognition.stop(); } catch (err) {}
        
        if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
            try { currentSession.mediaRecorder.stop(); } catch (err) {}
        }
    }

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;
        stopAllPlayback();

        if (activeRecognitionSession !== null) {
            releaseSession(activeRecognitionSession);
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser Notice\nBrave browser does not support speech recognition. Please try another browser.");
            resultSpan.textContent = "Speech recognition is not supported in this browser.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        let stream;
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } 
        catch (err) {
            resultSpan.textContent = "Microphone access denied or unavailable.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        if (lastAudioUrl) { URL.revokeObjectURL(lastAudioUrl); lastAudioUrl = null; }

        const currentSession = {
            finished: false, stopRequested: false, errorMessage: "", recognition: null,
            watchdog: null, mediaRecorder: null, audioChunks: [], stream: stream,
            accumulatedTranscript: "", recognitionDone: false, recorderDone: false, processed: false
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        const tryProcessResult = () => {
            if (currentSession.errorMessage || currentSession.processed) return;
            if (currentSession.recognitionDone && currentSession.recorderDone) {
                currentSession.processed = true;
                processDrill1Result(
                    currentSession.accumulatedTranscript, expectedHiraText,
                    resultSpan, correctionBox, corrListenBtn, corrTextSpan, () => lastAudioUrl, playRate
                );
            }
        };

        try {
            const currentRecognition = new SpeechRecognition();
            currentSession.recognition = currentRecognition;
            currentRecognition.lang = "ja-JP";
            currentRecognition.interimResults = false;
            currentRecognition.continuous = isManualStop;

            const mediaRecorder = new MediaRecorder(stream);
            currentSession.mediaRecorder = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) currentSession.audioChunks.push(e.data); };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(currentSession.audioChunks, { type: "audio/webm" });
                lastAudioUrl = URL.createObjectURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                currentSession.recorderDone = true;
                tryProcessResult();
            };

            currentRecognition.onresult = (event) => {
                if (currentSession.finished || session !== currentSession || currentSession.errorMessage) return;
                let rawTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) rawTranscript += event.results[i][0].transcript;
                }
                currentSession.accumulatedTranscript += rawTranscript;
            };

            currentRecognition.onerror = (event) => {
                if (currentSession.finished || session !== currentSession) return;
                
                if (event.error === "network" || event.error === "service-not-allowed") {
                    alert("Browser Notice\nBrave browser does not support speech recognition. Please try another browser.");
                }

                const message =
                    event.error === "not-allowed" || event.error === "service-not-allowed" ? "Microphone permission denied." :
                    event.error === "no-speech" ? "No speech detected. Please try again." :
                    event.error === "audio-capture" ? "Microphone unavailable." :
                    event.error === "network" ? "Speech recognition network error." :
                    event.error === "aborted" ? "Recording stopped." :
                    "Speech recognition error. Please try again.";
                requestStop(currentSession, true, message);
            };

            currentRecognition.onend = () => {
                currentSession.recognitionDone = true;
                if (currentSession.mediaRecorder && currentSession.mediaRecorder.state !== "inactive") {
                    try { currentSession.mediaRecorder.stop(); } catch (e) {}
                }
                tryProcessResult();
                releaseSession(currentSession);
            };

            recordBtn.disabled = true;
            stopBtn.disabled = !isManualStop;
            if (isManualStop) stopBtn.classList.add("stop-btn-active");
            else stopBtn.classList.remove("stop-btn-active");

            resultSpan.textContent = "Recording...";
            resultSpan.style.color = "var(--accent-color)";
            correctionBox.style.display = "none";

            mediaRecorder.start();
            currentRecognition.start();
        } catch (err) {
            console.error("Speech recognition start error:", err);
            alert("Browser Notice\nBrave browser does not support speech recognition. Please try another browser.");
            requestStop(currentSession, true, "Could not start recording. Please try again.");
        }
    });

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished) return;
        if (session.stopRequested) return;
        stopAllPlayback();
        session.stopRequested = true;
        stopBtn.disabled = true;
        requestStop(session, false);
    });
}

function processDrill1Result(
    rawTranscript, expectedHiraText,
    resultSpan, correctionBox, corrListenBtn, corrTextSpan, getUrlFn, playRate
  ) {
      if (rawTranscript.replace(/[\s.,]/g, "").length < 2) {
          resultSpan.textContent = rawTranscript + " (Too short)";
          resultSpan.style.color = "var(--text-secondary)";
          return;
      }
  
      const hiraText = convertToHiragana(rawTranscript);
      const expectedHira = convertToHiragana(expectedHiraText);
      const endParticleRegex = "(?:ね|よ|よね|ですね|ですよ)*[.。!]?$";
  
      const matchRegex = new RegExp(`^${expectedHira}` + endParticleRegex);
      const isCorrect = matchRegex.test(hiraText) || hiraText.includes(expectedHira);
  
      const displayedTranscript = useHiraganaOnly ? hiraText : rawTranscript;
  
      const appendButtons = () => {
          let playBtn = resultSpan.querySelector(".play-recording-btn");
          if (!playBtn) {
              playBtn = document.createElement("button");
              playBtn.className = "example-button play-recording-btn custom-tip-wrap";
              playBtn.style.marginLeft = "8px";
              playBtn.innerHTML = '▶️<span class="custom-tip-box">Play your recorded voice</span>';
  
              playBtn.onclick = () => {
                  const recordedAudioUrl = getUrlFn();
                  if (recordedAudioUrl) {
                      const rowContainer = resultSpan.closest(".drill-row");
                      const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
                      setPlayingStateMultiple([modelListenBtn, playBtn], "Playing...");
                      const audio = new Audio(recordedAudioUrl);
                      currentPlayingAudio = audio;
                      audio.onended = () => stopAllPlayback();
                      audio.play().catch(e => {
                          console.warn("Playback failed", e);
                          stopAllPlayback();
                      });
                  }
              };
              resultSpan.appendChild(playBtn);
          }
      };
  
      if (isCorrect) {
          resultSpan.textContent = displayedTranscript + " ✅ ";
          resultSpan.style.color = "var(--text-primary)";
          appendButtons();
          correctionBox.style.display = "none";
      } else {
          resultSpan.textContent = displayedTranscript + " ";
          resultSpan.style.color = "var(--error-text)";
          appendButtons();
          corrTextSpan.textContent = "🔥 Keep going! Try once more!";
          corrListenBtn.style.display = "inline-block";
  
          corrListenBtn.onclick = () => {
              const rowContainer = resultSpan.closest(".drill-row");
              const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
              const playBtn = resultSpan.querySelector(".play-recording-btn");
              setPlayingStateMultiple([corrListenBtn, modelListenBtn, playBtn], "Playing...");
              speakText(expectedHiraText, playRate, () => stopAllPlayback());
          };
          correctionBox.style.display = "block";
      }
  
      const runAutoPlaySequence = () => {
          if (!isAutoPlay) return;
  
          const recordedAudioUrl = getUrlFn();
          const rowContainer = resultSpan.closest(".drill-row");
          const modelListenBtn = rowContainer ? rowContainer.querySelector(".example-button") : null;
          const playBtn = resultSpan.querySelector(".play-recording-btn");
  
          if (!recordedAudioUrl || !playBtn) return;
  
          setPlayingStateMultiple([modelListenBtn, playBtn], "Playing...");
  
          const utterance = new SpeechSynthesisUtterance(expectedHiraText);
          utterance.lang = "ja-JP";
          utterance.rate = playRate;
  
          if (preferredVoice) utterance.voice = preferredVoice;
  
          currentUtteranceRef = utterance;
  
          utterance.onend = () => {
              currentUtteranceRef = null;
              currentPlayTimeoutId = setTimeout(() => {
                  const audio = new Audio(recordedAudioUrl);
                  currentPlayingAudio = audio;
                  audio.playbackRate = 1.0;
                  audio.onended = () => stopAllPlayback();
                  audio.play().catch(e => {
                      console.warn("Auto playback failed", e);
                      stopAllPlayback();
                  });
              }, 100);
          };
  
          utterance.onerror = () => stopAllPlayback();
  
          currentPlayTimeoutId = setTimeout(() => {
              speechSynthesis.speak(utterance);
          }, 500);
      };
  
      runAutoPlaySequence();
  }
