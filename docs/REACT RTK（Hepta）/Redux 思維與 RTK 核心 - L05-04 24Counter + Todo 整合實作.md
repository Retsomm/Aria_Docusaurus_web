---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 5 堂：多個 Slice 組合管理

# 24Counter + Todo 整合實作

在前面的單元中，我們已經分別完成了 `counterSlice` 的基本操作，以及具備高度型別安全與複雜邏輯的 `todoSlice`。你現在手頭上擁有兩個功能完備的「邏輯模組」，但它們目前像是散落在地上的零件。

想像你正在開發一個複雜的儀表板，裡面可能有「使用者資訊」、「專案列表」、「通知系統」以及「環境設定」。如果我們把所有的邏輯都塞進同一個檔案，程式碼會迅速膨脹到難以維護。這就是為什麼我們需要「多 Slice 架構」。

本節課的重點在於「整合」：我們將把這兩個獨立的 Slice 裝進同一個 Store 中，並建立一個完整的 React 介面來操作它們。這不僅是程式碼的拼接，更是要驗證 Redux 如何透過命名空間（Namespace）來隔離不同功能的狀態，同時維持單一事實來源（Single Source of Truth）的優勢。

## 更新全域 Store：打造多功能的狀態中心

首先，我們需要修改 `src/app/store.ts`。在之前的練習中，我們的 `reducer` 欄位可能只放了一個 `counterReducer`。現在，我們要展現 `configureStore` 最強大的特性之一：自動合併 Reducers。

當我們傳遞一個物件給 `reducer` 參數時，RTK 在底層會自動呼叫 `combineReducers`。這個物件的 **Key** 就會成為全域狀態樹中的 **命名空間**。

### 實作更新後的 store.ts

請注意程式碼中如何匯入兩個不同的 Reducer，並將它們並列放置：

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
// 建議使用 default export 匯出 slice.reducer，並在這裡自訂名稱
import counterReducer from '../features/counter/counterSlice';
import todoReducer from '../features/todos/todoSlice';

export const store = configureStore({
  reducer: {
    // 這裡的 key 名稱決定了 state 樹的結構
    // state.counter 將由 counterReducer 管理
    counter: counterReducer,
    // state.todos 將由 todoReducer 管理
    todos: todoReducer,
  },
});

// 從 store 本身推導出 RootState 與 AppDispatch 型別
// 這是 TypeScript 專案中最重要的步驟之一
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 為什麼 RootState 會自動更新？

這裡有一個「隱形但關鍵」的機制：當你在 `reducer` 物件中新增了 `todos: todoReducer`，TypeScript 的 `ReturnType` 工具會自動偵測到 `store.getState()` 的回傳結構改變了。

現在，當你在任何地方使用 `RootState` 時，你的 IDE 會自動告訴你 `state` 物件下現在擁有兩個屬性：`counter` 與 `todos`。這種「由實體推導型別」的做法，確保了你的型別定義永遠與實際的 Store 結構保持同步，完全避免了手動維護型別時可能產生的遺漏。

---

## 建立 TodoList 元件：實作複雜的互動邏輯

有了多功能的 Store 後，接下來我們要建立 `TodoList.tsx` 元件。這個元件將會挑戰更複雜的 UI 互動，包含：

1. **讀取資料**：顯示目前的代辦事項清單。
2. **衍生計算**：顯示「已完成」項目的數量。
3. **發送 Action**：包含新增（需處理輸入框內容）、切換狀態與刪除。

在實作之前，請思考一個問題：**輸入框文字（Input Value）應該放在 Redux Store 還是放在 React 的 Local State 中？**

**答案是：Local State。** 根據 Redux 官方最佳實踐，如果該狀態僅用於單一元件的臨時輸入，且不需要跨元件共享，也不需要「時間旅行」除錯，那麼放在 `useState` 中會更有效率，也能避免頻繁觸發全域 Store 的更新。

### 實作 TodoList.tsx

```tsx
// src/features/todos/TodoList.tsx
import React, { useState } from 'react';
// 使用我們之前封裝好的 Typed Hooks
import { useAppSelector, useAppDispatch } from '../../app/hooks';
// 匯入 actions 與 selectors
import { addTodo, toggleTodo, removeTodo, selectTodos, selectCompletedCount } from './todoSlice';

const TodoList: React.FC = () => {
  // Local State: 僅用於管理輸入框文字
  const [inputValue, setInputValue] = useState('');
  
  // 使用強型別的 Selector 取得資料
  const todos = useAppSelector(selectTodos);
  const completedCount = useAppSelector(selectCompletedCount);
  
  const dispatch = useAppDispatch();

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // 發送 addTodo Action，payload 為字串
      dispatch(addTodo(inputValue));
      setInputValue(''); // 清空輸入框
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h2>待辦事項清單</h2>
      <p>已完成項目：{completedCount} / {todos.length}</p>

      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="想做點什麼？"
        />
        <button type="submit">新增</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li 
            key={todo.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '10px 0',
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#888' : '#000'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{ flexGrow: 1, marginLeft: '10px' }}>{todo.title}</span>
            <button 
              onClick={() => dispatch(removeTodo(todo.id))}
              style={{ color: 'red' }}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && <p style={{ color: '#666' }}>目前沒有待辦事項，休息一下吧！</p>}
    </div>
  );
};

export default TodoList;
```

