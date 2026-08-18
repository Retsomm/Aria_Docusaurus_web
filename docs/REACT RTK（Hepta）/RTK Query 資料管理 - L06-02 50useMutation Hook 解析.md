---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 6 堂：Mutation 請求處理

# 50useMutation Hook 解析

Aria，現在我們已經學會了如何定義 Mutation Endpoint，接著我們要進入最重要的實戰階段：如何在 React 元件中呼叫這些 Endpoint。

如果你之前習慣使用 `useQuery`，你可能會下意識地以為 `useMutation` 的用法大同小異。然而，兩者在心智模型（Mental Model）上有著本質的區別。`useQuery` 是為了「獲取資料」而設計的，它通常是**宣告式（Declarative）**的；而 `useMutation` 是為了「執行動作」而設計的，它是**指令式（Imperative）**的。

這一部分我們將深入拆解 `useMutation` 的結構，讓你能量身打造流暢的寫入體驗。

---

## Hook 的結構：為何是元組而非物件？

當你呼叫 `useQuery` 時，它會回傳一個包含資料與狀態的**物件**。但 `useMutation` 卻不同，它回傳的是一個**元組（Tuple）**，結構如下：

```typescript
const [trigger, result] = useAddPostMutation();
```

### 為什麼設計成元組？

這與 React 的 `useState` 設計哲學一致。元組允許你**自由命名**解構出來的變數。在一個複雜的元件中，你可能會同時處理多個不同的 Mutation，例如「新增文章」與「刪除文章」：

```typescript
// 透過解構賦值，我們可以輕鬆區分不同的觸發函式與結果物件
const [addPost, addResult] = useAddPostMutation();
const [deletePost, deleteResult] = useDeletePostMutation();
```

如果 `useMutation` 回傳的是固定 Key 的物件，你在命名衝突上會感到非常痛苦。

### 與 useQuery 的重大差異

| 特性 | useQuery | useMutation |
| --- | --- | --- |
| **回傳類型** | 物件 `{ data, isLoading, ... }` | 元組 `[trigger, result]` |
| **執行時機** | 元件掛載時自動執行（除非設定 skip） | 手動呼叫 `trigger` 函式時才執行 |
| **主要用途** | 讀取（Read） | 寫入/更新（Create, Update, Delete） |
| **快取行為** | 基於參數自動快取 | 不會自動快取結果，通常用於觸發其他快取失效 |

---

## 觸發函式 (Trigger Function)

元組的第一個元素（通常我們命名為 `trigger` 或對應的動作名稱，如 `addPost`）是一個非同步函式。

### 指令式的呼叫

這個函式是你與伺服器溝通的「開關」。只有當你呼叫它時，網路請求才會發出。這非常適合綁定在按鈕點擊或表單提交事件中。

### 傳遞參數

`trigger` 函式接收的參數，必須符合你在 `builder.mutation<Result, Arg>` 中定義的 `Arg` 型別。

```typescript
// 假設定義為 builder.mutation<Post, Partial<Post>>
const [addPost] = useAddPostMutation();

const handleSubmit = () => {
  // 呼叫觸發函式並傳入資料
  addPost({
    title: "新文章標題",
    content: "內容描述...",
    userId: 1
  });
};
```

**小提醒**：`trigger` 函式執行後會回傳一個 Promise。雖然你可以直接對它進行 `await`，但 RTK Query 建議搭配 `.unwrap()` 使用，我們會在下一部分深入討論這個進階技巧。

---

## 結果物件 (Result Object)

元組的第二個元素是一個物件，包含了目前這個 Mutation 請求的所有狀態資訊。理解這些屬性的精確語意，是建立良好 UX 的關鍵。

### 屬性詳細拆解

1. `**data**`: 當 Mutation 成功完成後，伺服器回傳的資料。在請求成功前為 `undefined`。
2. `**error**`: 如果請求失敗，這裡會存放錯誤資訊（通常是 `FetchBaseQueryError` 或 `SerializedError`）。
3. `**isLoading**`: 布林值。當請求正在進行中（In-flight）時為 `true`。這通常用來停用按鈕或顯示載入動畫。
4. `**isSuccess**`: 布林值。請求成功完成且 `data` 已就緒時變為 `true`。
5. `**isError**`: 布林值。請求發生錯誤時為 `true`。
6. `**isUninitialized**`: 布林值。表示這個 Mutation 還沒被觸發過。這是它的初始狀態。

### 重點區分：isLoading vs isSuccess

這兩個狀態在處理 UI 回饋時非常容易搞混：

- **使用 **`**isLoading**`** 的場景**：
  - **停用提交按鈕**：防止使用者重複點擊導致發出多個相同的 POST 請求。
- **顯示 Spinner**：告訴使用者系統正在處理中。
- **使用 **`**isSuccess**`** 的場景**：
  - **清空表單**：確定資料存入資料庫後再清空欄位。
- **導覽跳轉**：成功後跳轉回列表頁面。
- **顯示成功通知**：顯示「儲存成功！」的 Toast。

**思考一下**：為什麼我們不用 `data` 是否存在來判斷成功？
因為有些 API 成功後只會回傳空物件 `{}` 或狀態碼 200，此時 `isSuccess` 是最可靠的指標。

---

## reset 函式：清除狀態的及時雨

`result` 物件中其實還隱藏著一個非常有用的函式：`reset`。

```typescript
const [addPost, { reset }] = useAddPostMutation();
```

呼叫 `reset()` 會將這個 Mutation 的狀態重置回 `isUninitialized`。這在以下場景至關重要：

