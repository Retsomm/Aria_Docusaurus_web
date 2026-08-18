---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 1 堂：RTK Query 概念建立

# 26知識地圖回顧

在我們完成 Counter 與 Todo App 的整合實作後，你現在手中已經握有了 Redux Toolkit (RTK) 最核心的武器庫。但如果我們現在就開始動筆寫鐵人賽的文章，你可能會發現，雖然程式碼寫得出來，但要如何向讀者解釋「為什麼要這樣寫」卻是一個挑戰。

在進入文章撰寫實戰之前，我們需要進行一次深度的高空回顧。這不僅是為了複習，更是為了將散落在各個章節的技術點（createSlice, configureStore, Selector）串聯成一條邏輯嚴密的「知識地圖」。這張地圖將決定你文章的深度——你能否從單純的「API 調用者」晉升為「架構理解者」？

## 三大原則：這不只是限制，而是契約

為什麼 Redux 的學習曲線在初期總是顯得有些陡峭？原因不在於 API 的多寡，而在於它強加在開發者身上的「三大原則」。當我們回顧這五個主題的學習歷程時，你會發現 RTK 的每一個設計，本質上都是在幫助我們更輕鬆地履行這三份契約。

### 1. 單一事實來源 (Single Source of Truth)

在 Topic 1 中，我們討論過狀態管理的痛點：當狀態分散在各個元件的 `useState` 時，要追蹤「誰改變了資料」簡直是場噩夢。Redux 要求整個應用程式的狀態被儲存在唯一的一個 Store 中。

這份契約的「為什麼」在於**可預測性**。因為有了單一 Store，我們才可能實現「Redux DevTools」那樣強大的功能——你可以隨時匯出整個 App 的狀態快照，或者在不同的除錯環境中還原相同的 UI 表現。在多 Slice 的架構中，雖然我們定義了多個檔案，但最終透過 `configureStore` 合併成的一棵狀態樹，依然嚴格遵守著這個原則。

### 2. 狀態是唯讀的 (State is Read-only)

你不能直接修改 `state.count = 5`，這是為了確保狀態的改變必須經過一個明確的「意圖」（也就是 Action）。

為什麼要這麼麻煩？想像一下，如果任何元件都能隨意改動全域變數，當 Bug 發生時，你根本無法斷定是哪個元件伸出了「黑手」。Action 的存在，為狀態變更留下了**審計日誌 (Audit Log)**。當你在 DevTools 看到 `todo/addTodo` 這個 Action 時，你確切地知道發生了什麼事，以及它是如何影響狀態的。

### 3. 使用純函數執行修改 (Changes via Pure Functions)

Reducer 必須是純函數。這意味著：給定相同的輸入（當前狀態與 Action），必須永遠回傳相同的輸出（新狀態）。

這份契約解決了**時間旅行 (Time Travel Debugging)** 的難題。因為 Reducer 不會產生副作用，我們可以在 Action 歷史記錄中自由跳躍，Redux 只需要重新運行那些純函數，就能精準地重現任何時刻的畫面。

---

## RTK 的簡化之道：隱藏複雜性，保留核心

如果你曾經看過傳統 Redux 的寫法，你會驚嘆於 RTK 的優雅。但作為進階開發者，我們必須理解：**RTK 並沒有改變 Redux 的原則，它只是改變了我們實現原則的方式。**

### 從樣板程式碼到 createSlice

傳統 Redux 需要分開寫 Action Types（常數）、Action Creators（函式）以及 Reducer（巨大的 switch 語句）。這不僅冗長，而且極易出錯。

`createSlice` 的出現是一個轉折點。它利用了 **Colocation（同地協作）** 的思想：既然 Action 與對應的 Reducer 邏輯在邏輯上是一體的，為什麼不把它們定義在一起？

- **自動生成的 Action Creators**：你不再需要手寫 `return { type: '...', payload: ... }`。
- **封裝的命名空間**：`name` 屬性自動幫你的 Action Type 加上前綴，解決了全域命名衝突的問題。

### Immer：開發體驗的質變

在 Topic 3.3 中，我們深入探討了 Immer。這可能是 RTK 中最讓人感到「神奇」的部分——你明明在 Reducer 裡面寫了 `state.push(newItem)`，為什麼它卻沒有違反「不可變性」原則？

**思考一下：如果沒有 Immer，我們會面臨什麼問題？**
在處理深層嵌套的狀態時，我們必須寫出類似 `...state, user: { ...state.user, posts: [...state.user.posts, newPost] }` 這樣難以閱讀的程式碼。這不僅痛苦，而且只要少寫一個擴展運算子（spread operator），就會意外修改到原始狀態，導致 React 元件因為引用地址沒變而拒絕重新渲染。

