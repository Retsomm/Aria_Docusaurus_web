---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 4 堂：快取機制基礎

# 41快取生命週期

在上一章中，我們已經成功實作了第一個 API Slice，並在元件中透過自動生成的 Hook 抓取資料。你可能已經注意到一個神奇的現象：當你在不同的分頁之間切換，或是重複進入同一個頁面時，有時候資料是「秒出」的，甚至連 Loading 狀態都沒有出現。

這背後的功臣就是 RTK Query 的**快取（Cache）系統**。但這引發了一個關鍵問題：RTK Query 究竟是如何決定「這份資料該留著」還是「該從記憶體中刪除」的？它怎麼知道現在還有沒有元件在用這份資料？

如果你曾經手寫過 `useEffect` 來抓取資料，你可能習慣了「元件消失，資料就消失」（或者資料留在父組件直到父組件消失）的邏輯。但在 RTK Query 中，這套規則被重新定義了。

## 核心觀念：訂閱計數 (Subscription Count)

RTK Query 管理快取的靈魂機制叫做**訂閱計數 (Subscription Count)**。

你可以把 RTK Query 的 Store 想像成一個圖書館，而元件則是借閱者。圖書館員（RTK Query Middleware）會記錄每一本書（每一筆 API 回應資料）目前被多少人借閱中。

- **當有人想借書（元件掛載）：** 館員會查看這本書是否已經在書架上（快取中）。如果有，直接給他；如果沒有，館員會立刻去訂購（發送網路請求），然後交給借閱者。此時，該書的「借閱人數」加 1。
- **當有人還書（元件卸載）：** 館員會將該書的「借閱人數」減 1。
- **當借閱人數歸零時：** 館員**不會立刻把書丟掉**。他會先觀察一陣子，看看有沒有人很快又要來借。如果過了很長一段時間（預設為 60 秒）還是沒人要，這本書才會被銷毀以節省空間。

這種「基於需求量來決定存亡」的機制，就是 RTK Query 能夠在不同元件間共享資料，並在導覽切換時保持極高效率的核心原因。

---

## 生命週期流程解析

讓我們透過具體的 TypeScript 範例與元件操作，來追蹤這組「訂閱計數」的變化。

### 1. 元件掛載 (Mounting) 與初次請求

假設我們有一個 `PostList` 元件使用了 `useGetPostsQuery()`。

```tsx
// components/PostList.tsx
import { useGetPostsQuery } from '../services/posts';

export const PostList = () => {
  // 當此元件掛載時，RTK Query 會檢查訂閱狀態
  const { data, isLoading } = useGetPostsQuery();

  if (isLoading) return <div>載入中...</div>;

  return (
    <ul>
      {data?.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
};
```

**背後發生的事：**

1. `PostList` 掛載。
2. RTK Query 發現 `getPosts` 這個 Endpoint 被呼叫了。
3. **檢查快取：** 發現 Store 裡目前沒有這份資料。
4. **發送請求：** 觸發網路請求。
5. **更新計數：** 將 `getPosts` 的訂閱計數從 `0` 變更為 `1`。
6. **存入快取：** 請求成功後，將資料存入 Redux Store。

### 2. 多重訂閱 (Multiple Subscriptions)

如果此時頁面上還有另一個元件 `PostCount` 也呼叫了同一個 Hook：

```tsx
// components/PostCount.tsx
export const PostCount = () => {
  const { data } = useGetPostsQuery(); // 再次呼叫同一個 Hook
  return <div>目前共有 {data?.length || 0} 篇文章</div>;
};
```

**背後發生的事：**

1. `PostCount` 掛載。
2. **檢查快取：** 發現 `getPosts` 已經有快取資料了。
3. **複用資料：** **不會**發送第二次網路請求，直接回傳 Store 裡的舊資料。
4. **更新計數：** 將 `getPosts` 的訂閱計數從 `1` 增加到 `2`。

### 3. 元件卸載 (Unmounting)

當用戶離開頁面，或是透過條件渲染隱藏了這些元件：

**背後發生的事：**

1. `PostCount` 卸載 -> 訂閱計數由 `2` 變回 `1`。
2. `PostList` 卸載 -> 訂閱計數由 `1` 變回 `0`。

---

## 關鍵機制：訂閱數歸零後的「緩衝期」

這是最容易讓新手困惑，卻也是 RTK Query 最貼心的地方。

**當訂閱計數歸零時，快取不會立即消失。**

