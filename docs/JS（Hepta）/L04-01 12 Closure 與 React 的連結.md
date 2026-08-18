---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 4 堂：Closure 收尾與複習

# 12 Closure 與 React 的連結

在之前的學習中，我們深入研究了 JavaScript 的閉包（Closure）機制：它如何像一個「環境背包」一樣，讓函數帶著定義時的變數到處跑，甚至在父函數執行完畢後依然能存取那些變數。

如果你曾經覺得 React 的 Hook（例如 `useState` 或 `useEffect`）有些行為很神奇，甚至有些詭異——比如明明 `count` 已經更新了，為什麼 `setTimeout` 裡印出來的還是舊的值？——那麼這一節就是你的「啟示錄」。我們會發現，React 並沒有發明什麼黑科技，它只是極度巧妙地利用了 JavaScript 的閉包特性。

## 渲染即函數呼叫：每一次都是全新的開始

要理解 React 如何利用閉包，我們必須先打破一個常見的直覺誤區。

很多初學者會把 React 元件想像成一個「活著的實例（Instance）」，就像是一台機器，裡面的 `count` 是一個會隨著時間推移而變大的數字。但事實上，在 Hooks 的世界裡，**Function Component 每一次渲染，本質上都是一次全新的函數呼叫。**

### 執行環境（EC）的快照效應

回想我們在 Topic 1 學過的執行環境（Execution Context, EC）。當 React 決定要重新渲染你的元件時，它會再次呼叫你的箭頭函數：

```javascript
const Counter = () => {
  const [count, setCount] = useState(0);
  // ...
};
```

1. **第一次渲染（Mount）**：React 呼叫 `Counter()`。建立一個新的 EC。在這個 EC 的環境紀錄（Environment Record）中，`count` 被初始化為 `0`。
2. **觸發更新**：你點擊按鈕呼叫 `setCount(1)`。
3. **第二次渲染（Re-render）**：React 再次呼叫 `Counter()`。建立一個**完全不同**的 EC。在這個新的 EC 中，`count` 是 `1`。

關鍵點在於：**第一次渲染時的 **`**count**`** 常數（0）與第二次渲染時的 **`**count**`** 常數（1），是分別屬於兩個不同執行環境的獨立變數。** 它們之間沒有任何共享的連體嬰關係。

React 的設計哲學是：**UI 是狀態的投影（UI = f(state)）**。每一次渲染都捕捉了特定時間點的狀態「快照」。

## useState 與閉包：Setter 如何記住它的家？

既然每次渲染都是獨立的函數呼叫，變數也是獨立的，那為什麼我們呼叫 `setCount` 時，React 知道要更新哪一個狀態？

這就是閉包的功勞。當你在元件中寫下 `const [count, setCount] = useState(0)` 時，React 內部維護了一個狀態表格。

### 預測與發現：為什麼 setCount 不需要傳入「我是誰」？

**思考一下**：如果 `Counter` 元件被呼叫了兩次（產生兩個獨立的 DOM 節點），當你點擊其中一個按鈕時，`setCount` 怎麼知道該去更新哪一個節點的狀態，而不是把兩個都改掉？

**真相是**：`setCount` 是一個閉包。在 `useState` 實作中（我們在 Topic 10 會詳細拆解原始碼），React 會回傳一個函數，這個函數「捕獲」了當前正在處理的 Fiber 節點（React 的內部工作單元）的參考。

這就像是你在多個房間（EC）裡各放了一個對講機（`setCount`）。雖然對講機長得一樣，但每一台對講機在出廠時（定義時），都已經被設定好只能連通到特定的控制室。當你按下按鈕，它不需要問你是誰，因為它定義時所在的環境已經決定了它的行為。

## 經典陷阱：為什麼 setTimeout 抓不到最新值？

這是 React 開發者最常遇到的「靈異現象」，也是面試時必考的閉包題。

請看以下程式碼，並預測行為：

```javascript
const Counter = () => {
  const [count, setCount] = useState(0);

  const handleAlertClick = () => {
    // 預計在 3 秒後印出 count
    setTimeout(() => {
      console.log("當前的 count 是:", count);
    }, 3000);
  };

  return (
    <div>
      <p>目前的數字: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加數字</button>
      <button onClick={handleAlertClick}>顯示 Alert (延遲 3 秒)</button>
    </div>
  );
};
```

**實驗步驟：**

1. 初始狀態 `count` 是 `0`。
2. 點擊「顯示 Alert」按鈕。
3. **立刻**快速點擊「增加數字」按鈕 5 次，讓畫面上的數字變為 `5`。
4. 等待 3 秒鐘，觀察主控台（console）。

**預測結果：**
畫面顯示 `5`，主控台會印出什麼？是 `5` 還是 `0`？

**揭曉答案：**
主控台會印出 `0`。

### 為什麼會這樣？（從閉包角度分析）

當你點擊「顯示 Alert」的那一刻，`handleAlertClick` 函數被執行。此時：

1. JavaScript 建立了一個 `setTimeout` 的回調函數。
2. 這個回調函數是一個**閉包**，它捕獲了**當時（第一次渲染）**的執行環境。
3. 在那個特定的執行環境中，`count` 的值確實就是 `0`。
4. 雖然隨後你透過 `setCount` 觸發了 5 次重新渲染，產生了 5 個新的執行環境（EC），裡面的 `count` 分別是 1, 2, 3, 4, 5，**但這跟 3 秒前就已經排程好的那個閉包一點關係都沒有。**

