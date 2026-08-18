---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 7 堂：樂觀更新實作

# 54patchQueryData 預修改快取

想像你在使用 Facebook 或 Instagram 點擊「讚」按鈕。如果點擊後，按鈕要等待 0.5 秒甚至 1 秒，直到伺服器回傳成功後才變成藍色，你會覺得這個 App 反應遲鈍。為了提供極致的流暢感，現代前端開發通常會採用「樂觀更新」（Optimistic Updates）：在請求發送的瞬間，我們就大膽地假設請求會成功，直接修改本地快取讓 UI 立即跳轉，若最後不幸失敗了，再默默地把資料還原。

在 RTK Query 中，實現這一機制的關鍵就是 `updateQueryData` 與它提供的「回滾（Rollback）」工具。

## 核心工具：updateQueryData

要手動修改 RTK Query 的快取資料，我們不能直接去動 Redux Store，而是必須透過 `api.util.updateQueryData` 這個 Action Creator。它的設計非常精妙，結合了 Immer.js 的特性，讓你能夠以最直覺的方式描述「我想要快取變成什麼樣子」。

### API 參數拆解

`dispatch(api.util.updateQueryData(endpointName, arg, recipe))` 接收三個核心參數：

1. `**endpointName**`** (string)**: 你想要修改哪一個 Query Endpoint 的快取？例如 `'getPosts'` 或 `'getPostById'`。
2. `**arg**`** (any)**: 這點極其重要。RTK Query 的快取是根據參數（Cache Key）來隔離的。如果你要修改的是 ID 為 `1` 的文章，你的 `arg` 就必須是 `1`。這能確保你修改的是正確的快取條目。如果該 Endpoint 不需要參數，這裡則傳入 `undefined`。
3. `**recipe**`** (callback)**: 一個函數，接收當前快取的「草稿（Draft）」。由於內部集成了 Immer，你可以直接對這個 `draft` 進行修改（例如 `draft.title = '新標題'`），而不需要處理繁瑣的展開運算子（Spread Operator）。

### 取得回滾工具：patchResult

當你執行 `dispatch(updateQueryData(...))` 時，它會回傳一個物件，我們通常稱之為 `patchResult`。這個物件包含一個極其重要的函式：`.undo()`。

```typescript
const patchResult = dispatch(
  api.util.updateQueryData('getPosts', undefined, (draft) => {
    // 修改邏輯...
  })
);

// 如果後續發生錯誤，只需呼叫：
// patchResult.undo();
```

這就像是一張「後悔藥」。當你執行 `undo()` 時，RTK Query 會自動將快取恢復到執行 `updateQueryData` 之前的精確狀態，這為樂觀更新失敗後的處理提供了完美的支撐。

---

## 標準實作流程：四步驟模板

實作樂觀更新時，我們通常會在 Mutation 的 `onQueryStarted` 生命週期中撰寫邏輯。以下是開發者公認的標準實作流程，建議你將其視為一個開發模板：

### 1. 先斬後奏：立即修改快取

在請求發送前，立即使用 `updateQueryData` 修改受影響的 Query 快取。這一步會讓元件重新渲染，使用者會看到「已更新」的 UI。

### 2. 存下後悔藥

將 `updateQueryData` 回傳的 `patchResult` 存儲在變數中。

### 3. 等待判決

使用 `await queryFulfilled` 觀察請求結果。我們必須將這部分包裹在 `try...catch` 區塊中。

### 4. 若失敗，則回滾

在 `catch` 區塊中，呼叫 `patchResult.undo()`。如果請求失敗（例如 500 錯誤或網路斷線），快取會瞬間回到原始狀態，UI 也會隨之校正。

---

## 實戰範例：更新文章標題

