---
title: React TypeScript 常用用法
description: A short description of this page
keywords: ["TypeScript", "JavaScript", "React"]
---

## 1\. 定義 Props 型別（Component Props）

#### 用法：

```tsx
type ButtonProps = {
  text: string;
  onClick: () => void;
};

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return <button onClick={onClick}>{text}</button>;
};
```

#### 說明：

這是最基本的用法，定義一個 `Props` 的型別，讓傳入元件的資料有明確的型別限制，防止打錯參數名或資料型態錯誤。

---

## 2. 使用 `useState` 時定義狀態型別

#### 用法：

```tsx
const [count, setCount] = useState<number>(0);
```

#### 說明：

如果 TypeScript 無法推斷型別（如初始值是 `null` 或 `undefined`），建議自己標明型別。

```tsx
const [user, setUser] = useState<User | null>(null);
```

---

## 3. 使用 `useRef` 時定義參考型別

#### 用法：

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
```

#### 說明：

用 `useRef` 操作 DOM 時，要指定 HTML 元素的型別，否則 TypeScript 會不知道 `.focus()` 是不是可用。

---

## 4. 定義事件型別

#### 用法：

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
```
#### 說明：

使用 `React.ChangeEvent` 來明確定義事件來源的型別，這樣就可以安全地存取 `.target.value`。

---

## 5. Children 的型別

#### 用法：

```tsx
type CardProps = {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ children }) => {
  return <div className="card">{children}</div>;
};
```

#### 說明：

當你的元件需要接收 children（像是 slot 的感覺），可以用 `React.ReactNode` 表示。

---

## 6. 元件回傳型別

#### 用法：

```tsx
const MyComponent: React.FC = () => {
  return <div>Hello!</div>;
};
```

或使用函式形式：

```tsx
const MyComponent = (): JSX.Element => {
  return <div>Hello!</div>;
};
```

#### 說明：

`JSX.Element` 是 React 元件回傳的型別，也可以使用 `React.FC`（Functional Component 簡寫），它會自動幫你帶入 `children` 的型別。

---

## 7. Enum 列舉在選單中使用

#### 用法：

```tsx
enum Gender {
  Male = "男",
  Female = "女",
  Other = "其他",
}

type Props = {
  gender: Gender;
};

const Profile = ({ gender }: Props) => {
  return <p>性別：{gender}</p>;
};
```

#### 說明：

使用 `enum` 可以限制只能選特定的值，適合用在選單、狀態列舉等情境。

---

## 8. 用介面 `interface` 定義物件型別

#### 用法：

```tsx
interface User {
  id: number;
  name: string;
  email?: string; // 可選屬性
}
```
#### 說明：

`interface` 和 `type` 在大多數情況下可以互換，不過 `interface` 比較常用來定義資料結構（像是後端回傳的 user 資料）。

---

## 9. 陣列與物件清單型別

#### 用法：

```tsx
const users: User[] = [
  { id: 1, name: "小明" },
  { id: 2, name: "小美", email: "mei@example.com" },
];

```

或用泛型寫法：

```tsx
const users = useState<Array<User>>([]);

```

---

## 10. 泛型 Generic（進階使用）
#### 用法：

```tsx
type Option<T> = {
  label: string;
  value: T;
};

const options: Option<number>[] = [
  { label: "一", value: 1 },
  { label: "二", value: 2 },
];
```
#### 說明：

當你想要讓某個型別可以接受多種變化，但又不想失去型別檢查，就可以用泛型 `T`。
