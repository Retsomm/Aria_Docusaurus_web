---
mdx:
  format: md
---

> 課程：RTK Query 資料管理
> 第 8 堂：進階查詢控制

# 57Polling 定期輪詢

想像一下，你正在開發一個加密貨幣交易平台的儀表板，或者是公司的即時訂單監控系統。這類應用的共通點在於：**資料的時效性至關重要**。如果使用者必須手動點擊「重新整理」才能看到比特幣的最新價格，或者才能知道有沒有新訂單進來，這無疑是極差的使用者體驗。

在過去，你可能會在 `useEffect` 裡寫一個 `setInterval`，然後在裡面呼叫 `fetch` 或 dispatch 一個 Redux action。但這樣做會面臨一連串棘手的問題：當元件卸載（Unmount）時，你有沒有記得清除計時器？如果同時有三個元件都在輪詢同一個 API，你會不會發出三倍的請求？當使用者切換分頁到 Google 搜尋，你的後端是否還在承受無謂的輪詢壓力？

RTK Query 提供的 **Polling（定期輪詢）** 機制，正是為了以「宣告式（Declarative）」的方式優雅地解決這些挑戰。

## 為什麼需要輪詢？

輪詢是一種在不依賴伺服器主動推播（如 WebSockets 或 Server-Sent Events）的情況下，實現「準即時」資料更新的最簡單且穩定的方式。

在 RTK Query 中，輪詢不僅僅是計時器，它與我們之前學過的「快取生命週期」與「訂閱機制」是深度整合的。當你開啟輪詢時，RTK Query 會確保只要該元件還掛載在畫面上，它就會按照預設的頻率持續發送請求，並自動更新 Store 中的資料。一旦所有訂閱該資料的元件都消失了，輪詢也會自動停止，完全不需要手動清理。

## 實作第一個輪詢功能

在 RTK Query 中，啟動輪詢非常簡單。你不需要修改 `createApi` 裡的定義，而是直接在 React 元件呼叫 Hook 時，傳入 `pollingInterval` 參數。

### 基礎語法：市場價格追蹤器

假設我們有一個追蹤股票或加密貨幣價格的 API。我們希望每 3 秒更新一次價格。

```typescript
// types.ts
export interface MarketPrice {
  symbol: string;
  price: number;
  lastUpdated: string;
}

// apiSlice.ts (假設已建立)
// getPrice: builder.query<MarketPrice, string>({ query: (symbol) => `price/${symbol}` })

import React from 'react';
import { useGetPriceQuery } from './apiSlice';

const StockTicker: React.FC<{ symbol: string }> = ({ symbol }) => {
  // 在第二個參數 options 物件中設定 pollingInterval
  // 單位是毫秒 (ms)
  const { data, isLoading, isFetching, error } = useGetPriceQuery(symbol, {
    pollingInterval: 3000, // 每 3 秒抓取一次
  });

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>發生錯誤</div>;

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold">{symbol} 價格監控</h2>
      <p className="text-3xl">
        ${data?.price.toLocaleString()}
        {/* 使用 isFetching 來顯示「更新中」的視覺回饋 */}
        {isFetching && <span className="ml-2 text-sm text-blue-500">正在同步...</span>}
      </p>
      <small className="text-gray-500">最後更新時間：{data?.lastUpdated}</small>
    </div>
  );
};
```

### 關鍵細節解析

1. **單位與頻率**：`pollingInterval` 的單位是**毫秒 (ms)**。在上面的範例中，`3000` 代表 3 秒。
2. **isLoading vs isFetching**：這是我們在 Topic 2 強調過的。在輪詢過程中，`isLoading` 只會在「第一次、無快取」的情況下為 `true`。隨後的每一次自動抓取，`isLoading` 會保持 `false`，而 `isFetching` 會切換為 `true`。這讓你可以在 UI 上做出區分：初次載入顯示大骨架屏（Skeleton），背景更新時只顯示一個微小的旋轉圖示或進度條。
3. **自動清理**：這是 RTK Query 最強大的地方。如果使用者導航到了另一個頁面，導致 `StockTicker` 元件被卸載，RTK Query 會偵測到該 API 的訂閱計數（Subscription Count）歸零，並**立刻停止內部的計時器**。這避免了記憶體洩漏與無效的網路連鎖反應。