讓我們透過一個具體的範例來理解：假設我們有一個 `getPosts` 的列表 API，現在我們要實作 `updatePost` 的樂觀更新。當使用者修改某篇文章標題時，列表中的標題要立刻變更。

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Post {
  id: number;
  title: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.com' }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    // 這是我們想要優化的對象：文章列表
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: 'Post' as const, id })), { type: 'Post', id: 'LIST' }]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    // 這是觸發修改的 Mutation
    updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      // 在這裡實作樂觀更新
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        /**
         * 第一步：手動修改「文章列表」的快取
         * 我們針對 'getPosts' 這個 endpoint，參數為 undefined (因為列表沒參數)
         */
        const patchResult = dispatch(
          postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
            // 在 draft 中找到那篇文章並直接修改
            // Immer 會處理不可變更新，我們只需要直接賦值
            const post = draft.find((p) => p.id === id);
            if (post) {
              post.title = patch.title ?? post.title;
            }
          })
        );

        try {
          // 第二步：等待 API 真實的回應
          await queryFulfilled;
          // 如果成功，不需做任何事，快取已經是我們想要的樣子了
        } catch {
          /**
           * 第三步：如果 API 失敗了，執行回滾
           * 這會讓 UI 標題跳回原本舊的值，確保資料一致性
           */
          patchResult.undo();
          
          // 可選：在這裡顯示一個錯誤提示 (Toast) 讓使用者知道更新失敗
          console.error('更新失敗，已自動回滾資料');
        }
      },
    }),
  }),
});
```

### 為什麼這比傳統方法好？

如果不使用樂觀更新，你可能會這樣寫：

1. 觸發 `updatePost`。
2. 等待 API 回傳成功。
3. 使用 `invalidatesTags` 讓 `getPosts` 失效。
4. `getPosts` 重新發送請求抓取資料。

**這種傳統做法的問題在於：**

- **延遲**：使用者在步驟 1 到步驟 4 之間會看到舊資料或轉圈圈（Loading）。
- **網路浪費**：為了更新一個小小的標題，你被迫重新抓取整個文章列表。

**使用樂觀更新後：**

- **零延遲**：UI 在步驟 1 瞬間更新。
- **精確控制**：你只修改了快取中特定的一筆資料，完全不需要重新發起網路請求。

---

## 關鍵細節：精確匹配 Cache Key

在實作時，最容易踩到的坑是 `arg` 匹配錯誤。請記住，RTK Query 的快取條目是與參數綁定的。

假設你的 API 定義如下：

```typescript
getPostById: builder.query<Post, number>({
  query: (id) => `/posts/${id}`
})
```

如果你想對 `getPostById(5)` 進行樂觀更新，你的 `updateQueryData` 必須寫成：

```typescript
dispatch(
  postsApi.util.updateQueryData('getPostById', 5, (draft) => {
    draft.title = '新標題';
  })
);
```

如果你這裡傳入的參數不是 `5`（例如傳成了字串 `'5'` 或 `undefined`），RTK Query 將無法找到對應的快取條目，你的修改就不會產生任何效果。這就是為什麼我們說 `arg` 是用來精確定位「快取地圖」中的座標。

---

## 樂觀更新 vs. 標籤失效

你可能會問：「既然我手動修改了快取，那還需要 `invalidatesTags` 嗎？」

答案是：**視情況而定，但通常可以並存。**

1. **純樂觀更新**：如果你非常有把握手動修改後的快取內容與伺服器回傳的一模一樣，你可以不寫 `invalidatesTags`。這樣可以節省一次網路請求。
2. **保險模式**：在 `onQueryStarted` 中做樂觀更新提供即時回饋，同時保留 `invalidatesTags`。這樣當 Mutation 結束後，RTK Query 會在背景偷偷重新抓取一次最新資料，確保萬一你的樂觀更新邏輯（Recipe）寫錯了，最終資料也能被校正。這被認為是最穩健的做法。

### 總結開發者心法

- **讀取 (Query)**：定義資料如何被獲取與貼標籤。
- **寫入 (Mutation)**：定義副作用。
- **樂觀更新 (onQueryStarted)**：在副作用發生的「當下」進行快取欺騙，提升使用者體驗。
- **回滾 (undo)**：保證即便欺騙失敗，應用程式也不會陷入狀態混亂。

透過這種模式，你將原本枯燥的「發送請求 -> 等待 -> 更新 UI」流程，轉化為具備現代化 App 質感的「即時回應 -> 背景同步 -> 錯誤自癒」體系。

---

## 快取預修改的實作深度

在這一部分，我們深入探討了如何利用 `updateQueryData` 與 `onQueryStarted` 構建流暢的「樂觀更新」體驗。你學會了如何精確定位快取條目、使用 Immer 的 Recipe 語法進行直觀修改，以及在請求失敗時利用 `patchResult.undo()` 實現無縫回滾。這種「先斬後奏」的策略是提升前端應用質感的關鍵技術。

然而，在真實的專案開發中，手動修改快取往往涉及到複雜的資料結構。為了確保我們在修改快取時不會因為拼錯屬性名稱或型別錯誤而導致崩潰，下一部分我們將探討如何利用 TypeScript 的強大能力，為樂觀更新流程加上型別防護罩。我們將深入研究 `Draft<T>` 的型別推導，確保你的「快取修改方子（Recipe）」是絕對安全的。
