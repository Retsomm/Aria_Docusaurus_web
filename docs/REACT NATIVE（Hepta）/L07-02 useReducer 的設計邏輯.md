---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 7 堂：狀態管理完整梳理

# useReducer 的設計邏輯

想像你正在開發一款影片串流 APP 的播放頁面。為了讓使用者有良好的體驗，你需要管理許多狀態：影片是否正在載入（`isLoading`）、是否正在播放（`isPlaying`）、目前播放的時間點（`currentTime`）、是否有錯誤發生（`error`），以及緩衝狀態（`isBuffering`）。

當使用者點擊「播放」按鈕時，你可能會寫出這樣的程式碼：

```javascript
const handlePlay = () => {
  setIsLoading(false);
  setIsBuffering(false);
  setIsPlaying(true);
  setError(null);
  // ... 其他邏輯
};
```

這看起來沒什麼問題，對吧？但如果你的 APP 邏輯變得更複雜，例如網路突然斷線、使用者在緩衝時瘋狂點擊暫停、或是影片播放完畢要自動跳下一集，你的 event handler 裡就會充斥著大量的 `setSomething`。你會發現，這些狀態之間其實是「強耦合」的——當 `isPlaying` 是 `true` 時，`isLoading` 理論上應該要是 `false`。

這種「散亂的狀態更新」正是許多難以追蹤的 Bug 來源。這一部分，我們將深入探討 `useReducer`，它不只是一個更高級的 `useState`，而是一種讓你奪回狀態控制權的**架構思維**。

## 當 useState 開始感到吃力的訊號

在 React Native 開發中，我們很習慣用 `useState`。但當你發現以下三種跡象時，就是該考慮 `useReducer` 的時候了：

### 1. 狀態「成群結隊」出現

當你更新一個狀態，總是不得不同時更新另外兩、三個狀態。例如在處理 API 請求時，你總是需要同時處理 `setData`、`setIsLoading` 和 `setError`。如果這三個 `set` 操作散落在元件的各個角落，你很難保證每次更新都是完整的。

### 2. 邏輯中充滿了複雜的 JavaScript 展開語法

如果你發現你的狀態是一個大型物件，而你的更新邏輯長得像這樣：
`setUserData(prev => ({ ...prev, profile: { ...prev.profile, settings: { ...prev.profile.settings, theme: 'dark' } } }))`
這種深層的展開（spread）語法不僅難讀，而且極易出錯。

### 3. 下一個狀態高度依賴前一個狀態

當你的狀態轉換邏輯包含大量的 `if-else` 或 `switch`，且這些邏輯分散在多個 event handler 中時。這會導致你很難一眼看出「在什麼情況下，狀態會變成什麼」。

## 核心概念：狀態機思維（State Machine）

要理解 `useReducer`，最好的方式是把它看作一個**狀態機（State Machine）**。

在 `useState` 的世界觀裡，你是「直接修改數據」的人。但在 `useReducer` 的世界觀裡，你將「發生了什麼事（Action）」與「數據如何變化（Reducer）」完全分離。

這個模式由三個核心角色組成：

- **State (當前狀況)**：這就是你的數據，例如 `{ isPlaying: false, status: 'idle' }`。
- **Action (發生了什麼事)**：這是一個描述動作的純物件。它不告訴程式「該怎麼做」，只告訴程式「發生了什麼」。例如：`{ type: 'USER_CLICKED_PLAY' }`。
- **Reducer (規則手冊)**：這是一個純函數（Pure Function）。它接收目前的 `state` 和剛發生的 `action`，然後根據預設的規則，回傳一個**全新的** `state`。

### 為什麼要這麼麻煩？

想像你在一家餐廳。

- **useState 模式**：你直接跑進廚房，拿起平底鍋開始炒蛋。如果同時有三個人跑進來炒蛋，廚房會大亂，蛋可能會燒焦。
- **useReducer 模式**：你坐在位子上，寫了一張點菜單（Action）交給服務生（Dispatch）。服務生把單子傳給主廚（Reducer），主廚根據固定的菜譜（規則），把煮好的菜（New State）端出來給你。

**這種模式最大的好處是「可預測性」**。主廚永遠在那裡，規則永遠在那。只要點菜單一樣，端出來的菜永遠一樣。

## 實戰範例：重構影片播放器狀態

讓我們看看如何將一個混亂的媒體播放器狀態，從 `useState` 遷移到 `useReducer`。這在你開發內容類 APP 時非常實用。

### 混亂版：使用 useState

在這種寫法中，邏輯被拆碎並塞進了各個函數裡。

```tsx
function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartLoading = () => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false); // 必須手動確保不播放
  };

  const handlePlaySuccess = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };

  const handlePlayError = (err) => {
    setIsLoading(false);
    setIsPlaying(false);
    setError(err);
  };

  // ... 想像這裡還有 handlePause, handleBuffer, handleEnd...
}
```

