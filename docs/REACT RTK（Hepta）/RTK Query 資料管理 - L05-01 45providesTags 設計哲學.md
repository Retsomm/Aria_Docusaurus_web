---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 5 堂：標籤快取同步機制

# 45providesTags 設計哲學

在之前的課程中，我們深入探討了 RTK Query 如何利用 `keepUnusedDataFor` 來管理快取的生命週期。你已經知道，快取會在沒有元件訂閱後的特定時間內自動消失。但這裡存在一個關鍵的實務問題：**如果伺服器端的資料更新了，前端要如何精準地知道該去重新抓取哪一份資料？**

想像一個情景：你在「文章列表」頁面點擊了其中一篇文章進行編輯並存檔成功。當你回到列表頁時，列表上的標題是否應該立即反應剛才的修改？在傳統的 `useEffect` 模式下，你可能需要手動呼叫一個 `fetchData` 函式，或者利用 Context API 發送一個全域訊號。

這就是 **標籤 (Tags)** 登場的時刻。標籤就像是給快取條目貼上的「身份證」或「追蹤標記」，它讓 RTK Query 能夠建立一套宣告式的自動同步機制。

## 什麼是 providesTags？

`providesTags` 是定義在 `query` endpoint 中的一個屬性。它的核心職責非常單純：**宣告這個請求回來的資料「擁有」哪些標籤。**

當 API 請求成功並將資料存入 Redux Store 時，RTK Query 會同時紀錄這些資料關聯了哪些標籤。這並不會立即發起任何動作，而是在 Store 中建立了一種「依賴關係圖」。

### 標籤的兩種宣告方式

在定義標籤時，我們通常有兩種寫法，這取決於你需要的控制粒度。

#### 1. 簡單字串陣列 (Simple String Tags)

這是最基礎的寫法，適合結構簡單、不需要精確區分單筆資料的場景。

```typescript
// postsApi.ts
getPosts: builder.query<Post[], void>({
  query: () => '/posts',
  // 告訴 RTK Query：這份列表資料屬於 'Post' 類別
  providesTags: ['Post'], 
}),
```

#### 2. 物件格式 (Object Tags)

這是進階開發者更常用的寫法。標籤通常是一個包含 `type` 與 `id` 的物件。這能讓我們在後續的資料同步中，像「手術刀」一樣精準地操作。

```typescript
getPostById: builder.query<Post, number>({
  query: (id) => `/posts/${id}`,
  // 提供更具體的標籤，例如 { type: 'Post', id: 5 }
  providesTags: (result, error, id) => [{ type: 'Post', id }],
}),
```

**為什麼要用物件？** 因為標籤的本質是為了「失效 (Invalidation)」。如果我們只用字串 `'Post'`，那麼只要任何文章被修改，所有跟 `'Post'` 有關的快取都會被清空並重新抓取。但在複雜的 App 中，我們可能只想重新抓取「那一個」特定的 ID，以節省頻寬並提升效能。

---

## 重點實作：List vs. Item 的設計模式

在處理 CRUD（增刪查改）應用時，最常見的挑戰在於「列表」與「單筆詳細資料」之間的聯動。這就是 RTK Query 標籤哲學發揮威力的地方。

當我們抓取一個文章列表時，我們不應該只給它一個通用的 `['Post']` 標籤，而應該採取一種「巢狀標籤 (Nested Tags)」的策略。

### 動態生成標籤陣列

`providesTags` 其實可以接收一個 callback 函式，這個函式會拿到三個參數：

1. `result`: API 回傳的實際資料。
2. `error`: 如果請求失敗，這裡會有錯誤資訊。
3. `arg`: 你呼叫 Hook 時傳入的參數（例如 ID 或分頁頁碼）。

讓我們看看一個專業的 `getPosts` 列表標籤設計：

```typescript
// 定義 API Slice
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  // 首先要在定義處宣告這份 API 會用到哪些類型的 Tag 名稱
  tagTypes: ['Post'], 
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      // 利用 callback 動態生成標籤
      providesTags: (result) =>
        result
          ? [
              // 1. 為列表中的每一筆資料都貼上專屬 ID 標籤
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              // 2. 額外加上一個代表「整個列表」的特殊標籤
              { type: 'Post', id: 'LIST' },
            ]
          : // 3. 如果請求失敗或沒資料，至少保留 LIST 標籤以便後續新增後觸發刷新
            [{ type: 'Post', id: 'LIST' }],
    }),
    
    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      // 單筆資料只需關注自己的 ID
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
  }),
});
```

