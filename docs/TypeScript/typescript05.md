---
title: TypeScript 物件型別操作
description: 學習 TypeScript 物件型別的定義與操作，包含形狀型別、可選屬性、型別別名、介面等進階應用
keywords:
  [
    TypeScript,
    物件型別,
    形狀型別,
    可選屬性,
    型別別名,
    介面,
    物件結構,
    型別定義,
    屬性型別,
  ]
---

### 1\. **對 TypeScript 編譯器描述共用物件的型別：使用形狀型別**

**說明**：\
 在 TypeScript 中，形狀型別（Shape Type）是用來描述物件的結構，指定物件的屬性名稱、型別，以及是否為必填。你可以直接在物件上定義型別，確保物件的屬性符合預期的結構。

**範例程式碼**：

```tsx
// 定義一個物件的形狀型別
let user: { name: string; age: number; email: string } = {
  name: "小明",
  age: 25,
  email: "xiaoming@example.com",
};

// 輸出物件內容
console.log(user.name); // 小明
console.log(user.age); // 25
console.log(user.email); // xiaoming@example.com
```

**逐步操作**：

1. 定義物件型別時，在物件名稱後加上冒號 :，然後用大括號 {} 描述屬性。

2. 每個屬性後面指定型別，例如 `name: string` 表示 name 必須是字串。

3. 當你試圖給物件賦值時，TypeScript 編譯器會檢查是否符合指定的形狀型別。如果缺少屬性或型別不符，編譯器會報錯。

4. 例如，如果你寫 `user = { name: "小明" }`，編譯器會報錯，因為缺少 `age` 和 `email`。

**注意**：

- 形狀型別直接寫在變數宣告處，適用於簡單的物件結構。

- 如果有多個物件需要相同的形狀，建議使用型別別名（後面會說明）。

---

### 2\. **描述不規則共用物件的型別：在形狀型別使用選擇性屬性**

**說明**：\
 有些物件的屬性不是每次都必須出現，這時可以用選擇性屬性（Optional Properties），在屬性名稱後加 ? 表示該屬性可以不存在。

**範例程式碼**：

```tsx
// 定義一個包含選擇性屬性的形狀型別
let user: { name: string; age?: number; email?: string } = {
  name: "小美",
};

// 也可以包含部分選擇性屬性
user = {
  name: "小美",
  age: 30,
};

// 輸出物件內容
console.log(user.name); // 小美
console.log(user.age); // 30（如果沒定義，會是 undefined）
console.log(user.email); // undefined
```

**逐步操作**：

1. 在形狀型別中，屬性名稱後加 ?，例如 `age?: number`，表示 age 是可選的。

2. 當物件缺少選擇性屬性時，TypeScript 不會報錯，該屬性的值會是 undefined。

3. 這適合用在不確定某些屬性是否會出現的情況，例如使用者資料中可能有時沒有提供 email。

**注意**：

- 選擇性屬性讓物件結構更有彈性，但你需要在使用這些屬性時檢查是否為 undefined，以避免運行時錯誤。

---

### 3\. **重複使用物件形狀型別：使用型別別名**

**說明**：\
 當多個物件需要共用相同的形狀型別時，重複寫形狀型別會很麻煩。這時可以用**型別別名**（Type Alias）來定義一個可重複使用的型別。

**範例程式碼**：

```tsx
// 定義型別別名
type User = {
  name: string;
  age?: number;
  email?: string;
};

// 使用型別別名來宣告多個物件
let user1: User = {
  name: "小明",
  age: 25,
};

let user2: User = {
  name: "小美",
  email: "xiaomei@example.com",
};

// 輸出物件內容
console.log(user1); // { name: "小明", age: 25 }
console.log(user2); // { name: "小美", email: "xiaomei@example.com" }
```

**逐步操作**：

1. 使用 type 關鍵字定義型別別名，例如 `type User = {...}`。

