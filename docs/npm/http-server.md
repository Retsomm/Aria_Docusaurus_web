---
title: 使用 http-server 啟動一個靜態伺服器
description: http-server
keywords: [http-server,npm,no-frame]
---

一開始啟動專案是從vue開始接觸，再來是接觸到react。直到有機會實作不能用框架的專案，才學到這個方式
```bash title="vue"
npm i
npm init
npm install -g @vue/cli
npm run dev  
```
```bash title="react"
npm i
npm init
npx create-react-app
npm start
```

```bash title="http-server"
npm i
npm init
npm install http-server --save-dev //使用 http-server 啟動一個靜態伺服器
http-server ./ -p 8080  
```
