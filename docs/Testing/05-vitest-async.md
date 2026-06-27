# 05｜測試非同步程式碼（async / await）

> 系列文章：從零學會 Vitest — 第 5 篇，共 8 篇

---

## 非同步測試的挑戰

現代 JavaScript 有很多非同步操作：呼叫 API、讀取檔案、等待計時器……

如果不正確處理，測試可能在非同步操作完成之前就結束，導致測試通過了，但其實根本沒有真的測到東西。

```ts
// ❌ 錯誤示範：測試在 fetch 完成前就結束了
it('應該取得使用者資料', () => {
  fetch('/api/user').then(res => {
    expect(res.status).toBe(200)  // 這行可能根本沒執行到！
  })
})
```

---

## 正確方式一：async / await

最簡單、最推薦的做法：把 `it` 的回呼函式標記為 `async`。

```ts
it('應該取得使用者資料', async () => {
  const res = await fetch('/api/user')
  expect(res.status).toBe(200)
})
```

Vitest 會等待 `await` 完成，確保測試在所有非同步操作結束後才判斷結果。

---

## 正確方式二：回傳 Promise

如果你不想用 `async/await`，也可以直接回傳 Promise：

```ts
it('應該取得使用者資料', () => {
  return fetch('/api/user').then(res => {
    expect(res.status).toBe(200)
  })
})
```

> 記得一定要 `return`，不然 Vitest 不知道要等這個 Promise。

---

## 測試 Promise 成功與失敗

### 測試成功（resolves）

```ts
it('成功時應該回傳資料', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ name: 'Alice' })

  await expect(mockFetch()).resolves.toEqual({ name: 'Alice' })
})
```

### 測試失敗（rejects）

```ts
it('失敗時應該拋出錯誤', async () => {
  const mockFetch = vi.fn().mockRejectedValue(new Error('伺服器錯誤'))

  await expect(mockFetch()).rejects.toThrow('伺服器錯誤')
})
```

> 注意：`.resolves` 和 `.rejects` 前面也要加 `await`。

---

## 測試計時器：vi.useFakeTimers()

有時候程式碼裡有 `setTimeout` 或 `setInterval`，如果真的等待時間，測試會很慢。

Vitest 提供「假計時器」讓你控制時間。

```ts
// src/delay.ts
export function delayedGreet(name: string): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`哈囉，${name}！`)
    }, 3000)  // 等三秒
  })
}
```

```ts
// src/delay.test.ts
import { vi, it, expect, beforeEach, afterEach } from 'vitest'
import { delayedGreet } from './delay'

beforeEach(() => {
  vi.useFakeTimers()  // 啟用假計時器
})

afterEach(() => {
  vi.useRealTimers()  // 恢復真實計時器
})

it('3 秒後應該回傳問候語', async () => {
  const promise = delayedGreet('Alice')

  // 手動快轉時間 3 秒，不用真的等
  vi.advanceTimersByTime(3000)

  const result = await promise
  expect(result).toBe('哈囉，Alice！')
})
```

常用的時間控制方法：

| 方法 | 說明 |
|---|---|
| `vi.advanceTimersByTime(ms)` | 快轉指定毫秒數 |
| `vi.runAllTimers()` | 執行所有待執行的計時器 |
| `vi.runOnlyPendingTimers()` | 只執行目前待執行的計時器（不包含計時器裡的計時器） |

---

## 測試輪詢（setInterval）

```ts
// src/poller.ts
export function startPolling(callback: () => void, interval: number) {
  return setInterval(callback, interval)
}
```

```ts
// src/poller.test.ts
import { vi, it, expect, beforeEach, afterEach } from 'vitest'
import { startPolling } from './poller'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('每秒應該呼叫 callback', () => {
  const callback = vi.fn()

  startPolling(callback, 1000)

  // 快轉 3 秒
  vi.advanceTimersByTime(3000)

  // 應該被呼叫 3 次
  expect(callback).toHaveBeenCalledTimes(3)
})
```

---

## 設定測試逾時時間

Vitest 預設測試逾時是 5 秒，如果某個測試需要更長時間（例如整合測試），可以調整：

```ts
// 單個測試設定逾時（毫秒）
it('需要比較長時間的測試', async () => {
  // ...
}, 10000)  // 第三個參數是逾時時間，10 秒
```

或在設定檔全域調整：

```ts
// vite.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000,
  },
})
```

---

## 完整範例：測試帶有 retry 機制的 API 呼叫

```ts
// src/fetchWithRetry.ts
export async function fetchWithRetry(
  url: string,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url)
      return res
    } catch (err) {
      lastError = err as Error
      // 等一秒再重試
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  throw new Error(`重試 ${maxRetries} 次後仍然失敗：${lastError!.message}`)
}
```

```ts
// src/fetchWithRetry.test.ts
import { vi, it, expect, beforeEach, afterEach } from 'vitest'
import { fetchWithRetry } from './fetchWithRetry'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('成功時應該直接回傳結果', async () => {
  const mockResponse = { ok: true } as Response
  vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

  const result = await fetchWithRetry('https://api.example.com')
  expect(result).toBe(mockResponse)
  expect(fetch).toHaveBeenCalledTimes(1)
})

it('失敗時應該重試，超過上限才拋出錯誤', async () => {
  vi.spyOn(global, 'fetch').mockRejectedValue(new Error('網路錯誤'))

  const promise = fetchWithRetry('https://api.example.com', 3)

  // 快轉兩次重試的等待時間
  await vi.runAllTimersAsync()

  await expect(promise).rejects.toThrow('重試 3 次後仍然失敗')
  expect(fetch).toHaveBeenCalledTimes(3)
})
```

---

## 第五篇小結

- `async/await` 是測試非同步程式碼最簡單的方式
- `.resolves` / `.rejects` 可以優雅地斷言 Promise 結果
- `vi.useFakeTimers()` 讓你控制時間，不用真的等
- `vi.advanceTimersByTime(ms)` 快轉時間

---

## 下一篇預告

👉 **第 6 篇：React 元件測試**

學完了純邏輯的測試，下一篇來測試 UI！用 Vitest 搭配 Testing Library 測試 React 元件的渲染與互動。

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
