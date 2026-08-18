---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 16 堂：Lane 模型收尾

# Lesson 16 note

這堂課完整收尾了 Topic 9，深入探討 React Scheduler 的任務排程機制、startTransition 的運作原理，以及 Concurrent Mode 的整體架構與 Selective Hydration 技術。透過理解這些機制，學生能掌握 React 如何在有限的硬體資源下，透過精確的調度藝術維持 UI 的流暢響應。

### [Scheduler 任務排程](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/643ece43-f426-4231-950f-aeba703835d6)

- Scheduler 是獨立於 React 核心的套件，專職負責「時間管理」，將 Reconciler 交辦的邏輯更新安排在正確的時間點執行。
- 內部使用「最小堆積」（Min-Heap）資料結構管理任務，分為「執行佇列」（Task Queue）與「延遲佇列」（Timer Queue），確保能以 $O(1)$ 的效率提取最緊急或最先到期的任務。
- 每個任務都有 Expiration Time（到期時間），優先級越高則 timeout 越短。一旦任務過期，Scheduler 會提升其優先級以防止「飢餓問題」（Starvation）。
- 實施 5ms 的「時間切片」（Time Slicing），每處理完一個 Fiber 節點就會檢查預算，若用完則主動讓出主執行緒給瀏覽器。
- 選用 MessageChannel 而非 setTimeout(0) 作為觸發機制，目的是為了避開瀏覽器在巢狀呼叫下強制產生的 4ms 延遲，實現更精準的高頻率調度。

### [startTransition 原理](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/978c06d1-a0af-4a90-a5ce-99c56bee9f9f)

- startTransition 的本質是將狀態更新標記為 TransitionLane（低優先級），使其成為「可隨時被中斷」的任務。
- 當高優先級任務（如使用者輸入）插隊時，React 會暫停甚至拋棄當前正在進行的 Transition 渲染，優先處理互動，待主執行緒空閒後再重新開始。
- 與 Debounce（防抖）的區別在於：Debounce 是「被動等待一段時間才開始」，而 Transition 是「主動立即開始但可被中斷」，能更充分利用 CPU 的破碎空閒時間。
- `useTransition` 的 `isPending` 狀態透過「雙重渲染」實現：一次同步更新切換 `isPending` 為 true，另一次低優先級更新執行實際內容，完成後再切回 false。
- 注意事項：Transition 內的更新必須是「純函數式的」，因為任務可能會因為中斷而被執行多次。

### [Concurrent Mode 全景](https://app.heptabase.com/aed2d564-e8e0-4308-a2af-1455849a1bf4/card/d0585ce3-53df-46d1-aaf5-faa48a3f2d9e)

- Concurrent Mode 是 Fiber（架構層：可中斷）、Lane（決策層：優先級分類）與 Scheduler（執行層：時間排程）三者協作的整體展現。
- 其設計哲學從「儘快渲染一切」轉向「始終保持對使用者的響應」，在資源有限時做出最聰明的調度決策。
- Selective Hydration（選擇性注水）技術讓 SSR 場景下的 Hydration 不再是死板的線性執行，而是能根據使用者的點擊或輸入訊號，優先注水該互動區域，大幅縮短可互動時間（TTI）。
- 併發特性如 `useDeferredValue` 與 `Suspense` 進一步強化了開發者對 UI 響應節奏的控制力，減少畫面凍結感。

## Q&A

- **Q:** 為什麼 React Scheduler 偏好使用 MessageChannel 而不是 setTimeout(0)？
  - 核心在於避開瀏覽器的「節能限制」。當 setTimeout 巢狀呼叫超過 5 次，瀏覽器會強制加上 4ms 延遲。
- 在每幀僅 16.6ms 的限制下，這 4ms 的浪費會導致主執行緒利用率下降，容易造成掉幀（Jank）與畫面卡頓。
- **Q:** 當一個 Transition 任務執行到一半被高優先級任務插隊時，React 如何處理？
  - React 會利用 Fiber 的雙緩衝架構（Double Buffering）保護畫面。
- 當前的畫面存在於 current 樹，而正在計算的 Transition 位於 workInProgress 樹。插隊發生時，React 可以直接暫停或拋棄 workInProgress 樹，因為它是「草稿」，不會影響使用者看到的完整畫面。
- **Q:** Selective Hydration 在 SSR 中如何改善使用者體驗？
  - 它打破了傳統 SSR 必須等待全局 JS 下載並按順序 Hydrate 的限制。
- React 會監聽使用者的「互動訊號」（如點擊按鈕），一旦偵測到互動，就給予該區域最高優先級進行注水，讓特定元件「奇蹟般地」先活過來。