### 關鍵細節解析

1. **PayloadAction 的應用**：
在 `dispatch(toggleTodo(todo.id))` 中，`todo.id` 會作為 `payload` 傳入。因為我們在 `todoSlice` 中使用了 `PayloadAction<string>`，如果我們不小心傳入了數字或其他型別，TypeScript 在編譯時期就會報錯，這大大減少了執行時期的 Bug。
2. **Selector 的封裝**：
我們使用了 `selectCompletedCount`。這是一個衍生資料（Derived Data），它並不存在於原始的 `state` 中，而是透過計算得到的。透過在 Slice 中定義好 Selector，我們的元件內部邏輯變得非常乾淨，只需要負責渲染，而不需要關心「如何計算完成數量」。

---

## 整合至 App：驗證多 Slice 架構

最後，我們將 `Counter` 元件與 `TodoList` 元件同時放入 `App.tsx` 中。這是一個重要的驗證步驟，我們將觀察兩個獨立的功能如何共存於同一個 Store。

### 實作 App.tsx

```tsx
// src/App.tsx
import Counter from './features/counter/Counter';
import TodoList from './features/todos/TodoList';

function App() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <h1>My Redux Toolkit App</h1>
      
      <section>
        <Counter />
      </section>

      <section>
        <TodoList />
      </section>
    </div>
  );
}

export default App;
```

---

## 深度觀察：Redux DevTools 與邏輯隔離

當你運行專案並打開瀏覽器開發者工具中的 **Redux DevTools** 時，你會發現世界變得非常清晰。

### 1. 觀察並行的狀態樹

點擊 DevTools 中的 **State** 分頁，你會看到如下的結構：

```json
{
  "counter": {
    "value": 10
  },
  "todos": [
    { "id": "1", "title": "學習 Redux", "completed": false }
  ]
}
```

這就是 `configureStore` 中 `reducer` 物件的功勞。每個 Slice 都像是在全域硬碟中擁有了一個專屬的分割槽（Partition）。

### 2. 邏輯隔離與效能

這是學習者最常問的問題：**「如果我更新了 Counter 的數字，TodoList 會重新渲染嗎？」**

**答案是：不會。**（只要你正確使用了 `useSelector`）

這背後的原理非常漂亮：

- 當你點擊 `Counter` 的「+」號，會發送一個 `counter/increment` Action。
- 全域 Store 雖然更新了，但 `todos` 這一塊的資料並沒有發生任何變化（記憶體參照保持不變）。
- `TodoList` 元件中使用的 `useAppSelector(selectTodos)` 會執行一次淺比較（Shallow Equality Check）。
- Selector 發現 `todos` 的參照與上一次完全相同，因此它會告訴 React：「我的資料沒變，這個元件不需要重新渲染」。

這種機制讓 Redux 能夠輕鬆應對大型應用。即使你的 Store 裡有一百個 Slice，只要某個 Action 只改動了其中一個 Slice，其他九十九個元件都不會被無謂地重新渲染。這就是 Redux 能夠在複雜場景中保持高性能的關鍵：**精確的狀態訂閱**。

---

## 總結：多 Slice 模式的最佳實踐

在本節中，我們完成了一個里程碑：我們不再只是寫單一功能的練習題，而是建立了一個具備「多模組協作」能力的應用程式框架。

我們學到了：

- **命名空間化**：透過 `configureStore` 的物件結構，為不同的功能建立獨立的狀態空間。
- **型別自動化**：利用 TypeScript 的推導能力，讓 `RootState` 隨時反映 Store 的最新結構，無需手動修改。
- **邏輯與 UI 分離**：將 UI 邏輯留在元件（如輸入框文字），將全域業務邏輯交給 Redux，並透過自訂 Selector 封裝資料細節。
- **高效能訂閱**：理解了 Redux 如何透過 Reducer 隔離與 Selector 比較來優化重新渲染。

## 承先啟後

恭喜！你已經掌握了 Redux Toolkit 最核心、也最實用的開發模式。這套模式（Slice + Typed Hooks + Selectors）幾乎可以應對 90% 的前端狀態管理需求。

這是我們實作部分的最後一個階段。接下來，我們將進入課程的最後一個主題：**綜合複習與文章撰寫實戰**。我們將把過去這段時間學到的零散知識（從 Redux 三大原則到 Immer 底層機制，再到現在的多 Slice 整合）串接成一張完整的知識地圖，並協助你將這些實作經驗轉化為結構清晰、深具專業感的鐵人賽教學文章。
