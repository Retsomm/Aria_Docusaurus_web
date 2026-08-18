---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 6 堂：Mutation 請求處理

# 51unwrap 與錯誤處理

想像一下這個場景：你在實作一個「刪除文章」的功能。你寫好了 `const [deletePost] = useDeletePostMutation()`，並在按鈕點擊事件中寫下 `await deletePost(id)`，接著理所當然地放了一行 `router.push('/posts')`。

當 API 因為伺服器當機回傳了 `500 Internal Server Error` 時，你驚訝地發現：程式碼竟然**無視了錯誤**，直接跳轉到了列表頁！這就是許多 RTK Query 初學者最常遇到的「幽靈成功」陷阱。為什麼 `await` 沒能攔截到錯誤？我們該如何優雅地處理非同步流程中的失敗？這就是本節要解決的核心問題。

## 為什麼 trigger 函數「不拋出錯誤」？

在傳統的 `axios` 或 `fetch` 實作中，當 HTTP 狀態碼不是 2xx 時，我們習慣讓 Promise 進入 `rejected` 狀態，這樣我們就能用 `try...catch` 捕捉它。

然而，RTK Query 的 Mutation Trigger 函數（即 `useMutation` 回傳的第一個元素）行為完全不同。當你呼叫 `updatePost(data)` 時，它回傳的是一個特殊的 **Promise 對象**。無論 API 請求是成功還是失敗，這個 Promise **預設永遠會是 resolved 狀態**。

### 為什麼要這樣設計？

這聽起來很違反直覺，但背後有深刻的架構考量：

## .unwrap() 模式解析：拿回主控權

為了讓開發者能在需要時回歸熟悉的 Promise 處理模式，RTK Query 在 Trigger 函式的回傳值中提供了一個 `.unwrap()` 方法。

### 什麼是 unwrap？

`.unwrap()` 的作用就像它的名字一樣——「拆開包裝」。它會監聽原始的請求結果：

- 如果請求**成功**：它會 resolve 並直接回傳伺服器給你的 `data`。
- 如果請求**失敗**：它會 **throw** 一個錯誤，讓你可以在 `try...catch` 中捕捉。

讓我們看看兩者的對照：

```typescript
// ❌ 錯誤示範：這會導致不論成功失敗都會跳轉
const handleSave = async () => {
  await updatePost(payload); 
  // 即使 API 報錯 500，這裡依然會繼續執行！
  navigateToDashboard();
};

// ✅ 正確示範：使用 .unwrap()
const handleSave = async () => {
  try {
  const result = await updatePost(payload).unwrap();
    // 只有成功時，才會執行到這裡
    console.log('儲存成功：', result);
    navigateToDashboard();
  } catch (err) {
    // 請求失敗或連線中斷會跳到這裡
    console.error('儲存失敗，留在原頁面：', err);
  }
};
```

透過 `.unwrap()`，我們將 RTK Query 的「靜態狀態管理」轉化回了「動態流程控制」。

## 深入實作：try/catch 錯誤處理模板

在 TypeScript 的專案中，處理錯誤最令人頭痛的就是型別。RTK Query 的錯誤通常有兩種主要型別：

1. **`FetchBaseQueryError`**：伺服器回傳了錯誤（如 400, 401, 500）。
2. **`SerializedError`**：在請求發送前出錯（如程式碼崩潰）或網路斷線。

以下是一個標準的處理模板，建議你在專案中重複使用：

```typescript
import { isFetchBaseQueryError } from '@reduxjs/toolkit/query';

const [addPost, { isLoading }] = useAddPostMutation();

const onAddPostClicked = async () => {
  try {
    // 1. 觸發並拆解 Promise
    const payload = await addPost({ title: '新文章', content: '...' }).unwrap();
    
    // 成功後的邏輯：顯示成功提示
    toast.success(`文章「${payload.title}」已發佈！`);
    
  } catch (err) {
    // 2. 處理錯誤
    if (isFetchBaseQueryError(err)) {
      // 這是來自伺服器的錯誤 (如 400, 500)
      // err.data 通常包含後端回傳的錯誤訊息
      const errMsg = 'error' in err ? err.error : JSON.stringify(err.data);
      toast.error(`儲存失敗: ${errMsg}`);
    } else {
      // 這是其他類型的錯誤 (如 SerializedError)
      toast.error('發生未知錯誤，請稍後再試');
    }
  }
};
```

### 你該預測的邊界情況

- **網路中斷**：如果使用者在發送請求時斷網，`err` 物件可能沒有 `status`，而是包含一個 `error: "TypeError: Failed to fetch"` 的字串。
- **逾時 (Timeout)**：如果你設定了逾時，錯誤會在這裡被捕捉，你可以根據狀態碼決定是否顯示「伺服器回應過久」。

