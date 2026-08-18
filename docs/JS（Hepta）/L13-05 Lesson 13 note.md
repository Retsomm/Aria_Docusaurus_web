---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 13 堂：Fiber 架構基礎

# Lesson 13 note

本節課深入探討 React 16 的核心重構 —— Fiber 架構。從舊版 Stack Reconciler 的瓶頸出發，解析 Fiber 的資料結構、雙緩衝機制以及渲染階段的分工邏輯。

### [Stack Reconciler 的問題](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/f6d99c55-43bf-47aa-b815-939dd009ed7c)

- 舊架構採用「同步遞迴」模型：當 `setState` 觸發時，React 會利用 JavaScript 原生的 Call Stack 從根節點開始遞迴比對，一旦開始就無法中斷，直到整棵樹處理完畢。
- 長任務（Long Task）與卡頓（Jank）：若元件樹龐大，計算時間超過 16.6ms 的幀預算，主執行緒會被霸佔，導致瀏覽器無法處理 UI 互動與動畫，產生明顯的掉幀。
- 缺乏優先級調度：舊架構無法區分任務緊急程度，低優先級的渲染（如背景圖表）會阻塞高優先級的互動（如輸入框打字）。
- 解決方案的核心：實現「可中斷渲染」，將大型任務拆解為微小單元，適時讓出主執行緒。

### [Fiber 節點資料結構](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/74febf10-7f64-4978-a545-1a2e0236f16d)

- 虛擬堆疊幀（Virtual Stack Frame）：將執行狀態從 Call Stack 移至記憶體 Heap 中的 Fiber 物件，使 React 獲得渲染進度的「手動控制權」。
- 鏈結串列（Linked List）結構：透過 `child`（大兒子）、`sibling`（下一個兄弟）與 `return`（父節點）指標構成樹狀鏈表，取代遞迴呼叫，支援隨時記錄位置並中斷/恢復。
- 靜態與動態屬性：
  - `type` 與 `stateNode`：描述元件類型並指向真實 DOM 或實例。
- `memoizedState`：Hooks 存活的土壤，按順序儲存 `useState` 等狀態。
- `flags`（或 `effectTag`）：使用二進位標記該節點需執行的 DOM 操作（如 Placement、Update）。

### [雙緩衝樹機制](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/de8670d5-eb8c-4f8e-9480-1afab0485917)

- `current` 樹與 `workInProgress` 樹：記憶體中同時存在兩棵樹，前者代表螢幕當前狀態，後者為 React 正在背景計算的「草稿」。
- 原子性更新：所有的計算都在 `workInProgress` 樹悄悄進行，使用者看不見「處理到一半」的殘缺 UI，直到計算完成才瞬間切換指針。
- `alternate` 指針：連結兩棵樹中的對應節點，是 Diffing 演算法比對新舊差異以及複用 Fiber 物件、保持狀態連貫性的關鍵。
- 效能優勢：透過節點複用（Pooling）減少垃圾回收壓力，並支持未來併發模式的擴展。

### [Render 與 Commit 分工](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/3a9cf828-1848-44ae-a54c-28b78e77e867)

- Render Phase（渲染階段）：
  - 職責：遍歷 `workInProgress` 樹，計算差異並打上 `flags` 標籤。
- 特性：可中斷、非同步。
- 強制約束：必須是「純函數」，不允許有副作用，因為該階段可能因高優先級任務插隊而被丟棄重來。
- Commit Phase（提交階段）：
  - 職責：將計算結果同步到真實 DOM，觸發副作用。
- 特性：同步且不可中斷，保證 UI 一致性（防止撕裂）。
- 子階段：分為 Before Mutation、Mutation（真正的 DOM 改動）與 Layout（執行 `useLayoutEffect`、切換指針）。
- 副作用執行時機：`useLayoutEffect` 在 Commit 階段同步執行（會阻塞瀏覽器重繪）；`useEffect` 在 Commit 完成並重繪後才非同步執行。

## Q&A

- **Q:** 為什麼 Fiber 可以隨時中斷恢復，而舊的遞迴方式做不到？
  - 關鍵在於進度紀錄的位置：遞迴的進度存在 Call Stack 裡，一旦函數為了讓路而 return，Stack 環境會消失且無法找回紀錄。
- Fiber 將進度「物件化」存放在 Heap 中，利用 `child` / `sibling` 指標導航，即使暫停了，React 下次仍能按圖索驥找回斷點繼續工作。
- **Q:** 為什麼 Render Phase 必須保持「純粹（Pure）」？
  - 因為 Render Phase 是可中斷且可能被「丟棄並重啟」的。
- 若在該階段執行副作用（如修改全域變數），當 React 因為調度原因重複執行該階段時，副作用會被觸發多次，導致資料與最終畫面的更新次數不一致。
- **Q:** 雙緩衝機制如何保證 UI 的穩定性？
  - 透過「原子性更新」原則：React 確保所有的 DOM 變更標籤都在背景的 `workInProgress` 樹收集完畢後，才進入同步的 Commit 階段進行一次性修改。
- 使用者永遠只會看到 `current` 指標指向的完整結構，不會看到計算過程中的中間狀態。
