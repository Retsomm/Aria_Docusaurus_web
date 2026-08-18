---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 11 堂：效能基礎全覽

# memo、useCallback 與 useMemo

想像一下，你正在開發一款影片串流 APP 的搜尋頁面。頁面頂端有一個搜尋框（TextInput），下方則是用 `FlatList` 展示的 50 個熱門影片卡片（VideoCard）。

當你在搜尋框輸入一個字母時，React 的狀態（state）隨之更新，頁面重新渲染。這聽起來很正常，對吧？但如果你在 `VideoCard` 元件裡放一個 `console.log('Rendering VideoCard')`，你會驚訝地發現：每打一個字，控制台就會瞬間噴出 50 條訊息。

即使這 50 個影片的標題、封面圖、點閱數完全沒變，React 依然勤奮地把這 50 個元件全部重跑了一遍。這就是 React 預設的「溫馨服務」——但對於追求流暢度的行動裝置來說，這往往是效能卡頓的萬惡之源。

在上一部分中，我們學會了如何透過「虛擬化」減少畫面上元件的數量。現在，我們要深入核心，學習如何減少這些剩餘元件不必要的渲染「頻率」。

## React 重新渲染的真相：Render 與 Commit

在優化效能之前，我們必須先釐清一個極其重要的概念：**「重新渲染（Re-render）」到底發生了什麼？**

在 React Native 中，一個元件的更新過程可以拆解為兩個階段：

### 1. Render 階段（JS Thread 的計算）

當元件的 state 或 props 改變時，React 會呼叫你的函式元件，計算出一個新的「虛擬 DOM（在 RN 中是 Virtual UI Tree）」。

- **關鍵點：** 這個過程發生在 **JS Thread**。
- **代價：** 如果你的元件很多，或者計算邏輯很複雜（例如在 render 函式裡做大型陣列排序），JS Thread 就會被佔滿，導致無法及時處理使用者手勢或傳送指令給原生層，造成掉幀。

### 2. Commit 階段（UI Thread 的繪製）

React 會比較「舊的樹」與「新的樹」之間的差異（Diffing）。如果發現標題從「影片 A」變成了「影片 B」，它就會傳送指令給原生層（Native Layer），叫 iOS 的 `UILabel` 或 Android 的 `TextView` 去更新文字。

- **關鍵點：** 這個過程會影響到 **UI Thread**。
- **冷知識：** 如果 Render 階段計算完後，發現「新的樹」跟「舊的樹」長得一模一樣（內容沒變），React 就不會對原生層下指令。

**這產生了一個常見的誤解：** 「既然畫面沒變，React 就不會浪費效能吧？」
錯了。即使 Commit 階段被跳過了，**Render 階段的 JS 計算依然發生了**。在我們的影片列表例子中，50 個 `VideoCard` 的 JS 函式全部重跑了一遍，這佔用了寶貴的 JS Thread 時間。當列表很大時，這種「雖然沒改畫面但一直在算」的行為，就是讓你的 APP 感覺手感不靈敏的主因。

## React.memo：組件的記憶防線

React 的預設規則非常簡單暴利：**只要父元件更新，所有子元件預設都會重新渲染。**

為了打破這個規則，我們需要 `React.memo`。它是一個「高等級元件（HOC）」，作用就像是在元件門口放一個保安，幫你檢查進來的 props。

### 運作原理：淺比較（Shallow Comparison）

`React.memo` 會緩存（Cache）上一次渲染的結果。當父元件要求子元件更新時，`memo` 會拿出「舊的 props」跟「新的 props」進行對比：

- **如果 props 沒變：** 直接回傳上次算好的結果，跳過整個 Render 階段。
- **如果 props 變了：** 乖乖執行 Render。

我們來看看優化後的 `VideoCard`：

```tsx
import React, { memo } from 'react';
import { View, Text } from 'react-native';

const VideoCard = ({ title, views }) => {
  console.log('VideoCard 正在渲染:', title);
  return (
    <View>
      <Text>{title}</Text>
      <Text>點閱數：{views}</Text>
    </View>
  );
};

// 使用 memo 包裹
export default memo(VideoCard);
```

