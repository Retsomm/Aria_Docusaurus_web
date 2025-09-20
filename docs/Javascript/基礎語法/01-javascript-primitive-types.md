---
title: JavaScript 中的原始型別（Primitive Types）
description: 深入了解 JavaScript 的七種原始型別，包含 Number、String、Boolean、Undefined、Null、Symbol、BigInt 的特性與使用方法
keywords:
  [
    JavaScript,
    原始型別,
    Primitive Types,
    Number,
    String,
    Boolean,
    Undefined,
    "Null",
    Symbol,
    BigInt,
    資料型別,
  ]
---

### 1\. 原始型別（Primitive Types）

在 JavaScript 中，原始型別是基本的資料型別，儲存在記憶體中是值的複製，無法再被拆解。它們不具備方法或屬性，但透過「自動裝箱」（Autoboxing），JavaScript 會暫時將它們轉為對應的包裹物件來執行方法。以下是七種原始型別：

- **Number**：表示數字（整數或浮點數），例如 42 或 3.14。

- **String**：表示文字或字串，例如 "Hello"。

- **Boolean**：表示布林值，只有 true 或 false。

- **Undefined**：表示變數已宣告但未賦值，例如 let x;。

- **Null**：表示空值或無值，例如 null。

- **Symbol**：表示唯一的識別符（ES6 引入），例如 Symbol("id")。

- **BigInt**：表示大於 Number 範圍的整數（ES2020 引入），例如 12345678901234567890n。

### 2\. 包裹物件（Wrapper Objects）

由於原始型別本身不可變（Immutable）且不具備方法或屬性，JavaScript 提供了對應的包裹物件，讓你能對原始型別使用方法。當你對原始型別呼叫方法時，JavaScript 會：

1. 自動將原始型別轉為對應的包裹物件（自動裝箱）。

2. 執行包裹物件的方法或屬性。

3. 銷毀包裹物件並回傳原始型別。

**對應關係**：

- 原始型別 string → 包裹物件 String

- 原始型別 number → 包裹物件 Number

- 原始型別 boolean → 包裹物件 Boolean

---

## 二、包裹物件的運作機制與範例

以下詳細介紹 String、Number 和 Boolean 包裹物件的運作方式，並提供完整的程式碼範例，讓你能在瀏覽器中操作。

### 1\. String 物件

String 物件為 string 原始型別提供方法（如 toUpperCase()、substring()）和屬性（如 length）。

#### 範例程式碼

```javascript
// 基本型別：字串
let text = "JavaScript 很棒";

// 使用 String 物件的方法
console.log(text.toUpperCase()); // 輸出：JAVASCRIPT 很棒
console.log(text.substring(0, 10)); // 輸出：JavaScript
console.log(text.length); // 輸出：11

// 顯式建立 String 物件
let strObj = new String("Hello");
console.log(strObj); // 輸出：String { "Hello" }
console.log(typeof strObj); // 輸出："object"
console.log(strObj.toUpperCase()); // 輸出：HELLO
console.log(typeof text); // 輸出："string"
```

#### 操作步驟

1. 開啟瀏覽器，按下 **F12** 打開開發者工具，切到 **Console** 標籤。

2. 將上述程式碼逐行複製貼到 Console 中，按 Enter 執行，觀察輸出結果。

3. 試著用其他 String 方法，例如：

   ```javascript
   console.log(text.split(" ")); // 輸出：["JavaScript", "很棒"]
   console.log(text.charAt(0)); // 輸出："J"
   ```

#### 注意事項

- new String("Hello") 建立的是物件，typeof 回傳 "object"，而非 "string"。

- 基本型別 string 經過自動裝箱後，行為與 String 物件類似，但記憶體使用更高效。

- 建議直接使用基本型別 string，避免顯式使用 new String()，因為物件比較可能導致問題（例如 str1 === str2 為 false）。

---

### 2\. Number 物件

Number 物件為 number 原始型別提供方法（如 toFixed()、toString()）。

#### 範例程式碼

```javascript
// 基本型別：數字
let num = 123.456;

// 使用 Number 物件的方法
console.log(num.toFixed(2)); // 輸出："123.46"（四捨五入到2位小數，回傳字串）
console.log(num.toString()); // 輸出："123.456"

// 顯式建立 Number 物件
let numObj = new Number(42);
console.log(numObj); // 輸出：Number { 42 }
console.log(typeof numObj); // 輸出："object"
console.log(numObj.toFixed(2)); // 輸出："42.00"
```

#### 操作步驟

1. 在瀏覽器 Console 中，複製貼上上述程式碼，逐行執行並觀察輸出。

