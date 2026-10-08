<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>XはYです</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
</head>
<body>
    <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
        <a href="index.html" style="text-decoration:none; color:var(--accent-color); font-weight:bold;">↩️メニューへもどる</a>
    </div>
    <h1>Practice 1: XはYです</h1>
    <div id="exampleSection"></div>
    <div id="task1List"></div>

    <div class="header-panel" style="margin-top:30px;">
        <div class="title-instruction-group">
            <strong>Task 3: Custom Drills</strong>
            <span class="example-desc">Paste vocabulary text or drop image.</span>
        </div>
    </div>
    <div class="drill-row task3-import-row">
        <div class="task3-input-area">
            <textarea id="task3Textarea" placeholder="Paste words here..."></textarea>
            <label class="task3-file-label">Choose JPG<input type="file" id="task3ImageInput"></label>
        </div>
        <button id="task3ImportBtn">Import</button>
        <div id="task3Preview" class="result-text">No words imported.</div>
        <button id="task3GenerateBtn" disabled>✨ Generate Drills</button>
    </div>
    <div id="task3List"></div>

    <script src="task1.js"></script>
</body>
</html>
