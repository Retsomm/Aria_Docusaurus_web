---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 4 堂：React 元件整合 Redux

# 18型別安全 Typed Hooks

想像一下，你正在開發一個擁有數十個 Slice、上百個狀態屬性的大型專案。每當你需要從 Store 讀取資料時，你都必須手動輸入 `useSelector((state: RootState) => state.auth.user)`。如果你不小心忘了寫 `: RootState`，TypeScript 會立刻對著你尖叫，因為它不知道 `state` 到底長什麼樣子。

更糟的是 `useDispatch`。預設的 `dispatch` 函數在型別定義上非常保守，它往往無法辨識出非同步的 Thunk Action 或者某些複雜的 Middleware 擴充。這導致你在發送 Action 時，雖然程式碼能跑，但開發工具（如 VSCode）卻無法給你精準的自動補全建議。這種「型別摩擦力」不僅降低了開發效率，也增加了出錯的風險。

有沒有一種方法，可以讓我們「一次設定，終身受益」，讓 `useSelector` 永遠知道 State 的結構，讓 `useDispatch` 永遠知道它可以接收什麼樣的 Action？這就是我們今天要探討的核心：建立型別安全的自定義 Hooks。

## 為什麼預設的 Hooks 不夠好？

在深入實作之前，我們必須先理解問題的根源。Redux 本身是一個獨立於框架的庫，而 `react-redux` 提供的 Hooks 則是通用的介面。

### 1. useSelector 的重複性與脆弱性

`useSelector` 本身是一個泛型函數，但它不知道你的 Store 具體長什麼樣子。如果你直接使用它：

```typescript
// ❌ 每次都要手動匯入 RootState 並宣告型別
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

const user = useSelector((state: RootState) => state.auth.user);
```

這產生了兩個問題：

- **冗餘（Redundancy）**：在大型專案中，你可能會有數百處用到 `useSelector` 的地方，每次都要手動標註 `RootState` 是極大的體力活。
- **維護成本**：如果未來你決定更換狀態管理的架構，你需要修改每一處的型別標註。

### 2. useDispatch 的型別缺失

這是最容易被忽視的痛點。在 Redux Toolkit 中，我們經常會用到非同步邏輯（Thunks）。預設的 `useDispatch` 回傳的型別是 `Dispatch`，它僅能理解基本的 Action 物件。

當你嘗試發送一個 Thunk 時，TypeScript 可能會報錯，說 `AppDispatch` 的型別不相容。你可能被迫寫出 `dispatch(fetchUserById(1) as any)` 這種代碼來規避檢查，但這完全違背了使用 TypeScript 的初衷。

為了縮短「開發者的意圖」與「型別系統的理解」之間的差距，我們需要建立一個專屬的型別層。

## 第一步：從 Store 提取核心型別

在 Redux 的世界裡，Store 是唯一的真理來源（Single Source of Truth）。因此，我們的型別定義也應該從 Store 實例中自動推導出來，而不是手動撰寫 Interface。這樣當我們增加新的 Slice 時，型別系統會自動同步。

請打開你的 `src/app/store.ts`：

```typescript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // 假設未來有更多 reducer...
  },
});

// 💡 關鍵步驟：從 store 本身推導出型別
// 1. 推導出全域狀態的型別 RootState
export type RootState = ReturnType<typeof store.getState>;

// 2. 推導出 Dispatch 的型別 AppDispatch
export type AppDispatch = typeof store.dispatch;
```

這裡使用了 TypeScript 的兩個強大特性：

- `typeof store.getState`：獲取 `getState` 這個函數的簽章。
- `ReturnType<T>`：這是一個內建的工具型別，它會抓取該函數回傳值的型別。既然 `getState()` 回傳的是整個 Store 的狀態，那麼 `RootState` 就會精準地對應到我們在 `reducer` 物件中定義的所有結構。
- `typeof store.dispatch`：這會抓取包含所有 Middleware（如 Thunk）處理能力後的 dispatch 函數型別。

## 第二步：定義 Typed Hooks

有了型別之後，我們要在一個獨立的檔案中建立自定義的 Hooks。通常我們會建議放在 `src/app/hooks.ts`。

這裡我們不直接使用 `useSelector` 和 `useDispatch`，而是匯出經過型別強化的版本：`useAppSelector` 與 `useAppDispatch`。

