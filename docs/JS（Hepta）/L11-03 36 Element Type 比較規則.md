---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 11 堂：Reconciliation 核心機制

# 36 Element Type 比較規則

想像你在開發一個登入頁面。當使用者點擊「切換註冊」按鈕時，你希望原本輸入帳號的 `<input>` 框能保留已經打好的文字，但外層的標題要從「登入」變成「註冊」。然而，有時候你會發現，明明只是改個文字，整個輸入框的內容卻突然消失了，游標也失去了焦點。

為什麼 React 有時候會聰明地只更新一個屬性，有時候卻像「翻桌」一樣把整個 UI 砍掉重練？這背後的核心邏輯，就是我們今天要探討的 **Element Type（元素類型）比較規則**。

## 核心原則：類型即身分

在上一節中，我們提到了 React Diffing 演算法的第二個假設：**不同類型的元素會產生完全不同的樹**。

在 React 的世界裡，`type`（類型）就是一個元素的「身分證」。當 Reconciliation 流程進行到某個節點時，React 的第一件事就是比對新舊兩個 React Element 的 `type` 屬性。

還記得我們在 Topic 6 看到的 React Element 結構嗎？

```javascript
// JSX: <div className="active">Hello</div>
// 編譯後的物件：
{
  type: 'div',
  props: {
    className: 'active',
    children: 'Hello'
  }
}
```

這個 `type` 字串（如果是 DOM 元素）或函數參考（如果是元件）決定了 React 接下來要採取「外科手術式的精準修復」，還是「全面拆除後的重新建構」。

---

## 情況一：相同 DOM 元素類型（Same DOM Element Type）

當新舊兩個元素的 `type` 都是相同的字串（例如都是 `'div'` 或 `'span'`）時，React 會表現得非常節制。

### 屬性修補（Property Patching）

React 會保留現有的真實 DOM 節點，僅對比新舊 `props` 之間的差異，並只更新那些發生變化的屬性。

舉例來說，當你的程式碼從：

```javascript
<div className="before" title="stuff" />
```

變更為：

```javascript
<div className="after" title="stuff" />
```

React 比對後發現：

1. `type` 沒變（都是 `div`）。
2. `title` 沒變。
3. `className` 從 `"before"` 變成了 `"after"`。

於是，React 只會對真實 DOM 執行類似 `domNode.className = 'after'` 的操作。這種做法避開了建立新 DOM 節點、重新計算佈局（Layout）等昂貴成本，是效能最優的更新方式。

### 樣式的精細更新

對於 `style` 屬性，React 同樣非常聰明。它不會因為你改了一個顏色就重設整個 `style` 物件，而是會進行內部的 key-value 比對。

例如，從：

```javascript
<div style={{ color: 'red', fontWeight: 'bold' }} />
```

變更為：

```javascript
<div style={{ color: 'green', fontWeight: 'bold' }} />
```

React 會看到 `fontWeight` 沒變，因此只會執行 `domNode.style.color = 'green'`。這種「外科手術式」的更新是 React 能在複雜 UI 中保持流暢的關鍵。

---

## 情況二：相同元件類型（Same Component Element Type）

當 `type` 指向同一個函數元件（例如都是 `UserCard`）時，情況會稍微複雜一點。

### 保留狀態，傳遞 Props

在這種情況下，元件的「實例身分」是延續的。這意味著：

1. **State 會被保留**：該元件內部透過 `useState` 儲存的資料不會消失。
2. **生命週期持續**：元件不會經歷「卸載（Unmount）」與「重新掛載（Mount）」。

React 會做的事情是：

1. 將新的 `props` 傳入該元件函數。
2. 觸發該元件的重新渲染（Re-render）。
3. 取得元件回傳的新 React Element。
4. **遞迴向下**：對其子元素再次進行 Diffing 流程。

這解釋了為什麼當你更新父元件的 State 並透過 Props 傳給子元件時，子元件雖然會重新執行（Re-render），但它內部的 Input 狀態或捲軸位置卻能維持原樣。

---

## 情況三：元素類型不同（Different Element Type）

這是 Reconciliation 中最激進的一種情況。只要 `type` 不同，React 就會判定這是一棵完全不同的樹。

### 卸載與重新掛載

當 React 發現 `type` 改變了（例如從 `<div>` 變成 `<span>`，或是從 `<Header>` 變成 `<NavBar>`），它不會嘗試去修補任何東西，而是直接執行以下步驟：

1. **銷毀舊子樹**：將舊的 DOM 節點從頁面中移除。
2. **執行清除邏輯**：如果舊元件中有 `useEffect` 的 cleanup 函數，會在時機點被呼叫。
3. **丟棄所有狀態**：**這是最重要的細節——舊元件及其所有子元件內部的 State 都會永久遺失**。
4. **掛載新樹**：建立全新的 DOM 節點並插入頁面。

