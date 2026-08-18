---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 7 堂：樂觀更新實作

# 56Todo API 實作練習

想像你正在使用一個待辦事項 App。當你點擊「完成」勾選框時，如果畫面要轉圈圈等上半秒鐘，等伺服器回傳成功後才看到勾選符號，這種「遲鈍感」會讓 App 看起來像上個世紀的產物。現代化的高品質 UI 追求的是「即時回饋」——點擊的瞬間，狀態就該改變。

在本節中，我們將結合前面學到的所有樂觀更新（Optimistic Updates）技巧，動手實作一個完整的 Todo API。我們不僅要讓資料同步，更要讓使用者感受到那種「零延遲」的流暢體驗。

## 定義資料模型與 API 基礎

在開始寫邏輯之前，我們先定義清楚資料的形狀。在 TypeScript 中，明確的介面定義是所有型別安全的起點。我們預期伺服器回傳的 `Todo` 物件包含唯一識別碼、內容文字以及完成狀態。

```typescript
// types.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// 我們定義一個用於更新的參數型別，只需要 id 和要修改的欄位
export type UpdateTodoRequest = Pick<Todo, 'id'> & Partial<Omit<Todo, 'id'>>;
```

接著，我們建立 API Slice 的骨架。請注意，我們在這裡定義了 `tagTypes: ['Todo']`，這將是我們跨元件同步資料的關鍵「身份證」。

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Todo, UpdateTodoRequest } from './types';

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Todo'], // 宣告此 API 管理的標籤類型
  endpoints: (builder) => ({
    // 端點將在這裡定義...
  }),
});
```

## 查詢端點與標籤設計

為了讓後續的 Mutation 能夠觸發更新，我們在 `getTodos` 查詢中必須正確地「提供標籤」（providesTags）。這裡我們採用 **"LIST + ID"** 的設計模式，這在實務中是最強大且靈活的做法。

```typescript
// ... 在 endpoints 內部
getTodos: builder.query<Todo[], void>({
  query: () => '/todos',
  providesTags: (result) =>
    result
      ? [
          ...result.map(({ id }) => ({ type: 'Todo' as const, id })),
          { type: 'Todo', id: 'LIST' },
        ]
      : [{ type: 'Todo', id: 'LIST' }],
}),
```

**為什麼要這樣設計？**

- `{ type: 'Todo', id: 'LIST' }`：代表整個列表。當我們「新增」一筆資料時，讓這個標籤失效，就能重新抓取整個清單。
- `{ type: 'Todo', id }`：代表單一物件。這讓 RTK Query 知道這個快取條目包含了哪些具體的資料實體。

## 樂觀更新實戰：更新任務狀態

這是本練習的核心。當使用者切換 Todo 的完成狀態時，我們不等待伺服器回應，直接修改快取。

我們將遵循「四步驟模板」：

1. **預修改**：手動更新 `getTodos` 的快取資料。
2. **存 Undo**：保存 `updateQueryData` 回傳的撤銷函式。
3. **監控結果**：等待 `queryFulfilled`。
4. **失敗回滾**：若發生錯誤，執行 `patchResult.undo()`。

```typescript
updateTodo: builder.mutation<Todo, UpdateTodoRequest>({
  query: ({ id, ...patch }) => ({
    url: `/todos/${id}`,
    method: 'PATCH',
    body: patch,
  }),
  // 關鍵：樂觀更新邏輯
  async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
    // 1. 執行「預修改」
    // 注意：第二個參數 'undefined' 必須匹配 getTodos 的參數 (void)
    const patchResult = dispatch(
      todoApi.util.updateQueryData('getTodos', undefined, (draft) => {
        // 使用 Immer 直接修改草稿
        const todo = draft.find((t) => t.id === id);
        if (todo) {
          // 將 patch 中的欄位覆蓋到快取資料上
          Object.assign(todo, patch);
        }
      })
    );

    try {
      // 2. 監控請求是否成功
      await queryFulfilled;
    } catch {
      // 3. 失敗時執行「回滾」
      patchResult.undo();
      
      /**
       * 這裡可以額外加入全域的錯誤提示邏輯，例如：
       * toast.error('更新失敗，已還原狀態');
       */
    }
  },
  // 注意：有了樂觀更新，通常不需要在成功後 invalidatesTags，
  // 因為我們已經手動把快取改好了，省去一次網路請求。
}),
```

### 這裡有一個 TypeScript 細節

在 `updateQueryData('getTodos', undefined, ...)` 中，第二個參數 `undefined` 是非常重要的。如果你的 `getTodos` 有帶參數（例如 `getTodos(userId)`），那麼這裡就必須傳入正確的 `userId`。RTK Query 靠這個參數來精確定位要修改哪一個快取 Key。

## 樂觀更新實戰：刪除任務

刪除操作同樣適合樂觀更新。當使用者點擊「刪除」按鈕，該項目應該立即消失，而不是等 API 慢慢刪完。

```typescript
deleteTodo: builder.mutation<{ success: boolean; id: string }, string>({
  query: (id) => ({
    url: `/todos/${id}`,
    method: 'DELETE',
  }),
  async onQueryStarted(id, { dispatch, queryFulfilled }) {
    // 1. 預先從快取列表中「踢除」該筆資料
    const patchResult = dispatch(
      todoApi.util.updateQueryData('getTodos', undefined, (draft) => {
        const index = draft.findIndex((t) => t.id === id);
        if (index !== -1) {
          draft.splice(index, 1); // Immer 會處理不可變性
        }
      })
    );

    try {
      await queryFulfilled;
    } catch {
      // 2. 刪除失敗（例如權限不足或網路中斷），把刪掉的資料找回來
      patchResult.undo();
    }
  },
}),
```

## 新增任務與設計權衡

你可能會問：「那新增任務（Add Todo）也可以做樂觀更新嗎？」

技術上是可以的，但在實務中，**「新增」操作通常不建議做樂觀更新**，原因有三：

1. **ID 衝突問題**：在前端預先建立資料時，我們不知道伺服器會配發什麼 `id`。如果我們隨機生成一個臨時 ID，在伺服器回傳真 ID 後，我們必須進行複雜的「替換」操作，這極易出錯。
2. **依賴性**：有些資料欄位（如 `createdAt` 或由資料庫生成的預設值）前端無法準確預知。
3. **UI 衝突**：如果在列表頂端樂觀地插入了一筆資料，隨後伺服器回傳失敗，整列資料突然消失或閃爍，對使用者的心理衝擊大於「按鈕 Loading 一下」。

因此，對於 `addTodo`，我們回歸到最穩健的標籤失效機制：

```typescript
addTodo: builder.mutation<Todo, string>({
  query: (text) => ({
    url: '/todos',
    method: 'POST',
    body: { text, completed: false },
  }),
  // 簡單暴力且安全：新增成功後，叫 getTodos 重新抓一次最新的列表
  invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
}),
```

## 在 React 元件中整合

現在我們來看這些端點如何在元件中串接。你會發現，元件層不需要知道「樂觀更新」的存在，它只需要呼叫 Hook 並處理基本的狀態。

```tsx
import React from 'react';
import { 
  useGetTodosQuery, 
  useUpdateTodoMutation, 
  useDeleteTodoMutation 
} from './todoApi';

