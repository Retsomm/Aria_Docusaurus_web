# 資料處理與動畫

涵蓋概念：JSON Deep Dive、Typed Arrays & ArrayBuffers、Blob & File API、requestAnimationFrame

---

## 1. JSON Deep Dive

```javascript
// stringify 的 replacer：過濾/轉換欄位（例如遮蔽敏感資料）
JSON.stringify(user, (key, value) => key === "password" ? undefined : value);
JSON.stringify(data, null, 2); // 縮排美化，debug 好用

// parse 的 reviver：解析時順便還原型別（例如字串轉回 Date）
JSON.parse(str, (key, value) => key === "birthDate" ? new Date(value) : value);
```

JSON **完全無法處理循環參照**，會直接報錯，深拷貝要改用 `structuredClone()`。

```javascript
class Money {
  toJSON() { return `${this.currency} ${this.amount}`; } // 自訂序列化行為
}
// Date 物件能自動變成 ISO 字串，就是因為它內建了 toJSON()
```

`JSON.stringify()` 會忽略函式/Symbol/undefined；對 BigInt 直接報錯；物件裡的 `undefined` 屬性被移除，但陣列裡的 `undefined` 會變成 `null`（保持長度）。

---

## 2. Typed Arrays & ArrayBuffers

```javascript
const buffer = new ArrayBuffer(4);       // 原始記憶體空間
const view = new Uint8Array(buffer);      // 用特定格式「解讀」這塊記憶體
```

**實戰場景：處理 API 回傳的二進位資料（例如壓縮檔）**

```javascript
const response = await fetch("/api/download-zip");
if (!response.ok) throw new Error("下載失敗"); // 記得先檢查 response.ok
const arrayBuffer = await response.arrayBuffer(); // 二進位內容不能用 .json()/.text()

// 搭配 JSZip 解壓縮
import JSZip from "jszip";
const zip = await JSZip.loadAsync(arrayBuffer);
```

其他應用：Canvas 影像處理（`Uint8ClampedArray` 處理像素）、WebSocket 二進位傳輸。這是相對底層的工具，一般業務開發較少用到，主要出現在影像/遊戲/音訊處理領域。

---

## 3. Blob & File API

```javascript
const blob = new Blob([arrayBuffer], { type: "application/zip" });
```

### 觸發下載（標準流程）

```javascript
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0); // 等下載真正開始後再釋放，太早 revoke 可能讓部分瀏覽器下載失敗
};
```

### File：使用者透過 `<input type="file">` 上傳的檔案

```javascript
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0]; // File 是 Blob 的子類別，多了 name、lastModified
});
```

### 圖片預覽兩種寫法

```javascript
// 寫法一：FileReader 轉 Base64
const reader = new FileReader();
reader.onload = (e) => (previewImg.src = e.target.result);
reader.readAsDataURL(file);

// 寫法二：createObjectURL（更輕量，大檔案效能較好）
previewImg.src = URL.createObjectURL(file);
previewImg.onload = () => URL.revokeObjectURL(previewImg.src);
previewImg.onerror = () => URL.revokeObjectURL(previewImg.src); // 載入失敗也要釋放，避免洩漏
```

### 上傳檔案

```javascript
const formData = new FormData();
formData.append("file", file);
fetch("/api/upload", { method: "POST", body: formData }); // 瀏覽器自動處理正確的 Content-Type
```

---

## 4. requestAnimationFrame

讓動畫程式碼跟瀏覽器「準備重繪畫面」的節奏同步（通常 60fps），比 `setTimeout`/`setInterval` 更流暢、更省資源（分頁切到背景會自動暫停）。

```javascript
let startTime = null;
let rafId = null;
const animate = (currentTime) => {
  if (!startTime) startTime = currentTime;
  const elapsed = currentTime - startTime;
  const progress = Math.min(elapsed / 1000, 1); // 用實際經過時間計算進度，避免受裝置效能影響

  element.style.left = progress * 300 + "px";
  if (progress < 1) rafId = requestAnimationFrame(animate);
};
rafId = requestAnimationFrame(animate);

const stopAnimate = () => cancelAnimationFrame(rafId); // React 可放進 useEffect 清理函式
```

記得清理：`cancelAnimationFrame(id)`（回顧記憶體管理章節，React 寫在 `useEffect` 清理函式）。

> **實務原則：簡單動畫優先用 CSS `transition`/`animation`**（有硬體加速、效能更好）；只有 Canvas/WebGL 遊戲循環、複雜互動邏輯才需要 `requestAnimationFrame`。

```javascript
// Canvas 遊戲循環範例
let gameLoopId = null;
let stopped = false;
const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  x += 2;
  ctx.fillRect(x, 50, 30, 30);
  if (!stopped) gameLoopId = requestAnimationFrame(gameLoop);
};
const stopGameLoop = () => {
  stopped = true;
  cancelAnimationFrame(gameLoopId);
};
```

---

## 本篇總結

- JSON 的 replacer/reviver 能過濾敏感資料、還原型別；無法處理循環參照，深拷貝改用 `structuredClone()`
- ArrayBuffer/Typed Array 用於處理二進位資料，前端最常見場景是下載壓縮檔、圖片、檔案
- Blob/File 是下載、上傳、預覽檔案的標準工具，記得 `revokeObjectURL()` 釋放資源
- `requestAnimationFrame` 適合複雜動畫邏輯與遊戲循環，簡單動畫優先用 CSS
