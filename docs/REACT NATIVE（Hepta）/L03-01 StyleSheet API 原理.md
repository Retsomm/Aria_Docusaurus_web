---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 3 堂：樣式與佈局基礎

# StyleSheet API 原理

當你第一次打開 React Native 的專案，看到樣式是用 `StyleSheet.create` 定義在檔案底部，而不是像網頁端那樣引入 CSS 檔案，你可能會想：「這不就是把 JS 物件換個地方放嗎？直接寫在元件裡的 `style={{ color: 'red' }}` 不是更方便嗎？」

在 React 網頁開發中，內聯樣式（Inline Styles）通常只被視為「程式碼整潔度」的問題；但在 React Native 的世界裡，這是一個關乎**效能架構**的底層決策。

還記得我們在上一課討論過 JS 層與原生層（Native）之間的「橋樑」（Bridge）嗎？每一次樣式的傳遞，其實都是一次跨越國界的貿易。如果你每次都搬運整箱貨物（完整的樣式物件），而不只是傳遞一張提貨單（ID），你的 APP 很快就會在大量渲染時感到疲憊。

## 為什麼要用 StyleSheet.create？不只是為了整潔

在進入技術細節前，我們先建立一個直覺：**React Native 的樣式並不是在 JavaScript 裡執行的。**

雖然你用 JS 寫樣式，但最終繪製 UI 的是 iOS 的 `UIView` 或 Android 的 `View`。這意味著，樣式資訊必須從 JS 端傳送到原生端。

### 1. 序列化與橋接的成本

在 React Native 的舊架構（Bridge 模式）中，JS 與原生的溝通必須透過 JSON 序列化。想像一下，如果你有一個列表，裡面有 100 個元件，每個元件都在 re-render 時重新建立一個內聯樣式物件：

```javascript
// 每次 render 都會產生一個新的物件並序列化傳過 Bridge
<View style={{ width: 100, height: 100, backgroundColor: 'blue' }} />
```

這意味著 JS 引擎必須把這個物件轉成 JSON 字串，傳過 Bridge，原生端再解析它。雖然單個物件很小，但在每秒 60 幀的動畫或快速捲動的列表（FlatList）中，這種重複的負擔會積少成多，最終導致掉幀。

### 2. ID 化機制：傳遞「提貨單」而非「貨物」

當你使用 `StyleSheet.create` 時，React Native 會在初始化時做一件聰明的事：

1. **序列化一次**：它將樣式物件發送到原生端並快取起來。
2. **分配唯一的 ID**：原生端會回傳一個整數 ID 給 JS 端。
3. **僅傳遞 ID**：在後續的渲染中，JS 傳遞給原生的不再是 `{ width: 100, ... }`，而可能只是一個數字 `42`。

原生端看到 `42`，就知道要套用之前快取好的那套樣式。這大幅減少了 Bridge 上的資料傳輸量。雖然在最新的 JSI 架構（New Architecture）中，資料傳輸變得更直接，但這種「預先定義、重複引用」的模式依然是記憶體優化的核心。

## 記憶體優化：避免垃圾回收的壓力

除了通訊成本，另一個關鍵在於**記憶體管理**。

在 JavaScript 中，如果你寫 `style={{ fontSize: 16 }}`，這代表每次元件 re-render（即便 state 改變與樣式無關），JS 都會建立一個**新的物件**。

```javascript
function MyComponent() {
  // 每次 render，這份「樣式合約」都是新的記憶體空間
  return <View style={{ padding: 20 }} />;
}
```

這會帶來兩個問題：

- **垃圾回收（GC）壓力**：頻繁建立新物件，迫使 JS 引擎頻繁啟動垃圾回收來清理不再使用的舊樣式物件，這會造成微小的卡頓。
- **淺比較失效**：如果你將這個樣式傳給一個經過 `React.memo` 優化的子元件，子元件會因為樣式物件的引用（Reference）改變而判定「props 已更改」，導致不必要的重複渲染。

相比之下，`StyleSheet` 定義在元件外部，它的引用在整個 APP 生命週期中是**靜態不變**的。

## StyleSheet 的實用工具方法

除了優化效能，`StyleSheet` 還提供了幾個開發中不可或缺的工具。

### 1. StyleSheet.flatten()：處理樣式陣列的利器

在開發可複用的元件時，我們常會允許外部傳入樣式來覆蓋預設樣式：

```javascript
const MyButton = ({ style, label }) => {
  // 結合預設樣式與外部樣式
  const combinedStyle = StyleSheet.flatten([styles.defaultButton, style]);
  
  // 現在 combinedStyle 是一個乾淨的普通物件
  console.log(combinedStyle.backgroundColor); 
  
  return <View style={combinedStyle}>...</View>;
};
```

