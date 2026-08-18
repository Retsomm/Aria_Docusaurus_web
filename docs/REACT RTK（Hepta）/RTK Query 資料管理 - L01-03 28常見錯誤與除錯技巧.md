---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 1 堂：RTK Query 概念建立

# 28常見錯誤與除錯技巧

在撰寫技術文章或開發 React 應用程式時，最令人沮喪的往往不是「不知道怎麼寫」，而是「寫了卻動不起來」或「動起來了但效能低落」。這些卡關的時刻，其實是理解 Redux 底層原理的最佳契機。

作為一名進階開發者，你在鐵人賽文章中若能精準指出這些常見的「坑」，並提供專業的解決方案，將會極大提升文章的專業度與實戰價值。這一部分我們將深入探討 Redux 開發中最常遇到的四類問題：DevTools 的深度應用、Immer 的邊界情況、TypeScript 的型別陷阱，以及 `useSelector` 的效能危機。

## Redux DevTools：不只是看狀態，更是偵錯神兵

很多開發者對 Redux DevTools 的理解僅停留在「看現在的 State 長什麼樣子」。但在處理複雜邏輯（如非同步流程或多重 Slice 互動）時，你需要更進階的技巧。

### Action Log 與 State Diff 的精準打擊

當 UI 呈現的資料不如預期時，新手往往會直接在程式碼裡寫滿 `console.log`。但在 Redux 中，你應該養成優先查看 **Diff** 模式的習慣。

- **Action Log**：它能告訴你「發生了什麼」。如果狀態沒變，首先確認 Action 是否真的發出了？Payload 是否正確？
- **State Diff**：這功能會以「綠增紅刪」的方式標記出該 Action 造成的具體狀態變化。

**為什麼 Diff 模式很重要？**
假設你在處理一個 Todo App，按下「完成」後狀態卻沒有更新。透過 Diff，如果你發現完全沒有綠色標記（State 無變化），那問題出在 Reducer；如果你發現變動的欄位與預期不符（例如變動了 `title` 而非 `isCompleted`），那可能是 Action Creator 傳入的資料格式有誤。這種「觀察增量」的方法比觀察「整個 State 樹」要快得多。

### Time Travel：重現難以捉摸的 Bug

「時間旅行」是 Redux 最著名的特性，但它在除錯中的真正價值在於 **「重現特定序列」**。

想像一個場景：使用者必須先登入（Action A），然後獲取清單（Action B），接著篩選分類（Action C），最後點擊某個項目才會觸發 Bug。如果這個 Bug 是在 Action C 之後才發生，你不需要重新整理頁面、重新輸入帳密、重新篩選。

你只需要在 DevTools 中：

1. 找到 Action C，嘗試 **Jump** 回去，觀察 UI 是否恢復到篩選前的狀態。
2. 或者點擊 **Skip** 掉 Action B，看看在沒有資料的情況下，Action C 的篩選邏輯是否會導致程式崩潰（例如未處理的 `null` 檢查）。

這種能隨時撤銷、重播操作的能力，讓你能在不破壞當前開發環境的前提下，快速進行邊界測試（Edge Case Testing）。

## Immer 與不可變性陷阱：Proxy 的邊界

Redux Toolkit 內建了 Immer 庫，讓我們能用「寫入式」的語法來處理「不可變性」。這雖然大幅簡化了開發，但也帶來了兩大常見誤區。

### 禁忌：同時「修改」又「Return」

在 `createSlice` 的 reducer 中，Immer 期望你遵循一種模式：要麼直接修改 `state` 參數（透過 Proxy 攔截），要麼回傳一個全新的狀態。

**錯誤範例：**

```typescript
increment: (state) => {
  state.value += 1;
  return state; // ❌ 錯誤！
}
```

**為什麼不能這樣做？**
Immer 內部的運作邏輯是：如果 reducer 有回傳值，它會將該回傳值視為「最終的新狀態」；如果沒有回傳值，它會將「被修改過的 Draft」視為新狀態。
當你既修改了 `state.value` 又 return 了 `state`（這時的 `state` 是那個 Proxy 草稿對象），會導致 Immer 陷入邏輯混亂，有時甚至會導致 React 無法辨識狀態變更。

**正確做法：**

```typescript
// 做法 A：只修改，不 return
increment: (state) => {
  state.value += 1;
},

// 做法 B：不修改，直接 return 全新的物件（通常用於重設狀態）
reset: () => {
  return initialState; 
}
```

### 解構 State 的副作用：Proxy 連結斷開

這是一個非常隱蔽的 Bug。因為 Immer 是透過 JavaScript `Proxy` 來追蹤變更的，如果你過早地解構 `state`，可能會導致 Proxy 失去效應。

**失效範例：**

```typescript
updateUser: (state, action: PayloadAction<string>) => {
  let { user } = state; // ❌ 這裡解構出了 user 
  user = { name: action.payload }; // ❌ 這裡只是修改了局部變數 user 的引用，Immer 追蹤不到
}
```

**深入底層：**
當你執行 `let { user } = state` 時，你拿到的是 `state` 這個 Proxy 物件內部的一個屬性引用。如果你隨後重新賦值給 `user`，你只是改變了該函數內部的一個局部變數，並沒有透過 `state` Proxy 進行任何「寫入操作」。Immer 就不會知道 `state` 已經改變了。

