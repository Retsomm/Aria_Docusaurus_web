---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 5 堂：多個 Slice 組合管理

# 21combineReducers 與命名空間

當我們在學習 Redux 的初期，通常會從一個簡單的範例開始，例如一個計數器（Counter）。那時，我們的 Store 裡只放了一個 `counterReducer`，一切看起來都非常直覺。然而，真實世界的應用程式絕不會只有一個計數器。想像一下，當你的專案擴張到同時擁有「代辦清單（Todo List）」、「使用者驗證（Auth）」、「購物車（Cart）」以及「產品列表（Product List）」時，那個所謂的「單一事實來源（Single Source of Truth）」要如何整齊地容納這些風馬牛不相及的資料，而不會變成一團混亂？

這就是我們今天要探討的核心：如何管理多個 Slice，以及 Redux Toolkit（RTK）如何透過命名空間的概念，讓我們優雅地組合這些狀態邏輯。

## 從單一到多元：為什麼需要合併？

在 Redux 的世界裡，基本的限制是：**一個應用程式只能有一個 Store**。如果你試圖建立多個 Store 來管理不同的功能，你會立即失去 Redux 最強大的優勢之一——全域狀態的可預測性與時間旅行除錯（Time Travel Debugging）。

但「一個 Store」不代表「一個 Reducer」。如果我們把所有的邏輯（新增代辦、刪除產品、使用者登入）全部塞進同一個巨大的 Reducer 函數裡，程式碼會變得極其難以維護。因此，Redux 的設計哲學是：**將邏輯拆分成多個小的 Reducer（也就是 Slice），最後再將它們合併成一個根（Root）Reducer。**

在傳統的 Redux 中，這需要手動呼叫 `combineReducers` 函式。但在 RTK 中，這個過程被大幅簡化且自動化了。

## configureStore 的隱式合併機制

當你使用 RTK 的 `configureStore` 時，你可能會注意到 `reducer` 這個配置項。它展現了一種非常聰明的「多態性」。

如果你傳入的是一個單獨的 Reducer 函數（如我們之前只做 Counter 時），Store 就會直接使用它。但如果你傳入的是一個**物件**，`configureStore` 會自動在底層幫你執行 `combineReducers`。

### 命名空間（Namespace）的建立

當 `reducer` 配置項是一個物件時，物件中的**鍵（Key）**就定義了該狀態在全域 State 樹中的**命名空間**。

讓我們直接看程式碼來理解這個邏輯。假設我們現在有兩個 Slice：一個負責計數，一個負責代辦清單。

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import todoReducer from '../features/todo/todoSlice';

export const store = configureStore({
  // 注意這裡：我們傳入的是一個物件
  reducer: {
    counter: counterReducer, // 'counter' 成為了命名空間
    todos: todoReducer       // 'todos' 成為了另一個命名空間
  },
});
```

這段配置直接決定了全域狀態樹的結構。當你呼叫 `store.getState()` 時，你會得到一個長得像這樣的物件：

```json
{
  "counter": {
    "value": 0
  },
  "todos": {
    "items": [],
    "loading": false
  }
}
```

### 為什麼這很重要？

1. **邏輯隔離**：`counterReducer` 只需要關心它自己的 `value`，它完全不需要知道 `todos` 的存在。當一個 Action 被 Dispatch 時，RTK 會把對應命名空間下的子狀態傳給對應的 Reducer。
2. **避免命名衝突**：不同的 Slice 可以擁有相同名稱的屬性。例如，兩個 Slice 都可以有 `loading` 或 `error` 狀態，因為它們分別被存放在 `state.counter.loading` 和 `state.todos.loading` 之下。
3. **語意明確**：透過選擇有意義的 Key（如 `todos` 而非 `todoReducer`），可以讓後續在使用 `useSelector` 取值時，程式碼更具備可讀性。

## TypeScript 與 RootState 的自動感應

對於進階開發者來說，最令人驚艷的不是自動合併，而是 RTK 搭配 TypeScript 時產生的型別推導能力。

在之前的課程中，我們學過這兩行關鍵的型別定義：

```typescript
// 從 store 實例本身推導型別
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

這背後的運作邏輯非常精妙：

1. `configureStore` 接收了你的 `reducer` 物件。
2. 它根據物件的 Keys（`counter`, `todos`）和 Values（各自 Reducer 回傳的狀態型別）計算出整個 Store 的完整型別結構。
3. `ReturnType<typeof store.getState>` 捕捉了這個結構。

這意味著，**當你在 **`**reducer**`** 物件中新增一個新的 Slice 時，你的 **`**RootState**`** 型別會自動更新**。你不需要手動去維護一個巨大的全域 Interface。

例如，如果你新增了一個 `auth` 模組：

```typescript
// 只要在這裡加上一行
reducer: {
  counter: counterReducer,
  todos: todoReducer,
  auth: authReducer, // 新增的
}
```

