---
title: TypeScript-彭彭
description: TypeScript 基礎教學，包含語言簡介、開發環境設定、基本語法、型別系統，以及與 JavaScript 的差異
keywords:
  [TypeScript, JavaScript, 型別系統, 編譯器, 強型別, 開發環境, 語法, 彭彭]
---

### **TypeScript 語言簡介、快速開始**

1\. TypeScript 簡介

1\.1 基於 JavaScript 語法和生態系

1\.2 強化資料型態的宣告和檢查

1\.3 需使用編譯器進行編譯後才能執行\
\
2\. TypeScript 開發環境

2\.1 使用 VS Code 編輯器

2\.2 安裝 Node.js

2\.3 使用 Terminal 終端機命令介面

2\.4 使用 NPM 安裝 TypeScript 編譯器\
\
3\. TypeScript 編譯與執行

3\.1 撰寫 TypeScript 程式

3\.2 使用編譯器編譯成原生的 JavaScript 程式

3\.3 執行編譯出來的 JavaScript 程式

```bash
npm i typescript -g
```

```ts
//index.ts
let x = 3;
console.log(x);
```

編譯 ts

```bash
tsc index.ts
```

會新增一個編譯好的檔案 index.js

```javascript
//index.js
var x = 3;
console.log(x);
```

執行 index.js

```bash
node index.js
// 3
```

```ts
//index.ts
let x: number = 3;
console.log(x);
```

### **TypeScript 變數資料型態**

1\. 資料型態簡介

1\.1 資料的種類

- JavaScript 變數的特性

  - let x=3;

  - x=true; //OK，變數接受任何型態的資料

  - x=”abc”;//OK，變數接受任何型態的資料

1\.2 基本資料型態：數字、字串、布林值、任意型態

- 數字 number

- 字串 string

- 布林值 boolean

- 任意資料型態 any，相當於不做任何型態的宣告

1\.3 陣列資料型態：多個資料按照順序排列

- 數字陣列

  - number[]、Array&lt;number&gt;

- 字串陣列

  - string[]、Array&lt;string&gt;

- 布林值陣列

  - boolean[]、Array&lt;boolean&gt;

- 任意資料型態陣列

  - any[]、Array&lt;any&gt;
    2\. 變數資料型態

2\.1 宣告變數，指定資料型態

- 基本語法

  - let 變數名稱:資料型態;

  - let 變數名稱:資料型態=資料;

- 程式範例

  ```ts
  let x:number=3;
  x=true; // compile time error
  lett y:string[]=[3,"a","b"]; // compile time error
  ```

2\.2 編譯時檢查資料型態是否正確

```ts
// 基本資料型態的變數宣告和驗證
let x: number;
x = 10;
console.log(x);
let s: string = "Hello";
consol.log(s);
s = "測試";
console.log(s);
```

```ts
// 陣列資料型態的變數宣告和驗證
let grades: number[] = [60, 70, 80];
console.log(grades); //[60, 70, 80]
grades.push(10);
let a: Array<boolean>;
a = [true, false];
console.lig(a); //[true, false]
```

### **TypeScript 函式參數、回傳值資料型態**

1\. JavaScript 函式的特性

1\.1 函式參數可傳入任何資料型態

1\.2 函式回傳值可回傳任何資料型態

```javascript
function show(msg: string) {
  console.log(msg);
}
function add(d1, d2) {
  return d1 + d2;
}
//參數可為任意資料型態
show(5);
show(true);
//回傳值可為任意資料型態
add(3.4);
add("Hello", "World");
```

\
2\. 函式參數的資料型態

2\.1 定義函式參數的資料型態

2\.2 編譯時檢查資料型態是否正確

```ts
function show(msg) {
  console.log(msg);
}
show(5); // compile time error
show(true); // compile time error
show("Hello", "World"); // compile time error
show("Hello World"); // OK
```

3\. 函式回傳值的資料型態

3\.1 定義函式回傳值的資料型態

3\.2 編譯時檢查資料型態是否正確

> 使用 void 關鍵字代表沒有回傳值

