---
title: JavaScript 中的Hoisting（提升）
description: 深入理解 JavaScript 提升機制，包含 var、let、const 的提升行為差異，以及函數宣告與函數表達式的提升特性
keywords:
  [JavaScript, Hoisting, 提升, var, let, const, 函數宣告, 函數表達式, 作用域]
---

### 什麼是 Hoisting（提升）？

在 JavaScript 中，**Hoisting** 是指在程式碼執行之前，JavaScript 引擎會將 **變數宣告** 和 **函數宣告** 提升到其作用域（scope）的頂部。這意味著你可以在變數或函數宣告之前使用它們，而不會引發 ReferenceError。不過，Hoisting 的行為會因變數的宣告方式（var、let、const）或函數的型態（函數宣告、函數表達式）而有所不同。

簡單來說：

- **變數宣告**（如 var x;）會被提升，但初始化（賦值）不會。

- **函數宣告**（如 function myFunc() {}）會連同定義一起被提升。

- 使用 let 和 const 的變數雖然也會被提升，但它們有 **Temporal Dead Zone（暫時性死區）**，因此在宣告之前存取會報錯。

---

### Hoisting 在記憶體中的運作形式

JavaScript 引擎在執行程式碼時，會分為兩個階段：

1. **創建階段（Creation Phase）**：

   - 引擎掃描程式碼，找到所有的變數和函數宣告。

   - 為這些變數和函數在記憶體中分配空間，並將它們「提升」到作用域的頂部。

   - 使用 var 宣告的變數，會被初始化為 undefined。

   - 使用 let 和 const 宣告的變數也會被提升，但不會初始化（處於暫時性死區）。

   - 函數宣告會完整提升，包括函數名稱和其定義（function body）。

2. **執行階段（Execution Phase）**：

   - 程式碼逐行執行，變數的賦值操作在這階段發生。

   - 如果試圖在變數宣告前存取 let 或 const 變數，會因為暫時性死區而拋出錯誤。

以下是記憶體運作的簡單示意：

| 程式碼                         | 創建階段（記憶體分配）             | 執行階段（實際執行）                                         |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------ |
| console.log(x); var x = 5;     | x 被提升，初始化為 undefined       | 印出 undefined，然後 x 被賦值為 5                            |
| console.log(y); let y = 10;    | y 被提升，但未初始化（暫時性死區） | 印出 ReferenceError: Cannot access 'y' before initialization |
| myFunc(); function myFunc() {} | myFunc 連同定義一起提升            | 成功執行 myFunc                                              |

---

### 程式碼範例與詳細步驟

以下我會用 React 的程式碼範例來展示 Hoisting 的行為，並詳細解釋每一步，讓你能輕鬆跟著操作。

#### 範例 1：使用 var 的 Hoisting

假設你在 React 組件中使用了 var 宣告變數：

```javascript
import React from "react";

function App() {
  console.log(myVar); // 印出：undefined
  var myVar = 100;
  console.log(myVar); // 印出：100

  return (
    <div>
      <h1>Hoisting 範例</h1>
      <p>檢查控制台輸出</p>
    </div>
  );
}

export default App;
```

**步驟解析**：

1. **創建階段**：

   - JavaScript 引擎掃描 App 函數作用域，找到 var myVar。

   - 在記憶體中為 myVar 分配空間，並初始化為 undefined。

   - 此時記憶體中的狀態是：myVar: undefined。

2. **執行階段**：

   - 執行 console.log(myVar)，因為 myVar 已提升且值為 undefined，所以印出 undefined。

   - 執行 var myVar = 100;，此時 myVar 被賦值為 100。

   - 執行第二個 console.log(myVar)，印出 100。

   - 最後渲染 React 組件的 JSX 內容。

**操作步驟**：

1. 將以上程式碼複製到你的 React 專案中（例如 src/App.jsx）。

2. 開啟瀏覽器的開發者工具（F12），切到「控制台（Console）」標籤。

3. 執行程式（npm start），觀察控制台輸出：

   - 第一行：undefined

   - 第二行：100

---

#### 範例 2：使用 let 的 Hoisting（暫時性死區）

現在改用 let 來看看差異：

```javascript
import React from "react";

function App() {
  try {
    console.log(myLet); // 報錯：ReferenceError
    let myLet = 200;
    console.log(myLet); // 不會執行到這行
  } catch (error) {
    console.log("錯誤：", error.message); // 印出：Cannot access 'myLet' before initialization
  }

  return (
    <div>
      <h1>Hoisting 與 let</h1>
      <p>檢查控制台輸出</p>
    </div>
  );
}

export default App;
```

**步驟解析**：

