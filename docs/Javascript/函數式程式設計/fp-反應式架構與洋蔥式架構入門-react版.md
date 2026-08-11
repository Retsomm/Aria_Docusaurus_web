# FP 中的反應式架構與洋蔥式架構

> 用最淺白的文字加上 React 範例，帶你認識函數式程式設計（Functional Programming, FP）中兩個重要的架構觀念：**反應式架構（Reactive Architecture）** 與 **洋蔥式架構（Onion Architecture）**。

---

## 前言：為什麼要學這兩個架構？

寫程式寫久了，你會發現一個問題：**程式碼越寫越亂**。

- 資料改來改去，不知道是誰改的
- 商業邏輯跟畫面、API 全部混在一起
- 想改一個小功能，卻牽一髮動全身

FP 的世界裡有兩個架構觀念可以解決這些問題：

1. **反應式架構**：處理「資料變動時，該怎麼自動更新」
2. **洋蔥式架構**：處理「程式碼該怎麼分層，才不會亂成一團」

這兩個觀念常被稱為設計良好 FP 程式的「基本條件」。而好消息是：**你每天寫的 React，本身就是反應式架構的實作**，接下來會一步一步說明。

---

## 第一部分：反應式架構（Reactive Architecture）

### 什麼是反應式架構？

一句話解釋：**當某個資料改變時，依賴它的東西會「自動」跟著反應、更新。**

想像 Excel 試算表：

- A1 格子填 `10`
- B1 格子寫公式 `=A1 * 2`，顯示 `20`
- 當你把 A1 改成 `50`，B1 **自動**變成 `100`

你不需要手動去更新 B1，它會「反應」A1 的變化。這就是反應式的精神！

### 傳統寫法 vs React 的反應式寫法

先看「沒有反應式」的傳統 jQuery 時代寫法：

```js
// 傳統寫法：每次改資料，都要「手動」記得更新所有相關的畫面
let cartItems = [];

function addItem(item) {
  cartItems.push(item);
  renderCartList();     // 要記得重畫清單
  renderTotalPrice();   // 要記得重算並重畫總價
  renderCartBadge();    // 要記得更新右上角的數字徽章
  // 如果忘記其中一個......畫面就跟資料對不上了！
}
```

問題在哪？**「改資料」和「後續要更新的畫面」綁死在一起。** 每多一個要顯示購物車的地方，就要回頭改 `addItem`。

React 的寫法則完全不同：

```jsx
import { useState } from 'react';

function App() {
  // 宣告一個「會被追蹤」的狀態
  const [cartItems, setCartItems] = useState([]);

  // 只管「改資料」，不用管畫面
  const addItem = (item) => {
    setCartItems([...cartItems, item]);
  };

  return (
    <div>
      {/* 這三個元件都「依賴」cartItems */}
      <CartBadge count={cartItems.length} />
      <CartList items={cartItems} />
      <TotalPrice items={cartItems} />
      <button onClick={() => addItem({ name: '鍵盤', price: 1200, quantity: 1 })}>
        加入購物車
      </button>
    </div>
  );
}
```

注意 `addItem` 裡面**完全沒有**任何「更新畫面」的程式碼！當你呼叫 `setCartItems`，React 會自動：

1. 察覺 `cartItems` 變了
2. 找出所有用到 `cartItems` 的元件（`CartBadge`、`CartList`、`TotalPrice`）
3. 自動重新渲染它們

這就是反應式架構：**你宣告「畫面跟資料的關係」，剩下的交給系統自動反應。**

| | 傳統寫法 | React 反應式寫法 |
|---|---|---|
| 改資料時 | 要記得手動更新每個畫面 | 只呼叫 `setState` |
| 新增顯示位置時 | 回頭修改 `addItem` | 新元件讀取 state 即可 |
| 出錯機率 | 容易漏掉某個畫面沒更新 | 不會漏 |

### 衍生資料也是反應式：useMemo

Excel 的 B1 公式 `=A1 * 2` 在 React 裡的對應就是 `useMemo`：

```jsx
import { useMemo } from 'react';

function TotalPrice({ items }) {
  // total 就像 Excel 的公式格：items 一變，它就自動重算
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items] // 依賴清單：告訴 React「我依賴 items」
  );

  return <p>總價：{total} 元</p>;
}
```

你從來不用手動呼叫「重新計算總價」，`items` 改變時它就自動重算——這就是反應式。

### 對「資料變化」做出反應：useEffect

有時候資料變了，我們想做的不是更新畫面，而是**執行某個動作**（例如存到 localStorage）。這時用 `useEffect`：

```jsx
import { useEffect } from 'react';

function App() {
  const [cartItems, setCartItems] = useState([]);

  // 「訂閱」cartItems 的變化：只要它一變，就自動存檔
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ...
}
```

