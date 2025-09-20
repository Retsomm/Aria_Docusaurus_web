---
title: 「&&」AND 和「||」OR  運算子
description: 深入了解 JavaScript 邏輯運算子 AND（&&）和 OR（||）的使用方法，包含短路求值、實際應用與常見陷阱
keywords:
  [
    JavaScript,
    邏輯運算子,
    AND,
    OR,
    短路求值,
    條件判斷,
    布林運算,
    運算子,
    邏輯與,
    邏輯或,
  ]
---

### 1\. 「&&」 (AND, 與) 運算子

### 定義

- **「&&」** 是邏輯「與」運算子，用來檢查多個條件是否**同時為真**。

- 只有當 **所有條件** 都為 true 時，結果才會是 true；否則，結果是 false。

- 語法：條件1 && 條件2

### 運作方式

- 如果第一個條件為 false，JavaScript 不會繼續檢查後面的條件，直接回傳 false（這叫做**短路求值**）。

- 如果第一個條件為 true，則繼續檢查第二個條件。

- 「&&」 不只回傳 true 或 false，它會回傳**第一個為 falsy 的值**，或者如果所有值都為 truthy，則回傳**最後一個值**。

### 什麼是 Truthy 和 Falsy？

- **Truthy**：非 falsy 的值，例如非空的字串（"Hello"）、數字（除了 0）、物件（{}）、陣列（\[\]）等。

- **Falsy**：false、0、""（空字串）、null、undefined、NaN。

### 範例 1：基本邏輯判斷

```javascript
// 檢查兩個條件是否同時為真
let age = 20;
let hasLicense = true;

if (age >= 18 && hasLicense) {
  console.log("你可以開車！"); // 結果：你可以開車！
} else {
  console.log("你不能開車！");
}
```

**解釋**：

- age >= 18 是 true（因為 20 大於等於 18）。

- hasLicense 是 true。

- true && true 結果是 true，所以進入 if 區塊，印出「你可以開車！」。

### 範例 2：短路求值

```javascript
let name = "";
let defaultName = "訪客";

let displayName = name && "已登入使用者";
console.log(displayName); // 結果：""（空字串）

displayName = defaultName && "已登入使用者";
console.log(displayName); // 結果："已登入使用者"
```

**解釋**：

- 在 name && "已登入使用者" 中，name 是空字串（falsy），所以 && 直接回傳 name 的值（空字串）。

- 在 defaultName && "已登入使用者" 中，defaultName 是「訪客」（truthy），所以回傳最後一個值「已登入使用者」。

---

## 2\. 「||」 (OR, 或) 運算子

### 定義

- **「||」** 是邏輯「或」運算子，用來檢查多個條件中是否**至少有一個為真**。

- 只要有一個條件為 true，結果就是 true；只有當所有條件都為 false 時，結果才會是 false。

- 語法：條件1 || 條件2

### 運作方式

- 如果第一個條件為 true，JavaScript 不會繼續檢查後面的條件，直接回傳 true（短路求值）。

- 如果第一個條件為 false，則繼續檢查第二個條件。

- 「||」 不只回傳 true 或 false，它會回傳**第一個為 truthy 的值**，或者如果所有值都為 falsy，則回傳**最後一個值**。

### 範例 3：基本邏輯判斷

```javascript
let isMember = false;
let hasCoupon = true;

if (isMember || hasCoupon) {
  console.log("你可以享受折扣！"); // 結果：你可以享受折扣！
} else {
  console.log("你沒有折扣資格。");
}
```

**解釋**：

- isMember 是 false，但 hasCoupon 是 true。

- false || true 結果是 true，所以進入 if 區塊，印出「你可以享受折扣！」。

### 範例 4：短路求值與預設值

```javascript
let username = "";
let defaultUsername = "訪客";

let displayUsername = username || defaultUsername;
console.log(displayUsername); // 結果："訪客"
```

**解釋**：

- username 是空字串（falsy），所以 || 會繼續檢查下一個值。

- defaultUsername 是「訪客」（truthy），所以回傳「訪客」。

---

## 3\. 「&&」 和 「||」 結合使用

### 範例 5：檢查多條件

```javascript
let age = 25;
let hasLicense = true;
let isSober = true;

if (age >= 18 && hasLicense && isSober) {
  console.log("你可以合法開車！"); // 結果：你可以合法開車！
} else {
  console.log("你不能開車！");
}
```

**解釋**：

- 所有條件 (age >= 18, hasLicense, isSober) 都是 true。

