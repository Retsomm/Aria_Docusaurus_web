---
title: 在TypeScript專案中混用JavaScript
description: A short description of this page
keywords: ["TypeScript", "JavaScript"]
---

### 1\. 在專案中包含 JavaScript 原始檔並檢查型別：啟用 allowJs 與 checkJs 的編譯器選項

#### 說明

在 TypeScript 專案中，預設只會處理 .ts 和 .tsx 檔案。如果想讓專案支援 JavaScript 檔案（.js 或 .jsx），需要啟用 allowJs 選項。同時，若要讓 TypeScript 對這些 JavaScript 檔案進行型別檢查，則需要啟用 checkJs 選項。

#### 步驟

1. **修改 tsconfig.json 檔案**：

   - 開啟專案根目錄中的 tsconfig.json。

   - 在 compilerOptions 中加入 "allowJs": true 和 "checkJs": true。

2. **確認專案結構**：

   - 確保專案中包含 .js 檔案，TypeScript 編譯器會自動識別並處理這些檔案。

3. **執行編譯**：

   - 執行 tsc 指令，TypeScript 會編譯 .js 和 .ts 檔案，並對 .js 檔案進行型別檢查。

#### 範例 tsconfig.json

```tsx
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "allowJs": true, // 允許編譯 JavaScript 檔案
    "checkJs": true // 對 JavaScript 檔案進行型別檢查
  },
  "include": ["src/**/*"]
}
```

#### 範例 JavaScript 檔案

假設你有一個 src/utils.js：

```tsx
// src/utils.js
function add(a, b) {
  return a + b;
}
```

啟用 allowJs 後，TypeScript 會編譯 utils.js 到輸出目錄（例如 dist/utils.js）。啟用 checkJs 後，TypeScript 會檢查 add 函數的型別，若有問題（例如未定義型別），可能會報錯。

#### 注意事項

- 如果 checkJs 啟用，TypeScript 會對 .js 檔案中的潛在型別錯誤發出警告（例如未定義參數型別）。

- 若 .js 檔案中有複雜邏輯，建議搭配 JSDoc 或型別宣告檔來明確定義型別，否則 TypeScript 會推斷為 any。

---

### 2\. 控制編譯器是否要檢查特定原始檔：使用 @ts-check 與 @ts-nocheck 註解

#### 說明

即使啟用了 checkJs，你可能不希望 TypeScript 檢查所有 .js 檔案的型別。可以使用 // @ts-check 和 // @ts-nocheck 註解來控制特定檔案是否進行型別檢查。

- // @ts-check：啟用對該檔案的型別檢查。

- // @ts-nocheck：禁用對該檔案的型別檢查。

#### 步驟

1. **在 JavaScript 檔案中加入註解**：

   - 在檔案頂部加入 // @ts-check 或 // @ts-nocheck。

2. **執行編譯**：

   - 執行 tsc，TypeScript 會根據註解決定是否檢查該檔案。

#### 範例

假設有兩個 JavaScript 檔案：

**檔案 1：啟用型別檢查**

```tsx
// src/math.js
// @ts-check
function multiply(a, b) {
  return a * b;
}
// 若參數 a, b 的型別不明確，TypeScript 會推斷為 any，並可能要求你補充型別資訊
```

**檔案 2：禁用型別檢查**

```tsx
// src/legacy.js
// @ts-nocheck
function oldFunction(x) {
  return x + 1; // 不會進行型別檢查，即使邏輯可能有問題
}
```

#### 注意事項

- // @ts-check 適合用於逐步將舊有 JavaScript 程式碼遷移到 TypeScript 的場景。

- // @ts-nocheck 適用於暫時忽略型別檢查的舊程式碼或第三方程式碼。

---

### 3\. 描述 JavaScript 原始檔內的型別：使用 JSDoc 註解，或建立一個型別宣告檔

#### 說明

在 JavaScript 檔案中，TypeScript 無法直接知道變數或函數的型別。可以使用 **JSDoc 註解** 或 **型別宣告檔（.d.ts）** 來補充型別資訊。

##### 方法 1：使用 JSDoc 註解

JSDoc 是 JavaScript 的註解標準，TypeScript 支援 JSDoc 來定義型別。

#### 步驟（JSDoc）

1. 在 .js 檔案中，使用 JSDoc 註解標記變數、參數或回傳值的型別。

2. 啟用 tsconfig.json 中的 allowJs 和 checkJs。

3. 執行 tsc 編譯，TypeScript 會根據 JSDoc 進行型別檢查。

#### 範例（JSDoc）

```tsx
// src/utils.js
// @ts-check

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
```

- 上述程式碼明確指定 a 和 b 為 number 型別，回傳值也是 number。

- TypeScript 會根據 JSDoc 檢查型別，若呼叫 add("1", 2)，會報錯。

##### 方法 2：建立型別宣告檔

如果不希望在 .js 檔案中加入大量 JSDoc，可以為 JavaScript 檔案建立一個獨立的 .d.ts 宣告檔。

#### 步驟（型別宣告檔）

1. 為 JavaScript 檔案建立一個同名的 .d.ts 檔案（例如 utils.js 對應 utils.d.ts）。

