---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 2 堂：Query 參數與實作

# 35skip 與 skipToken

想像一個常見的開發情境：你正在開發一個「使用者詳情頁面」，這個頁面需要先從 URL 取得 `userId`，再根據這個 ID 去發送 API 請求。但在某些極端情況下，URL 的參數可能暫時是 `undefined`（例如路由還在解析中），或者你希望使用者必須先勾選「我同意隱私協議」後才開始載入資料。

這時候你會遇到一個 React Hook 的核心限制：**你不能在條件語句（if statement）中呼叫 Hook**。

```typescript
// ❌ 這是錯誤的！React 會噴 Error
if (userId) {
  const { data } = useGetPostsQuery(userId);
}
```

既然我們無法迴避 Hook 的呼叫，那該如何優雅地告訴 RTK Query：「我知道我呼叫了你，但請你先等一下，現在還不是發送請求的時機」？這就是我們今天要深入探討的議題：`skip` 與 `skipToken`。

---

## 為什麼我們需要控制執行時機？

在 RTK Query 的宣告式（Declarative）心智模型中，Hook 的呼叫代表了一種「資料需求」的宣告。然而，在現實的應用程式中，「需求」往往是有前提條件的。常見的場景包括：

1. **依賴性請求（Dependent Queries）**：必須先拿到 API A 的結果（例如 `currentUser`），才能用其中的某個欄位去請求 API B。
2. **等待使用者動作**：頁面載入時不抓取，直到使用者點擊某個按鈕或輸入超過 3 個字元。
3. **參數未就緒**：如前所述，當動態路由參數 `id` 尚未從路由器（Router）中解析出來時。
4. **權限控制**：只有當使用者具備特定權限或已登入時，才發送敏感資料的請求。

如果我們不做任何處理，直接將一個可能是 `undefined` 的參數丟進 Hook，不僅會發送無效的請求到後端（產生 `/api/posts/undefined` 這種尷尬的 URL），更會讓 TypeScript 的型別檢查發出尖叫。

---

## 使用 skip 選項：簡單的邏輯開關

RTK Query 的所有 `useQuery` Hook 接受第二個參數，這是一個選項物件（Options Object）。其中最直觀的控制開關就是 `skip`。

`skip` 是一個布林值。當它為 `true` 時：

- RTK Query **不會**發送請求。
- 如果之前已經有快取資料，它會保持現狀。
- 如果之前沒有資料，它會停留在「未初始化」狀態。

### 實作範例：根據 ID 是否存在來決定抓取

假設我們有一個獲取文章評論的 Endpoint：

```typescript
// 簡單的 ID 判斷
const { data, isLoading } = useGetCommentsQuery(postId, {
  skip: !postId, // 如果 postId 是 null 或 undefined，就跳過請求
});
```

讓我們看一個更完整的元件範例，展示如何利用 `skip` 來處理「點擊後才載入」的邏輯：

```tsx
import React, { useState } from 'react';
import { useGetPostByIdQuery } from './apiSlice';

const PostViewer = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 只有當 selectedId 不為 null 時，才真正發送請求
  const { data: post, isFetching, isUninitialized } = useGetPostByIdQuery(
    selectedId ?? 0, // 這裡必須傳入一個數字以符合型別，雖然 skip 會攔截它
    { skip: selectedId === null }
  );

  return (
    <div>
      <button onClick={() => setSelectedId(1)}>讀取文章 #1</button>
      <button onClick={() => setSelectedId(2)}>讀取文章 #2</button>

      <hr />

      {isUninitialized && <p>請選擇一篇文章來查看內容</p>}
      
      {isFetching && <p>正在載入中...</p>}

      {post && (
        <div>
          <h1>{post.title}</h1>
          <p>{post.content}</p>
        </div>
      )}
    </div>
  );
};
```

### 深入理解 Uninitialized 狀態

當一個 Hook 因為 `skip: true` 而未執行時，它會處於 `uninitialized` 狀態。這與 `loading` 狀態有本質上的不同：

- `**isLoading: true**`**：表示請求已經發出，正在等待伺服器回應，且目前**沒有任何快取資料可用。
- **`isUninitialized: true`**：表示這個 Hook **從未**嘗試發送請求。

在 UI 表現上，你可以利用 `isUninitialized` 來顯示「請輸入搜尋關鍵字」或「請選擇項目」之類的提示訊息，而不是顯示一個旋轉的 Loading 圖示。

---

## TypeScript 的挑戰：為什麼 skip 不夠完美？

雖然 `skip` 很好用，但對於 TypeScript 開發者來說，它存在一個令人困擾的瑕疵。

請看下面的程式碼：

```typescript
// 定義 endpoint
// builder.query<Post, number> -> 參數必須是 number
getPostById: builder.query<Post, number>({
  query: (id) => `posts/${id}`,
}),

// 在元件中使用
const postId: number | undefined = getPostIdFromURL();

const { data } = useGetPostByIdQuery(postId, { // ❌ TS Error: undefined 不能賦值給 number
  skip: !postId,
});
```

即使我們寫了 `skip: !postId`，TypeScript 依然會報錯。因為在 TS 的眼中，`useGetPostByIdQuery` 的第一個參數必須是 `number`。即使你告訴 RTK Query 要 `skip`，你依然得傳入一個「假」的數字（例如 `0` 或 `-1`）來安撫編譯器，這會讓程式碼變得很醜陋且難以維護。

為了徹底解決這個問題，RTK Query 引入了 **`skipToken`**。

---

## skipToken：型別安全的終極方案

