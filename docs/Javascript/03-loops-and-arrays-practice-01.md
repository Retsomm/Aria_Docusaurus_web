---
title: JS迴圈與陣列練習01
description: JavaScript 迴圈與陣列的基礎練習題，包含陣列數字總和、最大值查找、偶數篩選等實作練習
keywords: [JavaScript, 迴圈, 陣列, for迴圈, 陣列操作, 練習題, 程式練習]
---

```js title="script.js"
// 題目 1：陣列數字總和
// 題目說明：請寫一個函式 sumArray(arr)，使用 for 迴圈 計算陣列中所有數字的總和，並回傳結果。
function sumArray(arr) {
  let sum = 0; // 設定初始總和為 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]; // 將每個數字加到 sum
  }
  return sum; // 回傳總和
}
// 測試
console.log(sumArray([1, 2, 3, 4, 5])); // 預期輸出: 15
console.log(sumArray([10, -2, 8, 4])); // 預期輸出: 20

// 題目 2：找出最大值
// 題目說明：請寫一個函式 findMax(arr)，使用 for 迴圈 找出並回傳陣列中的最大值。
function findMax(arr) {
  let max = arr[0]; // 先假設第一個數字是最大值
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      // 如果找到更大的數，就更新 max
      max = arr[i];
    }
  }
  return max; // 回傳最大值
}
// 測試
console.log(findMax([3, 7, 2, 9, 5])); // 預期輸出: 9
console.log(findMax([-1, -5, -3])); // 預期輸出: -1

// 題目 3：過濾偶數
// 題目說明：請寫一個函式 filterEvenNumbers(arr)，使用 for 迴圈 過濾陣列中的偶數，並回傳新陣列。
function filterEvenNumbers(arr) {
  let result = []; // 建立一個新陣列，存放偶數
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] % 2 === 0) {
      // 如果是偶數
      result.push(arr[i]); // 加入新陣列
    }
  }
  return result; // 回傳過濾後的偶數陣列
}
// 測試
console.log(filterEvenNumbers([1, 2, 3, 4, 5, 6])); // 預期輸出: [2, 4, 6]
console.log(filterEvenNumbers([7, 9, 13, 8])); // 預期輸出: [8]

// 題目 4：字串反轉
// 題目說明：請寫一個函式 reverseString(str)，使用 for 迴圈 反轉 字串，並回傳反轉後的結果。
function reverseString(str) {
  let result = ""; // 存放反轉後的字串
  for (let i = str.length - 1; i >= 0; i--) {
    // 從最後一個字元開始往前遍歷
    result += str[i]; // 把字元加到 result
  }
  return result; // 回傳反轉後的字串
}
// 測試
console.log(reverseString("hello")); // 預期輸出: "olleh"
console.log(reverseString("JavaScript")); // 預期輸出: "tpircSavaJ"

// 題目 5：移除陣列中的重複值
// 題目說明：請寫一個函式 removeDuplicates(arr)，使用 for 迴圈 移除陣列中的重複值，並回傳不重複的陣列。
function removeDuplicates(arr) {
  let result = []; // 存放不重複的數字
  for (let i = 0; i < arr.length; i++) {
    if (!result.includes(arr[i])) {
      // 如果 result 裡沒有這個數字
      result.push(arr[i]); // 加進去
    }
  }
  return result; // 回傳不重複的陣列
}
// 測試
console.log(removeDuplicates([1, 2, 3, 3, 4, 4, 5])); // 預期輸出: [1, 2, 3, 4, 5]
console.log(removeDuplicates([7, 8, 8, 9, 10, 10, 10])); // 預期輸出: [7, 8, 9, 10]
```
