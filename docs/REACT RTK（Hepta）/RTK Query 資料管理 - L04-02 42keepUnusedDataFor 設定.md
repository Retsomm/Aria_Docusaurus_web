---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 4 堂：快取機制基礎

# 42keepUnusedDataFor 設定

在上一單元中，我們揭開了 RTK Query 快取生命週期的神秘面紗。你已經知道，當最後一個訂閱該資料的元件卸載（Unmount）時，RTK Query 並不會像冷酷的清潔工一樣立刻把快取丟進垃圾桶，而是會給它一個「60 秒的寬限期」。這 60 秒的預設行為非常貼心，它能處理使用者不小心點錯頁面又立刻點回來的場景。

但問題來了：**「60 秒」真的放諸四海而皆準嗎？**

想像你在開發一個「虛擬貨幣交易所」的即時行情頁面，或者是「奧運比分直播」。在這種極度要求即時性的場景，60 秒前的舊資料可能已經毫無價值，甚至會誤導使用者。相反地，如果你在開發一個「國家地區清單」或「系統設定參數」的下拉選單，這些資料可能一整個月都不會變動，60 秒後就刪掉它再重新去伺服器抓一次，簡直是在浪費網路資源。

這一單元，我們將學習如何透過 `keepUnusedDataFor` 這個核心參數，精確地控制每一份資料的「存活時間」。

## 掌握 keepUnusedDataFor 的語意

`keepUnusedDataFor` 的字面意思是「為不被使用的資料保留多久」。在 RTK Query 的世界裡，這個參數的單位是 **秒（Seconds）**。

它的核心邏輯如下：

1. **觸發計時**：當某個快取條目的訂閱計數（Subscription Count）從 **1 變為 0** 時，RTK Query 會啟動一個內部計時器。
2. **計時期間**：如果在這段時間內，有任何元件重新訂閱了這筆資料，計時器會被立刻 **取消**，資料重新回到「使用中」狀態。
3. **計時結束**：如果計時器順利跑完設定的秒數，且期間沒有新的訂閱者，這筆資料就會被從 Redux Store 中永久移除（Garbage Collection）。

了解了這個「延遲清除」的機制後，我們來看看如何在程式碼中設定它。

---

## 全域設定：定義 API Slice 的預設行為

如果你的專案大部分的資料性質都差不多（例如都是標準的內容管理系統），你可以在 `createApi` 的最頂層設定一個全域的 `keepUnusedDataFor`。

這會覆寫 RTK Query 預設的 60 秒，成為該 Api Slice 下所有 Endpoint 的新基準。

### 程式碼範例：全域設定

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 假設這是一個企業內部管理系統，資料更新頻率不高
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/admin' }),
  
  /**
   * 全域設定：將預設的快取保留時間從 60 秒改為 300 秒（5 分鐘）
   * 這樣一來，除非特別指定，否則所有的查詢結果在元件卸載後都會保留 5 分鐘
   */
  keepUnusedDataFor: 300, 

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
    getRoles: builder.query<Role[], void>({
      query: () => '/roles',
    }),
    // 這裡的 getUsers 和 getRoles 都會自動繼承 300 秒的設定
  }),
});
```

**為什麼要設定全域值？**
設定全域值的主要目的是**「統一產品的快取策略」**。如果你的應用程式主要處理的是靜態文件、文章內容，將其拉長到 120 秒或 300 秒，可以顯著提升使用者在不同頁面間切換時的流暢度，因為他們幾乎感覺不到 Loading 的存在。

---

## Endpoint 層級設定：精確的細粒度控制

在現實的複雜專案中，一個 API Slice 往往會包含多種不同性質的端點。這時，「一刀切」的全域設定就不夠用了。RTK Query 允許你在每一個 `builder.query` 中單獨定義 `keepUnusedDataFor`。

**規則很簡單：Endpoint 層級的設定會「覆寫（Override）」全域設定。**

### 程式碼範例：針對不同性質的 Endpoint 進行覆寫

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const financialApi = createApi({
  reducerPath: 'financialApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  
  // 全域預設 60 秒
  keepUnusedDataFor: 60,

  endpoints: (builder) => ({
    // 場景 1：極度即時的資料（例如：即時股價）
    getStockPrice: builder.query<PriceData, string>({
      query: (symbol) => `/stocks/${symbol}/price`,
      /**
       * 覆寫：設定為 0。
       * 這意味著只要元件一卸載，快取立刻失效。
       * 下次使用者再進入頁面，絕對會重新發送請求，確保資料最新。
       */
      keepUnusedDataFor: 0,
    }),

    // 場景 2：幾乎不變的資料（例如：國家代碼、幣別名稱）
    getCurrencies: builder.query<Currency[], void>({
      query: () => '/constants/currencies',
      /**
       * 覆寫：設定為 3600 秒（1 小時）。
       * 這種資料在單次 Session 中幾乎不需要重複抓取，
       * 讓它在快取中存活久一點，可以節省大量網路資源。
       */
      keepUnusedDataFor: 3600,
    }),

    // 場景 3：普通資料（例如：使用者個人資料）
    getUserProfile: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      // 不設定，則自動使用全域的 60 秒
    }),
  }),
});
```

---

