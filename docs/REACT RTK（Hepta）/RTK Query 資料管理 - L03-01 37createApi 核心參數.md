---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 3 堂：createApi 與 Query

# 37createApi 核心參數

在之前的課程中，我們已經建立了一個重要的心智模型：RTK Query 不僅僅是一個抓取資料的工具，它是一個**宣告式（Declarative）的資料管理中心**。過去我們習慣在 `useEffect` 裡寫命令式的抓取邏輯，現在我們要學習如何透過一個集中的配置點來定義整個 API 的行為。這個進入點就是 `createApi`。

如果你曾經用過 `createSlice` 來管理本地狀態，你可以把 `createApi` 想像成是「加強版的 Slice」，它專門為「遠端伺服器狀態」而生。它會自動為你生成 Reducer、Middleware，甚至是你最喜歡的 React Hooks。今天，我們將解剖 `createApi` 的三大核心參數，理解它們如何協同工作。

## 為什麼需要一個中央化的 API Slice？

在深入參數之前，我們必須先理解 `createApi` 的設計哲學。在傳統的 React 專案中，API 請求通常散落在各個元件或特定的 `services` 資料夾中。當多個元件需要同一份資料時，開發者必須手動處理「去重複（deduplication）」、處理 Loading 狀態的同步，以及最痛苦的——快取失效與重新獲取。

`createApi` 的核心價值在於**「單一事實來源（Single Source of Truth）」**。你只需要在一個地方定義 API 的基底路徑、標頭（Headers）和所有的端點（Endpoints），其餘的瑣事——從網路請求到狀態同步——全部交給 RTK Query 自動化處理。

---

## 命名空間：reducerPath

`createApi` 的第一個重要參數是 `reducerPath`。這是一個字串，代表這個 API Slice 在 Redux Store 中的「掛載點名稱」。

### 它的角色：Store 中的地址

當你將 `api.reducer` 掛載到 `configureStore` 時，Redux 需要知道這個 Reducer 管理的狀態應該放在哪一個 Key 底下。`reducerPath` 就是這個 Key。

```typescript
const api = createApi({
  reducerPath: 'postsApi', // 這就是它的身份證
  // ... 其他設定
});
```

### 為什麼它必須是唯一的？

在一個大型應用程式中，你可能會有多個 `createApi` 實例（雖然官方建議盡可能將相關的 API 整合在同一個 `createApi` 中）。如果兩個 API Slice 使用了相同的 `reducerPath`，Redux Store 就會發生衝突，因為兩個不同的 Reducer 都在嘗試控制同一個狀態片段。

**你可以把它想像成資料庫的資料表名稱。** 如果你有兩個名為 `users` 的表，資料庫就會不知道該往哪裡寫入或讀取。同樣地，RTK Query 需要這個唯一的 Key 來存放快取資料、請求計數器和標籤（Tags）狀態。

### 開發者的小撇步

通常我們會將 `reducerPath` 設定得具有描述性。例如，如果你正在處理 GitHub API，可以設定為 `'githubApi'`；如果是內部的產品後端，可以設定為 `'productsApi'`。這個名稱也會出現在 Redux DevTools 中，幫助你快速定位快取內容。

---

## 請求的基底：baseQuery

如果說 `reducerPath` 定義了資料「存哪裡」，那麼 `baseQuery` 就定義了資料「怎麼抓」。它是 RTK Query 中負責執行網路請求的核心邏輯。

### fetchBaseQuery：官方推薦的選擇

雖然你可以自定義 `baseQuery`（我們在進階課程會學到），但大多數情況下，你會使用 RTK Query 提供的 `fetchBaseQuery`。它是對原生 `fetch` API 的一層極簡封裝，旨在解決 `fetch` 的一些原始痛點。

`fetchBaseQuery` 做了幾件非常貼心的事：

1. **自動處理 JSON**：它會自動將 Request Body 轉為 JSON，並自動解析 Response 的 JSON。你再也不用手動呼叫 `res.json()` 了。
2. **狀態碼檢查**：如果伺服器回傳 4xx 或 5xx 錯誤，它會自動將 Promise 標記為 Rejected。
3. **基礎配置集中化**：讓你定義 `baseUrl`，之後所有的端點只需要寫相對路徑。

