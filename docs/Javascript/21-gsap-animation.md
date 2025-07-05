---
title: GSAP
description: 學習 GSAP 動畫函式庫的使用方法，包含基本動畫、時間軸控制、滾動動畫、互動效果等進階動畫技巧
keywords:
  [
    JavaScript,
    GSAP,
    動畫,
    網頁動畫,
    CSS動畫,
    SVG動畫,
    滾動動畫,
    互動效果,
    時間軸,
    動畫函式庫,
  ]
---

一個強大且高效的 JavaScript 動畫函式庫，適用於網頁動畫開發。GSAP 可以用來製作流暢的元素進場動畫、滾動動畫、互動效果等，並且支援 CSS、SVG、Canvas 等多種動畫元素。

### 1. DOM 事件監聽

```js
document.addEventListener('DOMContentLoaded', function() {
```

當網頁載入完成 (DOMContentLoaded 事件觸發) 時，才開始執行動畫。

### 2. 註冊 GSAP 插件

```js
gsap.registerPlugin(ScrollTrigger);
```

這裡是註冊 ScrollTrigger 插件，該插件可以讓元素根據頁面滾動時觸發動畫（但這段程式碼內未使用 ScrollTrigger）。

GSAP 動畫解析
GSAP 的 gsap.from() 方法用來設定「從某個狀態開始動畫」，最後動畫會回到原本的 CSS 狀態。

### 3. 網站標題與導覽列進場動畫

```js
gsap.from(".navbar", {
  y: -50, // 從 Y 軸 -50px 移動到原位
  opacity: 0, // 從透明 0 變成 1
  duration: 1, // 動畫持續時間 1 秒
  ease: "power3.out", // 使用較為流暢的加速曲線
});
```

📌 效果：導覽列 (.navbar) 會從 上方 (-50px) 下滑進場，並逐漸變得清晰。

```js
gsap.from(".word", {
  x: -100, // X 軸左移 100px
  opacity: 0, // 透明度從 0 變 1
  duration: 1.2, // 動畫時間 1.2 秒
  delay: 0.3, // 延遲 0.3 秒執行
  ease: "back.out(1.7)", // 使用回彈效果
});
```

📌 效果：網站標題 (.word) 會 從左側滑入，並帶有 回彈效果。

### 4. 主要選擇區動畫

```js
gsap.from(".chose", {
  y: 30, // 從 Y 軸下方 30px 移動到原位
  opacity: 0,
  duration: 1,
  delay: 0.5,
  ease: "power2.out",
});
```

📌 效果：.chose 區塊會 從下方 30px 滑入，並逐漸變清楚。

```js
gsap.from(".here", {
  scale: 0.5, // 從 50% 大小縮放到正常大小
  opacity: 0,
  duration: 0.8,
  delay: 0.7,
  ease: "elastic.out(1, 0.3)", // 彈性動畫
});
```

📌 效果：.here 會 從小變大，並帶有 彈跳效果。

### 5. 汽車圖片進場動畫

```js
gsap.from(".cars img", {
  scale: 0.8, // 從 80% 大小變成正常大小
  opacity: 0,
  duration: 1.2,
  delay: 0.9,
  ease: "power1.out",
});
```

📌 效果：.cars img 內的圖片會 從較小尺寸 (80%) 逐漸放大到原始大小。

### 6. 輸入框與按鈕動畫

```js
gsap.from(".input input", {
  x: -50, // X 軸左移 50px
  opacity: 0,
  stagger: 0.2, // 每個 `.input input` 間隔 0.2 秒執行動畫
  duration: 0.8,
  delay: 1,
  ease: "power2.out",
});
```

📌 效果：輸入框 依序從左側滑入。

```js
gsap.from(".button img", {
  y: 30, // Y 軸下移 30px
  opacity: 0,
  stagger: 0.2, // 按鈕圖片逐一顯示
  duration: 0.8,
  delay: 1.4,
  ease: "back.out(1.4)",
});
```

📌 效果：按鈕圖片 逐個從下方滑入並帶有回彈效果。

### 7. 主要內容區塊動畫

```js
gsap.from(".car img", {
  x: 100, // X 軸右移 100px
  opacity: 0,
  stagger: 0.3,
  duration: 1,
  delay: 1.6,
  ease: "power3.out",
});
```

📌 效果：.car img 內的圖片 逐一從右側滑入。

### 8. 頁腳動畫

```js
const footerElements = [".name", ".copyright"];
gsap.from(footerElements, {
  y: 20, // Y 軸下移 20px
  opacity: 0,
  stagger: 0.2,
  duration: 0.8,
  delay: 2,
  ease: "power2.out",
});
```

📌 效果：頁腳 從下方滑入，並依序出現。

### 9. 側邊欄動畫

```js
gsap.from(".side", {
  x: 50, // X 軸右移 50px
  opacity: 0,
  duration: 1,
  delay: 2.2,
  ease: "elastic.out(1, 0.3)",
});
```

📌 效果：側邊欄 .side 從右側滑入並帶有彈性效果。

### 10. 滑鼠交互效果

(1) 滑鼠懸停放大汽車圖片

```js
const carImages = document.querySelectorAll(".car img");
carImages.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    gsap.to(img, {
      scale: 1.1, // 放大 10%
      duration: 0.3,
      ease: "power1.out",
    });
  });

  img.addEventListener("mouseleave", () => {
    gsap.to(img, {
      scale: 1, // 回到原大小
      duration: 0.3,
      ease: "power1.in",
    });
  });
});
```

📌 效果：滑鼠懸停時，汽車圖片 放大 10%，滑鼠移開則恢復原狀。

(2) 點擊按鈕縮小後恢復

```js
const buttons = document.querySelectorAll(".button img");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    gsap.to(button, {
      scale: 0.9, // 縮小 90%
      duration: 0.1,
      yoyo: true, // 來回變化
      repeat: 1, // 重複一次
      ease: "power1.inOut",
    });
  });
});
```

📌 效果：點擊按鈕時，按鈕 短暫縮小後恢復。
