---
title: 在TypeScript中使用函式
description: 學習 TypeScript 函式的定義與使用，包含函式型別、參數型別、回傳型別、可選參數、預設參數等功能
keywords:
  [
    TypeScript,
    函式,
    函式型別,
    參數型別,
    回傳型別,
    可選參數,
    預設參數,
    函式簽名,
    型別註記,
  ]
---

### 1\. **在 TypeScript 中使用函式，並啟用 noUnusedParameters 設定**

**說明**：

- TypeScript 的 noUnusedParameters 編譯器選項會確保函式中的每個參數都被使用。如果有未使用的參數，編譯器會報錯。

- 這有助於避免撰寫無意義的參數，保持程式碼乾淨。

**實作步驟**：

1. 在 tsconfig.json 中啟用 noUnusedParameters。

2. 撰寫函式，確保每個參數都在函式內被使用。

**程式碼範例**：

```tsx
// tsconfig.json
{
  "compilerOptions": {
    "noUnusedParameters": true,
    "strict": true
  }
}
```

```tsx
// example.ts
function greet(name: string, greeting: string): string {
  return `${greeting}, ${name}!`; // 兩個參數都被使用
}

// 錯誤範例：未使用參數會導致編譯錯誤
function badGreet(name: string, greeting: string): string {
  return `Hello, ${name}!`; // greeting 未使用，會報錯
}
```

**解釋**：

- 在 greet 函式中，name 和 greeting 都被用於回傳值，符合 noUnusedParameters 要求。

- 如果像 badGreet 這樣有一個參數未使用，編譯器會報錯："Parameter 'greeting' is declared but never used."

---

### 2\. **用比參數少的引數呼叫函式：定義選擇性參數或預設值**

**說明**：

- TypeScript 支援選擇性參數（使用 ?）和預設參數值，讓函式可以接受比參數少的引數。

- 選擇性參數表示該參數可以省略，預設值則在省略時提供一個值。

**實作步驟**：

1. 使用 ? 定義選擇性參數，或在參數後加上 = 預設值。

2. 呼叫函式時省略部分參數，測試效果。

**程式碼範例**：

```tsx
// 選擇性參數
function introduce(name: string, age?: number): string {
  if (age !== undefined) {
    return `我是 ${name}，今年 ${age} 歲。`;
  }
  return `我是 ${name}。`;
}

// 預設參數
function sayHello(name: string, greeting: string = "你好"): string {
  return `${greeting}, ${name}!`;
}

// 測試呼叫
console.log(introduce("小明")); // 輸出：我是 小明。
console.log(introduce("小明", 25)); // 輸出：我是 小明，今年 25 歲。
console.log(sayHello("小華")); // 輸出：你好, 小華!
console.log(sayHello("小華", "哈囉")); // 輸出：哈囉, 小華!
```

**解釋**：

- introduce 的 age 是選擇性參數，呼叫時可以省略，函式內使用 undefined 檢查。

- sayHello 的 greeting 有預設值 "你好"，省略時會使用預設值。

- 這兩種方式都能讓函式接受比參數少的引數。

---

### 3\. **用比參數多的引數呼叫函式：使用其餘參數（Rest Parameter）**

**說明**：

- TypeScript 的其餘參數（使用 ... 語法）允許函式接受任意數量的引數，這些引數會被收集到一個陣列中。

- 這適合處理引數數量不確定的情況。

**實作步驟**：

1. 在函式參數中使用 ... 定義其餘參數，並指定型別。

2. 呼叫函式時傳入多個引數，測試其餘參數的收集。

**程式碼範例**：

```tsx
function sumNumbers(base: number, ...numbers: number[]): number {
  return base + numbers.reduce((sum, num) => sum + num, 0);
}

// 測試呼叫
console.log(sumNumbers(10)); // 輸出：10
console.log(sumNumbers(10, 20, 30)); // 輸出：60
console.log(sumNumbers(5, 1, 2, 3, 4)); // 輸出：15
```

**解釋**：

- base 是固定參數，...numbers 收集其餘的引數到一個 number\[\] 陣列。

- 即使傳入多於一個的引數（如 20, 30 或更多），numbers 會將它們收集並處理。

- 若無額外引數，numbers 為空陣列，reduce 回傳初始值 0。

---

### 4\. **限制參數值與回傳值的型別：使用型別註記**

**說明**：

- TypeScript 使用型別註記（: 型別）來限制參數和回傳值的型別，確保型別安全。

- 這有助於在編譯時捕捉型別錯誤。

**實作步驟**：

1. 在函式參數後加上 : 型別，在函式後加上 : 回傳型別。

