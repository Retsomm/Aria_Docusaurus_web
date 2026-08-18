---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 6 堂：Navigation 機制深探

# Navigation 架構規劃最佳實踐

當你開始開發一個簡單的 APP 時，隨便把幾個頁面丟進 `Stack.Navigator` 裡通常不會出什麼大問題。但隨著你的內容/媒體類 APP 逐漸成長，功能開始變得複雜：你有了登入流程、底部標籤欄（Tabs）、深層的內容詳細頁、個人主頁，甚至還有需要覆蓋整個螢幕的影片播放器或圖片瀏覽器。

這時，一個沒經過良好規劃的導覽架構就會開始崩塌。你可能會發現：

- 為什麼我明明在首頁，點擊推播通知跳轉時卻會閃退？
- 為什麼我的影片播放器下方還看得到底部 Tab 的陰影？
- 為什麼我的導覽代碼檔案已經超過 500 行，連找個頁面名稱都困難重重？

Navigation 不只是「切換頁面」的工具，它是 APP 的骨架。一個優良的架構能讓你的資料流動變得透明，並讓後續的 Deep Linking 與狀態管理事半功倍。

## 導覽架構的設計目標

在內容與媒體類 APP 中，使用者通常會在「探索內容」與「深度消費」之間頻繁切換。一個專業的導覽架構應該達成以下三個目標：

1. **邏輯隔離（Logical Separation）：** 登入前的頁面不應該與登入後的頁面混在一起。這不僅是為了安全，更是為了簡化條件判斷。
2. **效能最佳化（Performance Optimization）：** 減少不必要的巢狀結構。每多一層 Navigator，React Navigation 就需要維護更多的狀態與監聽器，這會直接影響頁面切換的流暢度。
3. **語意清晰（Semantic Clarity）：** 透過代碼結構就能看出 APP 的功能層次。當你看到 `MainTabs` 時，你應該立刻知道這是 APP 的核心功能區。

## 拒絕「巢狀地獄」（Nesting Hell）

這是許多初學者最容易踩的坑：為了實現複雜的導覽，不斷地在 Navigator 裡面套 Navigator。例如：`Root Stack > Drawer > Main Tabs > Feed Stack > Detail Stack`。

### 為什麼過度巢狀是個災難？

- **導覽狀態複雜化：** 當你要從深層頁面獲取最頂層的狀態，或者要執行 `navigation.reset` 時，導覽路徑會變得異常複雜。
- **效能負擔：** 每一層 Navigator 都是一個獨立的 React 元件。過深的嵌套會增加 Bridge 的通訊開銷（在舊架構下尤為明顯），並導致內存佔用上升。
- **Deep Linking 配置困難：** 就像我們在 3.6 章節看到的，當你的層級太深，你在設定 `linking` 物件時必須對應所有的嵌套層次，這極易出錯且難以維護。

### 平衡策略：語意分層與扁平化

我們的原則應該是：**「盡可能扁平化，除非有語意上的必要性」**。
所謂語意上的必要性，通常指的是 UI 結構的改變。例如，你需要底部標籤列，那麼使用 `Tab.Navigator` 是合理的；你需要頁面從下方滑入的堆疊感，那麼使用 `Stack.Navigator` 是合理的。

## RootNavigator 模式：頂層總指揮

一個成熟的 RN 專案通常會有一個「頂層總指揮」，我們稱之為 `RootNavigator`。它的職責不是顯示內容，而是決定「現在該顯示哪一個大區塊」。

### 1. 驗證流程（Auth Flow）的優雅切換

不要使用 `navigation.navigate('Main')` 來處理登入成功。正確的做法是根據 `isLoggedIn` 狀態進行**條件渲染**。

```tsx
// RootNavigator.tsx
const RootStack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isLoggedIn } = useAuth(); // 從狀態管理中獲取

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // 登入後：顯示主功能區
          <RootStack.Screen name="MainApp" component={MainNavigator} />
        ) : (
          // 登入前：顯示登入/註冊區
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
```

**這樣做的理由：**
當 `isLoggedIn` 變為 `true` 時，`Auth` 區塊會被 React 直接從元件樹中移除並銷毀（Unmount），`MainApp` 會被掛載。這保證了使用者在登入後絕對無法透過「返回鍵」回到登入頁，且所有的導覽歷史都會自動重置。

### 2. 全螢幕 Modal 與播放器的掛載點

對於內容類 APP，全螢幕媒體播放器是一個核心功能。如果你把播放器放在 `MainTabs` 內部的 Stack 裡，你會發現它無法蓋住底部的標籤列。

**最佳實踐：** 將全螢幕組件（如播放器、大圖瀏覽器、全螢幕濾鏡選擇器）放在 `RootStack` 這一層。

```tsx
<RootStack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
  <RootStack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
  <RootStack.Screen name="ImageGallery" component={ImageGalleryScreen} />
</RootStack.Group>
```

這樣，無論使用者在 APP 的哪個角落觸發播放，播放器都能完美覆蓋整個螢幕，且與底層的業務邏輯保持適度的隔離。

## 媒體 APP 的典型架構結構

以一個類似 Instagram 或 YouTube 的媒體 APP 為例，我們可以建立以下三層架構：

### 第一層：RootStack (Stack)

