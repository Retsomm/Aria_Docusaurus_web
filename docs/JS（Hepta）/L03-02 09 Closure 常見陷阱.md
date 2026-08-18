---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 3 堂：Closure 完整應用

# 09 Closure 常見陷阱

想像一下，你正在編寫一個自動化工具，預計每隔一秒鐘在控制台印出數字 0, 1, 2。你胸有成竹地寫下了這段代碼：

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
```

按照直覺，你會預期一秒鐘後螢幕依序出現 `0`、`1`、`2`。然而，當你實際執行時，控制台卻在同一時間噴出了三個 `3`。

為什麼？是 JavaScript 壞了嗎？還是 `setTimeout` 的計時有問題？

這就是 JavaScript 開發者最常踩到的 **「迴圈中的 Closure 陷阱」**。如果你不能透徹理解這個現象，未來在處理 React 的 `useEffect` 或非同步邏輯時，將會陷入無止盡的 Debug 地獄。本節將帶你拆解這些陷阱的底層機制，並學會如何優雅地避開它們。

---

## 迴圈中的 Closure 陷阱：消失的計數器

要理解為什麼剛才的代碼會印出三個 `3`，我們必須回到第一章學過的 **執行環境（Execution Context, EC）** 與 **變數環境（Variable Environment）**。

### 核心成因：共用的變數空間

當我們使用 `var` 宣告變數 `i` 時，`var` 具有 **「函數作用域（Function Scope）」**（在此範例中，若在全域執行則為全域作用域）。這意味著整個 `for` 迴圈其實是在 **同一個執行環境** 中操作 **同一個變數 `i`**。

讓我們追蹤一下執行過程：

1. **同步執行階段**：`for` 迴圈開始。
  - `i = 0`：呼叫 `setTimeout`，將第一個回呼函數（Callback）丟進 Web APIs 計時，並告訴它「一秒後執行」。
- `i = 1`：呼叫 `setTimeout`，丟進第二個回呼函數。
- `i = 2`：呼叫 `setTimeout`，丟進第三個回呼函數。
- `i = 3`：迴圈判斷 `3 < 3` 為偽，迴圈結束。此時，全域環境下的 `i` 數值為 **3**。
2. **非同步執行階段**：一秒鐘過去了。
  - Call Stack 已經空了，Event Loop 開始將三個回呼函數依序推入 Stack 執行。
- 第一個回呼函數執行 `console.log(i)`。它在自己的作用域找不到 `i`，於是透過 **Scope Chain** 向外尋找。
- 它找到了全域環境中的那個 `i`。**重點來了：此時全域的 **`**i**`** 已經變成了 3**。
- 第二個、第三個回呼函數也是同樣的命運，它們讀取的都是同一個已經變成 `3` 的 `i`。

簡單來說，這些回呼函數捕獲（Capture）的是變數 `i` 的 **「參考（Reference）」**，而不是當時的 **「數值（Value）」**。當它們真正執行時，那個參考所指向的值早已面目全非。

---

## 三種解決方案及其底層邏輯

既然知道了問題出在「共用同一個變數」，解決方法就很明確了：**為每一次迭代創造一個獨立的「環境背包」**。

### 方案一：`let` 的區塊作用域（Block Scope）

這是現代 JavaScript 最推薦、最直覺的解法。只需將 `var` 改為 `let`：

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// 輸出：0, 1, 2
```

**底層原理：**
`let` 具有區塊作用域特性。在 `for` 迴圈中使用 `let` 時，JavaScript 引擎其實在背後幫你做了一件神奇的事：**每一次迭代（Iteration）都會建立一個新的區塊作用域環境**。

當 `i = 0` 時，會建立一個環境 `E0`，裡面存著 `i = 0`；當 `i = 1` 時，建立環境 `E1`，存著 `i = 1`。內部的箭頭函數在建立時，會分別「記住」屬於它們那一屆的環境。這就像是為每個回呼函數都準備了一個專屬的置物櫃，互不干擾。

### 方案二：IIFE（立即執行函數）

在 ES6 普及之前，這是老練開發者的標配技巧。IIFE 的目的是為了 **「手動創造函數作用域」**。

```javascript
for (var i = 0; i < 3; i++) {
  (function(capturedI) {
    setTimeout(() => {
      console.log(capturedI);
    }, 1000);
  })(i);
}
```

**底層原理：**
我們在 `setTimeout` 外面包裹了一層匿名函數並立即執行它。每一次迴圈，我們都把當前的 `i` 當作參數傳進去。
還記得執行環境（EC）嗎？每次呼叫函數，都會建立一個新的 **函數執行環境**。在這個環境中，參數 `capturedI` 變成了區域變數，它被「凍結」在那個當下的數值。即使外部的 `i` 繼續增加，函數內部的 `capturedI` 依然不受影響。

### 方案三：函數工廠（Function Factory）

利用上一節學到的工廠模式，我們可以把建立計時器的邏輯抽離出來：

```javascript
function createTimer(index) {
  return function() {
    console.log(index);
  };
}

for (var i = 0; i < 3; i++) {
  setTimeout(createTimer(i), 1000);
}
```

**底層原理：**
`createTimer(i)` 被呼叫時，它會產生一個新的 Closure。這個 Closure 捕獲了傳入的 `index` 參數。這與 IIFE 的邏輯一致，但程式碼結構更清晰，實踐了「關注點分離」的原則。

