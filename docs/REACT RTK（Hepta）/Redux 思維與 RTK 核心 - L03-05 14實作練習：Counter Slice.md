---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 3 堂：createSlice 核心機制與型別實作

# 14實作練習：Counter Slice

想像你在寫鐵人賽的第一篇實作文章。如果只是貼上一段程式碼，讀者可能五分鐘就看完跑了，甚至可能因為看不懂為什麼要這樣寫而放棄。一個好的教學者不僅要給出「正確答案」，更要解釋「為什麼這個答案是這樣設計的」。

我們在前幾小節已經拆解了 `createSlice` 的構造、Action 的生成機制、Immer 的運作原理，以及 TypeScript 的型別整合。現在，是時候將這些零散的拼圖整合在一起了。這不僅僅是一個「計數器」範例，它是你未來所有複雜 Slice 的原型（Prototype）。

## 為什麼從 Counter 開始？

你可能會覺得「又是計數器？」。但在狀態管理的領域中，Counter 是最純粹的範例。它涵蓋了狀態管理的兩大核心操作：**同步的數值變更**以及**帶有參數的狀態更新**。當你能在 Counter 中完美處理 TypeScript 的型別推導與 Immer 的邏輯攔截，處理複雜的 Todo List 或 E-commerce Cart 也就只是規模上的差異而已。

接下來，我們將按照專業開發者的工作流，一步步建立這個 Slice。請確保你在專案中已經建立了 `src/features/counter/` 資料夾，這符合我們之前提到的「以功能為中心（Feature-based）」的目錄結構。

## 第一步：定義型別與初始狀態

在 TypeScript 的世界裡，定義 Data Shape（數據形狀）永遠是開發的第一步。這不僅是為了讓程式碼通過編譯，更是為了釐清我們的數據模型。

### 為什麼需要定義 Interface？

雖然我們可以讓 TypeScript 自動推導 `initialState` 的型別，但明確定義 `interface` 有以下優點：

1. **可讀性**：其他開發者一眼就能看出這個狀態包含哪些欄位。
2. **安全性**：避免在初始化時漏掉某些欄位。
3. **擴充性**：當未來計數器需要加入 `status` (loading/idle) 或 `lastUpdated` 等欄位時，我們只需修改介面。

```typescript
import { PayloadAction } from '@reduxjs/toolkit';

// 1. 定義狀態的型別介面
interface CounterState {
  value: number;
  // 未來可以在這裡擴充，例如 status: 'idle' | 'loading' | 'failed'
}

// 2. 根據介面定義初始狀態
const initialState: CounterState = {
  value: 0,
};
```

**深度解析：** 這裡我們將 `initialState` 標註為 `CounterState` 型別。這是一個關鍵動作，因為後續 `createSlice` 中的 `state` 參數將會自動繼承這個型別。如果你在這裡使用了錯誤的初始值，TypeScript 會立刻報錯。

## 第二步：配置 createSlice 的核心參數

接著，我們要調用 `createSlice`。這個函式就像是一個狀態工廠，你傳入規格，它吐出對應的零件（Actions 與 Reducer）。

```typescript
import { createSlice } from '@reduxjs/toolkit';

// ... 承接上面的型別定義 ...

const counterSlice = createSlice({
  name: 'counter', // 這將會是 Action Type 的前綴，例如 'counter/increment'
  initialState,    // 傳入剛剛定義好的初始狀態
  reducers: {
    // 我們將在這裡實作邏輯
  },
});
```

這裡的 `name` 屬性非常重要。它不僅是 Redux DevTools 中顯示的標籤，更是所有生成的 Action Types 的「命名空間（Namespace）」。這防止了不同 Slice 之間發生 Action 命名衝突。

## 第三步：利用 Immer 寫出直覺的邏輯

在 `reducers` 物件中，我們要定義三個核心邏輯：`increment`（加一）、`decrement`（減一）、以及 `incrementByAmount`（自定義增加量）。

還記得 Immer 的魔法嗎？在這裡，你不需要再寫 `return { ...state, value: state.value + 1 }` 這種冗長的語法，你可以像操作普通 JavaScript 物件一樣「直接修改」它。

```typescript
    // 在 reducers 內部實作
    increment: (state) => {
      // Immer 會捕捉這個修改，並生成一個新的不可變物件
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
```

### 處理動態數據：PayloadAction

當我們需要從外部傳入參數（例如增加 5 或增加 10）時，我們需要用到 `action.payload`。在傳統 Redux 中，你必須手動定義 action 的型別。在 RTK 中，我們使用泛型 `PayloadAction<number>`。

