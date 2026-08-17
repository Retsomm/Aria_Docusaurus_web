# 瀏覽器儲存方案

涵蓋概念：localStorage & sessionStorage、IndexedDB、Cookies

---

## 1. localStorage & sessionStorage

| | localStorage | sessionStorage |
|---|---|---|
| 保存時間 | 永久，除非手動清除 | 分頁關閉即清空 |

```javascript
localStorage.setItem("user", JSON.stringify(user)); // 只能存字串，物件要 JSON.stringify
const savedUser = JSON.parse(localStorage.getItem("user"));

// 安全讀取寫法
const getSafeData = (key) => {
  const raw = localStorage.getItem(key);
  if (raw === null) return null; // 沒有這個 key，getItem 回傳 null
  try {
    return JSON.parse(raw);
  } catch {
    return null; // 儲存的內容不是合法 JSON，避免直接拋出讓呼叫端崩潰
  }
};
```

**不要存敏感資料**（密碼、Token），因為同網站的任何 JS 都能讀取，容易被 XSS 攻擊竊取。

`storage` 事件可監聽「其他分頁」對 localStorage 的修改，適合做跨分頁登出同步（自己分頁改自己不會觸發自己）。

容量約 5-10MB，超過會報錯（`QuotaExceededError`）。

---

## 2. IndexedDB

瀏覽器內建的小型資料庫，容量比 localStorage 大得多，能存物件、檔案，且是**非同步**操作，不會卡住畫面。

原生 API 是老式事件驅動寫法，相當囉唆，**實務上幾乎都用套件包裝**：

```javascript
import { openDB } from "idb";
const dbPromise = openDB("MyDB", 1, { upgrade(db) { db.createObjectStore("users", { keyPath: "id" }); } });

const addUser = async (user) => (await dbPromise).add("users", user);
const getUser = async (id) => (await dbPromise).get("users", id);
```

適合情境：離線應用（PWA）、大量結構化資料快取、需要儲存檔案（Blob/File，這是 localStorage 完全做不到的）。localStorage 只適合簡單偏好設定或小型快取，資料量稍大或結構複雜就該用 IndexedDB。

---

## 3. Cookies

Cookie 跟前兩者最大的差異：**符合該 Cookie 的 Domain/Path 範圍、且滿足 Secure、SameSite、第三方 Cookie 政策等條件時，請求會自動附帶送出**，不是無條件送給所有請求。

```javascript
document.cookie = "username=小明"; // 原生 API 相當陽春，讀取要自己手動解析字串
// 沒指定 Path 時，預設為目前文件所在的路徑
// 實務上常用 js-cookie 套件
import Cookies from "js-cookie";
Cookies.set("username", "小明", { expires: 7 });
```

### 重要屬性

| 屬性 | 作用 |
|---|---|
| `httpOnly` | **只能由伺服器設定**，限制 JavaScript 讀取這個 Cookie（`document.cookie` 看不到），防止 Token 被 XSS 腳本直接偷走 |
| `secure` | 只在 HTTPS 下傳送 |
| `samesite` | 降低跨站請求自動帶上 Cookie 的風險，緩解 CSRF 攻擊 |
| `expires`/`max-age` | 過期時間 |

### 為什麼登入 Token 建議放 httpOnly Cookie 而不是 localStorage？

```javascript
// localStorage：XSS 攻擊可以輕易偷走
const stolenToken = localStorage.getItem("token");

// httpOnly Cookie：即使被植入惡意腳本，document.cookie 也完全看不到 token
```

---

## 三者比較

| | localStorage | Cookie |
|---|---|---|
| 自動送到伺服器 | 否 | 是 |
| 容量 | ~5-10MB | ~4KB |
| 防 XSS | 較弱 | 可設 httpOnly，較安全 |
| 適合存放 | 使用者偏好、購物車 | 登入憑證 |

實務上 Cookie（尤其 httpOnly）通常由**後端**負責設定，前端更重要的是理解背後的安全考量。

---

## 本篇總結

- localStorage 永久、sessionStorage 分頁存活期間有效，都只能存字串，要搭配 JSON.stringify/parse
- IndexedDB 適合大量結構化資料與離線應用，實務用 `idb` 等套件簡化操作
- Cookie 因為會自動送到伺服器，適合放登入憑證，搭配 `httpOnly` 限制 JS 讀取以防憑證被 XSS 偷走、`samesite` 降低 CSRF 風險；狀態變更請求仍應搭配 CSRF token 或 Origin 檢查，`samesite` 不能單獨取代這層防護
- 敏感資料永遠不要放 localStorage，優先考慮 httpOnly Cookie
