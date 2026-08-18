---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 3 堂：createSlice 核心機制與型別實作

# 12Immer 與不可變性魔法

在上一節中，我們看到 `createSlice` 是如何自動幫我們生成 Action Creators 與 Action Types 的。但如果你細心觀察過一些 Redux Toolkit（RTK）的範例程式碼，你可能會感到一陣驚悚：為什麼在 `reducers` 裡面，開發者竟然可以直接寫 `state.value += 1` 這種看起來像是「直接修改狀態（Mutation）」的程式碼？

在傳統的 Redux 世界裡，這可是大忌。Redux 的三大原則之一就是「State 是唯讀的」，所有更新都必須透過回傳一個全新的物件來達成。那麼，為什麼 RTK 敢公然違背這個原則？這背後隱藏了一位強大的魔法師：**Immer**。

## 痛苦的開端：擴展運算子地獄

在深入了解 Immer 之前，我們先來回憶（或者想像）一下，如果沒有 Immer，我們要更新一個深層嵌套的狀態會有多痛苦。

假設你的狀態長這樣：

```typescript
const state = {
  user: {
    id: 1,
    profile: {
      name: "Aria",
      preferences: {
        theme: "dark",
        notifications: true
      }
    }
  },
  status: "idle"
};
```

如果你只想把 `theme` 從 `"dark"` 改成 `"light"`，在傳統 Redux 的 Reducer 中，你必須這樣寫：

```typescript
return {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      preferences: {
        ...state.user.profile.preferences,
        theme: "light"
      }
    }
  }
};
```

這種寫法被戲稱為「擴展運算子地獄（Spread Operator Hell）」。它不僅難讀、難寫，更可怕的是極其容易出錯。只要你少寫了一個 `...`，該層級的其他資料就會從狀態樹中消失。這種為了維持「不可變性（Immutability）」而付出的代價，是許多新手放棄 Redux 的主要原因之一。

## Immer：讓「修改」變成了「生產」

Redux Toolkit 內建了一個名為 **Immer** 的函式庫。它的核心理念非常迷人：**你儘管大膽地去「修改」那個物件，我來幫你處理那些繁瑣的不可變備份工作。**

Immer 的運作機制可以用一個簡單的公式來表達：
`produce(baseState, recipe) -> nextState`

這裡的 `recipe`（食譜）就是你的修改邏輯，你在裡面操作的是一個名為 `draft`（草稿）的物件。

### 核心機制：Draft State 的運作原理

為了讓你徹底理解這件事，我們不看圖，直接來看一段模擬 Immer 核心函式 `produce` 的實作邏輯。請仔細觀察這段偽程式碼中的狀態變化：

```typescript
import { produce } from "immer";

// 1. 這是我們的基礎狀態（原始資料），絕對不可被破壞
const baseState = {
  user: {
    name: "Aria",
    skills: ["React", "TypeScript"]
  },
  version: "1.0"
};

// 2. 使用 produce 函式，Immer 會提供一個 'draft'（草稿）讓我們修改
const nextState = produce(baseState, (draft) => {
  // 在這裡，你可以像寫普通 JS 一樣直接修改屬性
  draft.user.name = "Aria Chen"; 
  
  // 甚至可以直接對陣列進行 push，這在傳統 Redux 是絕對禁止的
  draft.user.skills.push("Redux Toolkit");
  
  // 我們不需要 return 任何東西，除非你想替換整個 state
});

// 3. 驗證結果
console.log("Is baseState the same as nextState?", baseState === nextState); 
// 輸出: false (成功產生了新物件！)

console.log("Base State Name:", baseState.user.name); 
// 輸出: "Aria" (原始資料毫髮無傷)

console.log("Next State Name:", nextState.user.name); 
// 輸出: "Aria Chen" (新狀態已更新)

console.log("Is the version field shared?", baseState.version === nextState.version);
// 輸出: true (這就是結構共享：沒變動的部分，記憶體位置是一樣的！)
```

這段程式碼揭示了 Immer 的魔法真相：

- **baseState（基礎狀態）：** 這是你原本傳進去的 State，它是唯讀的，Immer 確保它在整個過程中不會被觸碰。
- **draft（草稿）：** 這是一個神奇的「代理物件（Proxy）」。當你對 `draft` 進行操作時，你並不是在修改真正的資料，而是在「紀錄」你想做哪些修改。
- **nextState（最終狀態）：** 當 `produce` 執行完畢，Immer 會根據你在 `draft` 上做的紀錄，自動幫你產出一份「包含了這些修改，但同時保持了不可變性」的新物件。

### 為什麼「直接修改」不會違反規則？

你可能會問：「那我在 `createSlice` 裡面寫 `state.count += 1`，這到底是改了什麼？」

事實上，當你在 `createSlice` 的 `reducers` 中撰寫程式碼時，RTK 在底層已經自動幫你把該函式包裹在 Immer 的 `produce` 裡面了。

因此，你的 `state` 參數其實就是那個 `draft`。
當你寫 `state.count += 1` 時，你其實是在**操作 Proxy 物件的 Setter**。Immer 會攔截這個操作，記下「喔！使用者想把 count 增加 1」，然後在背後默默幫你完成繁雜的 `return { ...state, count: state.count + 1 }`。