```typescript
    // 這裡我們明確指定 payload 的型別必須是 number
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
```

**為什麼這裡要寫 **`**action: PayloadAction<number>**`**？**
如果你嘗試在 UI 元件中 Dispatch 一個字串 `dispatch(incrementByAmount("5"))`，TypeScript 會因為型別不符而報錯。這種「編譯時期的保護」是大型專案穩定性的基石。

## 第四步：封裝與匯出：遵循 Ducks Pattern

最後一步是將這個 Slice 模組化。根據業界常用的 **Ducks Pattern** 規範，一個 Slice 檔案應該：

1. **命名匯出（Named Export）** Actions：讓元件可以方便地調用。
2. **預設匯出（Default Export）** Reducer：讓 Store 能夠掛載它。

```typescript
// 匯出 Actions，供元件使用
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 匯出 Reducer，供 configureStore 使用
export default counterSlice.reducer;
```

## 完整程式碼實作與深度解析

將上述步驟拼湊起來，這就是一個標準且專業的 `counterSlice.ts` 檔案。你可以將這段程式碼直接複製到你的專案中。

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 定義狀態介面
 * 這裡體現了 TS 的嚴謹性：我們明確知道狀態中只有一個 value 且型別為 number
 */
interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 動作 1：單純增加
    increment: (state) => {
      /**
       * 【Immer 魔法】
       * 在傳統 Redux 你必須寫：return { ...state, value: state.value + 1 }
       * 這裡直接修改 state.value，RTK 會在底層處理不可變性更新
       */
      state.value += 1;
    },
    // 動作 2：單純減少
    decrement: (state) => {
      state.value -= 1;
    },
    // 動作 3：傳入參數增加
    /**
     * 【TS 型別保護】
     * 透過 PayloadAction<number>，我們確保了 action.payload 絕對是數字。
     * 如果在 Dispatch 時傳入錯誤型別，IDE 會立刻標註錯誤。
     */
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// 解構匯出 Action Creators
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 預設匯出 Reducer
export default counterSlice.reducer;
```

### 深度考量：如果我想要「重設」狀態？

在寫鐵人賽文章時，你可以試著對讀者提出一個挑戰：**「如果我們要實作一個 reset 功能，該怎麼寫？」**

很多人會直覺寫下：

```typescript
reset: (state) => {
  state = initialState; // 這是錯的！
}
```

**注意：** 在 Immer 的 `reducers` 中，直接重新賦值 `state` 變數是不起作用的（因為你只是改變了局部變數的指向，並沒有修改 Proxy 攔截的物件）。

正確的做法是：

1. **修改屬性**：`state.value = 0;`
2. **回傳新狀態**：`return initialState;`（如果回傳一個新物件，Immer 會用它取代整個狀態）

這類小細節，就是區分「只會用 RTK」和「理解 RTK」的分水嶺。

## 為什麼這能成為一篇優質的鐵人賽文章？

當你依照這個流程寫出這段程式碼時，你已經不僅僅是在寫一個計數器了。你展示了：

- **工程化思維**：如何組織型別、初始值與邏輯。
- **底層原理的掌握**：解釋了 Immer 如何簡化代碼。
- **型別安全的堅持**：解釋了 `PayloadAction` 的重要性。

在下一篇教學中，我們將學習如何將這個 `counterSlice.reducer` 註冊到全域的 Store，並在 React 元件中透過 `useSelector` 與 `useDispatch` 來喚醒這股沈睡的邏輯。

## 本課重點回顧

我們已經完成了 `createSlice` 的深度探索。這是一個承上啟下的關鍵點。

- **三大要素的協作**：`name` 定義了舞台，`initialState` 定義了主角，而 `reducers` 則編排了劇本。
- **自動化的威力**：我們不再需要手動撰寫長長的 `switch-case`，也不需要手動定義 `const INCREMENT = 'INCREMENT'` 這樣的常數。RTK 幫我們打理好了一切。
- **不可變性的優雅轉身**：藉由 Immer，我們能用最自然、最易懂的方式寫出最安全、可預測的狀態變更。
- **型別驅動開發**：透過 TypeScript，我們在寫下程式碼的那一刻，就已經排除了 80% 可能發生的執行時期錯誤（Runtime Error）。

恭喜你！你已經掌握了 Redux Toolkit 最核心的開發模式。有了這個 Counter Slice，你已經準備好進入 React 元件的世界，讓狀態真正流動起來。我們下一課見。
