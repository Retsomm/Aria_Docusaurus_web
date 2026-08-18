---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 7 堂：狀態管理完整梳理

# useEffect 的同步語義

如果你曾被 `useEffect` 搞得焦頭爛額——明明設定了依賴陣列卻陷入無限迴圈、明明 state 更新了但 Effect 拿到的卻是舊值、或是 APP 切換頁面後背景還在跑之前的計時器——你並不孤單。

在 React Native 的開發中，`useEffect` 是最容易被誤用、也最常產生難以追蹤之 Bug 的地方。這種痛苦通常源於一個根深蒂固的誤解：我們習慣將 `useEffect` 視為 Class Component 時代「生命週期方法」（Lifecycle Methods）的替代品。

這一章節的目標，是要幫你徹底洗掉「生命週期」的舊思維，建立起 **「同步（Synchronization）」** 的核心心智模型。只有理解了這一點，你才能真正掌控副作用，而不是被副作用掌控。

---

## 從「生命週期」轉向「同步」的心智模型

在早期的 React 開發中，我們會問：「這個元件掛載（Mount）了嗎？」、「它更新（Update）了嗎？」。對應的 API 是 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount`。

但在 Hooks 的世界裡，這種思考方式會讓你寫出破碎且難以維護的邏輯。

### 為什麼生命週期模型會失效？

想像一個內容類 APP，你有一個顯示影片詳情的頁面 `VideoDetailScreen`，它接收一個 `videoId` 作為 prop。

如果你用生命週期的思維來寫：

1. **Mount 時**：根據 `videoId` 抓取資料。
2. **Update 時**：檢查 `videoId` 是否改變？如果有，再抓一次資料。
3. **Unmount 時**：取消正在進行的請求。

這看起來很合理，但邏輯被拆散到了三個不同的地方。如果你漏掉第 2 步（這在複雜的元件中極常發生），當使用者從「推薦影片 A」點擊跳轉到「推薦影片 B」時，你的頁面可能還停留在影片 A 的資料。

### 正確模型：Effect 是為了同步外部系統

React 的核心原則是 **UI = f(state)**。React 負責管理內部的狀態與 UI 渲染。然而，現實世界中有許多東西是 React 管不到的，例如：

- 伺服器端的 API 資料。
- 瀏覽器或原生的 API（如計時器、網路狀態監聽）。
- 原生媒體播放器（如 `expo-av` 或 `react-native-video`）的狀態。

這些被稱為 **副作用（Side Effects）**。

`useEffect` 的真正語義是：**「讓這個元件以外的某個系統，與元件目前的 props 和 state 保持同步。」**

當你寫下 `useEffect` 時，你應該想的是：

> 「只要 `videoId` 是這個數值，我就要確保抓取的資料是對應這個 ID 的。我不管它是第一次出現、還是從另一個 ID 變過來的。」

這種「聲明式」的同步思維，能讓你把關注點從「什麼時候發生」轉移到「目前的狀態應該對應什麼樣的副作用」。

![](assets/image-d33c47b0-d15c-4a5b-9436-f39d7765f123.png)

---

## 依賴陣列的真相：同步的契約

`useEffect` 的第二個參數——依賴陣列（Dependency Array），是決定同步何時觸發的關鍵。

### 它不是「觸發器」，而是「同步鍵」

很多人會把依賴陣列當成 `onClick` 這種觸發按鈕。但更精確的說，依賴陣列是在告訴 React：**「這個 Effect 使用了這些外部變數，如果這些變數沒變，代表同步狀態仍然有效，不需要重新執行。」**

React 使用的是 `Object.is`（淺比較）來比對依賴陣列中的每一項：

- **原始型別（string, number, boolean）**：值變了，Effect 就重跑。
- **物件或陣列（Object, Array）**：**引用（Reference）** 變了，Effect 就重跑。

這就是為什麼在 Topic 4.1 中提到的「衍生狀態」如果處理不當，會導致 `useEffect` 無限重跑的原因——因為每次渲染產生的新物件引用都會觸發同步。

### 誠實原則：不要欺騙 React

關於依賴陣列，有一個絕對禁令：**永遠不要在 Effect 裡使用了某個變數，卻不把它放進依賴陣列。**

如果你「欺騙」了 React，就會遇到著名的 **Stale Closure（過時閉包）** 問題。

```javascript
// ❌ 錯誤示範：欺騙 React
useEffect(() => {
  const interval = setInterval(() => {
    // 這裡讀取的 count 會永遠被鎖定在 Effect 建立時的那一刻（例如 0）
    console.log("Current count:", count); 
  }, 1000);
  
  return () => clearInterval(interval);
}, []); // ⚠️ 你跟 React 說「我沒有依賴」，但你明明用了 count
```

在上面的例子中，即便 `count` 更新了，`setInterval` 裡的閉包依然指向舊的渲染環境。正確的做法是將 `count` 加入依賴（或使用 Topic 4.1 提到的 functional updater）。

---

## Cleanup 函數：負責任的結尾

`useEffect` 可以回傳一個函數，這被稱為 **Cleanup 函數**。這不是「只有在元件死掉時才執行的清理」，它的行為比你想像的更頻繁。

### Cleanup 的執行時機

這是初學者最常搞錯的地方。Cleanup 的執行邏輯是：

1. 發生 Render N+1。
2. **執行 Render N 產生的 Cleanup。**
3. 執行 Render N+1 產生的 Effect。

換句話說，**在每次重新執行同步之前，React 都會先幫你清理掉上一次同步留下的痕跡。**

### 為什麼需要 Cleanup？

在行動開發中，Cleanup 極其重要。因為手機資源有限，且原生模組（如相機、感測器）往往具有排他性。

1. **防止記憶體洩漏**：清除 `setTimeout` 或 `setInterval`。
2. **取消網路請求**：如果使用者快速切換頁面，你應該取消前一個尚未完成的 `fetch`，避免回傳的資料蓋掉新頁面的資料（Race Condition）。
3. **移除事件監聽**：這在 React Native 中最為常見，例如監聽鍵盤彈出、網路連線狀態或硬體按鍵。

---

## 實戰場景：媒體 APP 的副作用管理

讓我們將上述心智模型應用到實際的內容類 APP 場景中。

### 場景一：根據 ID 同步影片詳情

假設我們要實現一個影片播放頁面，當 `videoId` 改變時，我們需要抓取新的影片資訊並重設播放器。

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const VideoPlayerScreen = ({ videoId }) => {
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    // 1. 同步開始：設定一個 flag 防止 Race Condition
    let isSubscribed = true;

    const fetchVideo = async () => {
      try {
        const response = await fetch(`https://api.myapp.com/videos/${videoId}`);
        const data = await response.json();
        
        // 只有當這個 Effect 實例依然是「最新」的，才更新狀態
        if (isSubscribed) {
          setVideoData(data);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      }
    };

    fetchVideo();

    // 2. Cleanup 函數：當 videoId 改變，或元件卸載時
    return () => {
      // 將 flag 設為 false，這樣舊的非同步請求即便完成了也不會影響 UI
      isSubscribed = false;
      console.log(`Cleaning up synchronization for ${videoId}`);
    };
  }, [videoId]); // 同步鍵：只有 videoId 變了才重啟同步

  if (!videoData) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Playing: {videoData.title}</Text>
      {/* 這裡會接上原生播放器元件 */}
    </View>
  );
};
```

### 場景二：處理原生 API 的監聽（如網路狀態）

媒體 APP 經常需要根據網路狀況調整影片畫質。我們可以使用 `react-native-netinfo` 來實現同步。

```tsx
import NetInfo from "@react-native-community/netinfo";

