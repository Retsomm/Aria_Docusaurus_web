---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 7 堂：狀態管理完整梳理

# useState 的陷阱

你可能已經在你的內容類 APP 中寫過無數次 `const [data, setData] = useState([])`。在 React Native 的世界裡，`useState` 是最基礎、也是最頻繁被使用的 Hook。它看起來非常直覺：給它一個初始值，它回傳一個當前狀態和一個更新函數。

然而，在實戰中，許多難以追蹤的 bug——例如搜尋篩選後的清單與原始資料對不起來、連點兩次按讚卻只增加了一次、或是明明更新了狀態 UI 卻沒反應——往往都源於對 `useState` 底層行為的誤解。這一部份我們不談語法，而是要進行一場深度 Code Review，揪出那些藏在程式碼裡的「狀態地雷」。

## 衍生狀態的誤用：別讓狀態「同步」變成你的噩夢

在開發媒體類 APP 時，最常見的一個功能就是「清單篩選」。假設你正在開發一個影片播放 APP，上方有一個分類標籤（如：動作、喜劇、紀錄片），下方則是對應的影片清單。

很多開發者的直覺會這樣寫：

### ❌ 錯誤模式：多重狀態同步

```javascript
// ❌ 壞習慣：維護了兩個需要手動同步的狀態
const [allVideos, setAllVideos] = useState([]);      // 原始資料
const [filteredVideos, setFilteredVideos] = useState([]); // 篩選後的資料
const [category, setCategory] = useState('All');

// 當類別改變時，用 useEffect 來同步這兩個狀態
useEffect(() => {
  const result = allVideos.filter(v => v.category === category);
  setFilteredVideos(result);
}, [category, allVideos]);
```

**為什麼這是個地雷？**

這就是典型的「衍生狀態（Derived State）」誤用。在這個範例中，`filteredVideos` 完全可以透過 `allVideos` 和 `category` 計算出來。當你選擇將它存入另一個 `useState` 時，你實際上是在維護兩份「事實」。

這會導致以下問題：

1. **狀態不一致（Out of Sync）**：如果 `allVideos` 更新了，但 `useEffect` 因為某種原因（例如依賴陣列漏寫）沒跑，你的畫面就會顯示舊的篩選結果。
2. **多餘的 Re-render**：當 `category` 改變，React 會先渲染一次（因為 `category` 變了），接著跑 `useEffect` 呼叫 `setFilteredVideos`，導致第二次渲染。在手機效能有限的情況下，這種多餘的渲染會造成微小的卡頓。
3. **程式碼冗餘**：你需要寫額外的 `useEffect` 來追蹤變化。

### ✅ 正確心智模型：UI = f(state)

在 React 的設計哲學中，**如果一個值可以從現有的 props 或 state 計算出來，它就不應該是一個 state**。

```javascript
// ✅ 最佳實踐：在渲染期間直接計算
const [allVideos, setAllVideos] = useState([]);
const [category, setCategory] = useState('All');

// 直接在元件主體計算，不需要 useState，不需要 useEffect
const filteredVideos = category === 'All' 
  ? allVideos 
  : allVideos.filter(v => v.category === category);

return (
  <FlatList 
    data={filteredVideos}
    renderItem={({ item }) => <VideoCard data={item} />}
  />
);
```

當 `category` 改變時，React 會重新執行這個函式元件。此時 `filteredVideos` 會根據最新的狀態重新計算，並直接用於渲染。這保證了 UI 永遠與數據源同步，且減少了狀態管理的複雜度。

**進階優化：** 如果你的過濾邏輯非常複雜（例如有上千筆資料且包含模糊搜尋），你可以使用 `useMemo` 來快取這個計算結果，避免在無關的 re-render（如點擊其他不影響列表的按鈕）時重複計算：

```javascript
const filteredVideos = useMemo(() => {
  return allVideos.filter(v => v.category === category);
}, [allVideos, category]); // 只有這兩個東西變了才重新計算
```

---

## Stale Closure：為什麼我的 State 總是「慢半拍」？

