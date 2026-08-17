# 記憶體管理與效能優化

涵蓋概念：Memory Management、Garbage Collection、Debouncing & Throttling、Memoization

---

## 1. Memory Management（記憶體管理）

記憶體生命週期：**分配 → 使用 → 釋放**，JS 靠垃圾回收自動完成釋放，但寫法不當還是會造成記憶體洩漏。

**Stack**（原始型別，固定大小，速度快）vs **Heap**（物件/陣列/函式，大小可變，需垃圾回收追蹤）。

### 常見記憶體洩漏情境

```javascript
// ① 忘記清除計時器/事件監聽器
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  const handleResize = () => {};
  window.addEventListener("resize", handleResize);
  return () => {                          // 清理函式
    clearInterval(timer);
    window.removeEventListener("resize", handleResize);
  };
}, []);

// ② 意外的全域變數（忘記 let/const，非嚴格模式下會外洩到全域）

// ③ 閉包意外抓住不需要的大型資料
const setupHandler = () => {
  const hugeData = new Array(1000000).fill("資料");
  return () => console.log("小函式"); // 即使沒用到 hugeData，可能仍被連帶保留
};
```

---

## 2. Garbage Collection（垃圾回收）

主要演算法：**標記與清除（Mark-and-Sweep）**——從「根節點」出發，標記所有摸得到的東西，清掃時把沒被標記的清掉。判斷標準是「能不能從根節點觸及」，不是「被參照了幾次」。

```javascript
let user = { name: "小明" };
let friend = { name: "小華" };
user.friend = friend;
friend = null; // 仍可觸及（透過 user.friend），不會被清除
user = null;   // 現在完全不可觸及了，兩個物件都會被清除
```

**世代垃圾回收**：新建立、通常短命的物件放「新生代」（頻繁快速清掃），活得久的物件晉升「舊生代」（清掃頻率低但更徹底）。

現代引擎已能正確處理**循環參照**，不會像早期簡陋演算法那樣造成永久洩漏。垃圾回收的執行時機由引擎自動決定，開發者無法也不應該手動精準控制。

---

## 3. Debouncing & Throttling

**Debounce（防抖）**：連續觸發時不斷重新計時延後，只有真正停下來一段時間後才執行一次。適合：搜尋框、表單驗證。

```javascript
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
```

**Throttle（節流）**：不管觸發多頻繁，固定「間隔頻率」持續執行。適合：捲動、拖曳、防連續點擊。

```javascript
const throttle = (fn, delay) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= delay) { fn(...args); lastTime = now; }
  };
};
```

| | Debounce | Throttle |
|---|---|---|
| 精神 | 等停下來才執行一次 | 固定頻率穩定執行 |
| 適合 | 搜尋框輸入 | 捲動、拖曳 |

> 實務上優先用 lodash 的 `_.debounce()` / `_.throttle()`，但要能理解、甚至手寫原理（前端面試必考）。

---

## 4. Memoization（記憶化）

用一本「筆記本」（快取）記住函式相同輸入對應的相同輸出，下次直接查表。

```javascript
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
```

**只有純函式才能安全記憶化**；如果每次輸入幾乎都不重複，記憶化反而浪費記憶體。

> **React 的 `useMemo`、`useCallback`、`React.memo` 背後精神跟這裡完全一致**：輸入（依賴陣列）沒變就用舊結果，不重新計算/渲染。

---

## 本篇總結

- 四大記憶體洩漏來源：忘記清計時器、忘記移除監聽器、意外全域變數、閉包抓住不需要的大型資料
- 垃圾回收判斷標準是「能否從根節點觸及」，開發者無法手動控制執行時機
- Debounce 等停下來、Throttle 固定頻率，兩者都是高階函式 + 閉包的經典應用
- Memoization 只適用純函式，React 的 useMemo/useCallback/React.memo 是同樣的精神
