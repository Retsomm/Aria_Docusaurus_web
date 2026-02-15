---
title: TypeScript中陣列、Tuple與列舉的使用
description: 深入學習 TypeScript 中陣列型別定義、Tuple 元組使用、列舉 Enum 的宣告與應用技巧
keywords:
  [TypeScript, 陣列, Tuple, 列舉, Enum, 型別定義, 型別註記, 元組, 陣列型別]
---

### 1\. 限制陣列包含的型別

在 TypeScript 中，陣列的型別可以用兩種方式定義：

- **陣列註記**：明確指定陣列中元素的型別。

- **型別推論**：讓 TypeScript 根據初始化的值自動推斷型別。

#### 方式 1：使用陣列註記

你可以使用 型別\[\] 或 Array`<型別>` 的語法來限制陣列元素的型別。

**範例程式碼**：

```tsx
// 使用 `型別[]` 語法
let names: string[] = ["小明", "小華", "小美"];
// names.push(123); // 錯誤：TypeScript 會阻止你加入非 string 型別的值

// 使用 `Array<型別>` 語法
let scores: Array<number> = [90, 85, 88];
// scores.push("80"); // 錯誤：TypeScript 會阻止你加入非 number 型別的值
```

**說明**：

- string\[\] 表示這個陣列只能包含字串型別的值。

- Array`<number>` 是另一種等價的寫法，表示陣列只能包含數字型別的值。

- 如果嘗試加入不符合型別的值，TypeScript 編譯器會報錯，確保型別安全。

#### 方式 2：型別推論

當你初始化陣列時，TypeScript 會根據初始值自動推斷陣列的型別。

**範例程式碼**：

```tsx
let fruits = ["蘋果", "香蕉", "橘子"];
// fruits.push(123); // 錯誤：TypeScript 推斷 fruits 是 string[]，不能加入 number

let mixed = [1, "hello", true]; // 推斷為 (number | string | boolean)[]
mixed.push(42); // 允許，因為 number 是推斷型別之一
mixed.push("world"); // 允許，因為 string 是推斷型別之一
```

**說明**：

- 如果陣列初始化時只有單一型別（如字串），TypeScript 會推斷為 string\[\]。

- 如果陣列包含多種型別，TypeScript 會推斷為聯合型別（如 (number | string | boolean)\[\]）。

- 型別推論適合快速開發，但若需要嚴格限制型別，建議明確使用陣列註記。

---

### 2\. 定義固定長度的陣列，且每個元素都有指定的型別：使用 Tuple

Tuple 是一種特殊陣列，長度固定，且每個元素的型別可以單獨指定。

**範例程式碼**：

```tsx
// 定義一個 Tuple，表示 [姓名, 年齡, 是否為學生]
let student: [string, number, boolean] = ["小明", 20, true];

// 訪問 Tuple 元素
console.log(student[0]); // 小明
console.log(student[1]); // 20
console.log(student[2]); // true

// 錯誤範例
// student[0] = 123; // 錯誤：不能將 number 賦值給 string
// student.push("額外元素"); // 注意：TypeScript 允許 push，但這可能破壞 Tuple 的固定長度，建議避免
```

**說明**：

- Tuple 使用 \[型別 1, 型別 2, ...\] 語法定義，長度固定，且每個位置的型別明確。

- 適合用於表示結構固定的資料，例如一個人的基本資訊 \[姓名, 年齡, 是否為學生\]。

- 注意：TypeScript 的 Tuple 允許使用 push 添加元素，這可能導致長度不固定，建議在程式碼中避免這種操作。

---

### 3\. 用同一名稱參照一組相關的值：使用列舉（Enum）

列舉（Enum）用來定義一組相關的命名常數，方便在程式中使用有意義的名稱代替硬編碼的值。

**範例程式碼**：

```tsx
// 定義一個列舉，表示星期
enum Weekday {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

// 使用列舉
let today: Weekday = Weekday.Monday;
console.log(today); // 輸出：0（列舉的預設值從 0 開始）

// 自訂列舉的值
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Failed = "FAILED",
}

let taskStatus: Status = Status.Success;
console.log(taskStatus); // 輸出：SUCCESS
```

**說明**：

- 列舉預設從 0 開始編號（例如 Weekday.Monday 是 0，Weekday.Tuesday 是 1）。

- 你可以自訂列舉的值，例如將 Status 設為字串值，這樣更適合表示狀態。

- 列舉讓程式碼更具可讀性，避免直接使用數字或字串硬編碼。

---

### 4\. 宣告一個只接受特定值的型別：使用字面值型別

字面值型別（Literal Type）用來限制變數只能是特定的值。

**範例程式碼**：

```tsx
// 定義一個字面值型別，只能是 "red"、"green" 或 "blue"
let color: "red" | "green" | "blue" = "red";
color = "green"; // 允許
// color = "yellow"; // 錯誤：TypeScript 不允許非指定的值

// 結合字面值型別與其他型別
type Direction = "up" | "down" | "left" | "right";
let move: Direction = "up";
console.log(move); // 輸出：up
```

**說明**：

- 字面值型別使用 |（聯合型別）來指定允許的具體值。

- 適用於限制變數只能取特定值的場景，例如按鈕的類型、方向等。

- 比列舉更輕量，適合簡單的固定值集合。

---

### 5\. 避免重複定義同一個複雜的型別組合：使用型別別名

型別別名（Type Alias）用來為複雜的型別組合取一個簡單的名稱，避免重複撰寫。

**範例程式碼**：

```tsx
// 定義型別別名
type User = {
  name: string;
  age: number;
  isActive: boolean;
};

// 使用型別別名
let user1: User = {
  name: "小明",
  age: 20,
  isActive: true,
};

let user2: User = {
  name: "小華",
  age: 25,
  isActive: false,
};

// 結合陣列或 Tuple
type UserList = User[];
let users: UserList = [user1, user2];

type UserTuple = [string, number, boolean];
let user3: UserTuple = ["小美", 22, true];
```

**說明**：

- 使用 type 關鍵字定義型別別名，讓複雜型別（例如物件結構）更易於重複使用。

- 型別別名可以與陣列、Tuple 或其他型別組合，提升程式碼的可維護性。

- 適合用於定義重複使用的資料結構，例如 API 回傳的物件格式。

---

### 總結

以下是各項功能的用途與適用場景：

| 功能             | 用途                       | 適用場景                               |
| ---------------- | -------------------------- | -------------------------------------- |
| **陣列**         | 限制陣列元素的型別         | 動態長度的資料集合，例如使用者名稱清單 |
| **Tuple**        | 固定長度且每個元素型別明確 | 固定結構的資料，例如 \[姓名, 年齡\]    |
| **列舉（Enum）** | 為一組相關值命名           | 固定選項的集合，例如星期、狀態碼       |
| **字面值型別**   | 限制為特定值               | 簡單的固定值，例如方向 ("up"           |
| **型別別名**     | 簡化複雜型別               | 重複使用的物件結構或組合型別           |

### 實作練習

你可以嘗試以下練習來熟悉這些概念：

1. 定義一個 string\[\] 陣列，加入幾個字串並試著加入數字（觀察 TypeScript 報錯）。

2. 定義一個 Tuple \[string, number\]，表示 \[商品名稱, 價格\]，並訪問其元素。

3. 定義一個列舉 Role，包含 Admin、User、Guest，並用它設定變數。

4. 使用字面值型別定義一個 Size 型別，只能是 "S" | "M" | "L"。

5. 使用型別別名定義一個 Product 型別，包含 name（字串）、price（數字）、inStock（布林值），並用它宣告幾個商品。
