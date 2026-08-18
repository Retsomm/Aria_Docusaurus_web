---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 1 堂：JS 執行模型基礎

# 03 Scope 與 Scope Chain

在上一節中，我們觀察到 JavaScript 引擎如何透過 Call Stack 來管理函式的執行順序。每當一個函式被呼叫，一個新的執行環境（Execution Context, EC）就會被推入堆疊。然而，這裡有一個隱藏的關鍵問題：**當程式碼在執行環境中運行並遇到一個變數時，它如何知道這個變數代表什麼？**

如果我們在不同的地方定義了同名的變數，JavaScript 會選擇哪一個？這種「尋找變數」的規則，就是我們這一節要探討的核心：**Scope（作用域）** 與 **Scope Chain（作用域鏈）**。

---

## 誰決定了變數的歸屬？

讓我們從一個簡單的「直覺測試」開始。請預測以下程式碼會印出什麼：

```javascript
const name = "全域小強";

function second() {
  console.log(name);
}

function first() {
  const name = "區域小明";
  second();
}

first();
```

你認為結果會是「區域小明」還是「全域小強」？

如果你直覺認為 `second()` 是在 `first()` 裡面被呼叫的，而 `first()` 裡面正好有一個 `name` 變數，所以應該印出「區域小明」，那麼你可能掉進了「動態作用域（Dynamic Scope）」的陷阱。

**正確答案是：「全域小強」。**

這個結果揭示了 JavaScript 最重要的一個特性：**詞法作用域（Lexical Scope）**。

### 詞法作用域：位置決定一切

「詞法（Lexical）」這個詞在程式語言中通常指「撰寫時」或「編譯時」。

**詞法作用域（Lexical Scope）** 指的是：變數的作用域是在你**寫下程式碼的那一刻**，根據函式定義在原始碼中的物理位置來決定的。它與函式「在哪裡被呼叫」完全無關，只與函式「在哪裡被定義」有關。

在上面的例子中：

1. `second` 函式是在全域環境中被定義的。
2. 對於 `second` 來說，它的「外面」就是全域環境。
3. 即使它被 `first` 呼叫，它的靈魂（作用域）依然與全域綁定。

這種設計讓程式碼的行為變得極其可預測。只要你看著原始碼，不需要執行它，就能判斷出某個變數會指向哪裡。這也是為什麼我們常說 JavaScript 的作用域是「靜態」的。

---

## 作用域的層級結構

在 JavaScript 中，作用域並不是扁平的，而是存在層級之分。主要可以分為以下三類：

### 全域作用域（Global Scope）

這是最外層的作用域。在瀏覽器環境下，全域作用域就是 `window` 物件（在 Node.js 中則是 `global`）。在全域作用域中宣告的變數，在程式碼的任何地方都可以存取。

### 函式作用域（Function Scope）

每當你定義一個函式，你就建立了一個新的函式作用域。在函式內部宣告的變數，外部是無法存取的。這就是為什麼函式常被用來封裝私有資料，避免污染全域空間。

### 區塊作用域（Block Scope）

這是 ES6（2015 年）引入的重要特性。在使用 `let` 與 `const` 時，任何一對花括號 `{ ... }`（例如 `if` 判斷式、`for` 迴圈）都會建立一個獨立的區塊作用域。

> **重要區分：** 傳統的 `var` 並不具備區塊作用域，它只認函式。這也是為什麼現代 JavaScript 開發強烈建議使用 `let` 與 `const` 來避免意外的變數溢出。

---

## 作用域鏈（Scope Chain）的真實機制

我們已經知道每個執行環境（EC）都有一個 **環境紀錄（Environment Record）** 來儲存變數。但 EC 還有另一個關鍵欄位：**外部環境參考（Outer Environment Reference）**。

這就是 **作用域鏈（Scope Chain）** 的物理基礎。當 JavaScript 引擎建立一個執行環境時，它會去查看這個函式在原始碼中「被寫在哪裡」，然後將該位置的外部環境指派給這個 `Outer` 參考。

### 變數尋找的演算法

當程式執行到 `console.log(x)` 時，引擎會啟動一個尋找流程：

1. **當前作用域：** 引擎先檢查目前執行中的 EC，其環境紀錄中是否有 `x`？如果有，就回傳並結束尋找。
2. **外部環境：** 如果找不到，引擎會順著 `Outer Reference` 往上一層作用域移動。
3. **重複尋找：** 在上一層的環境紀錄中繼續尋找 `x`。
4. **抵達全域：** 這個過程會一直持續，直到找到變數，或者抵達 **全域執行環境（Global EC）**。
5. **報錯或失敗：** 如果連全域環境都沒有 `x`：
  - 若是「讀取」行為（RHS），會拋出 `ReferenceError`。
- 若是「賦值」行為（LHS）且不在嚴格模式下，則會在全域建立一個新變數（這是 JS 著名的雷點）。

### 圖解：鏈條是如何串聯的？

想像你有三層嵌套的函式：

```javascript
const globalVar = "Global";

function outer() {
  const outerVar = "Outer";

  function inner() {
    const innerVar = "Inner";
    console.log(innerVar, outerVar, globalVar);
  }

  inner();
}

outer();
```

