# Retsnom Learning Coding

這是 Aria 的個人學習筆記和部落格網站，使用 Docusaurus 建立。記錄程式學習歷程、技術筆記，以及個人成長心得。

## 關於我

嗨，我是 Aria，一位正在學習程式語言的人類，渴望能在厲害的團隊中一起打造理想中的產品。我走在自己的人生規劃中，走在自己的時區，儘管緩慢，也在持續成長。我是一位高敏感人也是一位左撇子，喜歡伊隆馬斯克並決定要跟他一起死在火星上。

## 網站內容

- 📚 **學習筆記** - 程式語言學習記錄和技術文檔
- 📝 **部落格** - 個人心得、生活感悟和技術分享
- 🚀 **專案展示** - 個人作品和專案介紹
- 📖 **閱讀清單** - 推薦書籍和學習資源

## 技術架構

這個網站使用以下技術建構：

- **[Docusaurus](https://docusaurus.io/)** - 現代化靜態網站生成器
- **React** - 前端框架
- **MDX** - Markdown + JSX 支援
- **Algolia** - 全站搜尋功能
- **Google Analytics** - 網站分析
- **Vercel** - 自動化部署平台

## 本地開發

### 環境要求

- Node.js 18+
- Yarn（建議；本專案已改用 Yarn 作為套件管理器）

### 安裝與啟動

```bash
# 安裝依賴（Yarn）
yarn

# 啟動開發服務器
yarn start

# 開啟瀏覽器預覽
# http://localhost:3000
```

### 建構專案

```bash
# 建構生產版本
yarn build

# 本地預覽建構結果
yarn serve
```

## 專案結構

```
├── blog/                   # 部落格文章
├── docs/                   # 技術文檔和學習筆記
├── src/                    # 自訂組件和頁面
│   ├── components/         # React 組件
│   ├── css/               # 全域樣式
│   └── pages/             # 自訂頁面
├── static/                # 靜態資源
├── docusaurus.config.js   # Docusaurus 配置
├── sidebars.js            # 側邊欄配置
└── package.json           # 專案依賴
```

## 自動化部署

專案已配置 GitHub Actions 自動化流程：

- ✅ **自動構建測試** - 每次 push 和 PR 自動測試
- ✅ **Vercel 部署** - 推送到 main 分支自動部署
- ✅ **預覽環境** - PR 自動生成預覽連結

查看 [部署設置說明](./DEPLOY_SETUP.md) 了解更多詳情。

## 功能特色

- 🔍 **全站搜尋** - 使用 Algolia 提供快速搜尋
- 🌙 **深色模式** - 支援明暗主題切換
- 📱 **響應式設計** - 適配各種設備螢幕
- 🚀 **快速載入** - 靜態生成，CDN 分發
- 📊 **SEO 優化** - 自動生成 sitemap 和 meta 標籤

## 聯絡方式

- 🔗 **LinkedIn**: [Chan Yu-Ting](https://www.linkedin.com/in/chan-yuting-b80218366/)
- 📷 **Instagram**: [@reading_retsnom](https://www.instagram.com/reading_retsnom)
- 💻 **GitHub**: [@Retsomm](https://github.com/Retsomm)

## 版權聲明

Copyright © 2025 Retsnom, Inc. Built with [Docusaurus](https://docusaurus.io/).

---

_走在自己的時區，持續成長中 🌱_
