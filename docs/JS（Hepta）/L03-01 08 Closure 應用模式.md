---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 3 堂：Closure 完整應用

# 08 Closure 應用模式

想像一下，你正在開發一個大型的線上多人遊戲。在你的程式碼中，有一個變數叫做 `playerGold`（玩家金幣）。如果這個變數被宣告在全域作用域（Global Scope）中，任何一段不懷好意的腳本、或是協作夥伴不小心寫錯的程式碼，都可以直接透過 `playerGold = 999999` 來修改這個數值。這顯然是一場災難。

在現代 JavaScript 開發中，我們該如何保護這些敏感資料，不讓外部隨意存取，卻又能讓特定的功能模組正常操作它？答案就在我們上一節學到的 **閉包（Closure）**。閉包不只是一個面試愛考的冷知識，它是 JavaScript 能夠實作「私有化」與「模組化」的核心武器。這一節，我們將從理論走向實踐，看看閉包在真實開發中的三種關鍵應用模式。

---

## 資料封裝（Data Encapsulation）：建立你的私有保險箱

在沒有 `class` 私有欄位（如 `#field`）的年代，JavaScript 工程師主要依靠閉包來實現 **資料封裝**。封裝的核心思想是：**隱藏實作細節，僅暴露必要的介面。**

### 從一個失敗的計數器開始

假設我們需要一個計數器，你可能會直覺地這樣寫：

```javascript
let count = 0;

const increment = () => {
  count++;
  console.log(`目前次數：${count}`);
};

increment(); // 1
increment(); // 2
```

這段程式碼雖然會動，但有一個致命缺點：`count` 是暴露在外的。任何人都可以執行 `count = -100` 來弄壞你的邏輯。

### 利用閉包實作「私有變數」

現在，讓我們利用閉包的「環境背包」特性，將 `count` 關進一個函數裡。請觀察以下 `createCounter` 的實作：

```javascript
const createCounter = () => {
  // 這個變數被封裝在 createCounter 的 Lexical Environment 中
  let count = 0;

  return {
    increment: () => {
      count++;
      return count;
    },
    decrement: () => {
      count--;
      return count;
    },
    getCount: () => {
      return count;
    }
  };
};

const myCounter = createCounter();

console.log(myCounter.increment()); // 1
console.log(myCounter.increment()); // 2
console.log(myCounter.getCount());  // 2
console.log(myCounter.count);       // undefined (外部無法直接存取！)
```

### 為什麼這能運作？

當你呼叫 `createCounter()` 時，JavaScript 引擎會建立一個新的「執行環境（Execution Context）」。在這個環境裡，變數 `count` 被初始化為 `0`。

關鍵在於：`createCounter` 回傳了一個包含三個函數的物件。根據我們在 2.1 學到的原理，這三個內部函數（`increment`、`decrement`、`getCount`）在定義時，都會帶著一個指向 `createCounter` 環境的「外部環境參考（Outer Reference）」。

當 `createCounter` 執行完畢並從 Call Stack 彈出後，按理說它的環境應該被銷毀。但因為回傳的物件方法仍然「引用」著這個環境，垃圾回收機制（GC）不會將其回收。這就形成了一個 **私有的狀態空間**——`count` 變數就像是被鎖進了一個保險箱，只有 `myCounter` 提供的三個方法（這三把鑰匙）才能操作它。

這種模式在 React 的 `useState` 中得到了極致的發揮。雖然 React 底層的實作更為複雜（涉及 Fiber 鏈結串列），但其核心直覺是一致的：**透過函數呼叫產生的閉包，來持久化並保護元件的狀態。**

---

## 函數工廠（Function Factory）：量身訂製你的邏輯

閉包的另一個強大用途是作為 **函數工廠**。這聽起來很抽象，但其實它就像是一台「函數製造機」，你可以先設定好一些參數（原材料），它就會為你產出一個功能微調過的專屬函數。

### 預測一下：多個閉包會互相干擾嗎？

在看範例前，請你先思考一個問題：如果我用同一個工廠函數建立了兩個計數器，它們會共用同一個 `count` 變數嗎？

```javascript
const counterA = createCounter();
const counterB = createCounter();

counterA.increment(); 
console.log(counterA.getCount()); // 預測一下是多少？
console.log(counterB.getCount()); // 預測一下是多少？
```

**答案是：它們完全獨立。** 每次呼叫 `createCounter()` 都會產生一個全新的執行環境與作用域。這就像是同一個模具印出來的兩個保險箱，內部的東西是各放各的。

### 實戰應用：客製化格式化工具

想像你需要為網站建立一套訊息提示系統，不同等級的訊息需要不同的前綴詞。與其每次都手動組字串，我們可以利用閉包建立一個工廠：

```javascript
const createLogger = (level) => {
  const prefix = `[${level.toUpperCase()}]`;
  
  // 回傳的函數「記住」了當初傳進來的 level
  return (message) => {
    const time = new Date().toLocaleTimeString();
    console.log(`${prefix} ${time}: ${message}`);
  };
};

const infoLog = createLogger('info');
const errorLog = createLogger('error');

infoLog('系統已啟動');    // [INFO] 14:30:05: 系統已啟動
errorLog('資料庫連線失敗'); // [ERROR] 14:30:10: 資料庫連線失敗
```

