---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 5 堂：標籤快取同步機制

# 46invalidatesTags 實作

在前一部分中，我們學習了如何使用 `providesTags` 為快取資料貼上「標籤」。如果說 `providesTags` 是為資料建立了一張張身份證，那麼本節要探討的 `invalidatesTags` 就是 RTK Query 中的「資料狙擊手」。

當我們執行新增、修改或刪除（Mutation）操作時，伺服器上的資料已經發生變動，但前端快取裡的資料還是舊的。這時，「狙擊手」會根據你指定的標籤，精準地擊落那些已經過時的快取，強迫相關的 Query 重新發送請求。這套機制讓我們不再需要手動在 `useEffect` 裡呼叫 `refetch`，實現了真正的宣告式資料同步。

---

## 什麼是 invalidatesTags？

`invalidatesTags` 是 `builder.mutation` 定義中的一個核心屬性。它的職責非常單一且明確：**當一個 Mutation 成功執行後，告訴 RTK Query 哪些標籤對應的快取已經「失效（Stale）」了。**

當 RTK Query 偵測到某個標籤被失效時，它會查看目前畫面上是否有任何元件正在訂閱（Subscribe）擁有該標籤的 Query。如果有，RTK Query 會自動在背景重新發起請求，抓取最新資料並更新 UI。

### 核心運作流程

1. **發起 Mutation**：使用者點擊「儲存修改」。
2. **執行成功**：伺服器回傳 200 OK。
3. **觸發失效**：RTK Query 執行 `invalidatesTags` 中定義的邏輯。
4. **標籤匹配**：系統在 Store 中搜尋所有擁有匹配標籤的快取條目。
5. **自動重新抓取**：被標記為失效且仍有元件在使用的 Query，會自動觸發 `refetch`。

這就是 RTK Query 的「自動同步循環」。你只需要宣告「誰依賴誰」，剩下的繁瑣工作（判斷何時該更新列表、何時該更新單筆資料）都交給框架處理。

---

## 重點實作：精準失效 vs. 全量失效

在設計 API Slice 時，我們會面臨不同的失效需求。以下透過一個部落格文章（Posts）的實作範例，來對比兩種常見的設計策略。

### 1. 精準失效 (Granular Invalidation)

當我們「修改」一篇文章時，理想情況下我們只希望：

- 該文章的單筆詳細資料（`getPostById`）重新抓取。
- 文章列表（`getPosts`）重新抓取（因為標題可能變了）。
- **但是**，其他不相關的文章快取（例如 ID 不同的文章）應該保持原樣，不應受到波及。

這就是為什麼我們需要 `{ type: 'Post', id }` 這種精細的物件格式。

### 2. 全量失效與 LIST 標籤

當我們「新增」一篇文章時，我們並不知道新文章的 ID 是多少，但我們確信「文章列表」必須更新。這時我們會使用一個特殊的標籤，例如 `{ type: 'Post', id: 'LIST' }`。失效這個標籤，就像是按下了列表的重新整理鍵。

