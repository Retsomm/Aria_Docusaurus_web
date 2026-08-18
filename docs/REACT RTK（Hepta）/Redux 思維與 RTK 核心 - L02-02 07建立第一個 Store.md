---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 2 堂：RTK 環境建置實作

# 07建立第一個 Store

在上一節中，我們已經成功搭建了 Vite 專案，並安裝了 Redux Toolkit（RTK）與 React-Redux。現在，我們手裡有了零件，接下來要做的就是組裝出這個應用的「大腦」——**Store**。

如果說 Redux 是你的應用程式的資料中樞，那麼 Store 就是那個存放所有秘密、處理所有邏輯、並記錄所有變動的中央金庫。在傳統 Redux 的年代，建立這個金庫需要寫大量的樣板程式碼，甚至還要手動配置各種「機關」（Middleware）。但在 RTK 的世界裡，這一切都被簡化成了一個優雅的函式：`configureStore`。

## 為什麼需要 configureStore？

在進入程式碼之前，我們先來思考一個問題：為什麼 RTK 不直接叫我們用傳統的 `createStore`，而是推出一個新的 API？

如果你曾觀察過資深開發者的傳統 Redux 配置，你會發現他們通常會做以下幾件事：

1. **合併 Reducer**：使用 `combineReducers` 把不同功能的邏輯湊在一起。
2. **設定 Middleware**：手動加入 `redux-thunk` 來處理非同步邏輯。
3. **串接 DevTools**：寫一段長得像咒語般的 `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` 來啟動瀏覽器除錯工具。
4. **防呆檢查**：在開發環境加入一些檢查，防止開發者不小心直接修改了 State（變動了不可變性）。

這一切步驟都非常機械化且容易出錯。`configureStore` 的出現，就是為了實踐「約定優於配置」的原則。它是一個**封裝好的工廠函式**，預設就幫你完成了上述所有繁瑣的設定。對於要撰寫鐵人賽文章的你來說，這意味著你可以花更少的篇幅解釋「如何設定環境」，而花更多的精力在「如何撰寫業務邏輯」。

## 實作：建立 src/app/store.ts

在 React 專案中，我們通常會建立一個 `src/app` 資料夾來存放全域性的配置。這是一個很好的實踐，能讓你的專案結構一目了然。

現在，請在你的專案中建立 `src/app/store.ts` 檔案，並輸入以下內容：

