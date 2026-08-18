---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 3 堂：createSlice 核心機制與型別實作

# 10createSlice 三大要素

在我們之前的課程中，我們探討了 Redux 的三大原則，以及傳統 Redux 為了遵循這些原則而產生的冗長樣板程式碼（Boilerplate）。你可能還記得，在傳統寫法中，我們必須分開定義 Action Types（字串常數）、Action Creators（回傳物件的函式）以及 Reducer（巨大的 switch-case 函式）。這種「三位一體」的分散結構不僅寫起來累人，維護起來更是容易出錯。

這正是 **Redux Toolkit (RTK)** 登場的時刻。而 `createSlice` 則是 RTK 中最核心、最能體現「開發體驗優化」的 API。

想像一下，如果你可以把一個功能模組（例如：計數器、使用者登入、購物車）的「初始狀態」與「所有的更新邏輯」封裝在一個盒子裡，並讓工具自動幫你生成對應的 Action，那該有多方便？這就是 `createSlice` 的核心使命。在本節中，我們將深入剖析定義一個 Slice 時不可或缺的三大要素：`name`、`initialState` 與 `reducers`。

## 什麼是 Slice？

在深入要素之前，我們先建立一個直觀的心智模型。

在 Redux 的世界觀裡，整個應用程式只有一個 Store（Single source of truth）。但在實際開發時，我們不可能把所有的邏輯都寫在一個巨大的檔案中。我們會根據功能（Feature）將狀態切分成不同的「薄片」，這就是 **Slice**。

例如，一個電商網站可能會包含：

- `authSlice`: 管理登入狀態、使用者資訊。
- `cartSlice`: 管理購物車中的商品清單。
- `productSlice`: 管理從 API 抓取回來的商品列表。

`createSlice` 就像是一台自動化工廠，你只要提供「設計圖」（即三大要素），它就會產出這個薄片所需的 Reducer 函式以及對應的 Action Creators。

---

## 1. name：定義命名空間與 Action 的前綴

`createSlice` 的第一個參數是 `name`，它是一個字串。你可能會覺得這只是一個用來識別的標籤，但實際上，它在 Redux 的資料流中扮演了至關重要的角色。

### Action Type 的自動生成邏輯

在 Redux 中，每一個 Action 都必須有一個唯一的 `type` 屬性（例如：`COUNTER_INCREMENT`）。在傳統 Redux 中，我們得手寫這些字串。而在 `createSlice` 中，RTK 會自動幫你組合這些字串。

**組合公式為：**`**name**`** + **`**/**`** + **`**reducer名稱**`

假設我們定義了一個 Slice 如下：

```typescript
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});
```

當這個 `increment` 被觸發時，RTK 實際發送的 Action Type 會是 **`"counter/increment"`**。

### 為什麼這很重要？

1. **避免命名衝突**：當你的應用程式變大，可能有複數個 Slice 都有 `add` 或 `remove` 邏輯。透過 `name` 作為前綴（Namespace），可以確保 `cart/add` 與 `todo/add` 互不干擾。
2. **可讀性與除錯**：當你開啟 Redux DevTools 觀察狀態變化時，清晰的 `name/action` 格式能讓你一眼看出是哪個模組觸發了更新。如果沒有 `name`，所有的 Action 都混在一起，追蹤 bug 將會是一場災難。

---

## 2. initialState：狀態的起點與型別的基石

`initialState` 代表該 Slice 在應用程式啟動時的初始狀態。這不僅是資料的起點，在 TypeScript 的開發環境下，它更是**型別推導的核心來源**。

### 為什麼要重視初始值？

當 Store 第一次被建立時，Redux 會發送一個初始化的 Action（`@@INIT`）。此時，所有的 Reducer 都會被執行一次。如果你的 Reducer 找不到對應的 state，它就會回傳這個 `initialState`。

### 在 TypeScript 中的角色

作為進階開發者，你會發現 `initialState` 的定義方式直接決定了你後續寫程式碼的爽快程度。

如果你直接寫：

```typescript
initialState: { value: 0 }
```

TypeScript 會推斷 `value` 的型別是 `number`。當你在之後的 reducer 中試圖把字串賦值給它時，編譯器就會立刻報警。

但在複雜的應用中，我們通常會先定義一個 `interface`：

```typescript
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CounterState = {
  value: 0,
  status: 'idle',
};
```

這樣做的好處是：

- **明確性**：任何人閱讀程式碼都能立刻理解這個 Slice 儲存了哪些資料。
- **安全性**：防止開發過程中意外遺漏必要的欄位。
- **自動補完**：在 `reducers` 中撰寫邏輯時，IDE 會根據這個結構給你精確的屬性建議。

---

## 3. reducers：邏輯的核心處理器