## Result 物件 vs. unwrap()：何時該用哪一個？

這是一個心智模型的問題。一個優秀的 React 開發者應該知道如何**混合使用**這兩種機制。

### 1. 使用 `result` 物件 (宣告式)

當你的需求是**「渲染 UI 元素」**時，使用 Hook 回傳的解構屬性。

- **場景**：顯示 Loading 轉圈圈、將按鈕設為 `disabled`、在表單下方顯示紅色的錯誤文字。
- **優點**：React 會自動根據狀態變更重新渲染，邏輯簡單乾淨。

### 2. 使用 `unwrap()` (指令式)

當你的需求是**「執行一段邏輯動作」**時，使用 `unwrap()`。

- **場景**：路由跳轉 (`router.push`)、清理表單、彈出 Toast 訊息、觸發另一個不相關的 Action。
- **優點**：確保動作發生的時機點精確地位於「成功」或「失敗」之後。

### 綜合範例：完美的表單提交

```tsx
function CreatePostForm() {
  const [addPost, { isLoading, error: apiError }] = useAddPostMutation();

  const handleSubmit = async (data: PostData) => {
    try {
      await addPost(data).unwrap();
      // 指令式：成功後清空表單並跳轉
      resetForm();
      showSuccessModal();
    } catch (err) {
      // 指令式：失敗後紀錄日誌
      logErrorToService(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" {...register('title')} />
      
      {/* 宣告式：直接使用 Hook 提供的 apiError 渲染 UI */}
      {apiError && <p className="text-red-500">儲存失敗，請檢查內容</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '發佈中...' : '發佈文章'}
      </button>
    </form>
  );
}
```

## 進階練習：錯誤重試與特定狀態碼處理

有時候，我們不只是想顯示錯誤訊息，還想針對不同的 HTTP 狀態碼做不同的反應。例如：

- **401**：引導使用者去登入頁。
- **403**：顯示「權限不足」的權限提示。
- **429**：提示「請求太頻繁」，並在 3 秒後自動重試。

讓我們實作一個具備「自動重試」邏輯的刪除按鈕：

```typescript
const [deletePost] = useDeletePostMutation();

const handleDelete = async (id: string, retries = 0) => {
  try {
    await deletePost(id).unwrap();
    toast.success('刪除成功');
  } catch (err: any) {
    // 針對特定狀態碼處理
    if (err.status === 401) {
      return redirectToLogin();
    }
    
    if (err.status === 429 && retries < 2) {
      // 太多請求，等待 2 秒後重試一次
      toast.warn('伺服器忙碌中，準備重試...');
      await new Promise(res => setTimeout(res, 2000));
      return handleDelete(id, retries + 1);
    }

    toast.error('無法刪除文章，請檢查網路連線');
  }
};
```

雖然 RTK Query 提供了全域的 `retry` 策略，但在元件層級使用 `unwrap` 處理特定的業務邏輯（如根據失敗次數決定 UI 表現），能提供更高的靈活性。

## 總結與銜接

在本節中，我們拆解了 RTK Query Mutation 的 Promise 行為。你現在了解了 `trigger()` 預設不拋出錯誤是為了保護 UI 穩定，而 `.unwrap()` 則是我們在非同步流程中進行精確控制的鑰匙。我們學會了如何區分「渲染用的狀態」與「邏輯用的流程」，並透過 TypeScript 建立了安全的錯誤處理模式。

掌握了如何發起請求與處理回應後，下一個關鍵問題是：**當資料在伺服器端更新後，我們存放在 Redux Store 中的快取資料該如何同步？**

下一節，我們將進入本課程最核心的機制——**標籤失效 (InvalidatesTags)**。你將學會如何讓 RTK Query 在 Mutation 成功後，像導向飛彈一樣精準地通知相關的 Query 重新抓取資料，從而實現完全自動化的資料同步。## 掌握 Mutation 的回應與錯誤處理

本節深入探討了 RTK Query 中處理非同步寫入流程的關鍵工具：`unwrap` 模式。我們理解到 Mutation 的 Trigger 函式為了 UI 穩定性，預設並不會拋出 Promise 錯誤，而必須透過 `.unwrap()` 來顯式地拆解結果。透過結合「宣告式」的 `result` 狀態（用於渲染 Loading 與錯誤訊息）與「指令式」的 `try/catch` 流程（用於導覽、彈窗與重試邏輯），我們能建立出既強健又具備型別安全的資料寫入體驗。這套錯誤處理與邏輯控制的模式，是構建複雜企業級應用的基礎。
