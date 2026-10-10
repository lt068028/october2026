<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XはYです</title>
    <link rel="stylesheet" href="style.css">
</head>
<body style="position: relative;">

    <!-- =========================================================
         Top Back Link (右上端に固定)
         ========================================================= -->
    <a href="#" class="top-right-back" onclick="window.history.back(); return false;">
        ↩️ もどる
    </a>

    <h1>Practice1；XはYです</h1>

    <!-- =========================================================
         Top Dashboard (左にExample, 右に設定)
         ========================================================= -->
    <div class="top-dashboard">
        <!-- 左カラム：Example -->
        <div class="example-container">
            <div id="exampleSection"></div>
        </div>

        <!-- 右カラム：グローバル設定パネル -->
        <div class="settings-container">
            <div id="globalSettingsSection"></div>
        </div>
    </div>


    <!-- =========================================================
         Task 1 Section
         ========================================================= -->
    <div class="info-panel info-panel-task1">
        <span class="info-panel-title">Task 1；Drills</span>
        <span class="info-panel-desc">💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.</span>
    </div>
    <div id="task1List"></div>


    <!-- =========================================================
         Task 2 Section
         ========================================================= -->
    <div class="info-panel info-panel-task2" style="margin-top: 30px;">
        <span class="info-panel-title">Task 2；Custom Practice</span>
        <span class="info-panel-desc">💡 Make a sentence using "XはYです" (affirmative) or "XはYじゃないです" (negative) based on the given words.</span>
    </div>
    <div id="task2List"></div>


    <!-- =========================================================
         Task 3 Section (配置予約)
         ========================================================= -->
    <div class="info-panel info-panel-task3" style="margin-top: 30px;">
        <span class="info-panel-title">Task 3；Challenge</span>
        <span class="info-panel-desc">💡 Challenge practice based on the given words.</span>
    </div>
    <div id="task3List"></div>


    <!-- =========================================================
         Footer
         ========================================================= -->
    <div class="voice-guide-footer">
        🔊Want to change the voice?
        <span id="guideTrigger" class="guide-trigger">
            Check⚙️
        </span>

        <div id="guideBox" class="guide-box-popup" style="display: none;">
            Win: Settings > Time & Language > Speech<br>
            Mac/iOS: Settings > Accessibility > Spoken Content<br>
            ChromeOS: Settings > Advanced > Accessibility > Text-to-Speech
        </div>
    </div>

    <script src="task1.js"></script>
</body>
</html>
