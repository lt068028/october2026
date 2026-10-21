// 共通TTS：Supertonic 3 / Hiro・Mina / 速度70％
const ASSETS =
    'https://huggingface.co/Supertone/supertonic-3/resolve/main';
const STORAGE_KEY = 'practice.tts.voice';
const SPEED = 0.7;

let selectedVoice = 'M2';
try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'M2' || saved === 'F1') selectedVoice = saved;
} catch (_) {}

let helper;
let engine;
let loading;
let queue = Promise.resolve();
let serial = 0;
let playback = null;
let statusElement;

const styles = new Map();
const audioCache = new Map();

function message(text) {
    if (statusElement) statusElement.textContent = text;
}

function mount() {
    const row = document.querySelector('.settings-auto-row');
    if (!row || document.getElementById('ttsVoiceControl')) return;

    const control = document.createElement('div');
    control.className = 'control-item';
    control.innerHTML = `
        <span class="mode-label">Voice</span>
        <div id="ttsVoiceControl" class="segmented-control"
            role="group" aria-label="Model voice">
            <button type="button"
                class="segmented-option custom-tip-wrap"
                data-voice="M2">
                Hiro
                <span class="custom-tip-box">
                    Use Hiro for model audio.
                </span>
            </button>
            <button type="button"
                class="segmented-option custom-tip-wrap"
                data-voice="F1">
                Mina
                <span class="custom-tip-box">
                    Use Mina for model audio.
                </span>
            </button>
        </div>
    `;
    row.prepend(control);

    const buttons = control.querySelectorAll('[data-voice]');

    function updateSelection() {
        buttons.forEach(button => {
            const active = button.dataset.voice === selectedVoice;
            button.classList.toggle('is-selected', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            selectedVoice = button.dataset.voice;
            try {
                localStorage.setItem(STORAGE_KEY, selectedVoice);
            } catch (_) {}
            updateSelection();
        });
    });
    updateSelection();

    statusElement = document.createElement('p');
    statusElement.id = 'ttsStatus';
    statusElement.lang = 'en';
    statusElement.setAttribute('role', 'status');
    statusElement.setAttribute('aria-live', 'polite');
    document.querySelector('.main-header').after(statusElement);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
    mount();
}

async function prepare() {
    if (engine) return;
    if (loading) return loading;

    loading = (async () => {
        message(
            'Preparing voices… The first download may take a few minutes. ' +
            'Please keep this page open.'
        );

        const [ort, library] = await Promise.all([
            import(
                'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.webgpu.min.mjs'
            ),
            import(
                'https://cdn.jsdelivr.net/gh/cskwork/supertonic-tts@d62ef527733bf0b692f92c8cb376452a62a1eec7/app/helper.js'
            )
        ]);

        helper = library;
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.proxy = false;
        ort.env.wasm.wasmPaths =
            'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
        helper.configureOrt(ort);

        const progress = () => message(
            'Preparing voices… The first download may take a few minutes. ' +
            'Please keep this page open.'
        );

        if (navigator.gpu) {
            try {
                const loaded = await helper.loadTextToSpeech(
                    ASSETS + '/onnx',
                    {
                        executionProviders: ['webgpu'],
                        graphOptimizationLevel: 'all'
                    },
                    progress
                );
                engine = loaded.textToSpeech;
                return;
            } catch (error) {
                console.warn('WebGPU unavailable; trying WASM.', error);
            }
        }

        const loaded = await helper.loadTextToSpeech(
            ASSETS + '/onnx',
            {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            },
            progress
        );
        engine = loaded.textToSpeech;
    })();

    try {
        await loading;
    } finally {
        loading = null;
    }
}

export function cancel() {
    ++serial;
    if (playback) playback.finish(false);
    message('');
}

async function generate(text, voice, ticket) {
    if (ticket !== serial) return null;

    const key = JSON.stringify([text, voice, SPEED]);
    if (audioCache.has(key)) return audioCache.get(key);

    await prepare();
    if (ticket !== serial) {
        message('');
        return null;
    }

    if (!styles.has(voice)) {
        message('Preparing the selected voice…');
        const style = await helper.loadVoiceStyle(
            [ASSETS + '/voice_styles/' + voice + '.json'],
            false
        );
        styles.set(voice, style);
    }
    if (ticket !== serial) {
        message('');
        return null;
    }

    message('Generating audio…');

    const { wav, duration } = await engine.call(
        text,
        'ja',
        styles.get(voice),
        8,
        SPEED,
        0.3
    );

    const length = Math.floor(engine.sampleRate * duration[0]);
    if (!Number.isFinite(length) || length <= 0) {
        throw new Error('No audio was generated.');
    }

    const buffer = helper.writeWavFile(
        wav.slice(0, length),
        engine.sampleRate
    );
    const url = URL.createObjectURL(
        new Blob([buffer], { type: 'audio/wav' })
    );
    audioCache.set(key, url);

    // ページ内キャッシュの件数を制限する。
    if (audioCache.size > 80) {
        const oldest = audioCache.keys().next().value;
        URL.revokeObjectURL(audioCache.get(oldest));
        audioCache.delete(oldest);
    }

    if (ticket !== serial) {
        message('');
        return null;
    }
    return url;
}

export async function speak(text) {
    cancel();
    const ticket = serial;
    const voice = selectedVoice;

    // 同じモデルで複数の生成処理を同時に走らせない。
    const task = queue.then(() => generate(String(text), voice, ticket));
    queue = task.catch(() => {});

    let url;
    try {
        url = await task;
    } catch (error) {
        if (ticket !== serial) return false;
        message('Audio generation failed: ' + error.message);
        throw error;
    }

    if (!url || ticket !== serial) return false;

    message('Playing model audio…');

    return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        let finished = false;

        const item = {
            finish(success, error) {
                if (finished) return;
                finished = true;
                audio.onended = null;
                audio.onerror = null;
                audio.pause();
                if (playback === item) playback = null;

                if (error) {
                    message(
                        'Audio playback failed. Please press Listen again. ' +
                        error.message
                    );
                    reject(error);
                } else {
                    if (ticket === serial) message('');
                    resolve(success);
                }
            }
        };

        playback = item;
        audio.playbackRate = 1;
        audio.onended = () => item.finish(true);
        audio.onerror = () =>
            item.finish(false, new Error('Unable to play model audio.'));
        audio.play().catch(error => item.finish(false, error));
    });
}

window.addEventListener('pagehide', cancel);
