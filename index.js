// Index専用：TTS・録音・再生・音声認識の切り分け
(() => {
    'use strict';

    function init() {
        const host = document.querySelector('.menu-container');
        if (!host || document.getElementById('indexAudioTest')) return;

        const panel = document.createElement('section');
        panel.id = 'indexAudioTest';
        panel.className = 'audio-test';
        panel.setAttribute('aria-labelledby', 'audioTestTitle');

        panel.innerHTML = `
            <h2 id="audioTestTitle">音声テスト</h2>
            <p class="audio-test-instruction">
                🎙️とるを押して「テストです」と話し、⏹️で停止する。
            </p>
            <div class="audio-test-row">
                <span class="audio-test-model">テストです。</span>
                <button id="audioTestListen"
                    class="example-button" type="button">🔊きく</button>
                <button id="audioTestRecord"
                    class="example-button" type="button">🎙️とる</button>
                <button id="audioTestStop"
                    class="example-button" type="button" disabled>⏹️</button>
                <button id="audioTestPlay"
                    class="example-button" type="button" disabled>▶️</button>
                <span id="audioTestTranscript"
                    class="audio-test-transcript">抽出文：未実施</span>
            </div>
            <p id="audioTestStatus" class="audio-test-status"
                role="status" aria-live="polite"></p>
        `;

        host.append(panel);

        const $ = id => document.getElementById(id);
        const listen = $('audioTestListen');
        const record = $('audioTestRecord');
        const stop = $('audioTestStop');
        const play = $('audioTestPlay');
        const transcript = $('audioTestTranscript');
        const status = $('audioTestStatus');
        const synth = window.speechSynthesis;

        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        const messages = {
            TTS: '未実施',
            録音: '未実施',
            再生: '未実施',
            認識: '未実施'
        };

        let run = null;
        let utterance = null;
        let ttsTimer = null;
        let audio = null;
        let audioUrl = '';

        listen.setAttribute(
            'aria-label',
            'テストです、を読み上げる'
        );
        stop.setAttribute('aria-label', '録音停止');
        play.setAttribute('aria-label', '録音した声を再生する');

        function show(kind, message) {
            messages[kind] = message;
            status.textContent = Object.entries(messages)
                .map(([key, value]) => key + '：' + value)
                .join(' ｜ ');
        }

        function sync() {
            const busy = Boolean(run || utterance || audio);

            listen.disabled = busy || !synth;

            record.disabled =
                busy ||
                !window.isSecureContext ||
                !navigator.mediaDevices?.getUserMedia ||
                !window.MediaRecorder;

            play.disabled = busy || !audioUrl;
            stop.disabled = !run || run.stopping;

            stop.classList.toggle(
                'stop-btn-active',
                Boolean(run && !run.stopping)
            );
        }

        function releaseTracks(s) {
            s.stream?.getTracks().forEach(track => track.stop());
        }

        function finish(s) {
            if (
                run !== s ||
                !s.recordDone ||
                !s.recognitionDone
            ) return;

            clearTimeout(s.limit);
            clearTimeout(s.recognitionTimer);
            clearTimeout(s.recorderTimer);
            releaseTracks(s);
            run = null;

            if (!s.text) {
                transcript.textContent =
                    '抽出文：文字を取得できなかった';
            }

            sync();
        }

        function stopRun() {
            const s = run;
            if (!s || s.stopping) return;

            s.stopping = true;
            clearTimeout(s.limit);

            if (s.recognition && !s.recognitionDone) {
                try {
                    s.recognition.stop();
                } catch (error) {
                    s.recognitionDone = true;
                }
            } else if (!s.recognition) {
                s.recognitionDone = true;
            }

            s.recognitionTimer = setTimeout(() => {
                if (run !== s || s.recognitionDone) return;

                s.recognitionDone = true;

                try {
                    s.recognition?.abort();
                } catch (error) {}

                show(
                    '認識',
                    '終了応答なし。録音の保存とは別に扱う'
                );
                finish(s);
            }, 2500);

            if (
                s.recorder?.state === 'recording' ||
                s.recorder?.state === 'paused'
            ) {
                try {
                    s.recorder.stop();
                } catch (error) {
                    s.recordDone = true;
                    show('録音', '停止失敗：' + error.name);
                }
            } else {
                s.recordDone = true;
            }

            s.recorderTimer = setTimeout(() => {
                if (run !== s || s.recordDone) return;

                s.recordDone = true;
                show(
                    '録音',
                    '停止完了の応答なし。保存を確認できない'
                );
                finish(s);
            }, 6000);

            sync();
            finish(s);
        }

        record.addEventListener('click', async () => {
            if (record.disabled) return;

            const s = {
                stopping: false,
                stream: null,
                recorder: null,
                recognition: null,
                recordDone: false,
                recognitionDone: !Recognition,
                chunks: [],
                text: ''
            };

            run = s;
            transcript.textContent = '抽出文：認識待ち';
            show('録音', 'マイク準備中');

            show(
                '認識',
                Recognition ? '準備中' : 'このブラウザでは非対応'
            );

            sync();

            try {
                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                if (run !== s || s.stopping) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                s.stream = stream;

                const recorder = new MediaRecorder(stream);
                s.recorder = recorder;

                recorder.ondataavailable = event => {
                    if (event.data?.size > 0) {
                        s.chunks.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    if (run !== s) return;

                    // 無音・認識失敗でも、取得した録音データを保存する。
                    if (s.chunks.length) {
                        try {
                            const type =
                                recorder.mimeType ||
                                s.chunks[0].type;

                            const blob = new Blob(
                                s.chunks,
                                type ? { type } : undefined
                            );

                            const nextUrl = URL.createObjectURL(blob);

                            if (audioUrl) {
                                URL.revokeObjectURL(audioUrl);
                            }

                            audioUrl = nextUrl;

                            show(
                                '録音',
                                '保存完了（' + blob.size + ' bytes）'
                            );
                        } catch (error) {
                            show(
                                '録音',
                                '保存失敗：' + error.name
                            );
                        }
                    } else {
                        show(
                            '録音',
                            'データが0件。音声を保存できない'
                        );
                    }

                    s.chunks = [];
                    s.recordDone = true;
                    releaseTracks(s);
                    finish(s);
                };

                recorder.onerror = event => {
                    show(
                        '録音',
                        'エラー：' +
                        (event.error?.name || 'unknown')
                    );
                    stopRun();
                };

                recorder.start();

                show(
                    '録音',
                    '録音中。手動停止／20秒上限'
                );

                s.limit = setTimeout(stopRun, 20000);

                if (Recognition) {
                    try {
                        const recognition = new Recognition();
                        s.recognition = recognition;

                        recognition.lang = 'ja-JP';
                        recognition.continuous = false;
                        recognition.interimResults = true;

                        recognition.onstart = () => {
                            if (run === s) {
                                show('認識', '受付中（日本語）');
                            }
                        };

                        recognition.onresult = event => {
                            if (run !== s) return;

                            s.text = Array.from(event.results)
                                .map(result => result[0].transcript)
                                .join('');

                            transcript.textContent =
                                '抽出文：' + s.text;

                            show('認識', '文字を取得した');
                        };

                        recognition.onerror = event => {
                            if (run !== s) return;

                            s.recognitionError = true;
                            s.recognitionDone = true;

                            show(
                                '認識',
                                'エラー：' + event.error
                            );

                            // 認識エラーを理由に、録音は破棄しない。
                            finish(s);
                        };

                        recognition.onend = () => {
                            if (run !== s) return;

                            s.recognitionDone = true;

                            if (!s.recognitionError) {
                                show(
                                    '認識',
                                    s.text
                                        ? '完了'
                                        : '終了したが文字なし'
                                );
                            }

                            finish(s);
                        };

                        recognition.start();
                    } catch (error) {
                        s.recognitionDone = true;

                        show(
                            '認識',
                            '開始失敗：' + error.name
                        );
                    }
                }

                sync();
            } catch (error) {
                if (run !== s) return;

                show('録音', '開始失敗：' + error.name);
                s.recognitionDone = true;
                stopRun();
            }
        });

        stop.addEventListener('click', stopRun);

        listen.addEventListener('click', () => {
            if (listen.disabled) return;

            const u = new SpeechSynthesisUtterance('テストです。');
            u.lang = 'ja-JP';
            u.rate = 0.9;

            const voices = synth.getVoices();
            const japanese = voices.filter(v =>
                /^ja(?:[-_]|$)/i.test(v.lang)
            );

            const voice = [
                'chrome os', 'keita', 'nanami', 'google'
            ].map(name =>
                japanese.find(v =>
                    v.name.toLowerCase().includes(name)
                )
            ).find(Boolean) || japanese[0];

            if (voice) u.voice = voice;

            utterance = u;
            show('TTS', '再生要求中');
            sync();

            const end = message => {
                if (utterance !== u) return;

                clearTimeout(ttsTimer);
                utterance = null;
                show('TTS', message);
                sync();
            };

            u.onstart = () => {
                if (utterance !== u) return;

                clearTimeout(ttsTimer);

                show(
                    'TTS',
                    '再生開始（' +
                    (voice?.name || '端末の日本語音声') +
                    '）'
                );

                ttsTimer = setTimeout(() => {
                    end('終了応答なし');
                    synth.cancel();
                }, 20000);
            };

            u.onend = () => end('再生完了');

            u.onerror = event => {
                end('エラー：' + event.error);
            };

            try {
                synth.cancel();
                if (synth.paused) synth.resume();

                ttsTimer = setTimeout(() => {
                    end(
                        '再生開始を確認できない。端末の日本語TTS設定を確認'
                    );
                    synth.cancel();
                }, 10000);

                synth.speak(u);
            } catch (error) {
                end('開始失敗：' + error.name);
            }
        });

        play.addEventListener('click', () => {
            if (play.disabled) return;

            const player = new Audio(audioUrl);
            audio = player;

            const end = message => {
                if (audio !== player) return;

                audio = null;
                show('再生', message);
                sync();
            };

            player.playbackRate = 1;

            player.onplaying = () => {
                show('再生', '再生中');
            };

            player.onended = () => end('再生完了');

            player.onerror = () => {
                end(
                    'エラー：' +
                    (player.error?.code || 'unknown')
                );
            };

            show('再生', '再生要求中');
            sync();

            try {
                const pending = player.play();

                pending?.catch(error => {
                    end('開始失敗：' + error.name);
                });
            } catch (error) {
                end('開始失敗：' + error.name);
            }
        });

        if (!synth) {
            show('TTS', 'このブラウザでは非対応');
        }

        if (!window.isSecureContext) {
            show('録音', 'HTTPSで開く必要がある');
        } else if (
            !navigator.mediaDevices?.getUserMedia ||
            !window.MediaRecorder
        ) {
            show('録音', 'このブラウザでは非対応');
        }

        if (!Recognition) {
            show('認識', 'このブラウザでは非対応');
        }

        show('再生', '未実施');
        sync();

        window.addEventListener('pagehide', () => {
            if (run) {
                const s = run;
                run = null;

                clearTimeout(s.limit);
                clearTimeout(s.recognitionTimer);
                clearTimeout(s.recorderTimer);

                try {
                    s.recognition?.abort();
                } catch (error) {}

                try {
                    if (s.recorder?.state === 'recording') {
                        s.recorder.stop();
                    }
                } catch (error) {}

                releaseTracks(s);
            }

            clearTimeout(ttsTimer);
            utterance = null;
            synth?.cancel();
            audio?.pause();
            audio = null;
            sync();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            { once: true }
        );
    } else {
        init();
    }
})();
