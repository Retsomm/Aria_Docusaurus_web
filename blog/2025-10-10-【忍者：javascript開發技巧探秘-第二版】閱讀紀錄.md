---
title: 【忍者：JavaScript開發技巧探秘 第二版】閱讀紀錄
draft: false
date: 2025-10-10T14:19:00.000+08:00
tags: []
cover_image: https://miro.medium.com/v2/resize:fit:720/format:webp/0*1rH1OTuOpPD3Wtzi.jpg
image_position: top
---
<!--truncate-->

因為看到有人分享這本書，所以就去圖書館借實體書來看，順便重新複習JS。

會針對一些印象特別深刻的部分做分享。有趣的是，在這本書發行的2017年，當時的非同步還沒有async/await語法糖可以使用。

1. 箭頭函式在寫React時，幾乎都會用到箭頭函式寫法，當初在學習的時候，時常分不清楚()跟{}的使用時機
   在寫React時，幾乎都會用到箭頭函式寫法，當初在學習的時候，時常分不清楚()跟{}的使用時機

```javascript
//零個或大於一個參數時()是必要
(param1, param2) => expression
//只有一個參數時可省略()
//多行的程式區塊需搭配使用{}呈現
param1 => {
  myStatement1;
  myStatement2;
}
```

相較於使用函式表達式，箭頭函式可以避免提升問題以外，對於Hooks的應用也會更好搭配

```javascript
// 箭頭函式可以直接作為 useCallback 的參數
const handleClick = useCallback(() => {
  // ... 函式邏輯
}, [dependencies]);
```

使用map、filter和reduce，也能看見箭頭函式的身影

```javascript
array
  .map(i => i * 5)
  .filter(i => i > 10)
  .reduce((acc, i) => acc + i, 0)
```

2 . 閉包(Closure)

```javascript
function animate(elementId) {
  // 1. 取得元素
  var elem = document.getElementById(elementId);
  // 檢查元素是否存在
  if (!elem) {
    console.error("找不到 ID 為 " + elementId + " 的元素。");
    return;
  }
  // 2. 初始化計數器 (tick)
  var tick = 0;
  // 3. 設置計時器
  // 因為 tick 和 timer 是在函式內定義的區域變數，
  // 每次呼叫 animate 時都會建立新的獨立變數，確保 box1 和 box2 的動畫互不干擾。
  var timer = setInterval(function () {
    if (tick < 100) {
      // 4. 計算並應用新的位置
      var position = tick + "px";
      elem.style.left = position;
      elem.style.top = position;
      // 5. 增加計數器
      tick++;
    }
    else {
      // 6. 達到 100 步後停止動畫
      clearInterval(timer);
    }
  }, 10); // 每 10 毫秒執行一次
}
// 呼叫函式來啟動動畫
animate("box1");
animate("box2");
```

建立的兩個計時器(box1、box2)之間的變數(elem、tick、timer)都是獨立，不會互相影響，這正是閉包帶來的作用。

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*aLT7SfRPI68k4HMHsUYshA.jpeg)

3 .事件迴圈

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*xKRTzRc-RyUJsgSCm9nImw.png)

JS在瀏覽器中的事件迴圈通常會有兩個任務佇列，一個稱為任務佇列，一個稱為微任務佇列。

任務佇列 ( Task ) 通常會有：滑鼠事件、鍵盤事件、網路事件（如 `setTimeout`, `setInterval`）以及HTML解析。

微任務佇列 ( Microtaskall ) 通常會有：DOM變化、約定（Promises 的 `.then()`, `.catch()`, `.finally()` 處理函數。

需要注意兩點：

1 . 一開始會先檢查任務迴圈是否有任務

2 . 任務迴圈一次只會執行一個任務，之後就會先檢查是否有可以執行的微任務，而且會把所有微任務都執行完成以後，才會又回到檢查任務迴圈中是否有任務可以執行。

**執行流程：**

Task1 ​→ Microtaskall ​→ ( Render ) → Task2 ​→ Microtaskall ​→ ⋯

超詳細的Event Loop時間線之圖解說明

只有任務的範例

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*tPlleAwDMcWd6vOnqEqEhA.png)

任務跟微任務都有的範例

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*Bbo61WnWSDOU5VEs2c5DOg.png)

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*-zXoKqb89676cRJSv0nO9w.png)

結論：

目前為止我看過的JavaScript 的書有很多，但是這本書我還是會推薦給想要學習JavaScript的人，儘管有些技術已經汰換掉了，作者在書中有很多圖例解說，翻譯也把文字描述得很淺顯易懂。

[
](https://medium.com/@112182ssss?source=post_page---post_author_info--a7f2a608369a---------------------------------------)
