---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 6 堂：Mutation 請求處理

# 49Mutation Endpoint 定義

在前面的課程中，我們已經學會了如何使用 RTK Query 像「點餐」一樣宣告資料需求。然而，一個真實的應用程式不僅僅是顯示資料，我們還需要「點餐」以外的操作：註冊帳號、發送貼文、按讚或是刪除評論。在 RTK Query 的世界裡，這些會改變伺服器狀態的操作被統稱為 **Mutation**（變更）。

如果說 Query 是為了讓我們「看見」世界，那麼 Mutation 就是為了讓我們「改變」世界。

## 從「讀取」跨越到「寫入」：為什麼需要 Mutation？

在進入程式碼之前，我們必須先釐清一個關鍵的心智模型轉變。在傳統的 `useEffect` + `fetch` 模式中，發送一個 `GET` 請求和發送一個 `POST` 請求在寫法上大同小異，頂多是修改一下 `method` 和 `body`。

但在 RTK Query 中，**Query** 與 **Mutation** 被嚴格區分開來，這是因為它們在資料流中的本質完全不同：

### 1. 副作用（Side Effects）的有無

- **Query**：設計上應該是「冪等（Idempotent）」的。這意味著無論你發送多少次請求，只要參數相同，結果就應該相同，且不應對伺服器產生副作用。因此，Query 可以被激進地快取。
- **Mutation**：核心在於「產生副作用」。它會修改伺服器上的數據。因為它改變了資料，所以 Mutation 通常會導致現有的快取變得「過時」。

### 2. 快取行為的差異

- **Query**：會自動在 Redux Store 中建立快取條目，並根據訂閱計數（Subscription Count）來決定何時保留或刪除資料。
- **Mutation**：**不會**快取其回傳的結果。Mutation 的執行結果（例如伺服器回傳的「操作成功」訊息或新增的物件）通常只在當次操作的生命週期內有用。Mutation 的真正使命是「觸發變更」，並在成功後「通知」相關的 Query 去重新抓取資料（我們會在後面的 Tag Invalidation 章節深入討論這一點）。

## 深入解析 builder.mutation 的語法結構

在 `createApi` 的 `endpoints` 定義中，我們使用 `builder.mutation<ResultType, QueryArg>` 來宣告一個變更端點。這是一個強型別的泛型宣告，對於開發體驗至關重要。

### 泛型參數的語義

```typescript
builder.mutation<ResultType, QueryArg>
```

1. **`ResultType`**：這是伺服器執行完 Mutation 後回傳的資料型別。
  - 如果你新增一篇文章，伺服器通常會回傳包含 `id` 的完整文章物件，此時型別可能是 `Post`。
- 如果伺服器只回傳成功訊息或狀態碼，你可以定義為 `{ success: boolean }`。
- 如果伺服器不回傳任何內容（204 No Content），建議設定為 `void` 或 `any`（但 `void` 更能表達語意）。
2. **`QueryArg`**：這是你呼叫這個 Mutation 時需要傳入的參數型別。
  - 通常這會是一個 Payload 物件，例如 `Partial<Post>` 或 `Omit<Post, 'id'>`。
- 如果這個操作不需要參數（例如「清空所有通知」），則設定為 `void`。

### 宣告式與指令式的平衡

你會發現，雖然我們是在「宣告」一個 Endpoint，但 Mutation 的定義內部其實描述了「如何執行這個動作」。這就是 `query` callback 函式的職責。

## 實作細節：撰寫 query callback

與 `builder.query` 不同，Mutation 的 `query` 通常不能只回傳一個字串路徑，因為我們必須明確指定 HTTP Method 以及要傳送的 Data Body。

### query callback 的回傳物件

當你定義一個 Mutation 時，`query` 函式接收 `QueryArg` 作為參數，並回傳一個包含以下屬性的物件：

