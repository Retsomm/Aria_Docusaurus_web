---
title: 在 TypeScript 中使用泛型
description: 深入了解 TypeScript 泛型的概念與應用，包含泛型函式、泛型類別、泛型介面、條件約束等進階技巧
keywords:
  [
    TypeScript,
    泛型,
    Generics,
    泛型函式,
    泛型類別,
    泛型介面,
    型別參數,
    型別約束,
    型別安全,
  ]
---

## 1\. 定義一個可以安全操作不同型別資料的類別或函式：定義一個泛型參數

泛型（Generics）允許我們在定義類別或函式時，使用一個「佔位型別」（泛型參數），讓程式碼可以靈活處理不同型別的資料，並保持型別安全。

#### 範例：定義一個泛型函式

我們定義一個函式，用來回傳輸入的資料，並使用泛型參數來確保輸入與輸出的型別一致。

```tsx
// 定義一個泛型函式，T 是泛型參數
function identity<T>(value: T): T {
  return value;
}

// 使用範例
const stringResult = identity<string>("Hello, TypeScript!"); // 明確指定 T 為 string
const numberResult = identity<number>(42); // 明確指定 T 為 number
const booleanResult = identity(true); // TypeScript 會自動推斷 T 為 boolean

console.log(stringResult); // 輸出: Hello, TypeScript!
console.log(numberResult); // 輸出: 42
console.log(booleanResult); // 輸出: true
```

**解釋**：

- `<T>` 是泛型參數，T 是一個型別變數，代表某個型別。

- 函式 identity 接受一個型別為 T 的參數 value，並回傳相同型別 T 的值。

- 在呼叫時，可以明確指定型別（例如 `identity<string>`），或讓 TypeScript 自動推斷型別（例如 `identity(true)`）。

#### 範例：定義一個泛型類別

我們定義一個泛型類別來儲存和管理某種型別的資料。

```tsx
// 定義一個泛型類別
class Box<T> {
  private content: T;

  constructor(value: T) {
    this.content = value;
  }

  getContent(): T {
    return this.content;
  }

  setContent(value: T): void {
    this.content = value;
  }
}

// 使用範例
const stringBox = new Box<string>("TypeScript");
console.log(stringBox.getContent()); // 輸出: TypeScript

const numberBox = new Box<number>(100);
console.log(numberBox.getContent()); // 輸出: 100
```

**解釋**：

- `Box<T>` 是一個泛型類別，T 是泛型參數。

- content 屬性的型別是 T，確保儲存的資料與指定的型別一致。

- 建構函式和方法都使用 T 來保持型別安全。

---

## 2\. 決定泛型參數的實際型別：在初始化類別或呼叫函式時填入泛型引數

在初始化泛型類別或呼叫泛型函式時，我們可以明確指定泛型參數的實際型別，或依靠 TypeScript 的型別推斷。

#### 範例：明確指定泛型引數

```tsx
// 泛型函式
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// 明確指定 T 為 { name: string }，U 為 { age: number }
const merged = merge<{ name: string }, { age: number }>(
  { name: "Alice" },
  { age: 25 }
);
console.log(merged); // 輸出: { name: "Alice", age: 25 }

// 型別推斷
const inferred = merge({ name: "Bob" }, { age: 30 });
console.log(inferred); // 輸出: { name: "Bob", age: 30 }
```

#### 範例：初始化泛型類別

```tsx
// 定義泛型類別
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}

// 明確指定型別
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 輸出: 2

// 型別推斷
const stringStack = new Stack(); // TypeScript 推斷為 Stack<string>
stringStack.push("Hello");
console.log(stringStack.pop()); // 輸出: Hello
```

**解釋**：

- 在 merge 函式中，可以明確指定 T 和 U 的型別，或者讓 TypeScript 根據傳入的參數自動推斷。

- 在 Stack 類別中，初始化時可以指定型別（例如 `Stack<number>`），或省略型別讓 TypeScript 推斷。

### TypeScript 型別推斷的運作方式

TypeScript 的型別推斷是一種自動推導變數或物件型別的功能，當你沒有明確指定型別時，TypeScript 會根據上下文和使用方式來推斷最適合的型別。在你的例子中，Stack 是一個泛型類別，定義如下：

```tsx
class Stack<T> {
  private items: T[] = [];
  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
}
```

這裡的 T 是一個泛型參數，代表 Stack 類別可以處理任意型別的資料。當你創建一個 Stack 實例時，TypeScript 會嘗試根據上下文來推斷 T 的具體型別。

---

### 為什麼 stringStack 被推斷為 `Stack<string>`？

在你的程式碼中：

```tsx
const stringStack = new Stack(); // TypeScript 推斷為 Stack<string>
stringStack.push("Hello");
console.log(stringStack.pop()); // 輸出: Hello
```

當你寫 `const stringStack = new Stack();` 時，TypeScript 並**沒有立即確定 T 的型別**，因為你沒有明確指定泛型參數（例如 `new Stack<string>()`）。這時，TypeScript 會進入一種「待定」狀態，等待後續的上下文來推斷 T 的型別。

在下一行：