- true && true && true 結果是 true，所以印出「你可以合法開車！」。

### 範例 6：預設值與條件檢查

```javascript
let input = "";
let fallback = "預設值";
let isAdmin = true;

let result = (input || fallback) && isAdmin;
console.log(result); // 結果：true
```

**解釋**：

- input 是空字串（falsy），所以 input || fallback 回傳 fallback（即「預設值」，truthy）。

- fallback && isAdmin 檢查「預設值」（truthy）和 isAdmin（true），結果回傳 isAdmin 的值，即 true。

---

## 4\. 實務應用範例

### 範例 7：表單驗證

假設你有一個表單，需要檢查使用者是否輸入姓名和電子郵件。

```javascript
function validateForm(name, email) {
  if (name && email) {
    console.log("表單驗證通過！");
    console.log(`姓名：${name}, 電子郵件：${email}`);
  } else {
    console.log("請填寫所有欄位！");
  }
}

validateForm("小明", "ming@example.com"); // 結果：表單驗證通過！ 姓名：小明, 電子郵件：ming@example.com
validateForm("", "ming@example.com"); // 結果：請填寫所有欄位！
```

**解釋**：

- name && email 檢查兩個欄位是否都有值（非 falsy）。

- 如果任一欄位為空，則進入 else 區塊。

### 範例 8：動態設定預設值

假設你要從 API 取得資料，但如果資料不存在，則使用預設值。

```javascript
function getUserName(userData) {
  let name = userData || "匿名使用者";
  console.log(`歡迎，${name}！`);
}

getUserName("小華"); // 結果：歡迎，小華！
getUserName(""); // 結果：歡迎，匿名使用者！
```

**解釋**：

- 如果 userData 是 falsy（如空字串），則使用「匿名使用者」作為預設值。

---

## 5\. 「&&」與「||」Truthy/Falsy 組合對照表

以下表格列出 a && b 和 a || b 在 a 和 b 為 truthy 或 falsy 時的回傳結果，幫助你快速理解它們的行為。

## `&&` (AND) 運算子對照表

| 左邊值 | 右邊值 | 結果 | 說明 | 
|---|---|---|---|
| Falsy | Falsy | 左邊值 | 短路求值，回傳第一個 falsy | 
| Falsy | Truthy | 左邊值 | 短路求值，回傳第一個 falsy | 
| Truthy | Falsy | 右邊值 | 回傳第二個值（falsy） | 
| Truthy | Truthy | 右邊值 | 回傳第二個值（truthy） | 

## `||` (OR) 運算子對照表

| 左邊值 | 右邊值 | 結果 | 說明 | 
|---|---|---|---|
| Falsy | Falsy | 右邊值 | 回傳第二個值（falsy） | 
| Falsy | Truthy | 右邊值 | 回傳第二個值（truthy） | 
| Truthy | Falsy | 左邊值 | 短路求值，回傳第一個 truthy | 
| Truthy | Truthy | 左邊值 | 短路求值，回傳第一個 truthy | 

### 記憶技巧

- **`&&`**：「都要是真的才繼續」→ 遇到假的就停下來回傳假的值

- **`||`**：「有一個真的就夠了」→ 遇到真的就停下來回傳真的值

---

## 6\. 注意事項

1. **短路求值**：&& 和 || 會根據條件跳過不必要的檢查，這能提高程式效率，但也要小心不要誤用。

2. **優先級**：&& 的優先級高於 ||，所以 a && b || c 等於 (a && b) || c。如果不確定，建議用括號 () 明確指定順序。

3. **Falsy 值**：記得 falsy 值不只有 false，還有 0, "", null, undefined, NaN。

4. 空陣列 `[]` 和空物件 `{}` 是 Truthy 值

5. 字串 `"0"` 和 `"false"` 也是 Truthy 值

---

## 7\. 練習

你可以試著寫一個簡單的程式，檢查使用者是否可以參加活動：

- 條件：年齡 >= 18 且有票 (hasTicket)，或者使用者是 VIP (isVip)。

- 請寫出程式碼並測試不同情況。

以下是一個參考解答：

```
function canAttendEvent(age, hasTicket, isVip) {
  if ((age >= 18 && hasTicket) || isVip) {
    console.log("歡迎參加活動！");
  } else {
    console.log("抱歉，你無法參加活動。");
  }
}

canAttendEvent(20, true, false); // 結果：歡迎參加活動！
canAttendEvent(16, true, false); // 結果：抱歉，你無法參加活動。
canAttendEvent(16, false, true); // 結果：歡迎參加活動！
```