現在，當你在搜尋框輸入文字時，只要 `title` 和 `views` 沒變，控制台就不會再彈出那 50 條訊息。這就是「優化後」的執行路徑：JS Thread 發現 props 一致，直接收工，省下了大量的計算資源。

### 淺比較的陷阱

「淺比較」意味著它只檢查基本型別（String, Number, Boolean）的值是否相等，或者物件/陣列的**引用位址（Reference）**是否相同。

如果你傳入了一個物件：

```tsx
<VideoCard info={{ title: 'React 教學', views: 100 }} />
```

即使內容沒變，但在 JavaScript 中，每次父元件 render 時，`{ title: ... }` 都會創建一個新的物件（新的記憶體位址）。這會導致 `memo` 判定「props 變了」，優化直接失效。這就是為什麼我們需要接下來介紹的兩位夥伴。

## useCallback：穩定函式的身份證

在 React Native 開發中，我們經常會把點擊事件傳給子元件：

```tsx
// 父元件
const VideoList = () => {
  const [text, setText] = useState('');

  const handlePress = () => {
    console.log('點擊了影片');
  };

  return (
    <View>
      <TextInput onChangeText={setText} />
      <VideoCard onVideoPress={handlePress} />
    </View>
  );
};
```

**問題來了：** 即使 `VideoCard` 用了 `memo`，當 `text` 改變時，父元件重新渲染，`handlePress` 函式也會被重新創建。對於 JavaScript 來說，新的 `handlePress` 雖然邏輯一樣，但它是個全新的物件。`VideoCard` 看到 props 裡的 `onVideoPress` 變了，於是又重跑了 render。

這就是 `useCallback` 的登場時刻。它的作用不是讓函式跑得更快，而是**確保函式在多次渲染之間保持同一個記憶體位址**。

```tsx
const handlePress = useCallback(() => {
  console.log('點擊了影片');
}, []); // 依賴陣列為空，表示這個函式在元件生命週期內永遠不會變
```

使用了 `useCallback` 後，`handlePress` 的「身份證」固定了，`React.memo` 終於能發揮作用，成功擋住不必要的渲染。

### 常見誤解：useCallback 能加速函式定義？

很多開發者會想：「那我是不是所有的函式都要包 `useCallback`？」
**答案是：絕對不要。**
定義一個函式的開銷極小。`useCallback` 本身也有額外的邏輯和記憶體開銷。

- **錯誤心態：** 「我用 `useCallback` 是為了讓這段程式碼跑更快。」
- **正確心態：** 「我用 `useCallback` 是為了防止下游那些被 `memo` 的子元件產生不必要的 re-render。」

## useMemo：昂貴計算的避風港

如果說 `useCallback` 是為了穩定「函式引用」，那麼 `useMemo` 就是為了穩定「值」或「複雜計算結果」。

假設你的媒體 APP 有一個功能，需要對 1000 條影片評論進行複雜的關鍵字過濾與排序：

```tsx
const SearchScreen = ({ comments }) => {
  const [searchText, setSearchText] = useState('');

  // 假設這個過濾邏輯很吃效能
  const filteredComments = comments.filter(c => c.text.includes('推薦')).sort(...);

  return (
    <View>
      <TextInput value={searchText} onChangeText={setSearchText} />
      <FlatList data={filteredComments} ... />
    </View>
  );
};
```

當你在搜尋框打字時，`setSearchText` 觸發重新渲染。雖然 `comments` 陣列完全沒變，但 React 還是會重新跑一次那段昂貴的 `filter` 與 `sort` 邏輯。

這時候，你可以用 `useMemo` 把結果「存」起來：

```tsx
const filteredComments = useMemo(() => {
  return comments.filter(c => c.text.includes('推薦')).sort(...);
}, [comments]); // 只有當 comments 改變時，才重新計算
```

這樣一來，只要原始評論資料沒變，無論你搜尋框怎麼打字，`filteredComments` 都會直接從記憶體拿上次算好的結果，JS Thread 壓力瞬間歸零。

## 過度優化的陷阱：何時該收手？

