// Index専用：Supertonic 3・日本語・速度70％
(() => {
    'use strict';

    function mountSupertonicTest() {
        const host = document.querySelector('.menu-container');
        if (!host || document.getElementById('supertonicTest')) return;

        const sentence =
            'いいえ、映画をみていません。うんんん、見てないよ';

        const panel = document.createElement('section');
        panel.id = 'supertonicTest';
        panel.innerHTML = `
            <h2>Supertonic 3 音声テスト</h2>
            <p>速度70％。初回はモデルの読み込みを待つ。</p>
            <p data-output="sentence"></p>
            <div>
                <label>
                    声：
                    <select aria-label="テストする声">
                        <option value="F1">Mina（F1）</option>
                        <option value="F2">Sora（F2）</option>
                        <option value="F3">Yuna（F3）</option>
                        <option value="M1">Aiden（M1）</option>
                        <option value="M2">Hiro（M2）</option>
                        <option value="M3">Leo（M3）</option>
                    </select>
                </label>
                <button type="button" class="example-button"
                    data-action="generate">🔊生成して聞く</button>
                <button type="button" class="example-button"
                    data-action="replay" disabled>▶️もう一度</button>
                <button type="button" class="example-button"
                    data-action="stop" disabled>⏹️停止</button>
            </div>
            <p data-output="status" role="status" aria-live="polite">
                未実施。生成ボタンを押すとモデルを読み込む。
            </p>
        `;
        host.append(panel);

        panel.querySelector('[data-output="sentence"]').textContent =
            sentence;

        const voice = panel.querySelector('select');
        const generate = panel.querySelector('[data-action="generate"]');
        const replay = panel.querySelector('[data-action="replay"]');
        const stop = panel.querySelector('[data-action="stop"]');
        const status = panel.querySelector('[data-output="status"]');

        const assets =
            'https://huggingface.co/Supertone/supertonic-3/resolve/main';

        let helper = null;
        let tts = null;
        let backend = '';
        let busy = false;
        let player = null;

        const styles = new Map();
        const outputs = new Map();

        function stopAudio() {
            if (player) {
                player.pause();
                player.currentTime = 0;
                player = null;
            }
            stop.disabled = true;
        }

        function sync() {
            voice.disabled = busy;
            generate.disabled = busy;
            replay.disabled = busy || !outputs.has(voice.value);
        }

        async function playUrl(url) {
            stopAudio();
            const current = new Audio(url);
            player = current;
            current.playbackRate = 1;
            stop.disabled = false;

            current.onended = () => {
                if (player === current) {
                    player = null;
                    stop.disabled = true;
                }
            };

            current.onerror = () => {
                if (player === current) {
                    stopAudio();
                    status.textContent =
                        '音声の読み込みに失敗した。再生成して確認する。';
                }
            };

            try {
                await current.play();
            } catch (error) {
                if (player === current) {
                    stopAudio();
                    status.textContent =
                        '自動再生できなかった。▶️もう一度を押す。' +
                        '（' + error.message + '）';
                }
            }
        }

        async function prepare() {
            if (tts) return;

            status.textContent = '音声生成ライブラリを読み込み中…';

            const [ort, library] = await Promise.all([
                import(
                    'https://cdn.jsdelivr.net/gh/cskwork/supertonic-tts@main/app/helper.js'                ),
                import(
                    'https://cdn.jsdelivr.net/npm/supertonic-tts@0.1.0/app/helper.js'
                )
            ]);

            helper = library;
            ort.env.wasm.numThreads = 1;
            ort.env.wasm.proxy = false;
            ort.env.wasm.wasmPaths =
                'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';

            helper.configureOrt(ort);

            const onProgress = (name, current, total) => {
                status.textContent =
                    `モデル読込中 ${current}/${total}：${name}` +
                    '。初回は時間がかかる。';
            };

            if (navigator.gpu) {
                try {
                    const loaded = await helper.loadTextToSpeech(
                        assets + '/onnx',
                        {
                            executionProviders: ['webgpu'],
                            graphOptimizationLevel: 'all'
                        },
                        onProgress
                    );
                    tts = loaded.textToSpeech;
                    backend = 'WebGPU';
                    return;
                } catch (error) {
                    console.warn('WebGPU初期化失敗。WASMで再試行。', error);
                }
            }

            status.textContent = 'CPU用の実行環境でモデルを読み込み中…';

            const loaded = await helper.loadTextToSpeech(
                assets + '/onnx',
                {
                    executionProviders: ['wasm'],
                    graphOptimizationLevel: 'all'
                },
                onProgress
            );
            tts = loaded.textToSpeech;
            backend = 'WASM';
        }

        generate.onclick = async () => {
            if (busy) return;
            const selected = voice.value;
            const label = voice.selectedOptions[0].textContent;

            stopAudio();

            if (outputs.has(selected)) {
                status.textContent =
                    label + '・速度70％：生成済み音声を再生する。';
                await playUrl(outputs.get(selected));
                return;
            }

            busy = true;
            sync();

            try {
                await prepare();

                if (!styles.has(selected)) {
                    status.textContent = label + 'の声を読み込み中…';
                    const style = await helper.loadVoiceStyle(
                        [assets + '/voice_styles/' + selected + '.json'],
                        false
                    );
                    styles.set(selected, style);
                }

                const started = performance.now();
                status.textContent = label + '・速度70％で生成中…';

                const { wav, duration } = await tts.call(
                    sentence,
                    'ja',
                    styles.get(selected),
                    8,
                    0.7,
                    0.3,
                    (step, total) => {
                        status.textContent =
                            `${label}・生成中 ${step}/${total}`;
                    }
                );

                const length = Math.floor(tts.sampleRate * duration[0]);
                if (!Number.isFinite(length) || length <= 0) {
                    throw new Error('有効な音声が生成されなかった');
                }

                const buffer = helper.writeWavFile(
                    wav.slice(0, length),
                    tts.sampleRate
                );
                const url = URL.createObjectURL(
                    new Blob([buffer], { type: 'audio/wav' })
                );
                outputs.set(selected, url);

                const seconds =
                    ((performance.now() - started) / 1000).toFixed(1);

                status.textContent =
                    `${label}・速度70％・生成${seconds}秒（${backend}）`;
                await playUrl(url);
            } catch (error) {
                status.textContent =
                    '生成失敗：' + (error.message || String(error));
            } finally {
                busy = false;
                sync();
            }
        };

        replay.onclick = async () => {
            const url = outputs.get(voice.value);
            if (url && !busy) await playUrl(url);
        };

        stop.onclick = stopAudio;

        voice.onchange = () => {
            stopAudio();
            sync();
            status.textContent =
                voice.selectedOptions[0].textContent + 'を選択した。';
        };

        window.addEventListener('pagehide', stopAudio);
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            mountSupertonicTest,
            { once: true }
        );
    } else {
        mountSupertonicTest();
    }
})();
// モバイル環境向けの共通案内
(() => {
    'use strict';

    function showMobileNotice() {
        const ua = navigator.userAgent || '';

        const isMobile =
            navigator.userAgentData?.mobile === true ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
            (
                /Macintosh/i.test(ua) &&
                navigator.maxTouchPoints > 1
            );

        if (!isMobile || document.getElementById('mobileSupportNotice')) {
            return;
        }

        const notice = document.createElement('aside');
        notice.id = 'mobileSupportNotice';
        notice.className = 'info-panel';
        notice.lang = 'en';
        notice.setAttribute('aria-label', 'Mobile support notice');

        const title = document.createElement('span');
        title.className = 'info-panel-title';
        title.textContent = 'Mobile support';

        const description = document.createElement('span');
        description.className = 'info-panel-desc';
        description.textContent =
            'Speech recognition and answer checking are not currently ' +
            'supported on mobile. Please use a computer for these features.';

        notice.append(title, description);

        const menu = document.querySelector('.menu-container');
        const header = document.querySelector('.main-header');

        if (menu) {
            const navigation = menu.querySelector('nav');
            if (navigation) {
                navigation.before(notice);
            } else {
                menu.prepend(notice);
            }
        } else if (header) {
            header.after(notice);
        } else {
            document.body.prepend(notice);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            showMobileNotice,
            { once: true }
        );
    } else {
        showMobileNotice();
    }
})();
