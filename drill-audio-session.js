// Shared lifecycle only; synthesis, recording and answer checking stay in each page.
window.DrillAudio = (() => {
    let adapter;
    let leaving = false;
    let model = null;
    let relay = null;
    let activeAudio = null;
    let generation = 0;
    let playbackGeneration = 0;
    let requestGeneration = 0;
    const streams = new Set();
    const pitchStates = new Set();
    const locks = new Set();
    const analyses = new Map();
    let playbackStage = null;
    let activeRecordingSession = null;
    const RECORDING_DEFAULTS = Object.freeze({
        fftSize: 1024,
        rmsThreshold: 0.015,
        pollIntervalMs: 100,
        consecutiveFrames: 3,
        detectionMode: 'frames',
        windowMs: 400,
        windowMinSpeechMs: 100,
        preSpeechTimeoutMs: 5000,
        postSpeechSilenceMs: 2000,
        maxDurationMs: 20000,
        stopFallbackTimeoutMs: 2500
    });
    const nativeGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    const settings = '.compact-settings button, .compact-settings input, #voiceSelect, #voiceDropdownBtn';
    const voice = '#voiceSelect, #voiceDropdown';

    function stopAudio(audio) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.onended = null;
            audio.onerror = null;
            audio.src = '';
        } catch (_) {}
    }

    function cancelSpeech() {
        if (!window.speechSynthesis) return;
        try {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
            if (window.speechSynthesis.paused && typeof window.speechSynthesis.resume === 'function') {
                window.speechSynthesis.resume();
            }
        } catch (_) {}
    }

    function isAudioButton(el) {
        return el.matches('button') && (
            el.dataset.audioRole === 'listen' ||
            el.dataset.audioRole === 'play' ||
            el.textContent.trim().startsWith('🔊きく') ||
            el.textContent.trim().startsWith('▶️') ||
            [...pitchStates].some(state => state.listenBtn === el || state.playBtn === el)
        );
    }

    function sync() {
        if (!adapter) return;
        const recording = adapter.busy();
        document.body.classList.toggle('drill-recording-locked', recording);
        document.body.classList.toggle('drill-model-capturing', Boolean(model));
        // Page recorders own drill-button/settings locks. Never snapshot their
        // temporary disabled=true: restoring that snapshot would lock them forever.
        const controls = new Set(recording
            ? document.querySelectorAll('input, select, textarea, #voiceDropdownBtn')
            : model
                ? [...document.querySelectorAll(settings), ...document.querySelectorAll('button')].filter(
                    el => el.matches(settings) || isAudioButton(el)
                )
                : []);
        let released = false;
        for (const el of locks) {
            if (!controls.has(el)) {
                if (el.isConnected) el.disabled = false;
                locks.delete(el);
                released = true;
            }
        }
        for (const el of controls) {
            if (!el.disabled) {
                locks.add(el);
                el.disabled = true;
            }
        }
        if (!recording && !model && released) adapter.sync?.();
        if (!recording && !model && recordingTipTokens.size > 0) clearRecordingTipTokens();
        // Existing pages sometimes set an inline !important pointer cursor.
        // Derive prohibition from the current state instead of preserving it.
        for (const el of document.querySelectorAll('button, input, select, textarea')) {
            const targetCursor = el.tagName === 'BUTTON' ? 'default' : 'not-allowed';
            if (el.disabled) el.style.setProperty('cursor', targetCursor, 'important');
            else if (el.style.cursor === targetCursor) el.style.removeProperty('cursor');
        }
        if (recording || model) {
            const menu = document.getElementById('voiceDropdownMenu');
            if (menu && !menu.hidden) menu.hidden = true;
            const btn = document.getElementById('voiceDropdownBtn');
            if (btn?.getAttribute('aria-expanded') === 'true') btn.setAttribute('aria-expanded', 'false');
        }
    }

    function cancelModel() {
        const old = model;
        if (!old) return;
        model = null;
        old.cancelled = true;
        clearTimeout(old.timer);
        clearTimeout(old.watchdog);
        if (old.recorder) {
            old.recorder.onstop = null;
            old.recorder.ondataavailable = null;
            if (old.recorder.state !== 'inactive') {
                try { old.recorder.stop(); } catch (_) {}
            }
        }
        old.stream?.getTracks().forEach(track => track.stop());
        closeContext(old.context);
        cancelAnalysis(old.state);
        old.state.isAnalyzing = false;
        old.restore();
        sync();
    }

    function beginModel(state, restore) {
        cancelModel();
        const token = { state, restore, cancelled: false, generation: ++generation };
        model = token;
        sync();
        return token;
    }
    function valid(token) { return !leaving && model === token && !token.cancelled; }
    function endModel(token) {
        if (model !== token) return;
        model = null;
        clearTimeout(token.watchdog);
        token.stream?.getTracks().forEach(track => track.stop());
        sync();
    }

    const recordingTipTokens = new Set();
    function clearRecordingTipTokens() {
        for (const t of recordingTipTokens) {
            window.DrillTooltips?.endAudioAction?.(t);
        }
        recordingTipTokens.clear();
    }

    async function getUserMedia(options) {
        const recTipToken = window.DrillTooltips?.beginAudioAction?.();
        if (recTipToken !== undefined) recordingTipTokens.add(recTipToken);
        let recTipReleased = false;
        const releaseRecTip = () => {
            if (recTipReleased) return;
            recTipReleased = true;
            if (recTipToken !== undefined) {
                recordingTipTokens.delete(recTipToken);
                window.DrillTooltips?.endAudioAction?.(recTipToken);
            }
        };
        try {
            clearNotice();
            if (leaving) throw new DOMException('Page left', 'AbortError');
            const request = requestGeneration;
            if (activeAudio) {
                stopAudio(activeAudio);
                activeAudio = null;
            }
            if (relay) {
                const old = relay;
                relay = null;
                if (old.audio) {
                    stopAudio(old.audio);
                    if (activeAudio === old.audio) activeAudio = null;
                }
                old.buttons.forEach(({ button, nodes, disabled }) => {
                    button.replaceChildren(...nodes);
                    button.disabled = disabled;
                });
            }
            cancelSpeech();
            if (!options?.skipSpeechWait) {
                // Native cancellation can outlive cancel(); never record the old model.
                const deadline = performance.now() + 2000;
                while (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
                    if (leaving || request !== requestGeneration) {
                        throw new DOMException('Recording cancelled', 'AbortError');
                    }
                    if (performance.now() >= deadline) {
                        cancelSpeech();
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 25));
                }
            }
            if (leaving || request !== requestGeneration) {
                throw new DOMException('Recording cancelled', 'AbortError');
            }
            const stream = await nativeGetUserMedia(options);
            if (leaving || request !== requestGeneration) {
                stream.getTracks().forEach(track => track.stop());
                throw new DOMException('Page left', 'AbortError');
            }
            for (const previous of streams) {
                if (previous.getTracks().every(track => track.readyState === 'ended')) streams.delete(previous);
            }
            streams.add(stream);
            stream.getTracks().forEach(track => {
                track.addEventListener?.('ended', () => {
                    if (stream.getTracks().every(t => t.readyState === 'ended')) {
                        streams.delete(stream);
                        releaseRecTip();
                    }
                }, { once: true });
                if (typeof track.stop === 'function') {
                    const origStop = track.stop.bind(track);
                    track.stop = () => {
                        try { return origStop(); }
                        finally {
                            if (stream.getTracks().every(t => t.readyState === 'ended')) {
                                streams.delete(stream);
                                releaseRecTip();
                            }
                        }
                    };
                }
            });
            return stream;
        } catch (error) {
            releaseRecTip();
            throw error;
        }
    }

    function notify(message) {
        if (leaving) return;
        let el = document.getElementById('audioRecoveryStatus');
        if (!el) {
            el = document.createElement('p');
            el.id = 'audioRecoveryStatus';
            el.className = 'info-panel';
            el.setAttribute('role', 'status');
            const header = document.querySelector('.main-header');
            if (header) header.after(el); else document.body.prepend(el);
        }
        el.textContent = message;
        el.hidden = !message;
    }
    function clearNotice() {
        const el = document.getElementById('audioRecoveryStatus');
        if (el) el.hidden = true;
    }
    function closeContext(context) {
        if (context && context.state !== 'closed') {
            try { Promise.resolve(context.close()).catch(() => {}); } catch (_) {}
        }
    }
    function startPlaybackStage(budget, cleanup = () => {}) {
        playbackStage?.cancel();
        clearNotice();
        const ticket = playbackGeneration;
        const stage = {
            done: false, timer: null,
            valid: () => !leaving && !stage.done && playbackStage === stage && ticket === playbackGeneration,
            cancel() {
                if (stage.done) return;
                stage.done = true;
                clearTimeout(stage.timer);
                cleanup();
                if (playbackStage === stage) playbackStage = null;
            },
            arm(ms) {
                clearTimeout(stage.timer);
                stage.timer = setTimeout(() => {
                    if (!stage.valid()) return;
                    stage.cancel();
                    adapter?.stop();
                    notify('Playback timed out. Please try again. Your recording has been kept.');
                    sync();
                }, Math.max(0, ms));
            }
        };
        playbackStage = stage;
        stage.arm(budget);
        return stage;
    }
    function analysisError() {
        const error = new Error('Pitch analysis timed out.');
        error.name = 'TimeoutError';
        return error;
    }
    function stopAnalysisWorker(analysis) {
        analysis.worker?.terminate();
        analysis.worker = null;
        if (analysis.workerURL) URL.revokeObjectURL(analysis.workerURL);
        analysis.workerURL = null;
    }
    function cancelAnalysis(state) {
        const analysis = analyses.get(state);
        if (!analysis) return;
        analyses.delete(state);
        clearTimeout(analysis.timer);
        stopAnalysisWorker(analysis);
        closeContext(analysis.context);
        state.isAnalyzing = false;
        analysis.reject(new DOMException('Analysis cancelled', 'AbortError'));
    }
    function beginAnalysis(state) {
        cancelAnalysis(state);
        clearNotice();
        const started = performance.now();
        const analysis = { context: null, timer: null, expired: false };
        const deadline = new Promise((resolve, reject) => { analysis.reject = reject; });
        deadline.catch(() => {});
        analysis.owns = () => analyses.get(state) === analysis;
        analysis.check = () => {
            if (!analysis.owns() || leaving) throw new DOMException('Analysis cancelled', 'AbortError');
            if (analysis.expired || performance.now() - started >= 10000) throw analysisError();
        };
        analysis.wait = promise => Promise.race([promise, deadline]);
        analysis.frames = (samples, sampleRate, modelCapture, functions) => {
            analysis.check();
            const source = Object.entries(functions).map(([name, fn]) =>
                `const ${name} = (${fn.toString()});`
            ).join('\n') + `
                self.onmessage = event => {
                    try {
                        const {samples, sampleRate, modelCapture} = event.data;
                        self.postMessage({frames: estimateF0Frames(samples, sampleRate, modelCapture)});
                    } catch (error) { self.postMessage({error: error.message}); }
                };`;
            analysis.workerURL = URL.createObjectURL(new Blob([source], {type: 'text/javascript'}));
            analysis.worker = new Worker(analysis.workerURL);
            const result = new Promise((resolve, reject) => {
                analysis.worker.onmessage = event => {
                    if (!analysis.owns() || analysis.expired) return;
                    if (event.data.error) reject(new Error(event.data.error));
                    else resolve(event.data.frames);
                };
                analysis.worker.onerror = event => {
                    event.preventDefault?.();
                    reject(new Error(event.message || 'Pitch worker failed.'));
                };
                analysis.worker.postMessage({samples, sampleRate, modelCapture}, [samples.buffer]);
            });
            return analysis.wait(result);
        };
        analysis.finish = () => {
            clearTimeout(analysis.timer);
            stopAnalysisWorker(analysis);
            closeContext(analysis.context);
            if (analysis.owns()) analyses.delete(state);
        };
        analyses.set(state, analysis);
        analysis.timer = setTimeout(() => {
            if (!analysis.owns()) return;
            analysis.expired = true;
            stopAnalysisWorker(analysis);
            closeContext(analysis.context);
            analysis.reject(analysisError());
        }, 10000);
        return analysis;
    }

    function clearModels() {
        for (const state of pitchStates) {
            state.modelF0Frames = null;
            state.redraw();
        }
    }
    function microphoneError(error) {
        return error?.name === 'PlaybackStopError'
            ? 'Playback is still stopping. Please try recording again.'
            : 'Microphone access denied.';
    }
    function getActiveRecordingSession() {
        return activeRecordingSession;
    }
    function startRecordingSession(options = {}) {
        if (activeRecordingSession && !activeRecordingSession.finished) {
            activeRecordingSession.abort();
        }

        const key = options.key !== undefined ? options.key : null;
        const manual = Boolean(options.manual);
        const audioOnly = Boolean(options.audioOnly);
        const lang = String(options.lang || 'ja-JP');
        const continuous = options.continuous !== undefined ? Boolean(options.continuous) : true;
        const interimResults = options.interimResults !== undefined ? Boolean(options.interimResults) : true;
        const maxAlternatives = Number.isFinite(options.maxAlternatives) ? options.maxAlternatives : 1;
        const restartRecognitionOnEnd = options.restartRecognitionOnEnd !== undefined
            ? Boolean(options.restartRecognitionOnEnd)
            : true;
        const maxRestartAttempts = Number.isFinite(options.maxRestartAttempts)
            ? Math.max(0, options.maxRestartAttempts)
            : null;
        const isValidStt = typeof options.isValidStt === 'function'
            ? options.isValidStt
            : (text => Boolean(String(text ?? '').trim()));
        const acousticConfig = Object.assign({}, RECORDING_DEFAULTS, options.acoustic || {});

        let phase = 'preparing';
        let stopping = false;
        let finished = false;
        let aborted = false;
        let speechStarted = false;
        let lastSoundAt = 0;
        let recordingStartedAt = Date.now();
        let firstRecognizedAt = null;
        let protectedBy5sStt = false;
        let raw = '';
        let interim = '';
        let stopReason = '';
        let notice = '';
        let discardIntent = false;
        let recorderSettled = false;
        let recognitionSettled = audioOnly;
        let recorderTimedOut = false;
        let recorderFailedOnStop = false;
        let consecutiveRestarts = 0;
        let stream = null;
        let recorder = null;
        let recognition = null;
        let context = null;
        const chunks = [];
        const monitorTimers = [];
        let stopFallbackTimer = null;
        let resolveResult;
        const resultPromise = new Promise(resolve => {
            resolveResult = resolve;
        });

        function checkValidStt(text) {
            if (audioOnly) return false;
            const str = String(text ?? '');
            if (!str.trim()) return false;
            try {
                return Boolean(isValidStt(str));
            } catch (_) {
                return false;
            }
        }

        function clearMonitorTimers() {
            for (const id of monitorTimers) {
                clearTimeout(id);
                clearInterval(id);
            }
            monitorTimers.length = 0;
        }

        function clearAllTimers() {
            clearMonitorTimers();
            if (stopFallbackTimer !== null) {
                clearTimeout(stopFallbackTimer);
                stopFallbackTimer = null;
            }
        }

        function getState() {
            return {
                key,
                manual,
                audioOnly,
                phase,
                preparing: phase === 'preparing',
                recording: phase === 'recording',
                stopping,
                finished,
                aborted,
                speechStarted,
                lastSoundAt,
                firstRecognizedAt,
                protectedBy5sStt,
                raw,
                interim,
                recorderSettled,
                recognitionSettled,
                stopReason,
                notice
            };
        }

        function finalize() {
            if (finished || !recorderSettled || !recognitionSettled) return;
            finished = true;
            phase = 'finished';

            clearAllTimers();
            closeContext(context);
            context = null;

            if (stream) {
                stream.getTracks().forEach(track => {
                    try { track.stop(); } catch (_) {}
                });
            }

            if (recognition) {
                recognition.onend = null;
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onspeechstart = null;
                try { recognition.abort(); } catch (_) {}
            }

            if (recorder) {
                recorder.ondataavailable = null;
                recorder.onstop = null;
                recorder.onerror = null;
            }

            if (activeRecordingSession === handle) {
                activeRecordingSession = null;
            }

            if (!aborted && stopReason !== 'start-error' && interim.trim()) {
                raw += interim;
            }
            interim = '';

            const hasValidStt = (aborted || stopReason === 'start-error' || audioOnly)
                ? false
                : checkValidStt(raw);

            let finalDiscard = false;
            if (aborted || stopReason === 'aborted' || stopReason === 'start-error') {
                finalDiscard = true;
            } else if (hasValidStt) {
                finalDiscard = false;
                if (stopReason === 'timeout-5s') {
                    protectedBy5sStt = true;
                    if (notice === 'No speech detected within 5 seconds.') {
                        notice = '';
                    }
                }
            } else if (!speechStarted) {
                finalDiscard = true;
            } else if (recorderTimedOut || recorderFailedOnStop) {
                finalDiscard = true;
            } else {
                finalDiscard = Boolean(discardIntent);
            }

            let blob = null;
            let url = null;
            const hasNonEmptyChunks = !recorderTimedOut
                && !recorderFailedOnStop
                && chunks.some(c => c && c.size > 0);

            if (!finalDiscard && (speechStarted || hasValidStt) && hasNonEmptyChunks) {
                try {
                    const candidateBlob = new Blob(chunks, {
                        type: recorder?.mimeType || 'audio/webm'
                    });
                    if (candidateBlob && candidateBlob.size > 0) {
                        const candidateUrl = URL.createObjectURL(candidateBlob);
                        if (candidateUrl) {
                            blob = candidateBlob;
                            url = candidateUrl;
                        }
                    }
                } catch (_) {
                    blob = null;
                    url = null;
                }
            }
            chunks.length = 0;
            const hasAudio = Boolean(blob && url);

            const finalResult = {
                key,
                manual,
                audioOnly,
                raw: (aborted || stopReason === 'start-error') ? '' : raw,
                hasValidStt,
                speechStarted,
                protectedBy5sStt,
                blob,
                url,
                hasAudio,
                discard: finalDiscard,
                stopReason: stopReason || 'manual',
                notice
            };

            sync();

            try {
                options.onComplete?.(finalResult);
                options.onFinish?.(finalResult);
            } finally {
                resolveResult(finalResult);
            }
        }

        function stop(noticeText = '', requestedDiscard = false, reason = '') {
            if (stopping || finished) return;
            stopping = true;
            phase = 'stopping';
            stopReason = reason || (noticeText ? 'rec-error' : 'manual');
            if (noticeText) notice = noticeText;
            discardIntent = Boolean(requestedDiscard);

            clearMonitorTimers();
            closeContext(context);
            context = null;

            options.onStopRequested?.({ stopReason, notice, discardIntent }, handle);
            sync();

            if (recognition && !recognitionSettled) {
                try {
                    recognition.stop();
                } catch (_) {
                    recognitionSettled = true;
                }
            } else {
                recognitionSettled = true;
            }

            if (!recorder || recorder.state === 'inactive') {
                recorderSettled = true;
            } else {
                try {
                    recorder.stop();
                } catch (_) {
                    recorderSettled = true;
                    recorderFailedOnStop = true;
                }
            }

            if (!recorderSettled || !recognitionSettled) {
                stopFallbackTimer = setTimeout(() => {
                    stopFallbackTimer = null;
                    if (finished) return;
                    if (!recorderSettled) {
                        recorderTimedOut = true;
                        recorderSettled = true;
                        if (recorder) {
                            recorder.ondataavailable = null;
                            recorder.onstop = null;
                            recorder.onerror = null;
                            if (recorder.state !== 'inactive') {
                                try { recorder.stop(); } catch (_) {}
                            }
                        }
                        chunks.length = 0;
                    }
                    if (!recognitionSettled) {
                        recognitionSettled = true;
                        if (recognition) {
                            recognition.onend = null;
                            recognition.onresult = null;
                            recognition.onerror = null;
                            recognition.onspeechstart = null;
                            try { recognition.abort(); } catch (_) {}
                        }
                    }
                    finalize();
                }, acousticConfig.stopFallbackTimeoutMs);
            }

            finalize();
        }

        function abort() {
            if (finished) return;
            aborted = true;
            stopping = true;
            phase = 'stopping';
            stopReason = 'aborted';
            notice = '';
            discardIntent = true;

            clearAllTimers();
            closeContext(context);
            context = null;

            if (recognition) {
                recognition.onend = null;
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onspeechstart = null;
                try { recognition.abort(); } catch (_) {}
            }
            recognitionSettled = true;

            if (recorder) {
                recorder.ondataavailable = null;
                recorder.onstop = null;
                recorder.onerror = null;
                if (recorder.state !== 'inactive') {
                    try { recorder.stop(); } catch (_) {}
                }
            }
            recorderSettled = true;
            chunks.length = 0;

            if (stream) {
                stream.getTracks().forEach(track => {
                    try { track.stop(); } catch (_) {}
                });
            }

            finalize();
        }

        const handle = {
            key,
            manual,
            audioOnly,
            stop,
            abort,
            getState,
            result: resultPromise,
            promise: resultPromise,
            then: resultPromise.then.bind(resultPromise),
            catch: resultPromise.catch.bind(resultPromise),
            finally: resultPromise.finally.bind(resultPromise),
            get phase() { return phase; },
            get preparing() { return phase === 'preparing'; },
            get recording() { return phase === 'recording'; },
            get stopping() { return stopping; },
            get finished() { return finished; },
            get aborted() { return aborted; },
            get speechStarted() { return speechStarted; },
            get lastSoundAt() { return lastSoundAt; },
            get firstRecognizedAt() { return firstRecognizedAt; },
            get protectedBy5sStt() { return protectedBy5sStt; },
            get raw() { return raw; },
            get interim() { return interim; },
            get recorderSettled() { return recorderSettled; },
            get recognitionSettled() { return recognitionSettled; },
            get stopReason() { return stopReason; },
            get notice() { return notice; }
        };

        (async () => {
            if (leaving) {
                abort();
                return;
            }

            const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const hasMediaDevices = Boolean(options.stream || navigator.mediaDevices?.getUserMedia);
            const hasRecorder = typeof window.MediaRecorder !== 'undefined' && hasMediaDevices;
            const hasRecognition = Boolean(Recognition);

            if (!hasRecorder && (!audioOnly && !hasRecognition)) {
                recorderSettled = true;
                recognitionSettled = true;
                stop(
                    options.unsupportedBothNotice || 'Speech recognition and recording are not supported in this browser.',
                    true,
                    'start-error'
                );
                return;
            }
            if (!hasRecorder) {
                recorderSettled = true;
                recognitionSettled = true;
                stop(
                    options.unsupportedRecorderNotice || 'Recording is not supported in this browser.',
                    true,
                    'start-error'
                );
                return;
            }
            if (!audioOnly && !hasRecognition) {
                recorderSettled = true;
                recognitionSettled = true;
                stop(
                    options.unsupportedRecognitionNotice || 'Speech recognition is not supported in this browser.',
                    true,
                    'start-error'
                );
                return;
            }

            activeRecordingSession = handle;
            options.onPreparing?.(handle);
            sync();

            try {
                stream = options.stream || await getUserMedia(options.mediaConstraints || { audio: true });
            } catch (error) {
                if (aborted || leaving || error?.name === 'AbortError') {
                    abort();
                } else {
                    recorderSettled = true;
                    recognitionSettled = true;
                    stop(microphoneError(error), true, 'start-error');
                }
                return;
            }

            if (aborted || leaving) {
                stream?.getTracks().forEach(track => {
                    try { track.stop(); } catch (_) {}
                });
                abort();
                return;
            }

            if (stopping || finished) {
                stream?.getTracks().forEach(track => {
                    try { track.stop(); } catch (_) {}
                });
                recorderSettled = true;
                recognitionSettled = true;
                finalize();
                return;
            }

            recordingStartedAt = Date.now();

            if (!audioOnly) {
                try {
                    recognition = new Recognition();
                    recognition.lang = lang;
                    recognition.continuous = continuous;
                    recognition.interimResults = interimResults;
                    recognition.maxAlternatives = maxAlternatives;

                    recognition.onresult = event => {
                        if (finished || recognitionSettled || aborted) return;
                        consecutiveRestarts = 0;

                        let sawFinal = false;
                        let finalChunk = '';
                        let interimChunk = '';
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            const res = event.results[i];
                            const trans = String(res?.[0]?.transcript ?? '');
                            if (res?.isFinal) {
                                finalChunk += trans;
                                sawFinal = true;
                            } else if (!stopping) {
                                interimChunk += trans;
                            }
                        }

                        if (finalChunk) {
                            raw += finalChunk;
                            if (stopping) interim = '';
                        }
                        if (!stopping) {
                            interim = interimChunk;
                        } else if (sawFinal) {
                            interim = '';
                        }

                        if (checkValidStt(raw) || checkValidStt(interim) || checkValidStt(raw + interim)) {
                            const now = Date.now();
                            if (firstRecognizedAt === null) {
                                firstRecognizedAt = now;
                            }
                            if (now - recordingStartedAt <= acousticConfig.preSpeechTimeoutMs) {
                                protectedBy5sStt = true;
                            }
                        }

                        options.onResult?.({ raw, interim, firstRecognizedAt, protectedBy5sStt }, handle);
                    };

                    recognition.onerror = event => {
                        if (finished || recognitionSettled || aborted || stopping) return;
                        if (event?.error === 'no-speech') return;
                        recognitionSettled = true;
                        stop('Recognition error.', false, 'stt-error');
                    };

                    recognition.onend = () => {
                        if (finished || recognitionSettled) return;
                        if (stopping || aborted || leaving || !restartRecognitionOnEnd) {
                            recognitionSettled = true;
                            finalize();
                            return;
                        }

                        if (interim.trim()) {
                            raw += interim;
                            interim = '';
                        }

                        if (stopping || finished || aborted || leaving) {
                            recognitionSettled = true;
                            finalize();
                            return;
                        }

                        if (maxRestartAttempts !== null && consecutiveRestarts >= maxRestartAttempts) {
                            recognitionSettled = true;
                            stop('Recognition error.', false, 'stt-error');
                            return;
                        }

                        try {
                            consecutiveRestarts++;
                            recognition.start();
                        } catch (_) {
                            recognitionSettled = true;
                            if (!stopping && !finished && !aborted) {
                                stop('Recognition error.', false, 'stt-error');
                            } else {
                                finalize();
                            }
                        }
                    };
                } catch (_) {
                    recorderSettled = true;
                    recognitionSettled = true;
                    stop('Recognition error.', true, 'stt-error');
                    return;
                }
            }

            try {
                recorder = new MediaRecorder(stream);
                recorder.ondataavailable = event => {
                    if (finished || recorderSettled || aborted || recorderTimedOut) return;
                    if (event?.data && event.data.size > 0) {
                        chunks.push(event.data);
                    }
                };
                recorder.onstop = () => {
                    if (finished || recorderSettled) return;
                    recorderSettled = true;
                    if (!stopping && !aborted) {
                        stop('Recording stopped.', false, 'rec-error');
                    } else {
                        finalize();
                    }
                };
                recorder.onerror = () => {
                    if (finished) return;
                    stop('Recording error.', true, 'rec-error');
                };
                recorder.start();
            } catch (_) {
                recorderSettled = true;
                recognitionSettled = true;
                stop('Could not start recording.', true, 'start-error');
                return;
            }

            if (!audioOnly && recognition) {
                try {
                    recognition.start();
                } catch (_) {
                    recognitionSettled = true;
                    stop('Recognition error.', true, 'stt-error');
                    return;
                }
            }

            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) {
                    throw new Error('AudioContext not supported');
                }
                context = new AudioContextClass();
                const source = context.createMediaStreamSource(stream);
                const analyser = context.createAnalyser();
                analyser.fftSize = acousticConfig.fftSize;
                source.connect(analyser);

                const resumePromise = context.resume?.();
                if (resumePromise && typeof resumePromise.catch === 'function') {
                    resumePromise.catch(() => {
                        if (!finished && !stopping && !aborted) {
                            stop('Recording error.', true, 'audio-error');
                        }
                    });
                }

                const samples = new Float32Array(analyser.fftSize);
                let soundFrames = 0;
                const windowSamples = [];
                let prevPollTime = Date.now();

                monitorTimers.push(setInterval(() => {
                    if (stopping || finished || aborted) return;

                    analyser.getFloatTimeDomainData(samples);
                    let sum = 0;
                    for (let i = 0; i < samples.length; i++) {
                        const v = samples[i];
                        sum += v * v;
                    }
                    const rms = Math.sqrt(sum / samples.length);
                    const sound = rms > acousticConfig.rmsThreshold;
                    const now = Date.now();

                    if (acousticConfig.detectionMode === 'window') {
                        const elapsed = Math.min(Math.max(now - prevPollTime, 0), 40);
                        prevPollTime = now;
                        windowSamples.push({ time: now, duration: sound ? elapsed : 0 });
                        while (windowSamples.length && now - windowSamples[0].time > acousticConfig.windowMs) {
                            windowSamples.shift();
                        }
                        const totalSpeechMs = windowSamples.reduce((acc, item) => acc + item.duration, 0);
                        if (!speechStarted && totalSpeechMs >= acousticConfig.windowMinSpeechMs) {
                            speechStarted = true;
                            lastSoundAt = now;
                            options.onSpeechStart?.(handle);
                        } else if (speechStarted && sound) {
                            lastSoundAt = now;
                        }
                    } else {
                        soundFrames = sound ? soundFrames + 1 : 0;
                        if (sound && speechStarted) {
                            lastSoundAt = now;
                        }
                        if (soundFrames >= acousticConfig.consecutiveFrames) {
                            const wasStarted = speechStarted;
                            speechStarted = true;
                            lastSoundAt = now;
                            if (!wasStarted) {
                                options.onSpeechStart?.(handle);
                            }
                        }
                    }

                    if (
                        !manual &&
                        speechStarted &&
                        lastSoundAt > 0 &&
                        now - lastSoundAt >= acousticConfig.postSpeechSilenceMs
                    ) {
                        stop('', false, 'silence-2s');
                    }
                }, acousticConfig.pollIntervalMs));
            } catch (_) {
                stop('Recording error.', true, 'audio-error');
                return;
            }

            if (!manual) {
                monitorTimers.push(setTimeout(() => {
                    if (stopping || finished || aborted) return;
                    if (!speechStarted && !protectedBy5sStt) {
                        stop('No speech detected within 5 seconds.', true, 'timeout-5s');
                    }
                }, acousticConfig.preSpeechTimeoutMs));
            }

            monitorTimers.push(setTimeout(() => {
                if (stopping || finished || aborted) return;
                stop('Auto-stopped after 20 seconds.', false, 'limit-20s');
            }, acousticConfig.maxDurationMs));

            phase = 'recording';
            options.onStart?.(handle);
            sync();
        })();

        return handle;
    }
    function leave() {
        if (leaving) return;
        leaving = true;
        ++requestGeneration;
        if (activeAudio) {
            stopAudio(activeAudio);
            activeAudio = null;
        }
        cancelSpeech();
        for (const state of analyses.keys()) cancelAnalysis(state);
        if (activeRecordingSession) {
            const currentSession = activeRecordingSession;
            activeRecordingSession = null;
            currentSession.abort();
        }
        adapter?.cancel();
        adapter?.stop();
        cancelModel();
        streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        streams.clear();
        clearRecordingTipTokens();
    }
    function control(event) {
        if (!adapter) return;
        const target = event.target.closest?.('button, input, select, textarea, a, summary, [role="option"]');
        if (!target) return;
        if (target.matches('a.back-link')) { leave(); return; }
        if (adapter.busy() && !target.classList.contains('stop-btn-active')) {
            event.preventDefault(); event.stopImmediatePropagation(); return;
        }
        const setting = target.closest('.compact-settings, #voiceDropdown, #voiceSelect');
        if (model && (setting || isAudioButton(target))) {
            event.preventDefault(); event.stopImmediatePropagation(); return;
        }
        if (event.type === 'click' && target.closest(voice)) {
            // Opening a menu is not itself a new task.
            if (target.matches('[role="option"]')) {
                adapter.stop();
            }
        } else if (event.type === 'click' && target.matches('button') && !target.disabled) {
            if (target.closest('[data-keep-playback="true"]')) return;
            adapter.stop();
        }
        queueMicrotask(sync);
    }
    return {
        configure(value) {
            adapter = value;
            document.addEventListener('click', control, true);
            document.addEventListener('change', control, true);
            document.addEventListener('keydown', event => {
                if ((event.key === 'Enter' || event.key === ' ') && adapter.busy()
                    && !event.target.closest('.stop-btn-active, .back-link')) {
                    event.preventDefault(); event.stopImmediatePropagation();
                }
            }, true);
            new MutationObserver(sync).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
            window.addEventListener('pagehide', leave);
            window.addEventListener('pageshow', event => {
                if (event.persisted) { leaving = false; sync(); }
            });
            sync();
        },
        // Prefer the named voice, not the third entry in the browser's list.
        isChromeJapanese3(voice) {
            const ua = navigator.userAgent || '';
            return /(?:Chrome|Chromium|CriOS)\//i.test(ua)
                && !/(?:Edg|EdgA|EdgiOS|OPR)\//i.test(ua)
                && !navigator.brave
                && /(?:日本語|Japanese)[\s_-]*3(?![0-9])/i.test(
                    String(voice?.name || '').normalize('NFKC')
                );
        },
        microphoneError,
        RECORDING_DEFAULTS,
        startRecordingSession,
        getActiveRecordingSession,
        sync, getUserMedia, beginModel, cancelModel, valid, endModel, clearModels,
        beginAnalysis, notify,
        registerPitch(state, redraw) { state.redraw = redraw; pitchStates.add(state); },
        invalidatePlayback() {
            ++playbackGeneration;
            playbackStage?.cancel();
            const prevActiveAudio = activeAudio;
            if (activeAudio) {
                stopAudio(activeAudio);
                activeAudio = null;
            }
            if (relay) {
                const old = relay;
                relay = null;
                if (old.audio && old.audio !== prevActiveAudio) {
                    stopAudio(old.audio);
                }
                old.buttons.forEach(({ button, nodes, disabled }) => {
                    button.replaceChildren(...nodes);
                    button.disabled = disabled;
                });
            }
            cancelSpeech();
            window.DrillTooltips?.endAudioAction?.();
        },
        // Ordinary grammar rows: keep both labels throughout a single relay.
        // The toggle is sampled by the recorder, never by this running sequence.
        playRelay({ recordButton, result, speak, url, keepButtons = false }) {
            const tipToken = window.DrillTooltips?.beginAudioAction?.();
            adapter?.stop?.();
            let row = recordButton?.parentElement;
            while (row && ![...row.querySelectorAll('button')].some(
                button => button.dataset.audioRole === 'listen' || button.textContent.trim().startsWith('🔊きく')
            )) row = row.parentElement;
            const listen = [...(row?.querySelectorAll('button') || [])].find(
                button => button.dataset.audioRole === 'listen' || button.textContent.trim().startsWith('🔊きく')
            );
            const own = result?.querySelector?.('.play-recording-btn, .recorded-play-button');
            const current = {
                buttons: keepButtons ? [] : [listen, own].filter(Boolean).map(button => ({
                    button, nodes: [...button.childNodes], disabled: button.disabled
                }))
            };
            relay = current;
            current.buttons.forEach(({ button }) => {
                button.textContent = 'Playing...';
                button.disabled = true;
            });
            const finish = () => {
                window.DrillTooltips?.endAudioAction?.(tipToken);
                if (relay === current) adapter?.stop?.();
            };
            try {
                speak(() => {
                    if (relay !== current || adapter?.busy?.()) return;
                    const source = url();
                    if (!source) { finish(); return; }
                    const audio = current.audio = new Audio(source);
                    audio.playbackRate = 1;
                    audio.onended = finish;
                    audio.onerror = finish;
                    this.play(audio, finish);
                });
            } catch (_) { finish(); }
        },
        guardUtterance(utterance) {
            const stage = startPlaybackStage(20000);
            for (const key of ['onend', 'onerror']) {
                const callback = utterance[key];
                utterance[key] = event => {
                    if (!stage.valid()) return;
                    stage.cancel();
                    if (key === 'onerror') adapter?.stop();
                    else callback?.(event);
                };
            }
        },
        speak(utterance) {
            const tipToken = window.DrillTooltips?.beginAudioAction?.();
            if (activeAudio) {
                stopAudio(activeAudio);
                activeAudio = null;
            }
            cancelSpeech();
            this.guardUtterance(utterance);
            const done = () => window.DrillTooltips?.endAudioAction?.(tipToken);
            const origEnd = utterance.onend;
            const origErr = utterance.onerror;
            utterance.onend = e => { done(); origEnd?.(e); };
            utterance.onerror = e => { done(); origErr?.(e); };
            try { window.speechSynthesis.speak(utterance); }
            catch (error) { done(); utterance.onerror?.(error); }
        },
        play(audio, onError) {
            const tipToken = window.DrillTooltips?.beginAudioAction?.();
            if (activeAudio && activeAudio !== audio) {
                stopAudio(activeAudio);
            }
            activeAudio = audio;
            const started = performance.now();
            const cleanupAudio = () => {
                window.DrillTooltips?.endAudioAction?.(tipToken);
                audio.removeEventListener?.('loadedmetadata', update);
                audio.removeEventListener?.('durationchange', update);
                if (activeAudio === audio) activeAudio = null;
            };
            const update = () => {
                if (!stage.valid()) return;
                const duration = Number(audio.duration);
                const rate = Number(audio.playbackRate) || 1;
                const budget = Number.isFinite(duration) && duration > 0
                    ? duration * 1000 / rate + 3000 : 23000;
                stage.arm(budget - (performance.now() - started));
            };
            const stage = startPlaybackStage(23000, cleanupAudio);
            audio.addEventListener?.('loadedmetadata', update);
            audio.addEventListener?.('durationchange', update);
            update();
            for (const key of ['onended', 'onerror']) {
                const callback = audio[key];
                audio[key] = event => {
                    if (activeAudio === audio) activeAudio = null;
                    if (!stage.valid()) return;
                    stage.cancel();
                    callback?.(event);
                };
            }
            const failed = error => {
                if (activeAudio === audio) activeAudio = null;
                if (!stage.valid()) return;
                stage.cancel();
                onError(error);
            };
            try { Promise.resolve(audio.play()).catch(failed); }
            catch (error) { failed(error); }
        },
        get leaving() { return leaving; }
    };
})();
