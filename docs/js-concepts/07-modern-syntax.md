# 現代 JavaScript 語法全解

涵蓋概念：Modern JS Syntax（解構、展開/收集運算子、可選鏈、空值合併）、Tagged Template Literals、Computed Property Names

---

## 1. 解構賦值（Destructuring）

```javascript
const user = { name: "小明", age: 25 };
const { name, age } = user;

const colors = ["紅", "綠", "藍"];
const [first, second] = colors;

// 改名字 + 預設值
const { name: userName, job = "無業" } = user;

// React props 幾乎都這樣寫
const UserCard = ({ name, age }) => `${name} - ${age}`;
```

---

## 2. 展開運算子 vs 收集運算子（都是 `...`，方向相反）

```javascript
// 展開：攤開
const arr2 = [...arr1, 4, 5];
const obj2 = { ...obj1, c: 3 };   // 後面同名屬性會覆蓋前面

// 這正是解決「淺拷貝」問題的關鍵工具（不可變性）
const newState = { ...state, count: 1 }; // state 本身不受影響

// 收集：打包
const sum = (...numbers) => numbers.reduce((t, n) => t + n, 0);
const [first, ...rest] = [1, 2, 3, 4, 5]; // rest = [2,3,4,5]
const { name, ...otherInfo } = user;
```

---

## 3. Optional Chaining `?.` 與 Nullish Coalescing `??`

```javascript
// ?. ：安全存取可能不存在的深層屬性，不會報錯中斷
const zip = user?.address?.zipCode?.value;
user.sayHi?.(); // 方法不存在也安全跳過

// ?? ：比 || 更精準的預設值判斷
const count = 0;
count || 10;  // 10 ← 錯誤！0 是合理的有效值卻被換掉了
count ?? 10;  // 0  ← 正確！只有 null/undefined 才用預設值
```

`||` 遇到 8 個 falsy value（`0`、`""` 等）都會誤判成「沒有值」，需要精準判斷時務必用 `??`。

---

## 4. 箭頭函式與樣板字面量回顧

```javascript
const add = (a, b) => a + b;
const double = (n) => n * 2;
const sayHi = () => console.log("hi");
const makeUser = (name) => ({ name }); // 回傳物件字面量要用 ( ) 包起來

const msg = `哈囉，${name}，你今年 ${age} 歲`; // 支援多行字串
```

---

## 5. Tagged Template Literals（標籤模板字面量）

在樣板字面量前加一個函式，可以攔截、加工字串內容：

```javascript
const tag = (strings, ...values) => {
  console.log(strings); // 純文字片段陣列，長度永遠比 values 多 1
  console.log(values);  // ${} 帶入的值陣列
};
tag`哈囉，我是${name}，今年${age}歲`;
```

**這正是 `styled-components` 的核心原理：**

```javascript
const Button = styled.button`
  background: ${(props) => (props.primary ? "blue" : "gray")};
`;
// styled.button 反引號前的函式，會攔截 CSS 片段跟動態值，組合出最終樣式並生成元件
```

也可應用於自動逸出使用者輸入（防 XSS）、i18n 多語系工具。

> 實務上很少親手寫標籤函式，但理解它有助於看懂 CSS-in-JS 套件的原始碼。

---

## 6. Computed Property Names（計算屬性名稱）

用 `[變數]` 動態決定物件的屬性鍵名：

```javascript
const key = "name";
const obj = { [key]: "小明" }; // { name: "小明" }
```

**最實用的前端場景：React 表單處理**

```javascript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
// <input name="email" onChange={handleInputChange} />
// <input name="password" onChange={handleInputChange} />
// 一個共用函式處理所有欄位，不用為每個欄位各寫一個 handler
```

**搭配條件短路，動態組合物件：**

```javascript
const buildFilters = (status, category) => ({
  ...(status && { status }),
  ...(category && { category })
});
// 只有真的有值的欄位才會被加進最終物件
```

---

## 本篇總結

- 解構賦值讓拆取資料更簡潔，是 React props 的標準寫法
- 展開運算子 `...` 是實現不可變性（immutability）的關鍵工具
- `?.` 安全存取深層屬性；`??` 比 `||` 更精準判斷「沒有值」，兩者要分清楚適用情境
- Tagged Template Literals 是 styled-components 等 CSS-in-JS 套件的底層原理
- Computed Property Names 搭配 `[e.target.name]`，是 React 表單處理的標準模式
