# WebView 是什麼？從零開始認識 WebView

> 適合對象：網頁初學者、剛接觸 App 開發的前端工程師

---

## 一、先從一個生活例子說起

你有沒有發現，在 LINE 或 Facebook App 裡點開一個網址連結，畫面會直接在 App 內顯示網頁，而不是跳去開啟 Chrome 或 Safari？

那個「在 App 內顯示網頁的視窗」，就叫做 **WebView**。

簡單來說：

> **WebView = 內嵌在 App 裡的瀏覽器**

---

## 二、WebView 到底是什麼？

WebView 是一個**元件（Component）**，讓原生 App（Android 或 iOS）可以直接在畫面裡顯示網頁內容。

你可以把它想像成：

```
原生 App
└── WebView（一個視窗）
    └── 顯示 HTML / CSS / JavaScript 網頁
```

開發者可以在這個視窗裡載入：
- 一個網址（URL），例如 `https://example.com`
- 或直接載入本地的 HTML 字串

---

## 三、WebView 的運作原理

WebView 底層其實就是用瀏覽器的「渲染引擎」來顯示網頁：

| 平台 | 使用的引擎 |
|------|-----------|
| Android | Chromium（基於 Chrome） |
| iOS | WebKit（基於 Safari） |

所以你在 WebView 裡寫的網頁，其實跟一般網頁差不多，只是「包在 App 的殼裡」。

---

## 四、WebView 的常見應用場景

### 📱 1. App 內嵌網頁
最常見的用途。例如電商 App 裡的「商品說明頁」、新聞 App 的「文章頁面」，都可以直接用 WebView 顯示網頁，不需要額外開發原生畫面。

### 🔄 2. 混合式 App（Hybrid App）
這是很多公司採用的開發方式。App 的「殼」是原生的，但裡面的內容是用網頁技術（HTML/CSS/JS）寫的，再用 WebView 顯示出來。

知名框架有：
- **Cordova / PhoneGap** — 早期很流行
- **Ionic** — 搭配 Angular / React / Vue 使用
- **Capacitor** — Ionic 的現代版本

### 🌐 3. 登入頁面（OAuth）
很多 App 在「用 Google 帳號登入」時，會開一個 WebView 讓你輸入 Google 帳號密碼，這樣 App 本身就不需要自己處理登入邏輯。

### 📄 4. 顯示動態內容
如果你的 App 需要顯示常常更新的內容（例如：活動頁面、行銷頁面），用 WebView 載入網頁，就可以不更新 App 就改版內容。

---

## 五、WebView 的優點與缺點

### ✅ 優點

| 優點 | 說明 |
|------|------|
| **跨平台** | 同一套 HTML/CSS/JS 程式碼，Android 和 iOS 都能用 |
| **易於更新** | 改網頁就好，不需要等 App 審核上架 |
| **前端工程師友善** | 不需要學 Swift 或 Kotlin 就能做出 App 功能 |
| **節省開發成本** | 一套程式碼走天下，人力需求少 |

### ❌ 缺點

| 缺點 | 說明 |
|------|------|
| **效能較差** | 比起純原生 App，流暢度和速度稍遜一籌 |
| **畫面表現有限** | 複雜的動畫或特效，不如原生來得順暢 |
| **瀏覽器差異** | Android 和 iOS 的 WebView 行為不完全一樣，有時要額外處理相容問題 |
| **安全性風險** | 若沒有做好設定，可能會有 JavaScript 注入等安全漏洞 |

---

## 六、前端工程師需要知道的事

如果你是前端工程師，在開發 WebView 頁面時，有幾件事要特別注意：

### 1. 和 App 溝通 — JavaScript Bridge
WebView 裡的網頁可以跟原生 App 互相「溝通」，這個機制叫做 **JavaScript Bridge**。

舉例：
- 網頁想呼叫手機的相機 → 透過 Bridge 呼叫原生功能
- 原生 App 想傳資料給網頁 → 用 Bridge 執行 JS 函式

```javascript
// 網頁端呼叫 App 提供的原生方法（範例）
window.NativeBridge.openCamera();

// App 呼叫網頁裡的函式（由 App 端執行）
webView.evaluateJavascript("onDataReceived('hello')", null);
```

### 2. User Agent 偵測
你可以在網頁裡偵測目前是否在 WebView 環境中：

```javascript
const userAgent = navigator.userAgent;
const isWebView = /wv|WebView/i.test(userAgent);

if (isWebView) {
  console.log('目前在 App 的 WebView 裡');
} else {
  console.log('目前在一般瀏覽器');
}
```

### 3. 注意 viewport 設定
WebView 裡的網頁一定要加上 viewport meta tag，否則在手機上可能會縮成很小：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 4. 不支援某些瀏覽器 API
有些瀏覽器才有的功能（例如 `navigator.share`、某些 Web API），在 WebView 裡可能不支援，記得要做好備案處理。

---

## 七、React Native 和 Flutter 裡的 WebView

如果你用的是跨平台框架，也有對應的 WebView 元件可以使用：

### React Native
```bash
npm install react-native-webview
```

```jsx
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView
      source={{ uri: 'https://www.example.com' }}
      style={{ flex: 1 }}
    />
  );
}
```

### Flutter
```yaml
# pubspec.yaml
dependencies:
  webview_flutter: ^4.0.0
```

```dart
WebViewWidget(
  controller: WebViewController()
    ..loadRequest(Uri.parse('https://www.example.com')),
)
```

---

## 八、WebView vs 其他方案的比較

| 比較項目 | WebView | 原生 App | React Native / Flutter |
|---------|---------|---------|----------------------|
| 開發難度 | 低（前端即可） | 高（需學原生語言） | 中（JS 或 Dart） |
| 效能 | 普通 | 最好 | 接近原生 |
| 更新彈性 | 最高（改網頁即可） | 低（需上架審核） | 中 |
| 使用原生功能 | 需透過 Bridge | 完整支援 | 大部分支援 |
| 適合情境 | 內容型、行銷頁 | 高效能、複雜互動 | 中大型跨平台 App |

---

## 九、小結

WebView 是一個非常實用的技術，特別適合：

- 想快速把現有網頁「包成 App」
- 內容常常更新，不想每次都重新上架
- 團隊以前端為主，沒有原生 App 開發資源

雖然效能不如純原生，但在很多應用場景下，WebView 已經夠用，而且開發速度快、維護成本低。

對前端工程師來說，WebView 是一個很好的切入點，讓你的網頁技術可以延伸到 App 的世界！

---

## 延伸學習資源

- [Android 官方文件 - WebView](https://developer.android.com/reference/android/webkit/WebView)
- [iOS 官方文件 - WKWebView](https://developer.apple.com/documentation/webkit/wkwebview)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [MDN Web Docs](https://developer.mozilla.org/zh-TW/)

---

*本文章適合前端初學者閱讀，內容以概念說明為主。*
