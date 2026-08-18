---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 3 堂：createSlice 核心機制與型別實作

# 15Lesson 3 note

本課深入探討 Redux Toolkit 的核心 API：`createSlice`。學習如何透過 `name`、`initialState` 與 `reducers` 定義功能模組，並理解 RTK 如何整合 Immer 簡化不可變狀態更新，最後結合 TypeScript 實作具備型別安全的 Counter Slice。

### [createSlice 三大要素](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/d66883d1-0330-44f9-ad3c-b80f0c621790)

- **name (命名空間)**：定義 Slice 的名稱，作為自動生成的 Action Type 前綴（例如 `counter/increment`），有效避免大型專案中的命名衝突。
- **initialState (初始狀態)**：定義該模組啟動時的資料結構。在 TypeScript 中，它是型別推導的核心來源，決定了後續狀態操作的安全性。
- **reducers (邏輯處理器)**：一個物件，其 Key 為動作名稱，Value 為處理狀態更新的 Case Reducer。這將傳統冗長的 `switch-case` 結構簡化為直觀的函式集合。

### [自動生成的 Action 機制](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/44760134-977e-4747-8018-35f7416a2b9b)

- **Action Creators 自動化**：RTK 會根據 `reducers` 物件中的 Key，自動在 `slice.actions` 中生成同名的 Action Creator 函式，免去手寫字串常數的體力活。
- **Action Type 組合公式**：生成的 Type 遵循 `name / reducerKey` 規則。這種「所見即所得」的設計確保了 Action 發送者與接收者的契約一致。
- **Ducks Pattern 實務**：推薦在 Slice 檔案中透過解構語法「具名匯出 (Named Export)」Actions，並「預設匯出 (Default Export)」Reducer，將功能模組化以利維護。

### [Immer 與不可變性魔法](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/89c90e90-a3e3-4f3d-a543-970750e03df7)

- **解決擴展運算子地獄**：傳統 Redux 更新深層嵌套狀態需層層展開（`...state`），Immer 讓開發者能用直覺的「直接修改」語法（如 `state.value += 1`）達成目的。
- **Draft State (草稿機制)**：Immer 透過 JavaScript `Proxy` 攔截修改動作並記錄在「草稿」上，最後自動產出一份全新的不可變狀態物件。
- **結構共享 (Structural Sharing)**：Immer 只會針對有變動的路徑建立新節點，未變動部分共用記憶體位置，兼顧開發直覺與高效能。
- **使用禁忌**：在 Reducer 中不可對 `state` 變數直接重新賦值（例如 `state = []`），因為這會破壞 Proxy 的攔截連結；若要替換整個狀態，應使用 `return`。

### [TypeScript 型別整合實務](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/71f49e55-4af0-4135-bda2-4e157a08c6f8)

- **定義 State Interface**：手動定義介面能精確處理「聯集型別 (Union Types)」或「可選屬性」，作為該 Slice 的單一事實來源。
- **PayloadAction<T> 泛型**：用於約束 `action.payload` 的資料型別。若 Dispatch 時傳入錯誤型別，TypeScript 會在編譯時期（元件端）立即報錯。
- **反向推導機制**：一旦定義了 `initialState` 的型別，Reducer 內部的 `state` 參數與外部生成的 Action Creators 都會自動獲得正確的型別補完，達到「定義一次，處處受益」。

### [實作練習：Counter Slice](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/515eabaa-df62-4e85-855c-cee656d8ed48)

- **模組化開發流**：從定義 `CounterState` 介面開始，接著使用 `createSlice` 實作 `increment`、`decrement` 與帶有參數的 `incrementByAmount`。
- **型別防禦實踐**：在 `incrementByAmount` 中套用 `PayloadAction<number>`，確保計數器的增加量永遠是數字，從源頭杜絕邏輯錯誤。
- **檔案組織**：將型別、初始值、邏輯與匯出整合在 `counterSlice.ts` 中，建立一個符合專業工程標準的功能薄片 (Slice)。

### [Review](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/d9472e3a-6750-48e0-a7ec-f3316e14798a)

- 鞏固 `createSlice` 的運作邏輯：理解 `name` 決定 Action Type，`initialState` 決定數據模型，而 `reducers` 則在 Immer 的保護下執行狀態轉換。

## Q&A

- **Q:** 什麼是 Ducks Pattern？
  - **核心實現：** 將 Action Types、Action Creators 與 Reducer 封裝在同一個模組檔案中，而非分散在多個檔案。
- **為什麼重要：** 減少在不同檔案間切換的開發痛點（垂直開發痛點），使功能模組易於移植與維護，非常適合 RTK 的 `createSlice` 架構。
- **Q:** 為什麼在 Reducer 中執行 `state = []` 無法清空資料？
  - **關鍵實現：** `state` 參數在 RTK 中是一個 Proxy 代理物件，直接對變數重新賦值只會改變該區域變數的指向，無法被代理器攔截到屬性的變動。
- **正確作法：** 應修改其屬性（如 `state.items = []`）或直接回傳新狀態（`return []`），讓 Immer 知道如何產出最終結果。
- **Q:** TypeScript 的型別保護是如何從 Slice 傳遞到遠端 React 元件的？
  - **核心實現：** **Action Creator 扮演了型別橋樑的角色**。
- **為什麼重要：** 因為 Action Creator 在 Slice 中定義時已標記為 `PayloadAction<T>`，當它被匯出並在元件中引用時，會帶著型別約束。這確保了從定義端到呼叫端的型別安全，達成單一事實來源。