```ts
function 函式名稱(參數定義): 回傳值資料型態 {
  //...
}
// compile time error
function add(n1: number, n2: number): number {
  console.log(n1 + n2);
}
// OK
function add(n1: number, n2: number): number {
  return n1 + n2;
}
let ans1: string = add(3, 4); // compile time error
let ans2: number = add(3, 4); // OK
// compile time error
let ans3: number = add("Hello", 4);
// OK
function add(n1: number, n2: number): void {
  console.log(n1 + n2);
}
let ans: number = add(3, 4); // compile time error
add(3, 4); // OK
```

4\. 實務演練

4\.1 基本特性的演練和觀察

4\.2 陣列資料型態的完整範例演練

```ts
function add(n1: number, n2: number): number {
  return n1 + n2;
}
let ans: number = add(3, 4);
console.log(ans);

function add2(n1: number, n2: number): void {
  console.log(n1 + n2);
}
add(3, 4); //7

// 定義一個函式，接受一個數字的陣列，計算數字加總的結果並回傳
function calculate(nums: number[]): number {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}
let result = caculate([3, 4, 2, 1]);
console.log(result); //10
```

### **TypeScript Interface 物件資料型態**

1\. 物件的基礎回顧

1\.1 物件是包裝其他資料的容器

1\.2 物件的成員

1\.3 物件的屬性、方法

```javascript
let p = { x: 3, y: 4 };
let math = {
  pi: 3.1415926, //屬性
  add: function (n1, n2) {
    //方法
    return n1 + n2;
  },
  multiply: function (n1, n2) {
    return n1 * n2;
  },
};
```

2\. 基本物件資料型態的檢查

2\.1 無須額外的語法

2\.2 檢查是否使用了不正確的成員名稱或型態

```javascript
//物件資料型態的檢查
//物件資料型態：由物件成員的定義組成
let p = { x: 3, y: 4 };
// 使用了不存在的屬性，錯誤
console.log(p.x + p.z);

let math = {
  pi: 3.1415926, //屬性
  add: function (n1, n2) {
    //方法
    return n1 + n2;
  },
  multiply: function (n1, n2) {
    return n1 * n2;
  },
};
// 呼叫了不存在的方法，錯誤
console.log(math.sqrt(3));
```

3\. Interface 定義物件資料型態

3\.1 使用 interface 定義物件資料型態

3\.2 可當成自訂的資料型態使用

3\.3 使用 Function 函式型態

3\.4 使用在變數宣告

3\.5 使用在函式參數

```ts
//定義物件資料型態
//明確的定義物件資料型態，可以當作自訂的資料型態使用
interface 物件資料型態名稱{
  成員名稱:資料型態;
  成員名稱:資料型態;
  ...
};
interface Point{
  x:number;
  y:number;
};
let p1:Point={x:3,y:4};
//錯誤，不符合資料型態定義
let p2:Point={x:3,y:4,z:5};

```

```ts
//定義物件的方法
//使用Function代表函式資料型態
interface Point {
  x: number;
  y: number;
  render: Function;
}
let p1: Point = {
  x: 3,
  y: 4,
  render: function () {
    console.log(this.x, this.y);
  },
};
p1.render();
console.log(p1.render + p1.x); //錯誤
let p2: Point = {
  x: 3,
  y: 4,
  render: "座標",
};
```

```ts
//函式參數的型態檢查
//定義參數的物件資料型態
interface Point {
  x: number;
  y: number;
  render: Function;
}
let p1: Point = {
  x: 3,
  y: 4,
  render: function () {
    console.log(this.x, this.y);
  },
};
p1.render();
console.log(p1.render + p1.x); //錯誤
let p2: Point = {
  x: 3,
  y: 4,
  render: "座標",
};
```

4\. 實務演練

4\.1 基本物件型態檢查的觀察

4\.2 明確定義物件資料型態，定義函式型態和陣列

