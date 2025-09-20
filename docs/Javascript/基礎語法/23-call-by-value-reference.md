---
title: call by value、call by reference、call by sharing
description: 深入理解 JavaScript 中的參數傳遞方式，包含值傳遞、參考傳遞、共享傳遞的概念與實際應用
keywords:
  [
    JavaScript,
    call by value,
    call by reference,
    call by sharing,
    值傳遞,
    參考傳遞,
    共享傳遞,
    參數傳遞,
    記憶體,
  ]
---

## 一、Call by Value（值傳遞）

#### 定義：

當你把\*\*原始型別（primitive types）\*\*傳進函式時，會把變數的「值本身」複製一份傳進去。\
函式內部的變數只是拷貝，不會影響外部變數。

#### 適用於哪些型別？

- `number`

- `string`

- `boolean`

- `undefined`

- `null`

- `symbol`

- `bigint`

#### 範例：

```javascript
function updateValue(x) {
  x = x + 10;
}
let a = 5;
updateValue(a);
console.log(a); // 輸出 5，不是 15
```

#### 說明：

- `x` 是 `a` 的一份拷貝，改變 `x` 不會影響 `a`

---

## 二、Call by Reference（參照傳遞）

#### 定義：

把變數本身（實體的記憶體位置）傳進函式內，因此**在函式內對變數的任何操作都會直接影響外部變數**。

#### 說明：

JavaScript 並**不是** call by reference 語言，這在 C++ 才會看到（用 `&`）。JavaScript 是**永遠不會**直接改變外部變數的參照本身。

#### JavaScript 裡沒有真正的 call by reference

這裡只是提一下做區分，JS 沒有這種特性。

---

## 三、Call by Sharing（共享呼叫）

#### 定義：

當你把**物件、陣列、函式**等「**參照型別（reference types）**」傳進函式時，傳的是「參照（記憶體位置）的拷貝」，也就是你傳了一份「指向同一個物件」的指標。

這代表：

- 你**可以改變物件的內容**

- 但你**不能讓參數變數指向另一個物件來影響原變數**

#### 適用型別：

- `object`

- `array`

- `function`

#### 範例：

```javascript
function update(obj) {
  obj.name = "Mary"; // 改變原物件內容（有效）
  obj = { name: "Tom" }; // 換一個新物件（無效）
}
const person = { name: "John" };
update(person);
console.log(person.name); // 輸出 "Mary"，不是 "Tom"
```

#### 說明：

- [`obj.name`](obj.name)` = "Mary"` 成功改變原始物件內容

- `obj = {...}` 只是函式內部改變了 `obj` 指向新物件，**不會影響外部的 `person`**

---

## 四、比較總結表

| 傳遞方式          | 可改內容 | 可改參照（指向） | JavaScript 支援情況          |
| ----------------- | -------- | ---------------- | ---------------------------- |
| Call by Value     | 否       | 否               | 支援（原始型別）             |
| Call by Reference | 是       | 是               | 不支援                       |
| Call by Sharing   | 是       | 否               | 支援（物件、陣列等參照型別） |

---

## 五、簡單記法整理：

- **Call by Value**：傳的是值，改變沒影響（適用於原始型別）

- **Call by Reference**：傳的是原始變數的指標，改什麼都會影響（JS 沒有）

- **Call by Sharing**：傳的是指標的拷貝，可以改內容，但不能換對象（JS 的物件是這樣）
