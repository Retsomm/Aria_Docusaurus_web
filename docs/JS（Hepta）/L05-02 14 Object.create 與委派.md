---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 5 堂：Prototype 與原型鏈

# 14 Object.create 與委派

如果你現在手上有一個充滿強大功能的工具組物件，而你想建立一個新物件來「使用」這些工具，但又不希望在新物件裡把這些工具全部複製一遍（那太浪費記憶體了），你會怎麼做？在上一節中，我們理解了屬性是如何沿著 `[[Prototype]]` 鏈條向上查找的。現在的問題是：我們該如何**主動、優雅地**拉起這條鏈條？

`Object.create` 就是那個最純粹的「掛鉤」，它能讓我們在不使用複雜的 `class` 或 `constructor` 的情況下，直接定義物件之間的血緣關係。

## 建立物件的「掛鉤」：Object.create 的語意

在 JavaScript 中，建立物件最常見的方式是使用大括號 `{}`。但如果你希望新物件在誕生的那一刻，就已經「接上」了某個特定的原型物件，`Object.create` 是最標準的做法。

### 基本語法與運作機制

`Object.create(proto)` 的行為非常單純：它會建立一個**全新的空物件**，並將這個新物件的內部隱藏欄位 `[[Prototype]]` 指向你傳入的 `proto` 物件。

讓我們看一個最直觀的例子：

```javascript
const runner = {
  speed: 10,
  run() {
    return `跑速：${this.speed} km/h`;
  }
};

// 以 runner 為原型建立新物件
const athlete = Object.create(runner);

console.log(athlete); // 印出：{} (它是空的！)
console.log(athlete.speed); // 印出：10 (從 runner 借來的)
console.log(athlete.run()); // 印出："跑速：10 km/h"

// 驗證原型連結
console.log(Object.getPrototypeOf(athlete) === runner); // true
```

在這個範例中，`athlete` 物件本身不持有任何屬性，它是一個徹頭徹尾的「空殼」。但當你嘗試存取 `athlete.run()` 時，JS 引擎在 `athlete` 身上找不到這個方法，於是順著 `[[Prototype]]` 鏈條找到了 `runner`。這就是我們上一節提到的**查找鏈**，而 `Object.create` 負責精確地完成「連結」這個動作。

### 為什麼不直接用 Object.setPrototypeOf？

你可能會問：「既然我已經有一個現成的物件 `obj` 了，我不能用 `Object.setPrototypeOf(obj, proto)` 來修改它的原型嗎？」

答案是：**可以，但不建議。**

從現代 JS 引擎（如 V8）的效能角度來看，物件的「形狀」在建立時最好就固定下來。如果你在物件建立後才去修改它的原型連結，這會導致引擎原本為該物件做的優化失效（De-optimization），讓執行速度變慢。

- **Object.create**：在「出生」時就決定好父母，這是最高效、最穩定的做法。
- **Object.setPrototypeOf**：像是後天「換父母」，會對執行效率造成顯著負擔。

## 純淨物件：Object.create(null)

這是 `Object.create` 一個非常酷且實用的「隱藏技能」。當我們使用 `{}` 建立物件時，這個物件預設會繼承自 `Object.prototype`。這意味著即使是空物件，它也擁有 `toString`、`hasOwnProperty` 等方法。

但在某些場景下，我們需要一個**真正的、絕對的空物件**。

```javascript
const normalObj = {};
const pureObj = Object.create(null);

console.log(normalObj.toString); // [Function: toString]
console.log(pureObj.toString);   // undefined (它連 toString 都沒有)

// 在 pureObj 上使用 hasOwnProperty 會報錯
// pureObj.hasOwnProperty('key'); // TypeError: pureObj.hasOwnProperty is not a function
```

### 為什麼需要「純淨物件」？

想像你正在開發一個高效能的快取庫（Cache Library），或者是一個需要處理大量使用者輸入鍵值的資料結構。如果使用者傳入了一個鍵名叫做 `"toString"`，而你剛好在使用 `if (obj[key])` 做判斷，這時繼承自原型的 `toString` 方法可能會導致你的程式邏輯發生錯誤（這種情況稱為**原型污染**或**命名衝突**）。

在 React 的源碼或許多知名的開源套件（如 Redux）中，你會發現開發者頻繁使用 `Object.create(null)` 來建立 Map 類型的物件。這樣可以確保這個物件是一個「純粹的容器」，只會存放你手動放進去的資料，而不會受到任何來自 `Object.prototype` 的干擾。

## 委派（Delegation）思維：不擁有，但能使用

在傳統的物件導向（如 Java 或 C++）中，繼承往往意味著「複製」——子類別會複製父類別的藍圖。但在 JavaScript 中，原型繼承的本質是**委派（Delegation）**。

