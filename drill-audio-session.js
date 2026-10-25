// Shared lifecycle only; synthesis, recording and answer checking stay in each page.
window.DrillAudio = (() => {
    let adapter;
    let leaving = false;
    let model = null;
    let generation = 0;
    let playbackGeneration = 0;
    let requestGeneration = 0;
    const streams = new Set();
    const pitchStates = new Set();
    const locks = new Map();
    const nativeGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    const settings = '.compact-settings button, .compact-settings input, #voiceSelect, #voiceDropdownBtn';
    const voice = '#voiceSelect, #voiceDropdown';

    function sync() {
        if (!adapter) return;
        const recording = adapter.busy();
        const blocked = recording || Boolean(model);
        for (const el of document.querySelectorAll(recording
            ? 'button, input, select, textarea'
            : settings)) {
            if (recording && el.classList.contains('stop-btn-active')) continue;
            if (blocked) {
                if (!locks.has(el)) locks.set(el, el.disabled);
                if (!el.disabled) el.disabled = true;
            }
        }
        if (!blocked) {
            for (const [el, disabled] of locks) {
                if (el.isConnected && el.disabled !== disabled) el.disabled = disabled;
            }
            locks.clear();
            adapter.sync?.();
        }
        if (blocked) {
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
        if (old.recorder) {
            old.recorder.onstop = null;
            old.recorder.ondataavailable = null;
            if (old.recorder.state !== 'inactive') {
                try { old.recorder.stop(); } catch (_) {}
            }
        }
        old.stream?.getTracks().forEach(track => track.stop());
        if (old.context && old.context.state !== 'closed') old.context.close().catch(() => {});
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
        token.stream?.getTracks().forEach(track => track.stop());
        sync();
    }

    async function getUserMedia(options) {
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
        adapter?.cancel();
        adapter?.stop();
        cancelModel();
        streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        streams.clear();
    }
    function control(event) {
        if (!adapter) return;
        const target = event.target.closest('button, input, select, textarea, a, summary, [role="option"]');
        if (!target) return;
        if (target.matches('a.back-link')) { leave(); return; }
        if (adapter.busy() && !target.classList.contains('stop-btn-active')) {
            event.preventDefault(); event.stopImmediatePropagation(); return;
        }
        const setting = target.closest('.compact-settings, #voiceDropdown, #voiceSelect');
        if (model && setting) {
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
            new MutationObserver(() => {
                if (adapter.busy() || model || locks.size) sync();
            }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
            window.addEventListener('pagehide', leave);
            window.addEventListener('pageshow', event => {
                if (event.persisted) { leaving = false; sync(); }
            });
            sync();
        },
        sync, getUserMedia, beginModel, cancelModel, valid, endModel, clearModels,
        invalidatePlayback() { ++playbackGeneration; },
        guardUtterance(utterance) {
            const ticket = playbackGeneration;
            let finished = false;
            for (const key of ['onend', 'onerror']) {
                const callback = utterance[key];
                utterance[key] = event => {
                    if (!leaving && !finished && ticket === playbackGeneration) {
                        finished = true;
                        callback?.(event);
                    }
                };
            }
        },
        registerPitch(state, redraw) { state.redraw = redraw; pitchStates.add(state); },
        play(audio, onError) {
            const ticket = playbackGeneration;
            for (const key of ['onended', 'onerror']) {
                const callback = audio[key];
                audio[key] = event => {
                    if (!leaving && ticket === playbackGeneration) callback?.(event);
                };
            }
            audio.play().catch(error => {
                if (!leaving && ticket === playbackGeneration) onError(error);
            });
        },
        get leaving() { return leaving; }
    };
})();
