# 非同步 JavaScript 全解析

涵蓋概念：Event Loop、Callbacks、Promises、async/await、Generators & Iterators

---

## 1. Event Loop（事件循環）

JavaScript 是**單執行緒**（一次只能做一件事），但透過 Event Loop 機制達成「非阻塞」的效果。

瀏覽器會不斷重複執行「一個 Task」的循環：先清空 **Call Stack（手上工作）**，接著把 **Microtask Queue（Promise 等）** 全部清空，之後可能更新畫面，才從 **Task Queue（setTimeout、事件等）** 選下一個 Task 繼續。

```javascript
console.log("1");
setTimeout(() => console.log("4"), 0);      // 排到 Task Queue
Promise.resolve().then(() => console.log("3")); // 排到 Microtask Queue
console.log("2");

// 印出順序：1, 2, 3, 4
// 即使 setTimeout 設 0 毫秒，也一定排在 Promise 之後
```

**實戰意義：** 這解釋了為什麼 `fetch` 之後不能馬上拿到資料——非同步的結果一定要等 Call Stack 清空才會被處理。

---

## 2. Callbacks（回呼函式）

把一個函式當參數傳給另一個函式，讓對方在適當時機「回頭呼叫」它。

```javascript
setTimeout(() => console.log("3秒後執行"), 3000);
[1, 2, 3].forEach((num) => console.log(num)); // forEach 的參數也是 callback
```

### 回呼地獄（Callback Hell）

```javascript
getUser(1, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      console.log(details); // 巢狀越來越深，難讀又難維護
    });
  });
});
```

**Error-First Callback**（Node.js 慣例）：回呼函式第一個參數固定留給錯誤訊息。

```javascript
fs.readFile("data.txt", "utf8", (error, data) => {
  if (error) { console.log("失敗：", error.message); return; }
  console.log("成功：", data);
});
```

Callback Hell 的痛點，直接催生了 Promise 的誕生。

---

## 3. Promises

Promise 代表「一個未來會有結果的承諾」，有三種狀態：**Pending（等待）→ Fulfilled（成功）或 Rejected（失敗）**，一旦確定就不會再變。

```javascript
const washClothes = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    success ? resolve("洗好了！") : reject("洗衣機壞了！");
  }, 2000);
});

washClothes
  .then((result) => console.log("成功：", result))
  .catch((error) => console.log("失敗：", error));
```

### 用鏈式呼叫取代回呼地獄

```javascript
getUser(1)
  .then((user) => getOrders(user.id))       // 記得 return！
  .then((orders) => getOrderDetails(orders[0].id))
  .then((details) => console.log(details))
  .catch((error) => console.log("任何環節出錯都會被這裡抓到：", error));
```

### Promise 的靜態方法

```javascript
Promise.all([p1, p2, p3])        // 全部成功才成功，有一個失敗就整組失敗
Promise.race([p1, p2, p3])       // 誰先有結果就用誰的
Promise.allSettled([p1, p2, p3]) // 不管成功失敗，全部都等到才回傳
```

**常見錯誤：忘記 return**，會導致下一個 `.then()` 拿到 `undefined` 且不會真的等待。

---

## 4. async/await

`async/await` 是 Promise 的語法糖，讓非同步程式碼讀起來像同步一樣。

```javascript
async function processOrder() {
  try {
    const user = await getUser(1);
    const orders = await getOrders(user.id);
    console.log(orders);
  } catch (error) {
    console.log("錯誤：", error);
  }
}
```

### 常見地雷

```javascript
// 地雷1：忘記 await，拿到的是 Promise 物件本身
const user = fetch("/api/user"); // 應該要 await

// 地雷2：互不相關的請求排隊等待，浪費時間
const user2 = await fetchUser();       // 各花 1 秒，總共約 2 秒
const orders2 = await fetchOrders();
// 改用 Promise.all 平行處理，只要約 1 秒
const [user3, orders3] = await Promise.all([fetchUser(), fetchOrders()]);

// 地雷3：forEach 裡的 await 不會真的依序等待，要用 for...of
for (const id of userIds) {
  const user = await getUser(id); // 正確依序等待
}
```

---

## 5. Generators & Iterators

**Iterator**：有 `next()` 方法，每次回傳 `{ value, done }`。

**Generator**（`function*` + `yield`）：可以「暫停」執行的特殊函式，讓你更容易寫出 Iterator。

```javascript
function* fruitGenerator() {
  yield "蘋果";
  yield "香蕉";
  yield "橘子";
}

const gen = fruitGenerator();
console.log(gen.next()); // { value: "蘋果", done: false }

for (const fruit of fruitGenerator()) {
  console.log(fruit); // 自動依序印出三個
}
```

**惰性求值：安全地表達無限序列**

```javascript
function* infiniteNumbers() {
  let num = 1;
  while (true) {
    yield num++;
  }
}
const numGen = infiniteNumbers();
console.log(numGen.next().value); // 1，用多少算多少，不會爆記憶體
```

**Async Generator：**

```javascript
async function* fetchPages() {
  for (let page = 1; page <= 3; page++) {
    const data = await fetch(`/api/data?page=${page}`).then(r => r.json());
    yield data;
  }
}
// 搭配 for await...of 使用
```

> `async/await` 語法標準化之前，社群就是用 Generator + Promise 模擬類似效果，理解 Generator 有助於理解 async/await 底層原理。

---

## 本篇總結

- Event Loop 反覆執行 Task：Call Stack 清空 → Microtask（Promise）清空 → 可能更新畫面 → 選下一個 Task（setTimeout）
- Callback → Promise → async/await，是 JS 處理非同步問題一路演進的三個階段
- Promise 鏈記得 `return`；async/await 記得 `await`，互不相關的請求用 `Promise.all` 平行處理
- Generator 提供「暫停執行」的能力，適合表達無限序列、分批處理資料