export const TodoList = () => {
  const { data: todos, isLoading } = useGetTodosQuery();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  if (isLoading) return <div>載入中...</div>;

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id} style={{ opacity: todo.completed ? 0.5 : 1 }}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => 
              // 呼叫此函式的瞬間，畫面上的 checkbox 就會切換！
              updateTodo({ id: todo.id, completed: !todo.completed })
            }
          />
          <span>{todo.text}</span>
          <button onClick={() => deleteTodo(todo.id)}>刪除</button>
        </li>
      ))}
    </ul>
  );
};
```

### 觀察樂觀更新的效果

如果你想驗證樂觀更新是否運作，可以嘗試以下步驟：

1. 打開瀏覽器開發者工具的 **Network** 分頁。
2. 將網路速度調成 **Slow 3G**。
3. 點擊 Checkbox。
4. **觀察點**：你會發現畫面的勾選框是「即時」切換的，而 Network 面板中的 PATCH 請求還在慢慢跑。這就是樂觀更新帶來的極致體驗。

## 實作中的型別陷阱排查

在練習過程中，你可能會遇到 TypeScript 報錯。以下是三個最常見的檢查點：

1. `**draft**`** 的型別不對**：
確保 `updateQueryData` 的第一個參數名稱（字串）完全匹配 `endpoints` 中定義的名稱。如果拼錯了，TypeScript 無法推導出 `draft` 的型別，會把它當成 `any` 或報錯。
2. **`queryFulfilled` 忘記 `await`**：
如果沒有 `await`，`try...catch` 區塊會立即執行完畢，導致即使請求失敗，`catch` 也捕捉不到錯誤，回滾邏輯就不會觸發。
3. **泛型參數不匹配**：
`builder.mutation<ResultType, QueryArg>` 中的 `QueryArg` 必須涵蓋你在 `onQueryStarted` 第一個參數中使用的所有欄位。例如，如果你需要 `id` 來找快取，那麼 `QueryArg` 就必須包含 `id`。

## 從理論到實戰的最後一哩路

恭喜你！到這裡你已經完成了 RTK Query 中最具挑戰性的實作——樂觀更新。我們從建立基礎的 Todo 模型開始，設計了靈活的「LIST + ID」標籤模式，並手動撰寫了嚴謹的「預修改 - 監控 - 回滾」流程。這種模式能讓你的 Web 應用擁有媲美原生 App 的反應速度。

至此，我們已經完整涵蓋了 Topic 4「Mutation 請求處理」的所有核心內容，包含基礎定義、Hook 用法、標籤失效機制，以及進階的樂觀更新與型別整合。這套工具箱已經足以讓你應對 90% 以上的日常開發場景。接下來，我們將對整個 Topic 4 進行最後的回顧與總結，確保所有零散的知識點都能連成一線。
