---
title: 閉包（Closure）
description: 深入了解 JavaScript 閉包的概念與應用，包含作用域鏈、變數保存、模組化設計等進階程式設計技巧
keywords:
  [JavaScript, 閉包, Closure, 作用域, Scope, 變數保存, 模組化, 函式, 作用域鏈]
---

### 什麼是閉包？

閉包的核心是**作用域（Scope）**。在 JavaScript 中，每個函式都有自己的作用域，而閉包讓內部函式可以存取外部函式的變數，即使外部函式已經執行完畢。這種特性讓閉包非常適合用來：

- 封裝私有變數

- 建立資料隱藏

- 實現模組化程式碼

```javascript
function add(num) {
  function func(x = 0) {
    return num + x
  }
  return func
}
let addFive = add(5)
console.log(addFive(8)) //13
```

add是一個接收num、回傳函數func的函數。由於JS引擎內有自動執行的記憶體回收機制，理論上在函數執行完畢、建構函數的環境被回收後，也會移並將該函數刪除，函數所占用的記憶體空間也就因此被釋放；但在此處的範例中，可以看到參數num在add執行完畢後仍然可以被回傳出去的函數使用，沒有跟著add一起被回收掉。

這種把外層變數包在內層保留，以供後續使用的機制，也就是閉包。

閉包發生的時機是在函數被建立時，每當新的函數建立出來，JS會將函數所在位置的執行環境及函數外層的作用域鏈記錄下來，以供新函數內部使用。

## 執行環境

執行環境(Excution Context，EC)，指的是JS底層在程式準備執行時，針對全域及函數所建立的一個內部物件，主要儲存：

- 內部的變數(Variable Object，VO，也就是Hoisting發生的原因)

- 外部環境&作用域鏈(Scope Chain)

- 這個環境的this值

圖9-1

### 範例一：無閉包的情境

```javascript
var a = 0
function b() {
  var a = 10
  function c() {
    console.log(a)
  }
  c()
}
b() //10
```

可以想像EC會長成：

圖9-2

當執行時，依序會進行下面的事情：

- 建立Global EC，預留變數a的空間，建立函數b物件，並記錄函數b的作用域鏈

- 變數a賦值a=0，接著呼叫函數b()

- 準備函數b，建立函數c的作用域鏈

- 執行b()，區域變數a賦值a =10，接著呼叫函數c()

- 準備函數c，建立function c() EC，並依照作用域鏈找到function b() EC中的區域變數a

- 執行 c()，呼叫console.log(a)；印出10

- c()執行結束，消除function c() EC

- b()執行結束，消除function b() EC

- 程式執行結束

在沒有發生閉包的情境下，JS會依照呼叫的先後次序，一一建立EC，並在執行完成後將EC消除，釋放記憶體空間。

### 範例二：有閉包的情境

修改讓函數b回傳函數c：

```javascript
var a = 0
function b() {
  var a = 10
  function c() {
    console.log(a)
  }
  return c
}
var func = b()
console.log(a) // 0
func() // 10
```

圖9-3

- 建立Global EC，預留變數a、**func**的空間，建立函數b物件，並記錄函數b的作用域鏈

- **執行Global EC**，變數 a 賦值 a=0，呼叫函數b()

- 準備函數b，建立 function b() EC，預留區域變數 a 的空間，建立函數 c 物件，並記錄函數c的作用域鏈

- 執行b()，區域變數a賦值a =10，回傳函數c()

- b()執行結束，消除function b() EC

執行到這裡時，function b() EC內的a被回傳的函數c閉包了

- 變數func賦值成函數b()的執行結果———函數c

- 執行console.log(a)，印出Global EC中的a:1；接著呼叫func()

- 準備函數c，建立function c() EC，並依照作用域鏈找到function b() EC中的區域變數a

- 執行func()，執行console.log(a)；印出10

- func()執行結束，消除function c() EC

- 程式執行結束

由於閉包，在b()執行結束時，其中的區域變數a並未跟著function b()的EC一起消失，而是留給建立a變數參照的function c() EC使用，直到c()執行完畢，參照消失，a變數所占用的記憶體才會跟著一起被釋放。

### 延伸閱讀

「閉包」這個詞其實有許多定義，本文撰寫時所採用的說法是較偏向實際開發時會考慮的情境，也就是將「內層函數引用外層參數」的行為稱呼為閉包。

但在MDN及Wiki中都有提到類似的定義：「閉包是由函數和與其相關的參照環境組合而成的實體」，而實際上在JS底層的行為中，每一個函數建立都會記錄他所在的作用域環境，因此也可以說，所有函數是閉包。

---

### 閉包的運作原理

假設你有一個外部函式，裡面定義了一些變數和一個內部函式。內部函式可以存取這些變數，即使外部函式已經執行完，內部函式仍然「記得」這些變數。這是因為 JavaScript 的\*\*詞法作用域（Lexical Scope）\*\*規則，讓內部函式保留了對外部變數的參考。

---

### 範例 1：簡單的閉包

以下是一個簡單的閉包範例，讓你理解閉包如何運作：

```javascript
function outerFunction() {
    let outerVariable = '我是一個外部變數';

    function innerFunction() {
        console.log(outerVariable); // 內部函式可以存取外部變數
    }

    return innerFunction; // 回傳內部函式
}

const myClosure = outerFunction(); // 執行外部函式，得到內部函式
myClosure(); // 執行內部函式，輸出：我是一個外部變數
```

#### 步驟解析：

1. **outerFunction 定義了一個變數 outerVariable**：這個變數只存在於 outerFunction 的作用域中。

