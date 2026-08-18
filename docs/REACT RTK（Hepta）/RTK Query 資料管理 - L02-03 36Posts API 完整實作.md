---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 2 堂：Query 參數與實作

# 36Posts API 完整實作

想像你正在開發一個現代化的部落格後台。使用者在左側瀏覽文章列表，點擊其中一項後，右側立即顯示該文章的詳細內容。在傳統的 React 開發中，這通常意味著你需要管理兩個 `useEffect`、多個 `useState`（用來存儲列表、單篇文章、Loading 狀態、錯誤訊息），還要擔心使用者快速切換文章時產生的競態條件（Race Condition）。

這正是 RTK Query 大顯身手的時刻。在這一節中，我們將把前面學到的 `createApi`、動態參數與 `skipToken` 整合在一起，實作一個完整的 Posts 管理功能。這不只是一個練習，更是你未來在真實專案中處理「列表與詳情」模式的標準藍圖。

## 建立 Posts API Slice

首先，我們需要定義資料模型與 API Slice。在 TypeScript 中，明確的型別定義是確保開發體驗的第一步。我們將定義一個 `Post` 介面，並建立兩個 Endpoints：一個用於獲取所有文章，另一個用於根據 ID 獲取特定文章。

### 1. 定義資料型別與 API 架構

這裡我們使用 `JSONPlaceholder` 作為模擬後端。請注意 `builder.query` 的泛型參數是如何定義的：

```typescript
// src/services/posts.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 1. 定義 API 回傳的資料結構
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// 2. 建立 API Slice
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // 獲取所有文章：無參數，回傳 Post 陣列
    getPosts: builder.query<Post[], void>({
      query: () => 'posts?_limit=5', // 限制 5 筆資料方便觀察
    }),
    
    // 獲取單筆文章：參數為 id (number)，回傳單個 Post
    getPostById: builder.query<Post, number>({
      query: (id) => `posts/${id}`,
    }),
  }),
});

// 3. 匯出自動生成的 Hooks
// 命名規則：use + Endpoint名稱 + Query
export const { useGetPostsQuery, useGetPostByIdQuery } = postsApi;
```

這裡有幾個值得注意的細節：

- **泛型定義**：`builder.query<Post[], void>`。第一個參數是**成功回傳的資料型別**，第二個是**傳入參數的型別**。因為 `getPosts` 不需要參數，所以我們填寫 `void`。
- **動態 URL**：在 `getPostById` 中，我們利用樣板字串 ``posts/${id}`` 動態生成路徑。這就是動態參數最直觀的應用。
- **自動生成 Hook**：RTK Query 會掃描 `endpoints` 並自動產生 `useGetPostsQuery` 和 `useGetPostByIdQuery`。這不僅省去了手寫 Hook 的麻煩，還提供了完整的型別補全。

---

## 實作 PostManager 元件

接下來，我們要建立一個 React 元件來消費這些資料。這個元件的邏輯如下：

1. 進入頁面時，自動抓取文章列表。
2. 使用者點擊列表中的某一項。
3. 根據點擊的 ID，觸發單篇文章的查詢。
4. 如果還沒點擊任何文章，單篇文章的查詢應該處於「停用」狀態。

### 2. 整合 Hooks 與邏輯控制

我們將使用 `skipToken` 來優雅地處理「尚未選擇文章」的情境，這比傳入 `null` 或 `undefined` 並在 Query 內部做判斷要來得安全且符合 TypeScript 的規範。

```tsx
// src/components/PostManager.tsx
import React, { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useGetPostsQuery, useGetPostByIdQuery } from '../services/posts';

const PostManager: React.FC = () => {
  // 本地狀態：記錄目前選中的文章 ID，初始為 undefined
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  // 查詢 1：文章列表 (無參數)
  const { 
    data: posts, 
    isLoading: isListLoading, 
    isError: isListError 
  } = useGetPostsQuery();

  // 查詢 2：文章詳情
  // 如果 selectedId 為 undefined，我們傳入 skipToken 告訴 RTK Query 暫時不要發送請求
  const { 
    data: postDetail, 
    isFetching: isDetailFetching,
    isLoading: isDetailLoading,
    error: detailError
  } = useGetPostByIdQuery(selectedId ?? skipToken);

  // 處理列表讀取狀態
  if (isListLoading) return <div>正在載入文章列表...</div>;
  if (isListError) return <div>載入列表發生錯誤！</div>;

  return (
    <div style={{ display: 'flex', gap: '40px', padding: '20px' }}>
      {/* 左側：文章列表 */}
      <section style={{ flex: 1 }}>
        <h2>文章列表</h2>
        <ul>
          {posts?.map((post) => (
            <li 
              key={post.id} 
              style={{ 
                cursor: 'pointer', 
                color: selectedId === post.id ? 'blue' : 'black',
                fontWeight: selectedId === post.id ? 'bold' : 'normal',
                marginBottom: '8px'
              }}
              onClick={() => setSelectedId(post.id)}
            >
              {post.id}. {post.title}
            </li>
          ))}
        </ul>
      </section>

      {/* 右側：文章詳情 */}
      <section style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
        <h2>文章詳情</h2>
        
        {!selectedId && <p>請從左側點選一篇文章以查看細節。</p>}

        {/* 
            當正在從伺服器抓取新資料時顯示提示。
            注意：isDetailLoading 僅在「第一次」抓取某 ID 時為 true，
            而 isDetailFetching 在每次 ID 改變或重新驗證時皆為 true。
        */}
        {isDetailFetching && <p style={{ color: 'orange' }}>正在獲取最新內容...</p>}

        {postDetail && !isDetailFetching && (
          <div>
            <h3>{postDetail.title}</h3>
            <p>{postDetail.body}</p>
            <hr />
            <small>作者 ID: {postDetail.userId}</small>
          </div>
        )}

        {detailError && <p style={{ color: 'red' }}>無法載入詳情。</p>}
      </section>
    </div>
  );
};

export default PostManager;
```

