# 07｜覆蓋率報告與 CI 整合

> 系列文章：從零學會 Vitest — 第 7 篇，共 8 篇

---

## 什麼是覆蓋率（Coverage）？

**覆蓋率**告訴你：你的測試跑過了多少比例的程式碼。

```
程式碼共 100 行
測試執行時跑過了 80 行
→ 覆蓋率 80%
```

覆蓋率報告有四個指標：

| 指標 | 意思 |
|---|---|
| **Statements** | 每一行陳述式有沒有被執行到 |
| **Branches** | 每個 if/else 的分支有沒有都測到 |
| **Functions** | 每個函式有沒有被呼叫過 |
| **Lines** | 每一行有沒有被執行過 |

> 覆蓋率高不代表測試品質高，但覆蓋率太低通常代表有盲點。一般專案建議維持在 **70~80%** 以上。

---

## 安裝 Coverage 工具

Vitest 使用 `@vitest/coverage-v8` 或 `@vitest/coverage-istanbul`，推薦用 v8（不需要額外設定）：

```bash
npm install -D @vitest/coverage-v8
```

---

## 設定覆蓋率

在 `vite.config.ts` 加入 coverage 設定：

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],  // 輸出格式
      include: ['src/**/*.ts', 'src/**/*.tsx'],  // 哪些檔案要計算覆蓋率
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/test-setup.ts',
      ],
      thresholds: {
        // 設定最低門檻，低於就讓測試失敗
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
})
```

在 `package.json` 加入指令：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 產生覆蓋率報告

```bash
npm run test:coverage
```

終端機會顯示：

```
 % Coverage report from v8
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.71 |    83.33 |   88.89 |   85.71 |
 src/               |         |          |         |         |
  cart.ts           |   90.00 |    85.00 |   90.00 |   90.00 |
  math.ts           |  100.00 |   100.00 |  100.00 |  100.00 |
  weather.ts        |   75.00 |    66.67 |   80.00 |   75.00 |
--------------------|---------|----------|---------|---------|
```

同時會在專案根目錄產生 `coverage/` 資料夾，開啟 `coverage/index.html` 可以看到互動式報告，每一行程式碼都顯示有沒有被測試到。

---

## CI 整合：GitHub Actions

CI（持續整合）讓你每次推程式碼時，自動跑測試。如果測試失敗，可以立刻知道，避免問題進入主分支。

在專案根目錄建立 `.github/workflows/test.yml`：

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # 1. 拉下程式碼
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. 安裝 Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 3. 安裝相依套件
      - name: Install dependencies
        run: npm ci

      # 4. 跑測試（含覆蓋率）
      - name: Run tests with coverage
        run: npm run test:coverage

      # 5. 上傳覆蓋率報告（可選）
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
```

設定完後，每次 Push 或開 Pull Request 時，GitHub 都會自動跑測試。

---

## 在 PR 顯示覆蓋率差異（可選）

安裝 `vitest-coverage-report` Action，讓 PR 自動附上覆蓋率摘要：

```yaml
# 接在上面的 steps 之後
      - name: Coverage comment
        uses: davelosert/vitest-coverage-report-action@v2
        if: always()
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

設定後，每個 PR 都會自動出現這樣的留言：

```
📊 覆蓋率報告

| 指標        | 覆蓋率  | 變化   |
|------------|--------|-------|
| Statements | 85.7%  | +2.1% |
| Branches   | 83.3%  | -0.5% |
| Functions  | 88.9%  | +1.2% |
| Lines      | 85.7%  | +2.1% |
```

---

## 忽略不需要計算覆蓋率的程式碼

有些程式碼不需要（或無法）被測試到，可以加上特殊注解忽略：

```ts
// 忽略下一行
/* v8 ignore next */
console.log('debug')

// 忽略整個函式
/* v8 ignore start */
function devOnlyHelper() {
  // 開發環境才用的東西
}
/* v8 ignore stop */
```

---

## 第七篇小結

- 覆蓋率報告幫你找到還沒被測試的程式碼
- 安裝 `@vitest/coverage-v8` 後用 `--coverage` 旗標產生報告
- `thresholds` 設定覆蓋率門檻，低於就讓 CI 失敗
- GitHub Actions 讓測試在每次 Push 時自動執行

---

## 下一篇預告

👉 **第 8 篇：Vitest 進階技巧與最佳實踐**

系列的最終章！Snapshot 測試、測試隔離、共用 setup 以及讓測試更好維護的命名與組織規範。

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
