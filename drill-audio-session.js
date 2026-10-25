// Shared lifecycle only; synthesis, recording and answer checking stay in each page.
window.DrillAudio = (() => {
    let adapter;
    let leaving = false;
    let model = null;
    let relay = null;
    let generation = 0;
    let playbackGeneration = 0;
    let requestGeneration = 0;
    const streams = new Set();
    const pitchStates = new Set();
    const locks = new Set();
    const analyses = new Map();
    let playbackStage = null;
    const nativeGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    const settings = '.compact-settings button, .compact-settings input, #voiceSelect, #voiceDropdownBtn';
    const voice = '#voiceSelect, #voiceDropdown';

    function isAudioButton(el) {
        return el.matches('button') && (
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
        // Existing pages sometimes set an inline !important pointer cursor.
        // Derive prohibition from the current state instead of preserving it.
        for (const el of document.querySelectorAll('button, input, select, textarea')) {
            if (el.disabled) el.style.setProperty('cursor', 'not-allowed', 'important');
            else if (el.style.cursor === 'not-allowed') el.style.removeProperty('cursor');
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

    async function getUserMedia(options) {
        clearNotice();
        if (leaving) throw new DOMException('Page left', 'AbortError');
        const request = requestGeneration;
        const stream = await nativeGetUserMedia(options);
        if (leaving || request !== requestGeneration) {
            stream.getTracks().forEach(track => track.stop());
            throw new DOMException('Page left', 'AbortError');
        }
        for (const previous of streams) {
            if (previous.getTracks().every(track => track.readyState === 'ended')) streams.delete(previous);
        }
        streams.add(stream);
        stream.getTracks().forEach(track => track.addEventListener?.('ended', () => {
            if (stream.getTracks().every(t => t.readyState === 'ended')) streams.delete(stream);
        }, { once: true }));
        return stream;
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
    function leave() {
        if (leaving) return;
        leaving = true;
        ++requestGeneration;
        for (const state of analyses.keys()) cancelAnalysis(state);
        adapter?.cancel();
        adapter?.stop();
        cancelModel();
        streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        streams.clear();
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
        sync, getUserMedia, beginModel, cancelModel, valid, endModel, clearModels,
        beginAnalysis, notify,
        registerPitch(state, redraw) { state.redraw = redraw; pitchStates.add(state); },
        invalidatePlayback() {
            ++playbackGeneration;
            playbackStage?.cancel();
            if (relay) {
                const old = relay;
                relay = null;
                old.audio?.pause();
                old.buttons.forEach(({ button, nodes, disabled }) => {
                    button.replaceChildren(...nodes);
                    button.disabled = disabled;
                });
            }
        },
        // Ordinary grammar rows: keep both labels throughout a single relay.
        // The toggle is sampled by the recorder, never by this running sequence.
        playRelay({ recordButton, result, speak, url }) {
            adapter.stop();
            let row = recordButton.parentElement;
            while (row && ![...row.querySelectorAll('button')].some(
                button => button.textContent.trim().startsWith('🔊きく')
            )) row = row.parentElement;
            const listen = [...(row?.querySelectorAll('button') || [])].find(
                button => button.textContent.trim().startsWith('🔊きく')
            );
            const own = result.querySelector('.play-recording-btn, .recorded-play-button');
            const current = { buttons: [listen, own].filter(Boolean).map(button => ({
                button, nodes: [...button.childNodes], disabled: button.disabled
            })) };
            relay = current;
            current.buttons.forEach(({ button }) => {
                button.textContent = 'Playing...';
                button.disabled = true;
            });
            const finish = () => { if (relay === current) adapter.stop(); };
            try {
                speak(() => {
                    if (relay !== current || adapter.busy()) return;
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
            this.guardUtterance(utterance);
            try { window.speechSynthesis.speak(utterance); }
            catch (error) { utterance.onerror?.(error); }
        },
        play(audio, onError) {
            const started = performance.now();
            const update = () => {
                if (!stage.valid()) return;
                const duration = Number(audio.duration);
                const rate = Number(audio.playbackRate) || 1;
                const budget = Number.isFinite(duration) && duration > 0
                    ? duration * 1000 / rate + 3000 : 23000;
                stage.arm(budget - (performance.now() - started));
            };
            const stage = startPlaybackStage(23000, () => {
                audio.removeEventListener?.('loadedmetadata', update);
                audio.removeEventListener?.('durationchange', update);
            });
            audio.addEventListener?.('loadedmetadata', update);
            audio.addEventListener?.('durationchange', update);
            update();
            for (const key of ['onended', 'onerror']) {
                const callback = audio[key];
                audio[key] = event => {
                    if (!stage.valid()) return;
                    stage.cancel();
                    callback?.(event);
                };
            }
            const failed = error => {
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
