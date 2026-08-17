# 模組系統、資料結構與演算法

涵蓋概念：ES Modules、Data Structures、Algorithms & Big O

---

## 1. ES Modules（ES 模組系統）

ESM（`import`/`export`）是現代 JS 標準模組系統，取代舊的 CommonJS（`require`/`module.exports`）。

### 為什麼業界轉向 ESM？

**① Tree Shaking（搖樹優化）**：因為 `import`/`export` 必須寫在檔案最外層（靜態），打包工具能在執行前就分析出「哪些沒被用到」，自動移除，減少檔案體積。CommonJS 的 `require` 可以動態寫在任何地方，無法有效做到這件事。

**② Live Bindings**：匯入的值跟原始檔案保持連動，不是複製一份靜態快照。

```javascript
// counter.js
export let count = 0;
export const increment = () => count++;

// main.js
import { count, increment } from "./counter.js";
increment();
console.log(count); // 1，自動跟著原始檔案更新
```

**③ 瀏覽器原生支援**：`<script type="module">` 可以直接執行 ESM，不需要打包工具。

### Top-level await

```javascript
// config.js
const response = await fetch("/api/config"); // 不用包在 async 函式裡
export const config = await response.json();
```

---

## 2. Data Structures（資料結構）

### 內建資料結構

```javascript
// Array：有順序，索引存取快，中間插入/刪除較慢
// Object：鍵值對應，key 可以是字串或 Symbol

// Map：更嚴謹的鍵值對應，可用任何型別當 key，保證插入順序
const userMap = new Map();
userMap.set("name", "小明");
console.log(userMap.size); // 直接有 size 屬性

// Set：只存不重複的值
const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)]; // [1, 2, 3] ← 業界標準去重複寫法
```

### 自己實作的資料結構

```javascript
// Stack（堆疊，後進先出）：瀏覽器上一頁、復原功能
class Stack {
  #items = [];
  push = (item) => this.#items.push(item);
  pop = () => this.#items.pop(); // 拿走最上面的
}

// Queue（佇列，先進先出）：任務排程、訊息佇列（呼應 Event Loop 的 Task Queue）
// 用 head 指標記錄目前佇列開頭，避免 Array.shift()（O(n)，要搬移所有元素）
class Queue {
  #items = [];
  #head = 0;
  enqueue = (item) => this.#items.push(item);
  dequeue = () => {
    if (this.#head >= this.#items.length) return undefined;
    const item = this.#items[this.#head];
    this.#items[this.#head] = undefined;
    this.#head++;
    return item; // enqueue/dequeue 都是攤銷 O(1)
  };
}
```

### 何時用哪種資料結構

| 資料結構 | 適合情境 |
|---|---|
| Array | 有順序的清單 |
| Object | 簡單鍵值對應 |
| Map | 用物件當 key、需保證順序 |
| Set | 需要不重複值 |
| Stack / Queue | 後進先出 / 先進先出的流程控制 |

---

## 3. Algorithms & Big O（演算法與時間複雜度）

Big O 描述「資料量變大時，效能變慢的趨勢」，由快到慢：`O(1)` > `O(log n)` > `O(n)` > `O(n log n)` > `O(n²)`

```javascript
arr[2];                 // O(1) 索引存取
arr.includes(3);        // O(n) 要逐一檢查
arr.map((x) => x * 2);  // O(n)

// 巢狀迴圈通常是 O(n²)，資料量一大就是效能瓶頸
const hasDuplicates = (arr) => {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
};
```

### 優化技巧：用 Set/Map 把查找降到 O(1)

```javascript
// O(n²)：巢狀迴圈找共同元素
const findCommon = (a, b) => a.filter((x) => b.includes(x));

// O(n)：Set.has() 是 O(1)
const findCommonFast = (a, b) => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};
```

**經典面試題 Two Sum：**

```javascript
// O(n)：用 Map 記錄看過的數字，一次遍歷解決
const twoSum = (nums, target) => {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
};
```

> 排序演算法原理知道就好，實務上直接用內建的 `sort()`（規範沒有保證時間複雜度，但主流引擎通常採用 O(n log n) 等級的演算法，已高度優化），不用自己手刻。

---

## 本篇總結

- ESM 靜態的 import/export 讓 Tree Shaking 成為可能，是現代打包工具優化的基礎
- `[...new Set(arr)]` 是陣列去重複的業界標準寫法
- Stack（後進先出）、Queue（先進先出）是理解瀏覽器歷史紀錄、任務排程的基礎概念
- 看到巢狀迴圈在做「查找/比對」，第一個該想到的優化方向就是改用 `Set`/`Map` 把 O(n) 降到 O(1)