你是否遇過這種情況：在一個非同步操作（如 API 請求或 `setTimeout`）之後讀取 state，結果拿到的竟然是舊的值？這在 React 中被稱為 **Stale Closure（過時閉包）**。

### 場景：按讚功能的陷阱

假設你的 APP 有個「快速按讚」功能，為了怕使用者點太快，你加了一個延遲處理：

```javascript
const [likes, setLikes] = useState(0);

const handleLike = () => {
  console.log('當前讚數:', likes);
  
  setTimeout(() => {
    // 假設 1 秒後才更新到後端並增加畫面顯示
    setLikes(likes + 1); 
  }, 1000);
};
```

如果你在 1 秒內快速點擊按鈕 3 次，你預期 `likes` 會變成 3。但實際上，它最後很有可能停在 **1**。

**為什麼？**

這涉及到 JavaScript 的閉包機制。當 `handleLike` 被觸發時，它「捕捉」了那一瞬間的 `likes` 值。

1. 第 1 次點擊：捕捉到 `likes = 0`。一秒後執行 `setLikes(0 + 1)`。
2. 第 2 次點擊（在第 1 秒內）：捕捉到 `likes` 仍然是 `0`（因為第一次更新還沒完成，或是 re-render 還沒發生）。一秒後執行 `setLikes(0 + 1)`。
3. 第 3 次點擊：同上，執行 `setLikes(0 + 1)`。

這就是所謂的「過時」。你的函數在執行時，拿著一張過期的地圖在找路。

### ✅ 解決方案：Functional Updater（函式更新）

當你的狀態更新**依賴於前一個狀態值**時，千萬不要直接使用該變數。你應該傳遞一個「更新函式」給 `set` 函數：

```javascript
const handleLike = () => {
  setTimeout(() => {
    // prev 是 React 保證提供給你最新、最即時的狀態值
    setLikes(prev => prev + 1); 
  }, 1000);
};
```

在這個模式下，React 會將你的更新函式放入一個佇列中。當輪到它執行時，React 會把當前記憶體中最新的狀態傳進去。即使你連點 10 次，每一次的 `prev` 都會是上一次點擊後的正確結果。

**這在媒體 APP 的哪些地方最關鍵？**

- **播放進度條**：當你在處理 `onSlidingComplete` 時，可能需要根據當前進度計算剩餘時間。
- **多選清單**：當使用者快速點擊選取多個影片時，使用 `setSelectedItems(prev => [...prev, newItem])` 能確保不會漏掉任何一個勾選。

---

## 批次更新（Batching）：React 比你想像的更省力

在使用 `useState` 時，新手常有的擔憂是：「如果我一次更新五個 state，React 是不是會連續渲染五次？這樣效能不會很差嗎？」

答案是：**不會。**

### 理解自動批次更新（Automatic Batching）

在 React 18 之後（React Native 0.69+ 預設啟用），React 具備了強大的批次更新機制。

```javascript
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [isPosting, setIsPosting] = useState(false);

const handlePost = async () => {
  // 以下三個狀態更新雖然是分開寫的
  setIsPosting(true);
  setTitle('新影片');
  setDescription('這是一段精彩的內容');
  
  // 但 React 只會觸發「一次」Re-render
};
```

React 就像一個聰明的服務生。他不會在你點了一杯可樂後就衝去廚房，然後你點薯條他再跑一次。他會等你在這個事件處理器（Event Handler）裡把話說完，然後把所有點單（State Updates）一起帶去廚房（渲染引擎）。

這對效能至關重要，尤其是在 React Native 中。正如我們在 Topic 1 討論過的，每一次渲染都可能涉及到 JS 層與原生層的通訊。批次更新大幅減少了這種跨橋接（Bridge/JSI）的開銷。

### 陷阱：為什麼我在 setState 後馬上 console.log 拿不到新值？

這是一個在社群討論區被問過上萬次的問題：

```javascript
const [activeTab, setActiveTab] = useState('Home');

const switchTab = (name) => {
  setActiveTab(name);
  console.log(activeTab); // 這裡永遠會印出切換「前」的舊值
};
```

