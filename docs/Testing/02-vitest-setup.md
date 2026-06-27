# 02｜環境安裝與第一個測試

> 系列文章：從零學會 Vitest — 第 2 篇，共 8 篇

---

## 前置條件

開始之前，請確認你的電腦已安裝：

- **Node.js** 18 以上（在終端機輸入 `node -v` 確認）
- **npm** 或 **pnpm**（本篇以 npm 示範）

---

## 方式一：全新的 Vite 專案

如果你還沒有專案，用以下指令建立一個：

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install
```

然後安裝 Vitest：

```bash
npm install -D vitest
```

接著打開 `vite.config.ts`，加入 `test` 設定：

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // 讓你可以不用 import { describe, it, expect }，直接使用
    globals: true,
  },
})
```

如果你用 TypeScript，還需要在 `tsconfig.json` 加一行，讓編輯器認識全域語法：

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

---

## 方式二：現有專案加入 Vitest

直接安裝即可，不影響原本的程式碼：

```bash
npm install -D vitest
```

然後在 `package.json` 加入測試指令：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

> `vitest` 會進入監聽模式（改檔案自動重跑）；`vitest run` 跑一次就結束，適合 CI。

---

## 寫你的第一個函式

在 `src/` 資料夾底下建立一個檔案 `math.ts`：

```ts
// src/math.ts

// 計算折扣後的價格
export function applyDiscount(price: number, discount: number): number {
  return price * (1 - discount)
}

// 判斷一個數字是否為偶數
export function isEven(n: number): boolean {
  return n % 2 === 0
}
```

---

## 寫你的第一個測試

在同一個資料夾建立 `math.test.ts`：

```ts
// src/math.test.ts
import { applyDiscount, isEven } from './math'

describe('applyDiscount', () => {
  it('100 元打八折應該是 80 元', () => {
    expect(applyDiscount(100, 0.2)).toBe(80)
  })

  it('200 元打五折應該是 100 元', () => {
    expect(applyDiscount(200, 0.5)).toBe(100)
  })
})

describe('isEven', () => {
  it('4 是偶數', () => {
    expect(isEven(4)).toBe(true)
  })

  it('7 不是偶數', () => {
    expect(isEven(7)).toBe(false)
  })
})
```

---

## 跑測試

在終端機輸入：

```bash
npm test
```

你會看到類似這樣的輸出：

```
 ✓ src/math.test.ts (4 tests) 12ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

四個測試全部通過，恭喜你完成第一個自動化測試！ 🎉

---

## 測試檔案放哪裡？

Vitest 預設會尋找以下位置的檔案：

```
**/*.test.ts
**/*.spec.ts
**/__tests__/**/*.ts
```

兩種常見的組織方式都可以：

```
# 方式 A：測試檔放在原始碼旁邊（推薦）
src/
  math.ts
  math.test.ts
  utils.ts
  utils.test.ts

# 方式 B：集中放在 __tests__ 資料夾
src/
  math.ts
  utils.ts
__tests__/
  math.test.ts
  utils.test.ts
```

方式 A 比較方便，改程式碼時測試檔就在旁邊，不用到處找。

---

## 開啟 UI 介面（可選）

Vitest 有一個很好用的視覺化介面：

```bash
npm install -D @vitest/ui
npx vitest --ui
```

會自動開啟瀏覽器，讓你用圖形介面看測試結果。

---

## 第二篇小結

- 安裝 Vitest 只需要一行：`npm install -D vitest`
- 設定 `vite.config.ts` 加上 `globals: true` 最方便
- 測試檔命名為 `*.test.ts` 或 `*.spec.ts`
- `npm test` 啟動監聽模式，改程式自動重跑

---

## 下一篇預告

👉 **第 3 篇：測試的基本語法：describe、it、expect**

你已經看過這些語法了，下一篇會更深入說明它們的用途，以及各種常用的 `expect` 斷言方式。

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
