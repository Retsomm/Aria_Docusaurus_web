# Vercel GitHub Actions 設置指南

要讓 GitHub Actions 自動部署到 Vercel，您需要在 GitHub repository 中設置一些 secrets。

## 步驟 1：獲取 Vercel Token

1. 前往 [Vercel Dashboard](https://vercel.com/account/tokens)
2. 點擊 **Create Token**
3. 輸入 token 名稱（例如：`GitHub Actions`）
4. 選擇適當的 scope（建議選擇您的個人帳號）
5. 點擊 **Create**
6. **複製並保存這個 token**（只會顯示一次）

## 步驟 2：獲取 Vercel 專案資訊

在您的本地專案中運行以下命令：

```bash
# 安裝 Vercel CLI（如果還沒安裝）
npm i -g vercel

# 登入 Vercel
vercel login

# 在專案目錄中連接到 Vercel 專案
vercel link

# 獲取專案資訊
vercel env ls
```

或者您可以在 Vercel Dashboard 中找到：

1. 前往您的專案設置頁面
2. 在 **General** 標籤中找到：
   - **Project ID**
   - **Team ID**（如果是個人帳號，這就是您的 User ID）

## 步驟 3：在 GitHub 中設置 Secrets

1. 前往您的 GitHub repository：`https://github.com/Retsomm/Aria_web`
2. 點擊 **Settings** 標籤
3. 在左側選單中點擊 **Secrets and variables** > **Actions**
4. 點擊 **New repository secret** 並添加以下 secrets：

### 必要的 Secrets：

- **Name**: `VERCEL_TOKEN`
  - **Value**: 您在步驟 1 中獲得的 Vercel token

- **Name**: `VERCEL_ORG_ID`
  - **Value**: 您的 Vercel 組織/用戶 ID

- **Name**: `VERCEL_PROJECT_ID`
  - **Value**: 您的 Vercel 專案 ID

## 步驟 4：測試部署

設置完成後：

1. 推送任何變更到 `main` 分支
2. 前往 GitHub repository 的 **Actions** 標籤
3. 查看 workflow 是否成功運行
4. 檢查 Vercel Dashboard 中是否有新的部署記錄

## 工作流程

```
推送到 main 分支
    ↓
GitHub Actions 構建測試
    ↓
測試通過後自動部署到 Vercel
    ↓
部署完成，網站更新
```

## 疑難排解

### 如果部署失敗：

1. **檢查 Secrets**：確保所有 secrets 都正確設置
2. **檢查權限**：確保 Vercel token 有足夠的權限
3. **檢查專案 ID**：確保 `VERCEL_PROJECT_ID` 對應正確的專案
4. **查看日誌**：在 GitHub Actions 中查看詳細的錯誤訊息

### 如果不想使用 GitHub Actions 部署：

如果您只想要構建測試而讓 Vercel 自動部署，可以：

1. 刪除 `deploy-to-vercel` job
2. 保留 `build-and-test` job 進行代碼品質檢查
3. 讓 Vercel 的 Git 整合自動處理部署

## 注意事項

- Vercel token 是敏感資訊，絕對不要直接寫在代碼中
- 建議定期更新 Vercel token
- 如果是公開的 repository，確保 secrets 不會洩露
