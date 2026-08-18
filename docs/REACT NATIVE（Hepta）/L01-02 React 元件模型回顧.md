---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 1 堂：RN 是什麼，怎麼運作的

# React 元件模型回顧

在我們深入探討 React Native（RN）如何與 iOS 或 Android 原生層溝通之前，我們必須先停下來，釐清一個至關重要的問題：**當你在寫 React 程式碼時，你到底在寫什麼？**

你已經利用 AI 工具獨立開發並上架了兩款 APP，對於 `useState`、`useEffect` 或 `<View>` 可能已經非常熟悉。但 AI 產出的程式碼往往只給了你「結果」。當你想要優化效能，或是遇到那種「明明資料改了，畫面卻沒變」的靈異現象時，如果沒有紮實的 React 核心心智模型，你將會陷入無止盡的試錯。

React Native 的強大，並非因為它發明了什麼新的程式語言，而是因為它將 React 那套極度優雅的「宣告式 UI」邏輯，成功嫁接到行動裝置的作業系統上。因此，這一部分我們要拆解 React 的靈魂，重新認識這個讓你 APP 跑起來的核心模型。

## JSX 的真相：它從來就不是 HTML

這可能是所有從 Web 轉 RN，或直接上手 RN 的開發者最容易產生的第一個誤解：認為 JSX 是一種標記語言。

在 Web 開發中，你會寫 `<div>`；在 RN 中，你會寫 `<View>`。看起來像 HTML，對吧？但事實上，**JSX 只是 JavaScript 的語法糖**。

### 為什麼這點很重要？

想像一下，如果 JSX 真的是 HTML，那麼手機作業系統（iOS 或 Android）根本看不懂。它們的原生語言是 Swift/Objective-C 或 Kotlin/Java，它們完全不知道 `<div>` 是什麼。

當你的專案進行編譯時，所有的 JSX 都會被轉換成純 JavaScript 呼叫。例如，這段代碼：

```javascript
<View style={{ padding: 10 }}>
  <Text>Hello React Native</Text>
</View>
```

在底層其實會變成類似這樣的呼叫（在現代 React 中由 JSX runtime 處理）：

```javascript
React.createElement(View, { style: { padding: 10 } }, 
  React.createElement(Text, null, "Hello React Native")
);
```

這告訴我們一個深刻的道理：**JSX 本質上是在描述一個 JavaScript 物件（Object）**。這個物件描述了 UI 應該長什麼樣子，包含了類型、屬性（props）以及子元素（children）。

**這就是為什麼你不能在 React Native 裡使用 **`**<div>**`** 或 **`**<span>**`**。** 在網頁端，React 知道如何將 `React.createElement('div')` 對應到瀏覽器的 DOM 元素；但在手機端，React Native 找不到與 `div` 對應的原生視圖。相反地，`<View>` 被 RN 映射到了 iOS 的 `UIView` 或 Android 的 `android.view.View`。

理解了 JSX 是 JavaScript 物件後，你就能明白為什麼我們可以在 JSX 中自由地寫邏輯（如 `{isLoggedIn && <Profile />}`），因為那本質上就是在處理 JavaScript 的邏輯運算。

## 元件（Component）：UI 的最小封裝單位

在你的媒體 APP 中，你可能已經寫了許多元件：`VideoCard`、`Header`、`CommentItem`。

React 的核心哲學是：**萬物皆元件**。一個元件就是一個獨立的、可複用的、且封裝了自身邏輯與外觀的單元。

### 從 Class 到 Functional Components

你現在在 AI 生成的程式碼中看到的，幾乎 99% 都是 **Functional Components（函式元件）**。這是一個非常重要的演進。早期的 React 鼓勵使用類別（Class），但現在我們更傾向於將元件看作是一個「純粹的轉譯函式」：

> **UI = f(data)**

給予相同的資料（data），這個函式（元件）就應該回傳相同的 UI。這種思維讓你開發 APP 時不再需要手動去操作 UI。你不必寫「找到那個按鈕，把它顏色改成紅色」，你只需要寫「如果現在是按讚狀態，按鈕顏色就是紅色」。

## Props 與單向資料流：資料的契約

元件之間需要溝通，而 **Props** 就是它們溝通的唯一橋樑。

### 什麼是單向資料流？

在 React 的世界裡，資料的流動像是一條瀑布：**永遠由上而下（從父元件傳給子元件）**。

- **父元件**：負責決定要傳什麼資料下去。
- **子元件**：負責接收資料並渲染。

這裡有一個關鍵的規則：**Props 是唯讀的（Read-only）**。子元件絕對不能、也不應該去修改它接收到的 props。

為什麼要這麼嚴格？想像如果你正在開發一個媒體清單，父元件傳入了一個 `videoUrl` 給 `VideoPlayer` 元件。如果 `VideoPlayer` 可以隨便修改這個 URL，那麼父元件手中的資料就會跟畫面顯示的不一致，導致整個 APP 的狀態變得不可預測。這就是為什麼 React 強制要求，如果你想改變資料，必須透過「狀態管理」並通知父元件去更新，而不是直接修改 props。

## State：元件內部的「記憶」

如果 Props 是外部傳進來的指令，那麼 **State** 就是元件內部的「記憶」。

在你的媒體 APP 裡，「目前影片是否正在播放」、「使用者輸入的搜尋關鍵字」、「按讚數是否增加」，這些都是 state。