useEffect(() => {
  // 同步外部系統：訂閱網路狀態改變
  const unsubscribe = NetInfo.addEventListener(state => {
    console.log("Connection type", state.type);
    console.log("Is connected?", state.isConnected);
    
    if (!state.isConnected) {
      Alert.alert("網路中斷", "請檢查您的網路連線以繼續播放");
    }
  });

  // 負責任的結尾：當元件不再需要監聽時，移除訂閱
  // 如果漏掉這一步，即便使用者離開此頁面，
  // 網路一斷開，APP 還是會跳出上面的警告視窗
  return () => {
    unsubscribe();
  };
}, []); // 這裡用空陣列，因為我們是要跟「整個元件的生命週期」同步這個監聽器
```

### 場景三：媒體播放器的計時器同步

如果你在實作一個自定義的進度條，你可能會用到 `setInterval`。

```tsx
useEffect(() => {
  if (!isPlaying) return; // 只有播放時才需要同步計時器

  const timer = setInterval(() => {
    setCurrentTime(prev => prev + 1);
  }, 1000);

  // 當暫停（isPlaying 變 false）或 videoId 變了
  // 上一個 interval 會被這裡清理掉
  return () => clearInterval(timer);
}, [isPlaying, videoId]); 
```

---

## 總結與核心準則

要用好 `useEffect`，請記住以下三條鐵律：

1. **它是「同步」而非「事件」**：不要問「這件事什麼時候發生？」，而要問「目前的狀態應該與什麼外部系統保持同步？」。
2. **對依賴陣列保持誠實**：所有在 Effect 內部使用的變數，都必須宣告在陣列中。如果你覺得某個依賴會導致多餘的執行，那通常代表你的程式碼邏輯（如衍生狀態）需要重構，而不是應該隱瞞依賴。
3. **凡事必有清理**：養成習慣，只要在 Effect 裡啟動了非同步任務、訂閱或計時器，第一時間就寫好 Cleanup 函數。

理解了 `useEffect` 的同步語義後，你已經掌握了 React 處理副作用的最強大武器。但在處理大規模 APP 時，如果所有的業務邏輯都散落在各個元件的 `useEffect` 中，會讓代碼變得難以追蹤。

![](assets/image-a7981a07-aa73-423e-aace-f80c4c9db13e.png)

## 下一步：狀態管理的架構層

在掌握了 `useState`、`useReducer` 與 `useEffect` 這些基礎工具後，你可能會發現：當狀態需要在多個頁面間共享（例如使用者的登入資訊、購物車內容），單純靠 prop drilling 或元件內部的 Effect 會顯得力不從心。

接下來，我們將進入狀態管理的進階架構，探討 `Context API` 的真正定位及其效能瓶頸，並了解為何現代 React Native 專案往往會引入 `Zustand` 或 `TanStack Query` 這種外部工具來區分「客戶端狀態」與「伺服器狀態」。
