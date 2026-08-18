---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 4 堂：快取機制基礎

# 44跨元件資料共享

想像一下，你在開發一個社群軟體。你的介面右上角有一個「通知」小圖示顯示未讀數量（例如：5），而頁面中心正開啟著「通知列表」分頁。當你在列表中點擊「標記為已讀」後，列表中的項目變灰了，但右上角的小圖示會自動變成 4 嗎？

在傳統的 React 開發中，這是一個令人頭痛的問題。你可能需要將狀態「提升」（Lifting State Up）到共同的父元件，或是動用 Context API，甚至是為了同步一個簡單的數字而寫出複雜的 `useEffect` 監聽邏輯。

但在 RTK Query 的世界裡，這一切都是自動發生的。

## 單一事實來源：從「抓取資料」到「訂閱快取」

要理解跨元件共享，我們必須先修正對 `useQuery` Hook 的直覺認知。

在以前，我們常把 `useEffect(() => { fetch(...) }, [])` 看作是一個「主動抓取」的動作。但在 RTK Query 中，**呼叫 Hook 不等於發送請求，而是「訂閱」一個特定的快取資料。**

### 核心機制：去重複與監聽

當你在多個不同的元件中呼叫同一個 `useGetPostsQuery()` 時，RTK Query 底層會發生以下連鎖反應：

1. **快取 Key 匹配**：RTK Query 檢查傳入的參數（例如 `void` 或 `id: 1`）。它發現這些 Hook 產生的「Cache Key」是一模一樣的（例如 `getPosts(undefined)`）。
2. **請求去重複（Deduplication）**：如果第一個元件掛載時已經發送了請求且正在進行中，第二個、第三個元件呼叫 Hook 時，RTK Query 會意識到：「嘿，我已經在路上了，大家等第一個請求回來就好。」它不會重複發送第二次網路請求。
3. **單一事實來源（Single Source of Truth）**：一旦資料回到 Redux Store，所有訂閱該 Cache Key 的 Hook 都會「收到通知」，並同時拿到最新資料進行重新渲染。

這意味著不論你的元件層級多深、相隔多遠，只要它們訂閱的是同一個 Endpoint 且參數相同，它們看到的資料永遠是同步的。

---

## 訂閱計數的動態演進

我們在上一節提到了「訂閱計數（Subscription Count）」。現在讓我們深入觀察在多個元件並存的場景下，這個數字是如何精確引導快取行為的。

假設我們有兩個元件：`Sidebar`（側邊欄）和 `MainList`（主要列表），它們都使用了 `useGetPostsQuery()`。

### 實驗：追蹤生命週期

讓我們透過一個時間軸來觀察：

1. **T+0：**`**Sidebar**`** 掛載**
  - 訂閱計數：`0 -> 1`
- 行為：由於快取是空的且計數為 1，發送 `GET /posts` 請求。
- 狀態：`isLoading: true`。
2. **T+1：**`**MainList**`** 掛載**
  - 訂閱計數：`1 -> 2`
- 行為：RTK Query 發現 `getPosts` 已經有訂閱者且請求處理中，**不發送新請求**。
- 狀態：`MainList` 直接共享 `Sidebar` 的 Loading 狀態。
3. **T+2：資料回傳**
  - 行為：資料寫入 Store 快取。
- 結果：`Sidebar` 和 `MainList` 同時收到 `data`，`isLoading` 轉為 `false`。
4. **T+3：**`**MainList**`** 卸載（例如使用者切換分頁）**
  - 訂閱計數：`2 -> 1`
- 行為：計數仍大於 0，快取數據**完好保留**在 Store 中。
5. **T+4：**`**Sidebar**`** 卸載（使用者離開該頁面）**
  - 訂閱計數：`1 -> 0`
- 行為：計數歸零。快取進入 `keepUnusedDataFor` 定義的計時器（預設 60 秒）。

### 為什麼這很重要？

這種機制徹底解決了 **「過度抓取（Over-fetching）」** 的問題。在傳統做法中，如果你在 `Sidebar` 和 `MainList` 都寫了 `useEffect` 抓取資料，你的伺服器會收到兩次一模一樣的請求。RTK Query 確保了無論有多少元件需要這份資料，網路成本始終最低。

---

## 實作場景：側邊欄與內容區的完美同步

讓我們用程式碼來實作這個場景。我們會建立一個 `PostsCountBadge`（顯示總數的小標籤）和一個 `PostsList`（顯示完整列表）。

### 1. 定義 API Slice

```typescript
// features/posts/postsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Post {
  id: number;
  title: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.com' }),
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
    }),
  }),
});

export const { useGetPostsQuery } = postsApi;
```

### 2. 建立側邊欄小標籤元件

這個元件只需要知道「有多少篇文章」，但它依然訂閱整個 `getPosts`。