2. 在需要的地方，用 let 變數名`: User 來宣告變數，這樣可以重複使用相同的型別結構。

3. 型別別名讓程式碼更乾淨，且當需要修改型別時，只需改一處即可。

**注意**：

- 型別別名不僅可以用於物件，還可以用於其他型別（例如數字、字串等）。

- 如果需要更複雜的結構，可以考慮使用 interface，不過簡單場景下 type 就很夠用了。

---

### 4\. **在物件包含了物件形狀型別沒有的額外屬性時不回報錯誤：啟用編譯器的 suppressExcessPropertyErrors 設定**

**說明**：\
 TypeScript 預設會檢查物件是否有多餘的屬性（即形狀型別中沒定義的屬性），如果有會報錯。但有時你可能希望允許額外屬性，這時可以啟用 suppressExcessPropertyErrors 設定。

**範例程式碼**：

```tsx
// 定義型別
type User = {
  name: string;
  age?: number;
};

// 物件包含未定義的屬性 phone
let user: User = {
  name: "小明",
  age: 25,
  phone: "1234567890", // 預設會報錯，因為 phone 不在 User 型別中
};

// 啟用 suppressExcessPropertyErrors
// 在 tsconfig.json 中加入以下設定：
/*
{
  "compilerOptions": {
    "suppressExcessPropertyErrors": true
  }
}
*/

// 現在這段程式碼不會報錯
console.log(user); // { name: "小明", age: 25, phone: "1234567890" }
```

**逐步操作**：

1. 打開你的 TypeScript 設定檔（通常是 tsconfig.json）。

2. 在 compilerOptions 中加入 "suppressExcessPropertyErrors": true。

3. 重新編譯程式碼，TypeScript 就不會對多餘的屬性報錯。

4. 你也可以直接用型別斷言（Type Assertion）來繞過檢查，例如：

   ```tsx
   let user = {
     name: "小明",
     age: 25,
     phone: "1234567890",
   } as User;
   ```

**注意**：

- 啟用 suppressExcessPropertyErrors 會讓型別檢查變得寬鬆，可能降低型別安全的嚴格性，建議謹慎使用。

- 更好的做法是明確定義所有可能的屬性，或使用 \[key: string\]: any 來允許任意屬性（如下例）：

  ```tsx
  type User = {
    name: string;
    age?: number;
    [key: string]: any; // 允許任意屬性
  };
  ```

---

### 5\. **合併物件形狀型別：使用型別聯集或交集**

**說明**：\
 TypeScript 允許使用**聯集型別**（Union Type，用 |）或**交集型別**（Intersection Type，用 &）來合併物件型別：

- **聯集型別**：物件可以是多種型別之一。

- **交集型別**：物件必須同時滿足多種型別。

**範例程式碼**：

```tsx
// 定義兩個型別別名
type BasicInfo = {
  name: string;
  age: number;
};

type ContactInfo = {
  email: string;
  phone: string;
};

// 交集型別：必須包含兩個型別的所有屬性
type User = BasicInfo & ContactInfo;

let user: User = {
  name: "小明",
  age: 25,
  email: "xiaoming@example.com",
  phone: "1234567890",
};

// 聯集型別：可以是 BasicInfo 或 ContactInfo
let partialUser: BasicInfo | ContactInfo;

partialUser = { name: "小美", age: 30 }; // 符合 BasicInfo
partialUser = { email: "xiaomei@example.com", phone: "0987654321" }; // 符合 ContactInfo

