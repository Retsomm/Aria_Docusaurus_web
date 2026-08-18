---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 5 堂：標籤快取同步機制

# 47DevTools 快取驗證

我們已經學完了 `providesTags` 與 `invalidatesTags` 的設計模式，理解了標籤如何像「膠水」一樣將查詢與修改聯繫在一起。但在實際開發中，這些標籤在你的 TypeScript 程式碼裡只是一個個字串或物件，它們是看不見、摸不著的。當你的畫面沒有如預期更新時，如果只是對著程式碼發呆，往往很難找出問題所在。

現在，我們要打開「顯微鏡」——利用 **Redux DevTools** 與 **瀏覽器的 Network 面板**，親眼觀察這些機制是如何在底層運作的。這不僅是為了除錯，更是為了幫你建立一個紮實的「心智模型」：讓你清楚知道當你呼叫一個 Hook 時，Redux Store 裡面究竟發生了什麼翻天覆地的變化。

## Redux DevTools 深度探索：剖析 API State

當你安裝並打開 Redux DevTools 時，你會發現 RTK Query 並非把資料隨便亂塞，它在 Redux State 中擁有一個專屬的命名空間（通常就是你在 `reducerPath` 定義的名字，例如 `api`）。這個節點下的結構非常嚴謹，反映了 RTK Query 的核心設計哲學。

請打開你的專案，開啟 DevTools 並切換到 **State** 標籤，找到 `api`（或你的 API Slice 名稱）節點。你會看到三個最重要的子節點：`queries`、`provided` 與 `subscriptions`。

### queries 節點：快取資料的保險箱

在 `api.queries` 之下，你會看到一系列雜湊後的字串作為 Key（例如 `getPosts(undefined)` 或 `getPost({"id":5})`）。這就是我們之前提到的 **Cache Key**。

點開其中一個 Query 項次，你會看到：

- `**status**`: 目前請求的狀態（如 `fulfilled`）。
- `**data**`: 伺服器回傳的原始 JSON 資料。
- `**endpointName**`: 是哪個端點產生的資料。
- `**providedTags**`: **這是最重要的部分。** 這裡列出了該 Query 根據你寫的 `providesTags` 邏輯，最終為這份快取貼上了哪些標籤。

**觀察重點**：
如果你實作了「列表 + ID」的模式，你會在 `getPosts` 的 `providedTags` 中看到諸如 `[{type: 'Post', id: 'LIST'}, {type: 'Post', id: 1}, {type: 'Post', id: 2}]`。這證實了你的 `providesTags` callback 函式運作正常，正確地根據回傳資料生成了對應的標籤。

### provided 節點：標籤的反向索引

這是許多開發者會忽略，但卻是「失效機制」能夠精準運作的核心。`api.provided` 紀錄了一個 **反向索引（Reverse Index）**。

它會以標籤名稱為 Key，對應到「哪些 Query Key 引用了這個標籤」。
例如：

```json
{
  "Post": {
    "LIST": ["getPosts(undefined)"],
    "5": ["getPosts(undefined)", "getPost({\"id\":5})"]
  }
}
```

**為什麼這很重要？**
當你執行一個 Mutation 並宣告 `invalidatesTags: [{ type: 'Post', id: 5 }]` 時，RTK Query 不會笨笨地去掃描所有的快取。它會直接來到這個 `provided` 節點，查找 `Post -> 5` 下面掛了哪些 Query Key。在這個範例中，它發現 `getPosts` 和 `getPost({"id":5})` 都依賴這個標籤，於是它就會立刻將這兩個快取標記為「失效（Invalidated）」。

### subscriptions 節點：追蹤誰在用這份資料

還記得我們說過 RTK Query 會自動垃圾回收嗎？這就是透過 `api.subscriptions` 來管理的。

這裡紀錄了每個 Cache Key 目前被多少個元件「訂閱」。

- 當一個使用 `useGetPostsQuery()` 的元件掛載（Mount）時，你會看到該 Key 下面的訂閱數增加。
- 當元件卸載（Unmount）時，訂閱數減少。

**實驗一下**：
嘗試切換頁面（讓原本顯示列表的元件消失），你會發現對應的訂閱項次會被移除。一旦訂閱數歸零，RTK Query 就會啟動計時器（預設 60 秒），時間一到，這份快取就會從 `queries` 中徹底消失。

## 瀏覽器 Network 面板驗證：觀察網路行為

除了看內部狀態，我們還需要觀察與伺服器的互動。這能幫助你驗證 RTK Query 是否真的幫你省下了不必要的網路請求。

### 驗證「去重複 (Deduplication)」

這是一個非常經典的情境：假設你的頁面上有一個 `Sidebar` 組件要顯示最新文章標題，而 `MainContent` 組件也要顯示完整的文章列表，兩者都呼叫了 `useGetPostsQuery()`。

**操作步驟**：

1. 清空 Network 面板。
2. 同時渲染這兩個元件。
3. **觀察結果**：你會發現 Network 面板竟然**只發送了一個 **`**GET /posts**`** 請求**。