- `**url**`: API 的路徑字串。
- `**method**`: HTTP 動作，如 `'POST'`、`'PUT'`、`'PATCH'` 或 `'DELETE'`。
- `**body**`: 要傳送給伺服器的資料（Payload）。RTK Query 會自動將其序列化為 JSON。
- `**params**`: 選填。附加在 URL 後面的 Query Parameters。
- `**headers**`: 選填。針對特定請求要加入的標頭（例如特定的 Content-Type）。

### HTTP Method 的使用場景指南

在設計 Mutation Endpoint 時，遵循 RESTful 規範能讓你的 API slice 語意更清晰：

- `**POST**`**：用於**建立資源。例如 `addPost`、`registerUser`。每次呼叫通常都會在資料庫產生一筆新紀錄。
- `**PUT**`**：用於**完整替換資源。你必須提供該資源的所有欄位，伺服器會用你提供的資料完全覆蓋舊有的資料。
- `**PATCH**`**：用於**局部更新資源。當你只想修改文章的 `title` 而不想更動 `content` 時，使用 `PATCH` 是最理想的，因為它只傳送變動的部分。
- `**DELETE**`**：用於**刪除資源。

## 程式碼範例：建立 Posts API 的 Mutation

讓我們延續之前的 `postsApi` 範例，為它加入「新增文章」與「更新文章」的功能。請注意我們是如何運用 TypeScript 型別來確保開發過程中的準確性。

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 定義資料模型
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// 定義新增文章時的參數型別 (不需要 id，因為 id 由後端產生)
export type CreatePostRequest = Omit<Post, 'id'>;