2. 測試不同型別的引數，檢查編譯器是否報錯。

**程式碼範例**：

```tsx
function calculateArea(width: number, height: number): number {
  return width * height;
}

// 正確呼叫
console.log(calculateArea(5, 10)); // 輸出：50

// 錯誤呼叫：型別不符
// console.log(calculateArea("5", 10)); // 編譯錯誤：Argument of type 'string' is not assignable to parameter of type 'number'.
```

**解釋**：

- width 和 height 被限制為 number 型別，回傳值也是 number。

- 如果傳入非 number 型別（如字串），編譯器會報錯，確保型別正確。

---

### 5\. **防止 null 值被當成函式引數：啟用 strictNullChecks 設定**

**說明**：

- strictNullChecks 編譯器選項要求明確處理 null 和 undefined，防止它們被錯誤傳入函式。

- 這確保參數必須是指定型別，不能是 null 或 undefined。

**實作步驟**：

1. 在 tsconfig.json 中啟用 strictNullChecks。

2. 撰寫函式，確保參數不接受 null 或 undefined。

**程式碼範例**：

```tsx
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

```tsx
function printName(name: string): void {
  console.log(`名字是：${name}`);
}

// 正確呼叫
printName("小明"); // 輸出：名字是：小明

// 錯誤呼叫
// printName(null); // 編譯錯誤：Argument of type 'null' is not assignable to parameter of type 'string'.
// printName(undefined); // 編譯錯誤：Argument of type 'undefined' is not assignable to parameter of type 'string'.
```

**解釋**：

- 啟用 strictNullChecks 後，name 必須是 string，不能是 null 或 undefined。

- 如果需要允許 null，可以明確使用聯合型別，如 string | null。

---

### 6\. **確保函式中的所有執行途徑都有用 return 回傳值：啟用 noImplicitReturns 設定**

**說明**：

- noImplicitReturns 要求函式中所有可能的執行路徑都必須有 return 陳述式，否則編譯器會報錯。

- 這防止遺漏回傳值的情況。

**實作步驟**：

1. 在 tsconfig.json 中啟用 noImplicitReturns。

2. 撰寫函式，確保每個分支都有 return。

**程式碼範例**：

```tsx
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitReturns": true
  }
}
```

```tsx
function getStatus(score: number): string {
  if (score >= 60) {
    return "及格";
  }
  return "不及格"; // 確保每個路徑都有 return
}

// 錯誤範例：缺少 return
function badStatus(score: number): string {
  if (score >= 60) {
    return "及格";
  }
  // 編譯錯誤：Not all code paths return a value.
}
```

**解釋**：

- getStatus 在所有路徑（score >= 60 和其他情況）都有 return，符合要求。

- badStatus 在 score < 60 的路徑缺少 return，編譯器會報錯。

---

### 7\. **描述函式參數的型別與回傳值之間的關係：使用型別多載**

**說明**：

- 型別多載（Function Overloading）允許為同一函式定義多種參數和回傳值型別的組合，描述它們之間的關係。

- 這在參數型別影響回傳型別時特別有用。

**實作步驟**：

1. 在函式實現前定義多個型別簽名（signature）。

2. 提供一個通用實現，涵蓋所有簽名。

**程式碼範例**：

```tsx
// 型別多載
function convertToString(input: number): string;
function convertToString(input: string): string;
function convertToString(input: boolean): string;
function convertToString(input: number | string | boolean): string {
  return input.toString();
}

// 測試呼叫
console.log(convertToString(123)); // 輸出："123"
console.log(convertToString("hello")); // 輸出："hello"
console.log(convertToString(true)); // 輸出："true"
```

**解釋**：

- 定義了三個型別簽名，分別處理 number、string 和 boolean 輸入，保證回傳 string。

- 實現函式使用聯合型別 number | string | boolean，並用 toString() 處理所有情況。

- 型別多載讓編譯器知道輸入型別與回傳型別的關係，確保型別安全。

#### 什麼是型別多載？

型別多載允許為同一個函式定義多個型別簽名（signature），每個簽名指定不同的參數型別和回傳型別組合。TypeScript 會根據呼叫時的引數型別選擇最適合的簽名，確保型別安全。最終的實現（implementation）必須能兼容所有簽名。

**實作步驟**：

1. 在函式實現前，定義多個型別簽名，指定參數型別和回傳型別。

2. 撰寫一個通用實現，確保能處理所有簽名指定的型別。

3. 測試不同輸入，確認 TypeScript 正確推斷回傳型別。

以下是多個範例，涵蓋不同情境：

---

#### 範例 1：處理不同型別的輸入，統一回傳字串

**情境**：一個函式 formatValue 根據輸入的型別（數字、布林值、字串）格式化為字串，並加上前綴。

**程式碼**：

```tsx
// 型別多載簽名
function formatValue(input: number): string;
function formatValue(input: boolean): string;
function formatValue(input: string): string;

