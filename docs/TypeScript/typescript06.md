---
title: TypeScript 類別與介面使用說明
description: 深入學習 TypeScript 類別與介面的定義與使用，包含建構子、繼承、實作、存取修飾符等物件導向程式設計概念
keywords:
  [
    TypeScript,
    類別,
    介面,
    Class,
    Interface,
    建構子,
    繼承,
    實作,
    存取修飾符,
    物件導向,
  ]
---

## 1\. 建立一致的物件：使用建構子函式或定義一個類別

在 TypeScript 中，類別（class）是用來創建一致物件的藍圖。你可以透過建構子（constructor）來初始化物件的屬性，確保每個物件都有相同的結構。

#### 範例：定義一個 Person 類別

```tsx
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  introduce(): string {
    return `大家好，我是 ${this.name}，今年 ${this.age} 歲！`;
  }
}

// 使用類別創建物件
const person1 = new Person("小明", 25);
console.log(person1.introduce()); // 輸出：大家好，我是 小明，今年 25 歲！
```

#### 解釋

- **class Person**：定義一個名為 Person 的類別，包含 name 和 age 兩個屬性。

- **constructor**：建構子函式，當你用 new Person() 創建物件時，會自動執行，用來初始化 name 和 age。

- **introduce 方法**：一個簡單的方法，回傳自我介紹的字串。

- **一致性**：每個 Person 物件都有 name 和 age 屬性，以及 introduce 方法，確保結構一致。

---

## 2\. 禁止從外部存取屬性與方法：使用 TypeScript 的存取控制關鍵字

TypeScript 提供三種存取控制關鍵字：public（公開）、protected（受保護）、private（私有），用來控制屬性或方法的存取權限。

#### 範例：使用 private 限制存取

```tsx
class BankAccount {
  private balance: number; // 私有屬性，只能內部存取
  public accountHolder: string; // 公開屬性，外部可存取

  constructor(accountHolder: string, initialBalance: number) {
    this.accountHolder = accountHolder;
    this.balance = initialBalance;
  }

  private updateBalance(amount: number): void {
    // 私有方法
    this.balance += amount;
  }

  public deposit(amount: number): void {
    // 公開方法
    if (amount > 0) {
      this.updateBalance(amount);
      console.log(`已存入 ${amount} 元，餘額：${this.balance} 元`);
    }
  }

  public getBalance(): number {
    // 公開方法，用來取得餘額
    return this.balance;
  }
}

// 使用範例
const account = new BankAccount("小華", 1000);
account.deposit(500); // 輸出：已存入 500 元，餘額：1500 元
console.log(account.getBalance()); // 輸出：1500
// console.log(account.balance); // 錯誤：balance 是 private，無法從外部存取
// account.updateBalance(200); // 錯誤：updateBalance 是 private，無法從外部呼叫
```

#### 解釋

- **private balance**：將 balance 設為私有，外部無法直接存取 account.balance。

- **private updateBalance**：私有方法，只能由類別內部的方法（如 deposit）呼叫。

- **public**：預設存取修飾詞，accountHolder 和 deposit、getBalance 都可以從外部存取。

- **好處**：透過 private 保護敏感資料（如銀行餘額），只能透過公開方法間接操作，增加安全性。

---

## 3\. 禁止修改屬性：使用 readonly 關鍵字

readonly 關鍵字讓屬性在初始化後無法被修改，類似於 const，但用於類別的屬性。

#### 範例：使用 readonly

```tsx
class Product {
  readonly id: string; // 只讀屬性
  name: string;
  price: number;

  constructor(id: string, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  updatePrice(newPrice: number): void {
    this.price = newPrice; // 可以修改 price
    // this.id = "new-id"; // 錯誤：id 是 readonly，無法修改
  }
}

// 使用範例
const product = new Product("P001", "手機", 10000);
console.log(product.id); // 輸出：P001
product.updatePrice(12000);
console.log(product.price); // 輸出：12000
// product.id = "P002"; // 錯誤：id 是 readonly，無法修改
```

#### 解釋

- **readonly id**：id 在建構子中初始化後，無法被修改，確保物件的唯一性。

- **非只讀屬性**：name 和 price 沒有 readonly，可以自由修改。

- **用途**：readonly 適合用於不希望被改變的屬性，例如產品 ID 或唯一識別碼。

---

## 4\. 簡化類別用建構子建立屬性的過程：使用簡潔的建構子語法

