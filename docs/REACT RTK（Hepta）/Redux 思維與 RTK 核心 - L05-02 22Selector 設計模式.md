---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 5 堂：多個 Slice 組合管理

# 22Selector 設計模式

在上一節中，我們學會了如何將多個 Slice 合併到單一的 Store 中，並透過 `state.counter` 或 `state.todos` 這種命名空間來存取資料。你可能會想：「既然我已經可以在元件中透過 `state => state.counter.value` 拿到資料了，為什麼還需要特別學習 Selector 的設計模式呢？」

想像一下，如果你的應用程式有 50 個元件都在使用 `state.counter.value`。某天你發現這個狀態結構不夠用了，決定將 `value` 改名為 `count`。這時，你必須手動修改這 50 個元件。這種「直接存取內部結構」的做法，會讓 UI 層與狀態層過度耦合，這正是大型專案維護噩夢的開始。

這一節我們將探討如何透過設計良好的 Selector 函數，為你的 Redux 狀態建立一層「抽象介面」，讓你的程式碼不僅更具語意化，還能大幅提升維護性與效能。

## 什麼是 Selector？

簡單來說，**Selector（選擇器）** 就是一個純函數，它接收整個 Redux 的 `state` 作為參數，並從中「選擇」出元件所需要的特定片段或計算後的結果。

```typescript
// 一個最基本的 Selector 函數
const selectCount = (state: RootState) => state.counter.value;
```

在 React 元件中，我們透過 `useAppSelector` 鉤子來執行這個函數。這看起來只是一個小小的間接層，但它帶來的架構優勢卻是巨大的。

## Colocate（同地協作）模式

在 Redux 的最佳實踐中，我們極力推薦 **Colocate Pattern（同地協作模式）**。這意味著：**你應該將 Selector 函數定義在與該狀態相關的 Slice 檔案中，而不是定義在 React 元件內。**

為什麼要這麼做？

### 1. 封裝內部資料結構

對於 React 元件來說，它不需要（也不應該）知道 `counter` 狀態在 Store 裡面的具體路徑。它只需要知道「我要取得計數值」。
如果我們將 `selectCount` 定義在 `counterSlice.ts` 中，當未來 `value` 欄位名稱改變，或層級結構發生變動時，我們只需要修改 Slice 檔案中的那一行 Selector 程式碼，所有引用該狀態的元件都能無痛更新。

### 2. 提高邏輯複用性

很多時候，不同的元件會需要相同的「衍生資料」（Derived Data）。例如，計數器是否達到上限、待辦清單中未完成的數量等。如果將這些邏輯寫在元件裡，你會發現自己在不斷地複製貼上；如果寫在 Selector 中，任何元件都能直接導入使用。

### 3. 語意化命名慣例

在命名 Selector 時，社群普遍遵循 `selectXxx` 的慣例。例如：

- `selectCount`
- `selectIsLoading`
- `selectTodoById`

這種命名方式讓你在 React 元件中使用時，程式碼讀起來像是一句自然的英文：`const count = useAppSelector(selectCount);`（常數 count 等於使用 App Selector 選擇 count）。這極大地提升了程式碼的可讀性。

---

## TypeScript 與 Selector 的型別定義

在實作 Selector 時，精確的型別標註是確保開發體驗的關鍵。由於 Selector 接收的是全域狀態，我們必須正確引入 `RootState`。

讓我們看一個標準的 `counterSlice.ts` 範例：

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store'; // 引入從 store 推導出的 RootState

interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CounterState = {
  value: 0,
  status: 'idle',
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    // ... 其他 reducers
  },
});

export const { increment } = counterSlice.actions;

// --- Selectors 定義區 ---

// 基礎 Selector：直接回傳 state 片段
export const selectCount = (state: RootState) => state.counter.value;
export const selectStatus = (state: RootState) => state.counter.status;

// 衍生 Selector：根據 state 計算出新結果
export const selectIsEven = (state: RootState) => state.counter.value % 2 === 0;

export default counterSlice.reducer;
```

在元件中使用時，變得非常簡潔：

```tsx
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectCount, selectIsEven, increment } from './counterSlice';