```tsx
stringStack.push("Hello");
```

你呼叫了` stringStack.push("Hello")`，而 "Hello" 是一個字面量型別 string。根據 push 方法的定義：

```tsx
push(item: T): void
```

TypeScript 會推斷 item 的型別是 string，進而推斷泛型參數 T 必須是 string。因此，整個 stringStack 的型別被推斷為 `Stack<string>`。

這種推斷是基於 TypeScript 的**上下文型別推斷（Contextual Typing）**，它會根據你如何使用變數或方法來推導型別。

---

### 為什麼不是其他型別？

你可能會想：為什麼 TypeScript 不會推斷成 `Stack<any>` 或其他型別？這是因為 TypeScript 會盡量選擇**最具體的型別**來確保型別安全。在這個例子中：

- 你在 push 方法中傳入了一個 string 型別的值`（"Hello"）`。

- TypeScript 根據這個值推斷 T 為 string，因為這是最符合上下文的型別。

- 如果你後續再呼叫 stringStack.push(123)，TypeScript 會因為型別不匹配（123 是 number，而 T 已被推斷為 string）而報錯，這確保了型別安全。

---

### 如果不呼叫 push，會發生什麼？

如果你只寫了以下程式碼：

```tsx
const stringStack = new Stack();
```

而沒有後續的 `push("Hello")`，TypeScript 無法從上下文推斷 T 的型別。在這種情況下，TypeScript 會將 T 推斷為 any，也就是 `Stack<any>`。這是因為 TypeScript 沒有足夠的資訊來判斷 T 應該是什麼型別。

例如：

```tsx
const stack = new Stack();
stack.push("Hello");
stack.push(123); // 不會報錯，因為 T 被推斷為 any
```

在這種情況下，`Stack<any>` 會允許任何型別的資料被推入堆疊，這可能會導致型別安全問題。因此，建議在創建泛型類別實例時，明確指定型別（例如 `new Stack<string>()`），以避免不必要的 any 推斷。

---

### 程式碼完整範例與說明

為了讓你更清楚理解，以下是完整的程式碼，並附上詳細的註解：

```tsx
// 定義泛型類別 Stack<T>
class Stack<T> {
  private items: T[] = []; // 儲存 T 型別的陣列

  // 將 item 推入堆疊
  push(item: T): void {
    this.items.push(item);
  }

  // 從堆疊彈出並返回頂端元素
  pop(): T | undefined {
    return this.items.pop();
  }
}

// 明確指定型別為 number
const numberStack = new Stack<number>();
numberStack.push(1); // 推入數字 1
numberStack.push(2); // 推入數字 2
console.log(numberStack.pop()); // 輸出: 2

// 型別推斷的例子
const stringStack = new Stack(); // 初始時 T 尚未確定
stringStack.push("Hello"); // 推入字串 "Hello"，T 被推斷為 string
console.log(stringStack.pop()); // 輸出: Hello

// 如果不指定型別且無上下文，T 會是 any
const anyStack = new Stack(); // T 推斷為 any
anyStack.push("Hello"); // 可以推入字串
anyStack.push(123); // 也可以推入數字
console.log(anyStack.pop()); // 輸出: 123
```

---

### 如何避免型別推斷為 any？

為了確保型別安全，建議在創建泛型類別實例時，明確指定泛型參數。例如：

```tsx
const stringStack = new Stack<string>(); // 明確指定 T 為 string
stringStack.push("Hello"); // 正確
stringStack.push(123); // 錯誤：TypeScript 會報錯，因為 123 不是 string
```

這樣可以避免 TypeScript 推斷為 any，並確保你的程式碼在編譯時期就能捕捉到型別錯誤。

---

### 總結

1. **為什麼 stringStack 被推斷為 `Stack<string>`？**

   - 因為你在 `stringStack.push("Hello")` 中傳入了一個 string 型別的值，TypeScript 根據上下文推斷泛型參數 T 為 string。

2. **型別推斷的機制**：

   - TypeScript 會根據你如何使用泛型類別（例如呼叫 push 方法時傳入的值）來推斷 T 的型別。

   - 如果沒有足夠的上下文，TypeScript 會推斷 T 為 any。

3. **建議**：

   - 為了型別安全，建議明確指定泛型參數（例如 `new Stack<string>()`）。

   - 避免僅依賴型別推斷，特別是在泛型類別的使用情境中。

---

## 3\. 繼承泛型類別：建立一個類別來繼承泛型類別，並沿用、鎖定或限制從父類別繼承而來的泛型型別

我們可以讓子類別繼承泛型父類別，並根據需求沿用、鎖定或限制泛型型別。

#### 範例：繼承泛型類別

