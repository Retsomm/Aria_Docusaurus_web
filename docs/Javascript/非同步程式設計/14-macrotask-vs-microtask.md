---
title: Macrotask vs. Microtasks
description: 深入理解 JavaScript 事件迴圈中的 Macrotask 與 Microtask 差異，包含執行優先順序、任務佇列機制與實際應用
keywords:
  [
    JavaScript,
    Macrotask,
    Microtask,
    事件迴圈,
    Event Loop,
    任務佇列,
    執行順序,
    Promise,
    setTimeout,
    非同步,
  ]
---

# **Macrotasks** vs. **Microtasks**

### 1\. **Task Queue (Callback Queue) 與 Macrotasks**

- **定義**：Task Queue 是一個存放 **Macrotasks** 的佇列，這些任務通常是由**瀏覽器**提供的非同步操作所觸發，例如 setTimeout、setInterval、UI 事件（像是點擊、滑鼠移動）等。

- **特點**：

  - Macrotasks 是比較「大」的任務，通常需要等待瀏覽器完成某些操作（例如計時器到期、用戶點擊）。

  - Task Queue 裡的任務會在 **Call Stack（調用堆疊）** 空了之後，才會被 Event Loop 推入 Call Stack 執行。

  - 執行順序：**每個 Macrotask 執行完後，Event Loop 會先檢查是否有 Microtasks 需要執行**，再回來處理下一個 Macrotask。

- **常見的 Macrotasks**：

  - setTimeout

  - setInterval

  - setImmediate（Node.js 環境）

  - UI 事件（例如 click、scroll）

  - HTTP 請求的回調（例如 fetch 的回應處理，雖然通常搭配 Promise）

- **記憶方式**：

  - 把 Macrotasks 想成「**瀏覽器的粗活**」，像是計時器、用戶互動等，這些任務比較「慢」或「大」，需要瀏覽器去處理，然後丟進 Task Queue。

  - 關鍵詞：**「瀏覽器」、「慢」、「大任務」**。

  - 聯想：Macrotasks 就像是「大卡車」，運送的是比較重的貨物（任務），一次只能處理一個。

---

### 2\. **Job Queue (Microtask Queue) 與 Microtasks**

- **定義**：Job Queue 是一個存放 **Microtasks** 的佇列，這些任務通常是由 **V8 引擎**（JavaScript 運行環境）提供的，例如 Promise 的 .then、.catch、.finally 回調，或 MutationObserver 等。

- **特點**：

  - Microtasks 是比較「小」的任務，通常是 JavaScript 引擎內部的操作，執行速度快，優先級高。

  - Job Queue 裡的任務會在 **當前 Macrotask 執行完後立即執行**，而且會把 Job Queue 裡的所有 Microtasks **全部執行完**，才會去處理下一個 Macrotask。

  - Microtasks 的執行是在 **Event Loop 的 Microtask 階段**，優先於 Task Queue。

- **常見的 Microtasks**：

  - Promise.then/catch/finally

  - MutationObserver（用來監聽 DOM 變化）

  - process.nextTick（Node.js 環境）

  - queueMicrotask（手動將任務放入 Microtask Queue）

- **記憶方式**：

  - 把 Microtasks 想成「**引擎的小活**」，像是 Promise 的處理，這些任務比較「快」且「緊急」，由 V8 引擎直接管理。

  - 關鍵詞：**「V8 引擎」、「快」、「小任務」**。

  - 聯想：Microtasks 就像是「小快遞」，送的是輕量、緊急的包裹，必須馬上處理完。

---

### 3\. **Macrotasks 與 Microtasks 的執行順序**

- JavaScript 的 **Event Loop** 是這樣運作的：

  1.  從 **Call Stack** 執行當前任務（同步程式碼）。

  2.  當前 Macrotask 執行完後，檢查 **Job Queue（Microtask Queue）**，把所有 Microtasks 執行完。

  3.  再從 **Task Queue** 取出下一個 Macrotask，推入 Call Stack 執行。

  4.  重複以上步驟。

- **簡單來說**：

  - Microtasks（Job Queue）永遠比 Macrotasks（Task Queue）**優先執行**。

  - 每個 Macrotask 執行完後，Event Loop 會先清空 Job Queue，再去處理下一個 Macrotask。

---

