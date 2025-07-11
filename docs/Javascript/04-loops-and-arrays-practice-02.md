---
title: JS迴圈與陣列練習02
description: JavaScript 迴圈與陣列的進階練習題，包含數字平方計算、字串長度統計、陣列過濾等實作練習
keywords:
  [JavaScript, 迴圈, 陣列, for迴圈, 陣列方法, 練習題, 程式練習, 陣列操作]
---

```js title="script.js"
// 題目 1：平方所有數字
// 題目說明：請寫一個函式 squareNumbers(arr)，使用 for 迴圈計算陣列中 每個數字的平方，並回傳新陣列。
function squareNumbers(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i] * arr[i]); // 計算平方後存入陣列
  }
  return result;
}
squareNumbers([1, 2, 3, 4]); // ➞ [1, 4, 9, 16]
squareNumbers([5, 6, 7]); // ➞ [25, 36, 49]

// 題目 2：找出最短字串
// 題目說明：請寫一個函式 findShortestString(arr)，使用 for 迴圈找出 陣列中最短的字串，並回傳該字串。
function findShortestString(arr) {
  let shortest = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].length < shortest.length) {
      shortest = arr[i];
    }
  }
  return shortest;
}
findShortestString(["apple", "banana", "kiwi", "pear"]); // ➞ "kiwi"
findShortestString(["hello", "JS", "world"]); // ➞ "JS"
// 題目 3：計算陣列中所有數字的平均值
// 題目說明：請寫一個函式 average(arr)，使用 for 迴圈計算 陣列中所有數字的平均值，並回傳結果。
function average(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]; // 累加總和
  }
  return sum / arr.length; // 除以數字的個數
}
average([10, 20, 30]); // ➞ 20
average([5, 15, 25, 35]); // ➞ 20

// 題目 4：找出大於 n 的數字
// 題目說明：請寫一個函式 filterGreaterThan(arr, n)，使用 for 迴圈找出 陣列中所有大於 n 的數字，並回傳新陣列。
function filterGreaterThan(arr, n) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > n) {
      result.push(arr[i]); // 只加入大於 n 的數字
    }
  }
  return result;
}
filterGreaterThan([1, 5, 8, 10, 12], 6); // ➞ [8, 10, 12]
filterGreaterThan([2, 4, 6, 8], 5); // ➞ [6, 8]

// 題目：計算字串長度
// 請寫一個函式 countStringLength(arr)，使用 for 迴圈 計算陣列中 每個字串的長度，並回傳一個新的陣列，內容為對應的字串長度。
function countStringLength(arr) {
  let lengths = []; // 用來存放字串長度的新陣列
  for (let i = 0; i < arr.length; i++) {
    lengths.push(arr[i].length); // 計算長度並加入新陣列
  }
  return lengths; // 回傳字串長度的陣列
}
// 測試
console.log(countStringLength(["apple", "banana", "cherry"])); // 預期輸出: [5, 6, 6]
console.log(countStringLength(["hello", "world", "JS"])); // 預期輸出: [5, 5, 2]
```
