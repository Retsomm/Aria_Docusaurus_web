---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 5 堂：Prototype 與原型鏈

# 13 Prototype 與查找鏈

## 為什麼空的物件不真的是「空的」？

想像一下，你在 JavaScript 中建立了一個最簡單的物件：`const user = {};`。

現在，如果你嘗試呼叫 `user.toString()`，你會發現這行程式碼不僅不會報錯，還會回傳 `"[object Object]"`。這就很奇怪了——我們明明沒有在 `user` 裡面定義過 `toString` 這個方法，它到底是從哪裡冒出來的？

這就是 JavaScript 物件系統中最神祕也最核心的機制：**原型（Prototype）**。

在 JavaScript 的世界裡，物件並不是孤島。當你對一個物件要求它「沒有」的東西時，它不會立刻放棄並報錯，而是會轉身向它的「長輩」求助。這種「向上求助」的鏈條，就是我們今天要拆解的 **原型鏈（Prototype Chain）**。這套機制雖然在現代開發中常被封裝在各種框架之下，但它決定了 JavaScript 記憶體的使用效率，也是理解 React 底層物件處理哲學（例如為什麼我們偏好「組合」而非「繼承」）的起點。

---

## [[Prototype]]：物件背後的隱藏連結

在 JavaScript 中，幾乎每一個物件在建立時，都會被賦予一個隱藏的內部屬性，規範稱為 **`[[Prototype]]`**。

你可以把 `[[Prototype]]` 想像成一個隱形的「指南針」，它指向另一個物件。這個被指向的物件，我們就稱之為該物件的**原型（Prototype）**。

### 存取原型的兩種方式

雖然 `[[Prototype]]` 是內部的隱藏欄位，但我們有兩種方式可以觀察到它：

1. `**__proto__**`**（非標準但常見）**：
這是一個歷史遺留的存取器（getter/setter）。雖然大多數瀏覽器都支援它，但在正式的生產環境程式碼中，我們應該盡量避免使用它。它更多是作為一個「除錯工具」，讓我們在 Console 中快速查看物件的連結關係。
2. `**Object.getPrototypeOf(obj)**`**（標準且推薦）**：
這是 ES5 引入的標準 API，用來獲取一個物件的原型。它是最安全、最專業的作法。

```javascript
const animal = { eats: true };
const dog = { barks: true };

// 強制建立連結（僅供示範，通常我們用 Object.create）
Object.setPrototypeOf(dog, animal); 

console.log(Object.getPrototypeOf(dog) === animal); // true
console.log(dog.__proto__ === animal); // true (不建議在正式環境這樣寫)
```

**對於好奇的你：** 為什麼 `__proto__` 不被推薦？因為修改物件的原型是一個極其昂貴的操作，會破壞 JavaScript 引擎（如 V8）對物件結構的優化（Hidden Classes）。如果你在執行時隨意改動原型，會導致整個應用程式的效能大幅下滑。

---

## 原型鏈（Prototype Chain）：屬性查找的自動導航

現在我們知道物件之間有連結了，那這條連結具體是怎麼運作的？這就要提到 **原型鏈查找機制**。

當你嘗試讀取一個物件的屬性（例如 `obj.prop`）時，JavaScript 引擎會啟動一套類似「向上溯源」的演算法：

1. **檢查「自有屬性（Own Properties）」**：引擎會先在 `obj` 物件本身尋找是否有 `prop`。如果找到了，就直接回傳。
2. **沿著原型鏈向上爬**：如果在物件本身找不到，引擎就會去看 `obj` 的 `[[Prototype]]` 指向誰，然後去那個原型物件裡面找。
3. **遞迴查找**：如果原型物件裡面也沒有，就再去原型的原型找。
4. **抵達終點**：這條鏈條不會無限延伸。幾乎所有 JavaScript 物件的原型鏈最終都會指向 `Object.prototype`。而 `Object.prototype` 的原型則是 `null`。
5. **宣告失敗**：如果到了 `null` 都還找不到，引擎就會回傳 `undefined`。

### 連結先前知識：Scope Chain vs. Prototype Chain

還記得我們在 Topic 1.3 學過的 **作用域鏈（Scope Chain）** 嗎？

- **Scope Chain** 是關於「變數（Variables）」的查找。當在當前執行環境找不到變數時，會往父層執行環境找。
- **Prototype Chain** 是關於「物件屬性（Object Properties）」的查找。當在當前物件找不到屬性時，會往原型物件找。

這兩者的哲學非常相似：**「自己沒有，就去上層找」**。只是 Scope Chain 是由程式碼定義的位置（Lexical Scope）決定，而 Prototype Chain 是由物件之間的委派關係（Delegation）決定。

