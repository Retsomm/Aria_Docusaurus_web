---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 2 堂：Query 參數與實作

# 34動態參數 Endpoint

在上一章中，我們學會了如何定義一個基礎的 API Slice，並實作了獲取文章列表（`getPosts`）的功能。但在現實世界的應用中，我們很少只處理「全部資料」。更多時候，我們需要根據特定的條件來抓取資料：點擊某一篇文章查看詳情、搜尋特定關鍵字的產品，或是根據分頁載入內容。

這就引出了一個核心問題：**我們該如何將動態參數傳遞給 RTK Query，並讓它聰明地幫我們管理這些具有「個性」的快取資料？**

## 從「無參數」到「動態參數」

在進入程式碼之前，我們先觀察一下 `builder.query` 的型別定義。如果你在使用 TypeScript 時將滑鼠懸停在 `query` 上，你會看到它接受兩個泛型參數：

```typescript
builder.query<ResultType, QueryArg>
```

1. **`ResultType`**：這是伺服器回傳並儲存在快取中的資料型別（例如 `Post` 或 `Post[]`）。
2. **`QueryArg`**：這是你呼叫這個查詢時需要傳入的參數型別。

在實作 `getPosts`（取得列表）時，我們通常不需要參數，所以 `QueryArg` 會被定義為 `void`：

```typescript
// 無參數範例
getPosts: builder.query<Post[], void>({
  query: () => 'posts',
})
```

但當我們要實作 `getPostById` 時，情況就不同了。我們需要一個 `id` 來告訴 API 我們想要哪篇文章。這時，`QueryArg` 就派上用場了。

### 實作 getPostById Endpoint

讓我們看看如何在 `createApi` 中定義一個帶有參數的 Endpoint。請注意 `query` 函式的變化：它現在接收一個參數，並利用這個參數來構建動態的 URL。

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Post {
  id: number;
  title: string;
  body: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // 1. 無參數的 Query：QueryArg 是 void
    getPosts: builder.query<Post[], void>({
      query: () => 'posts',
    }),

    // 2. 帶動態參數的 Query：QueryArg 是 number
    getPostById: builder.query<Post, number>({
      // 這裡的 id 就是傳入的 QueryArg
      query: (id) => `posts/${id}`, 
    }),
    
    // 3. 甚至可以傳入複雜物件作為參數
    getPostsByUserId: builder.query<Post[], { userId: number; limit: number }>({
      query: ({ userId, limit }) => ({
        url: 'posts',
        params: { userId, _limit: limit }, // 利用 fetchBaseQuery 自動處理 Query String
      }),
    }),
  }),
});

export const { useGetPostsQuery, useGetPostByIdQuery, useGetPostsByUserIdQuery } = postsApi;
```

在這個範例中，`getPostById` 的 `query` 接收一個 `id`。當你在元件中呼叫 `useGetPostByIdQuery(5)` 時，RTK Query 會自動執行 `query(5)`，最終發送請求到 `https://.../posts/5`。

### 為什麼只能有一個參數？

你可能會注意到，`query` 函式定義為 `query: (arg: QueryArg) => ...`。這意味著你**只能傳遞一個參數**。

如果你需要傳遞多個資訊（例如同時需要 `userId` 和 `category`），你必須將它們封裝成一個**物件**，如上面範例中的 `getPostsByUserId`。這是因為 RTK Query 需要一個單一的參考點來決定如何生成「快取金鑰」（Cache Key），我們稍後會詳細探討這一點。

---

## 核心機制：快取金鑰的序列化（Serialization）

這是 RTK Query 最神奇的地方之一。想像一下，如果你在頁面 A 訂閱了 `useGetPostByIdQuery(1)`，在頁面 B 訂閱了 `useGetPostByIdQuery(2)`，RTK Query 是如何確保這兩份資料不會互相覆蓋，且能分別管理其 Loading 狀態的？

答案就是：**自動序列化快取金鑰**。

### 快取 Key 是如何生成的？

當一個查詢被觸發時，RTK Query 會在內部生成一個唯一的識別碼，公式大致如下：

> **Cache Key = Endpoint 名稱 + JSON.stringify(QueryArg)**

- 當你呼叫 `useGetPostByIdQuery(1)` 時，Key 是 `"getPostById(1)"`。
- 當你呼叫 `useGetPostByIdQuery(2)` 時，Key 是 `"getPostById(2)"`。

因為 Key 不同，Redux Store 會為這兩個請求開闢完全獨立的空間：

```text
// Redux Store 內部的示意結構
postsApi: {
  queries: {
    'getPostById(1)': { status: 'fulfilled', data: { id: 1, ... } },
    'getPostById(2)': { status: 'fulfilled', data: { id: 2, ... } },
  }
}
```

### 參數必須是「可序列化」的

