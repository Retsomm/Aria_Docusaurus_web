---
title: JS運算子的相依性與優先性
description: 深入了解 JavaScript 運算子的優先性和相依性，包含運算順序、結合性、運算子優先級表等重要概念
keywords:
  [
    JavaScript,
    運算子,
    運算子優先性,
    運算子相依性,
    運算順序,
    結合性,
    運算子優先級,
    表達式,
    運算規則,
  ]
---

## 運算子的優先性（Precedence）

**優先性**是指在一個表達式中，哪些運算子會先被執行，哪些會後執行。\
舉例來說：

```
3 + 4 * 5
```

因為乘法 (`*`) 的優先性比加法 (`+`) 高，所以會先算 `4 * 5`，結果是 `20`，再加上 `3`，最後答案是 `23`。

- 簡單說就是：優先性高的運算子先算。

---

## 運算子的相依性（Associativity）

**相依性**是指當運算子優先性相同時，運算的順序是從左往右還是從右往左。

- **左相依（Left-to-right associativity）**：同優先性的運算子從左邊開始算。

- **右相依（Right-to-left associativity）**：同優先性的運算子從右邊開始算。

---

範例說明：

#### 左相依（左結合）

```
5 - 3 - 1
```

這裡減號的優先性一樣，且是左相依，代表會先算 `5 - 3 = 2`，再算 `2 - 1 = 1`，所以答案是 `1`。

---

#### 右相依（右結合）

```
a = b = 5;
```

賦值運算子 `=` 是右相依的，代表會先算 `b = 5`，再把 `b` 的結果賦值給 `a`，所以兩個變數都會是 5。

---

## JavaScript 運算子優先性與相依性參考表（簡化版）

| 運算子                             | 說明           | 優先性（越大越優先） | 相依性 |
| ---------------------------------- | -------------- | -------------------- | ------ |
| `()`                               | 小括號（群組） | 21                   | 無     |
| `++`（後置）                       | 後置遞增       | 20                   | 左到右 |
| `--`（後置）                       | 後置遞減       | 20                   | 左到右 |
| `++`（前置）                       | 前置遞增       | 19                   | 右到左 |
| `--`（前置）                       | 前置遞減       | 19                   | 右到左 |
| `!`、`~`、`+`（正號）、`-`（負號） | 一元運算子     | 19                   | 右到左 |
| `*`、`/`、`%`                      | 乘、除、餘數   | 17                   | 左到右 |
| `+`、`-`                           | 加、減         | 16                   | 左到右 |
| `<`、`<=`、`>`、`>=`               | 比較大小       | 13                   | 左到右 |
| `==`、`!=`、`===`、`!==`           | 等於、不等於   | 12                   | 左到右 |
| `&&`                               | 邏輯且         | 6                    | 左到右 |
| \`                                 |                | \`                   | 邏輯或 |
| `=`、`+=`、`-=` 等                 | 賦值運算子     | 3                    | 右到左 |
| `,`（逗號運算子）                  | 逗號運算子     | 2                    | 左到右 |

---

重點總結

- 優先性決定哪個運算子先執行

- 相依性決定優先性相同的運算子要從左邊開始執行還是右邊開始執行

---

小範例測試：

```javascript
console.log(5 - 3 - 1); // 1，左相依，從左往右
console.log((a = b = 5)); // 5，右相依，從右往左
console.log(2 + 3 * 4); // 14，乘法優先於加法
console.log(++x + x++); // 會依序先執行前置遞增，再執行加法，再執行後置遞增
```

---

# 在實際程式中怎麼避免因優先性與相依性導致的錯誤

這是一個很實用的問題！在實際寫 JavaScript 程式時，因為運算子的優先性與相依性有時候比較複雜，不小心就會造成邏輯錯誤或是不易閱讀的程式碼。以下是幾個實務上常用的「避免優先性與相依性錯誤」的技巧，並附上說明與範例：

---

## 1\. 多用小括號（`()`）來明確運算順序

- 用括號把想先算的部分包起來，讓運算順序一目了然，避免自己或別人誤解優先性。

- 小括號優先性最高，會優先執行。

範例：

```javascript
// 可能會搞錯的寫法
let result = 10 + 5 * 2; // 10 + (5 * 2) = 20
// 明確寫法
let result = 10 + 5 * 2; // 20
```

當運算式複雜時，加上括號讓邏輯更清楚：

```javascript
let x = 5;
let y = 10;
let z = 15;
// 複雜運算
let result = (x + y) * z; // 先加再乘
```

---

## 2\. 避免在同一行中混合使用多個相依性不同的運算子

例如賦值（`=`）是右相依，減法是左相依，混用時容易誤會。

範例：

```javascript
// 不建議這樣寫，容易看錯
let a = (b = c = 5);
// 建議拆開寫
c = 5;
b = c;
a = b;
```

---

## 3\. 避免在同一表達式中使用遞增（`++`）或遞減（`--`）等副作用運算子

這類運算子有前置和後置兩種形式，優先性高但易引起理解困難，且副作用會在執行後影響變數值。

範例：

```javascript
let i = 1;
let result = i++ + ++i; // 不建議，結果不好預測，也不好讀
// 建議拆開
let i = 1;
let a = i++; // a = 1, i = 2
let b = ++i; // i 先加 1 變 3，b = 3
let result = a + b; // 1 + 3 = 4
```

---

## 4\. 多行拆解複雜運算

如果一行寫不清楚，盡量拆成多行，分段計算，方便除錯與閱讀。

範例：

```javascript
// 不推薦
let result = ((a + b) * (c - d)) / e;
// 拆成多行
let sum = a + b;
let diff = c - d;
let result = (sum * diff) / e;
```

---

## 5\. 了解並善用程式碼風格工具（如 ESLint）

- ESLint 可以幫你檢查可能的優先性錯誤，或強制你加括號的規則（`no-mixed-operators`）。

- 這樣可降低因混淆優先性造成的錯誤。

---

## 6\. 針對賦值連鎖運算，慎用或拆解

```javascript
// 不建議連鎖賦值
let a = (b = c = 10);
// 建議分開寫
c = 10;
b = c;
a = b;
```

---

總結

| 技巧                            | 目的/說明                  |
| ------------------------------- | -------------------------- |
| 多用小括號                      | 明確運算順序，避免誤解     |
| 避免混用不同相依性的運算子      | 降低理解困難和錯誤         |
| 避免同一表達式中使用前/後置遞增 | 避免副作用混亂，易讀易維護 |
| 複雜運算拆成多行                | 提高程式可讀性與維護性     |
| 使用 ESLint 等工具              | 自動提醒潛在優先性問題     |
| 拆解連鎖賦值                    | 降低因相依性造成的誤會     |
