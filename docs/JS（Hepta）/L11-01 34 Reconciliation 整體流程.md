---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 11 堂：Reconciliation 核心機制

# 34 Reconciliation 整體流程

當我們在 React 中呼叫 `setCount` 或 `dispatch` 時，畫面上那些數字與元件總是能精準且快速地更新。你是否曾好奇過，從我們點擊按鈕的那一刻起，到瀏覽器畫面真正發生變化的這幾毫秒內，React 內部到底經歷了哪些精密的手續？

這套確保「真實 DOM」與「Virtual DOM」保持同步的精密演算法，就叫做 **Reconciliation（協調/對齊過程）**。

## 什麼是 Reconciliation？

在深入技術細節前，我們先給 Reconciliation 下一個明確的定義：**Reconciliation 是 React 用來比對兩棵 Virtual DOM 樹，並決定哪些部分需要更新到真實 DOM 的過程。**

如果我們把開發 React 想像成是在寫一份「UI 說明書」，那麼 Reconciliation 就是那個「執行編輯」。當你修改了說明書（更新 State）後，編輯會拿著新版說明書與舊版進行對照，計算出最有效率的修改方案，然後交給印刷廠（Renderer）去執行。

### 為什麼不直接更新 DOM？

回想我們在 Topic 6 討論過的 Virtual DOM。操作真實 DOM 是極其昂貴的，因為它會觸發瀏覽器的重繪（Repaint）與重排（Reflow）。如果我們每次狀態改變都把整個網頁拆掉重建，效能將會慘不忍睹。

Reconciliation 的存在，就是為了讓我們能以「宣告式（Declarative）」的方式寫程式——你只需要描述 UI **「看起來應該是什麼樣子」**，而 Reconciliation 會幫你算出 **「如何用最少的 DOM 操作達成那個樣子」**。

---

## Reconciliation 的三階段模型

為了讓整個更新流程更具可預測性且高效，React 將 Reconciliation 拆解為三個主要階段：**觸發 (Trigger)**、**渲染 (Render Phase)**、以及 **提交 (Commit Phase)**。

### 1. 觸發 (Trigger)：發起更新請求

一切的起點通常源於狀態的改變。在 React 中，這通常是由以下幾種情況觸發：

- 元件內部的 `useState` setter 函數被呼叫。
- `useReducer` 的 `dispatch` 被觸發。
- 父元件重新渲染，導致 Props 發生變化。
- Context 的值發生改變。

**重要觀念：** 在 React 中，呼叫 `setCount` 並不會「立即」修改 `count` 變數，也不會立即去動 DOM。它更像是向 React 提交了一個「更新申請」。React 會將這個申請排入排程，等待時機啟動後續的處理。

### 2. 渲染階段 (Render Phase)：計算差異 (Diffing)

這是整個 Reconciliation 的靈魂所在。在這個階段，React 會從元件樹的頂端（或是觸發更新的元件）開始向下遍歷：

1. **執行元件函數**：React 會重新呼叫你的函數元件。例如 `const Counter = () => { ... }` 會被再次執行，獲取最新的返回值。
2. **建立新的 Virtual DOM 樹**：根據元件函數的回傳值（JSX 編譯後的結果），React 會在記憶體中建立一棵全新的 React Element 樹。
3. **進行 Diffing 比較**：React 會將這棵「新樹」與上一次渲染留下的「舊樹」進行逐一比對。
4. **標記變更 (Effects)**：React 會找出兩棵樹之間的差異。例如：「這個 `<div>` 的 `className` 變了」、「那個 `<span>` 的文字從 0 變成了 1」、「這個 `<li>` 被刪除了」。

**關鍵特性：** 

- **純粹性**：Render Phase 應該是「純函數」的過程。它不應該產生任何副作用（Side Effects），例如修改全域變數、發送 API 請求或操作 DOM。它唯一的任務就是「計算差異」。
- **異步與可中斷**：這是 React 16 以後（Fiber 架構）最重要的演進。由於這個階段不涉及真實 DOM，React 可以根據任務的優先級來決定是否要暫停計算，先讓瀏覽器去處理更緊急的任務（如動畫或使用者輸入）。我們稍後會詳細討論這一點。

### 3. 提交階段 (Commit Phase)：套用變更

當 Render Phase 結束，React 手中已經握有一份詳盡的「待辦清單」（哪些 DOM 該增、刪、改）後，就會進入 Commit Phase。

1. **操作真實 DOM**：React 會根據計算出的結果，呼叫對應的瀏覽器 API（如 `appendChild`、`removeChild`、`node.textContent = ...`）來修改畫面。
2. **生命週期與 Hook 回調**：在 DOM 更新完成後，React 會執行 `useLayoutEffect`（同步）與 `useEffect`（異步）等副作用回調。

