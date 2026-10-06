mediaRecorder.onstop = async () => {
    recordingActive = false;
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    recordedAudioUrl = URL.createObjectURL(audioBlob);
    playRecordBtn.style.display = "inline-flex";

    if (latestTranscript) {
        const analysis = processTranscript(latestTranscript);
        if (analysis) {
            await analyzeRecordedAudio(
                audioBlob,
                analysis.modelMorae,
                analysis.operations,
                resultSpan
            );
        }
    } else {
        resultSpan.textContent = "Could not detect your speech.";
        resultSpan.style.color = "var(--text-secondary)";
    }

    finishingRecording = false;
};