### baseUrl 的威力

設定 `baseUrl` 可以確保你的應用程式在開發環境（Localhost）、測試環境（Staging）和正式環境（Production）之間切換時，只需要修改一個地方。

```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.example.com/v1',
  // 你甚至可以在這裡統一處理 Header
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
```

在這個範例中，我們不僅定義了 API 的根目錄，還使用了 `prepareHeaders`。這是一個非常強大的功能，它允許你在每個請求發出前「攔截」並注入邏輯。這對於處理身份驗證（Authentication）非常有用，你不需要在每個 Endpoint 中重複寫注入 Token 的程式碼。

---

## 定義能力範圍：endpoints

這是 `createApi` 最有趣的地方。`endpoints` 定義了你想要對伺服器執行的所有操作。

### 為什麼使用 Builder 模式？

你會發現 `endpoints` 不是一個簡單的物件，而是一個接收 `builder` 物件並回傳一個物件的**函式**。

```typescript
endpoints: (builder) => ({
  getPosts: builder.query<Post[], void>({
    query: () => '/posts',
  }),
})
```

為什麼要設計成這麼複雜的函式結構，而不是直接給一個 Key-Value 物件呢？這主要有兩個深層原因：

#### 1. TypeScript 的型別推導（Type Inference）

`builder` 物件內部攜帶了豐富的型別資訊。當你呼叫 `builder.query<ResultType, QueryArg>` 時，TypeScript 能夠精確地追蹤這個端點的回傳型別和參數型別。這使得 RTK Query 能夠在你定義完端點後，**自動生成帶有完美型別定義的 Hooks**。如果你寫錯了路徑或參數型別，編輯器會立即報錯。

#### 2. 方法的分類：Query vs. Mutation

透過 `builder`，RTK Query 明確區分了兩種操作：

- **`builder.query`**：用於「取得」資料。這類操作是冪等的（Idempotent），通常對應 HTTP GET。RTK Query 會為這類操作提供自動快取和去重複功能。
- **`builder.mutation`**：用於「改變」資料。這類操作會更改伺服器狀態，通常對應 POST、PUT、PATCH 或 DELETE。這類操作不會被快取，但它們可以觸發 Query 的「失效（Invalidation）」，迫使舊資料更新。

### 宣告式 vs 命令式

在 `endpoints` 中，你是在**宣告** API 的結構，而不是在**撰寫**請求的過程。你只需要告訴 RTK Query：「我有一個叫做 `getPosts` 的功能，它的 URL 是 `/posts`，回傳的是 `Post` 陣列。」剩下的 Loading 狀態、錯誤捕捉、快取時間，RTK Query 都會幫你管理。

---

## 實作範例：createApi 基礎骨架

現在，讓我們將這些碎片的知識拼湊起來。假設我們要建立一個管理部落格文章的 API，以下是它在 TypeScript 中的標準起手式：

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 定義資料型別，讓 TypeScript 保護我們的程式碼
interface Post {
  id: number;
  title: string;
  body: string;
}

// 1. 建立 API Slice
export const postsApi = createApi({
  /**
   * reducerPath:
   * 定義此 API 在 Redux Store 中的位置。
   * 如果 Store 像是一棟公寓，這就是 postsApi 的門牌號碼。
   */
  reducerPath: 'postsApi',

  /**
   * baseQuery:
   * 設定所有請求的共同特徵。
   * 我們使用 fetchBaseQuery 來處理 baseUrl 與 JSON 轉換。
   */
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://jsonplaceholder.typicode.com/' 
  }),

  /**
   * endpoints:
   * 定義具體的 API 操作。
   * 使用 builder 模式來獲得最佳的 TypeScript 支援。
   */
  endpoints: (builder) => ({
    // 我們定義一個名為 getPosts 的查詢
    // <回傳型別, 參數型別>：這裡不需要參數，所以用 void
    getPosts: builder.query<Post[], void>({
      query: () => 'posts', // 實際請求路徑為 baseUrl + 'posts'
    }),
  }),
});

