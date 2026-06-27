# 08｜Vitest 進階技巧與最佳實踐

> 系列文章：從零學會 Vitest — 第 8 篇，共 8 篇（最終章）

---

## Snapshot 測試

Snapshot（快照）測試會把元件或資料的輸出結果「拍一張照」存起來，之後每次跑測試都比對有沒有改變。

**適合用在：**
- UI 元件的 HTML 結構
- 序列化輸出（JSON、文字格式）
- 不常變動但想確保沒有意外改變的東西

### 基本用法

```ts
import { render } from '@testing-library/react'
import { Greeting } from './Greeting'

it('Greeting 的渲染結果應該維持一致', () => {
  const { container } = render(<Greeting name="Alice" />)
  expect(container).toMatchSnapshot()
})
```

第一次跑時，Vitest 會在 `__snapshots__/` 資料夾建立一個 `.snap` 檔案：

```
// Greeting.test.tsx.snap
exports[`Greeting 的渲染結果應該維持一致 1`] = `
<div>
  <h1>
    哈囉，Alice！
  </h1>
</div>
`;
```

之後跑測試都會拿實際輸出和這個快照比對。如果元件改了，快照也要更新：

```bash
# 更新所有快照
npx vitest --update-snapshots
# 或縮寫
npx vitest -u
```

### 行內 Snapshot

不想產生外部檔案，可以把快照直接寫在測試裡：

```ts
it('格式化結果', () => {
  const result = formatDate(new Date('2024-01-15'))
  expect(result).toMatchInlineSnapshot(`"2024年1月15日"`)
})
```

---

## 參數化測試：test.each

當你要用很多不同的輸入測試同一個函式，用 `test.each` 避免重複：

```ts
// ❌ 重複的寫法
it('0 的二倍是 0', () => expect(double(0)).toBe(0))
it('1 的二倍是 2', () => expect(double(1)).toBe(2))
it('5 的二倍是 10', () => expect(double(5)).toBe(10))

// ✅ 用 test.each
test.each([
  [0, 0],
  [1, 2],
  [5, 10],
  [-3, -6],
])('double(%i) 應該是 %i', (input, expected) => {
  expect(double(input)).toBe(expected)
})
```

也可以用物件陣列，讓測試名稱更易讀：

```ts
test.each([
  { price: 100, discount: 0.2, expected: 80 },
  { price: 200, discount: 0.5, expected: 100 },
  { price: 50,  discount: 0,   expected: 50  },
])('$price 元打折後應該是 $expected 元', ({ price, discount, expected }) => {
  expect(applyDiscount(price, discount)).toBe(expected)
})
```

---

## 共用測試設定：setupFiles

如果每個測試檔都需要相同的初始設定（例如 Mock 某個全域物件），可以集中放在 `setupFiles`：

```ts
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

```ts
// src/test-setup.ts
import '@testing-library/jest-dom'

// Mock 全域的 localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})

// 每個測試後清除所有 Mock
afterEach(() => {
  vi.clearAllMocks()
})
```

---

## 測試隔離：避免測試互相影響

測試之間應該完全獨立，一個測試的狀態不能影響另一個。

**常見問題：共享可變狀態**

```ts
// ❌ 錯誤：items 在測試之間被共享
const items = []

it('加入一個元素', () => {
  items.push('A')
  expect(items).toHaveLength(1)
})

it('應該是空的', () => {
  // 這個測試會失敗，因為上一個測試污染了 items
  expect(items).toHaveLength(0)
})
```

```ts
// ✅ 正確：在 beforeEach 初始化
let items: string[]

beforeEach(() => {
  items = []
})

it('加入一個元素', () => {
  items.push('A')
  expect(items).toHaveLength(1)
})

it('應該是空的', () => {
  expect(items).toHaveLength(0)  // ✅ 通過
})
```

---

## 模組 Mock 的幾個技巧

### 只 Mock 模組的部分方法

```ts
vi.mock('./utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./utils')>()
  return {
    ...actual,          // 保留其他方法
    formatDate: vi.fn().mockReturnValue('假日期'),  // 只替換這個
  }
})
```

### Mock 環境變數

```ts
it('在 production 環境應該隱藏 debug 資訊', () => {
  const originalEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'

  // ... 測試邏輯

  process.env.NODE_ENV = originalEnv  // 記得還原
})
```

---

## 命名與組織最佳實踐

### 測試名稱：描述行為，不描述實作

```ts
// ❌ 描述實作細節
it('呼叫 setState 並傳入新的 count', () => {})

// ✅ 描述使用者看到的行為
it('點擊 +1 後，畫面上的數字應該增加', () => {})
```

### 用 AAA 模式組織測試內容

每個測試分成三個區塊：

```ts
it('折扣計算正確', () => {
  // Arrange（準備）：設定測試資料
  const price = 100
  const discount = 0.2

  // Act（執行）：呼叫被測試的函式
  const result = applyDiscount(price, discount)

  // Assert（斷言）：確認結果
  expect(result).toBe(80)
})
```

### 測試檔案組織建議

```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx       ← 放在元件旁邊
  services/
    api.ts
    api.test.ts
  utils/
    math.ts
    math.test.ts
```

---

## 效能：並行 vs 循序

Vitest 預設會並行執行不同的測試檔案，加速整體速度。

如果測試之間有相依關係（例如都操作同一個資料庫），可以設定循序執行：

```ts
// vite.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,  // 所有測試用同一個 worker 跑
      },
    },
  },
})
```

或在單一測試檔案裡強制循序：

```ts
// 在檔案最頂端加上
import { describe } from 'vitest'

describe.sequential('資料庫操作', () => {
  it('先新增', () => { /* ... */ })
  it('再查詢', () => { /* ... */ })
  it('最後刪除', () => { /* ... */ })
})
```

---

## 整個系列重點回顧

| 篇數 | 主題 | 最重要的一件事 |
|---|---|---|
| 01 | 為什麼要寫測試 | 測試讓你安心改程式 |
| 02 | 安裝與第一個測試 | `npm install -D vitest` 就夠了 |
| 03 | 基本語法 | `describe` + `it` + `expect` |
| 04 | Mock 與 Spy | 隔離外部依賴，測試更穩定 |
| 05 | 非同步測試 | `async/await` + 假計時器 |
| 06 | React 元件測試 | 用語意化查詢，貼近使用者視角 |
| 07 | 覆蓋率與 CI | 自動化讓品質有保障 |
| 08 | 進階技巧 | Snapshot、參數化、測試隔離 |

---

## 繼續學習的資源

- **Vitest 官方文件**：[https://vitest.dev](https://vitest.dev)
- **Testing Library 文件**：[https://testing-library.com](https://testing-library.com)
- **Kent C. Dodds 部落格**：Testing Library 作者，有很多測試哲學的好文章
- **GitHub Actions 文件**：[https://docs.github.com/actions](https://docs.github.com/actions)

---

## 最後的話

測試是一種習慣，一開始寫起來可能覺得麻煩，但當你第一次因為測試抓到了一個你沒想到的 bug，就會開始愛上它。

從最小的單元函式開始，慢慢建立起測試習慣，你的程式碼品質和開發信心都會大幅提升。

祝測試都綠燈 ✅

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
*— 完 —*