**原理解析**：
當 `Sidebar` 發起請求時，RTK Query 會建立一個「進行中（Pending）」的 Promise。接著 `MainContent` 也發起請求，RTK Query 發現 Cache Key 相同且已有請求在跑，它就不會發出第二次請求，而是讓 `MainContent` 直接「搭便車」，等待第一個請求的 Promise 完成後，兩者同時拿到資料。這就是 **Deduplication** 的威力，它避免了網頁啟動時常見的「請求風暴」。

### 驗證「自動重新抓取 (Refetch)」

這是驗證標籤失效是否成功的最終測試。

**操作步驟**：

1. 先進入文章列表頁（確保 `getPosts` 已完成並顯示資料）。
2. 點擊「新增文章」或「刪除文章」，觸發一個 Mutation。
3. 觀察 Network 面板的請求順序。

**預期結果**：

1. 首先會出現一個 `POST` 或 `DELETE` 請求。
2. **關鍵點**：當該請求回傳 `201 Created` 或 `200 OK` 成功狀態後，你會發現 Network 面板立刻、自動地跳出一個 `GET /posts` 請求。

**重點提醒**：
這個 `GET` 請求並不是你在元件中寫 `useEffect` 去觸發的，也不是你在 Mutation 的 `onSuccess` 裡面手動呼叫 `refetch` 的。這是 RTK Query 偵測到標籤失效後，發現畫面上仍有元件在訂閱這份資料，因而主動發起的「資料同步」。

## 實戰除錯建議：當「自動更新」失效時怎麼辦？

即使理解了理論，開發時難免會遇到「我明明刪除了資料，為什麼列表沒更新？」的情況。這時候請依照下列清單進行系統化檢查：

### 1. 檢查標籤是否真的「提供」成功了？

打開 DevTools 的 `api.queries`，找到你的 Query。

- 看看 `providedTags` 裡面有沒有你預期的標籤？
- 如果沒有，通常是你的 `providesTags` 邏輯寫錯了，或者 API 回傳的資料結構跟你想像的不一樣（例如你以為是 `result.id` 但其實是 `result._id`）。

### 2. 檢查 Mutation 的失效標籤是否「匹配」？

這是最常見的錯誤：拼字錯誤。

- 檢查 Query 提供的標籤是 `{ type: 'Posts', id: 'LIST' }`（複數），而 Mutation 失效的是 `{ type: 'Post', id: 'LIST' }`（單數）。標籤名稱必須**完全一致**。
- 檢查 `id` 的型別。`"5"`（字串）與 `5`（數字）在標籤比對中是不相等的。

### 3. 檢查畫面上是否還有「活躍的訂閱」？

RTK Query 只有在「資料正被使用中」時才會自動重新抓取。

- 如果你執行 Mutation 的時候，那個 Query 的元件已經卸載了，RTK Query 只會把快取標記為失效，而不會立刻發送網路請求。它會等到你下一次回到該頁面、元件重新掛載時，才發現快取已失效並發起請求。
- 透過 DevTools 的 `subscriptions` 節點可以確認該 Cache Key 是否還有訂閱者。

### 4. 觀察 Mutation 是否真的「成功」了？

`invalidatesTags` 只有在 Mutation 狀態變為 `fulfilled` 時才會觸發。如果後端回傳了 `400` 或 `500` 錯誤，標籤是不會失效的。

- 在 Network 面板確認 Mutation 請求的狀態碼。
- 在 DevTools 的 `api.mutations` 節點檢查該 Mutation 的 `status` 是否為 `rejected`。

## 掌控你的資料流

透過 Redux DevTools 與 Network 面板的交互驗證，你會發現原本「黑箱」作業的非同步資料管理變得完全透明。你不再需要猜測資料什麼時候會回來，或是為什麼畫面沒更新。你能清楚看到標籤如何建立連結、訂閱計數如何影響快取存續，以及失效機制如何驅動網路請求。

這種「可觀察性」是 RTK Query 相對於傳統 `useEffect + fetch` 模式最大的優勢之一。在傳統模式下，你的資料流向散落在各個組件的生命週期中，極難追蹤；而在這裡，整個 API 的狀態就是一個結構化的資料庫，供你隨時檢閱。

## 知識鞏固與後續路徑

本單元我們深入探討了 RTK Query 最核心的競爭力：快取機制。從標籤的宣告式設計（Provides/Invalidates）到快取生命週期的管理，再到最後的工具驗證，你現在已經掌握了讓 React 應用程式保持資料一致性的高級技巧。

掌握了這些理論與觀察方法後，接下來我們將進入 **Review (課程回顧)**。我會準備幾個核心問題，測試你是否真的理解了標籤系統的運作邏輯。這是一個絕佳的機會來查漏補缺，確保你的基礎堅不可摧。

完成回顧後，我們將在下一堂大課 **Topic 4：Mutation 請求處理** 中，正式轉入「行動派」。我們將實作完整的 CRUD 語法，學習如何處理 Loading 狀態、錯誤捕捉，以及讓使用者驚豔的「樂觀更新（Optimistic Updates）」。準備好讓你的 Todo App 變得無比流暢了嗎？我們回顧見！