## 動態控制輪詢：啟動與停止

在實際開發中，我們通常不希望輪詢無休無止地運行。例如，使用者可能想要「暫停即時更新」來專心觀察目前的數據，或者我們希望在某些條件下（如 Modal 關閉時）停止輪詢。

RTK Query 遵循一個簡單的原則：

- **傳入正整數**（如 3000）：啟動輪詢。
- **傳入 0 或 undefined**：停止輪詢。

讓我們看一個帶有開關功能的進階範例。

### 實作範例：可切換的即時通知列表

在這個範例中，我們會實作一個通知中心，使用者可以自行決定是否開啟「自動重新整理」。

```typescript
import React, { useState } from 'react';
import { useGetNotificationsQuery } from './notificationApi';

const NotificationCenter: React.FC = () => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  
  // 動態決定輪詢間隔：如果開啟則每 10 秒一次，否則為 0 (不輪詢)
  const { data: notifications = [], isFetching } = useGetNotificationsQuery(undefined, {
    pollingInterval: isAutoRefresh ? 10000 : 0,
    // 當元件掛載時，即使有快取，也強制重新抓取一次最新的
    refetchOnMountOrArgChange: true, 
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">通知中心</h1>
        
        {/* 控制開關 */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">自動更新</label>
          <input 
            type="checkbox"
            checked={isAutoRefresh}
            onChange={(e) => setIsAutoRefresh(e.target.checked)}
            className="w-4 h-4"
          />
        </div>
      </div>

      {isFetching && <p className="text-xs text-blue-500 animate-pulse">檢查新通知中...</p>}

      <ul className="space-y-2">
        {notifications.map((note) => (
          <li key={note.id} className="p-3 bg-white border rounded shadow-sm">
            {note.message}
          </li>
        ))}
        {notifications.length === 0 && (
          <li className="text-center text-gray-400 py-10">目前沒有新通知</li>
        )}
      </ul>
    </div>
  );
};
```

### 這裡發生了什麼事？

當使用者勾選 Checkbox 時，`isAutoRefresh` 變為 `true`，Hook 的 options 被更新為 `{ pollingInterval: 10000 }`。RTK Query 的底層監聽到了這個參數的變化，並立即啟動一個 10 秒的計時器。當取消勾選時，參數變為 `0`，計時器被銷毀。

這種**資料驅動**的控制方式，比起手動操作 `window.setInterval` 要直覺且安全得多。

## 進階組合技：確保資料「新鮮」的兩大幫手

單靠輪詢有時是不夠的。想像一個情境：你的輪詢間隔是 60 秒（為了節省伺服器資源）。使用者在第 10 秒時縮小了瀏覽器去處理別的事，過了半小時才回來。此時，他看到的可能是 50 秒前舊的數據，而他必須再等 10 秒（下一次輪詢觸發）才能看到更新。

為了提供更極致的體驗，RTK Query 提供了兩個與輪詢相輔相成的參數：

### 1. refetchOnFocus

當這個參數為 `true` 時，每當瀏覽器視窗重新獲得焦點（例如使用者點擊了這個標籤頁，或從其他視窗切換回來），RTK Query 會立即發送一次請求，而不必等待輪詢計時器到期。

### 2. refetchOnReconnect

當網路從斷線狀態恢復（例如從飛航模式切換回 Wi-Fi），RTK Query 會自動觸發一次重新抓取。

### 完整的 API 配置範例

通常我們會將這些功能組合在一起使用：

