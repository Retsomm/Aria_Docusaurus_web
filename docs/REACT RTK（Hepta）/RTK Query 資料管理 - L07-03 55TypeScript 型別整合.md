---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 7 堂：樂觀更新實作

# 55TypeScript 型別整合

在之前的學習中，我們已經掌握了「樂觀更新」（Optimistic Updates）的邏輯流程：在請求發送的第一時間修改快取，並準備好在失敗時進行回滾（Undo）。然而，在實際的大型專案中，手動操作 Redux 快取是一件極具風險的事情。如果你不小心把 `status` 寫成了 `state`，或者將原本應該是 `boolean` 的欄位賦值為 `string`，你的 UI 就會陷入不可預知的錯誤狀態。

幸運的是，RTK Query 與 TypeScript 的深度整合，讓這場「快取手術」變得極其安全。這一部分我們將深入探討如何利用 TypeScript 的強型別特性，確保樂觀更新的程式碼不僅運作正確，還能擁有完美的開發補全（IntelliSense）與編譯檢查。

---

## Immer 的 Draft 型別：讓唯讀資料變的可變

在 Redux 的世界裡，有一條不可觸碰的鐵律：「永遠不要直接修改狀態（State）。」通常我們需要使用大量的展開運算子（Spread Operator `...`）來建立資料的副本。但在 `onQueryStarted` 中使用 `updateQueryData` 時，你會發現我們可以像寫普通 JavaScript 物件一樣，直接對屬性賦值。

這是因為 RTK Query 內部集成了 **Immer** 庫。在 `updateQueryData` 的 `recipe`（配方）回呼函式中，傳入的參數 `draft` 並不是原始的快取資料，而是一個「草稿」。

### 為什麼需要 Draft<T>？

當你在 TypeScript 中定義 API 的回傳型別時（例如 `Todo[]`），這些資料通常被視為不可變的（Immutable）。如果你直接嘗試修改它，TypeScript 會根據 `Readonly` 規則向你發出警告。

**Immer 提供的 **`**Draft<T>**`** 型別** 解決了這個問題。它會遞迴地將 `T` 型別中的所有唯讀屬性轉換為可寫屬性。

```typescript
// 假設這是我們的型別定義
interface Todo {
  readonly id: string;
  readonly text: string;
  readonly completed: boolean;
}

// 在普通的 TypeScript 函數中：
const updateTodo = (todo: Todo) => {
  todo.completed = true; // ❌ 錯誤：無法分配給常數或唯讀屬性
};

// 在 updateQueryData 的 recipe 中：
// draft 的型別會被自動推導為 Draft<Todo[]>
(draft) => {
  const todo = draft.find(t => t.id === '1');
  if (todo) {
    todo.completed = true; // ✅ 成功：Draft<T> 允許直接賦值
  }
}
```

這不僅僅是為了方便，它保證了你在「樂觀更新」時，可以專注於邏輯（要把什麼改成什麼），而不需要分心去處理複雜的 Immutable 更新語法，同時還能享有型別檢查。

---

## 自動推導與補全：從 Endpoint 名稱開始

RTK Query 的一個強大之處在於它的「型別聯動」。當你呼叫 `api.util.updateQueryData` 時，第一個參數是你想要修改的 **Endpoint 名稱**。

一旦你輸入了正確的名稱，TypeScript 的類型系統就會像骨牌一樣產生連鎖反應：

1. 它知道該 Endpoint 回傳的資料結構（決定了 `draft` 的型別）。
2. 它知道該 Endpoint 接收的參數型別（決定了你傳入的第二個參數 `arg` 是否正確）。

### 預測與發現：型別是如何「找」到對應資料的？

假設我們有以下 API 定義：

```typescript
const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    // 這裡定義了：ResultType 為 Todo[]，QueryArg 為 void
    getTodos: builder.query<Todo[], void>({
      query: () => '/todos',
    }),
    // 這裡定義了：ResultType 為 Todo，QueryArg 為 string (id)
    getTodoById: builder.query<Todo, string>({
      query: (id) => `/todos/${id}`,
    }),
  }),
});
```

當你在 Mutation 中嘗試進行樂觀更新時：

