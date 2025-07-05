---
title: 陳述式與表達式
description: 深入理解 JavaScript 中陳述式與表達式的差異，包含語法特性、使用時機、實際應用與程式碼結構設計
keywords:
  [
    JavaScript,
    陳述式,
    表達式,
    Statement,
    Expression,
    語法,
    程式結構,
    控制流程,
    變數宣告,
  ]
---

### **什麼是陳述式（Statement）？**

**陳述式**是程式碼中執行某個動作或控制流程的完整指令。它通常是一行或多行程式碼，執行後會改變程式的狀態（例如變數的值、流程控制等），但它本身不會產生一個值。簡單來說，陳述式就像是告訴程式「去做某件事」。

常見的陳述式包括：

- 變數宣告（let、const、var）

- 條件陳述（if、switch）

- 迴圈（for、while）

- 函式宣告（function）

- return、break、continue 等控制流程的指令

**陳述式的特點**：

- 不會回傳值（不能直接用在需要值的地方）。

- 通常用來控制程式流程或執行副作用（side effect，例如修改變數、列印訊息）。

**範例：陳述式**

```javascript
// 變數宣告（陳述式）
let name = "小明";

// 條件陳述（陳述式）
if (name === "小明") {
  console.log("你好，小明！");
}

// 迴圈（陳述式）
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

在上面的例子中，這些程式碼執行了一些動作（例如宣告變數、檢查條件、迴圈列印），但它們本身不會產生一個可以用來賦值或傳遞的「值」。

---

### **什麼是表達式（Expression）？**

**表達式**是程式碼中可以被求值（evaluate）並產生一個值的片段。表達式可以是單純的數值、變數、運算，或者更複雜的組合。簡單來說，表達式就像是一個「計算結果」的東西，執行後會回傳一個值。

常見的表達式包括：

- 數值或字串（例如 42、"Hello"）

- 變數（例如 name）

- 運算（例如 a + b、"Hello" + " World"）

- 函式呼叫（如果函式有回傳值，例如 Math.random()）

- 三元運算子（例如 condition ? value1 : value2）

**表達式的特點**：

- 一定會產生一個值。

- 可以用在需要值的地方，例如賦值、函式參數、或 JSX 中。

**範例：表達式**

```javascript
// 簡單的表達式
const sum = 5 + 3; // 5 + 3 是一個表達式，結果是 8
const greeting = "Hello, " + "World"; // 字串拼接是表達式，結果是 "Hello, World"

// 函式呼叫作為表達式
const randomNum = Math.random(); // Math.random() 是表達式，回傳一個隨機數

// 三元運算子作為表達式
const isAdult = age >= 18 ? "成人" : "未成年"; // 三元運算子回傳一個字串
```

在這些例子中，每個表達式都會產生一個值，這個值可以被賦給變數或用在其他地方。

---

### **陳述式與表達式的關鍵區別**

| 特性           | 陳述式 (Statement)           | 表達式 (Expression)          |
| -------------- | ---------------------------- | ---------------------------- |
| **是否產生值** | 不一定產生值，主要是執行動作 | 一定會產生一個值             |
| **使用情境**   | 控制流程、執行副作用         | 用於計算、賦值或需要值的場合 |
| **範例**       | if, for, let x = 1;          | 5 + 3, Math.random(), x > 5  |
| **在 JSX 中**  | 不能直接用在 JSX 的 {} 中    | 可以直接用在 JSX 的 {} 中    |

---

### **在 React 中的應用**

在 React 中，特別是撰寫 JSX 時，表達式和陳述式的區別非常重要，因為 JSX 的 {} 只能接受表達式，而不能接受陳述式。這是因為 JSX 的 {} 會將內容作為 JavaScript 的值來處理。

#### **錯誤範例：陳述式用在 JSX 中**

```javascript
import React from 'react';

function App() {
  const name = "小明";

  return (
    <div>
      {/* 錯誤：if 是陳述式，不能放在 {} 中 */}
      {if (name === "小明") {
        console.log("你好，小明！");
      }}
    </div>
  );
}

export default App;
```

**問題**：if 是一個陳述式，不是表達式，所以不能直接放在 JSX 的 {} 中。執行這段程式碼會報錯。

#### **正確範例：使用表達式**

在 JSX 中，我們需要使用表達式來達到相同的效果，例如用三元運算子或邏輯運算子。

```javascript
import React from "react";

function App() {
  const name = "小明";

  return (
    <div>
      {/* 正確：三元運算子是一個表達式 */}
      {name === "小明" ? "你好，小明！" : "你好，陌生人！"}
    </div>
  );
}

