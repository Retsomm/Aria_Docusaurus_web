# Retsnom | 前端學習筆記

Aria 的個人學習筆記與部落格網站，使用 Docusaurus 建立。記錄程式學習歷程、技術筆記、影視觀後感，以及個人成長心得。

## 關於我

嗨，我是 Aria，一位正在學習程式語言的人類，渴望能在厲害的團隊中一起打造理想中的產品。走在自己的時區，儘管緩慢，也在持續成長。

## 網站內容

- **學習筆記 (Note)** - HTML、CSS、JavaScript、TypeScript、React、Next.js、Firebase、jQuery、後端基礎等技術文章
- **部落格 (Blog)** - 影視觀後感、讀書心得、生活感悟與技術分享（含私人頻道）
- **專案展示 (Projects)** - 個人作品與專案介紹
- **閱讀 (Reading)** - 串接 Notion 資料庫，展示書籍閱讀清單，含評分、狀態、心得
- **About** - 互動式個人介紹頁，包含 Canvas 動畫、GSAP 視差效果

## 技術架構

| 技術 | 用途 |
|---|---|
| [Docusaurus 3](https://docusaurus.io/) | 靜態網站生成框架 |
| React + TypeScript | 前端頁面開發 |
| MDX | Markdown + JSX 文章格式 |
| Canvas 2D API | About 頁互動動畫（flood-fill 去背、float 動畫） |
| GSAP | Hero 動畫與視差效果 |
| Algolia | 全站搜尋 |
| Google Analytics (gtag) | 網站流量分析 |
| Netlify | 自動化部署平台 |
| Netlify Functions | 伺服器端 API（串接 Notion） |
| Decap CMS | 網頁端文章編輯器（Git-based CMS） |
| Notion API | 閱讀頁面書單資料來源 |
| Giscus | 文章留言系統（GitHub Discussions） |
| Husky | Git pre-commit hook（型別檢查） |

## 專案結構

```
├── blog/                        # 部落格文章（公開）
├── docs/                        # 技術文檔與學習筆記
│   ├── HTML/
│   ├── css/
│   ├── Javascript/              # 含子分類：ES6、函式、非同步、OOP 等
│   ├── TypeScript/
│   ├── React/
│   ├── Nextjs/
│   ├── Firebase/
│   ├── Jquery/
│   ├── backend/
│   ├── npm/
│   └── Others/
├── netlify/
│   └── functions/
│       ├── notion-books.ts      # 書單 API（串接 Notion）
│       └── sync-books-algolia.ts # 書單同步 Algolia 索引
├── scripts/
│   ├── generate-tags.ts         # 自動產生 tags.yml
│   ├── fix-seo-descriptions.ts  # 補全缺少 description 的文章
│   └── add-blog-keywords.ts     # 補全缺少 keywords 的 blog 文章
├── src/
│   ├── clientModules/           # 全域執行模組（analytics、webmcp）
│   ├── components/
│   │   ├── about-components.tsx # About 頁所有 Canvas / 動畫元件
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectCarousel.tsx
│   │   ├── ShareButtons.tsx
│   │   └── GiscusComment.tsx
│   ├── css/                     # 全域樣式
│   ├── pages/
│   │   ├── index.tsx            # 首頁
│   │   ├── about.tsx            # About 頁（互動式個人介紹）
│   │   ├── projects.tsx         # 專案展示頁
│   │   ├── reading.tsx          # 閱讀書單頁
│   │   └── reading/book.tsx     # 書籍詳細頁
│   └── theme/                   # Docusaurus 主題元件覆寫
│       ├── BlogPostItem/        # 文章頁（加入留言、分享按鈕）
│       ├── BlogSidebar/
│       ├── BlogTagsListPage/
│       ├── Layout/
│       ├── SearchBar/
│       └── SearchPage/
├── static/
│   ├── admin/                   # Decap CMS 設定
│   └── img/                     # 靜態圖片資源
├── .github/workflows/           # GitHub Actions（deploy、security-checks）
├── .husky/                      # Git hooks
├── docusaurus.config.ts         # 主設定（含 webpack alias、plugins）
├── tsconfig.json                # TypeScript 設定（@ → src/，@site → ./）
├── netlify.toml                 # Netlify 部署設定
└── package.json
```

## 路徑別名

| 別名 | 對應目錄 |
|---|---|
| `@/` | `src/` |
| `@site/` | 專案根目錄（Docusaurus 內建） |

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

**環境要求**：Node.js 20+、Yarn

```bash
# 安裝依賴
yarn

# 啟動開發服務器（自動產生 tags）
yarn start

# 含 Decap CMS + Netlify Functions 的完整環境
yarn dev
```

> 閱讀頁面需搭配 Netlify Functions。本地單獨啟動 CMS proxy：
> ```bash
> yarn cms:proxy
> ```

### 建構

```bash
yarn build          # 標準建構
yarn build:fast     # 增加 Node 記憶體上限（大型專案用）
yarn serve          # 本地預覽建構結果
```

### 工具指令

```bash
yarn type-check         # TypeScript 型別檢查
yarn generate:tags      # 重新產生 tags.yml（start 時自動執行）
yarn seo:fix            # 補全缺少 description 的文章
yarn seo:keywords       # 補全缺少 keywords 的 blog 文章
```

## 部署

專案部署在 **Netlify**，推送到 `main` 分支自動觸發重新部署。

- **網站網址**：https://ariadocusauruswed.netlify.app/
- **Decap CMS**：`/admin` — 網頁端直接新增與編輯文章
- **Sitemap**：自動產生於 `/sitemap.xml`

## 功能特色

- **全站搜尋** — Algolia 全文搜尋
- **深色模式** — 支援明暗主題切換
- **響應式設計** — 適配各種裝置螢幕
- **SEO 優化** — 自動 sitemap、每篇文章有 description 與 keywords
- **互動式 About 頁** — Canvas 2D 動畫、GSAP 視差、flood-fill 圖片去背
- **Notion 書單** — 閱讀頁面即時串接 Notion 資料庫
- **文章留言** — Giscus（GitHub Discussions 驅動）
- **線上編輯** — 透過 Decap CMS 在網頁上直接發文

## 聯絡方式

- **LinkedIn**: [Chan Yu-Ting](https://www.linkedin.com/in/chan-yuting-b80218366/)
- **GitHub**: [@Retsomm](https://github.com/Retsomm)
- **Threads**: [@aria____1214](https://www.threads.com/@aria____1214)

## 版權聲明

Copyright © 2025 Retsnom. Built with [Docusaurus](https://docusaurus.io/).

---

_走在自己的時區，持續成長中_