這是整個 APP 的最高層級，負責：

- **Auth / Main 分流**
- **全螢幕 Modal 頁面**（播放器、發布新貼文的編輯器）

### 第二層：MainTabs (Tab)

當使用者登入後，這是他們看到的基礎 UI 框架，通常包含：

- **首頁 (Home)**
- **探索 (Explore)**
- **通知 (Notifications)**
- **個人主頁 (Profile)**

### 第三層：各標籤專屬的 Stack (Sub-Stacks)

為了讓每個 Tab 都有自己的導覽堆疊（例如在「首頁」點擊貼文進入詳情後，切換到「個人主頁」再切換回來，「首頁」仍應停留在詳情頁），我們需要為每個 Tab 配置一個專屬的 Stack。

**結構範例圖：**

```text
RootNavigator (Stack)
├── Auth (Stack)
│   ├── Login
│   └── Register
└── MainApp (Tabs)
    ├── HomeStack (Stack)
    │   ├── Feed
    │   └── PostDetail
    ├── ExploreStack (Stack)
    │   ├── Search
    │   └── CategoryView
    └── ProfileStack (Stack)
        ├── ProfileOverview
        └── Settings
```

## 程式碼組織與型別安全

當你的 APP 頁面變多，將所有內容寫在一個檔案會變成噩夢。 Aria，我強烈建議你採用「分層拆分法」。

### 1. 分離定義與配置

不要在 `App.tsx` 裡定義螢幕名稱字串。建立一個 `types.ts` 專門存放導覽參數。

```tsx
// navigation/types.ts
export type RootStackParamList = {
  MainApp: undefined;
  VideoPlayer: { videoId: string }; // 帶參數
  Auth: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
};
```

### 2. 模組化 Navigator

將每個 Stack 或 Tab 寫在獨立的文件中。

- `navigation/RootNavigator.tsx`
- `navigation/MainTabs.tsx`
- `navigation/HomeNavigator.tsx`

這樣的好處是，當你想修改「首頁」的導覽邏輯時，你只需要去 `HomeNavigator.tsx`，而不會意外影響到「個人主頁」。

### 3. 利用 TypeScript 強化型別檢查

對於已經上架的 APP，最怕的就是 `navigation.navigate('Oops', { data: 123 })` 因為拼錯字而閃退。透過定義 `ParamList` 並將其傳遞給 `createNativeStackNavigator<RootStackParamList>()`，IDE 會在編譯階段就告訴你路徑是否正確、參數是否遺漏。

## 導覽架構的「演化」策略

架構不是一成不變的。在開發初期，你可以保持扁平。但當你遇到以下情況，就是「重構」的信號：

1. **重複代碼過多：** 如果多個頁面都需要用到同一組導覽功能（例如，在首頁和搜尋頁都能進入個人主頁詳情），考慮將詳情頁抽離成獨立的 Screen 定義。
2. **狀態同步困難：** 當一個頁面的行為受到另一個 Navigator 狀態影響，可能意味著它們應該被放在同一個 Stack 下。
3. **效能瓶頸：** 如果在切換 Tab 時感到明顯延遲，檢查是否在 Tab 中渲染了過多複雜的 Navigator。

### 整合回顧：本章節的系統觀

我們在 Topic 3 走過了很長一段路：

- 我們首先理解了導覽的**堆疊本質**，知道它不是簡單的網頁跳轉。
- 我們學會了利用 **Screen Lifecycle (Focus/Blur)** 來控制媒體播放器的開關，避免效能浪費。
- 我們掌握了 **Params** 的傳遞禁忌，建立「只傳 ID」的共識，這為 **Deep Linking** 鋪平了道路。
- 我們看過 **Linking Config** 如何將 URL 對應到複雜的嵌套結構中。

而現在，這一切都匯聚成了一個穩健的**架構設計**。好的架構能保護你的 Lifecycle 邏輯不被打亂，能讓 Deep Linking 的路徑清晰，並讓 Params 的傳遞更具預測性。

## 接下來的學習路徑

導覽架構為 APP 建立了空間的骨架，但真正賦予這個骨架靈魂的是「資料」。當你在導覽堆疊中穿梭時，如何保證頁面 A 修改的內容，能即時反映在頁面 B 上？為什麼有時候頁面返回後資料卻沒更新？

這就是我們下一章 **Topic 4：狀態管理** 要解決的核心課題。我們將從 React 最基礎的 `useState` 出發，拆解 `useEffect` 的心智模型，最終建立一套讓資料在複雜導覽架構中順暢流動的判斷框架。

### 關鍵要點總結

- **RootNavigator 模式：** 透過條件渲染處理 Auth Flow，並將全螢幕 Modal 置於頂層。
- **避免過度嵌套：** 每層嵌套都要有明確的 UI 語意理由，否則應保持扁平。
- **型別安全：** 始終使用 TypeScript 定義 `ParamList`，將錯誤擋在開發階段。
- **媒體特性：** 全螢幕播放器應放在 Root Stack 以確保覆蓋權限。

當你準備好優化現有的導覽結構時，請試著畫出你目前 APP 的樹狀圖，看看哪裡存在「不必要的嵌套」或是「邏輯重疊」的部分。這將是從初學者走向架構師的第一步。
