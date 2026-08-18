---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 4 堂：React 元件整合 Redux

# 20Lesson 4 note

本堂課深入學習如何在 React 元件中與 Redux Store 進行通訊，涵蓋了資料的讀取（useSelector）、指令的發送（useDispatch），以及如何建立 TypeScript 型別安全的自訂 Hooks，最終整合出一個完整的 Counter App。

### [useSelector 深入解析](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/0a0c4ccb-498c-4d92-b0b6-b53c7c28d5cd)

- `useSelector` 是 React 與 Redux 之間的「訂閱機制」，讓元件能從全域 State 中選取特定資料。
- **運作機制與 re-render 原理**：
  - 每當 Store 變更時，`useSelector` 會重新執行 Selector 函數並獲取結果。
- 預設使用 **嚴格相等比較 (===)**：將新結果與上一次結果對比，若不同則觸發元件重新渲染。
- **效能陷阱：回傳新物件/陣列**：
  - 在 Selector 內寫 `state => ({ value: state.counter.value })` 會導致元件在每次 Store 變動時都重繪，因為物件字面量 `{}` 每次都會產生新的引用位址。
- **最佳實踐**：
  - **拆分讀取**：多次呼叫 `useSelector` 選取原始型別（number, string 等）。
- **淺比較**：若必須回傳物件，可搭配 `shallowEqual` 作為第二個參數。
- **集中管理**：建議將 Selector 函數定義在 Slice 檔案中以便重用。

### [useDispatch 發送 Action](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/e2421124-6a2f-41c0-b528-fefcd6c6a635)

- `useDispatch` 扮演「傳令兵」角色，負責將元件的意圖（Action）傳遞給 Reducer。
- **正確呼叫方式**：
  - 必須呼叫 Action Creator 的執行結果，例如 `dispatch(increment())` 而非僅傳入函數名。
- **Payload 的傳遞**：
  - Action Creator 接受參數後，RTK 會自動將其封裝成 `action.payload`，讓 Reducer 能存取 UI 傳入的具體數值。
- **單向資料流閉環**：
  - 觸發事件 -> Dispatch Action -> Reducer 計算新 State -> Store 更新 -> Selector 偵測變化 -> UI 重新渲染。
- `dispatch` 函數在元件生命週期中是穩定的，放入 `useEffect` 的依賴陣列中不會引發額外的執行。

### [型別安全 Typed Hooks](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/8addbef4-72c2-41d2-8ea0-86b405ccc925)

- **建立自訂 Hooks 的必要性**：
  - 原始的 `useSelector` 不具備 App 的 State 結構資訊，導致開發時缺乏自動補完。
- `useAppSelector` 與 `useAppDispatch` 能提供「一次設定，終身受益」的開發體驗。
- **核心型別推導**：
  - `RootState`：透過 `ReturnType<typeof store.getState>` 自動推導全域狀態結構。
- `AppDispatch`：透過 `typeof store.dispatch` 捕捉包含 Middleware 能力的 Dispatch 型別。
- **解決循環依賴**：
  - 在 `hooks.ts` 中使用 `import type` 引入 Store 型別。這在編譯後會被移除，確保檔案間只有型別連結而無執行期依賴。

### [Counter App 完整整合](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/dc9803b1-f3a1-44da-94f7-30dd77d67785)

- **專案結構慣例**：採用 Feature-based logic，將 `store.ts` 與 `hooks.ts` 放在 `app/` 目錄，各功能邏輯放在 `features/`。
- **Local State 與 Global State 的邊界**：
  - 輸入框中的「過程資料」（正在輸入的字串）應保留在元件內部的 `useState`。
- 只有在使用者確認送出（點擊按鈕）時，才將結果 `dispatch` 給 Redux。
- **開發者工具驗證**：
  - 透過 Redux DevTools 觀察 Action 序列（例如 `counter/increment`）與 Payload 內容，利用「時光旅行」功能調試狀態。

## Q&A

- **Q:** 假設我在元件寫 `const productCount = useAppSelector(state => ({ count: state.products.items.length }))`，當我刪除一個完全不相關的「使用者通知」時，該元件會重新渲染嗎？
  - 元件 **會重新渲染**。這是關鍵的效能細節，原因在於物件字面量 `{}` 的性質。
- 雖然 `length` 的數值沒變，但每次執行 Selector 產生的新物件在記憶體位址上與前一個不同。
- `useSelector` 的嚴格相等比較（===）會判定為「資料已變更」，進而強制觸發重新渲染。
- **Q:** 在 `dispatch(toggleTodo(5))` 中，`toggleTodo` 的角色是什麼？而數字 `5` 在 Reducer 內部會如何被存取？
  - `toggleTodo` 是一個 **Action Creator (Action 生成器)**。它是一個工廠函數，負責製造出符合 Redux 規範的 Action 物件。
- 數字 `5` 是 **Payload (負載)**。在 Reducer 內部，它是透過 `action.payload` 被存取的。RTK 會自動將傳入生成器的參數包裝進 `payload` 屬性中。
- **Q:** 為什麼要特地封裝 `useAppSelector`？它內部「記住」了什麼型別？
  - 因為原始的 `useSelector` 是通用泛型，它不知道具體的 Store 地圖長什麼樣子。若直接使用，每次都必須手動標註 `(state: RootState)`，既冗餘又容易出錯。
- `useAppSelector` 內部預先綁定了 `**RootState**` 型別。這讓開發者在元件內輸入 `state.` 時，VSCode 能精準彈出所有 Slice（如 `counter`、`auth`）的自動補全建議。
