---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 4 堂：React 元件整合 Redux

# 16useSelector 深入解析

在上一章節中，我們已經成功地在專案中配置了 Redux Store，並使用 `createSlice` 定義了 `counterSlice` 的邏輯。然而，即便「大腦」（Store）已經具備了處理資料的能力，如果「身體」（React 元件）無法感知到狀態的變化，那麼這套系統依然是靜止的。

在傳統的 Redux 中，我們可能需要處理複雜的 `connect` 高階元件（HOC）與 `mapStateToProps`；但在現代的 Redux Toolkit（RTK）時代，我們擁有更直覺、更強大的 Hook —— `useSelector`。

這不僅僅是一個讀取資料的 API，它是 React 與 Redux 之間最重要的「訂閱機制」。理解它的運作機制，是寫出高效能 React 應用程式的關鍵。

## 從訂閱者模式理解 useSelector

想像一下，Redux Store 是一個全球性的新聞中心，裡面儲存了無數的資訊。你的 React 元件就像是一個讀者，它並不關心新聞中心裡所有的雜訊，它只關心特定的主題（例如：目前的計數值）。

`useSelector` 的本質就是一個**訂閱者（Subscriber）**。當你呼叫它時，你傳入了一個函數（我們稱為 Selector Function），這個函數告訴 Redux：「請從整個 State 樹中，幫我取出這一段資料。」

### 基本語法與 TypeScript 型別

讓我們看看在 TypeScript 環境下，一個標準的 `useSelector` 是如何撰寫的：

```typescript
import { useSelector } from 'react-redux';
// 假設我們已經從 store.ts 匯出了 RootState 型別
import { RootState } from '../app/store';

const CounterDisplay = () => {
  // 這裡的 state 會被自動推斷為 RootState
  const count = useSelector((state: RootState) => state.counter.value);

  return <h1>當前數值：{count}</h1>;
};
```

在這段程式碼中，`(state: RootState) => state.counter.value` 就是 Selector 函數。

**為什麼需要 RootState 型別？**
這是為了確保型別安全。如果沒有 `RootState`，TypeScript 無法知道 `state` 裡面到底有哪些 Slice（例如 `counter` 或 `todos`）。透過傳入這個型別，你在撰寫 `state.` 的時候，編輯器能精準地提供自動補完，並在路徑錯誤時即時報錯。

## useSelector 的運作機制：它是如何監聽變化的？

這是一個常見的面試問題，也是開發者必須掌握的底層邏輯：**當 Store 的狀態改變時，**`**useSelector**`** 做了什麼？**

當任何一個 Action 被 Dispatch 到 Store 並經過 Reducer 產生新的 State 後，Redux Store 會通知所有訂閱了它的元件。此時，`useSelector` 會執行以下步驟：

1. **重新執行 Selector 函數**：它會拿著「最新的全域 State」重新跑一遍你傳入的 `(state) => ...` 函數。
2. **獲取回傳值**：得到一個新的結果。
3. **進行比較（Comparison）**：這是最關鍵的一步。`useSelector` 會將「這一次算出來的結果」與「上一次儲存的結果」進行比較。
4. **決定是否重新渲染（Re-render）**：
  - 如果兩者**相同**，`useSelector` 會攔截這次更新，元件**不會**重新渲染。
- 如果兩者**不同**，元件就會觸發 Re-render，確保 UI 顯示最新資料。

這個機制非常優雅，因為它讓元件只需要關注自己「選取」的那部分資料。即使 Store 的其他部分（例如 `todos` 列表）發生了變化，只要 `state.counter.value` 沒變，`CounterDisplay` 元件就不會浪費效能去重新渲染。

## 嚴格相等比較（Strict Equality Comparison）

剛才提到了「比較」，但 `useSelector` 是如何比較的呢？

預設情況下，`useSelector` 使用的是 JavaScript 的 **嚴格相等比較（**`**===**`**）**。這對於基本型別（如 `number`, `string`, `boolean`）來說非常完美：

```javascript
const a = 10;
const b = 10;
console.log(a === b); // true，不會觸發渲染
```

然而，當你的 Selector 回傳的是**物件（Object）**或**陣列（Array）**時，問題就來了。

### 效能陷阱：回傳新物件的代價

請看下面這個看似無害的寫法：

```typescript
// ❌ 潛在的效能陷阱
const counterInfo = useSelector((state: RootState) => {
  return {
    currentValue: state.counter.value,
    isNegative: state.counter.value < 0
  };
});
```

這段程式碼會導致**元件在每次 Store 發生任何變動時都重新渲染**。為什麼？

