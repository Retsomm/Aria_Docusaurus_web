---
title: 部屬vite專案到GitHub Pages
description: vite deploy to GitHub Pages
keywords: [vite, GitHub Pages]
---

# 部署 Vue + Vite 專案到 GitHub Pages

## 1\. 設定 vite.config.js

首先需要修改 `vite.config.js` 檔案，設定正確的 base URL：

```js title="vite.config.js"
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// https://vitejs.dev/config/
export default defineConfig({ plugins: [vue()], base: "/你的儲存庫名稱/" });
// 非常重要！替換成你的 GitHub 儲存庫名稱
```

## 2\. 安裝部署工具

你可以使用 `gh-pages` 套件來簡化部署過程：

```bash
npm install --save-dev gh-pages
```

## 3\. 設定 package.json

在 `package.json` 中添加部署腳本：

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## 4\. 建立 GitHub 儲存庫

如果還沒有 GitHub 儲存庫，請先創建一個並將你的專案與之關聯：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的使用者名稱/你的儲存庫名稱.git
git push -u origin main
```

## 5\. 部署到 GitHub Pages

執行部署命令：

```bash
npm run deploy
```

這個命令會：

- 執行 `npm run build`，生成 `dist` 目錄

- 使用 `gh-pages` 將 `dist` 目錄的內容發布到 GitHub Pages

## 6\. 配置 GitHub 儲存庫設定

- 在 GitHub 儲存庫中前往 Settings > Pages

- Source 部分應該會自動設定為 `gh-pages` 分支

- 等待幾分鐘後，你的網站將會在`https://你的使用者名稱.github.io/你的儲存庫名稱/`可用

## 7\. 處理路由問題 (若使用 Vue Router)

如果你的專案使用 Vue Router 且使用的是 history mode，需要修改路由配置：

```js
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({ history: createWebHistory('/你的儲存庫名稱/') }), routes: [ 你的路由 ]
 // 必須與 vite.config.js 中的 base 匹配
```

## 8\. 解決刷新 404 問題 (選用)

GitHub Pages 在重新整理頁面時可能會遇到 404 錯誤，有兩種解決方案：

### 方案 1: 創建 404.html

在 `public` 目錄中創建 `404.html` 文件，內容與 `index.html` 相同。

### 方案 2: 使用 Hash 模式路由

修改 Vue Router 設定，使用 Hash 模式：

```js
import { createRouter, createWebHashHistory } from "vue-router";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [你的路由],
});
```

若使用 Hash 模式，URL 會變成 `https://你的使用者名稱.github.io/你的儲存庫名稱/#/路由`，但能解決刷新 404 問題。

## 9\. 自訂域名 (選用)

如果你想使用自訂域名：

1. 在 DNS 提供商設定 CNAME 記錄，指向`你的使用者名稱.github.io`

2. 在專案的 `public` 目錄中添加名為 `CNAME` 的文件，內容是你的域名

3. 重新部署專案

按照這些步驟，你的 Vue + Vite 專案就能成功部署到 GitHub Pages 了！

## 請確保你的 `.gitignore` 檔案內有忽略 `dist/`，避免它影響你的專案檔案：

```bash
node_modules/
dist/
```

這樣 `dist` 目錄不會被 Git 跟蹤，不會影響你的 `src/` 目錄。

改進 `package.json` 的 `deploy` 指令：

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist -f"
}
```

如果 `npm run deploy` 讓你的專案變成 `dist` 目錄，你可以：

1. **確保 `.gitignore` 忽略 `dist/`**

2. **使用 `git reset --hard origin/main` 來還原 `src/`**

3. **修改 `deploy` 指令為 `gh-pages -d dist -f`，避免影響本地專案**

4. **使用 `git worktree` 分開 `gh-pages`，不影響 `main` 分支**

---

:::tip[Please note]

這個內容是來自AI


:::