# GitHub Actions 自動化構建設置說明

這個專案已經配置了 GitHub Actions 自動化構建和測試，並設置為與 Vercel 部署整合。

## 功能說明

### GitHub Actions 自動化

- ✅ 自動構建測試 - 每次推送代碼時自動測試構建
- ✅ Pull Request 檢查 - PR 時自動驗證構建是否成功
- ✅ 手動觸發 - 支援在 GitHub Actions 中手動觸發構建
- ✅ 構建快取 - 使用 npm cache 加速構建過程

### Vercel 部署

- ✅ 自動部署 - Vercel 會自動檢測到 GitHub repository 的變更並部署
- ✅ 預覽部署 - 每個 Pull Request 都會產生預覽 URL
- ✅ 生產部署 - 推送到主分支時自動部署到生產環境

## 設置步驟

### 1. Vercel 部署設置

1. **連接 GitHub**：

   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 點擊 "New Project"
   - 選擇您的 GitHub repository
   - Vercel 會自動檢測到這是一個 Docusaurus 專案

2. **部署配置**：

   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm ci`

3. **環境變數**（如果需要）：
   - 在 Vercel Dashboard 中設置任何需要的環境變數

### 2. GitHub Actions 設置

GitHub Actions 已經自動配置，會在以下情況觸發：

- 推送到 `main` 或 `master` 分支
- 建立 Pull Request
- 手動觸發（在 GitHub repository 的 Actions 標籤中）

## 工作流程

```
代碼推送 → GitHub Actions 構建測試 → Vercel 自動部署
     ↓
  構建成功 ✅ → 部署到生產環境
  構建失敗 ❌ → 阻止部署，發送通知
```

## 本地開發

### 開發環境

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 開啟瀏覽器預覽
# http://localhost:3000
```

### 本地構建測試

```bash
# 構建專案
npm run build

# 預覽構建結果
npm run serve

# 開啟瀏覽器預覽構建結果
# http://localhost:3000
```

## 部署狀態監控

### GitHub Actions

- 前往 GitHub repository 的 **Actions** 標籤查看構建狀態
- 每次構建都會顯示詳細的日誌和結果

### Vercel Dashboard

- 在 [Vercel Dashboard](https://vercel.com/dashboard) 查看部署狀態
- 每次部署都會產生獨特的 URL 供預覽

## 故障排除

### 常見問題

1. **GitHub Actions 構建失敗**：

   - 檢查 Actions 日誌中的錯誤訊息
   - 確認 `package.json` 中的依賴版本正確
   - 檢查是否有語法錯誤或缺少文件

2. **Vercel 部署失敗**：

   - 檢查 Vercel Dashboard 中的部署日誌
   - 確認構建命令和輸出目錄設置正確
   - 檢查是否有環境變數缺失

3. **頁面顯示問題**：
   - 確認 `docusaurus.config.js` 中的 `url` 和 `baseUrl` 設置
   - 檢查靜態資源路徑是否正確

### 檢查清單

- [ ] GitHub repository 已連接到 Vercel
- [ ] Vercel 專案設置正確（Build Command、Output Directory 等）
- [ ] GitHub Actions 權限設置正確
- [ ] 本地構建測試通過

## 專案文件結構

```
.github/
└── workflows/
    └── deploy.yml          # GitHub Actions workflow 配置

docusaurus.config.js        # Docusaurus 主要配置文件
vercel.json                 # Vercel 部署配置（如果需要自訂）
package.json                # Node.js 專案配置
```

## 自動化優勢

✅ **持續整合**：每次代碼變更都會自動測試  
✅ **快速部署**：Vercel 提供快速的全球 CDN 部署  
✅ **預覽環境**：每個 PR 都有獨立的預覽 URL  
✅ **回滾機制**：可以輕鬆回滾到之前的版本  
✅ **監控告警**：構建或部署失敗時會收到通知

## 支援

如果您遇到任何問題，請查看：

1. [Docusaurus 部署文檔](https://docusaurus.io/docs/deployment)
2. [Vercel 文檔](https://vercel.com/docs)
3. [GitHub Actions 文檔](https://docs.github.com/en/actions)
