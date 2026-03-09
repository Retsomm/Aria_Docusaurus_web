# Retsnom | 前端學習筆記

這是 Aria 的個人學習筆記和部落格網站，使用 Docusaurus 建立。記錄程式學習歷程、技術筆記、影視觀後感，以及個人成長心得。

## 關於我

嗨，我是 Aria，一位正在學習程式語言的人類，渴望能在厲害的團隊中一起打造理想中的產品。我走在自己的人生規劃中，走在自己的時區，儘管緩慢，也在持續成長。

## 網站內容

- 📚 **學習筆記 (Note)** - React、JavaScript、CSS、TypeScript、Firebase 等技術文章與學習記錄
- 📝 **部落格 (Blog)** - 影視觀後感、讀書心得、生活感悟與技術分享
- 🚀 **專案展示 (Projects)** - 個人作品與專案介紹
- 📖 **閱讀 (Reading)** - 串接 Notion 資料庫，展示書籍閱讀清單，包含評分、狀態、心得等資訊

## 技術架構

| 技術 | 用途 |
|---|---|
| [Docusaurus](https://docusaurus.io/) | 靜態網站生成框架 |
| React | 前端頁面開發 |
| MDX | Markdown + JSX 文章格式 |
| Algolia | 全站搜尋 |
| Google Analytics | 網站流量分析 |
| Netlify | 自動化部署平台 |
| Netlify CMS | 網頁端文章編輯器（Git-based CMS） |
| Netlify Functions | 伺服器端 API（串接 Notion） |
| Notion API | 閱讀頁面書單資料來源 |

## 閱讀頁面說明

閱讀頁面（`/reading`）透過 **Netlify Functions** 作為中間層，從 **Notion 資料庫**即時拉取書單資料：

```
Notion 資料庫
     ↓
Netlify Function (/.netlify/functions/notion-books)
     ↓
/reading 頁面（書卡列表）
     ↓
/reading/book?id=xxx（書籍詳細頁）
```

每本書支援：書名、作者、封面、閱讀狀態、評分、分類標籤、出版社、閱讀日期與心得。

## 本地開發

### 環境要求

- Node.js 20+（Docusaurus v3 要求）
- Yarn（本專案使用 Yarn 作為套件管理器）

### 安裝與啟動

```bash
# 安裝依賴
yarn

# 啟動開發服務器（自動產生 tags）
yarn start

# 開啟瀏覽器預覽
# http://localhost:3000
```

> 閱讀頁面需搭配 Netlify Functions 環境。本地測試請執行：
> ```bash
> yarn cms:proxy   # 啟動 Netlify CMS Proxy
> ```

### 建構專案

```bash
# 建構生產版本
yarn build

# 本地預覽建構結果
yarn serve
```

### SEO 工具

```bash
# 補全所有缺少 description 的文章
yarn seo:fix

# 補全所有缺少 keywords 的 blog 文章
yarn seo:keywords
```

## 專案結構

```
├── blog/                    # 部落格文章（公開）
├── blog-private/            # 私人部落格文章
├── docs/                    # 技術文檔與學習筆記
│   ├── css/
│   ├── Javascript/
│   ├── React/
│   ├── TypeScript/
│   └── ...
├── netlify/
│   └── functions/           # Netlify Functions（Notion API 串接）
├── scripts/                 # 自動化腳本（tag 產生、SEO 修復）
├── src/
│   ├── components/          # React 共用元件
│   ├── css/                 # 全域樣式
│   └── pages/               # 自訂頁面
│       ├── index.tsx        # 首頁
│       ├── projects.tsx     # 專案展示頁
│       ├── reading.tsx      # 閱讀書單頁
│       └── reading/book.tsx # 書籍詳細頁
├── static/
│   └── admin/               # Netlify CMS 設定
├── docusaurus.config.ts     # Docusaurus 設定
├── netlify.toml             # Netlify 部署設定
└── package.json             # 專案依賴
```

## 部署

專案部署在 **Netlify**，推送到 `main` 分支會自動觸發重新部署。

- **網站網址**：https://ariadocusauruswed.netlify.app/
- **Netlify CMS**：`/admin` — 可在網頁端直接新增與編輯文章
- **Sitemap**：自動產生於 `/sitemap.xml`

## 功能特色

- 🔍 **全站搜尋** - Algolia 全文搜尋
- 🌙 **深色模式** - 支援明暗主題切換
- 📱 **響應式設計** - 適配各種裝置螢幕
- 📊 **SEO 優化** - 自動 sitemap、每篇文章有 description 與 keywords
- 📖 **Notion 書單** - 閱讀頁面即時串接 Notion 資料庫
- ✏️ **線上編輯** - 透過 Netlify CMS 在網頁上直接發文

## 聯絡方式

- 🔗 **LinkedIn**: [Chan Yu-Ting](https://www.linkedin.com/in/chan-yuting-b80218366/)
- 📷 **Instagram**: [@reading_retsnom](https://www.instagram.com/reading_retsnom)
- 💻 **GitHub**: [@Retsomm](https://github.com/Retsomm)

## 版權聲明

Copyright © 2025 Retsnom. Built with [Docusaurus](https://docusaurus.io/).

---

_走在自己的時區，持續成長中_