2. 在 .d.ts 檔案中定義型別。

3. 確保 tsconfig.json 的 include 包含 .d.ts 檔案。

#### 範例（型別宣告檔）

假設有 src/utils.js：

```tsx
// src/utils.js
function add(a, b) {
  return a + b;
}
```

建立 src/utils.d.ts：

```tsx
// src/utils.d.ts
export function add(a: number, b: number): number;
```

#### 注意事項

- JSDoc 適合小型專案或快速添加型別資訊。

- 型別宣告檔適合大型專案或需要重複使用的型別定義。

- 若 .js 檔案與 .d.ts 檔案在同一目錄，TypeScript 會自動關聯。

---

### 4\. 描述第三方 JavaScript 套件：更新編譯器解析路徑並建立一個宣告檔

#### 說明

如果專案中使用第三方 JavaScript 套件（例如透過 npm 安裝的模組），TypeScript 無法直接知道其型別。需要建立一個型別宣告檔（.d.ts），並確保 TypeScript 能正確解析模組路徑。

#### 步驟

1. **建立型別宣告檔**：

   - 在專案中建立一個宣告檔，例如 declarations/third-party.d.ts。

   - 使用 declare module 語法描述第三方套件的型別。

2. **更新 tsconfig.json**：

   - 確保 include 包含宣告檔路徑。

   - 若需要，設定 compilerOptions.paths 或 baseUrl 來指定模組解析路徑。

3. **使用第三方套件**：

   - 在 .ts 或 .js 檔案中引入模組，TypeScript 會根據宣告檔進行型別檢查。

#### 範例

假設你使用一個名為 my-third-party-lib 的 JavaScript 套件。

**步驟 1：建立宣告檔**

```tsx
// declarations/my-third-party-lib.d.ts
declare module "my-third-party-lib" {
  export function doSomething(input: string): string;
}
```

**步驟 2：更新 tsconfig.json**

```tsx
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "my-third-party-lib": ["node_modules/my-third-party-lib/index.js"]
    }
  },
  "include": ["src/**/*", "declarations/**/*"]
}
```

**步驟 3：使用套件**

```tsx
// src/index.ts
import { doSomething } from "my-third-party-lib";

const result = doSomething("hello"); // TypeScript 知道回傳值是 string
console.log(result);
```

#### 注意事項

- 宣告檔必須與套件的模組名稱一致（例如 my-third-party-lib）。

- 若套件結構複雜，宣告檔可能需要詳細描述物件、方法等型別。

---

### 5\. 描述第三方套件而不自己建立宣告檔：使用包含宣告檔的套件，或安裝公開的型別宣告套件

#### 說明

若不想手動撰寫宣告檔，可以使用以下兩種方法：

1. **使用包含宣告檔的套件**：有些 JavaScript 套件內建 .d.ts 檔案，TypeScript 會自動識別。

2. **安裝公開的型別宣告套件**：許多熱門 JavaScript 套件有對應的型別定義，發佈在 **DefinitelyTyped** 儲存庫（以 @types/套件名稱 的形式提供）。

#### 方法 1：使用包含宣告檔的套件

某些套件在發佈時已包含 .d.ts 檔案，無需額外設定。

#### 步驟

1. 安裝套件：

   ```tsx
   npm install some-package
   ```

2. 檢查套件是否包含 .d.ts 檔案（通常在 node_modules/some-package 內）。

3. 直接在 TypeScript 檔案中使用，TypeScript 會自動載入型別。

#### 方法 2：安裝公開的型別宣告套件

對於熱門套件（如 lodash、axios），可以安裝來自 DefinitelyTyped 的型別定義。

#### 步驟

1. 安裝型別宣告套件：

   ```tsx
   npm install --save-dev @types/套件名稱
   ```

    範例：安裝 lodash 的型別定義：

   ```tsx
   npm install --save-dev @types/lodash
   ```

2. 在 tsconfig.json 中確認 typeRoots 包含 node_modules/@types（通常預設包含）。

3. 在程式碼中直接使用套件，TypeScript 會自動載入型別。

#### 範例

假設使用 lodash：

```tsx
npm install lodash
npm install --save-dev @types/lodash
```

在 TypeScript 檔案中：

```tsx
// src/index.ts
import _ from "lodash";

const result = _.capitalize("hello"); // TypeScript 知道回傳值是 string
console.log(result); // 輸出 "Hello"
```

#### 注意事項

- 檢查 node_modules/@types 是否包含對應套件的型別定義。

- 若套件沒有公開的 @types 套件，則需要自行建立宣告檔（回到方法 4）。

- DefinitelyTyped 的型別定義由社群維護，確保使用最新版本以避免過時問題。

---

### 總結

- **允許 JavaScript 檔案**：設定 `allowJs` 和 `checkJs`。

- **控制型別檢查**：使用 `// @ts-check` 或 `// @ts-nocheck`。

- **定義 JavaScript 型別**：使用 JSDoc 或 `.d.ts` 檔案。

- **處理第三方套件**：建立宣告檔或使用 `@types` 套件。

- **逐步遷移**：這些方法適合從 JavaScript 逐步轉換到 TypeScript 的專案。