由於 RTK Query 底層使用 `JSON.stringify()` 來生成金鑰，這對你的 `QueryArg` 提出了一個重要要求：**參數必須是可序列化的（Serializable）**。

- **可以傳：** 字串、數字、布林值、純物件（Plain Objects）、陣列。
- **不可以傳：** 函式（Functions）、Class 實例、或是帶有循環引用的複雜物件。

如果你嘗試傳入一個 Function 作為參數，`JSON.stringify` 會忽略它或是報錯，這會導致不同的參數可能生成相同的快取金鑰，進而造成嚴端的資料錯誤。

---

## 在元件中使用動態 Hook

現在，讓我們看看如何在 React 元件中實際應用這些帶參數的 Hook。與無參數的 Hook 不同，你必須傳入對應型別的引數。

### 基本用法

```tsx
import React from 'react';
import { useGetPostByIdQuery } from './services/postsApi';

const PostDetail = ({ postId }: { postId: number }) => {
  // 傳入 postId 作為參數
  const { data: post, isLoading, error } = useGetPostByIdQuery(postId);

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>發生錯誤</div>;
  if (!post) return <div>找不到文章</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  );
};
```

### 當參數改變時會發生什麼？

這是 RTK Query 取代 `useEffect` 的關鍵時刻。

假設你的 `postId` 從 `1` 變成了 `2`（例如使用者點擊了「下一篇」）：

1. **自動重新發送請求**：Hook 偵測到傳入的參數改變了。
2. **檢查快取**：它會先檢查快取中是否已經有 `"getPostById(2)"` 的資料。
3. **狀態更新**：
  - 如果快取中沒有，`isFetching` 會變為 `true`，並發起新的網路請求。
- 如果快取中已有資料，它會立即回傳快取內容，並視情況在背景重新驗證（revalidate）。

這整個過程是**宣告式（Declarative）**的。你只需要告訴 Hook「我現在想要 ID 為 2 的資料」，至於什麼時候該發請求、要不要顯示 Loading、要不要用舊資料，全都由 RTK Query 自動搞定。

---

## 預覽：當參數尚未準備好時

在實際開發中，我們經常會遇到這種情況：

- 你的 `postId` 是從 URL 取得的，但在組件初次渲染時，URL 解析可能還沒完成。
- 或者，只有當使用者選取了某個選項後，你才想發送請求。

如果你直接寫 `useGetPostByIdQuery(undefined as any)`，這不僅會破壞 TypeScript 的型別檢查，還可能導致 API 發送一個無效的請求（例如 `GET /posts/undefined`）。

這引出了一個關鍵問題：**我們能不能「有條件」地暫停 Hook 的執行？**

在 RTK Query 中，這不是透過 `if` 語句來解決的（因為 Hook 不能放在條件式中），而是透過 `skip` 參數或是我們下一節要深入探討的專屬武器：`skipToken`。

### 思考一個場景

假設你有一個搜尋介面，只有在搜尋字串長度大於 3 的時候才發送請求：

```tsx
const [searchTerm, setSearchTerm] = useState("");

// 雖然傳入了參數，但我們需要一種方式告訴它：「先別動！」
const { data } = useSearchPostsQuery(searchTerm, {
  skip: searchTerm.length <= 3 
});
```

這種處理「動態參數」與「執行時機」之間關係的藝術，正是 RTK Query 進階使用的起點。

## 參數與效能：去重複（Deduplication）

最後，值得一提的是 RTK Query 對動態參數的優化。

如果你在同一個頁面的五個不同組件中，同時呼叫了 `useGetPostByIdQuery(42)`，RTK Query 會發現它們的快取金鑰完全相同（都是 `"getPostById(42)"`）。

結果是：**它只會發送一次網路請求**。

所有五個組件都會共享這同一個請求的狀態。當請求成功時，五個組件會同步收到 `data` 並重新渲染。這種自動的「請求去重複」機制，極大地減少了伺服器的負擔，也讓你的前端邏輯變得異常簡單——你不需要在父組件抓好資料再層層傳遞（Prop Drilling），每個組件直接大膽地跟 API Slice 要它需要的資料即可。

## 重點摘要與銜接

在本節中，我們學會了如何透過 `builder.query<Result, Arg>` 定義帶參數的 Endpoint，並理解了快取金鑰（Cache Key）是如何透過序列化參數生成的。這套機制確保了不同參數的資料能夠被精確地隔離與管理。

然而，當參數是動態的時候，我們難免會遇到「參數暫時不存在」或是「暫時不想發送請求」的尷尬時刻。在 React 中，我們不能動態增刪 Hook，因此我們需要一套優雅的機制來管控 Hook 的啟動。下一節，我們將深入探討 `skip` 參數與專為 TypeScript 設計的 `skipToken`，學習如何型別安全地控制請求的觸發時機。
