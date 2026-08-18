---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 4 堂：快取機制基礎

# 43快取 Key 生成邏輯

在上一節中，我們學習了如何透過 `keepUnusedDataFor` 來控制快取在「無人訂閱」後的存活時間。然而，你有沒有想過：RTK Query 究竟是憑什麼判斷兩個不同的元件是在請求「同一份資料」，還是「兩份不同的資料」？

當你在 A 元件呼叫 `useGetPostQuery(1)`，同時在 B 元件也呼叫 `useGetPostQuery(1)` 時，為什麼網路面板（Network Tab）只會出現一個請求？但如果你在 C 元件呼叫 `useGetPostQuery(2)`，它卻會乖乖發出第二個請求？

這背後的秘密武器就是 **「快取 Key」（Cache Key）**。

---

## 什麼是快取 Key？

在 Redux 的世界觀裡，所有的資料都必須存在一個巨大的狀態樹（State Tree）中。RTK Query 為了管理這些非同步資料，必須為每一份從伺服器抓回來的資料找一個「唯一的地址」。這個地址就是快取 Key。

你可以把快取 Key 想像成圖書館的「索書號」。當你想借一本書時，管理員會先看索書號：

1. 如果架上已經有這本索書號的書（快取存在），直接拿給你。
2. 如果這本書正在被採購中（請求發送中），請你坐下來等一下，等書到了跟前一個人一起看。
3. 如果架上完全沒有這筆記錄，才去訂購（發送新請求）。

### 快取 Key 的構成公式

在 RTK Query 中，一個唯一的快取 Key 是由兩個部分組成的：

$$
\text{Cache Key} = \text{Endpoint 名稱} + \text{序列化後的參數 (Serialized Arguments)}
$$

- **Endpoint 名稱**：你在 `createApi` 的 `endpoints` 中定義的名稱（例如 `getPost`）。
- **序列化後的參數**：你傳入 Hook 的參數（例如 `1` 或 `{ id: 1 }`），會被轉換成一個穩定的字串。

---

## 去重複請求（Deduplication）的運作原理

「去重複請求」是 RTK Query 最核心的效能優化機制之一。它的邏輯非常直覺：**只要快取 Key 相同，就不會重複發送網路請求。**

讓我們來看一個實際的場景：

### 預測與觀察：元件間的同步

假設我們有一個顯示文章標題的 `PostTitle` 元件，以及一個顯示文章內容的 `PostContent` 元件。它們都依賴同一個 API 端點。

```typescript
// 定義 API Slice
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getPost: builder.query<Post, number>({
      query: (id) => `posts/${id}`,
    }),
  }),
});

// 元件 A：顯示標題
function PostTitle({ id }: { id: number }) {
  const { data } = useGetPostQuery(id); // 這裡呼叫一次
  return <h1>{data?.title}</h1>;
}

// 元件 B：顯示詳細內容
function PostContent({ id }: { id: number }) {
  const { data } = useGetPostQuery(id); // 這裡又呼叫一次
  return <p>{data?.content}</p>;
}

// 頁面組合
function PostPage() {
  return (
    <div>
      <PostTitle id={1} />
      <PostContent id={1} />
    </div>
  );
}
```

**發生了什麼事？**

1. 當 `PostPage` 渲染時，`PostTitle` 與 `PostContent` 同時掛載。
2. 兩者都執行了 `useGetPostQuery(1)`。
3. RTK Query 計算快取 Key：`getPost(1)`。
4. 第一個 Hook 觸發時，發現沒有該 Key 的資料，發起請求，並將該 Key 標記為 `pending`。
5. 第二個 Hook 觸發時，計算出相同的 Key `getPost(1)`。它發現該 Key 已經在 `pending` 狀態，於是它**不會發起新請求**，而是「訂閱」同一個請求的結果。
6. 當伺服器回應後，兩個元件會**同時**收到 `data` 並完成渲染。

這就是為什麼你不會在 Network Tab 看到兩次 `/api/posts/1`。RTK Query 幫你省下了不必要的頻寬與伺服器壓力。

---

## 序列化細節：為什麼參數的「長相」很重要？

既然快取 Key 取決於參數，那麼參數是如何被轉換成字串的就至關重要。RTK Query 使用了一套稱為 **「穩定序列化」（Stable Serialization）** 的機制。

### 1. 基本型別：直接字串化

對於字串、數字、布林值，序列化非常簡單直覺。

- `useGetPostQuery(1)` $\rightarrow$ `getPost(1)`
- `useGetPostQuery("1")` $\rightarrow$ `getPost("1")`

> **注意：** 雖然 `1` 和 `"1"` 在 JavaScript 裡有時可以通用，但在 RTK Query 的快取 Key 裡它們是不同的。如果你的 API 參數型別不固定，可能會導致快取無法命中。

### 2. 物件型別：鍵值排序（Key Sorting）

這是最容易出錯但也最貼心的地方。在標準的 `JSON.stringify()` 中，物件屬性的順序會影響輸出的字串：

```javascript
// 標準 JSON.stringify 的問題
JSON.stringify({ a: 1, b: 2 }) === '{"a":1,"b":2}'
JSON.stringify({ b: 2, a: 1 }) === '{"b":2,"a":1}'
// 兩者字串不同！
```

