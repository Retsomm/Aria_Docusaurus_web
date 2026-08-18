---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 1 堂：Redux 思維建立

# 05Lesson 1 note

這堂課建立了 Redux 的核心世界觀，從狀態管理的痛點出發，深入探討 Redux 的三大原則與單向資料流。你學習了為何現代開發首選 Redux Toolkit (RTK)，並為 30 天的鐵人賽規劃了「理論 + 實作」的學習地圖。

### [課程路線圖](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/0031c0b1-9e6b-4b2e-9f68-b68fbf73758b)

- 建立鐵人賽 30 天的撰寫節奏，將內容拆分為 6 大主題，確保文章邏輯連貫且不枯竭。
- 採用「理論 + 實作」的架構，每一篇實作範例皆以 TypeScript 為核心，強調型別安全與 DevTools 的視覺化驗證。
- 前 12 篇文章的規劃邏輯：
  - 第 1-3 篇：Redux 思維與哲學。
- 第 4-5 篇：環境建置與初始設定。
- 第 6-12 篇：createSlice 深度解析、React Hooks 實戰與多 Slice 組合。

### [狀態管理的必要性](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/8aa8fd42-3948-4097-837b-096848acb595)

- 分析 React 內建機制的侷限性：
  - **Props Drilling**：跨多層傳遞狀態導致中間元件負擔過重，且程式碼難以維護。
- **Lifting State Up 的極限**：狀態過度提升會導致頂層元件變為「神元件 (God Component)」，並引發不必要的全域重新渲染。
- **Context API 的不足**：雖然解決了傳遞問題，但缺乏精確的訂閱機制（一個屬性變動導致所有訂閱者更新）與強大的開發者工具（不可追蹤性）。
- Redux 的價值在於處理「全球性且頻繁使用」的狀態、複雜的更新邏輯（如 Undo/Redo）以及提供高度的可預測性與除錯支援。

### [Redux 三大原則](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/8b615127-f8d2-4f61-a5ea-0bab76547dbb)

- **Single source of truth (單一資料來源)**：
  - 全域狀態儲存在唯一一個 Store 的物件樹中，方便除錯、伺服器端渲染 (SSR) 與狀態持久化。
- **State is read-only (狀態是唯讀的)**：
  - 唯一改變狀態的方法是發送 (dispatch) 一個描述意圖的 Action 物件。
- 禁止直接修改 (mutate) 是為了確保可追蹤性，並讓 React 能夠透過引用比較 (Reference check) 偵測變動。
- **Changes via pure functions (使用純函數進行變更)**：
  - Reducer 必須是純函數：相同的輸入永遠得到相同輸出，且無副作用。
- 純函數確保了「時間旅行除錯 (Time Travel Debugging)」的可能性，讓狀態變遷像錄影帶一樣可回放。

### [Action、Reducer、Store 資料流](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/e30d734d-257e-414a-95a3-a8059fd9adc6)

- 定義 Redux 的三位核心角色：
  - **Action**：描述「發生了什麼事」的訊息（包含 `type` 與選填的 `payload`）。
- **Reducer**：計算新狀態的「加工廠」，負責 (previousState, action) => newState。
- **Store**：儲存狀態並串接 dispatch 與訂閱機制的「保險箱」。
- **單向資料流 (Unidirectional Data Flow)**：
  - 流程：UI 觸發事件 → Dispatch Action → Reducer 計算新 State → Store 更新 → UI 重新渲染。
- 優點：確保資料來源明確、路徑唯一且意圖清晰，徹底解決雙向綁定的混亂問題。

### [從傳統 Redux 到 RTK](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/4c6e47d9-c0d9-4e7e-9101-2179caaa5563)

- 傳統 Redux 的痛點：
  - 過多的樣板程式碼 (Boilerplate)：手寫 Action Type、Action Creator 與冗長的 Switch-case。
- 不可變更新的痛苦：層層展開物件 (`...state`) 極易出錯。
- **Redux Toolkit (RTK)** 的解決方案：
  - **createSlice**：將 Action 與 Reducer 合而為一，自動生成 Action Creators。
- **Immer 函式庫**：讓你可以用直覺的「修改語法」撰寫 Reducer，底層會自動轉換為不可變更新。
- **configureStore**：內建中介軟體 (Middleware) 與開發者工具設定。
- RTK 的本質：它不是新框架，而是 Redux 的「官方推薦封裝」，旨在簡化開發流程同時守護核心原則。

## Q&A

- **Q:** 既然說單向資料流全流程圖解很重要，那具體的視覺化路徑是什麼？
  - 透過視覺化可以更直覺地掌握 Action、Reducer 與 Store 的互動。
- 關鍵在於理解資料從 UI 出發後，不會直接改回 UI，而是必須繞過 Store 進行一次完整的循環，這確保了每一筆帳目（狀態變更）都有跡可循。
- **Q:** 如果直接修改狀態物件（Mutation），會對 React 和除錯造成什麼具體麻煩？
  - **React UI 更新**：React 使用 `Object.is` 做淺比較，直接修改屬性不會改變記憶體位址，導致 React 認為狀態沒變而不會觸發重新渲染。
- **除錯**：Redux DevTools 會因為失去歷史快照（因為舊狀態被直接改壞了）而無法執行「時間旅行」，導致開發者無法回溯到正確的歷史時間點。
- **Q:** RTK 的 `createSlice` 允許寫 `state.value += 1` 這種修改語法，是否違反了唯讀原則？
  - 沒有違反，這歸功於內建的 **Immer** 函式庫。
- Immer 會提供一個 **Draft State (草稿)** 讓開發者操作，最後再根據草稿產出一個全新的、不可變的狀態物件。這在兼顧開發者體驗的同時，依然維持了安全的單向資料流。
- **Q:** 當購物車數量顯示錯誤，但 Action payload 是正確的時，該檢查哪裡？
  - 應該優先檢查 **Reducer**。
- 因為 Action 只負責傳遞「信件」（意圖），而 Reducer 才是真正負責計算邏輯的「加工廠」。如果輸入正確但輸出錯誤，代表加工廠內部的計算邏輯（純函數部分）出了問題。