---

## 深入剖析：多個 Hook 的協作機制

在上面的範例中，我們同時呼叫了兩個不同的 Hook。這引出了一個關鍵問題：**RTK Query 是如何同時處理這兩個請求而不混淆的？**

### 1. 獨立的狀態生命週期

每一個生成的 Hook 都擁有自己獨立的狀態追蹤器。當 `useGetPostsQuery()` 執行時，它會在 Redux Store 的 `postsApi` 命名空間下建立一個專屬於 `getPosts(undefined)` 的快取條目。與此同時，`useGetPostByIdQuery(selectedId)` 則會根據 `selectedId` 的值建立另一個條目。

這意味著：

- `isListLoading` 只會因為列表請求而變動。
- `isDetailFetching` 只會因為詳情請求而變動。
- 你不需要在元件層級手動清空之前的 `postDetail` 資料，因為 RTK Query 會根據當前的 `selectedId` 自動切換對應的快取資料。

### 2. skipToken 的妙用

在程式碼中，我們寫了 `useGetPostByIdQuery(selectedId ?? skipToken)`。這是非常重要的實作細節。

- **如果沒有 `skipToken`**：你可能必須寫成 `useGetPostByIdQuery(selectedId!)` 並祈禱 `selectedId` 有值，或者在 `postsApi` 裡處理參數為 `undefined` 的情況。
- **有了 **`**skipToken**`**：當 **`**selectedId**`** 為 **`**undefined**`** 時，Hook 內部會進入 **`**uninitialized**`** 狀態。它不會發送任何網路請求，也不會回報錯誤，**`**data**`** 會保持為 **`**undefined**`**。這讓我們的邏輯變得極其乾淨：**「沒有 ID，就不查詢」。

### 3. 觀察快取與自動同步

當你在瀏覽器中運行這個範例時，請打開網路面板（Network Tab）觀察：

1. **初次點擊文章 1**：發送 `GET /posts/1`。
2. **點擊文章 2**：發送 `GET /posts/2`。
3. **再次點擊文章 1**：**奇蹟發生了——網路面板沒有任何新請求！**

這是因為 RTK Query 發現 `getPostById(1)` 的資料已經存在於快取中，且尚未過期。它會立即從快取中回傳 `postDetail` 給你的元件。這種「去重複（Deduplication）」與「自動快取管理」是 RTK Query 取代 `useEffect` 的核心競爭力。

---

## 動手觀察：isLoading vs. isFetching

為了讓你更深刻理解 RTK Query 的細緻狀態，請嘗試在 `PostManager` 中觀察 `isLoading` 與 `isFetching` 的變化。

- **情境 A：第一次點選文章 5**
  - `isLoading`: `false` -> `true` -> `false`
- `isFetching`: `false` -> `true` -> `false`
- *結論：當快取中完全沒有資料時，兩者都會觸發。*
- **情境 B：文章 5 已經看過，現在從文章 1 切換回文章 5**
  - `isLoading`: 始終為 `false`（因為快取裡已經有這份資料了，使用者不需要等待「初次加載」）。
- `isFetching`: `false` -> `true` -> `false`（RTK Query 會在背後嘗試與伺服器同步，確保資料是最新的，這稱為 Background Revalidation）。
- *結論：這讓 UI 可以立即顯示舊資料（不閃爍白屏），同時在角落顯示一個微小的讀取圖示告知使用者正在更新。*

這種處理方式極大地提升了使用者體驗（UX），讓應用程式感覺起來非常快速且反應靈敏。

---

## 重點回顧與銜接

在本節實作中，我們完成了一個具備動態查詢能力的 Posts API 功能。你應該已經掌握了：

- 如何利用 `builder.query<Result, Arg>` 定義具備強型別參數的 Endpoint。
- 如何匯出並在 React 元件中使用自動生成的 Hooks。
- 利用 `skipToken` 實現條件式查詢，避免無效的 API 呼叫。
- 理解了 `isLoading` 與 `isFetching` 在多個查詢共存時的語意差異。

這標誌著我們對 **Query Endpoint** 基礎知識的掌握已經完備。然而，你有沒有想過：快取中的資料會保存多久？如果我不斷點擊，快取會不會把記憶體吃光？RTK Query 是怎麼知道什麼時候該把舊資料丟掉，什麼時候該保留的？

這正是我們下一個主題的核心。

**下一堂預告：快取機制深入**
我們將深入探討 RTK Query 的「大腦」——快取生命週期。你會學到「訂閱計數（Subscription Count）」的概念，以及如何透過 `keepUnusedDataFor` 精確控制資料在記憶體中的存活時間。這將帶你從「會用 Hook」進化到「能優化效能」的進階開發者層次。