// 輸出
console.log(user); // { name: "小明", age: 25, email: "xiaoming@example.com", phone: "1234567890" }
console.log(partialUser); // 根據賦值不同，輸出不同
```

**逐步操作**：

1. 使用 & 合併兩個型別，創建一個新的型別，要求物件包含所有屬性。

2. 使用 | 定義聯集型別，物件只需要符合其中一種型別即可。

3. 交集型別適合用在需要合併多個結構的情況；聯集型別適合用在物件可能有多種形式的情況。

**注意**：

- 聯集型別在存取屬性時需要小心，因為某些屬性可能不存在（需要型別防衛，見下節）。

- 交集型別要求物件必須包含所有屬性，適用於嚴格的結構需求。

---

### 6\. **為物件型別進行型別防衛敘述：使用 in 關鍵字查驗物件所定義的屬性**

**說明**：\
 當物件是聯集型別時，某些屬性可能不存在。使用 in 關鍵字可以檢查物件是否包含特定屬性，作為型別防衛（Type Guard）來縮小型別範圍。

**範例程式碼**：

```tsx
type BasicInfo = {
  name: string;
  age: number;
};

type ContactInfo = {
  email: string;
  phone: string;
};

// 聯集型別
type User = BasicInfo | ContactInfo;

function printUserInfo(user: User) {
  if ("name" in user) {
    // TypeScript 知道這裡 user 是 BasicInfo 型別
    console.log(`姓名: ${user.name}, 年齡: ${user.age}`);
  } else if ("email" in user) {
    // TypeScript 知道這裡 user 是 ContactInfo 型別
    console.log(`Email: ${user.email}, 電話: ${user.phone}`);
  }
}

// 測試
const user1: User = { name: "小明", age: 25 };
const user2: User = { email: "xiaomei@example.com", phone: "0987654321" };

printUserInfo(user1); // 姓名: 小明, 年齡: 25
printUserInfo(user2); // Email: xiaomei@example.com, 電話: 0987654321
```

**逐步操作**：

1. 在函式中，使用 if ("屬性名" in 物件) 檢查物件是否包含某個屬性。

2. TypeScript 會根據 in 的檢查結果，自動縮小物件的型別範圍（例如從 User 縮小到 BasicInfo 或 ContactInfo）。

3. 這樣可以安全地存取屬性，不會出現型別錯誤。

**注意**：

- in 關鍵字只檢查屬性是否存在，不檢查屬性的值是否為 undefined。

- 如果屬性可能存在但值為 undefined，需要額外檢查。

---

### 7\. **重複使用一個型別防衛敘述：定義一個謂詞函式**

**說明**：\
 如果型別防衛邏輯需要多次使用，可以定義一個**謂詞函式**（Type Predicate Function），它的回傳值是一個型別斷言，告訴 TypeScript 物件屬於某個特定型別。

**範例程式碼**：

```tsx
type BasicInfo = {
  name: string;
  age: number;
};

type ContactInfo = {
  email: string;
  phone: string;
};

type User = BasicInfo | ContactInfo;

// 定義謂詞函式
function isBasicInfo(user: User): user is BasicInfo {
  return "name" in user;
}

// 使用謂詞函式進行型別防衛
function printUserInfo(user: User) {
  if (isBasicInfo(user)) {
    // TypeScript 知道 user 是 BasicInfo
    console.log(`姓名: ${user.name}, 年齡: ${user.age}`);
  } else {
    // TypeScript 知道 user 是 ContactInfo
    console.log(`Email: ${user.email}, 電話: ${user.phone}`);
  }
}

// 測試
const user1: User = { name: "小明", age: 25 };
const user2: User = { email: "xiaomei@example.com", phone: "0987654321" };

printUserInfo(user1); // 姓名: 小明, 年齡: 25
printUserInfo(user2); // Email: xiaomei@example.com, 電話: 0987654321
```

**逐步操作**：

1. 定義一個函式，簽名為 function 函式名(參數: 型別): 參數 is 具體型別。

2. 在函式中，使用 in 或其他檢查方式，判斷物件是否符合某個型別。

3. 回傳 true 或 false，TypeScript 會根據回傳值縮小型別。

4. 在其他地方重複使用這個謂詞函式，避免重複寫型別防衛邏輯。

**注意**：

- 謂詞函式的回傳型別必須是 參數 is 型別，這是 TypeScript 的語法要求。

- 這方法特別適合在多處需要檢查相同型別的情況。
