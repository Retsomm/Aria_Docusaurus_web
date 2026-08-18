---
mdx:
  format: md
---

> 課程：JavaScript 與 React 底層原理
> 第 12 堂：Reconciliation 收尾與複習

# 39 診斷 key 的 bug

想像一下，你正在開發一個動態待辦事項清單（Todo List）。使用者可以在清單頂部新增任務，每個任務旁邊都有一個輸入框讓使用者寫下備註。你興致沖沖地寫好了程式碼，隨手用陣列的 `index` 作為 `key`。

你測試時發現：你在第一個任務「買牛奶」的輸入框寫了「全脂的」。接著，你在清單頂部新增了一個新任務「洗衣服」。奇怪的事情發生了——「洗衣服」變成了第一個任務，但原本寫在「買牛奶」旁邊的「全脂的」這三個字，現在竟然出現在「洗衣服」的輸入框裡！而真正的「買牛奶」任務，輸入框卻變回了空白。

這種「狀態跟錯人」的現象，就是典型的 `key` 誤用 bug。我們已經學習過 React 如何批次更新 UI，現在我們要確保每一次更新的「對象（Identity）」都是正確的。

## 案例分析一：消失的狀態與錯位的輸入框

為什麼使用 `index` 作為 `key` 會導致輸入框狀態錯位？這要追溯回我們在 7.4 提到的：**key 是 React 識別 Fiber 節點身份的唯一憑據**。

當你使用 `index` 時，React 的 Diffing 邏輯會變得非常「天真」。

### 預測：當插入發生時，React 看到了什麼？

假設原本的清單是：

1. `index: 0`, 內容: "買牛奶", 內部 State: "全脂的"
2. `index: 1`, 內容: "交電費", 內部 State: ""

現在你在最前面插入 "洗衣服"，清單變成：

1. `index: 0`, 內容: "洗衣服"
2. `index: 1`, 內容: "買牛奶"
3. `index: 2`, 內容: "交電費"

**React 的視角：**

- 「喔，`key="0"` 的節點還在。雖然它的 Props 從『買牛奶』變成了『洗衣服』，但因為 `key` 沒變且 `type`（都是 `input`）沒變，我應該**複用**這個 Fiber 節點，只更新它的內容。」
- **結果：** 既然復用了舊的 Fiber 節點，該節點內部持有的 `useState` 狀態（"全脂的"）就會被保留下來，並顯示在新的「洗衣服」任務旁。

這就是為什麼開發者常說：**index 作為 key 是「反模式（Anti-pattern）」**，除非你的清單是靜態的。

### 實戰演示：Index vs. ID

讓我們透過一段程式碼直接觀察這個行為差異。你可以注意在 `index` 模式下，當你點擊「在頂部新增」時，輸入框內的文字是如何「固定」在原位的。

