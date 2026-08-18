---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 3 堂：createApi 與 Query

# 38第一個 Query Endpoint

在上一節中，我們了解了 `createApi` 的基本骨架。現在，我們要進入最核心的部分：**定義 Endpoints**。如果你曾使用過傳統的 `useEffect` 搭配 `fetch` 或 `axios`，你可能習慣於「指令式」的寫法——也就是手動告訴瀏覽器「現在去抓資料，抓完後放在 state 裡」。

而在 RTK Query 中，我們轉向了「宣告式」的邏輯：我們定義好資料在哪裡、長什麼樣子，剩下的請求發送、狀態管理和快取邏輯，全部交給 RTK Query 自動處理。這一節，我們將以一個常見的部落格系統（Posts API）為例，手把手實作你的第一個 Query Endpoint。

## 解構 builder.query 的泛型語法

在 `endpoints` 區塊中，我們使用 `builder.query<ResultType, QueryArg>` 來定義一個查詢。對於 TypeScript 開發者來說，理解這兩個泛型參數至關重要，因為它們決定了你後續開發時的程式碼補全（IntelliSense）精準度。

### 泛型參數解析

1. `**ResultType**`** (結果型別)**：這是伺服器回傳的原始資料格式。例如，如果 API 回傳一個文章陣列，這裡就應該是 `Post[]`。
2. `**QueryArg**`** (參數型別)**：這是你呼叫這個 Hook 時需要傳入的參數型別。如果這個請求不需要參數（例如獲取「全部」文章），我們會將其設定為 `void`。

### 為什麼順序是這樣？

你可能會好奇，為什麼是先定義「結果」再定義「參數」？這是因為在實際開發中，我們幾乎總是需要定義回傳值的型別，但不一定每個請求都有參數。將 `ResultType` 放在第一位，可以讓我們在不需要參數時，利用 TypeScript 的預設推導或簡單寫法來節省時間。

---

## 實作第一個 Endpoint：獲取文章列表

讓我們從最簡單的 `getPosts` 開始。這個 Endpoint 的目標是向 `/posts` 發送一個 `GET` 請求，並取得所有文章。

### 基礎實作範例

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 定義文章的資料結構
export interface Post {
  id: number;
  title: string;
  body: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // 定義 getPosts endpoint
    // <Post[], void> 代表：回傳值是 Post 陣列，不需要傳入任何參數
    getPosts: builder.query<Post[], void>({
      query: () => 'posts', // 拼接在 baseUrl 之後，形成 https://.../posts
    }),
  }),
});
```

### 這裡發生了什麼？

- **宣告式定義**：我們告訴 `builder` 說：「我想要一個叫做 `getPosts` 的查詢，它會去抓 `posts` 這個路徑的資料。」
- **自動推導**：一旦你定義了 `getPosts`，RTK Query 底層就會開始運作。它知道這是一個 `GET` 請求（因為 `builder.query` 預設就是 `GET`）。
- **簡寫形式**：當 `query` 只需要返回路徑字串時，我們可以使用這種精簡的箭頭函式。

---

## Query 的兩種寫法：字串 vs 物件

在上面的範例中，我們直接回傳了字串 `'posts'`。這是最常用的縮寫，但有時候我們需要更精細的控制，例如設定 Header、自定義 Method 或加入 Query Parameters。

### 1. 字串路徑 (String Path)

適用於簡單的 `GET` 請求。

```typescript
query: () => 'posts'
```

### 2. 查詢物件 (Query Object)

如果你需要傳遞更多的請求細節，可以回傳一個物件。這在處理分頁、搜尋或需要特定 Header 的 API 時非常有用。

```typescript
getPostsByPage: builder.query<Post[], number>({
  query: (page = 1) => ({
    url: 'posts',
    method: 'GET', // 雖然 query 預設是 GET，但這裡可以明確指定
    params: { _page: page, _limit: 10 }, // 自動轉換為 ?_page=1&_limit=10
    headers: {
      'X-Custom-Header': 'some-value',
    },
  }),
}),
```

**提示：** 當你發現一個 `GET` 請求變得複雜時，請果斷切換到物件寫法，這會讓你的邏輯更清晰且易於維護。

---

## 傳入參數：實作 getPostById

現實開發中，我們經常需要根據 ID 獲取特定資料。這時候 `QueryArg` 就派上用場了。讓我們看看如何定義一個接收 `id` 的 Endpoint。

### 範例：動態路徑拼接

```typescript
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://.../' }),
  endpoints: (builder) => ({
    // ...之前的 getPosts
    
    // <Post, number> 代表：回傳單一文章，需要傳入一個 number 型別的 ID
    getPostById: builder.query<Post, number>({
      query: (id) => `posts/${id}`, // 這裡的 id 會由外部呼叫 Hook 時傳入
    }),
  }),
});
```

### 預測與發現：型別檢查的威力

當你定義好 `builder.query<Post, number>` 後，TypeScript 就會開始「監視」你。如果你在 `query` 函式中試圖把 `id` 當作字串處理（而沒有進行轉換），或者在元件中使用 Hook 時忘記傳入 ID，編譯器都會立即報錯。這大大減少了因拼字錯誤或參數遺漏導致的 Runtime Error。

---

## 自動生成 Hooks 的魔法

這是 RTK Query 最受開發者喜愛的功能之一：**自動生成 React Hooks**。

你不需要手動寫 `useFetchPosts` 或處理 `useState`、`useEffect`。當你定義完 Endpoint 並匯出 API Slice 時，RTK Query 會根據你的 Endpoint 名稱，按照特定的規則自動生成 Hook。

### 命名規則公式：

`use` + `[Endpoint 名稱（字首大寫）]` + `[Query 或 Mutation]`

讓我們來看看剛才定義的 Endpoints 會對應到什麼 Hooks：

| Endpoint 名稱 | 生成的 Hook 名稱 | 類型 |
| --- | --- | --- |
| `getPosts` | `useGetPostsQuery` | Query |
| `getPostById` | `useGetPostByIdQuery` | Query |
| `getCommentsByPostId` | `useGetCommentsByPostIdQuery` | Query |

### 如何匯出與使用？

你只需要在定義 API 的檔案末尾匯出這些自動生成的 Hooks 即可：

```typescript
// postsApi.ts

