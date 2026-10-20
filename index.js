// A方式：音声トラックを認識APIへ渡せるかを確認する。
(() => {
    'use strict';

    function mount() {
        const panel = document.getElementById('indexAudioTest');

        if (!panel) {
            mount.waitCount = (mount.waitCount || 0) + 1;

            if (mount.waitCount <= 30) {
                setTimeout(mount, 100);
            }

            return;
        }

        if (document.getElementById('sharedInputCheck')) return;
        const row = document.createElement('div');
        const button = document.createElement('button');
        const result = document.createElement('span');

        button.id = 'sharedInputCheck';
        button.type = 'button';
        button.className = 'example-button';
        button.textContent = '🔗共有入力確認';

        result.setAttribute('role', 'status');
        result.setAttribute('aria-live', 'polite');
        result.textContent = '未実施。発話は不要。';

        row.append(button, document.createTextNode(' '), result);
        panel.append(row);

        button.addEventListener('click', async () => {
            if (button.disabled) return;

            const recordButton =
                document.getElementById('audioTestRecord');

            if (recordButton?.disabled) {
                result.textContent =
                    '現在の録音・認識・再生が終了してから押す。';
                return;
            }

            const Recognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;

            if (
                !Recognition ||
                !navigator.mediaDevices?.getUserMedia
            ) {
                result.textContent =
                    '必要な音声APIが、このブラウザでは利用できない。';
                return;
            }

            const savedButtons = Array.from(
                panel.querySelectorAll('button')
            ).map(element => ({
                element,
                disabled: element.disabled
            }));

            savedButtons.forEach(({ element }) => {
                element.disabled = true;
            });

            let stream = null;
            let probe = null;
            let testTrack = null;

            result.textContent = '共有入力APIを確認中…';

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

                const track = stream.getAudioTracks()[0];

                if (!track) {
                    throw new Error('音声トラックを取得できない');
                }

                // 元のマイク入力を止めず、検査用の複製だけを停止する。
                testTrack = track.clone();
                testTrack.stop();

                probe = new Recognition();
                probe.lang = 'ja-JP';
                probe.onerror = () => {};

                try {
                    // 対応実装なら、停止済みトラックを拒否する。
                    probe.start(testTrack);

                    result.textContent =
                        '共有入力への対応を確認できない。' +
                        '音声トラックの引数が無視された可能性がある。';
                } catch (error) {
                    if (error.name === 'InvalidStateError') {
                        result.textContent =
                            '音声トラックを検査する実装を確認した。' +
                            '次に、同じ入力で録音と認識が両立するかを試せる。';
                    } else if (error.name === 'NotSupportedError') {
                        result.textContent =
                            '共有入力は未対応（NotSupportedError）。';
                    } else {
                        result.textContent =
                            '共有入力の判定不可：' +
                            error.name + ' / ' + error.message;
                    }
                }
            } catch (error) {
                result.textContent =
                    '確認に失敗：' +
                    error.name + ' / ' + error.message;
            } finally {
                try {
                    probe?.abort();
                } catch (error) {}

                testTrack?.stop();
                stream?.getTracks().forEach(track => track.stop());

                savedButtons.forEach(({ element, disabled }) => {
                    element.disabled = disabled;
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            () => queueMicrotask(mount),
            { once: true }
        );
    } else {
        queueMicrotask(mount);
    }
})();
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

        record.addEventListener('click', () => {
            if (record.disabled) return;

            const s = {
                stopping: false,
                stream: null,
                recorder: null,
                recognition: null,
                recordDone: false,
                recognitionDone: !Recognition,
                recordingRequested: false,
                chunks: [],
                text: ''
            };

            run = s;
            transcript.textContent = '抽出文：認識待ち';

            show('録音', '認識の受付開始を待っている');

            show(
                '認識',
                Recognition
                    ? '先に認識を開始する'
                    : 'このブラウザでは非対応'
            );

            sync();

            // 認識の受付開始後に、初めて録音用マイクを取得する。
            const startRecording = async () => {
                if (
                    run !== s ||
                    s.stopping ||
                    s.recordingRequested
                ) return;

                s.recordingRequested = true;
                show('録音', 'マイク準備中');

                try {
                    const stream =
                        await navigator.mediaDevices.getUserMedia({
                            audio: true
                        });

                    if (run !== s || s.stopping) {
                        stream.getTracks().forEach(
                            track => track.stop()
                        );
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

                        if (s.chunks.length) {
                            try {
                                const type =
                                    recorder.mimeType ||
                                    s.chunks[0].type;

                                const blob = new Blob(
                                    s.chunks,
                                    type ? { type } : undefined
                                );

                                const nextUrl =
                                    URL.createObjectURL(blob);

                                if (audioUrl) {
                                    URL.revokeObjectURL(audioUrl);
                                }

                                audioUrl = nextUrl;

                                show(
                                    '録音',
                                    '保存完了（' +
                                    blob.size +
                                    ' bytes）'
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
                        '録音開始。「テストです」と話してから⏹️を押す'
                    );

                    sync();
                } catch (error) {
                    if (run !== s || s.stopping) return;

                    show('録音', '開始失敗：' + error.name);
                    stopRun();
                }
            };

            // 準備中も含め、このテストのマイク使用を20秒で終了する。
            s.limit = setTimeout(stopRun, 20000);

            if (!Recognition) {
                startRecording();
                return;
            }

            try {
                const recognition = new Recognition();
                s.recognition = recognition;

                recognition.lang = 'ja-JP';
                recognition.continuous = false;
                recognition.interimResults = true;

                recognition.onstart = () => {
                    if (run !== s || s.stopping) return;

                    show(
                        '認識',
                        '受付開始。次に録音を開始する'
                    );

                    startRecording();
                };

                recognition.onresult = event => {
                    if (run !== s) return;

                    s.text = Array.from(event.results)
                        .map(result => result[0].transcript)
                        .join('');

                    transcript.textContent = '抽出文：' + s.text;
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

                    if (!s.recordingRequested) {
                        s.recordDone = true;

                        show(
                            '録音',
                            '認識の受付前に失敗したため、今回は開始していない'
                        );
                    }

                    // 録音開始後の認識エラーでは、録音を破棄しない。
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

                    if (!s.recordingRequested) {
                        s.recordDone = true;

                        show(
                            '録音',
                            '認識の受付前に終了したため、今回は開始していない'
                        );
                    }

                    finish(s);
                };

                // ここでは録音用マイクをまだ取得していない。
                recognition.start();
            } catch (error) {
                if (run !== s) return;

                s.recognitionDone = true;
                s.recordDone = true;

                show(
                    '認識',
                    '開始失敗：' + error.name
                );

                show(
                    '録音',
                    '認識を開始できなかったため、今回は開始していない'
                );

                finish(s);
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
        // 録音と同時使用せず、音声認識だけを調べる。
        const recognizeOnly = document.createElement('button');
        recognizeOnly.id = 'audioTestRecognizeOnly';
        recognizeOnly.type = 'button';
        recognizeOnly.className = 'example-button';
        recognizeOnly.textContent = '📝認識のみ';

        recognizeOnly.setAttribute(
            'aria-label',
            '録音せず、日本語の音声認識だけを試す'
        );

        play.after(recognizeOnly);

        const baseSync = sync;

        sync = function () {
            baseSync();

            recognizeOnly.disabled =
                Boolean(run || utterance || audio) ||
                !Recognition ||
                !window.isSecureContext;
        };

        recognizeOnly.addEventListener('click', () => {
            if (recognizeOnly.disabled) return;

            const s = {
                stopping: false,
                stream: null,
                recorder: null,
                recognition: null,
                recordDone: true,
                recognitionDone: false,
                text: ''
            };

            run = s;
            transcript.textContent = '抽出文：認識待ち';

            show(
                '認識',
                '認識のみを準備中。受付中の表示後に話す'
            );

            sync();

            try {
                const recognition = new Recognition();
                s.recognition = recognition;

                recognition.lang = 'ja-JP';
                recognition.continuous = false;
                recognition.interimResults = true;

                recognition.onstart = () => {
                    if (run === s) {
                        show(
                            '認識',
                            '認識のみ受付中。「テストです」と話す'
                        );
                    }
                };

                recognition.onresult = event => {
                    if (run !== s) return;

                    s.text = Array.from(event.results)
                        .map(result => result[0].transcript)
                        .join('');

                    transcript.textContent = '抽出文：' + s.text;
                    show('認識', '認識のみで文字を取得した');
                };

                recognition.onerror = event => {
                    if (run !== s) return;

                    s.recognitionDone = true;

                    show(
                        '認識',
                        '認識のみエラー：' + event.error
                    );

                    finish(s);
                };

                recognition.onend = () => {
                    if (run !== s) return;

                    s.recognitionDone = true;

                    show(
                        '認識',
                        s.text
                            ? '認識のみ完了'
                            : '認識のみ終了したが文字なし'
                    );

                    finish(s);
                };

                s.limit = setTimeout(stopRun, 20000);
                recognition.start();
            } catch (error) {
                s.recognitionDone = true;

                show(
                    '認識',
                    '認識のみ開始失敗：' + error.name
                );

                finish(s);
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
