---
title: TypeScript 靜態型別
description: 深入了解 TypeScript 靜態型別系統，包含型別註記、型別推論、基本型別、聯合型別、介面等核心概念
keywords:
  [TypeScript, 靜態型別, 型別註記, 型別推論, 基本型別, 聯合型別, 介面, 型別系統]
---

### 1\. **指定型別：使用型別註記 (Type Annotation) 或允許編譯器推論型別**

**解釋**：\
 在 TypeScript 中，靜態型別是指在編譯時期就為變數、參數或回傳值指定明確的型別。指定型別有兩種方式：

- **型別註記 (Type Annotation)**：你明確告訴 TypeScript 某個變數的型別。

- **型別推論 (Type Inference)**：如果沒明確指定型別，TypeScript 會根據變數的初始值自動推斷型別。

**範例程式碼**：

```tsx
// 使用型別註記明確指定型別
let username: string = "小明";
let age: number = 25;

// 型別推論：TypeScript 根據初始值推斷型別
let email = "xiaoming@example.com"; // TypeScript 推斷為 string
let count = 10; // TypeScript 推斷為 number

// 錯誤範例：若違反型別，編譯器會報錯
username = 123; // 錯誤：Type 'number' is not assignable to type 'string'
```

**操作步驟**：

1. 當你宣告變數時，若想明確指定型別，使用 : 後接型別名稱（如 string、number）。

2. 若不指定型別，TypeScript 會根據初始值推斷型別。

3. 在 VS Code 中，若滑鼠懸停在變數上，可看到 TypeScript 推斷的型別。

4. 若嘗試賦值不符合型別的值，TypeScript 編譯器會報錯，確保型別安全。

---

### 2\. **檢查編譯器推論的型別：啟用編譯器選項 declaration，檢查編譯後的程式碼**

**解釋**：\
 TypeScript 編譯器可以生成 .d.ts 宣告檔，這些檔案包含程式碼的型別資訊，方便檢查 TypeScript 推論的型別是否正確。啟用 declaration 選項後，編譯器會為每個 .ts 檔案生成對應的 .d.ts 檔案。

**操作步驟**：

1. 在專案根目錄的 tsconfig.json 中，啟用 declaration 選項：

   ```json
   {
     "compilerOptions": {
       "declaration": true,
       "outDir": "./dist"
     }
   }
   ```

2. 編譯 TypeScript 程式碼（執行 tsc 命令）。

3. 查看生成的 .d.ts 檔案，檢查變數、函數等的型別是否符合預期。

**範例程式碼**：

```tsx
// index.ts
let username = "小明";
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

**編譯後的 .d.ts 檔案**：

```tsx
// index.d.ts
declare let username: string;
declare function greet(name: string): string;
```

**說明**：

- .d.ts 檔案顯示 username 被推論為 string，greet 函數的參數和回傳值也明確標示為 string。

- 檢查 .d.ts 檔案可確認 TypeScript 是否正確推論型別。

---

### 3\. **允許使用 any 型別：指名型別為 any 或 unknown**

**解釋**：

- any 型別允許變數接受任何型別的值，TypeScript 不會對其進行型別檢查，適合用於無法預知型別的情況，但會降低型別安全性。

- unknown 是更安全的替代方案，必須在操作前進行型別檢查或斷言。

**範例程式碼**：

```tsx
// 使用 any 型別
let data: any = "小明";
data = 123; // 不會報錯
data = true; // 不會報錯

// 使用 unknown 型別
let value: unknown = "小明";
value = 123; // 不會報錯
// value.toUpperCase(); // 錯誤：需先進行型別檢查
if (typeof value === "string") {
  console.log(value.toUpperCase()); // 安全：已確認是 string
}
```

**操作建議**：

- 盡量避免使用 any，因為它會關閉型別檢查，可能導致運行時錯誤。

- 使用 unknown 時，必須搭配型別檢查（如 typeof 或型別斷言），以確保型別安全。

---

### 4\. **禁止編譯器推論型別為 any：啟用編譯器選項 noImplicitAny**

**解釋**：\
當 TypeScript 無法推論變數或參數的型別時，預設會將其視為 any。啟用 noImplicitAny 選項後，TypeScript 會要求你明確指定型別，否則會報錯。

**操作步驟**：

1. 在 tsconfig.json 中啟用 noImplicitAny：

   ```json
   {
     "compilerOptions": {
       "noImplicitAny": true
     }
   }
   ```

2. 編譯程式碼，若有未指定型別的變數或參數，TypeScript 會報錯。

   **範例程式碼**：

   ```tsx
   // 未啟用 noImplicitAny
   function add(a, b) {
     return a + b; // TypeScript 推論 a, b 為 any
   }

   // 啟用 noImplicitAny
   function add(a: number, b: number): number {
     return a + b; // 正確：必須明確指定型別
   }

   // 錯誤範例
   function multiply(x, y) {
     return x * y; // 錯誤：Parameter 'x' implicitly has an 'any' type
   }
   ```

   **說明**：

   - 啟用 noImplicitAny 後，必須為所有參數和變數指定型別，增加程式碼的型別安全性。

---

### 5\. **合併型別：使用型別聯集 (Type Union)**

**解釋**：\
 型別聯集允許變數接受多種型別，使用 | 符號來定義。例如，某變數可以是 string 或 number。

**範例程式碼**：

```tsx
let id: string | number;
id = "ABC123"; // 正確
id = 123; // 正確
id = true; // 錯誤：Type 'boolean' is not assignable to type 'string | number'