`skipToken` 是 RTK Query 提供的一個特殊常數（Symbol）。它的精妙之處在於：**它可以傳入任何 Query Hook 作為參數，並自動觸發 skip 行為，同時繞過型別檢查。**

當你傳入 `skipToken` 時：

1. RTK Query 自動將 `skip` 設為 `true`。
2. TypeScript 會允許這個呼叫，即便它不符合你原本定義的 `QueryArg` 型別。

### 如何使用 skipToken

首先，你需要從 `@reduxjs/toolkit/query/react` 匯入它：

```tsx
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useGetPostByIdQuery } from './apiSlice';

const PostDetail = ({ postId }: { postId?: number }) => {
  // 完美解決型別問題！
  // 如果 postId 存在，傳入 postId (number)
  // 如果 postId 不存在，傳入 skipToken
  const { data, error, isLoading } = useGetPostByIdQuery(postId ?? skipToken);

  if (isLoading) return <div>載入中...</div>;
  if (!data) return <div>請提供有效的 ID</div>;

  return <div>{data.title}</div>;
};
```

### 為什麼這很強大？

這種寫法的優勢在於：

- **型別純潔性**：你不再需要傳入 `0` 或 `""` 這種無意義的佔位符。
- **簡潔性**：你不需要在第二個參數中重複寫 `skip: !id`，意圖更加明確。
- **連鎖請求的最佳拍檔**：在處理多個有依賴關係的 API 時，`skipToken` 簡直是救星。

---

## 進階應用：依賴性請求（Dependent Queries）

假設你有一個需求：

1. 先根據 `username` 取得 `User` 物件。
2. 取得 User 後，利用 `user.id` 去抓取該使用者的 `Posts`。

如果使用傳統的 `useEffect`，你會寫出一堆巢狀的邏輯。但在 RTK Query 中，配合 `skipToken` 可以寫得非常優雅：

```tsx
const UserPosts = ({ username }: { username: string }) => {
  // 1. 第一個請求：根據 username 抓使用者資料
  const { data: user } = useGetUserByNameQuery(username);

  // 2. 第二個請求：依賴第一個請求的結果
  // 只有當 user 存在且 user.id 存在時，才發送請求
  // 否則傳入 skipToken，自動進入 uninitialized 狀態
  const { data: posts, isFetching: isPostsLoading } = useGetPostsByUserIdQuery(
    user?.id ?? skipToken
  );

  return (
    <div>
      <h1>{username} 的文章</h1>
      {isPostsLoading ? (
        <p>正在載入文章...</p>
      ) : (
        <ul>
          {posts?.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

在這個範例中，當頁面剛載入時，`user` 是 `undefined`，因此 `user?.id ?? skipToken` 會回傳 `skipToken`。這會導致第二個 Hook 自動進入 `skip` 狀態。一旦第一個請求成功回傳，`user.id` 有了值，第二個 Hook 會偵測到參數變化，自動切換為發送請求的狀態。這一切都是**自動且響應式**的。

---

## skip vs skipToken：該選哪一個？

雖然兩者都能達到目的，但根據不同的情境，我們有推薦的選用原則：

| 特性 | `skip` (Boolean) | `skipToken` |
| --- | --- | --- |
| **適用場景** | 簡單的布林切換（例如：勾選框、分頁開關） | 型別相關的條件（例如：參數可能是 `undefined`） |
| **TypeScript 友好度** | 較低，需手動處理非 null 斷言或佔位符 | 極高，原生支援型別推導 |
| **程式碼簡潔度** | 需要傳入參數 + options | 只需在參數位元做判斷 |
| **主要用途** | 控制「是否要抓取」 | 控制「當資料還沒準備好時不抓取」 |

**建議原則：**

- 如果你的參數型別是穩定的（例如永遠是 string），只是單純想透過一個按鈕控制開關，用 `skip`。
- 如果你的參數可能為空（`null` / `undefined`），請毫不猶豫地選擇 `skipToken`。

---

## 注意事項與常見坑洞

1. **狀態持久性**：當你將一個已經有資料的 Hook 切換回 `skip: true` 時，該 Hook 依然會持有最後一次成功的 `data`。這對於 UI 體驗通常是好的，因為可以避免畫面突然閃爍變白。
2. **不要在循環中使用**：雖然這屬於 React Hook 的基本規則，但還是要提醒，你不能在 `map` 裡面呼叫帶有 `skipToken` 的 Hook。如果你有無數個 ID 需要請求，應該考慮重新設計 API Endpoint 接受 ID 陣列，或者使用單一請求處理。
3. **結合 refetch**：即使一個 Hook 被 `skip` 了，如果你手動呼叫其回傳的 `refetch` 函式，它**依然不會**執行。只要 `skip` 條件成立或 `skipToken` 存在，該 Hook 就處於「凍結」狀態。

---

## 總結與銜接

掌握了 `skip` 與 `skipToken`，你現在已經可以精準地操控資料流的「閘門」。我們不再是被動地讓 Hook 在組件掛載時就橫衝直撞地發送請求，而是能夠根據應用的邏輯狀態、使用者行為以及 TypeScript 的型別嚴格要求，來決定資料抓取的精確時機。

這不僅讓你的應用程式更省流量（減少無效請求），更重要的是，它讓你的程式碼邏輯變得極其清晰：**參數就緒即抓取，參數未就緒即等待**。

接下來，我們將把之前學到的所有內容——定義 Endpoint、動態參數、以及今天的執行時機控制——全部整合在一起。我們將進行一個完整的 **Posts API 實作練習**，從零開始建立一個具備完整查詢能力的 API Slice，並在真實的元件場景中驗證這些機制的運作。如果你已經準備好動手寫程式，請看下一部分！
