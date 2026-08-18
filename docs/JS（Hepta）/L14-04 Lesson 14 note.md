---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 14 堂：Fiber 執行機制

# Lesson 14 note

本課程深入探討 React Fiber 的執行機制，解析工作循環如何實現可中斷渲染，以及 Fiber 樹如何透過深度優先遍歷（DFS）完成節點的展開與副作用收集。

### [工作循環與讓出控制](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/db637f2e-a947-4f63-8fd3-8c094743ee41)

- Fiber 作為最小工作單元與虛擬堆疊幀（Virtual Stack Frame）
  - 將執行狀態從瀏覽器的 Call Stack 轉移到堆積記憶體（Heap）中的 Fiber 物件，使 React 能隨時中斷並記錄進度。
- `workLoopConcurrent` 的核心邏輯
  - 透過 `while` 迴圈檢查 `workInProgress` 指針與 `shouldYield()` 判定，實現協作式多工。
- 時間切片（Time Slicing）機制
  - React Scheduler 設定 5ms 為時間預算，在保證 JS 執行進度的同時，保留足夠空間給瀏覽器處理高優先級任務（如使用者輸入）。
- 使用 `MessageChannel` 進行調度
  - 相比 `setTimeout`，`MessageChannel` 沒有 4ms 的人工延遲，能更精準地在瀏覽器空閒時恢復渲染任務。

### [beginWork 向下遍歷](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/f25dfa52-4b1d-474d-a23e-91333fcc0f15)

- `beginWork` 的核心職責：向下展開 Fiber 樹
  - 接收當前節點（current）與工作節點（workInProgress），決定下一步的遍歷方向。
- 組件類型的分派與處理
  - 根據 tag 區分函數元件、Host Component（原生標籤）等，並執行對應邏輯（如執行 Hooks 或獲取 children）。
- 協調比對（Reconciliation）與打標籤
  - 將新產生的 React Element 與舊 Fiber 對比，在節點上標記副作用標籤（flags），如 Placement 或 Update。
- 可中斷性的實踐
  - `beginWork` 每次僅處理一個節點並回傳第一個子節點，讓 `workLoop` 能在節點間隙檢查時間並隨時停工。

### [completeWork 向上收集](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/2cc5a3ea-7ced-4c8b-8f18-f34acc7a8fb3)

- `completeWork` 的核心職責：向上收網與組裝
  - 當 `beginWork` 觸及葉節點（回傳 `null`）時觸發，負責處理「歸」階段的邏輯。
- 建立與更新 DOM 實體（stateNode）
  - 在記憶體中建立離線 DOM 節點，並執行 `appendAllChildren` 將子節點先行組裝，提升 Commit Phase 的效能。
- 副作用標籤冒泡（Flags Bubbling）
  - 父節點會收集子節點的 flags，並在 React 18+ 中利用 `subtreeFlags` 記錄路徑資訊，使 Commit Phase 能夠精準導航到變更處。
- 完整遍歷順序：下（Child）→ 右（Sibling）→ 上（Return）
  - 透過非遞迴的循環實作 DFS，確保執行狀態可被儲存於全域指針中以供恢復。

## Q&A

- **Q:** React 在暫停後是如何恢復渲染工作的？
  - **核心在於全域指標 **`**workInProgress**`** 的書籤作用**
- 即便 `workLoop` 函數執行結束且 Call Stack 被清空，`workInProgress` 指針依然保留在記憶體中，指向上次未處理完的 Fiber 節點。當瀏覽器透過 `MessageChannel` 回調恢復任務時，React 會直接從該指針位置繼續執行。
- **Q:** 為什麼要把副作用標籤（Flags）向上冒泡到根節點？
  - **優化 Commit Phase 的遍歷效能**
- 若不冒泡，Commit Phase 必須重新遍歷整棵樹來尋找有變動的節點（效能差）。透過冒泡與 `subtreeFlags` 位元運算，React 只需要沿著有標記的路徑「導航」，就能極速找到需要操作真實 DOM 的位置。
- **Q:** DOM 節點的建立與掛載順序為何是「子節點先於父節點」？
  - **由下而上的組裝策略（Post-order）**
- 這種順序確保當父節點執行 `completeWork` 時，其內部的子 DOM 樹已經在記憶體中建構完成。這讓 React 可以在離線狀態下拼裝好小型模組，最後在 Commit Phase 一次性掛載到網頁上，減少頻繁操作真實 DOM 的開銷。
