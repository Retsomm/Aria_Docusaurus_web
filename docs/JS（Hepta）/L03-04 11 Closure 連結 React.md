---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 3 堂：Closure 完整應用

# 11 Closure 連結 React

想像你在開發一個計時器組件。你點擊了「開始」按鈕，組件內部呼叫了一個 `setTimeout`，預計在 3 秒後印出目前的 `count` 分數。在這 3 秒內，你又瘋狂點擊了按鈕 5 次，讓螢幕上的數字從 0 變成了 5。

當 3 秒時間到，控制台（Console）印出的數字會是多少？是目前的 5，還是當初點擊時的 0？

如果你直覺認為應該是 5，那麼當結果跳出 0 的時候，你可能會覺得 React 在整你。但事實上，這不是 React 的魔法，而是 JavaScript **閉包（Closure）**最忠實的體現。這一章我們要揭開 React Hooks 的底層面紗，你會發現，所有的「奇怪行為」其實都是 JS 基礎運作的必然結果。

## useState 的底層直覺：誰幫你背著背包？

在前面的章節中，我們學到閉包就像是一個「環境背包」，函數會帶著它被定義時的那個環境到處走。

在 React 中，函數組件（Function Component）本質上就是一個普通的 JavaScript 函數。當組件渲染時，這個函數會被執行。這就產生了一個問題：**函數執行完後，其執行環境（EC）會從 Call Stack 被彈出並銷毀，那為什麼 **`**useState**`** 能夠「記得」上次的數值？**

雖然 React 底層是使用 Fiber 架構（一種複雜的鏈結串列結構）在內存中儲存狀態，但對我們開發者來說，最完美的理解方式是將其視為一個**由 React 託管的閉包環境**。

### 閉包與狀態槽位

當你呼叫 `const [count, setCount] = useState(0)` 時，可以想像成以下過程：

1. React 在該組件對應的內存空間裡撥出一個「槽位（Slot）」。
2. `useState` 回傳目前的數值，以及一個專屬的 `setCount` 函數。
3. **關鍵點：** 這個 `setCount` 函數其實是一個閉包，它「捕捉」了指向該特定槽位的參考。

當你呼叫 `setCount` 時，這個函數並不需要知道自己在 Call Stack 的哪裡，它只需要打開它的「環境背包」，找到那個指向 React 內部槽位的連線，並告訴 React：「嘿，把這個槽位的值改成新值，然後幫我重新執行一次這個組件函數。」

## 每次渲染都是一份「快照」

這是理解 React 最重要的一個心法：**函數組件的每一次渲染（Render），都是一次獨立的函數呼叫，擁有自己獨立的閉包環境。**

當 React 決定要重新渲染組件時，它會再次呼叫你的函數。這時會建立一個**全新的執行環境（Execution Context）**。

### 預測與揭曉：消失的加法

看看這段程式碼，預測一下點擊按鈕後會印出什麼：

```javascript
const Counter = () => {
  const [count, setCount] = useState(0);

  const handleAlertClick = () => {
    setCount(count + 1); // 試圖加 1
    console.log("目前的 count:", count); 
  };

  return <button onClick={handleAlertClick}>點我</button>;
};
```

**答案是：印出 0。**

為什麼？明明我已經 `setCount(count + 1)` 了啊！

這就是 **Lexical Scope（詞法作用域）** 的威力。在 `handleAlertClick` 被定義的那一刻（也就是 count 等於 0 的那次渲染中），它背包裡的 `count` 變數就永遠指向了那個值為 `0` 的記憶體空間。

當你呼叫 `setCount` 時，你是在告訴 React：「請準備好下一次渲染，把值設為 1」。但對於**目前這一次執行環境**來說，`count` 依然是 0。它是一個常量（Constant），在這一幀（Frame）的快照中，它永遠不會改變。

這解釋了為什麼我們說 React UI 是狀態的**快照**。每一張照片（渲染）都是靜止的，動態的感覺來自於多張照片快速切換。

## useEffect 與 Closure 的愛恨情仇

如果 `useState` 的閉包只是讓你感到困惑，那麼 `useEffect` 中的閉包可能會讓你抓狂。這就是惡名昭彰的 **Stale Closure（過時的閉包）**。

### 為什麼我的 Effect 拿不到最新值？

請看以下場景：

```javascript
const Timer = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(`定時器中的 count: ${count}`);
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []); // 注意：依賴陣列是空的

  return <h1>{count}</h1>;
};
```

