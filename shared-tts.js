// 共通TTS：通常速度で生成・50％で再生・句点間に0.5秒
const ASSETS =
    'https://huggingface.co/Supertone/supertonic-3/resolve/main';

const STORAGE_KEY = 'practice.tts.voice';
const GENERATION_SPEED = 1.0;
const PLAYBACK_RATE = 0.7;
const GAP_MS = 500;

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
let pauseBetween = null;
let statusElement;

const styles = new Map();
const audioCache = new Map();

function message(text, state = '') {
    if (!statusElement) return;

    // 表示する速度・待機時間を、実際の設定値に合わせる。
    if (text.startsWith('Playing model audio at ')) {
        text =
            `Playing model audio at ${Math.round(PLAYBACK_RATE * 100)}% speed…`;
    } else if (text.startsWith('Next word in ')) {
        text = `Next word in ${GAP_MS / 1000} seconds…`;
    }

    statusElement.replaceChildren();
    statusElement.hidden = !text;
    statusElement.classList.toggle('is-busy', state === 'busy');
    statusElement.classList.toggle('is-error', state === 'error');

    if (!text) return;

    if (text.startsWith('Preparing voices…')) {
        const content = document.createElement('span');
        const heading = document.createElement('strong');

        heading.textContent = 'Preparing voices…';

        content.append(
            heading,
            document.createElement('br'),
            document.createTextNode(
                'The first download may take a few minutes. ' +
                'Please keep this page open.'
            )
        );

        statusElement.append(content);
    } else {
        statusElement.textContent = text;
    }
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
    statusElement.hidden = true;
    statusElement.setAttribute('role', 'status');
    statusElement.setAttribute('aria-live', 'polite');
    statusElement.setAttribute('aria-atomic', 'true');
    document.querySelector('.main-header').after(statusElement);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
    mount();
}

async function prepare(ticket) {
    if (engine) return;
    if (loading) return loading;

    const progress = () => {
        if (ticket !== serial) return;
        message(
            'Preparing voices… The first download may take a few minutes. ' +
            'Please keep this page open.',
            'busy'
        );
    };

    loading = (async () => {
        progress();

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
    if (pauseBetween) pauseBetween.finish(false);

    // 呼び出し側の終了処理でエラー表示を消さない。
    if (!statusElement?.classList.contains('is-error')) {
        message('');
    }
}

async function generate(text, voice, ticket) {
    if (ticket !== serial) return null;

    const key = JSON.stringify([text, voice, GENERATION_SPEED]);
    if (audioCache.has(key)) return audioCache.get(key);

    await prepare(ticket);
    if (ticket !== serial) return null;

    if (!styles.has(voice)) {
        message('Preparing the selected voice…', 'busy');

        const style = await helper.loadVoiceStyle(
            [ASSETS + '/voice_styles/' + voice + '.json'],
            false
        );
        styles.set(voice, style);
    }

    if (ticket !== serial) return null;

    message('Generating audio… Please wait.', 'busy');

    const { wav, duration } = await engine.call(
        text,
        'ja',
        styles.get(voice),
        8,
        GENERATION_SPEED,
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

    // Blobを保持し、再生時にだけURLを作成する。
    const blob = new Blob([buffer], { type: 'audio/wav' });
    audioCache.set(key, blob);

    if (audioCache.size > 80) {
        audioCache.delete(audioCache.keys().next().value);
    }

    return ticket === serial ? blob : null;
}

function playClip(blob, ticket) {
    if (ticket !== serial) return Promise.resolve(false);

    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        let finished = false;

        const item = {
            finish(success, error) {
                if (finished) return;
                finished = true;

                audio.onended = null;
                audio.onerror = null;
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                URL.revokeObjectURL(url);

                if (playback === item) playback = null;

                if (error) reject(error);
                else resolve(success);
            }
        };

        playback = item;

        audio.defaultPlaybackRate = PLAYBACK_RATE;
        audio.playbackRate = PLAYBACK_RATE;
        audio.preservesPitch = true;

        if ('webkitPreservesPitch' in audio) {
            audio.webkitPreservesPitch = true;
        }

        audio.onended = () => item.finish(true);
        audio.onerror = () => item.finish(
            false,
            new Error('Unable to play model audio.')
        );

        audio.play().catch(error => item.finish(false, error));
    });
}

function waitBetweenClips(ticket) {
    if (ticket !== serial) return Promise.resolve(false);

    return new Promise(resolve => {
        let finished = false;
        let timer;

        const item = {
            finish(success) {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                if (pauseBetween === item) pauseBetween = null;
                resolve(success);
            }
        };

        pauseBetween = item;
        timer = setTimeout(
            () => item.finish(ticket === serial),
            GAP_MS
        );
    });
}

export async function speak(text) {
    cancel();
    message('');

    const ticket = serial;
    const voice = selectedVoice;

    // 「箸。橋。」→「箸。」「橋。」
    // 読点「、」では分割しない。
    const parts = (String(text).match(/[^。]+。?/g) || [])
        .map(part => part.trim())
        .filter(Boolean);

    if (!parts.length) return false;

    message('Preparing model audio… Please wait.', 'busy');

    // 全語を先に生成し、再生途中に生成待ちが入らないようにする。
    const task = queue.then(async () => {
        const clips = [];

        for (const part of parts) {
            if (ticket !== serial) return null;
            const blob = await generate(part, voice, ticket);
            if (!blob) return null;
            clips.push(blob);
        }

        return clips;
    });

    queue = task.catch(() => {});

    let stage = 'generation';

    try {
        const clips = await task;
        if (!clips || ticket !== serial) return false;

        stage = 'playback';

        for (let index = 0; index < clips.length; index++) {
            if (ticket !== serial) return false;

            message('');

            const completed = await playClip(clips[index], ticket);
            if (!completed || ticket !== serial) return false;

            if (index < clips.length - 1) {
                message('Next word in 1 second…');
                const continued = await waitBetweenClips(ticket);
                if (!continued) return false;
            }
        }

        if (ticket === serial) message('');
        return true;
    } catch (error) {
        if (ticket !== serial) return false;

        message(
            'Audio ' + stage + ' failed. Please press Listen again. ' +
            (error.message || String(error)),
            'error'
        );
        throw error;
    }
}

window.addEventListener('pagehide', cancel);
