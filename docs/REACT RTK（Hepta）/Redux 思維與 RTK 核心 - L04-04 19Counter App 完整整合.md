---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 4 堂：React 元件整合 Redux

# 19Counter App 完整整合

在先前的章節中，我們已經分別完成了 Redux 的「大腦」（Store）、 「邏輯藍圖」（Slice）以及「操作介面」（Typed Hooks）。現在，是時候將這些零散的組件拼湊在一起，構建出一個完整且型別安全的 Counter 應用程式。

這不僅僅是一個簡單的加減計數器，它代表了 React 與 Redux 協作的標準模型：從資料的定義、跨組件的讀取，到具備 Payload 的 Action 發送。透過這個實作，你將能體會到 TypeScript 如何在整個資料流中提供「端到端」的保護。

## 專案結構掃描

在開始撰寫 UI 之前，我們必須對整個建築的結構有清晰的認識。一個典型的、符合 RTK 最佳實踐的 React 專案結構通常如下：

```text
src/
├── app/
│   ├── store.ts          # 全域 Store 設定
│   └── hooks.ts          # 型別安全的 useAppSelector 與 useAppDispatch
├── features/
│   └── counter/
│       └── counterSlice.ts   # Counter 的狀態邏輯、Action 與 Reducer
├── Counter.tsx           # 實際使用的 UI 組件
├── App.tsx               # 根組件
└── main.tsx              # 入口檔案，負責注入 Provider
```

這種目錄結構被稱為 **Feature-based logic**。我們將邏輯（Slice）放在 `features/` 資料夾中，而將基礎設施（Store, Hooks）放在 `app/`。這種分類方式在應用程式擴展時，能幫助開發者快速定位某個功能模組的所有邏輯。

---

## 核心邏輯回顧

為了確保實作的一致性，我們快速複習一下已經準備好的底層代碼。

### 1. counterSlice.ts (邏輯定義)

