# Observer API 全家桶

涵蓋概念：Intersection Observer、Mutation Observer、Resize Observer、Performance Observer

四者都是瀏覽器內建、高效能的「監看」工具，取代效能較差的手動輪詢/計算方式。

---

## 1. Intersection Observer：偵測元素是否進入可視範圍

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) console.log("元素進入畫面了！");
  });
}, {
  root: null,           // null = 整個視窗
  rootMargin: "100px",   // 提前/延後觸發的邊界
  threshold: 0.5          // 露出多少比例才算相交
});
observer.observe(target);
```

**三大經典應用：**

```javascript
// ① 圖片延遲載入
imageObserver.observe(img); // isIntersecting 時才把 dataset.src 放進 img.src

// ② 無限捲動：在列表底部放觸發元素
infiniteScrollObserver.observe(loadMoreTrigger);

// ③ 捲動觸發動畫
animationObserver.observe(el); // isIntersecting 時加上 class 觸發 CSS 動畫
```

**應用延伸：閱讀器根據字體大小/行距變化，重新計算內容高度做分頁**，也常搭配 Resize Observer 一起使用。

記得清理：`observer.unobserve(target)` 或 `observer.disconnect()`。

---

## 2. Mutation Observer：偵測 DOM 結構變化

```javascript
observer.observe(targetNode, {
  childList: true,    // 子元素新增/刪除
  attributes: true,    // 屬性變化
  subtree: true,        // 連深層子孫也觀察
  characterData: true   // 文字內容變化
});
```

> **實務上較少主動使用**，因為 React/Vue 專案的 DOM 變化應該交由框架管理。最實用情境：**整合第三方腳本**（客服小工具）、**開發瀏覽器擴充功能**、**應對繞過框架直接操作 DOM 的第三方套件**。

觀察範圍不要設太大（避免整個 `document.body` + `subtree`），以免效能負擔過重。

---

## 3. Resize Observer：偵測「特定元素自身」的尺寸變化

跟 `window.resize`（只偵測整個視窗）不同，Resize Observer 能偵測「元素本身」因為內容變多、側邊欄收合、CSS 屬性改變等原因造成的大小變化。

```javascript
const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const { width, height } = entry.contentRect;
    redrawChart(width, height);
  });
});
observer.observe(chartContainer);
```

**應用場景：**
- 響應式圖表（容器變了就重繪）
- 元件層級的「容器查詢」效果（根據自己所在容器寬度切換版面，而非整個視窗寬度）
- 電子書閱讀器：偵測字體大小/行距改變造成的內容高度變化，重新計算分頁

```javascript
// 閱讀器範例
this.observer = new ResizeObserver((entries) => {
  this.contentHeight = entries[0].contentRect.height;
  this.recalculatePages();
});
// 搭配 debounce，避免拖曳滑桿調字體時過度頻繁觸發
```

避免在 callback 裡修改「被觀察元素自己」的尺寸，可能造成連環觸發。

---

## 4. Performance Observer：訂閱效能數據

```javascript
performance.mark("start");
doHeavyTask();
performance.mark("end");
performance.measure("task-duration", "start", "end");

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => console.log(entry.name, entry.duration));
});
observer.observe({ entryTypes: ["measure"] });
```

### Core Web Vitals（核心使用者體驗指標）

| 指標 | 意義 |
|---|---|
| LCP | 主要內容多快出現 |
| CLS | 畫面跳動程度 |
| INP | 互動反應速度 |

實務上優先用 Google 官方套件，而非自己處理原生 API 的所有邊界情況：

```javascript
import { onLCP, onCLS, onINP } from "web-vitals";
onLCP((metric) => sendToAnalytics(metric));
```

`longtask` 類型可幫助找出卡住主執行緒（Event Loop）的元凶程式碼。

> 日常除錯優先用 Chrome DevTools 的 Performance 面板；正式產品監控用 `web-vitals` 套件 + Sentry/Datadog 等分析平台。

---

## 本篇總結

- Intersection Observer：偵測元素進出可視範圍（延遲載入、無限捲動、動畫觸發）
- Mutation Observer：偵測 DOM 結構變化，主要用在整合第三方腳本
- Resize Observer：偵測「特定元素」尺寸變化，響應式圖表、閱讀器分頁的關鍵工具
- Performance Observer：量測 Core Web Vitals，實務建議用 `web-vitals` 官方套件
- 四者都要記得在不需要時呼叫 `disconnect()`/`unobserve()` 清理，避免資源浪費