export default App;
```

**說明**：

- 三元運算子（condition ? value1 : value2）是一個表達式，會回傳一個值，因此可以放在 JSX 的 {} 中。

- 這段程式碼會檢查 name 是否等於 "小明"，如果是則顯示「你好，小明！」，否則顯示「你好，陌生人！」。

#### **進階範例：結合表達式與陳述式**

有時候我們需要在 React 元件中執行陳述式（例如 if 或 for），但又需要回傳表達式給 JSX。這時可以在函式中處理邏輯，然後回傳表達式的結果。

```javascript
import React from "react";

function App() {
  const names = ["小明", "小華", "小美"];

  // 定義一個函式來處理陳述式並回傳表達式
  const renderNames = () => {
    const nameList = [];
    // 使用 for 迴圈（陳述式）來產生 JSX 元素
    for (let i = 0; i < names.length; i++) {
      nameList.push(<li key={i}>{names[i]}</li>);
    }
    return nameList; // 回傳表達式（陣列）
  };

  return (
    <div>
      <h1>名單</h1>
      <ul>
        {/* 在 JSX 中使用 renderNames() 回傳的表達式 */}
        {renderNames()}
      </ul>
    </div>
  );
}

export default App;
```

**說明**：

- 在 renderNames 函式中，我們使用 for 迴圈（陳述式）來動態生成 `<li>` 元素。

- 最終回傳一個陣列（表達式），這個陣列可以直接用在 JSX 的 {} 中。

- 注意：這裡使用了 key 屬性，這是 React 渲染列表時的要求，用來幫助 React 追蹤元素。

#### **更簡潔的方式：使用 map**

在 React 中，處理陣列時通常會用 map 方法，因為 map 本身是一個表達式，會回傳一個新的陣列，非常適合用在 JSX 中。

```javascript
import React from "react";

function App() {
  const names = ["小明", "小華", "小美"];

  return (
    <div>
      <h1>名單</h1>
      <ul>
        {/* 使用 map 直接產生表達式 */}
        {names.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

{
  d: completion;
}
export default App;
```

**說明**：

- `names.map(...)` 是一個表達式，會回傳一個包含 JSX 元素的陣列。

---

### **常見問題與解決方法**

1. **為什麼我不能在 JSX 中使用 if 或 for？**

   - 因為 if 和 for 是陳述式，不是表達式。JSX 的 {} 只能接受表達式。如果需要條件邏輯，可以用三元運算子或邏輯運算子（&&、||）；如果需要迴圈，可以用 map 或其他陣列方法。

2. **如何在 JSX 中處理複雜邏輯？**

   - 將複雜邏輯寫在函式中，用陳述式處理邏輯，然後回傳一個表達式。例如：

     ```javascript
     import React from "react";

     function App() {
       const score = 85;

       const getGrade = () => {
         if (score >= 90) {
           return "A";
         } else if (score >= 80) {
           return "B";
         } else {
           return "C";
         }
       };

       return <div>你的等級是：{getGrade()}</div>;
     }

     export default App;
     ```

3. **三元運算子太長怎麼辦？**

   - 如果三元運算子太複雜，可以改用函式或提前計算結果，然後在 JSX 中使用變數或函式呼叫。

---

### **練習：動手試試看**

以下是一個簡單的練習，幫助你熟悉陳述式與表達式在 React 中的應用。

**需求**：

- 建立一個 React 元件，根據使用者的年齡顯示是否為成人（18 歲以上顯示「成人」，否則顯示「未成年」）。

- 顯示一個數字列表，從 1 到 5，每個數字顯示為一個 `<li>` 元素。

**解答**：

```javascript
import React from "react";

function App() {
  const age = 20;
  const numbers = [1, 2, 3, 4, 5];

  return (
    <div>
      <h1>年齡檢查</h1>
      {/* 使用三元運算子（表達式） */}
      <p>狀態：{age >= 18 ? "成人" : "未成年"}</p>

      <h1>數字列表</h1>
      <ul>
        {/* 使用 map（表達式）渲染列表 */}
        {numbers.map((number, index) => (
          <li key={index}>{number}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

**步驟**：

1. 建立一個新的 React 專案（可以使用 create-react-app 或 Vite）。

2. 將上面的程式碼複製到 src/App.jsx 中。

3. 執行 npm start 或 yarn start，檢查網頁是否正確顯示：

   - 年齡檢查應顯示「成人」（因為 age 是 20）。

   - 數字列表應顯示 1 到 5 的項目。

---

### **總結**

- **陳述式**：執行動作或控制流程，不一定產生值，不能直接用在 JSX 的 {} 中。

- **表達式**：產生一個值，適合用在 JSX 的 {} 中，例如變數、運算、三元運算子、或 map。

- 在 React 中，善用表達式（如 map、&&、三元運算子）可以讓程式碼更簡潔且符合 JSX 的要求。

- 如果需要複雜邏輯，可以將陳述式寫在函式中，然後回傳表達式給 JSX 使用。
