# 模組化與網頁平台 API

涵蓋概念：IIFE/Modules/Namespaces、DOM、Fetch API、Web Workers

---

## 1. IIFE, Modules & Namespaces

### IIFE（立即執行函式表達式）

宣告的當下就馬上執行，避免污染全域作用域：

```javascript
(function () {
  let secret = "只有這裡看得到";
  console.log("宣告完馬上執行");
})();
console.log(typeof secret); // "undefined"
```

### Namespace（命名空間）

用物件把相關功能收納在一起，減少命名衝突：

```javascript
const UserModule = {
  name: "小明",
  greet() { console.log("哈囉，我是 " + this.name); }
};
```

### ES6 Modules（現代標準）

```javascript
// mathUtils.js
export function add(a, b) { return a + b; }
export default 3.14159;

// main.js
import PI, { add } from "./mathUtils.js";
```

### Dynamic Import（需要時才載入）

```javascript
button.addEventListener("click", async () => {
  const module = await import("./heavyModule.js"); // 常搭配 React.lazy() 做路由懶加載
  module.heavyFunction();
});
```

---

## 2. DOM（文件物件模型）

瀏覽器把 HTML 轉換成一棵「家族樹」，JS 可以查找、修改、新增、刪除節點。

### 選取與修改元素

```javascript
const btn = document.querySelector("#myBtn");
const allDescs = document.querySelectorAll(".desc");

btn.textContent = "哈囉";       // 安全，純文字
btn.innerHTML = "<b>哈囉</b>";  // 有 XSS 風險，使用者輸入內容避免用這個
btn.classList.add("highlight");
```

**安全守則：只要是使用者輸入的內容，優先用 `textContent`，不要用 `innerHTML`，避免 XSS 攻擊。**

### 新增/刪除/遍歷

```javascript
const body = document.body;
const newP = document.createElement("p");
body.appendChild(newP);
newP.remove();

desc.parentElement;             // 找父層
desc.nextElementSibling;        // 找下一個兄弟
```

**效能提醒：** 避免在迴圈裡頻繁操作 DOM，先在記憶體組合好字串，最後一次性寫入。

---

## 3. Fetch API

```javascript
fetch("https://api.example.com/user")
  .then((response) => {
    if (!response.ok) throw new Error("HTTP 錯誤：" + response.status);
    return response.json();
  })
  .then((data) => console.log(data))
  .catch((error) => console.log("錯誤：", error));

// async/await 寫法
async function getUser() {
  const response = await fetch("/api/user");
  if (!response.ok) throw new Error("HTTP 錯誤：" + response.status);
  const data = await response.json();
  return data;
}
```

### POST 請求

```javascript
fetch("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "文章標題" })
});
```

**重要地雷：`fetch` 不會因為 404/500 自動報錯**，一定要自己檢查 `response.ok`：

```javascript
if (!response.ok) {
  throw new Error("HTTP 錯誤：" + response.status);
}
```

### AbortController：取消請求

```javascript
const controller = new AbortController();
fetch(url, { signal: controller.signal });
setTimeout(() => controller.abort(), 3000); // 常用於搜尋自動完成，取消前一次未完成的請求
```

---

## 4. Web Workers

JS 主執行緒是單執行緒，遇到耗時運算會讓整個畫面凍住。Web Worker 開一個獨立背景執行緒處理耗時工作。

```javascript
// worker.js
self.onmessage = (e) => {
  let result = 0;
  for (let i = 0; i < e.data; i++) result += i;
  self.postMessage(result);
};

// main.js
const worker = new Worker("worker.js");
worker.postMessage(1000000000);
worker.onmessage = (e) => console.log("結果：", e.data);
console.log("主執行緒沒被卡住");
```

**限制：** Worker 內部**不能操作 DOM**，只能做純運算、資料處理、發送請求，兩邊只能透過 `postMessage` 溝通。

### 在 React 專案中使用

```javascript
// Vite 內建支援
const worker = new Worker(new URL("./worker.js", import.meta.url));

// 或用 comlink 套件讓呼叫像一般函式（先 npm install comlink，加進 package.json dependencies）
// worker.js 也要改用 ESM，並用 expose() 把函式暴露出去：
// import { expose } from "comlink";
// const heavyCalculation = (n) => { let r = 0; for (let i = 0; i < n; i++) r += i; return r; };
// expose({ heavyCalculation });
import { wrap } from "comlink";
const comlinkWorker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" }); // ESM worker 要加 type: "module"
const workerApi = wrap(comlinkWorker);
const result = await workerApi.heavyCalculation(1000000000);
```

### Node.js 對應方案：worker_threads

```javascript
const { Worker } = require("worker_threads");
const worker = new Worker("./worker.js", { workerData: 1000000000 });
worker.on("message", (result) => res.json({ result }));
```

> 只有「CPU 密集運算」（加密、大量迴圈）才需要 worker_threads；單純打 API、查資料庫等 I/O 等待，Node.js 的 Event Loop 就處理得很好。

---

## 本篇總結

- ES6 Modules 是現代標準，取代 IIFE/Namespace 成為主流模組化方式
- DOM 操作：優先用 `querySelector`，使用者輸入內容避免用 `innerHTML`
- Fetch 記得檢查 `response.ok`，用 `AbortController` 取消請求
- Web Worker（瀏覽器）/ worker_threads（Node.js）用於避免耗時運算卡住主執行緒，但不能操作 DOM
