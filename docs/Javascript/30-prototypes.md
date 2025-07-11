---
title: JavaScript 原型
description: 深入了解 JavaScript 原型系統，包含原型鏈、繼承機制、prototype 屬性、原型方法等核心概念
keywords:
  [
    JavaScript,
    原型,
    Prototype,
    原型鏈,
    繼承,
    prototype,
    __proto__,
    物件導向,
    constructor,
  ]
---

### 1\. JavaScript 原型 (Prototype)

#### 什麼是原型？

在 JavaScript 中，每個物件都有一個內建的 **原型物件**，可以透過它來共享屬性和方法。原型是 JavaScript 實現**繼承**的核心機制。當你試圖存取物件的屬性或方法時，如果物件本身沒有，JavaScript 會沿著**原型鏈 (Prototype Chain)** 查找，直到找到或返回 undefined。

#### 原型的基本概念：

- 每個函式都有 prototype 屬性，指向一個物件，這個物件會成為透過該函式創建的實例的原型。

- 物件透過 `__proto_`（不建議直接使用）或 `Object.getPrototypeOf()` 存取其原型。

- 原型鏈允許物件繼承其他物件的屬性和方法。

#### 範例：使用原型共享方法

```javascript
// 定義一個函式建構子
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 在 Person 的原型上新增一個方法
Person.prototype.sayHello = function () {
  console.log(`你好，我的名字是 ${this.name}，我今年 ${this.age} 歲！`);
};

// 創建兩個實例
const person1 = new Person("小明", 25);
const person2 = new Person("小華", 30);

// 呼叫原型上的方法
person1.sayHello(); // 輸出：你好，我的名字是 小明，我今年 25 歲！
person2.sayHello(); // 輸出：你好，我的名字是 小華，我今年 30 歲！

// 檢查原型鏈
console.log(person1.__proto__ === Person.prototype); // 輸出：true
console.log(Object.getPrototypeOf(person2) === Person.prototype); // 輸出：true
```

#### 逐步解說：

1. 我們定義了一個 ``Person` 函式建構子，用來創建物件。

2. 在 `Person.prototype` 上新增了 `sayHello` 方法，這樣所有透過 `Person` 創建的實例都可以共享這個方法。

3. 使用 `new` 關鍵字創建實例 `person1` 和 `person2`，它們會繼承 Person.prototype 上的方法。

4. 呼叫 `sayHello` 方法時，JavaScript 會先檢查物件本身是否有這個方法，若沒有，則沿著原型鏈找到 `Person.prototype.sayHello`。

5. 使用 `__proto__` 或 `Object.getPrototypeOf()` 確認實例的原型是否指向 Person.prototype。

#### 注意事項：

- 不要直接操作 `__proto__`，因為它是內部屬性，建議使用 `Object.getPrototypeOf()` 或 `Object.setPrototypeOf()`。

- 原型上的屬性和方法是**共享的**，所有實例共用同一份記憶體，這有助於節省資源。

---

### 2\. 函式建構子 (Constructor Function)

#### 什麼是函式建構子？

函式建構子是用來創建物件的函式，通常與 new 關鍵字一起使用。當你用 new 呼叫一個函式時，JavaScript 會：

1. 創建一個空物件。

2. 將這個物件的原型設為函式的 prototype。

3. 將 this 綁定到新物件。

4. 執行函式內容。

5. 返回新物件（除非函式明確返回其他物件）。

#### 範例：使用函式建構子創建物件

```javascript
// 定義一個函式建構子
function Car(brand, model) {
  this.brand = brand;
  this.model = model;
}

// 在原型上新增方法
Car.prototype.drive = function () {
  console.log(`這輛 ${this.brand} ${this.model} 正在行駛！`);
};

// 創建實例
const car1 = new Car("Toyota", "Camry");
const car2 = new Car("Honda", "Civic");

// 呼叫方法
car1.drive(); // 輸出：這輛 Toyota Camry 正在行駛！
car2.drive(); // 輸出：這輛 Honda Civic 正在行駛！