**解法：**
始終保持「從根部寫入」的習慣。

```typescript
updateUser: (state, action: PayloadAction<string>) => {
  state.user.name = action.payload; // ✅ 透過 state 路徑寫入，Proxy 成功攔截
}
```

## TypeScript 常見報錯排查：確保型別鏈路不斷裂

TypeScript 是 RTK 的最佳拍檔，但如果設定不當，開發體驗會從「自動補完」變成「滿地紅線」。

### PayloadAction 泛型遺漏

當你定義 Reducer 卻沒有為 `action` 標註型別時，`action.payload` 會被推論為 `any`。這會導致你在 `dispatch` 時傳入錯誤的資料，而編譯器卻一聲不吭。

**建議實踐：**
始終明確標註 `PayloadAction<T>`。

```typescript
// ❌ 危險：payload 為 any
addTodo: (state, action) => { ... }

// ✅ 安全：明確指定 payload 必須是 string
addTodo: (state, action: PayloadAction<string>) => { ... }
```

### 解決 RootState 循環依賴

這是在實作 Topic 4 與 5 時最常遇到的問題：

1. `store.ts` 需要從 `todoSlice.ts` 匯入 `reducer`。
2. `todoSlice.ts` 內的 Selector 需要從 `store.ts` 匯入 `RootState`。

這形成了 **A 引用 B，B 引用 A** 的循環依賴。雖然現代打包工具（如 Vite）有時能處理，但這會導致 TypeScript 的型別推論變得很脆弱，甚至在執行時報錯。

**萬能解法：**`**import type**`
在 `todoSlice.ts` 中匯入 `RootState` 時，務必使用 `import type`：

```typescript
import type { RootState } from '../../app/store';

// 這樣編譯器會知道這只是型別資訊，不會產生實際的 JS 代碼引用，從而打破循環
export const selectTodos = (state: RootState) => state.todos.list;
```

## useSelector 效能陷阱：避免「無限重渲染」

這是 React-Redux 開發中最危險的坑。`useSelector` 決定元件是否重新渲染的標準是：**「Selector 函數回傳的值，跟上一次的值相比，是否發生了變化？」**。

而它預設使用的是 **「嚴格相等比較 (===)」**。

### 回傳新物件導致的危機

如果你在 Selector 內部使用了 `.filter()`、`.map()` 或回傳了一個新的物件/陣列，即使原始資料沒變，這些方法每次執行都會產生一個 **全新的記憶體位址**。

**崩潰範例：**

```typescript
const completedTodos = useAppSelector(state => 
  state.todos.items.filter(t => t.completed) // ❌ 每次 state 變更，甚至無關 state 變更，這都會回傳新陣列
);
```

當 Store 中任何一個無關的狀態（例如 `state.counter`）改變時，`useSelector` 都會重新執行。因為 `.filter()` 每次都回傳新陣列，`useSelector` 就會認為「資料變了！」，進而通知元件重新渲染。在某些極端情況下（例如在 `useEffect` 中又觸發了變更），這會導致 **無限循環**。

### 兩大解法

1. **使用 **`**createSelector**`** (Reselect)**：
這是最推薦的做法。它會對輸入進行「記憶化（Memoization）」。只有當 `state.todos.items` 真的改變時，它才會重新計算。
  ```typescript
// 在 slice 檔案中
export const selectCompletedTodos = createSelector(
  [(state: RootState) => state.todos.items],
  (items) => items.filter(t => t.completed) // 只有 items 變了，這才會重新執行
);
```
2. **使用 **`**shallowEqual**`** 比較器**：
如果你不想額外寫 Selector 邏輯，可以傳入第二個參數給 `useSelector`。
  ```typescript
import { shallowEqual } from 'react-redux';
  const completedTodos = useAppSelector(
  state => state.todos.items.filter(t => t.completed),
  shallowEqual // ✅ 它會檢查陣列內容是否相同，而不是只看記憶體位址
);
```

## 總結與寫作建議：將「坑」化為「金」

在你的鐵人賽文章中，這些錯誤不應該被藏起來，反而應該大方地展示出來。

- **教學連結**：在解釋 `useSelector` 的文章中，可以寫一個專欄標題為 「⚠️ 警告：小心你的 filter 正在殺死效能」，然後展示上述的無限重渲染案例。
- **增加真實感**：讀者最喜歡看作者如何從 `[object Object]` 或 `undefined is not a function` 的泥沼中爬出來。記錄下你解決 TypeScript 循環依賴的過程，會讓讀者感受到這是一篇有實戰血淚的技術心得，而非單純的文檔翻譯。

掌握了這些除錯技巧，你就不再只是「會用」Redux，而是能「駕馭」它。當你理解了 Immer 的 Proxy 邊界、TypeScript 的擦除機制以及 Selector 的比較邏輯，你就已經具備了撰寫高品質技術文章的核心競爭力。

## 接下來

我們已經建立了一套標準化的文章產出流程，並深入探討了開發中最容易遇到的技術陷阱。在最後一部分，我們將進行最後的衝刺：**將所有課程主題精準對應到鐵人賽前 10–12 篇的具體大綱**，確保你能帶著一份完整的發文計畫書踏上征途。
