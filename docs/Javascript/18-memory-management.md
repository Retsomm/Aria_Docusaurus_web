---
title: JS的回收機制
description: 深入了解 JavaScript 記憶體管理與垃圾回收機制，包含記憶體分配、回收策略、記憶體洩漏預防等重要概念
keywords:
  [
    JavaScript,
    記憶體管理,
    垃圾回收,
    記憶體洩漏,
    記憶體分配,
    回收機制,
    效能最佳化,
    記憶體回收,
    V8引擎,
  ]
---

### **1\. JavaScript 的記憶體管理基礎**

JavaScript 是高階語言，開發者不需要手動分配或釋放記憶體，這些工作由 JavaScript 引擎（例如 V8 引擎，常用於 Chrome 和 Node.js）自動完成。記憶體主要分為以下兩類：

- **堆積記憶體（Heap Memory）**：用於儲存物件、陣列、函數等動態分配的資料。

- **堆疊記憶體（Stack Memory）**：用於儲存基本資料型別（例如數字、布林值）以及函數呼叫的上下文。

垃圾回收機制的目標是識別不再使用的物件（即「垃圾」），並釋放它們佔用的記憶體。

---

### **2\. JavaScript 的垃圾回收機制**

JavaScript 主要使用 **標記-清除（Mark-and-Sweep）** 演算法來進行垃圾回收。以下是其工作原理的詳細步驟：

#### **2\.1 標記-清除（Mark-and-Sweep）**

- **標記階段（Mark Phase）**：從「根物件」（例如全域物件 window 或 global）開始，遍歷所有可達的物件，並標記為「活躍」（reachable）。

- **清除階段（Sweep Phase）**：遍歷堆積記憶體，將未被標記的物件視為「不可達」（unreachable），並將其回收，釋放記憶體。

#### **2\.2 什麼是「根物件」？**

根物件是程式執行時的起點，例如：

- 全域物件（在瀏覽器中是 window，在 Node.js 中是 global）。

- 當前執行上下文中的變數（例如函數中的區域變數）。

- DOM 節點（如果被 JavaScript 引用）。

只要某個物件可以從根物件透過參考鏈（reference chain）訪問到，它就被視為「活躍」，不會被回收。

#### **2\.3 回收的時機**

垃圾回收的執行時機由 JavaScript 引擎決定，通常在以下情況觸發：

- 記憶體使用量達到某個閾值。

- 程式進入閒置狀態（例如沒有執行任何 JavaScript 程式碼時）。

- 引擎認為需要回收時（這取決於具體的引擎實現，例如 V8 引擎）。

---

### **3\. 常見的記憶體洩漏情境（與 React 相關）**

在 React 應用中，記憶體洩漏通常與以下幾個問題有關：

1. **未清理的計時器（setInterval/setTimeout）**。

2. **未移除的事件監聽器（Event Listeners）**。

3. **未正確管理的狀態或參考**。

以下我會針對這些情境提供詳細的程式碼範例，並展示如何避免記憶體洩漏。

---

### **4\. 範例與解決方案**

#### **4\.1 未清理的計時器**

計時器（如 setInterval 或 setTimeout）如果未在元件卸載時清理，會持續佔用記憶體。

**問題程式碼**：

```javascript
import React, { useEffect } from "react";

function TimerComponent() {
  useEffect(() => {
    // 設定一個每秒執行的計時器
    const interval = setInterval(() => {
      console.log("計時器執行中...");
    }, 1000);
  }, []); // 空依賴陣列，useEffect 只執行一次

  return <div>計時器元件</div>;
}

export default TimerComponent;
```

**問題**：當 TimerComponent 從 DOM 中移除（例如切換頁面），setInterval 仍然在背景執行，導致記憶體洩漏。

**解決方案**：在 useEffect 中返回一個清理函數，清除計時器。

```javascript
import React, { useEffect } from "react";

function TimerComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("計時器執行中...");
    }, 1000);

    // 返回清理函數，在元件卸載時執行
    return () => {
      clearInterval(interval);
      console.log("計時器已清除");
    };
  }, []); // 空依賴陣列

  return <div>計時器元件</div>;
}

export default TimerComponent;
```

**說明**：

- useEffect 的返回函數會在元件卸載（unmount）時執行，用來清理計時器。

- clearInterval(interval) 確保計時器停止，不再佔用記憶體。

---

#### **4\.2 未移除的事件監聽器**

如果在元件中綁定了事件監聽器（例如 window.addEventListener），但在元件卸載時未移除，會導致記憶體洩漏。

