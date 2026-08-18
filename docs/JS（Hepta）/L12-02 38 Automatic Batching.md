---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 12 堂：Reconciliation 收尾與複習

# 38 Automatic Batching

想像一下，你正在餐廳用餐。如果你每想到一個需求就叫一次服務生：「請給我一杯水」，等他拿水回來後，你又說：「請給我一張選單」，接著再叫他：「我想點一份牛排」。這位服務生可能會在心裡翻無數個白眼，因為你讓他多跑了好幾趟冤枉路。

聰明的做法是：先把所有需求想好，等服務生走過來時，一次告訴他：「我要水、選單和一份牛排」。這樣服務生只需要跑一趟，效率最高。

在 React 的世界裡，這種「合併多個需求並一次處理」的機制，就叫做 **Batching（批次更新）**。但在 React 18 之前，這個「服務生」其實有點健忘，他並非在所有情況下都能這麼聰明。

## 什麼是 Batching？

在 React 中，**Batching** 指的是 React 將多次 `setState` 的呼叫合併成單次 re-render（重新渲染）的行為。

這是一項關鍵的效能優化。回想我們在 Topic 6 討論過的 Virtual DOM：雖然操作 Virtual DOM 很快，但最終同步到真實 DOM 的過程（Commit Phase）以及元件內部的邏輯執行依然是有成本的。如果你的程式碼中連續改了三個狀態，React 就傻傻地渲染三次，那對於複雜的 App 來說，這簡直是效能災難。

### 預測一下：這會觸發幾次渲染？

請看以下這段常見的 Hooks 代碼：

```javascript
const [count, setCount] = useState(0);
const [isDark, setIsDark] = useState(false);

const handleClick = () => {
  setCount(c => c + 1);
  setIsDark(d => !d);
  // 這裡執行完後，React 會渲染幾次？
};
```

答案是：**1 次**。

React 會等到 `handleClick` 這個函數裡的同步程式碼全部執行完畢，發現總共有兩個狀態要更新，然後才啟動渲染流程。這就是 Batching。

## React 17 的遺憾：半套的批次更新

在 React 17（以及更早的版本）中，Batching 的行為是不一致的。它有一個巨大的局限性：**Batching 僅發生在 React 的「合成事件（Synthetic Events）」處理器和生命週期鉤子中。**

所謂合成事件，就是你寫在 JSX 上的 `onClick`、`onChange` 等。因為這些事件是由 React 統一管理的，React 可以在呼叫你的處理函數之前先「打開」一個開關，告訴系統：「接下來發生的所有更新都先記下來」，等函數結束後再「關閉」開關並執行渲染。

**但是，一旦脫離了 React 的掌控範圍，Batching 就失效了。**

這包括：

1. **非同步操作**：例如 `fetch().then()` 或 `setTimeout`。
2. **原生 DOM 事件**：例如使用 `window.addEventListener` 監聽的事件。

### React 17 的「噴發式」渲染範例

讓我們看看這段程式碼在 React 17 中的表現：

```javascript
// 假設這是在 React 17 環境
const [count, setCount] = useState(0);
const [flag, setFlag] = useState(false);

console.log("元件渲染了！");

const handleClick = () => {
  // 在非同步回調中
  setTimeout(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 在 React 17 中，這裡會觸發 2 次渲染！
    // 控制台會印出兩次 "元件渲染了！"
  }, 100);
};
```

這造成了開發者心理上的負擔。你必須隨時記住：如果在 Promise 裡面更新狀態，效能可能會變差；或者你得手動使用一些 React 提供的「半官方」API（如 `unstable_batchedUpdates`）來強制批次處理。

這不僅是效能問題，有時還會引發邏輯 Bug。例如，你預期兩個狀態會同時更新並在下一次渲染中呈現，但在 React 17 的非同步場景下，它們會分兩次渲染呈現，這可能導致 UI 出現短暫的不一致狀態。

## React 18 的進化：Automatic Batching

React 18 引入了 **Automatic Batching（自動批次更新）**，解決了上述的所有不一致。

現在，無論 `setState` 是在哪裡被呼叫的——不論是 `setTimeout`、`Promise`、原生事件處理器，還是任何其他地方——React 都會自動將它們合併為一次渲染。

### 實測對比：React 17 vs React 18

讓我們用一個具體的範例來視覺化這個差異。

```javascript
import React, { useState } from 'react';

function BatchingDemo() {
  const [count, setCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  console.log("--- Render Occurred ---");

  const handleAsyncClick = () => {
    // 模擬一個非同步任務
    setTimeout(() => {
      console.log("開始更新狀態...");
      setCount(c => c + 1);
      setIsDone(d => !d);
      console.log("狀態更新呼叫完畢。");
    }, 0);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <p>Done: {String(isDone)}</p>
      <button onClick={handleAsyncClick}>點擊執行非同步更新</button>
    </div>
  );
}
```

#### 在 React 17 中的 Console 輸出：

1. 開始更新狀態...
2. **--- Render Occurred ---** (count 變 1)
3. **--- Render Occurred ---** (isDone 變 true)
4. 狀態更新呼叫完畢。

#### 在 React 18 中的 Console 輸出：

1. 開始更新狀態...
2. 狀態更新呼叫完畢。
3. **--- Render Occurred ---** (兩者同時更新)

