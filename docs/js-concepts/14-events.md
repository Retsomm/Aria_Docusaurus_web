# 事件機制：冒泡、委派與自訂事件

涵蓋概念：Event Bubbling & Capturing、Event Delegation、Custom Events

---

## 1. Event Bubbling & Capturing（事件冒泡與捕獲）

事件傳遞分三階段：**捕獲**（由外而內）→ **目標**（抵達點擊的元素）→ **冒泡**（由內而外，這是預設監聽的階段）。

```javascript
child.addEventListener("click", () => console.log("按鈕被觸發"));
parent.addEventListener("click", () => console.log("爸爸被觸發"));
grandparent.addEventListener("click", () => console.log("爺爺被觸發"));
// 點擊 button，印出順序：按鈕 → 爸爸 → 爺爺（由內而外冒泡）

// 第三個參數設 true 改成監聽捕獲階段（實務上少用）
grandparent.addEventListener("click", fn, true);
```

### stopPropagation()：阻止事件繼續傳遞

**經典實戰地雷：Modal 彈窗**

```javascript
overlay.addEventListener("click", () => closeModal()); // 點擊遮罩關閉
modal.addEventListener("click", (e) => e.stopPropagation()); // 阻止冒泡，避免點擊內部誤觸關閉
```

`event.target`（實際被點擊的元素）vs `event.currentTarget`（監聽器綁定的元素本身）。

`stopPropagation()`（阻止傳遞）跟 `preventDefault()`（阻止瀏覽器預設行為，如連結跳轉）是**兩個完全不同的方法**，經常被搞混。

---

## 2. Event Delegation（事件委派）

利用「事件冒泡」，只在共同的父層元素上綁**一個**監聽器，透過 `event.target` 判斷是哪個子元素被點擊：

```javascript
todoList.addEventListener("click", (event) => {
  const li = event.target.closest("li"); // 不管點在 li、裡面的 span 或其他子元素都能找到
  if (li && todoList.contains(li)) {
    console.log("點擊了：", li.textContent);
  }
});
// 動態新增的 <li> 也完全不用另外綁定監聽器！
```

搭配 `closest()` 更精確地找到目標容器：

```javascript
todoList.addEventListener("click", (event) => {
  const clickedLi = event.target.closest("li"); // 從點擊處往上找最近的 li
  if (event.target.matches(".delete")) clickedLi.remove();
});
```

**兩大優勢**：① 大幅減少監聽器數量，節省記憶體；② 完美解決「動態新增元素沒有事件監聽」的問題。

> **React 內部已經自動幫你做了事件委派**（統一委派到根節點），寫 React 時可以放心為每個項目各自寫 `onClick`，不需要自己手動實作這個技巧。這個知識更常用在原生 JS 專案跟面試考題。

---

## 3. Custom Events（自訂事件）

自己創造事件名稱、廣播、監聽：

```javascript
const event = new CustomEvent("userLoggedIn", {
  detail: { userId: 123, userName: "小明" },
  bubbles: true // 預設 false，需要冒泡要自己開啟
});
document.addEventListener("userLoggedIn", (e) => console.log(e.detail.userName));
document.dispatchEvent(event);
```

**價值：解耦（Decoupling）**——發布者不需要知道誰在監聽，監聽者也不需要知道內部實作細節，兩者可以獨立開發。

> **實務提醒**：在 React 專案裡，元件溝通通常用 props、回呼函式、Context 或狀態管理套件，較少直接用原生 Custom Events。這個技巧更常用在：不使用框架的原生 JS 專案、Web Components、整合非 React 的第三方套件。

---

## 本篇總結

- 事件傳遞順序：捕獲 → 目標 → 冒泡；`stopPropagation()` 可阻止繼續傳遞，Modal 彈窗要留意這個地雷
- 事件委派善用冒泡機制，用一個監聽器處理所有子元素（包含動態新增的），React 內部已自動處理
- Custom Events 讓元件間可以「解耦」溝通，但在 React 專案裡通常有更慣用的做法（props/Context）
