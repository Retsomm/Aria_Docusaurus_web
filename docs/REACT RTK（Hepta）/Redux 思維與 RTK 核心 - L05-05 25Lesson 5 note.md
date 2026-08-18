---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 5 堂：多個 Slice 組合管理

# 25Lesson 5 note

這堂課聚焦於 Redux Toolkit 的多 Slice 架構，學習如何透過 `configureStore` 自動合併多個 reducer 並建立獨立命名空間，以及如何設計具備型別安全與效能優化（Memoization）的 Selector。透過從零實作 Todo List 並與 Counter 整合，建立完整的大型狀態管理思維。

### [combineReducers 與命名空間](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/0beb9323-546c-4daa-8d45-3d27d64ac8a9)

- **configureStore 的隱式合併機制**：當 `reducer` 配置項接收一個物件時，RTK 會自動呼叫 `combineReducers`，不再需要手動處理合併邏輯。
- **命名空間（Namespace）的建立**：物件中的鍵（Key）直接決定全域 State 樹的結構。例如 `reducer: { counter: counterReducer }` 會讓狀態存在於 `state.counter`。
  - 命名空間能有效隔離邏輯，避免不同 Slice 之間的屬性（如 `loading` 或 `error`）產生命名衝突。
- **RootState 的型別推導**：利用 `ReturnType<typeof store.getState>`，TypeScript 能自動感應新增的 Slice 結構，確保開發時擁有準確的自動完成與型別檢查。

### [Selector 設計模式](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/04c04714-2548-450e-a2bb-72828e9258e7)

- **Colocate（同地協作）模式**：主張將 Selector 函數定義在該 Slice 檔案中。這建立了 UI 與資料之間的「抽象介面」，當狀態結構改變時，只需修改 Slice 處，不需更動元件。
- **命名慣例與語意化**：遵循 `selectXxx` 的命名方式（如 `selectCount`），提升程式碼的可讀性，使其讀起來像自然的英文句子。
- **Memoized Selector 的必要性**：`useSelector` 依賴「嚴格相等比較（===）」。若 Selector 內使用了 `.filter()` 或 `.map()` 等會回傳新引用操作，會導致每次 dispatch 任何 action 時元件都強迫重新渲染。
  - 使用 `createSelector` (Reselect) 建立具備緩存能力的選擇器，只有當輸入參數變動時才會重新計算，維持引用不變以優化效能。

### [建立 Todo List Slice](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/9acec584-c7e8-47ab-b12a-4be7fb38623f)

- **強型別資料模型**：優先定義 `interface`（如 `Todo` 與 `TodoState`），為後續開發提供精準的型別保障。
- **nanoid 與 prepare callback**：在 Action 發送前生成唯一 ID。這確保了 Reducer 保持「純函數」特性（不含亂數副作用），並簡化了 UI 層呼叫 `dispatch` 的參數。
- **Immer 機制的實作**：在 Reducer 內可以直接對陣列執行 `push` 或對物件屬性賦值（如 `todo.completed = !todo.completed`），RTK 會在底層安全地轉換為不可變更新。
- **衍生資料（Derived Data）的計算**：不要將「能算出來的資料」（如已完成總數）存入 Store。應透過 `createSelector` 動態計算，保持 Store 的精簡。

### [Counter + Todo 整合實作](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/78f5e9eb-2689-47db-80a3-52dda29fe76d)

- **Store 的多模組註冊**：將 `counterReducer` 與 `todoReducer` 同時放入 `store.ts`。驗證兩個獨立模組如何共存於單一事實來源中。
- **狀態存放位置的判斷**：
  - **Local State**：僅限單一元件使用的臨時狀態（如輸入框文字）應留在 `useState`。
- **Global State**：需要跨元件共享或持久化的數據（如代辦清單）才存入 Redux。
- **精確的狀態訂閱與效能**：理解 Redux 透過「命名空間」實現的隔離。當更新 Counter 時，因為 Todo 列表的參照未變，`useSelector` 會跳過 Todo 元件的重新渲染，這是處理大型應用程式高性能的關鍵。

## Q&A

- **Q:** 為什麼在 Slice 中匯入 `RootState` 時建議使用 `import type`？
  - **關鍵實現：** 這是為了解決 **Circular Dependency（循環依賴）** 的問題。`store.ts` 需要匯入各 Slice 的 reducer，而 Slice 又需要從 `store.ts` 匯出 `RootState` 型別。使用 `import type` 告訴編譯器這僅用於型別檢查，不會產生實體的 JS 匯入代碼，從而避免執行期錯誤。
- **Q:** `createSelector` 在某些情況下型別推導會失效，該如何處理？
  - **關鍵實現：** 當自動推導無法正確識別輸出函數的參數時，可以手動標註型別（例如 `(todos: Todo[]) => ...`）。這能提供最穩定的型別保障，特別是在複雜專案中能避免 `any` 的出現。
- **Q:** 命名空間的路徑（例如 `state.todos`）是由什麼決定的？
  - **關鍵實現：** **完全由 **`**store.ts**`** 中傳給 **`**reducer**`** 物件的 Key 決定。** 即使 Slice 的 `name` 是 `todoSlice`，如果在 `store.ts` 寫成 `reducer: { list: todoReducer }`，存取路徑就會變成 `state.list`。這確保了 Store 結構的最終控制權是在整合層。