## 決策建議：我該設定多少秒？

這是開發者最常問的問題。雖然沒有標準答案，但我們可以根據資料的「過期敏感度」與「獲取成本」來制定策略：

### 1. 設定為 0 秒（或極低，如 1-5 秒）

- **適合場景**：涉及金錢交易的即時匯率、限量商品的剩餘庫存、高度互動的即時聊天室列表。
- **心理模型**：你希望使用者「每次進來都看到最新的」。
- **副作用**：如果使用者在頁面間快速跳轉，會頻繁看到 Loading Spinner，且伺服器負載會增加。

### 2. 設定為預設值（60 秒）

- **適合場景**：社群媒體的貼文清單、電子商務的商品詳情頁、部落格文章。
- **心理模型**：平衡使用者體驗與資料新鮮度。
- **優點**：這是絕大多數情況下的「黃金比例」，能應付大多數的意外操作（如按錯返回鍵）。

### 3. 設定為較長時間（300 - 3600 秒）

- **適合場景**：行政區劃清單、產品分類目錄、使用者偏好設定、幫助中心文檔。
- **心理模型**：這東西今天之內大概都不會變。
- **優點**：極致的性能體驗。使用者再次點擊時，資料是「秒出」的。

### 4. 決策矩陣

| 資料類型 | 更新頻率 | keepUnusedDataFor 建議 | 原因 |
| --- | --- | --- | --- |
| **關鍵商業狀態** | 秒級更新 | `0` 或 `5` | 容錯率低，新鮮度高於性能。 |
| **標準內容資料** | 分鐘級更新 | `60` ~ `120` | 使用者體驗最佳，避免閃爍。 |
| **靜態字典檔** | 小時/天級更新 | `600` ~ `3600` | 獲取成本高但變化極慢，適合長留。 |
| **個人敏感資料** | 隨時可能變 | `30` | 兼顧安全與便利，避免舊資料殘留。 |

---

## 實戰中的陷阱：keepUnusedDataFor vs refetchOnMountOrArgChange

這是一個非常容易搞混的概念。

- `**keepUnusedDataFor**`**：決定的是「**垃圾桶什麼時候來收走這封信」。如果信（快取）還在垃圾桶裡沒被收走，你去翻垃圾桶（重新訂閱），信還在那裡，可以直接讀。
- `**refetchOnMountOrArgChange**`**：決定的是「**即使信還在，我要不要重新寫一封新的」。

如果你設定了 `keepUnusedDataFor: 3600`，資料會留一小時。但如果你在元件呼叫 Hook 時加上了 `refetchOnMountOrArgChange: true`，那麼即使快取還在，RTK Query 依然會去後端抓一次新的來更新快取。

**記住：**`**keepUnusedDataFor**`** 控制的是「快取的生命」，而 **`**refetch**`** 相關設定控制的是「資料的同步」。**

---

## 透過 TypeScript 強化型別安全

在使用 RTK Query 時，TypeScript 會自動為你提供完整的型別推導。當你在 `builder.query` 中輸入 `keep` 時，編輯器會自動補完 `keepUnusedDataFor`。

值得注意的是，如果你在全域設定了該參數，它會被當作預設值。TypeScript 並不會強制你每個 Endpoint 都寫，但如果你寫錯了單位（例如寫成字串 `"60s"`），TypeScript 會立刻報錯提醒你這必須是一個 `number`。

```typescript
// TypeScript 的型別定義 (簡化版)
interface QueryDefinition {
  // ... 其他設定
  keepUnusedDataFor?: number; // 單位是秒
}
```

這保證了你在配置大型 API Slice 時，不會因為手誤而導致快取行為異常。

---

## 總結與預告

`keepUnusedDataFor` 是 RTK Query 提供的一個槓桿，讓你可以在「伺服器負載」與「使用者體驗」之間找到完美的平衡點。

- **全域設定**：定義整體的快取基調。
- **Endpoint 覆寫**：針對特定業務場景進行精準調優。
- **0 秒設定**：處理極度即時的需求。
- **長效設定**：處理靜態資源的需求。

到目前為止，我們討論的都是「資料保留多久」的問題。但在 RTK Query 的內部，它是如何知道「這份資料」就是「那份資料」的呢？如果我有兩個元件分別呼叫 `useGetPostQuery(1)` 和 `useGetPostQuery(1)`，為什麼它們能共享同一份快取？

在下一個單元中，我們將深入剖析 **「快取 Key (Cache Key)」的生成邏輯**。你會學到 RTK Query 是如何對參數進行序列化，以及它如何判斷兩個請求是否屬於同一個快取條目。這將幫助你理解「去重複請求（Deduplication）」的真正原理。

## 快取保留設定重點回顧

### 設定方式總結

- **全域**：`createApi({ ..., keepUnusedDataFor: 300 })`
- **個別**：`builder.query({ ..., keepUnusedDataFor: 10 })`

### 關鍵數字

- **預設值**：60 秒。
- **單位**：秒 (Number)。
- **最小值**：0 (立刻失效)。

### 運作原理

- 計時器只在「訂閱數從 1 變 0」時開始。
- 重新訂閱會重置計時器。
- 計時器結束後，資料從 Redux Store 中被移除。
