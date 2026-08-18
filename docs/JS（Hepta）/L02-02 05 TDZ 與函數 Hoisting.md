---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 2 堂：Hoisting 到 Closure

# 05 TDZ 與函數 Hoisting

想像你在一家高級餐廳用餐，服務生還沒把菜單遞給你，你就憑直覺大喊：「我要一份牛肉麵！」

如果這家餐廳運行的是 `var` 邏輯，服務生會淡定地說：「好的，我知道你想點餐，但我現在還不知道那是什麼（`undefined`），請稍等。」

但如果這家餐廳運行的是 `let` 或 `const` 的現代邏輯，服務生會嚴肅地制止你：「抱歉，在我正式把菜單交到你手上之前，你不准點餐，甚至連提都不准提！」這就是為什麼當你試圖在 `let` 宣告前存取變數時，JavaScript 會毫不留情地拋出 `ReferenceError`。這種「不准提」的禁區，就是我們今天要深入探討的**暫時性死區（Temporal Dead Zone, TDZ）**。

## 暫時性死區（TDZ）的底層真相

在上一部分我們看到，`var` 宣告的變數在執行環境（Execution Context）的**建立階段（Creation Phase）**會被掃描並初始化為 `undefined`。這讓它在程式碼真正執行到那一行之前就能被存取。

然而，ES6 引入的 `let` 與 `const` 改變了遊戲規則。它們雖然也會在「建立階段」被 JavaScript 引擎掃描到，並存入執行環境的**詞法環境（Lexical Environment）**中，但兩者的關鍵差異在於**初始化（Initialization）**的時機。

### 從「未初始化」到「初始化」

當 JavaScript 引擎進入建立階段時，它會為 `let` 和 `const` 宣告的變數在記憶體中保留位置（這證明了它們其實也會被「提升」），但引擎會將這些變數標記為 **「未初始化」（Uninitialized）**。

- **var 的行為**：建立階段 → 發現變數 → 在記憶體分配空間 → **自動初始化為 `undefined`**。
- **let / const 的行為**：建立階段 → 發現變數 → 在記憶體分配空間 → **保持「未初始化」狀態**。

所謂的 **暫時性死區（TDZ）**，指的就是從「進入作用域（建立階段）」開始，直到「執行到變數宣告那一行（執行階段）」為止的這段區域。在這段區域內，由於變數尚未完成初始化，任何存取該變數的嘗試都會導致瀏覽器報錯：`Uncaught ReferenceError: Cannot access 'x' before initialization`。

### 為什麼這是一個設計上的「進步」？

你可能會覺得 `var` 的行為比較寬容，為什麼 JS 要設計一個會讓程式崩潰的 TDZ？

事實上，TDZ 是為了幫助開發者寫出更健壯、更易於維護的程式碼。在 `var` 的年代，我們經常會不小心在變數宣告前就使用了它，導致程式出現難以追蹤的 `undefined` 錯誤（邏輯錯誤通常比語法錯誤更難除）。

TDZ 強迫開發者遵循**「先宣告，後使用」**的良好習慣。這是一種「早期崩潰（Fail Fast）」的設計哲學：如果你的邏輯有問題，與其讓它帶著 `undefined` 繼續跑下去產生錯誤結果，不如直接在開發階段就報錯讓你修復。

## 函數宣告：最高等級的提升

如果說 `var` 是「先記下名字，不給內容」，那麼**函數宣告（Function Declaration）**就是 JavaScript 中的特權階級。

當執行環境進入建立階段時，JavaScript 引擎如果掃描到一個函數宣告，它不僅會分配記憶體，還會**直接在建立階段就把整個函數物件建立起來，並將變數名稱指向該物件**。

這就是為什麼你可以在定義函數之前就呼叫它：

```javascript
sayHello(); // 輸出: "Hello!"

function sayHello() {
  console.log("Hello!");
}
```

在建立階段，`sayHello` 就已經是一個完整的函數，而不是 `undefined` 或「未初始化」。這種行為被稱為**函數提升（Function Hoisting）**，它是提升機制中最徹底的一種。

### 為什麼 React 開發者很少感受到這種「特權」？

雖然函數宣告有這種特權，但在現代 React 開發中，我們幾乎全面採用了**箭頭函數（Arrow Functions）**。這引出了一個非常重要的觀念：並不是所有叫「函數」的東西都會這樣提升。

## 函數表達式與箭頭函數的 Hoisting 行為

在 JavaScript 中，如果你將一個函數賦值給一個變數，這被稱為**函數表達式（Function Expression）**。在 React 裡，我們寫的元件通常長這樣：

```javascript
const MyComponent = () => {
  return <div>Hello</div>;
};
```