```tsx
// components/PostsCountBadge.tsx
import React from 'react';
import { useGetPostsQuery } from '../features/posts/postsApi';

export const PostsCountBadge = () => {
  // 訂閱 getPosts
  const { data: posts, isFetching } = useGetPostsQuery();

  if (isFetching && !posts) return <span>...</span>;

  return (
    <div style={{ padding: '8px', background: '#eee', borderRadius: '50%' }}>
      {/* 只要快取更新，這裡的數字會自動變動 */}
      文章總數: {posts?.length || 0}
    </div>
  );
};
```

### 3. 建立文章列表元件

```tsx
// components/PostsList.tsx
import React from 'react';
import { useGetPostsQuery } from '../features/posts/postsApi';

export const PostsList = () => {
  // 訂閱同一個 getPosts
  const { data: posts, isLoading, refetch } = useGetPostsQuery();

  if (isLoading) return <div>載入中...</div>;

  return (
    <div>
      <button onClick={() => refetch()}>手動刷新資料</button>
      <ul>
        {posts?.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

### 4. 觀察自動同步行為

當你在 `PostsList` 中點擊「手動刷新資料」（`refetch()`）時：

1. `postsApi` 會向伺服器發送新請求。
2. 新資料回傳後，更新 Store 中的快取。
3. **重點**：`PostsCountBadge` 元件雖然沒有被點擊，但因為它也訂閱了同一個快取，它會**立刻偵測到資料變動並重新渲染**，顯示最新的數量。

這就是「單一事實來源」的威力：你不需要寫任何 `EventEmitter` 或複雜的 `useEffect` 監聽，UI 各處會自動保持一致。

---

## 深度剖析：這與 Context API 有何不同？

很多開發者會問：「這不就跟 React Context 做的事情一樣嗎？」

其實本質上非常不同。使用 Context 或傳統 Redux 管理非同步資料時，你必須自己處理以下邏輯：

1. **發起請求時機**：在哪個元件觸發 `fetch`？如果兩個元件都需要，是誰負責抓？
2. **存儲邏輯**：抓回來後怎麼塞進全域狀態？
3. **Loading 狀態管理**：全域狀態要手動維護一個 `isLoading` 旗標嗎？

**RTK Query 的跨元件共享是「聲明式（Declarative）」的：**

- 元件 A 說：「我需要 `getPosts`。」
- 元件 B 說：「我也需要 `getPosts`。」
- RTK Query 負責協調：「好，既然你們都要，我只去抓一次，抓回來後你們兩個自己拿去用。」

這消除了 **Prop Drilling（屬性鑽孔）** 的需求。你不再需要為了讓深層的子元件顯示一個通知數量，而把資料從 `App.tsx` 一層層傳下去。每個元件只需要呼叫它需要的 Hook，RTK Query 會處理剩下的共享邏輯。

---

## 進階：如何避免「過度訂閱」？

雖然 RTK Query 會自動去重複，但如果 `getPosts` 回傳的是 10MB 的超大 JSON，而 `PostsCountBadge` 只需要一個 `length` 屬性，難道每次資料更新都要讓小標籤重新渲染嗎？

為了效能優化，RTK Query 提供了 `selectFromResult` 功能，讓你能從快取中「挑選」需要的資料片段：

```tsx
const { count } = useGetPostsQuery(undefined, {
  selectFromResult: ({ data }) => ({
    count: data?.length ?? 0
  }),
});

// 現在，只有當 posts.length 改變時，這個元件才會重新渲染。
// 如果 posts 內容變了但長度沒變，這個元件會跳過渲染！
```

這進一步強化了跨元件共享的靈活性：大家共享同一份原始資料，但可以根據需求進行精確的「片段訂閱」。

---

## 總結與核心回顧

本節探討了 RTK Query 如何在複雜的應用程式中扮演「中央資料協調者」的角色。透過快取 Key 與訂閱計數機制，它不僅節省了網路頻寬，更簡化了 UI 同步的邏輯。

### 重點總結

- **訂閱制模式**：呼叫 Hook 是在訂閱快取，而非單純發送請求。
- **請求去重複**：相同參數的請求在同一時間點只會發送一次。
- **自動同步**：當快取資料更新時，所有相關的 Hook 都會同步收到通知並更新 UI。
- **訂閱計數**：決定了快取的存活週期，確保只要還有元件在使用資料，快取就不會被銷毀。
- **架構簡化**：大幅減少了對 Context API 或手動狀態提升的依賴。

## 知識複習與預告

我們已經完整學習了 RTK Query 快取機制的三大支柱：生命週期管理、Key 的生成邏輯，以及跨元件的共享行為。這些知識構成了「查詢（Query）」的完整拼圖。

下一單元我們將進入 **Part 4: Review**。我會透過一系列精心設計的問題，帶你回顧並鞏固這整個主題的核心概念，確保你已經準備好進入下一課——那裡我們將學習如何讓快取「失效（Invalidation）」，這是處理資料更新（Mutation）最核心、也最神奇的部分。

請準備好你的筆記，我們即將對快取機制進行最後的總梳理。