```typescript
const { data } = useGetDashboardStatsQuery(undefined, {
  pollingInterval: 30000,      // 每 30 秒輪詢一次
  refetchOnFocus: true,        // 回到分頁時立刻更新
  refetchOnReconnect: true,    // 網路恢復時立刻更新
});
```

這三者的結合創造了一種「資料永遠是最新的」錯覺，同時又極大化地節省了不必要的網路頻寬。

> **注意：** 要讓 `refetchOnFocus` 與 `refetchOnReconnect` 正常運作，你需要在 `configureStore` 中正確設定 `setupListeners`。這在我們先前的 Topic 2.3 已經提過，請確保你的 `store.ts` 有這行程式碼：
> `setupListeners(store.dispatch)`

## 應用場景與架構上的考量

雖然輪詢非常方便，但在決定使用它之前，我們需要考慮以下幾個現實問題：

### 1. 伺服器負擔

輪詢本質上是「不斷地發問」。如果你的 App 有 10,000 個同時在線的使用者，且每個使用者都在每 2 秒輪詢一次 API，你的伺服器將面臨每秒 5,000 次的請求壓力。

- **建議**：對於靜態性較高的資料（如列表、個人資料），不要使用輪詢。對於即時性要求的資料，應根據業務需求設定合理的間隔（通常 10-30 秒是個不錯的平衡點）。

### 2. 輪詢 vs. WebSockets

- **輪詢 (Polling)**：實作簡單，不需後端額外架構（只需標準 REST API），適合「資料變動頻率中等」或「對即時性要求不需達到毫秒級」的場景。
- **WebSockets**：即時性最高（伺服器主動推播），適合聊天室、多人協作編輯器、高頻交易。但實作複雜，且需要維持長連接（Long Connection），對伺服器架構要求較高。

### 3. 與快取的交互 (keepUnusedDataFor)

記得我們在 Topic 3 提到的快取保留時間嗎？
輪詢會不斷更新資料並維持訂閱。這意味著只要輪詢在運行，快取就永遠不會變為「Unused」，因此也不會被垃圾回收機制清除。當你停止輪詢且元件卸載後，快取才會開始進入 `keepUnusedDataFor` 的倒數計時。

### 4. 輪詢的優先權

如果你在多個不同的元件中對同一個 Endpoint 呼叫了 `useQuery`，但設定了不同的 `pollingInterval`：

- 元件 A：`pollingInterval: 3000`
- 元件 B：`pollingInterval: 5000`
- **結果**：RTK Query 會採用**最快（最小）**的間隔。在這個例子中，資料會每 3 秒更新一次。這保證了所有元件都能看到最新的資料。

## 總結：輪詢的心智模型

在 RTK Query 中使用輪詢，你的心智模型應該從「我要每隔五秒執行一個動作」轉變為：

> 「我宣告這個元件對這筆資料有**持續性**的需求，並且我希望它的新鮮度保持在 X 毫秒內。」

透過簡單的 `pollingInterval` 參數，RTK Query 幫你處理了最麻煩的計時器啟動、停止、多元件競爭、以及視窗焦點監聽等邏輯，讓你專注於 UI 的呈現。

## 知識銜接

學會了如何讓資料「自動」更新後，這僅僅是解決了資料新鮮度的問題。但在真實的專案中，我們往往會遇到另一種情況：我們**不希望**請求太快發出去。

例如，在一個「搜尋功能」中，如果使用者還沒輸入任何關鍵字，我們不應該發送請求；或者在「結帳流程」中，只有當使用者選取了地址後，我們才去抓取對應的運費。這種「精準控制請求發送時機」的需求，就是我們下一部分要探討的主題：**條件式請求（skip 與 skipToken）**。

在進入下一節之前，請思考一下：如果你正在開發一個「待辦事項」應用，什麼樣的資料適合用輪詢？什麼樣的資料又不適合？答案可能比你想像的更依賴於「協作」的需求程度。我們下一節見！
