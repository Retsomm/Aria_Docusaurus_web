---
title: JavaScript引擎運行流程解析
description: 深入了解 JavaScript 引擎的運作流程，包含解析、編譯、執行、最佳化等階段的詳細機制
keywords:
  [
    JavaScript,
    引擎,
    運行流程,
    解析,
    編譯,
    執行,
    最佳化,
    V8引擎,
    JavaScript Engine,
    程式執行,
  ]
---

### JavaScript 引擎的運作流程

1. **解析（Parsing）**

2. **編譯（Compilation）**

3. **執行（Execution）**

4. **優化（Optimization）**（可選階段，但現代引擎會做）

這些步驟是由 JavaScript 引擎（如 Chrome 的 V8、Firefox 的 SpiderMonkey、Safari 的 JavaScriptCore 等）負責完成。

---

1\. **解析（Parsing）➡ 產生 AST**

當你寫好 JS 程式碼並載入到瀏覽器或 Node.js 中後，第一步是「解析」：

- JavaScript 引擎會把原始碼（例如：`let a = 1 + 2`）**讀成文字**

- 然後進行語法分析，把這些文字變成「抽象語法樹（AST, Abstract Syntax Tree）」

- AST 是一種程式碼的結構化表示方式，讓電腦可以理解每個語句的邏輯關係

範例：

```
let a = 1 + 2;

```

會被解析成 AST，大致如下（簡化過）：

```
VariableDeclaration
  └─ Identifier: a
  └─ BinaryExpression: 1 + 2

```

---

2\. **編譯（Compilation）➡ 產生機器可執行的程式**

以前 JavaScript 是純直譯語言（interpreter），但現在像 V8 都是「**即時編譯（JIT, Just-In-Time compilation）**」。

流程如下：

- AST 會被轉換成「中間表示（Intermediate Representation, IR）」

- 然後把 IR 轉換成「機器碼（Machine Code）」或「位元碼（Byte Code）」

- 這些碼可以被 CPU 執行

V8 的元件簡單舉例：

| 元件名稱   | 功能說明                                          |
| ---------- | ------------------------------------------------- |
| `Ignition` | V8 的直譯器，產生 Byte Code                       |
| `TurboFan` | V8 的優化編譯器，把常用程式碼變成更有效率的機器碼 |

---

3\. **執行（Execution）➡ 跑出結果**

- 引擎執行 Byte Code 或機器碼，開始跑你的程式

- 同時，會建立「執行環境（Execution Context）」和「作用域鏈（Scope Chain）」

- 還會產生「記憶體空間（Heap 與 Call Stack）」去儲存資料與控制流程

這時候也會用到：

- **Event Loop**（處理非同步）

- **Call Stack**（函式呼叫）

- **Heap**（物件存在的位置）

- **Lexical Environment**（變數與作用域管理）

---

4\. **優化（Optimization）➡ 執行更快**

當某段程式碼被「重複執行」或「關鍵效能區塊」時，JIT 編譯器會：

- 將它標記為 **熱區（hot path）**

- 使用 TurboFan（或其他優化器）進行進階優化，例如：

  - 移除不必要的檢查（如型別檢查）

  - 內聯函式（把小函式展開塞進主要邏輯中）

  - 編譯成更有效率的機器碼

---

## 圖解整體流程

```
你的 JavaScript 程式碼
         ↓
【Parsing】
         ↓
產生 AST
         ↓
【Compilation（JIT）】
         ↓
轉成 Bytecode 或機器碼
         ↓
【Execution】
         ↓
執行、建立執行環境、作用域、處理事件迴圈
         ↓
【Optimization】
（針對熱區進行 TurboFan 優化）

```

---

延伸補充

| 名詞       | 說明                                     |
| ---------- | ---------------------------------------- |
| AST        | 程式碼的語法樹，用來表示語句與邏輯結構   |
| JIT        | Just-In-Time，即時編譯，執行中邊跑邊優化 |
| Ignition   | V8 的直譯器，把 AST 編譯成 Bytecode      |
| TurboFan   | V8 的優化器，把常用程式轉成高效機器碼    |
| Heap       | 儲存物件的記憶體空間                     |
| Call Stack | 儲存函式呼叫與執行順序                   |
| Event Loop | 處理非同步任務的機制                     |

---

JavaScript 引擎運作流程圖（文字版）

```
+---------------------+
| JavaScript 原始碼   |
+---------------------+
           |
           v
+---------------------+
| 解析器 (Parser)      |
| 解析原始碼 ➜ AST      |
+---------------------+
           |
           v
+---------------------+
| 建立 AST（抽象語法樹）|
+---------------------+
           |
           v
+---------------------+
| 編譯階段              |
| ➜ Ignition 直譯器     |
| ➜ 轉成 Bytecode       |
+---------------------+
           |
           v
+---------------------+
| 執行階段              |
| ➜ 執行 Bytecode       |
| ➜ 建立執行環境        |
| ➜ 管理 Call Stack     |
| ➜ 處理 Event Loop     |
+---------------------+
           |
           v
+---------------------+
| 熱區偵測              |
| ➜ TurboFan 編譯器     |
| ➜ 最佳化常用程式碼     |
+---------------------+
           |
           v
+---------------------+
| 執行優化後的機器碼    |
+---------------------+

```

---

每個區塊說明

| 區塊              | 功能說明                                         |
| ----------------- | ------------------------------------------------ |
| JavaScript 原始碼 | 你寫的程式碼                                     |
| 解析器            | 將程式碼轉換成 AST                               |
| AST               | 抽象語法樹，讓引擎能理解程式邏輯                 |
| Ignition          | 把 AST 轉換成可執行的 Bytecode                   |
| 執行階段          | 建立執行環境、作用域鏈、處理事件                 |
| TurboFan          | 偵測到熱區後，進一步將 Bytecode 轉成更快的機器碼 |
