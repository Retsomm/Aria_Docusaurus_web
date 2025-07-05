---
title: JavaScript 中的this
description: 深入理解 JavaScript 中 this 關鍵字的綁定機制，包含不同呼叫方式下 this 的指向、箭頭函式與一般函式的差異
keywords: [JavaScript, this, 關鍵字, 綁定, 箭頭函式, 呼叫方式, 物件導向, 作用域]
---

### **什麼是 this？**

this 是 JavaScript 裡的一個特殊關鍵字，它會指向「某個物件」，但這個物件是什麼，會根據**你怎麼呼叫函式**而改變。就像你在不同場合會扮演不同角色（例如在家是家人、在公司是員工），this 的值也會隨著「場合」不同而變。

---

### **1\. 全域環境下的 this**

**淺顯解釋**：在瀏覽器裡，如果你在全域環境（也就是程式碼沒被包在任何函式裡）用 this，它會指向 window 物件。window 是瀏覽器的「大老闆」，它包含所有全域變數和函式。

**什麼時候會這樣？**

- 當你直接在 `<script>` 標籤或 JavaScript 檔案的最外層用 this。

- 在「非嚴格模式」（non-strict mode）下，this 會指向 window。

- 如果用「嚴格模式」（"use strict"），this 會是 undefined。

**範例程式碼**（在全域環境測試 this）：

```javascript
// 在 index.js 檔案或 <script> 標籤中
console.log(this); // 輸出 window 物件（瀏覽器的大老闆）

// 開啟嚴格模式
("use strict");
console.log(this); // 輸出 undefined
```

**React 情境**： 在 React 中，你很少直接在全域環境用 this，因為 React 程式碼通常都在元件（component）或函式裡。但如果你不小心在全域定義了某個變數或函式，this 可能會指向 window，這可能導致 bug。

**實作步驟**：

1. 開啟瀏覽器的開發者工具（F12）。

2. 在 Console 輸入 console.log(this)，你會看到 Window 物件。

3. 在你的 React 專案的 index.js 檔案頂端，加入 "use strict"; 並測試 console.log(this)，確認輸出 undefined。

---

### **2\. 純粹的函式呼叫**

**淺顯解釋**：當你直接呼叫一個函式（沒透過物件或特殊方式），this 在非嚴格模式下會指向 window，在嚴格模式下會是 undefined。這是因為函式沒被綁定到任何物件，JavaScript 就「隨便」給它一個預設值。

**什麼時候會這樣？**

- 你定義了一個普通函式，然後直接呼叫它（例如 myFunction()）。

- 這在 React 中可能出現在你不小心把函式寫在元件外，或在事件處理時沒綁定 this。

**範例程式碼**：

```javascript
function sayHello() {
  console.log(this);
}
sayHello(); // 非嚴格模式：輸出 window，嚴格模式：輸出 undefined
// 嚴格模式
("use strict");
function sayHelloStrict() {
  console.log(this);
}
sayHelloStrict(); // 輸出 undefined
```

**React 情境**： 在 React 元件中，如果你在事件處理函式（像 onClick）中用了 this，但沒正確綁定，this 可能會變成 undefined（因為 React 通常用嚴格模式）。這是新手常見的錯誤！

**實作步驟**（在 React 中測試）：

1. 建立一個簡單的 React 元件：

   ```javascript
   import React from "react";
   class MyComponent extends React.Component {
     handleClick() {
       console.log(this); // 如果沒綁定，會是 undefined
     }
     render() {
       return <button onClick={this.handleClick}>點我</button>;
     }
   }
   export default MyComponent;
   ```

2. 執行程式，點擊按鈕，檢查 Console。如果你看到 undefined，那是因為 this 沒綁定到元件實例。

3. 修正方式（綁定 this）：

   ```javascript
   import React from "react";
   class MyComponent extends React.Component {
     constructor(props) {
       super(props);
       this.handleClick = this.handleClick.bind(this); // 綁定 this
     }
     handleClick() {
       console.log(this); // 現在指向 MyComponent 的實例
     }
     render() {
       return <button onClick={this.handleClick}>點我</button>;
     }
   }
   export default MyComponent;
   ```

---

### **3\. 使用 new 運算子**

**淺顯解釋**：當你用 new 關鍵字來建立物件時，this 會指向新創建的物件。這就像你開了一間新公司，this 就是這間公司的老闆（新物件）。

**什麼時候會這樣？**

- 當你用 new 呼叫一個建構函式（constructor function）或建立 class 實例時。

**範例程式碼**：

```javascript
function Person(name) {
  this.name = name; // this 指向新創建的物件
  console.log(this);
}
const person = new Person("小明"); // 輸出 { name: "小明" }
```

**React 情境**： 在 React 的 class 元件中 she 中，當你用 new 建立元件實例時，this 會指向該元件的實例。這是 React class 元件的核心機制。

**實作步驟**：

1. 建立一個簡單的 class 元件：

```javascript
import React from "react";
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log(this); // 指向 MyComponent 的實例
  }
  render() {
    return <div>計數: {this.state.count}</div>;
  }
}
export default MyComponent;
```

1. 執行程式，檢查 Console，你會看到 this 是一個物件，包含 props 和 state 等屬性，這是 React 元件的實例。