1. **關閉 Modal 時**：如果使用者在新增資料時發生錯誤（`isError: true`），他關閉視窗後再次打開，如果不呼叫 `reset()`，舊的錯誤訊息可能還掛在畫面上。
2. **重複使用的表單**：當成功完成一次操作後，若要讓元件回到初始狀態準備下一次操作。

---

## 實作範例：AddPostForm 元件

讓我們將上述概念整合進一個具體的 TypeScript 範例中。這是一個簡單的新增文章表單：

```tsx
import React, { useState, useEffect } from 'react';
import { useAddPostMutation } from '../services/postsApi';

export const AddPostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 解構出 trigger 函式與 result 物件
  const [addPost, { isLoading, isSuccess, isError, error, reset }] = useAddPostMutation();

  // 練習：觀察 isSuccess 的變化來執行副作用
  useEffect(() => {
    if (isSuccess) {
      setTitle('');
      setContent('');
      alert('文章發佈成功！');
      // 成功後過幾秒重置狀態，讓 UI 乾淨
      const timer = setTimeout(() => reset(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const onSavePostClicked = async () => {
    if (title && content && !isLoading) {
      try {
        // 觸發動作
        await addPost({ title, body: content, userId: 1 });
      } catch (err) {
        console.error('Failed to save the post: ', err);
      }
    }
  };

  return (
    <section className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">撰寫新文章</h2>
      <form className="space-y-4">
        <div>
          <label htmlFor="postTitle" className="block text-sm font-medium">文章標題:</label>
          <input
            type="text"
            id="postTitle"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="postContent" className="block text-sm font-medium">內容:</label>
          <textarea
            id="postContent"
            className="w-full border p-2 rounded"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="button"
          onClick={onSavePostClicked}
          disabled={isLoading || !title || !content}
          className={`px-4 py-2 rounded text-white ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? '發佈中...' : '發佈文章'}
        </button>

        {/* 錯誤處理 UI */}
        {isError && (
          <div className="text-red-500 text-sm mt-2">
            儲存失敗：{'data' in error ? JSON.stringify(error.data) : '不明錯誤'}
          </div>
        )}
      </form>
    </section>
  );
};
```

### 程式碼深度解析

1. **按鈕停用邏輯**：我們使用了 `isLoading || !title || !content` 作為 `disabled` 的條件。這能同時處理「正在請求中」以及「表單未完成」兩種不應送出的情況。
2. **視覺回饋**：按鈕文字會根據 `isLoading` 動態切換為「發佈中...」，這比單純的轉圈圈對使用者更友善。
3. **狀態清理**：透過 `useEffect` 監聽 `isSuccess`，我們能確保在 API 真正成功後才清空表單，避免資料遺失。
4. **reset 的應用**：範例中展示了如何在成功後重置 Hook 狀態，這是一個良好的衛生習慣，能防止舊的狀態影響到下一次的操作。

---

## 對比總結：useQuery vs. useMutation

為了讓你徹底釐清這兩個最重要的 Hook，我們最後再複習一次它們的差異：

### 執行時機與回傳結構

| 比較項目 | `useQuery` | `useMutation` |
| --- | --- | --- |
| **回傳結構** | `Object` (解構時 Key 固定) | `Array` (解構時名稱自訂) |
| **啟動方式** | 自動 (Mount 時) | 手動 (呼叫 `trigger`) |
| **Hook 參數** | `(arg, options)` | `(options)` |
| **觸發函式參數** | N/A | `trigger(arg)` |

### 狀態旗標語意對照

- `**isLoading**`: 
  - `useQuery`: 第一次加載中且**快取沒有資料**。
- `useMutation`: 請求正在發送中。
- `**isFetching**` (僅 `useQuery` 有): 
  - 只要有任何網路請求在跑（包含背景重新驗證），就會是 `true`。
- `**isUninitialized**`:
  - `useQuery`: 設定了 `skip: true` 時。
- `useMutation`: 尚未呼叫過 `trigger` 函式。

### 使用建議

如果你發現自己試圖在 `useEffect` 裡面呼叫 `refetch()` 來載入初始資料，那你應該用 `useQuery`。如果你發現你在寫 `onClick` 或 `onSubmit` 處理器，那你絕對需要 `useMutation`。

---

## 知識點回顧

- `useMutation` 回傳 `[trigger, result]`，方便重命名以處理多個動作。
- `trigger` 是指令式的，需要手動觸發並傳入 API 參數。
- `isLoading` 應用於防止重複提交，`isSuccess` 應用於後續流程（如清空表單、導覽）。
- `reset()` 函式是清理 Mutation 快取狀態、準備下一次操作的利器。

掌握了 `useMutation` 的基本用法後，你可能會好奇：`trigger` 函式回傳的 Promise 該如何處理？如果我想在 `onSavePostClicked` 裡面精確捕捉 HTTP 400 或 500 錯誤，該怎麼寫？下一部分，我們將深入探討 `unwrap` 模式與非同步錯誤處理的最佳實踐。

## 鞏固練習

1. **試著在同一個元件中使用兩個不同的 Mutation**：例如一個 `useUpdatePostMutation` 和一個 `useDeletePostMutation`，並確保你能正確地為它們的解構變數命名（例如 `[updatePost, updateInfo]`）。
2. **實作「取消」按鈕**：在表單中加入一個取消按鈕，點擊後呼叫 `reset()`，觀察 Redux DevTools 中該 Mutation 狀態的變化。
