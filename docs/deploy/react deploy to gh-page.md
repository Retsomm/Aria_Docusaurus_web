---
title: 部屬react專案到GitHub Pages
description: 學習如何將 React 專案部署到 GitHub Pages，包含 gh-pages 套件設定、自動化部署流程與環境配置
keywords:
  [React, GitHub Pages, 部署, gh-pages, 自動化部署, 靜態網站, 前端部署, GitHub]
---

# 部屬 react 專案到 GitHub Pages

## 1\. **安裝 gh-pages 套件**

```
npm install --save gh-pages
```

    或使用 yarn:

```
yarn add gh-pages
```

## 2\. **修改 package.json 檔案**

在 package.json 中添加以下內容：

- 在 scripts 中添加部署相關命令，添加 homepage 屬性

```
"homepage": "<https://你的使用者名稱.github.io/你的儲存庫名稱>"
```

## 3\. **建立 GitHub 儲存庫**

- 如果還沒有 GitHub 儲存庫，請先創建一個

- 將你的 React 專案與該儲存庫關聯

```
git init git remote add origin https://github.com/你的使用者名稱/你的儲存庫名稱.git
```

## 4\. **部署應用**

```
npm run deploy
```

    這個命令會執行以下操作：

- 執行 predeploy 腳本 (npm run build)，建立生產版本的應用

- 創建一個名為 gh-pages 的分支(如果不存在)

- 將 build 目錄中的內容推送到該分支

## 5\. **設定 GitHub Pages**

- 前往你的 GitHub 儲存庫

- 點擊 "Settings" 標籤

- 滾動到 "GitHub Pages" 部分

- 在 "Source" 選項中，選擇 "gh-pages" 分支

## 6\.如果你的應用使用 React Router

需要在 Router 中設置 basename：

```
<BrowserRouter basename="/你的儲存庫名稱">{/* 你的路由 */}</BrowserRouter>
```

    或者考慮使用 HashRouter，這可以避免某些路由問題：

```
<HashRouter>{/* 你的路由 */}</HashRouter>
```

## 完成上述步驟後，你的 React 應用應該就能成功部署到 GitHub Pages 了。網址將是你在 package.json 中設定的 homepage 值。

:::danger[Please note]

這個內容是來自 AI

:::
