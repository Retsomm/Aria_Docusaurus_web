---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 10 堂：React 核心設計哲學

# 31 Virtual DOM 的本質

在上一節中，我們探討了「宣告式 UI」的概念：開發者不再手動操作 DOM，而是描述 UI 在不同狀態下「應該長什麼樣子」。然而，這留下了一個巨大的技術疑問：當我們在代碼中寫下那些看起來像 HTML 的標籤時，JavaScript 引擎內部究竟發生了什麼？這些描述又是如何轉化為真實畫面的？

這一節，我們將揭開 React 最核心的技術機制——**Virtual DOM（虛擬 DOM）**。你會發現，它既不神祕也不複雜，本質上只是我們在 Topic 3 討論過的 JavaScript 物件。

## 想像與現實的橋樑：什麼是 Virtual DOM？

在深入代碼之前，我們可以用一個建築學的類比來理解：

- **真實 DOM**：就像是一座已經蓋好的、宏偉但沈重的摩天大樓。如果你想把大樓的窗戶從藍色換成綠色，你必須派出施工隊，搭起鷹架，實際動手拆卸並重新安裝。這個過程耗時、耗力，且容易出錯。
- **Virtual DOM**：則是這座大樓的「藍圖」或「3D 模型」。它並非實體，只是一份存在於記憶體中的數據。在模型上修改窗戶顏色只需要改一個參數，速度極快。

**Virtual DOM 的正式定義是：它是一個輕量級的 JavaScript 普通物件（Plain Object），用來描述真實 DOM 的結構與屬性。**

在 React 中，我們並不直接操作 DOM 節點，而是操作這些輕量級的物件。當狀態改變時，React 會生成一份新的「藍圖」，然後與舊的「藍圖」進行比對，最後只把真正需要變動的部分應用到真實的大樓（DOM）上。

### 預測與揭曉：React 元件回傳的是什麼？

請你先思考一個問題：當你寫下一個 React 元件並在其中回傳 JSX 時，這個函數執行的結果是什麼？

```javascript
const Greeting = () => {
  return <div className="active">Hello World</div>;
};

// 執行 Greeting()，得到的會是真實的 <div> 節點嗎？
```

如果你在瀏覽器的主控台（Console）中嘗試印出這個結果，你會驚訝地發現：它完全不是 DOM 元素，而是一個帶有特定欄位的 **JavaScript 物件**。這個物件就是我們所說的 **React Element**。

## 拆解 React Element 的構造

讓我們近距離觀察一個 React Element 物件。假設我們有以下的 JSX：

```javascript
const element = (
  <div id="main" className="container" key="unique-key">
    <h1>標題</h1>
    <p>內容描述</p>
  </div>
);
```

React 會將這段描述轉換成類似下面的物件結構（簡化版）：

```javascript
{
  type: 'div',
  key: 'unique-key',
  ref: null,
  props: {
    id: 'main',
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: '標題' }
      },
      {
        type: 'p',
        props: { children: '內容描述' }
      }
    ]
  },
  _owner: null, // 指向建立該元素的元件
  _store: {}    // 開發者工具使用的內部欄位
}
```

這就是 Virtual DOM 的真面目。讓我們逐一拆解這些關鍵欄位的意義：

### 1. `type`：節點的類別

這個欄位決定了這是一個什麼樣的節點。

- **字串**：如果是小寫字串（如 `'div'`, `'span'`, `'h1'`），代表這是一個標準的 HTML 標籤。React 會在最終渲染時建立對應的 DOM 元素。
- **函數或類別**：如果是大寫開頭（如 `MyButton`），這代表一個 React 元件。React 會遞迴地呼叫這個函數，直到取得最底層的 HTML 標籤描述為止。

### 2. `props`：屬性與資料的集合

`props` 是一個物件，包含了所有傳遞給該元素的屬性。

- 在 HTML 標籤上，這包含 `id`, `className`, `style` 等。
- 在 React 元件上，這包含開發者自定義的資料（如 `user={name}`）。
- **特別注意 **`**children**`**：在 React Element 的結構中，子節點被視為 **`**props**`** 的一個特殊屬性。這體現了 React 的哲學：**UI 就是數據。子節點可以是字串、另一個 React Element，或是這些東西組成的陣列。

### 3. `key`：唯一的識別符

這是一個特殊的欄位，不屬於 `props`。它的存在是為了優化 React 的「協調機制」（Reconciliation）。我們在後續 Topic 7 會深入討論，目前你只需要知道：`key` 幫助 React 追蹤哪些元素在清單中被移動、新增或刪除。

## JSX 的真相：揭開語法糖的面紗

初學者常誤以為 JSX 是瀏覽器原先就能理解的語法。事實上，瀏覽器對 `<div />` 這種寫法一竅不通。

### 編譯過程：從 JSX 到程式碼

當你撰寫 JSX 時，前端建置工具（如 Babel 或 SWC）會在打包階段將其轉換為標準的 JavaScript 函數呼叫。

**你的原始碼：**

```javascript
const profile = (
  <div className="card">
    <img src="avatar.png" alt="User" />
    <Greeting name="Alice" />
  </div>
);
```

**編譯後的程式碼：**

```javascript
import { createElement } from 'react';

const profile = createElement(
  'div',
  { className: 'card' },
  createElement('img', { src: 'avatar.png', alt: 'User' }),
  createElement(Greeting, { name: 'Alice' })
);
```

`React.createElement(type, props, ...children)` 這個函數被呼叫後，最終產出的就是上一節提到的 **Plain Object**。

