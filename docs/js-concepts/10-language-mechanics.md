# 語言機制細節：Hoisting、TDZ、嚴格模式、型別細節

涵蓋概念：Hoisting、Temporal Dead Zone、Strict Mode、JavaScript Type Nuances

---

## 1. Hoisting（提升）

JS 引擎執行前，會先把「宣告」提升到作用域最上面。

```javascript
console.log(myVar); // undefined（不報錯，但容易誤導）
var myVar = "小明";

console.log(myLet); // ReferenceError（let/const 會進入 TDZ，見下節）
let myLet = "小華";

sayHi(); // 可以先呼叫再定義
function sayHi() { console.log("哈囉"); }

sayHello(); // TypeError：sayHello is not a function
var sayHello = () => console.log("哈囉");
// 函式表達式只有變數宣告被提升，賦值不會，這跟 function 宣告完全不同
```

---

## 2. Temporal Dead Zone（暫時死區）

`let`/`const`/`class` 雖然有被提升，但會進入「暫時死區」，從作用域開始到真正宣告那行執行完之前，完全不能被存取：

```javascript
{
  console.log(myVar); // ReferenceError: Cannot access before initialization
  let myVar = "test";
}

console.log(typeof myLet); // 連平常安全的 typeof 也躲不過 TDZ！
let myLet = "test";
```

> 這是刻意的保護機制：與其給你一個容易誤導的 `undefined`，不如直接明確報錯，讓問題盡早浮現（Fail Fast）。

---

## 3. Strict Mode（嚴格模式）

**重要現況：ES Modules（`import`/`export`）跟 `class` 內部自動就是嚴格模式**，現代前端開發幾乎不用手動加 `"use strict"`。

```javascript
"use strict";
function setName() {
  userName = "小明"; // ReferenceError（非嚴格模式下會默默變成全域變數，很危險）
}

function showThis() { console.log(this); } // undefined（嚴格模式）vs window（非嚴格模式）
```

呼應：在嚴格模式下（ESM/class 內部自動如此）一般函式呼叫時 `this` 預設是 `undefined`；傳統非嚴格模式的瀏覽器腳本則會綁定成 `window`。

其他被擋下的可疑寫法：禁止重複參數名稱、禁止對變數用 `delete`。

---

## 4. JavaScript Type Nuances（型別細節）

### null vs undefined

```javascript
let notAssigned;              // undefined：系統自然產生的空
let empty = null;              // null：開發者刻意表達的空
```

### 短路求值

```javascript
"" || "預設值";      // "預設值"（|| 遇到第一個 truthy 就停）
true && "hello";     // "hello"（&& 遇到第一個 falsy 就停）

// React 條件渲染的原理
{isLoggedIn && <div>歡迎回來</div>}
```

### typeof 與 instanceof

```javascript
typeof [];            // "object" ← 陣列也是 object！判斷要用 Array.isArray()
typeof function(){};  // "function"

class Robot {}
const r = new Robot();
r instanceof Robot;    // true，透過原型鏈判斷是否為該類別的實例
```

### Symbol：獨一無二

```javascript
Symbol("id") === Symbol("id"); // false，永遠不同
```

### BigInt：處理超大數字

```javascript
9007199254740991n + 2n; // 精確運算，一般 number 超過 MAX_SAFE_INTEGER 會失準
10n + 5;  // 不能跟一般 number 混合運算
```

---

## 本篇總結

- `var` 提升賦值不提升 → `undefined`；`let`/`const` 提升但進 TDZ → 直接報錯，這是刻意的保護設計
- 現代 ESM/Class 環境自動是嚴格模式，理解它有助於解釋很多「為什麼」（例如 this 預設值）
- `null` = 刻意的空，`undefined` = 自然的空；`typeof []` 是 `"object"`，判斷陣列要用 `Array.isArray()`
- `&&`/`||` 短路求值是 React 條件渲染的底層原理
