---
title: async/await簡介與應用
description: 學習 JavaScript ES2017 async/await 語法，了解如何使用現代非同步程式設計方式，讓程式碼更簡潔易讀
keywords:
  [JavaScript, async, await, 非同步, Promise, ES2017, 非同步程式設計, 語法糖]
---

# async/await簡介與應用

### 什麼是 async/await？

async/await 是 JavaScript 提供的語法糖（syntactic sugar），用來處理非同步操作（asynchronous operations）。它建立在 Promise 的基礎上，讓非同步程式碼看起來更像同步程式碼，寫起來更簡潔、易讀。

- **async**：用來宣告一個函數是非同步的，這個函數會回傳一個 Promise 物件。

- **await**：只能在 async 函數內使用，用來暫停執行，直到指定的 Promise 解析（resolve）或拒絕（reject）為止。

簡單來說，async/await 讓你可以用更直觀的方式處理非同步任務（例如 API 請求、檔案讀取等），避免使用大量的 .then() 或回調函數（callback functions）。

### 為什麼要用 async/await？有什麼好處？

async/await 帶來以下幾個主要好處：

1. **程式碼更清晰易讀**：

   - 相較於使用 .then() 鏈式呼叫，async/await 讓程式碼看起來像同步程式碼，減少巢狀結構（callback hell）。

   - 它讓你用類似「按順序執行」的寫法來處理非同步邏輯。

2. **錯誤處理更簡單**：

   - 使用 try...catch 語法可以輕鬆捕獲非同步操作的錯誤，不需要像 .catch() 那樣單獨處理每個 Promise 的錯誤。

3. **更容易 debug**：

   - 因為程式碼結構更像同步程式碼，閱讀和追蹤錯誤時更直觀，stack trace 也更清楚。

4. **支援並行處理**：

   - 你可以結合 Promise.all 與 async/await，輕鬆實現多個非同步任務並行執行，提高效率。

---

### 撰寫 async/await 時需要注意什麼？

雖然 async/await 很方便，但撰寫時有幾個需要注意的地方：

1. **只能在 async 函數內使用 await**：

   - await 必須放在 async 函數內，否則會報錯。

2. **必須處理錯誤**：

   - 使用 try...catch 來處理可能的錯誤，否則未捕獲的錯誤可能導致程式中斷。

3. **不要忘記 await 的回傳值是 Promise 的解析結果**：

   - await 會等待 Promise 解析，並回傳解析後的值（resolved value）。如果你直接使用未解析的 Promise，結果可能不符合預期。

4. **避免過度序列化**：

   - 如果多個非同步操作彼此獨立，應該使用 Promise.all 來並行執行，而不是一個接一個 await，以提高效率。

5. **注意效能問題**：

   - 如果 await 使用不當（例如在迴圈中逐一 await），可能導致程式執行時間過長。應該評估是否需要並行處理。

6. **瀏覽器相容性**：

   - async/await 在現代瀏覽器中廣泛支援（自 ECMAScript 2017），但如果你需要支援很舊的環境，記得檢查相容性或使用轉譯工具（如 Babel）。

---

### 程式碼範例：如何使用 async/await

以下是一個完整的範例，模擬從 API 獲取資料，並展示 async/await 的使用方式、錯誤處理，以及並行處理的技巧。

#### 範例 1：基礎使用，單一 API 請求

假設我們要從一個 API 獲取使用者資料：

```javascript
// 模擬一個 API 請求的函數，回傳 Promise
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 1) {
        resolve({ id: 1, name: "小明", age: 25 });
      } else {
        reject(new Error("找不到該使用者"));
      }
    }, 1000); // 模擬 1 秒的網路延遲
  });
}

// 使用 async/await 來獲取資料
async function getUser() {
  try {
    const user = await fetchUserData(1); // 等待 Promise 解析
    console.log("使用者資料：", user);
  } catch (error) {
    console.error("發生錯誤：", error.message);
  }
}

// 執行函數
getUser();
```

