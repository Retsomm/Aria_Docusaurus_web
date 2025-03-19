---
title: 部屬專案到Firebase Hosting
description: project deploy to firebase Hosting
keywords: [firebase,Hosting,deploy]
---

## **1\. 確認根目錄為專案目錄**



## **2\. 在部屬前先確認專案運作正常**

在bash輸入

```
firebase serve
```

## **3\. 部署至 firebase hosting**

在專案根目錄執行：

```
firebase init hosting 
```

## **4\. 設定完之後就可以開始部屬**


```
firebase deploy
```
:::danger

下次部屬只需執行 firebase hosting 需要注意以下三點：

1.當詢問：「What do you want to use as your public directory?」時，請指定正確的目錄（例如 . 或 public）  
2.當出現「Configure as a single-page app?」時，根據您的專案類型選擇（一般情況選「No」）  
3.最重要的是，當詢問「File xxx already exists. Overwrite?」時，對於以下重要檔案請選擇「No」：  index.html、404.html

能避免覆蓋資料導致404錯誤  
:::
