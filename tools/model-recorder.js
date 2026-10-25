'use strict';
(() => {
    const $ = id => document.getElementById(id);
    const ui = Object.fromEntries(['settings','voice','rate','pitch','items','source','refresh','share','disconnect','sharing','probe','cancel','approved','batch','export','status','results'].map(id => [id, $(id)]));
    let voices = [], stream = null, busy = false, pendingShare = false, shareEpoch = 0;
    let controller = null, probeReady = false;
    const records = new Map();
    const urls = [];
    const fail = message => new Error(message);
    const status = message => { ui.status.textContent = message; };
    function update() {
        const live = stream?.getAudioTracks().some(t => t.readyState === 'live');
        ui.settings.disabled = busy || pendingShare;
        ui.share.disabled = busy || pendingShare || !!stream;
        ui.disconnect.disabled = !stream && !pendingShare;
        ui.probe.disabled = busy || pendingShare || !live || !ui.voice.value;
        ui.cancel.disabled = !controller;
        ui.approved.disabled = busy || !probeReady;
        ui.batch.disabled = busy || !live || !probeReady || !ui.approved.checked;
        ui.export.disabled = busy || records.size === 0;
        ui.results.querySelectorAll('audio').forEach(audio => { audio.controls = !busy; if (busy) audio.pause(); });
    }
    function invalidate() { probeReady = false; ui.approved.checked = false; update(); }
    function loadVoices() {
        if (busy) return;
        const previous = ui.voice.value;
        voices = speechSynthesis.getVoices().filter(v => /^ja(?:-|$)/i.test(v.lang));
        ui.voice.replaceChildren(new Option('Voiceを選択してください', ''));
        voices.forEach((v, i) => ui.voice.add(new Option(`${v.name} (${v.lang})`, String(i))));
        const same = voices.findIndex(v => v.voiceURI === previous);
        const preferred = voices.findIndex(v => /(?:日本語|Japanese)\s*3(?:\D|$)/i.test(v.name.normalize('NFKC')));
        const index = previous && same >= 0 ? same : preferred;
        // Values use voiceURI, never list position; absent voices require explicit choice.
        [...ui.voice.options].slice(1).forEach((option, i) => { option.value = voices[i].voiceURI; });
        ui.voice.value = index >= 0 ? voices[index].voiceURI : '';
        if (ui.voice.value !== previous) invalidate();
        update();
    }
    function settings() {
        const voice = voices.find(v => v.voiceURI === ui.voice.value);
        if (!voice) throw fail('利用可能な日本語Voiceを選択してください。');
        const rate = Number(ui.rate.value), pitch = Number(ui.pitch.value);
        if (!ui.rate.value || !Number.isFinite(rate) || rate < .1 || rate > 2 || !ui.pitch.value || !Number.isFinite(pitch) || pitch < 0 || pitch > 2) throw fail('速度は0.1〜2、Pitchは0〜2で指定してください。');
        const items = ui.items.value.split(/\r?\n/).filter(line => line.trim()).map(line => {
            const tab = line.indexOf('\t');
            const id = line.slice(0, tab).trim(), text = line.slice(tab + 1).trim();
            if (tab < 0 || !/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !text || text.length > 500) throw fail('一覧は「ID＋タブ＋読み上げ文」（文は500文字以内）で指定してください。');
            return { id, text };
        });
        if (!items.length || items.length > 500 || new Set(items.map(x => x.id)).size !== items.length) throw fail('一覧は重複しないIDで1〜500項目にしてください。');
        return { voice, rate, pitch, items };
    }
    function stopSharing(message = '共有を終了しました。完成した収録は保持しています。') {
        shareEpoch++;
        controller?.abort();
        pendingShare = false;
        const old = stream; stream = null;
        old?.getTracks().forEach(t => t.stop());
        ui.sharing.textContent = '共有していません';
        invalidate(); status(message);
    }
    ui.share.onclick = async () => {
        if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) { status('この環境では共有録音が利用できません。ChromeのHTTPSまたはlocalhostで開いてください。'); return; }
        pendingShare = true; const epoch = ++shareEpoch; update();
        try {
            const captured = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: ui.source.value === 'screen' ? 'monitor' : 'browser' },
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                systemAudio: 'include', preferCurrentTab: ui.source.value === 'tab'
            });
            if (epoch !== shareEpoch) { captured.getTracks().forEach(t => t.stop()); return; }
            if (!captured.getAudioTracks().length) { captured.getTracks().forEach(t => t.stop()); throw fail('音声トラックがありません。音声共有を有効にして選び直してください。'); }
            stream = captured;
            stream.getTracks().forEach(t => t.addEventListener('ended', () => { if (stream === captured) stopSharing('共有が停止されました。再共有して1項目の確認から再開してください。'); }));
            const track = stream.getAudioTracks()[0];
            ui.sharing.textContent = `共有中：${track.label || '共有音声'}（音声トラックあり。収録成功は試聴で確認）`;
            invalidate(); status('先頭1項目を収録してください。');
        } catch (e) { if (epoch === shareEpoch) status(`共有を開始できませんでした：${e.message}`); }
        finally { if (epoch === shareEpoch) { pendingShare = false; update(); } }
    };
    ui.disconnect.onclick = () => stopSharing();
    // Every asynchronous stage has cancellation and a deadline. Late results are discarded.
    function bounded(promise, ms, signal, label) {
        return new Promise((resolve, reject) => {
            const cleanup = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); };
            const abort = () => { cleanup(); reject(new DOMException('収録を中止しました。', 'AbortError')); };
            const timer = setTimeout(() => { cleanup(); reject(fail(`${label}が時間内に完了しませんでした。`)); }, ms);
            signal.addEventListener('abort', abort, { once: true });
            if (signal.aborted) return abort();
            Promise.resolve(promise).then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
        });
    }
    const delay = (ms, signal) => bounded(new Promise(resolve => setTimeout(resolve, ms)), ms + 1000, signal, '待機');
    async function capture(item, config, signal) {
        const mimeType = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
        if (!mimeType) throw fail('対応する音声録音形式がありません。Chromeで試してください。');
        const audioStream = new MediaStream(stream.getAudioTracks());
        const recorder = new MediaRecorder(audioStream, { mimeType });
        const chunks = [];
        const stopped = new Promise((resolve, reject) => {
            recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
            recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
            recorder.onerror = event => reject(event.error || fail('録音エラー'));
        });
        // Handle a rejected recorder event even if another stage is still running.
        stopped.catch(() => {});
        let context;
        try {
            recorder.start();
            await delay(250, signal);
            const utterance = new SpeechSynthesisUtterance(item.text);
            utterance.voice = config.voice; utterance.lang = config.voice.lang;
            utterance.rate = config.rate; utterance.pitch = config.pitch; utterance.volume = 1;
            const spoken = new Promise((resolve, reject) => {
                utterance.onend = resolve;
                utterance.onerror = e => reject(fail(`TTSエラー：${e.error || '不明'}`));
                speechSynthesis.speak(utterance);
            });
            await bounded(spoken, 20000, signal, 'TTS再生');
            await delay(350, signal);
            recorder.stop();
            const original = await bounded(stopped, 5000, signal, '録音データの確定');
            context = new AudioContext();
            const buffer = await bounded(original.arrayBuffer().then(data => context.decodeAudioData(data)), 10000, signal, '音声デコード');
            if (signal.aborted) throw new DOMException('中止', 'AbortError');
            const metrics = measure(buffer);
            return { ...item, original, wav: wav(buffer), buffer, metrics,
                metadata: { id: item.id, text: item.text, voice: { name: config.voice.name, voiceURI: config.voice.voiceURI, lang: config.voice.lang, localService: config.voice.localService }, rate: config.rate, pitch: config.pitch, volume: 1,
                    capturedAt: new Date().toISOString(), userAgent: navigator.userAgent, platform: navigator.userAgentData?.platform || navigator.platform,
                    source: ui.source.value, displaySurface: stream?.getVideoTracks()[0]?.getSettings().displaySurface || null, audioTrack: stream?.getAudioTracks()[0]?.label || '', mimeType, duration: buffer.duration, sampleRate: buffer.sampleRate, channels: buffer.numberOfChannels, leadPaddingMs: 250, tailPaddingMs: 350, ...metrics } };
        } finally {
            speechSynthesis.cancel();
            if (recorder.state !== 'inactive') { try { recorder.stop(); } catch (_) {} }
            if (context) context.close().catch(() => {});
        }
    }
    function measure(buffer) {
        let peak = 0, sum = 0, count = 0;
        for (let c = 0; c < buffer.numberOfChannels; c++) {
            for (const sample of buffer.getChannelData(c)) { peak = Math.max(peak, Math.abs(sample)); sum += sample * sample; count++; }
        }
        const rms = Math.sqrt(sum / Math.max(1, count));
        return { peak, rms, signalDetected: peak >= .001 && rms >= .0001 };
    }
    function wav(buffer) {
        const channels = buffer.numberOfChannels, length = buffer.length;
        const bytes = new ArrayBuffer(44 + length * channels * 2), view = new DataView(bytes);
        const text = (at, value) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
        text(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
        view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true);
        view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, bytes.byteLength - 44, true);
        const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
        for (let i = 0; i < length; i++) for (let c = 0; c < channels; c++) {
            const sample = Math.max(-1, Math.min(1, data[c][i]));
            view.setInt16(44 + (i * channels + c) * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
        }
        return new Blob([bytes], { type: 'audio/wav' });
    }
    function render() {
        ui.results.querySelectorAll('audio').forEach(audio => { audio.pause(); audio.removeAttribute('src'); audio.load(); });
        urls.splice(0).forEach(url => URL.revokeObjectURL(url));
        ui.results.replaceChildren();
        for (const record of records.values()) {
            const section = document.createElement('div'); section.className = 'result';
            const title = document.createElement('h3'); title.textContent = `${record.id}：${record.text}`;
            const description = document.createElement('p');
            description.textContent = `${record.metadata.voice.name} / rate ${record.metadata.rate} / ${record.buffer.duration.toFixed(2)}秒 / peak ${record.metrics.peak.toFixed(4)} / RMS ${record.metrics.rms.toFixed(4)}`;
            const warning = document.createElement('p');
            warning.textContent = record.metrics.signalDetected ? '信号あり。通知音などの可能性もあるため、必ず試聴してください。' : '無音または非常に小さい音声です。共有経路を変えて再試行してください。';
            if (!record.metrics.signalDetected) warning.className = 'warning';
            const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 100;
            const ctx = canvas.getContext('2d'), samples = record.buffer.getChannelData(0);
            ctx.strokeStyle = '#175a92'; ctx.beginPath();
            for (let x = 0; x < 800; x++) {
                const start = Math.floor(x * samples.length / 800), end = Math.max(start + 1, Math.floor((x + 1) * samples.length / 800));
                let low = 0, high = 0;
                for (let i = start; i < end; i++) { low = Math.min(low, samples[i] || 0); high = Math.max(high, samples[i] || 0); }
                ctx.moveTo(x, 50 - high * 48); ctx.lineTo(x, 50 - low * 48);
            }
            ctx.stroke(); canvas.setAttribute('aria-label', '保存音声の波形'); canvas.setAttribute('role', 'img');
            const audio = document.createElement('audio'); audio.controls = true;
            const url = URL.createObjectURL(record.wav); urls.push(url); audio.src = url; audio.controls = !busy;
            section.append(title, description, warning, canvas, audio); ui.results.append(section);
        }
    }
    async function run(probe) {
        if (busy) return;
        let config;
        try { config = settings(); } catch (e) { status(e.message); return; }
        if (!stream?.getAudioTracks().some(t => t.readyState === 'live')) return;
        if (!probe && (!probeReady || !ui.approved.checked)) return;
        const items = probe ? config.items.slice(0, 1) : config.items;
        if (probe) invalidate();
        busy = true; controller = new AbortController(); const signal = controller.signal;
        ui.results.querySelectorAll('audio').forEach(audio => { audio.pause(); audio.currentTime = 0; });
        update();
        try {
            for (let i = 0; i < items.length; i++) {
                status(`${probe ? '試験' : '一括'}収録 ${i + 1}/${items.length}：${items[i].text}`);
                const record = await capture(items[i], config, signal);
                if (signal.aborted) throw new DOMException('中止', 'AbortError');
                // A silent retry must not replace a previously successful recording.
                const previous = records.get(record.id);
                if (!previous?.metrics.signalDetected || record.metrics.signalDetected) records.set(record.id, record);
                render();
                if (!record.metrics.signalDetected) throw fail('音声信号を確認できませんでした。一括収録は停止します。共有を選び直して先頭1項目から確認してください。');
            }
            if (probe) { probeReady = true; status('1項目を保存しました。保存音声を試聴し、確認欄をチェックしてください。'); }
            else status('全項目の収録が完了しました。各音声を確認してZIP保存してください。');
        } catch (e) {
            invalidate(); status(e.name === 'AbortError' ? '収録を中止しました。完成したデータは保持しています。' : `${e.message}\n完成したデータはZIP保存できます。`);
        } finally { busy = false; controller = null; update(); }
    }
    ui.probe.onclick = () => run(true);
    ui.batch.onclick = () => run(false);
    ui.cancel.onclick = () => { controller?.abort(); speechSynthesis.cancel(); };
    ui.approved.onchange = update;
    ['voice','rate','pitch','items','source'].forEach(id => ui[id].addEventListener('input', invalidate));
    ui.refresh.onclick = loadVoices;
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    // Minimal ZIP (stored entries, CRC32). No CDN, encoder, or upload service is used.
    const crcTable = Array.from({ length: 256 }, (_, n) => {
        let c = n; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        return c >>> 0;
    });
    async function zip(entries) {
        const local = [], central = []; let offset = 0, centralSize = 0;
        for (const [name, blob] of entries) {
            const data = new Uint8Array(await blob.arrayBuffer()), encoded = new TextEncoder().encode(name);
            let crc = 0xffffffff; for (const b of data) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8); crc = (crc ^ 0xffffffff) >>> 0;
            const header = new Uint8Array(30 + encoded.length), h = new DataView(header.buffer);
            h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(12, 33, true);
            h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, encoded.length, true); header.set(encoded, 30);
            const dir = new Uint8Array(46 + encoded.length), d = new DataView(dir.buffer);
            d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 20, true); d.setUint16(8, 0x800, true); d.setUint16(14, 33, true);
            d.setUint32(16, crc, true); d.setUint32(20, data.length, true); d.setUint32(24, data.length, true); d.setUint16(28, encoded.length, true); d.setUint32(42, offset, true); dir.set(encoded, 46);
            local.push(header, data); central.push(dir); offset += header.length + data.length; centralSize += dir.length;
        }
        const end = new Uint8Array(22), e = new DataView(end.buffer);
        e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
        return new Blob([...local, ...central, end], { type: 'application/zip' });
    }
    ui.export.onclick = async () => {
        if (busy || !records.size) return;
        busy = true; update();
        try {
            const entries = [], manifest = { version: 1, exportedAt: new Date().toISOString(), note: 'Signal detection is not a pronunciation or quality check. WAV is decoded from the compressed capture, not a lossless original.', recordings: [] };
            for (const record of records.values()) {
                const original = `${record.id}.${record.original.type.includes('ogg') ? 'ogg' : 'webm'}`, wavName = `${record.id}.wav`;
                entries.push([original, record.original], [wavName, record.wav]);
                manifest.recordings.push({ ...record.metadata, files: { original, wav: wavName } });
            }
            entries.push(['manifest.json', new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })]);
            const archive = await zip(entries), url = URL.createObjectURL(archive), link = document.createElement('a');
            link.href = url; link.download = `model-audio-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            status('ZIPのダウンロードを開始しました。保存ファイルを確認してください。');
        } catch (e) { status(`ZIP保存に失敗しました：${e.message}`); }
        finally { busy = false; update(); }
    };
    window.addEventListener('pagehide', () => { stopSharing(); speechSynthesis.cancel(); urls.forEach(url => URL.revokeObjectURL(url)); });
    loadVoices(); update();
})();
