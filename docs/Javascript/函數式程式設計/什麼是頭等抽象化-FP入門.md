---
date: 2026-08-11T14:43:31.000+08:00
---

# 什麼是「頭等抽象化」？—— 函數式程式設計（FP）入門白話解說

> 給初學者的淺白版本：不用背名詞，看完你就能懂。

## 一句話先講重點

**「頭等抽象化」的意思是：把「函式」當成一般的值來用，就像數字、字串一樣，可以存進變數、當參數傳來傳去、也可以被回傳。**

在 JavaScript 裡，函式是「頭等公民」（first-class citizen），所以我們可以用函式來「包裝、抽象化」重複的邏輯，這就是頭等抽象化的核心。

---

## 先搞懂兩個詞

### 1. 什麼是「抽象化」？

抽象化 = **把重複的細節藏起來，只留下你關心的部分**。

生活例子：你按電梯按鈕就能到樓層，不需要知道馬達怎麼運作。電梯按鈕就是一種「抽象化」。

程式例子：你呼叫 `arr.map(...)`，不需要自己寫 for 迴圈，`map` 幫你把「走訪陣列」這件事藏起來了。

### 2. 什麼是「頭等」（first-class）？

「頭等」是指：**函式享有和其他值（數字、字串、物件）一樣的待遇**，可以：

1. 存進變數
2. 當作參數傳給別的函式
3. 被另一個函式回傳
4. 放進陣列或物件裡

```js
// 1. 存進變數
const sayHi = function () {
  console.log('嗨！');
};

// 2. 當參數傳遞
button.addEventListener('click', sayHi);

// 3. 被回傳
function makeGreeter(name) {
  return function () {
    console.log(`嗨，${name}！`);
  };
}

// 4. 放進陣列
const tasks = [sayHi, makeGreeter('小明')];
```

---

## 頭等抽象化：把「行為」抽出來

一般的抽象化是把「資料」或「流程」包起來；
**頭等抽象化更進一步：連「行為（函式）」本身都可以被抽出來、傳來傳去。**

### 沒有抽象化的寫法（重複又冗長）

```js
// 把每個數字加倍
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}

// 把每個名字轉大寫
const upperNames = [];
for (let i = 0; i < names.length; i++) {
  upperNames.push(names[i].toUpperCase());
}
```

你會發現兩段程式碼長得幾乎一樣，只有「對每個元素做什麼」不同。

### 用頭等抽象化改寫

把「走訪陣列」這個重複流程抽出來，把「要做什麼」用函式傳進去：

```js
const doubled = numbers.map((n) => n * 2);
const upperNames = names.map((name) => name.toUpperCase());
```

`map` 就是頭等抽象化的經典例子：

- `map` 負責「走訪」（藏起來的細節）
- 你傳進去的函式負責「每個元素要怎麼變」（你關心的部分）

---

## 三個你每天都在用的例子

### 1. `filter`：抽象化「篩選」

```js
const adults = users.filter((user) => user.age >= 18);
```

你不用寫 if 判斷 + push，只要說「留下誰」。

### 2. `reduce`:抽象化「累積」

```js
const total = prices.reduce((sum, price) => sum + price, 0);
```

你不用自己維護累加變數，只要說「怎麼累積」。

### 3. 自己寫一個：抽象化「重試」

假設打 API 失敗要重試，這個「重試邏輯」也能抽出來：

```js
async function withRetry(fn, times = 3) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn(); // 成功就回傳
    } catch (err) {
      if (i === times - 1) throw err; // 最後一次還失敗就丟出錯誤
    }
  }
}

// 使用：任何 API 呼叫都能套用重試
const data = await withRetry(() => fetch('/api/users').then((r) => r.json()));
```

`withRetry` 不在乎你打哪支 API，它只負責「重試」這件事。這就是頭等抽象化的威力：**邏輯寫一次，到處重複使用。**

---

## 再進一步：函式回傳函式（高階函式）

能「接收函式」或「回傳函式」的函式，叫做**高階函式（Higher-Order Function）**，它是頭等抽象化最常見的實作方式。

```js
// 建立「乘以某個倍數」的函式工廠
function multiplyBy(factor) {
  return (n) => n * factor;
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

double(10); // 20
triple(10); // 30
```

`multiplyBy` 把「乘法的倍數」抽象化了，你可以隨時製造新的專用函式。

---

## 為什麼 FP 這麼重視頭等抽象化？

1. **減少重複程式碼**：相同流程只寫一次。
2. **好讀**：`users.filter(isAdult)` 一眼就懂在做什麼。
3. **好測試**：小函式各自獨立，容易單獨測試。
4. **好組合**:小函式像積木一樣可以組合成大功能。

```js
const result = orders
  .filter(isPaid)
  .map(toSummary)
  .reduce(sumTotal, 0);
```

這種「像講故事一樣」的程式碼，就是頭等抽象化帶來的成果。

---

## 重點整理

| 概念 | 白話解釋 |
| --- | --- |
| 抽象化 | 把重複細節藏起來，只留你關心的部分 |
| 頭等函式 | 函式可以像一般的值一樣被存放、傳遞、回傳 |
| 頭等抽象化 | 利用頭等函式，把「行為」也抽出來重複使用 |
| 高階函式 | 接收函式或回傳函式的函式（例如 `map`、`filter`） |

**記住一句話：在 FP 裡，函式不只是拿來呼叫的，它本身就是可以搬來搬去的積木。**
