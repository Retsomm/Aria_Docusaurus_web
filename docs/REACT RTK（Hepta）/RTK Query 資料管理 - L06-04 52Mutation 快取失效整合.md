---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 6 堂：Mutation 請求處理

# 52Mutation 快取失效整合

想像一下這個場景：你剛剛開發了一個部落格管理後台，點擊「刪除文章」按鈕後，右下角跳出了「刪除成功」的通知，API 也確實回傳了 200 OK。然而，當你轉頭看文章列表時，那篇理應消失的文章卻依然好端端地掛在畫面上。你必須手動重新整理網頁，它才會消失。

這就是我們在傳統非同步開發中經常遇到的「快取過時（Stale Cache）」問題。在 RTK Query 中，Mutation 負責修改伺服器端的資料，但它本身並不具備「自動修改前端快取」的神力。如果我們不建立一個機制來通知 Query Endpoint 「資料已經變了」，前端的快取就會與伺服器的真實狀態脫節。

本節我們將學習 RTK Query 最核心的自動化機制：**標籤失效（Tag Invalidation）**。這是一套「宣告式」的同步系統，能讓你徹底擺脫手動寫 `useEffect` 重新抓取資料的痛苦。

## 核心挑戰：為什麼資料不更新？

在 RTK Query 的心智模型中，**Query** 與 **Mutation** 是解耦的：

- **Query**：負責讀取。它會根據 Cache Key 將資料存入快取。
- **Mutation**：負責寫入。它只負責發送請求給伺服器，並處理伺服器的回應。

預設情況下，當你執行一個 `updatePost` 的 Mutation 時，RTK Query 並不知道這個動作會影響到哪一個 `getPosts` 的結果。這導致了前端畫面上呈現的是舊的快取內容，而伺服器端已經是更新後的狀態。

過去，我們可能會在 `onSuccess` 回調中手動調用某個 `refetch` 函式，或者更糟地，手動去修改 Redux Store 裡的資料。RTK Query 提出了一種更優雅的解法：**標籤 (Tags)**。

## 標籤提供 (providesTags) 回顧

在深入失效機制前，我們先快速複習一下標籤是如何被賦予的。在定義 Query Endpoint 時，我們會使用 `providesTags` 為快取資料貼上「身分證」。

最專業且具擴展性的做法是 **「LIST + ID」模式**：

```typescript
// postsApi.ts (部分節錄)
getPosts: builder.query<Post[], void>({
  query: () => '/posts',
  // 為這份資料貼上標籤
  providesTags: (result) =>
    result
      ? [
          // 一個代表整份列表的標籤
          { type: 'Posts', id: 'LIST' },
          // 為列表中的每一項貼上專屬標籤
          ...result.map(({ id }) => ({ type: 'Posts', id } as const)),
        ]
      : [{ type: 'Posts', id: 'LIST' }],
}),
```

這裡的邏輯是：如果 API 回傳了 5 篇文章，這份快取就會擁有 6 個標籤（一個 `LIST` 標籤加上 5 個帶有具體 `id` 的標籤）。這為我們接下來的「精準打擊」埋下了伏筆。

## 標籤失效 (invalidatesTags) 實作

`invalidatesTags` 是 Mutation Endpoint 中的關鍵屬性。它的語意非常直白：「當這個 Mutation 成功執行後，哪些標籤應該被標記為無效？」

一旦標籤失效，RTK Query 會自動檢查目前畫面上是否有任何 Query 正在「訂閱」這些標籤。如果有，它會立即在背景重新發送請求，確保資料最新。

### 1. 靜態標籤：全量刷新

最簡單的形式是直接給予一個字串陣列。這適合用於「新增資料」等會影響整份列表的場景。

```typescript
addPost: builder.mutation<Post, Partial<Post>>({
  query: (body) => ({
    url: '/posts',
    method: 'POST',
    body,
  }),
  // 只要新增成功，就讓 'LIST' 標籤失效
  // 這會觸發所有提供過 'LIST' 標籤的 Query (例如 getPosts) 重新抓取
  invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
}),
```

### 2. 動態標籤：精準失效

對於「更新」或「刪除」，我們通常不希望因為改了一個小地方就讓整個列表重新抓取（雖然 RTK Query 效能很好，但對於大型應用來說，精準度就是專業）。

我們可以使用 Callback 形式，根據 Mutation 的結果或參數來動態生成標籤：

```typescript
updatePost: builder.mutation<Post, Post>({
  query: (patch) => ({
    url: `/posts/${patch.id}`,
    method: 'PATCH',
    body: patch,
  }),
  // 使用 callback 語法：(result, error, arg)
  // arg 是你呼叫 trigger 函式時傳入的參數 (在這裡是完整的 post 物件)
  invalidatesTags: (result, error, arg) => [
    // 精準地只讓該 id 的標籤失效
    { type: 'Posts', id: arg.id },
  ],
}),
```

當 `{ type: 'Posts', id: 5 }` 失效時，只有那些標籤中包含此標籤的 Query 會被重新觸發。這不僅節省效能，也讓資料更新的邏輯變得非常明確。

## 完整閉環範例：Posts API

