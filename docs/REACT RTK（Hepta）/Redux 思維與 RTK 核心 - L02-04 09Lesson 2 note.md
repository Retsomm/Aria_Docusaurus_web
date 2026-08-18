---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 2 堂：RTK 環境建置實作

# 09Lesson 2 note

本課學習如何從零建立現代化的 Redux Toolkit 開發環境。涵蓋了使用 Vite 建立 TypeScript 專案、配置具備型別安全的 Store，以及將 Redux 正確掛載到 React 應用程式中並透過 DevTools 驗證。

### [專案初始化與安裝](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/803a5f78-7926-4a68-b54c-26f5d8fa0c19)

- 選擇 Vite 作為開發工具：利用原生 ES Modules 達到極速的熱更新（HMR），優於傳統的 CRA。
- 套件職責分工：
  - `@reduxjs/toolkit` (RTK)：應用的「大腦」，負責定義狀態、更新邏輯與非同步行為。
- `react-redux`：UI 的「橋樑」，提供 `Provider` 與 Hooks（如 `useSelector`）讓 React 元件與 Store 互動。
- TypeScript 配置：務必開啟 `strict: true` 以確保大型狀態樹的型別安全，避免推導出 `any` 導致邏輯崩潰。
- 目錄規範：建議採 Feature-based 結構，將 Store 配置放在 `src/app/`，功能模組放在 `src/features/`。

### [建立第一個 Store](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/c694fe14-6b8b-4cfd-bf00-eae4881d208a)

- `configureStore` 的優勢：簡化傳統 Redux 繁瑣的設定，自動整合 `combineReducers`、Redux Thunk 與 DevTools。
- 自動化型別推導：
  - `RootState`：透過 `ReturnType<typeof store.getState>` 自動推導全域狀態型別，達成「單一事實來源」，新增 Slice 時不需手動更新型別。
- `AppDispatch`：透過 `typeof store.dispatch` 確保發送 Action 時的型別正確性。
- 內建守護機制：預設包含「序列化檢查」與「不可變性檢查」的中間件（Middleware），防止開發者直接修改 State 或存入非純資料。

### [連接 React 與 DevTools](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/902f3e02-ee28-4f74-a344-0b0bd41fd72a)

- `<Provider>` 元件掛載：
  - 必須包裹在應用的最頂層（通常是 `main.tsx`），確保整棵元件樹都能存取 Store。
- 解決 Props Drilling 問題，讓深層元件能直接訂閱狀態。
- 驗證環境：開啟 Redux DevTools 若看到 `@@INIT` 動作，代表 Store 已成功初始化並完成「點名」（收集所有 Reducer 的初始狀態）。
- 最小可運行環境：在撰寫複雜邏輯前先確認 DevTools 運作正常，能有效排除環境配置層面的錯誤。

## Q&A

- **Q:** 進入點是指 `App.tsx` 嗎？為什麼環境配置要放在那裡？
  - **進入點通常指 **`**src/main.tsx**`**。** 它是基礎設施的配置點，負責「接水接電」如 Redux、Router 的設定。
- 將配置放在 `main.tsx` 能保持 `App.tsx` 乾淨，讓它專注於 UI 佈局與路由邏輯。
- **Q:** 為什麼 `RootState` 不需要手動維護？
  - **關鍵在於 **`**ReturnType<typeof store.getState>**`**。** 這行程式碼讓 TypeScript 自動觀察 Store 的實際內容。
- 當你在 `configureStore` 中新增或刪除一個 Slice，TypeScript 會自動同步更新 `RootState` 的結構，維持型別安全。
- **Q:** `@@INIT` 這個動作具體在做什麼？
  - **它是 Store 的「開機與點名」程序。**
- 當 `configureStore` 執行時，會透過 `combineReducers` 呼叫所有的 Reducer，收集它們回傳的 `initialState` 並建立初始狀態樹。看到它出現代表環境連接完全成功。