這就是為什麼在 RTK 中，我們可以使用直覺的指令式（Imperative）語法，卻能享受到函數式（Functional）編程帶來的不可變性好處。

## 深度追蹤：Proxy 是如何攔截的？

為了讓你的理解達到「專家級」，我們必須聊聊 JavaScript 的 **Proxy** 物件，這是 Immer 的心臟。

當一個物件被封裝成 Proxy 後，我們可以定義一些「陷阱（Traps）」。例如，當有人試圖讀取（Get）或寫入（Set）屬性時，這層 Proxy 會先攔截到訊號。

1. **攔截 Set 操作：** 當你執行 `draft.user.age = 25` 時，Proxy 的 `set` 陷阱被觸發。
2. **標記變動：** Immer 內部會標記 `user` 這個節點發生了「變動（Dirty）」。
3. **結構共享（Structural Sharing）：** 這最為關鍵。當產出 `nextState` 時，Immer 會檢查哪些節點沒被標記。例如上面範例中的 `version` 欄位，既然沒動過，`nextState` 就會直接指向 `baseState` 中 `version` 的記憶體位置。

這意味著 Immer 不僅僅是幫你做「深拷貝（Deep Copy）」。事實上，它比深拷貝快得多，也省記憶體得多，因為它只會複製「有變動路徑上的節點」，其餘部分則繼續共用舊的參考。這在處理大型狀態樹時，效能表現非常卓越。

## 使用 Immer 的三大禁忌

雖然 Immer 讓我們寫程式變得很爽，但這裡有三個新手最容易踩坑的地方，務必記在心裡：

### 1. 絕對不要同時「修改」又「回傳」

在 RTK 的 Reducer 中，你只能選擇其中一種方式來更新狀態：

- **方式 A（修改 Draft）：** `state.value = 1;`（不用回傳）
- **方式 B（回傳新物件）：** `return { ...state, value: 1 };`

如果你寫成這樣，Immer 會感到困惑：

```typescript
// ❌ 錯誤示範
increment: (state) => {
  state.value += 1;
  return state; // 不要這樣做！
}
```

### 2. 只有在 RTK 的 reducers 裡才能這樣寫

請記住，這種「直接修改」的語法是因為 RTK 幫你整合了 Immer。如果你在一般的 React `useState` 或者是你自己寫的純函數中使用這種語法，狀態是不會被觸發更新的，因為那裡沒有 Proxy 攔截器。

### 3. 解構賦值（Destructuring）的陷阱

如果你解構了 `state`，你就失去了 Proxy 的連結。

```typescript
// ❌ 錯誤示範
reducers: {
  updateUser: (state, action) => {
    let { name } = state; // 這裡 name 已經是一個普通變數，不再是 Proxy 的一部分
    name = action.payload; // 這只是在修改區域變數，狀態完全沒變！
  }
}

// ✅ 正確做法
reducers: {
  updateUser: (state, action) => {
    state.name = action.payload; // 直接透過 state 物件存取
  }
}
```

## 總結：為何 Immer 是 Redux 的救星？

在沒有 Immer 的年代，Redux 的學習曲線有一半是卡在如何正確、優雅地操作不可變資料。開發者往往要引入像是 `Immutable.js` 這種具有侵略性的函式庫，強迫自己使用 `.get()` 和 `.set()` 等非原生語法。

Immer 的出現，徹底解決了這個問題。它讓我們用最自然的 JavaScript 語法，去實現最高標準的 Redux 原則。這不僅是語法糖，這是一場關於「開發者體驗」的革命。

### 關鍵要點回顧

- **不可變性是核心：** Redux 的 State 永遠不該被真正修改，Immer 只是幫我們代勞了備份的過程。
- **Draft（草稿）機制：** 透過 Proxy 攔截修改，紀錄變動，最後產出新物件。
- **結構共享：** 沒變動的部分會保留原始參考，優化記憶體使用與效能。
- **專注於邏輯：** 因為不用再處理展開運算子（`...`），我們可以把心力放在業務邏輯的實作上。

在了解了 Immer 的魔法後，你現在已經可以寫出非常直觀的 Reducer 邏輯了。接下來，我們將進入 TypeScript 的世界，看看如何為這些 Slice 加上嚴謹的型別防護網，讓你的開發過程更加穩固。

---

## 承前啟後：邁向型別安全

現在你已經理解了 `createSlice` 的內部運作機制，特別是 Immer 如何讓狀態更新變得如此優雅。然而，在大型專案中，僅有優雅是不夠的，我們還需要「精準」。

在下一節中，我們將探討如何將 TypeScript 完美整合進 Slice 中。你將學會如何定義 `initialState` 的 Interface，以及如何使用 `PayloadAction` 來規範 Action 的資料內容。當你嘗試把一個字串傳給需要數字的 Reducer 時，TypeScript 會在第一時間跳出來阻止你。這正是我們接下來要掌握的——建立一個既好寫、又不會壞掉的強健開發流程。
