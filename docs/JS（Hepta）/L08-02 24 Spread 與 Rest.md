---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 8 堂：ES6+ 語法基礎

# 24 Spread 與 Rest

在上一部分中，我們學會了如何精確地從物件或陣列中「提取」出需要的資料。但如果你現在手上有一堆零散的資料，想要把它們合併成一個新的物件；或者你想要在不破壞原始資料的前提下，修改其中的一小部分，該怎麼辦？

這時候，JavaScript 的三點運算子 `...` 就會成為你最強大的工具。有趣的是，同一個符號 `...` 在不同的位置，卻有著截然相反的語意：有時它負責「拆散」資料（Spread），有時它負責「收集」資料（Rest）。

你是否曾經在寫 React 時，因為直接修改了狀態中的一個屬性，結果畫面卻完全沒有更新？或者當你看到 `const { id, ...others } = props;` 這樣的寫法時，感到一絲困惑？這堂課我們將深入探討這個「神奇符號」的底層機制，並揭開它與 React 不可變狀態（Immutability）之間的深厚聯繫。

## 同一個符號，兩套劇本：位置決定一切

在深入細節之前，我們必須建立一個核心認知：`...` 究竟是「展開」還是「其餘」，完全取決於它出現在賦值運算（Assignment）的哪一側。

- **Spread（展開）**：出現在**賦值運算的右側**（Right-hand side）。它像是一台「拆箱機」，把包裹裡的東西一個個拿出來，放在新的容器裡。
- **Rest（其餘）**：出現在**賦值運算的左側**（Left-hand side）。它像是一個「收集箱」，把剩下的、沒人要的東西通通打包在一起。

這個簡單的區別，將引導我們理解所有複雜的應用場景。

---

## Spread 運算子：數據的爆破與重組

Spread 運算子主要用於陣列和物件，它能將一個可迭代對象（Iterable）轉化為零散的參數序列或屬性序列。

### 1. 陣列展開：告別笨拙的 concat 與 slice

在 ES6 之前，合併兩個陣列通常需要使用 `concat()`，或者用 `slice()` 來複製陣列。現在，Spread 讓這一切變得極其直觀：

```javascript
const fruits = ['蘋果', '香蕉'];
const vegetables = ['花椰菜', '胡蘿蔔'];

// 合併陣列，還可以順便插入新元素
const shoppingList = ['牛奶', ...fruits, '雞蛋', ...vegetables];
console.log(shoppingList); 
// ["牛奶", "蘋果", "香蕉", "雞蛋", "花椰菜", "胡蘿蔔"]
```

這不僅僅是語法糖。這種寫法建立了一個**全新**的陣列實例。這對於 React 來說至關重要，因為 React 是透過判斷「參考地址（Reference）」是否改變來決定是否重新渲染的。

### 2. 物件展開：屬性覆蓋的藝術

在處理物件時，Spread 運算子有一條關鍵規則：**後蓋前（Last one wins）**。如果展開的物件中有重複的鍵名，後面的屬性會覆蓋掉前面的。

```javascript
const baseConfig = { theme: 'light', fontSize: 14, padding: 10 };
const userConfig = { theme: 'dark', padding: 20 };

const finalConfig = { ...baseConfig, ...userConfig };
// { theme: 'dark', fontSize: 14, padding: 20 }
```

這個特性讓「設定預設值」變得非常簡單：先展開預設設定，再展開用戶自定義的設定，用戶沒設定的部分就會保留預設值。

### 3. 底層重點：淺複製（Shallow Copy）的陷阱

這是本節最重要的技術細節。無論是陣列還是物件，Spread 運算子執行的都是**淺複製**。

當你展開一個物件時，JavaScript 會在記憶體中建立一個新的容器，並將第一層的屬性「值」複製進去。如果屬性是純值（String, Number, Boolean），那沒問題；但如果屬性是另一個物件（參考型別），它複製的僅僅是那個物件在堆疊（Heap）中的**記憶體地址**。

**想像一下這個場景：**

```javascript
const original = { 
  name: 'Aria', 
  skills: ['React', 'JS'] // 這是個陣列（物件型別）
};

const copy = { ...original };
copy.name = 'Bob'; // 這是純值，不會影響 original
copy.skills.push('Node.js'); // 這是參考型別，改到同一個地址了！

console.log(original.skills); // ["React", "JS", "Node.js"] -> 慘劇發生了！
```

在 React 中，如果你直接 `push` 了狀態裡的嵌套陣列，即使你用 Spread 建立了新物件，嵌套的陣列地址依然沒變。這就是為什麼有時候我們會發現「明明更新了狀態，但子元件卻沒反應」或「修改 A 同時也改到了 B」的原因。