學會了這三招，很多開發者會開始「地毯式優化」，把所有的元件都包上 `memo`，所有的 props 都包上 `useCallback`。這其實是一個嚴重的**反模式（Anti-pattern）**。

### 為什麼過度優化有害？

1. **比較也是有成本的：** `React.memo` 的淺比較需要時間。如果你的一個元件非常簡單（例如只顯示一行靜態文字），直接 render 的速度可能比跑一遍 props 比較的邏輯還要快。
2. **記憶體壓力：** `useMemo` 和 `useCallback` 會持續佔用記憶體來儲存那些值與依賴陣列。在記憶體有限的手機上，過多無意義的緩存反而會導致 APP 變慢。
3. **程式碼可讀性：** 滿螢幕的 `useCallback` 會讓業務邏輯變得難以閱讀和維護。

### 什麼時候「不該」優化？

- **Props 變動頻繁：** 如果一個元件的 props 幾乎每次父級更新時都會變（例如動畫中的座標值），包 `memo` 只是白白浪費比較時間，因為它注定會重新渲染。
- **計算量極輕：** 如果只是簡單的加減乘除或小陣列操作，沒必要用 `useMemo`。
- **元件層級很淺：** 如果你的子元件本身就渲染得飛快，那就讓它 render 吧。

### 什麼時候「必須」優化？

- **列表項（FlatList 裡的 Item）：** 這是 RN 效能重災區。當列表很長時，Item 必須用 `React.memo`。
- **渲染極其沉重的元件：** 包含大量 SVG、複雜圖表或多媒體播放器的元件。
- **傳遞給第三方高效能組件：** 某些第三方套件（如 `react-native-reanimated` 的某些屬性）對引用穩定性有嚴格要求，不給 `useCallback` 可能會導致動畫跳動或報錯。

## 總結：建立效能優化的決策框架

在處理 React Native 的渲染效能時，你應該遵循以下思考路徑：

1. **先確認有沒有問題：** 利用 React Profiler（我們會在下一節詳細教）觀察是否有明顯的掉幀。不要過早優化。
2. **打破連鎖反應：** 找出那些「明明沒改，卻一直 re-render」的大型子元件，幫它加上 `React.memo`。
3. **修復引用斷裂：** 檢查傳給 `memo` 元件的 props。如果是函式，用 `useCallback`；如果是物件或運算結果，用 `useMemo`。
4. **檢查依賴誠實性：** 確保 `useCallback` 和 `useMemo` 的依賴陣列（Dependency Array）完整，避免因為引用舊的 state（Stale Closure）而產生 bug。

## 銜接下一個挑戰

理解了如何控制 JS Thread 的渲染頻率後，你已經掌握了 React 效能優化的核心。然而，有一種場景是 `memo` 也難以拯救的：**動畫**。

如果你的動畫邏輯依然跑在 JS Thread 上，那麼即使你把 re-render 優化到了極致，一旦 JS Thread 出現哪怕 0.1 秒的阻塞，你的動畫還是會卡頓。在下一個部分，我們將探討如何將動畫邏輯徹底移交給 **UI Thread**，並學習如何使用強大的診斷工具來視覺化你的 APP 效能瓶頸。

## 關鍵要點與後續導引

### 核心觀念

- React 的 **Render 階段** 在 JS Thread 執行，計算 UI 差異；**Commit 階段** 在 UI Thread 執行，進行原生繪製。
- 預設情況下，父元件更新會觸發所有子元件的 Render 階段，即使內容未變。
- `React.memo` 透過**淺比較** props 來攔截不必要的渲染。
- `useCallback` 與 `useMemo` 的核心價值在於提供**穩定的引用位址**，讓 `memo` 能夠成功運作。
- **過度優化**會帶來額外的計算與記憶體開銷，應針對「高頻更新」或「渲染沉重」的場景進行精準打擊。

接下來，我們將進入本主題的最後一部分，學習如何處理那些連 JS Thread 都處理不來的視覺挑戰：高效能動畫與效能診斷工具實作。我們會聊聊為什麼 `Reanimated` 是現代 RN APP 的標配，以及如何像醫生一樣診斷 APP 的健康狀況。