現在，當你在 React 元件中使用 `useAppSelector(state => state.auth)` 時，TypeScript 會立即知道 `state.auth` 的存在，並且能提供完整的自動完成（Auto-complete）功能。這種「型別安全隨實作同步」的特性，是大型專案能夠穩定開發的基石。

## 對比：傳統 Redux 的繁瑣之處

為了讓你體會 RTK 的優勢，我們簡短回顧一下在沒有 RTK 的年代，開發者需要做什麼：

1. 必須從 `redux` 套件手動匯入 `combineReducers`。
2. 必須顯式建立一個 `rootReducer`：
  ```javascript
const rootReducer = combineReducers({
  counter: counterReducer,
  todos: todoReducer
});
```
3. 再將 `rootReducer` 傳入 `createStore`。
4. 如果你使用 TypeScript，你通常還要手動寫一個 `interface RootState` 並確保它跟 `combineReducers` 的結構一模一樣。一旦漏掉一個或改了名字，型別系統就會失效。

RTK 的「隱式合併（Implicit Combination）」將這些步驟合併為一，不僅減少了樣板程式碼（Boilerplate），更重要的是它確保了 **Store 的實作**與**型別定義**永遠保持同步。

## 透過 Redux DevTools 觀察結構

如果你現在打開瀏覽器並啟動 Redux DevTools，你會在 "State" 標籤頁看到一個清晰的樹狀結構。

*[圖片未匯出: None]*

*(註：此處為示意描述，不提供圖片)*

在 DevTools 中，你會看到根層級有 `counter` 和 `todos` 兩個分支。這驗證了我們在 `configureStore` 中定義的 Key 名稱直接對應到狀態樹的頂層。當你發送一個 action（例如 `todos/addTodo`）時，你會觀察到只有 `todos` 那個分支發生了變化，而 `counter` 分支保持不變（保持 Referential Equality），這也是為什麼 `useSelector` 能夠精確控制元件重新渲染的原因。

## 為什麼要堅持「一項功能一個 Slice」？

你可能會問：「我能不能把所有東西都寫在一個 Slice 裡，然後在 `initialState` 裡面分層就好？」

雖然技術上可行，但這樣做會破壞 Redux 的擴展性：

- **程式碼規模**：單一檔案會變得極其龐大（數千行），難以閱讀。
- **協作難度**：多位開發者同時修改同一個檔案容易產生衝突。
- **測試難度**：當 Reducer 邏輯過於耦合，你很難針對單一功能撰寫單元測試。

透過 `configureStore` 的物件結構進行合併，我們實現了真正的「模組化」。每個 Feature 都在自己的資料夾內，擁有自己的邏輯、型別與 Action，而 `store.ts` 則像是一個總機，只負責把這些模組插上正確的插槽。

## 命名空間的最佳實踐

在設定命名空間時，有幾個建議可以讓你的專案更專業：

1. **Key 名稱應為複數或名詞**：通常建議使用 `todos` 而非 `todoSlice`。因為在元件中我們會寫 `state.todos`，這讀起來更像是在描述資料，而不是在描述程式碼結構。
2. **保持結構扁平**：雖然 `combineReducers` 可以嵌套（Reducer 裡面還有 Reducer），但除非專案規模極大（例如有數十個子模組的儀表板），否則一律建議保持一層級的合併。這會讓 Selector 的邏輯簡單許多。
3. **一致性**：如果你的資料夾名稱是 `features/auth`，那麼 Store 中的 Key 建議也叫 `auth`。

## 從結構到取值：邁向下一步

理解了多 Slice 如何在 Store 中共存以及它們如何建立命名空間後，你已經掌握了 Redux 大型應用的架構基礎。現在，全域 State 樹已經從一棵小樹苗成長為擁有不同分枝（命名空間）的大樹。

當資料結構變得複雜，如何從這些特定的分枝中「精確」且「高效」地提取資料就成了下一個挑戰。在下一單元中，我們將探討如何設計具備 **Colocate（同地協作）** 特性的 Selector 函數，這將會是你維持專案整潔、提升 React 效能的關鍵利器。

### 重點回顧

- `configureStore` 的 `reducer` 參數若是物件，會自動呼叫 `combineReducers` 進行合併。
- 物件中的 Key 名稱定義了全域 State 的命名空間（Namespace）。
- 每個 Slice 只需要維護自己的局部狀態，互不干擾。
- `ReturnType<typeof store.getState>` 會自動感應新增的命名空間，維持型別安全。
- 透過 Redux DevTools 可以清楚觀察到多個命名空間並排存在的狀態樹結構。

理解了多個 Slice 的組合與管理後，我們接下來將深入探討如何設計高品質的 Selector 函數。這不僅能讓你的元件代碼更乾淨，還能避免不必要的重新渲染問題。
