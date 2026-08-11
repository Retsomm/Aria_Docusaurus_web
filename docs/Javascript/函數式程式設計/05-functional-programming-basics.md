---
title: 學習FP的JavaScript基礎
description: 學習函數式程式設計的 JavaScript 基礎概念，包含純函數、高階函數、map、filter、reduce 等函數式程式設計技巧
keywords:
  [
    JavaScript,
    函數式程式設計,
    FP,
    純函數,
    高階函數,
    map,
    filter,
    reduce,
    函數式編程,
  ]
---

你有一個學生陣列，每位學生都有名字與成績，我們要完成以下幾個任務：

```javascript
const students = [
  { name: "小美", score: 85 },
  { name: "阿良", score: 42 },
  { name: "小凱", score: 77 },
  { name: "阿珍", score: 59 },
  { name: "小安", score: 91 },
];
```

### 任務一：用 `map` 產生「評語」陣列（陣列方法 + 純函數）

> 把每位學生都轉換成一句評語：`小美的成績是85分，表現不錯喔！`

```javascript
// 請寫出純函數 `getComment(student)`，回傳評語字串
// 然後用 map 建立新陣列 `comments`
const comments = students.map(function ({ name, score }) {
  return `${name}的成績是${score}分，表現不錯喔！`;
});
```

```bash
["小美的成績是85分，表現不錯喔！","阿良的成績是42分，表現不錯喔！","小凱的成績是77分，表現不錯喔！","阿珍的成績是59分，表現不錯喔！","小安的成績是91分，表現不錯喔！"]
```

### 任務二：用 `filter` 過濾不及格的學生

> 找出所有成績低於 60 分的學生（使用純函數）

```javascript
// 請寫出純函數 `isFailed(student)`，回傳 true / false
// 然後用 filter 建立新陣列 `failedStudents`
function isFailed(student) {
  return student.score < 60;
}
let failedStudents = students.filter(isFailed);
```

```bash
[// [object Object]
{
  "name": "阿良",
  "score": 42
},// [object Object]
{
  "name": "阿珍",
  "score": 59
}]
```

### 任務三：用 `reduce` 計算全班平均成績

```javascript
// 請用 reduce 算出總分，再除以學生數量，算出平均分數 averageScore
const averageScore = students.reduce((sum, student) => {
  return sum + student.score;
}, 0);
//354
```

### 任務四：製作一個高階函數 `makeScoreFilter(minScore)`

> 它會**回傳一個函數**，幫你篩選成績大於某數字的學生，例如：

```javascript
// const filterAbove70 = makeScoreFilter(70);
// const goodStudents = students.filter(filterAbove70);
function makeScoreFilter(minScore) {
  return students.filter((student) => student.score > minScore);
}
makeScoreFilter(85);
```

```bash
[// [object Object
{
  "name": "小安",
  "score": 91
}]
```

## 額外挑戰（選擇做）

製作一個純函數 `toGrade(score)`，可以將數字轉為等級

然後幫每位學生加上 `grade` 欄位，變成這樣：

```javascript
// { name: '小美', score: 85, grade: 'B' }

function toGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const studentsWithGrades = students.map((student) => {
  return {
    ...student,
    grade: toGrade(student.score),
  };
});
console.log(studentsWithGrades);
```

```javascript
[
  // [object Object]
  {
    name: "小美",
    score: 85,
    grade: "B",
  }, // [object Object]
  {
    name: "阿良",
    score: 42,
    grade: "F",
  }, // [object Object]
  {
    name: "小凱",
    score: 77,
    grade: "C",
  }, // [object Object]
  {
    name: "阿珍",
    score: 59,
    grade: "F",
  }, // [object Object]
  {
    name: "小安",
    score: 91,
    grade: "A",
  },
];
```