export const { useGetPostsQuery, useGetPostByIdQuery } = postsApi;
```

在 React 元件中，使用方式極其簡單：

```tsx
function PostDetail({ id }: { id: number }) {
  // 自動享有無懈可擊的型別安全
  // data 的型別會被自動推導為 Post | undefined
  const { data, isLoading } = useGetPostByIdQuery(id);

  if (isLoading) return <div>載入中...</div>;
  if (!data) return <div>找不到文章</div>;

  return <h1>{data.title}</h1>;
}
```

---

## 為什麼要強調型別安全？

對於進階開發者來說，RTK Query 不僅僅是節省了幾行程式碼，它更提供了一個「合約」。

當後端 API 修改了欄位名稱，你只需要在 `Post` 介面中修改一次，整個專案中所有使用 `useGetPostsQuery` 或 `useGetPostByIdQuery` 的元件都會立即顯示紅字錯誤。這種**端到端的型別追蹤**是傳統非同步管理模式（如手寫 `fetch`）難以企及的。

### 實際開發中的補全體驗

當你在元件中輸入 `data.` 時，編輯器會精準地跳出 `id`, `title`, `body` 的選項。這不是魔法，而是因為我們在 `builder.query<Post, number>` 中明確定義了結果型別。這種開發體驗能讓你更專注於業務邏輯，而不是翻閱 API 文件確認欄位名稱。

---

## 本節小結

我們已經完成了 RTK Query 實作的第一步：定義資料請求的規格。透過 `builder.query`，我們不僅定義了 API 的路徑，還確立了前後端通訊的型別合約。

### 重點回顧：

1. **泛型順序**：`<結果型別, 參數型別>`，參數若無則用 `void`。
2. **query 寫法**：簡單路徑用「字串」，複雜請求（Headers, Params）用「物件」。
3. **Hook 命名**：遵循 `use + Name + Query` 的固定格式。
4. **參數處理**：利用 `query: (arg) => ...` 將外部參數注入請求路徑或配置中。

雖然我們現在已經定義好了 API Slice，但如果你直接在元件中使用這些 Hooks，程式會報錯。為什麼？因為這些 Hooks 背後需要一個中央管家來處理快取、狀態和 middleware。在下一單元中，我們將學習如何將定義好的 `postsApi` 正確掛載到 **Redux Store** 中，讓整個系統真正運轉起來。
