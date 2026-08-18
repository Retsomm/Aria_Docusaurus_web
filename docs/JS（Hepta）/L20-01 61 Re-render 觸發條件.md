---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 20 堂：React 效能優化原理

# 61 Re-render 觸發條件

在 React 的開發旅程中，你一定遇過這樣的困惑：明明我只改了父元件的一個無關痛癢的狀態，為什麼下層幾十個子元件全部都在 React DevTools 的 Profiler 裡亮起了代表「重新渲染」的紅色或黃色外框？或者，為什麼我傳進去的 Props 明明內容長得一模一樣，元件卻執意要重新跑一遍函數邏輯？

很多開發者在遇到效能瓶頸時，第一反應是瘋狂地幫每個元件套上 `React.memo`，或是在每個函數外面包 `useCallback`。但這種「亂槍打鳥」式的優化往往適得其反，不但增加了程式碼的維護成本，有時甚至因為額外的比較邏輯而讓效能更差。

要真正解決效能問題，我們必須回歸原點：**React 到底在什麼時候會決定重新渲染（Re-render）？** 理解了這套觸發機制，你才能像外科醫生一樣，精準地判斷哪裡需要動手術，哪裡只需觀察即可。

## 核心哲學：UI = f(state)

在進入技術細節前，我們先校準一下思維。React 的核心設計哲學可以用一個簡潔的公式表達：**UI = f(state)**。

這意味著 UI 只是狀態的一個「投影」。<u>當 </u>`<u>state</u>`<u>（資料）改變時，函數 </u>`<u>f</u>`<u>（你的元件）就必須重新執行，以計算出新的 UI 投影</u>。因此，**重新渲染並不是一個錯誤，它是 React 確保 UI 與資料同步的正常機制。**

如果 React 不進行重新渲染，你的介面就會停留在舊的狀態。我們追求的目標從來不是「消滅重新渲染」，而是「避免不必要的計算與 DOM 操作」。

---

## 重新渲染的四大來源

在 React 的運作模型中，一個元件會進入 Render Phase（渲染階段）通常源於以下四種情況。我們由內而外，從元件自身到外部環境逐一拆解。

### 1. setState 呼叫：元件內部的發動機

這是最直觀的觸發方式。當你在元件內部呼叫 `useState` 回傳的更新函數（dispatch function）或是 `useReducer` 的 `dispatch` 時，React 就會將該元件標記為「需要更新」。

#### 預測一下：如果傳入相同的值會怎樣？

如果你執行了 `setCount(1)`，而目前的 `count` 已經是 `1` 了，React 會重新渲染嗎？

**揭曉答案：**
React 內部使用 `Object.is` 來比較新舊狀態。

- **原始型別（Primitive Types）：** 如果你傳入的是 `1 === 1` 或是 `'hello' === 'hello'`，React 偵測到值沒有變動，通常會直接 **Bailout（跳過）** 渲染過程。這就是為什麼我們強調狀態要儘量扁平化。
- **參考型別（Reference Types）：** 這是初學者最常踩的坑。
  ```javascript
const [user, setUser] = useState({ name: 'Aria', age: 25 });
  // 這樣會觸發 Re-render
setUser({ name: 'Aria', age: 25 }); 
```
  即使內容一模一樣，但因為 `{}` 每次都會產生一個全新的記憶體位址，`Object.is` 會判定為不同，進而觸發重新渲染。這就是我們在 Topic 6 提到的「不可變性原則（Immutability）」的負擔與代價。

**深度細節：Eager State 策略**
在某些情況下，即使值相同，你可能會發現元件的函數還是執行了「最後一次」。這是因為 React 有一個 `eagerState` 優化機制：它會先計算出新狀態，如果發現與舊狀態一致，它會嘗試跳過後續的調度；但如果此時元件已經在更新排程中，它可能會多跑一次函數以確保安全性，但絕對不會進入 Commit Phase 操作真實 DOM。

### 2. Props 改變：來自上層的政令

當父元件傳遞給子元件的屬性（Props）發生變化時，子元件自然需要重新渲染以反映最新的參數。

然而，這裡有一個極其重要的誤區：**「Props 改變」這件事，在本質上往往是「父元件重新渲染」的副產品。**

請看這個範例：

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>加 1</button>
      <Child name="Static Name" />
    </div>
  );
}