`reducers` 是 `createSlice` 中最精華的部分。它是一個「物件」，裡面包含了多個函式。每一個鍵（Key）代表一個動作名稱，而對應的值（Value）則是具體的狀態更新邏輯。

### Case Reducer 的語法

在傳統 Redux 中，你會看到這樣的 `switch-case`：

```javascript
// 傳統寫法 (不推薦)
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/increment':
      return { ...state, value: state.value + 1 };
    default:
      return state;
  }
}
```

而在 `createSlice` 中，你只需要寫：

```typescript
reducers: {
  // 這就是一個 Case Reducer
  increment: (state) => {
    // 這裡我們直接寫下「想要如何改變狀態」
    state.value += 1;
  },
}
```

### 關鍵參數：state 與 action

每個內部的 reducer 函式都會接收兩個參數：

1. **state**：當前該 Slice 的狀態（注意：這不是全域狀態，而是該 Slice 自己的狀態）。
2. **action**：觸發此更新的 Action 物件，通常包含 `type` 與 `payload`。

### 為什麼可以直接「修改」state？

如果你是一個嚴謹的 React/Redux 開發者，你看到 `state.value += 1` 時可能會大吃一驚：「這不是直接改動（Mutate）狀態嗎？這不是違反了不可變性（Immutability）原則嗎？」

**別擔心！** 這正是 RTK 的神奇之處。RTK 內部整合了一個名為 **Immer** 的函式庫。它會攔截你的「修改」動作，並自動幫你轉換成「回傳一個全新的狀態物件」。這讓你可以用最直觀、最簡單的 JavaScript 語法來撰寫複雜的狀態更新邏輯，而不需要在那邊寫一堆噴發的展開運算子（Spread Operator `...state`）。

*備註：我們會在 3.3 節「Immer 與不可變性魔法」中深入探討這個機制，現在你只需要知道：在 *`*createSlice*`* 的 *`*reducers*`* 裡，直接修改 *`*state*`* 是被允許且被鼓勵的。*

---

## 綜合範例：一個完整的 Slice 結構

讓我們把上述三個要素組合起來，看看一個標準的 Slice 檔案會長什麼樣子。這是一個典型的「理論 + 實作」結合範例：

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. 定義狀態的型別 (TypeScript 強項)
interface AuthState {
  isLoggedIn: boolean;
  user: string | null;
  error: string | null;
}

// 2. 設定 initialState (要素之二：資料起點)
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  error: null,
};

// 3. 建立 Slice (整合三大要素)
export const authSlice = createSlice({
  name: 'auth', // 要素之一：命名空間，Action 將以 'auth/' 為開頭
  initialState,
  reducers: {
    // 要素之三：更新邏輯
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.user = action.payload; // 直接修改，Immer 會處理不可變性
      state.error = null;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// 注意：我們還需要匯出一些東西，這將在下一節詳述
export default authSlice.reducer;
```

### 你發現了嗎？

在這個結構中，我們沒有寫任何一個 Action Type 常數，也沒有寫 Action Creator 函式。我們只是定義了 `reducers` 裡的 `loginSuccess` 函式，RTK 就已經知道：

- 會有一個型別為 `"auth/loginSuccess"` 的 Action。
- 需要生成一個名為 `loginSuccess` 的函式，讓你在元件中呼叫並傳入字串作為 `payload`。

---

## 總結與下階段預告

透過 `createSlice`，我們成功地將分散的 Redux 零件整合進了一個結構清晰的組態物件中：

- `**name**` 解決了 Action 的命名與衝突問題。
- `**initialState**` 為資料結構打下了基礎，並為 TypeScript 提供型別依據。
- `**reducers**` 將原本複雜的 `switch-case` 簡化為直觀的函式物件。

這就是我們所謂的「宣告式（Declarative）」寫法：我們宣告了狀態長什麼樣子，以及有哪些改變狀態的方式，而不需要去煩惱底層如何建立 Action 物件或如何複製狀態。

到目前為止，我們只是「宣告」了我們的意圖。但這些動作要如何被 React 元件觸發呢？在下一部分，我們將揭開 `createSlice` 的另一個強大機制：它是如何利用你寫下的這些資訊，**自動生成**那些好用的 Action Creators，讓你連一個 `type` 字串都不用寫就能發送 Action。

## 關鍵要點

- `createSlice` 的 `name` 會自動成為 Action Type 的前綴（`name/reducerName`）。
- `initialState` 定義了 Slice 的初始資料，是 TypeScript 型別推導的源頭。
- `reducers` 是一個存放「Case Reducer」的物件，透過 Immer 支援直觀的狀態修改語法。
- 這種封裝方式極大程度地減少了樣板程式碼，讓開發者專注於業務邏輯。