這段程式碼的風險在於：如果你在哪個 handler 裡忘了 `setIsLoading(false)`，你的 UI 可能會永遠顯示一個轉圈圈的 Loading 圖標，即便影片其實已經出錯停止了。這就是所謂的**不可能狀態（Impossible States）**。

### 整理版：使用 useReducer

現在，我們把所有的轉移規則集中到一個地方：

```tsx
// 1. 定義初始狀態
const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'playing' | 'error'
  error: null,
};

// 2. 定義 Reducer (主廚的規則)
function playbackReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', error: null };
    case 'PLAY_SUCCESS':
      return { status: 'playing', error: null };
    case 'PLAY_ERROR':
      return { status: 'error', error: action.payload };
    case 'USER_PAUSE':
      return { ...state, status: 'idle' };
    default:
      return state;
  }
}

function VideoPlayer() {
  // 3. 使用 useReducer
  const [state, dispatch] = useReducer(playbackReducer, initialState);

  // 4. 事件處理變得極度簡潔
  const handleStartLoading = () => dispatch({ type: 'LOAD_START' });
  const handlePlaySuccess = () => dispatch({ type: 'PLAY_SUCCESS' });
  
  return (
    <View>
      {state.status === 'loading' && <ActivityIndicator />}
      {state.status === 'playing' && <VideoView />}
      {/* ... 根據單一的 status 渲染 UI */}
    </View>
  );
}
```

### 優勢分析

1. **杜絕不可能狀態**：在 `playbackReducer` 中，我們定義了當 `LOAD_START` 發生時，`status` 必定變為 `loading`。我們不再需要手動去關閉 `playing` 或 `error` 狀態，因為新狀態是整體回傳的。
2. **邏輯集中化**：如果你想知道「發生錯誤時 UI 會怎麼變」，你只需要看 `playbackReducer` 裡面的那一行代碼。你不需要去搜尋整個元件檔案。
3. **更容易 Debug**：你可以在 Reducer 裡加一個 `console.log(action)`。這樣一來，APP 發生過的所有事情都會像日誌一樣清清楚楚地顯示出來。這對於追蹤複雜的互動 bug 非常有幫助。

## useReducer vs useState 的決策框架

你不需要把所有的 `useState` 都改成 `useReducer`。過度使用會增加程式碼的冗餘（Boilerplate）。你可以參考以下這套決策框架：

### 優先選用 `useState` 當：

- **狀態是獨立的**：例如一個輸入框的文字、一個切換開關（Switch）。更新這個狀態不會影響到其他狀態。
- **狀態邏輯簡單**：只是簡單的真假值切換或數字增減。
- **元件很小**：只有幾十行程式碼，一看就懂。

### 優先選用 `useReducer` 當：

- **狀態之間有依賴性**：如 API 請求（Loading/Data/Error）、複雜表單驗證。
- **業務邏輯複雜**：狀態轉換需要進行計算或判斷條件（例如：只有在 `isLoggedIn` 且 `hasPermission` 的情況下才能執行 `UPGRADE_ACCOUNT`）。
- **需要將邏輯移出元件**：Reducer 是一個純函數，它可以被移到單獨的檔案中進行**單元測試（Unit Testing）**，這對高品質的 APP 來說非常重要。
- **團隊協作**：Reducer 的 Action 命名（如 `USER_COMPLETED_ONBOARDING`）具有很好的文檔化作用，讓其他開發者（或未來的你）能快速理解業務流程。

### AI 時代的小技巧

在使用 Cursor 或 GitHub Copilot 等工具時，`useReducer` 的結構對 AI 非常友好。因為 Reducer 是純函數，AI 預測「狀態轉移邏輯」的準確度通常比預測散落在 event handler 裡的 `setState` 高得多。你可以直接對 AI 說：「請幫我寫一個處理分頁加載邏輯的 reducer」，產出的程式碼通常非常穩健。

---

## 關鍵要點與銜接

### 核心回顧

- **狀態與邏輯分離**：`useReducer` 讓我們專注於「發生了什麼事」（Action），而非「如何修改數據」。
- **集中管理規則**：透過一個中心化的 Reducer 函數，我們可以徹底避免「不可能狀態」的出現，讓 UI 表現高度穩定。
- **結構化優勢**：雖然 `useReducer` 的初始程式碼量較多，但在處理複雜組件（如媒體播放器、購物車、多步驟表單）時，它的維護性遠超 `useState`。

在這一部分中，我們學會了如何優雅地組織元件內部的「同步」狀態轉移。但在開發 React Native APP 時，最困難的部分往往不在於狀態如何變，而是在於狀態變了之後，如何去觸發「外部副作用」——例如發送 API 請求、啟動計時器或與原生播放器溝通。

這正是我們下一個主題要探討的核心：如何建立正確的 `useEffect` 心智模型，將你的狀態與外部系統精確同步。
