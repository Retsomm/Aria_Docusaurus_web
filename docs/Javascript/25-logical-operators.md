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

### 1\. &&（邏輯與，AND）

**功能**：&& 運算子用來檢查多個條件是否**全部為真**（true）。只有當所有條件都為 true 時，整個表達式的結果才會是 true；只要有一個條件為 false，結果就是 false。

**語法**：條件 1 && 條件 2 && ... && 條件 N

**真值表**：

| 條件 A | 條件 B | A && B |
| ------ | ------ | ------ |
| true   | true   | true   |
| true   | false  | false  |
| false  | true   | false  |
| false  | false  | false  |

**特性**：

**短路求值**（Short-circuit Evaluation）：如果第一個條件為 false，後面的條件不會被執行，因為結果已經確定是 false。

常用於檢查多個條件必須同時成立的情況。

**範例場景**：檢查使用者是否已登入且有管理員權限。

```javascript
// 範例：檢查是否允許進入管理頁面
let isLoggedIn = true;
let isAdmin = true;

if (isLoggedIn && isAdmin) {
  console.log("歡迎進入管理頁面！");
} else {
  console.log("權限不足，無法進入管理頁面。");
}
```

**輸出**：歡迎進入管理頁面！

如果將 isAdmin 改為 false：

```javascript
let isLoggedIn = true;
let isAdmin = false;

if (isLoggedIn && isAdmin) {
  console.log("歡迎進入管理頁面！");
} else {
  console.log("權限不足，無法進入管理頁面。");
}
```

**輸出**：權限不足，無法進入管理頁面。

**短路求值的應用**：

```javascript
let user = { name: "小明" };
let hasName = user && user.name; // 如果 user 存在，則檢查 user.name
console.log(hasName); // 輸出: 小明

user = null;
hasName = user && user.name; // user 為 null，後面不會執行
console.log(hasName); // 輸出: null（不會報錯）
```

---

### 2\. ||（邏輯或，ORಸ OR）

**功能**：|| 運算子用來檢查多個條件是否**至少有一個為真**。只要有一個條件為 true，整個表達式的結果就是 true；只有當所有條件都為 false 時，結果才是 false。

**語法**：條件 1 || 條件 2 || ... || 條件 N

真值表：
| 條件 A | 條件 B | A || B |
|--------|--------|--------|
| true | true | true |
| true | false | true |
| false | true | true |
| false | false | false |

**特性**：

**短路求值**：如果第一個條件為 true，後面的條件不會被執行，因為結果已經確定是 true。

常用於提供預設值或檢查多個可能的條件。

**範例場景**：檢查使用者是否輸入姓名或暱稱。

```javascript
// 範例：檢查是否有姓名或暱稱
let userName = "";
let nickName = "小明";

if (userName || nickName) {
  console.log("使用者有提供名稱：" + (userName || nickName));
} else {
  console.log("請輸入名稱或暱稱！");
}
```

**輸出**：使用者有提供名稱：小明

如果兩者都為空：

```javascript
let userName = "";
let nickName = "";

if (userName || nickName) {
  console.log("使用者有提供名稱：" + (userName || nickName));
} else {
  console.log("請輸入名稱或暱稱！");
}
```

**輸出**：請輸入名稱或暱稱！

**短路求值的應用**：

```javascript
let defaultName = "訪客";
let inputName = null;

let displayName = inputName || defaultName; // 如果 inputName 為 falsy 值，使用 defaultName
console.log(displayName); // 輸出: 訪客
```

---

### 3\. && 和 || 的結合使用

在實際開發中，這兩個運算子常常一起使用來處理複雜的條件邏輯。以下是一個前端常見的範例：

```javascript
// 範例：檢查表單是否填寫完整
let username = "小明";
let password = "123456";
let age = 20;

if (username && password && age >= 18) {
  console.log("表單驗證通過，可以註冊！");
} else if (!username || !password) {
  console.log("請填寫完整的帳號和密碼！");
} else {
  console.log("年齡必須大於或等於18歲！");
}
```

**輸出**：表單驗證通過，可以註冊！

**說明**：

第一個 if 使用 && 確保所有條件都成立（帳號、密碼、年齡）。

第二個 if 使用 || 檢查是否有任一欄位未填寫。

最後的 else 處理年齡不符合的情況。

---

### 4\. 注意事項

1. **優先級**：

&& 的優先級高於 ||，所以 a && b || c && d 會被解讀為 (a && b) || (c && d)。

如果邏輯複雜，建議使用括號 () 明確表達順序，增加程式碼可讀性。

```javascript
let result = (true && false) || (true && true); // 明確的括號
console.log(result); // 輸出: true
```

2. **Falsy 和 Truthy 值**：

在 JavaScript 中，&& 和 || 不僅適用於布林值，還會處理 truthy（真值）和 falsy（假值）的情況。

Falsy 值包括：false, 0, "", null, undefined, NaN。

Truthy 值是除了 falsy 值以外的所有值。

3. **短路求值的實用性**：

   && 可以用來避免未定義的錯誤，例如 obj && [obj.property](obj.property)。

   || 常用於設定預設值，例如 let result = input || "預設值"。

---

### 5\. 實作練習

以下是一個簡單的練習，幫助你熟悉 && 和 || 的用法。請嘗試在你的開發環境（如 VS Code）中執行以下程式碼，並觀察結果。

```javascript
// 練習：檢查購物車條件
let cartItems = 3;
let totalPrice = 1500;
let isMember = true;

if (cartItems >= 2 && totalPrice >= 1000 && isMember) {
  console.log("符合免運費資格！");
} else if (cartItems === 0 || totalPrice === 0) {
  console.log("購物車為空或金額為 0，無法結帳！");
} else {
  console.log("不符合免運費資格，請檢查購物車或金額！");
}
```

**輸出**：符合免運費資格！

**操作步驟**：

1. 開啟你的程式碼編輯器（如 VS Code）。

2. 建立一個 .js 檔案，例如 logic.js。

3. 複製並貼上上述程式碼。

4. 在終端機執行 node logic.js 查看結果。

5. 嘗試改變 cartItems、totalPrice 或 isMember 的值，觀察不同輸出的變化。

---

### 6\. 常見問題與解答

**問**：&& 和 || 會回傳什麼值？

答：它們不一定回傳布林值，而是回傳最後評估的表達式值。例如：

    ```javascript
    let result = "hello" && 123; // 輸出: 123
    let result2 = null || "world"; // 輸出: world
    ```

**問**：為什麼要用短路求值？

答：可以提高效率（避免不必要的計算）並防止錯誤（例如檢查物件是否存在）。

**問**：什麼時候應該用 && 或 ||？

答：當你需要結合多個條件時，&& 用於「全部都要滿足」，|| 用於「至少一個滿足」。
