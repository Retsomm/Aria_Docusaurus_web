---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 3 堂：createApi 與 Query

# 39掛載至 Store

在前面的章節中，我們已經成功定義了 `postsApi`，並在其中宣告了如 `getPosts` 與 `getPostById` 等端點（Endpoints）。但此時的 `postsApi` 就像是一台造價昂貴、設計精密的法拉利引擎，雖然內部邏輯完美，但如果沒有將它安裝進車架（Redux Store），並接上燃油管線與電路系統（Middleware），它終究無法發動，也無法為你的 React 應用程式提供任何動力。

本節的核心任務，就是學習如何將這台「資料引擎」正確地整合進 Redux 的心臟——`configureStore`。這不只是單純的匯入與掛載，更涉及到 RTK Query 如何利用 Redux 的機制來管理快取生命週期與背景同步。

## 為何 API Slice 需要手動掛載？

你可能會好奇：「既然 RTK Query 已經幫我生成了 Hooks（如 `useGetPostsQuery`），為什麼我還需要去動 Redux Store 的設定？」

這是因為 RTK Query 並不是一個獨立於 Redux 之外的庫，它是**建立在 Redux 基礎之上**的抽象層。當你呼叫一個 Hook 時，底層發生的事情依然遵循 Redux 的標準流程：

1. **發送 Action**：Hook 觸發一個「請求開始」的 Action。
2. **狀態更新**：Reducer 接收 Action，在 Store 中開闢一塊空間標記 `loading: true`。
3. **副作用處理**：Middleware 攔截到 Action，發送真正的網路請求。
4. **結果寫入**：請求成功後，Middleware 發送「請求完成」的 Action，將資料寫入 Store 的快取區域。

如果我們不將 `postsApi` 的 Reducer 與 Middleware 接入 Store，上述的流程就會斷裂。

---

## 第一步：掛載 Reducer 與命名空間

首先，我們必須在 Store 中為 API Slice 預留一個專屬的「房間」。這個房間的名稱必須與我們在 `createApi` 中定義的 `reducerPath` 完全一致。

### 使用計算屬性名稱 (Computed Property Names)

在設定 `reducer` 時，強烈建議使用 `[postsApi.reducerPath]` 這種動態語法，而不是手動輸入字串。

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '../services/postsApi'; // 假設你的 api 定義在此

export const store = configureStore({
  reducer: {
    // 1. 掛載 API Reducer
    // 使用計算屬性名稱，確保這裡的 key 與 postsApi 定義中的 reducerPath 絕對同步
    [postsApi.reducerPath]: postsApi.reducer,
    
    // 這裡可以繼續放其他的 slice，例如本地的 authSlice 或 uiSlice
    // auth: authReducer,
  },
});
```

**為什麼要這麼做？**
這體現了**單一事實來源（Single Source of Truth, SSOT）**的原則。如果你在 `postsApi.ts` 中將 `reducerPath` 改名為 `'api/v2'`，而 Store 這裡還是寫死的 `'postsApi'`，整個應用程式就會瞬間崩潰，因為 Hook 會去尋找不存在的 State 分支。使用 `[postsApi.reducerPath]` 能保證兩者永遠同步，這是 TypeScript 專案中避免低級 Bug 的最佳實踐。

---

## 第二步：掛載 Middleware —— RTK Query 的大腦

如果說 Reducer 是「儲存室」，那麼 Middleware 就是這套系統的「大腦」或「指揮官」。這是掛載過程中**最重要且最容易被遺忘**的一步。

### Middleware 的職責

RTK Query 的 Middleware 負責處理所有「自動化」的邏輯，包括：

- **快取管理（Caching）**：追蹤哪些組件正在使用哪些資料。當最後一個組件卸載後，它會啟動倒數計時器，決定何時清空快取。
- **請求去重複（Deduplication）**：如果你在 10 毫秒內同時發送了 5 個 `getPosts` 請求，Middleware 會攔截後 4 個，確保只有 1 個請求真正發往伺服器，但 5 個組件都能拿到結果。
- **標籤失效機制（Invalidation）**：當你執行一個 Mutation（如新增文章）後，Middleware 會負責通知相關的 Query 重新抓取資料。
- **背景同步**：處理視窗重新聚焦（refetchOnFocus）或網路重連時的自動刷新。

### 正確的掛載語法

在 `configureStore` 中，我們使用 `getDefaultMiddleware().concat(postsApi.middleware)` 來加入它：

```typescript
export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
  },
  // 2. 加入 API Middleware
  // 這能啟用快取、無效化（invalidation）、輪詢（polling）等各種功能
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
```

### 🚨 警告：千萬不要直接覆寫 Middleware

這是一個初學者常犯的致命錯誤。如果你寫成這樣：

```typescript
// ❌ 錯誤示範：這會摧毀預設功能
middleware: [postsApi.middleware], 
```

這會導致 Redux 預設的所有 Middleware（如處理 Thunk 的 `redux-thunk`、開發環境的 `serializableCheck` 等）全部消失。你的應用程式可能會出現無法發送非同步請求或 DevTools 報錯的問題。請務必使用 `concat()` 或 `prepend()` 來進行擴充。

---

## 第三步：TypeScript 型別整合

在 TypeScript 專案中，我們通常需要導出 `RootState` 與 `AppDispatch` 型別，以便在組件或自定義 Hook 中使用。當掛載了 API Slice 後，這些型別會自動包含 API 的狀態結構。

```typescript
// src/app/store.ts 完整範例