**關鍵特性：**

- **同步且不可中斷**：與 Render Phase 不同，Commit Phase 必須是**原子性（Atomic）**的。這意味著一旦開始，就必須一口氣執行完畢。為什麼？因為如果不這樣做，使用者可能會看到「半完成」的 UI（例如：清單的標題更新了，但內容還沒更新），這會造成畫面閃爍或狀態不一致。

---

## 為什麼要區分 Render 與 Commit？（Fiber 的伏筆）

你可能會問：「為什麼要搞這麼複雜？直接一邊比對一邊更新 DOM 不好嗎？」

這就涉及到了 React 最核心的設計決策之一：**併發（Concurrency）**。

### Render Phase 是「草稿」

想像你在寫一篇長文章。Render Phase 就像是在草稿紙上修改。你可以寫到一半停下來去喝咖啡，或者因為想到了更好的寫法而把草稿揉掉重寫。只要你還沒把文章交給編輯（Commit），讀者就不會看到你混亂的修改過程。

在 React 中，如果 Render Phase 耗時太長（例如要比對數千個節點），它會阻塞主執行緒（Main Thread），導致網頁卡頓。但因為 Render Phase 只是在「計算 JS 物件」，React 可以在計算過程中，每隔幾毫秒就停下來問瀏覽器：「嘿，現在有使用者在點擊按鈕或播放動畫嗎？」如果有，React 就先暫停計算，讓瀏覽器處理完，再回來繼續算。

### Commit Phase 是「定稿」

一旦你決定要把文章發表，你就必須確保發表出來的是完整的版本，不能讓讀者看到一半是新版、一半是舊版。

因此，Commit Phase 必須是**同步且不可中斷**的。React 會在這一瞬間將所有累積的 DOM 變更一口氣推送到螢幕上，確保 UI 的一致性。

---

## 實戰範例：計數器 (Counter) 的更新路徑

讓我們用一個最簡單的 `Counter` 範例來追蹤這整個流程：

```javascript
const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>目前數字：{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
};
```

### 流程拆解：

1. **觸發 (Trigger)**：
  - 使用者點擊按鈕。
- `onClick` 事件執行，呼叫 `setCount(0 + 1)`。
- React 收到更新請求，標記 `Counter` 元件為「Dirty（待更新）」。
2. **渲染階段 (Render Phase)**：
  - React 重新呼叫 `Counter()` 函數。
- 函數回傳新的 Virtual DOM 結構：
  ```javascript
// 簡化版的 React Element
{
  type: 'div',
  props: {
    children: [
      { type: 'p', props: { children: '目前數字：1' } },
      { type: 'button', ... }
    ]
  }
}
```
- **Diffing**：React 將這個新物件與舊物件（`目前數字：0`）比對。
- **結果**：發現 `<p>` 的 `children` 從「目前數字：0」變成了「目前數字：1」。其餘部分（`div`、`button`）都沒有變動。
- React 生成一個 Effect 標記：`Update text for <p> tag`.
3. **提交階段 (Commit Phase)**：
  - React 拿到標記，直接執行底層 DOM 指令：`pNode.textContent = '目前數字：1'`。
- 瀏覽器在下一次繪製時將新數字呈現給使用者。

---

## 總結：React 的優雅在於「計算與執行」的分離

理解了 Reconciliation 的整體流程，你就能明白為什麼 React 即使在處理複雜 UI 時也能保持流暢。

- **Reconciliation** 是達成「宣告式開發」的幕後功臣。
- **Render Phase** 是在記憶體中進行的「計算遊戲」，它追求的是聰明地找出差異，且為了效能可以隨時暫停。
- **Commit Phase** 是對真實世界的「最後通牒」，它追求的是準確且一致地同步畫面。

這種「先計算、再執行」的模式，讓 React 能夠在不犧牲開發者體驗的情況下，達成極高的效能優化。

## 銜接與預告

現在我們已經掌握了 Reconciliation 的全局視野。但你有沒有注意到，在 Render Phase 的 **Diffing** 過程中，React 是如何快速比對兩棵樹的？

如果我們用最暴力的方式去比對兩棵樹（Tree Diffing），演算法的複雜度是 $O(n^3)$。這意味著如果你的頁面有 1000 個節點，React 每次更新都要進行十億次的運算——這顯然是不可能的。

### 下一節我們將探討：

React 是如何利用三個大膽的「核心假設」，將這個複雜度從 $O(n^3)$ 降到驚人的 $O(n)$ 的？這就是著名的 **Tree Diffing 的三個假設**。我們下一節見。