如果你執行這段程式碼，你會發現螢幕上的數字從 0 變成 1 之後，就永遠停在 1 了。而控制台會瘋狂印出：`定時器中的 count: 0`。

**發生了什麼事？**

1. **第一次渲染**：`count` 是 0。
2. **Effect 執行**：`useEffect` 的回呼函數被建立。這個函數是一個閉包，它捕獲了第一幀的環境，那裡面的 `count` 是 0。
3. **定時器啟動**：`setInterval` 拿著這個閉包，每秒執行一次。
4. **一秒後**：閉包執行 `setCount(0 + 1)`，React 重新渲染。
5. **第二次渲染**：`count` 是 1。但是！因為你的 `useEffect` 依賴陣列是 `[]`，React 不會重新執行 Effect。
6. **二秒後**：定時器依然拿著**第一幀的閉包**。它背包裡的 `count` 還是 0。所以它再次執行 `setCount(0 + 1)`。

這就是 **Stale Closure**。這個閉包死死地守著它出生時的那份資料，拒絕與時俱進。在 React 中，如果你不誠實地填寫依賴陣列（Dependency Array），你就是在創造一個個活在過去的「殭屍閉包」。

## 解決方案：當 JS 原理遇到 React 設計

既然知道了問題出在閉包捕捉了「舊的值」，我們有兩種主要的 JS 策略來解決這個問題。

### 1. 函數式更新（Functional Update）

React 提供了一種方式，讓更新狀態時不需要依賴閉包中的變數：

```javascript
// 不要這樣做（依賴閉包中的 count）
setCount(count + 1);

// 要這樣做（不依賴閉包，由 React 注入最新值）
setCount(prevCount => prevCount + 1);
```

**JS 原理分析：**
當你傳遞一個函數給 `setCount` 時，你不是在給 React 一個「數值」，而是在給它一個「指令」。React 在執行這個指令時，會把內存槽位中**當下最新**的值當作參數傳進去。這樣一來，即使你的 `setCount` 函數被困在一個舊的閉包裡，它依然能透過參數獲取到最新的資訊。這就像是雖然你拿著舊的地圖，但你問的是路上的最新導航員。

### 2. useRef：穩定的物件參考

如果你需要獲取最新值，但又不想要觸發重新渲染，或者想繞過閉包陷阱，`useRef` 是你的好朋友。

```javascript
const countRef = useRef(0);

const handleAction = () => {
  countRef.current = countRef.current + 1;
  setTimeout(() => {
    // 即使在 3 秒後執行，這裡也能拿到最新的 current
    console.log(countRef.current);
  }, 3000);
};
```

**JS 原理分析：**
這裡涉及到了 JS 中 **Pass by Reference（傳址）** 的概念（我們將在下一章 Topic 3 詳細討論）。

- `count` 是原始型別（Primitive），閉包捕獲的是它的**值複本**。
- `countRef` 是一個**物件**。閉包捕獲的是這個物件的**記憶體位址**。

即使閉包是舊的，但只要它手上的「地址」沒變，它去那個地址看裡面的 `.current` 屬性時，永遠能看到被其他地方修改後的最新狀態。這就是為什麼 `useRef` 能夠逃脫 Stale Closure 的魔掌。

## 總結：閉包是 React 的靈魂

到目前為止，你應該能感受到：React Hooks 並不是什麼黑魔法，它們只是把 JavaScript 的閉包特性發揮到了極致。

- **useState**：利用閉包讓你能在函數執行完後依然操作遠端的狀態槽位。
- **Snapshot**：每一次渲染都是一次新的閉包建立，保留了當下的變數狀態。
- **Stale Closure**：如果你讓一個舊的閉包活得太久（例如定時器或漏寫依賴的 Effect），它就會顯示過時的資料。

理解了這些，你就不再是「憑感覺」寫 React，而是能精確預測每一行程式碼在 JS 引擎中的運作脈絡。

## 鞏固與回顧

我們已經完成了 **Topic 2: Closure 與記憶體** 的所有核心內容。從閉包的形成、應用、陷阱，到最後與 React 的深度連結。

在進入下一個大主題 **Topic 3: Prototype 與物件系統** 之前，我們需要確保你對閉包的理解已經深入骨髓，因為這將決定你未來排除 React Bug 的速度。

**你想進行本章的 Review（主動回想練習）來檢測掌握程度，還是直接跳過進入下一章？**