```tsx
// 定義泛型父類別
class Container<T> {
  protected item: T;

  constructor(item: T) {
    this.item = item;
  }

  getItem(): T {
    return this.item;
  }
}

// 沿用泛型型別
class StringContainer extends Container<string> {
  constructor(item: string) {
    super(item);
  }

  describe(): string {
    return `This is a string container with value: ${this.item}`;
  }
}

// 限制泛型型別
interface Printable {
  print(): string;
}

class PrintableContainer<T extends Printable> extends Container<T> {
  printItem(): string {
    return this.item.print();
  }
}

// 使用範例
const stringContainer = new StringContainer("Test");
console.log(stringContainer.describe()); // 輸出: This is a string container with value: Test

class Book implements Printable {
  constructor(private title: string) {}
  print(): string {
    return `Book: ${this.title}`;
  }
}

const bookContainer = new PrintableContainer(new Book("TypeScript Guide"));
console.log(bookContainer.printItem()); // 輸出: Book: TypeScript Guide
```

**解釋**：

- StringContainer 繼承` Container<string>`，鎖定泛型型別為 string。

- PrintableContainer 繼承 Container`<T>`，並限制 T 必須實現 Printable 介面（使用 extends Printable）。

- 子類別可以新增自己的方法（例如 describe 或 printItem），並利用父類別的泛型屬性。

---

## 4\. 對泛型使用型別防衛敘述：使用型別謂詞函式

型別謂詞（Type Predicate）是一種特殊的回傳型別，用來縮小泛型參數的型別範圍。

#### 範例：使用型別謂詞

```tsx
// 定義一個介面
interface Animal {
  makeSound(): string;
}

// 型別謂詞函式
function isString<T>(value: T): value is T & string {
  return typeof value === "string";
}

// 泛型函式使用型別防衛
function processValue<T>(value: T): string {
  if (isString(value)) {
    // 在此分支中，TypeScript 知道 value 是 string
    return `String value: ${value.toUpperCase()}`;
  }
  return `Non-string value: ${value}`;
}

// 使用範例
console.log(processValue("Hello")); // 輸出: String value: HELLO
console.log(processValue(123)); // 輸出: Non-string value: 123
```

**解釋**：

- isString 是一個型別謂詞函式，回傳 value is T & string，表示如果條件成立，value 的型別會被縮小為 string。

- 在 processValue 中，使用 isString 檢查後，TypeScript 會自動將 value 視為 string，允許使用 string 的方法（例如 toUpperCase）。

---

## 5\. 在泛型類別加入獨立函式：定義靜態方法

靜態方法（static method）是類別層級的方法，不需要實例化即可呼叫。我們可以在泛型類別中定義靜態方法。

#### 範例：泛型類別與靜態方法

```tsx
class Repository<T> {
  private items: T[] = [];

  static createEmpty<T>(): Repository<T> {
    return new Repository<T>();
  }

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return this.items;
  }
}

// 使用範例
const numberRepo = Repository.createEmpty<number>();
numberRepo.add(1);
numberRepo.add(2);
console.log(numberRepo.getAll()); // 輸出: [1, 2]

const stringRepo = Repository.createEmpty<string>();
stringRepo.add("Apple");
stringRepo.add("Banana");
console.log(stringRepo.getAll()); // 輸出: ["Apple", "Banana"]
```

**解釋**：

- createEmpty 是一個靜態方法，使用泛型參數 T 來創建一個空的 Repository 實例。

- 靜態方法不需要實例化即可呼叫，適合用來提供工廠方法或工具方法。

---

## 6\. 定義一個泛型功能但不實作之：以泛型參數定義一個介面

我們可以使用泛型來定義介面，描述某種功能的結構，但不提供具體實作。

#### 範例：泛型介面

```tsx
// 定義泛型介面
interface DataProcessor<T> {
  process(data: T): T;
}

// 實作泛型介面
class StringProcessor implements DataProcessor<string> {
  process(data: string): string {
    return data.toUpperCase();
  }
}

class NumberProcessor implements DataProcessor<number> {
  process(data: number): number {
    return data * 2;
  }
}

// 使用範例
const stringProcessor = new StringProcessor();
console.log(stringProcessor.process("hello")); // 輸出: HELLO

const numberProcessor = new NumberProcessor();
console.log(numberProcessor.process(5)); // 輸出: 10
```

**解釋**：

- `DataProcessor<T>` 是一個泛型介面，定義了一個 process 方法，接受型別 T 的輸入並回傳型別 T。

- StringProcessor 和 NumberProcessor 分別實作 DataProcessor，並指定 T 為 string 或 number。

- 泛型介面允許我們定義通用的功能藍圖，讓不同的類別以不同型別實現。

---

### 總結與建議

- **泛型的核心優勢**：提供型別安全和程式碼重用性，讓函式或類別可以處理多種型別而不失嚴謹。

- **操作步驟建議**：

  1.  定義泛型時，使用 `<T>`（或其他字母）作為型別佔位符。

  2.  在使用時，根據需要明確指定型別或依賴 TypeScript 推斷。

  3.  繼承泛型類別時，考慮是否需要鎖定或限制型別（例如 extends）。

  4.  使用型別謂詞來縮小型別範圍，增強型別檢查的靈活性。

  5.  在類別中加入靜態方法來提供便利的初始化或工具功能。

  6.  使用泛型介面來定義抽象功能，方便不同類別實現。

- **實務建議**：在前端開發中，泛型常用於處理 API 回應資料、表單資料結構或元件屬性（props）。建議從簡單的泛型函式開始練習，逐步應用到類別和介面。
