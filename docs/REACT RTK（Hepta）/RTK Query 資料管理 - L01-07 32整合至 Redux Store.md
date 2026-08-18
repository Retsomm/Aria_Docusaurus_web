---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 1 堂：RTK Query 概念建立

# 32整合至 Redux Store

在上一節中，我們拆解了 RTK Query 的四大核心組件（`createApi`、`baseQuery`、`endpoints` 與自動生成的 Hooks），並理解了它們如何共同協作來定義一個「 API 服務」。然而，僅僅定義好這個服務是不夠的。

如果你曾經手動實作過 Redux，你應該知道一個 Slice 如果沒有被掛載到 Store 中，它就只是磁碟上的一段靜止程式碼，無法與應用程式的生命週期產生任何連結。RTK Query 的 API Slice 也是如此，但它的整合過程比一般的 `createSlice` 稍微複雜一些。

這不只是為了讓狀態生效，更是為了啟動 RTK Query 強大的「後台管理系統」。這一步，我們稱之為「 API Slice 的兩步掛載」。

## 為什麼不能只用 Reducer？

在傳統的 Redux 開發中，我們習慣將 `slice.reducer` 放入 `configureStore` 的 `reducer` 物件中。一旦掛載完成，Dispatch 一個 Action，狀態就會更新。對於處理「本地狀態」（Local Client State）來說，這已經綽綽有餘。

但 RTK Query 處理的是「遠端狀態」（Remote Server State）。遠端狀態比本地狀態多出了許多棘手的管理問題：

- **快取生命週期**：當沒有元件使用這份資料時，什麼時候該把它從記憶體中刪除？
- **請求去重複（Deduplication）**：當三個元件同時請求同一筆資料時，如何確保只發出一個網路請求？
- **自動重新抓取（Refetching）**：當視窗重新聚焦（Focus）或網路重連時，如何自動更新資料？
- **標籤失效（Invalidation）**：當執行了一個 Mutation（如新增貼文）後，如何通知相關的 Query 立即更新？

這些邏輯無法單純靠一個「被動」的 Reducer（純函數）來實現。Reducer 只能根據 Action 計算新狀態，它無法主動計時，也無法主動發起網路請求。因此，我們需要一個「主動」的偵聽者——這就是 **Middleware（中間件）** 扮演的角色。

## 第一步：掛載 Reducer 與定義地盤

首先，我們必須在 Redux State Tree 中為 API Slice 劃定一塊專屬的領地。這份領地將存放所有請求的狀態（Loading、Success、Error）以及實際抓取回來的快取資料。

### 使用 reducerPath 作為 Key

當我們使用 `createApi` 時，通常會定義一個 `reducerPath`（預設值通常是 `'api'`）。這個字串不只是個名字，它是該 Slice 在全域 Store 中的「身分證字號」。

```typescript
// services/postsApi.ts
export const postsApi = createApi({
  reducerPath: 'postsApi', // 明確定義這個 API Slice 的名稱
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    // ... endpoints
  }),
});

// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from './services/postsApi';

export const store = configureStore({
  reducer: {
    // 使用 postsApi.reducerPath 作為 key，確保一致性
    [postsApi.reducerPath]: postsApi.reducer,
    
    // 其他本地狀態 slice
    auth: authReducer,
    ui: uiReducer,
  },
});
```

**為什麼要使用 **`**[postsApi.reducerPath]**`** 這種動態語法？**
這是一個最佳實踐。雖然你可以手動寫死成 `postsApi: postsApi.reducer`，但 RTK Query 的內部邏輯（尤其是後續要提到的 Middleware）會頻繁地引用這個 `reducerPath`。如果兩者不一致，Middleware 就會找不到它要管理的資料夾，導致快取失效甚至報錯。透過引用物件屬性的方式，我們確保了「單一事實來源」（Single Source of Truth）。

## 第二步：啟動後台管理員——Middleware

這是整合過程中最容易被遺忘，也最關鍵的一步。如果說 Reducer 是「檔案櫃」，那麼 Middleware 就是那個「辦公室管理員」。

如果你漏掉了這一步，你的應用程式看起來可能還是正常的：第一個 `useQuery` 呼叫依然能抓到資料，畫面上也會顯示 Loading。但很快你會發現：**快取功能完全失效了**。每次切換頁面都會重新抓取、資料永不更新、甚至標籤失效機制完全沒反應。

### 如何正確連結 Middleware

在 `configureStore` 中，我們需要將 `api.middleware` 加入到 Redux 的中間件鏈條中：

```typescript
export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
  },
  // 加入這段 middleware 設定
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
```

這裡我們使用了 `.concat()` 而不是直接傳入一個陣列。這是因為 `getDefaultMiddleware()` 會回傳 Redux Toolkit 預設的一系列中間件（例如處理 Thunk 和序列化檢查的中間件）。我們希望保留這些基礎功能，並將 RTK Query 的管理員「增補」進去。

### Middleware 的具體職責：它在忙什麼？

當你正確掛載了 `postsApi.middleware` 後，它會開始全天候監控所有流經 Redux 的 Actions。以下是它的核心任務：

