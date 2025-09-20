---
title: 語彙環境、作用域鍊、範疇、執行環境
description: 深入了解 JavaScript 的語彙環境、作用域鍊、變數範疇、執行環境等核心概念與運作機制
keywords:
  [
    JavaScript,
    語彙環境,
    作用域鍊,
    範疇,
    執行環境,
    Lexical Environment,
    Scope Chain,
    執行上下文,
    變數範疇,
  ]
---

## 一、語彙環境（Lexical Environment）

概念：

語彙環境指的是 **變數與其值的對應集合**，也就是你在某個範圍內宣告的變數，這些變數會被記錄起來、管理與查找的機制。

結構：

每個語彙環境由兩個部分組成：

1. **環境紀錄器（Environment Record）**：用來實際儲存變數名稱與對應值的資料結構。

2. **外部參照（Outer Lexical Environment Reference）**：指向它的「外層語彙環境」，讓 JS 引擎可以從內往外查找變數（形成作用域鍊）。

---

## 二、作用域鍊（Scope Chain）

概念：

當你要**存取一個變數時，JS 會從目前所在的語彙環境開始，一層一層往外找**，直到找到為止。這整條搜尋路徑就叫作**作用域鍊**。

關聯：

- 每個語彙環境都有一個「外部參照」，多個語彙環境就會串起來，變成一條鍊。

- **Lexical Environment + Outer Reference = Scope Chain 的基礎**。

範例：

```javascript
function outer() {
  let a = 10;
  function inner() {
    console.log(a); // inner 函式的作用域鍊會找到 outer 的語彙環境
  }
  inner();
}
outer();
```

---

## 三、範疇（Scope）

概念：

**範疇就是變數能夠被存取的範圍**。這個範圍根據語法結構來決定，也就是你在哪裡宣告變數，就決定了它的作用範圍。

分類（以 JS 為例）：

1. **全域範疇（Global Scope）**：程式最外層的範圍。

2. **區塊範疇（Block Scope）**：`let`、`const` 有的範疇（例如：`if`, `for`, `{}` 中）。

3. **函式範疇（Function Scope）**：`var` 的作用範圍被限制在函式內。

舉例：

```javascript
let x = 1; // 全域範疇

function test() {
  let y = 2; // 函式範疇
  if (true) {
    let z = 3; // 區塊範疇
  }
}
```

---

## 四、執行環境（Execution Context）

概念：

**每當 JS 開始執行一段程式碼（例如呼叫一個函式），就會建立一個執行環境**，裡面會包含：

- 變數環境（Variable Environment）

- 語彙環境（Lexical Environment）

- this 值

- 作用域鍊

分類：

1. **全域執行環境（Global Execution Context）**：整個程式跑起來的初始環境。

2. **函式執行環境（Function Execution Context）**：函式被呼叫時建立。

3. **Eval 執行環境（Eval Execution Context）**：執行 `eval()` 時會建立（比較少用）。

---

## 總結（比喻說法）

你可以把這四個東西想成一個「辦公室內部管理系統」：

- **範疇（Scope）** → 是「辦公室的空間」，限制每個員工（變數）在哪裡可以走動。

- **語彙環境（Lexical Environment）** → 是「辦公室內的通訊錄」，記錄所有在這個空間工作的員工。

- **作用域鍊（Scope Chain）** → 是「通訊錄往上層請示的順序」，找不到這個人就去上層部門找。

- **執行環境（Execution Context）** → 是「當前你在哪個部門工作」，你所有的操作會在這裡進行，包括存取通訊錄、往外部門請示、決定 `this`。