---

### **4\. 在 class 裡的 this**

**淺顯解釋**：在 JavaScript 的 class 裡，this 通常指向該 class 的實例（instance）。這在 React 的 class 元件中特別常見，因為每個元件都是一個 class 實例。

**什麼時候會這樣？**

- 當你在 class 的方法中用 this，它會指向該 class 創建的物件。

- 在 React 中，this 通常用來存取 state、props 或定義的事件處理函式。

**範例程式碼**：

```javascript
class Car {
  constructor(brand) {
    this.brand = brand; // this 指向新創建的 Car 實例
  }
  showBrand() {
    console.log(this.brand);
  }
}
const myCar = new Car("Toyota");
myCar.showBrand(); // 輸出 "Toyota"
```

**React 情境**： 在 React class 元件中，this 指向元件實例，讓你可以存取 state 和 props。例如：

```javascript
import React from "react";
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  increment = () => {
    this.setState({ count: this.state.count + 1 });
    console.log(this); // 指向 Counter 的實例
  };
  render() {
    return (
      <div>
        <p>計數: {this.state.count}</p>
        <button onClick={this.increment}>加 1</button>
      </div>
    );
  }
}
export default Counter;
```

**實作步驟**：

1. 在 React 專案中建立上述 Counter 元件。

2. 點擊按鈕，檢查 Console，確認 this 指向元件實例，包含 state 和 props。

---

### **5\. call、apply 和 bind**

這三個方法是用來**手動控制 this 的值**，讓你決定函式執行時 this 指向哪個物件。以下是超淺顯的解釋：

#### **call**

**淺顯解釋**：call 讓你呼叫一個函式，並指定 this 指向某個物件，還可以傳遞參數（一個一個傳）。

**範例程式碼**：

```javascript
function greet(greeting) {
  console.log(`${greeting}, 我是 ${this.name}`);
}
const person = { name: "小明" };
greet.call(person, "你好"); // 輸出 "你好, 我是 小明"
```

**React 情境**： 在 React 中，call 不常直接用，但可以用來測試或模擬 this 的行為。例如：

```javascript
import React from "react";
class MyComponent extends React.Component {
  sayHello(greeting) {
    console.log(`${greeting}, 我是 ${this.name}`);
  }
  render() {
    const person = { name: "小明" };
    return (
      <button onClick={() => this.sayHello.call(person, "你好")}>點我</button>
    );
  }
}
export default MyComponent;
```

#### **apply**

**淺顯解釋**：跟 call 很像，但參數是用**陣列**傳遞，適合需要傳很多參數的情況。

**範例程式碼**：

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, 我是 ${this.name}${punctuation}`);
}
const person = { name: "小明" };
greet.apply(person, ["你好", "!"]); // 輸出 "你好, 我是 小明!"
```

**React 情境**：跟 call 一樣，apply 在 React 中不常見，但可以用來改變 this 的指向。

#### **bind**

**淺顯解釋**：bind 會創建一個新函式，並永久綁定 this 到指定的物件。這個新函式可以稍後再呼叫，this 不會改變。

**範例程式碼**：

```javascript
function greet(greeting) {
  console.log(`${greeting}, 我是 ${this.name}`);
}
const person = { name: "小明" };
const boundGreet = greet.bind(person); // 綁定 this 到 person
boundGreet("你好"); // 輸出 "你好, 我是 小明"
```

**React 情境**： 在 React 中，bind 常用來確保事件處理函式的 this 正確指向元件實例。例如：

```javascript
import React from "react";
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "小明" };
    this.handleClick = this.handleClick.bind(this); // 綁定 this
  }
  handleClick() {
    console.log(`你好, 我是 ${this.state.name}`);
  }
  render() {
    return <button onClick={this.handleClick}>點我</button>;
  }
}
export default MyComponent;
```

**實作步驟**：

1. 在 React 專案中建立上述 MyComponent 元件。

2. 點擊按鈕，確認 this 正確指向元件實例，輸出包含 [state.name](state.name) 的訊息。

3. 試著移除 bind，觀察 this 變成 undefined 的錯誤。

---

### **總結與 React 使用建議**

- **全域環境**：this 通常是 window（非嚴格模式）或 undefined（嚴格模式）。在 React 中避免直接在全域用 this。

- **純粹呼叫**：函式直接呼叫時，this 可能是 window 或 undefined，在 React 中要小心事件處理函式的 this。

- **new 運算子**：this 指向新創建的物件，這是 React class 元件的基礎。

- **class**：在 React class 元件中，this 指向元件實例，用來存取 state 和 props。

- **call/apply/bind**：用來手動控制 this，在 React 中 bind 最常用，確保事件處理函式的 this 正確。

**小技巧**：

- 在 React 中，常用箭頭函式（arrow function）來避免 this 綁定的麻煩，因為箭頭函式會自動捕獲外層的 this：

```javascript
import React from "react";
class MyComponent extends React.Component {
  state = { count: 0 };
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    console.log(this); // 指向 MyComponent 實例
  };
  render() {
    return (
      <div>
        <p>計數: {this.state.count}</p>
        <button onClick={this.handleClick}>加 1</button>
      </div>
    );
  }
}
export default MyComponent;
```