讓我們把所有片段拼湊起來，看一個完整的實戰設定。這是一個典型的 CRUD API Slice，它展示了標籤如何像黏著劑一樣，將 Query 與 Mutation 緊密結合。

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Post {
  id: number;
  title: string;
  content: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.com' }),
  // 定義這份 API 使用到的標籤類型
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    // --- 讀取 (Query) ---
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Posts', id } as const)),
              { type: 'Posts', id: 'LIST' },
            ]
          : [{ type: 'Posts', id: 'LIST' }],
    }),

    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),

    // --- 寫入 (Mutation) ---
    addPost: builder.mutation<Post, Omit<Post, 'id'>>({
      query: (newPost) => ({
        url: '/posts',
        method: 'POST',
        body: newPost,
      }),
      // 新增後，列表數量變了，必須刷新 LIST
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),

    updatePost: builder.mutation<Post, Post>({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      // 更新後，特定的文章內容變了，通知該 id 的訂閱者
      invalidatesTags: (result, error, { id }) => [{ type: 'Posts', id }],
    }),

    deletePost: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      // 刪除最關鍵：既要讓該單筆失效，也要讓列表刷新（因為數量變了）
      invalidatesTags: (result, error, id) => [
        { type: 'Posts', id },
        { type: 'Posts', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;
```

### 為什麼這能取代 useEffect？

在傳統開發中，你可能會這樣寫：

```javascript
// 傳統痛苦寫法
const { data, refetch } = useFetchPosts();
const [deletePost] = useDeletePost();

const handleDelete = async (id) => {
  await deletePost(id);
  refetch(); // 必須手動記得呼叫 refetch
};
```

如果專案很大，有 5 個元件都在顯示這份資料，你得在 5 個地方確保資料同步。

在 RTK Query 中，你只需要在 API 定義層宣告好關係：

1. `getPosts` 說：「我這裡有 `Posts:LIST` 和一堆 `Posts:id` 的資料。」
2. `deletePost` 說：「我成功後會讓 `Posts:id` 和 `Posts:LIST` 失效。」
3. **RTK Query 自動化處理一切**：一旦 `deletePost` 成功，它發現 `getPosts` 正在顯示（有訂閱），就會自動背景執行 `getPosts`。

這就是所謂的 **「單一事實來源 (Single Source of Truth)」** 與 **「宣告式同步」**。

## 標籤設計的最佳實踐

在使用 `invalidatesTags` 時，請記住以下幾條黃金法則：

### 1. 標籤匹配必須完全一致

標籤是由 `type` 和 `id` 組成的物件。`{ type: 'Posts', id: 1 }` 與 `{ type: 'Posts', id: '1' }`（數字與字串的差異）在 RTK Query 眼中是完全不同的。如果失效不成功，請務必檢查你的 `id` 型別是否一致。

### 2. 善用 `as const`

在 TypeScript 中，建議使用 `as const` 或明確定義標籤物件，以確保型別推導不會出錯，特別是在 `providesTags` 的 `map` 過程中。

### 3. 避免過度失效 (Over-invalidation)

如果你每次 Mutation 都只簡單地使用 `invalidatesTags: ['Posts']`（全量失效），雖然方便，但會導致不必要的網路請求。當你的應用規模變大（例如一個頁面有多個區塊顯示不同的資料），精準的 `id` 標籤失效能顯著提升效能。

### 4. 錯誤處理的影響

預設情況下，`invalidatesTags` 只有在 Mutation **成功**（fulfilled）時才會觸發。如果 API 回傳 400 或 500 錯誤，標籤不會失效，這非常合理，因為伺服器資料並未真正改變。

## 快取同步的除錯技巧

當你發現 Mutation 執行後畫面沒更新，請按照以下步驟檢查：

1. **檢查標籤名稱**：`tagTypes` 裡有沒有定義該標籤？
2. **檢查提供者**：Query 端點是否真的回傳了那些標籤？（使用 Redux DevTools 檢查 `api -> provided`）。
3. **檢查失效者**：Mutation 的 `invalidatesTags` 返回的物件是否與 Query 提供的物件**完全匹配**？
4. **檢查訂閱狀態**：觸發失效時，該 Query 元件是否還在畫面上（Mounted）？如果元件已經卸載且沒有其他訂閱者，RTK Query 不會立即發起請求，而是會等到該元件下次掛載時才重新抓取。

## 總結與回顧

到目前為止，我們已經完成了 RTK Query Mutation 的最後一塊拼圖。

你已經學會了：

- 為什麼需要失效機制來解決快取過時問題。
- 如何使用 `providesTags` 建立「LIST + ID」的資料標籤體系。
- 如何透過 `invalidatesTags` 的靜態與動態寫法，實現精準的資料自動同步。
- 理解了 RTK Query 如何透過標籤機制取代傳統混亂的指令式 `refetch` 邏輯。

這套機制的強大之處在於，它將「資料與資料之間的關係」集中在 API Slice 中定義，而不是散落在各個 UI 元件裡。這讓你的 React 元件可以保持極致的純粹：它們只需要關心如何呈現資料，而不需要關心資料何時該重新整理。

### 思考題 (Self-Review)

1. 如果我有一個 `clearAllPosts` 的 Mutation，我應該讓哪個標籤失效最有效率？
2. 為什麼在 `deletePost` 的失效標籤中，除了該筆文章的 `id` 外，通常還需要包含 `LIST` 標籤？
3. `invalidatesTags` 的 callback 中，`arg` 參數代表什麼？

---

### 下一堂課：樂觀更新 (Optimistic Update)

雖然自動重新抓取已經非常強大，但它依然依賴網路請求的時間。當使用者點擊「按讚」時，如果還要等 API 回傳成功才看到心形變紅，會有一種微妙的延遲感。

下一堂課，我們將進入 RTK Query 的進階殿堂：**樂觀更新 (Optimistic Update)**。我們將學習如何在請求發出的瞬間，就先「假裝」成功並修改前端快取，讓 UI 達到零延遲的操作體驗。這將會用到 `onQueryStarted` 生命週期與 `patchQueryData` 等高階 API，準備好迎接挑戰了嗎？