```typescript
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // 這裡是用來放置各個 slice 的 reducer 的地方
    // 暫時留空或先給一個示意用的名稱
  },
});

// 從 store 本身推導出 `RootState` 與 `AppDispatch` 型別
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

這段程式碼看起來很簡潔，但它背後隱藏了幾個極其重要的細節，我們必須逐一拆解。

### reducer 欄位：應用程式的地圖

`configureStore` 接受一個物件作為參數，其中最重要的欄位就是 `reducer`。

- **自動合併**：在傳統 Redux 中，如果你有多個 reducer，你需要呼叫 `combineReducers`。在 RTK 中，你只需要把這些 reducer 像 key-value 對一樣傳進這個 `reducer` 物件中，`configureStore` 就會自動幫你呼叫 `combineReducers`。
- **目前的狀態**：因為我們還沒建立任何 Slice（這會在下一課進行），所以目前這裡是一個空的物件。你可以想像這是金庫裡的貨架，我們已經把架子搭好了，只是還沒把貨物放上去。

### Redux DevTools：開箱即用的除錯神器

你有注意到我們完全沒有寫關於 DevTools 的設定嗎？這是 `configureStore` 的一大優點。它會自動偵測環境，如果是開發環境，它就會自動開啟與 **Redux DevTools Extension** 的連結。

這對你的鐵人賽讀者來說非常友善。當讀者照著你的教學操作時，只要安裝了瀏覽器外掛，就能立刻看到 State 的變化，這種「正向回饋」是留住讀者的關鍵。

## TypeScript 的靈魂：型別推導

這是本節的核心重點，也是很多初學者會感到困惑的地方。為什麼我們不手動寫一個 `interface RootState`？為什麼要用 `ReturnType`？

### 1. 為什麼要從 Store 推導型別？

在 TypeScript 中，我們追求的是「單一事實來源」（Single Source of Truth）。

如果我們手寫 `interface RootState`，每當我們在 `reducer` 物件中新增或刪除一個 slice 時，我們都必須手動去更新那個介面。這不僅麻煩，還非常容易出錯（例如漏掉一個欄位，或者型別寫錯）。

透過 `ReturnType<typeof store.getState>`，我們告訴 TypeScript：「**去看看 store 目前長什麼樣子，它回傳什麼，RootState 就是什麼。**」

這樣一來，當你之後在 `reducer` 裡加入 `counter: counterReducer` 時，`RootState` 會自動感知到 `state.counter` 的存在，完全不需要手動維護。這種「自動化」的型別安全，是進階 React 開發者的標配。

### 2. AppDispatch 的重要性

同樣地，`AppDispatch` 也是推導出來的。

```typescript
export type AppDispatch = typeof store.dispatch;
```

隨著你的應用程式變得複雜，你可能會加入一些自定義的 Middleware，或是處理複雜的非同步 Action（Thunk）。這些都會改變 `dispatch` 函式所能接受的參數型別。透過直接從 `store.dispatch` 推導型別，我們可以確保在元件中使用 `useDispatch` 時，TypeScript 能精確地知道哪些 Action 是合法的。

## 深入了解預設的 Middleware

雖然目前我們的 `store.ts` 看起來很簡單，但 `configureStore` 其實默默地為你注入了一套強大的 **Middleware（中間件）**。

Middleware 是在 Action 被發送（dispatch）出去後，到達 Reducer 之前的一個攔截點。`configureStore` 預設開啟了以下功能：

### Redux Thunk

這是處理非同步邏輯（如 API 呼叫）的最常用工具。它讓你的 Action 不只能是一個單純的物件，還可以是一個函式。這讓開發者能在 Redux 中優雅地處理 Promise。

### 序列化檢查（Serializable State Invariant Middleware）

這是 RTK 為了保護新手開發者而設計的。Redux 的一個核心原則是：**State 必須是可序列化的（Serializable）**。也就是說，你不應該把 Promise、函式、或是 Class 的實例放進 Store 裡，應該只放純資料（Plain Objects, Arrays, Primitives）。

如果你不小心把一個 Map 物件放進了 State，這個預設的 Middleware 會在開發環境直接在 console 噴出警告。這能有效地防止許多難以排查的 Bug。

### 不可變性檢查（Immutability Invariant Middleware）

我們知道 Reducer 必須是純函式，絕對不能直接修改（mutate）State。但在開發過程中，有時會手滑寫出 `state.user.name = 'New Name'`。這個 Middleware 會監控 State，一旦發現你直接修改了原始物件而非回傳新物件，它就會報錯。

這些「守護靈」般的機制，確保了你在撰寫鐵人賽範例時，不會因為一些低級錯誤而導致整個 Demo 崩潰。

## 鐵人賽撰寫建議：如何呈現這部分？

當你在寫這部分的教學文章時，建議不要只貼出程式碼。你可以試著引導讀者思考：

1. **對比法**：展示一段傳統 Redux `createStore` 的冗長配置，然後對比 `configureStore` 的精簡。讀者會立刻感受到 RTK 的價值。
2. **強調型別安全**：解釋 `RootState` 的推導方式。你可以展示一個截圖，顯示當你在 store 中新增欄位後，VS Code 的自動補完功能立刻就能找到那個新欄位。這種「有圖有真相」的展示對讀者非常有說服力。
3. **預告未來**：告訴讀者，這兩個匯出的型別（`RootState` 和 `AppDispatch`）就像是我們自定義 Hook 的藍圖。在後面的章節中，我們會用它們來建立型別安全的 `useAppSelector` 和 `useAppDispatch`。

## 建立第一個 Store 的完整邏輯

讓我們總結一下建立 Store 的標準流程。這不僅是為了目前的練習，更是你未來每個專案的基礎模版。

### 第一步：定義需求

確定你的應用程式需要哪些全域狀態（雖然現在我們還沒定義 Slice，但心裡要有個地圖）。

### 第二步：配置 configureStore

使用 `configureStore` 並傳入 `reducer` 物件。記住，這裡的 key 名稱，將會直接決定你在全域 State 中存取資料的路徑（例如 key 是 `counter`，那之後就是 `state.counter`）。

### 第三步：型別導出

這是 TypeScript 專案的靈魂。

- `RootState`：負責「讀取」時的導航。
- `AppDispatch`：負責「更新」時的權限控制。

這兩者就像是金庫的「目錄」與「印鑑」，一個讓你知道裡面有什麼，一個讓你確保領錢的流程是合法的。

### 第四步：準備掛載

完成 `store.ts` 後，這個「大腦」目前還只是一個孤立的檔案。它雖然知道怎麼處理邏輯，但還沒跟 React 的 UI 連結起來。

## 總結與小結

建立 Store 是 Redux 旅程中從「理論」轉向「實作」的第一個關鍵節點。透過 `configureStore`，我們不僅獲得了一個功能強大的中央狀態管理中心，還自動獲得了開發者工具支援、非同步處理能力，以及嚴格的規範檢查。

更重要的是，我們透過 TypeScript 的型別推導，為整個專案打下了堅實的型別安全基礎。這種「一次設定，終身受益」的配置，能讓你後續在開發複雜功能時，依然保持極高的開發效率與正確性。

有了這個「大腦」定義後，下一步我們要解決的問題是：**如何讓 React 應用程式「看得到」並「用得到」這個 Store？** 我們將在下一節探討如何使用 `Provider` 將 Store 掛載到 React 元件樹中。
