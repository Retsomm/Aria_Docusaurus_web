---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 4 堂：React 元件整合 Redux

# 17useDispatch 發送 Action

既然我們已經學會了如何透過 `useSelector` 讓元件擁有一雙「眼睛」來觀察 Store 中的狀態，下一個邏輯問題便是：我們該如何擁有一隻「手」去觸動這些狀態？

在 React Redux 的世界中，狀態的變更永遠不是透過直接修改變數來達成，而是必須遵循嚴格的指令發送流程。這一部分我們將深入探討 `useDispatch` hook，它是連接 UI 元件與 Redux 邏輯的大門。

## 傳令兵的角色：useDispatch 基本觀念

如果說 Store 是軍隊的「大本營」，而 Reducer 是負責執行決策的「參謀」，那麼 `useDispatch` 回傳的 `dispatch` 函數就是一名「傳令兵」。

在開發 React 元件時，你不需要（也不應該）知道 Reducer 具體是如何運作的，你只需要負責「發送意圖」。當使用者點擊按鈕時，元件會透過 `dispatch` 喊出一聲：「嘿！有人要加一！」或者「這裡有 5 塊錢要存入帳戶！」。這名傳令兵會帶著你的指令（Action 物件）奔向大本營，交給參謀（Reducer）去處理。

這種設計模式確保了 **關注點分離（Separation of Concerns）**：元件只管處理使用者互動，而邏輯更新則安全地封裝在 Slice 之中。

## 語法實作：從元件發送 Action

要使用這個傳令兵，我們需要先從 `react-redux` 匯入 Hook，並從我們定義好的 Slice 中匯入自動生成的 **Action Creators**。

假設我們延續之前的 Counter 範例，我們的實作會如下所示：

```typescript
import { useDispatch } from 'react-redux';
// 匯入我們在 counterSlice.ts 中定義並導出的 actions
import { increment, decrement } from '../features/counter/counterSlice';

export const CounterControls = () => {
  // 取得 dispatch 函數實例
  const dispatch = useDispatch();

  return (
    <div>
      {/* 當點擊發生時，呼叫 dispatch 並傳入 action creator 的執行結果 */}
      <button onClick={() => dispatch(increment())}>
        增加
      </button>
      
      <button onClick={() => dispatch(decrement())}>
        減少
      </button>
    </div>
  );
};
```

### 為什麼是 dispatch(increment()) 而不是 dispatch(increment)？

這是一個初學者常犯的錯誤。請記住，`increment` 是一個 **Action Creator（Action 生成器）**，它是一個函數。當你執行 `increment()` 時，它會回傳一個標準的 Action 物件，例如：`{ type: "counter/increment" }`。

`dispatch` 函數接收的是那個「物件」，而不是「函數」。如果你只傳入 `increment`（函數本身），Redux 會因為接收到的不是純物件而報錯。

## 處理資料負載：Payload 的傳遞與接收

現實中的指令往往比「加一」複雜。例如，「增加指定的金額」需要我們把具體的數值傳給 Reducer。這就是 `payload` 發揮作用的地方。

當我們在 `createSlice` 的 `reducers` 中定義了一個接收 payload 的方法時，RTK 自動生成的 Action Creator 就會接受一個參數。

### 元件端的發送

```typescript
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { incrementByAmount } from '../features/counter/counterSlice';

export const CounterAmountInput = () => {
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();

  const handleApply = () => {
    // 將 local state 中的數值作為參數傳給 action creator
    dispatch(incrementByAmount(amount));
  };

  return (
    <div>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(Number(e.target.value))} 
      />
      <button onClick={handleApply}>增加指定數值</button>
    </div>
  );
};
```

### Reducer 端的對接

回想一下我們在 `counterSlice` 中的定義：

```typescript
// 在 counterSlice.ts 內部
reducers: {
  incrementByAmount: (state, action: PayloadAction<number>) => {
    state.value += action.payload; // 這裡的 action.payload 就是上面傳入的 amount
  },
}
```

當你呼叫 `dispatch(incrementByAmount(5))` 時，RTK 會背後幫你組裝成 `{ type: "counter/incrementByAmount", payload: 5 }`。當這個物件抵達 Reducer 時，`5` 就會被自動帶入到 `action.payload` 中。這種機制讓資料從 UI 到狀態中心的傳遞變得異常流暢。

## 完整的讀寫循環：資料流的閉環

現在我們已經掌握了「讀取」與「寫入」，讓我們串連起 Redux 的 **單向資料流（Unidirectional Data Flow）**。請在腦中想像（或在筆記本上畫出）以下循環：

1. **觸發事件 (Event)**：使用者在瀏覽器點擊「增加指定數值」按鈕。
2. **發送指令 (Dispatch)**：元件呼叫 `dispatch(incrementByAmount(10))`。
3. **處理邏輯 (Reducer)**：Redux 找到對應的 Slice，執行更新邏輯 `state.value += 10`。
4. **更新狀態 (Store Update)**：Store 中的狀態被修改，觸發訂閱機制。
5. **偵測變化 (Selector)**：所有使用 `useSelector` 監聽 `state.counter.value` 的元件發現數值變了。
6. **重新渲染 (Re-render)**：React 元件接收到新值，將畫面的數字從 `0` 變更為 `10`。

這個閉環確保了狀態的變更始終是可預測、可追蹤的。你永遠不會遇到「不知道是誰改了狀態」的問題，因為每一條變更路徑都必須經過特定的 Action 與 Dispatch。

## 關於 dispatch 的穩定性

在使用 `useEffect` 或 `useCallback` 時，你可能會擔心 `dispatch` 是否會導致額外的依賴變化。

Redux 官方保證：由 `useDispatch` 回傳的 `dispatch` 函數引用是 **穩定（Stable）** 的。這意味著在元件的整個生命週期中，這個函數的記憶體位址不會改變。因此，即使你在 `useEffect` 的依賴陣列（dependency array）中放入 `dispatch`，它也不會觸發 effect 的重新執行。

```typescript
useEffect(() => {
  // 某些初始化邏輯
  dispatch(initializeAction());
}, [dispatch]); // 雖然放了 dispatch，但這個 useEffect 只會在掛載時執行一次
```

## 邁向型別安全

雖然 `useDispatch` 非常好用，但在 TypeScript 專案中，預設的 `useDispatch` 其實有一個小缺點：它對 `dispatch` 的回傳值（特別是處理非同步 Thunk 時）或是特定的 Action 類型缺乏深度推導。

在簡單的 Counter 範例中這或許不是問題，但當專案規模擴大，我們需要更嚴謹的型別保護來防止我們 dispatch 到不正確的 Slice 或是傳入錯誤格式的 payload。

### 讀寫權限的整合與補完

到目前為止，我們已經學會了如何使用 `useSelector` 讀取資料，以及使用 `useDispatch` 發送指令。這兩者結合，就完成了 React 元件與 Redux Store 之間最核心的通訊協定。然而，頻繁地在每個檔案中匯入 `RootState` 或手動處理 dispatch 型別會讓程式碼變得冗餘且容易出錯。為了打造一個真正專業級的 Redux 應用程式，我們需要將這些工具進一步封裝成「型別安全」的版本，這正是我們接下來要探討的課題。

我們已經具備了操作狀態的能力，現在要做的，是確保這些操作在 TypeScript 的守護下，能讓我們在撰寫程式碼的當下就發現潛在的邏輯錯誤。我們將學習如何建立自訂的 Hooks，讓開發體驗從「可用」提升到「好用且安全」的層次。