因為在 JavaScript 中，`{}` 永遠是一個新的引用（Reference）。即使 `state.counter.value` 完全沒有改變，每次 `useSelector` 執行這段函數時，它都會回傳一個全新的物件字面量。

根據 `===` 比較規則：
`{ value: 10 } === { value: 10 }` 的結果是 **`false`**。

由於 `useSelector` 認為「結果變了」，它就會強制要求元件重新渲染。在大型應用程式中，這會造成嚴重的效能損耗。

## 最佳實踐：如何優化選擇器？

為了避免不必要的重新渲染，我們有幾種標準的處理方式。

### 1. 拆分為多個 useSelector（推薦）

這是最簡單也最有效的做法。與其回傳一個大物件，不如多次呼叫 `useSelector` 讀取原始值（Primitive Values）：

```typescript
// ✅ 最佳實踐：拆分讀取
const count = useSelector((state: RootState) => state.counter.value);
const isNegative = useSelector((state: RootState) => state.counter.value < 0);
```

由於這兩個呼叫回傳的是 `number` 和 `boolean`，只要數值沒變，`===` 比較就會回傳 `true`，從而成功阻止不必要的渲染。

### 2. 使用 shallowEqual 進行淺比較

如果你堅持要回傳一個物件（例如該物件包含多個欄位且邏輯上緊密結合），你可以傳入 `react-redux` 提供的第二個參數：`shallowEqual`。

```typescript
import { useSelector, shallowEqual } from 'react-redux';

const counterInfo = useSelector((state: RootState) => ({
  currentValue: state.counter.value,
  isNegative: state.counter.value < 0
}), shallowEqual); // 👈 使用淺比較
```

`shallowEqual` 會遍歷物件的每個 key，檢查它們的值是否相等。在上面的例子中，它會比較 `currentValue` 是否相等、`isNegative` 是否相等。如果所有屬性都沒變，即便物件引用不同，它也會認為「沒有變化」，不觸發重新渲染。

### 3. 在 Selector 外部處理邏輯

有時我們會在 Selector 內部進行複雜的運算（如 `filter` 或 `map`）。請記住，這些方法都會回傳新陣列，導致重複渲染。

**錯誤範例：**

```typescript
// ❌ 每次都會產生新陣列
const activeTodos = useSelector((state: RootState) => 
  state.todos.items.filter(t => !t.completed)
);
```

**改進方案：**

- 考慮將過濾邏輯移出元件。
- 使用 `reselect` 函式庫建立帶有快取功能的 Memoized Selectors（這在後續主題 5 會深入探討）。

## 總結 selector 撰寫原則

為了確保你的應用程式跑得跟 Vite 一樣快，請遵循以下原則：

1. **越小越好**：盡量選取最小單位的資料（原始型別）。
2. **保持純粹**：Selector 應該是純函數，不要在裡面修改資料或進行副作用。
3. **避免現場構造物件**：除非搭配 `shallowEqual`，否則不要在 selector 中直接 return 一個新的 `{}` 或 `[]`。
4. **集中管理**：隨著專案變大，建議將常用的 selector 函數定義在 Slice 檔案中並匯出，這樣可以提高程式碼的重用性（例如匯出 `export const selectCount = (state: RootState) => state.counter.value`）。

## 知識銜接

在這一部分中，我們深入剖析了 `useSelector` 的訂閱與比較機制，並學會了如何透過「拆分 Hook」與「避免回傳新引用」來優化效能。

回想一下，Aria 你之前已經在 VSCode 中完成了 `counterSlice` 的邏輯撰寫。現在，你已經知道如何讓元件從 Store 中「讀取」這些數值並顯示在畫面上了。

但這只是單向的資料流——從 Store 到 UI。要讓這個計數器動起來，我們還需要另一半的拼圖：**如何從 UI 發送指令給 Store？** 這就是我們下一部分要探討的主題：`useDispatch` 與 Action 的發送。

## 核心重點總結

- **useSelector** 是 React 元件訂閱 Redux Store 的主要方式。
- 它接收一個 **Selector 函數**，並傳入全域的 `state` 作為參數。
- 運作機制包含：執行 Selector  獲取結果 -> **嚴格相等比較 (**`**===**`**)** -> 決定是否渲染。
- 回傳**物件字面量或陣列**會導致每次都重新渲染，除非使用 `shallowEqual`。
- **最佳實踐**是將一個大型的選擇器拆分為多個小的 `useSelector` 呼叫。

這套機制換取了極高的可預測性。當你在 DevTools 中看到狀態變更時，你可以確信只有真正用到該資料的元件才會更新，這正是大型 React 應用程式維持流暢的秘訣。下個部分，我們將學習如何「打破」靜態的狀態，讓資料流動起來。