**問題程式碼**：

```javascript
import React, { useEffect } from "react";

function ScrollComponent() {
  useEffect(() => {
    // 監聽視窗的滾動事件
    window.addEventListener("scroll", () => {
      console.log("正在滾動...");
    });
  }, []);

  return <div>滾動監聽元件</div>;
}

export default ScrollComponent;
```

**問題**：當 ScrollComponent 卸載後，scroll 事件的監聽器仍然存在，導致記憶體無法被回收。

**解決方案**：在 useEffect 中移除事件監聽器。

```javascript
import React, { useEffect } from "react";

function ScrollComponent() {
  useEffect(() => {
    const handleScroll = () => {
      console.log("正在滾動...");
    };

    window.addEventListener("scroll", handleScroll);

    // 返回清理函數，移除事件監聽器
    return () => {
      window.removeEventListener("scroll", handleScroll);
      console.log("事件監聽器已移除");
    };
  }, []);

  return <div>滾動監聽元件</div>;
}

export default ScrollComponent;
```

**說明**：

- 將事件處理函數定義為 handleScroll，方便在清理時引用。

- 使用 window.removeEventListener 移除監聽器，確保元件卸載後不再保留參考。

---

#### **4\.3 未正確管理的狀態或參考**

在 React 中，如果使用 useState 或 useRef 儲存大量資料，且未正確管理，可能導致記憶體使用量過高。

**問題程式碼**：

```javascript
import React, { useState } from "react";

function DataComponent() {
  const [data, setData] = useState([]);

  const addData = () => {
    // 模擬不斷新增大量資料
    setData((prev) => [...prev, new Array(10000).fill("資料")]);
  };

  return (
    <div>
      <button onClick={addData}>新增資料</button>
      <p>資料數量: {data.length}</p>
    </div>
  );
}

export default DataComponent;
```

**問題**：每次點擊按鈕，data 陣列會不斷增長，佔用大量記憶體，且這些資料可能永遠不會被回收。

**解決方案**：限制資料量，或在不需要時清空狀態。

```javascript
import React, { useState } from "react";

function DataComponent() {
  const [data, setData] = useState([]);

  const addData = () => {
    // 限制最多儲存 5 筆資料
    if (data.length >= 5) {
      alert("資料已達上限！");
      return;
    }
    setData((prev) => [...prev, new Array(1000).fill("資料")]);
  };

  const clearData = () => {
    setData([]); // 清空資料
    console.log("資料已清空");
  };

  return (
    <div>
      <button onClick={addData}>新增資料</button>
      <button onClick={clearData}>清空資料</button>
      <p>資料數量: {data.length}</p>
    </div>
  );
}

export default DataComponent;
```

**說明**：

- 限制 data 陣列的長度，避免無限增長。

- 提供 clearData 函數，讓使用者可以主動清空狀態，釋放記憶體。

---

### **5\. 如何協助垃圾回收器**

以下是一些最佳實踐，幫助 JavaScript 引擎更有效地進行垃圾回收：

1. **避免全域變數**：全域變數不會被回收，除非顯式設為 null 或 undefined。

   ```javascript
   let globalData = { largeObject: new Array(1000000) };
   // 使用完後顯式清除
   globalData = null;
   ```

2. **及時解除參考**：如果物件不再需要，設為 null 以斷開參考。

3. **在 React 中善用 useEffect 清理**：確保計時器、事件監聽器等資源在元件卸載時被清理。

4. **避免過多的閉包**：閉包可能導致變數被保留，無法回收。

5. **使用 DevTools 檢查記憶體**：使用 Chrome DevTools 的 Memory 面板，檢查記憶體使用情況，找出洩漏點。

---

### **6\. React 專屬的注意事項**

- **useEffect 的依賴陣列**：確保正確設定 useEffect 的依賴陣列，避免不必要的重新渲染或資源未清理。

- **useRef 的管理**：useRef 的值不會被垃圾回收器自動清理，需謹慎使用。

- **大型狀態管理**：對於大型資料，考慮使用 Redux 或其他狀態管理庫，並適時清理。

---

### **7\. 總結**

JavaScript 的垃圾回收機制主要依靠標記-清除演算法，自動回收不可達的物件。在 React 應用中，開發者需要特別注意計時器、事件監聽器和狀態的管理，以避免記憶體洩漏。透過正確使用 useEffect 的清理函數、限制資料量、以及避免全域變數，可以有效協助垃圾回收器工作，提升應用效能。
