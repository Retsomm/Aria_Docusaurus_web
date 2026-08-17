# 物件進階：屬性描述符、Getter/Setter、Object Methods、Proxy、WeakMap

涵蓋概念：Property Descriptors、Getters & Setters、Object Methods、Proxy & Reflect、WeakMap & WeakSet

---

## 1. Property Descriptors（屬性描述符）

每個屬性背後都有隱藏規格：`writable`（能否修改）、`enumerable`（能否被列舉）、`configurable`（能否刪除）。

```javascript
Object.defineProperty(config, "apiUrl", {
  value: "https://api.example.com",
  writable: false, enumerable: true, configurable: false
});

// 懶人版：直接鎖死整個物件（常用來保護全域設定、常數）
const APP_CONFIG = Object.freeze({ API_URL: "...", VERSION: "1.0.0" });
```

**`Object.freeze()` 只凍結最外層**，巢狀的內層物件不受影響：

```javascript
const state = Object.freeze({ user: { name: "小明" } });
state.user.name = "小華"; // 這樣可以改！內層沒被凍結
```

`Object.seal()` 比 `freeze` 寬鬆：允許改值，但不能新增/刪除屬性。

> 理解這個原理有助於看懂 Vue 2 響應式系統（靠 `Object.defineProperty` 攔截讀寫）的底層設計。

---

## 2. Getters & Setters

讓「讀取」跟「設定」屬性時自動執行自訂邏輯，外部用起來完全像一般屬性：

```javascript
class BankAccount {
  #balance = 0;
  get balance() { return `$${this.#balance}`; }
  set balance(value) {
    if (value < 0) { console.log("不能是負數"); return; }
    this.#balance = value;
  }
}

class Rectangle {
  constructor(w, h) { this.width = w; this.height = h; }
  get area() { return this.width * this.height; } // 只寫 get = 唯讀計算屬性
}
```

> **這正是 Vue `computed` 屬性背後的核心原理**：用起來像屬性，實際上是即時計算的函式。

---

## 3. Object Methods（物件方法）

```javascript
Object.keys(user);     // 只拿鍵
Object.values(user);   // 只拿值
Object.entries(user);  // 拿鍵值配對陣列 → 可以搭配 map/filter/reduce
Object.fromEntries(entries); // entries 的相反操作
```

### 淺拷貝 vs 深拷貝（前端最常見地雷之一）

```javascript
// 淺拷貝：展開運算子、Object.assign 都只複製第一層
const shallow = { ...original };
shallow.address.city = "高雄"; // 內層還是共用同一個參照，original 也被改了！

// 深拷貝：徹底獨立
const deep = structuredClone(original); // 現代瀏覽器內建，優於 JSON.parse(JSON.stringify())
// structuredClone 能正確處理 Date/Map/Set，但一樣無法複製函式
```

---

## 4. Proxy & Reflect

`Proxy` 包住一個原始物件，攔截所有操作（讀取、設定、刪除）；`Reflect` 提供對應的「標準預設行為」。

```javascript
const proxy = new Proxy(target, {
  get(target, prop) { return Reflect.get(target, prop); }, // 建議統一用 Reflect 執行預設行為
  set(target, prop, value) {
    if (prop === "age" && value < 0) throw new TypeError("年齡必須非負");
    return Reflect.set(target, prop, value);
  }
});
```

> **這是 Vue 3 響應式系統的完整原理**：`get` 追蹤「誰依賴這個資料」，`set` 在資料改變時「通知重新渲染」。Vue 3 用 Proxy 取代 Vue 2 的 `Object.defineProperty`，解決了「動態新增屬性不會觸發更新」的舊限制。

---

## 5. WeakMap & WeakSet

一般 `Map` 是「強引用」，即使外部都不再需要某物件，只要還在 Map 裡就會一直佔記憶體。`WeakMap` 是**弱引用**：物件沒有其他地方參照時，會自動被垃圾回收，對應記錄也自動消失。

```javascript
const weakCache = new WeakMap();
let user = { name: "小明" };
weakCache.set(user, "額外資料");
user = null; // 沒有其他地方參照了，物件跟這筆快取記錄都會被自動清除
```

限制：key 只能是物件、不能遍歷、沒有 `size`（因為內容可能隨時被清除，避免不可預測的結果）。

**實戰場景**：幫 DOM 元素附加額外資料，元素被移除後相關資料自動清理，不用手動維護。

```javascript
const elementData = new WeakMap();
elementData.set(button, { clickCount: 0 });
```

---

## 本篇總結

- `Object.freeze()` 只凍結最外層，深層凍結要自己遞迴或用套件
- Getter/Setter 讓「屬性存取」背後可以藏驗證邏輯，是 Vue computed 的原理
- 淺拷貝（`{...obj}`）vs 深拷貝（`structuredClone()`）是前端最常見的地雷之一
- Proxy + Reflect 是 Vue 3 響應式系統的核心；WeakMap/WeakSet 適合「跟著物件生命週期自動清理」的快取場景
