# 03｜測試的基本語法：describe、it、expect

> 系列文章：從零學會 Vitest — 第 3 篇，共 8 篇

---

## 測試的三個主角

每一個 Vitest 測試幾乎都由這三個函式組成：

| 函式 | 用途 |
|---|---|
| `describe` | 把相關的測試分組，像資料夾一樣 |
| `it` / `test` | 定義一個測試案例 |
| `expect` | 斷言某個值「應該是什麼」 |

---

## describe：測試分組

`describe` 幫你把測試分類，讓輸出結果更容易閱讀。

```ts
describe('購物車', () => {
  it('加入商品後，數量應該增加', () => { /* ... */ })
  it('移除商品後，數量應該減少', () => { /* ... */ })
})

describe('使用者登入', () => {
  it('密碼正確時，應該回傳 token', () => { /* ... */ })
  it('密碼錯誤時，應該拋出錯誤', () => { /* ... */ })
})
```

`describe` 可以**巢狀**，讓分類更細：

```ts
describe('使用者', () => {
  describe('登入', () => {
    it('正確密碼應該成功', () => { /* ... */ })
  })

  describe('登出', () => {
    it('登出後 token 應該失效', () => { /* ... */ })
  })
})
```

---

## it / test：單一測試案例

`it` 和 `test` 完全一樣，選你喜歡的風格即可。

```ts
// 這兩行完全等價
it('應該回傳正確的折扣價', () => { /* ... */ })
test('應該回傳正確的折扣價', () => { /* ... */ })
```

**命名建議：** 描述「行為」，不描述「做什麼」。

```ts
// ❌ 不夠清楚
it('測試折扣', () => {})

// ✅ 清楚說明預期行為
it('打八折後，100 元應該變成 80 元', () => {})
```

---

## expect：斷言是否符合預期

`expect(實際值).斷言方法(預期值)`

### 最常用的 Matcher

**toBe** — 嚴格相等（用 `===` 比較）

```ts
expect(1 + 1).toBe(2)
expect('hello').toBe('hello')
```

**toEqual** — 深度比較，適合物件和陣列

```ts
// toBe 會失敗，因為兩個物件是不同的記憶體位址
// toEqual 會成功，因為內容相同
expect({ name: 'Alice' }).toEqual({ name: 'Alice' })
expect([1, 2, 3]).toEqual([1, 2, 3])
```

**toBeTruthy / toBeFalsy** — 判斷真假值

```ts
expect(1).toBeTruthy()
expect('hello').toBeTruthy()
expect(0).toBeFalsy()
expect('').toBeFalsy()
expect(null).toBeFalsy()
```

**toBeNull / toBeUndefined** — 判斷 null 或 undefined

```ts
expect(null).toBeNull()
expect(undefined).toBeUndefined()
```

**toContain** — 陣列包含某個元素，或字串包含某個子字串

```ts
expect([1, 2, 3]).toContain(2)
expect('hello world').toContain('world')
```

**toHaveLength** — 確認長度

```ts
expect([1, 2, 3]).toHaveLength(3)
expect('hello').toHaveLength(5)
```

**toBeGreaterThan / toBeLessThan** — 數字大小比較

```ts
expect(10).toBeGreaterThan(5)
expect(3).toBeLessThan(10)
expect(5).toBeGreaterThanOrEqual(5)
```

**toThrow** — 確認函式會拋出錯誤

```ts
function divide(a: number, b: number) {
  if (b === 0) throw new Error('不能除以零')
  return a / b
}

// 注意：toThrow 需要把函式包在另一個函式裡
expect(() => divide(10, 0)).toThrow()
expect(() => divide(10, 0)).toThrow('不能除以零')
```

---

## not：反向斷言

在任何 Matcher 前面加上 `.not`，就是「不應該是」：

```ts
expect(1 + 1).not.toBe(3)
expect([1, 2, 3]).not.toContain(5)
expect(null).not.toBeTruthy()
```

---

## beforeEach / afterEach：每個測試前後執行

有時候每個測試都需要準備相同的初始狀態，可以用 `beforeEach`：

```ts
describe('購物車', () => {
  let cart: string[]

  beforeEach(() => {
    // 每個測試開始前，重置購物車
    cart = []
  })

  it('加入商品', () => {
    cart.push('蘋果')
    expect(cart).toContain('蘋果')
  })

  it('初始狀態應該是空的', () => {
    // 這裡的 cart 是全新的 []，不受上一個測試影響
    expect(cart).toHaveLength(0)
  })
})
```

四個生命週期鉤子：

| 鉤子 | 執行時機 |
|---|---|
| `beforeAll` | 整個 describe 開始前執行一次 |
| `afterAll` | 整個 describe 結束後執行一次 |
| `beforeEach` | 每個 it 開始前執行 |
| `afterEach` | 每個 it 結束後執行 |

---

## 跳過與標記測試

**暫時跳過某個測試：**

```ts
it.skip('這個功能還沒做完', () => {
  // 不會執行
})
```

**只跑這一個測試（除錯時很好用）：**

```ts
it.only('只跑我', () => {
  // 其他測試全部跳過
})
```

> 記得提交前移除 `.only`，否則 CI 只會跑這一個測試！

---

## 完整範例

```ts
// src/cart.ts
export class Cart {
  private items: string[] = []

  add(item: string) {
    this.items.push(item)
  }

  remove(item: string) {
    this.items = this.items.filter(i => i !== item)
  }

  get count() {
    return this.items.length
  }

  get total() {
    return this.items
  }
}
```

```ts
// src/cart.test.ts
import { Cart } from './cart'

describe('Cart', () => {
  let cart: Cart

  beforeEach(() => {
    cart = new Cart()
  })

  describe('加入商品', () => {
    it('加入一個商品後，數量應該是 1', () => {
      cart.add('蘋果')
      expect(cart.count).toBe(1)
    })

    it('加入兩個商品後，應該都在購物車裡', () => {
      cart.add('蘋果')
      cart.add('香蕉')
      expect(cart.total).toEqual(['蘋果', '香蕉'])
    })
  })

  describe('移除商品', () => {
    it('移除商品後，數量應該減少', () => {
      cart.add('蘋果')
      cart.remove('蘋果')
      expect(cart.count).toBe(0)
    })
  })
})
```

---

## 第三篇小結

- `describe` 分組、`it` 定義測試、`expect` 做斷言
- `toEqual` 比較物件內容，`toBe` 比較嚴格相等
- `.not` 可以反轉任何斷言
- `beforeEach` 讓每個測試都從乾淨的狀態開始

---

## 下一篇預告

👉 **第 4 篇：Mock 與 Spy：假資料與行為追蹤**

當你的程式需要呼叫外部 API 或資料庫時，測試要怎麼隔離這些依賴？下一篇來學 Mock。

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