**為什麼需要它？**
React Native 的 `style` 屬性雖然支援陣列（如 `style={[styles.base, styles.active]}`），但有時你需要在程式碼中「讀取」最終合併後的數值（例如計算某個寬度）。`flatten` 會幫你把陣列（甚至包含 ID 的樣式）打平成一個標準的 JS 物件。

### 2. StyleSheet.absoluteFill 與 absoluteFillObject

這是佈局中最常見的快捷鍵。當你需要一個元件「填滿父容器」時（例如背景圖或 Loading 遮罩），你不需要重複寫：
`{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }`。

直接使用：

```javascript
<View style={StyleSheet.absoluteFill} />
```

如果你需要在填滿的基礎上微調（例如背景要黑一點），可以使用 `StyleSheet.absoluteFillObject` 來進行擴充：

```javascript
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  }
});
```

### 3. StyleSheet.hairlineWidth

在不同螢幕密度的手機上，「1 像素」的表現各不相同。有些高解析度螢幕（Retina）上，`1` 看起來會太粗。`StyleSheet.hairlineWidth` 會根據當前裝置自動計算出該平台上「最細的線」，這在畫分界線（Separator）時非常專業。

## 什麼時候「必須」用內聯樣式？

既然 `StyleSheet` 這麼好，我們是否應該完全禁用內聯樣式？

答案是否定的。**動態樣式**是內聯樣式的舞台。

如果你的樣式依賴於元件內部的 `state` 或 `props`（例如進度條的寬度、滑桿的顏色、或是根據使用者點擊位置產生的位移），那麼在 `StyleSheet` 裡預先定義就不切實際了。

**最佳實踐建議：**
將靜態、不變的樣式放在 `StyleSheet` 中，而將變動的部分提取出來。

```javascript
const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.container}>
      {/* 靜態樣式用 StyleSheet，動態樣式用 inline */}
      <View style={[styles.bar, { width: `${progress * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 10, backgroundColor: '#eee' },
  bar: { height: '100%', backgroundColor: 'blue' }
});
```

這樣做既保留了大部分的效能優化，又維持了程式碼的靈活性。

## 案例對比：大型列表的效能衝擊

為了感受差異，我們來看一個極端的案例。假設你正在開發一個類似 Instagram 的媒體串流 APP，裡面有一個 `FlatList` 展示 500 則貼文。

### 效能較差的寫法 (Inline Styles)

```javascript
<FlatList
  data={posts}
  renderItem={({ item }) => (
    <View style={{ padding: 16, borderRadius: 8, shadowColor: '#000' }}>
      <Text style={{ fontSize: item.isPriority ? 20 : 16 }}>{item.title}</Text>
    </View>
  )}
/>
```

當你快速捲動時，`FlatList` 會頻繁回收並重新建立 Item。每次 `renderItem` 執行，JS 都要重新分配記憶體給那幾個樣式物件。如果你在 Android 低端機上測試，會發現捲動時有明顯的「掉幀」或白屏。

### 效能優化的寫法 (StyleSheet)

```javascript
const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 8, shadowColor: '#000' },
  titleNormal: { fontSize: 16 },
  titlePriority: { fontSize: 20 }
});

// 在 renderItem 裡
<View style={styles.card}>
  <Text style={item.isPriority ? styles.titlePriority : styles.titleNormal}>
    {item.title}
  </Text>
</View>
```

在這種寫法下，無論 `FlatList` 跑多少次，它傳遞給原生的永遠是相同的 ID。JS 不需要新物件，原生端也不需要重新解析樣式。這就是「能動的 APP」與「流暢的 APP」之間的微小差別。

---

## 關鍵要點與銜接

### 總結

- **效能優化**：`StyleSheet.create` 將樣式序列化為 ID，減少了 JS 與原生端 Bridge 的傳輸開銷，這在舊架構中尤為明顯。
- **記憶體管理**：預定義樣式避免了每次 re-render 產生新物件的負擔，減少了垃圾回收（GC）的壓力，並有利於 `React.memo` 的淺比較。
- **工具箱**：學會使用 `flatten` 合併樣式，以及利用 `absoluteFill` 和 `hairlineWidth` 來提升開發效率與視覺精緻度。
- **動態取捨**：對於隨 state 頻繁變動的數值，使用內聯樣式是合理的；其餘情況應優先選擇 `StyleSheet`。

### 下一步

理解了樣式如何從 JS 傳遞到原生端，並學會了如何高效地管理它們之後，我們接下來要處理的是「空間問題」。

在網頁端，你可能習慣了 `div` 預設的 `display: block`。但在 React Native 中，所有的佈局都基於 Flexbox。下一部分，我們將深入探討 RN 的 Flexbox 規則——特別是那些與 CSS 截然不同、容易讓網頁開發者踩坑的預設行為。