那個閉包就像是一個帶著「舊照片」的時空旅人，它只認得它出發時的那個世界。這就是所謂的 **Capture Value（捕獲值）** 特性。React 函數元件中的所有函數（包括事件處理器、useEffect 等）都會「捕獲」定義它們的那次渲染中的 props 和 state。

## useEffect 與過時的閉包（Stale Closure）

如果說 `setTimeout` 只是讓人困惑，那麼 `useEffect` 中的閉包陷阱則可能導致嚴重的 Bug。這就是我們常說的 **Stale Closure（過時的閉包）**。

考慮這個常見的計時器範例：

```javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // 這裡使用了 count 變數
  }, 1000);
  return () => clearInterval(id);
}, []); // 注意：這裡的依賴陣列是空的
```

**問題在哪裡？**

1. 這個 `useEffect` 只在組件掛載（mount）時執行一次。
2. 傳給 `setInterval` 的匿名函數是一個閉包，它在組件第一次渲染時被建立。
3. 因此，它捕獲了第一渲染時的 `count`（值為 `0`）。
4. 每隔一秒，這個閉包就會執行 `setCount(0 + 1)`。
5. **結果**：不論過多久，`count` 永遠會從 0 變 1，然後停在 1。因為閉包裡的 `count` 永遠是那個被捕獲的 `0`。

這就是為什麼 React 強烈要求我們正確填寫「依賴陣列（Dependency Array）」。如果你把 `count` 放入依賴陣列 `[count]`，React 就會在 `count` 改變時，銷毀舊的計時器並重新建立一個新的閉包，這個新閉包會捕獲到最新的 `count`。

### 如何繞過閉包限制？

有時候我們不希望頻繁地銷毀並重建計時器，這時有兩個 JS 層面的解決方案，都與我們學過的原理有關：

1. **函數式更新（Functional Update）**：
使用 `setCount(prev => prev + 1)`。這樣 `setCount` 不需要依賴外部的 `count` 變數，它會直接從 React 內部的「控制室」拿取最新的狀態，從而避開閉包捕獲舊值的問題。
2. **使用 useRef**：
`useRef` 回傳的是一個普通的 JS 物件 `{ current: ... }`。因為它在多次渲染之間共享同一個物件參考（Reference），所以當你在閉包裡存取 `ref.current` 時，你不是在讀取一個被捕獲的常數，而是在透過參考查找一個會變動的屬性。這就像是閉包沒拿照片，而是拿了一張指向某個保險箱的卡片，每次執行時都去保險箱看一眼最新狀況。

## 為什麼 React 要這樣設計？（深層哲學）

你可能會問：「既然閉包會帶來 Stale Closure 這種麻煩，為什麼 React 不乾脆讓 `count` 永遠指向最新值就好？」

這涉及到 React 的核心願景：**可預測性（Predictability）**。

想像一下，如果你正在讀取一份非同步的數據。在傳統的命令式編程中，如果你在請求發出後、回傳前，頁面上的數據被改掉了，你的回調函數可能會處理到一半新、一半舊的數據，導致狀態不一致。

React 選擇利用閉包來鎖定「快照」，是為了確保：**在某次渲染的執行脈絡中，所有的邏輯（UI、事件、副作用）所看到的數據都是一致的。** 這種「不變性（Immutability）」讓我們在除錯時，只需要思考「那次點擊時的狀態是什麼」，而不需要擔心變數在執行過程中被誰偷偷改掉了。

## 重點回顧與總結

透過這一節，我們將 JavaScript 的底層機制與 React 的頂層行為連了起來：

- **Function Component 的渲染**：本質上是為了建立新的執行環境（EC）。
- **State 的本質**：在特定的 EC 中，State 只是普通的常數（透過 `const` 宣告），它不會變，直到下一次函數呼叫。
- **閉包捕獲（Capture Value）**：元件內的函數（如事件處理器、Effect）透過閉包機制，「記住」了定義它們的那次渲染中的變數狀態。
- **Stale Closure（過時閉包）**：當一個異步任務（如 `setTimeout` 或沒寫依賴的 `useEffect`）持有舊渲染的環境參考，而畫面已經更新到新渲染時發生的現象。

### 知識連結表

| React 現象 | 對應 JavaScript 原理 |
| --- | --- |
| 重新渲染（Re-render） | 建立新的函數執行環境（Execution Context） |
| `useState` 的值不隨時間改變 | 詞法作用域中的常數宣告（Lexical Environment） |
| `setTimeout` 讀取到舊狀態 | 閉包捕獲了定義時的作用域（Environment Record） |
| `useEffect` 的依賴陣列 | 透過重新建立閉包來更新捕獲的環境 |
| `useRef` 讀取到最新值 | 物件參考（Reference Type）不因閉包捕獲而失效 |

掌握了這些，你就不再只是在「背」Hooks 的用法，而是從底層邏輯理解了 React 的脈動。

## 結束 Topic 2：邁向複習

恭喜你！我們已經完整走過了 Topic 2 的所有子主題。從閉包的形成原理、函數工廠的應用、迴圈與異步的陷阱，到記憶體管理的高階知識，最後我們將這一切接回了 React 的核心。

閉包是 JavaScript 中最難、但也最強大的特性。在 React 的 Hooks 誕生後，閉包從一個「避之唯恐不及的坑」，變成了「構建優雅應用的基石」。

接下來，我們將進入 **Review 階段**。我會帶領你將整個 Topic 2 的知識點進行一次大串聯，透過主動回想（Active Recall）來確保這些關鍵概念已經深刻在你的大腦中。準備好了嗎？讓我們開始這場知識的總檢閱！
