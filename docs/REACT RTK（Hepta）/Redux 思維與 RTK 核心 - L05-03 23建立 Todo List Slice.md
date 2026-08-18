---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 5 堂：多個 Slice 組合管理

# 23建立 Todo List Slice

在上一單元中，我們深入探討了 Selector 的設計理論與 Memoization 的必要性。你已經知道如何優雅地從 Store 中提取資料，並了解 `reselect` 如何幫助我們避免不必要的重複計算。現在，理論武裝已經完成，是時候將這些知識轉化為實戰程式碼了。

計數器（Counter）是一個很好的入門範例，但它太過簡單。真實世界的應用程式通常涉及更複雜的資料結構——例如物件陣列、條件更新與資料刪除。這就是為什麼我們需要實作一個完整的 `todoSlice`。透過這個過程，你將學會如何在 TypeScript 環境下嚴格定義資料模型，並利用 RTK 內建的 Immer 機制處理複雜的陣列邏輯。

## 定義資料型別：強型別的基礎

在撰寫 Redux 邏輯之前，第一步永遠是「定義資料的形狀」。在 TypeScript 中，這不僅是為了通過編譯器檢查，更是為了在開發過程中獲得精準的自動完成（Autocomplete）與錯誤提示。

對於一個 Todo 項目，我們需要追蹤它的唯一識別碼、內容以及完成狀態。

```typescript
// src/features/todos/todoSlice.ts

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  items: Todo[];
}

const initialState: TodoState = {
  items: [],
};
```

### 為什麼選擇 Interface 而非 Type？

在定義狀態結構時，`interface` 通常比 `type` 更具擴充性。更重要的是，當你在 VSCode 中將滑鼠懸停在變數上時，`interface` 提供的報錯訊息通常更易讀。我們定義了 `TodoState` 作為 Slice 的根狀態，這能確保 `initialState` 的結構永遠符合預期，避免在 Reducer 內部存取到未定義的屬性。

## 實作 Reducer 邏輯：Immer 的威力

有了型別定義後，我們可以使用 `createSlice` 來定義行為。在這裡，我們將實作三個核心功能：新增、切換狀態與刪除。

### 1. 新增 Todo：善用 nanoid

在處理清單時，唯一 ID 是不可或缺的。RTK 內建了一個輕量且安全的 ID 生成器：`nanoid`。你不需要額外安裝 `uuid` 等套件，直接從 `@reduxjs/toolkit` 匯出即可。

```typescript
import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

// ... (型別定義)

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        // 因為有 Immer，我們可以直接 push 到陣列中
        state.items.push(action.payload);
      },
      // 使用 prepare callback 來處理副作用（如生成 ID）
      prepare: (text: string) => {
        return {
          payload: {
            id: nanoid(),
            text,
            completed: false,
          } as Todo,
        };
      },
    },
    // ...
  },
});
```

**這裡有一個進階技巧：**`**prepare**`** callback。**
根據 Redux 三大原則，Reducer 必須是純函數。如果在 Reducer 內部呼叫 `nanoid()`，每次執行結果都會不同，這會破壞「時間旅行除錯」的可靠性。透過 `prepare`，我們可以在 Action 被發送前先生成 ID 並包裝 Payload，確保 Reducer 接收到的資料是確定的。

### 2. 切換狀態：精確的物件更新

當我們要標記某個代辦事項為「已完成」時，通常會接收一個 `id` 作為 payload。

```typescript
toggleTodo: (state, action: PayloadAction<string>) => {
  const todo = state.items.find((item) => item.id === action.payload);
  if (todo) {
    // Immer 會偵測到這個屬性的修改，並產生新的狀態物件
    todo.completed = !todo.completed;
  }
},
```

在傳統 Redux 中，你必須寫出層層嵌套的展開運算子（Spread Operator），如 `state.items.map(item => item.id === ... ? { ...item, completed: !item.completed } : item)`。在 RTK 中，你只需要像操作普通 JavaScript 物件一樣修改屬性即可，這大幅降低了邏輯出錯的機率。

### 3. 刪除 Todo：篩選陣列

刪除邏輯通常使用 `filter` 實作。

```typescript
removeTodo: (state, action: PayloadAction<string>) => {
  // 注意：在 Immer 中，你可以「修改」state，也可以「回傳」新 state
  state.items = state.items.filter((item) => item.id !== action.payload);
},
```

這是一個常見的陷阱：當你在 Reducer 中重新賦值給 `state.items` 時，Immer 能正確識別。但請記住，不要在修改 `state` 的同時又回傳它（例如 `return state.items.filter(...)`），這樣會讓 Immer 感到困惑。保持「要麼修改 Draft，要麼回傳新物件」的原則。

## Selector 設計：從基礎到衍生資料