在這個範例中，`createLogger` 就像是一間工廠。`level` 和 `prefix` 變數被鎖在了回傳函數的「環境背包」裡。當你呼叫 `infoLog` 時，它不需要你再次傳入 `'info'`，因為它在出生（定義）的那一刻，就已經把這個資訊打包帶走了。

這種模式在 React 開發中非常常見。例如，當你需要為列表中的多個按鈕綁定點擊事件，且每個按鈕需要傳入不同的 ID 時，你可能會寫出 `onClick={() => handleClick(id)}`，這本質上就是一種即時生成的閉包工廠。

---

## 模組模式（Module Pattern）：解決命名衝突的救星

在 ES6 模組系統（`import` / `export`）普及之前，JavaScript 面臨最大的問題就是 **全域命名空間污染（Global Namespace Pollution）**。所有的變數預設都是全域的，這導致當你引入多個第三方套件（例如同時使用 jQuery 和其他套件）時，變數名稱極容易互相碰撞。

為了應對這個挑戰，資深開發者們發展出了 **模組模式（Module Pattern）**。這種模式結合了 **IIFE（立即執行函數）** 與 **閉包**。

### IIFE + 閉包的化學反應

IIFE 是一個定義完立即執行的函數。它的好處是：函數內部的所有變數都會被限制在該函數的作用域中，不會流向全域。

```javascript
const AuthModule = (() => {
  // 私有變數：隱藏在模組內部
  let currentUser = null;
  const secretKey = "ABC-12345";

  const validateToken = (token) => {
    return token === secretKey;
  };

  // 公開介面：只暴露想讓外面知道的東西
  return {
    login: (user, token) => {
      if (validateToken(token)) {
        currentUser = user;
        console.log(`歡迎回來，${currentUser}`);
      } else {
        console.log("登入失敗：無效的 Token");
      }
    },
    logout: () => {
      currentUser = null;
      console.log("已登出");
    }
  };
})();

AuthModule.login('React 小學員', 'ABC-12345'); // 歡迎回來，React 小學員
console.log(AuthModule.secretKey); // undefined (安全！)
```

### 為什麼這在過去至關重要？

在現代框架出現之前，這種寫法是組織大型專案的唯一標準。它實現了幾個關鍵目標：

1. **防止全域污染**：`secretKey` 和 `validateToken` 變數都被關在 IIFE 裡，全域物件（`window`）乾乾淨淨。
2. **模擬「私有方法」**：外部只能透過 `AuthModule.login()` 進行互動，無法繞過驗證邏輯直接修改 `currentUser`。
3. **明確的依賴管理**：開發者可以清楚看到哪些功能是公開的，哪些是內部細節。

雖然現在我們有了原生 ES Modules，但模組模式背後的思想——**利用閉包劃分權限與邊界**——依然是 React Hooks 設計的核心哲學。當你撰寫一個 Custom Hook（例如 `useAuth`）並回傳特定的 API 時，你其實就在實踐現代版的模組模式。

---

## 深度思考：閉包是免費的嗎？

既然閉包這麼強大，那我們是不是應該到處都用閉包？

在使用閉包時，你必須記住：**閉包是以記憶體換取封裝****。**
正如我們提到的，閉包會阻止其引用的 Lexical Environment 被垃圾回收。如果你的應用程式中存在成千上萬個長久存活的閉包，且每個閉包都攜帶著巨大的資料（例如大型陣列或 DOM 參考），這可能會導致記憶體佔用過高。

這並非叫你不要用閉包，而是提醒你：閉包是一個強大的工具，但它是有成本的。在後續的 2.4 章節中，我們會更深入探討閉包與記憶體管理的愛恨情仇。

---

## 總結與銜接

在這一部分中，我們看見了閉包如何從一個底層原理轉化為優雅的設計模式：

- **資料封裝** 讓我們能建立私有變數，保護資料不被外部竄改。
- **函數工廠** 讓我們能動態產生預設了特定環境的專屬函數。
- **模組模式** 為 JavaScript 帶來了組織程式碼的能力，避免了全域命名空間的混亂。

所有的這一切，都源自於那個函數定義時背在身上的「環境背包」。

然而，閉包並非總是如此順服。有時候，這個「背包」裡裝的東西可能跟你想像的不一樣，或者它可能在錯誤的時間點被打開。在下一部分中，我們將進入最讓初學者崩潰的領域：**閉包常見陷阱**。我們將解析為什麼在 `for` 迴圈中使用 `var` 會讓計數器失控，以及什麼是 React 工程師最害怕的「Stale Closure（過時的閉包值）」。

## 重點回顧

- 閉包的核心應用在於**控制存取權限**（封裝）與**保留狀態**（持久化）。
- `createCounter` 範例展示了如何利用閉包建立私有狀態，這是 React 狀態管理的基礎邏輯。
- 函數工廠透過閉包實現了邏輯的複用與客製化。
- 模組模式（IIFE + Closure）是早期 JS 解決全域變數衝突的標準方案。
- 閉包會讓環境變數持續存留在記憶體中，使用時需注意潛在的效能與記憶體成本。
