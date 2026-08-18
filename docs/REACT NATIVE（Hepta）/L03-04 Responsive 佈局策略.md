---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 3 堂：樣式與佈局基礎

# Responsive 佈局策略

當你在開發像內容或媒體類 APP 時，一定會遇到一個令人頭痛的現實：你的使用者可能拿著螢幕極小的 iPhone SE，也可能拿著巨大的 iPad Pro，甚至是長寬比奇特的 Android 摺疊機。如果我們在程式碼中寫死了樣式（例如 `width: 375`），那麼在不同裝置上，你的介面要麼顯得太擠，要麼留白過多，顯得極其不專業。

在網頁開發中，我們習慣使用 CSS Media Queries 來解決這個問題，但在 React Native 的世界裡，並沒有內建的 Media Queries。我們需要結合 Flexbox、百分比、以及 JavaScript 的邏輯判斷，來建立一套靈活的「響應式佈局 (Responsive Design)」策略。這不僅是為了讓 APP「能看」，更是為了提供一致的使用者體驗。

## 百分比 (%)：相對於父容器的局部邏輯

在 React Native 中，我們可以使用百分比字串來設定元件的尺寸（如 `width: '50%'`）。但這裡有一個最核心的觀念：**百分比永遠是相對於其「直接父容器」的尺寸**。

這聽起來很直覺，但在複雜的嵌套結構中，這往往是 bug 的來源。

### 什麼時候適合用百分比？

百分比最適合用在「流式佈局 (Fluid Layout)」中。例如，你希望在一個水平排列的區域中，左側的圖片佔 30%，右側的文字描述佔 70%。

```javascript
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%', // 佔滿父容器寬度
  },
  imageSection: {
    width: '30%',
  },
  textSection: {
    width: '70%',
  }
});
```

這種做法的優點是：無論手機螢幕寬度是多少，這個比例都會精確維持。

### 百分比的局限與陷阱

然而，百分比在 React Native 中有一些顯著的局限性：

1. **高度問題**：如果你對一個元件設定 `height: '50%'`，但它的父容器沒有明確的高度（例如父容器是隨內容撐開的），那麼這個子元件可能會直接消失（高度變為 0）。
2. **非排版屬性無效**：你不能對 `borderRadius`、`fontSize` 或 `borderWidth` 使用百分比。這意味著你無法簡單地透過百分比讓字體在平板上變大。
3. **效能與預測性**：在某些極端嵌套的情況下，百分比的計算可能會變得難以預測，特別是當結合 `padding` 和 `margin` 時。

因此，雖然百分比在簡單的寬度分配上很好用，但要達成真正強大的響應式佈局，我們需要更進階的武器。

## flexGrow 與 flexShrink 的比例美學

我們在上一節提過 Flexbox，但大多數開發者只會用到 `flex: 1`。事實上，深入理解 `flexGrow` 與 `flexShrink` 的分配機制，才是掌握響應式設計的鑰匙。

### flexGrow：如何分配剩餘空間？

想像你的媒體 APP 有一個導覽列，左邊是一個固定 40x40 的頭像，右邊是一個固定 40x40 的搜尋按鈕，而中間要顯示使用者的名稱。你希望名稱能根據螢幕寬度自動延伸，填滿中間所有的空間。

這就是 `flexGrow` 的主場。

- **機制**：當父容器在主軸方向（預設是垂直，如果你設了 `row` 則是水平）還有剩餘空間時，`flexGrow` 決定了該元件應該分配到多少「比例」的剩餘空間。
- **預設值**：預設為 `0`，表示如果不指定，元件只會佔用它內容所需的最小空間。

如果你給三個元件分別設定 `flexGrow: 1`、`flexGrow: 2`、`flexGrow: 1`，那麼父容器剩餘的空間會被分成 4 份（1+2+1），中間那個元件會額外獲得 50% 的剩餘空間。

### flexShrink：空間不足時誰先「縮」？

相反地，當子元件的總尺寸超過了父容器時，`flexShrink` 決定了誰該做出犧牲。

- **預設值**：在 React Native 中，`flexShrink` 的預設值是 `0`（注意：這與網頁 CSS 的預設值 1 不同）。這意味著如果空間不足，元件預設是不會縮小的，這常導致內容溢出螢幕。
- **應用場景**：在內容類 APP 的列表項中，如果你有一個很長的標題，你通常會設定 `flexShrink: 1`，確保標題在小螢幕上會自動縮小（或觸發省略號），而不是把旁邊的日期標籤擠出螢幕。

透過這兩個屬性，你可以建立一種「有彈性」的介面：**固定的地方固定，該延伸的地方延伸，該退讓的地方退讓。**

## aspectRatio：多媒體內容的守護者

對於像你正在開發的內容/媒體類 APP，圖片和影片的呈現是重中之重。一個常見的問題是：你希望封面圖橫跨整個螢幕寬度，且必須維持 16:9 的比例。

在 Web 上，你可能需要複雜的 CSS 技巧（如 padding-top hack）。但在 React Native 中，我們有一個非常優雅的屬性：`aspectRatio`。

### 為什麼這對媒體 APP 至關重要？

如果你只設定 `width: '100%'` 而不給高度，圖片不會顯示。如果你給了固定高度（如 `height: 200`），那麼在寬螢幕的手機上，圖片會被拉伸；在窄螢幕上，圖片會被裁切。

