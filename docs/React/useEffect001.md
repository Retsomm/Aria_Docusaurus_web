---
title: useEffect 
description: A short description of this page
keywords: [react, useEffect]
---

主要用來處理副作用（side effects），這些副作用包括但不限於 **非同步請求（如 API 呼叫）、訂閱（subscription）、DOM 操作** 等。但 `useEffect` 本身**不會強制要求非同步功能**，你可以在其中執行同步或非同步的操作。

###  **常見適用於 `useEffect` 的情境**

1. **非同步請求（API 呼叫）**

2. **監聽視窗大小變化、滾動事件**

3. **設定或清除計時器（`setTimeout`、`setInterval`）**

4. **訂閱 WebSocket 或事件監聽**

5. **修改 `document.title` 或 `localStorage`**

###  **錯誤用法：直接將 `useEffect` 設為 `async`**

雖然 `useEffect` 經常用來執行非同步操作，但它本身**不能**直接標記為 `async`，因為 `useEffect` 期望回傳 `undefined` 或 `cleanup function`，但 `async function` 會回傳 `Promise`，導致 React 產生錯誤。

```jsx
useEffect(async () => {  // ❌ 錯誤：useEffect 不能是 async
  const data = await fetchData();
  setState(data);
}, []);
```

###  **正確使用方式**

如果 `useEffect` 內部需要執行非同步函式，應該在 `useEffect` 內部**定義一個 `async` 函式，然後執行它**：

```jsx
import { useEffect, useState } from "react";

function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://api.example.com/data");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchData(); // ✅ 在 useEffect 內部執行 async 函式
  }, []);

  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
}
```

###  **補充：如何正確處理 `useEffect` 清除（Cleanup Function）**

如果 `useEffect` 內有訂閱或計時器，記得在 return 內回傳**清理函式**來避免記憶體洩漏。

####  **監聽事件並清除**

```jsx
useEffect(() => {
  const handleResize = () => console.log("Window resized");

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize); // ✅ 清除監聽事件
  };
}, []);

```

####  **WebSocket 訂閱**

```jsx
useEffect(() => {
  const socket = new WebSocket("wss://example.com");

  socket.onmessage = (event) => console.log("Received:", event.data);

  return () => {
    socket.close(); // ✅ 清除 WebSocket
  };
}, []);
```

### **結論**

 `useEffect` **不一定要執行非同步功能**，但很適合處理副作用（像是 API 請求、事件監聽等）。\
  不能直接讓 `useEffect` 變成 `async`，而是要在內部定義 `async function` 來執行非同步操作。\
  **如果有訂閱或計時器，一定要在 `return` 內清除它，以避免記憶體洩漏。**



## 副作用的實際案例



在 React 中，**副作用（Side Effects）** 是指元件渲染過程中會影響外部環境的行為。例如：

- 發送 API 請求

- 操作瀏覽器 DOM

- 設定或清除計時器

- 監聽與移除事件

- 訂閱 WebSocket

這些行為都不是純粹的 **UI 渲染**，而是額外影響程式的外部狀態，因此稱為 **副作用**。React 透過 `useEffect` 來管理這些副作用，確保它們在適當的時機執行和清理。

---

### 1. API 請求：載入資料

最常見的副作用之一是從 API 取得資料，然後更新 `state` 來顯示資料。

**需求**

當元件掛載時，從 API 取得資料，並在畫面上顯示。

**實作**

```jsx
import { useEffect, useState } from "react";

function FetchDataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("API 錯誤:", error);
      }
    }

    fetchData();
  }, []); // 只有元件掛載時執行

  return (
    <div>
      <h2>API 資料</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "載入中..."}
    </div>
  );
}

export default FetchDataComponent;

```

**剖析**

- `useEffect(() => { fetchData(); }, [])`：

   - `fetchData` 是一個 `async` 函式，發送 API 請求並更新 `state`。

   - `[]` 代表**只有元件掛載時執行一次**，不會重複執行。