2. 試著修改程式碼，例如：

   ```javascript
   console.log(num.toFixed(0)); // 輸出："123"
   console.log(num.toPrecision(4)); // 輸出："123.5"
   ```

3. 比較 num（基本型別）和 numObj（包裹物件）的 typeof 結果。

#### 注意事項

- toFixed(2) 會四捨五入並回傳字串型別（例如 "123.46"）。

- 顯式建立的 Number 物件（new Number(42)）與基本型別 number 不相等，例如 new Number(42) !== 42。

- 建議避免使用 new Number()，直接用基本型別 number 即可。

---

### 3\. Boolean 物件

Boolean 物件為 boolean 原始型別提供方法（如 toString()），但實際上較少使用，因為 boolean 本身已足夠簡單。

#### 範例程式碼

```javascript
// 基本型別：布林值
let isValid = true;

// 使用 Boolean 物件的方法
console.log(isValid.toString()); // 輸出："true"

// 顯式建立 Boolean 物件
let boolObj = new Boolean(false);
console.log(boolObj); // 輸出：Boolean { false }
console.log(typeof boolObj); // 輸出："object"
console.log(boolObj.toString()); // 輸出："false"

// 注意：Boolean 物件在條件判斷中的行為
if (boolObj) {
  console.log("這是 true"); // 會輸出，因為 boolObj 是物件（非空值）
}
console.log(boolObj.valueOf()); // 輸出：false（取出基本型別值）
```

#### 操作步驟

1. 在瀏覽器 Console 中，複製貼上上述程式碼，逐行執行並觀察輸出。

2. 測試 boolObj 在 if 條件中的行為，確認即使 boolObj 是 false，仍會進入 if 區塊。

3. 試著用 boolObj.valueOf() 取出基本型別值，觀察結果。

#### 注意事項

- new Boolean(false) 建立的物件在條件判斷中為 true，因為任何物件都是非空值。

- 建議避免使用 new Boolean()，直接使用基本型別 boolean 即可。

---

## 三、包裹物件的注意事項

1. **基本型別 vs 包裹物件**：

   - 基本型別（string、number、boolean）記憶體使用較少，效率較高。

   - 包裹物件（new String()、new Number()、new Boolean()）是真正的物件，記憶體開銷較大，且可能導致型別比較問題。

   - 範例：

      ```javascript
      let str1 = "hello"; // 基本型別
      let str2 = new String("hello"); // 包裹物件
      console.log(str1 === str2); // 輸出：false（型別不同）
      console.log(str1 === str2.valueOf()); // 輸出：true（取出基本型別值）
      ```



1. **自動裝箱的限制**：

   - 基本型別無法直接新增屬性，因為自動裝箱的包裹物件是暫時的，操作完即銷毀。

   - 範例：

      ```javascript
      let str = "hello";
      str.customProp = "test"; // 試圖新增屬性
      console.log(str.customProp); // 輸出：undefined（屬性未保留）
      ```

2. **建議**：

   - 直接使用基本型別，依靠自動裝箱即可滿足需求。

   - 避免顯式使用 new String()、new Number() 或 new Boolean()，以免型別判斷或比較時出錯。

---

## 四、型別轉換（Type Conversion/Type Coercion）

### 1\. 顯式轉換（Explicit Conversion）

開發者主動使用方法將一種型別轉為另一種型別。

- **轉為字串**：String() 或 .toString()

- **轉為數字**：Number()、parseInt()、parseFloat()

- **轉為布林值**：Boolean()

#### 範例程式碼

```javascript
// 顯式轉換
let num = 123.456;
console.log(String(num)); // 輸出："123.456"
console.log(num.toString()); // 輸出："123.456"

let str = "42";
console.log(Number(str)); // 輸出：42
console.log(parseInt(str)); // 輸出：42
console.log(parseFloat("3.14")); // 輸出：3.14

let value = 0;
console.log(Boolean(value)); // 輸出：false
```

#### 操作步驟

1. 在瀏覽器 Console 中，複製貼上上述程式碼，執行並觀察輸出。

2. 試著修改輸入，例如：

   ```javascript
   console.log(parseInt("123abc")); // 輸出：123
   console.log(Number("abc")); // 輸出：NaN
   ```

---

### 2\. 隱式轉換（Type Coercion）

JavaScript 在某些運算（如 + 或 ==）中會自動轉換型別，可能導致意外結果。

#### 範例程式碼

```javascript
let value1 = "5";
let value2 = 10;

console.log(value1 + value2); // 輸出："510"（字串拼接）
console.log(value1 - value2); // 輸出：-5（字串轉數字）
console.log(!value1); // 輸出：false（字串轉布林）
```

