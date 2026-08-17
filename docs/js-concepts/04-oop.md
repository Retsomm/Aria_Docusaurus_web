# 物件導向 JavaScript

涵蓋概念：Factories and Classes、this/call/apply/bind、Object Creation & Prototypes、Inheritance & Polymorphism

---

## 1. Factories and Classes

### 工廠函式

```javascript
function createRobot(name) {
  return { name, greet() { console.log("哈囉，我是" + this.name); } };
}
```
缺點：每個物件的方法都各自複製一份，浪費記憶體。

### Class（ES6）

```javascript
class Robot {
  constructor(name) { this.name = name; }
  greet() { console.log("哈囉，我是" + this.name); }
  static createDefault() { return new Robot("預設機器人"); } // 靜態方法
}
const r1 = new Robot("R2D2");
console.log(r1.greet === new Robot("小白").greet); // true，方法是共用的
```

### 私有欄位

```javascript
class BankAccount {
  #balance;
  constructor(amount) { this.#balance = amount; }
  deposit(amount) { this.#balance += amount; return this.#balance; }
}
// account.#balance ← 語法錯誤，外部完全無法存取
```

---

## 2. this, call, apply, bind

`this` 的值取決於函式**被誰呼叫**，不是定義在哪裡。

### 五條綁定規則（優先順序：new > 明確綁定 > 隱含綁定 > 預設綁定）

```javascript
// 規則1 預設綁定：直接呼叫
function sayHi() { console.log(this); } // 嚴格模式下是 undefined

// 規則2 隱含綁定：obj.method()
const robot = { name: "R2D2", greet() { console.log(this.name); } };
robot.greet(); // this 是 robot

// 地雷：把方法拆下來單獨用，this 會遺失
const greetFn = robot.greet;
greetFn(); // undefined，這是 React class component 常見地雷

// 規則3 明確綁定：call / apply / bind
greet.call(person1);           // 立刻執行，逗號傳參數
greet.apply(person2, [25]);    // 立刻執行，陣列傳參數
const bound = greet.bind(person1); // 不執行，回傳綁死 this 的新函式

// 規則4 new 綁定
function Robot(name) { this.name = name; } // this 指向新物件

// 規則5 箭頭函式：沒有自己的 this，永遠沿用外層
const robot2 = {
  name: "R2D2",
  greet() {
    setTimeout(() => console.log(this.name), 1000); // 正確拿到 R2D2
  }
};
```

> 現代 React function component + Hooks 幾乎不用處理 this，因為都用箭頭函式；但維護舊 class component 專案、看第三方套件原始碼、面試都還是會遇到。

---

## 3. Object Creation & Prototypes

每個物件都有一條隱形繩子（`[[Prototype]]`）連到另一個物件，找不到的屬性會順著繩子往上找，這叫**原型鏈**。

```javascript
const animal = { eats: true };
const dog = Object.create(animal);
dog.barks = true;
console.log(dog.eats); // true，順著原型鏈借來的
```

`new Robot()` 背後做的 4 件事：
1. 建立全新空物件
2. 把新物件的原型指向 `Robot.prototype`
3. 執行建構函式，`this` 綁到新物件
4. 沒有自己 return 物件的話，自動回傳這個新物件

> **Class 語法只是 prototype 寫法的語法糖**，本質相同，方法定義在 prototype 上讓所有實例共用。

```javascript
Object.create(base);        // 手動指定原型
Object.assign(target, src); // 複製屬性合併物件（會改變 target 本身）
obj.hasOwnProperty("x");    // 判斷屬性是自己的還是借來的
```

---

## 4. Inheritance & Polymorphism

### 繼承：extends + super

```javascript
class Animal {
  constructor(name) { this.name = name; }
  eat() { console.log(this.name + " 正在吃飯"); }
}
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 必須放在第一行
    this.breed = breed;
  }
  fetch() { console.log(this.name + " 去撿球了"); }
}
```

### 多型：方法覆寫

```javascript
class Cat extends Animal {
  makeSound() { console.log("喵～"); } // 覆寫父類別方法
}
[new Dog(), new Cat()].forEach((a) => a.makeSound()); // 同一個方法名稱，不同行為

// 想同時保留父類別行為
class Dog2 extends Animal {
  makeSound() {
    super.makeSound(); // 呼叫父類別版本
    console.log("...而且是汪汪！");
  }
}
```

多型的好處：呼叫端不用寫一堆 if-else 判斷型別，直接呼叫同一個方法名稱即可，容易擴充新類別。

---

## 本篇總結

- Class 是工廠函式的進化版，方法共用、效能較好，搭配 `#` 私有欄位做資料封裝
- `this` 綁定規則優先順序：`new` > 明確綁定 > 隱含綁定 > 預設綁定；箭頭函式永遠沿用外層 `this`
- 原型鏈是 JS 物件繼承的底層機制，Class 只是語法糖
- 繼承用 `extends`+`super`；多型讓同一方法名稱在不同物件有不同行為，簡化呼叫端邏輯