整理一下 React 提供的反應式工具：

| React 工具 | 反應式角色 | Excel 比喻 |
|---|---|---|
| `useState` | 被追蹤的來源資料 | A1 格子 |
| `useMemo` | 自動重算的衍生資料 | B1 的公式 `=A1*2` |
| `useEffect` | 資料變化時自動執行的動作 | 「A1 變了就寄信通知我」 |
| 元件重新渲染 | 資料變化時自動更新的畫面 | 螢幕上顯示的數字 |

### 反應式架構的三個好處

**1. 把「原因」和「結果」分開**

「按下加入購物車」是原因；「清單更新、總價重算、徽章加一、自動存檔」是結果。寫原因的人（`addItem`）完全不需要知道結果有幾個。

**2. 資料像水流一樣形成管線（Pipeline）**

```
cartItems（來源）
   → useMemo 算出 total（衍生）
   → 元件渲染出畫面（呈現）
   → useEffect 存進 localStorage（副作用）
```

**3. 更有彈性**

要在頁尾也顯示總價？直接讓新元件讀取 state 就好，`addItem` 一行都不用改。

---

## 第二部分：洋蔥式架構（Onion Architecture）

### 什麼是洋蔥式架構？

一句話解釋：**把程式碼像洋蔥一樣分成一層一層，越裡面越純粹、越外面越「髒」。**

這裡的「髒」不是罵人，是指**副作用（Side Effect）**——像是呼叫 API、讀寫 localStorage、操作畫面，這些會影響外部世界的動作。

洋蔥從裡到外分三層：

```
┌─────────────────────────────────┐
│  互動層（Interaction Layer）      │  ← 最外層：跟外界互動（React 元件、API、localStorage）
│  ┌───────────────────────────┐  │
│  │  領域層（Domain Layer）     │  │  ← 中間層：商業邏輯（規則、計算）
│  │  ┌─────────────────────┐  │  │
│  │  │  語言層（Language）    │  │  │  ← 最內層：語言本身與通用工具函式
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**兩條重要規則：**

1. **內層不能依賴外層**（商業邏輯不可以 import React、不可以呼叫 API）
2. **副作用只能放在最外層**（裡面兩層都是純函式）

> 補充：什麼是純函式（Pure Function）？
> 就是「同樣的輸入，永遠得到同樣的輸出，而且不影響外部世界」的函式。例如 `add(1, 2)` 永遠回傳 `3`。

### 實際範例：購物車折扣（React 版）

需求：「從 API 抓購物車資料，滿 1000 元打 9 折，顯示結果」。

#### ❌ 沒有分層的寫法（全部塞進元件）

```jsx
function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  // 商業邏輯直接混在元件裡
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  if (total >= 1000) {
    total = total * 0.9;
  }

  return <p>總價：{total} 元</p>;
}
```

這樣寫的問題：

- 想**測試折扣邏輯**？必須渲染整個元件、還要 mock API，很麻煩
- 結帳頁也要算折扣？邏輯被鎖在 `Cart` 元件裡，沒辦法重複使用
- 折扣規則改了，要進元件裡把邏輯從畫面程式碼中撈出來改

#### ✅ 洋蔥式架構的寫法

建議的資料夾結構：

```
src/
├── utils/          ← 語言層（通用工具）
│   └── math.js
├── domain/         ← 領域層（純商業邏輯，不准 import React！）
│   └── cart.js
└── components/     ← 互動層（React 元件、API 呼叫）
    └── Cart.jsx
```

**最內層：語言層 `utils/math.js`（跟商業無關的通用工具）**

```js
// 這些函式跟「購物車」完全無關，任何專案都能用
export const sum = (numbers) => numbers.reduce((a, b) => a + b, 0);
```

**中間層：領域層 `domain/cart.js`（純粹的商業邏輯）**

```js
import { sum } from '../utils/math';

// 計算單一商品小計
export const itemSubtotal = (item) => item.price * item.quantity;

// 計算購物車總價
export const cartTotal = (items) => sum(items.map(itemSubtotal));

// 套用折扣規則：滿 1000 打 9 折
export const applyDiscount = (total) =>
  total >= 1000 ? total * 0.9 : total;

// 組合起來：完整的價格計算流程
export const finalPrice = (items) => applyDiscount(cartTotal(items));
```

注意看！這個檔案**完全沒有** `import React`、沒有 `fetch`、沒有 `useState`，只有「輸入資料 → 回傳結果」的純函式。

**最外層：互動層 `components/Cart.jsx`（所有副作用都在這裡）**

```jsx
import { useState, useEffect, useMemo } from 'react';
import { finalPrice } from '../domain/cart';

