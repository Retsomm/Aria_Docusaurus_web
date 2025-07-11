---
title: JavaScript 中的物件（Object）和陣列（Array）
description: 學習 JavaScript 物件和陣列的基本概念、操作方法、遍歷技巧，以及參考型別與原始型別的區別
keywords:
  [JavaScript, 物件, 陣列, Object, Array, 參考型別, 物件操作, 陣列方法, 遍歷]
---

### 1\. 什麼是物件與陣列？

#### 物件（Object）

- **定義**：物件是一種鍵值對（key-value pair）的資料結構，用來儲存相關的資料。鍵（key）通常是字串或符號，值（value）可以是任何型別（數字、字串、陣列、物件、函數等）。

- **用途**：適合用來表示具有屬性（properties）的實體，例如一個人的資料（姓名、年齡、地址等）。

- **語法**：

  ```javascript
  const person = {
    name: "小明",
    age: 25,
    city: "台北",
  };
  ```

#### 陣列（Array）

- **定義**：陣列是一個有序的資料集合，透過索引（index，從 0 開始）來存取元素。陣列中的元素可以是任何型別。

- **用途**：適合用來儲存一系列的資料，例如清單、數字序列等。

- **語法**：

  ```javascript
  const fruits = ["蘋果", "香蕉", "橘子"];
  ```

---

### 2\. 物件與陣列的比較

| 特性         | 物件（Object）                        | 陣列（Array）              |
| ------------ | ------------------------------------- | -------------------------- |
| **資料結構** | 鍵值對（key-value）                   | 有序索引（index-based）    |
| **存取方式** | 透過鍵（object.key 或 object["key"]） | 透過索引（array[0]）       |
| **用途**     | 表示具有屬性的實體                    | 表示有序的資料清單         |
| **範例**     | `{ name: "小明", age: 25 }`           | `["蘋果", "香蕉", "橘子"]` |

---

### 3\. 在 React 中使用物件與陣列

在 React 中，物件和陣列常用來管理元件狀態（state）或傳遞資料（props）。以下我會提供詳細的 React 範例，展示如何在元件中使用物件和陣列，並搭配常見的操作（新增、修改、刪除）。

#### 範例 1：使用物件管理表單資料

假設我們要建立一個表單，讓使用者輸入姓名和年齡，並顯示在畫面上。

```javascript
import React, { useState } from "react";

function FormExample() {
  // 使用物件作為 state，儲存表單資料
  const [formData, setFormData] = useState({
    name: "",
    age: "",
  });

  // 處理輸入框變更
  const handleChange = (event) => {
    const { name, value } = event.target;
    // 更新物件的特定屬性，使用展開運算子（...）保留其他屬性
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 處理表單提交
  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`姓名：${formData.name}，年齡：${formData.age}`);
  };

  return (
    <div>
      <h2>表單範例（使用物件）</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>姓名：</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>年齡：</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>
        <button type="submit">提交</button>
      </form>
      <p>目前輸入的資料：{JSON.stringify(formData)}</p>
    </div>
  );
}

export default FormExample;
```

**程式碼說明**：

1. **物件作為 state**：formData 是一個物件，包含 name 和 age 兩個屬性，用來儲存表單的輸入值。

2. **更新物件**：透過 handleChange 函數，使用展開運算子（...formData）保留未變更的屬性，只更新指定的欄位（\[name\]: value）。

3. **顯示資料**：使用 JSON.stringify 將物件轉為字串顯示在畫面上，方便檢查。

4. **表單提交**：當使用者點擊「提交」按鈕時，會顯示一個提示框，包含物件中的資料。

**操作步驟**：

1. 將程式碼複製到你的 React 專案中的一個元件檔案（例如 FormExample.js）。

2. 在主應用程式（App.js）中引入並渲染這個元件：

   ```javascript
   import FormExample from "./FormExample";

   function App() {
     return (
       <div>
         <FormExample />
       </div>
     );
   }

   export default App;
   ```

3. 啟動專案（npm start），你應該會看到一個表單，輸入姓名和年齡後，點擊提交會顯示提示框。

---

#### 範例 2：使用陣列管理待辦清單

假設我們要建立一個待辦清單（To-Do List），讓使用者可以新增、刪除待辦事項。

