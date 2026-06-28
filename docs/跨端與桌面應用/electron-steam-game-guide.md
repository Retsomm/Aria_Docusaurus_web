# 用 Electron 製作 Steam 遊戲：初學者完整入門指南

> 你聽過 Electron 嗎？它就是讓 VS Code、Discord、Slack 這些軟體能夠跨平台運作的技術。而你知道嗎？它也可以用來做 Steam 遊戲！這篇文章會帶你從零開始，一步一步了解整個流程。

---

## 🎮 什麼是 Electron？

Electron 是一個開源的框架，讓你可以用「網頁技術」（HTML、CSS、JavaScript）來開發桌面應用程式。

簡單說：
- 你原本寫網站的技術 → 現在可以拿來做桌面軟體
- 支援 Windows、macOS、Linux，一份程式碼就能跑在三個平台上

**那它能做遊戲嗎？**

可以！雖然 Electron 不是為遊戲設計的，但有不少獨立遊戲開發者用它成功上架 Steam，尤其是視覺小說、文字冒險、卡牌遊戲、像素風等類型的 2D 遊戲非常適合。

---

## 🛠️ 開始之前，你需要準備什麼？

### 基本知識
- HTML / CSS 基礎（會做簡單網頁就夠）
- JavaScript 基礎（懂變數、函式、事件就行）

### 安裝工具

