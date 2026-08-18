---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 3 堂：createApi 與 Query

# 40useQuery Hook 解析

既然我們已經定義好了 `createApi` 並將其成功掛載到 Redux Store 中，現在就像是蓋好了發電廠（API Slice）並鋪設好了電網（Store Middleware）。接下來，我們要把電線接到家裡的電器上——也就是在 React 組件中使用 RTK Query 自動生成的 Hooks 來獲取資料。

RTK Query 的核心魔力在於它不僅僅是幫你 `fetch` 資料，它還幫你管理了複雜的**非同步狀態機**。

## 為什麼需要專門的 Hook？

在傳統的 `useEffect` 模式中，你通常需要手動維護至少三個狀態：`data`、`loading` 和 `error`。當需求變得複雜，例如需要「分頁預載入」或「背景自動刷新」時，程式碼會迅速失控。

RTK Query 根據你在 `endpoints` 中定義的名稱（例如 `getPosts`），自動生成了一個名為 `useGetPostsQuery` 的 Hook。這個 Hook 回傳的是一個包含狀態與資料的物件。

### 基本呼叫方式

```typescript
// 基本用法：不帶參數
const { data, error, isLoading } = useGetPostsQuery();

// 進階用法：帶參數與配置物件
const { data, isFetching } = useGetPostsQuery(123, {
  pollingInterval: 3000,      // 每 3 秒輪詢一次
  refetchOnFocus: true,       // 當視窗重新獲得焦點時刷新
  skip: !userId,              // 如果沒有 userId 則跳過請求
});
```

這看起來很簡單，但其回傳的物件中隱藏了許多細微的狀態標記。理解這些標記的語意差異，是寫出流暢 UI 的關鍵。

---

## 核心狀態對決：isLoading vs. isFetching

這是新手最常混淆的地方。如果你在 Loading 狀態處理得不好，使用者會看到螢幕不停地閃爍（Flicker），或者在資料更新時感到困惑。

### 1. isLoading：真正的「初始化中」

- **語意**：組件**第一次**掛載，且快取中**沒有資料**，目前正在發送第一個請求。
- **真值時機**：只有在發送請求且目前「完全沒有資料」可顯示時為 `true`。
- **用途**：通常用於顯示全螢幕的 Loading Spinner 或骨架屏（Skeleton）。

### 2. isFetching：正在「通訊中」

- **語意**：目前是否有**任何**請求正在處理中（無論是第一次、第十次，還是背景自動重新整理）。
- **真值時機**：只要有 API 請求發出，直到回應回來之前，它都是 `true`。
- **用途**：通常用於在導航列顯示一個細小的進度條，或在資料列表上方顯示一個淡淡的加載圖示，提示使用者「資料正在更新，但你可以先看舊的」。

### 行業對照表

| 情境 | `isLoading` | `isFetching` | 使用者看到的內容 |
| --- | --- | --- | --- |
| **首次點進頁面** | `true` | `true` | 大轉圈圈（Loading Spinner） |
| **資料回來後** | `false` | `false` | 完整的內容列表 |
| **手動點擊「重新整理」** | `false` | `true` | 舊的內容列表 + 頂部小轉圈 |
| **輪詢（Polling）背景更新** | `false` | `true` | 使用者無感，資料在背景偷偷更新 |

### 程式碼範例：精準的狀態判斷

```typescript
function PostList() {
  const { data, isLoading, isFetching } = useGetPostsQuery();

  // 如果是第一次載入，且完全沒資料，顯示骨架屏
  if (isLoading) return <SkeletonLoader />;

  return (
    <div>
      {/* 如果正在背景更新，顯示一個半透明的指示器 */}
      {isFetching && <div className="refresh-indicator">更新中...</div>}
      
      <ul>
        {data?.map(post => <li key={post.id}>{post.title}</li>)}
      </ul>
    </div>
  );
}
```

---

## 資料的一致性：data vs. currentData

當你的 Endpoint 帶有參數（例如分頁 `page` 或搜尋關鍵字 `term`）時，這兩個欄位的差異會變得至關重要。

### data：快取中的「最後一份成功資料」

當參數改變（例如從 `page=1` 切換到 `page=2`）時，新的請求會發出。在 `page=2` 的資料回來之前，為了防止畫面突然變白（閃爍），RTK Query 會在 `data` 欄位保留 `page=1` 的資料。

### currentData：嚴格對應「當前參數」的資料

與 `data` 不同，當參數改變後，`currentData` 會立即變為 `undefined`，直到對應該參數的回應抵達。

### 預測一下：搜尋功能的 UI 體驗

想像你正在做一個搜尋功能。使用者輸入 「React」 得到了結果，接著輸入 「Redux」。

- **使用 **`**data**`**：使用者會看到「React」的結果一直留在畫面上，直到「Redux」的結果載入完成，然後瞬間替換。**（體驗較佳，無閃爍）
- **使用 **`**currentData**`**：使用者按下搜尋後，畫面立即清空，顯示 Loading，然後再顯示「Redux」結果。**（傳統體驗，會有白屏感）

---

## 錯誤處理：FetchBaseQueryError

