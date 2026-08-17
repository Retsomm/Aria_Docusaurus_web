# 函數式程式設計

涵蓋概念：Higher-Order Functions、Pure Functions、map/reduce/filter、Recursion、Currying & Composition

---

## 1. Higher-Order Functions（高階函式）

符合以下任一條件即為高階函式：**① 接收函式當參數**，**② 回傳一個函式**。

```javascript
[1, 2, 3].map((n) => n * 2);   // map 接收函式當參數 → 高階函式
array.filter((n) => n > 5);
array.sort((a, b) => a - b);

// 回傳函式：常搭配閉包
function multiplyBy(factor) {
  return (num) => num * factor;
}
const double = multiplyBy(2);
```

**實戰應用：debounce**

```javascript
const debounce = (fn, delay) => {
  let timer;
  return function (...args) {
    const context = this; // 保留呼叫當下的 this
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context, args), delay);
  };
};
```

核心價值：把重複的骨架邏輯（跑迴圈）跟每次不同的細節邏輯分開，減少重複程式碼。

---

## 2. Pure Functions（純函式）

必須同時符合：**① 相同輸入永遠得到相同輸出**，**② 沒有副作用（不改外部變數、不改傳入的參數、不碰 DOM）**。

```javascript
// 純函式
const add = (a, b) => a + b;

// 不純：依賴外部狀態
function getGreeting() {
  return new Date().getHours() < 12 ? "早安" : "午安";
}

// 不純：直接修改傳入的參數
function addItem(cart, item) { cart.push(item); return cart; }

// 純函式版本：回傳新的複製品，不修改原本的
function addItem2(cart, item) { return [...cart, item]; }
```

> **React 的核心哲學建立在純函式與不可變性上**：不要直接改 state，要回傳新的物件/陣列，否則 React 可能誤判「資料沒變」而不重新渲染。

純函式的價值：容易預測、容易測試（不用準備環境，丟輸入檢查輸出就好）。

---

## 3. map, reduce, filter

```javascript
const withTax = prices.map((price) => price * 1.05);      // 轉換，長度不變
const bigNumbers = numbers.filter((n) => n > 8);            // 篩選，長度可能變短
const sum = numbers.reduce((acc, cur) => acc + cur, 0);     // 壓縮成一個結果
```

`reduce` 的 `accumulator` 像滾雪球：每一輪把「目前雪球」跟「這輪元素」結合，變成新雪球交給下一輪。

**reduce 進階應用：**

```javascript
// 陣列變物件
const userMap = users.reduce((acc, u) => { acc[u.id] = u.name; return acc; }, {});

// 計算出現次數
const countMap = fruits.reduce((acc, f) => { acc[f] = (acc[f] || 0) + 1; return acc; }, {});
```

**方法鏈接（前端資料處理超常見）：**

```javascript
const totalPaid = orders
  .filter((o) => o.paid)
  .map((o) => o.price)
  .reduce((sum, p) => sum + p, 0);
```

`reduce` 一律建議提供初始值，空陣列不給初始值會直接報錯。

---

## 4. Recursion（遞迴）

函式呼叫自己，一定要有 **Base Case（停止條件）** 跟 **Recursive Case（讓問題變小的呼叫）**。

```javascript
const factorial = (n) => {
  if (n <= 1) return 1;        // Base Case
  return n * factorial(n - 1);  // Recursive Case
};
```

**最適合場景：巢狀深度不固定**（留言串、檔案總管、組織圖）

```javascript
const countAllComments = (list) =>
  list.reduce((count, c) => count + 1 + countAllComments(c.replies), 0);

// 陣列扁平化
const flatten = (arr) => arr.reduce((flat, item) => {
  if (Array.isArray(item)) flat.push(...flatten(item));
  else flat.push(item);
  return flat;
}, []);
// 現代 JS 內建：arr.flat(Infinity)
```

忘記寫 Base Case，或問題沒有變小 → 堆疊溢位（回顧 Call Stack）。

**記憶化解決重複計算：**

```javascript
const fibMemo = (n, memo = {}) => {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
};
```

---

## 5. Currying & Composition

### Currying：一次只接收一個參數

```javascript
const addCurried = (a) => (b) => (c) => a + b + c;
const multiply = (a) => (b) => a * b;
const double = multiply(2); // 「固定」第一個參數，做出專用工具函式
```

### Composition：把多個小函式串接成生產線

```javascript
const pipe = (...fns) => (initialValue) =>
  fns.reduce((acc, fn) => fn(acc), initialValue);

const process = pipe(trim, toLowerCase, capitalize);
console.log(process("  hello WORLD  ")); // "Hello world"
```

`pipe`（由左到右）比 `compose`（由右到左）更符合閱讀直覺，前端更常用 `pipe`。

---

## 本篇總結

- 高階函式：接收或回傳函式，`map`/`filter`/`sort` 都是天天在用的例子
- 純函式 = 輸入輸出固定 + 無副作用，是 React 不可變性哲學的基礎
- `map`（轉換）、`filter`（篩選）、`reduce`（壓縮）三者可以串接組合，讀起來像一句自然說明文
- 遞迴最適合處理「深度不固定」的巢狀結構，記得寫 Base Case
- Currying 做出專用工具函式，Composition 把小函式串成處理流程，兩者常一起搭配使用
