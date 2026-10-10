// ------------------------------------------------------------------------
    // Example Section Initialization
    // ------------------------------------------------------------------------
    if (exampleSection) {
        const ex1X = formatWord("わたし", "watashi", "I");
        const ex1Y = formatWord("がくせい", "gakusei", "student");
        const ex2X = formatWord("わたし", "watashi", "I");
        const ex2Y = formatWord("せんせい", "sensei", "teacher");

        exampleSection.className = "example-box";
        
        // テーブルレイアウトによる再構築
        exampleSection.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
                <tr>
                    <td style="padding: 8px 10px 8px 0; white-space: nowrap; width: 1%;">
                        <strong>Affirmative:</strong>
                    </td>
                    <td style="padding: 8px 10px; width: 30%;">
                        ${ex1X} ／ ${ex1Y}
                    </td>
                    <td style="padding: 8px 10px;">
                        わたしは、がくせいです。<br>
                        <span style="font-size: 0.85em; color: var(--text-secondary);">(I am a student)</span>
                    </td>
                    <td style="width: 120px; text-align: center; vertical-align: middle; padding: 8px 0;">
                        <button id="ex1Listen" class="example-button" style="margin: 0;">🔊 きく</button>
                    </td>
                </tr>
                <tr style="border-top: 1px dashed #ccc;">
                    <td style="padding: 8px 10px 8px 0; white-space: nowrap; width: 1%;">
                        <strong>Negative:</strong>
                    </td>
                    <td style="padding: 8px 10px; width: 30%;">
                        ${ex2X} ／ ${ex2Y}
                    </td>
                    <td style="padding: 8px 10px;">
                        わたしは、せんせいじゃないです。<br>
                        <span style="font-size: 0.85em; color: var(--text-secondary);">(I am not a teacher)</span>
                    </td>
                    <td style="width: 120px; text-align: center; vertical-align: middle; padding: 8px 0;">
                        <button id="ex2Listen" class="example-button" style="margin: 0;">🔊 きく</button>
                    </td>
                </tr>
            </table>
        `;

        setupExampleListen("ex1Listen", "わたしは、がくせいです。");
        setupExampleListen("ex2Listen", "わたしは、せんせいじゃないです。");
    }