```javascript
import React, { useState } from "react";

function TodoList() {
  // 使用陣列作為 state，儲存待辦事項
  const [todos, setTodos] = useState(["買牛奶", "寫程式"]);
  const [newTodo, setNewTodo] = useState("");

  // 處理輸入框變更
  const handleInputChange = (event) => {
    setNewTodo(event.target.value);
  };

  // 新增待辦事項
  const addTodo = () => {
    if (newTodo.trim() !== "") {
      // 使用展開運算子將新項目加入陣列
      setTodos([...todos, newTodo]);
      setNewTodo(""); // 清空輸入框
    }
  };

  // 刪除待辦事項
  const removeTodo = (index) => {
    // 使用 filter 移除指定索引的項目
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>待辦清單（使用陣列）</h2>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={handleInputChange}
          placeholder="輸入新的待辦事項"
        />
        <button onClick={addTodo}>新增</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button
              onClick={() => removeTodo(index)}
              style={{ marginLeft: "10px" }}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
```

**程式碼說明**：

1. **陣列作為 state**：todos 是一個陣列，儲存所有的待辦事項。

2. **新增項目**：透過 addTodo 函數，使用展開運算子（...todos）將新項目加入陣列。

3. **刪除項目**：使用 filter 方法，根據索引移除指定的待辦事項。

4. **渲染清單**：使用 map 方法遍歷 todos 陣列，動態生成 `<li>` 元素，並為每個項目加上「刪除」按鈕。

5. **鍵（key）**：在 map 中使用 index 作為 key，確保 React 正確追蹤列表中的元素。

**操作步驟**：

1. 將程式碼複製到你的 React 專案中的一個元件檔案（例如 TodoList.js）。

2. 在主應用程式（App.js）中引入並渲染這個元件：

   ```javascript
   import TodoList from "./TodoList";

   function App() {
     return (
       <div>
         <TodoList />
       </div>
     );
   }

   export default App;
   ```

3. 啟動專案（npm start），你應該會看到一個待辦清單，輸入新項目後點擊「新增」會將項目加入清單，點擊「刪除」會移除對應項目。

---

### 4\. 常見操作方法

#### 物件操作

- **存取屬性**：

  ```javascript
  const person = { name: "小明", age: 25 };
  console.log(person.name); // 小明
  console.log(person["age"]); // 25
  ```

- **新增/修改屬性**：

  ```javascript
  person.city = "台北"; // 新增
  person.age = 26; // 修改
  ```

- **刪除屬性**：

  ```javascript
  delete person.city;
  ```

#### 陣列操作

- **新增元素**：

  ```javascript
  const fruits = ["蘋果", "香蕉"];
  fruits.push("橘子"); // 加入尾端
  fruits.unshift("葡萄"); // 加入開頭
  ```

- **刪除元素**：

  ```javascript
  fruits.pop(); // 移除尾端
  fruits.shift(); // 移除開頭
  fruits.splice(1, 1); // 移除索引 1 的元素
  ```

- **遍歷陣列**：

  ```javascript
  fruits.forEach((fruit) => console.log(fruit));
  const newFruits = fruits.map((fruit) => fruit + "!");
  ```

---

### 5\. 常見問題與解決方法

#### Q1：為什麼在 React 中更新物件或陣列時需要使用展開運算子？

在 React 中，state 是不可變的（immutable）。直接修改 state（例如 `formData.name = "新名字"` 或 `todos.push("新項目")`）不會觸發元件重新渲染。正確做法是創建一個新的物件或陣列，並使用 setState 更新：

```javascript
setFormData({ ...formData, name: "新名字" });
setTodos([...todos, "新項目"]);
```

#### Q2：如何在物件中巢狀陣列或陣列中巢狀物件？

- **巢狀陣列**：

  ```javascript
  const person = {
    name: "小明",
    hobbies: ["跑步", "游泳"],
  };
  person.hobbies.push("閱讀"); // 更新巢狀陣列
  ```

- **巢狀物件**：

  ```javascript
  const students = [
    { id: 1, name: "小明" },
    { id: 2, name: "小華" },
  ];
  const updatedStudents = students.map((student) =>
    student.id === 1 ? { ...student, name: "小明2" } : student
  );
  ```