2. **內部函式 innerFunction**：可以存取 outerVariable，因為它位於 outerFunction 的作用域內。

3. **outerFunction 回傳 innerFunction**：這時 outerFunction 執行完畢，但 innerFunction 仍然保留對 outerVariable 的參考。

4. **執行 myClosure()**：即使 outerFunction 已經執行完，innerFunction 依然能輸出 outerVariable 的值，這就是閉包的魔法！

#### 操作練習：

1. 開啟你的瀏覽器（例如 Chrome），按下 **F12** 開啟開發者工具。

2. 在 **Console** 面板中，複製貼上上面的程式碼。

3. 按下 Enter 執行，觀察輸出結果。

4. 試著把 outerVariable 的值改成其他內容（例如 'Hello, Closure!'），再執行一次，看看結果是否改變。

---

### 範例 2：使用閉包實現計數器

閉包常用來封裝私有變數，像是實現一個計數器。以下是一個計數器的範例：

```javascript
function createCounter() {
    let count = 0; // 私有變數，只有內部函式可以存取

    function increment() {
        count++; // 遞增 count
        console.log('計數器目前值：', count);
    }

    return increment; // 回傳內部函式
}

const counter = createCounter(); // 建立一個計數器
counter(); // 輸出：計數器目前值：1
counter(); // 輸出：計數器目前值：2
counter(); // 輸出：計數器目前值：3
```

#### 步驟解析：

1. **createCounter 函式**：定義了一個私有變數 count，初始值為 0。

2. **內部函式 increment**：每次呼叫會讓 count 增加 1，並輸出目前值。

3. **回傳 increment**：外部無法直接存取 count，只能透過 increment 來操作，這實現了資料隱藏。

4. **執行 counter()**：每次呼叫 counter() 都會增加 count，因為閉包讓 increment 記住了 count。

#### 操作練習：

1. 在瀏覽器的 Console 中，複製貼上這段程式碼。

2. 執行 counter() 多次，觀察 count 如何遞增。

3. 試著建立另一個計數器，例如 const anotherCounter = createCounter();，然後執行 anotherCounter()，看看是否獨立於第一個計數器（應該會從 0 開始）。

---

### 範例 3：閉包與參數

閉包也可以搭配參數來建立更靈活的功能。以下是一個帶參數的閉包範例：

```javascript
function greet(name) {
    let greeting = '你好，' + name + '！';

    function sayHello() {
        console.log(greeting);
    }

    return sayHello;
}

const greetJohn = greet('John'); // 傳入參數 'John'
greetJohn(); // 輸出：你好，John！

const greetMary = greet('Mary'); // 傳入參數 'Mary'
greetMary(); // 輸出：你好，Mary！
```

#### 步驟解析：

1. **greet 函式**：接受一個參數 name，並建立一個變數 greeting。

2. **內部函式 sayHello**：存取 greeting，並在執行時輸出。

3. **回傳 sayHello**：每次呼叫 greet 時，會產生一個新的閉包，記住各自的 greeting。

4. **執行 greetJohn 和 greetMary**：每個閉包獨立記住自己的 greeting，互不影響。

#### 操作練習：

1. 在 Console 中執行這段程式碼。

2. 試著傳入不同的名字（例如 '小明' 或 '小華'），看看輸出的招呼語是否正確。

3. 思考：如果把 greeting 改成全域變數，會發生什麼？（提示：閉包的獨立性會消失，所有函式共用同一個 greeting）

---

### 閉包的常見應用場景

1. **資料隱藏與封裝**：

   - 像範例 2 的計數器，外部無法直接修改 count，只能透過回傳的函式操作，確保資料安全。

2. **模組化程式碼**：

   - 閉包可以用來模擬物件導向的私有屬性，像是模組模式（Module Pattern）。

3. **非同步操作**：

   - 在事件監聽器、setTimeout 或 API 呼叫中，閉包能確保變數在非同步執行時仍然有效。

4. **函式工廠**：

   - 像範例 3，根據不同參數產生不同功能的函式。

---

### 注意事項

1. **記憶體使用**：

   - 閉包會保留外部變數的參考，如果不小心使用，可能導致記憶體洩漏。例如，事件監聽器未移除可能導致變數一直被保留。

2. **小心全域變數**：

   - 如果不小心把變數定義在全域作用域，可能導致閉包失去封裝的優勢。

---

### 進階練習：模組模式

如果你想更深入理解閉包，可以試試以下模組模式的範例：

```javascript
function createPerson() {
    let name = '小明';
    let age = 25;

    return {
        getName: function() {
            return name;
        },
        setName: function(newName) {
            name = newName;
        },
        getAge: function() {
            return age;
        },
        setAge: function(newAge) {
            age = newAge;
        }
    };
}

const person = createPerson();
console.log(person.getName()); // 輸出：小明
person.setName('小華');
console.log(person.getName()); // 輸出：小華
console.log(person.getAge()); // 輸出：25
```

#### 操作練習：

1. 在 Console 中執行這段程式碼。

2. 試著呼叫 person.setAge(30)，然後用 person.getAge() 檢查結果。

3. 試著直接存取 person.name 或 person.age，看看會發生什麼？（提示：應該會得到 undefined，因為這些變數是私有的）

---

### 總結

- **閉包的核心**：內部函式記住外部函式的變數，即使外部函式執行完畢。

- **使用場景**：資料隱藏、模組化、非同步操作等。

- **操作建議**：透過 Console 練習以上範例，觀察閉包如何「記住」變數，並嘗試修改程式碼來加深理解。