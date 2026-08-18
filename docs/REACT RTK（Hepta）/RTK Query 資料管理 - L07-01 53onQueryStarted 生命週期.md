---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 7 堂：樂觀更新實作

# 53onQueryStarted 生命週期

想像一下，當你在社交媒體上點擊「按讚」按鈕時，如果畫面上那個紅色的愛心要等到伺服器回傳「更新成功」（通常需要 200ms 到 2 秒不等）才亮起，你會覺得這個 App 反應遲鈍、充滿「重感」。

為了追求極致的使用者體驗，現代網頁應用通常會採用**樂觀更新（Optimistic Updates）**：在請求發出的那一刻，不論成功與否，我們先「假裝」伺服器一定會成功，立即更新 UI；如果最後伺服器回報錯誤，我們再悄悄地把資料「回滾（Rollback）」到先前的狀態。

在 RTK Query 中，實現這套「先斬後奏」邏輯的核心舞台，就是 `onQueryStarted` 生命週期鉤子。

## 什麼是 onQueryStarted？

在之前的課程中，我們定義 Mutation Endpoint 時，通常只關注 `query` 本身（定義 URL、Method、Body）。但如果你需要在請求發送的**特定時間點**執行額外的邏輯（例如修改 Store、彈出通知、或是手動追蹤分析數據），你就需要 `onQueryStarted`。

它是定義在 `builder.mutation` 內部的一個選用回呼函式（Callback Function）。其核心特性在於它的**呼叫時機**：

> `onQueryStarted` 會在 Mutation 的請求被發送後的「第一時間」同步觸發，它**完全不會等待**伺服器的回應。

這意味著當你的程式碼進入 `onQueryStarted` 時，網路請求才剛剛出發，伺服器可能甚至還沒收到封包。這正是我們介入並提前修改本地快取的最佳時機。

## 參數解析：你手上的工具箱

`onQueryStarted` 接收兩個參數，這兩個參數提供了實作樂觀更新所需的一切資訊：

1. `**arg**`** (Mutation Argument)**：
這是你呼叫 `useMutation` 的觸發函式時傳入的參數。例如你執行 `updateTodo({ id: 1, text: '買牛奶' })`，那麼這裡的 `arg` 就是這個物件。我們需要用它來決定要更新快取中的哪一筆資料。
2. `**api**`** 物件**：
這是一個包含多種工具的物件，最常用的有：
  - **`dispatch`**：Redux 的標準 dispatch。我們將用它來觸發 `api.util.updateQueryData`（下一節課的主角）來手動改寫快取。
- **`queryFulfilled`**：這是一個 **Promise**，代表了該次請求的最終命運。
- **`getState`**：允許你在邏輯中讀取當前 Redux Store 的狀態。
- **`requestId`**：該次請求的唯一識別碼。

### 程式碼結構範例

讓我們先看一個基礎的結構，感受一下 `onQueryStarted` 在 Endpoint 中的位置：