---

## Rest 運算子：優雅的收納專家

與 Spread 相反，Rest 負責把「零散的數據」打包成一個整齊的集合。

### 1. 函數參數：取代過時的 arguments

在過去，如果我們不知道函數會接收多少個參數，必須使用怪異的 `arguments` 物件。`arguments` 不是真正的陣列，它沒有 `.map()` 或 `.filter()`，這讓操作變得很痛苦。

Rest 參數完美解決了這個問題：

```javascript
// 使用 Rest 參數將所有參數收集成一個真正的陣列
const sum = (...numbers) => {
  return numbers.reduce((acc, curr) => acc + curr, 0);
};

console.log(sum(1, 2, 3, 4)); // 10
```

### 2. 解構中的「其餘」應用

這是在 React 開發中最常見的技巧。當你想從 `props` 中提取特定屬性，但又想保留剩下的屬性以便傳遞給底層元素時，Rest 就派上用場了：

```javascript
const user = { id: 1, name: 'Aria', age: 25, role: 'admin' };

// 提取 id，將剩下的屬性打包進 others
const { id, ...others } = user;

console.log(id);     // 1
console.log(others); // { name: 'Aria', age: 25, role: 'admin' }
```

---

## React 實戰場景：不可變性與 Props 轉發

學會了語法後，我們來看看這些機制如何在 React 的世界裡運作。

### 不可變狀態更新（Immutable State Update）

React 的核心哲學之一是「不要直接修改狀態（Mutation）」。當我們使用 `useState` 時，我們必須傳入一個全新的物件。

**錯誤示範（新手常犯）：**

```javascript
const [items, setItems] = useState(['Apple', 'Banana']);

const addItem = () => {
  items.push('Orange'); // ❌ 錯誤：直接修改了舊陣列
  setItems(items);      // ❌ React 看到 items 地址沒變，不更新畫面
};
```

**正確示範（利用 Spread）：**

```javascript
const addItem = () => {
  // 建立一個全新的陣列，放入舊元素和新元素
  setItems([...items, 'Orange']); // ✅ 成功：地址改變，觸發渲染
};

const updateUserName = (newName) => {
  // 對於物件，我們通常會複製所有屬性，並覆寫特定屬性
  setUser({ ...user, name: newName }); // ✅ 成功
};
```

### Props Forwarding：靈活的元件封裝

在設計「封裝元件」（如 UI Library 的 Button 或 Input）時，我們往往不知道使用者會加上哪些 HTML 屬性（如 `onFocus`, `autoFocus`, `title` 等）。我們不可能把幾百個 HTML 屬性都寫進 props 定義中。

這時候，我們可以結合 **Rest** 與 **Spread**：

```javascript
// 1. 使用 Rest 收集除了 label 以外的所有 props
const CustomButton = ({ label, color, ...domProps }) => {
  return (
    <button 
      style={{ backgroundColor: color }} 
      // 2. 使用 Spread 將所有剩餘屬性直接轉發給真實的 <button>
      {...domProps} 
    >
      {label}
    </button>
  );
};

// 使用時，任何屬性都會被 domProps 收集並轉發
<CustomButton 
  label="點我" 
  color="blue" 
  onClick={() => console.log('Clicked!')} // 被轉發
  id="main-btn"                          // 被轉發
/>
```

這種模式極大地提高了元件的靈活性與可維護性。

---

## 總結：數據流的守門員

總結來說，`...` 符號是現代 JavaScript 處理數據結構的「瑞士軍刀」：

- **Spread（展開）** 是實現 **Immutability（不可變性）** 的基礎工具。它讓我們能以聲明式的方法克隆並修改資料，確保 React 能精確偵測到狀態變化。
- **Rest（其餘）** 是簡化參數處理與 **Props 轉發** 的利器。它讓我們能寫出更整潔、擴充性更強的函數與元件。

記住那個關於「淺複製」的警告：**當你的物件超過兩層深度時，單層的 Spread 就不夠安全了。** 在未來的章節中，我們會探討如何更優雅地處理深層狀態更新。

## 銜接下一個主題：箭頭函數與語法精簡

學會了如何優雅地展開與收集資料後，你可能會發現，當這些操作與函數式編程結合時，程式碼會變得非常簡短。在下一部分「箭頭函數語法」中，我們將學習如何利用 ES6 的精簡語法，將這些解構、展開、其餘操作整合進現代 React 元件的定義中，並釐清箭頭函數在行為上（尤其是 `this` 的處理）與傳統函數的關鍵差異。