很多開發者會因此感到沮喪，甚至嘗試用 `useEffect` 來追蹤 `activeTab` 以便執行下一步邏輯。

**正確的理解方式：**
`setState` 不是在修改一個變數，而是在**請求一次重新渲染**。當前的 `activeTab` 在這次函式執行週期中是一個「常數（Constant）」。它代表的是「這一秒畫面上的狀態」。

如果你需要在切換後立即執行某些邏輯，請直接使用傳進去的參數：

```javascript
const switchTab = (name) => {
  setActiveTab(name);
  fetchDataByTab(name); // 直接用 name，不要用 activeTab
};
```

---

## 深入底層：useState 的更新其實是非同步的嗎？

嚴格來說，`useState` 的更新並不是真正的「非同步函式」（它不會回傳 Promise），但它的**效果**是非同步的。

這背後的原理是 React 的「快照（Snapshot）」概念。

1. **渲染 1**：`count` 是 0。
2. **呼叫 `setCount(1)`**：React 記錄下「下次渲染時，`count` 要變成 1」。
3. **渲染 1 結束**：這期間 `count` 依然是 0。
4. **渲染 2**：React 重新執行元件，這次 `count` 是 1。

這解釋了為什麼在同一行程式碼裡連續寫 `setCount(count + 1)` 五次沒有意義——因為這五次呼叫拿到的 `count` 快照都是 0。

### 什麼時候該擔心這個？

當你的 APP 邏輯開始出現這種「依賴鏈」時：

- 「我要先設定 User ID」
- 「設定完後，我要根據 User ID 去抓取設定檔」
- 「抓完設定檔，我要判斷是否開啟深色模式」

如果你試圖用一連串的 `useState` 並期望它們立即生效，你就會陷入「非同步地獄」。這通常是該考慮將邏輯封裝進 `useEffect`，或是直接將其重構為 `useReducer` 的訊號。

---

## 總結：useState 的 Code Review 清單

下次當你寫下 `useState` 時，請快速在腦中跑過這份檢查清單：

1. **這是衍生資料嗎？** 如果這個值可以透過現有的 props 或 state 計算出來，請移除這個 `useState`，改在渲染時計算。
2. **我有依賴前一個狀態嗎？** 如果是，請務必使用 `setCount(prev => prev + 1)` 函式更新模式，避免 Stale Closure。
3. **我是否試圖在 setState 後立即讀取它？** 記住它是快照，請直接使用你傳進去的新值變數。
4. **狀態是否過於破碎？** 如果你有五、六個 state 總是同時被更新，或許這是一個該把它們組合成一個物件，或者使用 `useReducer` 的信號。

## 邁向複雜狀態管理

我們已經看過 `useState` 如何處理單一或簡單的狀態。但在實際開發媒體 APP 時，情況往往更複雜。想像一個「影片編輯器」的 state：它包含影片名稱、剪輯片段列表、背景音樂、濾鏡強度。

如果你用 `useState` 來管理，你的程式碼會充滿了 `setSegments([...segments, newSeg])` 這種展開語法，而且更新邏輯會散落在各個按鈕的點擊事件中。這不僅難以閱讀，更容易在處理深層物件時不小心遺漏了某個欄位，導致 UI 崩潰。

這正是我們下一節要討論的主題：當 `useState` 開始讓程式碼變得「醜陋」且難以預測時，如何透過 `useReducer` 建立一套清晰的狀態轉換規則。

## 關鍵思維

> 狀態（State）不只是數據的儲存槽，它是對「當前 UI 呈現什麼」的描述。保持狀態的精簡（避免衍生狀態）與更新的原子性（使用 Functional Updater），是打造穩定 React Native APP 的第一步。

---

## 銜接下一個主題

在掌握了 `useState` 的陷阱後，你會發現有時候邏輯真的太複雜了，多個 state 互相牽扯，更新 A 的時候必須同時更新 B。這時，我們需要一種更具結構性的方式來定義「狀態如何改變」。下一課，我們將深入探討 `useReducer` 的設計邏輯，學習如何將散亂的更新邏輯整合成可預測的狀態機。