```typescript
// 在 updateTodo 的 mutation 中
onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
  
  // 💡 這裡發生了什麼？
  const patchResult = dispatch(
    todoApi.util.updateQueryData(
      'getTodos', // 1. 當你輸入 'getTodos'
      undefined,   // 2. TS 會強制要求這裡必須是 undefined (因為 getTodos 的參數是 void)
      (draft) => { // 3. TS 自動知道 draft 是 Draft<Todo[]>
        // 你在這裡輸入 draft. 時，IDE 會自動提示陣列的方法如 push, find 等
      }
    )
  );
}
```

如果你嘗試將 `'getTodos'` 改成 `'getTodoById'`，TypeScript 會立刻報錯，提醒你第二個參數必須是一個 `string`（ID），且 `draft` 的型別會切換為單個 `Todo` 物件。這種自動化的推導避免了「開發者以為自己在改 A 快取，實際上改了 B 快取」的慘劇。

---

## 泛型宣告：一切型別安全的源頭

如果你的樂觀更新邏輯中出現了 `any` 或者型別錯誤，通常問題不在 `onQueryStarted` 內部，而在於你的 **Endpoint 定義**。

我們多次強調過 `builder.query<ResultType, QueryArg>` 的重要性。在樂觀更新中，這兩個泛型直接決定了你的快取修改是否安全。

### 常見的型別陷阱

如果你的 API 回傳格式是 `{ data: Todo[], status: string }`，但你在宣告時偷懶寫成了 `builder.query<Todo[], void>`，那麼：

1. `updateQueryData` 會認為 `draft` 是一個陣列。
2. 當它實際執行時，發現快取內容其實是一個物件（包含 `data` 屬性）。
3. 你的程式碼會因為嘗試在物件上執行陣列方法（如 `.find()`）而崩潰。

**最佳實踐：** 始終定義精確的 Interface。

```typescript
interface GetTodosResponse {
  todos: Todo[];
  total: number;
}

// 這樣宣告後，在樂觀更新時 draft.todos 才會被正確推導
getTodos: builder.query<GetTodosResponse, void>({
  query: () => '/todos',
}),
```

---

## queryFulfilled 的型別：拿到伺服器的「最終答案」

樂觀更新的核心是在結果揭曉前先「預設成功」。但有時候，我們在 `try` 區塊（請求真正成功後）需要根據伺服器回傳的內容再次調整快取。

`await queryFulfilled` 的回傳值具有明確的型別結構：

```typescript
const { data, meta } = await queryFulfilled;
```

這裡的 `data` 型別會精確地對應到你 Mutation Endpoint 宣告的 `ResultType`。

### 實際應用場景：處理伺服器生成的 ID

當你新增一個 Todo 時，前端通常沒有 ID。你會先用一個臨時 ID（如 `temp-id`）進行樂觀更新。當伺服器回傳真正的 ID 時，你需要再次修改快取，將臨時 ID 替換掉。

```typescript
// ResultType 是伺服器回傳的完整 Todo，QueryArg 是前端傳入的 partial todo
addTodo: builder.mutation<Todo, Partial<Todo>>({
  query: (newTodo) => ({ url: '/todos', method: 'POST', body: newTodo }),
  async onQueryStarted(newTodo, { dispatch, queryFulfilled }) {
    // 1. 樂觀更新：先用臨時資料佔位
    const patchResult = dispatch(
      todoApi.util.updateQueryData('getTodos', undefined, (draft) => {
        draft.push({ ...newTodo, id: 'temp-id' } as Todo);
      })
    );
    
    try {
      // 2. 等待伺服器回應
      const { data: realTodo } = await queryFulfilled;
      
      // 3. 用伺服器回傳的真實資料（包含真 ID）修正快取
      dispatch(
        todoApi.util.updateQueryData('getTodos', undefined, (draft) => {
          const index = draft.findIndex(t => t.id === 'temp-id');
          if (index !== -1) draft[index] = realTodo;
        })
      );
    } catch {
      patchResult.undo();
    }
  }
})
```

---

## 完整型別實作範例：updateTodo

