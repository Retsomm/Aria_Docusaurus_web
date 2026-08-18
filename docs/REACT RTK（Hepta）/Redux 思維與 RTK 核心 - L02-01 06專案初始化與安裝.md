---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 2 堂：RTK 環境建置實作

# 06專案初始化與安裝

在上一章中，我們深入探討了 Redux 的核心世界觀——從三大原則到資料單向流動的哲學。你現在已經理解了「為什麼」要使用 Redux，以及它如何透過嚴格的規則換取狀態的可預測性。

但是，單有理論是不夠的。作為一名準備參加鐵人賽的開發者，你需要一個堅實且現代化的開發環境來承載這些想法。在這一部分，我們將親手建立一個基於 Vite 與 TypeScript 的 React 專案，並安裝 Redux Toolkit (RTK) 與 React-Redux。這不僅僅是輸入幾行指令，更重要的是理解我們所安裝的每一個工具在整個 Redux 生態系中扮演什麼角色。

## 為什麼選擇 Vite 而非 Create React App (CRA)？

在開始之前，我們先解決一個常見的疑問：為什麼我們不使用過往常用的 `npx create-react-app`？

對於進階 React 開發者來說，開發體驗（DX）與建置速度是首要考量。Vite（法文意指「快」）利用了瀏覽器原生的 ES Modules 支援，在開發環境下不需要像 Webpack 那樣預先打包整個專案，這讓 HMR（模組熱替換）幾乎是在瞬間完成。對於 Redux 開發來說，當你在調整 Reducer 邏輯或修改 Initial State 時，極速的反應能讓你維持專注力，不必在等待編譯的過程中分心。

### 步驟 1：建立專案

打開終端機，執行以下指令：

```bash
npm create vite@latest my-redux-app -- --template react-ts
```

這裡我們選擇了 `react-ts` 模板。為什麼一定要用 TypeScript？因為 Redux 與 TypeScript 是絕配。Redux 的核心在於對狀態的嚴格控制，而 TypeScript 則能在編譯時期就幫你抓出「存取了不存在的狀態」或「發送了錯誤格式的 Action」等邏輯錯誤。

### 步驟 2：目錄結構初探

建立完成後，進入目錄並觀察結構。你的 `src` 目錄應該會是這樣：

- `main.tsx`: 應用程式的入口。
- `App.tsx`: 根元件。
- `vite-env.d.ts`: Vite 的型別定義。

在後續的實作中，我們建議在 `src` 下建立一個 `app/` 目錄來存放 Store 的配置，以及一個 `features/` 目錄來存放各個功能模組（Slices）。這種目錄結構是 Redux 官方推薦的「Feature-based logic」，能讓你的鐵人賽文章範例顯得更加專業且具備擴充性。

## 套件安裝與角色區分：大腦與橋樑

現在，我們要安裝兩個核心套件。請執行：

```bash
npm install @reduxjs/toolkit react-redux
```

很多初學者會混淆這兩個套件，甚至以為它們是同一個東西。在撰寫技術文章時，清晰地界定工具職責是展現專業度的關鍵。

### 1. @reduxjs/toolkit (RTK)：Redux 的「大腦」

`@reduxjs/toolkit` 是 Redux 官方開發的工具包，旨在解決傳統 Redux 樣板程式碼（Boilerplate）過多的問題。

- **職責**：定義全域狀態（State）、處理狀態更新邏輯（Reducers）、發送意圖（Actions）、以及處理非同步行為。
- **重要性**：它是你應用程式邏輯的核心。它不依賴於 React，理論上你可以將 RTK 用在 Vue、Angular 甚至原生 JS 中。
- **內建工具**：它內建了 Immer.js（讓你用修改的方式寫出不可變的更新）、Redux-Thunk（處理非同步）、以及與 Redux DevTools 的自動整合。

### 2. react-redux：Redux 與 UI 的「橋樑」

Redux 本身是一個獨立的狀態管理庫，它並不知道 React 的存在。這就是 `react-redux` 派上用場的地方。

- **職責**：提供 Hooks（如 `useSelector`, `useDispatch`）和元件（如 `<Provider>`），讓 React 元件能夠訂閱 Redux Store 中的狀態，並發送 Actions 來更新狀態。
- **重要性**：它處理了效能優化的細節，確保只有當元件需要的資料發生變化時，元件才會重新渲染（Re-render）。

### 形象化的比喻

如果你正在開發一款賽車遊戲：

- **RTK (大腦)**：就像是**遊戲引擎**。它負責計算賽車的當前速度、油耗、碰撞邏輯。即使沒有螢幕，這些數據在後台依然在運作。
- **React-Redux (橋樑)**：就像是**遊戲手把與螢幕連接線**。手把將你的按壓指令（Action）傳給引擎，連接線則將引擎計算出的速度顯示在螢幕上（UI 更新）。

沒有 RTK，你的遊戲就沒有邏輯；沒有 React-Redux，玩家就無法與遊戲互動，也看不到結果。

## TypeScript 配置重點：為何 strict: true 如此重要？

在 `tsconfig.json` 中，你會看到 `"strict": true` 這個設定。對於 Redux 開發者來說，這不是一個選項，而是一個要求。

### 預防「型別黑洞」

Redux 的 Store 是一個大型的巢狀物件。如果沒有開啟嚴格模式，TypeScript 很容易在推導過深的屬性時放棄，將其標註為 `any`。一旦出現 `any`，Redux 的型別安全性就會瓦解。

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true, // 務必確保此項為 true
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

此外，你可能會考慮設定**路徑別名（Path Alias）**。在複雜的 Redux 專案中，你經常需要從各個元件引入 Store 或是 Slice。使用 `@/` 來代表 `src/` 目錄，可以避免出現 `../../../app/store` 這種難看的相對路徑，讓你的程式碼範例在鐵人賽文章中看起來更簡潔：

```typescript
// 優雅的引入方式
import { useAppDispatch } from '@/app/hooks';
```

## 驗證安裝結果

最後，確認你的 `package.json` 中的 `dependencies` 欄位。這是一個好習慣，在撰寫教學文時，貼出這個部分可以幫助讀者比對版本，減少因版本差異導致的錯誤。

```json
"dependencies": {
  "@reduxjs/toolkit": "^2.x.x",
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "react-redux": "^9.x.x"
}
```

(註：具體版本號會隨時間變動，但目前 RTK 2.0 與 React-Redux 9.0 是基於 TypeScript 開發的最新標準。)

### 💡 預測與思考

在安裝完這些工具後，你可能會想：既然 RTK 是大腦，而這個大腦需要管理整個應用程式的狀態，那麼我們該如何把這個「大腦」具現化出來？如果我們有多個不同的功能（例如購物車、使用者資訊），這個大腦要如何同時處理這麼多事情而不產生混亂？

這就是我們下一節要討論的主題：使用 `configureStore` 來建立你的第一個 Store。

## 建立開發環境的基石

在本小節中，我們完成了從零到一的環境建置。你選擇了 Vite 作為高效能的開發引擎，並理解了 `@reduxjs/toolkit` 作為邏輯核心與 `react-redux` 作為通訊橋樑的本質差異。同時，我們強調了 TypeScript 嚴格模式對於維護大型狀態樹的重要性。這套環境不僅是你實作的起點，更是你撰寫鐵人賽系列文章的實驗室。

有了這些工具後，我們已經準備好進入 Redux 的實體結構。下一部分我們將學習如何使用 `configureStore` 建立全域狀態的單一來源，並了解 RTK 如何自動為我們整合強大的開發者工具。