讓我們看看具體的程式碼實現：

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Post {
  id: number;
  title: string;
  content: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post'], // 1. 先定義標籤型別
  endpoints: (builder) => ({
    // Query: 提供標籤
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' }, // 額外提供一個 LIST 標籤
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Mutation: 使標籤失效
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      // 新增文章後，只需要讓 LIST 標籤失效，列表就會自動重抓
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    updatePost: builder.mutation<Post, Post>({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: patch,
      }),
      // 修改文章後，讓該特定 ID 失效
      // 這會同時觸發 getPostById(id) 以及 getPosts(因為列表裡也有這個 ID)
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),
    
    deletePost: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      // 刪除後，需要讓該 ID 消失，且列表必須更新
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' }
      ],
    }),
  }),
});
```

### 為什麼這比寫 `useEffect` 好？

想像一下，如果沒有這套機制，當你點擊「刪除文章」後，你必須：

1. 手動在刪除元件中發送 `delete` 請求。
2. 等待請求成功。
3. 想辦法通知「文章列表元件」去重新呼叫 `fetchPosts`。
4. 如果其他頁面也顯示了這篇文章的標題，你還要通知它們也更新。

在 RTK Query 中，你只需要在 `deletePost` 宣告 `invalidatesTags`。無論你的專案架構多複雜，只要有元件「訂閱」了對應的標籤，它們就會自動同步。這大大降低了 UI 不一致的風險。

---

## 萬用標籤 (The Nuclear Option) 的代價

在設定 `invalidatesTags` 時，你可能會偷懶寫成：

```typescript
invalidatesTags: ['Post']
```

當你傳遞一個單純的字串（標籤型別）而不是物件時，RTK Query 會執行「全量失效」。

**這意味著什麼？**
如果你的 Store 裡快取了 100 篇文章的內容，當你只更新其中一篇時，寫 `['Post']` 會導致這 100 篇文章的快取全部失效。當使用者切換回其他文章時，系統必須重新發送 100 個網路請求來填充資料。

- **優點**：程式碼簡單，絕對不會漏掉更新。
- **缺點**：極度浪費效能，會造成不必要的伺服器壓力與 Loading 閃爍。

**最佳實踐：** 除非你是在做「登出」或「清空所有資料」的操作，否則**永遠優先使用 **`**{ type: 'Post', id }**`** 的物件格式**來進行精準擊落。

---

## 進階技巧：動態失效與條件判斷

`invalidatesTags` 不僅可以是一個陣列，還可以是一個**回傳陣列的函式**。這讓你可以根據請求的結果或參數，動態決定要失效哪些資料。

### 回呼函式的參數

`invalidatesTags: (result, error, arg) => []`

- `result`: 伺服器回傳的成功資料。
- `error`: 請求失敗時的錯誤資訊。
- `arg`: 你呼叫 mutation trigger 時傳入的參數。

### 場景：僅在請求成功時失效

雖然 RTK Query 預設只在 Mutation 成功時觸發失效，但有時我們想寫得更明確，或者根據特定的錯誤碼（如 403）決定不執行失效：

```typescript
updatePost: builder.mutation<Post, Post>({
  query: (data) => ({ url: `/posts/${data.id}`, method: 'PATCH', body: data }),
  invalidatesTags: (result, error, { id }) => {
    if (error) {
      console.error('更新失敗，不觸發快取刷新');
      return []; // 返回空陣列，不失效任何東西
    }
    // 成功時，失效特定的 ID
    return [{ type: 'Post', id }];
  }
})
```

### 場景：批量操作 (Batch Operations)

假設你有一個 `bulkDeletePosts(ids: number[])` 的功能，你可以這樣寫：

```typescript
bulkDeletePosts: builder.mutation<void, number[]>({
  query: (ids) => ({
    url: '/posts/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: (result, error, ids) => [
    ...ids.map(id => ({ type: 'Post' as const, id })),
    { type: 'Post', id: 'LIST' }
  ],
})
```

這段程式碼展示了 `invalidatesTags` 的強大靈活性：它可以一次性發射一整排導彈，精準擊落所有被刪除的文章快取，同時更新列表標籤。

---

## 常見設計錯誤與排查

在實作標籤失效時，新手最常遇到的問題是「為什麼 Mutation 成功了，但畫面沒更新？」。請檢查以下三點：

1. **標籤名稱拼錯**：`providesTags` 寫的是 `Post`，但 `invalidatesTags` 寫成了 `Posts`。這在 JavaScript 中很常見，但在 TypeScript 中可以透過 `tagTypes` 嚴格限制來避免。
2. **ID 格式不統一**：快取裡的 ID 是數字 `123`，但 Mutation 傳入的是字串 `"123"`。RTK Query 使用嚴格相等判斷，格式不對就無法匹配。
3. **忘記提供 ID**：在 Query 端只提供了 `['Post']` 字串標籤，但在 Mutation 端卻試圖失效 `{ type: 'Post', id: 5 }`。這是不會生效的，因為**失效的標籤必須是提供標籤的子集或完全匹配**。

### 標籤匹配的黃金準則

> **「失效者」必須包含「提供者」標籤的所有屬性。**
>
> - 失效 `{ type: 'Post' }` 會擊落 **所有** 提供 `Post` 型別的快取（包含任何 ID）。
> - 失效 `{ type: 'Post', id: 1 }` **只會** 擊落提供 `{ type: 'Post', id: 1 }` 的快取。

---

## 標籤系統的閉環

現在，我們可以完整勾勒出 RTK Query 的資料流了。請記住這個心智模型：

1. **Query** 透過 `providesTags` 向系統宣告：「我這份資料的標籤是 A 和 B」。
2. **Mutation** 透過 `invalidatesTags` 宣告：「我執行完了，標籤 A 現在是過時的」。
3. **RTK Query** 發現標籤 A 失效，主動尋找「誰還在用標籤 A？」。
4. **自動發起 Refetch**，獲取最新資料。

這套機制讓前端開發者從「命令式」的重新抓取（呼叫這個、呼叫那個）轉向了「宣告式」的依賴管理（這筆資料跟這個標籤有關）。這正是 RTK Query 能取代傳統 `useEffect + fetch` 的核心競爭力。

## 觀察快取變化

雖然標籤在程式碼中看起來很抽象，但它們在 Redux 的內部狀態裡是真實存在的。為了讓你更有信心，我們需要實際觀察這些標籤是如何產生、消失並觸發請求的。

在下一部分中，我們將打開 Redux DevTools 和瀏覽器的 Network 面板。你會親眼看到：當你按下「儲存」按鈕後，Redux Store 裡的 `provided` 標籤如何變色，以及 Network 面板是如何在沒有你手動撰寫任何 `fetch` 程式碼的情況下，自動跳出一個新的請求。這將是真正理解 RTK Query 生命週期的關鍵時刻。

---

**本節要點總結：**

- `invalidatesTags` 是 Mutation 成功後的「狙擊手」。
- 推薦使用 `{ type, id }` 進行精準失效，避免效能浪費。
- `{ type, id: 'LIST' }` 模式是處理列表重新整理的標準做法。
- 動態回呼函式讓我們能處理更複雜的失效邏輯。