### 響應式更新：React 的核心魔力

這是初學者最容易卡關的地方：**為什麼我改了一個變數的值，畫面卻沒變？**

```javascript
// 錯誤範例
function LikeButton() {
  let count = 0; // 這只是個普通的變數
  
  const handlePress = () => {
    count = count + 1; // 變數值確實變了，但 React 不知道
  };

  return <Button title={`讚 ${count}`} onPress={handlePress} />;
}
```

在上面的例子中，`count` 的值確實增加了，但 UI 卻一動也不動。這是因為 **React 只會監控透過 **`**useState**`** 勾子（Hook）宣告的狀態**。

當你呼叫 `setCount(count + 1)` 時，你不是在修改一個變數，你是**發出了一個訊號告訴 React**：「我的狀態變了，請幫我重新渲染這個元件！」

## Re-render 的心智模型：資料改變 -> 觸發渲染 -> 更新 UI

理解了 State，我們就能建立起 React 最完整的心智模型：**Re-render（重新渲染）循環**。

1. **觸發（Trigger）**：使用者點擊了按讚按鈕。
2. **更新狀態（Set State）**：你呼叫了 `setIsLiked(true)`。
3. **渲染（Render）**：React 再次執行你的元件函式。
4. **計算差異（Diffing）**：React 比較這一次回傳的 JSX 物件跟上一次有什麼不同（例如：顏色從透明變成紅色）。
5. **提交（Commit）**：React Native 收到差異通知，將這個變化更新到手機的原生 UI 上。

### 注意：RN 的終點不是 DOM

在網頁端，第 5 步是更新瀏覽器的 DOM 樹。
在 React Native 中，第 5 步是透過一個稱為「Bridge」或「JSI」的機制，告訴 iOS 和 Android 的原生層：「嘿，請把這個 `UIImageView` 的顏色換一下」。

這就是為什麼 React Native 能保持原生效能的原因：**邏輯運算在 JavaScript 端完成，而最後的繪製動作交給了手機最擅長的原生引擎。**

## 實戰連結：以媒體 APP 的「按讚」功能為例

讓我們把上述所有概念組合起來，看看在你目前的 APP 中，一個簡單的「愛心按讚」功能是如何運作的：

### 1. 初始狀態

你的 `HeartButton` 元件內部有一個 state：`isLiked`，預設為 `false`。
React 渲染它，產出一個描述：「這是一個愛心形狀的 Icon，顏色是灰色」。

### 2. 使用者動作

使用者點擊了愛心。你在 `onPress` 事件中執行了 `setIsLiked(true)`。

### 3. 觸發 Re-render

React 偵測到 `isLiked` 從 `false` 變成了 `true`。它「重新執行」一次你的 `HeartButton` 函式。

### 4. 產生新的描述

這一次，函式回傳的新 JSX 描述變成了：「這是一個愛心形狀的 Icon，顏色是 **紅色**」。

### 5. 跨平台更新

React Native 比較了前後兩次描述，發現只有「顏色」變了。它立刻發送指令給原生系統：

- **iOS**：將對應的 `UIImageView` 的 `tintColor` 設為紅色。
- **Android**：將對應的 `ImageView` 的 `colorFilter` 設為紅色。

使用者就在畫面上看到愛心瞬間變紅了。

## 為什麼這能幫你讀懂 AI 的程式碼？

當你下次看到 AI 產生一段長長的程式碼時，不要去看那些細節。先問自己三個問題：

1. **這個元件的 Props 是什麼？**（它接收了哪些外部資料？）
2. **這個元件的 State 有哪些？**（它有哪些會隨時間改變的內部記憶？）
3. **什麼時候會觸發 Re-render？**（在哪個 `useEffect` 或 `onPress` 裡呼叫了 `setState`？）

只要掌握了這三個關鍵點，你就能瞬間理清任何複雜元件的運行邏輯，而不只是依賴 AI 給你的黑盒代碼。

## 重點回顧

- **JSX 是 JS 物件**：它是 UI 的藍圖，而不是最終的 UI。
- **Props 是單向的契約**：父傳子，子不能改。
- **State 是響應式的記憶**：改變它會觸發 React 的重新渲染機制。
- **UI = f(state)**：你的畫面是狀態的反映，React 負責幫你同步兩者。
- **RN 的特殊性**：渲染循環的終點是「原生 UI Tree」，而非瀏覽器的 DOM。

在下一部分中，我們將會更深入地探討這個「終點」——也就是 React Native 的渲染機制。我們會解開「JavaScript 怎麼跟原生層溝通」的秘密，並了解為什麼有時候 APP 會感到卡頓。

## 銜接下一個主題：RN 的渲染引擎

你現在已經掌握了 React 的軟體邏輯層：它是如何透過 Data 來控制 UI 的。但這僅僅是故事的一半。在瀏覽器中，這一切發生在一個單一的執行緒上。但在 React Native 裡，事情變得有趣了——我們有 JavaScript 的世界，也有原生系統（iOS/Android）的世界。

下一節，我們將探討 **RN 不是瀏覽器：渲染機制的本質差異**。我們將揭開 JS 是如何跨越那道看不見的邊界，操作手機內部的原生元件。這將幫助你理解為什麼 RN 既有 JS 的靈活性，又能保有接近原生的效能。
