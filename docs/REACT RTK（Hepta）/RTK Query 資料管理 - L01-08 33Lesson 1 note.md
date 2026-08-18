---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 1 堂：RTK Query 概念建立

# 33Lesson 1 note

這堂課探討了從傳統的 useEffect 抓取模式轉向 RTK Query 的必要性，並建立了核心架構與 Store 整合的心智模型。我們學習了如何區分本地與遠端狀態，以及 RTK Query 兩步掛載（Reducer 與 Middleware）的關鍵作用。

### [問題與解決方案](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/e4ad1262-0bcd-454e-907f-40fa6302e24b)

- 傳統 useEffect + fetch 模式的四大結構性痛點
  - 重複請求：多個元件同時掛載時發送相同的 API 請求，造成資源浪費與 UI 不一致。
- 快取缺失：資料隨元件卸載而銷毀，切換頁面時會出現不必要的 Loading 閃爍。
- 狀態散落：Loading 與 Error 狀態需要在每個元件手動管理，代碼冗餘且難以同步。
- 競爭條件 (Race Condition)：後發送的請求若較晚抵達，可能會覆蓋掉較新的資料，導致顯示錯誤。
- RTK Query 的核心價值：自動化管理引擎
  - 透過「請求去重複（Deduplication）」確保同一時間相同請求只發送一次。
- 提供「宣告式需求」的心智模型：開發者只需宣告需要什麼資料，由 RTK Query 負責抓取與快取維護。

### [架構與定位](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/cedb0d92-0116-4b29-8c0c-1d6c74732f22)

- 本地客戶端狀態 vs. 遠端伺服器狀態
  - 本地狀態（如側邊欄開關）：前端完全擁有，使用 createSlice 管理。
- 遠端狀態（如商品列表）：伺服器擁有，前端僅是「暫時借用」的快取複本，使用 RTK Query 管理。
- createApi 的四大組成部分
  - reducerPath：定義 API 狀態在 Redux Store 中的命名空間。
- baseQuery：設定請求基底（如 baseUrl）與統一的攔截邏輯（如注入 Token）。
- endpoints：定義具體的 API 行為（query 用於獲取，mutation 用於修改）。
- 自動生成的 Hooks：RTK Query 根據 endpoint 名稱自動產出的 React Hooks（如 useGetPostsQuery）。
- RTK Query 實質上是一個「超級自動化的 Slice」，它依然運行在 Redux 的單向資料流之上，能透過 Redux DevTools 進行監控。

### [整合至 Redux Store](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/b6589392-8a1d-467d-ab39-bb6f8cfd4530)

- API Slice 的「兩步掛載」
  - 第一步掛載 Reducer：在 Store 中劃定領地，用來存放快取資料與請求狀態。
- 第二步掛載 Middleware：啟動「後台管理員」，負責處理快取生命週期、垃圾回收與標籤失效機制。
- Middleware 的關鍵職責
  - 訂閱計數：追蹤有多少元件正在使用該資料，當計數歸零時啟動清除計時器（預設 60 秒）。
- 垃圾回收 (GC)：自動清理過期且無人使用的快取資料，節省記憶體。
- 執行引擎：Middleware 是主動偵聽意圖並執行網路請求的核心，缺少它會導致快取與自動同步功能完全失效。
- 透過 Redux DevTools 觀察狀態樹（如 queries、mutations、providedTags 分支），讓非同步資料流變得透明可追蹤。

## Q&A

- **Q:** 為什麼要使用 `[postsApi.reducerPath]` 這種動態語法，而不直接寫死字串？
  - 關鍵在於維持「單一事實來源（Single Source of Truth）」並避免一致性錯誤。
- 使用中括號的計算屬性名稱（Computed Property Name）是為了引用變數。如果未來在 `createApi` 中修改了 `reducerPath` 的名稱，Store 的掛載位置會自動同步更新。
- 若直接寫死字串（如 `postsApi: ...`），一旦兩邊名稱不一致，Middleware 會找不到資料儲存的路徑，導致快取與管理功能全面失效。