### 委派模式實踐：Service 物件

讓我們建立一個專門負責處理資料邏輯的 `DataService` 物件，並讓不同的應用模組委派任務給它：

```javascript
const DataService = {
  apiUrl: "https://api.myapp.com",
  fetchData(endpoint) {
    console.log(`正在從 ${this.apiUrl}/${endpoint} 獲取資料...`);
  }
};

// 建立兩個不同的模組，委派給 DataService
const userModule = Object.create(DataService);
const postModule = Object.create(DataService);

// 雖然 userModule 是空的，但它能直接用 fetchData
userModule.fetchData("users"); // "正在從 https://api.myapp.com/users 獲取資料..."

// 我們可以覆寫（遮蔽）屬性，而不會影響原型或其他模組
postModule.apiUrl = "https://api.dev.myapp.com";
postModule.fetchData("posts"); // "正在從 https://api.dev.myapp.com/posts 獲取資料..."

// 再次檢查 userModule
userModule.fetchData("users"); // 依然是原本的 api.myapp.com
```

### 複製 vs. 委派

- **複製（Copying）**：就像影印文件。如果原件改了，影本不會變。如果印了 100 份，就會佔用 100 份的空間。
- **委派（Delegation）**：就像大家共用一個雲端檔案。物件本身不儲存這些方法，只有在需要時才「向上尋求支援」。這不僅節省記憶體，還能讓你動態地更新原型的功能，所有委派它的物件都能立即同步更新。

這正是 React 元件設計的一個核心思想：我們不希望每個元件實例都持有一份巨大的方法副本，而是希望能透過某種機制（如 Hooks 或 HOC）來共享邏輯。

## 揭秘 new 運算子的底層

雖然在本課程中我們不打算深入 Class 語法，但理解 `new` 運算子在做什麼，對於掌握 JavaScript 的物件系統至關重要。事實上，`new` 運算子在背後做的事情，很大一部分就是 `Object.create` 的工作。

當你執行 `const instance = new MyConstructor()` 時，JS 引擎大致做了以下四件事：

1. 建立一個新的空物件。
2. **將這個新物件的 **`**[[Prototype]]**`** 指向 **`**MyConstructor.prototype**`**。**（這一步跟 `Object.create` 一模一樣！）
3. 將 `this` 綁定到這個新物件，並執行建構函數內的程式碼。
4. 如果建構函數沒有回傳其他物件，則自動回傳這個新物件。

所以，即使你現在全面轉向 Hooks 與函數式元件，理解 `Object.create` 也能讓你一眼看穿那些「偽 Class」的底層真相。它們不過是在 `prototype` 物件上掛載方法，然後利用 `Object.create` 的機制讓實例能找到這些方法罷了。

## 在 React 底層的蹤跡

為什麼我們要學這麼底層的東西？因為 React 的效能很大程度來自於它對資料結構的極致優化。

在 React 的 **Fiber 架構**中（這是 React 16 以後的靈魂），React 需要頻繁地建立與維護一個巨大的物件樹。為了確保這些內部的節點物件不會因為 `Object.prototype` 的預設行為而產生意外的副作用，React 在某些關鍵的內部 Map 或更新佇列中，會選擇使用 `Object.create(null)`。

例如，React 在追蹤某些內部狀態或屬性映射時，使用「純淨物件」可以避免像 `__proto__` 這樣敏感的鍵名造成安全風險或效能損耗。這也體現了 React 的一個設計哲學：**顯式勝於隱式**。我們不需要物件預設帶來的「遺產」，我們只要一個能精確控制的容器。

---

## 建立與委派的藝術

我們在這一節掌握了 `Object.create` 這個核心工具。它不僅是建立原型連結的標準方式，更代表了一種與傳統繼承截然不同的「委派思維」。

### 本節重點回顧

- `Object.create(proto)` 建立一個空物件，並將其連結到 `proto`，這比修改現有物件的原型更具效能優勢。
- 使用 `Object.create(null)` 可以建立一個完全沒有原型的純淨物件，有效避免原型污染，這在開發底層工具或 React 內部架構時非常有用。
- 委派（Delegation）讓我們能共享邏輯而不必複製資料，是節省記憶體並保持程式碼彈性的關鍵。
- `new` 關鍵字的底層其實也包含了類似 `Object.create` 的連結動作，只是包裝了更多建構函數的邏輯。

我們現在已經知道如何建立「垂直」的繼承鏈條了。但問題來了：在開發複雜的應用（如 React 元件）時，這種一條線到底的「層次繼承」真的是最好的選擇嗎？如果一個物件需要功能 A 也需要功能 B，我們該讓它繼承誰？在下一堂課中，我們將探討「組合優先於繼承（Composition over Inheritance）」——這是理解 React 元件設計哲学最重要的一塊拼圖。