如果 RTK Query 直接用 `JSON.stringify`，當你在不同元件傳入順序不同的物件時，就會產生不同的快取 Key，導致重複請求。

為了避免這個問題，**RTK Query 在序列化之前會先對物件的 Key 進行排序****。**

```typescript
// 元件 A
const { data: dataA } = useGetPostsQuery({ category: 'tech', limit: 10 });

// 元件 B (參數順序相反)
const { data: dataB } = useGetPostsQuery({ limit: 10, category: 'tech' });
```

在上面的例子中，儘管物件寫法不同，RTK Query 生成的快取 Key 依然是完全一樣的（通常會序列化為類似 `getPosts({"category":"tech","limit":10})` 的內部格式）。

### 為什麼這很重要？

這代表你在撰寫元件時，不需要小心翼翼地確保每個地方傳入的物件參數「長得一模一樣」。只要**內容（值）是一樣的**，RTK Query 就能正確識別出這是同一個請求。

---

## 視覺化對照：Cache Key 的對應關係

為了讓你更有感，我們用一張對照表來看看不同的 Hook 呼叫會如何影響 Redux Store 中的快取條目：

| Hook 呼叫 A | Hook 呼叫 B | 快取條目數量 | 原因 |
| --- | --- | --- | --- |
| `useGetPostQuery(1)` | `useGetPostQuery(1)` | 1 | 參數完全相同，Key 相同 |
| `useGetPostQuery(1)` | `useGetPostQuery(2)` | 2 | 參數 ID 不同，生成不同 Key |
| `useGetPostQuery({id:1})` | `useGetPostQuery({id:1})` | 1 | 物件內容相同 |
| `useGetPostQuery({a:1, b:2})` | `useGetPostQuery({b:2, a:1})` | 1 | 穩定序列化會自動排序 Key |
| `useGetPostQuery(1)` | `useGetPostQuery("1")` | 2 | 型別不同（數字 vs 字串） |
| `useGetPostsQuery()` | `useGetPostsQuery(undefined)` | 1 | 無參數與傳入 `undefined` 通常視為相同 |

### 實作觀察：Redux DevTools

如果你安裝了 Redux DevTools，你可以切換到 `State` 標籤，找到你的 API Slice 位置（通常是在你設定的 `reducerPath` 下）。

你會看到一個名為 `queries` 的物件，裡面的 Key 看起來會像這樣：
`getPost(1)` 或 `getPosts({"limit":10})`。

當你發現明明資料一樣，畫面卻閃爍或是重複發出請求時，第一步就是打開 DevTools，檢查 `queries` 下面是不是出現了兩個「看起來很像但其實微小差異」的 Key。

---

## 進階議題：什麼時候會失效？

雖然穩定序列化很強大，但有些東西是**無法被序列化**的，這會導致快取 Key 出問題：

1. **函式（Functions）**：如果你把一個回呼函式（callback）當作參數傳入 Query，序列化會失敗或是每次都得到不同的結果。
  - *解決方法*：不要把函式當作 Query 參數。Query 應該只依賴純資料。
2. **複雜實例（Complex Instances）**：傳入像 `Moment` 物件或自定義類別的實例。
  - *解決方法*：在傳入之前先轉換成純字串（ISO String）或純數字（Timestamp）。

### 範例：錯誤的參數傳遞

```typescript
// ❌ 錯誤示範：每次渲染都會生成新的函式，可能導致序列化問題或不必要的重新計算
const { data } = useGetPostsQuery({ 
  category: 'tech', 
  onSuccess: () => console.log('Loaded!') // 函式無法穩定序列化
});

// ✅ 正確示範：只傳入純資料
const { data } = useGetPostsQuery({ category: 'tech' });
```

---

## 總結

快取 Key 是 RTK Query 智慧化的核心。透過「Endpoint 名稱 + 穩定序列化參數」，它確保了：

- **效率**：相同的請求絕不浪費第二次網路資源。
- **一致性**：不同元件存取的永遠是同一份「事實來源」。
- **彈性**：開發者不需要擔心物件屬性的定義順序。

理解了 Cache Key 的生成邏輯後，你就能解釋為什麼有些請求會合併，而有些會分開。這不僅是效能優化的基礎，更是後續我們要學習「標籤失效（Tag Invalidation）」時最重要的先備知識——因為標籤失效本質上就是在告訴 RTK Query：「請刪除這個特定 Key 的快取」。

### 關鍵重點回顧

- **公式**：`Endpoint + Serialized Args = Cache Key`。
- **去重複**：相同 Key 的請求在同一時間只會發出一個。
- **穩定性**：物件參數會被自動排序 Key 再進行序列化。
- **型別敏感**：數字 `1` 與字串 `"1"` 會生成不同的快取。

在下一個單元中，我們將把焦點從「Key 如何生成」轉移到「資料如何流動」，實際觀察**跨元件資料共享**的行為。我們將看到，當多個元件訂閱同一個快取 Key 時，RTK Query 是如何優雅地處理它們的掛載、卸載以及資料更新。