```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// 在整個應用程式中，使用這兩個 Hooks 代替原始的 useDispatch 與 useSelector

// 1. 強化版的 useDispatch
// 使用 .withTypes<T>() 是 RTK 2.0+ 的推薦寫法
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// 2. 強化版的 useSelector
// 我們需要定義它的型別為 TypedUseSelectorHook<RootState>
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 為什麼要這樣寫？

1. **`useAppDispatch`**：
在早期的寫法中，我們通常寫成 `export const useAppDispatch = () => useDispatch<AppDispatch>()`。但在 Redux Toolkit 2.0 之後，官方提供了 `.withTypes<AppDispatch>()` 這個靜態方法，它能更優雅地預先注入型別，避免在每個元件中重複執行泛型宣告。
2. **`useAppSelector`**：
`TypedUseSelectorHook` 是 `react-redux` 提供的一個工具介面。當我們宣告 `useAppSelector: TypedUseSelectorHook<RootState>` 時，我們實際上是在告訴 TypeScript：「這個 Hook 的第一個參數（state）永遠都是 `RootState` 型別」。

這樣一來，你在元件中使用 `useAppSelector(state => state...)` 時，輸入 `state.` 之後，VSCode 就會自動跳出 `counter`、`auth` 等屬性建議。

## 第三步：元件中的實作對比

讓我們來看看實戰中的差異。假設我們要實作一個顯示計數器數值並發送增加指令的元件。

### 傳統寫法（不推薦）

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { increment } from './counterSlice';

export function Counter() {
  // 必須手動指定 state 型別
  const count = useSelector((state: RootState) => state.counter.value);
  
  // useDispatch 預設不認識 Thunk 或特定設定
  const dispatch = useDispatch<AppDispatch>();

  return (
    <button onClick={() => dispatch(increment())}>{count}</button>
  );
}
```

### Typed Hooks 寫法（推薦模式）

```tsx
// 只需從 hooks.ts 匯入，不需要再匯入 RootState 或 AppDispatch 型別
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { increment } from './counterSlice';

export function Counter() {
  // ✅ state 自動推導為 RootState，具備完美的自動補全
  const count = useAppSelector((state) => state.counter.value);
  
  // ✅ dispatch 自動具備 AppDispatch 型別
  const dispatch = useAppDispatch();

  return (
    <button onClick={() => dispatch(increment())}>{count}</button>
  );
}
```

**優勢一目瞭然：**

- **乾淨的匯入區**：元件不再需要關心 `RootState` 這種底層型別，只需關注業務邏輯。
- **型別安全性**：如果你在 `state.counter` 後面亂打一個不存在的屬性，編譯器會立刻報錯。
- **開發體驗**：自動補全讓開發速度提升，且減少了切換檔案查看 state 結構的頻率。

## 關於循環依賴（Circular Dependency）的深度思考

你可能會好奇：為什麼一定要把 Hooks 放在 `hooks.ts`，而不是直接寫在 `store.ts` 裡面？

這涉及到了軟體工程中常見的**循環依賴**問題。請看以下邏輯鏈：

1. `store.ts` 匯入了各個 `slice.ts` 以組合 reducer。
2. 如果你在 `store.ts` 匯出 `useAppSelector`，那麼 `Counter.tsx` 就會匯入 `store.ts`。
3. 如果未來某個 `slice.ts` 需要參考 `RootState`（雖然我們儘量避免），它也會匯入 `store.ts`。

當「A 匯入 B，B 匯入 C，C 又匯入 A」的情況發生時，某些打包工具（如 Vite 或 Webpack）可能會出現 `undefined` 錯誤，因為其中一個檔案在初始化時，它所依賴的對象還沒準備好。

透過建立 `app/hooks.ts` 並僅從 `store.ts` 匯入**型別（Type-only import）**：

```typescript
import type { RootState, AppDispatch } from './store';
```

`import type` 在 JavaScript 編譯後會被完全移除。這意味著 `hooks.ts` 與 `store.ts` 之間只有「型別上的連結」，而沒有「執行期（Runtime）的程式碼依賴」。這能有效隔絕循環依賴，保持專案結構的穩健性。

## 總結與型別思維

建立 Typed Hooks 是從「會寫 Redux」跨越到「寫好 Redux」的關鍵一步。它體現了 **Colocation（同地協作）** 與 **Abstraction（抽象化）** 的原則：我們將複雜的型別推導封裝在底層，將簡潔、好用的介面留給上層元件。

現在，我們已經完成了所有的基礎設施：

- 我們了解了 `useSelector` 的訂閱與渲染機制。
- 我們掌握了 `useDispatch` 發送意圖的流程。
- 我們為整個應用程式披上了 TypeScript 的全方位裝甲。

這一切的努力，都是為了最後的實戰。在上一部分中，你已經看過了 `useDispatch` 的基本發送方式；而現在，有了這些強大的型別保護，我們終於準備好進入本主題的最終章：整合所有知識，從零到一建構一個完整的 TypeScript Counter App。我們將看到這些 Slice、Store 與 Hooks 如何交織在一起，驅動整個 React 應用程式的運轉。

## 關鍵要點回顧

- **自動推導**：使用 `ReturnType<typeof store.getState>` 確保型別與狀態結構永遠同步。
- **隔離依賴**：利用 `import type` 引入 `RootState`，避免執行期的循環引用。
- **一致性**：在元件中禁止直接使用原始的 `useSelector`，統一使用 `useAppSelector` 以確保開發體驗的一致性。
- **RTK 2.0+ 慣例**：優先使用 `useDispatch.withTypes<AppDispatch>()` 來定義自定義 Hook。