---

### 2. 事件監聽（Event Listener）

有時候我們需要監聽視窗大小變化，並根據變化來更新 `state`。

**需求**

當使用者調整視窗大小時，顯示目前的寬度。

**實作**

```jsx
import { useEffect, useState } from "react";

function WindowResizeComponent() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // 🧹 清除監聽
    };
  }, []);

  return (
    <div>
      <h2>視窗寬度：{width}px</h2>
    </div>
  );
}

export default WindowResizeComponent;

```

**剖析**

- `window.addEventListener("resize", handleResize);`

   - 監聽視窗大小變化，當 `resize` 事件發生時，更新 `width`。

- `return () => { window.removeEventListener("resize", handleResize); }`

   - **重要！** React 會重新執行 `useEffect`（例如 `setState` 觸發重新渲染），所以在元件卸載時，React 會清除這個監聽，避免記憶體洩漏。

---

### 3. 計時器（setInterval / setTimeout）

我們可能需要建立計時器，例如顯示當前時間。

**需求**

顯示目前時間，每秒更新一次。

**實作**

```jsx
import { useEffect, useState } from "react";

function ClockComponent() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval); // 🧹 清除計時器
  }, []);

  return <h2>現在時間：{time}</h2>;
}

export default ClockComponent;

```
**剖析**

- `setInterval` 每秒更新 `time`。

- `return () => clearInterval(interval);`

   - **確保元件卸載時，清除計時器，避免記憶體洩漏。**

---

### 4. WebSocket 連線

即時應用（如聊天室）通常會透過 WebSocket 來即時更新資料。

**需求**

當元件掛載時，建立 WebSocket 連線，接收訊息，並在卸載時關閉連線。

**實作**

```jsx
import { useEffect, useState } from "react";

function WebSocketComponent() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = new WebSocket("wss://example.com/socket");

    socket.onmessage = (event) => {
      setMessage(event.data);
    };

    return () => {
      socket.close(); // 🧹 清除 WebSocket 連線
    };
  }, []);

  return <h2>WebSocket 訊息：{message}</h2>;
}

export default WebSocketComponent;
```

**剖析**

- `const socket = new WebSocket("wss://`[`example.com/socket`](example.com/socket)`");`

   - 建立 WebSocket 連線。

- `socket.onmessage = (event) => { setMessage(`[`event.data`](event.data)`); }`

   - 當接收到新訊息時，更新 `message`。

- `return () => { socket.close(); }`

   - **確保元件卸載時，關閉 WebSocket 連線，避免資源浪費。**

---

### 5. 操作 `document.title`

有時我們想要根據頁面狀態來更新標題，例如顯示「未讀訊息數」。

**需求**

當 `count` 更新時，變更網頁標題。

**實作**

```jsx
import { useEffect, useState } from "react";

function TitleComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `未讀訊息數：${count}`;
  }, [count]); // 只有當 count 變更時執行

  return (
    <div>
      <h2>未讀訊息數：{count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default TitleComponent;
```

**剖析**

- `document.title = "未讀訊息數：" + count;`

   - 修改網頁標題來反映未讀訊息數。

- `useEffect` **依賴 `count`，只有 `count` 更新時才會執行**。

---

**總結**

| 副作用類型 | 使用情境 | 清理方式 | 
|---|---|---|
| **API 請求** | 取得遠端資料 | 無需清理，但可取消請求 | 
| **事件監聽** | `resize`、`scroll` | `removeEventListener` | 
| **計時器** | `setTimeout`、`setInterval` | `clearTimeout`、`clearInterval` | 
| **WebSocket** | 即時通訊 | `socket.close()` | 
| **修改 DOM** | `document.title`、`localStorage` | 無需清理 | 
|  |  |  | 

**重點**

- `useEffect(() => {...}, [])` → 只執行一次

- `useEffect(() => {...}, [state])` → 當 `state` 變更時執行

- **務必清除副作用**（監聽事件、計時器、WebSocket）