export const Counter = () => {
  const count = useAppSelector(selectCount);
  const isEven = useAppSelector(selectIsEven);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>當前數值: {count}</p>
      <p>是否為偶數: {isEven ? '是' : '否'}</p>
      <button onClick={() => dispatch(increment())}>增加</button>
    </div>
  );
};
```

---

## 效能警訊：為什麼需要關注 Re-render？

在使用 Selector 時，有一個非常容易踩到的效能陷阱。要理解這個問題，我們必須回顧 `useSelector` 的運作機制。

`**useSelector**`** 會在每次 Action 被 dispatch 後執行 Selector 函數，並將回傳的結果與「上一次的結果」進行「嚴格相等比較 (===)」。如果結果不同，元件就會重新渲染。**

這在處理基本型別（如 `number`, `string`, `boolean`）時運作良好，但在處理物件或陣列時，問題就來了。

### 錯誤示範：在 Selector 中直接回傳新物件

假設你在 Selector 中做了資料轉換：

```typescript
// ❌ 效能危險的寫法
export const selectFormattedTodos = (state: RootState) => {
  return state.todos.items.map(todo => ({
    ...todo,
    title: todo.title.toUpperCase()
  }));
};
```

在這個例子中，即使 `state.todos.items` 的內容完全沒有變化，但因為 `.map()` 每次執行都會回傳一個 **全新的陣列引用**，`useSelector` 會判定「資料已變更」，進而導致元件在每一次任何 action 發生時都強制重新渲染。這在列表很大或頻繁更新的應用中，會造成明顯的卡頓。

---

## 進階武器：Memoized Selector (Reselect)

為了解決上述效能問題，我們需要 **Memoization（記憶化）**。這是一種快取技術：如果輸入參數沒有變，就直接回傳上一次計算好的結果（保持相同的引用）。

Redux Toolkit 內建集成了 `reselect` 庫中的 `createSelector` 工具。

### createSelector 的運作原理

`createSelector` 接收兩個部分：

1. **Input Selectors（輸入選擇器）**：一組基礎 Selector。
2. **Output Selector（輸出轉換器）**：接收輸入選擇器的結果，並進行邏輯運算。

只有當輸入選擇器的回傳值（經過 `===` 比較）發生變化時，輸出轉換器才會重新執行。

```typescript
import { createSelector } from '@reduxjs/toolkit';

// 1. 基礎 Selector
const selectTodoItems = (state: RootState) => state.todos.items;

// 2. 使用 createSelector 建立 Memoized Selector
export const selectCompletedTodos = createSelector(
  [selectTodoItems], // 相依的輸入
  (items) => {
    // 只有當 items 陣列的引用改變時，這裡才會重新執行
    console.log('計算中...'); 
    return items.filter(todo => todo.completed);
  }
);
```

透過 `createSelector`，即使 action 觸發了 Store 的更新，只要 `items` 沒變，`selectCompletedTodos` 就會回傳跟上一次一模一樣的陣列引用。這確保了 `useSelector` 的比較會通過，從而避免不必要的 UI 更新。

### 何時該使用 `createSelector`？

你不必為每一個 Selector 都加上 `createSelector`。以下是判斷標準：

- **回傳基本型別？** 不需要（直接寫簡單函數即可）。
- **只是單純回傳 State 中的現有物件？** 不需要（引用沒變）。
- **涉及運算並回傳新物件/陣列？**（例如 `.filter`, `.map`, `.sort`, 物件組合）**強烈建議使用**。

---

## 重點回顧與設計建議

在設計你的 Selector 層時，請記住以下原則：

1. **越細越好**：盡量讓 Selector 專注於選取最小必要的資料。如果一個元件只需要 `user.name`，就寫一個 `selectUserName` 而不是把整個 `user` 物件拿過去，這樣當 `user.age` 改變時，該元件就不會被影響。
2. **邏輯集中化**：複雜的資料轉換邏輯應該放在 Selector 中，而不是 React 元件的 `useEffect` 或 `useMemo` 裡。這能讓你的 UI 元件保持乾淨，只專注於渲染。
3. **型別一致性**：務必讓 Selector 的參數型別為 `RootState`。雖然這在 Slice 檔案中會形成一種對 `store.ts` 的「反向引用」，但在實務上這是可以接受的，只要你使用 `import type` 就能避免循環依賴的執行期問題。

現在，你已經掌握了 Selector 的設計精髓。這不只是關於「如何拿資料」，更是關於「如何定義 UI 與資料之間的契約」。良好的 Selector 層會讓你的專案在規模擴大時，依然保持輕巧且易於重構。

## 從理論到實踐的橋樑

我們剛深入探討了 Selector 的設計模式，包括 Colocate 模式、命名慣例、TypeScript 整合，以及如何利用 Memoization 優化效能。這些知識將是你從「只會寫 Counter」晉升為「能處理複雜狀態」的關鍵轉折點。在接下來的單元中，我們將把這些模式應用到一個更具挑戰性的練習：從零開始建構一個完整的 `todoSlice`。你將親手實作具備過濾功能與複雜狀態轉換的待辦清單，並見證良好的 Selector 設計如何讓開發過程變得行雲流水。
