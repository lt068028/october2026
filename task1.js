// ============================================================================
// Shared recording / speech recognition (Updated with MediaRecorder)
// ============================================================================

function bindRecorderEvents(
    recordBtn,
    stopBtn,
    resultSpan,
    correctionBox,
    corrListenBtn,
    corrTextSpan,
    getXFn,
    getYFn,
    expectedIsNeg = false
) {
    let session = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let audioStream = null;
    let recordedAudioUrl = null;
    let accumulatedTranscript = "";

    // ------------------------------------------------------------------------
    // Release the current session and restore this row's buttons.
    // ------------------------------------------------------------------------

    function releaseSession(currentSession) {
        if (!currentSession || currentSession.finished) return;

        currentSession.finished = true;

        if (currentSession.watchdog !== null) {
            clearTimeout(currentSession.watchdog);
            currentSession.watchdog = null;
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

    // ------------------------------------------------------------------------
    // Stop or abort speech recognition and media recorder.
    // ------------------------------------------------------------------------

    function requestStop(currentSession, abort = false, errorMessage = "") {
        if (!currentSession || currentSession.finished) return;

        if (errorMessage) {
            currentSession.errorMessage = errorMessage;
            resultSpan.textContent = errorMessage;
            resultSpan.style.color = "var(--error-text)";
        }

        // Stop MediaRecorder and Audio Stream
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
        }

        const currentRecognition = currentSession.recognition;

        if (!currentRecognition) {
            releaseSession(currentSession);
            return;
        }

        // Fallback in case the browser does not dispatch "end".
        if (currentSession.watchdog === null) {
            currentSession.watchdog = setTimeout(() => {
                releaseSession(currentSession);
            }, 2500);
        }

        try {
            if (abort) {
                currentRecognition.abort();
            } else {
                currentRecognition.stop();
            }
        } catch (err) {
            console.warn("Speech recognition stop error:", err);
            releaseSession(currentSession);
        }
    }

    // ------------------------------------------------------------------------
    // Start recognition and recording.
    // ------------------------------------------------------------------------

    recordBtn.addEventListener("click", async () => {
        if (recordBtn.disabled) return;

        // Do not allow simultaneous sessions
        if (activeRecognitionSession !== null) return;

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            resultSpan.textContent = "Speech recognition is not supported in this browser.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        const currentX = getXFn();
        const currentY = getYFn();

        if (!currentX || !currentY) {
            resultSpan.textContent = "Please choose both X and Y.";
            resultSpan.style.color = "var(--error-text)";
            return;
        }

        // Clean up previous recording
        if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            recordedAudioUrl = null;
        }
        accumulatedTranscript = "";

        const oldPlayBtn = resultSpan.querySelector('.play-recording-btn');
        if (oldPlayBtn) oldPlayBtn.remove();

        const currentSession = {
            finished: false,
            stopRequested: false,
            errorMessage: "",
            recognition: null,
            watchdog: null
        };

        session = currentSession;
        activeRecognitionSession = currentSession;

        try {
            // Initialize MediaRecorder
            audioChunks = [];
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);

            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                recordedAudioUrl = URL.createObjectURL(audioBlob);

                // Process transcript when recording stops
                if (accumulatedTranscript && !currentSession.errorMessage) {
                    processRecognitionResult(
                        accumulatedTranscript,
                        currentX,
                        currentY,
                        expectedIsNeg,
                        resultSpan,
                        correctionBox,
                        corrListenBtn,
                        corrTextSpan,
                        () => recordedAudioUrl
                    );
                }
            };

            mediaRecorder.start();

            // Initialize SpeechRecognition
            const currentRecognition = new SpeechRecognition();
            currentSession.recognition = currentRecognition;

            currentRecognition.lang = "ja-JP";
            currentRecognition.interimResults = false;
            currentRecognition.continuous = isManualStop;

            currentRecognition.onresult = (event) => {
                if (
                    currentSession.finished ||
                    session !== currentSession ||
                    currentSession.errorMessage
                ) {
                    return;
                }

                let rawTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        rawTranscript += event.results[i][0].transcript;
                    }
                }

                accumulatedTranscript += rawTranscript;

                // If autostop is enabled, stop recording after receiving the final result
                if (!isManualStop) {
                    requestStop(currentSession, false);
                }
            };

            currentRecognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);

                if (currentSession.finished || session !== currentSession) {
                    return;
                }

                const message =
                    event.error === "not-allowed" || event.error === "service-not-allowed"
                        ? "Microphone permission denied."
                        : event.error === "no-speech"
                            ? "No speech detected. Please try again."
                            : event.error === "audio-capture"
                                ? "Microphone unavailable."
                                : event.error === "network"
                                    ? "Speech recognition network error."
                                    : event.error === "aborted"
                                        ? "Recording stopped."
                                        : "Speech recognition error. Please try again.";

                requestStop(currentSession, true, message);
            };

            currentRecognition.onend = () => {
                if (currentSession.finished) return;
                releaseSession(currentSession);
            };

            recordBtn.disabled = true;
            stopBtn.disabled = !isManualStop;

            if (isManualStop) {
                stopBtn.classList.add("stop-btn-active");
            } else {
                stopBtn.classList.remove("stop-btn-active");
            }

            resultSpan.textContent = "Recording...";
            resultSpan.style.color = "var(--accent-color)";
            correctionBox.style.display = "none";

            currentRecognition.start();
        } catch (err) {
            console.error("Recording start error:", err);
            requestStop(
                currentSession,
                true,
                "Could not start recording. Please try again."
            );
        }
    });

    // ------------------------------------------------------------------------
    // Manual stop button
    // ------------------------------------------------------------------------

    stopBtn.addEventListener("click", () => {
        if (!session || session.finished) return;
        if (session.stopRequested) return;

        session.stopRequested = true;
        stopBtn.disabled = true;

        requestStop(session, false);
    });
}