---

## 屬性遮蔽（Property Shadowing）：當自有屬性優先時

既然查找是「由下往上」的，那麼如果「小孩」跟「長輩」擁有同名的屬性會發生什麼事？

這就是所謂的 **屬性遮蔽（Property Shadowing）**。就像是在 Scope Chain 中，內部函數的變數會遮蔽外部函數的變數一樣，物件的自有屬性也會「遮蔽」掉原型鏈上的同名屬性。

看這個例子：

```javascript
const human = {
  kind: "哺乳類",
  greet: () => "你好！"
};

const student = {
  kind: "學生" // 這裡發生了遮蔽（Shadowing）
};

// 建立原型連結
Object.setPrototypeOf(student, human);

console.log(student.kind);  // "學生" (來自自有屬性)
console.log(student.greet()); // "你好！" (來自原型鏈查找)
```

當我們存取 `student.kind` 時，引擎在第一步就找到了「學生」，所以它不會再去管原型 `human` 裡面定義的是什麼。這讓 JavaScript 具備了高度的靈活性：我們可以定義通用的預設行為在原型上，然後在特定物件中「覆寫」這些行為，而不需要動到原型本身。

---

## 辨別真身：hasOwnProperty 與自有屬性

在開發中，我們有時需要知道一個屬性到底是真的屬於這個物件，還是它從長輩那裡「借」來的。這在處理大型物件資料或進行 `for...in` 迴圈遍歷時非常重要。

JavaScript 提供了一個內建方法：**`hasOwnProperty()`**（在現代 JS 中也推薦使用 `Object.hasOwn()`）。

- 如果屬性是**自有屬性**：回傳 `true`。
- 如果屬性是**繼承屬性**或**不存在**：回傳 `false`。

```javascript
const gadget = {
  brand: "Apple"
};

const myIPhone = Object.create(gadget);
myIPhone.model = "15 Pro";

console.log(myIPhone.hasOwnProperty("model")); // true (這是它自己的)
console.log(myIPhone.hasOwnProperty("brand")); // false (這是借來的，雖然能存取到)

// 使用現代 API：Object.hasOwn
console.log(Object.hasOwn(myIPhone, "model")); // true
```

### 為什麼這在 React 中很重要？

在 React 中，我們經常使用展開運算子（Spread Operator）如 `{...props}` 來傳遞資料。展開運算子只會複製物件的「自有屬性」，而**忽略**原型鏈上的屬性。如果你不理解這一點，當你試圖傳遞一個透過原型繼承建立的物件時，可能會驚訝地發現 props 傳過去後少了一大半內容。

---

## 原型系統的底層真相：委派思維

最後，我們需要釐清一個關鍵的思維差異：**委派（Delegation） vs 複製（Copy）**。

在傳統的類別（Class）導向語言（如 Java）中，繼承像是「複印」：當你建立一個實例時，類別定義的所有屬性和方法都會被**複製**一份到新的物件裡。

但在 JavaScript 的原型系統中，繼承更像是「委派」：物件本身並不擁有那些方法，它只是存有一個「地址」，告訴引擎：「如果找不到，就去這裡問問看」。

**這種設計的優勢在於「記憶體效率」：**
想像你有 10,000 個 `user` 物件，每個物件都有一個 `login()` 方法。

- 如果是**複製思維**：記憶體中會有 10,000 個 `login` 函數的副本。
- 如果是**委派思維（原型）**：記憶體中只有一個 `login` 函數（存在原型物件裡），那 10,000 個物件只是在需要時向上查找而已。

這與我們在 Topic 2 討論過的記憶體管理息息相關。理解了原型，你就會明白為什麼即使 JavaScript 是動態語言，也能處理大量的物件操作而不會輕易崩潰。

### 總結與銜接

在本節中，我們拆解了：

1. **[[Prototype]]** 是物件內部的隱藏指南針。
2. **原型鏈** 是屬性查找的單向路徑，終點是 `Object.prototype` (最後到 `null`)。
3. **屬性遮蔽** 確保了物件可以靈活地定義自己的特性。
4. **委派機制** 讓多個物件能共用方法，節省大量記憶體。

你已經掌握了「連結」是如何運作的，但問題是：我們該如何主動建立這些連結，而不是一直使用 `Object.setPrototypeOf` 這種危險的 API？

在下一部分，我們將探討 **`Object.create`**，它是 JavaScript 中最優雅的建立原型連結的方式，也是理解「無類別（Class-free）」物件設計的關鍵工具。我們將看到如何不透過 `class` 關鍵字，也能建立出強大且具備層次感的物件系統。