/**
 * RTK Query 會根據 endpoints 的名稱自動生成 Hooks。
 * 格式為：use + [Endpoint名稱] + Query (或 Mutation)
 * 這裡自動生成了 useGetPostsQuery
 */
export const { useGetPostsQuery } = postsApi;
```

### 這段程式碼背後發生了什麼？

當你執行 `createApi` 時，RTK Query 在幕後為你做了這幾件事：

1. **生成了一個 Reducer**：它會處理 `getPosts` 請求的所有生命週期狀態（pending, fulfilled, rejected）。
2. **生成了一個 Middleware**：它負責攔截發出的 Action、管理快取計時器，並在元件卸載時決定是否要清除快取。
3. **生成了 React Hook**：`useGetPostsQuery` 是這段程式碼的精華。你在元件中只需要呼叫這個 Hook，它就會自動發送請求，並在資料回來時重新渲染元件。

---

## createApi 回傳值的結構

許多初學者在呼叫 `createApi` 後會感到困惑：我拿到的 `postsApi` 物件到底是什麼？

如果你在 Console 中印出 `postsApi`，你會發現它不僅僅是一個物件，它是一個功能齊全的「服務包」。它包含：

- **`reducer`**：你需要把它放到 Redux 的 `combineReducers` 中。
- **`middleware`**：你需要把它放到 Store 的 middleware 陣列中。
- **`endpoints`**：包含你定義的所有端點邏輯。
- **`util`**：一些實用的工具函式，例如手動更新快取或重置 API 狀態。
- **自動生成的 Hooks**：如 `useGetPostsQuery`。

這種「全包式」的設計，讓我們能確保「 API 定義」與「狀態管理邏輯」始終保持同步。你不需要定義了 API 後，再手動去寫對應的 Action Type 或 Reducer Case，這大大減少了樣板程式碼（Boilerplate）。

## 常見問題與設計細節

### 我應該在一個專案中建立多個 createApi 嗎？

這是一個常見的陷阱。RTK Query 的官方建議是：**一個 App 通常只需要一個 `createApi`**。
為什麼？因為 `createApi` 內部的快取失效機制（Tag System）是基於單一 API Slice 的。如果你把「使用者 API」和「文章 API」拆分成兩個 `createApi`，那麼當你更新使用者時，就無法輕易地讓文章 API 中的快取失效。
除非你的 API 分屬完全不同的後端領域（例如一個是自己的 Server，一個是第三方的 Google Maps API），否則建議將所有 endpoints 寫在同一個 `createApi` 下。

### 為什麼不直接用 Axios？

雖然 `fetchBaseQuery` 是基於 `fetch` 的，但你確實可以透過自定義 `baseQuery` 來整合 Axios。不過，對於 90% 的場景，`fetchBaseQuery` 已經足夠強大，且它與 RTK Query 的內部錯誤處理機制完美契合。使用 `fetchBaseQuery` 能讓你保持專案依賴的輕量化。

## 總結核心概念

透過 `createApi`，我們建立了一個強大的資料層。讓我們快速複習這三個關鍵參數：

| 參數 | 職責 | 關鍵點 |
| --- | --- | --- |
| `**reducerPath**` | 在 Store 中的身份標識 | 必須唯一，建議具備描述性 |
| `**baseQuery**` | 網路請求的底層邏輯 | `fetchBaseQuery` 自動處理 JSON 與 `baseUrl` |
| `**endpoints**` | 宣告可用的 API 功能 | 使用 `builder` 模式以獲得自動生成 Hook 與型別推導 |

## 邁向實作的第一步

了解了 `createApi` 的骨架後，你已經掌握了 RTK Query 的指揮中心。然而，光有骨架是不夠的，我們需要往裡面填入具體的「功能」，也就是 Endpoints。

在下一單元中，我們將深入探討如何設計第一個具體的 **Query Endpoint**。我們將以 Posts API 為例，學習如何處理 URL 路徑的拼接、如何利用 TypeScript 泛型確保資料安全，以及如何解讀 RTK Query 自動生成的 Hook 命名規則。準備好了嗎？讓我們開始定義具體的資料需求吧！