```typescript
const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    updatePost: builder.mutation<Post, Partial<Post>>({
      query: ({ id, ...patch }) => ({
        url: `posts/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      // 樂觀更新的舞台
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // 1. 請求剛發送，這裡可以執行「樂觀更新」邏輯
        console.log('請求已發送，參數為：', arg);

        try {
          // 2. 等待請求結果
          const { data } = await queryFulfilled;
          // 如果走到這裡，代表伺服器回傳成功 (2xx)
          console.log('伺服器回應成功：', data);
        } catch (error) {
          // 3. 如果走到這裡，代表請求失敗 (4xx, 5xx 或網路錯誤)
          // 這裡通常執行「回滾（Rollback）」邏輯，把 UI 改回原狀
          console.error('請求失敗，準備回滾：', error);
        }
      },
    }),
  }),
});
```

## 深入理解 queryFulfilled

`queryFulfilled` 是 `onQueryStarted` 中最關鍵的設計。它本質上是一個封裝過的 Promise，其行為遵循標準的非同步邏輯：

- **當伺服器回應 2xx 成功狀態碼時**：Promise 會 Resolve。其解析出的值是一個包含 `data`（伺服器回傳的 Body）與 `meta`（HTTP Response 資訊）的物件。
- **當伺服器回應 4xx/5xx 錯誤或發生網路連線問題時**：Promise 會 Reject。這會直接觸發 `try...catch` 中的 `catch` 區塊。

### 為什麼不直接在元件裡處理？

你可能會問：「我不能在 React 元件呼叫 `trigger().unwrap()` 之後再處理嗎？」

答案是：**不行**。因為當 `unwrap()` 完成時，伺服器已經回應了。如果你等到那時候才更新 UI，那就不是「樂觀更新」，而是普通的「悲觀更新」（先看結果再更新 UI）。

為了達到「樂觀」的效果，我們必須在 `await queryFulfilled` **之前**就先動手腳修改快取，然後利用 `queryFulfilled` 的 Reject 機制來確保「萬一錯了能改回來」。

## 宣告式 vs 指令式：兩種同步策略的對決

在 RTK Query 中，我們有兩種方式可以確保 Mutation 後的資料一致性。理解它們的差異至關重要：

### 1. 宣告式：invalidatesTags (標籤失效)

這是我們之前學過的模式。你宣告「這個 Mutation 會讓某些標籤失效」，RTK Query 發現標籤失效後，會**自動**去執行一次 `GET` 請求重新抓取資料。

- **優點**：程式碼簡單，保證資料絕對與伺服器同步（Single Source of Truth）。
- **缺點**：慢。使用者必須等待：`Mutation 請求完成` + `新的 Query 請求完成`。中間通常會出現 Loading 轉圈圈。

### 2. 指令式：onQueryStarted (樂觀更新)

這是我們現在正在學習的模式。你**手動**介入快取更新流程，告訴 RTK Query：「別去抓新的了，我直接告訴你現在快取長什麼樣子。」

- **優點**：極速。使用者感覺不到任何延遲，UI 立即反應。
- **缺點**：邏輯複雜。你需要自己寫邏輯去修改快取，還要處理失敗時的回滾，如果邏輯寫錯，會導致前端資料與伺服器不一致（即所謂的「髒資料」）。

| 特性 | invalidatesTags | onQueryStarted (樂觀更新) |
| --- | --- | --- |
| **自動化程度** | 高（框架處理） | 低（手動編寫） |
| **UI 反應速度** | 取決於網路（較慢） | 即時（極快） |
| **資料精準度** | 絕對精準 | 取決於開發者邏輯 |
| **網路消耗** | 產生額外的 GET 請求 | 節省一次 GET 請求 |
| **適用場景** | 大多數普通操作 | 頻繁操作、高度要求反應速度的 UI（如：按讚、排序、標記完成） |

## 實踐建議：如何選擇？

並非所有的 Mutation 都需要寫 `onQueryStarted`。

- **情境 A：刪除一筆資料**。如果刪除失敗但 UI 已經把資料隱藏了，使用者會非常困惑甚至憤怒。對於這種「破壞性」操作，除非反應速度極其重要，否則通常建議使用 `invalidatesTags`。
- **情境 B：修改 Todo 的完成狀態**。這是一個切換（Toggle）操作，使用者點擊頻率可能很高。這就是 `onQueryStarted` 發光發熱的時刻。即便失敗了，我們把勾選框「跳回」未完成狀態，這對使用者來說是可以接受的微小抖動。

## 總結

`onQueryStarted` 是 RTK Query 提供的一個強大的底層生命週期工具。它賦予了我們在請求發送的瞬間執行邏輯的能力，並透過 `queryFulfilled` 這個 Promise 讓我們能精確掌握請求的成敗。

它是樂觀更新的「架構基礎」，但要真正完成樂觀更新，我們還差一塊拼圖：**如何手動修改那個已經存在的快取資料？**

## 知識回顧與銜接

### 關鍵要點

- `onQueryStarted` 是在請求**發送後**立即執行的同步鉤子。
- `arg` 是 Mutation 的輸入參數，`api` 提供 `dispatch` 與 `queryFulfilled`。
- `queryFulfilled` 是一個 Promise，用來判斷請求成功（Resolve）或失敗（Reject）。
- 它是**指令式**的邏輯，與**宣告式**的標籤失效機制互補。

### 下一部分預告

在了解了生命週期後，下一節我們將學習如何使用 `dispatch(api.util.updateQueryData(...))`。這是一個極其強大的工具，它結合了 Immer.js 的魔力，讓你可以像修改普通 JavaScript 物件一樣，直接「預先修改」Redux Store 中的快取資料，並在失敗時一鍵復原。