#### 操作步驟

1. 在 Console 中執行上述程式碼，觀察不同運算的結果。

2. 試著用其他運算，例如：

   ```javascript
   console.log(value1 * value2); // 輸出：50（字串轉數字）
   ```

---

## 五、型別比較（Type Comparison）

### 1\. 寬鬆比較（==）

會進行隱式型別轉換，比較值是否相等，可能導致意外結果。

### 2\. 嚴格比較（===）

不進行型別轉換，值和型別都必須相等，建議在開發中一律使用。

#### 範例程式碼

```javascript
let value1 = "42";
let value2 = 42;

console.log(value1 == value2); // 輸出：true（字串轉數字）
console.log(value1 === value2); // 輸出：false（型別不同）
console.log(value1 != value2); // 輸出：false
console.log(value1 !== value2); // 輸出：true
```

#### 操作步驟

1. 在 Console 中執行上述程式碼，觀察比較結果。

2. 試著用其他值比較，例如：

   ```javascript
   console.log("0" == false); // 輸出：true（隱式轉換）
   console.log("0" === false); // 輸出：false
   ```

---

## 六、實作練習：React 應用結合型別轉換與比較

以下是一個完整的 React 組件，結合輸入、型別轉換與比較，讓使用者輸入兩個值並進行比較。

### 完整程式碼

```javascript
import React, { useState } from "react";

function TypeDemoApp() {
  // 定義兩個輸入值的 state
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [result, setResult] = useState("");

  // 處理比較邏輯
  const handleCompare = () => {
    // 顯式轉換為數字
    const num1 = Number(value1);
    const num2 = Number(value2);

    // 檢查是否為有效數字
    if (isNaN(num1) || isNaN(num2)) {
      setResult("請輸入有效數字");
      return;
    }

    // 使用嚴格比較
    if (num1 === num2) {
      setResult(`${num1} 等於 ${num2}`);
    } else {
      setResult(`${num1} 不等於 ${num2}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>型別轉換與比較練習</h1>
      <input
        type="text"
        value={value1}
        onChange={(e) => setValue1(e.target.value)}
        placeholder="輸入第一個值"
        style={{ marginRight: "10px" }}
      />
      <input
        type="text"
        value={value2}
        onChange={(e) => setValue2(e.target.value)}
        placeholder="輸入第二個值"
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleCompare}>比較</button>
      <p>結果: {result}</p>
    </div>
  );
}

export default TypeDemoApp;
```

### 操作步驟

1. 在你的 React 專案中，建立一個新檔案 src/TypeDemoApp.js，並複製貼上上述程式碼。

2. 在 src/App.js 中引入並使用組件：

   ```javascript
   import React from "react";
   import TypeDemoApp from "./TypeDemoApp";
   
   function App() {
     return (
       <div>
         <TypeDemoApp />
       </div>
     );
   }
   
   export default App;
   ```

3. 執行專案：

   - 在終端機中，進入專案資料夾，執行 npm start。

   - 瀏覽器會自動打開，顯示輸入框和按鈕。

4. 在輸入框中輸入兩個值（例如 42 和 42），點擊「比較」按鈕，觀察結果。

5. 試著輸入非數字值（例如 abc），觀察錯誤訊息。

6. 修改程式碼，嘗試用寬鬆比較（==）取代嚴格比較（===），觀察結果差異。

### 程式碼說明

- 使用 useState 管理兩個輸入框的值和比較結果。

- 使用 Number() 將輸入值轉為數字，並用 isNaN 檢查是否為有效數字。

- 使用嚴格比較（===）確保型別和值都相等，避免隱式轉換的錯誤。

- 簡單的 style 屬性讓輸入框和按鈕有間距，UI 更清晰。

---

## 七、總結與建議

1. **原始型別與包裹物件**：

   - 原始型別（string、number、boolean）是高效的，建議直接使用。

   - 透過自動裝箱，JavaScript 讓原始型別也能使用方法（如 toUpperCase()、toFixed()）。

   - 避免顯式使用 new String()、new Number()、new Boolean()，以免型別比較問題。

2. **型別轉換**：

   - 使用顯式轉換（Number()、String()、Boolean()）確保程式行為可預測。

   - 隱式轉換可能導致錯誤，應謹慎使用。

3. **型別比較**：

   - 優先使用嚴格比較（=== 和 !==），避免隱式轉換的意外結果。

4. **實作練習**：

   - 透過上述 React 應用，練習輸入處理、型別轉換與比較。

   - 嘗試擴展功能，例如加入更多運算（加、減）或顯示型別（typeof）。