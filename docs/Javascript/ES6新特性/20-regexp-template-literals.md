---
title: JavaScript：物件操作與動態網頁應用
description: 學習 JavaScript 物件操作技巧與動態網頁應用，包含物件屬性存取、方法調用、DOM 操作與互動設計
keywords:
  [
    JavaScript,
    物件操作,
    動態網頁,
    DOM操作,
    物件屬性,
    方法調用,
    互動設計,
    網頁應用,
    前端開發,
  ]
---

:::tip[My tip]

如果看不到 codepen playground，請重新整理頁面

:::

### 正規表達式：( RegExp )

### 樣板字面值：（Template literals）是允許嵌入運算式的字串字面值

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

## <CodePenEmbed slugHash="raNpKbL" user="Retsnom" />

```html title="index.html"
<ul id="books"></ul>
<ul id="fruits"></ul>
```

```sass title="style.sass"
html,body
  font-family: "微軟正黑體"
  box-sizing: border-box
  margin: 0
.highlight
  background-color: yellow
  padding: 2px 5px

ul#books
  display: flex
  justify-content: center
  align-items: center
  li
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    list-style: none
    padding: 10px
    border: solid 1px black
    transition:.5s
    &:hover
      background-color: #eee
    h2
      height: 60px
      text-align: center
ul#fruits
  background-color: #eee
  padding: 10px
  display: flex
  justify-content: center
  align-items: center
  li
    background-color: #fff
    list-style: none
    display: inline-block
    padding: 20px 40px
    margin: 10px
    box-shadow: 0px 0px 20px rgba(black,0.1)
    border-radius: 10px
    transition: 0.5s
    cursor: pointer
    position: relative
    overflow: hidden
    width: 100px
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    &:hover
      transform: translate(-5px,-5px)

    .discountTag
      background-color: #f24
      color: white
      position: absolute
      right: 0
      top: 0
      padding: 2px 20px
      transform: rotate(45deg) translate(20px,-10px)

.fruit
  width: 50px
  height: 50px
  background-color: red
  border-radius: 50%
  &.lemon
    background-color: yellow
  &.guava
    background-color: green
img
  width: 100px
item
  border: solid 1px black
```

```js title="script.js"
var bookdatas = [
  {
    name: "THE WILD ROBOT",
    description:
      "　機器人羅茲第一次睜開眼睛時，就發現自己孤伶伶的在一座荒島上。她不知道自己為什麼來到這裡，也不知道生存目的何在，只知道她得想辦法活下來。撐過強勁暴風雨的摧殘、逃離兇猛大熊的攻擊後，她明白自己若是想存活，唯一的方法就是去適應這個環境，向島上那些不歡迎她的動物居民們努力學習。當羅茲慢慢和島上生物建立友好關係，甚至擁有自己的動物家人之後，她開始覺得這裡就是她的家。直到有一天，機器人不為人知的神祕過往前來糾纏……。",
    img: "https://im1.book.com.tw/image/getImage?i=https://www.books.com.tw/img/F01/a81/18/F01a811863_b_02.jpg",
    price: 249,
    discount: 0.73,
  },
  {
    name: "THE WILD ROBOT ESCAPES",
    description:
      "　殘破的羅茲不得不離開荒島。她給自己的目標是：「修復自己，逃離新生活，找到回家的路。」當羅茲再度醒來，她置身農場，成了農場機器人。但是她沒有忘記荒島的記憶和她的家人、朋友，一邊假裝和普通機器人一樣，讓殘破的農場步上軌道，一邊逃出農場，重回荒島的機會。透過候鳥的傳遞，荒野機器人和野雁兒子的故事，成了野生動物界的傳奇，亮亮也因此找到媽媽團聚。這時，回到荒島的時機也到了。兒子野雁從天空為荒野機器人當嚮導，他們一路向北，從農場進入山區，進入小鎮，每一站都有不同的困難要克服，連海裡的鯨魚都在驚險時刻，把羅茲救出海灣，重返平地。機器人羅茲最後來到她製造出廠的大城市，面對瑞可機器人和飛船的追捕，羅茲從高樓墜毁。一個脫序的機器人面臨被銷毁的命運，然而發明羅茲的設計者卻對這個有缺陷的機器人充滿好奇。當機器人擁有自己的意志，可以有選擇權嗎？哪裡才是荒野機器人的真正歸宿？",
    img: "https://im1.book.com.tw/image/getImage?i=https://www.books.com.tw/img/F01/a81/18/F01a811863_b_06.jpg",
    price: 249,
    discount: 0.73,
  },
  {
    name: "THE WILD ROBOT PROTECTS",
    description:
      "機器人羅茲和動物們在島上過著快樂的生活，但隨著海水帶來的危機逼近，動物們被迫向內陸遷移，爭奪日漸減少的資源。為了阻止危機保護小島，機器人羅茲踏上旅程航向大海，在旅程中遇見不可思議的生物，也見到有毒的水造成的破壞。她能夠拯救大海、以及她摯愛的小島和動物們嗎？",
    img: "https://im1.book.com.tw/image/getImage?i=https://www.books.com.tw/img/F01/a81/18/F01a811863_b_10.jpg",
    price: 249,
    discount: 0.73,
  },
];

function highlightText(text, word) {
  var replaceRegExp = new RegExp("(" + word + ")", "g");
  return text.replace(replaceRegExp, "<span class='highlight'>$1</span>");
}

function showBook(book) {
  var item = $("<li>");
  var price = parseInt(book.price * book.discount);
  var textHighlighted = highlightText(book.description.slice(0, 50), "羅茲");
  item.append(`<h2>${book.name}</h2>`);
  item.append(`<img src="${book.img}">`);
  item.append(`<p>${textHighlighted}</p>`);
  item.append(`<h3>價錢${price}</h3>`);
  $("ul#books").append(item);
}

for (var i = 0; i < bookdatas.length; i++) {
  showBook(bookdatas[i]);
  //
}

function generateItem(name, price, eng, discount) {
  return {
    name: name,
    price: price,
    type: "normal",
    eng: eng,
    discount: discount,
  };
}

var itemdatas = [
  generateItem("蘋果", 300, "apple", 0.8),
  generateItem("檸檬", 400, "lemon", 0.5),
  generateItem("芭樂", 200, "guava", 0.8),
];

function getItemHtml(item) {
  var result = $("<li>");
  var fruitHtml = "<div class='fruit " + item.eng + "'></div>";
  var flavor = "";
  if (item.name == "蘋果") {
    flavor = "(甜)";
  }
  var discountTag = "";
  if (item.discount <= 0.5) {
    discountTag = "<div class='discountTag'>特價！</div>";
  }
  result.append(`<h3>${item.name}${flavor}</h3>`);
  result.append(fruitHtml);
  result.append(`<h4>${item.price}*${item.discount}元</h4>`);
  result.append(discountTag);
  return result;
}

function printItems(items) {
  for (var i = 0; i < items.length; i++) {
    var itemHtml = getItemHtml(items[i]);
    $("ul#fruits").append(itemHtml);
  }
}

printItems(itemdatas);

function getTotalPrice(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price * items[i].discount;
  }
  return parseInt(total);
}

console.log("總價：" + getTotalPrice(itemdatas));
console.log("書籍總價：" + getTotalPrice(bookdatas));
```

---

:::danger[Please note]

這個內容是來自吳哲宇老師的[動畫互動網頁特效入門（JS/CANVAS）課程](https://hahow.in/courses/586fae97a8aae907000ce721)

:::