```javascript
import React, { useState } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 'a1', text: '學習 React' },
    { id: 'b2', text: '練習閉包' }
  ]);
  const [useIndexKey, setUseIndexKey] = useState(true);

  const addToTop = () => {
    const newTodo = {
      id: crypto.randomUUID(), // 產生唯一識別碼
      text: `新任務 ${todos.length + 1}`
    };
    setTodos([newTodo, ...todos]);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">診斷 Key 的行為</h2>
      
      <div className="mb-4">
        <label className="mr-4">
          <input 
            type="radio" 
            checked={useIndexKey} 
            onChange={() => setUseIndexKey(true)} 
          /> 使用 Index 作為 Key (危險)
        </label>
        <label>
          <input 
            type="radio" 
            checked={!useIndexKey} 
            onChange={() => setUseIndexKey(false)} 
          /> 使用 ID 作為 Key (安全)
        </label>
      </div>

      <button 
        onClick={addToTop}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        在頂部新增任務
      </button>

      <ul className="space-y-2">
        {todos.map((todo, index) => (
          <li 
            key={useIndexKey ? index : todo.id} 
            className="border p-2 flex items-center justify-between"
          >
            <span>{todo.text} (key: {useIndexKey ? index : 'ID'})</span>
            {/* 這裡的 input 是不受控組件，用來展示內部狀態保留問題 */}
            <input 
              type="text" 
              placeholder="在此輸入備註..." 
              className="border ml-4 p-1"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

**操作實驗：**

1. 切換到「使用 Index 作為 Key」。
2. 在第一個任務「學習 React」的輸入框打入「我很認真」。
3. 點擊「在頂部新增任務」。
4. **觀察：** 「我很認真」現在出現在「新任務 3」旁邊了！
5. 切換到「使用 ID 作為 Key」重複實驗。
6. **觀察：** 「我很認真」準確地跟著「學習 React」移動到了第二行。

## 案例分析二：看不見的效能隱患

除了 UI 上的 Bug，誤用 `index` 還會帶來顯著的效能問題。

在 React 的 Reconciliation（協調）過程中，如果 `key` 匹配成功，React 會嘗試對該元素進行「微修補（Patch）」。如果我們在一個擁有 1000 個項目的清單頂部刪除一個項目：

1. **使用 ID 作為 Key：** React 發現 `key="removed-id"` 的節點消失了，直接將其 Unmount。剩下的 999 個節點 `key` 都沒變，React 只需要將它們在 DOM 中移動位置，而不需要重新渲染（re-render）它們內部的組件。
2. **使用 Index 作為 Key：** 
  - 原本 index 1 的項目變成了 index 0。
- 原本 index 2 的項目變成了 index 1。
- ...以此類推。
- **React 的視角：** 「天啊！這 999 個項目的 `key` 全部都變了！我必須對這 999 個組件全部重新傳入新的 Props 並執行一次 re-render。」

在大型列表中，這會導致原本應為 O(1) 的刪除操作，變成了 O(n) 的重新渲染任務，造成明顯的畫面掉幀。

## 正確的 Key 策略：穩定性與唯一性

要徹底避開這些陷阱，我們在選擇 `key` 時必須遵守兩大金律：

### 1. 穩定性（Stability）

`key` 在元件的整個生命週期中不應該改變。

- **錯誤示範：** `key={Math.random()}`。這會導致每次渲染時 `key` 都不同，React 會認為這是一個全新的元件，進而頻繁地銷毀與重建 DOM，效能極差且無法保留任何輸入狀態。
- **正確做法：** `key` 應該來自資料本身。

### 2. 唯一性（Uniqueness）

`key` 必須在「同層級的兄弟節點」之間保持唯一。

- 你不需要保證全站唯一的 `key`，只要在同一個 `<ul>` 或 `<div>` 下的子元素不重複即可。

### 實務上的 ID 來源

- **資料庫 ID：** 這是最理想的選擇。例如 `user.id` 或 `post.uuid`。
- **本地產生的唯一碼：** 如果是前端新增的暫時資料，可以使用瀏覽器原生支援的 `crypto.randomUUID()`。
- **遞增計數器：** 在某些封裝好的組件內，可以使用一個持久化的 Ref（`useRef`）來紀錄計數器，確保每次新增時分配一個不重複的數字。

## index key 的「特赦」場景：何時可以用？

雖然我們一直強調 `index` 的危險性，但在滿足以下 **三個條件同時成立** 時，使用 `index` 是安全且合理的：

1. **清單是靜態的：** 該清單在組件渲染後，永遠不會被重新排序（Sort）或過濾（Filter）。
2. **清單不具備增刪功能：** 你不會在清單中間或頂部插入、刪除項目。
3. **項目沒有內部狀態：** 項目純粹只是顯示資料，沒有 `input`、沒有 `useState`、沒有選取狀態。

例如，一個網站底部的「關於我們」、「聯絡資訊」、「隱私政策」導覽連結，這種清單就很適合使用 `index`。

## 進階應用：刻意利用 key 來重置狀態

有時候，我們反而會利用「key 改變會觸發 Unmount」的特性來解決問題。這被稱為 **"Key-based Reset"** 技巧。

假設你有一個複雜的「使用者個人資料編輯表單」。當使用者點擊側邊欄的不同使用者時，你希望整個表單徹底清空，不要留下上一個使用者的殘留狀態。

與其手動去重置每一個 `useState`（這很容易漏掉），你可以直接這樣寫：

```javascript
// 當 userId 改變時，React 發現 key 變了，會直接銷毀舊的 Form 並渲染一個全新的
<UserProfileForm key={activeUserId} />
```

這種做法既乾淨又優雅，它利用了 Reconciliation 的本質：**不同類型的 key，代表不同的身份**。

---

## 知識銜接與回顧

我們已經深入探討了 React 如何透過 Virtual DOM 與 Diffing 演算法來實現高效的 UI 更新。從單向資料流的嚴謹，到 Reconciliation 的三個假設，再到 `key` 如何作為身份證來追蹤節點。

掌握了 `key` 的正確診斷與運用，代表你已經具備了處理 React 列表渲染最棘手 Bug 的能力。這也是 Topic 7：Reconciliation 與 Diffing 的最後一個核心環節。

接下來，我們將進入 **Topic 7 的總複習（Review）**。我們將整合從 Virtual DOM 資料結構到 Automatic Batching 的所有知識，確保你對 React 如何「決定更新什麼」有整體的直覺掌握，這將是通往下一章「Fiber 架構」的關鍵門票。
