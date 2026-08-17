# JS 引擎、錯誤處理與正規表達式

涵蓋概念：JavaScript Engines、Error Handling、Regular Expressions

---

## 1. JavaScript Engines

JS 引擎（如 Google 的 V8，同時是 Chrome 與 Node.js 的核心）把程式碼翻譯成機器碼，執行分三階段：

1. **解析（Parsing）**：轉換成 AST（抽象語法樹）
2. **編譯（JIT）**：先用直譯器快速執行，同時觀察哪些是「熱點程式碼（Hot Code）」，把它們額外編譯成更快的機器碼
3. **執行與垃圾回收**

### Hidden Classes 與效能小知識

```javascript
// 好習慣：物件建立時就把屬性寫齊，順序一致
const point1 = { x: 1, y: 2 };
const point2 = { x: 3, y: 4 }; // 結構相同，可共用隱藏類別，存取較快

// 較差：動態逐一加屬性，或加入順序不同
const point3 = {};
point3.x = 1;
point3.y = 2;
```

> 實務上多數情況不需要刻意優化這些細節，寫結構清楚的程式碼自然就符合引擎喜歡的模式。

---

## 2. Error Handling（錯誤處理）

```javascript
try {
  const result = riskyOperation();
} catch (error) {
  console.log("發生錯誤：", error.message);
} finally {
  console.log("不管成功失敗都會執行，常用於清理工作");
}
```

### 內建錯誤類型

```javascript
null.toUpperCase();      // TypeError
console.log(notExist);   // ReferenceError
new Array(-1);            // RangeError
```

### 自訂錯誤

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("年齡不能是負數", "age");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`欄位 ${error.field} 驗證失敗`);
  }
}
```

### 非同步錯誤處理

```javascript
const fetchUserData = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error(`HTTP 錯誤：${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("失敗：", error.message);
    throw error; // 重新拋出，讓呼叫端知道失敗了，而不是默默回傳 undefined
  }
};
```

**重要地雷：`try/catch` 能抓「同步例外」跟「try 區塊內 `await` 的 rejection」，但抓不到稍後才執行的 callback（如 `setTimeout`）裡的例外**，那類錯誤要在 callback 內部自己處理：

```javascript
// 抓得到：await 的 rejection 發生在 try 區塊執行期間
try {
  await Promise.reject(new Error("失敗"));
} catch (error) { console.log("這裡抓得到"); }

// 抓不到：setTimeout 的 callback 是「稍後」才執行，早已離開 try 區塊
try {
  setTimeout(() => { throw new Error("出錯了"); }, 1000);
} catch (error) { /* 永遠不會執行 */ }

// 正確：錯誤處理寫在真正執行邏輯的地方
setTimeout(() => {
  try { throw new Error("出錯了"); }
  catch (error) { console.log("這裡才抓得到"); }
}, 1000);
```

單純建立一個 Promise（不 `await`、不接 `.then`）時，一定要接 `.catch()` 或改用 `await` 搭配 `try/catch`，不然錯誤會被靜默忽略。

---

## 3. Regular Expressions（正規表達式）

```javascript
/hello/.test("Hello World");   // false（大小寫不同）
"Hello World".match(/World/);   // 找出符合內容
"Hello World".replace(/World/, "JS"); // 取代
```

### 常用符號

| 符號 | 意思 |
|---|---|
| `\d` | 數字 |
| `\w` | 文字/數字/底線 |
| `\s` | 空白 |
| `*` | 0次以上 |
| `+` | 1次以上 |
| `?` | 0或1次 |
| `{3}` | 剛好3次 |
| `^` | 開頭 |
| `$` | 結尾 |
| `i` (flag) | 忽略大小寫 |
| `g` (flag) | 全域搜尋 |

### 分組

```javascript
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
const matched = "2026-08-14".match(dateRegex);
console.log(matched[1]); // "2026"
```

### 前端實戰：表單驗證

```javascript
const isValidEmail = (email) => /^[\w.-]+@[\w.-]+\.\w+$/.test(email);
const isValidPhone = (phone) => /^09\d{8}$/.test(phone);

const isStrongPassword = (pw) =>
  pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
```

### 字串清理

```javascript
const cleanSpaces = (str) => str.replace(/\s+/g, " ").trim();
const extractNumbers = (str) => str.replace(/\D/g, "");
const camelToKebab = (str) => str.replace(/([A-Z])/g, "-$1").toLowerCase();
```

> 複雜規則不用堅持從頭手寫，可善用 `zod`/`yup` 等驗證套件，或用 regex101.com 這類工具視覺化測試。

---

## 本篇總結

- JS 引擎透過 JIT 編譯，自動優化「熱點程式碼」，物件結構一致有助於效能
- `try/catch/finally`：能抓同步錯誤跟 try 區塊內 `await` 的 rejection；稍後才執行的 callback（如 `setTimeout`）要在 callback 內部自己處理
- 自訂錯誤類別搭配 `instanceof`，可以針對不同錯誤類型做不同處理
- Regex 是強大的字串比對工具，前端最常用在表單驗證跟字串清理