// 函數中使用型別聯集
function printValue(value: string | number): void {
  console.log(value);
}
printValue("小明"); // 正確
printValue(25); // 正確
```

**操作建議**：

- 使用型別聯集時，若需要操作特定型別的屬性，需先進行型別檢查（見後面的型別防衛）。

- 型別聯集適用於變數可能有多種型別的情況，如 API 回傳值。

---

### 6\. **覆寫編譯器預期的型別：使用型別斷言 (Type Assertion)**

**解釋**：\
 型別斷言允許你告訴 TypeScript 你比編譯器更了解某個值的型別，使用 as 關鍵字或尖括號 `<型別>`。

**範例程式碼**：

```tsx
// 型別斷言
let someValue: any = "這是一個字串";
let strLength: number = (someValue as string).length; // 使用 as 斷言為 string
// 或者
let strLength2: number = (<string>someValue).length; // 使用尖括號斷言
// 實際應用：DOM 操作
let element = document.getElementById("myInput") as HTMLInputElement;
element.value = "Hello"; // 正確：已斷言為 HTMLInputElement
```

**操作建議**：

- 型別斷言僅在你確定值的型別時使用，否則可能導致運行時錯誤。

- 常見於處理 DOM 元素或從外部 API 獲取的資料。

---

### 7\. **查驗一個值的基本型別：使用 typeof 算符寫出型別防衛敘述 (Type Guard)**

**解釋**：\
 型別防衛是透過條件檢查來縮小型別範圍的技術，常用 typeof 檢查基本型別（如 string、number），確保後續操作符合型別。

**範例程式碼**：

```tsx
function processValue(value: string | number): void {
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // TypeScript 知道 value 是 string
  } else {
    console.log(value.toFixed(2)); // TypeScript 知道 value 是 number
  }
}

processValue("小明"); // 輸出：小明
processValue(3.14159); // 輸出：3.14
```

**操作建議**：

- 使用 typeof 檢查基本型別（string、number、boolean 等）。

- 對於物件型別，可使用 instanceof 或自訂型別防衛（後續可進一步說明）。

---

### 8\. **禁止將 null 和 undefined 賦值給其他型別的變數：啟用編譯器選項 strictNullChecks**

**解釋**：\
 啟用 strictNullChecks 後，TypeScript 會要求變數明確標示是否允許 null 或 undefined，避免意外賦值導致錯誤。

**操作步驟**：

1. 在 tsconfig.json 中啟用 strictNullChecks：

   ```json
   {
     "compilerOptions": {
       "strictNullChecks": true
     }
   }
   ```

**範例程式碼**：

```tsx
let name: string;
name = "小明"; // 正確
name = null; // 錯誤：Type 'null' is not assignable to type 'string'

// 允許 null 或 undefined
let nullableName: string | null = null; // 正確
nullableName = "小明"; // 正確
```

**說明**：

- 啟用 strictNullChecks 後，必須明確標示變數是否接受 null 或 undefined。

- 這有助於避免運行時的 null 相關錯誤。

---

### 9\. **強制編譯器將 null 值從型別聯集中移除：使用非 null 值斷言或型別防衛敘述**

**解釋**：

- **非 null 值斷言**：使用 ! 告訴 TypeScript 某值絕對不是 null 或 undefined。

- **型別防衛**：透過檢查確保值不為 null 或 undefined。

**範例程式碼**：

```tsx
// 非 null 值斷言
let element = document.getElementById("myInput")!; // 斷言 element 絕對存在
element.value = "Hello";

// 型別防衛
let maybeElement = document.getElementById("myInput");
if (maybeElement) {
  maybeElement.value = "Hello"; // TypeScript 知道 maybeElement 不為 null
}
```

**操作建議**：

- 使用 ! 時，確保值真的不會是 null 或 undefined，否則可能導致運行時錯誤。

- 型別防衛更安全，建議優先使用。

---

### 10\. **允許變數在尚未被賦值時被使用：使用明確賦值斷言 (Definite Assignment Assertion)**

**解釋**：\
 TypeScript 要求變數在使用前必須賦值。若變數在宣告後會在其他地方（如函數中）賦值，可使用 ! 明確賦值斷言，告訴 TypeScript 此變數一定會被賦值。

**範例程式碼**：

```tsx
class Example {
  name!: string; // 明確賦值斷言

  constructor() {
    this.initialize();
  }

  initialize() {
    this.name = "小明"; // 在這裡賦值
  }
}

const example = new Example();
console.log(example.name); // 正確：TypeScript 不會報錯
```

**操作建議**：

- 使用 ! 時，確保變數在程式執行時真的會被賦值。

- 適用於類別屬性或延遲初始化的場景。

---

### 總結

以上是 TypeScript 靜態型別相關功能的詳細解釋與完整程式碼範例。這些功能幫助你確保程式碼的型別安全，減少運行時錯誤。以下是快速操作建議：

1. 優先使用型別註記或推論，啟用 noImplicitAny 和 strictNullChecks 提高安全性。

2. 使用型別聯集、斷言和防衛來處理複雜型別。

3. 檢查 .d.ts 檔案確認推論結果。

4. 謹慎使用 any 和非 null 斷言，優先選擇 unknown 和型別防衛。