TypeScript 提供簡潔的建構子語法，讓你可以在建構子參數中直接定義屬性，省去手動宣告屬性的步驟。

#### 範例：簡潔建構子語法

```tsx
class Student {
  constructor(
    public name: string, // 自動生成公開屬性
    private id: string, // 自動生成私有屬性
    readonly grade: number // 自動生成只讀屬性
  ) {}

  getInfo(): string {
    return `學生：${this.name}，學號：${this.id}，年級：${this.grade}`;
  }
}

// 使用範例
const student = new Student("小美", "S123", 3);
console.log(student.name); // 輸出：小美
console.log(student.getInfo()); // 輸出：學生：小美，學號：S123，年級：3
// console.log(student.id); // 錯誤：id 是 private
// student.grade = 4; // 錯誤：grade 是 readonly
```

#### 解釋

- **簡潔語法**：在建構子參數前加上 public、private 或 readonly，TypeScript 會自動生成對應的屬性並賦值。

- **省略步驟**：不需要在類別中額外宣告 name、id、grade，也不需要在建構子中寫 `this.name = name`。

- **好處**：程式碼更簡潔，減少重複撰寫，特別適合屬性較多的類別。

---

## 5\. 定義共同類別功能讓子類別繼承：定義一個抽象類別

抽象類別（abstract class）用來定義共用的屬性和方法，子類別可以繼承並實現這些功能。抽象類別不能直接實例化。

#### 範例：抽象類別與繼承

```tsx
abstract class Animal {
  constructor(protected name: string) {}

  abstract makeSound(): void; // 抽象方法，子類別必須實作

  move(): string {
    // 一般方法，子類別可繼承
    return `${this.name} 正在移動！`;
  }
}

class Dog extends Animal {
  constructor(name: string) {
    super(name); // 呼叫父類別的建構子
  }

  makeSound(): void {
    // 實作抽象方法
    console.log(`${this.name} 汪汪叫！`);
  }
}

class Cat extends Animal {
  constructor(name: string) {
    super(name);
  }

  makeSound(): void {
    console.log(`${this.name} 喵喵叫！`);
  }
}

// 使用範例
const dog = new Dog("小黑");
dog.makeSound(); // 輸出：小黑 汪汪叫！
console.log(dog.move()); // 輸出：小黑 正在移動！

const cat = new Cat("小白");
cat.makeSound(); // 輸出：小白 喵喵叫！
console.log(cat.move()); // 輸出：小白 正在移動！
// const animal = new Animal("動物"); // 錯誤：無法實例化抽象類別
```

#### 解釋

- **abstract class Animal**：定義一個抽象類別，包含共用屬性 name 和方法 move，以及抽象方法 makeSound。

- **abstract makeSound**：子類別必須實作這個方法，否則會報錯。

- **extends**：Dog 和 Cat 繼承 Animal，可以直接使用 move 方法，並必須提供自己的 makeSound 實作。

- **好處**：抽象類別確保所有子類別都有共同行為，同時允許子類別定義獨特行為。

---

## 6\. 定義實作物件該有的形狀：定義一個介面

介面（interface）用來定義物件的形狀（屬性與方法的結構），但不包含實作細節。類別可以實作介面，確保符合指定的結構。

#### 範例：定義並實作介面

```tsx
interface Vehicle {
  brand: string; // 必須的屬性
  speed: number;
  accelerate(): void; // 必須的方法
}

class Car implements Vehicle {
  brand: string;
  speed: number;

  constructor(brand: string, speed: number) {
    this.brand = brand;
    this.speed = speed;
  }

  accelerate(): void {
    this.speed += 10;
    console.log(`${this.brand} 加速，當前速度：${this.speed} km/h`);
  }
}

// 使用範例
const car = new Car("Toyota", 60);
car.accelerate(); // 輸出：Toyota 加速，當前速度：70 km/h
```

#### 解釋

- **interface Vehicle**：定義物件必須有 brand 和 speed 屬性，以及 accelerate 方法。

- **implements Vehicle**：Car 類別必須實現介面中定義的所有屬性和方法，否則 TypeScript 會報錯。

- **好處**：介面確保物件符合特定結構，適合用於定義 API 回傳資料或類別的公用行為。

---

## 7\. 動態加入屬性：使用索引簽名

索引簽名（Index Signature）允許物件動態加入屬性，適用於無法預先知道所有屬性名稱的情況。以下是一個展示如何在 TypeScript 中使用索引簽名來動態加入屬性的範例。