### 4\. **怎麼記住它們的差別？**

以下是幾個記憶技巧，幫助你快速區分 Macrotasks 和 Microtasks：

#### （1）用「大 vs 小」來記

- **Macrotasks**：大任務，來自**瀏覽器**，像是 setTimeout、UI 事件，丟進 **Task Queue**，執行較慢。

- **Microtasks**：小任務，來自 **V8 引擎**，像是 Promise、 MutationObserver，丟進 **Job Queue**，優先執行。

#### （2）用「先後順序」來記

- **先 Microtasks，再 Macrotasks**。

- 聯想：Microtasks 是「急件」，必須先處理完；Macrotasks 是「普通件」，可以等一等。

#### （3）用實際例子記憶

以下是一段程式碼，幫你理解它們的執行順序：

```javascript
console.log("開始");

setTimeout(() => {
  console.log("setTimeout (Macrotask)");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise (Microtask)");
});

console.log("結束");
```

**執行結果**：

```javascript
開始;
結束;
Promise(Microtask);
setTimeout(Macrotask);
```

**為什麼是這個順序？**

1. console.log('開始') 是同步程式碼，立即執行。

2. setTimeout 是 Macrotask，丟進 Task Queue 等待。

3. Promise.then 是 Microtask，丟進 Job Queue。

4. console.log('結束') 是同步程式碼，立即執行。

5. 同步程式碼執行完，檢查 Job Queue，執行 Promise.then（Microtask）。

6. Job Queue 清空後，檢查 Task Queue，執行 setTimeout（Macrotask）。

**記憶技巧**：Promise（Microtask）總是比 setTimeout（Macrotask）先執行，因為 Microtasks 優先級高。

#### （4）用生活情境聯想

- **Task Queue (Macrotasks)**：就像你在咖啡店排隊點餐（大任務），需要等前面的客人點完才能輪到你。

- **Job Queue (Microtasks)**：像是你已經點好餐，但服務員突然說「你的咖啡好了，先拿走」（緊急小任務），你會先處理這個，再繼續排隊。

---

### 5\. **實作練習**

為了讓你更容易操作並記住，以下是一個簡單的練習，幫助你實際體驗 Macrotasks 和 Microtasks 的執行順序：

#### 練習程式碼

請在瀏覽器的開發者工具（F12 開啟 Console）中執行以下程式碼，並觀察輸出結果：

```javascript
console.log("Step 1: 同步程式碼");

setTimeout(() => {
  console.log("Step 2: setTimeout (Macrotask)");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("Step 3: Promise 第一次 then (Microtask)");
  })
  .then(() => {
    console.log("Step 4: Promise 第二次 then (Microtask)");
  });

setTimeout(() => {
  console.log("Step 5: 第二個 setTimeout (Macrotask)");
}, 0);

console.log("Step 6: 同步程式碼結束");
```

**預期輸出**：

```javascript
Step 1: 同步程式碼
Step 6: 同步程式碼結束
Step 3: Promise 第一次 then (Microtask)
Step 4: Promise 第二次 then (Microtask)
Step 2: setTimeout (Macrotask)
Step 5: 第二個 setTimeout (Macrotask)
```

**操作步驟**：

1. 打開瀏覽器（例如 Chrome），按 F12 開啟開發者工具。

2. 點擊 Console 標籤。

3. 將以上程式碼複製貼上，執行。

4. 觀察 Console 輸出的順序，確認 Microtasks（Promise）比 Macrotasks（setTimeout）先執行。

5. 試著修改程式碼，例如加入更多 setTimeout 或 Promise.then，看看順序如何變化。

---

### 6\. **總結與記憶口訣**

- **Task Queue (Macrotasks)**：

  - 來源：**瀏覽器**。

  - 例子：setTimeout、setInterval、UI 事件。

  - 特點：慢、大、等 Microtasks 執行完才輪到。

  - 記憶：**「瀏覽器大卡車，慢悠悠排隊」**。

- **Job Queue (Microtasks)**：

  - 來源：**V8 引擎**。

  - 例子：Promise.then、MutationObserver。

  - 特點：快、小、優先執行。

  - 記憶：**「引擎小快遞，急件優先送」**。

- **執行順序**：同步程式碼 → Microtasks（清空 Job Queue）→ Macrotasks（一個一個從 Task Queue 取）。
