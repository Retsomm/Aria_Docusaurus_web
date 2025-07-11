---
title: Event Loop、Event Quene、Event Table
description: 深入理解 JavaScript 事件迴圈機制，包含事件佇列、事件表格、調用堆疊的運作原理與非同步程式執行流程
keywords:
  [
    JavaScript,
    Event Loop,
    Event Queue,
    Event Table,
    事件迴圈,
    事件佇列,
    非同步,
    調用堆疊,
  ]
---

## 一、Event Loop（事件迴圈）

**中文解釋：事件迴圈**

Event Loop 是一個 JavaScript 執行環境中，**用來處理非同步任務的機制**。它的作用是：

> **不斷地監控 Call Stack（呼叫堆疊）是否為空，若為空，則從 Event Queue 把排隊的 callback 拉進來執行。**

特點：

- 只要主執行緒（Call Stack）空了，就會去檢查 Event Queue 有沒有事情要處理。

- 不會卡住整個程式流程（因為非同步）

---

## 二、Event Queue（事件佇列）

**中文解釋：事件佇列或事件排隊區**

Event Queue 就是一個 **等待被執行的 callback 函式** 的排隊區。

例如你寫下這樣的程式碼：

```
console.log("A");
setTimeout(() => {
  console.log("B");
}, 1000);
console.log("C");
```

執行流程會是：

1. A 先印出

2. `setTimeout()` 記錄在 Event Table（後面解釋）

3. C 立刻印出

4. 1 秒後 callback 被放進 Event Queue

5. Event Loop 發現 Call Stack 空了，才把這個 callback 拉出來執行，印出 B

---

## 三、Event Table（事件表）

**中文解釋：事件表或監聽表**

Event Table 是 JavaScript 執行環境（如瀏覽器）用來**管理非同步 API 的地方**。

當你呼叫像 `setTimeout()`、`addEventListener()`、AJAX 等瀏覽器或 Node.js 提供的非同步 API 時，這些行為會登記在 Event Table，系統會幫你監控事件是否發生或時間是否到達。

作用：

- **監控某個非同步任務的完成狀態**

- 當任務完成時，會把對應的 callback 函式丟進 Event Queue

---

## 總結圖解（文字版流程）

```
程式執行中 ↓
遇到 setTimeout / API call 等非同步操作 →
➡ 登記到 Event Table，系統開始計時 / 等事件發生
    ↓
    任務完成 → callback 被丟進 Event Queue →
        Event Loop 檢查 Call Stack 是否為空 →
            若空 → 將 callback 拿去執行（放入 Call Stack）
```

---

## 補充：Call Stack 是什麼？

Call Stack（呼叫堆疊）是 JavaScript 執行同步程式碼時的主要機制：

- 呼叫一個函式 → 放入堆疊頂端

- 函式執行完 → 移出堆疊

- **一次只能執行一件事**

---

## 小結（比喻說明）

| 名稱        | 比喻                       | 角色功能                                     |
| ----------- | -------------------------- | -------------------------------------------- |
| Event Loop  | 店長（負責監控）           | 看 Call Stack 空了沒，決定要不要執行佇列任務 |
| Event Queue | 排隊的人（等著被處理）     | 裡面是等著執行的 callback                    |
| Event Table | 登記表（交給外包監控人員） | 記錄非同步任務狀態，完成後再通知 Queue       |