誠如上一單元所述，我們推薦將 Selector 與 Slice 定義在同一個檔案中（Colocation 模式）。這不僅方便維護，也能讓 UI 元件專注於渲染，而不必了解 Store 的深層結構。

### 基礎 Selector

這是最直接的資料提取：

```typescript
import { RootState } from '../../app/store';

export const selectTodos = (state: RootState) => state.todos.items;
```

### 衍生資料與 createSelector

假設 UI 需要顯示「目前已完成的項目總數」。這是一個「衍生狀態」，我們不應該將其儲存在 Store 中，而應該透過 Selector 計算出來。為了效能優化，我們使用 `createSelector`：

```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectCompletedCount = createSelector(
  [selectTodos], // 輸入的 Selector
  (todos) => todos.filter((todo) => todo.completed).length // 計算邏輯
);
```

透過 `createSelector`，只要 `todos.items` 沒有變動，`selectCompletedCount` 就會回傳快取（Cached）的結果，而不會重新執行 `filter` 迴圈。

## 完整實作：todoSlice.ts

以下是將上述所有邏輯整合後的完整程式碼。這是一個標準的 RTK Slice 範本，包含了型別、邏輯、Action 與 Selector。

```typescript
import { createSlice, PayloadAction, nanoid, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

// 1. 定義型別
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  items: Todo[];
}

// 2. 初始狀態
const initialState: TodoState = {
  items: [
    { id: '1', text: '學習 Redux Toolkit', completed: true },
    { id: '2', text: '撰寫鐵人賽文章', completed: false },
  ],
};

// 3. 建立 Slice
const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 使用 prepare callback 封裝 Action 生成邏輯
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      },
      prepare: (text: string) => {
        return {
          payload: {
            id: nanoid(),
            text,
            completed: false,
          } as Todo,
        };
      },
    },
    // 透過 ID 找到特定 Todo 並修改屬性
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((item) => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    // 過濾陣列以移除項目
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

// 4. 匯出 Actions 與 Reducer
export const { addTodo, toggleTodo, removeTodo } = todoSlice.actions;
export default todoSlice.reducer;

// 5. 匯出 Selectors (Colocation)
export const selectTodos = (state: RootState) => state.todos.items;

// 衍生狀態：計算已完成數量 (Memoized)
export const selectCompletedCount = createSelector(
  [selectTodos],
  (todos) => todos.filter((todo) => todo.completed).length
);

// 衍生狀態：計算總數
export const selectTotalTodos = createSelector(
  [selectTodos],
  (todos) => todos.length
);
```

### 重點解析

- **型別安全**：透過 `PayloadAction<string>`，當你在元件中呼叫 `dispatch(removeTodo(123))` 時，TypeScript 會立刻報錯，因為它期待接收的是一個字串 ID 而非數字。
- **職責分離**：`addTodo` 的 `prepare` 確保了 ID 生成邏輯與 UI 邏輯解耦，這讓元件呼叫 `dispatch(addTodo("買牛奶"))` 變得非常乾淨。
- **效能優化**：`selectCompletedCount` 確保了即使 Counter Slice 的狀態改變（導致 RootState 更新），只要 Todo 陣列沒變，這部分的計算就不會重跑。

## 總結與銜接

在這個單元中，我們完成了一個功能完備的 `todoSlice`。你實作了 CRUD 當中最關鍵的「增、刪、改」，並應用了 `nanoid` 處理唯一標識符、Immer 處理陣列修改，以及 `createSelector` 處理效能優化。這是本課程最後一個核心 Slice 的獨立實作。

目前我們的專案中存在兩個獨立的邏輯模組：先前的 `counterSlice` 與剛完成的 `todoSlice`。在下一個單元中，我們將學習如何將這兩個 Slice 整合進同一個全域 Store，並建立一個完整的 TypeScript 應用程式 UI。你將會親眼見證 Redux 如何在多個功能模組並存的情況下，依然保持資料流的高度清晰與可預測性。## 總結與銜接

在這個單元中，我們實作了一個完整的 `todoSlice.ts`，這不僅是一個 Todo List 的邏輯中心，更是你展示 RTK 實戰能力的最佳範本。我們從介面定義出發，確保了狀態的強型別安全性；接著利用 `createSlice` 簡化了 Action 與 Reducer 的開發，並透過 Immer 機制以直觀的方式處理了陣列的增刪改。最後，我們運用 `createSelector` 設計了具備 Memoization 能力的衍生資料選取器，為應用程式的效能打下基礎。

這是我們課程中最後一個核心 Slice 的開發練習。到目前為止，你已經擁有了處理簡單數值（Counter）與複雜物件陣列（Todo）的經驗。接下來，我們將進入最後的整合階段：將這兩個風格迥異的 Slice 放入同一個 Store 中，並在 React UI 介面中觀察它們如何各司其職、互不干擾地運作。
