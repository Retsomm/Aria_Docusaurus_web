---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 7 堂：非同步 JavaScript

# 19 Microtask vs Macrotask

在上一節中，我們拆解了 Event Loop 的基本結構，看到非同步任務（如 `setTimeout`）是如何在 Web APIs 完成計時後，進入 Callback Queue 排隊，並最終被推回 Call Stack 執行的。

但你是否遇過這樣的情況：明明 `setTimeout(..., 0)` 和 `Promise.resolve().then(...)` 都標榜著「盡快執行」，但在實際測試中，`Promise` 的內容永遠會比 `setTimeout` 先印出來？

```javascript
setTimeout(() => console.log("巨任務 (Macrotask)"), 0);

Promise.resolve().then(() => console.log("微任務 (Microtask)"));

console.log("同步程式碼");
```

**在執行這段程式碼之前，請你先預測一下輸出的順序。** 為什麼明明 `setTimeout` 寫在前面，而且延遲是 0，卻輸給了 `Promise`？這背後的答案就在於 Event Loop 其實管理的不是一個隊伍，而是兩個不同等級的隊伍：**Macrotask Queue**（巨任務佇列）與 **Microtask Queue**（微任務佇列）。

---

## 任務的分類：誰在什麼隊伍？

在 JavaScript 的非同步世界裡，並非所有的任務都是平等的。瀏覽器將任務分為兩大類，它們被存放在不同的佇列中。

### 1. Macrotask（巨任務 / 宏任務）

這就是我們在上一節提到的 Callback Queue。它通常包含那些比較繁重、或是由宿主環境（瀏覽器或 Node.js）發起的任務。每一輪 Event Loop 循環中，瀏覽器只會從這個佇列中取出一個任務來執行。

常見的 Macrotask 來源包括：

- **`setTimeout` / `setInterval`**：定時器到期後的回呼。
- **I/O**：例如檔案讀取、網路請求回傳的處理。
- **UI Rendering**：瀏覽器的畫面重繪（雖然它有自己的調度邏輯，但在規範中常被視為廣義的巨任務）。
- **事件處理**：例如點擊事件（`onClick`）、滾動事件。
- **`setImmediate`**（僅限 Node.js 或特定環境）。

### 2. Microtask（微任務）

這是我們這一節的主角。微任務通常由 JavaScript 引擎本身發起，用於處理那些「需要緊接在當前執行環境結束後立即處理」的小型邏輯。它的優先級遠高於巨任務。

常見的 Microtask 來源包括：

- **`Promise.then()` / `catch()` / `finally()`**：當 Promise 狀態改變後的處理函式。
- **`queueMicrotask()`**：這是一個標準的 API，讓你明確地將一個任務排入微任務佇列。
- **`MutationObserver`**：用於監聽 DOM 樹變動。
- **`process.nextTick`**（僅限 Node.js，且其優先級甚至比一般的 Microtask 還高，但在瀏覽器環境中我們主要關注前三者）。

---

## 優先級規則：微任務的「插隊」特權

這是理解非同步 JavaScript 最核心的部分。Event Loop 在每一輪輪詢中的新規則可以被精確地描述為以下步驟：

1. **執行一個 Macrotask**：從 Macrotask Queue 中取出最前面的一個任務（通常是當前的 script 本身就是第一個巨任務），放入 Call Stack 執行直到清空 Stack。
2. **清空 Microtask Queue**：這是最關鍵的一步。當一個 Macrotask 結束後，JavaScript 引擎會立即檢查 Microtask Queue。如果裡面有任務，它會**一個接一個地執行，直到整個微任務佇列完全清空為止**。
3. **渲染（Rendering）**：在所有微任務都執行完畢後，瀏覽器會檢查是否需要進行畫面重繪（渲染）。這意味著微任務的更新可以趕在瀏覽器畫下一張圖之前完成。
4. **開始下一輪 Macrotask**：從 Macrotask Queue 中取出下一個任務，重複上述步驟。

### 關鍵差異：單次 vs. 清空

請特別注意這裡的邏輯差異：

- **巨任務隊伍**：每一輪迴圈只執行「一個」。
- **微任務隊伍**：每一輪迴圈會執行「所有」。

這意味著，如果在執行微任務的過程中，你又產生了新的微任務（例如在 `.then()` 裡面又呼叫了另一個 `Promise.then()`），這些新產生的微任務會被直接加入當前的隊伍，並且在同一輪中被執行完。如果你的微任務遞迴地產生微任務，將會導致主執行緒被卡死，瀏覽器永遠無法進入渲染階段，也無法執行下一個巨任務。

---

## 執行順序範例：逐行拆解執行脈絡

讓我們透過一個更複雜的例子來練習，看看你是否能掌握這兩個隊伍的流動。