1. **創建階段**：

   - 引擎掃描程式碼，找到 let myLet。

   - 在記憶體中為 myLet 分配空間，但 **不初始化**（處於暫時性死區）。

   - 記憶體狀態：`myLet: <uninitialized>`。

2. **執行階段**：

   - 執行 console.log(myLet)，因為 myLet 處於暫時性死區，引擎會拋出 ReferenceError: Cannot access 'myLet' before initialization。

   - 錯誤被 try-catch 捕獲，印出錯誤訊息。

   - 由於錯誤，後面的 let myLet = 200 和第二個 console.log 不會執行。

   - React 組件繼續渲染 JSX 內容。

**操作步驟**：

1. 將程式碼複製到 src/App.jsx。

2. 開啟瀏覽器控制台。

3. 執行程式，觀察輸出：錯誤：Cannot access 'myLet' before initialization。

---

#### 範例 3：函數宣告的 Hoisting

函數宣告的 Hoisting 行為更強大，因為它會連同函數定義一起提升。以下是範例：

```javascript
import React from "react";

function App() {
  sayHello(); // 印出：Hello, React!

  function sayHello() {
    console.log("Hello, React!");
  }

  return (
    <div>
      <h1>函數 Hoisting</h1>
      <p>檢查控制台輸出</p>
    </div>
  );
}

export default App;
```

**步驟解析**：

1. **創建階段**：

   - 引擎掃描程式碼，找到函數宣告 function sayHello() {}。

   - 在記憶體中為 sayHello 分配空間，並將整個函數定義提升。

   - 記憶體狀態：sayHello: \[Function: sayHello\]。

2. **執行階段**：

   - 執行 sayHello()，因為函數已提升且包含完整定義，所以成功印出 Hello, React!。

   - 渲染 React 組件的 JSX 內容。

**操作步驟**：

1. 複製程式碼到 src/App.jsx。

2. 開啟瀏覽器控制台。

3. 執行程式，觀察輸出：Hello, React!。

---

#### 範例 4：函數表達式（Function Expression）與 Hoisting

函數表達式（例如 const myFunc = () => {}）的行為與 let 或 const 類似，只提升變數宣告，不提升賦值。

```javascript
import React from "react";

function App() {
  try {
    myFunc(); // 報錯：ReferenceError
    const myFunc = () => {
      console.log("這是函數表達式");
    };
  } catch (error) {
    console.log("錯誤：", error.message); // 印出：Cannot access 'myFunc' before initialization
  }

  return (
    <div>
      <h1>函數表達式 Hoisting</h1>
      <p>檢查控制台輸出</p>
    </div>
  );
}

export default App;
```

**步驟解析**：

1. **創建階段**：

   - 引擎掃描程式碼，找到 const myFunc。

   - 在記憶體中為 myFunc 分配空間，但不初始化（暫時性死區）。

   - 記憶體狀態：`myFunc: <uninitialized>`。

2. **執行階段**：

   - 執行 myFunc()，因為 myFunc 處於暫時性死區，引擎拋出 ReferenceError。

   - 錯誤被 try-catch 捕獲，印出錯誤訊息。

   - React 組件繼續渲染 JSX。

**操作步驟**：

1. 複製程式碼到 src/App.jsx。

2. 開啟瀏覽器控制台。

3. 執行程式，觀察輸出：錯誤：Cannot access 'myFunc' before initialization。

---

### 在 React 中需要注意的事項

1. **避免依賴 Hoisting**：

   - 在 React 中，過度依賴 Hoisting 可能導致程式碼難以閱讀和維護。建議明確地在使用變數或函數之前宣告它們。

   - 例如，總是將 useState 或 useEffect 放在組件頂部，並避免在條件語句中宣告變數。

2. **使用 let 和 const**：

   - 現代 JavaScript 和 React 開發中，建議使用 let 和 const 而非 var，因為它們有塊級作用域（block scope），且暫時性死區能幫助你避免未定義的錯誤。

3. **函數表達式優先**：

   - 在 React 中，函數表達式（尤其是箭頭函數）更常用於定義事件處理函數或回調函數，因為它們更符合 React 的函數式程式設計風格。

---

### 總結

- **Hoisting** 是 JavaScript 引擎在執行程式碼前，將變數和函數宣告提升到作用域頂部的行為。

- **記憶體運作**：

  - var：提升並初始化為 undefined。

  - let 和 const：提升但不初始化，存取會進入暫時性死區。

  - 函數宣告：完整提升（包含定義）。

  - 函數表達式：僅變數宣告提升，賦值不提升。

- **React 實務建議**：避免依賴 Hoisting，使用 let 或 const，並保持程式碼清晰。