// 實現
function formatValue(input: number | boolean | string): string {
  if (typeof input === "number") {
    return `數字: ${input}`;
  } else if (typeof input === "boolean") {
    return `布林: ${input ? "是" : "否"}`;
  }
  return `字串: ${input}`;
}

// 測試
console.log(formatValue(42)); // 輸出：數字: 42
console.log(formatValue(true)); // 輸出：布林: 是
console.log(formatValue("哈囉")); // 輸出：字串: 哈囉
```

**解釋**：

- 定義了三個型別簽名，分別處理 number、boolean 和 string，都回傳 string。

- 實現中用 typeof 檢查輸入型別，根據型別提供不同的格式化邏輯。

- TypeScript 會根據輸入型別選擇對應的簽名，確保回傳值是 string。

---

#### 範例 2：根據參數數量和型別決定回傳型別

**情境**：一個函式 combine 根據輸入的參數數量和型別，返回不同型別的結果：

- 如果只有一個數字，返回數字的平方。

- 如果有兩個字串，返回它們的串接。

- 如果有數字和字串，返回帶前綴的字串。

**程式碼**：

```tsx
// 型別多載簽名
function combine(num: number): number;
function combine(str1: string, str2: string): string;
function combine(num: number, prefix: string): string;

// 實現
function combine(arg1: number | string, arg2?: string): number | string {
  if (typeof arg1 === "number" && arg2 === undefined) {
    return arg1 * arg1; // 回傳平方
  } else if (typeof arg1 === "string" && typeof arg2 === "string") {
    return arg1 + arg2; // 回傳串接字串
  } else if (typeof arg1 === "number" && typeof arg2 === "string") {
    return `${arg2}: ${arg1}`; // 回傳前綴字串
  }
  throw new Error("無效的輸入組合");
}

// 測試
console.log(combine(5)); // 輸出：25
console.log(combine("哈囉", "世界")); // 輸出：哈囉世界
console.log(combine(42, "數字")); // 輸出：數字: 42
// console.log(combine("哈囉")); // 編譯錯誤：無匹配的簽名
```

**解釋**：

- 三個簽名分別定義了：

  1.  單個 number 參數，回傳 number。

  2.  兩個 string 參數，回傳 string。

  3.  一個 number 和一個 string，回傳 string。

- 實現中使用 typeof 和條件檢查來處理不同情況。

- 如果呼叫不符合任何簽名（如單個字串），編譯器會報錯，確保型別安全。

---

#### 範例 3：處理陣列與單一值的型別多載

**情境**：一個函式 getLength 可以接受單一字串或字串陣列，返回對應的長度（字串長度或陣列長度）。

**程式碼**：

```tsx
// 型別多載簽名
function getLength(input: string): number;
function getLength(input: string[]): number;

// 實現
function getLength(input: string | string[]): number {
  if (typeof input === "string") {
    return input.length; // 回傳字串長度
  }
  return input.length; // 回傳陣列長度
}

// 測試
console.log(getLength("哈囉")); // 輸出：2
console.log(getLength(["蘋果", "香蕉", "橘子"])); // 輸出：3
// console.log(getLength(123)); // 編譯錯誤：無匹配的簽名
```

**解釋**：

- 兩個簽名分別處理 string 和 string\[\]，都回傳 number。

- 實現中根據 input 的型別（字串或陣列）使用 .length 屬性。

- TypeScript 確保只有 string 或 string\[\] 可以傳入，其他型別會報錯。

---

#### 範例 4：結合選擇性參數與型別多載

**情境**：一個函式 buildMessage 根據是否提供 prefix 參數，返回不同格式的訊息：

- 如果只有 message（字串），回傳純訊息。

- 如果有 message 和 prefix，回傳帶前綴的訊息。

- 如果輸入是數字，回傳格式化的數字訊息。

**程式碼**：

```tsx
// 型別多載簽名
function buildMessage(message: string): string;
function buildMessage(message: string, prefix: string): string;
function buildMessage(message: number): string;

// 實現
function buildMessage(message: string | number, prefix?: string): string {
  if (typeof message === "number") {
    return `數字訊息: ${message}`;
  }
  if (prefix) {
    return `${prefix}: ${message}`;
  }
  return message;
}

