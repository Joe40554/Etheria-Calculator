# TODO / 開發銜接指引

此檔為固定參考，不需要你手動更新。你只需在 GitHub 倉庫的 Issues 頁面新增或更新問題與需求，我將以 Issues 為唯一任務來源並依序處理。

- GitHub Issues：https://github.com/Joe40554/Etheria-Calculator/issues
- 主要分支：main

## 工作流程
- 你在 GitHub 建立/更新 Issue（標題清楚、描述重現步驟與期望結果）。
- 我會先檢查 Issues，再對應本地檔案修改、提交並推送到 `main`。
- 每次處理完會在提交訊息附上關鍵描述，並於必要時回覆對應 Issue（若需要）。

## 目前重點（導覽用，不需手動同步）
- 驗證管理頁面載入裝備後主屬性是否正確計入總值。
- 確認 `electron-app/renderer.js` 的 `statKeyMap` 映射完整（含英文鍵）。
- 分頁切換後主屬性持續計入總值（事件綁定與計算一致）。

## 檔案索引
- `electron-app/renderer.js`：屬性計算、事件綁定、分頁切換邏輯。
- `electron-app/index.html`：計算器 UI 控件與主屬性選擇器。
- `README.md`：安裝/啟動/打包說明與「下一步任務」。
- `TODO.md`：本文件（不需你更新，僅作為交接導覽）。

## 提交與推送（由我執行）
- 暫存並提交：`git add -A`、`git commit -m "描述此次變更"`
- 推送：`git push`

如需新增或調整任務，請直接使用 Issues。我會以 Issues 為準。