### 為什麼要這樣設計？這背後的「標籤哲學」是什麼？

這種設計模式同時解決了三個維度的同步問題：

1. **新增資料 (Create)**：當我們新增一筆文章時，我們並不知道新文章的 ID 是多少。此時，我們可以讓 Mutation 失效 `{ type: 'Post', id: 'LIST' }`，這會強迫 `getPosts` 重新抓取，列表就會出現新成員。
2. **修改單筆 (Update)**：如果我們修改了 ID 為 `5` 的文章。因為 `getPosts` 的快取中也包含了 `{ type: 'Post', id: 5 }` 這個標籤，RTK Query 會自動發現「列表資料已經過時了」，進而自動觸發列表刷新。
3. **刪除資料 (Delete)**：與修改類似，失效特定 ID 的標籤會同時影響到「單筆詳細頁」與「整份列表」。

這就是我強調的 **「宣告式 (Declarative)」** 開發。在 `getPosts` 中，我們是在宣告：「我這份快取資料是由這些個體（ID）以及這份集合（LIST）所組成的」。

---

## 標籤與 TypeScript 的深度整合

對於進階開發者 Aria 來說，型別安全是不容忽視的。在 RTK Query 中，標籤的 `type` 必須匹配你在 `tagTypes` 中定義的字串。

為了避免拼字錯誤，我們通常會使用 `as const` 來確保型別的精確性：

```typescript
// 在標籤物件中使用 as const 鎖定型別
providesTags: (result) => [
  { type: 'Post' as const, id: 'LIST' }
]
```

如果你在 `tagTypes` 中定義了 `['Post', 'User']`，但你在 `providesTags` 裡寫了 `{ type: 'Comment', id: 1 }`，TypeScript 會立即噴出錯誤，提醒你該標籤類型尚未在 API Slice 中註冊。這能極大地減少在大型專案中因為手殘導致的快取更新失效問題。

---

## 核心概念對比：指令式 vs. 宣告式

讓我們停下來對比一下，為什麼標籤機制能取代 `useEffect`？

- **指令式 (Imperative - 傳統方式)**：
「當 `updatePost` 成功後，請去呼叫 `refetchGetPosts()` 函式，並同時更新本地的 `selectedPost` 狀態。」
*缺點：邏輯散落在各處，當 App 變大時，你會忘記到底哪些地方需要被刷新。*
- **宣告式 (Declarative - RTK Query 方式)**：
「`getPosts` 快取擁有標籤 `Post:5` 和 `Post:LIST`。」
「`updatePost` 執行後，會讓標籤 `Post:5` 失效。」
*結果：RTK Query 自動幫你把所有貼著 *`*Post:5*`* 標籤的快取全部標記為過時並重新抓取。*

你不再需要去手動管理「誰該更新誰」，你只需要定義好「誰是誰」。這就是 RTK Query 最核心的設計理念。

## 總結

`providesTags` 的設計核心在於**建立依賴關係**。透過為快取條目貼上標籤，你賦予了 RTK Query 追蹤資料的能力。

- **Tag 是標記**：它描述了快取內容的組成。
- **巢狀設計是關鍵**：結合 `LIST` 標籤與個體 `ID` 標籤，能讓你應付 90% 以上的資料同步場景。
- **型別安全是保障**：利用 TypeScript 確保標籤名稱的一致性。

## 接下來...

掌握了如何「貼標籤」之後，你可能會問：「那誰來負責撕掉標籤，讓快取失效？」

這就是我們下一部分要探討的主題：`**invalidatesTags**`** 實作**。我們將學習 Mutation 如何像一名「狙擊手」一樣，精準地擊中這些標籤，觸發系統自動完成資料的更新流程。

## 知識檢查點

在進入下一節之前，請 Aria 思考一下：

1. 為什麼我們在列表查詢中，除了 ID 標籤，通常還要多加一個 `{ type: 'Post', id: 'LIST' }`？
2. 如果一個 Query Endpoint 請求失敗了（`result` 為 `undefined`），為什麼在 `providesTags` 裡仍然建議回傳基本標籤？

這些問題的答案，將會在你開始寫 Mutation 時變得無比清晰。我們下一節見。