這解釋了為什麼在 React 17 以前的版本，即使代碼中沒有直接用到 `React` 物件，你也必須在檔案頂端加上 `import React from 'react'`。因為編譯後的程式碼會大量依賴 `React.createElement`。在現代 React 版本中，雖然編譯器變得更聰明，不再強制需要顯式 import，但其底層邏輯依然是將 JSX 轉換為函數呼叫。

### 為什麼不直接用物件？

你可能會問：「既然底層是物件，為什麼我不直接寫物件就好？」
答案很簡單：**開發體驗（DX）**。
手寫嵌套的 `createElement` 呼叫或深層物件非常痛苦且容易出錯。JSX 提供了一種視覺上與 HTML 結構高度一致的「宣告式」語法，讓開發者能直觀地預見 UI 的最終樣子。

## 真實 DOM vs. Virtual DOM：重量級與輕量級的對決

為了理解為什麼 React 堅持要多做這一層「中間轉換」，我們必須看看真實 DOM 到底有多「重」。

在瀏覽器中，一個簡單的 `<div>` 節點並不是只有幾個屬性。它繼承了 `HTMLDivElement`, `HTMLElement`, `Element`, `Node`, 到最頂層的 `EventTarget`。

如果你執行以下代碼：

```javascript
const realDiv = document.createElement('div');
let count = 0;
for (let prop in realDiv) {
  count++;
}
console.log(`一個 div 節點的屬性數量：${count}`);
```

你會發現，一個空的 `div` 節點在 Chrome 瀏覽器中通常有 **200 到 300 個以上的屬性**。這包含了各種樣式、佈局屬性、事件監聽器原型等等。

### 效能代價的差異

1. **記憶體消耗**：建立 10,000 個真實 DOM 節點會消耗驚人的記憶體，並可能導致瀏覽器卡頓。而建立 10,000 個包含 3 個欄位的 Virtual DOM 物件，對於現代 JavaScript 引擎來說只是微不足道的運算。
2. **操作速度**：當你修改真實 DOM 的屬性時，瀏覽器通常會觸發一連串昂貴的後續動作：重新計算樣式（Recalculate Style）、重新佈局（Layout/Reflow）、重新繪製（Paint）。而修改一個 JS 物件的屬性，僅僅是 CPU 在記憶體中的一次位元切換。

**React 的核心策略就是：在 JavaScript 的記憶體層面進行大量的計算（比對藍圖），以換取對真實 DOM 操作的最優化與最小化。**

## 從宣告式 UI 到物件描述

現在，我們可以將本節的內容與上一節的「宣告式 UI」完美連結。

在命令式編程中，我們必須親自去處理那 300 多個屬性的 DOM 節點：

- 「找到那個 ID 為 'btn' 的節點」
- 「修改它的 className」
- 「為它添加一個子節點」

在 React 的宣告式思維中，我們改為產出 Virtual DOM 物件：

- 「現在我的 UI 狀態是：一個 `type` 為 `'button'`、`props` 包含 `'active'` 的物件」

**我們宣告出來的結果，在 JS 裡面就是以這種物件形式存在的。** 這種從「操作行為」到「描述狀態」的轉變，正是 React 能夠跨平台運行的關鍵。因為 Virtual DOM 只是一個物件，它不僅可以對應到瀏覽器的 DOM，也可以透過不同的渲染器（Renderer）對應到 iOS/Android 的原生元件（React Native），或是伺服器端的字串（SSR）。

### 預防性的思考

雖然 Virtual DOM 比較輕，但這並不代表我們可以無限制地產出它。
當你的應用程式變得極大時，React 每次狀態更新都要重新生成整棵 Virtual DOM 樹並進行比對。如果這棵樹有數萬個節點，比對過程本身也會產生效能負擔。這就是為什麼 React 後續演進出了 **Fiber 架構**（Topic 8）與 **優先級調度**（Topic 9）——為了讓這個比對過程可以被拆分與中斷。

但在此之前，請務必記住：Virtual DOM 的第一要務是**實現宣告式開發的基石**，其次才是**效能優化**。

## 虛擬物件帶來的架構靈活性

了解了 Virtual DOM 的本質是 Plain Object 後，我們可以總結出它為 React 帶來的幾個核心價值：

1. **脱離環境依賴**：因為 UI 被抽象成了純資料（物件），React 核心邏輯不需要知道 `document` 或 `window` 的存在。這讓 React 可以在 Node.js 環境中運行（SSR），實現極速的首屏加載。
2. **可預測性**：既然 UI 是根據狀態生成的物件快照，那麼只要狀態（State/Props）相同，生成的 Virtual DOM 物件就保證相同，進而保證 UI 的一致性。
3. **批次處理的可能**：因為我們手中有完整的「新藍圖」與「舊藍圖」，我們可以先在記憶體中算好所有的差異，然後再一次性地更新到真實 DOM 上，避免了多次觸發瀏覽器重繪的效能浪費。

### 總結與銜接

在本節中，我們深入剖析了 Virtual DOM。它不是什麼高深莫測的魔法，而是：

- 一個簡單的 **JavaScript 物件**（React Element）。
- JSX 編譯後的**最終產物**。
- 比起真實 DOM 更加**輕量、快速**的 UI 描述。

既然我們已經知道「UI 是由物件描述的」，那麼下一個問題自然而然地出現了：**「如果我只是改了一個小按鈕的顏色，React 難道要重新蓋掉整座大樓嗎？」** 當然不是。為了有效率地將這份「藍圖」更新到真實世界，React 引入了一套精妙的機制來決定何時、以及如何進行最小化的更新。

在下一節中，我們將探討「為什麼我們需要這種中間層物件」，並深入研究 **批次更新（Batching）** 與 **Diffing 策略** 如何解決 Web 開發中最棘手的效能與同步問題。
