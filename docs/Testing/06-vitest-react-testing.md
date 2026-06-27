# 06｜React 元件測試

> 系列文章：從零學會 Vitest — 第 6 篇，共 8 篇

---

## 元件測試需要什麼？

測試 React 元件跟測試純函式不太一樣，你需要：

1. **模擬瀏覽器環境**：因為測試在 Node.js 裡跑，沒有真正的 DOM
2. **渲染元件**：把元件「畫」出來
3. **查詢元素**：找到按鈕、文字、輸入框
4. **模擬互動**：點擊、輸入、提交

這需要兩個套件配合 Vitest 使用：

| 套件 | 用途 |
|---|---|
| `@testing-library/react` | 渲染元件、查詢元素 |
| `jsdom` 或 `happy-dom` | 模擬瀏覽器 DOM 環境 |

---

## 安裝與設定

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

接著更新 `vite.config.ts`：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',           // 模擬瀏覽器環境
    setupFiles: './src/test-setup.ts', // 測試前的全域設定
  },
})
```

建立 `src/test-setup.ts`：

```ts
// src/test-setup.ts
import '@testing-library/jest-dom'
```

> `@testing-library/jest-dom` 提供額外的斷言方法，例如 `toBeInTheDocument()`、`toHaveTextContent()` 等，讓測試更易讀。

---

## 第一個元件測試

先建立一個簡單的元件：

```tsx
// src/Greeting.tsx
type Props = {
  name: string
}

export function Greeting({ name }: Props) {
  return <h1>哈囉，{name}！</h1>
}
```

然後寫測試：

```tsx
// src/Greeting.test.tsx
import { render, screen } from '@testing-library/react'
import { Greeting } from './Greeting'

it('應該顯示正確的問候語', () => {
  render(<Greeting name="Alice" />)

  // 查詢畫面上的文字
  expect(screen.getByText('哈囉，Alice！')).toBeInTheDocument()
})
```

就這樣！`render()` 把元件畫出來，`screen.getByText()` 找到對應的元素，`toBeInTheDocument()` 確認它確實存在。

---

## 查詢元素的方法

Testing Library 提供多種查詢方式，優先使用語意化的查詢（和使用者看到的東西一致）。

### 推薦優先順序

**getByRole** — 依照 ARIA 角色查詢（最推薦）

```ts
screen.getByRole('button', { name: '送出' })
screen.getByRole('heading', { name: '標題' })
screen.getByRole('textbox', { name: '電子郵件' })
screen.getByRole('checkbox')
```

**getByLabelText** — 依照 `<label>` 的文字查詢輸入框

```ts
screen.getByLabelText('使用者名稱')
```

**getByPlaceholderText** — 依照 placeholder 查詢

```ts
screen.getByPlaceholderText('請輸入電子郵件')
```

**getByText** — 依照文字內容查詢

```ts
screen.getByText('送出表單')
```

**getByTestId** — 依照 `data-testid` 屬性查詢（最後手段）

```tsx
// 元件
<div data-testid="user-card">...</div>

// 測試
screen.getByTestId('user-card')
```

### get vs query vs find

| 前綴 | 找不到時 | 回傳 | 用途 |
|---|---|---|---|
| `getBy` | 拋出錯誤 | 單一元素 | 元素一定存在時 |
| `queryBy` | 回傳 `null` | 單一元素或 null | 確認元素「不存在」時 |
| `findBy` | 拋出錯誤 | Promise | 等待非同步渲染的元素 |

```ts
// 確認元素不存在
expect(screen.queryByText('錯誤訊息')).not.toBeInTheDocument()

// 等待非同步出現的元素
const message = await screen.findByText('載入完成')
```

---

## 模擬使用者互動

用 `@testing-library/user-event` 模擬真實的使用者操作（比 `fireEvent` 更接近真實行為）。

```tsx
// src/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>目前數量：{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c - 1)}>-1</button>
    </div>
  )
}
```

```tsx
// src/Counter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter', () => {
  it('初始數量應該是 0', () => {
    render(<Counter />)
    expect(screen.getByText('目前數量：0')).toBeInTheDocument()
  })

  it('點擊 +1 後數量應該增加', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: '+1' }))

    expect(screen.getByText('目前數量：1')).toBeInTheDocument()
  })

  it('連續點擊多次', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: '+1' }))
    await user.click(screen.getByRole('button', { name: '+1' }))
    await user.click(screen.getByRole('button', { name: '-1' }))

    expect(screen.getByText('目前數量：1')).toBeInTheDocument()
  })
})
```

---

## 測試表單輸入

```tsx
// src/LoginForm.tsx
import { useState } from 'react'

type Props = {
  onSubmit: (email: string, password: string) => void
}

export function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(email, password) }}>
      <label>
        電子郵件
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>
      <label>
        密碼
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">登入</button>
    </form>
  )
}
```

```tsx
// src/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('填入資料後點擊登入，應該呼叫 onSubmit 並傳入正確資料', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()

    render(<LoginForm onSubmit={mockSubmit} />)

    await user.type(screen.getByLabelText('電子郵件'), 'alice@example.com')
    await user.type(screen.getByLabelText('密碼'), 'secret123')
    await user.click(screen.getByRole('button', { name: '登入' }))

    expect(mockSubmit).toHaveBeenCalledWith('alice@example.com', 'secret123')
  })
})
```

---

## 測試非同步渲染

當元件需要等待 API 資料才能顯示內容時：

```tsx
// src/UserCard.tsx
import { useEffect, useState } from 'react'

type User = { name: string; email: string }

export function UserCard({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
  }, [userId])

  if (!user) return <p>載入中…</p>

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

```tsx
// src/UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { UserCard } from './UserCard'

it('載入完成後應該顯示使用者資料', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve({ name: 'Alice', email: 'alice@example.com' }),
  } as Response)

  render(<UserCard userId={1} />)

  // 先確認載入狀態
  expect(screen.getByText('載入中…')).toBeInTheDocument()

  // 等待使用者名稱出現（非同步）
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('alice@example.com')).toBeInTheDocument()
})
```

---

## 常用的 jest-dom 斷言

| 方法 | 說明 |
|---|---|
| `toBeInTheDocument()` | 元素存在於 DOM |
| `toBeVisible()` | 元素可見 |
| `toBeDisabled()` | 元素是 disabled 狀態 |
| `toHaveTextContent('text')` | 元素包含指定文字 |
| `toHaveValue('value')` | 輸入框有指定的值 |
| `toHaveClass('class-name')` | 元素有指定的 CSS class |
| `toHaveFocus()` | 元素目前是 focus 狀態 |

---

## 第六篇小結

- `jsdom` 提供測試所需的瀏覽器環境
- `render()` 渲染元件，`screen` 查詢元素
- 優先用語意化查詢：`getByRole` > `getByLabelText` > `getByText`
- `userEvent` 模擬真實使用者操作
- `findBy` 系列用於等待非同步渲染的元素

---

## 下一篇預告

👉 **第 7 篇：覆蓋率報告與 CI 整合**

測試寫完了，怎麼知道哪些程式碼還沒被測試到？如何讓測試自動在每次 Push 時執行？

---

*本系列文章共 8 篇，適合 JavaScript / TypeScript 初學者。*