現在，讓我們將所有知識點整合，看一個具備完整 TypeScript 型別安全的 `updateTodo` 樂觀更新範例。這個範例展示了如何處理列表（List）型別的快取修改。

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.com' }),
  tagTypes: ['Todos'],
  endpoints: (builder) => ({
    // 獲取清單
    getTodos: builder.query<Todo[], void>({
      query: () => '/todos',
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: 'Todos' as const, id })), { type: 'Todos', id: 'LIST' }]
          : [{ type: 'Todos', id: 'LIST' }],
    }),

    // 更新任務
    updateTodo: builder.mutation<Todo, Pick<Todo, 'id' | 'completed'>>({
      query: ({ id, ...patch }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      // 強大的型別安全從這裡開始
      async onQueryStarted({ id, completed }, { dispatch, queryFulfilled }) {
        
        // 執行樂觀更新並取得回滾函式
        const patchResult = dispatch(
          // 注意：第一個參數 'getTodos' 決定了後續所有型別
          todoApi.util.updateQueryData('getTodos', undefined, (draft) => {
            // draft 被自動推導為 Draft<Todo[]>
            const todo = draft.find((t) => t.id === id);
            if (todo) {
              // 這裡可以直接賦值，TypeScript 會檢查屬性名稱與型別
              todo.completed = completed;
            }
          })
        );

        try {
          // 等待請求完成，若失敗會跳入 catch
          await queryFulfilled;
        } catch {
          // 發生錯誤，執行回滾
          patchResult.undo();
          
          /* 
            提示：在實際專案中，你可能會在這裡 dispatch 一個顯示錯誤訊息的 action，
            或是彈出一個 Toast 通知使用者「同步失敗，已回復原始狀態」。
          */
        }
      },
    }),
  }),
});
```

### 為什麼這個範例比 `useEffect` 更好？

1. **型別安全**：如果你修改了 `Todo` 的結構（例如將 `completed` 改名為 `isDone`），編譯器會立刻指出 `updateTodo` 中的樂觀更新邏輯失效了。
2. **開發體驗**：在 `(draft) => { ... }` 內部，你可以享受完整的物件屬性提示，不再需要翻閱 API 文件確認欄位。
3. **邏輯解耦**：所有的快取修改邏輯都封裝在 `onQueryStarted` 中，你的 React 元件只需要呼叫 `trigger` 函式，不需要關心快取如何同步。

---

## 總結與銜接

### 重點回顧

- **Draft<T>**：Immer 提供的魔法型別，讓你可以用簡單的賦值語句操作本來是唯讀的快取資料。
- **型別聯動**：傳入 `updateQueryData` 的第一個參數（Endpoint 名稱）是開啟型別補全的鑰匙。
- **雙重保障**：透過 `onQueryStarted` 同步執行樂觀更新，並利用 `queryFulfilled` 的 Promise 特性處理錯誤回滾。

### 接下來...

到目前為止，我們已經從理論、生命週期到型別安全，全面拆解了 RTK Query 的樂觀更新機制。但紙上談兵終覺淺，最好的學習方式就是親手實作一個完整的應用。

在下一個單元，我們將進入 **「Todo API 實作練習」**。這是一個綜合性的挑戰，你將從零開始建立一個 Todo API Slice，並為新增、編輯、刪除功能分別實作不同的快取同步策略。我們將把「標籤失效（Invalidation）」與「樂觀更新（Optimistic Updates）」結合起來，打造一個既精準又具備極速響應能力的現代 Web 應用。

準備好你的 IDE，我們要開始實作了！

## 知識檢查

在進入實作之前，試著回答以下問題：

- 為什麼在 `updateQueryData` 裡面可以直接寫 `todo.completed = true` 而不需要使用 `...spread`？
- 如果一個 Endpoint 是 `builder.query<User, string>`，我在呼叫 `updateQueryData` 時，第二個參數應該傳入什麼？
- `queryFulfilled` 的作用是什麼？它在樂觀更新的流程中扮演什麼角色？

如果你對這些問題都有了清晰的答案，那麼你已經準備好進行實作練習了。

## 成功關鍵：不要害怕 Patch

樂觀更新本質上是對「資料最終會成功」的一種信心。透過 TypeScript 的型別保護，這種信心不再是盲目的。當你掌握了 `updateQueryData`，你就不再只是資料的訂閱者，而是資料的掌握者。

---

## 銜接內容

### 前情提要

我們已經深入探討了樂觀更新在 TypeScript 環境下的型別安全實作，理解了 `Draft<T>` 的運作原理，以及如何利用 RTK Query 的自動型別推導來避免開發中的低級錯誤。

### 下一部分預告

這節課的最後一個教學部分，我們將進行 **「Todo API 實作練習」**，把目前為止學到的所有知識整合起來，實作一個完整的 CRUD 案例，讓你在實戰中鞏固這些抽象概念。