// 測試
console.log(buildMessage("哈囉")); // 輸出：哈囉
console.log(buildMessage("世界", "問候")); // 輸出：問候: 世界
console.log(buildMessage(100)); // 輸出：數字訊息: 100
```

**解釋**：

- 三個簽名定義了：

  1.  單個 string，回傳 string。

  2.  兩個 string（message 和 prefix），回傳 string。

  3.  單個 number，回傳 string。

- 實現中檢查 message 的型別和 prefix 是否存在，根據情況返回不同格式。

- 選擇性參數 prefix 讓函式更靈活，型別多載確保回傳型別明確。

---

#### 範例 5：進階情境 - 處理物件與聯合型別

**情境**：一個函式 describeItem 接受不同型別的物件（Person 或 Product），根據物件型別返回描述字串。

**程式碼**：

```tsx
interface Person {
  name: string;
  age: number;
}

interface Product {
  id: string;
  price: number;
}

// 型別多載簽名
function describeItem(item: Person): string;
function describeItem(item: Product): string;

// 實現
function describeItem(item: Person | Product): string {
  if ("name" in item) {
    return `人: ${item.name}, 年齡: ${item.age}`;
  }
  return `產品: ${item.id}, 價格: ${item.price}`;
}

// 測試
const person: Person = { name: "小明", age: 25 };
const product: Product = { id: "P001", price: 100 };
console.log(describeItem(person)); // 輸出：人: 小明, 年齡: 25
console.log(describeItem(product)); // 輸出：產品: P001, 價格: 100
// console.log(describeItem({ name: "小華" })); // 編譯錯誤：無匹配的簽名
```

**解釋**：

- 兩個簽名分別處理 Person 和 Product 型別的物件，回傳 string。

- 實現中使用 in 運算子檢查物件屬性，判斷是哪種型別。

- 這展示了型別多載在處理複雜物件型別時的靈活性。

---

#### 實作與測試步驟

1. **設定 TypeScript 環境**：

   - 確保你的 tsconfig.json 包含以下設定：

     ```tsx
     {
       "compilerOptions": {
         "strict": true,
         "noUnusedParameters": true,
         "noImplicitReturns": true
       }
     }
     ```

2. **儲存程式碼**：

   - 將每個範例儲存為獨立的 .ts 檔案（例如 example1.ts, example2.ts）。

3. **編譯與執行**：

   - 使用命令 tsc example1.ts 編譯。

   - 使用 node example1.js 執行，檢查輸出。

4. **測試錯誤情況**：

   - 嘗試傳入不符合簽名的引數（例如 formatValue(123n)），確認 TypeScript 報錯。

---

#### 總結

這些範例展示了型別多載在不同情境下的應用：

- **範例 1**：處理基本型別（number, boolean, string），統一回傳字串。

- **範例 2**：根據參數數量和型別返回不同型別（number 或 string）。

- **範例 3**：處理單一值與陣列，統一回傳長度。

- **範例 4**：結合選擇性參數，靈活處理不同輸入。

- **範例 5**：處理複雜物件型別，根據屬性動態生成描述。

---

### 總結

以下是所有要求和對應的 tsconfig.json 設定：

```tsx
{
  "compilerOptions": {
    "noUnusedParameters": true, // 確保參數被使用
    "strictNullChecks": true,   // 防止 null/undefined
    "noImplicitReturns": true,  // 確保所有路徑有 return
    "strict": true             // 啟用嚴格模式，包含 strictNullChecks
  }
}
```

**完整範例程式碼**（整合所有要求）：

```tsx
// 型別多載
function processData(input: number): string;
function processData(input: string, prefix?: string): string;
function processData(input: number | string, prefix: string = "資料"): string {
  if (typeof input === "number") {
    return `${prefix}: ${input.toString()}`;
  }
  return `${prefix}: ${input}`;
}

// 其餘參數
function combineStrings(base: string, ...extras: string[]): string {
  return base + extras.join(", ");
}

// 測試
console.log(processData(42)); // 輸出：資料: 42
console.log(processData("test", "前綴")); // 輸出：前綴: test
console.log(combineStrings("開始", "A", "B", "C")); // 輸出：開始, A, B, C
```

**操作步驟**：

1. 建立一個 TypeScript 專案，新增 tsconfig.json 並設定上述選項。

2. 將程式碼儲存為 example.ts。

3. 使用 tsc example.ts 編譯，檢查是否有錯誤。

4. 使用 Node.js 執行編譯後的 JavaScript 文件：node example.js。

這些範例和設定應該能讓你清楚理解並輕鬆實作 TypeScript 函式的各種要求。如果有任何問題，歡迎繼續提問！