在這個檔案中，我們定義了狀態的形狀以及如何修改它。

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    increment: (state) => {
      // Immer 讓我們可以直接「修改」狀態
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

### 2. store.ts 與 hooks.ts (基礎設施)

這裡建立了 Store 並推導出型別，最後封裝成 React Hooks。

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 實作 Counter 元件

現在，我們來撰寫 `Counter.tsx`。這個組件需要展現三種行為：

1. **讀取狀態**：顯示目前的計數。
2. **發送簡單指令**：點擊按鈕進行 +1 或 -1。
3. **發送帶資料的指令**：輸入數字並增加特定數值。

### 處理 Local State 與 Global State 的邊界

在實作 `incrementByAmount` 時，我們會遇到一個經典問題：輸入框中的數值應該放在 Redux 嗎？

**答案通常是不。**

輸入框中的「過程資料」（正在輸入的字串）屬於 **UI Local State**。只有當使用者點擊「送出」或「執行」按鈕，且該數值會影響到應用程式的其他部分時，我們才會將結果發送到 Redux。這能保持 Redux Store 的純粹性，避免頻繁的變更導致不必要的全域更新。

```tsx
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { increment, decrement, incrementByAmount } from './features/counter/counterSlice';

export const Counter: React.FC = () => {
  // 1. 從 Store 讀取數據
  // 透過 useAppSelector，這裡的 state 會被自動推導為 RootState 型別
  const count = useAppSelector((state) => state.counter.value);
  
  // 2. 取得 Dispatch 函數
  const dispatch = useAppDispatch();

  // 3. 定義 Local State 處理輸入框
  const [incrementAmount, setIncrementAmount] = useState('2');

  // 安全轉型為數字
  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Counter 實作</h2>
      
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
        當前數值: <strong>{count}</strong>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => dispatch(increment())}> +1 </button>
        <button onClick={() => dispatch(decrement())} style={{ marginLeft: '10px' }}> -1 </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
          type="number"
        />
        <button onClick={() => dispatch(incrementByAmount(incrementValue))}>
          增加指定數值
        </button>
      </div>
    </div>
  );
};
```

### 關鍵細節解析

1. **型別安全**：當我們呼叫 `dispatch(incrementByAmount(incrementValue))` 時，TypeScript 會檢查 `incrementValue` 是否為 `number`。如果你試圖傳入一個字串，編譯器會立即報錯。這是因為我們在 `counterSlice` 中使用了 `PayloadAction<number>`。
2. **穩定性**：`dispatch` 函數在元件的整個生命週期中是穩定的。你不需要擔心將它放入 `useEffect` 的依賴陣列中會導致無窮迴圈（儘管本例中未使用到）。
3. **單向流動**：點擊按鈕 -> 發送 Action -> Reducer 計算新 State -> Store 更新 -> `useAppSelector` 偵測到變化 -> `Counter` 元件重新渲染。

---

## 整合至應用程式

最後，我們需要將 `Counter` 元件放入 `App.tsx`，並確保 `main.tsx` 正確地提供了 Store。

### App.tsx

```tsx
import React from 'react';
import { Counter } from './Counter';

function App() {
  return (
    <div className="App">
      <h1>React Redux Toolkit + TypeScript</h1>
      <Counter />
    </div>
  );
}

export default App;
```

### main.tsx

這是應用程式的進入點。最常見的錯誤就是忘記在這裡包裹 `<Provider>`。

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 透過 Provider 將 store 注入整個 React 樹 */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

---

## 開發者工具驗證

當程式碼運行起來後，請務必打開瀏覽器的 **Redux DevTools**。你會觀察到以下現象：

1. **@@INIT**：應用程式啟動時，Redux 會發送一個初始 Action。此時你可以點擊 `State` 標籤，確認 `counter.value` 為 `0`。
2. **Action 序列**：每當你點擊按鈕，左側面板會出現 `counter/increment` 或 `counter/incrementByAmount`。注意其命名格式：`[slice name]/[reducer key]`。
3. **Payload 檢查**：點擊 `counter/incrementByAmount` Action，切換到 `Action` 標籤，你會看到：
  ```json
{
  "type": "counter/incrementByAmount",
  "payload": 5
}
```
4. **時光旅行 (Time Travel)**：你可以將滑鼠懸停在過去的 Action 上並點擊 "Jump"，你會發現 UI 的數值會瞬間跳回到那個時間點。這就是「純函數 Reducer」帶來的威力。

---

## 常見錯誤排查

在整合過程中，如果發現程式運作不如預期，可以檢查以下幾點：

### 1. Store 沒有正確合併 Reducer

如果在 `useAppSelector` 中拿到的 `state.counter` 是 `undefined`，通常是因為在 `store.ts` 的 `configureStore` 中，`reducer` 物件的 key 寫錯了。

- **正確**：`reducer: { counter: counterReducer }`
- **錯誤**：`reducer: { counterSlice: counterReducer }` (會導致你在 selector 必須寫 `state.counterSlice`)

### 2. 忘記匯出 Action Creators

在 `counterSlice.ts` 底部，必須顯式匯出 actions。如果你發現 `dispatch(increment())` 報錯說 `increment` 不是一個函數，請檢查 slice 的匯出部分。

### 3. 直接修改 Action 參數

在撰寫 Reducer 時，務必修改 `state` 物件而非 `action` 物件。

- **正確**：`state.value += action.payload`
- **錯誤**：`action.payload = state.value + 1` (這完全沒有意義，因為 Redux 監控的是 state)

---

## 總結與銜接

恭喜你！你已經完成了 Redux Toolkit 的完整核心流程。我們從環境建置出發，理解了 Redux 的三大原則，學會了如何定義 Slice，並最終透過型別安全的 Hooks 在 React 元件中實現了資料的讀寫。

這套模式是所有複雜 Redux 應用的基石。無論是處理 User Profile、購物車 logic 還是複雜的儀表板，其核心邏輯都逃不出：**定義狀態 -> 建立 Slice -> 封裝 Hooks -> 元件訂閱與觸發**。

### 關鍵知識點複習：

- **`useAppSelector`**：將元件連向 Store，監控特定的狀態片段。
- **`useAppDispatch`**：將意圖發送給 Store，並攜帶必要的 payload。
- **Local vs Global**：區分「暫時性的 UI 狀態」與「持久性的領域狀態」。
- **Redux DevTools**：開發者的「黑盒子」，記錄了狀態變更的所有證據。

### 下一堂課：多個 Slice 的組合與管理

目前的 Counter App 只有一個 Slice，但在真實世界中，你的 Store 可能會同時管理 `todos`、`auth`、`settings` 等多個領域。下一堂課，我們將挑戰「多個 Slice 的組合與管理」，學習如何在同一個 Store 中組織更複雜的資料結構，並探討設計良好 Selector 函數的最佳實踐。
