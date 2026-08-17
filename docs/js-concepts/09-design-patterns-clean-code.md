# 設計模式與 Clean Code

涵蓋概念：Design Patterns、Clean Code

---

## 1. Design Patterns（設計模式）

設計模式是社群針對常見問題累積出的公認好解法，是工程師之間溝通的共通語言。

### Module Pattern

```javascript
const counterModule = (() => {
  let count = 0; // 私有變數（閉包）
  return { increment: () => ++count, reset: () => (count = 0) };
})();
```

### Singleton Pattern：整個應用只存在一份實例

```javascript
class Settings {
  static #instance;
  constructor() {
    if (Settings.#instance) return Settings.#instance;
    this.theme = "dark";
    Settings.#instance = this;
  }
}
// React Context、Redux store 精神上類似這個概念
```

### Observer Pattern：訂閱-通知機制（超重要！）

```javascript
class EventEmitter {
  #listeners = {};
  on = (name, cb) => (this.#listeners[name] ??= []).push(cb);
  emit = (name, data) => this.#listeners[name]?.forEach((cb) => cb(data));
}
```

> **這是 DOM 事件（`addEventListener`）、Node.js EventEmitter、React `useState` 背後的核心思想**：一個事件觸發，多個訂閱者都能收到通知。

### Factory Pattern

```javascript
const createButton = (type) => {
  if (type === "primary") return { color: "blue", text: "確認" };
  return { color: "gray", text: "取消" };
};
```

### Proxy Pattern：攔截並控制存取

```javascript
const userProxy = new Proxy(user, {
  get: (target, prop) => { console.log(`讀取 ${prop}`); return target[prop]; },
  set: (target, prop, value) => {
    if (prop === "age" && value < 0) return false; // 攔截驗證
    target[prop] = value;
    return true;
  }
});
```

> **這是 Vue 3 響應式系統的核心原理**：用 `get` 追蹤依賴、用 `set` 觸發畫面更新。

> 不用刻意「套用」設計模式，而是反過來：發現自己寫的程式碼很眼熟時，去查查有沒有現成的名字，讓團隊溝通更有效率。

---

## 2. Clean Code（乾淨程式碼）

核心精神：**程式碼是寫給人看的，剛好可以被電腦執行**。

### 有意義的命名

```javascript
// const d = new Date(); const fn = (x, y) => x * y * 0.05;
// const currentDate = new Date();
const calculateTax = (price, quantity) => price * quantity * 0.05;
```
- 布林值：`is`、`has`、`can` 開頭（`isLoading`）
- 函式：動詞開頭（`getUserData()`）

### 函式要小、只做一件事

```javascript
// 一個函式做驗證+計算+更新畫面+發送 API
// 拆成小函式，各自單一職責，方便測試與重用
const isOrderValid = (order) => order.items?.length > 0;
const calculateTotal = (items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);
```

### DRY（Don't Repeat Yourself）

重複的邏輯抽出來共用，改一個地方就好，不用到處找有沒有漏改。

### 提早返回，避免深層巢狀

```javascript
// 巢狀 if 一直往右縮
// const getDiscount = (user) => {
  if (!user) return 0;
  if (!user.isMember) return 0;
  if (user.points > 100) return 0.2;
  return 0.1;
};
```

### 註解該寫「為什麼」，不是「做了什麼」

```javascript
// 把 count 加 1
count = count + 1;

// 解釋程式碼本身看不出來的考量
// 用 setTimeout 是為了等瀏覽器完成當前重繪，不然動畫效果會失效
setTimeout(() => startAnimation(), 0);
```

格式一致性交給 ESLint / Prettier 自動處理，不用自己手動維護。

---

## 本篇總結

- Observer Pattern 跟 Proxy Pattern 是理解 React/Vue 框架底層設計最關鍵的兩個模式
- 不用刻意套模式，理解概念、看懂別人程式碼在做什麼更重要
- Clean Code 六大原則：有意義命名、單一職責、DRY、提早返回、寫「為什麼」的註解、格式交給工具