function Child({ name }) {
  console.log("Child 渲染了");
  return <div>{name}</div>;
}
```

當你點擊按鈕，`Parent` 重新渲染。請問 `Child` 會重新渲染嗎？
答案是：**會。** 即使 `name` 永遠是 `"Static Name"`，`Child` 依然會重新執行。

為什麼？因為在 React 的預設邏輯裡，子元件的 `props` 是否改變並不是由 React 自動幫你做深度比對的（那太耗效能了）。只要父元件執行的結果回傳了新的 `React Element`（即 `Child` 標籤被重新解析），React 就會預設子元件需要更新。除非你使用了 `React.memo`（我們下一部分的主題），否則 **「Props 沒變」並不能阻止預設的重新渲染。**

### 3. Context 更新：全頻道的廣播

Context 是 React 提供的一種「跨級傳遞」機制。當一個 `Context.Provider` 的 `value` 發生變化時，**所有** 使用了該 Context（透過 `useContext`）的子元件都會被強制重新渲染。

<u>這是一種「廣播」機制。最危險的地方在於：Context 的更新會繞過 </u>`<u>React.memo</u>`<u> 的攔截</u>。
假設你的元件結構如下：
`Provider (Value 改變) -> MiddleComponent (有 React.memo) -> ConsumerComponent (useContext)`

即使 `MiddleComponent` 因為 `memo` 而跳過了渲染，內層的 `ConsumerComponent` 依然會因為監聽了 Context 而被 React 強制喚醒。這就是為什麼我們在設計 Context 時，必須極度小心 `value` 物件的參考穩定性（通常需要配合 `useMemo`）。

### 4. 父元件重新渲染：連帶責任制

這是 React 效能優化中最核心、也最常被忽視的觀念：**只要父元件重新渲染，預設情況下，其下方的所有子元件都會無條件地跟著重新渲染。**

這與 Props 有沒有變、有沒有傳 Props 完全無關。只要 `Parent()` 函數重新執行了，它回傳的 JSX tree 就會被重新掃描一遍。

**為什麼 React 要這樣設計？**
你可能會覺得這很浪費。為什麼 React 不自動幫我們比對所有子元件的 Props，沒變就不動？
答案是：<u>**比對的成本（Diffing Cost）不一定比重新執行的成本低**</u>**。**

對於大多數輕量級的元件（只有幾行 HTML），直接執行 JS 函數並產生一個新的虛擬 DOM 物件是非常快的（微秒等級）。如果 React 要為每一個元件都記錄舊的 Props 並進行深度比對，這項「管理成本」在大型應用中反而會累積成巨大的負擔。因此，React 選擇了「預設全部更新，由開發者手動指定例外」的策略。

---

## 觀念導正：Re-render 不等於效能問題

在我們進入如何「阻止」重新渲染之前，你必須先建立一個健康的判斷框架：**Re-render 本身並不可怕。**

### 渲染預算（Rendering Budget）

回憶我們在 Topic 4 提到的 Event Loop 與螢幕刷新率。為了保持畫面流暢（60 FPS），我們每幀只有 **16.6ms** 的時間。

1. **JavaScript 執行（Render Phase）：** 計算虛擬 DOM 差異。
2. **DOM 操作（Commit Phase）：** 瀏覽器重繪。

如果一個元件重新渲染只需要 0.1ms，那麼即使它在一次操作中多跑了 10 次，總共也才花掉 1ms，遠低於 16.6ms 的預算。在這種情況下，去寫複雜的 `useMemo` 或 `React.memo` 其實是 **過度優化（Premature Optimization）**。

### 什麼時候才需要優化？

當你發現以下徵兆時，才是真正需要處理 Re-render 的時機：

- **互動掉幀：** 使用者輸入文字時感覺到明顯的延遲（Lag）。
- **複雜計算：** 元件內包含大量的資料處理、矩陣運算。
- **巨大的渲染樹：** 父元件一動，下方導致數千個 DOM 節點同時進行 Diffing。
- **側重於動畫：** 在進行高頻率動畫時，連帶觸發了不相關的重型組件渲染。

### 視覺化診斷：Profiler 顏色語意

當你打開 React DevTools 的 Profiler 進行錄製時：

- **灰色：** 沒有重新渲染（最理想）。
- **藍色/綠色：** 重新渲染了，但花費時間極短。
- **黃色/紅色：** 重新渲染花費了大量時間，這是你的優化目標。

---

## 實戰範例：拆解渲染路徑

讓我們用一個具體的場景來整合上述四個觸發源。

假設我們有一個電商網站的購物車頁面：

```javascript
const CartPage = () => {
  const [discountCode, setDiscountCode] = useState(""); // 1. 內部 State
  const theme = useContext(ThemeContext);               // 3. Context

  return (
    <div style={{ color: theme.mainColor }}>
      <input 
        value={discountCode} 
        onChange={(e) => setDiscountCode(e.target.value)} 
      />
      
      {/* 2. & 4. 父元件渲染導致子元件連帶渲染 */}
      <CartHeader title="您的購物清單" />
      
      <ItemList items={[]} />
    </div>
  );
};
```

**場景分析：**

1. 當使用者在 `input` 輸入折扣碼時，`CartPage` 的 `setDiscountCode` 被呼叫。
2. **觸發源 1：** `CartPage` 自身重新渲染。
3. **觸發源 4：** 儘管 `CartHeader` 的 `title` 是固定的，但因為它是 `CartPage` 的子元件，它會跟著重新渲染。
4. **觸發源 4：** `ItemList` 同理，也會重新渲染。
5. 如果 `ThemeContext` 此時改變了（例如切換深色模式），**觸發源 3** 會啟動，導致 `CartPage` 及其所有後代重新渲染。

在這個例子中，如果 `ItemList` 裡面有一千個商品，每次輸入一個字母都要重新渲染這一千個商品，這就是典型的效能瓶頸。而解決方案，就是我們接下來要討論的 **「防禦性渲染」**。

---

## 總結與銜接

理解重新渲染的四個來源，就像是掌握了 React 的地圖：

- **setState** 是元件的靈魂，決定了資料的流動。
- **Props** 是元件的合約，雖然它是外部傳入，但受控於父元件。
- **Context** 是元件的廣播電台，跨越層級。
- **父元件渲染** 是元件的宿命，除非我們手動干預。

我們已經知道，React 預設採取的是一種「寧可錯殺，不可放過」的更新策略，以確保 UI 的絕對正確。但在複雜的應用中，我們需要更精細的控制權。

### 下一站：React.memo

現在你已經知道 `CartHeader` 即使 Props 沒變也會因為父元件而被連累。如果我們想告訴 React：「嘿！只要我的 Props 內容沒變，請不要管我父元件在幹嘛，讓我安靜地待著。」這時候，我們就需要請出 `React.memo`。

在下一個部分，我們將深入探討 `React.memo` 的運作原理，以及為什麼它常常與「淺比較（Shallow Comparison）」和「參考型別」這兩個老對手糾纏不清。我們也會看到，為什麼有時候加上了 `memo` 反而會讓程式變得更難捉摸。