**說明**：

1. fetchUserData 模擬一個非同步的 API 請求，回傳一個 Promise。

2. async function getUser 使用 await 等待 fetchUserData 的結果。

3. 使用 try...catch 處理可能的錯誤（例如使用者 ID 無效）。

---

#### 範例 2：多個 API 請求並行處理

假設我們需要同時從兩個 API 獲取資料：

```javascript
// 模擬多個 API 請求
function fetchUserData(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: `使用者${userId}` });
    }, 1000);
  });
}

function fetchUserPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{ postId: 1, content: `貼文 by 使用者${userId}` }]);
    }, 1000);
  });
}

// 使用 async/await 並行處理
async function getUserAndPosts(userId) {
  try {
    // 使用 Promise.all 並行執行多個 Promise
    const [user, posts] = await Promise.all([
      fetchUserData(userId),
      fetchUserPosts(userId),
    ]);
    
    console.log("使用者資料：", user);
    console.log("使用者貼文：", posts);
  } catch (error) {
    console.error("發生錯誤：", error.message);
  }
}

// 執行函數
getUserAndPosts(1);
```

**執行結果**：

```bash
使用者資料： { id: 1, name: "使用者1" }
使用者貼文： [{ postId: 1, content: "貼文 by 使用者1" }]
```

**說明**：

1. 使用 Promise.all 同時執行兩個非同步請求，總耗時大約 1 秒（而不是 2 秒）。

2. await Promise.all 會等待所有 Promise 解析，並將結果以陣列形式回傳。

3. 這樣可以避免逐一 await 造成的時間浪費。

---

#### 範例 3：錯誤處理與迴圈中的 async/await

假設我們要處理多個使用者的資料，並在迴圈中使用 async/await：

```javascript
// 模擬 API 請求，可能成功或失敗
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId <= 3) {
        resolve({ id: userId, name: `使用者${userId}` });
      } else {
        reject(new Error(`找不到使用者 ${userId}`));
      }
    }, 1000);
  });
}

// 處理多個使用者
async function getMultipleUsers(userIds) {
  try {
    // 使用 Promise.all 並行處理所有使用者
    const users = await Promise.all(
      userIds.map(async (id) => {
        try {
          const user = await fetchUserData(id);
          return user;
        } catch (error) {
          return { id, error: error.message }; // 記錄錯誤但不中斷
        }
      })
    );
    
    console.log("所有使用者資料：", users);
  } catch (error) {
    console.error("發生錯誤：", error.message);
  }
}

// 執行函數
getMultipleUsers([1, 2, 3, 4]);
```

**執行結果**：

```javascript
所有使用者資料： [
  { id: 1, name: "使用者1" },
  { id: 2, name: "使用者2" },
  { id: 3, name: "使用者3" },
  { id: 4, error: "找不到使用者 4" }
]
```

**說明**：

1. 使用 map 和 `Promise.all` 並行處理多個非同步請求。

2. 在每個請求內部使用 try...catch，確保單個錯誤不會影響其他請求。

3. 這是一個常見的模式，用於處理批量非同步任務。

---

### 總結與建議

#### 總結

- async/await 是處理非同步操作的強大工具，讓程式碼更簡潔、易讀。

- 它適合用於需要按順序執行或等待結果的場景，例如 API 請求。

- 結合 Promise.all 可以實現並行處理，提升效能。

#### 建議

1. **善用 try...catch**：永遠為非同步操作添加錯誤處理。

2. **使用 `Promise.all` 優化效能**：當有多個獨立任務時，優先考慮並行執行。

3. **保持程式碼乾淨**：將重複的邏輯抽取成獨立的 async 函數，方便維護。

4. **測試與模擬**：在開發時模擬不同情境（成功、失敗、延遲等），確保程式碼穩健。

- 用 `try/catch` 包起來避免錯誤直接中斷