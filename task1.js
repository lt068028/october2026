.header-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: var(--bg-panel);
        border-radius: 6px;
        flex-wrap: nowrap; /* 画面幅が狭くても勝手に折り返して崩れないようにする */
        gap: 12px;
        border: 1px solid var(--border-color);
    }
    .title-instruction-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1; /* タイトル側を左側で柔軟に広げる */
    }
    .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
        margin-left: auto; /* コントロール群を確実に右端に寄せる */
    }