---

## Stale Closure：閉包的「過時」危機

如果說迴圈陷阱是初學者的門檻，那麼 **Stale Closure（過時的閉包值）** 就是資深開發者的噩夢。這在 React Hooks 開發中極其常見，甚至有一個專門的術語叫「過時的快照」。

### 什麼是 Stale Closure？

當一個函數捕獲了某個變數，而你預期在函數執行時能拿到該變數的「最新值」，但由於 Closure 的特性，該函數卻一直死守著 **「定義當下」** 的舊值，這就形成了 Stale Closure。

讓我們看一個純 JavaScript 的典型範例：

```javascript
function createCounter() {
  let count = 0;

  const log = () => {
    console.log(`目前的數字是: ${count}`);
  };

  const increment = () => {
    count++;
  };

  return [log, increment];
}

const [log, increment] = createCounter();

increment(); // count 變成了 1
increment(); // count 變成了 2
log();       // 輸出：目前的數字是: 2 (正常)
```

到目前為止一切正常，因為 `log` 函數與 `count` 變數在同一個 Lexical Environment 中，它能獲取到最新的 `count`。

### 陷阱出現在「非同步」或「重新綁定」時

想像你在網頁上寫了一個簡單的計數器按鈕：

```javascript
let count = 0;
const button = document.getElementById('myButton');

// 假設這是你在某次渲染中定義的函數
function handleClick() {
  setTimeout(() => {
    // 這裡會捕獲定義時的 count 環境
    console.log(`點擊時的 count 是: ${count}`);
  }, 3000);
}

button.addEventListener('click', handleClick);

// 在這三秒內，如果不小心透過其他方式快速修改了 count
count = 99; 
```

如果你在三秒內把 `count` 改成了 `99`，`handleClick` 最終印出的會是 `99` 還是舊值？在上面的範例中，因為 `count` 是全域變數，它會拿到最新值。

**但是**，在 React 的世界裡，`count` 不是全域變數，而是 `useState` 提供的狀態。**React 的狀態更新是透過重新執行整個函數（Component）來實現的**。

### React 中的預演：為什麼 useEffect 會失控？

雖然我們還沒正式進入 React 主題，但這裡必須給你一個警示。在 React 中，每次渲染（Render）都有它自己的 Props 和 State。

```javascript
// 偽代碼：模擬 React 渲染
function MyComponent(count) { // 假設這是第一次渲染，count = 0
  const handleClick = () => {
    setTimeout(() => {
      console.log(count); // 這裡捕獲的是第一幀的 count: 0
    }, 3000);
  };
  
  return handleClick;
}

// 第一次渲染
const click1 = MyComponent(0);

// 第二次渲染（count 變成了 1）
const click2 = MyComponent(1);
```

如果你在第一次渲染時觸發了 `setTimeout`，就算後來組件重新渲染、`count` 變成了 `100`，原本那個 `setTimeout` 裡的回呼函數依然死死記著第一幀的 `count = 0`。這就是為什麼有時候你在 React 裡呼叫 `setState` 後立刻在非同步回呼中讀取狀態，拿到的卻是舊資料。

---

## 如何診斷與修復 Stale Closure？

當你發現函數內部的變數值「與現實不符」時，通常就是 Stale Closure 在作祟。

1. **檢查依賴關係**：在 React 中，這通常意味著你的 `useEffect` 或 `useCallback` 的依賴陣列（Dependency Array）漏掉了某個變數。
2. **使用參考（Ref）**：如果你需要一個始終指向「最新狀態」的參考，而不希望被 Closure 的快照特性困住，你可以使用物件容器（在 React 中就是 `useRef`）。
  - *JS 原理：* 物件是傳址（Pass by Reference）。即使 Closure 捕獲了該物件容器，只要我們修改物件內部的屬性，Closure 讀取到的內容也會跟著更新。
3. **函數式更新**：當你需要基於舊狀態計算新狀態時，優先使用 `prev => prev + 1` 這種函數形式，而非直接依賴被捕獲的變數。

---

## 總結與連接

在本節中，我們看穿了 Closure 的陰暗面。它雖然是強大的工具，但如果不了解它的「快照」本質，它就會變成難以捉摸的 Bug 來源。

- `**var**`** 迴圈陷阱** 是因為作用域層級太高，導致所有回呼共用一個變數。
- `**let**` 透過自動建立區塊作用域環境，優雅地解決了這個問題。
- **Stale Closure** 提醒我們：函數會記住它「誕生」時的那個世界。如果那個世界後來改變了，函數並不會自動更新它的記憶。

掌握了這些陷阱後，你可能會好奇：既然 Closure 會讓函數一直「記住」外部變數，那這些變數會永遠佔用記憶體嗎？如果我不斷建立 Closure，電腦會不會當機？

下一部分，我們將探討 **Closure 與記憶體管理**，揭開 JavaScript 垃圾回收機制如何與 Closure 進行這場關於「生命週期」的博弈。

## 重點回顧

- `var` 在 `for` 迴圈中會因為 Function Scope 導致異步回調讀取到最終值。
- `let` 透過 Block Scope 為每次迭代提供獨立的環境。
- Closure 捕獲的是變數的「環境參考」，而非執行當下的「數值快照」。
- **Stale Closure** 發生於函數持有舊環境參考，而未能反映最新狀態變動，這也是 React 開發中最核心的除錯難點。
