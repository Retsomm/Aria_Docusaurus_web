---
title: JavaScript 中的函式
description: 深入探討 JavaScript 函式的進階概念，包含函式定義、作用域、閉包、高階函數等重要程式設計技巧
keywords:
  [
    JavaScript,
    函式,
    進階函式,
    作用域,
    閉包,
    高階函數,
    函式定義,
    函式應用,
    程式設計,
  ]
---

## 1\. 函式 (Function)

定義

函式是 JavaScript 中的基本程式碼區塊，用來封裝可重複執行的程式邏輯。它可以接受輸入（參數），執行特定任務，並返回結果。

特性

- 函式可以透過 function 關鍵字、箭頭函式 (=>) 或函式表達式定義。

- 可以被呼叫多次，且可以傳遞參數或返回值。

React 中的應用

在 React 中，函式常用來處理事件、渲染邏輯或處理狀態更新。

範例程式碼

假設你正在建一個簡單的 React 按鈕組件，點擊按鈕會顯示一個計數。

```javascript
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  // 定義一個函式來增加計數
  function increment() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>目前計數：{count}</p>
      <button onClick={increment}>點我加一</button>
    </div>
  );
}

export default Counter;
```

說明

- increment 是一個普通的函式，負責更新 count 狀態。

- 當按鈕被點擊時，React 會呼叫 increment 函式來執行狀態更新。

- 這是一個基本的函式，封裝了單一邏輯（增加計數）。

---

## 2\. 立即函式 (Immediately Invoked Function Expression, IIFE)

定義

立即函式是一種定義後立即執行的函式，通常用來建立一個獨立的執行環境，避免污染全域命名空間。

特性

- 語法：`(function() { ... })();`

- 執行完後立即銷毀，適合用於初始化或一次性任務。

- 常用來避免變數名稱衝突。

React 中的應用

在 React 中，IIFE 通常用在需要執行一次性邏輯時，例如初始化某些資料或設定。

範例程式碼

假設你需要在組件載入時，立即根據某條件設定初始值。

```javascript
import React, { useState } from "react";

function App() {
  const [theme, setTheme] = useState(
    // 立即函式：根據時間決定初始主題
    (function () {
      const hour = new Date().getHours();
      return hour >= 18 ? "dark" : "light";
    })()
  );

  return (
    <div>
      <p>目前主題：{theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        切換主題
      </button>
    </div>
  );
}

export default App;
```

說明

- 這裡的 IIFE 在組件初始化時執行，根據當前時間（小時）決定主題是 light 或 dark。

- IIFE 執行完後立即銷毀，不會佔用記憶體。

- 這避免了在全域範圍定義不必要的變數或函式。

---

## 3\. 一級函式 (First-Class Function)

定義

在 JavaScript 中，函式被視為「一級公民」（First-Class Citizen），這意味著函式可以像其他資料型別（如數字、字串）一樣被操作：

- 可以賦值給變數。

- 可以作為參數傳遞。

- 可以作為返回值。

特性

- JavaScript 的函式是一級函式，這是高階函式的基礎。

- 一級函式讓 JavaScript 支援函式式編程（Functional Programming）。

React 中的應用

在 React 中，常用一級函式來傳遞事件處理函式或作為回呼函式（Callback）。

範例程式碼

假設你有一個按鈕組件，允許父組件傳入自訂的點擊處理函式。

```javascript
import React from "react";

// 子組件：接受一個函式作為 prop
function CustomButton({ onClickHandler }) {
  return <button onClick={onClickHandler}>點我</button>;
}

// 父組件
function App() {
  // 定義一個函式
  const handleClick = () => {
    alert("按鈕被點擊了！");
  };

  return (
    <div>
      <CustomButton onClickHandler={handleClick} />
    </div>
  );
}

export default App;
```

說明

- handleClick 是一個函式，被當作 onClickHandler prop 傳遞給 CustomButton。

- 這展示了函式作為一級公民，可以像變數一樣傳遞。

- 在 React 中，事件處理函式經常以這種方式傳遞。

---

## 4\. 高階函式 (Higher-Order Function)

定義

高階函式是一個函式，它可以：

- 接受另一個函式作為參數。

- 回傳一個新的函式。

特性

- 高階函式是基於一級函式的進階概念。

- 常用於抽象化邏輯、封裝行為或處理非同步操作。

React 中的應用

在 React 中，高階函式常用來處理複雜的事件邏輯、回呼函式或封裝狀態更新邏輯。

範例程式碼

假設你有一個表單組件，需要一個高階函式來處理不同的輸入驗證邏輯。

```javascript
import React, { useState } from "react";

// 高階函式：回傳一個帶有驗證邏輯的函式
function withValidation(handler, validate) {
  return (value) => {
    if (validate(value)) {
      handler(value);
    } else {
      alert("輸入無效！");
    }
  };
}

function Form() {
  const [input, setInput] = useState("");

  // 定義驗證函式：檢查輸入是否為數字
  const isNumber = (value) => !isNaN(value) && value.trim() !== "";

  // 使用高階函式來包裝 setInput
  const handleNumberInput = withValidation(setInput, isNumber);

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => handleNumberInput(e.target.value)}
        placeholder="請輸入數字"
      />
      <p>目前輸入：{input}</p>
    </div>
  );
}

export default Form;
```

說明

- withValidation 是一個高階函式，它接受一個處理函式 (handler) 和一個驗證函式 (validate)，回傳一個新的函式。

- 新回傳的函式會先執行驗證，通過後才呼叫 handler。

- 在這個例子中，handleNumberInput 是一個高階函式生成的函式，只允許數字輸入。

---

## 總結與比較

| 類型                | 定義                         | React 中的用途     | 範例場景                 |
| ------------------- | ---------------------------- | ------------------ | ------------------------ |
| **函式**            | 封裝可重複執行的程式邏輯     | 事件處理、狀態更新 | 按鈕點擊增加計數         |
| **立即函式 (IIFE)** | 定義後立即執行，避免污染全域 | 初始化設定         | 根據時間設定主題         |
| **一級函式**        | 函式可像變數一樣操作         | 傳遞事件處理函式   | 傳遞點擊處理函式給子組件 |
| **高階函式**        | 接受或回傳函式               | 封裝複雜邏輯       |                          |