這種寫法的 Hoisting 行為**完全取決於你使用哪個關鍵字來宣告變數**（`var`、`let` 還是 `const`），而不是取決於它是不是函數。

### 1. 使用 var 的函數表達式

```javascript
printMessage(); // TypeError: printMessage is not a function

var printMessage = function() {
  console.log("Secret Message");
};
```

這裡會報錯 `TypeError` 而不是 `ReferenceError`。為什麼？因為在建立階段，`var printMessage` 被初始化為 `undefined`。當執行階段呼叫 `printMessage()` 時，你實際上是在嘗試執行 `undefined()`，而 `undefined` 不是一個函數。

### 2. 使用 const/let 的箭頭函數（React 常見模式）

```javascript
renderApp(); // ReferenceError: Cannot access 'renderApp' before initialization

const renderApp = () => {
  console.log("App Rendering...");
};
```

這就是為什麼在 React 專案中，如果你在宣告元件之前就試圖使用它（例如在檔案頂部呼叫某個還沒寫出來的 Helper 箭頭函數），你會直接撞上 TDZ。這再次證明了 `const` 宣告的箭頭函數遵循的是 `let/const` 的 Hoisting 規則，它們在宣告執行到之前都處於「未初始化」狀態。

## 綜合練習：拆解執行前的狀態差異

為了徹底掌握這些概念，我們來看一個綜合範例，並嘗試模擬 JavaScript 引擎在**建立階段（Creation Phase）**是如何處理這些宣告的。

### 程式碼範例

```javascript
console.log(username);     // A
console.log(getAge);       // B
greet();                   // C
console.log(isLoggedIn);   // D

var username = "Alice";

function greet() {
  console.log("Hi there!");
}

var getAge = function() {
  return 25;
};

let isLoggedIn = true;
```

### 建立階段的內部狀態

當這段程式碼載入時，JavaScript 引擎會先掃描一遍，並在環境中建立以下對應關係：

| 識別符 (Identifier) | 儲存環境 | 初始狀態 | 類型 |
| --- | --- | --- | --- |
| `username` | Variable Environment | `undefined` | `var` 變數 |
| `greet` | Lexical Environment | `[Function: greet]` | **函數宣告 (完整提升)** |
| `getAge` | Variable Environment | `undefined` | `var` 變數 (函數表達式) |
| `isLoggedIn` | Lexical Environment | `<uninitialized>` | `let` 變數 (**處於 TDZ**) |

### 執行階段的預測與解析

1. **行 A (**`**console.log(username)**`**)**：尋找 `username`。在環境中已存在且為 `undefined`。**輸出：`undefined`**。
2. **行 B (**`**console.log(getAge)**`**)**：尋找 `getAge`。在環境中已存在且為 `undefined`（因為它是用 `var` 宣告的表達式）。**輸出：`undefined`**。
3. **行 C (**`**greet()**`**)**：尋找 `greet`。在環境中已存在且是一個完整的函數。**輸出：執行函數，印出 "Hi there!"**。
4. **行 D (**`**console.log(isLoggedIn)**`**)**：尋找 `isLoggedIn`。在環境中雖然有名稱，但標記為 `<uninitialized>`。**結果：拋出 `ReferenceError: Cannot access 'isLoggedIn' before initialization`**。

這個例子清晰地展示了：為什麼函數宣告可以在任何地方呼叫，而 `const` 的箭頭函數必須先定義再使用。

## 總結與連結

理解了 `let`、`const` 的 TDZ 機制以及函數提升的差異後，你已經掌握了 JavaScript 執行環境中最令人困惑的部分之一。我們不再將「提升」視為程式碼神祕地搬移到頂端，而是理解這其實是執行環境在「建立階段」與「執行階段」分工合作的結果。

- **var**：建立時初始化為 `undefined`，容許混亂但可能帶來 bug。
- **let / const**：建立時不初始化，產生 TDZ，強迫嚴謹的程式碼結構。
- **函數宣告**：建立時完整初始化，提供最大的呼叫彈性。
- **箭頭函數**：本質是變數賦值，權限與 `const / let` 一致。

掌握了這些底層行為，你現在已經具備了手動追蹤複雜程式碼的能力。在下一部分中，我們將進行一個深度的「執行脈絡追蹤練習」。我們將模擬 JavaScript 引擎，一步步拆解含有多層嵌套函數、多種變數宣告的程式碼，看看這些 EC（執行環境）是如何在 Call Stack 中推疊、變數是如何在 Scope Chain 中被找到，以及 Hoisting 是如何在每一層發揮影響的。這將會是你邁向高級前端工程師、讀懂 React 原始碼邏輯的關鍵一步。