// 檢查建構子
console.log(car1.constructor === Car); // 輸出：true
```

#### 逐步解說：

1. 定義 Car 函式建構子，接受 brand 和 model 參數，並將它們設為物件的屬性。

2. 在 `Car.prototype` 上新增 drive 方法，所有 Car 實例都可以使用。

3. 使用 new Car() 創建實例 car1 和 car2，每個實例都有自己的 brand 和 model 屬性，但共享 drive 方法。

4. 使用 constructor 屬性確認實例是由哪個建構子創建的。

#### 注意事項：

- 函式建構子的命名慣例是大寫開頭（例如 Car），以區分普通函式。

- 使用 new 是必要的，否則 this 會指向全域物件（在瀏覽器中是 window），導致錯誤。

---

### 3\. 物件屬性特徵 (Object Property Descriptors)

#### 什麼是物件屬性特徵？

每個物件的屬性都有一些**特徵 (Property Descriptors)**，控制屬性的行為。這些特徵包括：

- value：屬性的值。

- writable：是否可修改屬性的值。

- enumerable：是否可在 `for...in` 或 `Object.keys()` 中列舉。

- configurable：是否可修改屬性的特徵或刪除屬性。

你可以使用 `Object.defineProperty()` 或 `Object.defineProperties()` 來設定這些特徵。

#### 範例：設定物件屬性特徵

```javascript
// 創建一個物件
const user = {};

// 定義一個屬性，並設定特徵
Object.defineProperty(user, "name", {
  value: "小明",
  writable: false, // 不可修改
  enumerable: true, // 可列舉
  configurable: false, // 不可重新配置或刪除
});

// 嘗試修改屬性
user.name = "小華"; // 不會生效，因為 writable: false
console.log(user.name); // 輸出：小明

// 檢查屬性是否可列舉
for (let key in user) {
  console.log(key); // 輸出：name
}

// 嘗試刪除屬性
delete user.name; // 不會生效，因為 configurable: false
console.log(user.name); // 輸出：小明

// 查看屬性特徵
console.log(Object.getOwnPropertyDescriptor(user, "name"));
// 輸出：{ value: '小明', writable: false, enumerable: true, configurable: false }
```

#### 逐步解說：

1. 使用 `Object.defineProperty()` 為 user 物件定義一個 name 屬性，設定其值為 "小明"，並指定特徵。

2. 因為 writable: false，嘗試修改 name 屬性不會生效。

3. 因為 enumerable: true，name 屬性會出現在 `for...in` 迴圈中。

4. 因為 configurable: false，無法刪除 name 屬性或改變其特徵。

5. 使用 `Object.getOwnPropertyDescriptor()` 查看屬性的特徵。

#### 範例：多個屬性設定

```javascript
const book = {};

// 一次定義多個屬性
Object.defineProperties(book, {
  title: {
    value: "JavaScript 入門",
    writable: true,
    enumerable: true,
    configurable: true,
  },
  price: {
    value: 500,
    writable: false,
    enumerable: true,
    configurable: false,
  },
});

console.log(book.title); // 輸出：JavaScript 入門
console.log(book.price); // 輸出：500

book.title = "進階 JavaScript"; // 可修改，因為 writable: true
console.log(book.title); // 輸出：進階 JavaScript

book.price = 600; // 不會生效，因為 writable: false
console.log(book.price); // 輸出：500
```

#### 逐步解說：

1. 使用 `Object.defineProperties()` 一次定義多個屬性 title 和 price，並設定各自的特徵。

2. title 屬性可以修改，因為 writable: true。

3. price 屬性不可修改，因為 writable: false。

#### 注意事項：

- 如果未指定特徵，writable、enumerable 和 configurable 預設為 false（在 `Object.defineProperty` 中）。

- 使用 `Object.getOwnPropertyDescriptors()` 可以取得物件所有屬性的特徵。

---

### 總結

1. **原型 (Prototype)**：用於共享屬性和方法，透過原型鏈實現繼承。範例展示了如何在 prototype 上新增方法並被實例共享。

2. **函式建構子 (Constructor Function)**：用來創建物件，搭配 new 和 prototype 實現物件的初始化和方法共享。

3. **物件屬性特徵 (Property Descriptors)**：控制屬性的行為（如是否可修改、可列舉、可配置），使用 `Object.defineProperty` 或 `Object.defineProperties` 進行設定。