在 TypeScript 中，`useQuery` 回傳的 `error` 物件並不是簡單的字串。由於 RTK Query 預設使用 `fetchBaseQuery`，錯誤物件通常符合 `FetchBaseQueryError` 介面。

```typescript
const { error, isError } = useGetPostsQuery();

if (isError) {
  // 使用 'in' 關鍵字進行型別守衛 (Type Guard)
  if (error && 'status' in error) {
    // 這是 FetchBaseQueryError
    const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
    return <div>錯誤代碼: {error.status} - {errMsg}</div>;
  } else {
    // 這是 SerializedError (例如程式碼噴錯而非 API 報錯)
    return <div>發生未知錯誤: {error?.message}</div>;
  }
}
```

---

## 手動控制與優化

除了自動發送請求，`useQuery` 還賦予了我們手動介入的能力。

### 1. 手動刷新：refetch

有時候使用者想要「強制重新獲取」，例如下拉重新整理。

```typescript
const { data, refetch } = useGetPostsQuery();

return (
  <button onClick={() => refetch()}>
    點我強制重新拉取資料
  </button>
);
```

注意：`refetch()` 會無視快取，直接向伺服器發送請求。

### 2. 選擇性提取：selectFromResult

這是效能優化的高階技巧。假設你的 `getPosts` 回傳了 100 篇文章，但某個組件只需要其中標題含有「RTK」的那幾篇。你不需要在組件內用 `useEffect` 或 `useMemo` 再過濾一次，可以直接在 Hook 層級完成。

```typescript
const { postTitle } = useGetPostsQuery(undefined, {
  // result 是 Hook 的原始回傳物件
  selectFromResult: ({ data }) => ({
    // 我們只從中挑選並回傳我們感興趣的部分
    postTitle: data?.find(p => p.id === 1)?.title,
  }),
});
```

這樣做的好處是：當其他文章的內容改變時，只要 ID 為 1 的文章標題沒變，這個組件就**不會重新渲染**。

---

## 完整實作範例：Posts 管理元件

讓我們把上面的知識點串連起來，寫一個標準的 CRUD 讀取頁面。

```typescript
import React from 'react';
import { useGetPostsQuery } from '../services/postsApi';

const PostManager: React.FC = () => {
  // 1. 呼叫 Hook，取得狀態與資料
  const { 
    data: posts, 
    isLoading, 
    isFetching, 
    isError, 
    error,
    refetch 
  } = useGetPostsQuery(undefined, {
    pollingInterval: 60000, // 每分鐘自動更新一次
    refetchOnFocus: true    // 當使用者切換分頁回來時自動更新
  });

  // 2. 處理「初次載入」狀態 (無快取)
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin text-blue-500">載入中...</div>
        <p>正在為您準備精選文章</p>
      </div>
    );
  }

  // 3. 處理「錯誤」狀態
  if (isError) {
    return (
      <div className="bg-red-50 p-4 border border-red-200 text-red-700">
        <h4>發生錯誤</h4>
        <p>{'status' in error ? `代碼: ${error.status}` : '連線問題'}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          重試
        </button>
      </div>
    );
  }

  // 4. 渲染正常資料
  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">文章列表</h1>
        
        {/* 利用 isFetching 提供細膩的 UI 回饋 */}
        <div className="flex items-center gap-2">
          {isFetching && <span className="text-sm text-gray-500">同步中...</span>}
          <button 
            onClick={refetch}
            disabled={isFetching}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            手動刷新
          </button>
        </div>
      </header>

      <ul className="space-y-4">
        {posts?.map((post) => (
          <li 
            key={post.id} 
            className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-lg">{post.title}</h2>
            <p className="text-gray-600 line-clamp-2">{post.body}</p>
          </li>
        ))}
      </ul>

      {posts?.length === 0 && (
        <div className="text-center py-12 text-gray-400">目前沒有任何文章</div>
      )}
    </div>
  );
};

export default PostManager;
```

### 重點解析：

1. **分層處理**：我們優先處理了 `isLoading` 和 `isError`。這確保了當資料還沒準備好或出錯時，下方的 `posts.map` 不會因為存取 `undefined` 而崩潰。
2. **細膩反饋**：使用 `isFetching` 來顯示「同步中」，這讓使用者知道 App 正在努力工作，即使目前的資料已經可以觀看了。
3. **型別守衛**：在處理 `error` 時，我們考慮到了 API 錯誤與網路斷線的不同情況。

## 本單元重點總結

理解 `useQuery` 回傳的狀態標記，是從「堪用的前端」晉升為「專業前端」的必經之路：

- **`isLoading`**：關注的是「我有沒有東西可以顯示？」（用戶體驗的起點）。
- **`isFetching`**：關注的是「我現在跟伺服器連線了嗎？」（資料新鮮度的保證）。
- **`data`**：提供了平滑的轉場效果，避免了切換參數時的白屏。
- **`refetch`**：給予使用者對資料更新的絕對控制權。

透過這些工具，我們不再需要手動編寫複雜的 `useEffect` 邏輯，就能實現具備專業級用戶體驗的資料請求流程。接下來，我們將對 Topic 2 進行全面的複習，確保你已經完全掌握了從 Endpoint 定義到 UI 呈現的每一個細節。