```javascript
console.log("1. 開始執行主腳本");

setTimeout(() => {
    console.log("2. 巨任務 1 (setTimeout)");
    Promise.resolve().then(() => {
        console.log("3. 巨任務 1 產生出的微任務");
    });
}, 0);

Promise.resolve().then(() => {
    console.log("4. 微任務 A");
}).then(() => {
    console.log("5. 微任務 B");
});

console.log("6. 結束主腳本");
```

### 逐步分析流程：

1. **Call Stack 執行主腳本（本身是一個巨任務）**：
  - 印出 `1. 開始執行主腳本`。
- 碰到 `setTimeout`：將回呼函式交給 Web API，0 秒後將其放入 **Macrotask Queue**。
- 碰到第一個 `Promise.then`：將「微任務 A」放入 **Microtask Queue**。
- 印出 `6. 結束主腳本`。
- *主腳本（當前巨任務）執行完畢，Call Stack 清空。*
2. **清空 Microtask Queue**：
  - 檢查微任務佇列，發現有「微任務 A」，推入 Stack 並印出 `4. 微任務 A`。
- 「微任務 A」結束後，觸發了鏈式的 `.then()`，將「微任務 B」放入 **Microtask Queue**。
- 由於規則是「清空」佇列，引擎繼續取出「微任務 B」，印出 `5. 微任務 B`。
- *Microtask Queue 現在清空了。*
3. **瀏覽器渲染（如果需要）**。
4. **執行下一個 Macrotask**：
  - 從 Macrotask Queue 取出 `setTimeout` 的回呼。
- 印出 `2. 巨任務 1 (setTimeout)`。
- 內部碰到 `Promise.resolve().then`：將其放入 **Microtask Queue**。
- *當前巨任務結束。*
5. **再次檢查並清空 Microtask Queue**：
  - 取出剛剛產生的微任務，印出 `3. 巨任務 1 產生出的微任務`。

**最終輸出結果：**

1. 開始執行主腳本
2. 結束主腳本
3. 微任務 A
4. 微任務 B
5. 巨任務 1 (setTimeout)
6. 巨任務 1 產生出的微任務

這個練習告訴我們：**微任務就像是 VIP 插隊者**。只要有一絲機會（當前同步代碼執行完），它們就會立刻佔領 Call Stack，直到所有 VIP 都處理完畢，才會輪到下一個普通乘客（巨任務）。

---

## 為什麼要有 Microtask？

你可能會想：為什麼要把非同步任務搞得這麼複雜？統一用一個佇列不好嗎？

設計微任務的主要目的有兩個：**效能**與**一致性**。

### 1. 更即時的狀態更新

想像你在開發一個像 React 這樣的框架。當資料更新時，你需要更新 DOM。如果你把更新動作放在 Macrotask（如 `setTimeout`），那麼在資料更新與實際渲染之間，可能會插入其他巨任務（例如使用者的點擊事件、另一個定時器、或是耗時的 I/O），這會導致畫面更新出現明顯的延遲感。

微任務允許我們在「當前工作完成後」與「瀏覽器重新繪製螢幕前」之間，插入一段邏輯。這確保了狀態的變更是連貫的，且對使用者來說是無感的。

### 2. 連結 React 的批次更新（Batching）

這就是 JS 底層原理與 React 設計決策的直接連結。在 React 18 之後的自動批次更新（Automatic Batching），核心概念就與微任務息息相關。

當你在 React 的事件處理器中連續呼叫了三次 `setCount`：

```javascript
const handleClick = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
};
```

React 並不會真的去渲染三次。它會利用微任務的特性，在當前的同步代碼（`handleClick`）執行完後，於微任務階段一次處理掉所有的狀態變更，然後只觸發一次渲染。這大幅提升了效能，而這一切都建立在我們今天討論的 Event Loop 優先級規則之上。

---

## 總結與銜接

在本節中，我們釐清了 Event Loop 運作中最微妙的規則。你應該已經明白，非同步並非「同時執行」，而是「排隊執行」，且微任務擁有絕對的優先發言權。

### 關鍵重點回顧：

- **Macrotask**：包含 `setTimeout`、I/O 等，每輪循環執行一個。
- **Microtask**：包含 Promise 回呼、`queueMicrotask` 等，每輪循環會清空所有，甚至包含新產生的。
- **執行順序**：同步代碼 -> 所有微任務 -> 畫面渲染 -> 下一個巨任務。
- **React 連結**：微任務是 React 實現批次更新、確保 UI 與數據同步的重要機制。

掌握了 Microtask 的時機後，你可能會好奇：那個最常產生微任務的 `Promise` 內部到底是如何運作的？為什麼它能精確地控制狀態？在下一個部分，我們將深入探討 **Promise 的底層原理與狀態機設計**，讓你不再只是會用 `.then`，而是真正理解它內部的靈魂。

在進入下一節前，請思考一下：如果我們在一個 `while(true)` 迴圈裡不斷產生 `Promise.then`，這跟在 `while(true)` 裡不斷產生 `setTimeout`，對網頁畫面的影響會有什麼不同？提示：想一想「清空」與「渲染」的順序。