這個改進讓 React 的行為變得更加直覺且一致。你再也不用擔心在哪裡呼叫 `setState` 會造成效能波動，「UI = f(state)」的公式變得更加穩固。

## 底層機制：為什麼 React 18 辦得到？

為什麼以前不行，現在可以？這涉及到 React 調度機制（Scheduler）的根本改變。

### 微任務（Microtask）的妙用

我們在 Topic 4 深入討論過 Event Loop。React 18 的批次更新邏輯與 **Microtask** 有著緊密的連結。

當你呼叫 `setState` 時，React 並不是真的「去渲染」，而是將這個更新任務放入一個**佇列（Update Queue）**中。

在 React 18 中，當第一個 `setState` 被呼叫時，React 會在 Microtask Queue 中排入一個「渲染任務」。根據 Event Loop 的規則，Microtask 會在當前所有同步程式碼執行完畢後、瀏覽器渲染之前被清空。

因此：

1. 第一個 `setCount` 執行：React 記下變更，並排入一個「稍後渲染」的微任務。
2. 第二個 `setIsDone` 執行：React 發現已經有一個渲染任務在排隊了，於是只是更新佇列裡的數據。
3. 同步代碼結束（函數執行完畢）。
4. **JS 引擎清空 Microtask Queue**：此時 React 的渲染微任務啟動，一次拿走佇列裡所有的變更，執行 Diffing 並更新 DOM。

### 優先級調度（Lane Model）

另一個原因是 React 18 引入了 **Lane 模型**（我們會在 Topic 9 詳細介紹）。簡單來說，React 現在會給每一個更新分配一個「優先級」。

在 React 18 之前的版本，React 主要是透過「執行上下文（Execution Context）」來判斷是否批次更新。而在 React 18 中，它是透過「優先級」來判斷。只要多個更新具有相同的優先級（例如在同一個時間窗口內觸發），React 就會將它們合併。這種從「上下文驅動」到「優先級驅動」的轉變，是實現 Automatic Batching 的技術基石。

## 逃生口：flushSync

雖然自動批次更新幾乎在所有場景下都是好事，但極少數情況下，你可能需要**立即**看到 DOM 更新的結果。

例如：當你改變狀態後，需要立刻獲取某個 DOM 元素的 `offsetHeight` 或捲軸位置。由於批次更新會將渲染延後到同步代碼結束，如果你直接在 `setState` 後讀取 DOM，你拿到的會是舊的值。

這時，你可以使用 React 提供的 `flushSync`。

### 如何使用 flushSync

`flushSync` 會強制 React 立即同步刷新當前的更新佇列，並更新 DOM。

```javascript
import { flushSync } from 'react-dom';

const handleClick = () => {
  // 脫離自動批次更新
  flushSync(() => {
    setCount(c => c + 1);
  });
  // 到了這一行，DOM 已經被更新了
  console.log(document.getElementById('count-display').textContent);

  flushSync(() => {
    setFlag(f => !f);
  });
  // 到了這一行，DOM 又被更新了一次
};
```

### 警告：謹慎使用 flushSync

`flushSync` 是效能的敵人。它會破壞 React 的優化機制，觸發多餘的 Reflow（回流）與 Repaint（重繪）。

在絕大多數情況下，你應該使用 `useEffect` 來監聽狀態變化並執行相關的 DOM 讀取，而不是依賴 `flushSync`。只有在處理極其特殊的第三方套件集成（例如需要精確同步位置的動畫庫）時，才考慮使用它。

## 從「何時更新」到「怎麼更新」

了解 Batching 幫助我們掌握了 React 效能優化的時機維度。

- **Reconciliation & Diffing (7.1 - 7.3)** 解決的是「怎麼更新」的問題：如何用最少的步驟計算出 DOM 的差異。
- **Automatic Batching (7.5)** 解決的是「何時更新」的問題：如何合併多次請求，避免頻繁的勞動。

當這兩者結合時，React 就能在保證開發者體驗（宣告式開發）的同時，維持極高的運作效率。

### 下一站：診斷 key 的 bug

現在我們已經理解了 React 更新的「底層邏輯」與「執行時機」。但在實際開發中，我們最常遇到的效能與邏輯瓶頸，往往發生在**列表（List）**的處理上。

為什麼有時候更新了資料，輸入框裡的東西卻沒動？為什麼刪除一筆資料，整個列表都會閃爍？在掌握了更新時機後，我們將在下一節深入探討如何利用正確的 `key` 策略，解決開發中最常見的列表渲染 Bug。

## 知識整合與重點回顧

### 核心總結

- **Batching** 是為了效能：減少 re-render 次數。
- **React 17**：批次更新有條件限制（非同步不批次）。
- **React 18**：**Automatic Batching** 讓所有場景都能自動合併更新。
- **底層技術**：利用 Event Loop 的 **Microtask** 機制與優先級調度。
- **特殊手段**：`flushSync` 可強制同步更新，但應極力避免。

### 為什麼這對 React 重要？

如果沒有 Batching，React 的宣告式 UI 就會變得非常笨重。正因為 React 幫我們處理了這些繁瑣的合併邏輯，我們才能放心地在一個函數中呼叫多次 `setCount`、`setUserInfo`、`setIsLoading`，而不需要擔心瀏覽器會因為頻繁的 DOM 操作而崩潰。這讓「資料驅動 UI」的開發模式真正具備了生產級別的效能。
