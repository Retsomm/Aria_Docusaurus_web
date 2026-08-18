---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 19 堂：Hooks 底層收尾

# Lesson 19 note

本次課程完整收尾了 Topic 10，深入探討了 useReducer 的底層環形鏈結串列機制與狀態機思維，並學習了如何透過自訂 Hook 封裝複雜邏輯與副作用。透過最後的總結複習，將 Hooks 的鏈結串列結構、閉包陷阱與參考型別等核心概念串聯起來，建立了完整的知識體系。

### [useReducer 底層邏輯](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/421190a0-1d30-4c03-b75c-db1d5054d229)

- useState 本質上是 useReducer 的語法糖
  - 底層透過 `basicStateReducer` 來處理更新，這解釋了為什麼 `setCount` 既能接收值也能接收函數。
- 狀態更新的底層機制：環形鏈結串列（Circular Linked List）
  - `mountReducer` 階段會建立 `hook.queue`，並採用環形鏈結串列結構儲存 pending 的 actions。
- `updateReducer` 階段會遍歷這個佇列，依序計算狀態演進（State A -> State B -> Final State），保證更新的順序性與完整性。
- dispatch 函數的穩定性
  - dispatch 透過閉包捕獲了 Fiber 節點與 queue 引用，因此在組件整個生命週期中參考不變，適合向下傳遞給子組件而不觸發額外渲染。
- 從數據驅動轉向「意圖驅動」的狀態機思維
  - 將「如何更新」的邏輯從 UI 抽離至 Reducer 純函數中，避免分散的 `useState` 導致非法狀態組合，提升程式碼的可測試性與解耦程度。

### [自訂 Hook 設計](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/499cc85a-f988-4a65-b4db-76de0ef558a0)

- 自訂 Hook 的物理本質：普通函數 + Hooks 規則 + 邏輯封裝
  - 它並非 React 內建的硬編碼功能，而是利用函數封裝來達成邏輯複用。
- 底層結構的「扁平化」展開
  - 在 Fiber 節點眼中，自訂 Hook 內部的 Hooks 會按順序展開並鏈結在該組件的 `memoizedState` 串列中，這也是為什麼自訂 Hook 內部也必須遵守不可在條件式中呼叫的規則。
- 狀態與副作用的抽象模式
  - 狀態抽象（如 `useInput`）：捕獲變數變更過程，讓 UI 組件變「笨」，專注於展示。
- 副作用抽象（如 `useFetch`）：封裝複雜的清理（Cleanup）與邊界處理邏輯，讓組件不需關心實作細節。
- 設計最佳實踐
  - 返回值設計：簡單通用邏輯用「陣列解構」；複雜且具多屬性的邏輯優先使用「物件解構」以利後續擴充。
- 封裝時機：當出現邏輯複用、複雜度過高需隔離或有獨立測試需求時，就是抽離 Hook 的黃金信號。

## Q&A

- **Q:** 在同一個組件中呼叫兩次同一個自訂 Hook（例如兩個計時器），React 如何確保它們的狀態不會互相干擾？
  - **關鍵在於 Fiber 節點內部的「鏈結串列」與「指針」機制。**
- 自訂 Hook 在執行時會被「扁平化」展開。當程式碼執行到第二次呼叫時，React 內部的指針會向後移動，在該 Fiber 節點的 Hooks 鏈結串列中依序建立全新的 Hook 物件。
- 因為它們在記憶體中佔據的是鏈結串列上不同的位址，所以各自擁有的 state 是完全獨立的。
- **Q:** 為什麼 `useRef` 能夠避開 useEffect 或 setTimeout 中常見的「過時閉包（Stale Closure）」問題？
  - **這是利用了 JavaScript 中「參考型別（Reference Type）」與「地址捕獲」的特性。**
- 基本型別（如數字）在閉包形成時捕獲的是「值的快照」，因此會困在過去。
- `useRef` 回傳的是一個物件，閉包捕獲的是該物件的「記憶體地址」。無論經過多久，只要透過該地址讀取內部屬性（`current`），就能獲取到該物件當前最新的值。
- **Q:** 為了讓 `useReducer` 完美模擬 `useState` 的行為，`basicStateReducer` 內部該如何實作？
  - **核心邏輯在於對 action 型別的判斷。**
- 實作方式為：`function basicStateReducer(state, action) { return typeof action === 'function' ? action(state) : action; }`。
- 這樣就能同時相容直接傳入新值或傳入一個更新函數（updater function）的兩種常見用法。
