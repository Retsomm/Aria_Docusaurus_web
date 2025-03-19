---
title: 部屬Docusaurus專案到Vercel
description: Docusaurus deploy to Vercel
keywords: [Docusaurus,react,Vercel]
---

# 部屬Docusaurus專案到Vercel
在 Docusaurus 專案中使用 **Vercel** 部署網頁的步驟如下：

## **1\. 初始化並建置 Docusaurus 專案**

如果你還沒有 Docusaurus 專案，可以先建立一個：

```
npx create-docusaurus@latest my-website classic 
cd my-website 
npm install 
```

然後執行：

```
npm run build 
```

這將在 `build/` 資料夾內產生靜態檔案。

---

## **2\. 安裝 Vercel CLI**

如果尚未安裝 Vercel CLI，請執行：

```
npm install -g vercel 
```

然後登入：

```
vercel login 
```

跟著指示，登入你的 Vercel 帳戶。

---

## **3\. 部署至 Vercel**

在專案根目錄執行：

```
vercel 
```

首次部署時，Vercel 會詢問：

- **Set up and deploy “\~\\Downloads\\Docusaurus_web-main0313\\Docusaurus_web-main0313\\build？** → 選擇 `y`

- **Which scope should contain your project？** → 選擇你的vercel專案

- **Link to existing project?** → n

- **In which directory is your code located?** → 如果你已經在build，填入**./** 

部屬成功後，Vercel 會上傳 `build/` 內容並給你一個網址。

```bash
🔗  Linked to arias-projects-260a7783/aria-web (created .vercel and added it to .gitignore)
🔍  Inspect: https://vercel.com/arias-projects-260a7783/aria-web/CU5HpZwqrtcu6fXpvWfnYhJLMK1X [3s]
🔍  Inspect: https://vercel.com/arias-projects-260a7783/aria-web/CU5HpZwqrtcu6fXpvWfnYhJLMK1X [3s]
✅  Production: https://aria-om1sk1t86-arias-projects-260a7783.vercel.app [3s]
✅  Production: https://aria-om1sk1t86-arias-projects-260a7783.vercel.app [3s]
📝  Deployed to production. Run `vercel --prod` to overwrite later (https://vercel.link/2F).
💡  To change the domain or build command, go to https://vercel.com/arias-projects-260a7783/aria-web/settings 
```

---

## **4\. 設定 `vercel.json`（可選）**

你可以在專案根目錄新增 `vercel.json`，確保 Vercel 部署的是 `build/` 目錄：

```null
{   "builds": [     {       "src": "build/**",       "use": "@vercel/static"     }   ],   "routes": [     { "src": "/(.*)", "dest": "/build/$1" }   ] } 
```

這樣，下次部署時只要執行：

```
vercel --prod 
```

你的 Docusaurus 網站就會上線！
---

:::danger[Please note]

這個內容是來自AI


:::