### 為什麼 React 要這麼「暴力」？

你可能會問：「如果我只是把外層的 `div` 改成 `section`，裡面的內容明明都一樣，為什麼要全部拆掉？」

這回到了我們說過的工程取捨。要比對兩棵完全不同類型的樹（例如一棵是導覽列，一棵是表格），並試圖找出它們之間細微的結構相似性，其運算成本極高（O(n³)）。React 選擇了一個簡單且在 99% 情況下都成立的規則：**如果你改變了包裝的類型，通常代表你想要完全不同的 UI。**

---

## 實際場景分析：消失的 Input 內容

讓我們來看一個在實戰中非常經典的 bug。假設你有一個表單元件，根據「編輯模式」切換不同的外層包裝：

```javascript
const UserForm = ({ isEditing }) => {
  const [name, setName] = useState("");

  if (isEditing) {
    return (
      <div className="form-wrapper">
        <label>使用者名稱：</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    );
  }

  return (
    <section className="form-wrapper">
      <label>使用者名稱：</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </section>
  );
};
```

### 發生了什麼事？

當 `isEditing` 從 `true` 變為 `false` 時：

1. React 比對根節點：舊的是 `div`，新的是 `section`。
2. **類型不匹配！** React 決定卸載整個 `div`。
3. 即使內部的 `<label>` 和 `<input>` 看起來一模一樣，但因為它們是 `div` 的子節點，它們也會跟著被銷毀。
4. 使用者在 `input` 裡打到一半的文字會立刻消失，因為該 DOM 節點已經被移除，重新建立的是一個全新的 `input`。

### 如何修復？

為了保持 UI 的穩定性，我們應該盡量維持 `type` 的一致。在這個例子中，更好的寫法是：

```javascript
const UserForm = ({ isEditing }) => {
  const [name, setName] = useState("");
  
  // 保持外層標籤一致，只改變屬性或類別
  const Wrapper = isEditing ? "div" : "section"; 

  return (
    <Wrapper className="form-wrapper">
      <label>使用者名稱：</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </Wrapper>
  );
};
```

*注意：在實際 React 開發中，更常見的是直接保持標籤不變，只切換 CSS class。*

### 另一個常見陷阱：在 Render 函數中定義元件

這是許多初學者會犯的效能與穩定性錯誤：

```javascript
const ParentComponent = () => {
  // 錯誤：不要在元件內部定義另一個元件！
  const ChildComponent = () => <div>我是子元件</div>;

  return (
    <div>
      <ChildComponent />
    </div>
  );
};
```

當 `ParentComponent` 每次重新渲染時，`ChildComponent` 都會被重新定義一次。這意味著新舊渲染之間，`ChildComponent` 的**函數參考（Reference）**是不同的。

對於 React 來說，這就是 `type` 改變了。結果就是每次父元件更新，子元件都會被徹底卸載並重新掛載，導致子元件內部的 State 永遠無法保留，且產生極大的效能浪費。

---

## 總結：開發者的自我檢查清單

理解了 Element Type 比較規則後，你在撰寫 JSX 時應該建立以下直覺：

1. **結構穩定性**：如果希望子元件的 State 在重新渲染中被保留，請確保它們在 VDOM 樹中的位置（Hierarchy）以及其父元件的 `type` 保持不變。
2. **條件渲染的代價**：當你使用三元運算子切換不同類型的標籤時，請意識到這會觸發整棵子樹的「重生」。
3. **屬性優先於類型**：如果你只是想改變外觀，優先考慮修改 `className` 或 `style`，而不是更換標籤類型。

### 掌握 Reconciliation 的下一步

到目前為止，我們討論的都是「同層、同位置」的比對。但如果我們有一個列表，裡面的項目順序發生了變動（例如把清單的最後一項移到最前面），React 要怎麼知道「這個 `div` 其實就是原本那個 `div`，只是換了位置」，而不是把舊的刪掉再建一個新的呢？

這就是我們下一堂課的主角：`**key**`** 屬性**。它將作為 `type` 之外的另一個穩定識別符，幫助 React 在處理動態列表時達到極致的效能。

## 關鍵觀念回顧

- **相同 DOM 類型**：保留節點，僅更新變動的 attributes 與 style（效能最優）。
- **相同元件類型**：保留實例（Instance），保留內部 State，傳入新 Props 並觸發 re-render。
- **不同類型**：直接「翻桌」。卸載舊樹及其子樹中的所有 State，掛載全新樹。
- **Render 陷阱**：嚴禁在渲染函數內部定義新元件，這會導致 `type` 參考在每次渲染時都不同，進而觸發不必要的完整重建。