RTK Query 預設會啟動一個 **60 秒的計時器**。在這 60 秒內，如果沒有任何元件再次訂閱這筆資料，這筆資料才會被真正從記憶體（Redux Store）中清除。

### 為什麼要這樣設計？

想像一個常見的 UI 模式：**分頁導覽 (Tabs)**。

1. 你在「文章列表」分頁（訂閱數 1）。
2. 你切換到「設定」分頁（「文章列表」元件卸載，訂閱數變 0）。
3. 你在 5 秒後又切換回「文章列表」。

如果 RTK Query 在訂閱數歸 0 的瞬間就把資料刪掉，那麼當你第 3 步切換回來時，使用者又得看一次 Loading 動畫。

有了這 60 秒的緩衝期，當你切換回列表時：

1. `PostList` 重新掛載。
2. RTK Query 發現訂閱數從 0 變 1。
3. **發現快取還在（計時器尚未結束）！**
4. 立刻顯示資料，完全不需要等待網路請求。

> **注意：** 雖然會立刻顯示快取資料，但 RTK Query 可能會根據設定在背景悄悄發起請求（Revalidation）以確保資料是最新的。這部分我們會在「標籤失效機制」詳細討論。

---

## 對照學習：傳統 useEffect vs. RTK Query

為了讓你更有感，我們來比較一下「傳統方式」與「RTK Query」在管理資料生命週期上的差異。

### 傳統 useEffect + useState 模式

```tsx
// 傳統模式：資料儲存在元件內部
function LegacyPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/posts').then(res => res.json()).then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  // 當此元件卸載時，posts 狀態會隨之灰飛煙滅。
  // 下次重新掛載，一切從零開始。
}
```

- **生命週期：** 資料的壽命 = 元件的壽命。
- **缺點：** 無法跨元件共享、頻繁切換導致重複 Loading、浪費網路頻寬。

### RTK Query 模式

```tsx
// RTK Query：資料儲存在全域快取 (Redux Store)
function ModernPostList() {
  const { data, isLoading } = useGetPostsQuery();
  // ...
}
```

- **生命週期：** 資料的壽命 = 訂閱者存在的時間 + 60 秒緩衝期。
- **優點：** 跨元件共享、智慧型緩衝、記憶體自動管理。

---

## 在 Redux DevTools 中觀察

要理解生命週期，最直觀的方法是打開你的 **Redux DevTools**。

1. **進入頁面：** 你會看到 `queries` 下出現了對應的 Endpoint，狀態為 `fulfilled`。
2. **查看細節：** 你可以找到一個名為 `subscriptions` 的屬性，裡面列出了目前有哪些元件 ID 在訂閱這份資料。
3. **離開頁面：** 你會發現 `subscriptions` 變空了。
4. **觀察移除：** 如果你靜待 60 秒不進行任何操作，你會看到該筆資料從 Store 的快取區域消失。

### 程式碼與行為對照表

| 操作行為 | 訂閱計數 (Sub Count) | 網路行為 (Network) | Store 狀態 |
| --- | --- | --- | --- |
| 元件 A 掛載 | 0 -> 1 | 發送 `GET /posts` | 建立新快取條目 |
| 元件 B 掛載 | 1 -> 2 | 無 (去重複) | 維持快取，更新訂閱者清單 |
| 元件 A 卸載 | 2 -> 1 | 無 | 維持快取 |
| 元件 B 卸載 | 1 -> 0 | 無 | 進入 60s 倒數計時 |
| 30 秒後重新掛載 A | 0 -> 1 | 無 (或背景更新) | 終止計時，複用舊資料 |
| 60 秒後無人訂閱 | 0 | 無 | **垃圾回收 (Garbage Collection)** |

---

## 總結與銜接

理解「訂閱計數」是掌握 RTK Query 的第一步。它讓我們不再需要手動思考「什麼時候該清空資料」，而是交由系統根據真正的使用需求來自動管理。這種模式將資料的存續權交給了「需求」，而非僅僅是「元件的渲染狀態」。

然而，並非所有資料都適合「只留 60 秒」。有些高度靜態的資料（例如：國別代碼列表、使用者個人設定）我們可能希望它在整個應用程式運行期間都留著；反之，有些極具時效性的資料（例如：股市報價），我們可能希望它一旦沒人看就立刻消失。

在下一個單元中，我們將學習如何透過一個關鍵參數 `keepUnusedDataFor` 來精確控制這個「緩衝期」的長短，無論是全域設定還是針對單一 API 端點進行微調。

**下一站：**`**keepUnusedDataFor**`** 設定。**