import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '../services/postsApi';

export const store = configureStore({
  reducer: {
    // 掛載 api reducer
    [postsApi.reducerPath]: postsApi.reducer,
  },
  // 加入 api middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});

// 從 store 本身推導出 `RootState` 與 `AppDispatch` 型別
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

如果你現在打開 Redux DevTools 觀察狀態樹，你會發現多了一個名為 `posts` (或是你設定的 `reducerPath`) 的分支。在裡面，你會看到 `queries`、`mutations`、`providedAdHoc` 等內部結構。**請記住：永遠不要手動去修改這塊區域的資料**，它應該完全交由 RTK Query 的 Middleware 來打理。

---

## 進階：如何組織多個 API Slice？

在大型專案中，你可能會面對多個後端服務（例如一個是負責文章的 CMS API，另一個是負責天氣的第三方 API）。雖然 RTK Query **強烈建議在大多數情況下只使用一個 API Slice**（透過在 `endpoints` 中定義所有內容），但如果你確實需要拆分，掛載方式如下：

```typescript
// 假設有兩個 API Slices
import { postsApi } from './services/postsApi';
import { weatherApi } from './services/weatherApi';

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(postsApi.middleware)
      .concat(weatherApi.middleware),
});
```

**小貼士：** 當你有多個 API Slice 時，`concat` 可以鍊式調用。但請謹慎評估是否真的需要多個 Slice，因為多個 Slice 之間的「標籤失效機制（Tag Invalidation）」是無法跨 Slice 運作的。

---

## 常見設定錯誤檢查清單

在你準備進入下一單元之前，請快速檢查你的 `store.ts` 是否符合以下標準：

1. **[ ] 命名空間匹配**：是否使用了 `[api.reducerPath]` 作為 Reducer 的 key？
2. **[ ] Middleware 存在**：是否在 `middleware` 欄位中加入了 `api.middleware`？
3. **[ ] 使用 concat**：是否保留了預設的 Middleware（`getDefaultMiddleware()`）？
4. **[ ] 型別導出**：是否導出了 `RootState` 以供後續 `useSelector` 使用？

## 思考練習：如果忘記掛載 Middleware 會怎樣？

假設你正確掛載了 Reducer，但**忘記**掛載 Middleware。當你在組件中調用 `useGetPostsQuery()` 時：

- **會發送請求嗎？** 會，Hook 內部會嘗試發送。
- **會有資料嗎？** 不會。因為 Middleware 是負責將「請求成功的回應」寫入 Store 的。沒有 Middleware，回應就像掉進了黑洞，Store 裡的 `data` 永遠會是 `undefined`。
- **Loading 狀態會改變嗎？** 通常會卡在 `isLoading: true`，因為沒有 Middleware 來告訴 Reducer 請求已經結束了。

這就是為什麼 Middleware 被稱為 RTK Query 靈魂的原因。

## 總結與銜接

掛載 Store 是 RTK Query 從「定義」轉向「運行」的關鍵橋樑。通過 `reducerPath` 確保了狀態樹的組織有序，而 `middleware` 則為我們處理了所有複雜的非同步邏輯與快取維護。

到目前為止，我們已經完成了後台的所有準備工作：

1. 定義了 API 的行為（Part 1）。
2. 搭建了運行的環境（Part 2 - 本節）。

接下來，我們將正式進入 React 組件的世界。在下一節中，我們將深度剖析自動生成的 `useQuery` Hook。你會發現，由於我們已經在 Store 中正確掛載了這一切，提取資料將變得前所未有的簡單——只需要一行程式碼，就能同時獲得資料、Loading 狀態、甚至是詳細的錯誤訊息。讓我們來看看 `isLoading` 與 `isFetching` 到底有什麼細微但重要的區別。
