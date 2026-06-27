# 04｜Mock 與 Spy：假資料與行為追蹤

> 系列文章：從零學會 Vitest — 第 4 篇，共 8 篇

---

## 為什麼需要 Mock？

假設你有一個函式，需要呼叫外部 API 才能取得資料：

```ts
// src/user.ts
export async function getUserName(id: number) {
  const res = await fetch(`https://api.example.com/users/${id}`)
  const data = await res.json()
  return data.name
}
```

測試這個函式時，你**不會想要真的發送 HTTP 請求**，原因是：

- 外部 API 可能不穩定，造成測試隨機失敗
- 每次跑測試都要等網路，速度慢
- 測試環境可能沒有網路

這時候就需要 **Mock（模擬）**：用假的函式或假的資料，取代真實的外部依賴。

---

## vi.fn()：建立假函式

`vi.fn()` 可以建立一個「假函式」，你可以控制它回傳什麼、並且追蹤它有沒有被呼叫。

```ts
import { vi } from 'vitest'

// 建立一個假函式
const mockGreet = vi.fn()

// 預設回傳 undefined
mockGreet('Alice')  // → undefined

// 設定回傳值
mockGreet.mockReturnValue('哈囉！')
mockGreet('Alice')  // → '哈囉！'
```

### 追蹤呼叫記錄

```ts
const mockFn = vi.fn()

mockFn('第一次')
mockFn('第二次')

// 確認有沒有被呼叫
expect(mockFn).toHaveBeenCalled()

// 確認被呼叫幾次
expect(mockFn).toHaveBeenCalledTimes(2)

// 確認用什麼參數呼叫
expect(mockFn).toHaveBeenCalledWith('第一次')
expect(mockFn).toHaveBeenLastCalledWith('第二次')
```

---

## vi.spyOn()：監視真實函式

`vi.fn()` 是完全替換，`vi.spyOn()` 則是「偷偷監視」一個真實物件的方法，可以追蹤呼叫記錄，也可以選擇要不要覆蓋它的行為。

```ts
import { vi } from 'vitest'

const calculator = {
  add: (a: number, b: number) => a + b,
}

// 監視 add 方法，但仍然執行原本的邏輯
const spy = vi.spyOn(calculator, 'add')

calculator.add(1, 2)  // 真的執行，回傳 3

expect(spy).toHaveBeenCalledWith(1, 2)
expect(spy).toHaveBeenCalledTimes(1)
```

也可以覆蓋它的行為：

```ts
vi.spyOn(calculator, 'add').mockReturnValue(999)

calculator.add(1, 2)  // 回傳 999，不執行原本邏輯
```

---

## vi.mock()：Mock 整個模組

當你想要 Mock 一個被 `import` 進來的模組時，使用 `vi.mock()`。

```ts
// src/api.ts
export async function fetchUser(id: number) {
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
}
```

```ts
// src/user.test.ts
import { vi, expect, it } from 'vitest'
import { fetchUser } from './api'
import { getUserName } from './user'

// 告訴 Vitest：把 './api' 整個模組都換成假的
vi.mock('./api')

it('應該回傳使用者名稱', async () => {
  // 設定假的回傳值
  vi.mocked(fetchUser).mockResolvedValue({ name: 'Alice', id: 1 })

  const name = await getUserName(1)

  expect(name).toBe('Alice')
  expect(fetchUser).toHaveBeenCalledWith(1)
})
```

> `vi.mock()` 要放在檔案最頂層，Vitest 會自動把它提升到 import 之前執行。

---

## mockReturnValue vs mockResolvedValue

| 方法 | 用途 |
|---|---|
| `mockReturnValue(val)` | 讓假函式回傳一個普通值 |
| `mockReturnValueOnce(val)` | 只有第一次呼叫回傳這個值 |
| `mockResolvedValue(val)` | 讓假函式回傳一個已完成的 Promise |
| `mockRejectedValue(err)` | 讓假函式回傳一個失敗的 Promise |

```ts
const mockFetch = vi.fn()

// 第一次呼叫回傳 Alice，第二次回傳 Bob
mockFetch
  .mockResolvedValueOnce({ name: 'Alice' })
  .mockResolvedValueOnce({ name: 'Bob' })

await mockFetch()  // → { name: 'Alice' }
await mockFetch()  // → { name: 'Bob' }
```

---

## 每個測試結束後清除 Mock

Mock 的狀態會在測試之間累積，建議在 `afterEach` 清除：

```ts
afterEach(() => {
  vi.clearAllMocks()   // 清除呼叫記錄，但保留 mock 設定
  // 或
  vi.resetAllMocks()   // 清除呼叫記錄 + 重置回傳值
  // 或
  vi.restoreAllMocks() // 還原 spyOn 監視的原始方法
})
```

---

## 完整範例：測試一個呼叫 API 的服務

```ts
// src/weather.ts
import { fetchWeather } from './api'

export async function getTemperature(city: string): Promise<string> {
  const data = await fetchWeather(city)
  return `${city} 目前氣溫：${data.temp}°C`
}
```

```ts
// src/weather.test.ts
import { vi, describe, it, expect, afterEach } from 'vitest'
import { fetchWeather } from './api'
import { getTemperature } from './weather'

vi.mock('./api')

describe('getTemperature', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('應該回傳格式正確的氣溫字串', async () => {
    vi.mocked(fetchWeather).mockResolvedValue({ temp: 28 })

    const result = await getTemperature('台北')

    expect(result).toBe('台北 目前氣溫：28°C')
  })

  it('API 失敗時應該拋出錯誤', async () => {
    vi.mocked(fetchWeather).mockRejectedValue(new Error('網路錯誤'))

    await expect(getTemperature('台北')).rejects.toThrow('網路錯誤')
  })
})
```

---

## 第四篇小結

- `vi.fn()` 建立假函式，可以追蹤呼叫記錄
- `vi.spyOn()` 監視真實物件的方法
- `vi.mock()` 替換整個被 import 的模組
- `afterEach` 搭配 `vi.clearAllMocks()` 保持測試乾淨

---

## 下一篇預告

👉 **第 5 篇：測試非同步程式碼（async / await）**

本篇已經看到非同步測試的影子，下一篇會更完整介紹各種異步場景的處理方式。

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
