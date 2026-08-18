---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 3 堂：createSlice 核心機制與型別實作

# 11自動生成的 Action 機制

在上一部分中，我們學習了如何使用 `createSlice` 來定義 Redux 的「設計圖」——也就是包含 `name`、`initialState` 與 `reducers` 的三大要素。這看起來只是把程式碼整理得比較整齊而已，對吧？

但事實上，`createSlice` 背後做了一件非常神奇的事情：它幫你把最無聊、最容易出錯的「體力活」全部自動化了。

在傳統的 Redux 開發中，每當你想增加一個新功能（例如「增加計數」），你通常需要手動完成三件事：

1. 定義一個 Action Type 字串（例如 `const INCREMENT = 'INCREMENT'`）。
2. 寫一個 Action Creator 函式（例如 `const increment = () => ({ type: INCREMENT })`）。
3. 在 Reducer 的 `switch-case` 裡增加一個對應的判斷邏輯。

如果你的應用程式有 50 個不同的動作，你就要重複這套流程 50 次。這不僅僅是繁瑣，更危險的是**字串不一致**導致的 Bug。只要你的 Action Type 在 Creator 和 Reducer 之間打錯一個字母，整個狀態更新就會無聲無息地失效。

現在，讓我們來看看 Redux Toolkit（RTK）是如何用一個 API 解決這所有問題的。

---

## 呼叫 createSlice 之後發生了什麼？

當我們執行 `createSlice` 並將結果賦值給一個變數（例如 `counterSlice`）時，這個變數並不是一個單純的設定檔，而是一個**功能完整的物件**。

你可以試著在主控台（Console）打印出這個物件，你會發現它主要由兩個核心部分組成：

1. **`counterSlice.reducer`**：這是一個處理邏輯的「總司令」，它整合了你在 `reducers` 物件中寫下的所有邏輯。這就是你要交給 `configureStore` 的那個 Reducer。
2. **`counterSlice.actions`**：這是一個神奇的倉庫，裡面存放著與你在 `reducers` 中定義的 Key **同名**的 Action Creator 函式。

### 想像一下這個對應關係

如果你在 `reducers` 裡寫了一個名為 `increment` 的方法，RTK 會自動在 `counterSlice.actions` 物件下產生一個也叫作 `increment` 的函式。

這個自動生成的函式在被呼叫時，會回傳一個標準的 Redux Action 物件：

```javascript
// 你不需要寫這段，RTK 會幫你生成
const action = counterSlice.actions.increment();
// action 的結果會是：{ type: 'counter/increment', payload: undefined }
```

這種「所見即所得」的設計，確保了你的 Action 發送者與接收者永遠處於同一個頻率上。

---

## Action Type 的秘密：命名空間的自動組合

你可能會好奇，RTK 自動生成的 `type` 字串（例如 `'counter/increment'`）是從哪裡來的？

這就是 `name` 屬性發揮作用的地方。RTK 使用了一套簡單而嚴謹的公式來組合 Action Type：

> **`name` (Slice 名稱) + `/` + `**reducerKey**`** (方法名稱)**

### 為什麼這很重要？

在大型專案中，不同功能模組很可能會出現同名的動作。例如 `Auth` 模組可能有 `reset`（重設密碼），而 `Counter` 模組也有 `reset`（歸零）。

- 如果沒有命名空間，你的 `dispatch({ type: 'reset' })` 會同時觸發兩個模組的更新。
- 有了 RTK 的自動組合，它們會分別變成 `auth/reset` 與 `counter/reset`。

這不僅避免了命名衝突，更讓你在使用 Redux DevTools 除錯時，能一眼看出這個動作是屬於哪一個業務邏輯的。你再也不用手寫 `const RESET_COUNTER = 'RESET_COUNTER'` 這種冗長的常數了。

---

## 直觀對比：傳統 Redux vs. Redux Toolkit

為了讓你感受到 RTK 的威力，我們直接把「新增一個加法功能」在兩種模式下的寫法擺在一起看。

### 1. 傳統 Redux 的做法（充滿樣板程式碼）

你需要分散在多個地方定義，或者在一個檔案裡寫一長串：

