---
title: 如果副作用不放在useEffect裡面，會發生什麼問題呢?
description: A short description of this page
keywords: [react, useEffect]
---

## 1. 副作用在每次渲染時都會執行

在 React **函式元件**中，每次執行函式時，內部的程式碼都會重新執行。如果你在 **函式主體** 內直接執行副作用，React **每次重新渲染時都會執行該副作用**，導致不必要的 API 請求、計時器增加、事件監聽重複綁定等問題。

**錯誤示範：副作用寫在函式主體內**

```jsx
function FetchDataComponent() {
  const [data, setData] = useState(null);

  //  每次重新渲染時都會執行 API 請求
  async function fetchData() {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const result = await response.json();
    setData(result);
  }

  fetchData(); //  直接在函式內執行

  return (
    <div>
      <h2>API 資料</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "載入中..."}
    </div>
  );
}
```

**錯誤影響**

- **每次重新渲染都會執行 `fetchData()`**

- 如果 `setData` 會導致 `state` 變更，那麼 **React 會重新渲染**，接著 **再次執行 API 請求**，變成無限迴圈 。

---

**正確作法：使用 `useEffect`**

```jsx
function FetchDataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
      const result = await response.json();
      setData(result);
    }

    fetchData();
  }, []); //  只在元件掛載時執行一次

  return (
    <div>
      <h2>API 資料</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "載入中..."}
    </div>
  );
}
```

🔹 `useEffect(() => {...}, [])` 確保 **只會在元件掛載時執行一次 API 請求**，避免每次重新渲染時都發送請求。

---

## 2. 事件監聽 & 計時器會重複綁定

假設我們要監聽視窗大小變化，並且不使用 `useEffect`，而是在函式元件內直接呼叫 `addEventListener`。

**錯誤示範**

```jsx
function WindowResizeComponent() {
  const [width, setWidth] = useState(window.innerWidth);

  window.addEventListener("resize", () => {
    setWidth(window.innerWidth);
  }); //  這行每次渲染都會執行，導致多次綁定

  return <h2>視窗寬度：{width}px</h2>;
}
```

**錯誤影響**

- **每次渲染都會新增一個 `resize` 監聽器**

- 當視窗調整大小時，**所有綁定的監聽器都會執行**，導致 `setWidth` 被多次執行，**造成效能問題**

- **沒有清除事件監聽**，可能導致**記憶體洩漏**（memory leak）

---

**正確作法：使用 `useEffect`**

```jsx
function WindowResizeComponent() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // 確保在元件卸載時清除事件監聽
    };
  }, []);

  return <h2>視窗寬度：{width}px</h2>;
}
```

🔹 這樣就能**確保監聽器只綁定一次**，並且**元件卸載時會清除監聽器**，避免記憶體洩漏。

---

## 3. 計時器 (`setInterval` / `setTimeout`) 無法正確清除**

如果你直接在函式元件內呼叫 `setInterval`，那麼 **每次渲染時都會啟動一個新的計時器**，而不是重新使用現有的。

**錯誤示範**

```jsx
function ClockComponent() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  setInterval(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000); // 每次渲染都會新增一個 setInterval

  return <h2>現在時間：{time}</h2>;
}
```

**錯誤影響**

- **每次重新渲染都會啟動一個新的 `setInterval`**

- 時間更新的速度會越來越快（每次渲染都會新增一個計時器）

- **沒有清除計時器**，元件卸載後仍然會繼續運行，導致 **記憶體洩漏**

---

**正確作法：使用 `useEffect`**
```jsx
function ClockComponent() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval); //  確保計時器在元件卸載時被清除
  }, []);

  return <h2>現在時間：{time}</h2>;
}
```

🔹 這樣可以確保 **計時器只會在元件掛載時啟動，並且在元件卸載時清除**，不會有多個計時器同時運作。

---

## 4. WebSocket 連線可能會有多重實例

如果你在函式元件內直接開啟 WebSocket 連線，React 重新渲染時可能會 **重複建立 WebSocket 連線**，導致多個 WebSocket 連線同時存在，影響效能。

**錯誤示範**

```jsx
function WebSocketComponent() {
  const [message, setMessage] = useState("");

  const socket = new WebSocket("wss://example.com/socket"); //  每次渲染都會建立新連線

  socket.onmessage = (event) => {
    setMessage(event.data);
  };

  return <h2>WebSocket 訊息：{message}</h2>;
}
```

**錯誤影響**

- **每次重新渲染都會建立一個新的 WebSocket 連線**

- 可能會導致伺服器的 WebSocket 連線超出限制，影響應用程式效能

- **沒有關閉舊的 WebSocket 連線**

---

**正確作法：使用 `useEffect`**

```jsx
function WebSocketComponent() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = new WebSocket("wss://example.com/socket");

    socket.onmessage = (event) => {
      setMessage(event.data);
    };

    return () => socket.close(); //  確保在元件卸載時關閉 WebSocket 連線
  }, []);

  return <h2>WebSocket 訊息：{message}</h2>;
}
```
#### 這樣確保 WebSocket **只在元件掛載時建立**，並且 **在元件卸載時關閉連線**，避免資源浪費。