#### 範例：使用索引簽名

```tsx
interface DynamicObject {
  [key: string]: string | number; // 索引簽名，鍵為字串，值為字串或數字
}

class Config implements DynamicObject {
  [key: string]: string | number; // 支援動態屬性

  constructor() {}

  setProperty(key: string, value: string | number): void {
    this[key] = value;
    console.log(`設定屬性 ${key} 為 ${value}`);
  }

  getProperty(key: string): string | number | undefined {
    return this[key];
  }
}

// 使用範例
const config = new Config();
config.setProperty("theme", "dark"); // 輸出：設定屬性 theme 為 dark
config.setProperty("fontSize", 16); // 輸出：設定屬性 fontSize 為 16
console.log(config.getProperty("theme")); // 輸出：dark
console.log(config.getProperty("fontSize")); // 輸出：16
console.log(config); // 輸出：Config { theme: 'dark', fontSize: 16 }

// 動態加入其他屬性
config.setProperty("language", "zh-TW"); // 輸出：設定屬性 language 為 zh-TW
console.log(config.getProperty("language")); // 輸出：zh-TW
```

#### 解釋

- **interface DynamicObject**：定義一個介面，使用索引簽名 `\[key: string\]: string | number`，表示物件可以有任意字串鍵，且值必須是字串或數字型別。

- **class Config implements DynamicObject**：Config 類別實作 DynamicObject 介面，並在類別內也定義相同的索引簽名 `\[key: string\]: string | number`，允許動態加入屬性。

- **setProperty 方法**：用來動態設定屬性，接受鍵（key）和值（value），並將其儲存在物件上。

- **getProperty 方法**：用來取得指定鍵的屬性值，若鍵不存在則回傳 undefined。

- **動態屬性**：透過 setProperty，可以任意新增屬性（例如 theme、fontSize、language），而無需在類別中預先定義。

- **型別安全**：索引簽名限制值的型別為 `string | number`，比使用 any 更安全。如果嘗試設定其他型別的值（例如 `config.setProperty("test", true)`），TypeScript 會報錯。

- **好處**：索引簽名適合用於動態資料結構，例如使用者設定的偏好選項、表單資料或 API 回傳的未知欄位。

- **注意**：雖然索引簽名提供了靈活性，但應謹慎使用，因為過於寬鬆的型別（例如 any）可能導致型別檢查失去作用。建議明確指定值的型別（例如 `string | number`）。

---

#### 補充：結合索引簽名與固定屬性

有時你可能希望物件同時有固定屬性和動態屬性，可以在介面中結合這兩者。

#### 範例：固定屬性與動態屬性

```tsx
interface UserProfile {
  name: string; // 固定屬性
  age: number; // 固定屬性
  [key: string]: string | number; // 動態屬性
}

class Profile implements UserProfile {
  name: string;
  age: number;
  [key: string]: string | number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  setDynamicProperty(key: string, value: string | number): void {
    this[key] = value;
    console.log(`設定 ${key} 為 ${value}`);
  }
}

// 使用範例
const profile = new Profile("小明", 25);
profile.setDynamicProperty("email", "ming@example.com"); // 輸出：設定 email 為 ming@example.com
profile.setDynamicProperty("phone", 1234567890); // 輸出：設定 phone 為 1234567890
console.log(profile); // 輸出：Profile { name: '小明', age: 25, email: 'ming@example.com', phone: 1234567890 }
```

#### 解釋

- **name 和 age**：固定屬性，必須在建構子中初始化。

- **`[key: string]: string | number`**：允許動態新增其他屬性。

- **用途**：這種方式適合需要既有固定結構又允許擴展的情況，例如使用者資料可能有固定的欄位（姓名、年齡）和動態欄位（電子郵件、電話等）。

---

## 總結

以下是每個需求的簡要回顧與 TypeScript 的應用場景：

1. **一致物件**：使用 class 和 constructor 確保物件結構一致。

2. **存取控制**：用 private、protected、public 限制屬性和方法的存取範圍。

3. **禁止修改**：用 readonly 保護屬性不被修改。

4. **簡潔建構子**：在建構子參數中使用存取修飾詞，減少程式碼重複。

5. **繼承**：用 abstract class 定義共用功能，子類別透過 extends 繼承。

6. **介面**：用 interface 定義物件形狀，類別透過 implements 實現。

7. **動態屬性**：用索引簽名 `[key: string]` 支援動態屬性。
