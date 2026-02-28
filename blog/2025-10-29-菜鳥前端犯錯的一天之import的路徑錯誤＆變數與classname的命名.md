---
title: 菜鳥前端犯錯的一天之.gitignore錯誤
date: 2025-10-28T14:11:00.000+08:00
tags:
  - 前端
cover_image: https://miro.medium.com/v2/resize:fit:720/format:webp/0*clTCX3jUlu0ei4Ql.jpg
image_position: top
---
<!--truncate-->

圖片來源：[MiniASP 範例文章](https://blog.miniasp.com/post/2020/05/24/Setup-git-ignore-alias-to-download-gitignore-templates)

找圖片時意外發現的網站：[Toptal gitignore generator](https://www.toptal.com/developers/gitignore)

只要輸入IDE跟程式語言就會自動生成.gitignore檔案

正文開始

今天犯的錯

1. 發ＭＲ時沒有注意把

   **快取資料夾(.vite)**

   推上去，還有yarn.lock檔案，再來就是
2. 對git指令不熟悉，因為sourcetree又罷工了，所以我戰戰兢兢地使用vscode push commit，結果就導致錯誤一堆

一開始是直接在develpo上面更新檔案，但實際上應該不能在上面更新，應該先拉回遠端已經被合併的內容後，再開新分支，再開始更新，因為這個動作錯誤，讓我使用rebase指令，導致後面要push時被要求要多一隻commit說明為何要合併，因為遠端跟本地端的develop內容有差異什麼的，但是下指令找差異又說一樣，所以真的今天晚上要好好惡補git。

原本可以快速交付的任務卡了超久，一直被同事關心說進度，看得出他的無奈，看到一堆太長的文件被推上去時無奈口吻，我應該會內疚一陣子。

但是我會從錯誤中學習，這次遇到的這兩個檔案**.vite和**yarn.lock都是我第一次push，所以我會記住。

> 判斷一個 *`.開頭`* 的檔案是否需要 Git 追蹤，關鍵在於：
>
> **檔案類型範例動作理由專案共用設定***`.eslintrc.js`*, *`.babelrc`***追蹤 (Commit)**專案運行或團隊協作的**必要**條件**本地端暫存/敏感資訊***`.DS_Store`*, *`.env`*, *`node_modules/`***忽略 (.gitignore)**不影響他人、每個人的都不一樣，或包含**敏感資訊**

今天還被同事問到說為何不push .env檔案（裡面是放ＡＰＩ），之前練手時的習慣是直接把.env寫進.gitignore，因為通常裡面會放一些金鑰。但是這次我的行為犯了兩個錯誤：

1. 把API放在.env
2. 又沒把.env push上去

這樣會導致其他人要clone專案下來找不到API，而導致錯誤發生

我修正成新增src/api/index.ts，並將API放進去，再重新push，再刪掉.env。