function Cart() {
  const [items, setItems] = useState([]);

  // 副作用：抓資料
  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  // 呼叫領域層的純函式做計算
  const total = useMemo(() => finalPrice(items), [items]);

  // 副作用：渲染畫面
  return <p>總價：{total} 元</p>;
}
```

### 分層之後的好處

**1. 測試變得超簡單**

```js
// 測試領域層：不用渲染元件、不用 mock API！
import { finalPrice } from '../domain/cart';

test('滿 1000 元打 9 折', () => {
  const items = [
    { price: 600, quantity: 1 },
    { price: 500, quantity: 1 }
  ];
  expect(finalPrice(items)).toBe(990); // 1100 * 0.9
});
```

**2. 商業邏輯可以到處重複使用**

購物車頁、結帳頁、後台報表元件，都可以直接 import `finalPrice`。

**3. 改需求時知道去哪裡改**

- 折扣改成滿 2000 打 8 折？→ 只改 `domain/cart.js` 的 `applyDiscount`
- API 網址換了？→ 只改 `components/Cart.jsx`
- 兩邊互不干擾！

### 怎麼判斷程式碼該放哪一層？

問自己這兩個問題：

| 問題 | 是 | 否 |
|---|---|---|
| 這段程式碼有副作用嗎？（fetch、hook、localStorage...） | 放**互動層** | 往下判斷 |
| 這段程式碼跟「這個產品的規則」有關嗎？ | 放**領域層** | 放**語言層** |

---

## 第三部分：兩個架構如何搭配？（重點詳解）

反應式架構和洋蔥式架構**不是二選一**，因為它們管的是**完全不同的兩個維度**：

> - **洋蔥式架構**：管「靜態結構」→ 程式碼該放哪裡、誰能呼叫誰
> - **反應式架構**：管「動態行為」→ 資料變動時，事情怎麼自動發生

這兩句話是整篇文章最重要的觀念，我們拆開來仔細說明。

### 什麼是「靜態結構」？

「靜態」的意思是：**程式還沒執行，光看程式碼檔案就能看出來的東西。**

打個比方：靜態結構就像一棟大樓的**建築藍圖**。藍圖上畫著：

- 廚房在幾樓、廁所在哪裡（→ 程式碼該放哪個資料夾、哪個檔案）
- 水管只能從水塔往下接，不能倒過來（→ 依賴方向：外層可以 import 內層，內層不准 import 外層）

洋蔥式架構管的就是這張藍圖。用剛剛的購物車專案來看：

```
「程式碼該放哪裡」──看檔案位置就知道：

src/
├── utils/math.js        ← sum 放這裡（通用工具）
├── domain/cart.js       ← finalPrice 放這裡（商業規則）
└── components/Cart.jsx  ← useEffect + fetch 放這裡（副作用）
```

```
「誰能呼叫誰」──看 import 方向就知道：

Cart.jsx ──可以 import──▶ domain/cart.js ──可以 import──▶ utils/math.js

domain/cart.js ──✕ 禁止 import──▶ Cart.jsx（內層不能依賴外層！）
domain/cart.js ──✕ 禁止 import──▶ react（領域層不能碰框架！）
```

重點是：**這些規則跟程式「跑起來會發生什麼事」無關**。就算程式一次都沒執行過，你打開專案看檔案結構和 import，就能檢查有沒有違反洋蔥式架構。所以說它管的是「靜態」結構。

**違反靜態結構會怎樣？** 舉個常見的反例：

```js
// ❌ domain/cart.js 裡偷偷做了這種事：
export const finalPrice = (items) => {
  const total = applyDiscount(cartTotal(items));
  localStorage.setItem('lastTotal', total); // 內層混入副作用！
  return total;
};
```

這個函式表面上能動，但它不再是純函式了——測試時會真的寫入 localStorage、在 Node.js 環境（沒有 localStorage）會直接爆炸。洋蔥的規則就是在防這種事。

### 什麼是「動態行為」？

「動態」的意思是：**程式執行起來之後，隨著時間發生的事情。**

延續大樓的比喻：動態行為就像大樓的**自動化系統**。藍圖不會告訴你「有人進門時燈要亮」，那是感應器和自動化規則的事：

- 有人走進大廳 → 感應燈自動亮起
- 溫度超過 28 度 → 冷氣自動啟動

反應式架構管的就是這種「**某件事發生 → 其他事自動跟著發生**」的連鎖規則。用購物車來看：

```
「資料變動時，事情怎麼自動發生」──這是執行時的連鎖反應：

使用者按下「加入購物車」
        │
        ▼
