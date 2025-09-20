---
title: JS setInterval/setTimeout課程範例
description: 學習 JavaScript 計時器函式的使用方法，包含 setInterval、setTimeout 的語法、應用場景與清除方式
keywords:
  [
    JavaScript,
    setInterval,
    setTimeout,
    計時器,
    延遲執行,
    重複執行,
    clearInterval,
    clearTimeout,
    非同步,
  ]
---

:::tip[My tip]

如果看不到 codepen playground，請重新整理頁面

:::

### setInterval：給定一組動作，並重複執行

### setTimeout：給定一個時間，一組動作，在時間過後執行動作

---

import React from 'react';

export const CodePenEmbed = ({ slugHash, user }) => {
return (

<p
className="codepen"
data-height="300"
data-default-tab="html,result"
data-slug-hash={slugHash}
data-user={user}
style={{ border: "2px solid #ccc", margin: "1em 0", padding: "1em" }} >
<span>
See the Pen{" "}
<a href={`https://codepen.io/${user}/pen/${slugHash}`}>
你的 CodePen 標題
</a>{" "}
by {user} on{" "}
<a href="https://codepen.io/">CodePen</a>.
</span>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
</p>
);
};

## <CodePenEmbed slugHash="KwKZxeR" user="Retsnom" />

```html title="index.html"
<div>
  <h2 class="monsterText">
    Hello<br />
    There
  </h2>
  <h3 class="opText">Ahhhh We’ll eat you</h3>
</div>
<div class="monster">
  <div class="eye">
    <div class="eyeball"></div>
  </div>
  <div class="mouth"></div>
</div>
<div class="monster blue">
  <div class="eye">
    <div class="eyeball"></div>
  </div>
  <div class="mouth"></div>
</div>
<div class="pageLoading">
  <div class="monster">
    <div class="eye">
      <div class="eyeball"></div>
    </div>
    <div class="mouth"></div>
  </div>
  <div class="loading">
    <div class="bar"></div>
  </div>
</div>
```

```sass title="style.sass"
$colorOrange: #E55A54
$colorBlue: #0C4475

@mixin size($w,$h:$w)
  width: $w
  height: $h

@mixin flexCenter
  display: flex
  justify-content: center
  align-items: center


html,body
  margin: 0
  padding: 0
  +size(100%)
  background-color: $colorOrange
  +flexCenter
  font-family: "微軟正黑體"


.pageLoading
  position: fixed
  +size(100%)
  left: 0
  top: 0
  +flexCenter
  background-color: $colorBlue
  flex-direction: column
  transition: opacity 0.5s 0.5s

  &.complete
    opacity: 0
    .monster
      transform: scale(0.01) rotate(360deg)

.monster
  +size(110px)
  background-color: $colorOrange
  border-radius: 20px

  .eye
    +size(40%)
    border-radius: 50%
    background-color: #fff
    +flexCenter
  .eyeball
    +size(50%)
    border-radius: 50%
    background-color: $colorBlue
  .mouth
    +size(32%,12px)
    border-radius: 12px
    background-color: white
    margin-top: 15%

  cursor: pointer
  margin: 10px
  +flexCenter
  flex-direction: column

  &:before,&:after
    content: ""
    display: block
    +size(20%,10px)
    background-color: #fff
    border-radius: 10px
    position: absolute
    left: 50%
    top: -10px
  &:before
    transform: translateX(-70%) rotate(45deg)
  &:after
    transform: translateX(-30%) rotate(-45deg)

  box-shadow: 0px 10px 20px rgba(black,0.2)

  &,*
    transition: 0.5s

  &.blue
    background-color: $colorBlue
    animation-delay: 0.5s
    .mouth,.eyeball
      background-color: $colorOrange


  @keyframes jumping
    50%
      top: 0
      box-shadow: 0px 10px 20px rgba(black,0.2)
    100%
      top: -50px
      box-shadow: 0px 120px 50px rgba(black,0.2)
      // transform: scale(1.05)

  @keyframes eyemove
    0%,10%
      transform: translate(50%)
    90%,100%
      transform: translate(-50%)
      // transform: scale(1.05)

  position: relative
  animation: jumping 0.8s infinite alternate

  .eyeball
    animation: eyemove 1.6s infinite alternate


.loading
  +size(200px,8px)
  margin-top: 80px
  border-radius: 5px
  background-color: #fff
  overflow: hidden
  transition: 0.5s
  .bar
    background-color: $colorOrange
    +size(0%,100%)

h2
  color: white
  font-size: 40px
  margin-right: 50px
h3
  margin-top: 0
  opacity: 0.5
  color: white
```

```js title="script.js"
let percent = 0;
let sec = 10;

function eatCount() {
  $(".monsterText").html("We are<br>SQUARE<br>MONSTER!");
}

let timer = setInterval(function () {
  $(".bar").css("width", percent + "%");
  percent += 1;
  if (percent >= 100) {
    $(".pageLoading").addClass("complete");
    setTimeout(eatCount, 3000);
    clearInterval(timer);
  }
}, 30);
```

---

:::danger[Please note]

這個內容是來自吳哲宇老師的[動畫互動網頁特效入門（JS/CANVAS）課程](https://hahow.in/courses/586fae97a8aae907000ce721)

:::