1. **管理訂閱計數（Subscription Counting）**：
每當一個元件掛載並呼叫 `useQuery(1)` 時，Middleware 會記錄：「ID 為 1 的資料多了一個訂閱者」。當所有使用該資料的元件都卸載（Unmount）時，它會啟動一個計時器（預設 60 秒）。
2. **垃圾回收（Garbage Collection）**：
承接上點，如果計時器歸零前都沒有新的元件訂閱該資料，Middleware 就會發出一個內部 Action，命令 Reducer 清除該筆快取，以節省記憶體。
3. **請求去重複（Deduplication）**：
如果元件 A 正在請求資料，而元件 B 幾乎在同一瞬間也發起了相同請求，Middleware 會攔截第二個請求，告訴它：「已經有人在路上了，你坐等結果就好」。
4. **處理標籤失效（Tag Invalidation）**：
當它偵測到一個帶有 `invalidatesTags` 的 Mutation 成功結束時，它會掃描快取，找出所有關聯的 Query 並強制它們重新發送請求。

**如果不掛載 Middleware 會怎樣？**
想像一下一個沒有管理員的圖書館。你可以借書（發起一次性請求），但沒有人登記誰借了什麼、沒有人催還書、更沒有人會在你還書後把書放回書架。最終，你的 Redux Store 會變成一堆雜亂且過時的資料碎片，完全失去了「狀態管理」的意義。

## 從 Redux DevTools 觀察全貌

理解了掛載邏輯後，最好的驗證方式就是打開瀏覽器的 **Redux DevTools**。這也是 RTK Query 優於傳統 `useState + useEffect` 的地方：**它的所有行為都是透明且可追蹤的。**

當你成功掛載 API Slice 並發起第一個請求後，你會在 State Tree 中看到如下結構（以 `reducerPath: 'api'` 為例）：

### 1. queries 分支

這是最繁忙的區域。它紀錄了所有 Query 的進度。

- 每個 Key 都是一個根據 Endpoint 名稱與參數生成的「快取鍵」（例如：`getPost({"id":1})`）。
- 內容包含 `status`（pending/fulfilled）、`data`（伺服器回傳的原始資料）、`endpointName` 以及 `requestId`。
- 你會看到 `fulfilledTimeStamp`，這是 Middleware 用來判斷資料是否過時的依據。

### 2. mutations 分支

類似於 queries，但紀錄的是 `builder.mutation` 的執行狀況。這對於追蹤「新增/修改/刪除」操作是否成功非常有用，特別是在處理複雜的 UI 反饋時。

### 3. providedTags 分支

這是 RTK Query 實現自動同步的秘密武器。它紀錄了目前有哪些資料標記了哪些標籤。

- 例如，如果 `getPost(1)` 提供了一個 `[{ type: 'Posts', id: 1 }]` 標籤，這裡就會建立索引。
- 當一個刪除貼文的動作聲稱它會失效（invalidate） `Posts` 標籤時，RTK Query 就能透過這個分支迅速找到哪些 Query 需要被重刷。

### 4. config 分支

存放了全域的配置資訊，例如網路狀態（online/offline）以及目前的訂閱狀況。

## 整合後的狀態管理哲學

透過這兩步掛載，我們實質上將 RTK Query 納入了 Redux 的統一管轄之下。這帶來了一個深刻的架構轉變：**你的遠端資料不再漂浮在組件的 **`**useEffect**`** 裡，而是變成了全域狀態的一部分。**

這意味著：

- **跨組件共享**：組件 A 和組件 B 可以呼叫同一個 `useQuery` Hook。得益於 Middleware 的協調，它們會共享同一份在 Store 裡的資料，且不會觸發兩次網路請求。
- **時光旅行調試**：你可以透過 DevTools 看到資料什麼時候進來、什麼時候被標記為失效、什麼時候被清除。
- **與本地狀態並行**：你的 `auth` slice（存儲登入 token）和 `postsApi` slice 住在同一個 Store 裡。你可以讓 API Slice 的 `baseQuery` 直接去讀取 `auth` slice 裡的狀態，實現自動帶入 Header 的功能。

## 總結與銜接

在本小節中，我們學會了如何將定義好的 API Slice 正式「激活」。這不僅僅是把 Reducer 放進 Store，更重要的是透過 Middleware 啟動了 RTK Query 的自動化管理引擎。

我們強調了：

1. **兩步掛載**：`reducer` 負責提供空間，`middleware` 負責提供邏輯。
2. **Middleware 的不可或缺性**：它是快取、去重複、失效機制的靈魂。
3. **DevTools 的視覺化**：透過觀察 `queries` 和 `providedTags` 等分支，我們可以直觀地理解資料如何在應用程式中流動。

到目前為止，我們已經完成了所有「概念性」與「架構性」的準備。你已經知道了 RTK Query 解決了什麼痛點、它在架構中的定位，以及如何將它正確地配置到 Redux 環境中。

**這堂課的概念教學內容到此結束。** 

下一堂課（Topic 2），我們將正式轉入「實作模式」。我們將從撰寫 `createApi` 的具體參數開始，定義第一個實際的 Query Endpoint，並學習如何在 React 元件中使用那些神奇的自動生成 Hooks。準備好你的編輯器，我們要開始寫第一個真正的 RTK Query 服務了！