```ts
//基本的物件資料型態檢查
let c={
  name:"拍打有限公司",
  descript:"專注於程式教育",
  employees:[
    {name:"John", role:"Manager"},
    {name:"Mary", role:"Engineer"},
  ],
  size:function(){
    return this.employees.length;
  }
};
console.log(c.name,c.description);//拍打有限公司 專注於程式教育
console.log(c.sixe()*50000);//100000

//明確定義物件資料型態，使用interface
interface Employee{
  name: string;
  role: string;
};
interface Company{
  name: string;
  description: string;
  employees: Employee[];
  size: Function;
};
let c Company={
  name:"拍打有限公司",
  descript:"專注於程式教育",
  employees:[
    {name:"John", role:"Manager"},
    {name:"Mary", role:"Engineer"},
  ],
  size:function(){
    return this.employees.length;
  }
};
function list(c: Company){
  c.employees.forEach((employee)=>{
    console.log(employee.name,employee.role);
  });
}
list(c);
//John Manager
//Mary Engineer
```

### **TypeScript 物件成員的修飾字**

1\. 物件資料型態回顧

1\.1 使用 interface 定義物件資料型態

1\.2 當作自定義的資料型態使用

```ts
//定義物件資料型態的語法
interface 物件資料型態名稱{
  成員名稱:資料型態;
  成員名稱:資料型態;
  ...
};
interface Point{
  x:number;
  y:number;
};
let p1:Point={x:3,y:4};
//錯誤，不符合資料型態定義
let p2:Point={x:3,y:4,z:5};
```

\
2\. 物件成員的修飾字 Modifier

2\.1 可選的成員 Optional Member

2\.2 唯讀的成員 ReadOnly Member\
\
3\. 可選的成員修飾字

```ts
//定義物件資料型態的語法
interface 物件資料型態名稱{
  成員名稱:資料型態;
  成員名稱:資料型態;
  ...
};
interface Point{
  x:number;
  y:number;
  z?:number;
};
let p1:Point={x:3,y:4};
let p2:Point={x:3,y:4,z:5};
let p2:Point={x:3,y:4,z:5,a:5};//錯誤
```

3\.1 使用 ? 問號定義可選的成員

```ts
let p1: {
  x: number;
  y: number;
  z?: number;
} = { x: 3, y: 4, z: 5 };
//定義函式參數的物件資料型態
function abs(p: { x: number; y: number; z?: number }) {
  let z = p.z ? p.z : 0;
  return Math.sqrt(p.x * p.x + p.y * p.y + z * z);
}
abs({ x: 3, y: 4 });
abs({ x: 3, y: 4, z: 10, a: 4 }); //錯誤
```

3\.2 存在或不存在都可以被接受\
4\. 唯讀的成員修飾字

4\.1 使用 readonly 定義唯讀的成員

```ts
//定義物件資料型態的語法
interface 物件資料型態名稱{
  readonly 成員名稱:資料型態;
  readonly 成員名稱:資料型態;
  ...
};
interface Point{
  x:number;
  readonly y:number;
  z?:number;
};
let p1:Point={x:3,y:4,Z;5};
p1.x=5;
p1.y=10;//錯誤
```

```ts
//搭配匿名的型態定義
let p1: {
  x: number;
  readonly y: number;
  z?: number;
} = { x: 3, y: 4, z: 5 };
p1.y = 10; //錯誤
//定義函式參數的物件資料型態
function abs(p: { readonly x: number; y: number; z?: number }) {
  p.x = p.x * 2; //錯誤
  z = p.z ? p.z : 0;
  return Math.sqrt(p.x * p.x + p.y * p.y + z * z);
}
abs({ x: 3, y: 4 });
```

4\.2 該成員只能讀取，不能修改寫入\
\
5\. 實務演練

5\.1 定義公司資料型態

5\.2 可選成員的使用情境說明

5\.3 唯讀成員的使用情境說明

```ts
interface Company {
  readonly id: number;
  name: string;
  size: number;
  description?: string;
}
function renderCompany(c: COmpany) {
  //c.id=10;//錯誤
  console.log("公司的基本資料");
  console.log(c.id, c.name, c.size);
  if (c.description !== undefined) {
    console.log("公司的詳細說明");
    console.log(c.description);
  }
}
renderCompany({
  id: 12345678,
  name: "拍打有限公司",
  size: 3,
});
renderCompany({
  id: 87654321,
  name: "Google Taiwan",
  size: 2000,
  description: "搜尋引擎的領導廠商",
});
```

> **收錄自[彭彭的課程](https://www.youtube.com/@cwpeng-course)**