Immer 透過 **Proxy（代理物件）** 攔截了你的修改行為，並自動在背後幫你生成一個全新的物件。這讓開發者可以用「最直覺的變更邏輯」來實作「最嚴謹的不可變更新」。這是 RTK 成功的關鍵：它讓正確的事情變得簡單。

---

## TypeScript 與資料流：一次設定，全域安全

在實作 Counter 與 Todo App 時，你應該感受到了 TypeScript 帶來的「安全感」。在 Redux 中整合 TypeScript，最核心的思維是建立**自動化的型別推導鏈路**。

### 型別的單一事實來源

我們在 `store.ts` 中使用了以下代碼：

```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

這是一個非常重要的架構決定。我們沒有手寫一個包含所有狀態的巨大 Interface，而是**讓 TypeScript 直接觀察 Store 的實體**。

- 當你增加一個新的 Slice 到 `configureStore` 時，`RootState` 會自動更新。
- 當你增加一個 Middleware 時，`AppDispatch` 會自動學會處理 Thunk（非同步邏輯）。

這體現了「一次設定，全域安全」的原則。

### Typed Hooks 的必要性

為什麼我們不直接使用 `useSelector` 和 `useDispatch`？

1. **減少重複**：不需要在每個元件裡寫 `(state: RootState) => ...`。
2. **正確處理非同步**：原生的 `useDispatch` 不知道你的 Store 設定了哪些 Middleware，因此它可能無法正確識別非同步 Action 的型別。透過 `useAppDispatch`，我們確保了型別檢查能覆蓋到 Dispatch 的每一個角落。

這種「封裝 Hooks」的模式，是你在撰寫鐵人賽文章時應該強調的**最佳實踐**。它向讀者展示了如何透過簡單的封裝，大幅提升整個團隊的開發效率。

---

## 模組化架構：Selector 的最後一哩路

當應用程式從一個簡單的計數器增長到包含 Todo、User、Settings 的複雜系統時，如何管理資料流的「出口」就變得至關重要。這就是我們在 Topic 5 討論的 Selector 設計。

### 為什麼需要 Selector？

元件不應該直接知道 Store 的內部結構。如果你的元件寫著 `state.todo.items.filter(...)`，那麼一旦你修改了 Store 的結構（例如把 `items` 改名為 `list`），你得去修改所有用到這個資料的元件。

**Selector 就像是一個 API 層**。元件只需要說「我要所有的已完成待辦事項」，而不需要關心這些資料在 Store 裡是怎麼存的。

- **封裝性**：將資料結構的細節隱藏在 Slice 之中。
- **重用性**：多個元件可以共用同一個邏輯複雜的 Selector。

### 效能優化：Memoization

在回顧中，我們必須再次強調 `useSelector` 的重新渲染機制。

- **預設行為**：`useSelector` 使用 `===`（嚴格相等）來比較 Selector 的回傳值。
- **危險區域**：如果你在 Selector 裡面寫 `state.todos.map(t => ...)`，每次 Store 有任何變動，map 都會產生一個「新陣列」，導致元件誤以為資料變了而觸發不必要的重新渲染。

這就是為什麼我們需要 `createSelector`。它會快取（Memoize）上次的結果，只要輸入（輸入的 state 片段）沒變，它就直接回傳快取值。這在大型應用中是效能的關鍵保證。

---

## 知識轉化：從「我會寫」到「我能教」

現在，這張知識地圖已經在你腦中成形了。我們從最底層的**三大原則**出發，看到了 **RTK** 如何透過簡化 API 來實踐這些原則，接著利用 **TypeScript** 建立了安全的防護網，最後透過 **Selector** 優化了資料的讀取與效能。

這整套邏輯脈絡，就是你鐵人賽前 10–12 篇的核心骨架。

- **開篇**：可以從「三大原則」的必要性切入，建立問題意識。
- **中段**：詳細拆解 `createSlice` 與 Immer，讓讀者體會 RTK 的現代感。
- **進階**：帶入 TypeScript 的強型別整合與 Selector 的優化技巧，展現進階開發者的視野。

當你能夠解釋每一個技術決定背後的「為什麼」時，你的文章就不再只是程式碼貼上，而是具有生命力的教學。

## 邁向寫作實戰

掌握了這些核心概念的連結關係後，下一個問題是：**如何把這些豐富的知識，轉化成讀者看得下去、且能從中獲益的文章？**

我們不能只是隨性地寫，我們需要一個「戰鬥模版」。在接下來的部分，我們將討論如何建構一份「理論 + 實作」的文章架構模板，讓你像生產線一樣高效且高品質地產出鐵人賽文章。

我們將在下一節探討如何定義文章的「四段結構」，確保每篇內容都能精準擊中讀者的痛點。