`aspectRatio` 允許你只定義一個維度（通常是寬度），然後讓系統自動計算另一個維度：

```javascript
const styles = StyleSheet.create({
  coverImage: {
    width: '100%',
    aspectRatio: 16 / 9, // 自動根據寬度計算高度
  }
});
```

這在響應式設計中是無價的。無論使用者的裝置是 iPad 還是小手機，只要寬度確定了，高度就會自動調整以維持完美的比例，絕對不會出現變形或黑邊。這對於維持 APP 的視覺質感（Look and Feel）非常有幫助。

## 斷點 (Breakpoints) 與響應式邏輯

有時候，單純的比例調整是不夠的。在平板上，你可能想顯示雙欄佈局；而在手機上，你只想顯示單欄。這時我們就需要引入「斷點」的概念。

由於 React Native 沒有 CSS Media Queries，我們直接在 JavaScript 層級解決這個問題。我們會用到上一節提到的 `useWindowDimensions`。

### 實作斷點邏輯

你可以建立一個簡單的工具函數或 Hook 來判斷當前的裝置類型：

```javascript
import { useWindowDimensions } from 'react-native';

const useBreakpoint = () => {
  const { width } = useWindowDimensions();
  
  return {
    isPhone: width < 768,
    isTablet: width >= 768,
    isLargeTablet: width >= 1024,
    columnCount: width > 1000 ? 3 : width > 600 ? 2 : 1,
  };
};
```

### 為什麼這比靜態樣式強大？

這種方法的威力在於，你可以在組件渲染時根據 `isTablet` 來做兩件事：

1. **切換樣式**：`style={[styles.base, isTablet && styles.tablet]}`
2. **切換元件結構**：甚至可以選擇渲染完全不同的子組件。

這就是 React Native 靈活性的體現——樣式不再是死的，而是隨著邏輯起舞的資料。

## 實戰範例：打造適應不同裝置的內容卡片

讓我們將上述概念整合，設計一個媒體 APP 常見的「內容卡片」。

**需求描述：**

- **手機版 (Phone)**：卡片採取「垂直堆疊」，圖片在上方（16:9），標題與摘要在下方。
- **平板版 (Tablet)**：卡片採取「水平排列」，圖片在左側（4:3），文字資訊在右側佔據剩餘空間。

### 實作程式碼架構

```jsx
import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';

const ContentCard = ({ title, excerpt, imageUrl }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[styles.card, isTablet ? styles.cardTablet : styles.cardPhone]}>
      <Image 
        source={{ uri: imageUrl }} 
        style={[
          styles.image, 
          isTablet ? styles.imageTablet : styles.imagePhone
        ]} 
      />
      
      <View style={styles.textContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.excerpt} numberOfLines={3}>{excerpt}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 10,
    elevation: 3, // Android 陰影
    shadowColor: '#000', // iOS 陰影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardPhone: {
    flexDirection: 'column',
  },
  cardTablet: {
    flexDirection: 'row',
    height: 180,
  },
  image: {
    backgroundColor: '#eee',
  },
  imagePhone: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  imageTablet: {
    height: '100%',
    aspectRatio: 4 / 3, // 平板側邊圖適合較窄的比例
  },
  textContent: {
    padding: 15,
    flex: 1, // 在平板模式下，這會讓文字區塊佔滿右側剩餘空間
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ContentCard;
```

### 為什麼這個設計能成功響應？

1. **結構切換**：透過 `flexDirection` 的切換（`column` vs `row`），我們瞬間改變了佈局的基本流向。
2. **精準比例**：使用 `aspectRatio` 確保圖片在兩種模式下都有專業的視覺呈現，而不需要去精算具體的像素高度。
3. **剩餘空間利用**：在平板模式下，我們給 `textContent` 設定了 `flex: 1`。這意味著無論平板螢幕多寬，文字區塊都會自動延伸，填滿圖片（4:3）之外的所有空間。
4. **動態監聽**：因為使用了 `useWindowDimensions`，如果使用者在 iPad 上開啟了 Split View（分割視窗）調整 APP 大小，卡片會即時在手機版和平板版佈局之間切換，過程極其流暢。

這就是 React Native 響應式佈局的核心精神：**不追求絕對的像素精確，而是追求比例的平衡與邏輯的彈性。**

## 從螢幕尺寸到響應式思維

我們已經完整探討了 React Native 樣式系統的三大支柱：StyleSheet 的效能原理、Flexbox 的佈局邏輯、以及尺寸單位與響應式策略。掌握了這些，你就不再是那個「試出正確樣式」的初學者，而是一個能「設計佈局邏輯」的工程師。

你現在應該能理解，為什麼 RN 的樣式看起來像 CSS，但寫起來卻截然不同。它拋棄了 Web 累積數十年的複雜層疊與繼承，換取了更高效、更可預測、且更貼近原生行為的排版引擎。在處理內容與媒體類 APP 時，靈活運用 `flexGrow`、`aspectRatio` 與 `useWindowDimensions`，將能幫你省下大量的 debug 時間，並讓你的 APP 在各種奇形怪狀的螢幕上都能閃閃發光。

下一部分，我們將進入本課的最後階段：透過一系列的深度複習與自我檢測，來鞏固你在樣式與佈局上建立的知識地基，確保你在面對複雜介面需求時，心中已經有了清晰的實作藍圖。