// 定義更新文章時的參數型別 (只需要部分欄位，但 id 是必填的)
export type UpdatePostRequest = Partial<Post> & Pick<Post, 'id'>;

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // 1. 之前的 Query Endpoint (讀取)
    getPosts: builder.query<Post[], void>({
      query: () => 'posts',
    }),

    // 2. 新增 Mutation Endpoint (寫入 - POST)
    addPost: builder.mutation<Post, CreatePostRequest>({
      query: (newPost) => ({
        url: 'posts',
        method: 'POST',
        body: newPost,
      }),
    }),

    // 3. 更新 Mutation Endpoint (寫入 - PATCH)
    updatePost: builder.mutation<Post, UpdatePostRequest>({
      query: ({ id, ...patch }) => ({
        url: `posts/${id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),

    // 4. 刪除 Mutation Endpoint (寫入 - DELETE)
    deletePost: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE',
      }),
      // 有時候後端刪除成功只回傳 200，我們可以透過 transformResponse 加工
      transformResponse: (response: any, meta, arg) => ({
        success: true,
        id: arg, // arg 就是我們傳入的 id
      }),
    }),
  }),
});

// 自動產生的 Hooks
export const { 
  useGetPostsQuery, 
  useAddPostMutation, 
  useUpdatePostMutation, 
  useDeletePostMutation 
} = postsApi;
```

### 深入剖析 `addPost` 的實作

在上面的程式碼中，`addPost` 展示了 Mutation 的標準寫法：

1. **泛型定義**：`builder.mutation<Post, CreatePostRequest>`。這告訴 TS，當我們呼叫這個動作時，必須傳入一個不含 `id` 的文章物件，而我們會得到一個包含 `id` 的完整文章物件。
2. **解構參數**：在 `updatePost` 中，我們使用 `query: ({ id, ...patch }) => ...`。這是一個常見的技巧：從參數中分離出 `id` 用於拼接 URL，而將剩下的部分作為 `body` 傳送。

## 對比：builder.query vs. builder.mutation

雖然兩者都定義在同一個 `endpoints` 區塊中，但在實務操作上有顯著的差異。為了幫助你建立清晰的對比，我們可以從以下幾個維度來看：

| 特性 | `builder.query` | `builder.mutation` |
| --- | --- | --- |
| **主要目的** | 取得資料 (Read) | 改變伺服器資料 (Write/Side effect) |
| **預設 Method** | `GET` | `POST` (通常需要在物件中指定) |
| **快取行為** | 自動快取回傳結果 | **不快取**回傳結果 |
| **參數角色** | 作為 Cache Key 的一部分 | 作為 Request Body 或識別 ID |
| **自動產生 Hook** | `useNameQuery` | `useNameMutation` |
| **Hook 回傳值** | 主要是資料與載入狀態物件 | 回傳一個包含「觸發函式」的元組 (Tuple) |
| **自動執行** | 元件掛載時預設自動發送 | 必須由開發者手動呼叫「觸發函式」 |

### 位置的一致性

儘管行為不同，但在 `createApi` 中，它們享有同樣的層級：

```typescript
endpoints: (builder) => ({
  // Query 與 Mutation 鄰里並存，共享同一個 baseQuery 的配置
  fetchItems: builder.query<...>(...), 
  updateItem: builder.mutation<...>(...), 
})
```

這種設計的好處是，所有的 API 邏輯（不論讀寫）都被封裝在一個 Slice 中。當你需要針對整個 API 加入 `Authorization` 標頭或是處理全域錯誤時，只需要在 `baseQuery` 層級處理一次，這對 Query 和 Mutation 都同樣有效。

## 常見陷阱與最佳實踐

### 1. 忘記指定 Method

如果你在 `builder.mutation` 的 `query` 中回傳一個物件，但漏掉了 `method` 屬性，RTK Query 預設會使用 `GET`。這會導致你的 `POST` 請求發送失敗，甚至在某些嚴格的 API 中回傳 405 Method Not Allowed。請務必養成寫下 `method` 的習慣。

### 2. ResultType 的型別陷阱

有時候 API 在刪除成功後回傳空字串或特定的文字（非 JSON）。如果你將 `ResultType` 設定為一個複雜物件，TS 雖然不會報錯，但執行時期 `unwrap()` 出來的結果可能會讓你意外。若不確定，先設定為 `void` 或 `any` 並觀察 Network Tab。

### 3. 參數的單一性

`query` 函式只接受一個參數。如果你需要傳入多個值（例如 `id` 和 `body`），請務必將它們封裝成一個物件，如 `updatePost` 範例所示：`query: (data) => ({ url: ... })`，而不是 `query: (id, body) => ...`（這是錯誤的）。

### 4. 不要試圖快取 Mutation 的結果

有些開發者會想：「既然 `addPost` 回傳了新的文章物件，我是不是能把它直接塞進快取？」雖然 RTK Query 提供了手動操作快取的方法（如 `util.updateQueryData`），但這通常屬於進階的「樂觀更新」範疇。在基礎階段，我們應該專注於「變更 → 標籤失效 → 自動重新讀取」這個更強大的自動化閉環。

## 總結與承接

我們已經學會了如何在 API Slice 中「定義」一個 Mutation。這就像是在後台準備好了發射台與火箭的規格。

但僅有定義是不夠的，我們還需要知道如何在 React 元件中按下那個「發射按鈕」。在下一部分中，我們將深入解析 `useMutation` 這個 Hook。你會發現，它與 `useQuery` 的用法有巨大的不同：它不會在元件掛載時自動執行，而是會交給你一個「觸發函式」，讓你在按鈕點擊或表單送出時完全掌控執行的時機。

我們也會探討如何追蹤 Mutation 的進度：現在是在 `isLoading` 嗎？請求成功了嗎（`isSuccess`）？如果失敗了，錯誤訊息（`error`）該如何取得？

---

### 重點回顧

- **Mutation** 用於處理具有副作用的伺服器操作（C/U/D）。
- **泛型結構** 為 `builder.mutation<ResultType, QueryArg>`，其中 `ResultType` 是回傳值，`QueryArg` 是參數。
- `**query**`** callback** 必須回傳一個物件，詳盡描述 `url`、`method` 與 `body`。
- **RESTful 規範**：建立用 `POST`，替換用 `PUT`，局部更新用 `PATCH`，移除用 `DELETE`。
- **快取差異**：Mutation 不會快取結果，其目的是改變伺服器狀態。
