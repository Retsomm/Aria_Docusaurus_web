---
title: async/await簡介與應用
description: 學習 JavaScript ES2017 async/await 語法，了解如何使用現代非同步程式設計方式，讓程式碼更簡潔易讀
keywords:
  [JavaScript, async, await, 非同步, Promise, ES2017, 非同步程式設計, 語法糖]
---

當你在 JavaScript 裡處理「非同步操作」時，例如抓 API、等待資料庫回傳、或計時器延遲，`async/await` 是非常實用且容易閱讀的語法。它是基於 Promise 的語法糖，讓非同步程式碼看起來像同步的流程，寫起來更直覺。

---

## async/await 是什麼

### async

在函式前加上 `async`，這個函式就會「自動回傳一個 Promise」。

```javascript
async function example() {
  return "Hello";
}
example().then((result) => {
  console.log(result); // Hello
});
```

這相當於：

```javascript
function example() {
  return Promise.resolve("Hello");
}
```

---

### await

`await` 只能在 `async` 函式裡使用，它會「暫停」這個函式的執行，直到 Promise 完成（resolve 或 reject）為止，然後才繼續往下執行。

```javascript
async function getData() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const data = await response.json();
  console.log(data);
}
```

這樣寫的好處是，整個流程像同步一樣易讀，沒有 `.then()` 的巢狀結構。

---

## 完整範例：取得文章與留言

```javascript
async function getPostAndComments() {
  try {
    const postRes = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const post = await postRes.json();
    const commentsRes = await fetch(
      "https://jsonplaceholder.typicode.com/comments?postId=1"
    );
    const comments = await commentsRes.json();
    console.log("文章標題：", post.title);
    console.log("留言數量：", comments.length);
  } catch (error) {
    console.error("錯誤發生：", error);
  }
}
```

這個範例中：

- 用 `await` 一步步等資料回來

- 用 `try/catch` 包起來避免錯誤直接中斷

---

## 重點整理

| 概念              | 說明                                              |
| ----------------- | ------------------------------------------------- |
| async 函式        | 一定會回傳 Promise                                |
| await 表達式      | 等待一個 Promise 完成                             |
| 只能用在 async 裡 | `await` 不能在最外層直接用（除非用頂層 await）    |
| 更直覺的流程      | 可讀性比 `.then()` 好，非常適合串接多個非同步流程 |

---

## 實務應用場景

- 前端表單送出後等待伺服器回應

  ```javascript
  async function submitForm(formData) {
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        alert("送出成功，感謝您的填寫！");
      } else {
        alert("送出失敗：" + result.message);
      }
    } catch (error) {
      console.error("送出時發生錯誤：", error);
      alert("系統發生錯誤，請稍後再試");
    }
  }
  // 假設這是使用者點擊送出按鈕時呼叫的函式
  document.querySelector("#submitBtn").addEventListener("click", () => {
    const formData = {
      name: document.querySelector("#name").value,
      email: document.querySelector("#email").value,
    };
    submitForm(formData);
  });
  ```

- 載入使用者資料後渲染到畫面

  ```javascript
  async function loadUserProfile(userId) {
    try {
      const res = await fetch(`/api/user/${userId}`);
      const user = await res.json();
      document.querySelector("#name").textContent = user.name;
      document.querySelector("#email").textContent = user.email;
    } catch (error) {
      console.error("載入使用者資料錯誤：", error);
      document.querySelector("#userInfo").textContent = "載入失敗";
    }
  }
  loadUserProfile(123);
  ```

- 等待上一個請求完成後才執行下一個請求

  ```javascript
  async function getOrderDetails(orderId) {
    try {
      const orderRes = await fetch(`/api/order/${orderId}`);
      const order = await orderRes.json();
      const productRes = await fetch(`/api/product/${order.productId}`);
      const product = await productRes.json();
      console.log("訂單資訊：", order);
      console.log("商品資訊：", product);
    } catch (error) {
      console.error("取得訂單與商品資訊錯誤：", error);
    }
  }
  getOrderDetails("order_001");
  ```