setItems([...items, 新商品])     ← 唯一手動做的事：改資料
        │
        ├──▶ useMemo 察覺 items 變了 → 自動重算 total
        ├──▶ <CartList> 依賴 items → 自動重新渲染
        ├──▶ <CartBadge> 依賴 items → 徽章數字自動 +1
        └──▶ useEffect 察覺 items 變了 → 自動存進 localStorage
```

重點是：**這條連鎖反應「光看檔案結構」是看不到的**，你要理解「程式跑起來、資料流動時」會發生什麼，所以說它管的是「動態」行為。

**沒有反應式架構會怎樣？** 你就得自己當那個「連鎖反應」：

```js
// ❌ 手動連鎖：每次改資料都要自己把所有後續動作串一遍
function addItem(item) {
  items.push(item);
  recalculateTotal();   // 忘了呼叫 → 總價是舊的
  rerenderList();       // 忘了呼叫 → 清單沒更新
  updateBadge();        // 忘了呼叫 → 徽章數字錯了
  saveToStorage();      // 忘了呼叫 → 重新整理後資料不見
}
```

只要漏掉一個，畫面和資料就「對不上」了。反應式架構把這種手動串接，變成系統自動保證的行為。

### 一張表看懂兩者的分工

| | 洋蔥式架構 | 反應式架構 |
|---|---|---|
| 管的維度 | 靜態結構 | 動態行為 |
| 回答的問題 | 「這段程式碼**該放哪裡**？」<br/>「A **能不能** import B？」 | 「items 變了之後，**接下來會自動發生什麼**？」 |
| 什麼時候看得到 | 不用執行程式，看檔案和 import 就看得到 | 程式執行、資料流動時才看得到 |
| 比喻 | 大樓的建築藍圖 | 大樓的自動化感應系統 |
| 在 React 專案的體現 | 資料夾分層：`utils/` → `domain/` → `components/` | `useState` → `useMemo` / `useEffect` → 自動重新渲染 |
| 違反時的症狀 | 邏輯難測試、難重複使用、改 A 壞 B | 畫面和資料對不上、忘記更新某處 |

### 兩者合體：完整範例

把兩個架構套在同一個元件上，你會看到它們各司其職：

```jsx
// components/Cart.jsx
import { useState, useEffect, useMemo } from 'react';
import { finalPrice } from '../domain/cart';
//        ▲
//        └── 洋蔥式（靜態）：外層 import 內層，方向正確 ✅

function Cart() {
  // 反應式（動態）：宣告被追蹤的來源資料
  const [items, setItems] = useState([]);

  // 副作用放在互動層（洋蔥式）＋ 對「元件掛載」這件事做出反應（反應式）
  useEffect(() => {
    fetch('/api/cart').then(res => res.json()).then(setItems);
  }, []);

  // 計算交給領域層的純函式（洋蔥式）
  // items 一變就自動重算（反應式）
  const total = useMemo(() => finalPrice(items), [items]);

  // items 一變就自動存檔（反應式），副作用留在互動層（洋蔥式）
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item) => setItems(prev => [...prev, item]);

  return (
    <div>
      <p>總價：{total} 元</p>
      <button onClick={() => addItem({ name: '鍵盤', price: 1200, quantity: 1 })}>
        加入購物車
      </button>
    </div>
  );
}
```

一句話總結這段程式碼的分工：

> **洋蔥式架構決定了 `finalPrice` 住在 `domain/`、副作用住在元件裡（靜態結構）；反應式架構決定了 `items` 一變，`total`、畫面、localStorage 全部自動跟上（動態行為）。**

這也正是 React 官方推崇的寫法核心：

> **純函式負責計算，反應式系統負責串流程，副作用集中在最外圈。**

---

## 總結

| 觀念 | 一句話 | 解決的問題 |
|---|---|---|
| 反應式架構 | 資料變了，相關的事自動發生（動態行為） | 「原因」和「結果」耦合太緊、手動更新容易漏 |
| 洋蔥式架構 | 副作用放外圈，邏輯放內圈（靜態結構） | 商業邏輯和副作用混在一起、難測試難重複使用 |

給初學者的行動建議：

1. **從抽出純函式開始**：看到計算邏輯混在元件裡，就把它抽到 `domain/` 資料夾，並且不准它 import React
2. **檢查 import 方向**：`domain/` 裡出現 `import React` 或 `fetch` 就是警訊
3. **善用 React 的反應式工具**：把「手動更新」的念頭改成「宣告依賴關係」——`useMemo` 宣告衍生資料、`useEffect` 宣告資料變化後的動作

> 延伸閱讀：這兩個觀念出自《Grokking Simplicity》（中文版《簡約的軟體開發思維》），是一本非常適合初學者的 FP 入門書，推薦閱讀！
