# JS 基礎入門：型別、作用域與呼叫堆疊

涵蓋概念：Primitive Types、Primitives vs Objects、Type Coercion、Equality Operators、Scope and Closures、Call Stack

---

## 1. Primitive Types（原始型別）

JavaScript 有 7 種原始型別，可以想成 7 種「寫著內容的紙條」，紙條本身很單純，拿到的就是值本身：

| 型別 | 說明 | 範例 |
|---|---|---|
| `string` | 文字 | `"你好"` |
| `number` | 數字 | `42`、`3.14` |
| `bigint` | 超大數字 | `123n` |
| `boolean` | 真假值 | `true`、`false` |
| `undefined` | 尚未賦值 | `undefined` |
| `null` | 刻意留空 | `null` |
| `symbol` | 獨一無二的值 | `Symbol("id")` |

```javascript
let name = "小明";
console.log(typeof name);      // "string"
console.log(typeof null);      // "object" ← 這是 JS 從 1995 年留下來的已知 bug，不會被修正
```

原始型別的關鍵特性是**不可變（Immutable）**：紙條上的字一旦寫了就不能修改，只能換一張新紙條。

---

## 2. Primitives vs Objects（原始型別 vs 物件）

- **原始型別**：一張紙條，複製時複製「內容」，兩份各自獨立
- **物件**：一把置物櫃鑰匙，複製時複製的是「鑰匙」，兩個變數指向同一個櫃子（這叫 call by sharing）

```javascript
let a = 10;
let b = a;
b = 20;
console.log(a); // 10，完全不受影響

let cat = { name: "小花" };
let sameCat = cat;       // 複製的是「鑰匙」
sameCat.name = "小白";
console.log(cat.name);   // "小白" ← 也被改了！因為兩者是同一個櫃子
```

**前端實戰地雷（React/Vue 狀態管理）：**

```javascript
// 錯誤：以為這樣是複製一份新的
let state = { count: 0 };
let newState = state;
newState.count = 1;
console.log(state.count); // 1，其實根本沒複製到

// 正確：用展開運算子真正複製
let newState2 = { ...state };
newState2.count = 1;
console.log(state.count); // 0，這次才是獨立的
```

---

## 3. Type Coercion（型別轉換）

JavaScript 會自動幫你把值轉換成需要的型別：

```javascript
console.log(1 + "2");      // "12"  ← 遇到字串，全部轉字串
console.log("10" - 5);     // 5     ← 遇到 - * /，全部轉數字
console.log("abc" - 5);    // NaN
```

### 8 個 Falsy Value（一定要背起來）

```javascript
Boolean(false);      // false
Boolean(0);          // false
Boolean(-0);         // false
Boolean(0n);         // false
Boolean("");         // false
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
// 除了這 8 個，其他一律是 true，包括 "0"、[]、{}
```

**表單驗證地雷：**

```javascript
let inputValue = "0"; // 使用者輸入字串 "0"
if (inputValue) {
  console.log("有輸入資料"); // 會印出這行！因為 "0" 是 truthy
}
```

---

## 4. Equality Operators（== vs ===）

- `==`：先自動轉型別再比較（不建議使用）
- `===`：不轉型別，型別不同直接判不相等（**業界標準做法**）

```javascript
console.log(1 == "1");    // true
console.log(1 === "1");   // false ← 永遠優先使用這個

console.log(NaN === NaN); // false！用 Number.isNaN(NaN) 才是 true
console.log(null == undefined);  // true（特例）
```

`Object.is()` 修正了 `===` 的兩個特例：`Object.is(NaN, NaN)` 是 `true`，`Object.is(0, -0)` 是 `false`。

---

## 5. Scope and Closures（作用域與閉包）

### 作用域：全域 → 函式 → 區塊

```javascript
let globalVar = "院子";
function room() {
  let roomVar = "房間"; // 只有這個函式內部看得到
}
if (true) {
  let drawerVar = "抽屜"; // 只有這個 { } 區塊內看得到
}
```

| 關鍵字 | 作用域 | 可重新賦值 | 建議 |
|---|---|---|---|
| `var` | 函式作用域，不理會 `{ }` | 是 | 不建議使用 |
| `let` | 區塊作用域 | 是 | 需要改變值時用 |
| `const` | 區塊作用域 | 否 | 預設優先使用 |

### 閉包：函式會「記住並帶走」外層的變數

```javascript
function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2 ← 即使 makeCounter 執行完了，count 依然被記住
```

**資料隱私應用：**

```javascript
function createBankAccount() {
  let balance = 1000; // 外部完全碰不到
  return {
    deposit: (amount) => (balance += amount),
    getBalance: () => balance
  };
}
```

**經典地雷：for 迴圈 + setTimeout**

```javascript
// var：全部共用同一個 i，1 秒後印出 4, 4, 4
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}

// let：每輪迴圈產生全新的 i，印出 1, 2, 3
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
```

---

## 6. Call Stack（呼叫堆疊）

JS 用「疊盤子」的方式（LIFO，後進先出）管理函式執行順序：

```javascript
function first() { console.log("first"); second(); }
function second() { console.log("second"); third(); }
function third() { console.log("third"); }
first();
// 疊上去：[first] → [first, second] → [first, second, third]
// 拿下來：third 先做完 → second → first
```

**報錯的 Stack Trace** 就是把當下疊起來的盤子攤開給你看，從最上面開始讀，通常錯誤根源就在那裡。

**Stack Overflow（堆疊溢位）：**

```javascript
function infiniteLoop() {
  infiniteLoop(); // 沒有終止條件
}
infiniteLoop();
// RangeError: Maximum call stack size exceeded
```

---

## 本篇總結

- 原始型別不可變、物件是共享參照，這個差異貫穿整個 JavaScript
- `===` 永遠優先於 `==`，並記住 8 個 falsy value
- `const` > `let` > `var`（優先順序），善用區塊作用域避免 bug
- 閉包 = 函式記住外層變數，是資料隱私、高階函式的基礎
- Call Stack 是理解錯誤堆疊、遞迴、非同步機制的起點