```typescript
// 1. 定義字串常數 (為了避免打錯字)
const INCREMENT = 'counter/increment';

// 2. 手寫 Action Creator
export const increment = () => ({
  type: INCREMENT
});

// 3. 手寫 Reducer
const initialState = { value: 0 };
function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 };
    default:
      return state;
  }
}
```

### 2. 使用 Redux Toolkit 的做法

你只需要專注於「邏輯」本身：

```typescript
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    }
  }
});

// Action Creator 與 Reducer 都已經在 counterSlice 裡面了！
```

### 核心差異點

- **維護成本**：傳統寫法中，如果你想把 `increment` 改名為 `addOne`，你需要改動 3-4 個地方。而在 RTK 中，你只需要改動 `reducers` 物件裡的那個 Key，其餘的所有內容（Action Type, Action Creator）都會自動隨之改變。
- **出錯機率**：你不再需要維護字串常數。只要 TypeScript 能識別 `counterSlice.actions.increment`，就絕對不會發生 Action 發送錯誤的情況。
- **閱讀體驗**：RTK 的寫法將「意圖」（Action）與「行為」（Reducer）緊密結合在一起，讓開發者能更直觀地理解這塊功能在做什麼。

---

## 匯出模式：最佳實踐 (Best Practice)

在實務開發中，我們通常會遵循一個被稱為 "Ducks" 模式的變體。你會在一個 Slice 檔案中定義所有邏輯，然後將 Action 與 Reducer 分別匯出。

這是你在寫鐵人賽範例或實際專案時最推薦的寫法：

```typescript
// features/counter/counterSlice.ts

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

// 1. 使用解構賦值匯出 Action Creators
// 這樣在 React 元件中就可以直接 import { increment } 
export const { increment, decrement } = counterSlice.actions;

// 2. 使用 default export 匯出 Reducer
// 這樣在 store.ts 中可以方便地命名並註冊
export default counterSlice.reducer;
```

### 為什麼要這樣匯出？

- **Named Export (**`**actions**`**)**：讓元件端的使用非常便利。當你需要多個動作時，可以 `import { increment, decrement }`，並且享有完美的 IDE 自動補完。
- **Default Export (**`**reducer**`**)**：在設定 Store 時，我們通常只需要一個 Slice 的 Reducer。透過 Default Export，我們可以在 `store.ts` 裡自定義它的名稱，例如 `import counterReducer from './features/counter/counterSlice'`。

---

## 總結與銜接

理解了 `createSlice` 如何自動生成 Action 之後，你已經掌握了 Redux Toolkit 簡化開發流程的第一個大殺器。我們再也不需要手寫冗長的 Action Types 和 Creators，所有的溝通契約（Contract）都由 RTK 根據你的 `reducers` 物件自動建立。

我們學會了：

- `createSlice` 會回傳一個包含 `actions` 與 `reducer` 的物件。
- Action Type 的組成規律是 `name/reducerKey`。
- 透過解構匯出 `actions` 是目前業界公認的最佳實踐，能極大化開發效率。

但是，如果你仔細觀察剛才的範例程式碼，你可能會發現一個奇怪的地方：

```javascript
increment: (state) => {
  state.value += 1; // 這是直接修改狀態嗎？這不是違反了不可變性原則嗎？
}
```

在傳統 Redux 中，這樣寫會導致嚴重的 Bug，甚至讓 React 無法偵測到更新。但在 RTK 裡，這卻是被官方強烈推薦的寫法。

下一部分，我們將揭開 **Immer 與不可變性魔法** 的面紗，解釋為什麼 RTK 讓我們能用這種「直覺但看似危險」的方式寫出更安全的程式碼。

## 重點回顧

- `createSlice` 自動為每個 reducer 生成同名的 Action Creator。
- 生成的 Action Type 格式為 `[name]/[reducerKey]`，有效避免命名衝突。
- 相比傳統 Redux，RTK 大幅減少了樣板程式碼，讓邏輯更集中。
- 推薦在 Slice 檔案中解構匯出 `actions`，並 default 匯出 `reducer`。