1. **Node.js**：Electron 的運作環境，請到 [nodejs.org](https://nodejs.org) 下載 LTS 版本
2. **npm**：Node.js 安裝後會自動附帶，用來安裝套件
3. **程式碼編輯器**：推薦 [VS Code](https://code.visualstudio.com)，免費又好用

---

## 📁 建立你的第一個 Electron 專案

### 第一步：建立資料夾並初始化

打開終端機（Windows 用 PowerShell，Mac 用 Terminal），輸入以下指令：

```bash
mkdir my-steam-game
cd my-steam-game
npm init -y
```

這樣會建立一個叫 `my-steam-game` 的資料夾，並自動產生 `package.json` 設定檔。

### 第二步：安裝 Electron

```bash
npm install electron --save-dev
```

等它跑完，你的 `node_modules` 資料夾就會出現 Electron 了。

### 第三步：建立主要檔案

你的專案資料夾結構大概長這樣：

```
my-steam-game/
├── package.json
├── main.js       ← 控制視窗的主程式
└── index.html    ← 遊戲畫面
```

**`main.js`（主程式）：**

```javascript
const { app, BrowserWindow } = require('electron')

function createWindow() {
  // 建立遊戲視窗
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 載入遊戲的 HTML 頁面
  win.loadFile('index.html')
}

// 當 Electron 準備好，就建立視窗
app.whenReady().then(createWindow)
```

**`index.html`（遊戲畫面）：**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>我的第一款遊戲</title>
  <style>
    body {
      background-color: #1a1a2e;
      color: white;
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>🎮 歡迎來到我的遊戲！</h1>
</body>
</html>
```

### 第四步：修改 package.json 並執行

打開 `package.json`，找到 `"scripts"` 那段，改成這樣：

```json
"scripts": {
  "start": "electron ."
}
```

然後在終端機執行：

```bash
npm start
```

🎉 恭喜！你的第一個 Electron 視窗應該跳出來了！

---

## 🎨 加入遊戲內容

### 加入圖片和音效

Electron 的 HTML 可以直接讀取本機檔案，所以把圖片放進資料夾後：

```html
<img src="images/player.png" alt="角色">
<audio src="sounds/bgm.mp3" autoplay loop></audio>
```

### 用 Canvas 做簡單動畫

如果要做有畫面移動的遊戲，可以用 HTML5 的 `<canvas>`：

```html
<canvas id="gameCanvas" width="800" height="600"></canvas>

<script>
  const canvas = document.getElementById('gameCanvas')
  const ctx = canvas.getContext('2d')

  let x = 50  // 角色 X 座標

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)  // 清空畫面
    ctx.fillStyle = 'yellow'
    ctx.fillRect(x, 300, 40, 40)  // 畫一個黃色方塊當角色
    x += 2  // 每次移動 2 個像素
    requestAnimationFrame(draw)  // 不斷重繪
  }

  draw()
</script>
```

### 推薦的遊戲開發套件

你也可以搭配現成的 2D 遊戲引擎，讓開發更輕鬆：

| 套件 | 說明 | 適合類型 |
|------|------|---------|
| **Phaser** | 功能強大的 2D 遊戲框架 | 平台遊戲、RPG |
| **PixiJS** | 高效能的 2D 渲染引擎 | 視覺效果豐富的遊戲 |
| **Kaboom.js** | 語法簡單，新手友善 | 快速製作原型 |
| **Ink / Twine** | 互動式故事引擎 | 視覺小說、文字冒險 |

---

## 📦 打包遊戲（準備上架前的步驟）

做完遊戲後，要把它打包成 `.exe`（Windows）或 `.app`（macOS）給玩家安裝。

### 使用 electron-builder

```bash
npm install electron-builder --save-dev
```

在 `package.json` 加入打包設定：

```json
"build": {
  "appId": "com.yourname.mygame",
  "productName": "我的遊戲",
  "win": {
    "target": "nsis"
  },
  "mac": {
    "target": "dmg"
  }
}
```

執行打包：

```bash
npx electron-builder
```

完成後，`dist/` 資料夾裡就會有安裝檔了！

---

## 🚂 上架到 Steam

### 步驟一：加入 Steamworks SDK

要讓遊戲能用 Steam 功能（成就、排行榜、存檔同步），需要整合 Steam API。

推薦使用 **`greenworks`** 套件（適合 Electron + Steam）：

```bash
npm install greenworks
```

> ⚠️ 注意：使用 Steamworks 需要先向 Valve 申請存取權限

### 步驟二：申請上架

1. 前往 [store.steampowered.com/dev](https://store.steampowered.com/dev)
2. 繳交一次性費用（目前約 100 美元，上架後可從銷售額回收）
3. 填寫遊戲資訊、上傳截圖和影片
4. 建立 Steam 頁面並等候審核

### 步驟三：上傳遊戲檔案

Steam 使用 **SteamPipe** 工具來上傳遊戲：

1. 下載 SteamPipe 工具
2. 建立 `app_build.vdf` 設定檔，填入你的 App ID
3. 執行上傳指令

```bash
steamcmd +login 你的帳號 +run_app_build app_build.vdf
```

### 步驟四：送審與上架

- 設定發行日期或馬上發布
- Steam 團隊會進行基本審查（通常幾天內完成）
- 審核通過後，玩家就可以購買你的遊戲了！🎉

---

## ✅ 注意事項與常見問題

### ❓ Electron 遊戲效能好嗎？
對於 2D 遊戲或視覺小說來說很夠用，但如果想做 3D 遊戲或高效能動作遊戲，建議改用 Unity 或 Godot。

### ❓ 遊戲檔案會很大嗎？
Electron 本身就有 100MB 以上，所以你的遊戲安裝檔通常不會太小。可以用壓縮工具減少體積。

### ❓ 需要防盜版保護嗎？
Steam 有內建的 DRM（數位版權管理），不需要自己額外處理。

### ❓ 可以在 Linux 上玩嗎？
可以！Electron 支援 Linux，而且 Steam Deck 也是 Linux 系統，上架時記得測試 Linux 版本。

---

## 🗺️ 學習路線建議

```
初學者路線：
HTML/CSS/JS 基礎
    ↓
Electron 基本操作
    ↓
選一個遊戲框架（Phaser 或 Kaboom.js）
    ↓
完成一個小遊戲原型
    ↓
加入音效、存檔等功能
    ↓
打包 + Steam 上架
```

---

## 📚 推薦資源

- [Electron 官方文件](https://www.electronjs.org/docs)（英文）
- [Phaser 官方教學](https://phaser.io/tutorials)（英文，附範例）
- [Kaboom.js 文件](https://kaboomjs.com)（英文，語法簡單易懂）
- [Steam 開發者頁面](https://partner.steamgames.com)（英文）

---

## 🎯 總結

用 Electron 做 Steam 遊戲這條路是可行的，特別適合：
- 已經會寫網頁的開發者
- 想做視覺小說、文字冒險、卡牌遊戲的創作者
- 想用最低門檻體驗獨立遊戲開發的初學者

它的學習曲線相對平緩，最大的好處是你不需要學一套全新的語言或工具，用你已經熟悉的 HTML + JavaScript 就能出發！

**現在就開始，打造你的第一款遊戲吧！** 🚀

---

*本文章適合完全初學者閱讀，如有任何問題歡迎繼續探索或查閱官方文件。*
