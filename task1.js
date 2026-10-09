function installPracticeLayoutStyles() {
    if (document.getElementById("practiceLayoutStyles")) return;

    const style = document.createElement("style");
    style.id = "practiceLayoutStyles";
    style.textContent = `
        .practice-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
            gap: 20px;
            align-items: start;
            width: 100%;
        }

        .practice-main {
            min-width: 0;
        }

        .practice-task1 {
            box-sizing: border-box;
            width: 320px;
            min-width: 0;
        }

        .practice-task1 .top-row {
            flex-wrap: wrap;
        }

        .practice-task1 .header-panel {
            display: block;
        }

        .practice-task1 .title-instruction-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .practice-task1 .control-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
        }

        .practice-task1 .drill-row {
            min-width: 0;
        }

        .practice-task1 .result-text {
            overflow-wrap: anywhere;
        }

        @media (max-width: 850px) {
            .practice-layout {
                grid-template-columns: minmax(0, 1fr);
            }

            .practice-task1 {
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);
}