當執行到 `inner()` 內部時，Call Stack 與 Scope Chain 的狀態如下：

1. **Inner EC**: 
  - 變數：`innerVar`
- Outer：指向 `outer` 的 EC
2. **Outer EC**: 
  - 變數：`outerVar`
- Outer：指向全域 EC
3. **Global EC**: 
  - 變數：`globalVar`
- Outer：`null`（鏈條終點）

當 `inner` 試圖讀取 `outerVar` 時，它在自己的環境找不到，於是透過 `Outer` 指針跳到 `outer` 的環境並成功獲取。這種**由內向外**的單向查找路徑，就是 Scope Chain。

---

## 遮蔽效應（Variable Shadowing）

在作用域鏈中，如果內層作用域宣告了與外層同名的變數，會發生什麼事？

```javascript
const fruit = "蘋果";

function eat() {
  const fruit = "香蕉";
  console.log("正在吃：", fruit);
}

eat();
console.log("籃子裡還有：", fruit);
```

執行結果：

- 正在吃：香蕉
- 籃子裡還有：蘋果

這稱為 **遮蔽效應（Shadowing）**。因為引擎是由內向外找，一旦在內層找到了 `fruit`（香蕉），它就心滿意足地結束了尋找任務，永遠不會看到外層的「蘋果」。這並不會改變外層變數的值，只是在該作用域內暫時「遮住」了它。

---

## 為什麼外層看不到內層？

這是一個常見的學生問題：「為什麼我可以從裡面看外面，但不能從外面看裡面？」

這必須回到 **執行環境的生命週期**。
當一個內層函式執行時，外層函式必然還在 Call Stack 中（或者至少其作用域已經被保留，我們會在 Closure 章節細講）。但當程式碼執行在「外層」時，內層函式甚至還沒有被呼叫，它的執行環境根本不存在。

更本質的原因是：**Scope Chain 是單向的鏈結串列（Singly Linked List）**。每個環境只有一個 `Outer` 指針指向外面，並沒有 `Inner` 指針指向裡面。

---

## React 中的 Scope Chain：實踐與連結

理解了 Scope Chain，你就能解開 React 開發中許多「理所當然」但細思極恐的行為。

### 為什麼 Event Handler 可以存取 Props？

看看這個標準的 React 元件：

```javascript
const UserProfile = ({ name }) => {
  const [age, setAge] = useState(20);

  const handleClick = () => {
    // 這裡為什麼可以存取到 name 和 age？
    console.log(`Hello ${name}, you are ${age} years old.`);
  };

  return <button onClick={handleClick}>點我</button>;
};
```

這背後的 JS 原理就是 Scope Chain：

1. `UserProfile` 是一個函式，當它被 React 呼叫（渲染）時，會建立一個執行環境（EC）。
2. `name`（從 props 解構）和 `age`（狀態）都存在於 `UserProfile` 的環境紀錄中。
3. `handleClick` 是在 `UserProfile` 內部**定義**的函式。
4. 根據詞法作用域，`handleClick` 的 `Outer Reference` 會指向 `UserProfile` 的環境。
5. 因此，當按鈕被點擊、`handleClick` 執行時，它能透過 Scope Chain 輕易地找到外層的 `name` 與 `age`。

這就是為什麼我們不需要透過參數傳遞，就能在元件內部的各種小函式中直接使用狀態。

### 預覽：閉包（Closure）的萌芽

如果你把 `handleClick` 傳遞給一個子元件，甚至是一個非同步的 `setTimeout`，過了 5 秒後執行，它依然能找到當初那個 `name`。

這聽起來很神奇，因為 5 秒後 `UserProfile` 函式早就執行完了（理論上它的 EC 應該從 Stack 中彈出了）。**為什麼變數還在？** 

這就是我們下一個主題 **Closure（閉包）** 的核心：當一個函式「記住」了它的 Scope Chain，並且被帶到了它的出生地之外執行時，它會強行把那個 Scope Chain 留下來，不讓垃圾回收機制（Garbage Collection）把它清掉。

---

## 總結與回顧

掌握 Scope Chain 是從「寫程式碼」進化到「理解程式碼執行」的關鍵一步。

- **Lexical Scope**：決定作用域的是「定義位置」，不是「呼叫位置」。
- **Outer Reference**：每個環境都有一個指針指向它的物理外層，串聯成鏈。
- **單向查找**：由內而外，找不到就去全域找，再找不到就報錯。
- **遮蔽效應**：內層變數會遮住同名的外層變數。

透過這三個部分（執行環境、Call Stack、Scope Chain），我們已經建立了一個完整的 **JavaScript 執行靜態模型**。我們知道環境如何建立、呼叫如何堆疊，以及變數如何尋找。

在下一節中，我們將探討這個模型中一個有趣的現象：**Hoisting（提升）**。為什麼有些變數在宣告之前就能被存取？這背後的機制其實就在我們剛學過的執行環境「建立階段」中。最後，我們也會透過一個綜合練習，手動追蹤一段複雜的程式碼，將目前學到的所有概念融會貫通。

**重點提醒：** 請務必記住 Scope Chain 是在**函式建立時**就決定好的，這個觀念將會是你理解 React Hooks（特別是處理 Stale Closure 這種棘手 bug）時最重要的武器。我們下節課見。
